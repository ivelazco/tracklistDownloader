'use strict';
const { compose, join, groupBy, length, map } = require('ramda');

const printVideoTitle = (folderPath) =>
  compose(
    join('\n'),
    map(({ value }) => `-- "${value.replace(folderPath, '')}"`),
  );
const printFinalResults =
  (folderPath) =>
  ({ successfuls, fails }) =>
    console.log(
      `[execution][finished] \n 
      Successfuls: ${successfuls ? length(successfuls) : 0} ${successfuls ? printVideoTitle(folderPath)(successfuls) : 0}\n 
      Fails: ${fails ? length(fails) : 0} ${fails ? printVideoTitle(fails) : ''}\n `,
    );
const groupByStatus = groupBy(({ status }) => (status === 'fulfilled' ? 'successfuls' : 'fails'));

module.exports = (folderPath) => compose(printFinalResults(folderPath), groupByStatus);
