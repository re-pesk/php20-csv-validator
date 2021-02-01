/* eslint-disable no-console */
console.clear();
import CsvParser from './csv-js/src/CsvParser.js';


const csv = `field_name_1,"Field\r
Name 2",field_name_3 \r
"aaa","b \r
,bb","ccc""ddd"abc\r
zzz,,""\r
1,2.2,\r
,3,\r
`;
// const csv = '"abc"ooo,bcd,12+-\r\n"bcd",,xxx=!\r\n';
const csvParser = CsvParser({ hasHeader: true, preserveEmptyLine: true, ignoreInvalidChars: true });

console.log('csvParser.constructor.name ===', `'${csvParser.constructor.name}'\n`);
console.log('csvParser.parameters ==='); console.log(csvParser.parameters); console.log();

const recordSet = csvParser.makeRecords(csv);
console.log('recordSet ===');
console.log('[');
recordSet.forEach((record) => {
  console.group();
  console.log(record);
  console.groupEnd();
});
console.log('];\n');
try {
  csvParser.checkRecords(recordSet);
  console.log('recordSet is valid\n');
} catch (e) {
  console.log(e.message, '\n');
}
try {
  csvParser.checkValues(recordSet);
  console.log('Values of the recordSet are valid');
} catch (e) {
  console.log(e.message, '\n');
}
const dataTree = csvParser.recordsToDataTree(recordSet);
console.log('dataTree ==='); console.log(dataTree); console.log();
console.log('JSON of dataTree ===\n ', JSON.stringify(dataTree));
