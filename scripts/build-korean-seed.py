#!/usr/bin/env python3
"""Merge the Korean branch into backend/src/db/seed.json.

Source of truth for vocab: documentation/coreen-vocab.md (parsed).
Source of truth for Hangeul: scripts/hangeul-lesson.md + scripts/hangeul-letters.json.

Hangeul exercises are ONLY "identify the sound / meaning" of a letter or word,
never conceptual questions about the writing system.

Idempotent: strips any previously-inserted Korean categories (by key prefix
"kr-") before re-appending, so it can be re-run after editing the sources.
"""
import json
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SEED = ROOT / "backend/src/db/seed.json"
VOCAB_MD = ROOT / "documentation/coreen-vocab.md"
HANGEUL_LESSON = ROOT / "scripts/hangeul-lesson.md"
HANGEUL_LETTERS = ROOT / "scripts/hangeul-letters.json"

COLOR = "rose"

# Decks parsed from the md. Skipped headers hold phrases / proper nouns that do
# not fit the "what does X mean / 4 choices" shape.
SKIP_HEADERS = {"Phrases utiles", "Noms propres (entraînement à la lecture)"}


def parse_vocab_md(text):
    decks = []  # (name, [ {ko, rr, fr, rr_accept?} ])
    cur_name, cur_words, in_fence = None, None, False
    for line in text.splitlines():
        h = re.match(r"^##\s+(.+?)\s*$", line)
        if h:
            if cur_name and cur_words:
                decks.append((cur_name, cur_words))
            cur_name, cur_words, in_fence = h.group(1), [], False
            continue
        if cur_name is None:
            continue
        if line.strip() == "```":
            in_fence = not in_fence
            continue
        if not in_fence:
            continue
        raw = line.strip()
        if not raw or raw.startswith("#"):
            continue
        raw = raw.split("#", 1)[0].strip()  # drop trailing "# (+)" etc.
        parts = [p.strip() for p in raw.split("=")]
        if len(parts) < 3:
            continue
        fr_label, ko = parts[0], parts[1]
        rr_field = "=".join(parts[2:]).strip()

        # rr: drop "(attr. 뜨거운 tteugeoun)" but keep the extra romaja as an accept
        attr = re.search(r"\(attr\.\s*\S+\s+([A-Za-z-]+)\)", rr_field)
        rr_field = re.sub(r"\s*\([^)]*\)", "", rr_field).strip()
        rr_alts = [x.strip() for x in rr_field.split("/") if x.strip()]
        rr = rr_alts[0]
        rr_accept = rr_alts[1:]
        if attr:
            rr_accept.append(attr.group(1))

        # fr accepted answers: the label, its "/"-alternatives, and each with the
        # parenthetical stripped.
        fr_accept = []
        for chunk in re.split(r"\s*/\s*", fr_label):
            chunk = chunk.strip()
            if not chunk:
                continue
            fr_accept.append(chunk)
            bare = re.sub(r"\s*\([^)]*\)", "", chunk).strip()
            if bare and bare != chunk:
                fr_accept.append(bare)
        # de-dup, keep order, label first
        seen, fr = set(), []
        for x in [fr_label] + fr_accept:
            if x.lower() not in seen:
                seen.add(x.lower())
                fr.append(x)

        w = {"ko": ko, "rr": rr, "fr": fr}
        if rr_accept:
            w["rr_accept"] = list(dict.fromkeys(rr_accept))
        cur_words.append(w)
    if cur_name and cur_words:
        decks.append((cur_name, cur_words))
    return [(n, w) for n, w in decks if n not in SKIP_HEADERS]


def build_hangeul_exercises(data):
    """letters/words -> only 'quel son ?' / 'que veut dire ?' exercises."""
    import random

    groups = {k: v for k, v in data.items() if not k.startswith("_")}
    ex = []

    for group, items in groups.items():
        is_letter = not group.startswith(("syllabe", "mot"))
        noun = "cette lettre" if is_letter else ("cette syllabe" if group == "syllabes" else "ce mot")
        sound_pool = [it["rr"] for it in items]

        for it in items:
            ko, rr = it["ko"], it["rr"]
            accept_rr = [rr] + it.get("rr_accept", [])

            # saisie : la prononciation
            ex.append({
                "type": "type_answer",
                "prompt": f"Comment se prononce « {ko} » ? (romanisation)",
                "accept": accept_rr,
                "normalize": "romaja",
                "placeholder": "romanisation",
                "explanation": f"{ko} = {rr}",
            })

            # 4 choix : le son
            distractors = random.sample([s for s in sound_pool if s != rr],
                                        k=min(3, len(sound_pool) - 1))
            choices = distractors + [rr]
            random.shuffle(choices)
            ex.append({
                "type": "mcq",
                "prompt": f"Quel son a « {ko} » ?",
                "choices": choices,
                "correct": choices.index(rr),
                "explanation": f"{ko} se prononce « {rr} ».",
            })

            # mots : sens FR en plus (4 choix + saisie)
            fr = it.get("fr")
            if fr:
                word_pool = [w for g in ("mots",) for w in groups.get(g, [])]
                other_fr = [w["fr"][0] for w in word_pool if w["ko"] != ko]
                fr_distractors = random.sample(other_fr, k=min(3, len(other_fr)))
                fr_choices = fr_distractors + [fr[0]]
                random.shuffle(fr_choices)
                ex.append({
                    "type": "mcq",
                    "prompt": f"Que veut dire « {ko} » ?",
                    "choices": fr_choices,
                    "correct": fr_choices.index(fr[0]),
                    "explanation": f"{ko} ({rr}) = {', '.join(fr)}.",
                })
                ex.append({
                    "type": "type_answer",
                    "prompt": f"Que veut dire « {ko} » ?",
                    "accept": fr,
                    "normalize": "loose",
                    "placeholder": "en français",
                    "explanation": f"{ko} ({rr}) = {', '.join(fr)}.",
                })

        _ = noun  # kept for readability of intent
    return ex


def main():
    seed = json.loads(SEED.read_text())
    seed = [c for c in seed if not str(c.get("key", "")).startswith("kr-")
            and c.get("name") not in ("Coréen", "Hangeul", "Vocabulaire")]

    kr = []
    kr.append({"name": "Coréen", "key": "kr", "color": COLOR, "parent": "School"})
    kr.append({"name": "Vocabulaire", "key": "kr-vocab", "color": COLOR, "parent": "kr"})

    hangeul_exercises = build_hangeul_exercises(json.loads(HANGEUL_LETTERS.read_text()))
    kr.append({
        "name": "Hangeul", "key": "kr-hangeul", "color": COLOR, "parent": "kr",
        "lesson": HANGEUL_LESSON.read_text(),
        "exercises": hangeul_exercises,
    })

    decks = parse_vocab_md(VOCAB_MD.read_text())
    for name, words in decks:
        key = "kr-voc-" + re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        kr.append({
            "name": name, "key": key, "color": COLOR, "parent": "kr-vocab",
            "vocab": words,
        })

    seed.extend(kr)
    SEED.write_text(json.dumps(seed, ensure_ascii=False, indent=2) + "\n")

    print(f"Hangeul: {len(hangeul_exercises)} exercises")
    for name, words in decks:
        # vocab card + (mcq if the deck has >=2 words)
        per = 2 if len(words) >= 2 else 1
        print(f"  {name}: {len(words)} words -> {len(words) * per} exercises")
    print(f"Total Korean categories added: {len(kr)}")


if __name__ == "__main__":
    main()
