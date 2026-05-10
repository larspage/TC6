/**
 * Block Schema — canonical doc: block
 * --------------------
 * Atomic content unit for rich note content. A note is composed of ordered blocks.
 * Supports transclusion (referenced from other notes) and wiki-style linking.
 * Blocks are never stored on the server in plaintext when E2E encryption is active;
 * the client encrypts before sending and decrypts on receive.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlockSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // ── Note / node linkage ──────────────────────────────────────────────────
  node_id: {
    type: Schema.Types.ObjectId,
    ref: 'Node',
    default: null,    // null means this block stands alone (standalone note)
  },
  // ── Content ──────────────────────────────────────────────────────────────
  content: {
    type: String,
    default: '',
    maxlength: [50000, 'Block content cannot exceed 50000 characters'],
    trim: true,
  },
  block_type: {
    type: String,
    enum: ['text', 'code', 'image', 'callout', 'quote'],
    default: 'text',
  },
  // ── Ordering ─────────────────────────────────────────────────────────────
  order: {
    type: Number,
    default: 0,
  },
  // ── Source / transclusion ───────────────────────────────────────────────
  source_id: {
    type: Schema.Types.ObjectId,
    ref: 'Block',
    default: null,   // non-null means this is a transclusion of another block
  },
  // ── Privacy tier ─────────────────────────────────────────────────────────
  privacy_tier: {
    type: Number,
    enum: [1, 2, 3],
    default: 1,
  },
  // ── Soft-delete ──────────────────────────────────────────────────────────
  is_deleted: {
    type: Boolean,
    default: false,
  },
  deleted_at: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

BlockSchema.index({ user_id: 1, is_deleted: 1 });
BlockSchema.index({ node_id: 1 });
BlockSchema.index({ user_id: 1, block_type: 1 });
BlockSchema.index({ content: 'text' });

module.exports = mongoose.model('Block', BlockSchema);