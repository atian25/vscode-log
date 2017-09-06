const net = require('net');
const stream = require('stream');
const dns = require('dns');
const EventEmitter = require('events').EventEmitter;

module.exports = class TCPProxy extends EventEmitter {
  constructor(options) {
    super();
    this.port = options.port;
  }

  start({ forwardPort, forwardHost }) {
    if (this.server) {
      return this.stop().then(() => {
        this.start({ forwardPort, forwardHost });
      });
    }

    return new Promise((res, rej) => {
      this.server = net
        .createServer(client => {
          const serverStream = new stream.PassThrough();
          const clientStream = new stream.PassThrough();
          const server = net.connect({
            port: forwardPort,
            host: forwardHost,
          }, () => {
            if (server.writable && server.readable) {
              client.pipe(server).pipe(client);
              client.pipe(clientStream);
              server.pipe(serverStream);
            } else {
              server.destroy();
            }
          });

          this.client = client;
          this.proxyServer = server;

          const onClose = () => {
            server.destroy();
            client.destroy();
            clientStream.end();
            serverStream.end();
          };

          const onError = err => {
            this.emit('error', err);
            onClose();
          };

          server.on('close', onClose);
          server.on('error', onError);
          client.on('close', onClose);
          client.on('error', onError);
          this.emit('connection', clientStream, serverStream);
        })
        .listen(this.port);

      this.server.on('error', rej);
      this.server.on('listening', () => {
        this.server.removeListener('error', rej);
        res();
      });
    });
  }

  stop() {
    return new Promise(res => {
      this.proxyServer.destroy();
      this.server.close(() => {
        this.server = null;
        res();
      });
    });
  }
};