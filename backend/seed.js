require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Queue = require('./models/Queue');
const connectDB = require('./config/db');

/**
 * Seed script to create demo data for testing
 * Run with: node seed.js
 */

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🌱 Starting database seeding...');

    // Check if demo admin already exists
    const existingAdmin = await User.findOne({ email: 'demo@admin.com' });
    if (existingAdmin) {
      console.log('⚠️  Demo admin already exists. Skipping seed.');
      process.exit(0);
    }

    // Create demo admin user
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const demoAdmin = await User.create({
      name: 'Demo Admin',
      email: 'demo@admin.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+1234567890',
    });

    console.log('✅ Demo admin created:', demoAdmin.email);

    // Create demo queues
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

    const createdQueues = await Queue.insertMany(demoQueues);
    console.log(`✅ Created ${createdQueues.length} demo queues`);

    // Create demo customer user
    const demoCustomer = await User.create({
      name: 'Demo Customer',
      email: 'demo@customer.com',
      password: hashedPassword,
      role: 'user',
      phone: '+0987654321',
    });

    console.log('✅ Demo customer created:', demoCustomer.email);

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('Admin: demo@admin.com / demo123');
    console.log('Customer: demo@customer.com / demo123');
    console.log('\nYou can now login and test the application!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
