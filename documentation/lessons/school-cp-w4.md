# Computer Programming — Week 4 · Operators and Expressions

**Cours** : Chapter 4, *Operators and Expressions* (slides 4_1 et 4_2) : les
**8 catégories d'opérateurs**, l'**integer / real / mixed-mode arithmetic**,
`++` / `--` en **prefix** et **postfix**, les **shorthand assignments**
(`+=`…), le **conditional operator** `?:`, les **bitwise**, **comma** et
**sizeof** operators, l'**évaluation** d'une expression (**precedence** et
**associativity**), les **type conversions** (implicit / explicit cast) et les
**math functions**.

> **En bref.** `/` entre deux `int` **tronque** (14/4 = 3) et `%` donne le
> **reste** (14 % 4 = 2, signe du **dividende**). `++m` incrémente **puis**
> utilise ; `m++` utilise **puis** incrémente. Dans une expression sans
> parenthèses, `* / %` passent **avant** `+ -`, de gauche à droite. Dans une
> expression mixte, le type « **lower** » est converti vers le « **higher** »
> (`int` → `float` → `double`). Un **cast** `(float) a / b` évite la division
> entière. Au quiz : savoir **dérouler** une expression pas à pas.

---

## 1. Les catégories d'opérateurs

```diagram
{
  "title": "Les 8 catégories d'opérateurs du C.",
  "nodes": [
    { "id": "t", "x": 300, "y": 30, "shape": "table", "size": 12, "label": "C operators", "rows": [["Catégorie","Opérateurs","Exemple"],["Arithmetic","+  -  *  /  %","a % b"],["Relational","<  <=  >  >=  ==  !=","a <= b"],["Logical","&&  ||  !","a > 0 && b > 0"],["Assignment","=  +=  -=  *=  /=  %=","x += 2"],["Increment / decrement","++  --","++m, m--"],["Conditional","? :","x = (a > b) ? a : b"],["Bitwise","&  |  ^  <<  >>  ~","a << 2"],["Special","  ,   sizeof   &   *   .   ->","sizeof(int)"]], "mark": [1,2,3,4], "cols": [170,190,170] }
  ],
  "edges": []
}
```

**Key concepts** : un **operator** est un symbole qui réalise une opération
mathématique ou logique ; une **expression** est une combinaison d'**operands**
et d'operators qui se **réduit à une seule valeur**.

## 2. Arithmetic operators

| Opérateur | Sens |
|---|---|
| `+` | addition ou **unary plus** |
| `-` | soustraction ou **unary minus** |
| `*` | multiplication |
| `/` | division |
| `%` | **modulo** (reste de la division) — **uniquement entre entiers** |

### Integer arithmetic (les deux opérandes sont entiers)

Avec **a = 14, b = 4** :

| Expression | Résultat | Remarque |
|---|---|---|
| `a - b` | 10 | |
| `a + b` | 18 | |
| `a * b` | 56 | |
| `a / b` | **3** | partie décimale **tronquée** |
| `a % b` | **2** | reste |

- Division entière : si les deux opérandes ont le **même signe**, on tronque
  **vers zéro** : `6/7 = 0`, `-6/-7 = 0`. Mais `-6/7` vaut 0 **ou** −1 :
  **machine dependent**.
- Modulo : le signe du résultat est **toujours celui du premier opérande**
  (le dividende) : `-14 % 3 = -2`, `-14 % -3 = -2`, `14 % -3 = 2`.

### Real et mixed-mode arithmetic

| Mode | Exemple | Résultat |
|---|---|---|
| **Real** (deux réels) | `6.0 / 7.0` | 0.857143 |
| | `-2.0 / 3.0` | −0.666667 |
| **Mixed-mode** (un réel + un entier) | `15 / 10.0` | **1.5** |
| **Integer** (deux entiers) | `15 / 10` | **1** |

> Dès qu'**un** opérande est réel, le calcul est réel.

### Worked-out problem 4.1 : jours → mois et jours

```c
months = days / 30;      /* quotient : nombre de mois entiers */
days   = days % 30;      /* reste    : jours restants          */
```

| Entrée | `days / 30` | `days % 30` | Sortie |
|---|---|---|---|
| 265 | 8 | 25 | Months = 8 Days = 25 |
| 364 | 12 | 4 | Months = 12 Days = 4 |
| 45 | 1 | 15 | Months = 1 Days = 15 |

## 3. Relational operators

| `<` | `<=` | `>` | `>=` | `==` | `!=` |
|---|---|---|---|---|---|
| less than | less or equal | greater than | greater or equal | **equal to** | not equal to |

`ae-1 relational-operator ae-2` : le résultat vaut **1 (true)** ou **0
(false)**. Les **arithmetic operators ont priorité** sur les relational.

| Expression | Valeur |
|---|---|
| `4.5 <= 10` | TRUE |
| `4.5 < -10` | FALSE |
| `-35 >= 0` | FALSE |
| `10 < 7+5` | TRUE (7+5 calculé d'abord) |
| `a+b == c+d` | TRUE si les deux sommes sont égales |

**Complements** : chaque opérateur est le complément d'un autre, on simplifie
un `!` ainsi :

| `>` ↔ `<=` | `<` ↔ `>=` | `==` ↔ `!=` |
|---|---|---|

| Avec `!` | Simplifié |
|---|---|
| `!(x < y)` | `x >= y` |
| `!(x > y)` | `x <= y` |
| `!(x != y)` | `x == y` |
| `!(x <= y)` | `x > y` |
| `!(x >= y)` | `x < y` |
| `!(x == y)` | `x != y` |

## 4. Logical operators

`&&` (AND), `||` (OR), `!` (NOT) : pour tester **plusieurs conditions**.

| op-1 | op-2 | `op-1 && op-2` | `op-1 \|\| op-2` |
|---|---|---|---|
| non-zero | non-zero | **1** | 1 |
| non-zero | 0 | 0 | **1** |
| 0 | non-zero | 0 | **1** |
| 0 | 0 | 0 | **0** |

```c
if (age > 55 && salary < 1000)
if (number < 0 || number > 100)
```

Précédence relative : **`!`** (plus haut) → **`> >= < <=`** → **`== !=`** →
**`&&`** → **`||`** (plus bas).

Worked-out problem 4.5 : `a = 5 <= 8 && 6 != 5;` → `5 <= 8` vaut 1,
`6 != 5` vaut 1, `1 && 1` = **1**.

## 5. Assignment operators (shorthand)

`v op= exp;` équivaut à `v = v op (exp);` (**v évalué une seule fois**).

| Simple assignment | Shorthand |
|---|---|
| `a = a + 1` | `a += 1` |
| `a = a - 1` | `a -= 1` |
| `a = a * (n + 1)` | `a *= n + 1` |
| `a = a / (n + 1)` | `a /= n + 1` |
| `a = a % b` | `a %= b` |

> **Piège :** `x += y + 1;` vaut `x = x + (y + 1);` et `a *= n + 1` vaut
> `a = a * (n + 1)`, **pas** `a * n + 1`.

Worked-out problem 4.2 (carrés successifs) :

```c
#define N 100
#define A 2
a = A;
while (a < N) {
    printf("%d\n", a);
    a *= a;          /* a = a * a */
}
/* sortie : 2  4  16   (256 n'est plus < 100) */
```

## 6. Increment et decrement : prefix vs postfix

`++m` / `m++` ≡ `m = m + 1` ; `--m` / `m--` ≡ `m = m - 1`. **Identiques
seuls**, **différents dans une expression**.

```diagram
{
  "title": "Prefix : on incrémente d'abord. Postfix : on utilise l'ancienne valeur d'abord. Départ m = 5.",
  "nodes": [
    { "id": "h1", "x": 150, "y": 20, "shape": "text", "label": "y = ++m;  (prefix)", "bold": true },
    { "id": "a1", "x": 60, "y": 80, "w": 110, "label": "① m = m + 1\nm = 6", "tone": "amber", "filled": true, "size": 12 },
    { "id": "a2", "x": 240, "y": 80, "w": 110, "label": "② y = m\ny = 6", "tone": "sky", "filled": true, "size": 12 },
    { "id": "r1", "x": 150, "y": 150, "w": 150, "label": "y = 6, m = 6", "tone": "emerald", "filled": true, "bold": true },
    { "id": "h2", "x": 480, "y": 20, "shape": "text", "label": "y = m++;  (postfix)", "bold": true },
    { "id": "b1", "x": 390, "y": 80, "w": 110, "label": "① y = m\ny = 5", "tone": "sky", "filled": true, "size": 12 },
    { "id": "b2", "x": 570, "y": 80, "w": 110, "label": "② m = m + 1\nm = 6", "tone": "amber", "filled": true, "size": 12 },
    { "id": "r2", "x": 480, "y": 150, "w": 150, "label": "y = 5, m = 6", "tone": "emerald", "filled": true, "bold": true }
  ],
  "edges": [
    { "from": "a1", "to": "a2" }, { "from": "b1", "to": "b2" }
  ]
}
```

**Règles** :

- `++` et `--` sont **unary** et exigent une **variable** comme opérande
  (`++5` ou `(a+b)++` sont illégaux).
- Leur **precedence et associativity** sont celles du unary `+` et unary `-`
  (rang 2, **right to left**).
- **Ne pas** les utiliser sur des **floating point** variables (conseil des
  slides).

### Worked-out problem 4.3

```c
a = 15; b = 10;
c = ++a - b;     /* a = 16, c = 16 - 10 = 6            */
d = b++ + a;     /* d = 10 + 16 = 26, puis b = 11       */
a/b              /* 16 / 11 = 1                          */
a%b              /* 16 % 11 = 5                          */
a *= b           /* a = 16 * 11 = 176                    */
(c > d) ? 1 : 0  /* 6 > 26 faux → 0                      */
(c < d) ? 1 : 0  /* → 1                                  */
```

## 7. Conditional operator `?:` (ternary)

`exp1 ? exp2 : exp3` : on évalue **exp1** ; si **non nulle (true)**, la valeur
est **exp2**, sinon **exp3**.

```c
a = 10; b = 15;
x = (a > b) ? a : b;       /* x = 15 */

/* équivalent */
if (a > b)
    x = a;
else
    x = b;
```

## 8. Bitwise operators

Manipulent les données **au niveau du bit** ; **interdits sur `float` et
`double`**.

| `&` | `\|` | `^` | `<<` | `>>` | `~` |
|---|---|---|---|---|---|
| bitwise AND | bitwise OR | bitwise **exclusive OR** | shift left | shift right | one's complement |

Exemple : `12 & 10` → `1100 & 1010 = 1000` = 8 ; `12 | 10` = 14 ;
`12 ^ 10` = 6 ; `3 << 2` = 12.

## 9. Special operators : comma et sizeof

**Comma operator** : évalue **de gauche à droite** et prend la valeur de
l'expression **la plus à droite**. C'est l'opérateur de **plus basse
précédence**, d'où les parenthèses :

```c
value = (x = 10, y = 5, x + y);              /* x = 10, y = 5, value = 15 */
for (n = 1, m = 10; n <= m; n++, m++)        /* dans un for */
while (c = getchar(), c != '10')             /* dans un while */
t = x, x = y, y = t;                         /* échange de valeurs */
```

**`sizeof`** : opérateur **compile time** qui renvoie le **nombre d'octets**
occupés par l'opérande.

```c
m = sizeof(sum);
n = sizeof(long int);
k = sizeof(235L);
```

Usage : connaître la taille des **arrays** et **structures**, et **allouer de
la mémoire dynamiquement**.

## 10. Évaluer une expression

`variable = expression;` : l'expression est **évaluée d'abord**, puis le
résultat **remplace** l'ancienne valeur. Toutes les variables doivent avoir
une valeur **avant**.

| Algébrique | En C |
|---|---|
| a × b − c | `a * b - c` |
| (m + n)(x + y) | `(m + n) * (x + y)` |
| ab / c | `a * b / c` |
| 3x² + 2x + 1 | `3 * x * x + 2 * x + 1` |
| x/y + c | `x / y + c` |

### Precedence des arithmetic operators

**High priority : `* / %`** — **Low priority : `+ -`**. Sans parenthèses :
**deux passes de gauche à droite** (d'abord les high, puis les low).

**Exemple** (Fig. 4.5) : `x = a - b / 3 + c * 2 - 1` avec **a = 9, b = 12,
c = 3**.

```diagram
{
  "title": "Hierarchy of operations : 1re passe pour / et *, 2e passe pour - et +, toujours de gauche à droite. x = 10.",
  "nodes": [
    { "id": "e", "x": 310, "y": 20, "w": 320, "label": "9 − 12 / 3 + 3 * 2 − 1", "tone": "neutral", "filled": true, "bold": true },
    { "id": "s1", "x": 310, "y": 85, "w": 320, "label": "① 12 / 3 = 4   →   9 − 4 + 3 * 2 − 1", "tone": "amber", "filled": true, "size": 12 },
    { "id": "s2", "x": 310, "y": 140, "w": 320, "label": "② 3 * 2 = 6   →   9 − 4 + 6 − 1", "tone": "amber", "filled": true, "size": 12 },
    { "id": "s3", "x": 310, "y": 195, "w": 320, "label": "③ 9 − 4 = 5   →   5 + 6 − 1", "tone": "sky", "filled": true, "size": 12 },
    { "id": "s4", "x": 310, "y": 250, "w": 320, "label": "④ 5 + 6 = 11   →   11 − 1", "tone": "sky", "filled": true, "size": 12 },
    { "id": "s5", "x": 310, "y": 305, "w": 320, "label": "⑤ 11 − 1 = 10", "tone": "emerald", "filled": true, "bold": true },
    { "id": "p1", "x": 560, "y": 112, "shape": "text", "label": "First pass\n* / %", "size": 12 },
    { "id": "p2", "x": 560, "y": 250, "shape": "text", "label": "Second pass\n+ −", "size": 12 }
  ],
  "edges": [
    { "from": "e", "to": "s1" }, { "from": "s1", "to": "s2" }, { "from": "s2", "to": "s3" }, { "from": "s3", "to": "s4" }, { "from": "s4", "to": "s5" }
  ]
}
```

Avec parenthèses : `9 - 12 / (3 + 3) * (2 - 1)` → (3+3) = 6, (2−1) = 1 →
12/6 = 2 → 2·1 = 2 → 9 − 2 = **7**.

**Worked-out problem 4.4** (a = 9, b = 12, c = 3, en `float`) :

| Expression | Valeur |
|---|---|
| `x = a - b / 3 + c * 2 - 1` | **10.000000** |
| `y = a - b / (3 + c) * (2 - 1)` | **7.000000** |
| `z = a - (b / (3 + c) * 2) - 1` | **4.000000** |

**Règles d'évaluation** :

1. Les **sous-expressions parenthésées** d'abord, de gauche à droite ; si elles
   sont **imbriquées**, on commence par la **plus intérieure**.
2. La **precedence rule** fixe l'ordre des opérateurs dans une sous-expression.
3. L'**associativity rule** départage des opérateurs de **même** précédence.

### Some computational problems

- Les réels sont des **approximations** : `a = 1.0/3.0; b = a * 3.0;` ne donne
  **pas forcément 1**. Exemple 4.6 : sommer n fois 1/n donne 1.000001 (n = 99)
  ou 0.999999 (n = 143) : **round-off errors**.
- **Division par zéro** : arrêt anormal du programme.
- **Overflow / underflow** : à nous de garantir le bon **type** et la bonne
  **plage**.

## 11. Type conversions

### Implicit (automatic) conversion

Si les opérandes sont de types différents, le type **« lower » est converti
vers le « higher »** avant l'opération. `short` et `char` sont **toujours
d'abord convertis en `int`**.

```diagram
{
  "title": "Conversion hierarchy : dans toute expression (sauf l'assignment), on monte vers le type le plus haut.",
  "nodes": [
    { "id": "ld", "x": 150, "y": 20, "w": 180, "label": "long double", "tone": "rose", "filled": true },
    { "id": "d", "x": 150, "y": 70, "w": 180, "label": "double", "tone": "amber", "filled": true },
    { "id": "f", "x": 150, "y": 120, "w": 180, "label": "float", "tone": "amber", "filled": true },
    { "id": "ul", "x": 150, "y": 170, "w": 180, "label": "unsigned long int", "tone": "sky", "filled": true },
    { "id": "l", "x": 150, "y": 220, "w": 180, "label": "long int", "tone": "sky", "filled": true },
    { "id": "u", "x": 150, "y": 270, "w": 180, "label": "unsigned int", "tone": "sky", "filled": true },
    { "id": "i", "x": 150, "y": 320, "w": 180, "label": "int", "tone": "sky", "filled": true, "bold": true },
    { "id": "sc", "x": 150, "y": 370, "w": 180, "label": "short · char", "tone": "neutral", "filled": true },
    { "id": "ex", "x": 470, "y": 150, "w": 280, "h": 150, "shape": "note", "tone": "violet", "size": 12, "label": "int i;  float f;  double d;  long int l;\n\ni * f  → float\nl / i  → long int\ni * f + d / l → double\n(le résultat est ensuite converti\nvers le type de la variable à gauche)" }
  ],
  "edges": [
    { "from": "sc", "to": "i" }, { "from": "i", "to": "u" }, { "from": "u", "to": "l" }, { "from": "l", "to": "ul" },
    { "from": "ul", "to": "f" }, { "from": "f", "to": "d" }, { "from": "d", "to": "ld" }
  ]
}
```

Règles dans l'ordre (après `short`/`char` → `int`) : si un opérande est
**long double** → tout en long double ; sinon **double** → double ; sinon
**float** → float ; sinon **unsigned long int** → unsigned long ; sinon
**long int + unsigned int** → long int si l'unsigned y tient, sinon unsigned
long ; sinon **long int** → long ; sinon **unsigned int** → unsigned.

> **Piège de l'assignment :** le résultat est converti vers le type de la
> variable **à gauche**. `int x = 7.9;` donne **7** (troncature) : perte
> d'information. `float` → `int` tronque la partie décimale ; `double` →
> `float` arrondit.

### Explicit conversion : le cast

`(type-name) expression`

```c
ratio = female_number / male_number;          /* deux int : division entière, FAUX */
ratio = (float) female_number / male_number;  /* division réelle, CORRECT          */
```

Le cast ne change **ni la valeur ni le type** de `female_number` ailleurs dans
le programme.

| Exemple (Table 4.7) | Action |
|---|---|
| `x = (int) 7.5` | 7.5 tronqué → **7** |
| `a = (int) 21.3 / (int) 4.5` | évalué comme 21 / 4 → **5** |
| `b = (double) sum / n` | division en **floating point** |
| `y = (int) (a + b)` | le **résultat** de a + b converti en int |
| `z = (int) a + b` | **a** converti en int, puis ajouté à b |
| `p = cos((double) x)` | x converti en double avant l'appel |

**Arrondir** avec un cast : `x = (int) (y + 0.5);` → y = 27.6 → 28.1 → **28**.

Exemple 4.7 : `sum = sum + 1/(float)n;` pour n = 1…10 → 1.0000, 1.5000,
1.8333, … **2.9290**. Sans le cast, `1/n` vaudrait **0** dès n = 2.

## 12. Precedence et associativity (Table 4.8)

| Rang | Opérateurs | Associativity |
|---|---|---|
| 1 | `()` function call, `[]` array | left → right |
| 2 | **unary** : `+ - ++ -- ! ~ * & sizeof (type)` | **right → left** |
| 3 | `* / %` | left → right |
| 4 | `+ -` | left → right |
| 5 | `<< >>` | left → right |
| 6 | `< <= > >=` | left → right |
| 7 | `== !=` | left → right |
| 8 | `&` bitwise AND | left → right |
| 9 | `^` bitwise XOR | left → right |
| 10 | `\|` bitwise OR | left → right |
| 11 | `&&` | left → right |
| 12 | `\|\|` | left → right |
| 13 | `?:` | **right → left** |
| 14 | `= += -= *= /= %=` … | **right → left** |
| 15 | `,` comma | left → right |

```diagram
{
  "title": "if (x == 10 + 15 && y < 10) : + d'abord, puis == et <, puis &&.",
  "nodes": [
    { "id": "and", "x": 300, "y": 30, "w": 70, "label": "&&", "tone": "violet", "filled": true, "bold": true },
    { "id": "eq", "x": 170, "y": 100, "w": 60, "label": "==", "tone": "sky", "filled": true },
    { "id": "lt", "x": 430, "y": 100, "w": 60, "label": "<", "tone": "sky", "filled": true },
    { "id": "x", "x": 100, "y": 170, "w": 50, "label": "x" },
    { "id": "pl", "x": 240, "y": 170, "w": 50, "label": "+", "tone": "amber", "filled": true },
    { "id": "y", "x": 390, "y": 170, "w": 50, "label": "y" },
    { "id": "t", "x": 470, "y": 170, "w": 50, "label": "10" },
    { "id": "a", "x": 200, "y": 240, "w": 50, "label": "10" },
    { "id": "b", "x": 280, "y": 240, "w": 50, "label": "15" },
    { "id": "n1", "x": 560, "y": 240, "shape": "text", "label": "on évalue du bas\nvers le haut", "size": 11 }
  ],
  "edges": [
    { "from": "and", "to": "eq", "arrow": "none" }, { "from": "and", "to": "lt", "arrow": "none" },
    { "from": "eq", "to": "x", "arrow": "none" }, { "from": "eq", "to": "pl", "arrow": "none" },
    { "from": "lt", "to": "y", "arrow": "none" }, { "from": "lt", "to": "t", "arrow": "none" },
    { "from": "pl", "to": "a", "arrow": "none" }, { "from": "pl", "to": "b", "arrow": "none" }
  ]
}
```

## 13. Mathematical functions (`<math.h>`)

Les arguments **x et y sont des `double`**, les angles sont en **radians**,
toutes les fonctions **renvoient un `double`**. Compiler avec **`-lm`**.

| Fonction | Sens | Fonction | Sens |
|---|---|---|---|
| `sqrt(x)` | racine carrée, x ≥ 0 | `pow(x, y)` | x **puissance** y |
| `fabs(x)` | valeur absolue | `exp(x)` | eˣ |
| `ceil(x)` | arrondi **au-dessus** | `log(x)` | logarithme **naturel**, x > 0 |
| `floor(x)` | arrondi **au-dessous** | `log10(x)` | logarithme base 10 |
| `fmod(x, y)` | **reste** de x/y (réels) | `cos`, `sin`, `tan` | trigo (radians) |
| `acos`, `asin`, `atan`, `atan2(x, y)` | trigo inverse | `cosh`, `sinh`, `tanh` | hyperboliques |

`ceil(2.1)` = 3.0, `floor(2.9)` = 2.0, `ceil(-2.1)` = −2.0, `floor(-2.1)` =
−3.0.

---

## 14. Exercices du TD, expliqués

### Exo 1 — jours → années, mois, jours

```diagram
{
  "title": "On enchaîne / pour le quotient et % pour le reste. Exemple avec 1000 jours (1 mois = 30 j, 1 an = 12 mois).",
  "nodes": [
    { "id": "d", "x": 60, "y": 60, "w": 90, "label": "days\n1000", "tone": "neutral", "filled": true, "bold": true },
    { "id": "m", "x": 250, "y": 20, "w": 130, "label": "months = 1000 / 30\n= 33", "tone": "sky", "filled": true, "size": 12 },
    { "id": "r", "x": 250, "y": 100, "w": 130, "label": "days = 1000 % 30\n= 10", "tone": "emerald", "filled": true, "size": 12 },
    { "id": "y", "x": 460, "y": 20, "w": 130, "label": "years = 33 / 12\n= 2", "tone": "amber", "filled": true, "size": 12 },
    { "id": "mm", "x": 460, "y": 100, "w": 130, "label": "months = 33 % 12\n= 9", "tone": "sky", "filled": true, "size": 12 },
    { "id": "out", "x": 640, "y": 60, "w": 130, "label": "2 ans\n9 mois\n10 jours", "tone": "violet", "filled": true, "bold": true }
  ],
  "edges": [
    { "from": "d", "to": "m", "label": "/ 30" }, { "from": "d", "to": "r", "label": "% 30" },
    { "from": "m", "to": "y", "label": "/ 12" }, { "from": "m", "to": "mm", "label": "% 12" },
    { "from": "y", "to": "out" }, { "from": "mm", "to": "out" }
  ]
}
```

### Exo 2 — les chiffres d'un nombre à 4 chiffres

```diagram
{
  "title": "n = 7395 : / décale vers la droite (supprime des chiffres), % 10 garde le dernier chiffre.",
  "nodes": [
    { "id": "n", "x": 300, "y": 20, "shape": "table", "size": 13, "label": "n = 7395", "header": false, "rows": [["7","3","9","5"]], "cols": [50,50,50,50] },
    { "id": "t", "x": 300, "y": 140, "shape": "table", "size": 12, "label": "", "rows": [["chiffre","expression","calcul","valeur"],["1er (milliers)","n / 1000","7395 / 1000","7"],["2e (centaines)","(n / 100) % 10","73 % 10","3"],["3e (dizaines)","(n / 10) % 10","739 % 10","9"],["4e (unités)","n % 10","7395 % 10","5"]], "cols": [120,130,110,60] }
  ],
  "edges": []
}
```

- Somme des chiffres (exercice W7) : 7 + 3 + 9 + 5 = **24**.
- Affichage « en escalier » : `n`, `n % 1000`, `n % 100`, `n % 10` → 7395,
  395, 95, 5.

### Exo 4 — `z = ++x + y-- + ++x + y++` : **undefined behavior**

> **Attention :** modifier **la même variable deux fois** dans une expression
> sans point de séquence (`++x … ++x`, `y-- … y++`) est un **undefined
> behavior** en C : le résultat dépend du compilateur. gcc affiche
> `x : 5 | y : 7 | z : 22`, un autre compilateur peut donner autre chose.
> À l'examen, on ne doit **jamais** écrire ça ; on retient seulement que
> **x est incrémenté deux fois (3 → 5)** et que **y revient à 7**
> (−1 puis +1).

### Exo 5 — le plus grand de trois avec `?:` imbriqués

```flowchart
{
  "title": "(a > b ? (a > c ? a : c) : (b > c ? b : c))",
  "nodes": [
    { "id": "s", "kind": "start", "label": "START", "x": 200, "y": 20 },
    { "id": "in", "kind": "io", "label": "READ a, b, c", "x": 200, "y": 90 },
    { "id": "d1", "kind": "decision", "label": "a > b ?", "x": 200, "y": 170 },
    { "id": "d2", "kind": "decision", "label": "a > c ?", "x": 200, "y": 260 },
    { "id": "d3", "kind": "decision", "label": "b > c ?", "x": 420, "y": 260 },
    { "id": "pa", "kind": "io", "label": "DISPLAY a", "x": 200, "y": 350 },
    { "id": "pc1", "kind": "io", "label": "DISPLAY c", "x": 320, "y": 430 },
    { "id": "pb", "kind": "io", "label": "DISPLAY b", "x": 420, "y": 350 },
    { "id": "pc2", "kind": "io", "label": "DISPLAY c", "x": 560, "y": 430 },
    { "id": "e", "kind": "end", "label": "END", "x": 200, "y": 520 }
  ],
  "edges": [
    { "from": "s", "to": "in" }, { "from": "in", "to": "d1" },
    { "from": "d1", "to": "d2", "branch": "yes" }, { "from": "d1", "to": "d3", "branch": "no" },
    { "from": "d2", "to": "pa", "branch": "yes" }, { "from": "d2", "to": "pc1", "branch": "no" },
    { "from": "d3", "to": "pb", "branch": "yes" }, { "from": "d3", "to": "pc2", "branch": "no" },
    { "from": "pa", "to": "e" }, { "from": "pc1", "to": "e" }, { "from": "pb", "to": "e" }, { "from": "pc2", "to": "e" }
  ]
}
```

---

## Pièges d'exam

- `14 / 4 = 3`, `14 % 4 = 2` ; `%` **uniquement sur des entiers** ; signe du
  `%` = signe du **dividende** (`-14 % 3 = -2`).
- `15 / 10 = 1` mais `15 / 10.0 = 1.5`.
- `y = ++m` (m = 5) → y = 6, m = 6 ; `y = m++` → y = 5, m = 6.
- `a *= n + 1` ≡ `a = a * (n + 1)`.
- `9 - 12/3 + 3*2 - 1 = 10` ; `9 - 12/(3+3)*(2-1) = 7`.
- `(int) 21.3 / (int) 4.5 = 21 / 4 = 5`.
- `(float) a / b` : le cast s'applique à **a** seulement (unary, rang 2), la
  division devient réelle.
- Pas d'espace dans `==`, `<=`, `+=` ; ne pas inverser `!=`, `<=`, `>=` (`=!`
  est faux) ; ne pas confondre **`==`** (comparaison) et **`=`**
  (assignment).
- Comma operator : **plus faible précédence**, valeur = **dernière**
  expression.
- Bitwise : **pas** sur `float` / `double`.

## À retenir

- 8 catégories : arithmetic, relational, logical, assignment, increment /
  decrement, conditional, bitwise, special.
- Integer / real / mixed-mode arithmetic ; division entière **tronque**.
- Relational → 1 ou 0 ; `&&` vrai si les deux, `||` vrai si l'un des deux.
- Precedence : `()` → unary → `* / %` → `+ -` → relational → `== !=` → `&&` →
  `||` → `?:` → assignment → `,`.
- Implicit conversion : lower → higher ; cast `(type) expr` pour forcer.
- `<math.h>` : arguments et résultats en `double`, angles en radians, `-lm`.
