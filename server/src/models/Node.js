const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NodeSchema = new Schema({
  mindmap_id: {
    type: Schema.Types.ObjectId,
    ref: 'MindMap',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Node title is required'],
    minlength: [1, 'Node title must be at least 1 character long'],
    maxlength: [500, 'Node title cannot be more than 500 characters long'],
    trim: true,
  },
  position: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    }
  },
  styling: {
    color: {
      type: String
    },
    shape: {
      type: String,
      enum: ['rectangle', 'circle', 'rounded']
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    }
  },
  parent_id: {
    type: Schema.Types.ObjectId,
    ref: 'Node'
  },
  level: {
    type: Number,
    default: 0
  },
  thought_type: {
    type: String,
    enum: ['idea', 'task', 'note', 'question'],
    default: 'idea',
  },
  type_data: {
    type: Schema.Types.Mixed,
    default: {},
  },
  description: {
    type: String,
    default: '',
    maxlength: 2000,
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  // ── Task fields (canonical doc: task) ────────────────────────────────────
  due_date: {
    type: Date,
    default: null,
  },
  task_status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending',
  },
  review_marker: {
    type: Boolean,
    default: false,
  },
  // ── Privacy tier (canonical doc: data tiers) ─────────────────────────────
  privacy_tier: {
    type: Number,
    enum: [1, 2, 3],
    default: 1,
  },
  // ── Soft-delete (canonical doc: soft-delete state) ────────────────────────
  is_deleted: {
    type: Boolean,
    default: false,
  },
  deleted_at: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

NodeSchema.index({ mindmap_id: 1 });
NodeSchema.index({ mindmap_id: 1, parent_id: 1 });
NodeSchema.index({ mindmap_id: 1, is_deleted: 1 });
NodeSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { weights: { title: 10, description: 1 }, default_language: 'english' }
);
NodeSchema.index({ due_date: 1 });
NodeSchema.index({ task_status: 1 });

module.exports = mongoose.model('Node', NodeSchema);