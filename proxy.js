const TCPProxy = require('./tcpProxy');
const proxy = new TCPProxy({ port: 9229 });

module.exports = port => {
  proxy.start({
    forwardHost: 'localhost', // optional, defaults to localhost
    forwardPort: port,
  });
};