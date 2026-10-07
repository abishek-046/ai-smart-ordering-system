/**
 * AI Service - Smart Ordering System
 *
 * Implements algorithmic pickup-time prediction and food recommendations
 * based on live database state. Modular: set AI_API_KEY + AI_API_URL in .env
 * to route through an external ML API instead.
 */

const prisma = require('../utils/prisma');

// ─── External API router ────────────────────────────────────────────────────
async function callExternalAI(endpoint, payload) {
  const { AI_API_KEY, AI_API_URL } = process.env;
  if (!AI_API_KEY || !AI_API_URL) return null;

  try {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch(`${AI_API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API_KEY}` },
      body: JSON.stringify(payload),
      timeout: 5000,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null; // Fallback to local engine on any error
  }
}

// ─── Pickup Time Prediction ──────────────────────────────────────────────────

/**
 * Generates recommended pickup time slots for a given cart.
 *
 * Algorithm:
 * 1. Calculate base prep time = max(item prepTimes) + sum(qty * 1.5 min overhead)
 * 2. Fetch active orders per 15-min slot in the next 2 hours
 * 3. Score each slot by: workload penalty + off-peak bonus
 * 4. Return top 5 slots sorted by score
 */
async function getPickupSlots(userId, cartItems) {
  // Try external AI first
  const external = await callExternalAI('/pickup-slots', { userId, cartItems });
  if (external) return external;

  const now = new Date();
  const foodItemIds = cartItems.map((ci) => ci.foodItemId);

  // Fetch food details for cart items
  const foodItems = await prisma.foodItem.findMany({
    where: { id: { in: foodItemIds } },
    select: { id: true, prepTimeMinutes: true, category: true },
  });

  // Base prep time: max prep time of items + overhead per item
  const maxPrepTime = Math.max(...foodItems.map((f) => f.prepTimeMinutes), 5);
  const totalQty = cartItems.reduce((s, ci) => s + ci.quantity, 0);
  const overheadMinutes = Math.ceil(totalQty * 1.5);
  const basePrepMinutes = maxPrepTime + overheadMinutes;

  // Earliest possible pickup = now + basePrepTime + 5 min buffer
  const earliestPickup = new Date(now.getTime() + (basePrepMinutes + 5) * 60000);
  // Round up to next 15-min slot
  const slotStart = roundUpToSlot(earliestPickup, 15);

  // Count active orders per slot in the next 3 hours
  const windowEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const activeOrders = await prisma.order.findMany({
    where: {
      status: { in: ['PENDING', 'ACCEPTED', 'PREPARING'] },
      pickupTime: { gte: now, lte: windowEnd },
    },
    select: { pickupTime: true },
  });

  // Bucket orders into 15-min slots
  const slotLoad = {};
  for (const order of activeOrders) {
    const key = getSlotKey(order.pickupTime);
    slotLoad[key] = (slotLoad[key] || 0) + 1;
  }

  // Canteen peak hours (higher load = less ideal for a new order's pickup)
  // These hours see the highest walk-in traffic and concurrent order volume.
  const peakHours = [8, 9, 12, 13, 14]; // 8-9am, 12-2pm

  // Score each candidate slot.
  // Lower load + off-peak + closer pickup = higher score.
  // Score is clamped 0–100 before returning (clamp applied in caller).
  const slots = [];
  for (let i = 0; i < 12; i++) {
    const slotTime = new Date(slotStart.getTime() + i * 15 * 60000);
    const slotKey = getSlotKey(slotTime);
    const hour = slotTime.getHours();
    const load = slotLoad[slotKey] || 0;

    // Score: lower is better
    const loadPenalty = load * 8; // 8 points per concurrent order
    const peakPenalty = peakHours.includes(hour) ? 15 : 0;
    const waitMinutes = Math.round((slotTime - now) / 60000);
    const waitBonus = Math.max(0, 30 - waitMinutes); // reward earlier slots (up to 30 min)

    const score = 100 - loadPenalty - peakPenalty + waitBonus;

    slots.push({
      time: slotTime.toISOString(),
      displayTime: formatTime(slotTime),
      waitMinutes,
      estimatedPrepMinutes: basePrepMinutes,
      currentLoad: load,
      score: Math.max(0, score),
      label: getSlotLabel(score, load),
      recommended: false,
    });
  }

  // Mark top 3 as recommended
  const sorted = [...slots].sort((a, b) => b.score - a.score);
  const topKeys = sorted.slice(0, 3).map((s) => s.time);
  slots.forEach((s) => { s.recommended = topKeys.includes(s.time); });

  return {
    slots,
    basePrepMinutes,
    totalItems: totalQty,
    analysis: {
      currentActiveOrders: activeOrders.length,
      estimatedWaitRange: `${basePrepMinutes}–${basePrepMinutes + 10} minutes`,
    },
  };
}

// ─── Food Recommendations ────────────────────────────────────────────────────

/**
 * Recommends food items for a user.
 *
 * Algorithm:
 * 1. Build user preference profile from order history (category frequency, price range)
 * 2. Score each available menu item by:
 *    - Category match bonus
 *    - Historical reorder bonus
 *    - Price range fit bonus
 *    - Rating weight
 *    - Availability (unavailable items get 0)
 * 3. Return top items per category + overall top picks
 */
async function getFoodRecommendations(userId) {
  const external = await callExternalAI('/recommendations', { userId });
  if (external) return external;

  // Build user preference profile from completed order history.
  // We use COLLECTED + READY (not PENDING/CANCELLED) so the profile
  // reflects food the user actually received and presumably enjoyed.
  const orders = await prisma.order.findMany({
    where: { userId, status: { in: ['COLLECTED', 'READY'] } },
    include: { items: { include: { foodItem: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const categoryCount = {};
  const itemOrderCount = {};
  const prices = [];

  for (const order of orders) {
    for (const oi of order.items) {
      const cat = oi.foodItem.category;
      categoryCount[cat] = (categoryCount[cat] || 0) + oi.quantity;
      itemOrderCount[oi.foodItemId] = (itemOrderCount[oi.foodItemId] || 0) + 1;
      prices.push(oi.unitPrice);
    }
  }

  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 60;
  const topCategories = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat);

  // Fetch all available items
  const allItems = await prisma.foodItem.findMany({
    where: { isAvailable: true },
    orderBy: { rating: 'desc' },
  });

  // Score each item
  const scored = allItems.map((item) => {
    let score = item.rating * 10; // base: 0–50

    // Category preference bonus
    const catRank = topCategories.indexOf(item.category);
    if (catRank === 0) score += 30;
    else if (catRank === 1) score += 20;
    else if (catRank === 2) score += 10;

    // Reorder bonus
    if (itemOrderCount[item.id]) score += Math.min(itemOrderCount[item.id] * 10, 30);

    // Price proximity bonus (within 30% of avg spend)
    const priceDiff = Math.abs(item.price - avgPrice) / avgPrice;
    if (priceDiff < 0.3) score += 15;
    else if (priceDiff < 0.5) score += 8;

    // Popular items bonus
    if (item.totalRatings > 150) score += 10;
    if (item.totalRatings > 250) score += 5;

    return { ...item, aiScore: Math.min(100, Math.max(0, Math.round(score))) };
  });

  const sortedByScore = [...scored].sort((a, b) => b.aiScore - a.aiScore);

  // Build result
  const topPicks = sortedByScore.slice(0, 6);
  const popularItems = [...allItems]
    .sort((a, b) => b.totalRatings - a.totalRatings || b.rating - a.rating)
    .slice(0, 6);

  // Category-based recommendations
  const byCategory = {};
  for (const item of scored) {
    if (!byCategory[item.category]) byCategory[item.category] = [];
    byCategory[item.category].push(item);
  }
  const categoryRecs = {};
  for (const [cat, items] of Object.entries(byCategory)) {
    categoryRecs[cat] = items.sort((a, b) => b.aiScore - a.aiScore).slice(0, 3);
  }

  return {
    topPicks,
    popularItems,
    categoryRecommendations: categoryRecs,
    userProfile: {
      favoriteCategories: topCategories,
      avgSpend: parseFloat(avgPrice.toFixed(2)),
      totalOrders: orders.length,
      hasHistory: orders.length > 0,
    },
  };
}

// ─── Kitchen Load Prediction ─────────────────────────────────────────────────

async function getKitchenLoadPrediction() {
  const now = new Date();
  const next3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  const upcomingOrders = await prisma.order.findMany({
    where: {
      status: { in: ['PENDING', 'ACCEPTED', 'PREPARING'] },
      pickupTime: { gte: now, lte: next3Hours },
    },
    include: { items: { include: { foodItem: { select: { id: true, prepTimeMinutes: true } } } } },
    orderBy: { pickupTime: 'asc' },
    take: 200, // cap to prevent unbounded memory usage
  });

  // Group by 30-min slots
  const slots = {};
  for (const order of upcomingOrders) {
    const slotTime = roundDownToSlot(order.pickupTime, 30);
    const key = slotTime.toISOString();
    if (!slots[key]) {
      slots[key] = { time: slotTime, displayTime: formatTime(slotTime), orderCount: 0, totalItems: 0, estimatedLoad: 0 };
    }
    slots[key].orderCount++;
    slots[key].totalItems += order.items.reduce((s, i) => s + i.quantity, 0);
  }

  const predictions = Object.values(slots).map((s) => ({
    ...s,
    estimatedLoad: Math.min(100, Math.round((s.orderCount / 10) * 100)), // 10 orders = 100% load
    loadLabel: s.orderCount < 3 ? 'Low' : s.orderCount < 7 ? 'Moderate' : 'High',
  }));

  return {
    predictions,
    currentActiveOrders: upcomingOrders.length,
    currentLoad: Math.min(100, Math.round((upcomingOrders.length / 15) * 100)),
  };
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function roundUpToSlot(date, minutes) {
  const ms = minutes * 60 * 1000;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
}

function roundDownToSlot(date, minutes) {
  const ms = minutes * 60 * 1000;
  return new Date(Math.floor(date.getTime() / ms) * ms);
}

function getSlotKey(date) {
  const d = new Date(date);
  d.setSeconds(0, 0);
  d.setMinutes(Math.floor(d.getMinutes() / 15) * 15);
  return d.toISOString();
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getSlotLabel(score, load) {
  if (load === 0) return 'Available';
  if (score >= 85) return 'Best Pick';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Busy';
  return 'Very Busy';
}

module.exports = { getPickupSlots, getFoodRecommendations, getKitchenLoadPrediction };
