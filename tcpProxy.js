const net = require('net');
const stream = require('stream');
const dns = require('dns');
const through = require('through2');
const EventEmitter = require('events').EventEmitter;

module.exports = class TCPProxy extends EventEmitter {
  constructor(options) {
    super();
    this.port = options.port;
  }

  start({ forwardPort, forwardHost, clientThrough, serverThrough }) {
    if (this.server) {
      return this.stop().then(() => {
        return this.start.apply(this, [].slice.call(arguments));
      });
    }

    const onClose = () => {
      this.proxyClient.destroy();
      this.proxyServer.destroy();
    };

    const onError = err => {
      this.emit('error', err);
      onClose();
    };

    return new Promise((resolve, reject) => {
      this.server = net
        .createServer(client => {
          const server = net.connect(
            {
              port: forwardPort,
              host: forwardHost,
            },
            () => {
              if (server.writable && server.readable) {
                let _client = client;
                let _server = server;

                if (clientThrough) {
                  _client = _client.pipe(through.obj(clientThrough));
                }

                if (serverThrough) {
                  _server = _server.pipe(through.obj(serverThrough));
                }

                _client.pipe(server);
                _server.pipe(client);
              } else {
                server.destroy();
              }
            }
          );

          this.client = client;
          this.proxyClient = client;
          this.proxyServer = server;

          server.on('close', onClose);
          server.on('error', onError);
          client.on('close', onClose);
          client.on('error', onError);
          this.emit('connection');
        })
        .listen(this.port);

      this.server.on('close', () => {
        this.server = null;
        onClose();
      });

      this.server.on('error', reject);
      this.server.on('listening', () => {
        this.server.removeListener('error', reject);
        resolve();
      });
    });
  }

  stop() {
    return new Promise(resolve => {
      this.server.close(resolve);
    });
  }
};