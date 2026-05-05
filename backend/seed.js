const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');
const Queue = require('./models/Queue');
const connectDB = require('./config/db');

/**
 * Seed script to create demo data for testing.
 * Run with: node seed.js
 */

const upsertDemoUser = async ({ name, email, role, phone }) => {
  let user = await User.findOne({ email }).select('+password');

  if (!user) {
    user = new User({ email });
  }

  user.name = name;
  user.role = role;
  user.phone = phone;
  user.password = 'demo123';
  await user.save();

  return user;
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Starting database seeding...');

    const demoAdmin = await upsertDemoUser({
      name: 'Demo Admin',
      email: 'demo@admin.com',
      role: 'admin',
      phone: '+1234567890',
    });

    console.log('Demo admin ready:', demoAdmin.email);

    const demoQueues = [
      {
        name: 'General Consultation',
        description: 'Standard medical consultation service',
        admin: demoAdmin._id,
        isActive: true,
        isPaused: false,
        avgServiceTime: 15,
        totalServed: 0,
      },
      {
        name: 'VIP Service',
        description: 'Premium fast-track service',
        admin: demoAdmin._id,
        isActive: true,
        isPaused: false,
        avgServiceTime: 10,
        totalServed: 0,
      },
      {
        name: 'Follow-up Visit',
        description: 'Quick follow-up appointments',
        admin: demoAdmin._id,
        isActive: true,
        isPaused: false,
        avgServiceTime: 8,
        totalServed: 0,
      },
    ];

    const existingQueueCount = await Queue.countDocuments({ admin: demoAdmin._id });
    if (existingQueueCount === 0) {
      const createdQueues = await Queue.insertMany(demoQueues);
      console.log(`Created ${createdQueues.length} demo queues`);
    } else {
      console.log(
        `Demo admin already has ${existingQueueCount} queue(s). Skipping queue creation.`
      );
    }

    const demoCustomer = await upsertDemoUser({
      name: 'Demo Customer',
      email: 'demo@customer.com',
      role: 'user',
      phone: '+0987654321',
    });

    console.log('Demo customer ready:', demoCustomer.email);

    console.log('\nSeeding completed successfully!');
    console.log('\nLogin Credentials:');
    console.log('Admin: demo@admin.com / demo123');
    console.log('Customer: demo@customer.com / demo123');
    console.log('\nYou can now login and test the application!');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
