const tcpSpy = require('tcp-spy');

module.exports = () => {
  console.log('start proxy');
  const spy = tcpSpy({
    port: 9229,
    forwardHost: 'localhost', // optional, defaults to localhost
    forwardPort: 9999
  });

  // spy.on('connection', function (client, server) {
    // client.pipe(server);
    // client.pipe(process.stdout);
    // server.pipe(process.stdout);
  // });

  return spy;
}