#!/usr/bin/env node
'use strict';
// Configurar variable de entorno para evitar error 403 de ytdl-core
process.env.YTDL_NO_UPDATE = '1';

const {
  argv: { url, path, json }
} = require('yargs');
const handler = require('./src/handler');

handler(url, path, json);
