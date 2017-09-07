const TCPProxy = require('./tcpProxy');
const http = require('http');
const co = require('co');
const exec = require('child_process').exec;
const opn = require('opn');
const proxyPort = 9229;
const proxy = new TCPProxy({
  port: proxyPort,
});

let wsId;
let opened = false;

module.exports = port => {
  const forwardHost = 'localhost';
  const forwardPort = port;

  // delay 1s to make sure the inspect server was working
  setTimeout(() => {
    exec(`curl http://${forwardHost}:${forwardPort}/json`, (err, stdout) => {
      const data = JSON.parse(stdout)[0];
      wsId = data.id;

      if (!opened) {
        const frontUrl = data.devtoolsFrontendUrl.replace(
          `${forwardPort}/${wsId}`,
          `${proxyPort}\/${wsId}`
        );
        opened = true;
        opn(frontUrl, { app: 'google chrome' });
      }
    });
  }, 1000);

  // start proxy
  proxy.start({
    forwardHost, // optional, defaults to localhost
    forwardPort,
    interceptor: {
      client(chunk, enc) {
        if (
          !wsId ||
          chunk[0] !== 0x47 || // G
          chunk[1] !== 0x45 || // E
          chunk[2] !== 0x54 || // T
          chunk[3] !== 0x20 // space
        ) {
          return;
        }

        const content = chunk.toString();

        // check wether is websocket upgrade request
        if (
          !content.includes('HTTP') ||
          !content.includes('Connection: Upgrade\r\n') ||
          !content.includes('Upgrade: websocket\r\n')
        ) {
          return;
        }

        // replace websocket id to path
        return Buffer.from(content.replace(/(^GET \/)[\w-]+/, `$1${wsId}`));
      },
    },
  });
};