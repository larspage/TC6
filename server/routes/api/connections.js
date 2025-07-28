const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Connection = require('../../src/models/Connection');
const MindMap = require('../../src/models/MindMap');

// @route   POST api/connections
// @desc    Create a new connection between two nodes
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('mindmap_id', 'Mind map ID is required').not().isEmpty(),
      check('from_node_id', 'From node ID is required').not().isEmpty(),
      check('to_node_id', 'To node ID is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mindmap_id, from_node_id, to_node_id, connection_type, styling } = req.body;

    try {
      const mindMap = await MindMap.findById(mindmap_id);
      if (!mindMap) {
        return res.status(404).json({ msg: 'Mind map not found' });
      }

      // Check user ownership
      if (mindMap.user_id.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      const newConnection = new Connection({
        mindmap_id,
        from_node_id,
        to_node_id,
        connection_type,
        styling
      });

      const connection = await newConnection.save();
      res.json(connection);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/connections/:id
// @desc    Update a connection's styling
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('styling', 'Styling object is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { styling } = req.body;

    try {
      let connection = await Connection.findById(req.params.id);

      if (!connection) return res.status(404).json({ msg: 'Connection not found' });

      const mindMap = await MindMap.findById(connection.mindmap_id);

      // Check user ownership
      if (mindMap.user_id.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      connection = await Connection.findByIdAndUpdate(
        req.params.id,
        { $set: { styling } },
        { new: true }
      );

      res.json(connection);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Connection not found' });
      }
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/connections/:id
// @desc    Delete a connection
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({ msg: 'Connection not found' });
    }

    const mindMap = await MindMap.findById(connection.mindmap_id);

    // Check user ownership
    if (mindMap.user_id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Connection.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Connection removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Connection not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;