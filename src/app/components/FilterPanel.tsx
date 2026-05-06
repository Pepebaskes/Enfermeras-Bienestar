import { PersonStatus, STATUS_LABELS } from '../models/person.model';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Card } from './ui/card';
import { Filter, X } from 'lucide-react';
import { CarnetFilter } from '../utils/filters';

interface FilterPanelProps {
  selectedEstados: PersonStatus[];
  estadosMode: 'any' | 'all';
  carnetFilter: CarnetFilter;
  onEstadosChange: (estados: PersonStatus[]) => void;
  onEstadosModeChange: (mode: 'any' | 'all') => void;
  onCarnetFilterChange: (filter: CarnetFilter) => void;
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

export function FilterPanel({
  selectedEstados,
  estadosMode,
  carnetFilter,
  onEstadosChange,
  onEstadosModeChange,
  onCarnetFilterChange,
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
        {(selectedEstados.length > 0 || carnetFilter !== 'all') && (
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
    </Card>
  );
}
