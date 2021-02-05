/* eslint-disable no-console */

const LS_KEY = 'csv-validator';

console.clear();
import CsvParser from './csv-js/src/CsvParser.js';
import LocalStorageManager from './LocalStorageManager.js';
const storage = new LocalStorageManager(LS_KEY);

import JSONFormatter from '../libs/json-formatter/dist/json-formatter.esm.js';

const selectedFileName = document.querySelector('#selected-file-name');
const displayedFileName = document.querySelector('#displayed-file-name');
const fileContent = document.querySelector('#file-content');
const validationResult = document.querySelector('#validation-result');

// const btnLoadData = document.querySelector('#load-data');
// const btnValidateData = document.querySelector('#validate-data');
const btnClearData = document.querySelector('#clear-data');
const tabValidation = document.querySelector('#validation-tab');

const frmOptions = document.forms['parameters'];

const readFile = (file) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const content = event.target.result;
    storage.data = content;
    fileContent.value = content;
    fileContent.dispatchEvent(new Event('input'));
  };
  reader.readAsText(file);
}

class Collection extends Array {
  get lastElement() {
    return this[this.length - 1];
  }
};

const getParameters = () => {
  const parameters = {};
  for (const parameter of frmOptions.elements) {
    parameters[parameter.value] = parameter.checked;
  }
  return parameters;
}

const validateContent = (content) => {
  validationResult.value = '';

  if (content.trim() === '') {
    return;
  }

  const parameters = getParameters();

  // const csvParser = CsvParser({ hasHeader: true, preserveEmptyLine: true, ignoreInvalidChars: true });
  const csvParser = CsvParser(parameters);

  const validations = new Collection();
  let validation = '';

  // validations.push(`csvParser.constructor.name === '${csvParser.constructor.name}'\n`);
  // console.log(`csvParser.constructor.name === '${csvParser.constructor.name}'\n`);

  const outParserPreferences = document.querySelector('#parser-preferences');
  outParserPreferences.innerHTML = `<h3>CSV parser preferences</h3>\n`;
  outParserPreferences.appendChild(
    new JSONFormatter(csvParser.parameters).render()
  );

  validations.push(`CSV parser preferences = ${JSON.stringify(csvParser.parameters)}\n`);
  console.log(`CSV parser preferences =\n`, csvParser.parameters, `\n`);

  const recordSet = csvParser.makeRecords(content);

  const outRecordSet = document.querySelector('#record-set');
  outRecordSet.innerHTML += `<h3>CSV record set</h3>\n`
  outRecordSet.appendChild(
    new JSONFormatter(recordSet).render()
  );

  validations.push(`CSV record set =\n${JSON.stringify(recordSet)}\n`);
  console.log('CSV record set =');
  console.log('[');
  recordSet.forEach((record) => {
    console.group();
    console.log(record);
    console.groupEnd();
  });
  console.log('];\n');

  try {
    csvParser.checkRecords(recordSet);
    validation = `recordSet is valid\n`;
  } catch (error) {
    validation = `${error.message}\n`;
  }

  const outValidationMessages = document.querySelector('#validation-messages');
  outValidationMessages.innerHTML = `<h3>Validation Messages</h3>`;
  outValidationMessages.innerHTML += `<p>${validation}</p>`;
  validations.push(validation);
  console.log(validation);

  try {
    csvParser.checkValues(recordSet);
    validation = `Values of the recordSet are valid\n`;
  } catch (error) {
    validation = `${error.message}\n`;
  }

  outValidationMessages.innerHTML += `<p>${validation}</p>`;
  validations.push(validation);
  console.log(validation);

  const dataTree = csvParser.recordsToDataTree(recordSet);
  
  const outDataTree = document.querySelector('#data-tree');
  outDataTree.innerHTML += `<h3>Data tree object</h3`;
  outDataTree.appendChild(
    new JSONFormatter(dataTree).render()
  );

  validations.push(`dataTree === \n ${JSON.stringify(dataTree)}\n`);
  console.log(`dataTree === \n ${dataTree}\n`);

  // const jsonStr = `JSON of dataTree === \n ${JSON.stringify(dataTree)}`;

  // validations.push(jsonStr);
  // console.log(jsonStr);

  // validationResult.value = validations.join("\n");
};

const loadData = () => {
  readFile(selectedFileName.files[0]);
};

const validateData = () => {
  const content = storage.data;
  validateContent(content);
};

const clearData = () => {
  selectedFileName.value = '';
  displayedFileName.value = '';
  fileContent.value = '';
  validationResult.value = '';
  toggleElements();
};

const toggleElement = (element, value) => {
  if (value) {
    element.classList.remove('d-none');
    return;
  }
  element.classList.add('d-none');
};

const toggleTabLink = (element, value) => {
  if (value) {
    element.classList.remove('disabled');
    element.setAttribute('aria-disabled', false);
    return;
  }
  element.classList.add('disabled');
  element.setAttribute('aria-disabled', true);
}

const toggleElements = () => {
  // toggleElement(btnLoadData, displayedFileName.value);
  // toggleElement(btnValidateData, fileContent.value);
  toggleTabLink(tabValidation, fileContent.value);
  toggleElement(btnClearData, displayedFileName.value || fileContent.value);
};

const displayFileName = (event) => {
  let fileName = '';
  const file = event.target.files[0];
  if (file) {
    fileName = file.name
  }
  displayedFileName.value = fileName;
  loadData();
  // toggleElements();
};

const onContentInput = () => {
  toggleElements();
}

// btnLoadData.addEventListener('click', loadData)
btnClearData.addEventListener('click', clearData)

tabValidation.addEventListener('click', validateData);

selectedFileName.addEventListener('change', displayFileName);
fileContent.addEventListener('input', onContentInput);
