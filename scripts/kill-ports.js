const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

const START_PORT = 3670;
const END_PORT = 3690;

async function findProcessOnPort(port) {
  try {
    const { stdout } = await execPromise(`netstat -ano | findstr :${port}`);
    if (!stdout) return null;

    const lines = stdout.trim().split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 4 && parts[1].endsWith(`:${port}`)) {
        const pid = parts[parts.length - 1];
        if (pid !== '0') {
            console.log(`Found process with PID ${pid} on port ${port}.`);
            return pid;
        }
      }
    }
  } catch (error) {
    // netstat returns an error if no process is found, so we can ignore it.
  }
  return null;
}

async function killProcess(pid) {
  if (!pid) return;
  try {
    await execPromise(`taskkill /PID ${pid} /F`);
    console.log(`Successfully terminated process with PID ${pid}.`);
  } catch (error) {
    console.error(`Failed to terminate process with PID ${pid}:`, error.message);
  }
}

async function killPortRange() {
  console.log(`Scanning ports ${START_PORT} to ${END_PORT}...`);
  for (let port = START_PORT; port <= END_PORT; port++) {
    const pid = await findProcessOnPort(port);
    if (pid) {
      await killProcess(pid);
    }
  }
  console.log('Finished cleaning ports.');
}

killPortRange();
