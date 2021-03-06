import fetch from 'node-fetch';
import { exec } from 'child_process';
import os from 'os';
import fs from 'fs';

require('daemon')({
  cwd: process.cwd(),
  stdout: 'inherit',
  stderr: 'inherit',
});

const homePath = process.env.HOME;

/* eslint no-await-in-loop: 0 */
/* eslint no-restricted-syntax: 0 */
/* eslint guard-for-in: 0 */

console.log(`${process.pid} process start at ${new Date()}`);

const domain = process.env.controlServer || 'http://localhost:9999';

const allService = {};
const jhead = { 'Content-Type': 'application/json' };

const hostname = process.env.agentName || os.hostname();

async function doPoll() {
  const info = {
    hostname,
    platform: os.platform(),
    service: {
      ...allService,
    },
  };

  const json = await fetch(`${domain}/pollVersion`, {
    method: 'post',
    body: JSON.stringify(info),
    headers: jhead,
  }).then(res => res.json());

  if (json.data) {
    for (const serviceName in json.data) {
      const newService = json.data[serviceName];
      const curVersion = (allService[serviceName] || {}).version;

      if (curVersion !== newService.version) {
        let log = {};
        const scriptPath = `${homePath}/tmp/${serviceName}_${Date.now()}.sh`;
        fs.writeFileSync(scriptPath, newService.script);
        fs.chmodSync(scriptPath, 0o755);

        await new Promise((resolve) => {
          exec(scriptPath, (error, stdout, stderr) => {
            console.log('Exit code:', error);
            console.log('Program output:', stdout);
            console.log('Program stderr:', stderr);

            log = {
              stdout,
              stderr,
              error,
            };

            allService[serviceName] = {
              version: newService.version,
            };
            resolve();
          });
        });


        await fetch(`${domain}/updateLog`, {
          method: 'post',
          body: JSON.stringify({
            log,
            serviceName,
            hostname,
          }),
          headers: jhead,
        });
      }
    }
  }
}


function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

async function start() {
  while (true) {
    try {
      await doPoll(allService);
    } catch (e) {
      console.log(e);
    }
    await wait(5000);
  }
}


start();
