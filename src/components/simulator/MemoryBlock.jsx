import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { getProcessColor, FREE_BLOCK_COLOR } from '../../utils/colors';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function MemoryBlock({
  block,
  totalSize,
  isHighlighted,
  isScanning,
  isScanFit,
  onDeallocate,
}) {
  const widthPercent = (block.size / totalSize) * 100;
  const isProcess = block.type === 'process';
  const color = isProcess ? getProcessColor(block.colorIndex) : FREE_BLOCK_COLOR;
  const showLabel = widthPercent > 6;
  const scanGlow = isScanFit
    ? '0 0 0 2px #34d399, 0 0 16px rgba(52,211,153,0.5)'
    : isScanning
      ? '0 0 0 2px #fbbf24, 0 0 12px rgba(251,191,36,0.4)'
      : 'none';

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            layout
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{
              opacity: 1, scaleX: 1,
              boxShadow: isHighlighted
                ? `0 0 20px ${color.bg}80, 0 0 40px ${color.bg}40`
                : scanGlow,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative overflow-hidden cursor-pointer group"
            style={{ width: `${widthPercent}%`, minWidth: '12px', backgroundColor: color.bg, height: '100%', borderRadius: '6px' }}
          >
            {isProcess && (
              <div className="absolute inset-0 opacity-20"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)' }} />
            )}
            {!isProcess && (
              <div className="absolute inset-0 opacity-30"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.05) 4px, rgba(255,255,255,0.05) 8px)' }} />
            )}
            {showLabel && (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-1" style={{ color: color.text }}>
                <span className="text-xs font-bold truncate leading-tight">{isProcess ? block.name : 'Free'}</span>
                <span className="text-[10px] opacity-80 font-mono leading-tight">{block.size} KB</span>
              </div>
            )}
            {isProcess && onDeallocate && (
              <button
                onClick={(e) => { e.stopPropagation(); onDeallocate(block.name); }}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 hover:bg-red-500/80 rounded-sm p-0.5"
                title={`Free ${block.name}`}
              >
                <X className="h-2.5 w-2.5 text-white" />
              </button>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="font-mono text-xs">
          <div className="space-y-0.5">
            <p className="font-semibold">{isProcess ? block.name : 'Free Space'}</p>
            <p>Size: {block.size} KB</p>
            <p>Start: {block.start} KB</p>
            <p>End: {block.start + block.size} KB</p>
            <p>{((block.size / totalSize) * 100).toFixed(1)}% of total</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
