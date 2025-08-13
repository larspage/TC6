const logger = require('../../config/logger');

/**
 * Handles client-side error logging
 */
exports.logClientError = async (req, res, next) => {
  try {
    const errorData = {
      ...req.body,
      // Add server-side context
      serverTimestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id || 'anonymous'
    };

    // Log to appropriate level based on error severity
    const logLevel = req.body.level || 'error';
    const logMessage = `Client ${logLevel}: ${errorData.message || 'Unknown error'}`;
    
    // Use the appropriate logger method based on level
    if (logger[logLevel]) {
      logger[logLevel](logMessage, errorData);
    } else {
      logger.error(logMessage, errorData);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error in logClientError:', error);
    next(error);
  }
};
