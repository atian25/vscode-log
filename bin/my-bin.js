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

const debugPort = 9999;

// hack to make cfork start with debugPort
process.debugPort = debugPort - 1;

cfork({
  exec: bin,
  execArgv: [ '--inspect' ],
  silent: false,
  count: 1,
  refork: true,
});

// kill debug port
exec(`kill -9 $(lsof -i :${debugPort} | grep -E  -o '\\s\\d+\\s')`, () => {
  proxy(debugPort);  
});