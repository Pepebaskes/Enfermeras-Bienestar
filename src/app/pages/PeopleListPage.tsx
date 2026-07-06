import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Person, PersonStatus } from '../models/person.model';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/ui/button';
import { ArrowLeft, Plus, SlidersHorizontal, X } from 'lucide-react';
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
  const [visitPresence, setVisitPresence] = useState<'all' | 'with' | 'without'>('all');
  const [visitNumber, setVisitNumber] = useState('');
  const [visitDateFrom, setVisitDateFrom] = useState('');
  const [visitDateTo, setVisitDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const queryOptions = useMemo<PatientQueryOptions>(() => ({
    page,
    pageSize: PAGE_SIZE,
    searchQuery,
    searchType,
    searchMode,
    carnetFilter,
    visitPresence,
    visitNumber: visitNumber.trim() === '' ? null : Number(visitNumber),
    visitDateFrom: visitDateFrom || undefined,
    visitDateTo: visitDateTo || undefined,
    estados: selectedEstados,
    estadosMode,
    sortField,
    sortOrder
  }), [page, searchQuery, searchType, searchMode, carnetFilter, visitPresence, visitNumber, visitDateFrom, visitDateTo, selectedEstados, estadosMode, sortField, sortOrder]);

  useEffect(() => {
    onLoadPatients(queryOptions, page > 0);
  }, [queryOptions, onLoadPatients]);

  const visiblePersons = useMemo(() => {
    return sortPersons(persons, sortField, sortOrder);
  }, [persons, sortField, sortOrder]);

  const hasMore = persons.length < total;
  const activeFilterCount = [
    selectedEstados.length > 0,
    carnetFilter !== 'all',
    visitPresence !== 'all',
    visitNumber.trim() !== '',
    visitDateFrom !== '',
    visitDateTo !== ''
  ].filter(Boolean).length;

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
    setVisitPresence('all');
    setVisitNumber('');
    setVisitDateFrom('');
    setVisitDateTo('');
    setSearchQuery('');
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl leading-tight sm:text-3xl">Pacientes</h1>
      </div>

      <Button
        onClick={() => navigate('/personas/nuevo')}
        className="h-12 w-full md:w-auto"
        size="lg"
      >
        <Plus className="h-5 w-5 mr-2" />
        Nuevo Registro
      </Button>

      <SearchBar onSearchChange={handleSearchChange} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:hidden">
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full justify-between"
            onClick={() => setShowMobileFilters(prev => !prev)}
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="size-4" />
              Filtros
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">
                  {activeFilterCount}
                </span>
              )}
            </span>
            {showMobileFilters ? <X className="size-4" /> : null}
          </Button>
        </div>

        <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:col-span-1 lg:block`}>
          <FilterPanel
            selectedEstados={selectedEstados}
            estadosMode={estadosMode}
            carnetFilter={carnetFilter}
            visitPresence={visitPresence}
            visitNumber={visitNumber}
            visitDateFrom={visitDateFrom}
            visitDateTo={visitDateTo}
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
            onVisitPresenceChange={(filter) => {
              setPage(0);
              setVisitPresence(filter);
            }}
            onVisitNumberChange={(value) => {
              setPage(0);
              setVisitNumber(value);
            }}
            onVisitDateFromChange={(date) => {
              setPage(0);
              setVisitDateFrom(date);
            }}
            onVisitDateToChange={(date) => {
              setPage(0);
              setVisitDateTo(date);
            }}
            onClearFilters={handleClearFilters}
          />
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col gap-1 rounded-lg border bg-white px-3 py-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Mostrando {persons.length} de {total} registros
            </span>
            <span>
              {isLoading ? 'Cargando...' : activeFilterCount > 0 ? `${activeFilterCount} filtros activos` : 'Sin filtros activos'}
            </span>
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
