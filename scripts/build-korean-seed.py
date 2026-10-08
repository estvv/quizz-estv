#!/usr/bin/env python3
"""Merge the Korean branch into backend/src/db/seed.json.

Source of truth for vocab: documentation/coreen-vocab.md (parsed) — feeds the
  Vocabulaire container's list-lesson and one deck per `##` header.
Source of truth for the Hangeul reading exercises:
  documentation/coreen-hangeul-letters.json.
The `Cours` weeks (Coréen → Cours → Semaine N) are recap lessons hard-coded
  below from the GEE3003 slides (week_1 … week_5); they duplicate the vocab
  decks on purpose. Weeks 3–5 (grammar) also carry exercises and flashcards.

Hangeul exercises are ONLY "identify the sound / meaning" of a letter or word,
never conceptual questions about the writing system.

This is the ONE sanctioned seed generator: it regenerates the whole Korean
branch (keys "kr" / "kr-*") of backend/src/db/seed.json from the documentation
sources above. Every other subject is hand-authored directly in seed.json.

Deterministic: a fixed-seed RNG shuffles the MCQ choices, so re-running with
unchanged sources produces a byte-identical seed.json.

Idempotent: strips any previously-inserted Korean categories (by key prefix
"kr-") and re-inserts the branch at the same place, so it can be re-run after
editing the sources.
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


# --- phonétique « à la française » ----------------------------------------------
# Béquille visuelle, pas de l'API : on veut savoir quoi dire à voix haute.
# Conventions : non aspirées ㄱㄷㅂㅈ = k t p tj en tête de mot, g d b dj entre
# sonores · aspirées ㅋㅌㅍㅊ = kh th ph tch · tendues ㄲㄸㅃㅆㅉ = kk tt pp ss ttj
# · ㅜ = ou, ㅡ = e, ㅓ = o, ㅐ = è, ㅔ = é.
_FR_ONSET = {
    "g": "k", "kk": "kk", "k": "kh",
    "d": "t", "tt": "tt", "t": "th",
    "b": "p", "pp": "pp", "p": "ph",
    "j": "tj", "jj": "ttj", "ch": "tch",
    "n": "n", "m": "m", "r": "r", "l": "l",
    "s": "s", "ss": "ss", "h": "h", "ng": "ng", "": "",
}
# ㄱㄷㅂㅈ se sonorisent entre deux sons voisés (사과 sa-gwa [sa-gwa]).
_FR_ONSET_VOICED = {"g": "g", "d": "d", "b": "b", "j": "dj"}
_FR_CODA = {"k": "k", "n": "n", "t": "t", "l": "l", "m": "m", "p": "p", "ng": "ng",
            "g": "k", "d": "t", "b": "p", "s": "t", "ss": "t", "ch": "t", "j": "t",
            "h": "t", "": ""}
_FR_VOWEL = {
    "a": "a", "ae": "è", "ya": "ya", "yae": "yè",
    "eo": "o", "e": "é", "yeo": "yo", "ye": "yé",
    "o": "o", "wa": "wa", "wae": "wè", "oe": "wé", "yo": "yo",
    "u": "ou", "wo": "wo", "we": "wé", "wi": "wi", "yu": "you",
    "eu": "e", "ui": "eui", "i": "i",
}
_FR_VOICED_CODA = {"n", "m", "ng", "l"}

# Consonne isolée (ㄱ = g) : pas de syllabe à découper, on donne l'équivalent.
_JAMO_PHON = {
    "ㄱ": "k", "ㄲ": "kk", "ㅋ": "kh", "ㄴ": "n", "ㄷ": "t", "ㄸ": "tt", "ㅌ": "th",
    "ㄹ": "r", "ㅁ": "m", "ㅂ": "p", "ㅃ": "pp", "ㅍ": "ph", "ㅅ": "s", "ㅆ": "ss",
    "ㅇ": "muet · ng en finale", "ㅈ": "tj", "ㅉ": "ttj", "ㅊ": "tch", "ㅎ": "h",
}


def _split_syllable(s):
    """(onset, voyelle, coda) d'une syllabe romanisée, ou None si ce n'en est pas une."""
    onset = next((c for c in _RR_CONS if s.startswith(c)), "")
    i = len(onset)
    vowel = next((v for v in _RR_VOWELS if s.startswith(v, i)), "")
    if not vowel:
        return None
    return onset, vowel, s[i + len(vowel):]


def romaja_to_fr(rr_syllabe):
    """« maek-ju » -> « mèk-tjou ». Chaîne vide si ce n'est pas découpable."""
    parts = [p for p in rr_syllabe.lower().split("-") if p]
    if not parts:
        return ""
    out, prev_voiced = [], False
    for idx, syl in enumerate(parts):
        split = _split_syllable(syl)
        if split is None:
            return ""
        onset, vowel, coda = split
        if onset in _FR_ONSET_VOICED and idx > 0 and prev_voiced:
            fr_onset = _FR_ONSET_VOICED[onset]
        elif onset in ("s", "ss") and (vowel[0] in "iy" or vowel == "wi"):
            fr_onset = "ch" if onset == "s" else "ch"   # 시 [chi], 씨 [chi]
        else:
            fr_onset = _FR_ONSET.get(onset, onset)
        out.append(fr_onset + _FR_VOWEL.get(vowel, vowel) + _FR_CODA.get(coda, coda))
        prev_voiced = coda == "" or coda in _FR_VOICED_CODA
    return "-".join(out)


def gloss(ko, rr):
    """La ligne de correction : « 맥주 = maek-ju = [mèk-tjou] »."""
    syl = hyphenate_rr(ko, rr)
    phon = romaja_to_fr(syl) or _JAMO_PHON.get(ko, "")
    return f"{ko} = {syl}" + (f" = [{phon}]" if phon else "")


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
            out.append(f"- {gloss(w['ko'], w['rr'])} = {w['fr'][0]}")
        out.append("")
    return "\n".join(out).rstrip() + "\n"


# --- Cours (par semaine) --------------------------------------------------------
# One lesson per week of GEE3003 "Basic Korean", rebuilt from its slides (rules,
# tables, corrected practice), with exercises and flashcards. Duplicates the
# Vocabulaire decks on purpose -- these leaves follow the course, not the themes.

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
    w1 = f"""# Coréen — Semaine 1 · Le hangeul : voyelles et consonnes de base

Cours GEE3003 « Basic Korean », Day 1 (week_1.pdf) : comment le **hangeul**
(한글) est construit, les **10 voyelles de base**, les **10 consonnes de
base**, et comment on les assemble en **syllabes**.

> **En bref.** Le hangeul a été créé par le **roi Sejong** (XVe siècle). Les
> **voyelles** viennent de **trois éléments** : **•** (le ciel), **ㅡ** (la
> terre), **ㅣ** (l'humain). Les **consonnes** dessinent la **forme de la
> bouche** qui les prononce, et **un trait en plus** = un son **plus fort**.
> On écrit par **syllabes** : consonne + voyelle, dans un bloc carré. Une
> voyelle seule s'écrit avec **ㅇ muet** devant : 아, 오, 이.

## 1. Le principe des voyelles (모음)

Trois éléments de base :

| Élément | Symbolise |
|---|---|
| **•** | le **ciel** (le soleil) |
| **ㅡ** | la **terre** (plate) |
| **ㅣ** | l'**humain** (debout) |

On colle le point (•) à ㅣ ou à ㅡ, d'un côté ou de l'autre :

| Combinaison | Voyelle | | Combinaison | Voyelle |
|---|---|---|---|---|
| ㅣ + • | **ㅏ** (a) | | • + ㅣ | **ㅓ** (eo) |
| • + ㅡ (point au-dessus) | **ㅗ** (o) | | ㅡ + • (point en dessous) | **ㅜ** (u) |

Un **deuxième point** ajoute un son **[y]** devant : ㅏ → **ㅑ** (ya),
ㅓ → **ㅕ** (yeo), ㅗ → **ㅛ** (yo), ㅜ → **ㅠ** (yu).

### Les 10 voyelles de base

| ㅏ | ㅑ | ㅓ | ㅕ | ㅗ | ㅛ | ㅜ | ㅠ | ㅡ | ㅣ |
|---|---|---|---|---|---|---|---|---|---|
| a | ya | eo | yeo | o | yo | u | yu | eu | i |
| [a] | [ya] | [o ouvert, « or »] | [yo ouvert] | [o fermé, « eau »] | [yo] | [ou] | [you] | [eu, lèvres étirées] | [i] |

> **Piège :** **ㅓ (eo)** et **ㅗ (o)** sont deux « o » différents : ㅓ est
> **ouvert** (bouche ouverte, comme dans « porte »), ㅗ est **fermé**, lèvres
> arrondies (comme dans « eau »). Et **ㅜ = [ou]**, pas [u].

### Écrire une voyelle seule

Une syllabe commence **toujours par une consonne**. Pour écrire une voyelle
seule, on met devant **ㅇ, muet en début de syllabe** :

{_syl_table(["ㅇ"], _V10)}

### Où placer la voyelle ?

- Voyelles **verticales** (ㅏ ㅑ ㅓ ㅕ ㅣ) → **à droite** de la consonne : 가, 너, 리.
- Voyelles **horizontales** (ㅗ ㅛ ㅜ ㅠ ㅡ) → **sous** la consonne : 고, 누, 므.

## 2. Le principe des consonnes (자음)

Les consonnes de base **dessinent l'organe** qui les prononce :

| Consonne | Ce qu'elle dessine |
|---|---|
| **ㄱ** | l'**arrière de la langue** qui bloque le fond de la gorge |
| **ㄴ** | le **bout de la langue** qui touche l'arrière des dents du haut |
| **ㅁ** | la **bouche** (les lèvres fermées) |
| **ㅅ** | une **dent** |
| **ㅇ** | la **gorge** (le gosier) |

**Un trait en plus = un son plus fort** (plus d'air) :

| Base | + un trait | + encore un |
|---|---|---|
| ㄱ | ㅋ | |
| ㄴ | ㄷ | ㅌ |
| ㅁ | ㅂ | ㅍ |
| ㅅ | ㅈ | ㅊ |
| ㅇ | ㅎ | |

Et en **doublant** une consonne, on obtient les consonnes **tendues** :
ㄲ ㄸ ㅃ ㅆ ㅉ (semaine 2).

### Les 10 consonnes de base

| Consonne | Son | Image des slides |
|---|---|---|
| **ㄱ** | [k / g] | un pistolet (la forme de ㄱ) |
| **ㄴ** | [n] | le nez |
| **ㄷ** | [t / d] | la porte (door) |
| **ㄹ** | [r / l] | le serpent (la forme qui ondule) |
| **ㅁ** | [m] | la bouche |
| **ㅂ** | [p / b] | |
| **ㅅ** | [s] | |
| **ㅇ** | **muet** en début de syllabe, **[ng]** en fin | « No sound » |
| **ㅈ** | [j] (« dj ») | |
| **ㅎ** | [h] | |

> **Bon à savoir :** ㄱ ㄷ ㅂ ㅈ sont plutôt **[k] [t] [p] [tch]** en début de
> mot, et deviennent **[g] [d] [b] [dj]** entre deux voyelles : 가구 se dit
> [ka-gou], 바다 [pa-da].

## 3. Les syllabes : consonne + voyelle

{_syl_table(list("ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅎ"), _V10)}

## 4. Mots (단어)

{_word_lines(_W1_WORDS)}

## 5. Pratique des slides (corrigé)

Les exercices d'écoute opposent des voyelles proches. Pour les distinguer à
l'écrit :

| Paire | Différence |
|---|---|
| 어 / 아 | ㅓ (o ouvert) / ㅏ (a) |
| 여 / 유 | ㅕ (yo ouvert) / ㅠ (you) |
| 오 / 우 | ㅗ (o fermé) / ㅜ (ou) |
| 야 / 유 | ㅑ (ya) / ㅠ (you) |
| 으 / 이 | ㅡ (eu) / ㅣ (i) |
| 가 / 다, 마 / 나, 아 / 라, 자 / 바, 하 / 사 | la **consonne** change, la voyelle ㅏ reste |
"""

    w2 = f"""# Coréen — Semaine 2 · Consonnes fortes, voyelles composées, 받침

Cours GEE3003 « Basic Korean », Day 2 (week_2.pdf) : les consonnes
**aspirées** et **tendues**, les **voyelles composées**, et les **consonnes
finales** (받침).

> **En bref.** **Aspirées** (ㅊ ㅋ ㅌ ㅍ) = avec un **souffle d'air**.
> **Tendues** (ㄲ ㄸ ㅃ ㅆ ㅉ) = gorge **serrée**, **sans souffle**. Les
> **voyelles composées** collent deux voyelles (ㅗ + ㅏ = ㅘ). En **fin de
> syllabe**, une consonne ne se prononce qu'avec **7 sons** : [k] [n] [t]
> [l] [m] [p] [ng].

## 1. Les consonnes aspirées (거센소리)

On ajoute un trait à la consonne de base, et on prononce avec un **fort
souffle d'air** (mets ta main devant la bouche : tu dois le sentir).

| Base | Aspirée | Son |
|---|---|---|
| ㅈ | **ㅊ** | [ch] (« tch » + souffle) |
| ㄱ | **ㅋ** | [kh] |
| ㄷ | **ㅌ** | [th] |
| ㅂ | **ㅍ** | [ph] |

{_syl_table(list("ㅊㅋㅌㅍ"), _V10)}

Mots : {", ".join(f"{ko} ({fr})" for fr, ko, _ in _W2_ASPIR)}.

## 2. Les consonnes tendues (된소리)

On **double** la consonne de base. On serre la gorge, on ne laisse **pas**
sortir d'air : le son est sec et dur.

| Base | Tendue | Son |
|---|---|---|
| ㄱ | **ㄲ** | [kk] |
| ㄷ | **ㄸ** | [tt] |
| ㅂ | **ㅃ** | [pp] |
| ㅅ | **ㅆ** | [ss] |
| ㅈ | **ㅉ** | [jj] |

{_syl_table(list("ㄲㄸㅃㅆㅉ"), _V6)}

Mots : {", ".join(f"{ko} ({fr})" for fr, ko, _ in _W2_TENSE)}.

### Plaine / tendue / aspirée

C'est l'exercice d'écoute des slides (« Listen and repeat ») :

| plaine (douce) | tendue (serrée, sans air) | aspirée (avec de l'air) |
|---|---|---|
| 가 ga | 까 kka | 카 ka |
| 다 da | 따 tta | 타 ta |
| 바 ba | 빠 ppa | 파 pa |
| 사 sa | 싸 ssa | — |
| 자 ja | 짜 jja | 차 cha |

> **Piège :** ㅅ n'a **pas** de version aspirée, seulement la tendue ㅆ.

## 3. Les voyelles composées (모음 2)

| Voyelle | Formée de | Son |
|---|---|---|
| **ㅐ** | ㅏ + ㅣ | [è] |
| **ㅒ** | ㅑ + ㅣ | [yè] |
| **ㅔ** | ㅓ + ㅣ | [é] |
| **ㅖ** | ㅕ + ㅣ | [yé] |
| **ㅘ** | ㅗ + ㅏ | [wa] |
| **ㅝ** | ㅜ + ㅓ | [wo] |
| **ㅚ** | ㅗ + ㅣ | [wè] |
| **ㅙ** | ㅗ + ㅐ | [wè] |
| **ㅞ** | ㅜ + ㅔ | [wè] |
| **ㅟ** | ㅜ + ㅣ | [wi] |
| **ㅢ** | ㅡ + ㅣ | [eui] |

Lues seules (avec ㅇ) : 애 얘 에 예 와 워 외 왜 웨 위 의.

> **Astuce :** une voyelle en **ㅗ** se combine avec **ㅏ** (ㅘ, ㅙ) ; une
> voyelle en **ㅜ** avec **ㅓ** (ㅝ, ㅞ). Jamais ㅗ + ㅓ ni ㅜ + ㅏ.
> **ㅐ et ㅔ** se prononcent presque pareil aujourd'hui ; **ㅚ, ㅙ, ㅞ**
> aussi ([wè]).

Mots : {", ".join(f"{ko} ({fr})" for fr, ko, _ in _W2_VOWELS)}.

## 4. Les consonnes finales — 받침

Une consonne peut se placer **sous** la syllabe : c'est le **받침** (« ce qui
soutient »). Quelle que soit la lettre écrite, elle ne se prononce qu'avec
**7 sons**, **sans relâcher** (la bouche reste fermée sur le son) :

| Son | Lettres | Mots des slides |
|---|---|---|
| **[k]** | ㄱ, ㅋ, ㄲ | 약, 책, 대학, 미국, 부엌, 밖 |
| **[n]** | ㄴ | 눈, 돈, 언니, 도서관, 친구 |
| **[t]** | ㄷ, ㅅ, ㅆ, ㅈ, ㅊ, ㅌ, ㅎ | 곧, 맛, 옷, 붓, 있, 낮, 꽃, 밭 |
| **[l]** | ㄹ | 길, 말, 쌀, 가을, 교실, 서울 |
| **[m]** | ㅁ | 봄, 감기, 김치, 사람, 서점 |
| **[p]** | ㅂ, ㅍ | 집, 입, 컵, 아홉, 앞, 옆, 숲 |
| **[ng]** | ㅇ | 강, 방, 빵, 고향, 동생, 공장 |

> **Piège :** 꽃, 옷, 낮, 밭 se terminent tous par **[t]** : 꽃 [kkot],
> 옷 [ot]. Et 부엌 se dit [pu-eok], avec un [k] simple.

### Bon à savoir (slides)

- Après un 받침 [k] [t] [p], la consonne suivante devient **tendue** :
  **낚시 → [낙씨]**, **숟가락 → [숟까락]**.
- Avec ou sans 받침, c'est un autre mot : **눈** (œil) / **누**, **물** (eau) /
  **무** (radis), **밤** (nuit) / **밖** (dehors), **입** (bouche) / **잎**
  (feuille) — même son [ip], sens différent.

## 5. Mots (단어)

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
         "parent": "kr-cours", "lesson": w1, "exercises": _w1_exercises(),
         "flashcards": _fc(_W1_FC)},
        {"name": "Semaine 2", "key": "kr-cours-w2", "color": COLOR,
         "parent": "kr-cours", "lesson": w2, "exercises": _w2_exercises(),
         "flashcards": _fc(_W2_FC)},
    ]


_V10_RR = ["a", "ya", "eo", "yeo", "o", "yo", "u", "yu", "eu", "i"]
_C10 = list("ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅎ")
_C10_SOUND = ["[k / g]", "[n]", "[t / d]", "[r / l]", "[m]", "[p / b]", "[s]",
              "muet / [ng]", "[j]", "[h]"]


def _w1_exercises():
    ex = []
    ex.append({"type": "matching", "prompt": "Associe chaque élément de base des voyelles à ce qu'il symbolise.",
               "pairs": [["•", "le ciel"], ["ㅡ", "la terre"], ["ㅣ", "l'humain"]],
               "explanation": "Les trois éléments du roi Sejong : ciel, terre, humain."})
    for combo, right in [("ㅣ + • (point à droite)", "ㅏ"), ("• + ㅣ (point à gauche)", "ㅓ"),
                         ("• au-dessus de ㅡ", "ㅗ"), ("• au-dessous de ㅡ", "ㅜ")]:
        ex.append(_mcq(f"Quelle voyelle donne {combo} ?", right,
                       [v for v in "ㅏㅓㅗㅜ" if v != right],
                       f"{combo} = {right}."))
    for base, right in [("ㅏ", "ㅑ"), ("ㅓ", "ㅕ"), ("ㅗ", "ㅛ"), ("ㅜ", "ㅠ")]:
        ex.append(_mcq(f"On ajoute un deuxième trait à {base}. Quelle voyelle obtient-on ?", right,
                       [v for v in "ㅑㅕㅛㅠ" if v != right],
                       f"Deux traits = son [y] devant : {base} → {right}."))
    ex.append({"type": "matching", "prompt": "Associe chaque voyelle à sa romanisation.",
               "pairs": [[v, rr] for v, rr in zip(_V10, _V10_RR)],
               "explanation": "Les 10 voyelles de base."})
    ex.append(_mcq("Pourquoi écrit-on 아 et pas ㅏ tout seul ?", "Une syllabe commence par une consonne : ㅇ muet sert de support",
                   ["ㅇ ajoute un son [ng] devant", "C'est la forme de politesse", "ㅏ seul se lit [ya]"],
                   "ㅇ est muet en début de syllabe ; il ne se prononce [ng] qu'en fin de syllabe."))
    ex.append(_mcq("Où se place la voyelle ㅗ dans une syllabe ?", "Sous la consonne (voyelle horizontale)",
                   ["À droite de la consonne", "À gauche de la consonne", "Au-dessus de la consonne"],
                   "ㅗ ㅛ ㅜ ㅠ ㅡ sont horizontales : 고, 노, 도."))
    ex.append(_mcq("Où se place la voyelle ㅓ dans une syllabe ?", "À droite de la consonne (voyelle verticale)",
                   ["Sous la consonne", "Au-dessus de la consonne", "À gauche de la consonne"],
                   "ㅏ ㅑ ㅓ ㅕ ㅣ sont verticales : 거, 너, 더."))
    ex.append(_mcq("Quelle différence entre ㅓ (eo) et ㅗ (o) ?", "ㅓ est un o ouvert (« or »), ㅗ un o fermé, lèvres arrondies (« eau »)",
                   ["Aucune, c'est le même son", "ㅓ se lit [a]", "ㅗ se lit [ou]"],
                   "Deux « o » différents : ouvert pour ㅓ, fermé pour ㅗ."))
    ex.append(_mcq("Comment se prononce ㅜ ?", "[ou]", ["[u] comme en français « tu »", "[o]", "[eu]"],
                   "ㅜ (u en romanisation) se dit [ou]."))
    ex.append({"type": "matching", "prompt": "Associe chaque consonne de base à l'organe qu'elle dessine.",
               "pairs": [["ㄱ", "l'arrière de la langue qui bloque la gorge"], ["ㄴ", "le bout de la langue contre les dents"],
                         ["ㅁ", "la bouche"], ["ㅅ", "une dent"], ["ㅇ", "la gorge"]],
               "explanation": "Les consonnes de base dessinent la forme des organes de la parole."})
    for base, right in [("ㄱ", "ㅋ"), ("ㄴ", "ㄷ"), ("ㅁ", "ㅂ"), ("ㅅ", "ㅈ"), ("ㅇ", "ㅎ")]:
        ex.append(_mcq(f"On ajoute un trait à {base} (son plus fort). Quelle consonne obtient-on ?", right,
                       [c for c in "ㅋㄷㅂㅈㅎ" if c != right],
                       f"{base} + un trait = {right}."))
    ex.append({"type": "matching", "prompt": "Associe chaque consonne de base à son son.",
               "pairs": [[c, s] for c, s in zip(_C10, _C10_SOUND)],
               "explanation": "Les 10 consonnes de base de la semaine 1."})
    ex.append(_mcq("Comment se prononce ㅇ au début d'une syllabe ?", "Il est muet", ["[ng]", "[o]", "[h]"],
                   "ㅇ est muet en début de syllabe (아 = [a]) et se dit [ng] en fin (강 = [kang])."))
    ex.append(_mcq("Comment se prononce 가구 (meuble) ?", "[ka-gou] : ㄱ = [k] en début de mot, [g] entre deux voyelles",
                   ["[ga-gou]", "[ka-kou]", "[ga-kou]"],
                   "ㄱ ㄷ ㅂ ㅈ s'adoucissent entre deux voyelles."))
    for cons, vow, right in [("ㄴ", "ㅏ", "나"), ("ㅎ", "ㅗ", "호"), ("ㄹ", "ㅣ", "리"), ("ㅂ", "ㅠ", "뷰"),
                             ("ㅈ", "ㅓ", "저"), ("ㅁ", "ㅡ", "므"), ("ㅅ", "ㅜ", "수")]:
        ex.append(_ta(f"Assemble la syllabe : {cons} + {vow}", [right], f"{cons} + {vow} = {right}."))
    for word, parts, wrongs in [("무", "ㅁ + ㅜ", ["ㅁ + ㅗ", "ㅂ + ㅜ", "ㅁ + ㅡ"]),
                                ("너", "ㄴ + ㅓ", ["ㄴ + ㅏ", "ㄷ + ㅓ", "ㄴ + ㅕ"]),
                                ("효", "ㅎ + ㅛ", ["ㅎ + ㅗ", "ㅇ + ㅛ", "ㅎ + ㅠ"])]:
        ex.append(_mcq(f"Quelles lettres forment {word} ?", parts, wrongs, f"{word} = {parts}."))
    ex.append({"type": "matching", "prompt": "Associe chaque mot de la semaine 1 à son sens.",
               "pairs": [["아이", "enfant"], ["오이", "concombre"], ["우유", "lait"], ["여우", "renard"],
                         ["나비", "papillon"], ["가수", "chanteur"]],
               "explanation": "Mots des slides (SB p.21)."})
    ex.append({"type": "matching", "prompt": "Associe d'autres mots de la semaine 1 à leur sens.",
               "pairs": [["고기", "viande"], ["구두", "chaussures"], ["다리", "jambe / pont"], ["나라", "pays"],
                         ["머리", "tête / cheveux"], ["나무", "arbre"]],
               "explanation": "Mots des slides."})
    for a, b, which, sound in [("어", "아", "어", "[o ouvert]"), ("오", "우", "우", "[ou]"),
                               ("으", "이", "으", "[eu]"), ("여", "유", "유", "[you]")]:
        other = b if which == a else a
        ex.append(_mcq(f"Lequel se lit {sound} : {a} ou {b} ?", which, [other],
                       f"{which} = {sound} ; {other} est l'autre voyelle de la paire."))
    return ex


_W1_FC = [
    ("•  ㅡ  ㅣ", "Les trois éléments des voyelles : le ciel, la terre, l'humain."),
    ("ㅏ ㅑ ㅓ ㅕ ㅗ", "a, ya, eo (o ouvert), yeo, o (o fermé)."),
    ("ㅛ ㅜ ㅠ ㅡ ㅣ", "yo, u [ou], yu [you], eu, i."),
    ("Deuxième trait sur une voyelle", "Ajoute un [y] : ㅏ → ㅑ, ㅓ → ㅕ, ㅗ → ㅛ, ㅜ → ㅠ."),
    ("Voyelle verticale / horizontale", "ㅏㅑㅓㅕㅣ à droite de la consonne ; ㅗㅛㅜㅠㅡ en dessous."),
    ("ㅇ", "Muet en début de syllabe (아), [ng] en fin (강)."),
    ("Consonnes = forme de la bouche", "ㄱ arrière de la langue, ㄴ bout de la langue, ㅁ bouche, ㅅ dent, ㅇ gorge."),
    ("Un trait en plus", "Son plus fort : ㄱ→ㅋ, ㄴ→ㄷ→ㅌ, ㅁ→ㅂ→ㅍ, ㅅ→ㅈ→ㅊ, ㅇ→ㅎ."),
    ("ㄱ ㄴ ㄷ ㄹ ㅁ", "[k/g] [n] [t/d] [r/l] [m]."),
    ("ㅂ ㅅ ㅇ ㅈ ㅎ", "[p/b] [s] muet/[ng] [j] [h]."),
    ("ㄱ ㄷ ㅂ ㅈ entre deux voyelles", "S'adoucissent : 가구 [ka-gou], 바다 [pa-da]."),
]


def _w2_exercises():
    ex = []
    ex.append({"type": "matching", "prompt": "Associe chaque consonne de base à sa version aspirée.",
               "pairs": [["ㅈ", "ㅊ"], ["ㄱ", "ㅋ"], ["ㄷ", "ㅌ"], ["ㅂ", "ㅍ"]],
               "explanation": "Un trait en plus = un souffle d'air."})
    ex.append({"type": "matching", "prompt": "Associe chaque consonne de base à sa version tendue.",
               "pairs": [["ㄱ", "ㄲ"], ["ㄷ", "ㄸ"], ["ㅂ", "ㅃ"], ["ㅅ", "ㅆ"], ["ㅈ", "ㅉ"]],
               "explanation": "On double la lettre : gorge serrée, sans souffle."})
    ex.append(_mcq("Comment prononce-t-on une consonne aspirée (ㅊ ㅋ ㅌ ㅍ) ?", "Avec un fort souffle d'air",
                   ["La gorge serrée, sans air", "Sans faire de bruit", "Comme une voyelle"],
                   "Aspirée = souffle ; tendue = gorge serrée, sans souffle."))
    ex.append(_mcq("Comment prononce-t-on une consonne tendue (ㄲ ㄸ ㅃ ㅆ ㅉ) ?", "La gorge serrée, sans laisser sortir d'air",
                   ["Avec un fort souffle d'air", "Deux fois de suite", "Très doucement"],
                   "Doubler la lettre ne veut pas dire la prononcer deux fois."))
    for syl, kind, wrongs in [("까", "tendue", ["plaine", "aspirée"]), ("카", "aspirée", ["plaine", "tendue"]),
                              ("가", "plaine", ["tendue", "aspirée"]), ("따", "tendue", ["plaine", "aspirée"]),
                              ("파", "aspirée", ["plaine", "tendue"]), ("짜", "tendue", ["plaine", "aspirée"]),
                              ("차", "aspirée", ["plaine", "tendue"])]:
        ex.append(_mcq(f"Quel type de consonne commence {syl} ?", kind, wrongs,
                       f"{syl} : consonne {kind}."))
    ex.append(_mcq("Quelle consonne n'a PAS de version aspirée ?", "ㅅ", ["ㄱ", "ㄷ", "ㅂ"],
                   "ㅅ a seulement une version tendue (ㅆ) : 사 / 싸 / —."))
    for combo, right, wrongs in [("ㅗ + ㅏ", "ㅘ", ["ㅝ", "ㅚ", "ㅙ"]), ("ㅜ + ㅓ", "ㅝ", ["ㅘ", "ㅟ", "ㅞ"]),
                                 ("ㅗ + ㅣ", "ㅚ", ["ㅟ", "ㅘ", "ㅢ"]), ("ㅜ + ㅣ", "ㅟ", ["ㅚ", "ㅝ", "ㅢ"]),
                                 ("ㅡ + ㅣ", "ㅢ", ["ㅟ", "ㅚ", "ㅐ"]), ("ㅏ + ㅣ", "ㅐ", ["ㅔ", "ㅒ", "ㅖ"]),
                                 ("ㅓ + ㅣ", "ㅔ", ["ㅐ", "ㅖ", "ㅒ"]), ("ㅗ + ㅐ", "ㅙ", ["ㅞ", "ㅚ", "ㅘ"]),
                                 ("ㅜ + ㅔ", "ㅞ", ["ㅙ", "ㅟ", "ㅝ"])]:
        ex.append(_mcq(f"Quelle voyelle composée donne {combo} ?", right, wrongs, f"{combo} = {right}."))
    ex.append({"type": "matching", "prompt": "Associe chaque voyelle composée à son son.",
               "pairs": [["ㅘ", "wa"], ["ㅝ", "wo"], ["ㅟ", "wi"], ["ㅢ", "ui"], ["ㅖ", "ye"], ["ㅒ", "yae"]],
               "explanation": "Voyelles composées de la semaine 2."})
    ex.append(_mcq("Pourquoi n'existe-t-il pas de voyelle « ㅗ + ㅓ » ?", "ㅗ se combine avec ㅏ, et ㅜ avec ㅓ",
                   ["Parce qu'elle se prononce comme ㅘ", "Elle existe : c'est ㅝ", "Parce que ㅗ est vertical"],
                   "ㅘ ㅙ (ㅗ + ㅏ/ㅐ) ; ㅝ ㅞ (ㅜ + ㅓ/ㅔ)."))
    ex.append(_mcq("Quelles voyelles se prononcent presque toutes [wè] ?", "ㅚ, ㅙ et ㅞ", ["ㅘ, ㅝ et ㅟ", "ㅐ, ㅒ et ㅔ", "ㅢ, ㅟ et ㅚ"],
                   "Aujourd'hui, ㅚ ㅙ ㅞ sonnent presque pareil."))
    ex.append({"type": "matching", "prompt": "Associe chaque son final (받침) aux lettres qui le donnent.",
               "pairs": [["[k]", "ㄱ, ㅋ, ㄲ"], ["[n]", "ㄴ"], ["[t]", "ㄷ, ㅅ, ㅆ, ㅈ, ㅊ, ㅌ, ㅎ"], ["[l]", "ㄹ"],
                         ["[m]", "ㅁ"], ["[p]", "ㅂ, ㅍ"], ["[ng]", "ㅇ"]],
               "explanation": "Les 7 sons du 받침."})
    finals = ["[k]", "[n]", "[t]", "[l]", "[m]", "[p]", "[ng]"]
    for word, right in [("꽃", "[t]"), ("밖", "[k]"), ("옷", "[t]"), ("부엌", "[k]"), ("앞", "[p]"), ("숲", "[p]"),
                        ("있", "[t]"), ("밭", "[t]"), ("낮", "[t]"), ("길", "[l]"), ("봄", "[m]"), ("방", "[ng]"),
                        ("돈", "[n]"), ("집", "[p]")]:
        wrongs = random.Random(word).sample([f for f in finals if f != right], 3)
        ex.append(_mcq(f"Quel son a le 받침 de {word} ?", right, wrongs,
                       f"{word} : 받침 prononcé {right}."))
    ex.append(_mcq("Combien de sons différents un 받침 peut-il avoir ?", "7", ["14", "10", "5"],
                   "[k] [n] [t] [l] [m] [p] [ng]."))
    ex.append(_mcq("Comment se prononce 낚시 (pêche) ?", "[낙씨] : après le 받침 [k], ㅅ devient tendu",
                   ["[낚시]", "[나시]", "[낙시]"], "Après [k] [t] [p], la consonne suivante se tend."))
    ex.append(_mcq("Comment se prononce 숟가락 (cuillère) ?", "[숟까락]", ["[숟가락]", "[수가락]", "[숫가락]"],
                   "Après le 받침 [t], ㄱ devient ㄲ."))
    ex.append(_mcq("입 (bouche) et 잎 (feuille) se prononcent…", "Pareil : [ip]", ["Différemment : [ip] et [iph]", "[im] et [ip]", "[i] et [ip]"],
                   "ㅂ et ㅍ en 받침 donnent tous deux [p]."))
    ex.append({"type": "matching", "prompt": "Associe chaque mot de la semaine 2 à son sens.",
               "pairs": [["치마", "jupe"], ["기차", "train"], ["코", "nez"], ["포도", "raisin"], ["토끼", "lapin"], ["아빠", "papa"]],
               "explanation": "Mots des consonnes aspirées et tendues."})
    ex.append({"type": "matching", "prompt": "Associe d'autres mots de la semaine 2 à leur sens.",
               "pairs": [["시계", "montre"], ["의자", "chaise"], ["과자", "gâteau sec"], ["귀", "oreille"], ["돼지", "cochon"], ["노래", "chanson"]],
               "explanation": "Mots des voyelles composées."})
    ex.append({"type": "matching", "prompt": "Associe ces mots à 받침 à leur sens.",
               "pairs": [["책", "livre"], ["눈", "œil / neige"], ["꽃", "fleur"], ["길", "route"], ["봄", "printemps"], ["강", "fleuve"]],
               "explanation": "Mots du tableau des 받침."})
    return ex


_W2_FC = [
    ("Aspirées : ㅊ ㅋ ㅌ ㅍ", "Avec un souffle d'air. Base + un trait (ㅈ→ㅊ, ㄱ→ㅋ, ㄷ→ㅌ, ㅂ→ㅍ)."),
    ("Tendues : ㄲ ㄸ ㅃ ㅆ ㅉ", "Gorge serrée, sans souffle. Base doublée."),
    ("가 / 까 / 카", "plaine / tendue / aspirée."),
    ("ㅅ aspirée ?", "N'existe pas : 사 / 싸 seulement."),
    ("ㅐ / ㅔ", "ㅏ+ㅣ [è] / ㅓ+ㅣ [é] — presque pareils aujourd'hui."),
    ("ㅘ / ㅝ", "ㅗ+ㅏ [wa] / ㅜ+ㅓ [wo]."),
    ("ㅚ / ㅙ / ㅞ", "ㅗ+ㅣ / ㅗ+ㅐ / ㅜ+ㅔ — tous ≈ [wè]."),
    ("ㅟ / ㅢ", "ㅜ+ㅣ [wi] / ㅡ+ㅣ [eui]."),
    ("받침 : les 7 sons", "[k] [n] [t] [l] [m] [p] [ng]."),
    ("받침 [k] / [p]", "[k] : ㄱ ㅋ ㄲ ; [p] : ㅂ ㅍ."),
    ("받침 [t]", "ㄷ ㅅ ㅆ ㅈ ㅊ ㅌ ㅎ (꽃, 옷, 낮, 밭 → [t])."),
    ("낚시 / 숟가락", "[낙씨] / [숟까락] : après [k] [t] [p], la consonne suivante se tend."),
]


# RR de chaque consonne initiale, dans l'ordre de _CHO (ㅇ initial est muet).
_CHO_RR = ["g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s", "ss", "",
           "j", "jj", "ch", "k", "t", "p", "h"]

_CONS_REF = [
    # lettre, RR, phon. initiale, phon. batchim, exemple (ko, rr)
    ("ㄱ", "g / k", "k · g entre sonores", "k", "가구", "gagu"),
    ("ㄲ", "kk", "kk", "k", "꼬리", "kkori"),
    ("ㅋ", "k", "kh", "k", "커피", "keopi"),
    ("ㄴ", "n", "n", "n", "나라", "nara"),
    ("ㄷ", "d / t", "t · d entre sonores", "t", "다리", "dari"),
    ("ㄸ", "tt", "tt", "—", "머리띠", "meoritti"),
    ("ㅌ", "t", "th", "t", "토마토", "tomato"),
    ("ㄹ", "r / l", "r", "l", "라디오", "radio"),
    ("ㅁ", "m", "m", "m", "머리", "meori"),
    ("ㅂ", "b / p", "p · b entre sonores", "p", "바나나", "banana"),
    ("ㅃ", "pp", "pp", "—", "아빠", "appa"),
    ("ㅍ", "p", "ph", "p", "포도", "podo"),
    ("ㅅ", "s", "s · ch devant i/y", "t", "사과", "sagwa"),
    ("ㅆ", "ss", "ss", "t", "쓰다", "sseuda"),
    ("ㅇ", "— / ng", "muette en tête", "ng", "아이", "ai"),
    ("ㅈ", "j", "tj · dj entre sonores", "t", "의자", "uija"),
    ("ㅉ", "jj", "ttj", "—", "짜다", "jjada"),
    ("ㅊ", "ch", "tch", "t", "기차", "gicha"),
    ("ㅎ", "h", "h (souvent effacé)", "t", "호수", "hosu"),
]

_LESSON_EXAMPLES = [
    ("bière", "맥주", "maekju"), ("café", "커피", "keopi"),
    ("kimchi", "김치", "gimchi"), ("école", "학교", "hakgyo"),
    ("ami(e)", "친구", "chingu"), ("pomme", "사과", "sagwa"),
    ("eau", "물", "mul"), ("bonjour", "안녕하세요", "annyeonghaseyo"),
    ("merci", "감사합니다", "gamsahamnida"), ("hôpital", "병원", "byeongwon"),
]


def build_hangeul_lesson():
    """La feuille de référence : chaque lettre reliée à son RR et à sa
    phonétique française, plus la matrice complète consonne × voyelle."""
    jung = list(_JUNG)

    # matrice 19 x 21 : chaque case = syllabe + phonétique
    head = "|  | " + " | ".join(f"{v} {_RR_JUNG[i]}" for i, v in enumerate(jung)) + " |"
    sep = "|" + "---|" * (len(jung) + 1)
    rows = []
    for ci, c in enumerate(_CHO):
        cells = []
        for vi, v in enumerate(jung):
            rr = _CHO_RR[ci] + _RR_JUNG[vi]
            cells.append(f"{_syl(c, v)} [{romaja_to_fr(rr)}]")
        label = f"**{c}** {_CHO_RR[ci] or '—'}"
        rows.append("| " + label + " | " + " | ".join(cells) + " |")
    matrix = "\n".join([head, sep] + rows)

    cons_ref = "\n".join(
        f"| {ko} | {rr} | {ini} | {bat} | {gloss(ex_ko, ex_rr)} |"
        for ko, rr, ini, bat, ex_ko, ex_rr in _CONS_REF
    )
    vowel_ref = "\n".join(
        f"| {v} | {_RR_JUNG[i]} | {_FR_VOWEL[_RR_JUNG[i]]} | {_syl('ㅇ', v)} [{romaja_to_fr(_RR_JUNG[i])}] |"
        for i, v in enumerate(jung)
    )
    examples = "\n".join(f"- {gloss(ko, rr)} → **{fr}**" for fr, ko, rr in _LESSON_EXAMPLES)

    return f"""# Hangeul — lire et prononcer

Chaque case donne la syllabe puis, entre crochets, sa **phonétique approximative
à la française**. Ce n'est pas de l'API : c'est une béquille pour savoir quoi
dire à voix haute.

Format utilisé partout dans l'appli :
**{gloss("맥주", "maekju")} → bière**

## Conventions

| Série | Lettres | Phonétique FR | Exemple |
|---|---|---|---|
| non aspirée | ㄱ ㄷ ㅂ ㅈ | **k · t · p · tj** en tête de mot | 가 [ka] · 다 [ta] |
| non aspirée entre deux sonores | ㄱ ㄷ ㅂ ㅈ | **g · d · b · dj** | {gloss("사과", "sagwa")} |
| aspirée (souffle) | ㅋ ㅌ ㅍ ㅊ | **kh · th · ph · tch** | 카 [kha] · 차 [tcha] |
| tendue (pincée) | ㄲ ㄸ ㅃ ㅆ ㅉ | **kk · tt · pp · ss · ttj** | 까 [kka] · 빠 [ppa] |

Voyelles à retenir : **ㅜ = ou**, **ㅡ = e** (comme dans « je »), **ㅓ = o**
ouvert, **ㅐ = è**, **ㅔ = é**, **ㅢ = eui**.

## Consonnes (자음)

| Lettre | RR | Phon. FR en tête | Phon. FR en batchim | Exemple |
|---|---|---|---|---|
{cons_ref}

## Voyelles (모음)

| Lettre | RR | Phon. FR | Lue seule (avec ㅇ) |
|---|---|---|---|
{vowel_ref}

## Matrice complète — consonne × voyelle

19 consonnes × 21 voyelles. Le tableau défile horizontalement.

{matrix}

## Batchim — les 7 sons

Une consonne en fin de syllabe ne se prononce qu'en sept sons, **bloqués**
(la bouche prend la position mais ne libère pas l'air).

| Son | Lettres | Phon. FR | Exemple |
|---|---|---|---|
| [k] | ㄱ ㅋ ㄲ | k | {gloss("부엌", "bueok")} |
| [n] | ㄴ | n | {gloss("산", "san")} |
| [t] | ㄷ ㅅ ㅆ ㅈ ㅊ ㅌ ㅎ | t | {gloss("옷", "ot")} |
| [l] | ㄹ | l | {gloss("물", "mul")} |
| [m] | ㅁ | m | {gloss("봄", "bom")} |
| [p] | ㅂ ㅍ | p | {gloss("앞", "ap")} |
| [ng] | ㅇ | ng | {gloss("강", "gang")} |

## Exemples

{examples}
"""


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
            accept_rr = list(dict.fromkeys([rr] + it.get("rr_accept", [])))
            # « 맥주 = maek-ju = [mèk-tjou] », suivi de la note de règle s'il y en a.
            note = it.get("explanation")
            saisie_exp = mcq_exp = gloss(ko, rr) + (f" — {note}" if note else "")

            # saisie : la prononciation
            ex.append({
                "type": "type_answer",
                "prompt": f"Comment se prononce « {ko} » ? (romanisation)",
                "accept": accept_rr,
                "normalize": "romaja",
                "placeholder": "romanisation",
                "explanation": saisie_exp,
            })

            # 4 choix : le son. Distracteurs explicites d'abord (souvent la
            # lecture naïve qui ignore la règle), complétés depuis le pool.
            forced = [d for d in it.get("distractors", []) if d != rr][:3]
            pool = [s for s in sound_pool
                    if s != rr and s not in forced and s not in accept_rr]
            fill = RNG.sample(pool, k=min(max(0, 3 - len(forced)), len(pool)))
            choices = list(dict.fromkeys(forced + fill + [rr]))
            if len(choices) < 2:
                continue
            RNG.shuffle(choices)
            ex.append({
                "type": "mcq",
                "prompt": f"Quel son a « {ko} » ?",
                "choices": choices,
                "correct": choices.index(rr),
                "explanation": mcq_exp,
            })

        _ = noun  # kept for readability of intent
    return ex


# --- Semaines 3 à 5 -----------------------------------------------------------
# Unité 2 (week_3.pdf, vocabulary.pdf), fiches de grammaire (week_4/exo_1.pdf,
# exo_2.pdf) et Unité 3 (week_5.pdf, vocabulary.pdf). Contrairement aux
# semaines 1-2 (lecture seule), ces semaines portent sur la grammaire : elles ont
# leurs propres exercices et flashcards. Les mots, eux, sont aussi dans les decks
# du Vocabulaire (# S3 / # S4 / # S5 dans coreen-vocab.md).

_W3_PAYS = [
    ("pays", "나라", "nara"), ("États-Unis", "미국", "miguk"), ("Chine", "중국", "jungguk"),
    ("Japon", "일본", "ilbon"), ("Inde", "인도", "indo"), ("Australie", "호주", "hoju"),
    ("Royaume-Uni", "영국", "yeongguk"), ("Allemagne", "독일", "dogil"),
    ("France", "프랑스", "peurangseu"), ("Canada", "캐나다", "kaenada"),
    ("Corée", "한국", "hanguk"), ("Russie", "러시아", "reosia"),
]
_W3_METIERS = [
    ("métier", "직업", "jigeop"), ("professeur", "선생님", "seonsaengnim"),
    ("étudiant(e)", "학생", "haksaeng"), ("médecin", "의사", "uisa"),
    ("cuisinier / cuisinière", "요리사", "yorisa"), ("employé(e) de banque", "은행원", "eunhaengwon"),
    ("journaliste", "기자", "gija"), ("employé(e) de bureau", "회사원", "hoesawon"),
    ("chercheur / chercheuse", "연구원", "yeonguwon"),
]
_W3_AUTRES = [
    ("ici", "여기", "yeogi"), ("M. / Mme (après le nom)", "씨", "ssi"), ("je / moi (poli)", "저", "jeo"),
    ("cette personne (poli)", "이분", "ibun"), ("personne / gens", "사람", "saram"),
    ("nom", "이름", "ireum"), ("nationalité", "국적", "gukjeok"), ("adresse", "주소", "juso"),
    ("téléphone", "전화", "jeonhwa"),
]
_W3_PLUS = [
    ("homme / femme d'affaires", "사업가", "saeopga"), ("pompier", "소방관", "sobanggwan"),
    ("policier", "경찰", "gyeongchal"), ("acteur / actrice", "배우", "baeu"),
    ("facteur", "우체부", "uchebu"), ("coiffeur / coiffeuse", "미용사", "miyongsa"),
    ("scientifique", "과학자", "gwahakja"), ("technicien(ne)", "기술자", "gisulja"),
    ("professeur (d'université)", "교수", "gyosu"), ("avocat(e)", "변호사", "byeonhosa"),
    ("mannequin", "모델", "model"), ("comptable", "회계사", "hoegyesa"),
]
_W4_PAYS = [
    ("Malaisie", "말레이시아", "malleisia"), ("Finlande", "핀란드", "pillandeu"),
    ("Portugal", "포르투갈", "poreutugal"), ("Pologne", "폴란드", "pollandeu"),
    ("Suède", "스웨덴", "seuweden"), ("Indonésie", "인도네시아", "indonesia"),
    ("Colombie", "콜롬비아", "kollombia"), ("Singapour", "싱가포르", "singgaporeu"),
]
_W5_FOOD = [
    ("nourriture", "음식", "eumsik"), ("bulgogi", "불고기", "bulgogi"), ("ramen", "라면", "ramyeon"),
    ("orange", "오렌지", "orenji"), ("hamburger", "햄버거", "haembeogeo"),
    ("naengmyeon (nouilles froides)", "냉면", "naengmyeon"), ("kimbap", "김밥", "gimbap"),
    ("kimchi", "김치", "gimchi"), ("pain", "빵", "ppang"), ("bibimbap", "비빔밥", "bibimbap"),
    ("pomme", "사과", "sagwa"),
]
_W5_DRINKS = [
    ("boisson", "음료수", "eumnyosu"), ("lait", "우유", "uyu"), ("bière", "맥주", "maekju"),
    ("café", "커피", "keopi"), ("thé noir", "홍차", "hongcha"), ("coca", "콜라", "kolla"),
    ("eau", "물", "mul"), ("jus", "주스", "juseu"), ("thé vert", "녹차", "nokcha"),
]
_W5_VERBS = [
    ("donner", "주다", "juda"), ("aller", "가다", "gada"), ("s'asseoir", "앉다", "anda"),
    ("se reposer", "쉬다", "swida"), ("lire", "읽다", "ikda"), ("venir", "오다", "oda"),
    ("attendre", "기다리다", "gidarida"), ("écrire", "쓰다", "sseuda"),
]
_W5_OTHERS = [
    ("menu", "메뉴", "menyu"), ("un peu / s'il vous plaît (adoucit)", "좀", "jom"),
    ("plus / encore", "더", "deo"), ("combien", "몇", "myeot"),
]
_W5_EXTRA = [
    ("verre / tasse", "컵", "keop"), ("assiette", "접시", "jeopsi"), ("riz cuit", "밥", "bap"),
    ("plats d'accompagnement", "반찬", "banchan"), ("poisson", "생선", "saengseon"),
    ("porc", "돼지고기", "dwaejigogi"), ("bœuf", "쇠고기", "soegogi"), ("poulet", "닭고기", "dakgogi"),
    ("ragoût de pâte de soja", "된장찌개", "doenjangjjigae"), ("soupe", "국", "guk"),
    ("sauce soja", "간장", "ganjang"), ("pâte de piment", "고추장", "gochujang"),
    ("sel", "소금", "sogeum"), ("cuisine coréenne", "한식", "hansik"),
    ("cuisine japonaise", "일식", "ilsik"), ("cuisine occidentale", "양식", "yangsik"),
]

# -(으)세요 : (verbe, sens, forme(s) acceptée(s), la première est la réponse).
_SEYO = [
    ("가다", "aller", ["가세요"]), ("오다", "venir", ["오세요"]),
    ("기다리다", "attendre", ["기다리세요"]), ("공부하다", "étudier", ["공부하세요"]),
    ("내리다", "descendre", ["내리세요"]), ("만나다", "rencontrer", ["만나세요"]),
    ("전화하다", "téléphoner", ["전화하세요"]), ("쓰다", "écrire", ["쓰세요"]),
    ("앉다", "s'asseoir", ["앉으세요"]), ("읽다", "lire", ["읽으세요"]),
    ("마시다", "boire", ["드세요", "마시세요"]), ("먹다", "manger", ["드세요", "먹으세요"]),
    ("주다", "donner", ["주세요"]), ("쉬다", "se reposer", ["쉬세요"]),
    ("타다", "monter (dans un véhicule)", ["타세요"]),
]

# Verbes réguliers en plus, pour l'entraînement « quoi mettre après le radical ».
# Pas d'irréguliers (만들다, 듣다, 자다, 있다…) : ils ne sont pas encore au cours.
_SEYO_EXTRA = [
    ("보다", "regarder", ["보세요"]), ("사다", "acheter", ["사세요"]),
    ("배우다", "apprendre", ["배우세요"]), ("일어나다", "se lever", ["일어나세요"]),
    ("하다", "faire", ["하세요"]), ("운동하다", "faire du sport", ["운동하세요"]),
    ("시작하다", "commencer", ["시작하세요"]), ("찾다", "chercher", ["찾으세요"]),
    ("받다", "recevoir", ["받으세요"]), ("입다", "mettre (un vêtement)", ["입으세요"]),
    ("웃다", "sourire", ["웃으세요"]), ("씻다", "se laver", ["씻으세요"]),
    ("닫다", "fermer", ["닫으세요"]), ("신다", "mettre (des chaussures)", ["신으세요"]),
]

_SEYO_EXCEPT = ("마시다", "먹다")
_SEYO_ENDINGS = ["세요", "으세요", "Exception : tout le verbe devient 드세요"]


def _seyo_drill():
    """Pour chaque verbe : (1) quoi mettre après le radical (3 choix fixes),
    (2) écrire la forme complète."""
    ex = []
    for verb, sens, forms in _SEYO + _SEYO_EXTRA:
        stem = verb[:-1]
        if verb in _SEYO_EXCEPT:
            right = _SEYO_ENDINGS[2]
            why = (f"{verb} est une exception : pour inviter poliment à {sens}, on ne garde pas "
                   f"le radical {stem}, tout le verbe devient 드세요 (forme honorifique). "
                   f"La forme régulière {forms[1]} existe mais est moins polie.")
        elif _batchim(stem):
            right = _SEYO_ENDINGS[1]
            why = f"{verb} → radical {stem}, qui finit par une consonne (받침) → {stem}으세요."
        else:
            right = _SEYO_ENDINGS[0]
            why = f"{verb} → radical {stem}, qui finit par une voyelle → {stem}세요."
        ex.append({"type": "mcq",
                   "prompt": f"{verb} ({sens}) : on enlève 다 → {stem}. Que met-on après ?",
                   "choices": list(_SEYO_ENDINGS), "correct": _SEYO_ENDINGS.index(right),
                   "explanation": why})
        ex.append(_ta(f"Écris la demande polie de {verb} ({sens}).", forms, why))
    return ex

# N이에요/예요 : (nom, sens, forme correcte).
_IEYO = [
    ("학생", "étudiant", "학생이에요"), ("선생님", "professeur", "선생님이에요"),
    ("의사", "médecin", "의사예요"), ("커피", "café", "커피예요"), ("시계", "montre", "시계예요"),
    ("기자", "journaliste", "기자예요"), ("요리사", "cuisinier", "요리사예요"),
    ("은행원", "employé de banque", "은행원이에요"), ("연구원", "chercheur", "연구원이에요"),
    ("한국 사람", "Coréen", "한국 사람이에요"), ("회사원", "employé de bureau", "회사원이에요"),
    ("주부", "femme au foyer", "주부예요"), ("건축가", "architecte", "건축가예요"),
]

# N은/는 : (nom, forme correcte).
_EUN = [("이름", "이름은"), ("선생님", "선생님은"), ("저", "저는"), ("친구", "친구는"),
        ("마이클", "마이클은"), ("여기", "여기는"), ("이분", "이분은"), ("웨이 씨", "웨이 씨는")]

_SINO = ["공", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"]
_NATIVE = ["하나", "둘", "셋", "넷", "다섯", "여섯", "일곱", "여덟", "아홉", "열"]
_NATIVE_SHORT = {"하나": "한", "둘": "두", "셋": "세", "넷": "네"}


def _batchim(word):
    """True si la dernière syllabe hangeul a une consonne finale."""
    last = [ch for ch in word if "가" <= ch <= "힣"][-1]
    return (ord(last) - 0xAC00) % 28 != 0


def _mcq(prompt, right, wrongs, explanation):
    """QCM dont la bonne réponse est placée à une position stable mais variée."""
    choices = [right] + [w for w in wrongs if w != right][:3]
    random.Random(prompt).shuffle(choices)
    return {"type": "mcq", "prompt": prompt, "choices": choices,
            "correct": choices.index(right), "explanation": explanation}


def _ta(prompt, accept, explanation, placeholder="en hangeul"):
    return {"type": "type_answer", "prompt": prompt, "accept": accept,
            "placeholder": placeholder, "explanation": explanation}


def _w3_exercises():
    ex = []
    ex.append({"type": "matching", "prompt": "Associe chaque expression à son sens.",
               "pairs": [["안녕하세요?", "Bonjour"], ["안녕히 가세요", "Au revoir (à qui part)"],
                         ["안녕히 계세요", "Au revoir (à qui reste)"], ["만나서 반가워요", "Ravi de vous rencontrer"],
                         ["이름이 뭐예요?", "Comment vous appelez-vous ?"]],
               "explanation": "Les expressions de l'Unité 2. 가세요 : celui qui s'en va ; 계세요 : celui qui reste."})
    ex.append(_mcq("Tu quittes le bureau d'un collègue qui, lui, reste. Que dis-tu ?", "안녕히 계세요",
                   ["안녕히 가세요", "만나서 반가워요", "이름이 뭐예요?"],
                   "계세요 = « restez » : on le dit à la personne qui reste. 가세요 = « allez » : à celle qui part."))
    ex.append(_mcq("Un ami part de chez toi. Que lui dis-tu ?", "안녕히 가세요",
                   ["안녕히 계세요", "안녕하세요?", "저는 학생이에요"],
                   "La personne s'en va : 안녕히 가세요."))
    ex.append({"type": "matching", "prompt": "Associe chaque pays à son nom coréen.",
               "pairs": [[ko, fr] for fr, ko, _ in _W3_PAYS[1:9]],
               "explanation": "Vocabulaire des pays de l'Unité 2."})
    ex.append({"type": "matching", "prompt": "Associe chaque métier à son nom coréen.",
               "pairs": [[ko, fr] for fr, ko, _ in _W3_METIERS[1:]],
               "explanation": "Vocabulaire des métiers de l'Unité 2."})
    ex.append(_mcq("Comment dit-on « Français(e) » (la nationalité) ?", "프랑스 사람",
                   ["프랑스", "프랑스 씨", "프랑스 나라"], "Nationalité = pays + 사람 (personne)."))
    ex.append(_ta("Écris « Japonais(e) » (la nationalité) en coréen.", ["일본 사람", "일본사람"],
                  "일본 (Japon) + 사람 (personne) = 일본 사람."))
    ex.append(_mcq("Quelle règle choisit entre 이에요 et 예요 ?", "이에요 après une consonne finale, 예요 après une voyelle",
                   ["예요 après une consonne finale, 이에요 après une voyelle", "이에요 pour les questions, 예요 pour les affirmations",
                    "이에요 pour les personnes, 예요 pour les objets"],
                   "학생 (finale ㅇ) → 학생이에요 ; 의사 (voyelle) → 의사예요. Question ou affirmation : seule l'intonation change."))
    for noun, sens, right in _IEYO:
        other = noun + ("예요" if _batchim(noun) else "이에요")
        ex.append(_mcq(f"« C'est {sens}. » : quelle forme est correcte ?", right, [other, noun + "는", noun + "은"],
                       f"{noun} se termine par {'une consonne' if _batchim(noun) else 'une voyelle'} → {right}."))
    ex.append(_ta("« Qu'est-ce que c'est ? » en coréen (뭐 + 이에요/예요).", ["뭐예요", "뭐예요?"],
                  "뭐 se termine par une voyelle : 뭐예요?"))
    ex.append(_mcq("Comment demande-t-on « Vous êtes étudiant ? »", "학생이에요?",
                   ["학생예요?", "학생은요?", "학생이요?"],
                   "La même forme 학생이에요 sert de question avec une intonation montante."))
    ex.append(_mcq("À quoi sert la particule 은/는 ?", "Elle marque le thème de la phrase",
                   ["Elle marque le verbe", "Elle forme le pluriel", "Elle marque la politesse"],
                   "은/는 indique le sujet dont on parle (le thème)."))
    for noun, right in _EUN:
        other = noun + ("는" if right.endswith("은") else "은")
        ex.append(_mcq(f"{noun} + particule de thème = ?", right, [other, noun + "이", noun + "가"],
                       f"{'Consonne finale → 은' if right.endswith('은') else 'Voyelle finale → 는'} : {right}."))
    ex.append(_ta("Complète : 저(  ) 애니예요. (une syllabe)", ["는"], "저 finit par une voyelle : 저는."))
    ex.append(_ta("Complète : 마이클(  ) 미국 사람이에요. (une syllabe)", ["은"], "마이클 finit par ㄹ : 마이클은."))
    ex.append(_ta("Complète : 저는 학생(    ). (이에요 ou 예요)", ["이에요"], "학생 finit par ㅇ : 학생이에요."))
    ex.append(_ta("Complète : 저는 쿠마르(    ). (이에요 ou 예요)", ["예요"], "쿠마르 : la dernière syllabe 르 (ㄹ + ㅡ) n'a pas de consonne finale → 쿠마르예요."))
    ex.append(_ta("Complète : 다니엘은 의사(    ). (이에요 ou 예요)", ["예요"], "의사 finit par une voyelle : 의사예요."))
    ex.append({"type": "order_steps", "prompt": "Remets la présentation dans l'ordre.",
               "steps": ["안녕하세요?", "저는 잉그리드예요.", "저는 영국 사람이에요.", "저는 연구원이에요.", "만나서 반가워요."],
               "explanation": "Salut → nom → nationalité → métier → formule de fin (la rédaction de l'Unité 2)."})
    ex.append({"type": "order_steps", "prompt": "Remets la présentation à trois dans l'ordre.",
               "steps": ["재민 씨, 여기는 크리스 씨예요.", "크리스 씨, 여기는 재민 씨예요.", "안녕하세요?", "안녕하세요? 만나서 반가워요."],
               "explanation": "On présente chacun avec 여기는 ~ 씨예요, puis on se salue."})
    ex.append(_mcq("« 로버트 씨는 의사예요? » — Robert est médecin. Que répond-il ?", "네, 의사예요.",
                   ["아니요, 의사예요.", "네, 의사이에요.", "안녕히 계세요."], "Oui = 네 ; 의사 finit par une voyelle → 의사예요."))
    ex.append(_mcq("« 웨이 씨는 일본 사람이에요? » — Wei est chinois. Que répond-il ?", "아니요, 중국 사람이에요.",
                   ["네, 일본 사람이에요.", "아니요, 일본 사람이에요.", "네, 중국 사람예요."], "Non = 아니요, puis la bonne nationalité."))
    ex.append(_mcq("Que veut dire 여기는 크리스 씨예요 ?", "Voici Chris.",
                   ["Chris est ici depuis longtemps.", "Où est Chris ?", "Je suis Chris."],
                   "여기 = ici ; « ici, c'est M. Chris » = voici Chris (pour présenter quelqu'un)."))
    ex.append(_mcq("Comment s'adresser poliment à Jaemin ?", "재민 씨", ["씨 재민", "재민 님이", "재민 저"],
                   "씨 se place après le nom (ou le prénom), jamais seul."))
    ex.append(_mcq("Quel mot coréen veut dire « nationalité » ?", "국적", ["나라", "주소", "이름"],
                   "국적 = nationalité ; 나라 = pays ; 주소 = adresse ; 이름 = nom."))
    ex.append({"type": "matching", "prompt": "Associe les métiers supplémentaires (Additional Expression).",
               "pairs": [[ko, fr] for fr, ko, _ in _W3_PLUS[:7]],
               "explanation": "Métiers de la page « 추가 표현 »."})
    return ex


def _w4_exercises():
    ex = []
    ex.append(_mcq("Quelle est la règle de -(으)세요 ?", "세요 après un radical en voyelle, 으세요 après un radical en consonne",
                   ["으세요 après une voyelle, 세요 après une consonne", "세요 pour les verbes en 하다 seulement",
                    "으세요 pour les questions"],
                   "가다 → 가세요 ; 앉다 → 앉으세요. On enlève 다 et on regarde la dernière syllabe du radical."))
    for verb, sens, forms in [s for s in _SEYO if s[0] in ("앉다", "읽다", "가다", "쓰다", "먹다")]:
        stem = verb[:-1]
        wrong = stem + ("세요" if _batchim(stem) else "으세요")
        ex.append(_mcq(f"« {sens} » (demande polie) : quelle forme est correcte ?", forms[0],
                       [wrong, verb + "세요", stem + "어요"], f"{verb} → {forms[0]}."))
    ex.extend(_seyo_drill())
    pairs = [("지민", "한국", "학생"), ("유키", "일본", "기자"), ("피에르", "프랑스", "요리사"),
             ("왕리", "중국", "의사"), ("소피", "캐나다", "은행원"), ("안나", "독일", "연구원")]
    for name, pays, job in pairs:
        right = f"{job}{'이에요' if _batchim(job) else '예요'}"
        ex.append(_ta(f"가: {name} 씨는 {pays} 사람이에요? 나: 네, {pays} 사람이에요. ___ ({job}, avec 이에요/예요)",
                      [right, right + "."], f"{job} finit par {'une consonne' if _batchim(job) else 'une voyelle'} : {right}."))
    ex.append(_mcq("La fiche écrit « 가: 연구원예요? ». Qu'est-ce qui ne va pas ?", "Il faut 연구원이에요 : 원 finit par la consonne ㄴ",
                   ["Rien, c'est correct", "Il faut 연구원은요", "Il faut 연구원세요"],
                   "Consonne finale → 이에요. La fiche contient une coquille."))
    ex.append(_mcq("가: 인도네시아 사람이에요? — Maya est indonésienne. Que répond-elle ?", "네, 인도네시아 사람이에요.",
                   ["아니요, 인도네시아 사람이에요.", "네, 인도네시아예요.", "네, 인도네시아 사람예요."],
                   "Nationalité = pays + 사람 ; 사람 finit par ㅁ → 이에요."))
    ex.append(_mcq("가: 이름이 뭐예요? — Elle s'appelle Maya. Que répond-elle ?", "마야예요.",
                   ["마야이에요.", "마야 씨예요?", "마야는요."], "마야 finit par une voyelle : 마야예요."))
    ex.append(_ta("가: 이름이 뭐예요? — Il s'appelle Eric (에릭). Réponds.", ["에릭이에요", "에릭이에요.", "저는 에릭이에요", "저는 에릭이에요."],
                  "에릭 finit par ㄱ : 에릭이에요."))
    ex.append({"type": "matching", "prompt": "Associe chaque pays (fiche de la semaine 4) à son nom coréen.",
               "pairs": [[ko, fr] for fr, ko, _ in _W4_PAYS],
               "explanation": "Liste de pays de la fiche « 나라 & 직업 »."})
    ex.append(_mcq("Que veut dire 건축가 ?", "architecte", ["avocat", "femme au foyer", "journaliste"], "건축가 = architecte."))
    ex.append(_mcq("Que veut dire 주부 ?", "femme / homme au foyer", ["architecte", "étudiant", "médecin"], "주부 = housewife."))
    return ex


def _w5_exercises():
    ex = []
    ex.append({"type": "matching", "prompt": "Associe chaque expression du restaurant à son sens.",
               "pairs": [["어서 오세요.", "Bienvenue."], ["뭐 드릴까요?", "Que désirez-vous ?"],
                         ["여기요.", "Excusez-moi ! (pour appeler)"], ["잠깐만 기다리세요.", "Un instant, s'il vous plaît."],
                         ["여기 있어요.", "Voici."]],
               "explanation": "Les expressions de l'Unité 3."})
    ex.append(_mcq("Le serveur t'accueille en disant… ", "어서 오세요.", ["여기요.", "여기 있어요.", "안녕히 계세요."],
                   "어서 오세요 = bienvenue (entrez)."))
    ex.append(_mcq("Tu veux appeler le serveur. Tu dis…", "여기요!", ["어서 오세요!", "여기 있어요!", "뭐 드릴까요?"],
                   "여기요 = « ici ! » pour attirer l'attention."))
    ex.append(_ta("Commande du bulgogi : « Du bulgogi, s'il vous plaît. »", ["불고기 주세요", "불고기 주세요."],
                  "N + 주세요 = donnez-moi N."))
    ex.append({"type": "matching", "prompt": "Associe chaque aliment ou boisson à son nom coréen.",
               "pairs": [["냉면", "nouilles froides"], ["비빔밥", "bibimbap"], ["햄버거", "hamburger"],
                         ["홍차", "thé noir"], ["녹차", "thé vert"], ["콜라", "coca"], ["우유", "lait"]],
               "explanation": "Vocabulaire de l'Unité 3."})
    ex.append({"type": "order_steps", "prompt": "Range ces nombres coréens natifs dans l'ordre.",
               "steps": _NATIVE[:], "explanation": "하나 둘 셋 넷 다섯 여섯 일곱 여덟 아홉 열."})
    for i, n in enumerate(_NATIVE, start=1):
        if i in (3, 6, 7, 8, 9):
            ex.append(_ta(f"Écris le nombre coréen natif {i}.", [n], f"{i} = {n}."))
    ex.append(_mcq("Devant un compteur, 하나, 둘, 셋, 넷 deviennent…", "한, 두, 세, 네",
                   ["하나, 둘, 셋, 넷", "일, 이, 삼, 사", "한, 둘, 세, 넷"],
                   "Formes réduites : 한 병, 두 개, 세 잔, 네 명."))
    for n, short in _NATIVE_SHORT.items():
        ex.append(_ta(f"Forme de {n} devant un compteur ?", [short], f"{n} → {short} (ex : {short} 개)."))
    ex.append({"type": "matching", "prompt": "Associe chaque compteur à ce qu'il compte.",
               "pairs": [["병", "les bouteilles"], ["개", "les objets (général)"], ["잔", "les verres et tasses"], ["명", "les personnes"]],
               "explanation": "몇 개 / 몇 병 / 몇 잔 / 몇 명 있어요 ?"})
    for item, num, cnt, sens in [("콜라", "한", "병", "un coca (bouteille)"), ("커피", "두", "잔", "deux cafés (tasses)"),
                                 ("사과", "세", "개", "trois pommes"), ("맥주", "두", "병", "deux bières (bouteilles)"),
                                 ("물", "다섯", "병", "cinq bouteilles d'eau"), ("오렌지 주스", "세", "병", "trois jus d'orange (bouteilles)")]:
        right = f"{item} {num} {cnt}"
        full = {"한": "하나", "두": "둘", "세": "셋"}.get(num, "오")
        wrongs = [f"{item} {cnt} {num}", f"{num} {cnt} {item}", f"{item} {full} {cnt}"]
        ex.append(_mcq(f"Comment dit-on « {sens} » ?", right, wrongs, f"Nom + nombre natif (forme réduite) + compteur : {right}."))
    ex.append(_ta("Dis « Un coca et deux bières, s'il vous plaît. » (avec 하고 et les compteurs)",
                  ["콜라 한 병하고 맥주 두 병 주세요", "콜라 한 병하고 맥주 두 병 주세요."],
                  "N1 하고 N2 = N1 et N2 ; 콜라 한 병하고 맥주 두 병 주세요."))
    ex.append(_mcq("Que veut dire 하고 dans « 불고기하고 맥주 두 병 주세요 » ?", "et (entre deux noms)",
                   ["ou", "avec beaucoup de", "s'il vous plaît"], "N하고 N = N et N."))
    ex.append(_mcq("Quel est l'effet de 좀 dans « 물 좀 주세요 » ?", "Il adoucit la demande, plus polie",
                   ["Il veut dire « beaucoup »", "Il forme une question", "Il veut dire « encore »"],
                   "좀 rend la demande plus douce et polie."))
    ex.append(_ta("Demande « encore un peu de kimchi, s'il vous plaît ».", ["김치 좀 더 주세요", "김치 좀 더 주세요."],
                  "더 (plus, encore) se place devant 주세요 : 김치 좀 더 주세요."))
    ex.append(_mcq("Le serveur demande « 몇 분이에요? ». Que veut-il savoir ?", "Combien de personnes vous êtes",
                   ["Combien de minutes vous attendez", "Ce que vous voulez boire", "Votre nom"],
                   "분 = compteur poli des personnes ; on répond « 세 명이에요 » (nous sommes trois)."))
    ex.append(_mcq("Comment dit-on « Asseyez-vous ici » ?", "여기 앉으세요.", ["여기 앉세요.", "여기 있어요.", "여기요."],
                   "앉다 a une consonne finale → 앉으세요."))
    ex.append({"type": "order_steps", "prompt": "Remets le dialogue au restaurant dans l'ordre.",
               "steps": ["어서 오세요. 뭐 드릴까요?", "불고기하고 맥주 두 병 주세요.", "네, 잠깐만 기다리세요.",
                         "여기요. 김치 좀 더 주세요.", "네, 여기 있어요."],
               "explanation": "Accueil → commande → attente → demande de plus → service (Conversation Drills)."})
    ex.append(_ta("Le client dit « 오렌지 다섯 개하고 사과 두 개 주세요 ». Combien d'oranges veut-il ? (chiffre)",
                  ["5", "cinq"], "다섯 개 = cinq (objets).", placeholder="un chiffre"))
    ex.append(_ta("« 콜라 한 병하고 커피 네 잔 주세요 ». Combien de cafés ? (chiffre)", ["4", "quatre"],
                  "네 잔 = quatre tasses.", placeholder="un chiffre"))
    ex.append({"type": "matching", "prompt": "Associe chaque demande (-(으)세요) à son sens.",
               "pairs": [["물 좀 주세요.", "De l'eau, s'il vous plaît."], ["쓰세요.", "Écrivez."], ["읽으세요.", "Lisez."],
                         ["앉으세요.", "Asseyez-vous."], ["쉬세요.", "Reposez-vous."]],
               "explanation": "Listening 3 de l'Unité 3."})
    ex.append(_mcq("Pour un numéro de téléphone (010-1234-5678), quels nombres utilise-t-on ?", "Les nombres sino-coréens (공, 일, 이, 삼…)",
                   ["Les nombres natifs (하나, 둘, 셋…)", "Les compteurs (개, 병…)", "Les nombres anglais"],
                   "Téléphone, prix, numéros : sino-coréen ; compter des objets : natif + compteur."))
    ex.append(_ta("Comment se dit 0 dans un numéro de téléphone ?", ["공"], "0 = 공 (aussi 영)."))
    ex.append({"type": "matching", "prompt": "Associe les mots du restaurant (Additional Expressions).",
               "pairs": [[ko, fr] for fr, ko, _ in _W5_EXTRA[:8]],
               "explanation": "Page « Additional Expressions » de l'Unité 3."})
    return ex


def _fc(pairs):
    return [{"front": f, "back": b} for f, b in pairs]


def build_course_w3_w5():
    w3 = f"""# Coréen — Semaine 3 · Unité 2, Salutations et présentations

Cours GEE3003 « Active Korean 1 », 제2과 **인사와 소개** (week_3.pdf et
vocabulary.pdf) : saluer, se présenter, présenter quelqu'un, donner son
nom, sa nationalité et son métier.

> **En bref.** **N이에요 / N예요** = « c'est N / je suis N » : **이에요**
> après une **consonne finale**, **예요** après une **voyelle**. **N은 / N는**
> marque le **thème** : **은** après une consonne, **는** après une voyelle.
> Nationalité = **pays + 사람**. 씨 se met **après** le nom.

## Expressions (표현)

| Coréen | Sens |
|---|---|
| 안녕하세요? | Bonjour. / Comment allez-vous ? |
| 안녕히 가세요. | Au revoir (à la personne **qui part**). |
| 안녕히 계세요. | Au revoir (à la personne **qui reste**). |
| (만나서) 반가워요. | Ravi(e) de vous rencontrer. |
| 이름이 뭐예요? | Comment vous appelez-vous ? |

> **Piège :** 가세요 = « allez » → on le dit à **celui qui s'en va** ; 계세요 =
> « restez » → à **celui qui reste**. Si les deux partent : 안녕히 가세요.

## Vocabulaire (어휘)

### Pays (나라)

{_word_lines(_W3_PAYS)}

**Nationalité = pays + 사람** : 미국 사람 (Américain), 한국 사람 (Coréen),
프랑스 사람 (Français).

### Métiers (직업)

{_word_lines(_W3_METIERS)}

### Autres

{_word_lines(_W3_AUTRES)}

### Métiers en plus (추가 표현)

{_word_lines(_W3_PLUS)}

## Grammaire 1 : N이에요 / N예요

« C'est N », « je suis N ». La même forme sert pour **affirmer** et pour
**demander** : seule l'**intonation** change (학생이에요. / 학생이에요?).

| N + **이에요** (consonne finale) | N + **예요** (voyelle finale) |
|---|---|
| 학생 → 학생**이에요** | 의사 → 의사**예요** |
| 선생님 → 선생님**이에요** | 커피 → 커피**예요** |
| 은행원 → 은행원**이에요** | 기자 → 기자**예요** |

- 뭐예요? — Qu'est-ce que c'est ? → 시계예요. (C'est une montre.)
- 저는 김재민**이에요**. / 저는 애니**예요**.

> **Astuce :** regarde la **dernière syllabe** : y a-t-il une consonne **sous**
> la voyelle (받침) ? 생 (ㅇ), 님 (ㅁ), 원 (ㄴ) → 이에요. 사, 피, 자, 르 → 예요
> (르 se termine par la voyelle ㅡ).

## Grammaire 2 : N은 / N는 (particule de thème)

Elle indique **de quoi on parle**.

| N + **은** (consonne finale) | N + **는** (voyelle finale) |
|---|---|
| 이름 → 이름**은** | 저 → 저**는** |
| 선생님 → 선생님**은** | 친구 → 친구**는** |

- 나원주 선생님**은** 여자예요. — Le professeur Na Wonju est une femme.
- 저**는** 학생이에요. — Moi, je suis étudiant.

## Dialogues clés (핵심 대화)

**Se présenter**

- A : 안녕하세요? 저는 김재민이에요.
- B : 안녕하세요, 재민 씨? 저는 애니예요.

**Présenter quelqu'un**

- A : 여기는 크리스 씨예요. 여기는 김재민 씨예요. (Voici Chris. Voici Jaemin Kim.)
- B : 안녕하세요? 김재민이에요.
- C : 안녕하세요? 크리스예요. 만나서 반가워요.

**Nationalité et métier**

- A : 로버트 씨는 의사예요? — B : 네, 의사예요.
- A : 웨이 씨는 일본 사람이에요? — B : 아니요, 중국 사람이에요.

**Questions types** : 이름이 뭐예요? · 중국 사람이에요? · 학생이에요?

## Pratique (corrigé)

1. 저(**는**) 애니예요. · 마이클(**은**) 미국 사람이에요. · 여기(**는**) 토니 씨예요.
   · 이분(**은**) 선생님이에요.
2. 저는 학생**이에요**. · 웨이 씨는 중국 사람**이에요**. · 저는 쿠마르**예요**.
   · 다니엘은 의사**예요**.

## Écrire : se présenter

> 안녕하세요? 저는 잉그리드예요. 저는 영국 사람이에요. 저는 연구원이에요.
> 만나서 반가워요.

Salut → nom → nationalité → métier → 만나서 반가워요.
"""

    w4 = f"""# Coréen — Semaine 4 · Fiches de grammaire

Fiches d'exercices de la semaine 4 (exo_1.pdf, exo_2.pdf) : la demande polie
**-(으)세요** et **이에요 / 예요** avec les pays et les métiers.

> **En bref.** On enlève **다** du verbe : radical en **voyelle** → **세요**
> (가다 → 가세요) ; radical en **consonne** → **으세요** (앉다 → 앉으세요).
> 마시다 / 먹다 → **드세요** (forme honorifique). Et toujours : consonne finale
> → **이에요**, voyelle → **예요**.

## 1. -(으)세요 : la demande polie

« Faites… s'il vous plaît ». Règle : **세요** après une **voyelle**, **으세요**
après une **consonne**.

| Verbe | Sens | -(으)세요 |
|---|---|---|
{chr(10).join(f"| {v} | {s} | {' / '.join(f)} |" for v, s, f in _SEYO)}

> **Piège :** **마시다** et **먹다** donnent **드세요** dans les slides (★) :
> c'est la forme **honorifique** (on l'utilise pour inviter quelqu'un à boire
> ou manger). 마시세요 et 먹으세요 suivent la règle mais sont moins polis.

## 2. 이에요 / 예요 avec les nationalités et les métiers

Corrigé de la fiche « 이에요 / 예요 » :

| Personne | Nationalité | Métier |
|---|---|---|
| 에밀리 | 미국 사람이에요. | 선생님이에요. |
| 지민 | 한국 사람이에요. | 학생이에요. |
| 유키 | 일본 사람이에요. | 기자예요. |
| 피에르 | 프랑스 사람이에요. | 요리사예요. |
| 왕리 | 중국 사람이에요. | 의사예요. |
| 소피 | 캐나다 사람이에요. | 은행원이에요. |
| 안나 | 독일 사람이에요. | 연구원이에요. |

**사람** finit toujours par ㅁ → **사람이에요**, quel que soit le pays.

> **Piège :** la fiche écrit « 연구원**예요**? » : c'est une **coquille**.
> 원 finit par ㄴ → **연구원이에요**.

## 3. Conversation : nom, nationalité, métier

Modèle de la fiche « 나라 & 직업 » (une question est juste, l'autre fausse) :

- 가 : 이름이 뭐예요? — 나 : 마야예요.
- 가 : 인도네시아 사람이에요? — 나 : **네**, 인도네시아 사람이에요.
- 가 : 의사예요? — 나 : **아니요**, [vrai métier]이에요/예요.

## 4. Pays de la fiche

{_word_lines(_W4_PAYS)}

Et aussi : 독일, 프랑스, 호주, 중국, 미국, 한국, 일본, 캐나다, 러시아 (semaine 3).
Nouveaux métiers : 건축가 (architecte), 주부 (femme / homme au foyer).
"""

    w5 = f"""# Coréen — Semaine 5 · Unité 3, Au restaurant

Cours GEE3003 « Active Korean 1 », 제3과 **식당** (week_5.pdf et
vocabulary.pdf) : commander à manger (주문하기), faire une demande
(요청하기), compter avec les **nombres natifs** et les **compteurs**.

> **En bref.** **N 주세요** = « donnez-moi N ». **V-(으)세요** = demande
> polie. Pour compter : **nom + nombre natif + compteur** (콜라 **한 병**,
> 커피 **두 잔**, 사과 **세 개**). 하나 / 둘 / 셋 / 넷 deviennent **한 / 두 /
> 세 / 네** devant un compteur. **하고** = « et » ; **좀** adoucit ; **더** =
> encore.

## Expressions (표현)

| Coréen | Sens |
|---|---|
| 어서 오세요. | Bienvenue. |
| 뭐 드릴까요? | Que désirez-vous ? |
| 여기요. | Excusez-moi ! (pour appeler le serveur) |
| 잠깐만 기다리세요. | Un instant, s'il vous plaît. |
| 여기 있어요. | Voici. / Tenez. |

## Vocabulaire (어휘)

### Nourriture (음식)

{_word_lines(_W5_FOOD)}

### Boissons (음료수)

{_word_lines(_W5_DRINKS)}

### Verbes

{_word_lines(_W5_VERBS)}

### Autres

{_word_lines(_W5_OTHERS)}

### En plus (Additional Expressions)

{_word_lines(_W5_EXTRA)}

## Grammaire 1 : N 주세요 et V-(으)세요

- **N 주세요** : 불고기 주세요. (Du bulgogi, s'il vous plaît.)
- **V-(으)세요** : radical en voyelle → **세요** (타다 → 타세요) ; radical en
  consonne → **으세요** (앉다 → 앉으세요). 마시다 / 먹다 → **드세요**. Voir
  la semaine 4.

## Grammaire 2 : compter

### Les nombres natifs (하나, 둘, 셋…)

| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|
| {" | ".join(_NATIVE)} |

Ils servent à **compter des personnes ou des choses**. Devant un compteur,
**하나 → 한, 둘 → 두, 셋 → 세, 넷 → 네**.

Pour un **numéro de téléphone** (010-1234-5678) ou un **prix**, on utilise les
nombres **sino-coréens** : {", ".join(f"{i} {n}" for i, n in enumerate(_SINO))}.

### Les compteurs

| Compteur | Compte | Exemple |
|---|---|---|
| **개** | les objets (général) | 사과 두 개 (deux pommes) |
| **병** | les **bouteilles** | 물 다섯 병, 오렌지 주스 세 병 |
| **잔** | les **verres / tasses** | 커피 네 잔 |
| **명** | les **personnes** | 방탄소년단 일곱 명 (les 7 BTS) |
| **분** | les personnes (**poli**) | 몇 분이에요? (Vous êtes combien ?) |

Ordre : **nom + nombre + compteur**. Questions : 몇 개 / 몇 병 / 몇 명 있어요?

## Grammaire 3 : 하고, 좀, 더

- **N하고 N** = N et N : 콜라 한 병**하고** 맥주 두 병 주세요.
- **좀** rend la demande **plus douce, plus polie** : 물 **좀** 주세요.
- **더** (encore) se place devant 주세요 : 물 좀 **더** 주세요.

## Dialogues clés (핵심 대화)

1. A : 어서 오세요. 뭐 드릴까요? — B : 불고기 주세요.
2. A : 뭐 드릴까요? — B : 냉면 둘 주세요.
3. A : 뭐 드릴까요? — B : 콜라 한 병하고 맥주 두 병 주세요.
4. A : 여기요. 김치 좀 더 주세요. — B : 잠깐만 기다리세요.
5. A : 어서 오세요. 몇 분이에요? — B : 세 명이에요. — A : 여기 앉으세요.

**Conversation Drills** :

| 웨이터 (serveur) | 손님 (client) |
|---|---|
| 어서 오세요. 뭐 드릴까요? | 불고기하고 맥주 두 병 주세요. |
| 네, 잠깐만 기다리세요. | … |
| | 여기요. 김치 좀 더 주세요. |
| 네, 여기 있어요. | |

## Écoute (corrigé)

- 오렌지 **다섯 개**하고 사과 **두 개** 주세요.
- 불고기 **둘**하고 콜라 **한 병** 주세요.
- 콜라 **한 병**하고 커피 **네 잔** 주세요.
- 물 좀 주세요. · 쓰세요. · 읽으세요. · 앉으세요.
"""

    seyo = f"""# Coréen — Entraînement -(으)세요

Que mettre **à la place de 다** pour faire une **demande polie** (« faites…,
s'il vous plaît ») ? Trois cas, à reconnaître vite.

## La méthode

1. **Enlève 다** : 앉다 → **앉** ; 가다 → **가**.
2. Regarde la **dernière syllabe** du radical : a-t-elle une **consonne en
   dessous** (받침) ?
   - **non** (voyelle) → **세요** : 가 → 가**세요** ;
   - **oui** (consonne) → **으세요** : 앉 → 앉**으세요** (le 으 sert à
     « adoucir » la rencontre de deux consonnes).
3. **Exceptions : 마시다 (boire) et 먹다 (manger)** → on ne garde pas le
   radical : **tout le verbe devient 드세요** (forme honorifique, celle des
   slides ★). 마시세요 / 먹으세요 existent mais sont moins polis.

> **Piège :** 주다 (donner) n'est **pas** une exception : 주 → 주세요.
> 하다 aussi est régulier : 공부하다 → 공부하세요.

## Tous les verbes de l'entraînement

| Verbe | Sens | Radical | Demande polie |
|---|---|---|---|
{chr(10).join(f"| {v} | {s} | {v[:-1]} | {f[0]} |" for v, s, f in _SEYO + _SEYO_EXTRA)}
"""
    seyo_fc = _fc(
        [("Méthode -(으)세요", "Enlever 다 ; radical en voyelle → 세요 ; en consonne → 으세요 ; 마시다 / 먹다 → 드세요.")]
        + [(f"{v} ({s})", f"{f[0]}" + (" (exception)" if v in _SEYO_EXCEPT else ""))
           for v, s, f in _SEYO + _SEYO_EXTRA])

    w3_fc = _fc([
        ("안녕히 가세요 / 안녕히 계세요", "Au revoir à celui qui part / à celui qui reste."),
        ("만나서 반가워요", "Ravi(e) de vous rencontrer."),
        ("이름이 뭐예요?", "Comment vous appelez-vous ?"),
        ("N이에요 / N예요", "C'est N. 이에요 après une consonne finale (학생이에요), 예요 après une voyelle (의사예요)."),
        ("N은 / N는", "Particule de thème. 은 après une consonne (이름은), 는 après une voyelle (저는)."),
        ("Nationalité", "Pays + 사람 : 미국 사람, 한국 사람, 프랑스 사람."),
        ("씨", "M. / Mme, toujours après le nom : 재민 씨."),
        ("여기는 크리스 씨예요", "Voici Chris (pour présenter quelqu'un)."),
        ("직업 : 학생 / 의사 / 요리사 / 은행원 / 기자 / 회사원 / 연구원", "étudiant / médecin / cuisinier / employé de banque / journaliste / employé de bureau / chercheur"),
        ("나라 : 일본 / 영국 / 독일 / 호주 / 캐나다 / 러시아 / 인도", "Japon / Royaume-Uni / Allemagne / Australie / Canada / Russie / Inde"),
        ("이름 / 국적 / 주소 / 전화", "nom / nationalité / adresse / téléphone"),
    ])
    w4_fc = _fc([
        ("-(으)세요", "Demande polie. Voyelle → 세요 (가세요) ; consonne → 으세요 (앉으세요)."),
        ("마시다 / 먹다 → ?", "드세요 (forme honorifique des slides)."),
        ("앉다 / 읽다 → ?", "앉으세요 / 읽으세요."),
        ("기다리다 / 공부하다 / 전화하다 → ?", "기다리세요 / 공부하세요 / 전화하세요."),
        ("연구원 + 이에요/예요", "연구원이에요 (원 finit par ㄴ) — la fiche écrit 연구원예요 par erreur."),
        ("사람 + 이에요/예요", "Toujours 사람이에요 (ㅁ final)."),
        ("건축가 / 주부", "architecte / femme ou homme au foyer."),
    ])
    w5_fc = _fc([
        ("어서 오세요 / 뭐 드릴까요?", "Bienvenue / Que désirez-vous ?"),
        ("여기요 / 여기 있어요", "Excusez-moi ! (appeler) / Voici."),
        ("잠깐만 기다리세요", "Un instant, s'il vous plaît."),
        ("N 주세요", "Donnez-moi N : 불고기 주세요."),
        ("하나 둘 셋 넷 다섯", "1 2 3 4 5 (nombres natifs)."),
        ("여섯 일곱 여덟 아홉 열", "6 7 8 9 10 (nombres natifs)."),
        ("Devant un compteur", "하나 → 한, 둘 → 두, 셋 → 세, 넷 → 네."),
        ("개 / 병 / 잔 / 명 / 분", "objets / bouteilles / verres-tasses / personnes / personnes (poli)."),
        ("콜라 한 병하고 맥주 두 병 주세요", "Un coca et deux bières, s'il vous plaît. (하고 = et)"),
        ("좀 / 더", "좀 adoucit la demande ; 더 = encore : 물 좀 더 주세요."),
        ("몇 분이에요?", "Vous êtes combien ? → 세 명이에요."),
        ("홍차 / 녹차 / 콜라 / 음료수", "thé noir / thé vert / coca / boisson."),
        ("냉면 / 비빔밥 / 햄버거 / 오렌지", "nouilles froides / bibimbap / hamburger / orange."),
    ])

    return [
        {"name": "Semaine 3", "key": "kr-cours-w3", "color": COLOR, "parent": "kr-cours",
         "lesson": w3, "exercises": _w3_exercises(), "flashcards": w3_fc},
        {"name": "Semaine 4", "key": "kr-cours-w4", "color": COLOR, "parent": "kr-cours",
         "lesson": w4, "exercises": _w4_exercises(), "flashcards": w4_fc},
        {"name": "Semaine 5", "key": "kr-cours-w5", "color": COLOR, "parent": "kr-cours",
         "lesson": w5, "exercises": _w5_exercises(), "flashcards": w5_fc},
        {"name": "Entraînement -(으)세요", "key": "kr-cours-seyo", "color": COLOR, "parent": "kr-cours",
         "lesson": seyo, "exercises": _seyo_drill(), "flashcards": seyo_fc},
    ]


# Règles affichées en tête de la leçon de certains decks du Vocabulaire (ceux
# où un mot ne s'emploie pas sans sa règle). Le reste des decks n'a pas de
# leçon : la liste complète est dans la leçon du conteneur Vocabulaire.
_DECK_RULES = {
    "Verbes": """Les verbes sont donnés à la **forme du dictionnaire**, en **-다**. Pour
s'en servir, on enlève **다** et on ajoute une terminaison.

## La demande polie -(으)세요 (« faites…, s'il vous plaît »)

1. **Enlève 다** : 앉다 → **앉** ; 가다 → **가**.
2. Le radical finit par une **voyelle** → **세요** : 가 → **가세요**,
   기다리 → **기다리세요**, 공부하 → **공부하세요**.
3. Le radical finit par une **consonne** (받침) → **으세요** : 앉 →
   **앉으세요**, 읽 → **읽으세요**.
4. **Exceptions : 마시다 (boire) et 먹다 (manger)** → **드세요** : tout le verbe
   est remplacé (forme honorifique, celle des slides). 마시세요 / 먹으세요
   existent mais sont moins polis.

| Verbe | Radical | Demande polie |
|---|---|---|
| 가다 (aller) | 가 | 가세요 |
| 오다 (venir) | 오 | 오세요 |
| 주다 (donner) | 주 | 주세요 — **pas** une exception |
| 쓰다 (écrire) | 쓰 | 쓰세요 |
| 앉다 (s'asseoir) | 앉 | 앉으세요 |
| 읽다 (lire) | 읽 | 읽으세요 |
| 마시다 (boire) | — | **드세요** (exception) |
| 먹다 (manger) | — | **드세요** (exception) |

Pour t'entraîner verbe par verbe : **Cours → Entraînement -(으)세요**.""",

    "Pays & nationalités": """## Dire sa nationalité

**Nationalité = pays + 사람** (personne) :

- 프랑스 → **프랑스 사람** (Français·e)
- 한국 → **한국 사람** (Coréen·ne)
- 일본 → **일본 사람** (Japonais·e)

Pour dire « je suis… », on ajoute **이에요** : 사람 finit par la consonne ㅁ,
donc c'est **toujours 사람이에요**, quel que soit le pays.

- 저는 프랑스 사람**이에요**. — Je suis français·e.
- 웨이 씨는 중국 사람**이에요**? — Wei est chinois ?
- 네, 중국 사람이에요. / 아니요, 일본 사람이에요.

> **Piège :** **국적** = la nationalité (le mot), **나라** = le pays. On ne dit
> pas 프랑스이에요 pour « je suis français » : il faut **사람**.""",

    "Politesse": """## Dire au revoir : qui part, qui reste ?

| Coréen | À qui | Sens littéral |
|---|---|---|
| 안녕히 **가세요** | à la personne **qui part** | « allez en paix » |
| 안녕히 **계세요** | à la personne **qui reste** | « restez en paix » |

Toi tu pars, l'autre reste → **안녕히 계세요**. L'autre part → **안녕히
가세요**. Les deux partent → **안녕히 가세요**.

## Au restaurant

| Qui le dit | Coréen | Sens |
|---|---|---|
| serveur | 어서 오세요. | Bienvenue. |
| serveur | 뭐 드릴까요? | Que désirez-vous ? |
| client | 여기요! | Excusez-moi ! (pour appeler) |
| serveur | 잠깐만 기다리세요. | Un instant, s'il vous plaît. |
| serveur | 여기 있어요. | Voici. |

**N 주세요** = « donnez-moi N » (주다 + 세요) ; **좀** rend la demande plus
douce : 물 좀 주세요.""",

    "Compteurs": """## Compter des choses : nom + nombre + compteur

On compte avec les nombres **coréens natifs** (하나, 둘, 셋…), suivis d'un
**compteur** qui dépend de ce qu'on compte. L'ordre est toujours
**nom → nombre → compteur** :

- 콜라 **한 병** — un coca (une bouteille)
- 사과 **두 개** — deux pommes
- 커피 **세 잔** — trois cafés
- 학생 **네 명** — quatre étudiants

## Les formes réduites

Devant un compteur, les quatre premiers nombres **raccourcissent** :

| Nombre | Seul | Devant un compteur |
|---|---|---|
| 1 | 하나 | **한** 개 |
| 2 | 둘 | **두** 개 |
| 3 | 셋 | **세** 개 |
| 4 | 넷 | **네** 개 |
| 5 et plus | 다섯, 여섯… | **inchangés** : 다섯 개 |

## Quel compteur ?

| Compteur | Pour | Question |
|---|---|---|
| **개** | les objets en général | 몇 개 있어요? |
| **병** | les bouteilles | 몇 병 있어요? |
| **잔** | les verres, les tasses | 몇 잔 있어요? |
| **명** | les personnes | 몇 명 있어요? |
| **분** | les personnes (poli) | 몇 분이에요? |

Pour **commander** : 콜라 한 병**하고** 맥주 두 병 주세요 (하고 = et).

> **Piège :** 네 (quatre devant un compteur) ressemble à 네 (oui) ; et 개
> (compteur) est aussi le mot « chien ». C'est le contexte qui tranche.""",
}


def build_deck_lesson(name, words):
    """Leçon d'un deck : sa règle, puis ses mots (comme la liste du Vocabulaire)."""
    out = [f"# {name}", "", _DECK_RULES[name], "", "## Les mots", ""]
    out += [f"- {gloss(w['ko'], w['rr'])} = {w['fr'][0]}" for w in words]
    return "\n".join(out).rstrip() + "\n"


def main():
    seed = json.loads(SEED.read_text())
    # Re-insert the branch where it was, so a re-run does not reorder seed.json.
    old = [i for i, c in enumerate(seed) if str(c.get("key", "")).startswith("kr")]
    at = old[0] if old else len(seed)
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
        "lesson": build_hangeul_lesson(),
        "exercises": hangeul_exercises,
    })

    kr.extend(build_course_categories())
    kr.extend(build_course_w3_w5())

    decks = parse_vocab_md(VOCAB_MD.read_text())
    for name, words in decks:
        # Pré-calculé ici plutôt que dans le seed TS : la romanisation syllabée
        # et la phonétique FR affichées dans la correction (맥주 = maek-ju = [mèk-tjou]).
        for w in words:
            w["rr_syl"] = hyphenate_rr(w["ko"], w["rr"])
            phon = romaja_to_fr(w["rr_syl"])
            if phon:
                w["phon"] = phon
        key = "kr-voc-" + re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        deck = {"name": name, "key": key, "color": COLOR, "parent": "kr-vocab",
                "vocab": words}
        if name in _DECK_RULES:
            deck["lesson"] = build_deck_lesson(name, words)
        kr.append(deck)

    seed[at:at] = kr
    SEED.write_text(json.dumps(seed, ensure_ascii=False, indent=2) + "\n")

    print(f"Hangeul: {len(hangeul_exercises)} exercises")
    for name, words in decks:
        # vocab card + (mcq if the deck has >=2 words)
        per = 2 if len(words) >= 2 else 1
        print(f"  {name}: {len(words)} words -> {len(words) * per} exercises")
    print(f"Total Korean categories added: {len(kr)}")


if __name__ == "__main__":
    main()
