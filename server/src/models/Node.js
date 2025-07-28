const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NodeSchema = new Schema({
  mindmap_id: {
    type: Schema.Types.ObjectId,
    ref: 'MindMap',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Node text is required'],
    minlength: [1, 'Node text must be at least 1 character long'],
    maxlength: [500, 'Node text cannot be more than 500 characters long']
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
  }
}, { timestamps: true });

NodeSchema.index({ mindmap_id: 1 });
NodeSchema.index({ mindmap_id: 1, parent_id: 1 });

module.exports = mongoose.model('Node', NodeSchema);