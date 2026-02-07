import { curryN } from '@flybondi/ramda-land';
import { printVideoTitle, printFailVideoTitle, printEndOfExecution, groupByStatus, printResults } from './printUtils';
import { SettledResult } from '../types';

// Generic function type for prAll
type PromiseSettledHandler<T, R> = (results: Array<SettledResult<T>>) => R;

const prAll = <T, R>(fnReturn: PromiseSettledHandler<T, R>) => (ps: Promise<T>[]) =>
  Promise.allSettled(ps).then(fnReturn);

const tapAfter = async <T extends unknown[], R>(
  fnLog: (result: R, ...args: T) => void,
  fn: (...args: T) => Promise<R>,
  ...args: T
): Promise<R> => {
  const result = await fn(...args);
  fnLog(result, ...args);
  return result;
};

const curriedTapAfter = curryN(3, tapAfter);

export {
  prAll,
  curriedTapAfter as tapAfter,
  printVideoTitle,
  printFailVideoTitle,
  printEndOfExecution,
  groupByStatus,
  printResults,
};

