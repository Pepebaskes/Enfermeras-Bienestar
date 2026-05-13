import { Person, PersonStatus } from '../models/person.model';
import { Profile } from '../models/profile.model';
import { CarnetFilter, SearchMode, SearchType } from '../utils/filters';
import { SortField, SortOrder } from '../utils/sorters';
import { supabase } from './supabaseClient';

interface PatientRow {
  id: string;
  owner_id: string;
  nombre_completo: string;
  calle: string;
  numero_casa: string;
  colonia: string;
  telefono: string | null;
  referencias: string | null;
  observaciones: string | null;
  carnet: boolean;
  estados: PersonStatus[];
  numero_visita: number;
  fecha_visita: string | null;
  enfermera: string | null;
  created_by: string | null;
  created_by_name: string | null;
  updated_by: string | null;
  updated_by_name: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface PatientStats {
  total: number;
  visitados: number;
  sinVisita: number;
  cambioDomicilio: number;
  noQuiso: number;
  fueraPais: number;
  finados: number;
}

export interface PatientQueryOptions {
  page: number;
  pageSize: number;
  searchQuery?: string;
  searchType?: SearchType;
  searchMode?: SearchMode;
  carnetFilter?: CarnetFilter;
  estados?: PersonStatus[];
  estadosMode?: 'any' | 'all';
  ownerId?: string;
  updatedFrom?: string;
  updatedTo?: string;
  sortField?: SortField;
  sortOrder?: SortOrder;
}

export interface PatientPage {
  persons: Person[];
  total: number;
}

export interface FetchAllPatientsOptions extends Partial<Omit<PatientQueryOptions, 'page' | 'pageSize'>> {
  pageSize?: number;
  onProgress?: (loaded: number, total: number) => void;
}

const toDateValue = (value?: string) => value ? value.slice(0, 10) : null;

const sortColumnByField: Record<SortField, string> = {
  nombre: 'nombre_completo',
  colonia: 'colonia',
  calle: 'calle',
  numero: 'numero_casa',
  fecha: 'actualizado_en',
  visita: 'numero_visita'
};

const escapeSearchValue = (value: string) => value.replace(/[%_]/g, '\\$&').replace(/,/g, '\\,');

const mapPatientRowToPerson = (row: PatientRow): Person => ({
  id: row.id,
  nombreCompleto: row.nombre_completo,
  calle: row.calle,
  numeroCasa: row.numero_casa,
  colonia: row.colonia,
  telefono: row.telefono || undefined,
  referencias: row.referencias || undefined,
  observaciones: row.observaciones || undefined,
  carnet: row.carnet,
  estados: row.estados || [],
  numeroVisita: row.numero_visita || 0,
  fechaVisita: row.fecha_visita || undefined,
  enfermera: row.enfermera || undefined,
  creadoPorId: row.created_by || undefined,
  creadoPorNombre: row.created_by_name || undefined,
  actualizadoPorId: row.updated_by || undefined,
  actualizadoPorNombre: row.updated_by_name || undefined,
  fechaCreacion: row.creado_en,
  ultimaActualizacion: row.actualizado_en
});

const mapPersonToPatientInsert = (person: Person, profile: Profile) => ({
  owner_id: profile.id,
  nombre_completo: person.nombreCompleto,
  calle: person.calle,
  numero_casa: person.numeroCasa,
  colonia: person.colonia,
  telefono: person.telefono || null,
  referencias: person.referencias || null,
  observaciones: person.observaciones || null,
  carnet: person.carnet ?? false,
  estados: person.estados || [],
  numero_visita: person.numeroVisita || 0,
  fecha_visita: toDateValue(person.fechaVisita),
  enfermera: profile.nombre,
  created_by: profile.id,
  created_by_name: profile.nombre,
  updated_by: profile.id,
  updated_by_name: profile.nombre
});

const mapPersonToPatientUpdate = (person: Person, profile: Profile) => ({
  nombre_completo: person.nombreCompleto,
  calle: person.calle,
  numero_casa: person.numeroCasa,
  colonia: person.colonia,
  telefono: person.telefono || null,
  referencias: person.referencias || null,
  observaciones: person.observaciones || null,
  carnet: person.carnet ?? false,
  estados: person.estados || [],
  numero_visita: person.numeroVisita || 0,
  fecha_visita: toDateValue(person.fechaVisita),
  enfermera: profile.nombre,
  updated_by: profile.id,
  updated_by_name: profile.nombre,
  actualizado_en: new Date().toISOString()
});

const removeAuditFields = <T extends Record<string, unknown>>(payload: T) => {
  const {
    created_by,
    created_by_name,
    updated_by,
    updated_by_name,
    ...payloadWithoutAudit
  } = payload;

  return payloadWithoutAudit;
};

const isAuditSchemaCacheError = (message: string) => {
  const normalizedMessage = message.toLowerCase();
  return normalizedMessage.includes('schema cache')
    && (
      normalizedMessage.includes('created_by')
      || normalizedMessage.includes('created_by_name')
      || normalizedMessage.includes('updated_by')
      || normalizedMessage.includes('updated_by_name')
    );
};

export const fetchPatients = async (): Promise<Person[]> => {
  const page = await fetchPatientsPage({
    page: 0,
    pageSize: 100,
    sortField: 'fecha',
    sortOrder: 'desc'
  });

  return page.persons;
};

const applyPatientFilters = (
  query: any,
  options: Partial<PatientQueryOptions>
) => {
  let filteredQuery = query;
  const searchQuery = options.searchQuery?.trim();
  const searchMode = options.searchMode || 'partial';
  const searchType = options.searchType || 'all';

  if (options.ownerId) {
    filteredQuery = filteredQuery.eq('owner_id', options.ownerId);
  }

  if (options.updatedFrom) {
    filteredQuery = filteredQuery.gte('actualizado_en', `${options.updatedFrom}T00:00:00`);
  }

  if (options.updatedTo) {
    filteredQuery = filteredQuery.lte('actualizado_en', `${options.updatedTo}T23:59:59.999`);
  }

  if (searchQuery) {
    const value = escapeSearchValue(searchQuery);
    const pattern = searchMode === 'exact' ? value : `%${value}%`;
    const operator = searchMode === 'exact' ? 'eq' : 'ilike';

    if (searchType === 'nombre') {
      filteredQuery = filteredQuery.filter('nombre_completo', operator, pattern);
    } else if (searchType === 'colonia') {
      filteredQuery = filteredQuery.filter('colonia', operator, pattern);
    } else if (searchType === 'telefono') {
      filteredQuery = filteredQuery.filter('telefono', operator, pattern);
    } else if (searchType === 'domicilio') {
      filteredQuery = filteredQuery.or(`calle.${operator}.${pattern},numero_casa.${operator}.${pattern}`);
    } else {
      filteredQuery = filteredQuery.or([
        `nombre_completo.${operator}.${pattern}`,
        `calle.${operator}.${pattern}`,
        `numero_casa.${operator}.${pattern}`,
        `colonia.${operator}.${pattern}`,
        `telefono.${operator}.${pattern}`,
        `enfermera.${operator}.${pattern}`
      ].join(','));
    }
  }

  if (options.carnetFilter === 'with') {
    filteredQuery = filteredQuery.eq('carnet', true);
  }

  if (options.carnetFilter === 'without') {
    filteredQuery = filteredQuery.eq('carnet', false);
  }

  if (options.estados && options.estados.length > 0) {
    filteredQuery = options.estadosMode === 'all'
      ? filteredQuery.contains('estados', options.estados)
      : filteredQuery.overlaps('estados', options.estados);
  }

  return filteredQuery;
};

export const fetchPatientsPage = async (options: PatientQueryOptions): Promise<PatientPage> => {
  const from = options.page * options.pageSize;
  const to = from + options.pageSize - 1;
  const sortField = options.sortField || 'fecha';
  const sortOrder = options.sortOrder || 'desc';

  let query = supabase
    .from('patients')
    .select('*', { count: 'exact' });

  query = applyPatientFilters(query, options)
    .order(sortColumnByField[sortField], { ascending: sortOrder === 'asc' })
    .range(from, to);

  const result = await query;

  if (result.error) {
    throw new Error(result.error.message);
  }

  return {
    persons: (result.data || []).map((row) => mapPatientRowToPerson(row as PatientRow)),
    total: result.count || 0
  };
};

export const fetchAllPatients = async (options: FetchAllPatientsOptions = {}): Promise<Person[]> => {
  const pageSize = options.pageSize || 500;
  const firstPage = await fetchPatientsPage({
    ...options,
    page: 0,
    pageSize,
    sortField: options.sortField || 'fecha',
    sortOrder: options.sortOrder || 'desc'
  });

  const allPatients = [...firstPage.persons];
  options.onProgress?.(allPatients.length, firstPage.total);

  const totalPages = Math.ceil(firstPage.total / pageSize);
  for (let page = 1; page < totalPages; page++) {
    const nextPage = await fetchPatientsPage({
      ...options,
      page,
      pageSize,
      sortField: options.sortField || 'fecha',
      sortOrder: options.sortOrder || 'desc'
    });
    allPatients.push(...nextPage.persons);
    options.onProgress?.(allPatients.length, firstPage.total);
  }

  return allPatients;
};

const countPatients = async (
  applyFilters?: (query: any) => any
) => {
  let query = supabase
    .from('patients')
    .select('id', { count: 'exact', head: true });

  if (applyFilters) {
    query = applyFilters(query);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
};

export const fetchPatientStats = async (): Promise<PatientStats> => {
  const [
    total,
    visitados,
    sinVisita,
    cambioDomicilio,
    noQuiso,
    fueraPais,
    finados
  ] = await Promise.all([
    countPatients(),
    countPatients((query) => query.or('numero_visita.gt.0,estados.cs.{visitado}')),
    countPatients((query) => query.eq('numero_visita', 0)),
    countPatients((query) => query.contains('estados', ['cambio_domicilio'])),
    countPatients((query) => query.contains('estados', ['no_quiso_programa'])),
    countPatients((query) => query.contains('estados', ['fuera_del_pais'])),
    countPatients((query) => query.contains('estados', ['finado']))
  ]);

  return {
    total,
    visitados,
    sinVisita,
    cambioDomicilio,
    noQuiso,
    fueraPais,
    finados
  };
};

export const savePatient = async (person: Person, profile: Profile): Promise<Person> => {
  const isNew = !person.id || person.id.startsWith('temp-');

  if (isNew) {
    const insertPayload = mapPersonToPatientInsert(person, profile);
    let { data, error } = await supabase
      .from('patients')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error && isAuditSchemaCacheError(error.message)) {
      const retry = await supabase
        .from('patients')
        .insert(removeAuditFields(insertPayload))
        .select('*')
        .single();

      data = retry.data;
      error = retry.error;
    }

    if (error) {
      throw new Error(error.message);
    }

    return mapPatientRowToPerson(data as PatientRow);
  }

  const updatePayload = mapPersonToPatientUpdate(person, profile);
  let { data, error } = await supabase
    .from('patients')
    .update(updatePayload)
    .eq('id', person.id)
    .select('*')
    .single();

  if (error && isAuditSchemaCacheError(error.message)) {
    const retry = await supabase
      .from('patients')
      .update(removeAuditFields(updatePayload))
      .eq('id', person.id)
      .select('*')
      .single();

    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  return mapPatientRowToPerson(data as PatientRow);
};
