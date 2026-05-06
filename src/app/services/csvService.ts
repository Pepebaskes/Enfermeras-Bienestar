import { Person, PersonStatus } from '../models/person.model';

const parseBooleanValue = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  return ['si', 'sí', 'yes', 'true', '1', 'x'].includes(normalized);
};

export const parseCSV = (csvText: string): Person[] => {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const persons: Person[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const person: Partial<Person> = {
      id: crypto.randomUUID(),
      estados: [],
      fechaCreacion: new Date().toISOString(),
      ultimaActualizacion: new Date().toISOString()
    };

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || '';
      const headerLower = header.toLowerCase();

      if (headerLower.includes('nombre')) {
        person.nombreCompleto = value;
      } else if (headerLower.includes('calle')) {
        person.calle = value;
      } else if (headerLower.includes('numero') || headerLower.includes('número')) {
        person.numeroCasa = value;
      } else if (headerLower.includes('colonia')) {
        person.colonia = value;
      } else if (headerLower.includes('carnet')) {
        person.carnet = parseBooleanValue(value);
      } else if (headerLower.includes('telefono') || headerLower.includes('teléfono')) {
        person.telefono = value;
      } else if (headerLower.includes('referencia')) {
        person.referencias = value;
      } else if (headerLower.includes('observacion')) {
        person.observaciones = value;
      } else if (headerLower.includes('enfermera')) {
        person.enfermera = value;
      } else if (headerLower.includes('visita')) {
        person.numeroVisita = Math.max(0, parseInt(value) || 0);
      }
    });

    if (person.nombreCompleto && person.calle && person.colonia) {
      person.carnet = person.carnet ?? false;
      person.numeroVisita = person.numeroVisita ?? 0;
      persons.push(person as Person);
    }
  }

  return persons;
};

const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  values.push(currentValue.trim());
  return values;
};

export const exportToCSV = (persons: Person[]): string => {
  const headers = [
    'Nombre Completo',
    'Calle',
    'Número de Casa',
    'Colonia',
    'Carnet',
    'Teléfono',
    'Referencias',
    'Observaciones',
    'Numero de Visita',
    'Estados',
    'Fecha de Visita',
    'Enfermera',
    'Última Actualización'
  ];

  const rows = persons.map(person => {
    const estados = person.estados.join('; ');
    return [
      escapeCSVValue(person.nombreCompleto),
      escapeCSVValue(person.calle),
      escapeCSVValue(person.numeroCasa),
      escapeCSVValue(person.colonia),
      escapeCSVValue(person.carnet ? 'Si' : 'No'),
      escapeCSVValue(person.telefono || ''),
      escapeCSVValue(person.referencias || ''),
      escapeCSVValue(person.observaciones || ''),
      escapeCSVValue(String(person.numeroVisita || 0)),
      escapeCSVValue(estados),
      escapeCSVValue(person.fechaVisita || ''),
      escapeCSVValue(person.enfermera || ''),
      escapeCSVValue(new Date(person.ultimaActualizacion).toLocaleString('es-MX'))
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};

const escapeCSVValue = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const downloadCSV = (csvContent: string, filename: string = 'datos_enfermeria.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
