#!/usr/bin/env python3
"""Patch "Database Design -> Week 1" in seed.json.

The existing 37 questions + lesson already cover the two lectures well; this only
ADDS what was missing:
- lesson: appends section 6 "Database system architecture"
  (scripts/db-week1-lesson-append.md)
- exercises[]: the architecture topic + a few interactive exercises
  (scripts/db-week1-exercises.json)

Idempotent: strips a previously-appended section 6 before re-appending.
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SEED = ROOT / "backend/src/db/seed.json"
APPEND = ROOT / "scripts/db-week1-lesson-append.md"
EXERCISES = ROOT / "scripts/db-week1-exercises.json"

KEY = "school-db-w1"
MARKER = "\n## 6. Database system architecture"


def main():
    seed = json.loads(SEED.read_text())
    exercises = json.loads(EXERCISES.read_text())
    append = APPEND.read_text()

    for cat in seed:
        if cat.get("key") != KEY:
            continue
        lesson = cat.get("lesson", "")
        if MARKER in lesson:
            lesson = lesson[: lesson.index(MARKER)].rstrip() + "\n"
        cat["lesson"] = lesson.rstrip() + "\n" + append
        cat["exercises"] = exercises
        SEED.write_text(json.dumps(seed, ensure_ascii=False, indent=2) + "\n")

        counts = {}
        for e in exercises:
            counts[e["type"]] = counts.get(e["type"], 0) + 1
        print(f"Patched {cat['name']}: {len(cat.get('questions', []))} questions kept, "
              f"section 6 appended, {len(exercises)} exercises added")
        print("  " + ", ".join(f"{k}: {v}" for k, v in sorted(counts.items())))
        return

    raise SystemExit(f"category with key {KEY} not found")


if __name__ == "__main__":
    main()
