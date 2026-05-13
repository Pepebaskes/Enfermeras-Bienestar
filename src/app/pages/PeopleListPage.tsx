import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Person, PersonStatus } from '../models/person.model';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { SearchType, SearchMode, CarnetFilter } from '../utils/filters';
import { sortPersons, SortField, SortOrder } from '../utils/sorters';
import { PatientQueryOptions } from '../services/patientService';

interface PeopleListPageProps {
  persons: Person[];
  total: number;
  isLoading: boolean;
  onLoadPatients: (options: PatientQueryOptions, append?: boolean) => Promise<void>;
}

const PAGE_SIZE = 100;

export function PeopleListPage({ persons, total, isLoading, onLoadPatients }: PeopleListPageProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [searchMode, setSearchMode] = useState<SearchMode>('partial');
  const [selectedEstados, setSelectedEstados] = useState<PersonStatus[]>([]);
  const [estadosMode, setEstadosMode] = useState<'any' | 'all'>('any');
  const [carnetFilter, setCarnetFilter] = useState<CarnetFilter>('all');
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(0);

  const queryOptions = useMemo<PatientQueryOptions>(() => ({
    page,
    pageSize: PAGE_SIZE,
    searchQuery,
    searchType,
    searchMode,
    carnetFilter,
    estados: selectedEstados,
    estadosMode,
    sortField,
    sortOrder
  }), [page, searchQuery, searchType, searchMode, carnetFilter, selectedEstados, estadosMode, sortField, sortOrder]);

  useEffect(() => {
    onLoadPatients(queryOptions, page > 0);
  }, [queryOptions, onLoadPatients]);

  const visiblePersons = useMemo(() => {
    return sortPersons(persons, sortField, sortOrder);
  }, [persons, sortField, sortOrder]);

  const hasMore = persons.length < total;

  const handleSearchChange = (query: string, type: SearchType, mode: SearchMode) => {
    setPage(0);
    setSearchQuery(query);
    setSearchType(type);
    setSearchMode(mode);
  };

  const handleSort = (field: SortField) => {
    setPage(0);
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleClearFilters = () => {
    setPage(0);
    setSelectedEstados([]);
    setCarnetFilter('all');
    setSearchQuery('');
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-3xl">Listado de Personas</h1>
      </div>

      <Button
        onClick={() => navigate('/personas/nuevo')}
        className="w-full md:w-auto h-12"
        size="lg"
      >
        <Plus className="h-5 w-5 mr-2" />
        Nuevo Registro
      </Button>

      <SearchBar onSearchChange={handleSearchChange} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FilterPanel
            selectedEstados={selectedEstados}
            estadosMode={estadosMode}
            carnetFilter={carnetFilter}
            onEstadosChange={(estados) => {
              setPage(0);
              setSelectedEstados(estados);
            }}
            onEstadosModeChange={(mode) => {
              setPage(0);
              setEstadosMode(mode);
            }}
            onCarnetFilterChange={(filter) => {
              setPage(0);
              setCarnetFilter(filter);
            }}
            onClearFilters={handleClearFilters}
          />
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="text-sm text-gray-600">
            Mostrando {persons.length} de {total} registros
            {isLoading ? ' - cargando...' : ''}
          </div>
          <DataTable
            persons={visiblePersons}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
          />
          {hasMore && (
            <Button
              variant="outline"
              className="h-12 w-full"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : `Cargar ${Math.min(PAGE_SIZE, total - persons.length)} mas`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
