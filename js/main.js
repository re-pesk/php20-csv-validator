/* eslint-disable no-console */

// Raktas lokaloje saugykloje
const LS_KEY = 'csv-validator';

// Parseris
import CsvParser from '../lib/csv-js/src/CsvParser.js';

// Saugyklos manageris
import LocalStorageManager from './LocalStorageManager.js';
const storage = new LocalStorageManager(LS_KEY);

// JSONo formatavimo įrankis
import JSONFormatter from '../vendor/json-formatter/dist/json-formatter.esm.js';

// Elementai, kuriuose saugomas failo duomenų objektas, rodomas failo pavadinimas
// ir failo turinys
const selectedFileName = document.querySelector('#selected-file-name');
const displayedFileName = document.querySelector('#displayed-file-name');
const fileContent = document.querySelector('#file-content');
const navbarFileDataPanel = document.querySelector('#navbarFileDataPanel');
const dataTab = document.querySelector('#data-tab');
const dataPage = document.querySelector('#dataPage');


// Elementai validavimo duomenų išvedimui
const outParserPreferences = document.querySelector('#parser-preferences');
const outRecordSet = document.querySelector('#record-set');
const outValidationMessages = document.querySelector('#validation-messages');
const outDataTree = document.querySelector('#data-tree');
const outValidationResult = document.querySelector('#validation-result');

// Mygtukai
const btnClearData = document.querySelector('#clear-data');
const tabValidation = document.querySelector('#validation-tab');

// Forma su parserio paramtetrais
const frmOptions = document.forms['parameters'];

// Funkcija parametrų objekto generavimui
const getParameters = () => {
  const parameters = {};
  for (const parameter of frmOptions.elements) {
    parameters[parameter.value] = parameter.checked;
  }
  return parameters;
}

//  Failo duomenų nuskaitymas
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

// CSV lentelės kūrimas
const createRecordsTable = (recordSet) => {
  const recordSetList = recordSet.map(
    (record, index) => {
      const recordList = record.map(
        field => {
          const twoParts = [field[2], field[3]].map(
            (part, index) => {
              const classes = index < 1 ? 'text-primary' : 'text-danger';
              const partStr = `<span class="${classes}">${JSON.stringify(part[0]).slice(1, -1)}</span>`;
              return partStr;
            }
          );
          const joined = twoParts.join('');
          const result = `<div class="col-12 col-lg">${joined}</div>`
          return result;
        }
      );
      const recordStr = recordList.join('');
      let headerClass = '';
      if (parameters.hasHeader && index < 1) {
        headerClass = ' fw-bolder';
      }
      const recordResult = `<div class="row${headerClass}"><div class="col">${index}</div>${recordStr}</div>`
      return recordResult;
    }
  );
  const recordSetStr = recordSetList.join("\n");
  return recordSetStr;
};

// Failo turinio analizė
const analyzeContent = (content) => {
  outValidationResult.value = '';

  if (content.trim() === '') {
    return;
  }

  const parameters = getParameters();
  const csvParser = CsvParser(parameters);

  // // Parametrų įkėlimas
  // outParserPreferences.innerHTML = `<h3>CSV parser preferences</h3>\n`;
  // outParserPreferences.appendChild(
  //   new JSONFormatter(csvParser.parameters).render()
  // );

  // ĮRašų masyvo generavimas 
  const recordSet = csvParser.makeRecords(content);

  outRecordSet.innerHTML = `<h3>CSV record set</h3>\n`
  outRecordSet.appendChild(
    new JSONFormatter(recordSet).render()
  );

  let validation = '';

  // Įrašų masyvo tikrinimas
  try {
    csvParser.checkRecords(recordSet);
    validation = `Recordset is valid`;
  } catch (error) {
    validation = `<span class="text-danger">${error.message}</span>`;
  }

  outValidationMessages.innerHTML = `<h3>Validation Messages</h3>`;
  outValidationMessages.innerHTML += `<h5>Recordset Validation Messages</h5>`;
  outValidationMessages.innerHTML += `<p>${validation}</p>`;

  // Laukų reikšmių tikrinimas
  try {
    csvParser.checkValues(recordSet);
    validation = `Values of the recordSet are valid`;
  } catch (error) {
    validation = `<span class="text-danger">${error.message}</span>`;
  }

  outValidationMessages.innerHTML += `<h5>Values Validation Messages</h5>`;
  outValidationMessages.innerHTML += `<p>${validation.replaceAll(/\n/g, '<br />')}</p>`;

  // CSV duomenų medžio  generavimas
  const dataTree = csvParser.recordsToDataTree(recordSet);

  outDataTree.innerHTML = `<h3>Valid data tree</h3`;
  outDataTree.appendChild(
    new JSONFormatter(dataTree).render()
  );

  // CSV lentelės generavimas
  const recordsTable = createRecordsTable(recordSet);
  outValidationResult.innerHTML = recordsTable;

  outValidationResult.querySelectorAll('div.col-12').forEach(element => {
    element.classList.add('csv-col');
    element.classList.add('border');
    element.classList.add('border-info');
  })

  outValidationResult.querySelectorAll('div.row').forEach((element, index) => {
    if (index < 1) {
      element.classList.add('border-top');
    }
    element.classList.add('border-bottom');
    element.classList.add('border-4');
    element.classList.add('border-primary');
  })
};

const loadData = () => {
  readFile(selectedFileName.files[0]);
};

const validateData = () => {
  const content = storage.data;
  analyzeContent(content);
};

const clearData = () => {
  [
    selectedFileName,
    displayedFileName,
    fileContent,
  ].forEach(element => (element.value = ''));

  [
    outParserPreferences,
    outRecordSet,
    outValidationMessages,
    outDataTree,
    outValidationResult,
  ].forEach(element => (element.innerHTML = ''));

  new bootstrap.Tab(dataTab).show();
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
  navbarFileDataPanel.classList.remove('show');
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

btnClearData.addEventListener('click', clearData)
tabValidation.addEventListener('click', validateData);
selectedFileName.addEventListener('change', displayFileName);
fileContent.addEventListener('input', onContentInput);
