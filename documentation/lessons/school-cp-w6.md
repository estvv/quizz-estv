# Computer Programming — Week 6 · switch, ?: and goto

**Cours** : Chapter 6 (2e partie), *Decision Making and Branching* : le
**`switch`** (sélection multiple), le **conditional operator `?:`**
(exemple du prêt, GCD), les **guidelines** pour écrire une sélection
multiple, et le **`goto`** (sauts avant / arrière, sortie de boucles).

> **En bref.** `switch (expression)` compare une valeur **entière** à des
> **case labels constants et uniques** ; on exécute le bloc qui correspond
> **jusqu'au `break`** (sans `break`, on **continue dans le case suivant** :
> *fall through*). `default` est optionnel, au plus un. `x = cond ? a : b`
> remplace un `if…else` simple. `goto label;` saute **sans condition** vers
> `label:` ; à éviter, sauf pour sortir de boucles imbriquées.

---

## 1. Le `switch`

Quand il faut choisir **parmi beaucoup d'alternatives**, une longue `else if`
ladder devient illisible : C a un **multiway decision statement**, le
`switch`.

```c
switch (expression)
{
    case value-1:
        block-1
        break;
    case value-2:
        block-2
        break;
    ...
    default:
        default-block
        break;
}
statement-x;
```

- L'expression est **comparée successivement** à value-1, value-2, …
- Si une valeur **correspond**, on exécute le bloc qui suit ce `case`.
- **`break`** signale la **fin** du case et **sort** du `switch`.
- **`default`** est exécuté si **aucune** valeur ne correspond.
- Les case labels se terminent par un **deux-points `:`**.

```diagram
{
  "title": "Selection process of the switch statement (Fig. 6.11).",
  "nodes": [
    { "id": "in", "x": 330, "y": 20, "w": 150, "label": "Entry", "tone": "neutral", "filled": true },
    { "id": "sw", "x": 330, "y": 90, "w": 200, "label": "switch (expression)", "tone": "violet", "filled": true, "bold": true },
    { "id": "b1", "x": 100, "y": 190, "w": 130, "label": "block-1", "tone": "sky", "filled": true },
    { "id": "b2", "x": 260, "y": 190, "w": 130, "label": "block-2", "tone": "sky", "filled": true },
    { "id": "bn", "x": 420, "y": 190, "w": 130, "label": "…", "tone": "sky", "filled": true },
    { "id": "df", "x": 580, "y": 190, "w": 130, "label": "default-block", "tone": "amber", "filled": true },
    { "id": "x", "x": 330, "y": 290, "w": 200, "label": "statement-x", "tone": "emerald", "filled": true }
  ],
  "edges": [
    { "from": "in", "to": "sw" },
    { "from": "sw", "to": "b1", "label": "= value-1" },
    { "from": "sw", "to": "b2", "label": "= value-2" },
    { "from": "sw", "to": "bn" },
    { "from": "sw", "to": "df", "label": "no match" },
    { "from": "b1", "to": "x", "label": "break" },
    { "from": "b2", "to": "x", "label": "break" },
    { "from": "bn", "to": "x" },
    { "from": "df", "to": "x" }
  ]
}
```

### Rules for switch statement

| Règle | Exemple / remarque |
|---|---|
| L'expression doit être de type **integral** (`int`, `char`) | `switch (x)` avec `float x` → **erreur** |
| Les case labels sont des **constantes** ou **constant expressions** | `case 'A':`, `case 2 + 1:` ✅ ; `case n:` ❌ |
| Les case labels sont **uniques** | deux `case 3:` → **erreur** |
| Chaque case label finit par **`:`** | (les slides écrivent « semicolon » par erreur : c'est un **colon**) |
| `break` fait **sortir** du switch | |
| `break` est **optionnel** → plusieurs labels peuvent partager les mêmes instructions | `case 'a': case 'A': …` |
| `default` est **optionnel**, **au plus un** | exécuté si rien ne correspond |
| `default` peut être **n'importe où**, en général **à la fin** | |
| On peut **imbriquer** des `switch` | |

### Le fall through (oubli de `break`)

```c
int x = 2;
switch (x) {
    case 1: printf("one ");
    case 2: printf("two ");
    case 3: printf("three ");
    default: printf("other");
}
/* sortie : two three other */
```

```diagram
{
  "title": "Sans break, l'exécution « tombe » dans les cases suivants jusqu'à la fin du switch.",
  "nodes": [
    { "id": "c1", "x": 100, "y": 40, "w": 150, "label": "case 1: \"one\"", "tone": "neutral", "filled": true },
    { "id": "c2", "x": 100, "y": 110, "w": 150, "label": "case 2: \"two\"", "tone": "emerald", "filled": true, "bold": true },
    { "id": "c3", "x": 100, "y": 180, "w": 150, "label": "case 3: \"three\"", "tone": "amber", "filled": true },
    { "id": "d", "x": 100, "y": 250, "w": 150, "label": "default: \"other\"", "tone": "amber", "filled": true },
    { "id": "x", "x": 330, "y": 110, "w": 120, "label": "x = 2", "tone": "violet", "filled": true },
    { "id": "n", "x": 400, "y": 215, "w": 200, "shape": "note", "tone": "rose", "label": "pas de break :\non continue !", "size": 12 }
  ],
  "edges": [
    { "from": "x", "to": "c2", "label": "match" },
    { "from": "c2", "to": "c3", "tone": "rose" },
    { "from": "c3", "to": "d", "tone": "rose" }
  ]
}
```

### Worked-out problem 6.6 : le mois et le suivant

```c
char month[12][20] = {"January", "February", ..., "December"};
scanf("%d", &i);
if (i < 1 || i > 12) {
    printf("Incorrect value!!\n");
    exit(0);
}
if (i != 12)
    printf("%s followed by %s", month[i-1], month[i]);
else
    printf("%s followed by %s", month[i-1], month[0]);   /* December → January */
/* 6 → June followed by July */
```

> Les indices de tableau commencent à **0** : le mois `i` est `month[i-1]`.

## 2. Le conditional operator `?:`

`conditional expression ? expression1 : expression2`

- La condition est évaluée d'abord ; **non nulle** → valeur de
  **expression1**, sinon **expression2**.

```c
if (x < 0)
    flag = 0;
else
    flag = 1;

/* équivaut à */
flag = (x < 0) ? 0 : 1;
```

### Worked-out problem 6.7 : le prêt

Règles : **(1)** pas plus de **deux prêts** en même temps ; **(2)** total
**plafonné** à `MAXLOAN = 50000`.

```c
sancloan = (loan1 > 0) ? 0
         : ((sum23 > MAXLOAN) ? MAXLOAN - loan2 : loan3);
/* sum23 = loan2 + loan3 */
```

```flowchart
{
  "title": "Le ?: imbriqué de la Fig. 6.13 lu comme un organigramme.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "START", "x": 150, "y": 20 },
    { "id": "in", "kind": "io", "label": "READ loan1, loan2, loan3", "x": 150, "y": 90 },
    { "id": "p", "kind": "process", "label": "sum23 = loan2 + loan3", "x": 150, "y": 165 },
    { "id": "d1", "kind": "decision", "label": "loan1 > 0 ?", "x": 150, "y": 245 },
    { "id": "z", "kind": "process", "label": "sancloan = 0\n(déjà 2 prêts)", "x": 150, "y": 330 },
    { "id": "d2", "kind": "decision", "label": "sum23 > MAXLOAN ?", "x": 400, "y": 330 },
    { "id": "m", "kind": "process", "label": "sancloan =\nMAXLOAN − loan2", "x": 400, "y": 420 },
    { "id": "l", "kind": "process", "label": "sancloan = loan3", "x": 610, "y": 420 },
    { "id": "out", "kind": "io", "label": "DISPLAY sancloan", "x": 150, "y": 510 },
    { "id": "e", "kind": "end", "label": "END", "x": 150, "y": 585 }
  ],
  "edges": [
    { "from": "s", "to": "in" }, { "from": "in", "to": "p" }, { "from": "p", "to": "d1" },
    { "from": "d1", "to": "z", "branch": "yes" }, { "from": "d1", "to": "d2", "branch": "no" },
    { "from": "d2", "to": "m", "branch": "yes" }, { "from": "d2", "to": "l", "branch": "no" },
    { "from": "z", "to": "out" }, { "from": "m", "to": "out" }, { "from": "l", "to": "out" }, { "from": "out", "to": "e" }
  ]
}
```

| loan1 | loan2 | loan3 | sum23 | Sanctioned |
|---|---|---|---|---|
| 0 | 20000 | 45000 | 65000 > 50000 | **30000** (= 50000 − 20000) |
| 1000 | 15000 | 25000 | — | **0** (déjà deux prêts en cours) |

### Worked-out problem 6.8 : le GCD

Le **plus grand commun diviseur** par l'**algorithme d'Euclide** :
GCD(a, b) = GCD(b, a % b) jusqu'à ce que b = 0.

```c
int GCD(int a, int b)
{
    if (b > a)
        return GCD(b, a);        /* on met le plus grand en premier */
    if (b == 0)
        return a;
    return GCD(b, a % b);
}
/* GCD of 18 and 12 is 6 */
```

```diagram
{
  "title": "Déroulé de GCD(18, 12) : on remplace (a, b) par (b, a % b) jusqu'à b = 0.",
  "nodes": [
    { "id": "t", "x": 300, "y": 30, "shape": "table", "size": 12, "label": "", "rows": [["appel","a","b","a % b","suite"],["GCD(18, 12)","18","12","6","GCD(12, 6)"],["GCD(12, 6)","12","6","0","GCD(6, 0)"],["GCD(6, 0)","6","0","—","b == 0 → return 6"]], "mark": [3], "cols": [110,40,40,60,150] }
  ],
  "edges": []
}
```

## 3. Guidelines for multiway selection

- **Éviter** les négations composées ; préférer les tests **positifs**.
- Expressions **simples** (**KISS** — Keep It Simple and Short), quitte à
  imbriquer des `if`.
- Coder **d'abord** le cas **normal / attendu**, et la condition **la plus
  probable** en premier (moins de tests inutiles).
- `if` imbriqués ou `switch` : affaire de goût ; règle pratique : **`switch`
  quand il y a de 3 à 10 alternatives**.
- Bonne **indentation**, **toujours** un `default`, **regrouper** les case
  labels qui font la même chose.

## 4. Le `goto`

Branchement **inconditionnel** d'un point à un autre du programme. Il faut un
**label** : un nom valide suivi de **`:`**, placé juste avant l'instruction
cible.

```diagram
{
  "title": "Forward jump (le label est après) et backward jump (le label est avant : risque de boucle infinie).",
  "nodes": [
    { "id": "f1", "x": 110, "y": 40, "w": 160, "label": "goto label;", "tone": "rose", "filled": true },
    { "id": "f2", "x": 110, "y": 100, "w": 160, "label": "…  (sauté)", "tone": "neutral" },
    { "id": "f3", "x": 110, "y": 160, "w": 160, "label": "label: statement;", "tone": "emerald", "filled": true },
    { "id": "h1", "x": 110, "y": 215, "shape": "text", "label": "Forward jump", "bold": true },
    { "id": "b1", "x": 420, "y": 40, "w": 160, "label": "label: statement;", "tone": "emerald", "filled": true },
    { "id": "b2", "x": 420, "y": 100, "w": 160, "label": "…", "tone": "neutral" },
    { "id": "b3", "x": 420, "y": 160, "w": 160, "label": "goto label;", "tone": "rose", "filled": true },
    { "id": "h2", "x": 420, "y": 215, "shape": "text", "label": "Backward jump (boucle)", "bold": true }
  ],
  "edges": [
    { "from": "f1", "to": "f3", "via": [[230, 40], [230, 160]], "tone": "rose" },
    { "from": "b3", "to": "b1", "via": [[540, 160], [540, 40]], "tone": "rose" }
  ]
}
```

- Le label peut être **avant ou après** le `goto`.
- Usage légitime : **sortir de boucles imbriquées** d'un coup quand une
  condition particulière survient (`goto end_of_program;`).
- **À éviter autant que possible** ; acceptable s'il améliore la
  **lisibilité** ou la **vitesse**.
- Attention aux **boucles infinies** avec un backward jump sans condition de
  sortie.

### Worked-out problem 6.9 : racines carrées avec `goto`

```c
count = 1;
read:
    scanf("%lf", &x);
    if (x < 0)
        printf("Value - %d is negative\n", count);
    else {
        y = sqrt(x);
        printf("%lf\t %lf\n", x, y);
    }
    count = count + 1;
    if (count <= 5)
        goto read;          /* backward jump : relit tant que count <= 5 */
printf("\nEnd of computation");
```

Entrée `50.75 40 -36 75 11.25` → 7.123903, 6.324555, « Value - 3 is negative »,
8.660254, 3.354102, puis « End of computation ».

**Key concept** : une **infinite loop** est un ensemble d'instructions
exécuté **indéfiniment** (par ex. `goto start;` sans condition, comme dans
les exercices 2 et 3 du TD : il faut `Ctrl+C` pour arrêter).

---

## 5. Exercices du TD, expliqués

### Exo 1 — note selon un code (switch sur un int)

```c
switch (exp) {
    case 1: printf("A+"); break;
    case 2: printf("B+"); break;
    case 3: printf("C+"); break;
    case 4: printf("D+"); break;
    default: printf("F"); break;
}
```

### Exo 2 — calculatrice (switch sur un char)

```diagram
{
  "title": "Exo 2 : le switch aiguille sur l'opérateur ; la division vérifie b != 0 ; goto start relance indéfiniment (infinite loop).",
  "nodes": [
    { "id": "st", "x": 330, "y": 20, "w": 120, "label": "start:", "tone": "emerald", "filled": true, "bold": true },
    { "id": "in", "x": 330, "y": 80, "w": 220, "label": "READ a, b   puis   op", "tone": "sky", "filled": true },
    { "id": "sw", "x": 330, "y": 145, "w": 160, "label": "switch (op)", "tone": "violet", "filled": true, "bold": true },
    { "id": "p", "x": 70, "y": 230, "w": 100, "label": "a + b", "size": 12 },
    { "id": "m", "x": 190, "y": 230, "w": 100, "label": "a - b", "size": 12 },
    { "id": "t", "x": 310, "y": 230, "w": 100, "label": "a * b", "size": 12 },
    { "id": "d", "x": 450, "y": 230, "w": 140, "label": "b != 0 ? a / b\n: \"Division by zero\"", "size": 11 },
    { "id": "df", "x": 600, "y": 230, "w": 120, "label": "\"Invalid\"", "tone": "amber", "filled": true, "size": 12 },
    { "id": "g", "x": 330, "y": 320, "w": 140, "label": "goto start;", "tone": "rose", "filled": true, "bold": true }
  ],
  "edges": [
    { "from": "st", "to": "in" }, { "from": "in", "to": "sw" },
    { "from": "sw", "to": "p", "label": "'+'" }, { "from": "sw", "to": "m", "label": "'-'" }, { "from": "sw", "to": "t", "label": "'*'" },
    { "from": "sw", "to": "d", "label": "'/'" }, { "from": "sw", "to": "df", "label": "default" },
    { "from": "p", "to": "g" }, { "from": "m", "to": "g" }, { "from": "t", "to": "g" }, { "from": "d", "to": "g" }, { "from": "df", "to": "g" },
    { "from": "g", "to": "st", "via": [[700, 320], [700, 20]], "tone": "rose", "dashed": true }
  ]
}
```

- `scanf(" %c", &exp)` : l'**espace avant `%c`** saute le `\n` resté après
  la lecture des nombres (sinon `%c` lirait ce `\n`, comme `getchar`, W5).
- `case '+':` : un **caractère constant** est une constante entière (son code
  ASCII) → autorisé.

### Exo 3 — voyelle ou consonne

```c
if ((letter >= 'A' && letter <= 'Z') || (letter >= 'a' && letter <= 'z'))
    isVowel(letter) ? "vowel" : "consonant"
else
    "not a correct letter"
```

Version `switch` avec **cases regroupés** (fall through volontaire) :

```c
switch (letter) {
    case 'a': case 'e': case 'i': case 'o': case 'u':
    case 'A': case 'E': case 'I': case 'O': case 'U':
        printf("vowel");
        break;
    default:
        printf("consonant");
}
```

---

## Pièges d'exam

- Expression du `switch` : **integral** seulement (pas de `float`, pas de
  string).
- `case` : **constantes** uniques ; `case x:` avec une variable = **erreur**.
- Oublier `break` → **fall through** dans les cases suivants.
- `default` : optionnel, **au plus un**, placé n'importe où.
- `x = (a > b) ? a : b;` → le plus grand.
- `goto` : label = **nom + `:`** ; saut **inconditionnel** ; risque de
  **boucle infinie**.
- Always remember : pas de `;` après `if (…)`, `==` et non `=`, pas d'espace
  dans `<=` / `!=`, **ne pas comparer deux `float` avec `==`** (rarement
  exactement égaux), `&&` et `||` doublés, attention aux **side effects**
  (`x-- && ++y` : le 2e opérande peut ne **pas être évalué**).

## À retenir

- `switch` pour **3 à 10** alternatives sur une valeur entière ; `break` +
  `default`.
- `?:` = `if…else` en une expression ; s'imbrique pour 3 cas (max de trois).
- GCD : `GCD(a, b) = GCD(b, a % b)`, `GCD(a, 0) = a`.
- `goto` : forward / backward jump ; seul usage conseillé : sortir de boucles
  imbriquées.
