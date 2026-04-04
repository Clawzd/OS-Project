import { motion, AnimatePresence } from 'framer-motion';
import MemoryBlock from './MemoryBlock';

export default function MemoryVisualization({
  blocks,
  totalSize,
  highlightProcess,
  scanningBlockId,
  scanFitBlockId,
  onDeallocate,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground px-1">
        <span>0 KB</span>
        <span>{Math.round(totalSize / 4)} KB</span>
        <span>{Math.round(totalSize / 2)} KB</span>
        <span>{Math.round((totalSize * 3) / 4)} KB</span>
        <span>{totalSize} KB</span>
      </div>

      <div className="relative">
        <div className="h-20 md:h-24 rounded-lg bg-secondary/40 border border-border/50 flex gap-[2px] p-[3px] overflow-hidden">
          <AnimatePresence mode="popLayout">
            {blocks.map((block) => (
              <MemoryBlock
                key={block.id}
                block={block}
                totalSize={totalSize}
                isHighlighted={highlightProcess && block.name === highlightProcess}
                isScanning={scanningBlockId === block.id}
                isScanFit={scanFitBlockId === block.id}
                onDeallocate={onDeallocate}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {blocks.filter((b) => b.type === 'process').map((block, idx) => (
          <motion.div key={block.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }} className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: `hsl(${(block.colorIndex * 37 + 240) % 360}, 80%, 60%)` }} />
            <span className="font-mono text-muted-foreground">{block.name}: {block.size}KB</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
