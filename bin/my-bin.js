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

cfork({
  exec: bin,
  execArgv: ['--inspect'],
  silent: false,
  count: 1,
  refork: true,
}).on('exit', () => {
  debugPort++;
  console.log(debugPort);
  startProxy(debugPort, debugPort - 1);
});

// kill debug port
startProxy(debugPort);

function startProxy(port, oldPort = port) {
  exec(`kill -9 $(lsof -i :${oldPort} | grep -E  -o '\\s\\d+\\s')`, () => {
    proxy(port);
  });
}