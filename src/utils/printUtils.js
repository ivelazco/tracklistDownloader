'use strict';
const { compose, join, groupBy, length, map } = require('ramda');

const printVideoTitle = (folderPath) =>
  compose(
    join('\n'),
    map(({ value }) => `-- "${value.replace(folderPath, '')}"`),
  );

const printFailVideoTitle = (folderPath) =>
  compose(
    join('\n'),
    map(({ reason }) => `-- "${reason.replace(folderPath, '')}"`),
  );

const printEndOfExecution =
  (folderPath) =>
  ({ successfuls, fails }) =>
    console.log(
      `[execution][finished] \n 
      Successfuls: ${successfuls ? length(successfuls) : 0}}\n 
      Fails: ${fails ? length(fails) : 0}S\n `,
    );

const groupByStatus = groupBy(({ status }) => (status === 'fulfilled' ? 'successfuls' : 'fails'));

module.exports = {
  printVideoTitle,
  printFailVideoTitle,
  printEndOfExecution,
  groupByStatus,
  printResults: (folderPath) => compose(printEndOfExecution(folderPath), groupByStatus)
}; 