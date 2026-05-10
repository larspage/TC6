const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConnectionSchema = new Schema({
  mindmap_id: {
    type: Schema.Types.ObjectId,
    ref: 'MindMap',
    required: true
  },
  from_node_id: {
    type: Schema.Types.ObjectId,
    ref: 'Node',
    required: true
  },
  to_node_id: {
    type: Schema.Types.ObjectId,
    ref: 'Node',
    required: true
  },
  connection_type: {
    type: String,
    enum: ['parent-child', 'manual', 'mention'],
    default: 'manual'
  },
  styling: {
    color: {
      type: String
    },
    width: {
      type: Number
    },
    style: {
      type: String,
      enum: ['solid', 'dashed', 'dotted']
    }
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

ConnectionSchema.index({ mindmap_id: 1 });
ConnectionSchema.index({ mindmap_id: 1, is_deleted: 1 });

module.exports = mongoose.model('Connection', ConnectionSchema);