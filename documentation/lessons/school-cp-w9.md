# Computer Programming — Week 9 · Decision Making and Looping

**Thème** (syllabus) : *Decision Making and Looping* : **`while`**,
**`do…while`**, **`for`**, les **boucles imbriquées**, **`break`** et
**`continue`**, et des **applications** (séries, compteurs, nombres
premiers). Pas de slides dans le dossier cette semaine : la leçon suit le
chapitre 7 de Balagurusamy (*Decision Making and Looping*) et corrige les
**exercices du TD** (photo du tableau + `exo1.c` à `exo4.c`).

> **En bref.** Une boucle répète un bloc tant qu'une **condition** est vraie.
> **`while`** teste **avant** (peut ne **jamais** s'exécuter), **`do…while`**
> teste **après** (s'exécute **au moins une fois**, et finit par un **`;`**),
> **`for (init; test; update)`** regroupe les trois étapes. Une boucle a
> toujours **initialisation → test → corps → mise à jour**. **`break`** sort
> de la boucle, **`continue`** passe au tour suivant. Oublier la mise à jour
> = **boucle infinie**.

---

## 1. Les deux familles de boucles

```diagram
{
  "title": "Entry-controlled (test AVANT le corps) vs exit-controlled (test APRÈS le corps).",
  "nodes": [
    { "id": "a", "x": 160, "y": 40, "w": 240, "h": 56, "label": "Entry-controlled loop\nwhile, for", "tone": "sky", "filled": true, "bold": true },
    { "id": "b", "x": 480, "y": 40, "w": 240, "h": 56, "label": "Exit-controlled loop\ndo … while", "tone": "amber", "filled": true, "bold": true },
    { "id": "a2", "x": 160, "y": 130, "w": 240, "h": 50, "label": "test faux dès le départ\n→ 0 exécution", "tone": "sky", "size": 12 },
    { "id": "b2", "x": 480, "y": 130, "w": 240, "h": 50, "label": "test faux dès le départ\n→ 1 exécution quand même", "tone": "amber", "size": 12 }
  ],
  "edges": [ { "from": "a", "to": "a2" }, { "from": "b", "to": "b2" } ]
}
```

Toute boucle a **quatre étapes** :

| Étape | Rôle | Exemple |
|---|---|---|
| **1. Initialization** | donner une valeur de départ au compteur | `i = 1` |
| **2. Test** | décider si on continue | `i <= n` |
| **3. Body** | le travail répété | `sum += i;` |
| **4. Update** | faire avancer le compteur | `i++` |

Deux types de boucles selon le **test** :

| | **Counter-controlled** (déterminée) | **Sentinel-controlled** (indéterminée) |
|---|---|---|
| On sait… | **combien de tours** à l'avance | qu'on s'arrête sur une **valeur spéciale** |
| Exemple | `for (i = 1; i <= 10; i++)` | lire tant que la valeur ≠ −1 |

## 2. `while`

```c
while (test condition)
{
    body of the loop
}
```

```flowchart
{
  "title": "while : on teste d'abord ; si la condition est fausse au départ, le corps n'est jamais exécuté.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "Entry" },
    { "id": "i", "kind": "process", "label": "i = 1 ; sum = 0" },
    { "id": "d", "kind": "decision", "label": "i <= n ?" },
    { "id": "b", "kind": "process", "label": "sum = sum + i ; i++" },
    { "id": "o", "kind": "io", "label": "DISPLAY sum" },
    { "id": "e", "kind": "end", "label": "END" }
  ],
  "edges": [
    { "from": "s", "to": "i" }, { "from": "i", "to": "d" },
    { "from": "d", "to": "b", "branch": "yes" }, { "from": "d", "to": "o", "branch": "no" },
    { "from": "b", "to": "d" }, { "from": "o", "to": "e" }
  ]
}
```

```c
int i = 1, sum = 0;
while (i <= n) {
    sum = sum + i;
    i++;                 /* sans cette ligne : boucle infinie */
}
```

## 3. `do…while`

```c
do
{
    body of the loop
}
while (test condition);   /* ← point-virgule obligatoire */
```

Le corps s'exécute **d'abord**, puis on teste : il s'exécute **au moins une
fois**. Utile pour un **menu** ou une saisie à **valider**, et pour compter
les chiffres d'un nombre (exo 4, ci-dessous).

## 4. `for`

```c
for (initialization; test condition; increment)
{
    body of the loop
}
```

| Partie | Exécutée |
|---|---|
| **initialization** | **une seule fois**, au début |
| **test condition** | **avant chaque tour** (comme un `while`) |
| **increment** | **après chaque tour** |

```c
for (i = 1; i <= 5; i++)       /* 1 2 3 4 5        */
for (i = 10; i > 0; i -= 2)    /* 10 8 6 4 2       */
for (n = 1, m = 10; n <= m; n++, m--)   /* deux compteurs : comma operator (W4) */
for ( ; ; )                    /* boucle infinie : les trois parties sont optionnelles */
```

> **Pièges du `for` :**
> - `for (i = 0; i < 5; i++);` avec un **`;`** à la fin : le corps est
>   **vide**, le bloc qui suit ne s'exécute **qu'une fois** (comme pour
>   `if (…);`).
> - Les **séparateurs** sont des **points-virgules**, pas des virgules.

**Équivalence** `for` ↔ `while` :

```c
for (i = 1; i <= n; i++)        i = 1;
    sum += i;                   while (i <= n) {
                                    sum += i;
                                    i++;
                                }
```

## 5. Boucles imbriquées

Une boucle **dans** une autre : la boucle **interne** fait **tous** ses tours
pour **chaque** tour de la boucle externe (table de multiplication de la
Week 7 : 12 × 10 = 120 affichages).

```c
for (i = 1; i <= 3; i++) {          /* lignes   */
    for (j = 1; j <= i; j++)        /* colonnes */
        printf("* ");
    printf("\n");
}
/* *
   * *
   * * *  */
```

## 6. `break`, `continue`, `goto`

| Instruction | Effet |
|---|---|
| **`break`** | **sort immédiatement** de la boucle (ou du `switch`) **la plus proche** |
| **`continue`** | **saute la fin du corps** et passe au **tour suivant** (dans un `for`, l'**increment** est quand même exécuté) |
| **`goto label`** | saut inconditionnel ; seul usage conseillé : **sortir de boucles imbriquées** (W6) |

```c
for (i = 1; i <= 10; i++) {
    if (i == 5) continue;     /* 5 n'est pas affiché */
    if (i == 8) break;        /* on sort à 8 */
    printf("%d ", i);
}
/* 1 2 3 4 6 7 */
```

> **Piège :** `break` ne sort que **d'une** boucle : dans des boucles
> imbriquées, il ne quitte que la boucle **interne**.

---

## 7. Exercices du TD, expliqués

### 1 — Compter de 75 à 15, de 5 en 5

```c
for (int i = 75; i >= 15; i -= 5)
    printf("%d ", i);
/* 75 70 65 60 55 50 45 40 35 30 25 20 15  (13 nombres) */
```

Condition **`>=`** (pour inclure 15) et pas **`-= 5`** : compte **à
rebours**.

### 2 — Moyenne des n premiers nombres

```c
for (int i = 1; i <= n; i++)
    sum += i;
printf("Average : %f\n", (float)(sum / n));    /* BUG */
printf("Average : %f\n", (float)sum / n);      /* correct */
```

```diagram
{
  "title": "Avec n = 4 (sum = 10) : caster le RÉSULTAT arrive trop tard, la division entière a déjà tronqué.",
  "nodes": [
    { "id": "t", "x": 300, "y": 30, "shape": "table", "size": 12, "label": "sum = 10, n = 4", "rows": [["expression","calcul","résultat"],["(float)(sum / n)","(float)(10 / 4) = (float) 2","2.000000  ✗"],["(float)sum / n","10.0 / 4","2.500000  ✓"],["sum / (float)n","10 / 4.0","2.500000  ✓"]], "mark": [2,3], "cols": [140,200,100] }
  ],
  "edges": []
}
```

> C'est exactement le piège du cast de la **Week 4** : `(float)` doit
> s'appliquer à un **opérande**, pas au résultat déjà tronqué. (La moyenne de
> 1…n vaut d'ailleurs **(n + 1) / 2**.)

### 3 — Nombre, carré, cube de 1 à n

```c
for (int i = 1; i <= n; i++)
    printf("%d\t%d\t%d\n", i, i * i, i * i * i);
```

| i | i² | i³ |
|---|---|---|
| 1 | 1 | 1 |
| 2 | 4 | 8 |
| 3 | 9 | 27 |

### 4 — Nombre de chiffres (do…while)

```c
long long nb;  int count = 0;
do {
    nb /= 10;            /* on enlève le dernier chiffre */
    count++;
} while (nb != 0);
```

```diagram
{
  "title": "nb = 7395 : on divise par 10 jusqu'à 0, un tour par chiffre. Le do…while compte aussi 1 chiffre pour nb = 0.",
  "nodes": [
    { "id": "t", "x": 300, "y": 30, "shape": "table", "size": 12, "label": "Trace", "rows": [["tour","nb avant","nb / 10","count"],["1","7395","739","1"],["2","739","73","2"],["3","73","7","3"],["4","7","0","4 → stop"]], "cols": [50,80,80,90] }
  ],
  "edges": []
}
```

> Avec un **`while`**, `nb = 0` donnerait **0 chiffre** (le corps ne
> s'exécuterait jamais) : le **`do…while`** donne la bonne réponse, **1**.

### 5 — Nombre premier

```c
int prime = (nb >= 2);
for (int i = 2; i * i <= nb && prime; i++)
    if (nb % i == 0)
        prime = 0;
```

- On ne teste les diviseurs que jusqu'à **√nb** (`i * i <= nb`) : si nb a un
  diviseur plus grand que √nb, il en a aussi un plus petit.
- 0 et 1 ne sont **pas** premiers ; **2** est premier (la boucle ne fait
  aucun tour).
- La condition `&& prime` **arrête** la boucle dès qu'un diviseur est trouvé
  (comme un `break`).

### 6 — Série 1²/1 + 2²/2 + … + n²/n

```c
for (int i = 1; i <= n; i++)
    res += (float)(i * i) / i;
```

Chaque terme i²/i vaut **i** : la somme est **1 + 2 + … + n = n(n + 1) / 2**
(n = 5 → **15**). Le commentaire du code « can be simplified » a raison.

### 7 — Série −x + x² − x³ + x⁴ − …

```c
float term = 1, res = 0;
for (int i = 1; i <= n; i++) {
    term *= -x;          /* term = (−x)^i : le signe alterne tout seul */
    res += term;
}
```

| i | term = (−x)ⁱ avec x = 2 | res |
|---|---|---|
| 1 | −2 | −2 |
| 2 | 4 | 2 |
| 3 | −8 | −6 |
| 4 | 16 | **10** |

> Multiplier par **−x** à chaque tour évite `pow()` et gère le **signe
> alterné**.

### exo1.c — série harmonique 1 + 1/2 + … + 1/n

```c
for (int i = 1; i <= n; i++)
    res += 1.0 / i;      /* 1.0 et pas 1 : sinon 1 / i = 0 dès i = 2 */
```

n = 4 → 1 + 0.5 + 0.333 + 0.25 = **2.083333**.

### exo2.c — Fibonacci

```c
unsigned long long a = 0, b = 1, tmp;
for (int i = 0; i < n; i++) {
    printf("%llu ", a);
    tmp = a + b;  a = b;  b = tmp;
}
/* n = 8 : 0 1 1 2 3 5 8 13 */
```

### exo3.c — Factorielle

```c
unsigned long long res = 1;
for (int i = 2; i <= n; i++)
    res *= i;
```

La saisie est limitée à **n ≤ 20** : **20! = 2 432 902 008 176 640 000** tient
dans un `unsigned long long` (max ≈ 1,8 × 10¹⁹), **21!** ≈ 5,1 × 10¹⁹ **dépasse**
(overflow, résultat faux). 0! = 1 (la boucle ne fait aucun tour).

---

## Pièges d'exam

- `while` / `for` : test **avant** (0 tour possible) ; `do…while` : test
  **après** (≥ 1 tour) et **`;`** final.
- Oublier l'**update** → **boucle infinie** ; `for (;;)` = infinie.
- **`;`** juste après `for (…)` ou `while (…)` → corps **vide**.
- `for (init; test; update)` : init **une fois**, test **avant chaque
  tour**, update **après chaque tour**.
- `break` sort de la boucle **la plus proche** ; `continue` passe au tour
  suivant (l'update du `for` est exécuté).
- `1 / i` en entiers = 0 dès i = 2 : écrire **`1.0 / i`**.
- `(float)(sum / n)` tronque ; écrire **`(float)sum / n`**.
- Premier : tester jusqu'à **`i * i <= n`** ; 1 n'est pas premier.

## À retenir

- Les 4 étapes : initialization, test, body, update.
- Entry-controlled (`while`, `for`) vs exit-controlled (`do…while`).
- Boucles imbriquées : interne × externe tours.
- Séries : garder un **terme** qu'on met à jour (`term *= -x`), plutôt que
  `pow()`.
