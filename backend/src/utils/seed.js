require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@canteen.com' },
    update: {},
    create: {
      name: 'Canteen Admin',
      email: 'admin@canteen.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create demo student
  const studentPassword = await bcrypt.hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: {
      name: 'Demo Student',
      email: 'student@test.com',
      password: studentPassword,
      role: 'STUDENT',
      studentId: 'STU-2024-001',
      phone: '9876543210',
    },
  });
  console.log('✅ Student created:', student.email);

  // Create menu items
  const menuItems = [
    // BREAKFAST
    { name: 'Masala Dosa', description: 'Crispy dosa with spiced potato filling, served with sambar and chutneys', price: 45, category: 'BREAKFAST', prepTimeMinutes: 8, rating: 4.5, totalRatings: 120, tags: ['vegetarian', 'popular', 'south-indian'] },
    { name: 'Poha', description: 'Flattened rice with onions, peanuts, and mild spices', price: 25, category: 'BREAKFAST', prepTimeMinutes: 5, rating: 4.2, totalRatings: 80, tags: ['vegetarian', 'light'] },
    { name: 'Idli Sambar (3 pcs)', description: 'Steamed rice cakes with lentil soup and coconut chutney', price: 30, category: 'BREAKFAST', prepTimeMinutes: 5, rating: 4.3, totalRatings: 95, tags: ['vegetarian', 'healthy', 'south-indian'] },
    { name: 'Bread Omelette', description: 'Two eggs omelette with toasted bread slices', price: 40, category: 'BREAKFAST', prepTimeMinutes: 7, rating: 4.1, totalRatings: 60, tags: ['non-vegetarian', 'protein'] },
    { name: 'Upma', description: 'Semolina upma with vegetables and curry leaves', price: 25, category: 'BREAKFAST', prepTimeMinutes: 6, rating: 3.9, totalRatings: 55, tags: ['vegetarian'] },

    // LUNCH
    { name: 'Veg Thali', description: 'Complete meal: rice, 2 sabzi, dal, roti, salad, papad, pickle', price: 80, category: 'LUNCH', prepTimeMinutes: 10, rating: 4.6, totalRatings: 200, tags: ['vegetarian', 'popular', 'complete-meal'] },
    { name: 'Chicken Biryani', description: 'Aromatic basmati rice cooked with tender chicken pieces and spices', price: 120, category: 'LUNCH', prepTimeMinutes: 15, rating: 4.7, totalRatings: 180, tags: ['non-vegetarian', 'popular', 'rice'] },
    { name: 'Paneer Butter Masala + Roti', description: 'Rich paneer curry with 3 butter rotis', price: 90, category: 'LUNCH', prepTimeMinutes: 12, rating: 4.4, totalRatings: 140, tags: ['vegetarian', 'popular'] },
    { name: 'Dal Rice', description: 'Yellow dal with steamed rice, pickle and papad', price: 55, category: 'LUNCH', prepTimeMinutes: 8, rating: 4.0, totalRatings: 100, tags: ['vegetarian', 'budget'] },
    { name: 'Egg Fried Rice', description: 'Wok-tossed rice with scrambled eggs and vegetables', price: 65, category: 'LUNCH', prepTimeMinutes: 10, rating: 4.2, totalRatings: 90, tags: ['non-vegetarian'] },
    { name: 'Rajma Chawal', description: 'Red kidney bean curry served with steamed rice', price: 60, category: 'LUNCH', prepTimeMinutes: 8, rating: 4.3, totalRatings: 85, tags: ['vegetarian', 'protein'] },

    // SNACKS
    { name: 'Samosa (2 pcs)', description: 'Crispy pastry filled with spiced potatoes and peas, with green chutney', price: 20, category: 'SNACKS', prepTimeMinutes: 3, rating: 4.5, totalRatings: 250, tags: ['vegetarian', 'popular', 'fried'] },
    { name: 'Veg Puff', description: 'Flaky pastry puff with spiced vegetable filling', price: 18, category: 'SNACKS', prepTimeMinutes: 3, rating: 4.1, totalRatings: 160, tags: ['vegetarian'] },
    { name: 'Maggi Noodles', description: 'Classic instant noodles cooked with vegetables and masala', price: 30, category: 'SNACKS', prepTimeMinutes: 5, rating: 4.4, totalRatings: 300, tags: ['vegetarian', 'popular'] },
    { name: 'French Fries', description: 'Crispy golden fries with ketchup and mayonnaise', price: 45, category: 'SNACKS', prepTimeMinutes: 6, rating: 4.3, totalRatings: 190, tags: ['vegetarian'] },
    { name: 'Bread Pakoda', description: 'Spiced potato-stuffed bread fritters', price: 20, category: 'SNACKS', prepTimeMinutes: 4, rating: 4.0, totalRatings: 110, tags: ['vegetarian', 'fried'] },

    // BEVERAGES
    { name: 'Masala Chai', description: 'Spiced milk tea with ginger, cardamom and tulsi', price: 15, category: 'BEVERAGES', prepTimeMinutes: 3, rating: 4.6, totalRatings: 400, tags: ['vegetarian', 'hot', 'popular'] },
    { name: 'Cold Coffee', description: 'Chilled blended coffee with milk and sugar', price: 35, category: 'BEVERAGES', prepTimeMinutes: 3, rating: 4.4, totalRatings: 220, tags: ['vegetarian', 'cold', 'popular'] },
    { name: 'Fresh Lime Soda', description: 'Freshly squeezed lime with soda water, sweet or salted', price: 25, category: 'BEVERAGES', prepTimeMinutes: 2, rating: 4.3, totalRatings: 150, tags: ['vegetarian', 'cold', 'refreshing'] },
    { name: 'Mango Lassi', description: 'Thick yogurt drink with Alphonso mango pulp', price: 40, category: 'BEVERAGES', prepTimeMinutes: 3, rating: 4.5, totalRatings: 175, tags: ['vegetarian', 'seasonal'] },
    { name: 'Mineral Water (500ml)', description: 'Packaged drinking water', price: 20, category: 'BEVERAGES', prepTimeMinutes: 1, rating: 4.0, totalRatings: 50, tags: [] },

    // DESSERTS
    { name: 'Gulab Jamun (2 pcs)', description: 'Soft milk-solid dumplings soaked in rose-scented sugar syrup', price: 30, category: 'DESSERTS', prepTimeMinutes: 2, rating: 4.7, totalRatings: 160, tags: ['vegetarian', 'sweet', 'popular'] },
    { name: 'Ice Cream (2 scoops)', description: 'Choice of vanilla, chocolate, or strawberry', price: 40, category: 'DESSERTS', prepTimeMinutes: 2, rating: 4.5, totalRatings: 130, tags: ['vegetarian', 'cold'] },
    { name: 'Kheer', description: 'Creamy rice pudding with cardamom, saffron and dry fruits', price: 35, category: 'DESSERTS', prepTimeMinutes: 2, rating: 4.4, totalRatings: 90, tags: ['vegetarian'] },

    // SPECIAL
    { name: 'Veg Burger', description: 'Crispy patty with lettuce, tomato, cheese in a sesame bun', price: 55, category: 'SPECIAL', prepTimeMinutes: 8, rating: 4.2, totalRatings: 120, tags: ['vegetarian'] },
    { name: 'Chicken Sandwich', description: 'Grilled chicken breast with veggies and mayo in multigrain bread', price: 70, category: 'SPECIAL', prepTimeMinutes: 8, rating: 4.3, totalRatings: 100, tags: ['non-vegetarian'] },
    { name: 'Pizza Slice', description: 'Loaded cheese pizza slice (margherita or pepperoni)', price: 60, category: 'SPECIAL', prepTimeMinutes: 7, rating: 4.4, totalRatings: 145, tags: ['popular'] },
  ];

  for (const item of menuItems) {
    await prisma.foodItem.upsert({
      where: { id: item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-item' },
      update: {},
      create: {
        id: item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-item',
        ...item,
      },
    });
  }
  console.log(`✅ Created ${menuItems.length} menu items`);

  console.log('\n🎉 Seed complete!');
  console.log('📧 Admin: admin@canteen.com / admin123');
  console.log('📧 Student: student@test.com / student123');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
