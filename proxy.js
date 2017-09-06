const TCPProxy = require('./tcpProxy');
const proxy = new TCPProxy({ port: 9229 });

module.exports = port => {
  proxy.removeAllListeners('connection');
  proxy.start({
    forwardHost: 'localhost', // optional, defaults to localhost
    forwardPort: port,
  });

  proxy.on('connection', () => {
    console.log('connect!!');
  });

  return proxy;
};