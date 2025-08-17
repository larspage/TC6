const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

// @route   GET /api/logs
// @desc    Get recent log entries
// @access  Public (should be protected in production)
router.get('/', (req, res) => {
  try {
    const { level = 'all', limit = 100 } = req.query;
    
    logger.info('Log retrieval requested', { level, limit });
    
    // Get the most recent log file
    const logsDir = path.join(__dirname, '../../logs');
    
    if (!fs.existsSync(logsDir)) {
      return res.status(404).json({
        success: false,
        message: 'Logs directory not found'
      });
    }
    
    // Get all log files and sort by modification time
    const logFiles = fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.log'))
      .map(file => ({
        name: file,
        path: path.join(logsDir, file),
        mtime: fs.statSync(path.join(logsDir, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);
    
    if (logFiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No log files found'
      });
    }
    
    // Read the most recent log file
    const mostRecentLog = logFiles[0];
    const logContent = fs.readFileSync(mostRecentLog.path, 'utf8');
    
    // Parse log entries (assuming JSON format)
    const logLines = logContent.split('\n')
      .filter(line => line.trim())
      .slice(-parseInt(limit));
    
    const logEntries = [];
    logLines.forEach(line => {
      try {
        const entry = JSON.parse(line);
        if (level === 'all' || entry.level === level) {
          logEntries.push(entry);
        }
      } catch (parseErr) {
        // If not JSON, treat as plain text
        logEntries.push({
          level: 'info',
          message: line,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    res.json({
      success: true,
      data: {
        entries: logEntries,
        totalFiles: logFiles.length,
        currentFile: mostRecentLog.name,
        availableLevels: ['error', 'warn', 'info', 'debug']
      }
    });
    
  } catch (error) {
    logger.error('Error retrieving logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve logs',
      error: error.message
    });
  }
});

// @route   GET /api/logs/files
// @desc    Get list of available log files
// @access  Public (should be protected in production)
router.get('/files', (req, res) => {
  try {
    const logsDir = path.join(__dirname, '../../logs');
    
    if (!fs.existsSync(logsDir)) {
      return res.status(404).json({
        success: false,
        message: 'Logs directory not found'
      });
    }
    
    const logFiles = fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.log'))
      .map(file => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime,
          created: stats.birthtime
        };
      })
      .sort((a, b) => b.modified - a.modified);
    
    res.json({
      success: true,
      data: {
        files: logFiles,
        directory: logsDir
      }
    });
    
  } catch (error) {
    logger.error('Error listing log files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list log files',
      error: error.message
    });
  }
});

// @route   DELETE /api/logs
// @desc    Clear old log files (keep most recent)
// @access  Public (should be protected in production)
router.delete('/', (req, res) => {
  try {
    const { keepCount = 5 } = req.body;
    const logsDir = path.join(__dirname, '../../logs');
    
    if (!fs.existsSync(logsDir)) {
      return res.status(404).json({
        success: false,
        message: 'Logs directory not found'
      });
    }
    
    const logFiles = fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.log'))
      .map(file => ({
        name: file,
        path: path.join(logsDir, file),
        mtime: fs.statSync(path.join(logsDir, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);
    
    // Keep the most recent files, delete the rest
    const filesToDelete = logFiles.slice(parseInt(keepCount));
    let deletedCount = 0;
    
    filesToDelete.forEach(file => {
      try {
        fs.unlinkSync(file.path);
        deletedCount++;
        logger.info(`Deleted old log file: ${file.name}`);
      } catch (deleteErr) {
        logger.error(`Failed to delete log file ${file.name}:`, deleteErr);
      }
    });
    
    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} old log files`,
      data: {
        deleted: deletedCount,
        kept: logFiles.length - deletedCount
      }
    });
    
  } catch (error) {
    logger.error('Error cleaning up logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clean up logs',
      error: error.message
    });
  }
});

module.exports = router;
