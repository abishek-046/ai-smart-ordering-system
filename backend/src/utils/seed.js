require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Image strategy: Unsplash Source API — searches by keyword and always returns
 * a real photo matching the search term. Never 404s.
 * Format: https://source.unsplash.com/featured/800x600?{search keywords}
 *
 * Each dish has a unique, specific search string so photos match the dish name.
 */
const img = (keywords) =>
  `https://source.unsplash.com/featured/800x600?${encodeURIComponent(keywords)}`;

const menuItems = [
  // ═══════════════════════════════════════════════════════════════
  //  BREAKFAST
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Ghee Masala Dosa',
    description:
      'Extra-crispy fermented rice crepe generously smothered in pure cow ghee and loaded with golden spiced potato masala. Served with coconut chutney, tomato chutney and steaming sambar.',
    price: 55, category: 'BREAKFAST', prepTimeMinutes: 8, rating: 4.8, totalRatings: 342,
    tags: ['vegetarian', 'bestseller', 'south-indian', 'gluten-free'],
    image: img('masala dosa indian breakfast crispy'),
  },
  {
    name: 'Onion Rava Dosa',
    description:
      'Thin lacy semolina crepe scattered with crispy fried onions and green chillies, cooked on a flat iron tawa till golden. Served with peanut chutney and tomato sambar.',
    price: 50, category: 'BREAKFAST', prepTimeMinutes: 7, rating: 4.6, totalRatings: 215,
    tags: ['vegetarian', 'crispy', 'south-indian'],
    image: img('rava dosa semolina crepe indian'),
  },
  {
    name: 'Idli Sambar (4 pcs)',
    description:
      'Four pillowy steamed rice cakes from aged fermented batter, served with toor-dal sambar and freshly ground coconut chutney.',
    price: 35, category: 'BREAKFAST', prepTimeMinutes: 5, rating: 4.5, totalRatings: 289,
    tags: ['vegetarian', 'healthy', 'light', 'south-indian'],
    image: img('idli sambar south indian steamed rice cakes'),
  },
  {
    name: 'Pongal with Sambar',
    description:
      'Creamy rice and moong dal slow-cooked with cracked black pepper, cumin, curry leaves and golden cashews in ghee. A Tamil breakfast staple. Served with sambar and chutney.',
    price: 40, category: 'BREAKFAST', prepTimeMinutes: 6, rating: 4.4, totalRatings: 178,
    tags: ['vegetarian', 'comfort-food', 'south-indian', 'wholesome'],
    image: img('pongal rice lentil indian breakfast khichdi'),
  },
  {
    name: 'Masala Egg Omelette & Toast',
    description:
      'Fluffy two-egg omelette with diced onions, tomatoes, green chillies and coriander. Served with two slices of golden buttered toast.',
    price: 45, category: 'BREAKFAST', prepTimeMinutes: 6, rating: 4.3, totalRatings: 156,
    tags: ['non-vegetarian', 'protein-rich', 'quick'],
    image: img('masala egg omelette toast indian spiced'),
  },
  {
    name: 'Upma & Coconut Chutney',
    description:
      'Coarsely ground semolina tempered with mustard seeds, curry leaves, fresh ginger and mixed vegetables. Topped with freshly grated coconut.',
    price: 30, category: 'BREAKFAST', prepTimeMinutes: 5, rating: 4.1, totalRatings: 134,
    tags: ['vegetarian', 'light', 'quick'],
    image: img('upma semolina breakfast indian savory'),
  },
  {
    name: 'Medu Vada (2 pcs)',
    description:
      'Golden-fried urad-dal doughnuts with a crisp shell and soft interior, flavoured with cumin and curry leaves. Served with sambar and coconut chutney.',
    price: 30, category: 'BREAKFAST', prepTimeMinutes: 6, rating: 4.4, totalRatings: 198,
    tags: ['vegetarian', 'crispy', 'south-indian', 'popular'],
    image: img('medu vada lentil donut south indian fried'),
  },

  // ═══════════════════════════════════════════════════════════════
  //  LUNCH
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Chicken Biryani',
    description:
      'Slow-cooked dum biryani — aged Basmati rice layered with tender bone-in chicken marinated in 12 spices and hung curd. Sealed and steamed. Served with raita and salan.',
    price: 130, category: 'LUNCH', prepTimeMinutes: 15, rating: 4.9, totalRatings: 512,
    tags: ['non-vegetarian', 'bestseller', 'rice', 'dum-cooked'],
    image: img('chicken biryani basmati rice indian dum'),
  },
  {
    name: 'Veg Thali (Full)',
    description:
      'Complete South Indian meal: steamed rice, rasam, sambar, two sabzis, dal, rotis, curd, pickle and papad. Unlimited refills on rice.',
    price: 90, category: 'LUNCH', prepTimeMinutes: 8, rating: 4.7, totalRatings: 387,
    tags: ['vegetarian', 'bestseller', 'complete-meal', 'unlimited-rice'],
    image: img('indian thali vegetarian full meal plate'),
  },
  {
    name: 'Egg Biryani',
    description:
      'Fragrant Basmati rice cooked with whole boiled eggs, fried onions, fresh mint and biryani masala. Served with boiled-egg raita.',
    price: 90, category: 'LUNCH', prepTimeMinutes: 12, rating: 4.5, totalRatings: 267,
    tags: ['non-vegetarian', 'rice', 'popular'],
    image: img('egg biryani boiled eggs basmati rice'),
  },
  {
    name: 'Paneer Butter Masala + 3 Rotis',
    description:
      'Cottage cheese in velvety tomato-cashew gravy with butter, cream and fenugreek. Served with three butter-smeared rotis.',
    price: 95, category: 'LUNCH', prepTimeMinutes: 10, rating: 4.6, totalRatings: 298,
    tags: ['vegetarian', 'popular', 'north-indian', 'rich'],
    image: img('paneer butter masala curry cottage cheese indian'),
  },
  {
    name: 'Dal Tadka + Rice',
    description:
      'Smoky yellow lentils tempered with ghee, cumin, dried red chillies, garlic and tomatoes. Served with steamed rice, roti, pickle and papad.',
    price: 60, category: 'LUNCH', prepTimeMinutes: 8, rating: 4.3, totalRatings: 223,
    tags: ['vegetarian', 'budget-friendly', 'protein-rich', 'homestyle'],
    image: img('dal tadka yellow lentil curry indian'),
  },
  {
    name: 'Chicken Curry + 3 Rotis',
    description:
      'Bone-in chicken slow-cooked in rich onion-tomato gravy with freshly pounded garam masala. Served with soft rotis.',
    price: 110, category: 'LUNCH', prepTimeMinutes: 12, rating: 4.6, totalRatings: 334,
    tags: ['non-vegetarian', 'popular', 'spicy'],
    image: img('chicken curry gravy indian spicy masala'),
  },
  {
    name: 'Chole Bhature (2 pcs)',
    description:
      'Spiced white chickpeas in deep onion-tomato gravy. Served with two giant deep-fried leavened bread puffs, raw onion, lime and pickle.',
    price: 70, category: 'LUNCH', prepTimeMinutes: 8, rating: 4.5, totalRatings: 267,
    tags: ['vegetarian', 'north-indian', 'filling', 'popular'],
    image: img('chole bhature chickpeas fried bread indian punjabi'),
  },
  {
    name: 'Mutton Kheema Rice',
    description:
      'Minced mutton cooked with whole spices, mint, peas and fried onions, tossed with ghee rice. Garnished with crispy shallots and a boiled egg.',
    price: 140, category: 'LUNCH', prepTimeMinutes: 15, rating: 4.7, totalRatings: 189,
    tags: ['non-vegetarian', 'premium', 'spicy', 'filling'],
    image: img('mutton keema mince meat rice indian'),
  },

  // ═══════════════════════════════════════════════════════════════
  //  SNACKS
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Samosa Chaat (2 pcs)',
    description:
      'Crushed samosas piled high with tamarind chutney, mint chutney, crispy sev, onions, tomatoes and chaat masala.',
    price: 35, category: 'SNACKS', prepTimeMinutes: 4, rating: 4.7, totalRatings: 445,
    tags: ['vegetarian', 'bestseller', 'street-food', 'tangy'],
    image: img('samosa chaat indian street food chutney'),
  },
  {
    name: 'Pav Bhaji',
    description:
      'Mumbai-style thick mashed vegetable bhaji cooked with butter and pav bhaji masala. Served with toasted butter pav, diced onion and lime.',
    price: 55, category: 'SNACKS', prepTimeMinutes: 7, rating: 4.6, totalRatings: 312,
    tags: ['vegetarian', 'street-food', 'popular', 'filling'],
    image: img('pav bhaji mumbai street food vegetable mash'),
  },
  {
    name: 'Cheesy Maggi Noodles',
    description:
      'Instant noodles tossed with vegetables, extra Maggi masala and topped with a blanket of melted cheese.',
    price: 40, category: 'SNACKS', prepTimeMinutes: 5, rating: 4.5, totalRatings: 523,
    tags: ['vegetarian', 'bestseller', 'comfort-food', 'quick'],
    image: img('maggi noodles cheese instant noodles india'),
  },
  {
    name: 'Crispy Masala Fries',
    description:
      'Thick-cut fries fried twice and tossed in chilli, chaat masala and amchur. Served with sriracha mayo and ketchup.',
    price: 50, category: 'SNACKS', prepTimeMinutes: 6, rating: 4.4, totalRatings: 378,
    tags: ['vegetarian', 'popular', 'crispy'],
    image: img('masala fries crispy spiced potato fries'),
  },
  {
    name: 'Bread Pakoda (3 pcs)',
    description:
      'Bread slices stuffed with spiced potato and paneer, dipped in besan batter and deep-fried golden. Served with green chutney.',
    price: 30, category: 'SNACKS', prepTimeMinutes: 5, rating: 4.2, totalRatings: 234,
    tags: ['vegetarian', 'fried', 'filling'],
    image: img('bread pakoda indian fried snack besan batter'),
  },
  {
    name: 'Egg Puff',
    description:
      'Buttery puff-pastry shell encasing a spiced whole boiled egg and caramelised onions. Baked fresh every hour.',
    price: 25, category: 'SNACKS', prepTimeMinutes: 3, rating: 4.3, totalRatings: 289,
    tags: ['non-vegetarian', 'baked', 'quick', 'popular'],
    image: img('egg puff pastry baked snack indian bakery'),
  },

  // ═══════════════════════════════════════════════════════════════
  //  BEVERAGES
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Kadak Masala Chai',
    description:
      'Strong CTC tea brewed with ginger, cardamom, cinnamon and tulsi in full-fat milk, sweetened to order.',
    price: 15, category: 'BEVERAGES', prepTimeMinutes: 3, rating: 4.8, totalRatings: 867,
    tags: ['vegetarian', 'hot', 'bestseller', 'energising'],
    image: img('masala chai tea ginger cardamom indian spiced'),
  },
  {
    name: 'Cold Coffee Shake',
    description:
      'Chilled espresso blended with full-fat milk, vanilla ice cream and chocolate syrup. Thick and indulgent.',
    price: 55, category: 'BEVERAGES', prepTimeMinutes: 3, rating: 4.6, totalRatings: 445,
    tags: ['vegetarian', 'cold', 'popular', 'indulgent'],
    image: img('cold coffee shake chocolate milk frothy iced'),
  },
  {
    name: 'Fresh Mango Lassi',
    description:
      'Hand-churned yogurt whipped with Alphonso mango pulp, cardamom and a touch of saffron.',
    price: 50, category: 'BEVERAGES', prepTimeMinutes: 3, rating: 4.7, totalRatings: 334,
    tags: ['vegetarian', 'cold', 'seasonal', 'refreshing'],
    image: img('mango lassi yogurt drink Indian yellow'),
  },
  {
    name: 'Fresh Lime Soda',
    description:
      'Freshly squeezed lime over crushed ice with chilled soda. Choose sweet, salted or masala.',
    price: 25, category: 'BEVERAGES', prepTimeMinutes: 2, rating: 4.5, totalRatings: 312,
    tags: ['vegetarian', 'cold', 'refreshing', 'quick'],
    image: img('fresh lime soda water citrus drink green'),
  },
  {
    name: 'Filter Coffee',
    description:
      'South Indian filter coffee from freshly ground Coorg beans. Served in a steel tumbler and davara with perfect froth.',
    price: 20, category: 'BEVERAGES', prepTimeMinutes: 3, rating: 4.7, totalRatings: 523,
    tags: ['vegetarian', 'hot', 'south-indian', 'classic'],
    image: img('south indian filter coffee steel tumbler davara'),
  },

  // ═══════════════════════════════════════════════════════════════
  //  DESSERTS
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Gulab Jamun (3 pcs)',
    description:
      'Soft deep-fried khoya dumplings soaked overnight in rose water and cardamom sugar syrup. Served warm.',
    price: 35, category: 'DESSERTS', prepTimeMinutes: 2, rating: 4.8, totalRatings: 456,
    tags: ['vegetarian', 'sweet', 'bestseller', 'classic'],
    image: img('gulab jamun indian sweet syrup dessert'),
  },
  {
    name: 'Kesari Paal Payasam',
    description:
      'Silky rice pudding cooked in whole milk with saffron, cardamom, cashews and golden raisins. A South Indian festive dessert.',
    price: 45, category: 'DESSERTS', prepTimeMinutes: 3, rating: 4.6, totalRatings: 267,
    tags: ['vegetarian', 'traditional', 'south-indian', 'festive'],
    image: img('kheer payasam rice pudding saffron indian dessert'),
  },
  {
    name: 'Chocolate Brownie',
    description:
      'Dense fudgy dark-chocolate brownie with roasted walnuts. Served warm with a scoop of vanilla ice cream and chocolate sauce.',
    price: 60, category: 'DESSERTS', prepTimeMinutes: 2, rating: 4.7, totalRatings: 312,
    tags: ['vegetarian', 'chocolate', 'popular', 'indulgent'],
    image: img('chocolate brownie fudgy walnut ice cream dessert'),
  },

  // ═══════════════════════════════════════════════════════════════
  //  SPECIAL
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Chef's Special Veg Burger",
    description:
      'Crispy beetroot-chickpea patty on a toasted brioche bun with sriracha slaw, pickled jalapenos, aged cheddar and truffle mayo.',
    price: 80, category: 'SPECIAL', prepTimeMinutes: 10, rating: 4.5, totalRatings: 223,
    tags: ['vegetarian', 'gourmet', 'special'],
    image: img('gourmet vegetarian burger beetroot patty brioche'),
  },
  {
    name: 'Grilled Chicken Sandwich',
    description:
      'Herb-marinated grilled chicken breast on sourdough with romaine, tomato, caramelised onions and chipotle mayo.',
    price: 90, category: 'SPECIAL', prepTimeMinutes: 10, rating: 4.6, totalRatings: 198,
    tags: ['non-vegetarian', 'gourmet', 'protein-rich', 'special'],
    image: img('grilled chicken sandwich sourdough chipotle'),
  },
  {
    name: "Today's Special Thali",
    description:
      "The canteen manager's daily curated meal — changes every day based on fresh market produce. Ask the counter for today's combination.",
    price: 85, category: 'SPECIAL', prepTimeMinutes: 8, rating: 4.8, totalRatings: 156,
    tags: ['vegetarian', 'daily-special', 'chef-choice', 'surprise'],
    image: img('indian thali special daily meal spread'),
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  const adminPwd = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@canteen.com' },
    update: {},
    create: { name: 'Canteen Admin', email: 'admin@canteen.com', password: adminPwd, role: 'ADMIN' },
  });
  console.log('✅ Admin: admin@canteen.com');

  const studentPwd = await bcrypt.hash('student123', 12);
  await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: {
      name: 'Abishek Kumar', email: 'student@test.com',
      password: studentPwd, role: 'STUDENT',
      studentId: 'STU-2024-001', phone: '9876543210',
    },
  });
  console.log('✅ Student: student@test.com');

  // Clear FK-constrained tables before re-seeding menu
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.foodItem.deleteMany({});
  console.log('🗑️  Cleared old data');

  for (const item of menuItems) {
    await prisma.foodItem.create({ data: item });
  }
  console.log(`✅ Created ${menuItems.length} menu items — photos matched to dish names`);

  console.log('\n🎉 Seed complete!');
  console.log('📧  Admin  : admin@canteen.com  /  admin123');
  console.log('📧  Student: student@test.com   /  student123');
  console.log(`🍽️   Menu   : ${menuItems.length} dishes, photos served via Unsplash featured search`);
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
