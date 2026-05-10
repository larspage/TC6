/**
 * Attachment Schema — canonical doc: attachment
 * --------------------
 * File metadata for attachments referenced by notes or blocks.
 * The actual file bytes are stored in a storage layer (S3, local disk, etc.)
 * and referenced via storage_path. hash is the SHA-256 of the file for
 * integrity verification. This model is not encrypted by default; sensitive
 * files should be stored in encrypted storage buckets.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttachmentSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  node_id: {
    type: Schema.Types.ObjectId,
    ref: 'Node',
    default: null,
  },
  block_id: {
    type: Schema.Types.ObjectId,
    ref: 'Block',
    default: null,
  },
  filename: {
    type: String,
    required: true,
    maxlength: [500, 'Filename cannot exceed 500 characters'],
  },
  mime_type: {
    type: String,
    default: 'application/octet-stream',
  },
  storage_path: {
    type: String,
    required: true,
  },
  size_bytes: {
    type: Number,
    default: 0,
  },
  hash_sha256: {
    type: String,
    default: null,
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

AttachmentSchema.index({ user_id: 1, is_deleted: 1 });
AttachmentSchema.index({ node_id: 1 });
AttachmentSchema.index({ block_id: 1 });

module.exports = mongoose.model('Attachment', AttachmentSchema);