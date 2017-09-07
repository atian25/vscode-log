#!/usr/bin/env node

'use strict';

const path = require('path');
const fork = require('child_process').fork;
const exec = require('child_process').exec;
const proxy = require('../proxy');
const cfork = require('cfork');

console.log('log at start, parent process');

const bin = path.join(__dirname, '../index.js');
// fork(bin, [], { execArgv: [ '--inspect=9999' ] });

let debugPort = 9999;

// hack to make cfork start with debugPort
process.debugPort = debugPort - 1;

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
}).on('exit', () => {
  debugPort++;
  proxy(debugPort);
});

proxy(debugPort);