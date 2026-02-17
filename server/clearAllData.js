require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const Charger = require('./models/Charger');
const Booking = require('./models/Booking');
const BookingRequest = require('./models/BookingRequest');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ev-charging-hub';
const args = process.argv.slice(2);
const confirmFlag = args.includes('--confirm');

(async function main(){
  console.log('This script will DELETE ALL Users, Chargers, Bookings, and BookingRequests from the database.');
  if(!confirmFlag){
    console.log('\nTo actually perform deletion run:\n\n  node server/clearAllData.js --confirm\n');
    process.exit(1);
  }

  try{
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const userDel = await User.deleteMany({});
    console.log(`Users deleted: ${userDel.deletedCount}`);

    const chargerDel = await Charger.deleteMany({});
    console.log(`Chargers deleted: ${chargerDel.deletedCount}`);

    const bookingDel = await Booking.deleteMany({});
    console.log(`Bookings deleted: ${bookingDel.deletedCount}`);

    const reqDel = await BookingRequest.deleteMany({});
    console.log(`BookingRequests deleted: ${reqDel.deletedCount}`);

    console.log('\n✅ Cleanup complete. Current counts:');
    const usersCount = await User.countDocuments();
    const chargersCount = await Charger.countDocuments();
    const bookingsCount = await Booking.countDocuments();
    const requestsCount = await BookingRequest.countDocuments();

    console.log(`Users: ${usersCount}`);
    console.log(`Chargers: ${chargersCount}`);
    console.log(`Bookings: ${bookingsCount}`);
    console.log(`BookingRequests: ${requestsCount}`);

    await mongoose.disconnect();
    process.exit(0);
  }catch(err){
    console.error('Error during cleanup:', err);
    process.exit(2);
  }
})();