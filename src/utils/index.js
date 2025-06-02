'use strict';
const { curryN } = require('@flybondi/ramda-land');
const { pipe, tap } = require('ramda');
const prAll = fnReturn => ps => Promise.allSettled(ps).then(fnReturn);
const printUtils = require('./printUtils');

const tapAfter = async (fnLog, fn, ...args) => {
  const result = await fn(...args);
  fnLog(result, ...args);
  return result;
};

module.exports = { prAll, tapAfter: curryN(3, tapAfter), ...printUtils };
