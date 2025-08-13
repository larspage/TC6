const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Thought Schema
 * ----------------
 * Represents an individual "thought" (idea/task/note/etc.) attached to a user (and optionally a mind-map).
 * This is the fundamental unit that will be created/edited via the upcoming Thought edit form
 * and persisted by the new auto-save mechanism.
 */
const ThoughtSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mindmap_id: {
      type: Schema.Types.ObjectId,
      ref: 'MindMap',
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Thought title is required'],
      minlength: [1, 'Title must be at least 1 character long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['idea', 'task', 'note', 'question'],
      default: 'idea',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    color: {
      type: String,
      default: '#007bff',
    },
  },
  { timestamps: true },
);

// Full-text search indexes for quick lookup.
ThoughtSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Thought', ThoughtSchema);
