#!/usr/bin/env node

'use strict';

const path = require('path');
const fork = require('child_process').fork;
const exec = require('child_process').exec;
const proxy = require('inspector-proxy');
const cfork = require('cfork');

console.log('log at start, parent process');

const bin = path.join(__dirname, '../index.js');
// fork(bin, [], { execArgv: [ '--inspect=9999' ] });

// prevent cfork print epipe error
process.on('uncaughtException', err => {
  if (err.code !== 'EPIPE') {
    console.error(err);
  }
});

cfork({
  exec: bin,
  execArgv: ['--inspect'],
  silent: false,
  count: 1,
  refork: true,
}).on('fork', worker => {
  const port = worker.process.spawnargs
    .find(arg => arg.startsWith('--inspect'))
    .match(/\d+/)[0];

  proxy(9229, port).then(({ url }) => {
    console.log(`\nproxy url: ${url}`);
  });
});