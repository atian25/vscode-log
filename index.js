'use strict';

const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200);

  if (req.url === '/exit') {
    const msg = `exit: ${process.pid}\n${process.debugPort}`;
    console.log(msg);
    res.end(msg);
    process.exit();
  } else {
    res.end(`hello world\n${process.pid}\n${process.debugPort}`);
  }
}).listen(7001);

console.log('server#%s: 127.0.0.1:7001, debugPort: %s', process.pid, process.debugPort);
