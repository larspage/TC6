const express = require('express');
const router = express.Router();
const { logClientError } = require('../controllers/logsController');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/logs/error
 * @desc    Log client-side errors
 * @access  Private (but works without auth for critical errors)
 */
router.post('/error', auth.optional, logClientError);

module.exports = router;
