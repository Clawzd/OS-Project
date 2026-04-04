import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen } from 'lucide-react';

const ALGORITHMS = [
  {
    id: 'first-fit', name: 'First Fit',
    description: 'Allocates the process to the first free block that is large enough. Scans memory from the beginning.',
    pros: ['Fast — stops at first match', 'Simple to implement', 'Low overhead'],
    cons: ['Can cause fragmentation at the start', 'May leave large holes at the end unused'],
    color: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    id: 'best-fit', name: 'Best Fit',
    description: 'Scans all free blocks and chooses the smallest one that fits. Aims to minimize wasted space.',
    pros: ['Minimizes wasted space per block', 'Better memory utilization', 'Reduces large fragments'],
    cons: ['Slower — must scan all blocks', 'Creates many tiny fragments', 'Can increase external fragmentation'],
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  {
    id: 'worst-fit', name: 'Worst Fit',
    description: 'Allocates to the largest available free block. Remaining space stays usable for other processes.',
    pros: ['Leaves larger remaining blocks', 'May reduce small fragments', 'Good for varied process sizes'],
    cons: ['Slowest — must find the maximum', 'Wastes large blocks quickly', 'Poor performance with many processes'],
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  {
    id: 'next-fit', name: 'Next Fit',
    description: 'Like First Fit, but resumes from where the last allocation was made instead of starting from the beginning.',
    pros: ['Faster than First Fit in some cases', 'Distributes allocations evenly', 'Avoids repeated scanning of busy start'],
    cons: ['Can miss good fits at the start', 'Fragmentation spreads across memory', 'Less predictable behavior'],
    color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  },
];

function AlgorithmCard({ algo }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-lg border ${algo.color} overflow-hidden`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-2.5 text-left">
        <span className="text-xs font-semibold">{algo.name}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-2">
              <p className="text-[11px] leading-relaxed text-foreground/80">{algo.description}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider mb-1">Pros</p>
                  <ul className="space-y-0.5">
                    {algo.pros.map((p, i) => <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1"><span className="text-emerald-500 mt-0.5">+</span> {p}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider mb-1">Cons</p>
                  <ul className="space-y-0.5">
                    {algo.cons.map((c, i) => <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1"><span className="text-destructive mt-0.5">−</span> {c}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EducationalSection() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Learn</h3>
      </div>
      <div className="space-y-2">
        {ALGORITHMS.map((algo) => <AlgorithmCard key={algo.id} algo={algo} />)}
      </div>
    </div>
  );
}
