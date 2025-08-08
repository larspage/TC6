const logger = require('./config/logger');

// Test different log levels
logger.info('=== LOGGING TEST START ===');
logger.debug('This is a debug message with details', { 
  userId: 'test123', 
  action: 'test_logging',
  timestamp: new Date().toISOString()
});

logger.info('This is an info message');
logger.warn('This is a warning message', { 
  warning: 'Test warning',
  component: 'logging-test'
});

logger.error('This is an error message', { 
  error: 'Test error',
  stack: 'Simulated stack trace',
  component: 'logging-test'
});

logger.info('=== LOGGING TEST END ===');

console.log('Logging test completed. Check the logs directory for output files.');
console.log('Log files should be in: c:\\Repos\\TC6\\logs\\');
