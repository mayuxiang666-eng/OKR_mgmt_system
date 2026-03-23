const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('okr_data.json', 'utf8'));

// Excel date to JS string YYYY-MM-DD
function parseExcelDate(excelDate) {
  if (!excelDate) return '';
  if (typeof excelDate === 'string') return excelDate;
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.toISOString().split('T')[0];
}

function cleanOwner(str) {
  if (!str) return 'Unassigned';
  return str.split(';#')[0].trim();
}

const objectives = raw.map((row, objIdx) => {
  const objId = `obj-${objIdx + 1}`;
  const title = row['Title'] || 'Untitled Objective';
  const category = row['Category'] || 'Department';
  const progressStatus = row['Progress'] || 'Not started';
  const priority = row['Priority'] || 'Medium';
  const startDate = parseExcelDate(row['Start date']);
  const dueDate = parseExcelDate(row['Due date']);
  const assignedTo = cleanOwner(row['Assigned to']);
  
  // Parse KRs from string using numbers
  const krString = row['Key Result'] || '';
  const rawParts = krString.split(/(?=\b\d+[\.\)）]\s*)/);
  let krLines = [];
  rawParts.forEach(part => {
    if (part.includes('\n')) krLines.push(...part.split('\n'));
    else krLines.push(part);
  });
  krLines = krLines.map(l => l.replace(/^- /, '').trim()).filter(l => l.length > 5);
  
  const keyResults = krLines.map((krLine, krIdx) => {
    let currentValue = 0;
    let targetValue = 100;
    let progress = 0;
    let unit = '%';
    
    const fractionMatch = krLine.match(/(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/);
    if (fractionMatch) {
      currentValue = parseFloat(fractionMatch[1]);
      targetValue = parseFloat(fractionMatch[2]);
      progress = Math.round((currentValue / targetValue) * 100);
      unit = 'pts';
    } else {
       if (progressStatus === 'Completed') {
         progress = 100; currentValue = 100;
       } else if (progressStatus === 'In progress') {
         progress = 50; currentValue = 50;
       } else if (progressStatus === 'Behind' || progressStatus === 'Blocked') {
         progress = 25; currentValue = 25;
       }
    }

    return {
      id: `${objId}-kr-${krIdx + 1}`,
      title: krLine,
      currentValue,
      targetValue,
      unit,
      progress: isNaN(progress) ? 0 : progress,
    };
  });
  
  if (keyResults.length === 0) {
    keyResults.push({
      id: `${objId}-kr-1`,
      title: title,
      currentValue: progressStatus === 'Completed' ? 100 : 0,
      targetValue: 100,
      unit: '%',
      progress: progressStatus === 'Completed' ? 100 : 0,
    });
  }

  const confidenceScore = progressStatus === 'Completed' ? 5 : progressStatus === 'In progress' ? 4 : 2;
  const objProgress = Math.round(keyResults.reduce((acc, kr) => acc + kr.progress, 0) / keyResults.length) || 0;

  return {
    id: objId,
    title,
    category,
    priority,
    status: progressStatus,
    cycle: 'Q3 2024',
    assignedTo,
    startDate,
    dueDate,
    progress: objProgress,
    confidenceScore,
    notes: row['Notes'] || '',
    statusIndicators: '',
    planPlus1: '',
    lastReviewDate: parseExcelDate(row['Last Review Date']),
    plannedNextReviewDate: parseExcelDate(row['Planned Next Review Date']),
    reviewComment: row['Review comment'] || '',
    history: [],
    keyResults
  };
});

const tsOutput = `import { Objective } from './types';\n\nexport const mockObjectives: Objective[] = ${JSON.stringify(objectives, null, 2)};\n`;
fs.writeFileSync('apps/web/lib/mockData.ts', tsOutput);
console.log('Successfully generated mockData.ts with new structure!');
