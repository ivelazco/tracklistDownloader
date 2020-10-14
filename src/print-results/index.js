'use strict';
const { compose,join, groupBy, length, map } = require('ramda');

const printVideoTitle = compose(
  join('\n'),
  map(({ value: {videoTitle} }) => `-- "${videoTitle}"`)
);
const printFinalResults = ({ successfuls, fails }) =>
  console.log(
    `[execution][finished] \n 
      Successfuls: ${successfuls ? length(successfuls) : 0} ${successfuls ? printVideoTitle(successfuls) : 0}\n 
      Fails: ${fails ? length(fails) : 0} ${fails ? printVideoTitle(fails): ""}\n `
  );
const groupByStatus = groupBy(({ status }) => status === "fulfilled" ? 'successfuls' : 'fails');

module.exports = compose(printFinalResults, groupByStatus, a => {
  console.log('paso por print', a);
  return a;
});
