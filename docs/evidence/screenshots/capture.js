/**
 * Screenshot capture script — AI-Smart Ordering System
 * Run: node capture.js
 * Requires: npm install puppeteer (in this folder)
 * Backend must be running on :5000, frontend on :5173
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs   = require('fs');

const BASE   = 'http://localhost:5173';
const OUT    = __dirname;
const STUDENT = { email: 'student@test.com', password: 'student123' };
const ADMIN   = { email: 'admin@canteen.com',  password: 'admin123' };

const wait = ms => new Promise(r => setTimeout(r, ms));

async function snap(page, name, label) {
  await page.screenshot({ path: path.join(OUT, name), fullPage: false, type: 'png' });
  console.log(`  ✅ ${name}  — ${label}`);
}

async function loginAs(page, creds) {
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2', timeout: 20000 });
  await wait(600);
  await page.type('input[type="email"]',    creds.email,    { delay: 40 });
  await page.type('input[type="password"]', creds.password, { delay: 40 });
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await wait(1200);
}

(async () => {
  console.log('\n📸  AI-Smart Ordering System — Screenshot Capture\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
    defaultViewport: { width: 1280, height: 800 },
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(20000);

  try {
    // ── PUBLIC ──────────────────────────────────────────────────────
    await page.goto(BASE, { waitUntil: 'networkidle2' });
    await wait(1500);
    await snap(page, '01-landing.png', 'Landing page');

    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' });
    await wait(800);
    await snap(page, '02-login.png', 'Login page');

    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle2' });
    await wait(800);
    await snap(page, '03-register.png', 'Register page');

    // ── STUDENT FLOW ────────────────────────────────────────────────
    await loginAs(page, STUDENT);
    await snap(page, '04-student-dashboard.png', 'Student Dashboard');

    await page.goto(`${BASE}/menu`, { waitUntil: 'networkidle2' });
    await wait(1800);
    await snap(page, '05-menu.png', 'Menu — all categories');

    // Click Lunch filter
    const catBtns = await page.$$('button[aria-pressed]');
    for (const btn of catBtns) {
      const txt = await page.evaluate(el => el.textContent, btn);
      if (txt.includes('Lunch')) { await btn.click(); await wait(900); break; }
    }
    await snap(page, '06-menu-filtered.png', 'Menu — Lunch filtered');

    // Food details — click first food card link
    await page.goto(`${BASE}/menu`, { waitUntil: 'networkidle2' });
    await wait(1500);
    const foodLink = await page.$('a[href^="/menu/"]');
    if (foodLink) {
      const href = await page.evaluate(el => el.getAttribute('href'), foodLink);
      await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle2' });
      await wait(1000);
      await snap(page, '07-food-details.png', 'Food Details page');
    }

    // Add items to cart
    await page.goto(`${BASE}/menu`, { waitUntil: 'networkidle2' });
    await wait(1500);
    const addBtns = await page.$$('button');
    let added = 0;
    for (const btn of addBtns) {
      if (added >= 2) break;
      const txt = await page.evaluate(el => el.textContent?.trim(), btn);
      if (txt === 'Add to Cart') {
        await btn.click();
        await wait(1200);
        added++;
      }
    }

    await page.goto(`${BASE}/cart`, { waitUntil: 'networkidle2' });
    await wait(900);
    await snap(page, '08-cart.png', 'Cart with items');

    // AI Recommendations
    await page.goto(`${BASE}/recommendations`, { waitUntil: 'networkidle2' });
    await wait(2000);
    await snap(page, '09-ai-recommendations.png', 'AI Recommendations');

    // Smart Pickup Time
    await page.goto(`${BASE}/pickup-time`, { waitUntil: 'networkidle2' });
    await wait(2500);
    await snap(page, '10-pickup-time.png', 'Smart Pickup Time — AI slots');

    // Select first slot
    const slots = await page.$$('button[aria-pressed]');
    if (slots.length) { await slots[0].click(); await wait(500); }

    // Checkout
    await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle2' });
    await wait(900);
    await snap(page, '11-checkout.png', 'Checkout page');

    // Order History
    await page.goto(`${BASE}/orders`, { waitUntil: 'networkidle2' });
    await wait(900);
    await snap(page, '12-order-history.png', 'Order History');

    // Profile
    await page.goto(`${BASE}/profile`, { waitUntil: 'networkidle2' });
    await wait(700);
    await snap(page, '13-profile.png', 'Profile / Settings');

    // ── ADMIN FLOW ──────────────────────────────────────────────────
    await loginAs(page, ADMIN);
    await snap(page, '14-admin-dashboard.png', 'Admin Dashboard');

    await page.goto(`${BASE}/admin/orders`, { waitUntil: 'networkidle2' });
    await wait(1200);
    await snap(page, '15-admin-orders.png', 'Admin Orders');

    await page.goto(`${BASE}/admin/kitchen`, { waitUntil: 'networkidle2' });
    await wait(1200);
    await snap(page, '16-kitchen-queue.png', 'Kitchen Queue');

    await page.goto(`${BASE}/admin/menu`, { waitUntil: 'networkidle2' });
    await wait(1500);
    await snap(page, '17-menu-management.png', 'Menu Management');

    await page.goto(`${BASE}/admin/analytics`, { waitUntil: 'networkidle2' });
    await wait(1500);
    await snap(page, '18-analytics.png', 'Analytics Dashboard');

    await page.goto(`${BASE}/admin/predictions`, { waitUntil: 'networkidle2' });
    await wait(1500);
    await snap(page, '19-ai-predictions.png', 'AI Kitchen Predictions');

    // ── EDGE CASE ───────────────────────────────────────────────────
    await page.goto(`${BASE}/track/INVALID-TOKEN`, { waitUntil: 'networkidle2' });
    await wait(1200);
    await snap(page, '20-error-state.png', 'Error state — invalid token');

    console.log('\n  🎉  All screenshots saved to:', OUT);
    console.log(`  📁  Total: 20 screenshots\n`);

  } catch (err) {
    console.error('\n  ❌  Error:', err.message);
  } finally {
    await browser.close();
  }
})();
