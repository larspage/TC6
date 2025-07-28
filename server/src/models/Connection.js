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
    enum: ['parent-child', 'manual'],
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
  }
}, { timestamps: true });

ConnectionSchema.index({ mindmap_id: 1 });

module.exports = mongoose.model('Connection', ConnectionSchema);