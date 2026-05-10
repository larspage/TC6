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
    enum: [
      // Structure
      'parent-child', 'related', 'part_of',
      // Causality & Logic
      'causes', 'supports', 'contradicts', 'questions',
      // Sequence & Dependency
      'precedes', 'depends_on', 'blocks',
      // Semantic
      'similar', 'opposite', 'expands_on', 'references',
      // Meta
      'duplicate', 'mention',
    ],
    default: 'related'
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