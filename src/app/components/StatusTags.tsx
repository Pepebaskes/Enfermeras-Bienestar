import { PersonStatus, STATUS_LABELS, STATUS_COLORS } from '../models/person.model';
import { Badge } from './ui/badge';

interface StatusTagsProps {
  estados: PersonStatus[];
  className?: string;
}

export function StatusTags({ estados, className = '' }: StatusTagsProps) {
  if (estados.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {estados.map((estado) => (
        <Badge
          key={estado}
          variant="outline"
          className={`${STATUS_COLORS[estado]} border text-xs px-2 py-0.5`}
        >
          {STATUS_LABELS[estado]}
        </Badge>
      ))}
    </div>
  );
}
