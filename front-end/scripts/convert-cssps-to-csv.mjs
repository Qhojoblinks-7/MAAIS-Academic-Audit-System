import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const TEMPLATE_HEADERS = [
  'indexNumber',
  'firstName',
  'lastName',
  'middleName',
  'gender',
  'dateOfBirth',
  'residentialStatus',
  'className',
  'departmentName',
  'currentClassId',
  'departmentId',
  'parentFirstName',
  'parentLastName',
  'parentPhone',
  'parentEmail',
  'parentRelationship'
];

function splitName(name) {
  if (!name) return { firstName: '', lastName: '', middleName: '' };
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: '', lastName: '', middleName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '', middleName: '' };
  return {
    lastName: parts[0],
    firstName: parts[1],
    middleName: parts.slice(2).join(' ')
  };
}

function mapRecord(record) {
  let firstName = record.first_name || record.firstname || record.firstName || '';
  let lastName = record.last_name || record.lastname || record.lastName || '';
  let middleName = record.middle_name || record.middlename || record.middleName || '';

  if (record.name && !firstName && !lastName) {
    const parts = record.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      lastName = parts[0];
      firstName = parts[1];
      if (parts.length > 2) {
        middleName = parts.slice(2).join(' ');
      }
    } else if (parts.length === 1) {
      firstName = parts[0];
    }
  }

  return {
    indexNumber: record.index_number || record.indexnumber || record.index || record.cassrefid || '',
    firstName,
    lastName,
    middleName,
    gender: (record.gender || 'MALE').toUpperCase(),
    dateOfBirth: record.date_of_birth || record.dob || record.dateofbirth || record.dateOfBirth || '',
    residentialStatus: '',
    className: record.classname ? record.classname.replace(/^Year\s+/i, 'Form ') : (record.class_name ? record.class_name.replace(/^Year\s+/i, 'Form ') : (record.cassyear ? record.cassyear.replace(/^Year\s+/i, 'Form ') : '')) || '',
    departmentName: record.departmentname || record.department_name || record.programname || '',
    currentClassId: '',
    departmentId: '',
    parentFirstName: '',
    parentLastName: '',
    parentPhone: '',
    parentEmail: '',
    parentRelationship: 'Guardian'
  };
}

function normalizeRecord(record) {
  const normalized = {};
  for (const [key, value] of Object.entries(record)) {
    const normalizedKey = key.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    normalized[normalizedKey] = value !== undefined && value !== null ? String(value).trim() : '';
  }
  return normalized;
}

function convertFile(inputPath, outputPath) {
  const wb = XLSX.readFile(inputPath);
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(ws, { defval: '' });
  const data = rawData.map(normalizeRecord);

  const mapped = data.map(mapRecord);
  const csv = XLSX.utils.json_to_sheet(mapped, { header: TEMPLATE_HEADERS });
  const csvText = XLSX.utils.sheet_to_csv(csv);

  fs.writeFileSync(outputPath, csvText, 'utf-8');
  console.log(`Converted: ${path.basename(inputPath)} -> ${path.basename(outputPath)} (${mapped.length} rows)`);
}

function processInput(input) {
  const stat = fs.statSync(input);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(input).filter(f => /\.xlsx?$/i.test(f));
    if (files.length === 0) {
      console.log('No Excel files found in directory.');
      return;
    }
    files.forEach(file => {
      const inputPath = path.join(input, file);
      const outputPath = path.join(input, file.replace(/\.xlsx?$/i, '.csv'));
      try {
        convertFile(inputPath, outputPath);
      } catch (err) {
        console.error(`Failed to convert ${file}: ${err.message}`);
      }
    });
  } else if (stat.isFile() && /\.xlsx?$/i.test(input)) {
    const outputPath = input.replace(/\.xlsx?$/i, '.csv');
    convertFile(input, outputPath);
  } else {
    console.error('Input must be an .xlsx/.xls file or a directory containing them.');
  }
}

const input = process.argv[2];
if (!input) {
  console.error('Usage: node convert-cssps-to-csv.mjs <file.xlsx|directory>');
  process.exit(1);
}

processInput(input);
