# Memory Allocation Simulator (Python)

Desktop-style Phase 1 implementation using **Python 3.11+** and **Tkinter** (standard library on Windows). Core logic lives in `memory_allocator.py` and mirrors the JavaScript [`memoryAllocator.js`](../../src/utils/memoryAllocator.js) in the web app.

## Run

```bash
cd phase-1/python
python app.py
```

No extra packages are required (`tkinter` is bundled with most Python installs on Windows).

## Contents

| File | Purpose |
|------|---------|
| `memory_allocator.py` | Block list model, four algorithms, steps, stats, compact |
| `app.py` | Tkinter UI: process list, algorithm, optional split-memory start, **Run allocation**, log, canvas memory map |

## Notes

- Messages in the log use ASCII `[OK]`, `[FAILED]`, `[fits]` for compatibility with Windows consoles.
- For course alignment, see [`../../docs/ICS433_Phase1_vs_OSproject.md`](../../docs/ICS433_Phase1_vs_OSproject.md).
