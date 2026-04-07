#!/usr/bin/env node
// Kills any processes occupying our dev ports before startup.
// Works on Linux/macOS using lsof.

const { execSync } = require('child_process');

const PORTS = [3670, 3671];

for (const port of PORTS) {
  try {
    const pids = execSync(`lsof -ti:${port} 2>/dev/null`, { encoding: 'utf8' }).trim();
    if (!pids) continue;
    for (const pid of pids.split('\n').filter(Boolean)) {
      try {
        execSync(`kill -9 ${pid}`);
        console.log(`Killed PID ${pid} on port ${port}`);
      } catch {
        // already gone
      }
    }
  } catch {
    // lsof returns non-zero when no process found — that's fine
  }
}

console.log('Ports clear.');
