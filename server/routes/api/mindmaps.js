const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const MindMap = require('../../src/models/MindMap');
const User = require('../../src/models/User');

// @route   GET api/mindmaps
// @desc    Get all mind maps for authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const mindMaps = await MindMap.find({ user_id: req.user.id }).sort({ updated_at: -1 });
    res.json(mindMaps);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/mindmaps
// @desc    Create a new mind map
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('title', 'Title must be between 1 and 100 characters').isLength({ min: 1, max: 100 }),
      check('description', 'Description cannot be more than 500 characters').isLength({ max: 500 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, is_public } = req.body;

    try {
      const newMindMap = new MindMap({
        title,
        description,
        user_id: req.user.id,
        is_public
      });

      const mindMap = await newMindMap.save();
      res.json(mindMap);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/mindmaps/:id
// @desc    Get mind map by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const mindMap = await MindMap.findById(req.params.id);

    if (!mindMap) {
      return res.status(404).json({ msg: 'Mind map not found' });
    }

    // Check user ownership
    if (mindMap.user_id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(mindMap);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Mind map not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/mindmaps/:id
// @desc    Update a mind map
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('title', 'Title must be between 1 and 100 characters').optional().isLength({ min: 1, max: 100 }),
      check('description', 'Description cannot be more than 500 characters').optional().isLength({ max: 500 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, is_public, canvas_settings } = req.body;

    // Build mind map object
    const mindMapFields = {};
    if (title) mindMapFields.title = title;
    if (description) mindMapFields.description = description;
    if (typeof is_public === 'boolean') mindMapFields.is_public = is_public;
    if (canvas_settings) mindMapFields.canvas_settings = canvas_settings;
    mindMapFields.updated_at = Date.now();

    try {
      let mindMap = await MindMap.findById(req.params.id);

      if (!mindMap) return res.status(404).json({ msg: 'Mind map not found' });

      // Check user ownership
      if (mindMap.user_id.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      mindMap = await MindMap.findByIdAndUpdate(
        req.params.id,
        { $set: mindMapFields },
        { new: true }
      );

      res.json(mindMap);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Mind map not found' });
      }
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/mindmaps/:id
// @desc    Delete a mind map
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const mindMap = await MindMap.findById(req.params.id);

    if (!mindMap) {
      return res.status(404).json({ msg: 'Mind map not found' });
    }

    // Check user ownership
    if (mindMap.user_id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await MindMap.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Mind map removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Mind map not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;