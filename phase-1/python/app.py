#!/usr/bin/env python3
"""
ICS 433 Phase 1 style desktop UI: Tkinter + Canvas memory map.
Run: python app.py  (from this directory)
"""

from __future__ import annotations

import copy
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext

from memory_allocator import (
    Algorithm,
    calculate_stats,
    compact_memory,
    create_fragmented_initial_memory,
    create_initial_memory,
    generate_allocation_steps,
)

COLORS = [
    "#6366f1",
    "#06b6d4",
    "#f59e0b",
    "#ec4899",
    "#84cc16",
    "#10b981",
    "#f97316",
    "#8b5cf6",
]
FREE_COLOR = "#374151"
OS_COLOR = "#64748b"


class MemorySimulatorApp(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("Memory Allocation Simulator (Python / Tkinter)")
        self.geometry("900x720")
        self.minsize(800, 600)

        self.total_var = tk.StringVar(value="512")
        self.algo_var = tk.StringVar(value="first-fit")
        self.fragmented_var = tk.BooleanVar(value=True)
        self.proc_name = tk.StringVar(value="P1")
        self.proc_size = tk.StringVar(value="100")

        self.processes: list[dict] = []
        self.current_blocks: list | None = None
        self._next_proc = 1

        self._build_ui()

    def _build_ui(self) -> None:
        top = ttk.Frame(self, padding=8)
        top.pack(fill=tk.X)

        ttk.Label(top, text="Total memory (KB):").pack(side=tk.LEFT, padx=(0, 4))
        ttk.Entry(top, textvariable=self.total_var, width=8).pack(side=tk.LEFT, padx=(0, 12))

        ttk.Label(top, text="Algorithm:").pack(side=tk.LEFT, padx=(0, 4))
        algo = ttk.Combobox(
            top,
            textvariable=self.algo_var,
            values=("first-fit", "best-fit", "worst-fit", "next-fit"),
            state="readonly",
            width=12,
        )
        algo.pack(side=tk.LEFT, padx=(0, 12))

        ttk.Checkbutton(
            top,
            text="Split free memory (OS block)",
            variable=self.fragmented_var,
        ).pack(side=tk.LEFT, padx=(0, 8))

        ttk.Button(top, text="Run allocation", command=self._run).pack(side=tk.LEFT, padx=4)
        ttk.Button(top, text="Reset view", command=self._reset_view).pack(side=tk.LEFT, padx=4)
        ttk.Button(top, text="Compact", command=self._compact).pack(side=tk.LEFT, padx=4)

        mid = ttk.Frame(self, padding=8)
        mid.pack(fill=tk.BOTH, expand=True)

        left = ttk.LabelFrame(mid, text="Processes (before run)", padding=6)
        left.pack(side=tk.LEFT, fill=tk.BOTH, expand=False, padx=(0, 8))

        row = ttk.Frame(left)
        row.pack(fill=tk.X)
        ttk.Label(row, text="Name").pack(side=tk.LEFT)
        ttk.Entry(row, textvariable=self.proc_name, width=8).pack(side=tk.LEFT, padx=4)
        ttk.Label(row, text="Size KB").pack(side=tk.LEFT)
        ttk.Entry(row, textvariable=self.proc_size, width=6).pack(side=tk.LEFT, padx=4)
        ttk.Button(row, text="Add", command=self._add_process).pack(side=tk.LEFT, padx=4)

        self.proc_list = tk.Listbox(left, height=10, width=28)
        self.proc_list.pack(fill=tk.BOTH, expand=True, pady=6)
        ttk.Button(left, text="Remove selected", command=self._remove_process).pack(fill=tk.X)

        ttk.Button(left, text="Load demo list", command=self._load_demo).pack(fill=tk.X, pady=(6, 0))

        right = ttk.Frame(mid)
        right.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        self.canvas = tk.Canvas(right, height=100, bg="#1e293b", highlightthickness=0)
        self.canvas.pack(fill=tk.X, pady=(0, 8))

        self.stats_var = tk.StringVar(value="Run allocation or reset view to see statistics.")
        ttk.Label(right, textvariable=self.stats_var, justify=tk.LEFT).pack(anchor=tk.W)

        ttk.Label(right, text="Log").pack(anchor=tk.W, pady=(8, 0))
        self.log = scrolledtext.ScrolledText(right, height=16, state=tk.DISABLED, font=("Consolas", 9))
        self.log.pack(fill=tk.BOTH, expand=True)

        self._reset_view()

    def _total_mem(self) -> int:
        try:
            v = int(self.total_var.get().strip())
            return max(1, v)
        except ValueError:
            return 512

    def _log_line(self, s: str) -> None:
        self.log.configure(state=tk.NORMAL)
        self.log.insert(tk.END, s + "\n")
        self.log.see(tk.END)
        self.log.configure(state=tk.DISABLED)

    def _clear_log(self) -> None:
        self.log.configure(state=tk.NORMAL)
        self.log.delete("1.0", tk.END)
        self.log.configure(state=tk.DISABLED)

    def _add_process(self) -> None:
        name = self.proc_name.get().strip() or f"P{self._next_proc}"
        try:
            size = int(self.proc_size.get().strip())
        except ValueError:
            messagebox.showerror("Invalid size", "Enter a positive integer size in KB.")
            return
        if size <= 0:
            messagebox.showerror("Invalid size", "Size must be > 0.")
            return
        color = len(self.processes) % len(COLORS)
        self.processes.append({"name": name, "size": size, "colorIndex": color})
        self._next_proc += 1
        self._refresh_proc_list()

    def _remove_process(self) -> None:
        sel = self.proc_list.curselection()
        if not sel:
            return
        idx = sel[0]
        self.processes.pop(idx)
        self._refresh_proc_list()

    def _refresh_proc_list(self) -> None:
        self.proc_list.delete(0, tk.END)
        for p in self.processes:
            self.proc_list.insert(tk.END, f"{p['name']}: {p['size']} KB")

    def _load_demo(self) -> None:
        self.processes = [
            {"name": "P1", "size": 100, "colorIndex": 0},
            {"name": "P2", "size": 200, "colorIndex": 1},
            {"name": "P3", "size": 80, "colorIndex": 2},
            {"name": "P4", "size": 60, "colorIndex": 3},
        ]
        self.total_var.set("512")
        self._refresh_proc_list()

    def _baseline_blocks(self) -> list:
        t = self._total_mem()
        if self.fragmented_var.get():
            return create_fragmented_initial_memory(t)
        return create_initial_memory(t)

    def _reset_view(self) -> None:
        self.current_blocks = self._baseline_blocks()
        self._clear_log()
        self._log_line("View reset to initial memory layout.")
        self._draw_memory(self.current_blocks, self._total_mem())
        self._update_stats(self.current_blocks, self._total_mem())

    def _draw_memory(self, blocks: list, total: int) -> None:
        self.canvas.delete("all")
        self.canvas.update_idletasks()
        w = max(self.canvas.winfo_width(), 600)
        pad = 4
        inner_w = w - 2 * pad
        x = float(pad)
        for b in blocks:
            bw = max(2.0, (b["size"] / total) * inner_w)
            if b["type"] == "free":
                fill = FREE_COLOR
                label = f"Free\n{b['size']}"
            else:
                if b.get("name") == "OS":
                    fill = OS_COLOR
                else:
                    fill = COLORS[b.get("colorIndex", 0) % len(COLORS)]
                label = f"{b.get('name', '?')}\n{b['size']}"
            self.canvas.create_rectangle(
                x, 10, x + bw, 90, fill=fill, outline="#0f172a", width=1
            )
            if bw > 36:
                self.canvas.create_text(
                    x + bw / 2,
                    50,
                    text=label,
                    fill="white",
                    font=("Segoe UI", 8),
                )
            x += bw

    def _update_stats(self, blocks: list, total: int) -> None:
        s = calculate_stats(blocks, total)
        holes = len(s["freeBlocks"])
        self.stats_var.set(
            f"Total {s['totalMemory']} KB | Used {s['usedMemory']} ({s['usedPercent']}%) | "
            f"Free {s['freeMemory']} ({s['freePercent']}%) | Free regions: {holes} | "
            f"Largest free: {s['largestFree']} KB"
        )

    def _run(self) -> None:
        if not self.processes:
            messagebox.showinfo("No processes", "Add at least one process first.")
            return
        total = self._total_mem()
        algo: Algorithm = self.algo_var.get()  # type: ignore[assignment]
        frag = self.fragmented_var.get()
        procs = [{**p, "colorIndex": i} for i, p in enumerate(self.processes)]

        self._clear_log()
        steps = generate_allocation_steps(total, procs, algo, fragmented_start=frag)
        for st in steps:
            self._log_line(st["message"])

        self.current_blocks = copy.deepcopy(steps[-1]["blocks"])
        self._draw_memory(self.current_blocks, total)
        self._update_stats(self.current_blocks, total)

    def _compact(self) -> None:
        if not self.current_blocks:
            return
        self.current_blocks = compact_memory(self.current_blocks)
        self._log_line("Compaction: all processes packed to low addresses, one free block at end.")
        self._draw_memory(self.current_blocks, self._total_mem())
        self._update_stats(self.current_blocks, self._total_mem())


def main() -> None:
    app = MemorySimulatorApp()
    app.mainloop()


if __name__ == "__main__":
    main()
