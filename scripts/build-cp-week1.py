#!/usr/bin/env python3
"""Patch the "Computer Programming -> Week 1" category in seed.json.

- lesson  <- scripts/cp-week1-lesson.md   (covers lectures 1_1 AND 1_2)
- keeps the existing questions[] (they cover lecture 1_1 accurately)
- exercises[] <- scripts/cp-week1-exercises.json (lecture 1_2, algorithms, flowcharts)

Idempotent: re-run after editing either source file.
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SEED = ROOT / "backend/src/db/seed.json"
LESSON = ROOT / "scripts/cp-week1-lesson.md"
EXERCISES = ROOT / "scripts/cp-week1-exercises.json"

KEY = "school-cp-w1"


def main():
    seed = json.loads(SEED.read_text())
    exercises = json.loads(EXERCISES.read_text())

    for cat in seed:
        if cat.get("key") != KEY:
            continue
        cat["lesson"] = LESSON.read_text()
        cat["exercises"] = exercises
        counts = {}
        for e in exercises:
            counts[e["type"]] = counts.get(e["type"], 0) + 1
        SEED.write_text(json.dumps(seed, ensure_ascii=False, indent=2) + "\n")
        print(f"Patched {cat['name']}: {len(cat.get('questions', []))} questions kept, "
              f"{len(exercises)} exercises added")
        print("  " + ", ".join(f"{k}: {v}" for k, v in sorted(counts.items())))
        return

    raise SystemExit(f"category with key {KEY} not found in seed.json")


if __name__ == "__main__":
    main()
