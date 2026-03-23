const xlsx = require('xlsx');
const fs = require('fs');

try {
  const workbook = xlsx.readFile('OKR lLIST.xlsx');
  const sheetNameList = workbook.SheetNames;
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);
  fs.writeFileSync('okr_data.json', JSON.stringify(data, null, 2));
  console.log('Successfully wrote to okr_data.json');
} catch (e) {
  console.error('Error reading excel:', e);
}
