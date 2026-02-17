/**
 * Seed script to populate demo data (OPTIONAL)
 * 
 * Usage:
 *   node server/seed.js              - Create demo data
 *   node server/seed.js --clear      - Clear all data (keep database empty)
 * 
 * The application works with or without seed data.
 * Users can register and create their own chargers.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Charger = require('./models/Charger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ev-charging-hub';
const args = process.argv.slice(2);
const clearOnly = args.includes('--clear');

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Charger.deleteMany({});
        console.log('🗑️  Cleared existing data');

        if (clearOnly) {
            console.log('\n✅ Database cleared! Starting fresh.');
            console.log('📝 Register a new user to get started.');
        } else {
            console.log('📍 Creating demo data...\n');

            // Create demo users
            const demoUsers = [
                {
                    name: 'John Smith',
                    email: 'user@example.com',
                    password: 'password123',
                    role: 'user',
                    greenScore: 150,
                    totalChargingTime: 15
                },
                {
                    name: 'Sarah Johnson',
                    email: 'owner@example.com',
                    password: 'password123',
                    role: 'owner',
                    greenScore: 0,
                    totalChargingTime: 0
                }
            ];

            for (const userData of demoUsers) {
                const user = new User({
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    role: userData.role,
                    greenScore: userData.greenScore,
                    totalChargingTime: userData.totalChargingTime
                });
                await user.save();
                console.log(`👤 Created user: ${user.email}`);
            }

            // Get owner ID
            const owner = await User.findOne({ email: 'owner@example.com' });

            // Create demo chargers (London locations)
            const demoChargers = [
                {
                    name: 'Oxford Street Hub',
                    address: '123 Oxford Street, London W1D 2EH',
                    latitude: 51.5161,
                    longitude: -0.1426,
                    ownerId: owner._id,
                    chargerType: 'DC Fast',
                    totalSlots: 8,
                    availableSlots: 6,
                    rating: 4.8,
                    description: 'Fast charging station in central London'
                },
                {
                    name: 'Tower Bridge Plaza',
                    address: 'Tower Bridge, London SE1 2UP',
                    latitude: 51.5055,
                    longitude: -0.0754,
                    ownerId: owner._id,
                    chargerType: 'Level 2',
                    totalSlots: 6,
                    availableSlots: 2,
                    rating: 4.5,
                    description: 'Premium charging near Tower Bridge'
                },
                {
                    name: 'Green Park Station',
                    address: 'Green Park, London SW1A 1AX',
                    latitude: 51.5036,
                    longitude: -0.1496,
                    ownerId: owner._id,
                    chargerType: 'Level 2',
                    totalSlots: 4,
                    availableSlots: 1,
                    rating: 4.2,
                    description: 'Eco-friendly charging hub'
                },
                {
                    name: 'Southbank Express',
                    address: 'South Bank Centre, London SE1 8XX',
                    latitude: 51.5070,
                    longitude: -0.1212,
                    ownerId: owner._id,
                    chargerType: 'DC Fast',
                    totalSlots: 10,
                    availableSlots: 5,
                    rating: 4.9,
                    description: 'High-speed charging by the Thames'
                },
                {
                    name: 'Regent Park Eco Charge',
                    address: 'Regent Park, London NW1 4NU',
                    latitude: 51.5313,
                    longitude: -0.1438,
                    ownerId: owner._id,
                    chargerType: 'Level 1',
                    totalSlots: 3,
                    availableSlots: 3,
                    rating: 4.3,
                    description: 'Sustainable charging in green surroundings'
                }
            ];

            for (const chargerData of demoChargers) {
                const charger = new Charger(chargerData);
                await charger.save();
                console.log(`⚡ Created charger: ${charger.name}`);
            }

            console.log('\n✅ Seed data created successfully!');
            console.log('\n📝 Demo Accounts:');
            console.log('  User: user@example.com / password123');
            console.log('  Owner: owner@example.com / password123');
        }
    } catch (err) {
        console.error('❌ Seed error:', err);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 MongoDB connection closed');
    }
}

seed();
