import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Cpu, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import InputPanel from '../components/simulator/InputPanel';
import MemoryVisualization from '../components/simulator/MemoryVisualization';
import StepLog from '../components/simulator/StepLog';
import StepControls from '../components/simulator/StepControls';
import ResultsPanel from '../components/simulator/ResultsPanel';
import ComparisonTable from '../components/simulator/ComparisonTable';
import EducationalSection from '../components/simulator/EducationalSection';
import MemoryTimeline from '../components/simulator/MemoryTimeline';
import {
  createInitialMemory,
  generateAllocationSteps,
  compareAlgorithms,
  deallocateProcess,
  compactMemory,
} from '../utils/memoryAllocator';

export default function Home() {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(true);
  const [totalMemory, setTotalMemory] = useState(512);
  const [processes, setProcesses] = useState([
    { id: 'p-init-1', name: 'P1', size: 100 },
    { id: 'p-init-2', name: 'P2', size: 200 },
    { id: 'p-init-3', name: 'P3', size: 80 },
    { id: 'p-init-4', name: 'P4', size: 60 },
  ]);
  const [algorithm, setAlgorithm] = useState('first-fit');
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoSpeed, setAutoSpeed] = useState(1000);
  const autoPlayRef = useRef(null);
  const [liveBlocks, setLiveBlocks] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);

  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);

  useEffect(() => {
    if (isAutoPlaying && currentStep < steps.length - 1) {
      autoPlayRef.current = setTimeout(() => { setCurrentStep((s) => s + 1); }, autoSpeed);
    } else if (isAutoPlaying && currentStep >= steps.length - 1) {
      setIsAutoPlaying(false);
    }
    return () => clearTimeout(autoPlayRef.current);
  }, [isAutoPlaying, currentStep, steps.length, autoSpeed]);

  const currentBlocks =
    liveBlocks !== null
      ? liveBlocks
      : currentStep >= 0 && steps[currentStep]
      ? steps[currentStep].blocks
      : createInitialMemory(totalMemory);

  const currentStepData = steps[currentStep];
  const highlightProcess = currentStepData?.processName ?? null;
  const scanningBlockId =
    currentStepData?.type === 'scanning' || currentStepData?.type === 'scanning-fit'
      ? currentStepData.scanningBlockId : null;
  const scanFitBlockId =
    currentStepData?.type === 'scanning-fit' ? currentStepData.scanningBlockId : null;

  const handleRun = useCallback(() => {
    const invalidProcess = processes.find((p) => !p.name || p.size <= 0);
    if (invalidProcess) { toast({ title: 'Invalid process', description: 'All processes must have a name and size > 0', variant: 'destructive' }); return; }
    if (totalMemory <= 0) { toast({ title: 'Invalid memory', description: 'Total memory must be > 0', variant: 'destructive' }); return; }
    const coloredProcesses = processes.map((p, i) => ({ ...p, colorIndex: i }));
    const newSteps = generateAllocationSteps(totalMemory, coloredProcesses, algorithm);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsRunning(true);
    setIsAutoPlaying(false);
    setLiveBlocks(null);
    setComparisonResults(null);
  }, [totalMemory, processes, algorithm, toast]);

  const handleReset = useCallback(() => {
    setSteps([]); setCurrentStep(-1); setIsRunning(false);
    setIsAutoPlaying(false); setLiveBlocks(null); setComparisonResults(null);
  }, []);

  const handleNextStep = useCallback(() => {
    if (currentStep < steps.length - 1) { setLiveBlocks(null); setCurrentStep((s) => s + 1); }
  }, [currentStep, steps.length]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 0) { setLiveBlocks(null); setCurrentStep((s) => s - 1); }
  }, [currentStep]);

  const handleToggleAutoPlay = useCallback(() => { setLiveBlocks(null); setIsAutoPlaying((v) => !v); }, []);
  const handleRestart = useCallback(() => { setCurrentStep(0); setIsAutoPlaying(false); setLiveBlocks(null); }, []);

  useEffect(() => {
    const handler = (e) => {
      if (!isRunning) return;
      if (e.key === 'ArrowRight' && !isAutoPlaying) handleNextStep();
      if (e.key === 'ArrowLeft' && !isAutoPlaying) handlePrevStep();
      if (e.key === ' ') { e.preventDefault(); handleToggleAutoPlay(); }
      if (e.key === 'r') handleRestart();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isRunning, isAutoPlaying, handleNextStep, handlePrevStep, handleToggleAutoPlay, handleRestart]);

  const handleDeallocate = useCallback((processName) => {
    const base = liveBlocks ?? (currentStep >= 0 && steps[currentStep] ? steps[currentStep].blocks : null);
    if (!base) return;
    const newBlocks = deallocateProcess(base, processName);
    setLiveBlocks(newBlocks);
    setIsAutoPlaying(false);
    toast({ title: `Deallocated ${processName}`, description: 'Memory block freed.' });
  }, [liveBlocks, currentStep, steps, toast]);

  const handleCompact = useCallback(() => {
    const base = liveBlocks ?? (currentStep >= 0 && steps[currentStep] ? steps[currentStep].blocks : null);
    if (!base) return;
    const newBlocks = compactMemory(base);
    setLiveBlocks(newBlocks);
    toast({ title: 'Memory compacted', description: 'All processes moved to start of memory.' });
  }, [liveBlocks, currentStep, steps, toast]);

  const handleCompare = useCallback(() => {
    const invalidProcess = processes.find((p) => !p.name || p.size <= 0);
    if (invalidProcess) { toast({ title: 'Invalid process', description: 'All processes must have a name and size > 0', variant: 'destructive' }); return; }
    const coloredProcesses = processes.map((p, i) => ({ ...p, colorIndex: i }));
    const results = compareAlgorithms(totalMemory, coloredProcesses);
    setComparisonResults(results);
  }, [totalMemory, processes, toast]);

  const isComplete = currentStep >= steps.length - 1 && steps.length > 0;
  const hasProcesses = currentBlocks.some((b) => b.type === 'process');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Cpu className="h-5 w-5 text-primary" /></div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Memory Allocation Simulator</h1>
              <p className="text-[10px] text-muted-foreground hidden sm:block">Interactive OS memory management visualization</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isRunning && hasProcesses && (
              <Button variant="outline" size="sm" onClick={handleCompact} className="h-8 text-xs gap-1.5">
                <Minimize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Compact</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)} className="h-9 w-9">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-1 text-[10px] text-muted-foreground/50 text-right hidden md:block">
        Keyboard: ← prev · → next · Space play/pause · R restart
      </div>

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_260px] gap-6">
          <div className="lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <div className="rounded-xl bg-card border border-border/50 p-4 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Configuration</h2>
              <InputPanel
                totalMemory={totalMemory} setTotalMemory={setTotalMemory}
                processes={processes} setProcesses={setProcesses}
                algorithm={algorithm} setAlgorithm={setAlgorithm}
                onRun={handleRun} onReset={handleReset} onCompare={handleCompare}
                isRunning={isRunning}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-card border border-border/50 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Memory Map</h2>
                <div className="flex items-center gap-2">
                  {liveBlocks && <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">LIVE</span>}
                  {isRunning && <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary">{algorithm.replace('-', ' ').toUpperCase()}</span>}
                </div>
              </div>
              <MemoryVisualization
                blocks={currentBlocks} totalSize={totalMemory}
                highlightProcess={highlightProcess}
                scanningBlockId={scanningBlockId} scanFitBlockId={scanFitBlockId}
                onDeallocate={isRunning ? handleDeallocate : null}
              />
            </div>

            {isRunning && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-card border border-border/50 p-4 shadow-sm">
                <StepControls
                  currentStep={currentStep} totalSteps={steps.length}
                  isAutoPlaying={isAutoPlaying}
                  onNextStep={handleNextStep} onPrevStep={handlePrevStep}
                  onToggleAutoPlay={handleToggleAutoPlay} onRestart={handleRestart}
                  isComplete={isComplete} speed={autoSpeed} onSpeedChange={setAutoSpeed}
                />
              </motion.div>
            )}

            {isRunning && steps.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-card border border-border/50 p-4 shadow-sm">
                <MemoryTimeline steps={steps} currentStep={currentStep} totalSize={totalMemory}
                  onJumpToStep={(s) => { setLiveBlocks(null); setCurrentStep(s); setIsAutoPlaying(false); }} />
              </motion.div>
            )}

            {isRunning && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-card border border-border/50 p-4 shadow-sm">
                <StepLog steps={steps} currentStep={currentStep} />
              </motion.div>
            )}

            <AnimatePresence>
              {comparisonResults && (
                <ComparisonTable results={comparisonResults} onClose={() => setComparisonResults(null)} />
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <div className="rounded-xl bg-card border border-border/50 p-4 shadow-sm">
              <ResultsPanel blocks={currentBlocks} totalSize={totalMemory} />
            </div>
            <div className="rounded-xl bg-card border border-border/50 p-4 shadow-sm">
              <EducationalSection />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
