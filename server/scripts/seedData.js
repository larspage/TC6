/**
 * Seed script — Innovation Hub mind map
 * 5 levels, 49 nodes, rich cross-connections
 *
 * Usage: node server/scripts/seedData.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { mongoURI } = require('../config/keys');
const User       = require('../src/models/User');
const MindMap    = require('../src/models/MindMap');
const Node       = require('../src/models/Node');
const Connection = require('../src/models/Connection');

// ─── Layout helper ────────────────────────────────────────────────────────────
function radial(cx, cy, radius, count, startAngle = -Math.PI / 2) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const a = startAngle + (i * 2 * Math.PI) / count;
    out.push({ x: Math.round(cx + radius * Math.cos(a)), y: Math.round(cy + radius * Math.sin(a)) });
  }
  return out;
}

// ─── Connection helper ────────────────────────────────────────────────────────
async function link(mindmap_id, from, to, type = 'parent-child', style = 'solid', color = '#94a3b8') {
  return Connection.create({
    mindmap_id,
    from_node_id: from._id,
    to_node_id:   to._id,
    connection_type: type,
    styling: { color, width: 2, style },
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB');

  // Clean previous seed
  const existing = await User.findOne({ email: 'demo@thoughtcatcher.dev' });
  if (existing) {
    const maps = await MindMap.find({ user_id: existing._id });
    for (const m of maps) {
      await Node.deleteMany({ mindmap_id: m._id });
      await Connection.deleteMany({ mindmap_id: m._id });
    }
    await MindMap.deleteMany({ user_id: existing._id });
    await User.deleteOne({ _id: existing._id });
    console.log('Cleared previous seed data');
  }

  // ─── User ──────────────────────────────────────────────────────────────────
  const salt = await bcrypt.genSalt(10);
  const user = await User.create({
    username: 'demo',
    email:    'demo@thoughtcatcher.dev',
    password: await bcrypt.hash('Demo1234!', salt),
  });

  // ─── MindMap ───────────────────────────────────────────────────────────────
  const map = await MindMap.create({
    title:       'Innovation Hub',
    description: 'A connected view of modern business innovation across technology, strategy, people, and market.',
    user_id:     user._id,
    is_public:   true,
    canvas_settings: { zoom: 0.7, pan_x: 0, pan_y: 0 },
  });
  const mid = map._id;
  const CX = 1000, CY = 700;

  // ─── Level 0: Root ─────────────────────────────────────────────────────────
  const root = await Node.create({
    mindmap_id:   mid,
    text:         'Innovation Hub',
    position:     { x: CX, y: CY },
    styling:      { color: '#6366f1', shape: 'circle', width: 150, height: 150 },
    level:        0,
    thought_type: 'idea',
    description:  'Central hub connecting all pillars of modern business innovation.',
    tags:         ['innovation', 'strategy', 'vision'],
  });

  // ─── Level 1: 4 pillars ────────────────────────────────────────────────────
  const L1_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
  const l1Labels  = ['Technology', 'Strategy', 'People', 'Market'];
  const l1Descs   = [
    'Digital tools and platforms driving competitive advantage.',
    'Long-term planning, risk management, and revenue growth.',
    'Talent, culture, and leadership that power the organization.',
    'Understanding customers, competition, and brand positioning.',
  ];
  const l1Tags = [
    ['ai', 'cloud', 'ux'],
    ['growth', 'risk', 'revenue'],
    ['talent', 'culture', 'leadership'],
    ['customers', 'brand', 'research'],
  ];
  const l1Pos     = radial(CX, CY, 520, 4);
  const l1 = [];
  for (let i = 0; i < 4; i++) {
    l1.push(await Node.create({
      mindmap_id:   mid,
      text:         l1Labels[i],
      position:     l1Pos[i],
      styling:      { color: L1_COLORS[i], shape: 'rounded', width: 130, height: 52 },
      parent_id:    root._id,
      level:        1,
      thought_type: 'idea',
      description:  l1Descs[i],
      tags:         l1Tags[i],
    }));
  }

  // ─── Level 2: 3 children per L1 ───────────────────────────────────────────
  const l2Labels = [
    // Technology
    ['AI & Machine Learning', 'Cloud Infrastructure', 'UX Design'],
    // Strategy
    ['Growth Planning', 'Risk Management', 'Revenue Model'],
    // People
    ['Talent Acquisition', 'Culture & Values', 'Leadership Dev'],
    // Market
    ['Customer Research', 'Competitive Analysis', 'Brand Identity'],
  ];
  const L2_COLORS = ['#7c3aed', '#d97706', '#059669', '#2563eb'];

  // Spread L2 nodes away from the canvas centre so they don't overlap
  const L1_ANGLES = [0, 1, 2, 3].map(i => -Math.PI / 2 + (i * 2 * Math.PI) / 4);
  const l2 = [[], [], [], []];
  for (let i = 0; i < 4; i++) {
    const parentAngle = L1_ANGLES[i];
    const positions   = [-Math.PI / 3, 0, Math.PI / 3].map(offset => {
      const a = parentAngle + offset;
      return { x: Math.round(l1Pos[i].x + 320 * Math.cos(a)), y: Math.round(l1Pos[i].y + 320 * Math.sin(a)) };
    });
    for (let j = 0; j < 3; j++) {
      l2[i].push(await Node.create({
        mindmap_id: mid,
        text:       l2Labels[i][j],
        position:   positions[j],
        styling:    { color: L2_COLORS[i], shape: 'rounded', width: 140, height: 46 },
        parent_id:  l1[i]._id,
        level: 2,
      }));
    }
  }

  // ─── Level 3: 2 children per L2 ───────────────────────────────────────────
  const l3Labels = [
    // Under AI & ML
    ['ML Model Training',    'Data Pipeline'],
    // Under Cloud Infrastructure
    ['Scalability Planning', 'Cost Optimisation'],
    // Under UX Design
    ['User Research',        'Prototyping'],
    // Under Growth Planning
    ['Market Expansion',     'KPI Tracking'],
    // Under Risk Management
    ['Mitigation Strategies','Compliance'],
    // Under Revenue Model
    ['Subscription Tiers',   'Enterprise Sales'],
    // Under Talent Acquisition
    ['Hiring Pipeline',      'Onboarding Process'],
    // Under Culture & Values
    ['Team Rituals',         'Diversity & Inclusion'],
    // Under Leadership Dev
    ['Mentorship Programs',  'Executive Coaching'],
    // Under Customer Research
    ['User Interviews',      'Survey Design'],
    // Under Competitive Analysis
    ['SWOT Analysis',        'Feature Benchmarking'],
    // Under Brand Identity
    ['Visual Language',      'Messaging Framework'],
  ];

  const l3 = [];
  let labelIdx = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      const parent      = l2[i][j];
      const parentAngle = L1_ANGLES[i] + (j - 1) * 0.45;
      const positions   = radial(parent.position.x, parent.position.y, 220, 2, parentAngle - Math.PI / 4);
      const pair = [];
      for (let k = 0; k < 2; k++) {
        pair.push(await Node.create({
          mindmap_id: mid,
          text:       l3Labels[labelIdx][k],
          position:   positions[k],
          styling:    { color: '#06b6d4', shape: 'rounded', width: 140, height: 42 },
          parent_id:  parent._id,
          level: 3,
        }));
      }
      l3.push(pair);
      labelIdx++;
    }
  }

  // ─── Level 4: 2 children for 4 selected L3 nodes ──────────────────────────
  // l3[0][0] = ML Model Training
  // l3[0][1] = Data Pipeline
  // l3[3][0] = Market Expansion
  // l3[3][1] = KPI Tracking
  const l4Labels = [
    ['Feature Engineering',  'Model Evaluation'],
    ['ETL Processes',        'Real-time Streaming'],
    ['International Markets','Product Localisation'],
    ['Dashboard Design',     'Metrics Definition'],
  ];
  const l4Parents = [l3[0][0], l3[0][1], l3[3][0], l3[3][1]];
  const l4 = [];
  for (let i = 0; i < 4; i++) {
    const parent    = l4Parents[i];
    const positions = radial(parent.position.x, parent.position.y, 190, 2, 0);
    const pair = [];
    for (let k = 0; k < 2; k++) {
      pair.push(await Node.create({
        mindmap_id: mid,
        text:       l4Labels[i][k],
        position:   positions[k],
        styling:    { color: '#84cc16', shape: 'rounded', width: 140, height: 42 },
        parent_id:  parent._id,
        level: 4,
      }));
    }
    l4.push(pair);
  }

  // ─── Connections: parent-child ─────────────────────────────────────────────
  // Root → L1
  for (const n of l1) await link(mid, root, n);

  // L1 → L2
  for (let i = 0; i < 4; i++)
    for (const n of l2[i]) await link(mid, l1[i], n);

  // L2 → L3
  for (let i = 0; i < l2.flat().length; i++)
    for (const n of l3[i]) await link(mid, l2.flat()[i], n);

  // L3 → L4
  for (let i = 0; i < 4; i++)
    for (const n of l4[i]) await link(mid, l4Parents[i], n);

  // ─── Connections: cross-branch (manual) ────────────────────────────────────
  const AMBER  = '#f59e0b';
  const PURPLE = '#a855f7';
  const ORANGE = '#f97316';
  const RED    = '#ef4444';
  const GREEN  = '#10b981';
  const SLATE  = '#64748b';

  // Tech ↔ Market: UX Design ↔ Customer Research
  await link(mid, l2[0][2], l2[3][0], 'manual', 'dashed', AMBER);

  // UX Research ↔ User Interviews (L3)
  await link(mid, l3[2][0], l3[9][0], 'manual', 'dashed', AMBER);
  // Prototyping ↔ Survey Design (L3)
  await link(mid, l3[2][1], l3[9][1], 'manual', 'dashed', AMBER);

  // ML Model Training ↔ Scalability Planning (Tech internal, L3)
  await link(mid, l3[0][0], l3[1][0], 'manual', 'dashed', PURPLE);
  // Data Pipeline ↔ Cost Optimisation
  await link(mid, l3[0][1], l3[1][1], 'manual', 'dashed', PURPLE);

  // Compliance ↔ Mitigation Strategies (Strategy internal)
  await link(mid, l3[4][1], l3[4][0], 'manual', 'dotted', RED);

  // Enterprise Sales ↔ Market Expansion (Strategy ↔ Market, L3)
  await link(mid, l3[5][1], l3[3][0], 'manual', 'dashed', ORANGE);

  // Hiring Pipeline ↔ Onboarding (People internal, L3)
  await link(mid, l3[6][0], l3[6][1], 'manual', 'dotted', GREEN);
  // Mentorship Programs ↔ Diversity & Inclusion (People cross, L3)
  await link(mid, l3[8][0], l3[7][1], 'manual', 'dashed', GREEN);

  // SWOT Analysis ↔ Mitigation Strategies (Market ↔ Strategy, L3)
  await link(mid, l3[10][0], l3[4][0], 'manual', 'dashed', ORANGE);

  // Feature Engineering ↔ ETL Processes (L4 cross)
  await link(mid, l4[0][0], l4[1][0], 'manual', 'dashed', SLATE);
  // Dashboard Design ↔ Metrics Definition (L4 siblings)
  await link(mid, l4[2][0], l4[3][1], 'manual', 'dashed', SLATE);
  // Model Evaluation ↔ KPI Tracking (L4 ↔ L3)
  await link(mid, l4[0][1], l3[3][1], 'manual', 'dotted', SLATE);

  // ─── Summary ───────────────────────────────────────────────────────────────
  const nodeCount = await Node.countDocuments({ mindmap_id: mid });
  const connCount = await Connection.countDocuments({ mindmap_id: mid });

  console.log('\n✓ Seed complete');
  console.log(`  MindMap:     "${map.title}" (${mid})`);
  console.log(`  Nodes:       ${nodeCount}`);
  console.log(`  Connections: ${connCount}`);
  console.log(`  Login:       demo@thoughtcatcher.dev / Demo1234!`);

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
