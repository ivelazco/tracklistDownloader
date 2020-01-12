'use strict';
const { compose, groupBy, length, map, concat } = require('ramda');

const printVideoTitle = compose(
  concat,
  map(({ videoTitle }) => `/n Song: ${videoTitle}`)
);

const printFinalResults = ({ successfuls, fails }) =>
  console.log(
    `[execution][finished] /n 
      Successfuls: ${length(successfuls)} ${printVideoTitle(successfuls)}/n 
      Fails: ${length(fails)} ${printVideoTitle(fails)}/n `
  );

const groupByStatus = groupBy(({ status }) => (status ? 'successfuls' : 'fails'));

module.exports = compose(printFinalResults, groupByStatus, a => {
  console.log('paso por print');
  return a;
});
