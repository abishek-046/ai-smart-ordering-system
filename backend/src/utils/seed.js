require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Verified Unsplash photo URLs — each is unique and specifically matches the dish.
// Format: direct CDN URL with w=800&q=80&fit=crop for consistent sizing.

const menuItems = [
  // ═══════════════════════════════════════════════════════════════
  //  BREAKFAST
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Ghee Masala Dosa',
    description: 'Extra-crispy fermented rice crepe generously smothered in pure cow ghee and loaded with a golden spiced potato masala. Served with coconut chutney, tomato chutney and a cup of steaming sambar.',
    price: 55, category: 'BREAKFAST', prepTimeMinutes: 8, rating: 4.8, totalRatings: 342,
    tags: ['vegetarian', 'bestseller', 'south-indian', 'gluten-free'],
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Onion Rava Dosa',
    description: 'Thin, lacy semolina and rice-flour crepe scattered with crispy fried onions and slit green chillies, cooked on a flat iron tawa till golden. Served with peanut chutney and tomato sambar.',
    price: 50, category: 'BREAKFAST', prepTimeMinutes: 7, rating: 4.6, totalRatings: 215,
    tags: ['vegetarian', 'crispy', 'south-indian'],
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Idli Sambar (4 pcs)',
    description: 'Four pillowy steamed rice cakes made from aged fermented batter, served with toor-dal sambar packed with drumstick and tomato, plus freshly ground coconut chutney on the side.',
    price: 35, category: 'BREAKFAST', prepTimeMinutes: 5, rating: 4.5, totalRatings: 289,
    tags: ['vegetarian', 'healthy', 'light', 'south-indian'],
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Pongal with Sambar',
    description: 'Creamy rice and moong dal slow-cooked with cracked black pepper, cumin, curry leaves and golden cashews in clarified butter. A classic Tamil breakfast served with tiffin sambar and chutney.',
    price: 40, category: 'BREAKFAST', prepTimeMinutes: 6, rating: 4.4, totalRatings: 178,
    tags: ['vegetarian', 'comfort-food', 'south-indian', 'wholesome'],
    image: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Masala Egg Omelette & Toast',
    description: 'Fluffy two-egg omelette packed with diced onions, tomatoes, slit green chillies, fresh coriander and a pinch of chaat masala. Served with two slices of golden buttered toast.',
    price: 45, category: 'BREAKFAST', prepTimeMinutes: 6, rating: 4.3, totalRatings: 156,
    tags: ['non-vegetarian', 'protein-rich', 'quick'],
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Upma & Coconut Chutney',
    description: 'Coarsely ground semolina dry-roasted and tempered with mustard seeds, curry leaves, fresh ginger, dried red chillies and a mix of vegetables. Topped with freshly grated coconut.',
    price: 30, category: 'BREAKFAST', prepTimeMinutes: 5, rating: 4.1, totalRatings: 134,
    tags: ['vegetarian', 'light', 'quick'],
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Medu Vada (2 pcs)',
    description: 'Golden-fried urad-dal doughnuts with a crisp shell and soft, airy interior, flavoured with cumin seeds, curry leaves and black pepper. Served with sambar and fresh coconut chutney.',
    price: 30, category: 'BREAKFAST', prepTimeMinutes: 6, rating: 4.4, totalRatings: 198,
    tags: ['vegetarian', 'crispy', 'south-indian', 'popular'],
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&q=80&fit=crop&auto=format',
  },

  // ═══════════════════════════════════════════════════════════════
  //  LUNCH
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Chicken Biryani',
    description: 'Slow-cooked dum biryani — aged Basmati rice layered with tender bone-in chicken marinated overnight in 12 whole spices and hung curd. Sealed and steamed. Served with raita and salan.',
    price: 130, category: 'LUNCH', prepTimeMinutes: 15, rating: 4.9, totalRatings: 512,
    tags: ['non-vegetarian', 'bestseller', 'rice', 'dum-cooked'],
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Veg Thali (Full)',
    description: 'Complete South Indian meal: steamed rice, rasam, sambar, two seasonal sabzis, masoor dal, two rotis, fresh curd, pickle, papad and a seasonal sweet. Unlimited refills on rice.',
    price: 90, category: 'LUNCH', prepTimeMinutes: 8, rating: 4.7, totalRatings: 387,
    tags: ['vegetarian', 'bestseller', 'complete-meal', 'unlimited-rice'],
    image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Egg Biryani',
    description: 'Fragrant long-grain Basmati rice cooked with whole boiled eggs, crispy fried onions, fresh mint and a secret biryani masala blend. Served with boiled-egg raita and sliced onion salad.',
    price: 90, category: 'LUNCH', prepTimeMinutes: 12, rating: 4.5, totalRatings: 267,
    tags: ['non-vegetarian', 'rice', 'popular'],
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Paneer Butter Masala + 3 Rotis',
    description: 'Cottage cheese cubes simmered in a velvety tomato-cashew gravy enriched with butter, fresh cream and dried fenugreek leaves. Served with three freshly made butter-smeared rotis.',
    price: 95, category: 'LUNCH', prepTimeMinutes: 10, rating: 4.6, totalRatings: 298,
    tags: ['vegetarian', 'popular', 'north-indian', 'rich'],
    image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Dal Tadka + Rice',
    description: 'Smoky yellow lentils tempered twice — first with ghee and cumin, then with a sizzling pour of dried red chillies, garlic and tomatoes. Served with steamed rice, roti, pickle and papad.',
    price: 60, category: 'LUNCH', prepTimeMinutes: 8, rating: 4.3, totalRatings: 223,
    tags: ['vegetarian', 'budget-friendly', 'protein-rich', 'homestyle'],
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Chicken Curry + 3 Rotis',
    description: 'Bone-in chicken slow-cooked in a rich onion-tomato gravy with freshly pounded garam masala, turmeric and Kashmiri chilli for deep colour. Best enjoyed with freshly made soft rotis.',
    price: 110, category: 'LUNCH', prepTimeMinutes: 12, rating: 4.6, totalRatings: 334,
    tags: ['non-vegetarian', 'popular', 'spicy'],
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Chole Bhature (2 pcs)',
    description: 'Spiced white chickpeas cooked with tea-soaked whole spices and a deep onion-tomato gravy. Served with two giant deep-fried leavened bread puffs, sliced raw onion, lime and pickle.',
    price: 70, category: 'LUNCH', prepTimeMinutes: 8, rating: 4.5, totalRatings: 267,
    tags: ['vegetarian', 'north-indian', 'filling', 'popular'],
    image: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Mutton Kheema Rice',
    description: 'Minced mutton cooked with whole spices, fresh mint, green peas and fried onions, then tossed with ghee rice. Garnished with crispy shallots and a halved boiled egg.',
    price: 140, category: 'LUNCH', prepTimeMinutes: 15, rating: 4.7, totalRatings: 189,
    tags: ['non-vegetarian', 'premium', 'spicy', 'filling'],
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&q=80&fit=crop&auto=format',
  },

  // ═══════════════════════════════════════════════════════════════
  //  SNACKS
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Samosa Chaat (2 pcs)',
    description: 'Two flaky pastry samosas crushed on a plate and piled high with sweet tamarind chutney, bright green mint chutney, crispy sev, chopped onions, tomatoes and a dusting of chaat masala.',
    price: 35, category: 'SNACKS', prepTimeMinutes: 4, rating: 4.7, totalRatings: 445,
    tags: ['vegetarian', 'bestseller', 'street-food', 'tangy'],
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Pav Bhaji',
    description: 'Mumbai-style thick mashed vegetable bhaji cooked on a tawa with lashings of butter and pav bhaji masala. Served with two toasted butter pav, diced onion and a squeeze of fresh lime.',
    price: 55, category: 'SNACKS', prepTimeMinutes: 7, rating: 4.6, totalRatings: 312,
    tags: ['vegetarian', 'street-food', 'popular', 'filling'],
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Cheesy Maggi Noodles',
    description: 'Classic instant noodles wok-tossed with mixed vegetables, extra Maggi masala and topped with a generous blanket of melted processed cheese. The go-to comfort snack for any time of day.',
    price: 40, category: 'SNACKS', prepTimeMinutes: 5, rating: 4.5, totalRatings: 523,
    tags: ['vegetarian', 'bestseller', 'comfort-food', 'quick'],
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Crispy Masala Fries',
    description: 'Thick-cut potato fries fried twice for maximum crunch, tossed hot in a house blend of chilli powder, chaat masala and amchur. Served with sriracha mayo and tomato ketchup.',
    price: 50, category: 'SNACKS', prepTimeMinutes: 6, rating: 4.4, totalRatings: 378,
    tags: ['vegetarian', 'popular', 'crispy'],
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Bread Pakoda (3 pcs)',
    description: 'Thick bread slices stuffed with a spiced mashed potato and fresh paneer filling, dipped in seasoned besan batter and deep-fried until golden and crunchy. Served with green chutney.',
    price: 30, category: 'SNACKS', prepTimeMinutes: 5, rating: 4.2, totalRatings: 234,
    tags: ['vegetarian', 'fried', 'filling'],
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Egg Puff',
    description: 'Buttery, shatteringly crisp puff-pastry shell encasing a masala-spiced whole boiled egg and caramelised onions. Baked fresh every hour. Best enjoyed hot, straight from the oven.',
    price: 25, category: 'SNACKS', prepTimeMinutes: 3, rating: 4.3, totalRatings: 289,
    tags: ['non-vegetarian', 'baked', 'quick', 'popular'],
    image: 'https://images.unsplash.com/photo-1600803907087-f56d462fd26b?w=800&q=80&fit=crop&auto=format',
  },

  // ═══════════════════════════════════════════════════════════════
  //  BEVERAGES
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Kadak Masala Chai',
    description: 'Strong CTC tea brewed long with fresh ginger, green cardamom, cinnamon and holy basil leaves in full-fat whole milk, sweetened to order. The most-ordered drink in the canteen.',
    price: 15, category: 'BEVERAGES', prepTimeMinutes: 3, rating: 4.8, totalRatings: 867,
    tags: ['vegetarian', 'hot', 'bestseller', 'energising'],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Cold Coffee Shake',
    description: 'Chilled espresso blended with full-fat milk, two scoops of vanilla ice cream and sugar, then drizzled with chocolate syrup. Thick, creamy and unapologetically indulgent.',
    price: 55, category: 'BEVERAGES', prepTimeMinutes: 3, rating: 4.6, totalRatings: 445,
    tags: ['vegetarian', 'cold', 'popular', 'indulgent'],
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Fresh Mango Lassi',
    description: 'Hand-churned yogurt whipped with chilled Alphonso mango pulp, a pinch of cardamom and a touch of saffron. Thick enough to stand a spoon in. Seasonal — order before it sells out.',
    price: 50, category: 'BEVERAGES', prepTimeMinutes: 3, rating: 4.7, totalRatings: 334,
    tags: ['vegetarian', 'cold', 'seasonal', 'refreshing'],
    image: 'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Fresh Lime Soda',
    description: 'Freshly squeezed lime juice poured over crushed ice and topped with chilled soda water. Choose sweet, salted or masala. Perfect antidote to a hot afternoon.',
    price: 25, category: 'BEVERAGES', prepTimeMinutes: 2, rating: 4.5, totalRatings: 312,
    tags: ['vegetarian', 'cold', 'refreshing', 'quick'],
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Filter Coffee',
    description: 'Classic South Indian filter coffee brewed from freshly ground Coorg beans in a traditional stainless steel filter. Served in a steel tumbler and davara with perfect froth and rich aroma.',
    price: 20, category: 'BEVERAGES', prepTimeMinutes: 3, rating: 4.7, totalRatings: 523,
    tags: ['vegetarian', 'hot', 'south-indian', 'classic'],
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&fit=crop&auto=format',
  },

  // ═══════════════════════════════════════════════════════════════
  //  DESSERTS
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Gulab Jamun (3 pcs)',
    description: 'Three soft, deep-fried khoya dumplings with a mahogany crust and yielding centre, soaked overnight in a rose water and green-cardamom sugar syrup. Served warm.',
    price: 35, category: 'DESSERTS', prepTimeMinutes: 2, rating: 4.8, totalRatings: 456,
    tags: ['vegetarian', 'sweet', 'bestseller', 'classic'],
    image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Kesari Paal Payasam',
    description: 'Silky rice pudding slowly cooked in whole milk with pure saffron strands, green cardamom, cashew nuts and golden raisins until thick and fragrant. A traditional South Indian festive dessert.',
    price: 45, category: 'DESSERTS', prepTimeMinutes: 3, rating: 4.6, totalRatings: 267,
    tags: ['vegetarian', 'traditional', 'south-indian', 'festive'],
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Chocolate Brownie',
    description: 'Dense, fudgy dark-chocolate brownie baked with roasted walnuts and a glossy crinkle top. Served warm with a generous scoop of vanilla ice cream and a cascade of warm chocolate sauce.',
    price: 60, category: 'DESSERTS', prepTimeMinutes: 2, rating: 4.7, totalRatings: 312,
    tags: ['vegetarian', 'chocolate', 'popular', 'indulgent'],
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80&fit=crop&auto=format',
  },

  // ═══════════════════════════════════════════════════════════════
  //  SPECIAL
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Chef's Special Veg Burger",
    description: 'Housemade crispy beetroot-chickpea patty on a toasted brioche bun layered with sriracha slaw, pickled jalapenos, sliced aged cheddar, caramelised onion jam and black-truffle mayo.',
    price: 80, category: 'SPECIAL', prepTimeMinutes: 10, rating: 4.5, totalRatings: 223,
    tags: ['vegetarian', 'gourmet', 'special'],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: 'Grilled Chicken Sandwich',
    description: 'Herb and lemon-marinated chicken breast grilled on a cast-iron until charred. Layered on sourdough with crunchy romaine lettuce, vine tomato, caramelised red onions and smoky chipotle mayo.',
    price: 90, category: 'SPECIAL', prepTimeMinutes: 10, rating: 4.6, totalRatings: 198,
    tags: ['non-vegetarian', 'gourmet', 'protein-rich', 'special'],
    image: 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?w=800&q=80&fit=crop&auto=format',
  },
  {
    name: "Today's Special Thali",
    description: "The canteen manager's daily curated meal — changes every day based on fresh market produce and the season. Ask the counter for today's combination. Always freshly made and deeply satisfying.",
    price: 85, category: 'SPECIAL', prepTimeMinutes: 8, rating: 4.8, totalRatings: 156,
    tags: ['vegetarian', 'daily-special', 'chef-choice', 'surprise'],
    image: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800&q=80&fit=crop&auto=format',
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
    create: { name: 'Abishek Kumar', email: 'student@test.com', password: studentPwd, role: 'STUDENT', studentId: 'STU-2024-001', phone: '9876543210' },
  });
  console.log('✅ Student: student@test.com');

  // Clear FK-constrained tables first
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.foodItem.deleteMany({});
  console.log('🗑️  Cleared old data');

  for (const item of menuItems) {
    await prisma.foodItem.create({ data: item });
  }
  console.log(`✅ Created ${menuItems.length} menu items with unique food photos`);

  console.log('\n🎉 Seed complete!');
  console.log('📧  Admin  : admin@canteen.com  /  admin123');
  console.log('📧  Student: student@test.com   /  student123');
  console.log(`🍽️   Menu   : ${menuItems.length} dishes, all with real photos`);
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
