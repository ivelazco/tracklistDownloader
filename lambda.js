#!/usr/bin/env node
'use strict';
const {
  argv: { url, path }
} = require('yargs');
const handler = require('./src/handler');

handler(url, path);
