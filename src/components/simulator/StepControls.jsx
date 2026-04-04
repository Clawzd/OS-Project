import { SkipForward, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function StepControls({
  currentStep, totalSteps, isAutoPlaying,
  onNextStep, onPrevStep, onToggleAutoPlay, onRestart,
  isComplete, speed, onSpeedChange,
}) {
  const speedLabel = speed <= 400 ? 'Fast' : speed <= 1000 ? 'Normal' : speed <= 2000 ? 'Slow' : 'Very Slow';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onRestart} className="h-8 px-3">
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Restart
        </Button>
        <Button variant="outline" size="sm" onClick={onPrevStep} disabled={currentStep <= 0 || isAutoPlaying} className="h-8 px-3">
          <SkipForward className="h-3.5 w-3.5 mr-1.5 rotate-180" /> Prev
        </Button>
        <Button variant="outline" size="sm" onClick={onToggleAutoPlay} disabled={isComplete} className="h-8 px-3">
          {isAutoPlaying
            ? <span className="flex items-center"><Pause className="h-3.5 w-3.5 mr-1.5" />Pause</span>
            : <span className="flex items-center"><Play className="h-3.5 w-3.5 mr-1.5" />Auto</span>}
        </Button>
        <Button size="sm" onClick={onNextStep} disabled={isComplete || isAutoPlaying}
          className="h-8 px-3 bg-primary hover:bg-primary/90">
          <SkipForward className="h-3.5 w-3.5 mr-1.5" /> Next Step
        </Button>
        <div className="ml-auto text-xs font-mono text-muted-foreground">
          Step {currentStep + 1} / {totalSteps}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-muted-foreground shrink-0">Speed:</span>
        <Slider min={200} max={3000} step={100} value={[speed]} onValueChange={([v]) => onSpeedChange(v)} className="flex-1" />
        <span className="text-[11px] font-mono text-muted-foreground w-16 text-right shrink-0">{speedLabel}</span>
      </div>
    </div>
  );
}
