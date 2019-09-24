require('daemon')({
  cwd: process.cwd(),
  stdout: 'inherit',
  stderr: 'inherit'
});
console.log(`${process.pid} process start at ${new Date()}`);

const fetch = require('node-fetch');
const shelljs = require('shelljs');
const os = require('os')
const domain = process.env.controlServer || 'http://localhost:9999';

const allService = {};
const jhead = { 'Content-Type': 'application/json' };

const hostname = process.env.agentName || os.hostname();

async function doPoll() {
    const info = {
        hostname,
        platform: os.platform(),
        service: {
            ...allService
        },
    };

    const json = await fetch(domain + `/pollVersion`, {
        method: 'post',
        body: JSON.stringify(info),
        headers: jhead
    }).then(res => res.json());

    if (json.data) {
        for (let serviceName in json.data) {
            const newService = json.data[serviceName];
            const { curVersion } = allService[serviceName] || {};

            if (curVersion !== newService.version) {
                let log = {};
                await new Promise((resolve) => {
                    shelljs.exec(newService.script, function (code, stdout, stderr) {
                        console.log('Exit code:', code);
                        console.log('Program output:', stdout);
                        console.log('Program stderr:', stderr);

                        log = {
                            stdout,
                            stderr,
                            code,
                        }

                        allService[serviceName] = {
                            version: newService.version,
                        };
                        resolve();
                    });
                });


                await fetch(domain + '/updateLog', {
                    method: 'post',
                    body: JSON.stringify({
                        log,
                        serviceName,
                        hostname
                    }),
                    headers: jhead
                });
            }
        }
    }
}


function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms)
    })
}

async function start() {
    while (true) {
        try {
            console.log('asdadasd')
            await doPoll(allService);
        } catch (e) {
            console.log(e);
        }
        await wait(5000)
    }
}


start();