import { useState } from 'react';
import { Plus, Play, RotateCcw, Shuffle, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProcessTable from './ProcessTable';

let processCounter = 0;

function createProcess(name, size) {
  processCounter++;
  return { id: `p-${processCounter}`, name, size };
}

export default function InputPanel({
  totalMemory, setTotalMemory, processes, setProcesses,
  algorithm, setAlgorithm, onRun, onReset, onCompare, isRunning,
}) {
  const [memoryInput, setMemoryInput] = useState(String(totalMemory));

  const handleAddProcess = () => {
    const nextNum = processes.length + 1;
    setProcesses([...processes, createProcess(`P${nextNum}`, 50)]);
  };

  const handleUpdateProcess = (id, field, value) => {
    setProcesses(processes.map((p) => p.id === id ? { ...p, [field]: field === 'size' ? Number(value) || 0 : value } : p));
  };

  const handleRemoveProcess = (id) => { setProcesses(processes.filter((p) => p.id !== id)); };

  const handleMemoryChange = (e) => {
    setMemoryInput(e.target.value);
    const val = Number(e.target.value);
    if (val > 0) setTotalMemory(val);
  };

  const handleGenerateRandom = () => {
    const memSize = Math.floor(Math.random() * 900 + 200);
    setTotalMemory(memSize);
    setMemoryInput(String(memSize));
    const count = Math.floor(Math.random() * 4 + 3);
    const newProcesses = [];
    for (let i = 0; i < count; i++) {
      newProcesses.push(createProcess(`P${i + 1}`, Math.floor(Math.random() * (memSize / 3) + 10)));
    }
    setProcesses(newProcesses);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-5 flex-1 overflow-y-auto pr-1">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Memory (KB)</Label>
          <Input type="number" value={memoryInput} onChange={handleMemoryChange} disabled={isRunning} min={1}
            className="h-10 font-mono text-base bg-secondary/50 border-border/50 focus:border-primary" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Algorithm</Label>
          <Select value={algorithm} onValueChange={setAlgorithm} disabled={isRunning}>
            <SelectTrigger className="h-10 bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="first-fit">First Fit</SelectItem>
              <SelectItem value="best-fit">Best Fit</SelectItem>
              <SelectItem value="worst-fit">Worst Fit</SelectItem>
              <SelectItem value="next-fit">Next Fit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Processes</Label>
            <span className="text-xs text-muted-foreground">{processes.length} total</span>
          </div>
          <ProcessTable processes={processes} onUpdate={handleUpdateProcess} onRemove={handleRemoveProcess} disabled={isRunning} />
          <Button variant="outline" size="sm" onClick={handleAddProcess} disabled={isRunning}
            className="w-full border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Process
          </Button>
        </div>
      </div>

      <div className="space-y-2 pt-4 mt-4 border-t border-border/50">
        <Button onClick={onRun} disabled={isRunning || processes.length === 0}
          className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          <Play className="h-4 w-4 mr-2" /> Run Simulation
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerateRandom} disabled={isRunning} className="h-9">
            <Shuffle className="h-3.5 w-3.5 mr-1.5" /> Random
          </Button>
          <Button variant="outline" size="sm" onClick={onReset} className="h-9">
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset
          </Button>
        </div>
        <Button variant="secondary" size="sm" onClick={onCompare} disabled={isRunning || processes.length === 0} className="w-full h-9">
          <GitCompare className="h-3.5 w-3.5 mr-2" /> Compare All Algorithms
        </Button>
      </div>
    </div>
  );
}
