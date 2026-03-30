module.exports = {
  apps: [{
    name: 'tc6',
    script: 'server/index.js',
    cwd: '/var/www/tc6',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    }
  }]
}
