# Computer Programming — Week 7 · Programming Exercise 2 & révision midterm

**Cours** : la feuille *Programming Exercise – 2* (6 exercices sur les
opérateurs `/` et `%`, les casts, `scanf` et le conditional operator) et une
**fiche de révision** des semaines 1 à 6 avant le **midterm (semaine 8)**.

> **En bref.** Presque tous les exercices reposent sur **deux outils** :
> **`n / 10`** enlève le dernier chiffre, **`n % 10`** le garde. Pour
> découper une durée : **quotient** avec `/`, **reste** avec `%`, de la plus
> grande unité à la plus petite. Pour la partie entière d'un réel :
> **`(int) x`**. Pour max / min de trois : `?:` imbriqués.

---

## 1. Les deux briques : `/` et `%` sur les entiers

```diagram
{
  "title": "Sur un entier en base 10 : / 10 décale vers la droite, % 10 garde le chiffre des unités.",
  "nodes": [
    { "id": "n", "x": 300, "y": 30, "shape": "table", "size": 14, "label": "n = 7395", "header": false, "rows": [["7","3","9","5"]], "cols": [50,50,50,50] },
    { "id": "q", "x": 120, "y": 140, "shape": "table", "size": 14, "label": "n / 10 = 739", "header": false, "rows": [["7","3","9"]], "cols": [50,50,50] },
    { "id": "r", "x": 470, "y": 140, "shape": "table", "size": 14, "label": "n % 10 = 5", "header": false, "rows": [["5"]], "cols": [50] },
    { "id": "q2", "x": 120, "y": 240, "shape": "table", "size": 14, "label": "n / 100 = 73", "header": false, "rows": [["7","3"]], "cols": [50,50] },
    { "id": "r2", "x": 470, "y": 240, "shape": "table", "size": 14, "label": "n % 100 = 95", "header": false, "rows": [["9","5"]], "cols": [50,50] }
  ],
  "edges": [
    { "from": "n", "to": "q", "label": "/ 10" }, { "from": "n", "to": "r", "label": "% 10" }
  ]
}
```

| On veut… | Expression | 7395 |
|---|---|---|
| le chiffre des **unités** | `n % 10` | 5 |
| le chiffre des **dizaines** | `(n / 10) % 10` | 9 |
| le chiffre des **centaines** | `(n / 100) % 10` | 3 |
| le chiffre des **milliers** | `n / 1000` | 7 |
| les **deux derniers** chiffres | `n % 100` | 95 |
| tout **sauf le premier** | `n % 1000` | 395 |

## 2. Q1 — jours → années, semaines, jours

```diagram
{
  "title": "On part de la plus grande unité. Exemple : 800 jours (1 an = 365 jours).",
  "nodes": [
    { "id": "d", "x": 60, "y": 70, "w": 90, "label": "days\n800", "tone": "neutral", "filled": true, "bold": true },
    { "id": "y", "x": 250, "y": 30, "w": 150, "label": "years = 800 / 365\n= 2", "tone": "amber", "filled": true, "size": 12 },
    { "id": "r", "x": 250, "y": 115, "w": 150, "label": "days = 800 % 365\n= 70", "tone": "neutral", "filled": true, "size": 12 },
    { "id": "w", "x": 470, "y": 70, "w": 150, "label": "weeks = 70 / 7\n= 10", "tone": "sky", "filled": true, "size": 12 },
    { "id": "dd", "x": 470, "y": 155, "w": 150, "label": "days = 70 % 7\n= 0", "tone": "emerald", "filled": true, "size": 12 },
    { "id": "o", "x": 650, "y": 110, "w": 120, "label": "2 ans\n10 semaines\n0 jour", "tone": "violet", "filled": true, "bold": true }
  ],
  "edges": [
    { "from": "d", "to": "y", "label": "/ 365" }, { "from": "d", "to": "r", "label": "% 365" },
    { "from": "r", "to": "w", "label": "/ 7" }, { "from": "r", "to": "dd", "label": "% 7" },
    { "from": "w", "to": "o" }, { "from": "dd", "to": "o" }
  ]
}
```

```c
years = days / 365;      days = days % 365;
weeks = days / 7;        days = days % 7;
```

> L'ordre compte : il faut **réutiliser le reste** (`days % 365`) pour
> calculer les semaines, sinon on recompte les années.

## 3. Q2 & Q3 — chiffres de la partie entière d'un réel

```flowchart
{
  "title": "On convertit d'abord le réel en entier avec un cast (troncature), puis on applique % 10.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "START" },
    { "id": "in", "kind": "io", "label": "READ value  (ex. 1234.567)" },
    { "id": "c", "kind": "process", "label": "integral = (int) value  → 1234" },
    { "id": "u", "kind": "process", "label": "units = integral % 10  → 4" },
    { "id": "t", "kind": "process", "label": "tens = (integral % 100) / 10  → 3" },
    { "id": "o", "kind": "io", "label": "DISPLAY tens, units  → 3 4" },
    { "id": "e", "kind": "end", "label": "END" }
  ],
  "edges": [
    { "from": "s", "to": "in" }, { "from": "in", "to": "c" }, { "from": "c", "to": "u" },
    { "from": "u", "to": "t" }, { "from": "t", "to": "o" }, { "from": "o", "to": "e" }
  ]
}
```

- `%` est **interdit sur un `float`** : `value % 10` ne compile pas → il faut
  le cast `(int)`.
- Nombre **négatif** : `-1234 % 10` vaut **−4** (signe du dividende) ; on
  prend la valeur absolue si on veut le chiffre.
- Q3 en une seule expression : `integral % 100` → **34**.

## 4. Q4 — afficher un nombre à 4 chiffres « en escalier »

Pour 7395 :

```
7395      ← n
395       ← n % 1000
95        ← n % 100
5         ← n % 10
```

```c
printf("%d\n%d\n%d\n%d\n", n, n % 1000, n % 100, n % 10);
```

> Piège : avec n = 7005, `n % 1000` vaut **5** (pas « 005 »). Pour garder
> les zéros, afficher avec `%03d`, `%02d` : `printf("%03d", n % 1000)` →
> `005`.

## 5. Q5 — somme des chiffres

```c
sum = n / 1000 + (n / 100) % 10 + (n / 10) % 10 + n % 10;
/* 7395 → 7 + 3 + 9 + 5 = 24 */
```

## 6. Q6 — somme, moyenne, plus grand, plus petit

```c
float sum = a + b + c;
float average = sum / 3.0;
float largest  = (a > b) ? ((a > c) ? a : c) : ((b > c) ? b : c);
float smallest = (a < b) ? ((a < c) ? a : c) : ((b < c) ? b : c);
```

```diagram
{
  "title": "Le ?: imbriqué du plus grand de trois, avec a = 4, b = 9, c = 7.",
  "nodes": [
    { "id": "r", "x": 300, "y": 30, "w": 120, "label": "a > b ?\n4 > 9 : faux", "tone": "violet", "filled": true, "size": 12 },
    { "id": "l", "x": 140, "y": 120, "w": 140, "label": "a > c ? a : c", "tone": "neutral", "size": 12 },
    { "id": "rr", "x": 460, "y": 120, "w": 140, "label": "b > c ?\n9 > 7 : vrai", "tone": "sky", "filled": true, "size": 12 },
    { "id": "b", "x": 400, "y": 210, "w": 80, "label": "b = 9", "tone": "emerald", "filled": true, "bold": true },
    { "id": "c", "x": 520, "y": 210, "w": 80, "label": "c", "tone": "neutral" }
  ],
  "edges": [
    { "from": "r", "to": "l", "label": "vrai", "dashed": true }, { "from": "r", "to": "rr", "label": "faux", "bold": true },
    { "from": "rr", "to": "b", "label": "vrai", "bold": true }, { "from": "rr", "to": "c", "label": "faux", "dashed": true }
  ]
}
```

> `sum / 3.0` (et pas `/ 3`) : si `sum` était un `int`, `/ 3` tronquerait la
> moyenne.

---

## 7. Fiche de révision midterm (W1 → W6)

| Semaine | Thème | Ce qui tombe |
|---|---|---|
| **W1** | problem solving, algorithmes, flowcharts | symboles (terminal, I/O parallélogramme, process rectangle, decision losange), compilation → `a.out` |
| **W2** | overview of C, character set, tokens, constants | structure en 6 sections, 1 seul `main`, identifiers valides, octal `0…` / hexa `0x…`, `'5'` vs `5` vs `"5"`, escape sequences |
| **W3** | data types, storage classes, `scanf`, `#define` | tailles (`int` 32 bits, `float` 32 / 6 chiffres, `double` 64 / 14), littéral réel = `double`, `auto` / `static` / `extern` / `register`, `#define` sans `=` ni `;`, 3 types d'erreurs |
| **W4** | operators & expressions | `14/4 = 3`, `14%4 = 2`, `++m` vs `m++`, precedence (`* / %` avant `+ -`), cast `(float)`, conversion hierarchy, `<math.h>` |
| **W5** | I/O formatée, `if` | `getchar` + `\n`, `%2d`, `%*d`, `%[^\n]`, `printf` `%7.2f` / `%-6d` / `%.5s`, `if…else`, dangling else, else if ladder, leap year |
| **W6** | `switch`, `?:`, `goto` | case constants et uniques, `break` / fall through, `default`, `?:`, GCD, `goto label;` |

### Les 12 réflexes du midterm

1. `int / int` **tronque** ; un seul opérande réel suffit pour une division
   réelle.
2. `%` **seulement** entre entiers ; signe = signe du **dividende**.
3. `++x` : incrémente **puis** utilise ; `x++` : utilise **puis** incrémente.
4. `* / %` avant `+ -`, **gauche → droite** ; assignment et `?:` **droite →
   gauche**.
5. Littéral entier → `int` ; littéral réel → `double`.
6. `scanf` : `&`, pas de texte, `%lf` pour `double`, renvoie un **compte**.
7. `printf` : largeur = **minimum** ; précision = décimales (`f`) ou
   caractères (`s`).
8. `static` local garde sa valeur ; `auto` = garbage ; `static`/`extern` = 0.
9. `else` → `if` le plus proche ; pas de `;` après `if (…)`.
10. `switch` : expression **entière**, `case` **constants**, penser au
    `break`.
11. `==` compare, `=` affecte ; ne jamais comparer deux `float` avec `==`.
12. Erreur de **syntaxe** (compilation) / **run-time** (÷ 0) / **logique**
    (aucun message).
