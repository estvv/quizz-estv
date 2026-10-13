# Computer Programming — Week 2 · Overview of C & Constants

**Cours** : Chapter 2, *Overview of C* (slides 2_1) et le début du Chapter 3,
*Constants, Variables and Data Types* (slides 2_2) : **character set**,
**tokens**, **keywords**, **identifiers**, les **constants** (integer, real,
character, string, escape sequences) et les **variables**.

> **En bref.** Un programme C a **une seule** `main()` et suit toujours le même
> squelette (documentation → link → definition → global → `main` →
> subprograms). On l'**édite**, le **compile** (`cc prog.c`), le **link** avec
> la system library et on l'**exécute** (`a.out`). Les plus petites unités du
> code sont les **tokens** : keywords (32, en minuscules), identifiers (lettre
> ou `_` d'abord), constants, strings, operators, special symbols. Au quiz :
> savoir dire si un **identifier** est valide, quel est le **type d'une
> constante**, et ce que fait une **escape sequence**.

---

## 1. Histoire et importance du C

```diagram
{
  "title": "History of ANSI C (Fig. 2.1) : de ALGOL au standard ANSI/ISO C, puis C99.",
  "nodes": [
    { "id": "algol", "x": 60, "y": 40, "w": 100, "label": "ALGOL\n1960", "tone": "neutral", "filled": true },
    { "id": "bcpl", "x": 60, "y": 120, "w": 100, "label": "BCPL\n1967", "tone": "neutral", "filled": true },
    { "id": "b", "x": 60, "y": 200, "w": 100, "label": "B\n1970", "tone": "neutral", "filled": true },
    { "id": "tc", "x": 60, "y": 280, "w": 100, "label": "Traditional C\n1972", "tone": "sky", "filled": true },
    { "id": "kr", "x": 300, "y": 280, "w": 100, "label": "K&R C\n1978", "tone": "sky", "filled": true },
    { "id": "ansi", "x": 300, "y": 200, "w": 100, "label": "ANSI C\n1989", "tone": "amber", "filled": true },
    { "id": "iso", "x": 300, "y": 120, "w": 100, "label": "ANSI/ISO C\n1990", "tone": "amber", "filled": true },
    { "id": "c99", "x": 300, "y": 40, "w": 100, "label": "C99\n1999", "tone": "emerald", "filled": true },
    { "id": "n1", "x": 175, "y": 40, "shape": "text", "label": "International Group", "size": 11 },
    { "id": "n2", "x": 175, "y": 120, "shape": "text", "label": "Martin Richards", "size": 11 },
    { "id": "n3", "x": 175, "y": 200, "shape": "text", "label": "Ken Thompson", "size": 11 },
    { "id": "n4", "x": 180, "y": 262, "shape": "text", "label": "Dennis Ritchie", "size": 11 },
    { "id": "n5", "x": 420, "y": 280, "shape": "text", "label": "Kernighan & Ritchie", "size": 11 },
    { "id": "n6", "x": 420, "y": 200, "shape": "text", "label": "ANSI Committee", "size": 11 },
    { "id": "n7", "x": 420, "y": 120, "shape": "text", "label": "ISO Committee", "size": 11 }
  ],
  "edges": [
    { "from": "algol", "to": "bcpl" }, { "from": "bcpl", "to": "b" }, { "from": "b", "to": "tc" },
    { "from": "tc", "to": "kr" }, { "from": "kr", "to": "ansi" }, { "from": "ansi", "to": "iso" }, { "from": "iso", "to": "c99" }
  ]
}
```

- C est **structured**, **high-level**, **machine independent**.
- **ANSI C** et **C99** sont les versions **standardisées**.
- C combine les **capacités de l'assembleur** et les **features d'un HLL**.
- C est **robust**, **portable**, structuré.
- On écrit en **minuscules** ; les **majuscules** servent aux **symbolic
  names** (`#define PI`) et aux chaînes affichées.

## 2. Les programmes d'exemple du chapitre

| Fig. | Programme | Ce qu'il montre |
|---|---|---|
| 2.2 | `printf("I see, I remember");` | un `main()` minimal, une seule instruction |
| 2.4 | `number = 100; amount = 30.75 + 75.35;` puis `%d` et `%5.2f` | déclarations `int`/`float`, sortie **`100`** puis **`106.10`** |
| 2.5 | investment problem, `#define PERIOD 10`, `PRINCIPAL 5000.00`, `while (year <= PERIOD)` | **symbolic constants**, boucle `while`, `value = amount + inrate * amount` |
| 2.7 | `int mul(int a, int b);` puis `c = mul(a, b);` | une **user-defined function** déclarée avant `main` |
| 2.8 | `#include <math.h>`, `y = cos(x);` | une **math function** (il faut **`-lm`** au link) |

```c
/* Fig. 2.7 : a program using a user-defined function */
int mul(int a, int b);          /* DECLARATION (prototype) */

main()
{
    int a, b, c;
    a = 5;
    b = 10;
    c = mul(a, b);
    printf("multiplication of %d and %d is %d", a, b, c);
}

int mul(int x, int y)           /* DEFINITION, après main */
{
    int p;
    p = x * y;
    return (p);
}
```

> Les slides utilisent le style pré-ANSI (`main()` sans type de retour). En C
> moderne on écrit `int main(void)` et on termine par `return 0;`.

## 3. Structure d'un programme C (Fig. 2.9)

```diagram
{
  "title": "Les six sections d'un programme C, toujours dans cet ordre. Seule main() est obligatoire.",
  "nodes": [
    { "id": "doc", "x": 200, "y": 30, "w": 300, "label": "Documentation section", "tone": "neutral", "filled": true },
    { "id": "lnk", "x": 200, "y": 80, "w": 300, "label": "Link section  (#include)", "tone": "sky", "filled": true },
    { "id": "def", "x": 200, "y": 130, "w": 300, "label": "Definition section  (#define)", "tone": "sky", "filled": true },
    { "id": "glo", "x": 200, "y": 180, "w": 300, "label": "Global declaration section", "tone": "violet", "filled": true },
    { "id": "mn", "x": 200, "y": 250, "w": 300, "h": 60, "label": "main() function section\n{ declaration part · executable part }", "tone": "amber", "filled": true, "bold": true },
    { "id": "sub", "x": 200, "y": 320, "w": 300, "label": "Subprogram section  (function 1 … n)", "tone": "emerald", "filled": true },
    { "id": "n1", "x": 470, "y": 30, "shape": "text", "label": "/* but, auteur */", "size": 11 },
    { "id": "n2", "x": 470, "y": 80, "shape": "text", "label": "#include <stdio.h>", "size": 11 },
    { "id": "n3", "x": 470, "y": 130, "shape": "text", "label": "#define PI 3.1416", "size": 11 },
    { "id": "n4", "x": 470, "y": 180, "shape": "text", "label": "int mul(int, int);", "size": 11 },
    { "id": "n5", "x": 470, "y": 250, "shape": "text", "label": "exactement UNE", "size": 11 },
    { "id": "n6", "x": 470, "y": 320, "shape": "text", "label": "user-defined functions", "size": 11 }
  ],
  "edges": []
}
```

| Section | Contient | Obligatoire ? |
|---|---|---|
| **Documentation** | commentaire d'en-tête : but, auteur, date | non |
| **Link** | `#include` des headers de la system library | en pratique oui |
| **Definition** | `#define` (symbolic constants) | non |
| **Global declaration** | variables globales + **prototypes** | non |
| **`main()`** | *declaration part* puis *executable part* | **oui, une seule** |
| **Subprogram** | les user-defined functions | non |

- **Une seule `main()`** : en mettre deux est **illégal**. L'exécution commence
  à `main`.
- L'exécution d'une fonction commence à l'**accolade ouvrante** et se termine
  à l'**accolade fermante** correspondante.
- **C is free-form** : `a = b; x = y + 1; z = a + x;` peut tenir sur une ligne.
  L'indentation ne sert qu'à la lisibilité.

## 4. Exécuter un programme C (Fig. 2.10)

```flowchart
{
  "title": "Edit → compile → link → execute. Une erreur de syntaxe renvoie à l'édition ; une erreur sur les données aussi.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "START" },
    { "id": "ed", "kind": "process", "label": "Edit : écrire le source prog.c" },
    { "id": "cp", "kind": "process", "label": "Compile (C compiler)" },
    { "id": "d1", "kind": "decision", "label": "Syntax errors ?" },
    { "id": "lk", "kind": "process", "label": "Link avec la system library\n→ executable object code" },
    { "id": "in", "kind": "io", "label": "Input data" },
    { "id": "ex", "kind": "process", "label": "Execute" },
    { "id": "d2", "kind": "decision", "label": "Data error /\nlogic error ?" },
    { "id": "out", "kind": "io", "label": "CORRECT OUTPUT" },
    { "id": "e", "kind": "end", "label": "STOP" }
  ],
  "edges": [
    { "from": "s", "to": "ed" }, { "from": "ed", "to": "cp" }, { "from": "cp", "to": "d1" },
    { "from": "d1", "to": "ed", "branch": "yes" }, { "from": "d1", "to": "lk", "branch": "no" },
    { "from": "lk", "to": "in" }, { "from": "in", "to": "ex" }, { "from": "ex", "to": "d2" },
    { "from": "d2", "to": "ed", "branch": "yes" }, { "from": "d2", "to": "out", "branch": "no" },
    { "from": "out", "to": "e" }
  ]
}
```

| Système | Commande | Effet |
|---|---|---|
| UNIX | `ed prog.c` / `vi prog.c` | créer le source |
| UNIX | `cc prog.c` | compile + link → **`a.out`** (nom par défaut) |
| UNIX | `cc prog.c -lm` | link aussi la **math library** (`<math.h>`) |
| UNIX | `cc -o name prog.c` | choisir le nom de l'exécutable |
| UNIX | `a.out` | exécuter |
| MS-DOS | `MSC pay.c` → `LINK pay.obj` → `pay.exe` | compile, link, run |
| Windows | IDE : Visual Studio, Dev-C++, Turbo C… | tout-en-un |

```diagram
{
  "title": "Multiple source files (Fig. 2.11) : chaque .c devient un .o, le linker les assemble avec la library en un seul a.out.",
  "nodes": [
    { "id": "c1", "x": 60, "y": 30, "w": 90, "label": "file-1.c", "tone": "sky", "filled": true },
    { "id": "c2", "x": 200, "y": 30, "w": 90, "label": "file-2.c", "tone": "sky", "filled": true },
    { "id": "c3", "x": 340, "y": 30, "w": 90, "label": "file-n.c", "tone": "sky", "filled": true },
    { "id": "cc", "x": 200, "y": 100, "w": 380, "label": "Compiler and preprocessor", "tone": "violet", "filled": true },
    { "id": "o1", "x": 60, "y": 170, "w": 90, "label": "file-1.o", "tone": "amber", "filled": true },
    { "id": "o2", "x": 200, "y": 170, "w": 90, "label": "file-2.o", "tone": "amber", "filled": true },
    { "id": "o3", "x": 340, "y": 170, "w": 90, "label": "file-n.o", "tone": "amber", "filled": true },
    { "id": "lib", "x": 480, "y": 170, "w": 90, "shape": "cylinder", "label": "Library" },
    { "id": "ld", "x": 270, "y": 240, "w": 380, "label": "Linker", "tone": "violet", "filled": true },
    { "id": "out", "x": 270, "y": 310, "w": 120, "label": "a.out", "tone": "emerald", "filled": true, "bold": true }
  ],
  "edges": [
    { "from": "c1", "to": "cc" }, { "from": "c2", "to": "cc" }, { "from": "c3", "to": "cc" },
    { "from": "cc", "to": "o1" }, { "from": "cc", "to": "o2" }, { "from": "cc", "to": "o3" },
    { "from": "o1", "to": "ld" }, { "from": "o2", "to": "ld" }, { "from": "o3", "to": "ld" }, { "from": "lib", "to": "ld" },
    { "from": "ld", "to": "out" }
  ]
}
```

**Key concepts** (slides) :

| Terme | Définition |
|---|---|
| `#define` | une **preprocessor compiler directive** |
| `printf` | fonction standard qui écrit sur **stdout** (standard output) |
| `scanf` | fonction standard qui lit une entrée **formatée** sur **stdin** |
| program | une **séquence d'instructions** qui réalise une tâche précise |

## 5. Character set et tokens

Le **character set** du C est rangé en **4 catégories** :

| Catégorie | Contenu |
|---|---|
| **Letters** | `A…Z`, `a…z` |
| **Digits** | `0…9` |
| **Special characters** | `, . ; ' " | / \ ~ _ ! ? $ % # & ^ * - + < > ( ) [ ] { }` |
| **White spaces** | blank space, horizontal tab, carriage return, new line, form feed |

Un **token** est la **plus petite unité individuelle** d'un programme C (comme
les mots et la ponctuation dans un texte).

```diagram
{
  "title": "Les six familles de C tokens.",
  "nodes": [
    { "id": "t", "x": 360, "y": 30, "w": 120, "label": "C tokens", "tone": "violet", "filled": true, "bold": true },
    { "id": "k", "x": 60, "y": 120, "w": 112, "label": "Keywords\nfloat, while", "tone": "sky", "filled": true, "size": 12 },
    { "id": "i", "x": 180, "y": 120, "w": 112, "label": "Identifiers\nmain, amount", "tone": "sky", "filled": true, "size": 12 },
    { "id": "c", "x": 300, "y": 120, "w": 112, "label": "Constants\n-15.5, 100", "tone": "amber", "filled": true, "size": 12 },
    { "id": "s", "x": 420, "y": 120, "w": 112, "label": "Strings\n\"ABC\"", "tone": "amber", "filled": true, "size": 12 },
    { "id": "sp", "x": 540, "y": 120, "w": 112, "label": "Special symbols\n[ ] { }", "tone": "emerald", "filled": true, "size": 12 },
    { "id": "op", "x": 660, "y": 120, "w": 112, "label": "Operators\n+ - * ,", "tone": "emerald", "filled": true, "size": 12 }
  ],
  "edges": [
    { "from": "t", "to": "k" }, { "from": "t", "to": "i" }, { "from": "t", "to": "c" },
    { "from": "t", "to": "s" }, { "from": "t", "to": "sp" }, { "from": "t", "to": "op" }
  ]
}
```

## 6. Keywords

Les **keywords** ont un **sens fixe qu'on ne peut pas changer** et s'écrivent
**en minuscules**. ANSI C en a **32** :

| | | | | |
|---|---|---|---|---|
| `auto` | `do` | `goto` | `signed` | `unsigned` |
| `break` | `double` | `if` | `sizeof` | `void` |
| `case` | `else` | `int` | `static` | `volatile` |
| `char` | `enum` | `long` | `struct` | `while` |
| `const` | `extern` | `register` | `switch` | |
| `continue` | `float` | `return` | `typedef` | |
| `default` | `for` | `short` | `union` | |

> **Piège :** `main`, `printf`, `scanf`, `include`, `define` ne sont **pas** des
> keywords. `main` est un identifier, `printf` une fonction de bibliothèque,
> `#include`/`#define` des directives du préprocesseur.

## 7. Identifiers

Les **identifiers** sont les noms **définis par l'utilisateur** : variables,
fonctions, tableaux (`int my_name;`, `void CalculateTotal(int value)`).

**Règles :**

1. Le **premier caractère** est une **lettre** ou **`_`**.
2. Uniquement **lettres, chiffres et `_`**.
3. Seuls les **31 premiers caractères** sont significatifs (ANSI ; 63 en C99).
4. Pas un **keyword**.
5. Pas d'**espace** (white space).
6. **Case sensitive** : `Ss ≠ ss`, `Vmax ≠ vmax`.
7. Aucun **opérateur** (`R*S+T`) ni **signe de ponctuation** (`#@x%!!`).

| Nom | Valide ? | Pourquoi |
|---|---|---|
| `times10` | ✅ | lettre d'abord |
| `get_next_char` | ✅ | `_` autorisé |
| `_done` | ✅ | `_` en premier autorisé |
| `int_type` | ✅ | contient un keyword mais n'en **est** pas un |
| `10times` | ❌ | commence par un chiffre |
| `get-next-char` | ❌ | `-` est un opérateur |
| `char` | ❌ | keyword |
| `Price$` | ❌ | `$` interdit |
| `Group one` | ❌ | espace |

## 8. Constants

```diagram
{
  "title": "Basic types of C constants (Fig. 2.2).",
  "nodes": [
    { "id": "c", "x": 300, "y": 30, "w": 140, "label": "C constants", "tone": "violet", "filled": true, "bold": true },
    { "id": "n", "x": 150, "y": 110, "w": 160, "label": "Numeric constants", "tone": "sky", "filled": true },
    { "id": "ch", "x": 450, "y": 110, "w": 160, "label": "Character constants", "tone": "amber", "filled": true },
    { "id": "i", "x": 70, "y": 190, "w": 140, "label": "Integer\n123, 0436, 0x9F", "tone": "sky", "size": 12 },
    { "id": "r", "x": 230, "y": 190, "w": 140, "label": "Real\n0.083, 1.5e+5", "tone": "sky", "size": 12 },
    { "id": "sc", "x": 370, "y": 190, "w": 140, "label": "Single character\n'5'  'X'  ';'", "tone": "amber", "size": 12 },
    { "id": "st", "x": 530, "y": 190, "w": 140, "label": "String\n\"Hello!\"  \"X\"", "tone": "amber", "size": 12 }
  ],
  "edges": [
    { "from": "c", "to": "n" }, { "from": "c", "to": "ch" },
    { "from": "n", "to": "i" }, { "from": "n", "to": "r" },
    { "from": "ch", "to": "sc" }, { "from": "ch", "to": "st" }
  ]
}
```

### Integer constants

| Base | Règle | Exemples | Invalide |
|---|---|---|---|
| **Decimal** | chiffres 0–9, signe optionnel | `0`, `321`, `-22`, `+99` | `25,012` (virgule), `$1000`, `20 000` |
| **Octal** | **commence par `0`**, chiffres 0–7 | `0436`, `0`, `071` | `089` (8 et 9 interdits) |
| **Hexadecimal** | **commence par `0x`/`0X`**, 0–9 et A–F | `0X2`, `0x9F`, `0x2af` | `0xG1` |

- La plus grande valeur dépend de la **machine** (16 bits, 32 bits…).
- **Qualifiers** : `56789U` = **unsigned**, `9876543L` = **long**,
  `987612347UL` = **unsigned long** (minuscules acceptées : `u`, `l`, `ul`).

> **Piège :** `0436` n'est **pas** 436 : c'est de l'**octal** = 4·64 + 3·8 + 6
> = **286** en décimal.

### Real (floating-point) constants

- **Decimal notation** : `0.083`, `-0.75`, `435.36`, `+247.0`, et aussi `215.`,
  `.95`, `-.71`, `+.5`.
- **Exponential (scientific) notation** : `mantissa e exponent`, l'exposant est
  un **entier** : `0.65e4` (= 6500), `12e-2` (= 0.12), `1.5e+5`, `3.18E3`,
  `-1.2e-1`.
- **Invalides** : `1.5E+2.5` (exposant non entier), `7.1e 4` (espace).

### Character et string constants

| | Écriture | Valeur |
|---|---|---|
| **Single character** | entre **apostrophes** : `'5'`, `'X'`, `';'`, `' '` | a une **valeur entière** (code **ASCII**) |
| **String** | entre **guillemets** : `"Hello!"`, `"1987"`, `"5+3"`, `"X"` | **pas** de valeur entière |

- `'5' != 5` : `'5'` vaut **53** (ASCII), `5` vaut 5.
- `printf("%d", 'a');` → **97** ; `printf("%c", 97);` → **a**.
- `'X'` (un char) ≠ `"X"` (une string d'un caractère, terminée par `\0`).

### Backslash characters (escape sequences)

| Séquence | Effet | Séquence | Effet |
|---|---|---|---|
| `\a` | **beep** (alert) | `\v` | vertical tab |
| `\b` | backspace | `\\` | backslash |
| `\f` | form feed (imprimante) | `\"` | guillemet |
| `\n` | **new line** | `\'` | apostrophe |
| `\r` | carriage return | `\0` | **NULL** (fin de string) |
| `\t` | horizontal **tab** | `\ooo` / `\xhh` | octal / hexadecimal |

### Enumeration

```c
enum Language { Korean, Malay, English, Arabic };
/*                0       1       2       3     */
```

## 9. Variables

Une **variable** est un **nom de donnée** associé à une **case mémoire** dont la
**valeur peut changer**.

| Étape | Exemple | Sens |
|---|---|---|
| **Declaration** | `int num;` | précise le **type** |
| **Definition / assignment** | `num = 5;` | donne une **valeur** |

On **déclare avant d'utiliser** :

```c
int inches, feet, fathoms;   /* int   */
float x, y;                  /* float */
char c;                      /* char  */
```

**Trois classes de data types** en ANSI C :

| Classe | Exemples |
|---|---|
| **Primary (fundamental)** | `int`, `char`, `float`, `double`, `long double`, `void` |
| **User-defined** | `typedef`, `enum` |
| **Derived** | arrays, functions, structures, pointers |

---

## 10. Exercices du TD, expliqués

### Exo 1 — variable globale

```c
int sum = 0;                 /* global : section "global declaration" */

int main(void)
{
    int x = 1, y = 1;        /* locales à main */
    sum = x + y;
    printf("Result %d\n", sum);   /* Result 2 */
    return 0;
}
```

### Exo 2 — aire d'un cercle : le bug classique de `scanf`

```diagram
{
  "title": "scanf ne renvoie PAS la valeur lue : il renvoie le nombre d'items lus. Et le texte dans le format doit être tapé tel quel.",
  "nodes": [
    { "id": "bad", "x": 170, "y": 40, "w": 320, "label": "int r = scanf(\"Enter radius: %d\", &num);", "tone": "rose", "filled": true, "size": 12 },
    { "id": "num", "x": 60, "y": 140, "shape": "table", "label": "num", "size": 12, "rows": [["num"],["42"]], "cols": [70] },
    { "id": "r", "x": 280, "y": 140, "shape": "table", "label": "r", "size": 12, "rows": [["r"],["0 ou 1"]], "cols": [80] },
    { "id": "n1", "x": 60, "y": 215, "shape": "text", "label": "la vraie valeur\n(si l'utilisateur tape\n\"Enter radius: 42\")", "size": 11 },
    { "id": "n2", "x": 280, "y": 215, "shape": "text", "label": "un COMPTE d'items\n→ aire fausse", "size": 11 },
    { "id": "good", "x": 500, "y": 140, "w": 220, "h": 70, "label": "printf(\"Enter radius: \");\nscanf(\"%d\", &r);\narea = PI * r * r;", "tone": "emerald", "filled": true, "size": 12 }
  ],
  "edges": [
    { "from": "bad", "to": "num", "label": "écrit ici" },
    { "from": "bad", "to": "r", "label": "renvoie", "dashed": true }
  ]
}
```

### Exo 3 — `x = a / (b − c)` sans division par zéro

```flowchart
{
  "title": "Avec (b) a = 300, b = 70, c = 70 : b − c = 0, on affiche une erreur au lieu de diviser.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "START" },
    { "id": "in", "kind": "io", "label": "a, b, c" },
    { "id": "p", "kind": "process", "label": "den = b − c" },
    { "id": "d", "kind": "decision", "label": "den == 0 ?" },
    { "id": "err", "kind": "io", "label": "\"Error: Division by zero\"" },
    { "id": "x", "kind": "process", "label": "x = a / den" },
    { "id": "out", "kind": "io", "label": "DISPLAY x" },
    { "id": "e", "kind": "end", "label": "END" }
  ],
  "edges": [
    { "from": "s", "to": "in" }, { "from": "in", "to": "p" }, { "from": "p", "to": "d" },
    { "from": "d", "to": "err", "branch": "yes" }, { "from": "d", "to": "x", "branch": "no" },
    { "from": "x", "to": "out" }, { "from": "out", "to": "e" }, { "from": "err", "to": "e" }
  ]
}
```

| Cas | a | b | c | b − c | x |
|---|---|---|---|---|---|
| (a) | 250 | 85 | 25 | 60 | **4.166667** |
| (b) | 300 | 70 | 70 | **0** | erreur |

Autre exercice du chapitre : afficher l'équation d'une droite
`ax + by = c` avec a = 5, b = 8, c = 18 →
`printf("%dx + %dy = %d\n", a, b, c);` → `5x + 8y = 18`.

### Exo 5 — afficher chaque type

| Variable | Initialisée à | Format | Sortie |
|---|---|---|---|
| `int int_val` | `0` | `%d` | `0` |
| `float float_val` | `0.0` | `%f` | `0.000000` |
| `char char_val` | `'0'` | `%c` | `0` (le caractère ; en `%d` ce serait **48**) |
| `double double_val` | `0.0` | `%lf` | `0.000000` |

---

## Pièges d'exam

- **Une seule `main()`** ; deux = illégal.
- `0436` est **octal**, `0x2af` **hexadécimal** ; `25,012` et `$1000` sont
  **invalides**.
- Exposant **entier** obligatoire : `1.5E+2.5` invalide.
- `'5'` (char, ASCII 53) ≠ `5` (int) ≠ `"5"` (string).
- Identifier : **lettre ou `_` d'abord**, pas de `-`, `$`, espace, ni keyword ;
  **case sensitive**.
- Les keywords sont **en minuscules** ; `main` n'en est pas un.
- `cc prog.c` → **`a.out`** ; `-o name` renomme ; **`-lm`** pour `<math.h>`.

## À retenir

- Squelette : documentation → link → definition → global → **main** →
  subprograms.
- Tokens : keywords, identifiers, constants, strings, special symbols,
  operators.
- Constants : integer (dec / **0**ctal / **0x**hex, suffixes `U L UL`), real
  (décimal ou `mantisse e exposant`), character (`'x'`, valeur ASCII), string
  (`"x"`).
- Escape sequences : `\n` new line, `\t` tab, `\a` beep, `\0` NULL, `\\`, `\"`.
- Variable = nom d'une case mémoire ; **déclarer** (type) avant **définir**
  (valeur).
