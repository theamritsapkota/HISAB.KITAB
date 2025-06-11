const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

  } catch (err) {
    console.error('❌ MongoDB Atlas Connection Failed:', err.message);
    
    // Log specific connection errors
    if (err.message.includes('authentication failed')) {
      console.error('🔐 Check your username and password in the connection string');
    } else if (err.message.includes('network')) {
      console.error('🌐 Check your network connection and Atlas cluster status');
    } else if (err.message.includes('timeout')) {
      console.error('⏱️ Connection timeout - check your Atlas cluster is running');
    }
    
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('📴 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during MongoDB disconnection:', err);
    process.exit(1);
  }
});

module.exports = connectDB;