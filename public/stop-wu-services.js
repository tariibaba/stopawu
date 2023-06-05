/* eslint-disable no-constant-condition */
const { exec } = require('child_process');

const services = ['wuauserv', 'bits', 'dosvc'];

const stopCommand = 'net stop';

let interval = undefined;
let startInterval = false;

async function stopServices() {
  let didAlreadyStop = true;
  await new Promise((resolve) => {
    let executedCount = 0;
    services.forEach((service) => {
      exec(`${stopCommand} ${service}`, (error, stdout, stderr) => {
        const isLast = executedCount === services.length - 1;
        if (error) {
          const message = `Error stopping ${service}: ${error.message}`;
          console.error(message);
          didAlreadyStop = message.includes('service is not started');
          if (isLast) {
            resolve();
          }
          executedCount++;
          return;
        }
        if (stderr) {
          const message = `Error stopping ${service} (stderr): ${stderr}`;
          console.error(message);
          didAlreadyStop = message.includes('service is not started');
          if (isLast) {
            resolve();
          }
          executedCount++;
          return;
        }
        console.log(`Stopped ${service}: ${stdout}`);
        didAlreadyStop = false;
        resolve();
      });
    });
  });
  return didAlreadyStop;
}

async function startServiceStopInterval(params) {
  const { onTryDidStop } = params;
  let intervalTime = 60000;
  startInterval = true;
  while (true) {
    if (!startInterval) {
      break;
    }
    const didAlreadyStop = await stopServices();
    if (onTryDidStop) {
      onTryDidStop({ didAlreadyStop });
    }
    intervalTime = didAlreadyStop ? 5000 : 5000;
    await new Promise((resolve) => setTimeout(resolve, intervalTime));
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
