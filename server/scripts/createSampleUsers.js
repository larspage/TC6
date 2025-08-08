require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

// DB Config
const db = require('../config/keys').mongoURI;

const sampleUsers = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'mypass456'
  }
];

const createSampleUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(db);
    console.log('MongoDB Connected...');

    // Check if users already exist
    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create new user
      const user = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword
      });

      await user.save();
      console.log(`✅ Created user: ${userData.username} (${userData.email})`);
    }

    console.log('\n🎉 Sample users creation completed!');
    console.log('\nSample Users for Testing:');
    console.log('1. Email: john@example.com | Password: password123');
    console.log('2. Email: jane@example.com | Password: mypass456');
    console.log('\n⚠️  NOTE: These are simple passwords for development only.');
    console.log('   Password strength requirements should be increased before deployment.');

  } catch (error) {
    console.error('Error creating sample users:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
};

// Run the script
createSampleUsers();
