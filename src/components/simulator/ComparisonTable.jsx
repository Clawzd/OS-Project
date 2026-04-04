import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ALGO_LABELS = { 'first-fit': 'First Fit', 'best-fit': 'Best Fit', 'worst-fit': 'Worst Fit', 'next-fit': 'Next Fit' };

export default function ComparisonTable({ results, onClose }) {
  if (!results || results.length === 0) return null;
  const bestUsed = Math.max(...results.map(r => r.usedMemory));
  const bestFrag = Math.min(...results.map(r => r.externalFragmentation));
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="rounded-xl bg-card border border-border/50 overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border/50">
        <h3 className="text-sm font-semibold">Algorithm Comparison</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7"><X className="h-4 w-4" /></Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider">Algorithm</th>
              <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider">Used</th>
              <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider">Free</th>
              <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider">Fragments</th>
              <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground uppercase tracking-wider">Failed</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => (
              <tr key={r.algorithm} className={`border-b border-border/20 ${idx % 2 === 0 ? 'bg-secondary/10' : ''}`}>
                <td className="px-4 py-2.5 font-semibold font-mono">{ALGO_LABELS[r.algorithm]}</td>
                <td className={`px-4 py-2.5 text-right font-mono ${r.usedMemory === bestUsed ? 'text-emerald-500 font-bold' : ''}`}>
                  {r.usedMemory} KB ({r.usedPercent}%)
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{r.freeMemory} KB</td>
                <td className={`px-4 py-2.5 text-right font-mono ${r.externalFragmentation === bestFrag ? 'text-emerald-500 font-bold' : ''}`}>
                  {r.externalFragmentation}
                </td>
                <td className={`px-4 py-2.5 text-right font-mono ${r.failedAllocations > 0 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                  {r.failedAllocations}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
