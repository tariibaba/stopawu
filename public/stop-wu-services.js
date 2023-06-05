/* eslint-disable no-constant-condition */
const { exec } = require('child_process');

const services = ['wuauserv', 'bits', 'dosvc'];

const stopCommand = 'net stop';

let interval = undefined;
let startInterval = false;

async function stopServices() {
  await new Promise((resolve, reject) => {
    services.forEach((service) => {
      exec(`${stopCommand} ${service}`, (error, stdout, stderr) => {
        if (error) {
          const message = `Error stopping ${service}: ${error.message}`;
          console.error(message);
          reject({ message });
        }
        if (stderr) {
          const message = `Error stopping ${service}: ${stderr}`;
          console.error(message);
          reject({ message });
        }
        console.log(`Stopped ${service}: ${stdout}`);
        resolve();
      });
    });
  });
}

async function startServiceStopInterval() {
  console.log('startServiceStopInterval');
  stopServices();
  let intervalTime = 60000;
  startInterval = true;
  while (true) {
    if (!startInterval) {
      break;
    }
    console.log(`intervalTime: ${intervalTime}`);
    await new Promise((resolve) => setTimeout(resolve, intervalTime));
    try {
      await stopServices();
      intervalTime = 5000;
    } catch {
      intervalTime = 60000;
    }
  }
}

function endServiceStopInterval() {
  console.log('endServiceStopInterval');
  startInterval = false;
}

module.exports = {
  stopServices,
  startServiceStopInterval,
  endServiceStopInterval,
};
