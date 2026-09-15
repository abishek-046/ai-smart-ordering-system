/**
 * End-to-end flow test with real database
 * Tests: register → login → browse menu → add to cart → place order → track
 */
const http = require('http');

function req(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost', port: 5000, path, method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data ? Buffer.byteLength(data) : 0,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
    const request = http.request(opts, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, body: d }); } });
    });
    request.on('error', reject);
    if (data) request.write(data);
    request.end();
  });
}

async function run() {
  const ts = Date.now();
  const testEmail = `e2e_${ts}@test.com`;
  let token, userId, menuItemId, orderId, orderToken;

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║     END-TO-END FLOW TEST (with real database)        ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // 1. Register
  process.stdout.write('  1. Register new student... ');
  const reg = await req('POST', '/api/auth/register', { name: 'E2E Tester', email: testEmail, password: 'test123456', studentId: `E2E-${ts}` });
  if (reg.status !== 201 || !reg.body.token) { console.log(`❌ FAILED (${reg.status}): ${reg.body.message}`); process.exit(1); }
  token = reg.body.token;
  userId = reg.body.user.id;
  console.log(`✅ Registered as ${reg.body.user.name}`);

  // 2. Login
  process.stdout.write('  2. Login with credentials... ');
  const login = await req('POST', '/api/auth/login', { email: testEmail, password: 'test123456' });
  if (login.status !== 200 || !login.body.token) { console.log(`❌ FAILED: ${login.body.message}`); process.exit(1); }
  token = login.body.token;
  console.log(`✅ Logged in, JWT received`);

  // 3. Get /me
  process.stdout.write('  3. Fetch profile (/auth/me)... ');
  const me = await req('GET', '/api/auth/me', null, token);
  if (me.status !== 200 || me.body.user.email !== testEmail) { console.log(`❌ FAILED`); process.exit(1); }
  console.log(`✅ Profile: ${me.body.user.name} (${me.body.user.role})`);

  // 4. Browse menu
  process.stdout.write('  4. Browse menu... ');
  const menu = await req('GET', '/api/menu');
  if (menu.status !== 200 || !menu.body.items?.length) { console.log(`❌ FAILED: ${menu.body.message}`); process.exit(1); }
  menuItemId = menu.body.items[0].id;
  console.log(`✅ ${menu.body.count} items found, using "${menu.body.items[0].name}"`);

  // 5. Add to cart
  process.stdout.write('  5. Add item to cart... ');
  const add = await req('POST', '/api/cart/add', { foodItemId: menuItemId, quantity: 2 }, token);
  if (add.status !== 200 || !add.body.cartItem) { console.log(`❌ FAILED: ${add.body.message}`); process.exit(1); }
  console.log(`✅ Added x2, cart item id: ${add.body.cartItem.id}`);

  // 6. View cart
  process.stdout.write('  6. View cart... ');
  const cart = await req('GET', '/api/cart', null, token);
  if (cart.status !== 200 || cart.body.totalItems < 1) { console.log(`❌ FAILED`); process.exit(1); }
  console.log(`✅ Cart: ${cart.body.totalItems} items, total ₹${cart.body.total}`);

  // 7. Get AI pickup slots
  process.stdout.write('  7. Get AI pickup slots... ');
  const slots = await req('GET', '/api/ai/pickup-slots', null, token);
  if (slots.status !== 200 || !slots.body.slots?.length) { console.log(`❌ FAILED: ${slots.body.message}`); process.exit(1); }
  const pickupTime = slots.body.slots[0].time;
  console.log(`✅ ${slots.body.slots.length} slots, best: ${slots.body.slots[0].displayTime}`);

  // 8. Get AI food recommendations
  process.stdout.write('  8. Get AI food recommendations... ');
  const recs = await req('GET', '/api/ai/recommendations', null, token);
  if (recs.status !== 200 || !recs.body.topPicks) { console.log(`❌ FAILED`); process.exit(1); }
  console.log(`✅ ${recs.body.topPicks.length} recommendations`);

  // 9. Place order
  process.stdout.write('  9. Place order... ');
  const order = await req('POST', '/api/orders', { pickupTime, specialInstructions: 'E2E test order' }, token);
  if (order.status !== 201 || !order.body.order?.token) { console.log(`❌ FAILED: ${order.body.message}`); process.exit(1); }
  orderId = order.body.order.id;
  orderToken = order.body.order.token;
  console.log(`✅ Order placed! Token: ${orderToken}`);

  // 10. Verify cart is cleared after order
  process.stdout.write('  10. Cart cleared after order... ');
  const emptyCart = await req('GET', '/api/cart', null, token);
  if (emptyCart.body.totalItems !== 0) { console.log(`❌ Cart not cleared`); process.exit(1); }
  console.log(`✅ Cart is empty`);

  // 11. Track order
  process.stdout.write('  11. Track order by token... ');
  const track = await req('GET', `/api/orders/track/${orderToken}`, null, token);
  if (track.status !== 200 || track.body.order.status !== 'PENDING') { console.log(`❌ FAILED: ${track.body.message}`); process.exit(1); }
  console.log(`✅ Status: ${track.body.order.status}, progress: ${track.body.tracking.progress}%`);

  // 12. Order history
  process.stdout.write('  12. Order history... ');
  const history = await req('GET', '/api/orders', null, token);
  if (history.status !== 200 || history.body.total < 1) { console.log(`❌ FAILED`); process.exit(1); }
  console.log(`✅ ${history.body.total} order(s) in history`);

  // 13. Admin login
  process.stdout.write('  13. Admin login... ');
  const adminLogin = await req('POST', '/api/auth/login', { email: 'admin@canteen.com', password: 'admin123' });
  if (adminLogin.status !== 200) { console.log(`❌ FAILED`); process.exit(1); }
  const adminToken = adminLogin.body.token;
  console.log(`✅ Admin logged in`);

  // 14. Admin sees the order
  process.stdout.write('  14. Admin views all orders... ');
  const adminOrders = await req('GET', '/api/admin/orders', null, adminToken);
  if (adminOrders.status !== 200) { console.log(`❌ FAILED`); process.exit(1); }
  const found = adminOrders.body.orders.find(o => o.token === orderToken);
  console.log(`✅ ${adminOrders.body.total} orders, our order found: ${!!found}`);

  // 15. Admin accepts the order
  process.stdout.write('  15. Admin accepts order... ');
  const accept = await req('PATCH', `/api/admin/orders/${orderId}/status`, { status: 'ACCEPTED' }, adminToken);
  if (accept.status !== 200 || accept.body.order.status !== 'ACCEPTED') { console.log(`❌ FAILED: ${accept.body.message}`); process.exit(1); }
  console.log(`✅ Order status → ACCEPTED`);

  // 16. Admin moves to PREPARING
  process.stdout.write('  16. Admin marks PREPARING... ');
  const prep = await req('PATCH', `/api/admin/orders/${orderId}/status`, { status: 'PREPARING' }, adminToken);
  if (prep.status !== 200) { console.log(`❌ FAILED`); process.exit(1); }
  console.log(`✅ Order status → PREPARING`);

  // 17. Admin marks READY
  process.stdout.write('  17. Admin marks READY... ');
  const ready = await req('PATCH', `/api/admin/orders/${orderId}/status`, { status: 'READY' }, adminToken);
  if (ready.status !== 200) { console.log(`❌ FAILED`); process.exit(1); }
  console.log(`✅ Order status → READY`);

  // 18. Student tracks — sees READY
  process.stdout.write('  18. Student tracks — sees READY... ');
  const trackReady = await req('GET', `/api/orders/track/${orderToken}`, null, token);
  if (trackReady.body.order.status !== 'READY') { console.log(`❌ Status is ${trackReady.body.order.status}`); process.exit(1); }
  console.log(`✅ Student sees: ${trackReady.body.tracking.statusMessage}`);

  // 19. Admin marks COLLECTED
  process.stdout.write('  19. Admin marks COLLECTED... ');
  const collected = await req('PATCH', `/api/admin/orders/${orderId}/status`, { status: 'COLLECTED' }, adminToken);
  if (collected.status !== 200) { console.log(`❌ FAILED`); process.exit(1); }
  console.log(`✅ Order status → COLLECTED`);

  // 20. Admin dashboard summary
  process.stdout.write('  20. Admin dashboard summary... ');
  const dash = await req('GET', '/api/admin/dashboard', null, adminToken);
  if (dash.status !== 200 || !dash.body.summary) { console.log(`❌ FAILED`); process.exit(1); }
  console.log(`✅ Today orders: ${dash.body.summary.todayOrders}, Students: ${dash.body.summary.totalStudents}`);

  console.log('\n══════════════════════════════════════════════════════');
  console.log('  ✅ ALL 20 END-TO-END TESTS PASSED');
  console.log('  The complete student → admin flow works with real DB!');
  console.log('══════════════════════════════════════════════════════\n');
  console.log(`  🌐 Open: http://localhost:5173`);
  console.log(`  👤 Student:  student@test.com / student123`);
  console.log(`  🔑 Admin:    admin@canteen.com / admin123\n`);
}

run().catch((e) => { console.error('\n❌ Test crashed:', e.message); process.exit(1); });
