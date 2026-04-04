export function createInitialMemory(totalSize) {
  return [{ id: 'free-0', type: 'free', size: totalSize, start: 0 }];
}

function mergeFreeBlocks(blocks) {
  const merged = [...blocks];
  let i = 0;
  while (i < merged.length - 1) {
    if (merged[i].type === 'free' && merged[i + 1].type === 'free') {
      merged.splice(i, 2, {
        id: `free-${merged[i].start}`,
        type: 'free',
        size: merged[i].size + merged[i + 1].size,
        start: merged[i].start,
      });
    } else { i++; }
  }
  return merged;
}

function allocateProcess(blocks, blockIndex, process) {
  const newBlocks = [...blocks];
  const freeBlock = newBlocks[blockIndex];
  const remaining = freeBlock.size - process.size;

  const allocatedBlock = {
    id: `proc-${process.name}`,
    type: 'process',
    name: process.name,
    size: process.size,
    start: freeBlock.start,
    colorIndex: process.colorIndex,
  };

  if (remaining > 0) {
    const remainingBlock = {
      id: `free-${freeBlock.start + process.size}`,
      type: 'free',
      size: remaining,
      start: freeBlock.start + process.size,
    };
    newBlocks.splice(blockIndex, 1, allocatedBlock, remainingBlock);
  } else {
    newBlocks.splice(blockIndex, 1, allocatedBlock);
  }
  return newBlocks;
}

export function deallocateProcess(blocks, processName) {
  const newBlocks = blocks.map((b) =>
    b.name === processName
      ? { id: `free-${b.start}`, type: 'free', size: b.size, start: b.start }
      : b
  );
  return mergeFreeBlocks(newBlocks);
}

export function compactMemory(blocks) {
  const processes = blocks.filter((b) => b.type === 'process');
  const totalFree = blocks.filter((b) => b.type === 'free').reduce((sum, b) => sum + b.size, 0);
  let addr = 0;
  const compacted = processes.map((p) => {
    const block = { ...p, start: addr };
    addr += p.size;
    return block;
  });
  if (totalFree > 0) {
    compacted.push({ id: `free-${addr}`, type: 'free', size: totalFree, start: addr });
  }
  return compacted;
}

let nextFitCursor = 0;

function* scanFirstFit(blocks, processSize) {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].type === 'free') {
      const fits = blocks[i].size >= processSize;
      yield { scanIdx: i, fits };
      if (fits) return i;
    }
  }
  return -1;
}

function* scanBestFit(blocks, processSize) {
  let bestIdx = -1, bestSize = Infinity;
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].type === 'free') {
      const fits = blocks[i].size >= processSize;
      yield { scanIdx: i, fits };
      if (fits && blocks[i].size < bestSize) { bestIdx = i; bestSize = blocks[i].size; }
    }
  }
  return bestIdx;
}

function* scanWorstFit(blocks, processSize) {
  let worstIdx = -1, worstSize = -1;
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].type === 'free') {
      const fits = blocks[i].size >= processSize;
      yield { scanIdx: i, fits };
      if (fits && blocks[i].size > worstSize) { worstIdx = i; worstSize = blocks[i].size; }
    }
  }
  return worstIdx;
}

function* scanNextFit(blocks, processSize) {
  const n = blocks.length;
  for (let offset = 0; offset < n; offset++) {
    const i = (nextFitCursor + offset) % n;
    if (blocks[i].type === 'free') {
      const fits = blocks[i].size >= processSize;
      yield { scanIdx: i, fits };
      if (fits) { nextFitCursor = i; return i; }
    }
  }
  return -1;
}

const SCANNERS = {
  'first-fit': scanFirstFit,
  'best-fit': scanBestFit,
  'worst-fit': scanWorstFit,
  'next-fit': scanNextFit,
};

export function generateAllocationSteps(totalSize, processes, algorithm) {
  const steps = [];
  let currentBlocks = createInitialMemory(totalSize);
  nextFitCursor = 0;

  steps.push({ blocks: [...currentBlocks], message: `Memory initialized: ${totalSize} KB total`, type: 'info', processName: null, scanningBlockId: null });

  for (const process of processes) {
    steps.push({ blocks: [...currentBlocks], message: `Searching for space to allocate ${process.name} (${process.size} KB)...`, type: 'searching', processName: process.name, scanningBlockId: null });

    const scanner = SCANNERS[algorithm](currentBlocks, process.size);
    let foundIdx = -1;

    while (true) {
      const result = scanner.next();
      if (result.done) { foundIdx = result.value; break; }
      const { scanIdx, fits } = result.value;
      const block = currentBlocks[scanIdx];
      steps.push({
        blocks: [...currentBlocks],
        message: fits ? `  ✓ Block at ${block.start} KB (${block.size} KB) — fits!` : `  ✗ Block at ${block.start} KB (${block.size} KB) — too small`,
        type: fits ? 'scanning-fit' : 'scanning',
        processName: process.name,
        scanningBlockId: block.id,
      });
    }

    if (foundIdx === -1) {
      steps.push({ blocks: [...currentBlocks], message: `✗ Failed: No contiguous block large enough for ${process.name} (${process.size} KB)`, type: 'error', processName: process.name, scanningBlockId: null });
    } else {
      const blockStart = currentBlocks[foundIdx].start;
      currentBlocks = allocateProcess(currentBlocks, foundIdx, process);
      steps.push({ blocks: [...currentBlocks], message: `✓ Allocated ${process.name} (${process.size} KB) at address ${blockStart} KB`, type: 'success', processName: process.name, scanningBlockId: null });
    }
  }

  steps.push({ blocks: [...currentBlocks], message: 'Allocation complete!', type: 'complete', processName: null, scanningBlockId: null });
  return steps;
}

export function runFullAllocation(totalSize, processes, algorithm) {
  const steps = generateAllocationSteps(totalSize, processes, algorithm);
  return steps[steps.length - 1].blocks;
}

export function calculateStats(blocks, totalSize) {
  let usedMemory = 0, freeMemory = 0;
  const freeBlocks = [];
  let processCount = 0;

  for (const block of blocks) {
    if (block.type === 'process') { usedMemory += block.size; processCount++; }
    else { freeMemory += block.size; freeBlocks.push({ start: block.start, size: block.size }); }
  }

  const externalFragmentation = freeBlocks.length > 1 ? freeBlocks.length - 1 : 0;
  const usedPercent = totalSize > 0 ? parseFloat(((usedMemory / totalSize) * 100).toFixed(1)) : 0;
  const freePercent = totalSize > 0 ? parseFloat(((freeMemory / totalSize) * 100).toFixed(1)) : 0;
  const largestFree = freeBlocks.length > 0 ? Math.max(...freeBlocks.map((b) => b.size)) : 0;
  const efficiency = freeMemory > 0 ? parseFloat(((largestFree / freeMemory) * 100).toFixed(1)) : 100;

  return { totalMemory: totalSize, usedMemory, freeMemory, usedPercent, freePercent, externalFragmentation, freeBlocks, processCount, largestFree, efficiency };
}

export function compareAlgorithms(totalSize, processes) {
  const algorithms = ['first-fit', 'best-fit', 'worst-fit', 'next-fit'];
  return algorithms.map((algo) => {
    const finalBlocks = runFullAllocation(totalSize, processes, algo);
    const stats = calculateStats(finalBlocks, totalSize);
    const steps = generateAllocationSteps(totalSize, processes, algo);
    const failedCount = steps.filter((s) => s.type === 'error').length;
    return { algorithm: algo, ...stats, failedAllocations: failedCount };
  });
}
