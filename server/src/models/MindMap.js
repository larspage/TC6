const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MindMapSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: [1, 'Title must be at least 1 character long'],
    maxlength: [100, 'Title cannot be more than 100 characters long']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters long']
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  is_public: {
    type: Boolean,
    default: false
  },
  canvas_settings: {
    zoom: {
      type: Number,
      default: 1
    },
    pan_x: {
      type: Number,
      default: 0
    },
    pan_y: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

MindMapSchema.index({ user_id: 1 });

module.exports = mongoose.model('MindMap', MindMapSchema);