require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@canteen.com' },
    update: {},
    create: { name: 'Canteen Admin', email: 'admin@canteen.com', password: adminPassword, role: 'ADMIN' },
  });
  console.log('✅ Admin:', admin.email);

  const studentPassword = await bcrypt.hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: { name: 'Abishek Kumar', email: 'student@test.com', password: studentPassword, role: 'STUDENT', studentId: 'STU-2024-001', phone: '9876543210' },
  });
  console.log('✅ Student:', student.email);

  const menuItems = [
    // ── BREAKFAST ─────────────────────────────────────────────────────────────
    {
      name: 'Ghee Masala Dosa',
      description: 'Extra-crispy fermented rice crepe loaded with spiced potato masala, smothered in pure cow ghee. Served with coconut chutney, tomato chutney & steaming sambar.',
      price: 55, category: 'BREAKFAST', prepTimeMinutes: 8, rating: 4.8, totalRatings: 342,
      tags: ['vegetarian', 'bestseller', 'south-indian', 'gluten-free'],
    },
    {
      name: 'Onion Rava Dosa',
      description: 'Thin lacy crepe made from semolina & rice flour, scattered with crispy onions & green chillies. Served with peanut chutney & tomato sambar.',
      price: 50, category: 'BREAKFAST', prepTimeMinutes: 7, rating: 4.6, totalRatings: 215,
      tags: ['vegetarian', 'crispy', 'south-indian'],
    },
    {
      name: 'Idli Sambar (4 pcs)',
      description: 'Soft, pillowy steamed rice cakes made from aged fermented batter. Served with toor dal sambar packed with drumstick & tomato, plus coconut chutney.',
      price: 35, category: 'BREAKFAST', prepTimeMinutes: 5, rating: 4.5, totalRatings: 289,
      tags: ['vegetarian', 'healthy', 'light', 'south-indian'],
    },
    {
      name: 'Pongal with Sambar',
      description: 'Creamy rice & moong dal cooked with black pepper, cumin & cashews in ghee. A classic Tamil breakfast. Served with tiffin sambar & chutney.',
      price: 40, category: 'BREAKFAST', prepTimeMinutes: 6, rating: 4.4, totalRatings: 178,
      tags: ['vegetarian', 'comfort-food', 'south-indian', 'wholesome'],
    },
    {
      name: 'Masala Egg Omelette & Toast',
      description: 'Fluffy two-egg omelette with onions, tomatoes, green chillies, coriander & chat masala. Served with two slices of buttered toast.',
      price: 45, category: 'BREAKFAST', prepTimeMinutes: 6, rating: 4.3, totalRatings: 156,
      tags: ['non-vegetarian', 'protein-rich', 'quick'],
    },
    {
      name: 'Upma & Coconut Chutney',
      description: 'Coarsely ground semolina tempered with mustard seeds, curry leaves, ginger & mixed vegetables. Topped with fresh coconut gratings.',
      price: 30, category: 'BREAKFAST', prepTimeMinutes: 5, rating: 4.1, totalRatings: 134,
      tags: ['vegetarian', 'light', 'quick'],
    },
    {
      name: 'Medu Vada (2 pcs)',
      description: 'Golden crispy lentil doughnuts with a soft interior. Made from urad dal with cumin & pepper. Served with sambar for dipping & coconut chutney.',
      price: 30, category: 'BREAKFAST', prepTimeMinutes: 6, rating: 4.4, totalRatings: 198,
      tags: ['vegetarian', 'crispy', 'south-indian', 'popular'],
    },

    // ── LUNCH ─────────────────────────────────────────────────────────────────
    {
      name: 'Chicken Biryani',
      description: 'Slow-cooked dum biryani — aged Basmati rice layered with tender chicken marinated in 12 whole spices & hung curd. Served with raita & salan.',
      price: 130, category: 'LUNCH', prepTimeMinutes: 15, rating: 4.9, totalRatings: 512,
      tags: ['non-vegetarian', 'bestseller', 'rice', 'dum-cooked'],
    },
    {
      name: 'Veg Thali (Full)',
      description: 'Complete South Indian meal: steamed rice, rasam, sambar, two seasonal sabzis, dal, roti, curd, pickle, papad & a seasonal dessert. Unlimited refills on rice.',
      price: 90, category: 'LUNCH', prepTimeMinutes: 8, rating: 4.7, totalRatings: 387,
      tags: ['vegetarian', 'bestseller', 'complete-meal', 'unlimited-rice'],
    },
    {
      name: 'Egg Biryani',
      description: 'Fragrant Basmati rice cooked with whole boiled eggs, fried onions, mint & biryani masala. Served with boiled egg raita & onion-tomato salad.',
      price: 90, category: 'LUNCH', prepTimeMinutes: 12, rating: 4.5, totalRatings: 267,
      tags: ['non-vegetarian', 'rice', 'popular'],
    },
    {
      name: 'Paneer Butter Masala + 3 Rotis',
      description: 'Cottage cheese cubes simmered in a velvety tomato-cashew gravy with kasuri methi & fresh cream. Served with three butter-smeared rotis.',
      price: 95, category: 'LUNCH', prepTimeMinutes: 10, rating: 4.6, totalRatings: 298,
      tags: ['vegetarian', 'popular', 'north-indian', 'rich'],
    },
    {
      name: 'Dal Tadka + Rice',
      description: 'Smoky yellow lentils tempered with ghee, cumin, dried red chillies, garlic & tomatoes. Served with steamed rice, roti, pickle & papad.',
      price: 60, category: 'LUNCH', prepTimeMinutes: 8, rating: 4.3, totalRatings: 223,
      tags: ['vegetarian', 'budget-friendly', 'protein-rich', 'homestyle'],
    },
    {
      name: 'Chicken Curry + 3 Rotis',
      description: 'Bone-in chicken slow-cooked in a rich onion-tomato gravy with freshly ground spices. Best enjoyed with our freshly made tandoor rotis.',
      price: 110, category: 'LUNCH', prepTimeMinutes: 12, rating: 4.6, totalRatings: 334,
      tags: ['non-vegetarian', 'popular', 'spicy'],
    },
    {
      name: 'Chole Bhature (2 pcs)',
      description: 'Spiced white chickpeas cooked with tea-soaked onion gravy. Served with two giant deep-fried leavened bread puffs, raw onion & pickle.',
      price: 70, category: 'LUNCH', prepTimeMinutes: 8, rating: 4.5, totalRatings: 267,
      tags: ['vegetarian', 'north-indian', 'filling', 'popular'],
    },
    {
      name: 'Mutton Kheema Rice',
      description: 'Minced mutton cooked with whole spices, fresh mint & green peas. Mixed with ghee rice and garnished with fried onions & boiled egg.',
      price: 140, category: 'LUNCH', prepTimeMinutes: 15, rating: 4.7, totalRatings: 189,
      tags: ['non-vegetarian', 'premium', 'spicy', 'filling'],
    },

    // ── SNACKS ─────────────────────────────────────────────────────────────────
    {
      name: 'Samosa Chaat (2 pcs)',
      description: 'Flaky pastry samosas crushed on a plate, topped with tangy tamarind chutney, mint chutney, sev, chopped onions, tomatoes & chaat masala.',
      price: 35, category: 'SNACKS', prepTimeMinutes: 4, rating: 4.7, totalRatings: 445,
      tags: ['vegetarian', 'bestseller', 'street-food', 'tangy'],
    },
    {
      name: 'Pav Bhaji',
      description: 'Mumbai-style spiced mixed vegetable mash cooked on a tawa with extra butter. Served with two toasted butter pav & a squeeze of lime.',
      price: 55, category: 'SNACKS', prepTimeMinutes: 7, rating: 4.6, totalRatings: 312,
      tags: ['vegetarian', 'street-food', 'popular', 'filling'],
    },
    {
      name: 'Cheesy Maggi Noodles',
      description: 'Classic instant noodles tossed with mixed vegetables, extra masala & topped with melted processed cheese. A canteen favourite for 3 PM cravings.',
      price: 40, category: 'SNACKS', prepTimeMinutes: 5, rating: 4.5, totalRatings: 523,
      tags: ['vegetarian', 'bestseller', 'comfort-food', 'quick'],
    },
    {
      name: 'Crispy Masala Fries',
      description: 'Thick-cut potato fries tossed in our secret spice blend of chilli, chaat masala & amchur. Served with sriracha mayo & tomato ketchup.',
      price: 50, category: 'SNACKS', prepTimeMinutes: 6, rating: 4.4, totalRatings: 378,
      tags: ['vegetarian', 'popular', 'crispy'],
    },
    {
      name: 'Bread Pakoda (3 pcs)',
      description: 'Bread slices stuffed with spiced mashed potato & paneer filling, dipped in thick besan batter and fried golden. Served with green chutney.',
      price: 30, category: 'SNACKS', prepTimeMinutes: 5, rating: 4.2, totalRatings: 234,
      tags: ['vegetarian', 'fried', 'filling'],
    },
    {
      name: 'Egg Puff',
      description: 'Buttery puff pastry shell filled with a masala-spiced boiled egg and caramelised onions. Baked fresh every hour. Best had warm.',
      price: 25, category: 'SNACKS', prepTimeMinutes: 3, rating: 4.3, totalRatings: 289,
      tags: ['non-vegetarian', 'baked', 'quick', 'popular'],
    },

    // ── BEVERAGES ──────────────────────────────────────────────────────────────
    {
      name: 'Kadak Masala Chai',
      description: 'Strong CTC tea brewed with fresh ginger, cardamom, cinnamon & tulsi leaves in full-fat milk. The ultimate concentration booster.',
      price: 15, category: 'BEVERAGES', prepTimeMinutes: 3, rating: 4.8, totalRatings: 867,
      tags: ['vegetarian', 'hot', 'bestseller', 'energising'],
    },
    {
      name: 'Cold Coffee Shake',
      description: 'Chilled blended coffee with full-fat milk, vanilla ice cream & sugar. Topped with chocolate syrup swirl. Thick, creamy & indulgent.',
      price: 55, category: 'BEVERAGES', prepTimeMinutes: 3, rating: 4.6, totalRatings: 445,
      tags: ['vegetarian', 'cold', 'popular', 'indulgent'],
    },
    {
      name: 'Fresh Mango Lassi',
      description: 'Hand-churned yogurt blended with Alphonso mango pulp, a pinch of cardamom & chilled. Thick enough to stand a spoon in.',
      price: 50, category: 'BEVERAGES', prepTimeMinutes: 3, rating: 4.7, totalRatings: 334,
      tags: ['vegetarian', 'cold', 'seasonal', 'refreshing'],
    },
    {
      name: 'Fresh Lime Soda',
      description: 'Freshly squeezed lime juice with chilled soda water. Choose sweet, salted or masala. Perfect for a hot afternoon.',
      price: 25, category: 'BEVERAGES', prepTimeMinutes: 2, rating: 4.5, totalRatings: 312,
      tags: ['vegetarian', 'cold', 'refreshing', 'quick'],
    },
    {
      name: 'Filter Coffee',
      description: 'South Indian filter coffee brewed from freshly ground Coorg beans. Served in traditional steel tumbler & davara with perfect froth.',
      price: 20, category: 'BEVERAGES', prepTimeMinutes: 3, rating: 4.7, totalRatings: 523,
      tags: ['vegetarian', 'hot', 'south-indian', 'classic'],
    },

    // ── DESSERTS ───────────────────────────────────────────────────────────────
    {
      name: 'Gulab Jamun (3 pcs)',
      description: 'Soft khoya milk-solid dumplings fried to a deep mahogany, soaked overnight in rose & cardamom sugar syrup. Served warm.',
      price: 35, category: 'DESSERTS', prepTimeMinutes: 2, rating: 4.8, totalRatings: 456,
      tags: ['vegetarian', 'sweet', 'bestseller', 'classic'],
    },
    {
      name: 'Kesari Paal Payasam',
      description: 'Creamy rice pudding cooked in whole milk with saffron, cardamom, cashews & golden raisins. A traditional South Indian festive dessert.',
      price: 45, category: 'DESSERTS', prepTimeMinutes: 3, rating: 4.6, totalRatings: 267,
      tags: ['vegetarian', 'traditional', 'south-indian', 'festive'],
    },
    {
      name: 'Chocolate Brownie',
      description: 'Dense, fudgy dark chocolate brownie baked with walnuts. Served warm with a scoop of vanilla ice cream & chocolate drizzle.',
      price: 60, category: 'DESSERTS', prepTimeMinutes: 2, rating: 4.7, totalRatings: 312,
      tags: ['vegetarian', 'chocolate', 'popular', 'indulgent'],
    },

    // ── SPECIAL ────────────────────────────────────────────────────────────────
    {
      name: "Chef's Special Veg Burger",
      description: 'Housemade crispy spiced beetroot-chickpea patty on a brioche bun with sriracha slaw, pickled jalapeños, aged cheddar & truffle mayo.',
      price: 80, category: 'SPECIAL', prepTimeMinutes: 10, rating: 4.5, totalRatings: 223,
      tags: ['vegetarian', 'gourmet', 'special'],
    },
    {
      name: 'Grilled Chicken Sandwich',
      description: 'Herb-marinated chicken breast grilled to perfection, layered with crunchy lettuce, tomato, caramelised onions & chipotle mayo on sourdough.',
      price: 90, category: 'SPECIAL', prepTimeMinutes: 10, rating: 4.6, totalRatings: 198,
      tags: ['non-vegetarian', 'gourmet', 'protein-rich', 'special'],
    },
    {
      name: "Today's Special Thali",
      description: 'The canteen manager\'s daily curated meal — changes every day based on fresh market produce. Ask the counter for today\'s combination.',
      price: 85, category: 'SPECIAL', prepTimeMinutes: 8, rating: 4.8, totalRatings: 156,
      tags: ['vegetarian', 'daily-special', 'chef-choice', 'surprise'],
    },
  ];

  // Clear cart items and order items first (FK constraints), then menu items
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.foodItem.deleteMany({});
  console.log('🗑️  Cleared old data (orders, cart, menu items)');

  for (const item of menuItems) {
    await prisma.foodItem.create({ data: item });
  }
  console.log(`✅ Created ${menuItems.length} authentic menu items`);

  console.log('\n🎉 Seed complete!');
  console.log('📧 Admin:   admin@canteen.com  / admin123');
  console.log('📧 Student: student@test.com   / student123');
  console.log(`🍽️  Menu:    ${menuItems.length} real dishes across 6 categories`);
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
