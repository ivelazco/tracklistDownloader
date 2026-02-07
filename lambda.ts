#!/usr/bin/env node
'use strict';
// Configurar variable de entorno para evitar error 403 de ytdl-core
process.env.YTDL_NO_UPDATE = '1';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import handler from './src/handler';

const argv = yargs(hideBin(process.argv))
  .option('url', {
    type: 'string',
    demandOption: true,
    describe: 'URL of the tracklist to download',
  })
  .option('path', {
    type: 'string',
    describe: 'Output path for downloads',
  })
  .option('json', {
    type: 'boolean',
    describe: 'Use JSON list format',
  })
  .parseSync();

handler(argv.url, argv.path, argv.json).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

