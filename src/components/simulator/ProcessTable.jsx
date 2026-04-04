import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getProcessColor } from '../../utils/colors';

export default function ProcessTable({ processes, onUpdate, onRemove, disabled }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
        <span className="w-3"></span>
        <span>Name</span>
        <span>Size (KB)</span>
        <span className="w-8"></span>
      </div>
      {processes.map((proc, idx) => {
        const color = getProcessColor(idx);
        return (
          <div key={proc.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center group">
            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color.bg }} />
            <Input value={proc.name} onChange={(e) => onUpdate(proc.id, 'name', e.target.value)} disabled={disabled}
              className="h-8 text-sm font-mono bg-secondary/50 border-border/50 focus:border-primary" />
            <Input type="number" value={proc.size} onChange={(e) => onUpdate(proc.id, 'size', e.target.value)}
              disabled={disabled} min={1} className="h-8 text-sm font-mono bg-secondary/50 border-border/50 focus:border-primary" />
            <Button variant="ghost" size="icon" onClick={() => onRemove(proc.id)} disabled={disabled}
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
