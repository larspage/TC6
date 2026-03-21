require('dotenv').config();

module.exports = {
    mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/tc6',
    jwtSecret: process.env.JWT_SECRET || 'development_secret_change_me'
};