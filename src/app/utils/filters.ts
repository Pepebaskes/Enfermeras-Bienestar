import { Person, PersonStatus } from '../models/person.model';

export type SearchType = 'all' | 'nombre' | 'domicilio' | 'colonia' | 'telefono';
export type SearchMode = 'partial' | 'exact';

export interface FilterOptions {
  searchQuery: string;
  searchType: SearchType;
  searchMode: SearchMode;
  colonia?: string;
  calle?: string;
  numero?: string;
  estados: PersonStatus[];
  estadosMode: 'any' | 'all';
}

export const filterPersons = (persons: Person[], options: FilterOptions): Person[] => {
  return persons.filter(person => {
    if (options.searchQuery.trim() !== '') {
      const query = options.searchMode === 'exact'
        ? options.searchQuery.trim()
        : options.searchQuery.trim().toLowerCase();

      let matches = false;

      switch (options.searchType) {
        case 'nombre':
          matches = options.searchMode === 'exact'
            ? person.nombreCompleto === query
            : person.nombreCompleto.toLowerCase().includes(query);
          break;
        case 'domicilio':
          const domicilio = `${person.calle} ${person.numeroCasa}`.toLowerCase();
          matches = options.searchMode === 'exact'
            ? domicilio === query
            : domicilio.includes(query);
          break;
        case 'colonia':
          matches = options.searchMode === 'exact'
            ? person.colonia === query
            : person.colonia.toLowerCase().includes(query);
          break;
        case 'telefono':
          matches = options.searchMode === 'exact'
            ? person.telefono === query
            : (person.telefono || '').toLowerCase().includes(query);
          break;
        case 'all':
        default:
          const allText = `${person.nombreCompleto} ${person.calle} ${person.numeroCasa} ${person.colonia} ${person.telefono || ''} ${(person.numeroVisita || 0) > 0 ? `visita ${person.numeroVisita}` : 'sin visita'}`.toLowerCase();
          matches = options.searchMode === 'exact'
            ? allText === query
            : allText.includes(query);
      }

      if (!matches) return false;
    }

    if (options.colonia && person.colonia !== options.colonia) {
      return false;
    }

    if (options.calle && person.calle !== options.calle) {
      return false;
    }

    if (options.numero && person.numeroCasa !== options.numero) {
      return false;
    }

    if (options.estados.length > 0) {
      if (options.estadosMode === 'all') {
        return options.estados.every(estado => person.estados.includes(estado));
      } else {
        return options.estados.some(estado => person.estados.includes(estado));
      }
    }

    return true;
  });
};
