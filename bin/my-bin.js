#!/usr/bin/env node

'use strict';

const path = require('path');
const fork = require('child_process').fork;

console.log('log at start, parent process');

const bin = path.join(__dirname, '../index.js');
fork(bin, [], { execArgv: [ '--inspect' ] });
