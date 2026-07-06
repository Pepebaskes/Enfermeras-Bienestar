import { PersonStatus, STATUS_LABELS } from '../models/person.model';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Card } from './ui/card';
import { Filter, X } from 'lucide-react';
import { CarnetFilter } from '../utils/filters';

interface FilterPanelProps {
  selectedEstados: PersonStatus[];
  estadosMode: 'any' | 'all';
  carnetFilter: CarnetFilter;
  visitPresence: 'all' | 'with' | 'without';
  visitNumber: string;
  visitDateFrom: string;
  visitDateTo: string;
  onEstadosChange: (estados: PersonStatus[]) => void;
  onEstadosModeChange: (mode: 'any' | 'all') => void;
  onCarnetFilterChange: (filter: CarnetFilter) => void;
  onVisitPresenceChange: (filter: 'all' | 'with' | 'without') => void;
  onVisitNumberChange: (visitNumber: string) => void;
  onVisitDateFromChange: (date: string) => void;
  onVisitDateToChange: (date: string) => void;
  onClearFilters: () => void;
}

const allEstados: PersonStatus[] = [
  'visitado',
  'fuera_del_pais',
  'sin_visita',
  'no_encontrado',
  'no_quiso_programa',
  'cambio_domicilio',
  'finado'
];

const toDateInputValue = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const getWeekStart = () => {
  const today = new Date();
  const day = today.getDay() || 7;
  today.setDate(today.getDate() - day + 1);
  return today;
};

export function FilterPanel({
  selectedEstados,
  estadosMode,
  carnetFilter,
  visitPresence,
  visitNumber,
  visitDateFrom,
  visitDateTo,
  onEstadosChange,
  onEstadosModeChange,
  onCarnetFilterChange,
  onVisitPresenceChange,
  onVisitNumberChange,
  onVisitDateFromChange,
  onVisitDateToChange,
  onClearFilters
}: FilterPanelProps) {
  const handleEstadoToggle = (estado: PersonStatus) => {
    if (selectedEstados.includes(estado)) {
      onEstadosChange(selectedEstados.filter(e => e !== estado));
    } else {
      onEstadosChange([...selectedEstados, estado]);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <span>Filtros</span>
        </div>
        {(selectedEstados.length > 0 || carnetFilter !== 'all' || visitPresence !== 'all' || visitNumber || visitDateFrom || visitDateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label>Carnet</Label>
        <RadioGroup value={carnetFilter} onValueChange={(value) => onCarnetFilterChange(value as CarnetFilter)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="carnet-all" />
            <Label htmlFor="carnet-all" className="text-sm cursor-pointer">
              Todos
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="with" id="carnet-with" />
            <Label htmlFor="carnet-with" className="text-sm cursor-pointer">
              Con carnet
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="without" id="carnet-without" />
            <Label htmlFor="carnet-without" className="text-sm cursor-pointer">
              Sin carnet
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Estados</Label>
        <div className="space-y-2">
          {allEstados.map((estado) => (
            <div key={estado} className="flex items-center space-x-2">
              <Checkbox
                id={estado}
                checked={selectedEstados.includes(estado)}
                onCheckedChange={() => handleEstadoToggle(estado)}
              />
              <label
                htmlFor={estado}
                className="text-sm cursor-pointer flex-1"
              >
                {STATUS_LABELS[estado]}
              </label>
            </div>
          ))}
        </div>
      </div>

      {selectedEstados.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <Label>Modo de filtro</Label>
          <RadioGroup value={estadosMode} onValueChange={(value) => onEstadosModeChange(value as 'any' | 'all')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="any" id="any" />
              <Label htmlFor="any" className="text-sm cursor-pointer">
                Cualquiera de los estados
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="text-sm cursor-pointer">
                Todos los estados
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      <div className="space-y-3 border-t pt-3">
        <Label>Visitas</Label>
        <RadioGroup value={visitPresence} onValueChange={(value) => onVisitPresenceChange(value as 'all' | 'with' | 'without')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="visit-all" />
            <Label htmlFor="visit-all" className="text-sm cursor-pointer">
              Todas
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="with" id="visit-with" />
            <Label htmlFor="visit-with" className="text-sm cursor-pointer">
              Con visita
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="without" id="visit-without" />
            <Label htmlFor="visit-without" className="text-sm cursor-pointer">
              Sin visita
            </Label>
          </div>
        </RadioGroup>

        <div className="space-y-2">
          <Label htmlFor="visit-number">Numero de visita exacto</Label>
          <Input
            id="visit-number"
            type="number"
            min={0}
            value={visitNumber}
            onChange={(event) => onVisitNumberChange(event.target.value)}
            placeholder="Ej. 1, 2, 3"
          />
        </div>
      </div>

      <div className="space-y-3 border-t pt-3">
        <Label>Fecha de visita</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10"
            onClick={() => {
              const today = toDateInputValue(new Date());
              onVisitDateFromChange(today);
              onVisitDateToChange(today);
            }}
          >
            Hoy
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10"
            onClick={() => {
              onVisitDateFromChange(toDateInputValue(getWeekStart()));
              onVisitDateToChange(toDateInputValue(new Date()));
            }}
          >
            Semana
          </Button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="visit-date-from" className="text-xs text-muted-foreground">Desde</Label>
          <Input
            id="visit-date-from"
            type="date"
            value={visitDateFrom}
            onChange={(event) => onVisitDateFromChange(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="visit-date-to" className="text-xs text-muted-foreground">Hasta</Label>
          <Input
            id="visit-date-to"
            type="date"
            value={visitDateTo}
            onChange={(event) => onVisitDateToChange(event.target.value)}
          />
        </div>
      </div>
    </Card>
  );
}
