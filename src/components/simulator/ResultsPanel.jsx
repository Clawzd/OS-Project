import { motion } from 'framer-motion';
import { HardDrive, Cpu, Layers, AlertTriangle } from 'lucide-react';
import { calculateStats } from '../../utils/memoryAllocator';

function StatCard({ icon: Icon, label, value, subValue, color }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-secondary/40 border border-border/50 p-3 space-y-1">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-md ${color}`}><Icon className="h-3.5 w-3.5" /></div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-bold font-mono">{value}</p>
      {subValue && <p className="text-[10px] text-muted-foreground font-mono">{subValue}</p>}
    </motion.div>
  );
}

export default function ResultsPanel({ blocks, totalSize }) {
  const stats = calculateStats(blocks, totalSize);
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Memory Statistics</h3>
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={HardDrive} label="Total" value={`${stats.totalMemory} KB`} color="bg-primary/10 text-primary" />
        <StatCard icon={Cpu} label="Used" value={`${stats.usedMemory} KB`} subValue={`${stats.usedPercent}%`} color="bg-emerald-500/10 text-emerald-500" />
        <StatCard icon={Layers} label="Free" value={`${stats.freeMemory} KB`} subValue={`${stats.freePercent}%`} color="bg-amber-500/10 text-amber-500" />
        <StatCard icon={AlertTriangle} label="Fragments" value={stats.externalFragmentation} subValue={`${stats.freeBlocks.length} free block(s)`} color="bg-destructive/10 text-destructive" />
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>Memory Usage</span><span>{stats.usedPercent}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${stats.usedPercent}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent" />
        </div>
      </div>
      {stats.freeBlocks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Free Blocks</h4>
          <div className="space-y-1">
            {stats.freeBlocks.map((fb, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-mono px-2.5 py-1.5 rounded-md bg-secondary/40 border border-border/30">
                <span className="text-muted-foreground">{fb.start}–{fb.start + fb.size} KB</span>
                <span className="font-semibold">{fb.size} KB</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
