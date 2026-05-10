/**
 * DailyLog Schema — canonical doc: daily_log
 * --------------------
 * Daily journal / day-page entry. One entry per (user, date) pair.
 * Contains ordered blocks of content for that day.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DailyLogSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'low', 'rough', null],
    default: null,
  },
  tags: {
    type: [String],
    default: [],
  },
  // Rich content stored as ordered blocks
  blocks: [{
    type: Schema.Types.ObjectId,
    ref: 'Block',
  }],
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

// One entry per user per date
DailyLogSchema.index({ user_id: 1, date: 1 }, { unique: true });
DailyLogSchema.index({ user_id: 1, is_deleted: 1 });
DailyLogSchema.index({ user_id: 1, date: -1 });

module.exports = mongoose.model('DailyLog', DailyLogSchema);