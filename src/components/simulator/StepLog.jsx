import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Search, Info, PartyPopper } from 'lucide-react';

const ICONS = {
  info: Info, searching: Search, scanning: Search,
  'scanning-fit': CheckCircle, success: CheckCircle, error: XCircle, complete: PartyPopper,
};

const COLORS = {
  info: 'text-primary', searching: 'text-amber-500', scanning: 'text-amber-400',
  'scanning-fit': 'text-emerald-400', success: 'text-emerald-500', error: 'text-destructive', complete: 'text-primary',
};

const BG_COLORS = {
  info: 'bg-primary/5 border-primary/20', searching: 'bg-amber-500/5 border-amber-500/20',
  scanning: 'bg-amber-400/5 border-amber-400/20', 'scanning-fit': 'bg-emerald-400/5 border-emerald-400/20',
  success: 'bg-emerald-500/5 border-emerald-500/20', error: 'bg-destructive/5 border-destructive/20',
  complete: 'bg-primary/5 border-primary/20',
};

export default function StepLog({ steps, currentStep }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [currentStep]);

  const visibleSteps = steps.slice(0, currentStep + 1);

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Execution Log</h3>
      <div ref={scrollRef} className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {visibleSteps.map((step, idx) => {
          const Icon = ICONS[step.type];
          return (
            <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-2 text-xs p-2 rounded-md border ${BG_COLORS[step.type]}`}>
              <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${COLORS[step.type]}`} />
              <span className="font-mono leading-relaxed">{step.message}</span>
            </motion.div>
          );
        })}
        {visibleSteps.length === 0 && (
          <p className="text-xs text-muted-foreground italic text-center py-4">Run a simulation to see the execution log</p>
        )}
      </div>
    </div>
  );
}
