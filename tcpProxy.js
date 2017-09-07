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

  start({ forwardPort, forwardHost, interceptor }) {
    if (this.server) {
      const args = [].slice.call(arguments);
      return this.end().then(() => {
        return this.start.apply(this, args);
      });
    }

    const onClose = () => {
      this.proxyClient && this.proxyClient.destroy();
      this.proxyServer && this.proxyServer.destroy();
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
              if (!server.writable || !server.readable) {
                return server.destroy();
              }

              let _client = client;
              let _server = server;

              // client interceptor
              if (interceptor.client) {
                _client = _client.pipe(
                  through.obj(function(chunk, enc, done) {
                    done(null, interceptor.client(chunk, enc) || chunk);
                  })
                );
              }

              // server interceptor
              if (interceptor.server) {
                _server = _server.pipe(
                  through.obj(function(chunk, enc, done) {
                    done(null, interceptor.server(chunk, enc) || chunk);
                  })
                );
              }

              _client.pipe(server);
              _server.pipe(client);
            }
          );

          this.proxyClient = client;
          this.proxyServer = server;

          server.on('close', onClose);
          server.on('error', onError);
          client.on('close', onClose);
          client.on('error', onError);
          this.emit('connection');
        })
        .listen(this.port);

      this.server.once('close', () => {
        this.server = null;
        onClose();
      });

      this.server.once('error', reject);
      this.server.once('listening', () => {
        this.server.removeListener('error', reject);
        resolve();
      });
    });
  }

  end() {
    return new Promise(resolve => {
      this.server.close(resolve);
    });
  }
};