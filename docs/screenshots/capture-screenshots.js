/**
 * Screenshot capture script for AI-Smart Ordering System
 * 
 * Requirements: npm install puppeteer
 * Run: node capture-screenshots.js
 * 
 * This script captures all 21 key screens of the application
 * using Puppeteer (headless Chrome).
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.join(__dirname);

// Demo credentials
const STUDENT = { email: 'student@test.com', password: 'student123' };
const ADMIN   = { email: 'admin@canteen.com', password: 'admin123' };

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function shot(page, name, description) {
  const file = path.join(OUTPUT_DIR, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`✅ ${name} — ${description}`);
}

async function main() {
  console.log('📸 Starting screenshot capture...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 },
  });

  const page = await browser.newPage();

  try {
    // ── PUBLIC PAGES ─────────────────────────────────────────
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await sleep(1500);
    await shot(page, '01-landing.png', 'Landing page hero');

    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' });
    await sleep(1000);
    await shot(page, '02-register.png', 'Register page');

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await sleep(1000);
    await shot(page, '03-login.png', 'Login page');

    // ── STUDENT LOGIN ────────────────────────────────────────
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', STUDENT.email);
    await page.type('input[type="password"]', STUDENT.password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await sleep(1500);
    await shot(page, '04-student-dashboard.png', 'Student Dashboard');

    // Menu
    await page.goto(`${BASE_URL}/menu`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    await shot(page, '05-menu-all.png', 'Menu — all categories');

    // Filter to Lunch
    await page.click('button[aria-pressed="false"]:nth-of-type(3)');
    await sleep(800);
    await shot(page, '06-menu-filtered.png', 'Menu — Lunch filtered');

    // Food details
    const foodLinks = await page.$$('a[href^="/menu/"]');
    if (foodLinks.length > 0) {
      const href = await page.evaluate(el => el.getAttribute('href'), foodLinks[0]);
      await page.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle2' });
      await sleep(1000);
      await shot(page, '07-food-details.png', 'Food Details page');
    }

    // Add to cart and go to cart
    await page.goto(`${BASE_URL}/menu`, { waitUntil: 'networkidle2' });
    await sleep(1000);
    const addBtns = await page.$$('button');
    for (const btn of addBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Add to Cart')) { await btn.click(); await sleep(1500); break; }
    }
    await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle2' });
    await sleep(1000);
    await shot(page, '08-cart.png', 'Cart page with items');

    // Pickup time
    await page.goto(`${BASE_URL}/pickup-time`, { waitUntil: 'networkidle2' });
    await sleep(2000);
    await shot(page, '09-pickup-time.png', 'Smart Pickup Time — AI slots');

    // Select first slot and go to checkout
    const slotBtns = await page.$$('button[aria-pressed]');
    if (slotBtns.length > 0) { await slotBtns[0].click(); await sleep(500); }
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle2' });
    await sleep(1000);
    await shot(page, '10-checkout.png', 'Checkout page');

    // AI Recommendations
    await page.goto(`${BASE_URL}/recommendations`, { waitUntil: 'networkidle2' });
    await sleep(2000);
    await shot(page, '14-ai-recommendations.png', 'AI Recommendations');

    // Order History
    await page.goto(`${BASE_URL}/orders`, { waitUntil: 'networkidle2' });
    await sleep(1000);
    await shot(page, '13-order-history.png', 'Order History');

    // Profile
    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle2' });
    await sleep(800);
    await shot(page, '15-profile.png', 'Profile / Settings');

    // ── ADMIN FLOW ───────────────────────────────────────────
    // Logout first (clear storage)
    await page.evaluate(() => { localStorage.clear(); });
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await sleep(500);
    await page.type('input[type="email"]', ADMIN.email);
    await page.type('input[type="password"]', ADMIN.password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await sleep(2000);
    await shot(page, '16-admin-dashboard.png', 'Admin Dashboard');

    await page.goto(`${BASE_URL}/admin/orders`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    await shot(page, '17-admin-orders.png', 'Admin Orders');

    await page.goto(`${BASE_URL}/admin/kitchen`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    await shot(page, '18-kitchen-queue.png', 'Kitchen Queue');

    await page.goto(`${BASE_URL}/admin/menu`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    await shot(page, '19-menu-management.png', 'Menu Management');

    await page.goto(`${BASE_URL}/admin/analytics`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    await shot(page, '20-analytics.png', 'Analytics Dashboard');

    await page.goto(`${BASE_URL}/admin/predictions`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    await shot(page, '21-ai-predictions.png', 'AI Kitchen Predictions');

    console.log('\n🎉 All screenshots captured successfully!');
    console.log(`📁 Saved to: ${OUTPUT_DIR}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await browser.close();
  }
}

main();
