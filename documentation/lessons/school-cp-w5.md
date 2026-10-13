# Computer Programming — Week 5 · Input / Output & Decision Making (if)

**Cours** : Chapter 5, *Managing Input and Output Operations* (slides 5_1) :
`getchar` / `putchar`, les **character test functions** de `<ctype.h>`, la
lecture formatée avec **`scanf`** et l'affichage formaté avec **`printf`**
(largeur, précision, flags). Puis Chapter 6 (1re partie), *Decision Making and
Branching* (slides 5_2) : **simple if**, **if…else**, **nested if…else**,
**else if ladder**, De Morgan et le **dangling else**.

> **En bref.** `getchar()` lit **un** caractère (y compris le `\n` qui reste
> dans le buffer !). Dans `scanf`, `%wd` lit **au plus w chiffres** et
> `%*d` **saute** un champ ; `scanf` renvoie le **nombre d'items lus**. Dans
> `printf`, `%wd` = largeur **minimale** (jamais de troncature d'un nombre),
> `-` aligne à gauche, `0` remplit de zéros, `%w.pf` = p décimales,
> `%w.ps` = les **p premiers caractères**. Pour décider : `if`, `if…else`,
> `if` imbriqués, ou une **else if ladder** ; un `else` s'associe **toujours
> au `if` sans `else` le plus proche**.

---

## 1. Lire et écrire un caractère

```c
char answer;
answer = getchar();          /* lit UN caractère sur stdin */
putchar(answer);             /* écrit UN caractère sur stdout */
putchar('\n');
```

Fig. 5.1 : `if (answer == 'Y' || answer == 'y')` → « My name is BUSY BEE »,
sinon « You are good for nothing ».

> **WARNING :** `getchar()` accepte **n'importe quel caractère**, y compris
> **RETURN** et **TAB**. Quand on tape `Y⏎`, le `\n` **reste dans la file
> d'entrée** et sera lu par le `getchar()` suivant. Solution : un **dummy
> `getchar()`** pour « manger » le `\n`, ou `fflush`.

```diagram
{
  "title": "Le \\n laissé dans le buffer : le 2e getchar() le lit au lieu d'attendre l'utilisateur.",
  "nodes": [
    { "id": "buf", "x": 200, "y": 40, "shape": "table", "size": 13, "label": "input queue après la frappe « Y⏎ »", "header": false, "rows": [["'Y'","'\\n'"]], "cols": [60,60] },
    { "id": "g1", "x": 80, "y": 140, "w": 170, "label": "1er getchar() → 'Y'", "tone": "emerald", "filled": true, "size": 12 },
    { "id": "g2", "x": 320, "y": 140, "w": 190, "label": "2e getchar() → '\\n'  (!)", "tone": "rose", "filled": true, "size": 12 }
  ],
  "edges": [
    { "from": "buf", "to": "g1" }, { "from": "buf", "to": "g2" }
  ]
}
```

### Character test functions (`<ctype.h>`)

| Fonction | Teste si c est… |
|---|---|
| `isalnum(c)` | **alphanumérique** (lettre ou chiffre) |
| `isalpha(c)` | une **lettre** |
| `isdigit(c)` | un **chiffre** |
| `islower(c)` | une **minuscule** |
| `isupper(c)` | une **majuscule** |
| `isprint(c)` | **imprimable** |
| `ispunct(c)` | un **signe de ponctuation** |
| `isspace(c)` | un **white space** |

Elles renvoient **non-zéro (true)** ou **0**. Conversions : `toupper(c)`,
`tolower(c)`.

Fig. 5.3 — inverser la casse :

```c
alphabet = getchar();
if (islower(alphabet))
    putchar(toupper(alphabet));   /* a → A */
else
    putchar(tolower(alphabet));   /* Z → z */
```

## 2. Formatted input : `scanf`

`scanf("control string", arg1, arg2, …, argn);`

- Le **control string** contient des **field specifications** (`%`, une
  **largeur** optionnelle, un **type specifier**) et éventuellement des
  blancs/tabs/newlines.
- Les **arguments** sont des **adresses** (`&a`).

### Lire des entiers : `%wd`

```c
scanf("%2d %5d", &num1, &num2);
```

```diagram
{
  "title": "La largeur w limite le nombre de caractères lus. Le reste est lu par le champ suivant.",
  "nodes": [
    { "id": "t", "x": 320, "y": 30, "shape": "table", "size": 12, "label": "scanf(\"%2d %5d\", &num1, &num2)", "rows": [["Entrée tapée","num1","num2","Commentaire"],["50 31426","50","31426","OK"],["31426 50","31","426","%2d coupe : 50 reste dans le buffer"]], "mark": [2], "cols": [110,60,60,260] }
  ],
  "edges": []
}
```

- Solution : **ne pas mettre de largeur** (`"%d %d"`).
- **`%*d`** : le champ est **lu puis ignoré** (skipped).

```c
scanf("%d %*d %d", &a, &b);   /* entrée : 123 456 789 → a = 123, 456 sauté, b = 789 */
```

- Si on tape un **réel** pour un `%d`, la partie décimale peut être perdue et
  `scanf` peut **arrêter** de lire.

### Lire des réels : `%f`, `%lf`

- **Pas de largeur** pour les réels : `%f` lit les deux notations (décimale et
  exponentielle).
- **`%lf`** pour un **`double`** (`%Lf` pour long double).

```c
scanf("%f %f", &x, &y);       /* 12.3456 17.5e-2 → x = 12.345600, y = 0.175000 */
scanf("%lf %lf", &p, &q);
```

### Lire des strings : `%ws`, `%wc`, `%[…]`

| Spécification | Lit… |
|---|---|
| `%s` | un **mot** : s'arrête au **premier blanc** (« New York » → `New`) |
| `%ws` | au plus **w** caractères d'un mot |
| `%wc` | exactement **w** caractères, **blancs compris** |
| `%[characters]` | uniquement les caractères **listés** ; s'arrête au premier autre |
| `%[^characters]` | **l'inverse** : tout **sauf** les caractères listés |

```c
scanf("%[a-z]", address);     /* "new delhi 110002" → "new" (s'arrête à l'espace) */
scanf("%[^\n]", address);     /* lit toute la ligne jusqu'au ⏎ : "New Delhi 110 002" */
```

### Mixed data et détection d'erreurs

```c
scanf("%d %c %f %s", &count, &code, &ratio, name);   /* 15 P 1.575 coffee : OK */
```

Si un item ne correspond pas au type attendu, `scanf` **s'arrête** et
**renvoie le nombre d'items lus avec succès** :

```c
scanf("%d %f %s", &a, &b, name);
/* "20 150.25 motor" → renvoie 3
   "20 motor 150.25" → renvoie 1 (motor n'est pas un float) */
```

```flowchart
{
  "title": "Fig. 5.8 : tester la valeur de retour de scanf pour détecter une entrée invalide.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "START" },
    { "id": "r", "kind": "io", "label": "n = scanf(\"%d %f %c\", &a, &b, &c)" },
    { "id": "d", "kind": "decision", "label": "n == 3 ?" },
    { "id": "ok", "kind": "io", "label": "DISPLAY a, b, c" },
    { "id": "ko", "kind": "io", "label": "\"Error in input.\"" },
    { "id": "e", "kind": "end", "label": "END" }
  ],
  "edges": [
    { "from": "s", "to": "r" }, { "from": "r", "to": "d" },
    { "from": "d", "to": "ok", "branch": "yes" }, { "from": "d", "to": "ko", "branch": "no" },
    { "from": "ok", "to": "e" }, { "from": "ko", "to": "e" }
  ]
}
```

> Dans Fig. 5.8, l'entrée `15.75 23 X` donne **a = 15, b = 0.75, c = '2'** :
> `%d` s'arrête au point, `%f` lit `.75`, `%c` lit le `2`. `scanf` renvoie
> bien 3, mais les valeurs ne sont pas celles voulues.

### Format codes de `scanf` (Table 5.2)

| Code | Lit | Code | Lit |
|---|---|---|---|
| `%c` | un caractère | `%o` | un entier **octal** |
| `%d` | un entier décimal | `%s` | une string |
| `%e`, `%f`, `%g` | un réel | `%u` | un entier **unsigned** |
| `%h` | un **short** integer | `%x` | un entier **hexadécimal** |
| `%i` | un entier décimal, hexa ou octal | `%[..]` | une string de mot(s) |

Préfixes : **`h`** short, **`l`** long ou double, **`L`** long double.

### Règles de `scanf`

1. Tous les arguments sauf le control string sont des **pointeurs** (`&`).
2. Les spécifications sont dans le **même ordre** que les arguments.
3. Les données tapées sont séparées par des **espaces** et dans le même ordre.
4. La lecture s'arrête à un **mismatch** ou à un caractère invalide.
5. `scanf` **ignore les fins de ligne** quand il cherche une valeur.
6. Les données **non lues** d'une ligne servent au **`scanf` suivant**.
7. Une largeur w doit être **assez grande** pour la donnée.
8. Tout caractère **non-blanc** du format doit être **tapé tel quel**.
9. **Ne jamais finir le format par un blanc**, ni mettre de **virgules** ou
   de **précision** (`%5.2f` interdit en entrée).

## 3. Formatted output : `printf`

`printf("control string", arg1, …, argn);` — le control string contient :
**(1)** des caractères affichés tels quels, **(2)** des **format
specifications**, **(3)** des **escape sequences** (`\n`, `\t`, `\b`).

### Entiers : `%wd`

`w` = largeur **minimale** ; si le nombre est plus long, il est affiché **en
entier**.

```diagram
{
  "title": "printf d'un entier (Fig. 5.9) : chaque case = une colonne. · = espace.",
  "nodes": [
    { "id": "t", "x": 300, "y": 30, "shape": "table", "size": 12, "label": "valeur 9876", "rows": [["Format","Sortie","Règle"],["%d","9876","largeur naturelle"],["%6d","··9876","aligné à DROITE sur 6"],["%2d","9876","w trop petit : affiché en entier"],["%-6d","9876··","- : aligné à GAUCHE"],["%06d","009876","0 : zéros devant"]], "cols": [80,100,230] }
  ],
  "edges": []
}
```

Fig. 5.9 avec m = 12345, n = 987654 : `%10d` → `·····12345`, `%010d` →
`0000012345`, `%-10d` → `12345·····`, `%10ld` → `····987654`.

### Réels : `%w.pf` et `%w.pe`

`w` = largeur **minimale totale** (point et signe compris), `p` = chiffres
**après la virgule** (6 par défaut). `%e` = notation exponentielle
`[-]m.nnnnnne[±]xx`.

```diagram
{
  "title": "Fig. 5.10 avec y = 98.7654 (float). La valeur est ARRONDIE à p décimales.",
  "nodes": [
    { "id": "t", "x": 300, "y": 30, "shape": "table", "size": 12, "label": "float y = 98.7654", "rows": [["Format","Sortie","Remarque"],["%7.4f","98.7654","7 colonnes, 4 décimales"],["%f","98.765404","6 décimales par défaut (float imprécis)"],["%7.2f","··98.77","arrondi à 2 décimales"],["%-7.2f","98.77··","aligné à gauche"],["%07.2f","0098.77","zéros devant"],["%*.*f, 7, 2","··98.77","largeur et précision à l'exécution"],["%10.2e","··9.88e+01","exponentiel, 2 décimales"],["%12.4e (−y)","·-9.8765e+01","signe compris dans la largeur"],["%e","9.876540e+01","6 décimales"]], "cols": [100,120,250] }
  ],
  "edges": []
}
```

`printf("%*.*f", width, precision, number);` : la largeur et la précision
sont fournies **au moment de l'exécution** (format **dynamique**).

### Caractères et strings : `%wc`, `%w.ps`

- `%wc` : le caractère est **aligné à droite** dans w colonnes (`%-wc` à
  gauche).
- `%w.ps` : w = largeur, **p = nombre de caractères affichés** (les p
  premiers). Aligné **à droite** par défaut.

```diagram
{
  "title": "Fig. 5.11 sur la string \"NEW DELHI 110001\" (16 caractères). · = espace.",
  "nodes": [
    { "id": "t", "x": 300, "y": 30, "shape": "table", "size": 12, "label": "char name[] = \"NEW DELHI 110001\"", "rows": [["Format","Sortie","Règle"],["%s","NEW DELHI 110001","toute la string"],["%20s","····NEW DELHI 110001","20 colonnes, à droite"],["%20.10s","··········NEW DELHI·","10 premiers car., à droite sur 20"],["%.5s","NEW D","5 premiers caractères"],["%-20.10s","NEW DELHI···········","10 premiers, à gauche sur 20"],["%5s","NEW DELHI 110001","w trop petit : tout est affiché"]], "cols": [90,200,230] }
  ],
  "edges": []
}
```

### Format codes et flags de `printf` (Tables 5.3 et 5.4)

| Code | Affiche | Code | Affiche |
|---|---|---|---|
| `%c` | un caractère | `%i` | un entier signé |
| `%d` | un entier décimal | `%o` | octal **sans** `0` devant |
| `%e` | réel en **exponentiel** | `%s` | une string |
| `%f` | réel **sans** exposant | `%u` | unsigned |
| `%g` | `%e` ou `%f`, **le plus court** | `%x` | hexa **sans** `0x` |

| Flag | Effet |
|---|---|
| `-` | **aligné à gauche** dans le champ |
| `+` | un **signe** `+` ou `−` devant tout nombre signé |
| `0` | **zéros** devant |
| `#` (avec `o` / `x`) | préfixe `0` / `0x` |
| `#` (avec `e`, `f`, `g`) | force le **point décimal** ; avec `g`, garde les zéros de fin |

### Les erreurs classiques d'I/O (Always remember)

- Inclure **`<stdio.h>`** (et **`<ctype.h>`** pour les fonctions de
  caractères).
- **`&`** devant les variables de base dans `scanf`, mais **jamais** dans
  `printf` (sinon on affiche une adresse : erreur).
- **Guillemets doubles** pour les strings et les formats, **apostrophes** pour
  un caractère.
- Mauvais code de conversion pour le type → **résultat faux / erreur à
  l'exécution**.
- Ne pas oublier la **virgule** après le format.

## 4. Decision making : les 4 formes de `if`

C dispose de **4 instructions de décision** : `if`, `switch`, le
**conditional operator** `?:` et `goto` (W6 pour les trois dernières).

```diagram
{
  "title": "Les quatre formes de if.",
  "nodes": [
    { "id": "a", "x": 90, "y": 40, "w": 150, "h": 70, "label": "Simple if\nun bloc exécuté\nou sauté", "tone": "sky", "filled": true, "size": 12 },
    { "id": "b", "x": 260, "y": 40, "w": 150, "h": 70, "label": "if…else\ndeux chemins\n(true / false)", "tone": "amber", "filled": true, "size": 12 },
    { "id": "c", "x": 430, "y": 40, "w": 150, "h": 70, "label": "Nested if…else\nun if dans\nun if", "tone": "violet", "filled": true, "size": 12 },
    { "id": "d", "x": 600, "y": 40, "w": 150, "h": 70, "label": "else if ladder\nn conditions\n+ un default", "tone": "emerald", "filled": true, "size": 12 }
  ],
  "edges": []
}
```

### Simple if

```c
if (test expression)
{
    statement-block;
}
statement-x;
```

Si le test est **vrai**, le bloc est exécuté ; sinon il est **sauté** et on
passe à `statement-x`.

```flowchart
{
  "title": "Simple if : le bloc est exécuté seulement si le test est vrai, puis on continue dans tous les cas.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "Entry" },
    { "id": "d", "kind": "decision", "label": "test expression ?" },
    { "id": "b", "kind": "process", "label": "statement-block" },
    { "id": "x", "kind": "process", "label": "statement-x" },
    { "id": "e", "kind": "end", "label": "Next statement" }
  ],
  "edges": [
    { "from": "s", "to": "d" },
    { "from": "d", "to": "b", "branch": "yes" }, { "from": "d", "to": "x", "branch": "no" },
    { "from": "b", "to": "x" }, { "from": "x", "to": "e" }
  ]
}
```

Fig. 6.3 — ratio (a+b)/(c−d) seulement si c − d ≠ 0 :

```c
if (c - d != 0) {
    ratio = (float)(a + b) / (float)(c - d);
    printf("Ratio = %f\n", ratio);
}
/* 12 23 34 45 → Ratio = -3.181818 ; 12 23 34 34 → rien n'est affiché */
```

Fig. 6.4 — compter les garçons avec `weight < 50 && height > 170` (10 saisies
→ **count = 3**).

### De Morgan's rule

On préfère une **logique positive**. Pour enlever un `!` devant une expression
composée : appliquer le NOT à **chaque** composant **et** inverser `&&` ↔ `||`
(et les relational operators par leur complément).

| Avant | Après |
|---|---|
| `x` | devient `!x` |
| `!x` | devient `x` |
| `&&` | devient `\|\|` |
| `\|\|` | devient `&&` |
| `!(x && y \|\| !z)` | `!x \|\| !y && z` |
| `!(x <= 0 \|\| !condition)` | `x > 0 && condition` |

### if…else

```c
if (test expression)
{
    true-block statement(s);
}
else
{
    false-block statement(s);
}
statement-x;
```

```flowchart
{
  "title": "if…else : exactement UN des deux blocs est exécuté.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "Entry" },
    { "id": "d", "kind": "decision", "label": "test expression ?" },
    { "id": "t", "kind": "process", "label": "True-block" },
    { "id": "f", "kind": "process", "label": "False-block" },
    { "id": "x", "kind": "process", "label": "statement-x" },
    { "id": "e", "kind": "end", "label": "END" }
  ],
  "edges": [
    { "from": "s", "to": "d" },
    { "from": "d", "to": "t", "branch": "yes" }, { "from": "d", "to": "f", "branch": "no" },
    { "from": "t", "to": "x" }, { "from": "f", "to": "x" }, { "from": "x", "to": "e" }
  ]
}
```

Fig. 6.6 — série de eˣ = 1 + x + x²/2! + x³/3! + … : chaque terme se calcule à
partir du précédent, **Tₙ = Tₙ₋₁ · x / n**. On s'arrête (`n = 999`) quand
`term < ACCURACY` (0.0001), sinon `n = n + 1`. x = 1 → **9 termes, sum =
2.718279** (≈ e).

### Nested if…else

```c
if (test condition-1) {
    if (test condition-2)
        statement-1;
    else
        statement-2;
} else {
    statement-3;
}
statement-x;
```

Condition-1 fausse → statement-3. Sinon on teste condition-2 : vraie →
statement-1, fausse → statement-2.

**Dangling else** : quand il manque un `else`, **« an else is always paired
with the most recent unpaired if »** (dans le bloc courant).

```c
/* Ce qu'on a écrit (l'indentation suggère le 1er if) */
if (n > 0)
    if (a > b)
        z = a;
else
    z = b;

/* Ce que le compilateur comprend : le else va au if le plus proche */
if (n > 0) {
    if (a > b)
        z = a;
    else
        z = b;
}
```

Pour associer le `else` au **premier** `if`, il faut des **accolades** :
`if (n > 0) { if (a > b) z = a; } else z = b;`.

### else if ladder

```c
if (condition 1)
    statement-1;
else if (condition 2)
    statement-2;
else if (condition 3)
    statement-3;
...
else
    default-statement;
statement-x;
```

Dès qu'une condition est **vraie**, son instruction est exécutée et on saute
à `statement-x`. Si **toutes** sont fausses → **default-statement**.

## 5. Rules for indentation

- Indenter les instructions dépendantes d'**au moins 3 espaces**.
- **Aligner** chaque `else` avec son `if`.
- Accolades sur des **lignes séparées**, alignées entre elles.
- **Une seule** instruction ou clause par ligne ; commentaires de début / fin
  de bloc.

---

## 6. Exercices du TD, expliqués

### Exo 1 — lettre, chiffre ou autre (`<ctype.h>`)

```flowchart
{
  "title": "Fig. 5.2 : isalpha puis isdigit (des tests non-nuls = vrais).",
  "nodes": [
    { "id": "s", "kind": "start", "label": "START" },
    { "id": "in", "kind": "io", "label": "chr = getchar()" },
    { "id": "d1", "kind": "decision", "label": "isalpha(chr) ?" },
    { "id": "o1", "kind": "io", "label": "\"is an alphabet letter\"" },
    { "id": "d2", "kind": "decision", "label": "isdigit(chr) ?" },
    { "id": "o2", "kind": "io", "label": "\"is a digit\"" },
    { "id": "o3", "kind": "io", "label": "\"not a letter or digit\"" },
    { "id": "e", "kind": "end", "label": "END" }
  ],
  "edges": [
    { "from": "s", "to": "in" }, { "from": "in", "to": "d1" },
    { "from": "d1", "to": "o1", "branch": "yes" }, { "from": "d1", "to": "d2", "branch": "no" },
    { "from": "d2", "to": "o2", "branch": "yes" }, { "from": "d2", "to": "o3", "branch": "no" },
    { "from": "o1", "to": "e" }, { "from": "o2", "to": "e" }, { "from": "o3", "to": "e" }
  ]
}
```

> `isalpha()` renvoie un **non-zéro** (pas forcément 1) : on teste
> `if (isalpha(c))` ou `!= 0`, pas `== 1`.

### Exo 5 — année bissextile

Une année est **leap** si elle est **divisible par 4 mais pas par 100**, **ou**
**divisible par 400**.

```c
if ((n % 4 == 0 && n % 100 != 0) || (n % 400 == 0))
```

| Année | % 4 | % 100 | % 400 | Leap ? |
|---|---|---|---|---|
| 2024 | 0 | 24 | 424 | ✅ (÷ 4, pas ÷ 100) |
| 1900 | 0 | **0** | 300 | ❌ (÷ 100 mais pas ÷ 400) |
| 2000 | 0 | 0 | **0** | ✅ (÷ 400) |
| 2023 | 3 | 23 | 23 | ❌ |

### Exo 6 — le plus grand de trois (nested if, Fig. 6.8)

```c
if (a > b) {
    if (a > c) printf("%d", a);
    else       printf("%d", c);
} else {
    if (b > c) printf("%d", b);
    else       printf("%d", c);
}
```

### Exo 7 — facture d'électricité (else if ladder, Fig. 6.10)

```diagram
{
  "title": "Tarifs par tranche : on paie le forfait de la tranche + le tarif sur l'excédent.",
  "nodes": [
    { "id": "t", "x": 320, "y": 30, "shape": "table", "size": 12, "label": "Rate of charge", "rows": [["Units","Formule","150 → ","225 →","375 →","520 →","625 →"],["0 – 200","0.50 × units","75.00","","","",""],["201 – 400","100 + 0.65 × (units − 200)","","116.25","213.75","",""],["401 – 600","230 + 0.80 × (units − 400)","","","","326.00",""],["601 +","390 + 1.00 × (units − 600)","","","","","415.00"]], "cols": [80,200,60,60,60,60,60] }
  ],
  "edges": []
}
```

```flowchart
{
  "title": "La ladder : on teste les tranches dans l'ordre, la première vraie gagne.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "START", "x": 150, "y": 20 },
    { "id": "in", "kind": "io", "label": "READ custnum, units", "x": 150, "y": 90 },
    { "id": "d1", "kind": "decision", "label": "units <= 200 ?", "x": 150, "y": 175 },
    { "id": "c1", "kind": "process", "label": "0.5 × units", "x": 150, "y": 255 },
    { "id": "d2", "kind": "decision", "label": "units <= 400 ?", "x": 400, "y": 255 },
    { "id": "c2", "kind": "process", "label": "100 + 0.65 × (u − 200)", "x": 400, "y": 335 },
    { "id": "d3", "kind": "decision", "label": "units <= 600 ?", "x": 620, "y": 335 },
    { "id": "c3", "kind": "process", "label": "230 + 0.8 × (u − 400)", "x": 620, "y": 415 },
    { "id": "c4", "kind": "process", "label": "390 + (u − 600)", "x": 820, "y": 415 },
    { "id": "out", "kind": "io", "label": "DISPLAY charges", "x": 150, "y": 500 },
    { "id": "e", "kind": "end", "label": "END", "x": 150, "y": 575 }
  ],
  "edges": [
    { "from": "s", "to": "in" }, { "from": "in", "to": "d1" },
    { "from": "d1", "to": "c1", "branch": "yes" }, { "from": "d1", "to": "d2", "branch": "no" },
    { "from": "d2", "to": "c2", "branch": "yes" }, { "from": "d2", "to": "d3", "branch": "no" },
    { "from": "d3", "to": "c3", "branch": "yes" }, { "from": "d3", "to": "c4", "branch": "no" },
    { "from": "c1", "to": "out" }, { "from": "c2", "to": "out" }, { "from": "c3", "to": "out" }, { "from": "c4", "to": "out" },
    { "from": "out", "to": "e" }
  ]
}
```

> Les forfaits 100, 230, 390 sont le prix **cumulé** des tranches
> précédentes : 200 × 0.5 = 100 ; 100 + 200 × 0.65 = 230 ;
> 230 + 200 × 0.8 = 390.

### Exo 2 — les largeurs dans `scanf` (Fig. 5.4)

| Instruction | On tape | Résultat |
|---|---|---|
| `scanf("%d %*d %d", &a, &b, &c)` | `1 2 3` | a = 1, **2 sauté**, b = 3, **c non lu** (garbage) |
| `scanf("%2d %4d", &x, &y)` | `6789 4321` | x = **67**, y = **89** ; `4321` reste dans le buffer |
| `scanf("%d %d", &a, &x)` | `44 66` | a = **4321** (le reste précédent !), x = 44 |
| `scanf("%3d %4d %3d", &p, &q, &r)` | `123456789` | p = **66** (reste), q = **1234**, r = **567** ; `89` reste |
| `scanf("%d %d", &x, &y)` | `123 456` | x = **89** (reste), y = **123** |

> **Leçon :** les données non lues restent dans la file et faussent les
> lectures suivantes. Éviter les largeurs dans `scanf`.

### Exo 3 & 4 — `%[a-z]` et formats de strings

`scanf("%[a-z]", address)` s'arrête au premier caractère **hors** de `a-z` :
majuscule, chiffre… et aussi l'**espace**. La slide (Fig. 5.7) affiche
`new delhi`, mais avec gcc on obtient **`new`** : pour accepter les espaces il
faut `%[a-z ]`. Pour toute la ligne : **`%[^\n]`**.

---

## Pièges d'exam

- `getchar()` lit aussi le **`\n`** ; il faut le « manger ».
- `scanf` renvoie le **nombre d'items lus** ; `%*d` saute un champ ; `%2d`
  coupe `31426` en `31` + `426`.
- `%lf` pour lire un **double** ; **pas** de précision en entrée.
- `%s` s'arrête au premier **blanc** ; `%[^\n]` lit toute la ligne.
- `printf` : w est un **minimum** (`%2d` de 9876 → `9876`) ; `%.5s` = 5
  premiers caractères ; `%7.2f` de 98.7654 → `··98.77`.
- `&` dans un `printf` = **erreur** (adresse affichée).
- **Pas de `;`** après `if (…)` : `if (x > 0);` exécute un bloc vide.
- `else` ↔ **le `if` sans `else` le plus proche**.
- De Morgan : `!(a && b)` = `!a || !b`.
- Leap year : `(n%4==0 && n%100!=0) || n%400==0`.

## À retenir

- `getchar` / `putchar` ; `<ctype.h>` : `isalpha`, `isdigit`, `isalnum`,
  `islower`, `isupper`, `isspace`, `ispunct`, `isprint`, `toupper`,
  `tolower`.
- `scanf` : adresses, ordre, type ; `%wd`, `%*d`, `%f`/`%lf`, `%s`, `%wc`,
  `%[…]`, `%[^…]`.
- `printf` : `%wd`, `%w.pf`, `%w.pe`, `%wc`, `%w.ps` ; flags `- + 0 #`.
- `if`, `if…else`, nested `if`, `else if` ladder ; indentation et accolades.
