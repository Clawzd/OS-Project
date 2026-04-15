"""
Contiguous memory allocation logic (aligned with src/utils/memoryAllocator.js).
Python 3.11+
"""

from __future__ import annotations

import copy
from typing import Any, Callable, Literal

Block = dict[str, Any]
Process = dict[str, Any]
Step = dict[str, Any]

Algorithm = Literal["first-fit", "best-fit", "worst-fit", "next-fit"]

_next_fit_cursor = 0


def create_initial_memory(total_size: int) -> list[Block]:
    return [{"id": "free-0", "type": "free", "size": total_size, "start": 0}]


def create_fragmented_initial_memory(total_size: int) -> list[Block]:
    os_size = max(32, min(64, int(total_size * 0.09)))
    left_free = max(72, min(130, int(total_size * 0.24)))
    right_free = total_size - os_size - left_free
    if right_free < 100:
        return create_initial_memory(total_size)
    os_start = left_free
    return [
        {"id": "free-head", "type": "free", "size": left_free, "start": 0},
        {
            "id": "sys-os",
            "type": "process",
            "name": "OS",
            "size": os_size,
            "start": os_start,
            "colorIndex": 99,
        },
        {"id": "free-tail", "type": "free", "size": right_free, "start": os_start + os_size},
    ]


def merge_free_blocks(blocks: list[Block]) -> list[Block]:
    merged = copy.deepcopy(blocks)
    i = 0
    while i < len(merged) - 1:
        if merged[i]["type"] == "free" and merged[i + 1]["type"] == "free":
            new_b = {
                "id": f"free-{merged[i]['start']}",
                "type": "free",
                "size": merged[i]["size"] + merged[i + 1]["size"],
                "start": merged[i]["start"],
            }
            merged[i : i + 2] = [new_b]
        else:
            i += 1
    return merged


def allocate_process(blocks: list[Block], block_index: int, process: Process) -> list[Block]:
    new_blocks = copy.deepcopy(blocks)
    free_block = new_blocks[block_index]
    remaining = free_block["size"] - process["size"]
    allocated = {
        "id": f"proc-{process['name']}",
        "type": "process",
        "name": process["name"],
        "size": process["size"],
        "start": free_block["start"],
        "colorIndex": process["colorIndex"],
    }
    if remaining > 0:
        rest = {
            "id": f"free-{free_block['start'] + process['size']}",
            "type": "free",
            "size": remaining,
            "start": free_block["start"] + process["size"],
        }
        new_blocks[block_index : block_index + 1] = [allocated, rest]
    else:
        new_blocks[block_index : block_index + 1] = [allocated]
    return new_blocks


def deallocate_process(blocks: list[Block], process_name: str) -> list[Block]:
    new_blocks = []
    for b in blocks:
        if b.get("type") == "process" and b.get("name") == process_name:
            new_blocks.append(
                {"id": f"free-{b['start']}", "type": "free", "size": b["size"], "start": b["start"]}
            )
        else:
            new_blocks.append(copy.deepcopy(b))
    return merge_free_blocks(new_blocks)


def compact_memory(blocks: list[Block]) -> list[Block]:
    processes = [b for b in blocks if b["type"] == "process"]
    total_free = sum(b["size"] for b in blocks if b["type"] == "free")
    addr = 0
    compacted: list[Block] = []
    for p in processes:
        nb = {**p, "start": addr}
        compacted.append(nb)
        addr += p["size"]
    if total_free > 0:
        compacted.append({"id": f"free-{addr}", "type": "free", "size": total_free, "start": addr})
    return compacted


def _scan_first_fit(blocks: list[Block], process_size: int) -> Generator[dict[str, Any], None, int]:
    for i, b in enumerate(blocks):
        if b["type"] == "free":
            fits = b["size"] >= process_size
            yield {"scanIdx": i, "fits": fits}
            if fits:
                return i
    return -1


def _scan_best_fit(blocks: list[Block], process_size: int) -> Generator[dict[str, Any], None, int]:
    best_idx = -1
    best_size = float("inf")
    for i, b in enumerate(blocks):
        if b["type"] == "free":
            fits = b["size"] >= process_size
            yield {"scanIdx": i, "fits": fits}
            if fits and b["size"] < best_size:
                best_idx = i
                best_size = b["size"]
    return best_idx


def _scan_worst_fit(blocks: list[Block], process_size: int) -> Generator[dict[str, Any], None, int]:
    worst_idx = -1
    worst_size = -1
    for i, b in enumerate(blocks):
        if b["type"] == "free":
            fits = b["size"] >= process_size
            yield {"scanIdx": i, "fits": fits}
            if fits and b["size"] > worst_size:
                worst_idx = i
                worst_size = b["size"]
    return worst_idx


def _scan_next_fit(blocks: list[Block], process_size: int) -> Generator[dict[str, Any], None, int]:
    global _next_fit_cursor
    n = len(blocks)
    for offset in range(n):
        i = (_next_fit_cursor + offset) % n
        b = blocks[i]
        if b["type"] == "free":
            fits = b["size"] >= process_size
            yield {"scanIdx": i, "fits": fits}
            if fits:
                _next_fit_cursor = i
                return i
    return -1


_SCANNERS: dict[Algorithm, Callable[[list[Block], int], Generator[dict[str, Any], None, int]]] = {
    "first-fit": _scan_first_fit,
    "best-fit": _scan_best_fit,
    "worst-fit": _scan_worst_fit,
    "next-fit": _scan_next_fit,
}


def generate_allocation_steps(
    total_size: int,
    processes: list[Process],
    algorithm: Algorithm,
    *,
    fragmented_start: bool = False,
) -> list[Step]:
    global _next_fit_cursor
    steps: list[Step] = []
    if fragmented_start:
        current_blocks = create_fragmented_initial_memory(total_size)
        init_msg = (
            f"Memory initialized: {total_size} KB with two free regions (OS reserved in the middle)"
        )
    else:
        current_blocks = create_initial_memory(total_size)
        init_msg = f"Memory initialized: {total_size} KB total"

    _next_fit_cursor = 0

    steps.append(
        {
            "blocks": copy.deepcopy(current_blocks),
            "message": init_msg,
            "type": "info",
            "processName": None,
            "scanningBlockId": None,
        }
    )

    scanner_fn = _SCANNERS[algorithm]

    for proc in processes:
        steps.append(
            {
                "blocks": copy.deepcopy(current_blocks),
                "message": f"Searching for space to allocate {proc['name']} ({proc['size']} KB)...",
                "type": "searching",
                "processName": proc["name"],
                "scanningBlockId": None,
            }
        )

        gen = scanner_fn(current_blocks, proc["size"])
        found_idx = -1
        while True:
            try:
                item = next(gen)
                scan_idx = item["scanIdx"]
                fits = item["fits"]
                block = current_blocks[scan_idx]
                steps.append(
                    {
                        "blocks": copy.deepcopy(current_blocks),
                        "message": (
                            f"  [fits] Block at {block['start']} KB ({block['size']} KB)"
                            if fits
                            else f"  [too small] Block at {block['start']} KB ({block['size']} KB)"
                        ),
                        "type": "scanning-fit" if fits else "scanning",
                        "processName": proc["name"],
                        "scanningBlockId": block["id"],
                    }
                )
            except StopIteration as e:
                found_idx = e.value if e.value is not None else -1
                break

        if found_idx == -1:
            steps.append(
                {
                    "blocks": copy.deepcopy(current_blocks),
                    "message": f"[FAILED] No contiguous block large enough for {proc['name']} ({proc['size']} KB)",
                    "type": "error",
                    "processName": proc["name"],
                    "scanningBlockId": None,
                }
            )
        else:
            block_start = current_blocks[found_idx]["start"]
            current_blocks = allocate_process(current_blocks, found_idx, proc)
            steps.append(
                {
                    "blocks": copy.deepcopy(current_blocks),
                    "message": f"[OK] Allocated {proc['name']} ({proc['size']} KB) at address {block_start} KB",
                    "type": "success",
                    "processName": proc["name"],
                    "scanningBlockId": None,
                }
            )

    steps.append(
        {
            "blocks": copy.deepcopy(current_blocks),
            "message": "Allocation complete!",
            "type": "complete",
            "processName": None,
            "scanningBlockId": None,
        }
    )
    return steps


def run_full_allocation(
    total_size: int,
    processes: list[Process],
    algorithm: Algorithm,
    *,
    fragmented_start: bool = False,
) -> list[Block]:
    steps = generate_allocation_steps(
        total_size, processes, algorithm, fragmented_start=fragmented_start
    )
    return copy.deepcopy(steps[-1]["blocks"])


def calculate_stats(blocks: list[Block], total_size: int) -> dict[str, Any]:
    used_memory = 0
    free_memory = 0
    free_blocks: list[dict[str, int]] = []
    process_count = 0
    for block in blocks:
        if block["type"] == "process":
            used_memory += block["size"]
            process_count += 1
        else:
            free_memory += block["size"]
            free_blocks.append({"start": block["start"], "size": block["size"]})

    ext_frag = (len(free_blocks) - 1) if len(free_blocks) > 1 else 0
    used_pct = round((used_memory / total_size) * 100, 1) if total_size > 0 else 0.0
    free_pct = round((free_memory / total_size) * 100, 1) if total_size > 0 else 0.0
    largest_free = max((fb["size"] for fb in free_blocks), default=0)
    efficiency = round((largest_free / free_memory) * 100, 1) if free_memory > 0 else 100.0

    return {
        "totalMemory": total_size,
        "usedMemory": used_memory,
        "freeMemory": free_memory,
        "usedPercent": used_pct,
        "freePercent": free_pct,
        "externalFragmentation": ext_frag,
        "freeBlocks": free_blocks,
        "processCount": process_count,
        "largestFree": largest_free,
        "efficiency": efficiency,
    }
