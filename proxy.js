const TCPProxy = require('./tcpProxy');
const http = require('http');
const co = require('co');
const exec = require('child_process').exec;
const proxy = new TCPProxy({ port: 9229 });
let wsId;

module.exports = port => {
  const forwardHost = 'localhost';
  const forwardPort = port;

  // 保证服务已经启动
  setTimeout(() => {
    exec(`curl http://${forwardHost}:${forwardPort}/json`, (err, stdout) => {
      const data = JSON.parse(stdout);
      wsId = data[0].id;
    });
  }, 100);

  proxy.removeAllListeners('connection');

  proxy.start({
    forwardHost, // optional, defaults to localhost
    forwardPort,
    clientThrough: function(chunk, enc, done) {
      let content = chunk.toString();
      if (wsId && content.startsWith('GET')) {
        // 替换 websocket id
        content = content.replace(
          /(^GET \/)[\w-]{36}( HTTP)/,
          (all, l, r) => l + wsId + r
        );
        done(null, Buffer.from(content));
      } else {
        done(null, chunk);
      }
    },
  });
};