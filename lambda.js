#!/usr/bin/env node
'use strict';
const {
  argv: { url }
} = require('yargs');
const handler = require('./src/handler');

handler(url);
