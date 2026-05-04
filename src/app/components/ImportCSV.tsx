import { useRef } from 'react';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';
import { parseCSV } from '../services/csvService';
import { Person } from '../models/person.model';
import { toast } from 'sonner';

interface ImportCSVProps {
  onImport: (persons: Person[]) => void;
}

export function ImportCSV({ onImport }: ImportCSVProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const persons = parseCSV(csvText);

        if (persons.length === 0) {
          toast.error('No se encontraron registros válidos en el archivo CSV');
          return;
        }

        onImport(persons);
        toast.success(`${persons.length} registros importados exitosamente`);

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error al importar CSV:', error);
        toast.error('Error al leer el archivo CSV. Verifica el formato.');
      }
    };

    reader.readAsText(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <Button
        onClick={handleButtonClick}
        variant="outline"
        className="h-14"
      >
        <Upload className="h-4 w-4 mr-2" />
        Importar CSV
      </Button>
    </>
  );
}
