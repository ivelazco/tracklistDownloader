import { compose, join, groupBy, length, map } from 'ramda';
import { FulfilledResult, RejectedResult, SettledResult } from '../types';

type GroupedResults<T> = {
  successfuls?: FulfilledResult<T>[];
  fails?: RejectedResult[];
};

const printVideoTitle = <T extends { outputFile?: string } | string>(folderPath: string) =>
  compose(
    join('\n'),
    map(({ value }: FulfilledResult<T>) => {
      const filePath = typeof value === 'string' ? value : (value as { outputFile: string }).outputFile;
      return `-- "${filePath.replace(folderPath, '')}"`;
    }),
  );

const printFailVideoTitle = (folderPath: string) =>
  compose(
    join('\n'),
    map(({ reason }: RejectedResult) => `-- "${String(reason).replace(folderPath, '')}"`),
  );

const printEndOfExecution =
  <T,>(folderPath: string) =>
  ({ successfuls, fails }: GroupedResults<T>) =>
    console.log(
      `[execution][finished]\nSuccessfuls: ${successfuls ? length(successfuls) : 0}\nFails: ${fails ? length(fails) : 0}`,
    );

const groupByStatus = <T,>(results: SettledResult<T>[]): GroupedResults<T> =>
  groupBy(({ status }: SettledResult<T>) =>
    status === 'fulfilled' ? 'successfuls' : 'fails',
  )(results) as GroupedResults<T>;

const printResults = <T extends { outputFile?: string } | string>(folderPath: string) =>
  compose(printEndOfExecution<T>(folderPath), groupByStatus<T>);

export {
  printVideoTitle,
  printFailVideoTitle,
  printEndOfExecution,
  groupByStatus,
  printResults,
};

