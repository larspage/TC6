const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Node = require('../../src/models/Node');
const MindMap = require('../../src/models/MindMap');

// @route   GET api/nodes/:mindmap_id
// @desc    Get all nodes for a specific mind map
// @access  Private
router.get('/:mindmap_id', auth, async (req, res) => {
  try {
    const mindMap = await MindMap.findById(req.params.mindmap_id);

    if (!mindMap) {
      return res.status(404).json({ msg: 'Mind map not found' });
    }

    // Check user ownership
    if (mindMap.user_id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const nodes = await Node.find({ mindmap_id: req.params.mindmap_id }).sort({ created_at: 1 });
    res.json(nodes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Mind map not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/nodes
// @desc    Create a new node in a mind map
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('mindmap_id', 'Mind map ID is required').not().isEmpty(),
      check('text', 'Node text is required').not().isEmpty(),
      check('text', 'Node text must be between 1 and 500 characters').isLength({ min: 1, max: 500 }),
      check('position.x', 'Position X is required').isNumeric(),
      check('position.y', 'Position Y is required').isNumeric()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mindmap_id, text, position, styling, parent_id } = req.body;

    try {
      const mindMap = await MindMap.findById(mindmap_id);
      if (!mindMap) {
        return res.status(404).json({ msg: 'Mind map not found' });
      }

      // Check user ownership
      if (mindMap.user_id.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      const newNode = new Node({
        mindmap_id,
        text,
        position,
        styling,
        parent_id
      });

      const node = await newNode.save();
      res.json(node);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/nodes/:id
// @desc    Update a node
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('text', 'Node text must be between 1 and 500 characters').optional().isLength({ min: 1, max: 500 }),
      check('position.x', 'Position X must be numeric').optional().isNumeric(),
      check('position.y', 'Position Y must be numeric').optional().isNumeric()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, position, styling } = req.body;

    // Build node object
    const nodeFields = {};
    if (text) nodeFields.text = text;
    if (position) nodeFields.position = position;
    if (styling) nodeFields.styling = styling;
    nodeFields.updated_at = Date.now();

    try {
      let node = await Node.findById(req.params.id);

      if (!node) return res.status(404).json({ msg: 'Node not found' });

      const mindMap = await MindMap.findById(node.mindmap_id);

      // Check user ownership of the mind map the node belongs to
      if (mindMap.user_id.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      node = await Node.findByIdAndUpdate(
        req.params.id,
        { $set: nodeFields },
        { new: true }
      );

      res.json(node);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Node not found' });
      }
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/nodes/:id
// @desc    Delete a node and its children
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const node = await Node.findById(req.params.id);

    if (!node) {
      return res.status(404).json({ msg: 'Node not found' });
    }

    const mindMap = await MindMap.findById(node.mindmap_id);

    // Check user ownership of the mind map the node belongs to
    if (mindMap.user_id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Recursively delete child nodes
    const deleteChildren = async (parentId) => {
      const children = await Node.find({ parent_id: parentId });
      for (const child of children) {
        await deleteChildren(child._id);
        await Node.findByIdAndDelete(child._id);
      }
    };

    await deleteChildren(req.params.id);
    await Node.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Node and its children removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Node not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;