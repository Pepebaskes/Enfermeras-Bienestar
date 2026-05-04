import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { exportToCSV, downloadCSV } from '../services/csvService';
import { Person } from '../models/person.model';
import { toast } from 'sonner';

interface ExportButtonProps {
  persons: Person[];
  className?: string;
}

export function ExportButton({ persons, className = '' }: ExportButtonProps) {
  const handleExport = () => {
    try {
      if (persons.length === 0) {
        toast.error('No hay registros para exportar');
        return;
      }

      const csvContent = exportToCSV(persons);
      const filename = `enfermeria_campo_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
      toast.success(`${persons.length} registros exportados exitosamente`);
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      toast.error('Error al exportar los datos');
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      className={`h-14 ${className}`}
    >
      <Download className="h-4 w-4 mr-2" />
      Exportar CSV
    </Button>
  );
}
