const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');
const MindMap = require('../src/models/MindMap');
const Node = require('../src/models/Node');

process.env.JWT_SECRET = 'test-secret';
process.env.MONGO_URI = 'mongodb://localhost:27017/tc6_test';

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
}

async function disconnectDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}

async function clearDB() {
  await Promise.all(
    Object.values(mongoose.connection.collections).map(c => c.deleteMany({}))
  );
}

async function createUser(overrides = {}) {
  const salt = await bcrypt.genSalt(10);
  const user = await User.create({
    username: overrides.username || 'testuser',
    email: overrides.email || 'test@example.com',
    password: await bcrypt.hash(overrides.password || 'password123', salt),
  });
  const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { user, token };
}

async function createMindmap(userId, overrides = {}) {
  return MindMap.create({ title: overrides.title || 'Test Map', user_id: userId });
}

async function createNode(mindmapId, overrides = {}) {
  return Node.create({
    mindmap_id: mindmapId,
    text: overrides.text || 'Test Node',
    position: overrides.position || { x: 0, y: 0 },
    level: overrides.level || 0,
  });
}

module.exports = { connectDB, disconnectDB, clearDB, createUser, createMindmap, createNode };
