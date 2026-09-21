#!/usr/bin/env python3
"""Copy the Markdown lessons under documentation/lessons/ into seed.json.

A lesson that carries ```er / ```diagram figures is JSON inside Markdown inside
a JSON string: unreadable and unmaintainable when edited straight in
backend/src/db/seed.json. Those lessons are therefore authored as plain files,
one per category, named after the category `key`:

    documentation/lessons/<key>.md   ->   seed.json  category[key].lesson

Only the `lesson` field of the matching categories is touched; everything else
in seed.json stays byte-identical. Deterministic and idempotent. A file whose
key matches no category aborts, so a renamed key cannot silently orphan a
lesson.

Usage:  python3 scripts/sync-lessons.py          # write
        python3 scripts/sync-lessons.py --check  # exit 1 if seed.json is stale
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SEED = ROOT / "backend/src/db/seed.json"
LESSONS = ROOT / "documentation/lessons"


def main() -> int:
    check = "--check" in sys.argv
    seed = json.loads(SEED.read_text())
    by_key = {c.get("key"): c for c in seed if c.get("key")}

    changed = []
    for md in sorted(LESSONS.glob("*.md")):
        key = md.stem
        cat = by_key.get(key)
        if cat is None:
            print(f"error: {md.name}: no category with key {key!r} in seed.json", file=sys.stderr)
            return 1
        body = md.read_text().rstrip("\n") + "\n"
        if cat.get("lesson") != body:
            cat["lesson"] = body
            changed.append(key)

    if not changed:
        print("seed.json lessons already up to date")
        return 0
    if check:
        print("stale lessons in seed.json: " + ", ".join(changed), file=sys.stderr)
        return 1
    SEED.write_text(json.dumps(seed, ensure_ascii=False, indent=2) + "\n")
    print("updated lessons: " + ", ".join(changed))
    return 0


if __name__ == "__main__":
    sys.exit(main())
