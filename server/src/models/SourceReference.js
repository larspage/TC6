/**
 * SourceReference Schema — canonical doc: source_reference
 * --------------------
 * Saved articles, web pages, or external sources with annotations.
 * The url is the canonical source; excerpt is a saved highlight/snippet.
 * Annotations are stored as Block references.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SourceReferenceSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  url: {
    type: String,
    required: true,
    maxlength: [2000, 'URL cannot exceed 2000 characters'],
  },
  title: {
    type: String,
    default: '',
    maxlength: [500, 'Title cannot exceed 500 characters'],
  },
  excerpt: {
    type: String,
    default: '',
    maxlength: [5000, 'Excerpt cannot exceed 5000 characters'],
  },
  // Annotation blocks for this source
  blocks: [{
    type: Schema.Types.ObjectId,
    ref: 'Block',
  }],
  tags: {
    type: [String],
    default: [],
  },
  favicon_url: {
    type: String,
    default: null,
  },
  domain: {
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

SourceReferenceSchema.index({ user_id: 1, is_deleted: 1 });
SourceReferenceSchema.index({ url: 1 });
SourceReferenceSchema.index({ user_id: 1, tags: 1 });

module.exports = mongoose.model('SourceReference', SourceReferenceSchema);