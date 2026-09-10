#!/usr/bin/env python3
"""Merge the Korean branch into backend/src/db/seed.json.

Source of truth for vocab: documentation/coreen-vocab.md (parsed) — feeds the
  Vocabulaire container's list-lesson and one deck per `##` header.
Source of truth for the Hangeul reading exercises:
  documentation/coreen-hangeul-letters.json.
The `Cours` weeks (Coréen → Cours → Semaine N) are recap lessons hard-coded
  below from the GEE3003 week_1.pdf / week_2.pdf slides; they duplicate the
  vocab decks on purpose.

Hangeul exercises are ONLY "identify the sound / meaning" of a letter or word,
never conceptual questions about the writing system.

This is the ONE sanctioned seed generator: it regenerates the whole Korean
branch (keys "kr" / "kr-*") of backend/src/db/seed.json from the documentation
sources above. Every other subject is hand-authored directly in seed.json.

Deterministic: a fixed-seed RNG shuffles the MCQ choices, so re-running with
unchanged sources produces a byte-identical seed.json.

Idempotent: strips any previously-inserted Korean categories (by key prefix
"kr-") before re-appending, so it can be re-run after editing the sources.
"""
import json
import re
import pathlib
import random

ROOT = pathlib.Path(__file__).resolve().parent.parent
SEED = ROOT / "backend/src/db/seed.json"
VOCAB_MD = ROOT / "documentation/coreen-vocab.md"
HANGEUL_LESSON = ROOT / "documentation/coreen-hangeul-lesson.md"
HANGEUL_LETTERS = ROOT / "documentation/coreen-hangeul-letters.json"

RNG = random.Random(0)

COLOR = "rose"

# Headers parsed from the md but NOT turned into their own category / deck of
# exercises: phrases and proper nouns that do not fit the "what does X mean /
# 4 choices" shape, and the Semaine-1 reading drill. Their words still appear in
# the Vocabulaire lesson (the exhaustive word list).
SKIP_HEADERS = {
    "Phrases utiles",
    "Noms propres (entraînement à la lecture)",
    "Cours — mots de lecture (Semaine 1)",
    "Hangeul — premiers mots",
}


def parse_vocab_md(text, skip=None):
    skip = SKIP_HEADERS if skip is None else skip
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
    return [(n, w) for n, w in decks if n not in skip]


# Headers kept out of the Vocabulaire lesson word list too (not just out of the
# categories): the Semaine-1 reading drill.
LESSON_SKIP_HEADERS = {"Cours — mots de lecture (Semaine 1)"}

# Revised-Romanisation vowel nuclei and consonant onsets/codas, each longest
# first so the tokenizer is greedy.
_RR_VOWELS = ["yeo", "yae", "wae", "ya", "yo", "yu", "ye", "wa", "wo", "we",
              "wi", "ui", "oe", "eo", "eu", "ae", "a", "e", "i", "o", "u"]
_RR_CONS = ["ng", "ch", "ss", "kk", "tt", "pp", "jj", "b", "d", "g", "j", "p",
            "t", "k", "h", "s", "m", "n", "r", "l"]
# RR of each jungseong (medial vowel), by its 0..20 index in a Hangul block, so a
# multi-letter vowel like "ui" is only matched where the block really is ㅢ
# (오리구이 origui -> o-ri-gu-i, not o-ri-gui).
_RR_JUNG = ["a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae",
            "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"]


def hyphenate_rr(ko, rr):
    """Insert '-' between syllables of a romanisation: 학교 hakgyo -> hak-gyo.

    Splits `rr` into as many chunks as there are Hangul syllable blocks in `ko`,
    a consonant going to the next syllable's onset unless a following consonant
    (or the string end) makes it a coda. The 'ng' string is the ㅇ digraph only
    when the matching Hangul block actually carries a ㅇ final, so 친구 chingu ->
    chin-gu but 고양이 goyangi -> go-yang-i. Falls back to the untouched `rr` on
    any mismatch, so a hand-tuned romanisation is never mangled."""
    blocks = [ord(ch) - 0xAC00 for ch in ko if 0xAC00 <= ord(ch) <= 0xD7A3]
    codas = [b % 28 for b in blocks]
    jungs = [(b % 588) // 28 for b in blocks]
    syllables = len(blocks)
    if syllables <= 1:
        return rr
    IEUNG = 21  # ㅇ as a final
    toks, i, s, vseen = [], 0, rr.lower(), 0
    while i < len(s):
        for v in _RR_VOWELS:
            if not s.startswith(v, i):
                continue
            if len(v) > 1 and vseen < syllables and _RR_JUNG[jungs[vseen]] != v:
                continue  # multi-letter vowel that this block isn't
            toks.append(("V", s[i:i + len(v)])); i += len(v); vseen += 1; break
        else:
            if s.startswith("ng", i) and not (
                0 < vseen <= syllables and codas[vseen - 1] == IEUNG
            ):
                toks.append(("C", "n")); i += 1  # ㄴ + ㄱ, not the ㅇ digraph
                continue
            for c in _RR_CONS:
                if s.startswith(c, i):
                    toks.append(("C", s[i:i + len(c)])); i += len(c); break
            else:
                return rr  # a character we don't know how to split
    if sum(1 for k, _ in toks if k == "V") != syllables:
        return rr
    groups, i, n = [], 0, len(toks)
    for si in range(syllables):
        start = i
        while i < n and toks[i][0] == "C":      # onset
            i += 1
        if i < n and toks[i][0] == "V":         # nucleus
            i += 1
        while i < n and toks[i][0] == "C":      # coda
            next_is_vowel = i + 1 < n and toks[i + 1][0] == "V"
            # 'ng' can only be a final, never an onset -> always a coda here.
            if si == syllables - 1 or not next_is_vowel or toks[i][1] == "ng":
                i += 1
            else:
                break
        groups.append("".join(t for _, t in toks[start:i]))
    if i < n:
        groups[-1] += "".join(t for _, t in toks[i:])
    return "-".join(g for g in groups if g)


def build_vocab_lesson(text):
    """The Vocabulaire container's lesson is an exhaustive list of every word
    across its child decks: one line per word,
    `français = 한글 = pro-non-cia-tion` (syllable-hyphenated), grouped by deck.
    No rules."""
    decks = parse_vocab_md(text, skip=LESSON_SKIP_HEADERS)
    out = ["# Vocabulaire coréen", ""]
    for name, words in decks:
        out.append(f"## {name}")
        out.append("")
        for w in words:
            out.append(f"- {w['fr'][0]} = {w['ko']} = {hyphenate_rr(w['ko'], w['rr'])}")
        out.append("")
    return "\n".join(out).rstrip() + "\n"


# --- Cours (par semaine) --------------------------------------------------------
# A plain recap of each week of GEE3003 "Basic Korean": the jamo introduced that
# week + the reading words from its slides. Duplicates the Vocabulaire decks on
# purpose -- these leaves follow the course, not the themes.

_W1_WORDS = [
    ("dent", "이", "i"), ("enfant", "아이", "ai"), ("cinq", "오", "o"),
    ("concombre", "오이", "oi"), ("lait", "우유", "uyu"), ("renard", "여우", "yeou"),
    ("meuble", "가구", "gagu"), ("papillon", "나비", "nabi"),
    ("banane", "바나나", "banana"), ("chanteur / chanteuse", "가수", "gasu"),
    ("bébé", "아기", "agi"), ("radio", "라디오", "radio"), ("viande", "고기", "gogi"),
    ("chaussures", "구두", "gudu"), ("grande sœur (d'un homme)", "누나", "nuna"),
    ("jambe / pont", "다리", "dari"), ("cuisine / plat", "요리", "yori"),
    ("pays", "나라", "nara"), ("tête / cheveux", "머리", "meori"),
    ("après-midi", "오후", "ohu"), ("arbre", "나무", "namu"),
    ("entreprise", "회사", "hoesa"), ("sauce", "소스", "soseu"), ("lac", "호수", "hosu"),
]

_W2_ASPIR = [
    ("jupe", "치마", "chima"), ("café", "커피", "keopi"), ("train", "기차", "gicha"),
    ("nez", "코", "ko"), ("raisin", "포도", "podo"), ("tomate", "토마토", "tomato"),
]
_W2_TENSE = [
    ("queue (d'animal)", "꼬리", "kkori"), ("lapin", "토끼", "tokki"),
    ("serre-tête", "머리띠", "meoritti"), ("papa", "아빠", "appa"),
    ("écrire", "쓰다", "sseuda"), ("être salé", "짜다", "jjada"),
]
_W2_VOWELS = [
    ("montre / horloge", "시계", "sigye"), ("chaise", "의자", "uija"),
    ("magasin", "가게", "gage"), ("gâteau sec", "과자", "gwaja"),
    ("oreille", "귀", "gwi"), ("serveur", "웨이터", "weiteo"),
    ("cochon", "돼지", "dwaeji"), ("entreprise", "회사", "hoesa"),
    ("il fait froid", "추워요", "chuwoyo"), ("pourquoi", "왜", "wae"),
    ("chanson", "노래", "norae"), ("histoire / conversation", "얘기", "yaegi"),
]
_W2_BATCHIM = [
    ("médicament", "약", "yak"), ("livre", "책", "chaek"),
    ("université", "대학", "daehak"), ("États-Unis", "미국", "miguk"),
    ("cuisine (pièce)", "부엌", "bueok"), ("dehors", "밖", "bak"),
    ("œil / neige", "눈", "nun"), ("argent", "돈", "don"),
    ("grande sœur (d'une femme)", "언니", "eonni"), ("bibliothèque", "도서관", "doseogwan"),
    ("ami(e)", "친구", "chingu"), ("bientôt", "곧", "got"), ("goût", "맛", "mat"),
    ("vêtement", "옷", "ot"), ("pinceau", "붓", "but"), ("journée / midi", "낮", "nat"),
    ("fleur", "꽃", "kkot"), ("champ", "밭", "bat"), ("route / chemin", "길", "gil"),
    ("cheval / parole", "말", "mal"), ("riz (cru)", "쌀", "ssal"),
    ("automne", "가을", "gaeul"), ("salle de classe", "교실", "gyosil"),
    ("Séoul", "서울", "seoul"), ("printemps", "봄", "bom"), ("rhume", "감기", "gamgi"),
    ("kimchi", "김치", "gimchi"), ("personne", "사람", "saram"),
    ("librairie", "서점", "seojeom"), ("maison", "집", "jip"), ("bouche", "입", "ip"),
    ("gobelet / tasse", "컵", "keop"), ("neuf", "아홉", "ahop"), ("devant", "앞", "ap"),
    ("à côté", "옆", "yeop"), ("forêt", "숲", "sup"), ("fleuve / rivière", "강", "gang"),
    ("chambre", "방", "bang"), ("pain", "빵", "ppang"), ("ville natale", "고향", "gohyang"),
    ("cadet(te)", "동생", "dongsaeng"), ("usine", "공장", "gongjang"),
]


def _word_lines(pairs):
    return "\n".join(f"- {fr} = {ko} = {hyphenate_rr(ko, rr)}" for fr, ko, rr in pairs)


_CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"
_JUNG = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"


def _syl(cho, jung):
    return chr(0xAC00 + (_CHO.index(cho) * 21 + _JUNG.index(jung)) * 28)


def _syl_table(consonants, vowels):
    """Markdown table: one row per consonant, one column per vowel, each cell the
    composed Hangul block."""
    head = "|  | " + " | ".join(vowels) + " |"
    sep = "|" + "---|" * (len(vowels) + 1)
    rows = [
        "| **" + c + "** | " + " | ".join(_syl(c, v) for v in vowels) + " |"
        for c in consonants
    ]
    return "\n".join([head, sep] + rows)


_V10 = list("ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ")
_V6 = list("ㅏㅓㅗㅜㅡㅣ")


def build_course_categories():
    w1 = f"""# Coréen — Semaine 1

Cours GEE3003 « Basic Korean », Day 1 (week_1.pdf) : les voyelles et les
consonnes de base, et la lecture de premiers mots.

## Voyelles de base (모음)

- ㅏ = a
- ㅑ = ya
- ㅓ = eo
- ㅕ = yeo
- ㅗ = o
- ㅛ = yo
- ㅜ = u
- ㅠ = yu
- ㅡ = eu
- ㅣ = i

Un trait court ajouté à ㅣ ou ㅡ donne ㅏ ㅓ ㅗ ㅜ ; un second trait donne les
voyelles iotisées ㅑ ㅕ ㅛ ㅠ. Lues seules (avec la consonne muette ㅇ) :

{_syl_table(["ㅇ"], _V10)}

## Consonnes de base (자음)

- ㄱ = g / k
- ㄴ = n
- ㄷ = d / t
- ㄹ = r / l
- ㅁ = m
- ㅂ = b / p
- ㅅ = s
- ㅇ = muette en tête de syllabe, « ng » en finale
- ㅈ = j
- ㅎ = h

## Syllabes — consonne + voyelle

{_syl_table(list("ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅎ"), _V10)}

## Mots (단어)

{_word_lines(_W1_WORDS)}
"""

    w2 = f"""# Coréen — Semaine 2

Cours GEE3003 « Basic Korean », Day 2 (week_2.pdf) : consonnes aspirées et
tendues, voyelles composées, et les consonnes finales (받침).

## Consonnes aspirées (거센소리)

- ㅊ = ch
- ㅋ = k
- ㅌ = t
- ㅍ = p

{_syl_table(list("ㅊㅋㅌㅍ"), _V10)}

## Consonnes tendues (된소리)

- ㄲ = kk
- ㄸ = tt
- ㅃ = pp
- ㅆ = ss
- ㅉ = jj

{_syl_table(list("ㄲㄸㅃㅆㅉ"), _V6)}

## Plaine / tendue / aspirée

| plaine | tendue | aspirée |
|---|---|---|
| 가 ga | 까 kka | 카 ka |
| 다 da | 따 tta | 타 ta |
| 바 ba | 빠 ppa | 파 pa |
| 사 sa | 싸 ssa | — |
| 자 ja | 짜 jja | 차 cha |

## Voyelles composées (모음 2)

- ㅐ = ae
- ㅒ = yae
- ㅔ = e
- ㅖ = ye
- ㅘ = wa
- ㅝ = wo
- ㅚ = oe
- ㅙ = wae
- ㅞ = we
- ㅟ = wi
- ㅢ = ui

Lues seules (avec ㅇ) : 애 얘 에 예 와 워 외 왜 웨 위 의.

## Consonnes finales — 받침

Une consonne en fin de syllabe ne se prononce qu'en 7 sons :

- [k] : ㄱ, ㅋ, ㄲ
- [n] : ㄴ
- [t] : ㄷ, ㅅ, ㅆ, ㅈ, ㅊ, ㅌ, ㅎ
- [l] : ㄹ
- [m] : ㅁ
- [p] : ㅂ, ㅍ
- [ng] : ㅇ

## Mots (단어)

### Consonnes aspirées

{_word_lines(_W2_ASPIR)}

### Consonnes tendues

{_word_lines(_W2_TENSE)}

### Voyelles composées

{_word_lines(_W2_VOWELS)}

### 받침

{_word_lines(_W2_BATCHIM)}
"""

    return [
        {"name": "Cours", "key": "kr-cours", "color": COLOR, "parent": "kr"},
        {"name": "Semaine 1", "key": "kr-cours-w1", "color": COLOR,
         "parent": "kr-cours", "lesson": w1},
        {"name": "Semaine 2", "key": "kr-cours-w2", "color": COLOR,
         "parent": "kr-cours", "lesson": w2},
    ]


def build_hangeul_exercises(data):
    """Hangeul = reading only. Every item -> 'quel son ?' (mcq) + 'comment se
    prononce ?' (saisie). NEVER a meaning question ('que veut dire') -- meaning
    belongs to the Vocabulary decks."""

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
            distractors = RNG.sample([s for s in sound_pool if s != rr],
                                     k=min(3, len(sound_pool) - 1))
            choices = distractors + [rr]
            RNG.shuffle(choices)
            ex.append({
                "type": "mcq",
                "prompt": f"Quel son a « {ko} » ?",
                "choices": choices,
                "correct": choices.index(rr),
                "explanation": f"{ko} se prononce « {rr} ».",
            })

        _ = noun  # kept for readability of intent
    return ex


def main():
    seed = json.loads(SEED.read_text())
    seed = [c for c in seed if not str(c.get("key", "")).startswith("kr-")
            and c.get("name") not in ("Coréen", "Hangeul", "Vocabulaire")]

    kr = []
    kr.append({"name": "Coréen", "key": "kr", "color": COLOR, "parent": "School"})
    kr.append({
        "name": "Vocabulaire", "key": "kr-vocab", "color": COLOR, "parent": "kr",
        "lesson": build_vocab_lesson(VOCAB_MD.read_text()),
    })

    hangeul_exercises = build_hangeul_exercises(json.loads(HANGEUL_LETTERS.read_text()))
    kr.append({
        "name": "Hangeul", "key": "kr-hangeul", "color": COLOR, "parent": "kr",
        "exercises": hangeul_exercises,
    })

    kr.extend(build_course_categories())

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
