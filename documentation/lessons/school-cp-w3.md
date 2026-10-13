# Computer Programming — Week 3 · Data Types, Storage Classes & Input

**Cours** : suite du Chapter 3, *Constants, Variables and Data Types* : les
**primary data types** (taille et plage), la **déclaration**, le **type par
défaut d'une constante**, `typedef` et `enum`, les **storage classes**
(`auto`, `static`, `extern`, `register`), l'**assignment**, la lecture au
clavier avec **`scanf`**, `#define`, `const` / `volatile` et les **trois sortes
d'erreurs**.

> **En bref.** Un littéral entier est un **`int`**, un littéral réel est un
> **`double`** (sauf suffixe `U`, `L`, `UL`, `f`). `auto` = local, **non
> initialisé** (garbage) ; `static` = local **qui garde sa valeur** entre deux
> appels ; `extern` = global ; `register` = demande de registre CPU. `static`
> et `extern` valent **0** par défaut. `scanf` veut l'**adresse** (`&x`).
> `#define` : **pas de `=`, pas de `;`**. Erreurs : **syntax** (à la
> compilation), **run-time** (à l'exécution, ex. division par 0), **logic**
> (aucun message, juste un résultat faux).

---

## 1. Primary data types

```diagram
{
  "title": "Primary data types in C (Fig. 2.4) : integral (integer + character), floating point, void.",
  "nodes": [
    { "id": "p", "x": 330, "y": 30, "w": 170, "label": "Primary data types", "tone": "violet", "filled": true, "bold": true },
    { "id": "ig", "x": 160, "y": 100, "w": 150, "label": "Integral type", "tone": "sky", "filled": true },
    { "id": "fl", "x": 430, "y": 100, "w": 150, "label": "Floating point type", "tone": "amber", "filled": true },
    { "id": "vd", "x": 600, "y": 100, "w": 80, "label": "void", "tone": "neutral", "filled": true },
    { "id": "in", "x": 80, "y": 190, "w": 150, "h": 110, "label": "Integer\nsigned / unsigned\nint\nshort int\nlong int", "tone": "sky", "size": 12 },
    { "id": "ch", "x": 245, "y": 190, "w": 140, "h": 110, "label": "Character\nchar\nsigned char\nunsigned char", "tone": "sky", "size": 12 },
    { "id": "ft", "x": 430, "y": 190, "w": 150, "h": 110, "label": "float\ndouble\nlong double", "tone": "amber", "size": 12 }
  ],
  "edges": [
    { "from": "p", "to": "ig" }, { "from": "p", "to": "fl" }, { "from": "p", "to": "vd" },
    { "from": "ig", "to": "in" }, { "from": "ig", "to": "ch" }, { "from": "fl", "to": "ft" }
  ]
}
```

### Taille et plage

| Type | 16-bit machine | 32-bit machine (**le plus courant**) |
|---|---|---|
| `char` / `signed char` | 8 bits, −128 ~ 127 | 8 bits, −128 ~ 127 |
| `unsigned char` | 8 bits, 0 ~ 255 | 8 bits, 0 ~ 255 |
| `int` / `signed int` | **16 bits**, −32 768 ~ 32 767 | **32 bits**, −2 147 483 648 ~ 2 147 483 647 |
| `unsigned int` | 16 bits, 0 ~ 65 535 | 32 bits, 0 ~ 4 294 967 295 |
| `short int` | 8 bits, −128 ~ 127 | **16 bits**, −32 768 ~ 32 767 |
| `unsigned short int` | 8 bits, 0 ~ 255 | 16 bits, 0 ~ 65 535 |
| `long int` | 32 bits, −2 147 483 648 ~ 2 147 483 647 | 32 bits, idem |
| `unsigned long int` | 32 bits, 0 ~ 4 294 967 295 | 32 bits, idem |

| Type | Taille | Plage | Précision |
|---|---|---|---|
| `float` | **32 bits** | 3.4E−38 ~ 3.4E+38 | **6 chiffres** |
| `double` | **64 bits** | 1.7E−308 ~ 1.7E+308 | **14 chiffres** |
| `long double` | **80 bits** | 3.4E−4932 ~ 1.1E+4932 | |

> Les slides écrivent `0 ~ 65,536` pour `unsigned int` 16 bits : la vraie
> borne est **65 535** (2¹⁶ − 1). Pour un QCM, retiens surtout l'ordre de
> grandeur : `n` bits unsigned → 0 à 2ⁿ − 1 ; signed → −2ⁿ⁻¹ à 2ⁿ⁻¹ − 1.

```diagram
{
  "title": "Taille en octets sur une machine 32 bits (sizeof).",
  "nodes": [
    { "id": "c", "x": 40, "y": 40, "w": 40, "label": "1", "tone": "sky", "filled": true },
    { "id": "s", "x": 60, "y": 90, "w": 80, "label": "2", "tone": "sky", "filled": true },
    { "id": "i", "x": 100, "y": 140, "w": 160, "label": "4", "tone": "sky", "filled": true },
    { "id": "f", "x": 100, "y": 190, "w": 160, "label": "4", "tone": "amber", "filled": true },
    { "id": "d", "x": 180, "y": 240, "w": 320, "label": "8", "tone": "amber", "filled": true },
    { "id": "lc", "x": 420, "y": 40, "shape": "text", "label": "char", "size": 12 },
    { "id": "ls", "x": 420, "y": 90, "shape": "text", "label": "short int", "size": 12 },
    { "id": "li", "x": 420, "y": 140, "shape": "text", "label": "int (et long int)", "size": 12 },
    { "id": "lf", "x": 420, "y": 190, "shape": "text", "label": "float", "size": 12 },
    { "id": "ld", "x": 420, "y": 240, "shape": "text", "label": "double", "size": 12 }
  ],
  "edges": []
}
```

## 2. Déclarer des variables

`data-type v1, v2, …, vn;`

```c
float x, y;
int code;
short int count;
long int amount;
double deviation;
unsigned n, m;      /* unsigned seul = unsigned int */
char c, d;
```

### Type par défaut d'une constante

| Littéral | Type | Valeur |
|---|---|---|
| `+111`, `-222` | **`int`** | 111, −222 |
| `45678U` | `unsigned int` | 45 678 |
| `-56789L` | `long int` | −56 789 |
| `987654UL` | `unsigned long int` | 987 654 |
| `0.`, `.0`, `12.0`, `1.234` | **`double`** | |
| `-1.2f` | `float` | −1.2 |
| `1.23456789` (trop de chiffres pour un double court, slides) | `long double` | |

> **À retenir :** entier sans suffixe → **`int`** ; réel sans suffixe →
> **`double`** (et **pas** `float`).

## 3. `typedef` et `enum` (user-defined types)

```c
typedef int units;              /* "units" devient un autre nom pour int */
typedef float marks;
units b1, b2;                   /* deux int */
marks name1[50], name2[50];     /* deux tableaux de float */
```

```c
enum day {Mon, Tues, Wed, Thurs, Fri, Sat, Sun};
enum day week_st, week_end;
week_st = Mon;
week_end = Fri;
if (week_st == Tues)
    week_end = Sat;
```

```diagram
{
  "title": "Le compilateur numérote les enumerators à partir de 0, de 1 en 1.",
  "nodes": [
    { "id": "t", "x": 300, "y": 30, "shape": "table", "size": 12, "label": "enum day", "rows": [["Mon","Tues","Wed","Thurs","Fri","Sat","Sun"],["0","1","2","3","4","5","6"]], "cols": [55,55,55,55,55,55,55] }
  ],
  "edges": []
}
```

On peut forcer une valeur : `enum {A = 1, B, C}` → B = 2, C = 3.

## 4. Storage classes : où vit la variable, et combien de temps

```c
int m;                       /* GLOBAL : vue partout dans le fichier */

main()
{
    int i; float blc;        /* LOCAL à main */
    i = 0;
    function1();
    m = i + 3;
}

function1()
{
    int i;                   /* un AUTRE i, local à function1 */
    float sum;
    i = 3;
}
```

```diagram
{
  "title": "Scope : m est visible partout ; chaque i n'existe que dans sa fonction.",
  "groups": [
    { "x": 330, "y": 120, "w": 640, "h": 220, "label": "fichier source", "tone": "violet" },
    { "x": 180, "y": 150, "w": 280, "h": 120, "label": "main()", "tone": "sky" },
    { "x": 480, "y": 150, "w": 280, "h": 120, "label": "function1()", "tone": "amber" }
  ],
  "nodes": [
    { "id": "m", "x": 330, "y": 40, "w": 160, "label": "int m;  (global)", "tone": "violet", "filled": true, "bold": true },
    { "id": "i1", "x": 130, "y": 160, "w": 90, "label": "int i", "tone": "sky", "filled": true },
    { "id": "b1", "x": 240, "y": 160, "w": 100, "label": "float blc", "tone": "sky", "filled": true },
    { "id": "i2", "x": 430, "y": 160, "w": 90, "label": "int i", "tone": "amber", "filled": true },
    { "id": "s2", "x": 540, "y": 160, "w": 100, "label": "float sum", "tone": "amber", "filled": true }
  ],
  "edges": [
    { "from": "m", "to": "i1", "dashed": true, "label": "visible" },
    { "from": "m", "to": "i2", "dashed": true, "label": "visible" }
  ]
}
```

| Storage class | Sens | Valeur initiale par défaut |
|---|---|---|
| **`auto`** | **par défaut** ; variable locale connue seulement dans sa fonction | **garbage** (non initialisée) |
| **`static`** | locale qui **existe et garde sa valeur** même après le retour à l'appelant | **0** |
| **`extern`** | globale, connue de **toutes** les fonctions du fichier | **0** |
| **`register`** | locale stockée dans un **registre** CPU (plus rapide) | garbage |

```c
auto int count;
register char ch;
static int x;
extern long total;
```

### L'exemple `static` des slides

```c
main()
{
    int i, x;
    for (i = 0; i < 5; ++i) {
        x = fsub();
        printf("%d\n", x);
    }
}

int fsub()
{
    int m = 10;           /* auto : remis à 10 à CHAQUE appel   */
    static int d = 10;    /* static : initialisé UNE fois, garde sa valeur */
    d = d + m;
    return (d);
}
```

```diagram
{
  "title": "d est static : il garde sa valeur d'un appel à l'autre. m est auto : il repart de 10. Sortie : 20 30 40 50 60.",
  "nodes": [
    { "id": "t", "x": 300, "y": 30, "shape": "table", "size": 12, "label": "fsub() appelée 5 fois", "rows": [["appel","m (auto)","d avant","d = d + m","printf"],["1","10","10","20","20"],["2","10","20","30","30"],["3","10","30","40","40"],["4","10","40","50","50"],["5","10","50","60","60"]], "cols": [60,80,80,90,70] }
  ],
  "edges": []
}
```

> **Piège :** si `d` était `auto`, `fsub()` renverrait **20 à chaque fois**.
> Et la slide écrit `printf("%d \n", &x)` : le `&` dans un `printf` affiche une
> **adresse**, pas la valeur. C'est une **erreur** (voir W5).

## 5. Assigner des valeurs

```c
initial_value = 0;
final_value = 100;
balance = 75.84;
yes = 'x';
initial_value = 0; final_value = 100;    /* plusieurs instructions sur une ligne */

int final_value = 100;                   /* declaration + initialization */
char yes = 'x';

p = q = s = 0;                           /* chaînée : évaluée de droite à gauche */
x = y = z = MAX;
```

Exemple d'usage dans une boucle :

```c
value = 0;
year = 2000;
while (year <= 2017) {
    value = value + 0.7 * income;
    year = year + 1;
}
printf("Amount of savings from year 2000 is %f \n", value);   /* %f : 6 décimales */
```

## 6. Lire au clavier : `scanf`

`scanf("control string", &variable1, &variable2, …);`

```c
int age;
printf("Enter your age: \n");
scanf("%d", &age);              /* & = ADRESSE de age */
printf("You are %d years old!\n", age);
```

```diagram
{
  "title": "scanf a besoin de l'adresse (&age) pour pouvoir écrire DANS la variable.",
  "nodes": [
    { "id": "kb", "x": 60, "y": 60, "w": 100, "label": "clavier\n\"20\"", "tone": "neutral", "filled": true },
    { "id": "sc", "x": 240, "y": 60, "w": 150, "label": "scanf(\"%d\", &age)", "tone": "sky", "filled": true },
    { "id": "mem", "x": 470, "y": 60, "shape": "table", "size": 12, "label": "mémoire", "rows": [["adresse","nom","valeur"],["0x7ffc10","age","20"]], "cols": [80,50,50] }
  ],
  "edges": [
    { "from": "kb", "to": "sc", "label": "stdin" },
    { "from": "sc", "to": "mem", "label": "écrit à &age" }
  ]
}
```

- `scanf("Enter a number %d", &number);` est **permis par certains
  compilateurs**, mais l'utilisateur doit alors **taper** `Enter a number`.
  Toujours afficher le message avec `printf`.
- **Visual Studio (erreur C4996)** : `scanf` est jugé « unsafe ». Deux
  solutions : `#pragma warning(disable : 4996)` en tête, ou **`scanf_s`**
  (`scanf_s("%d", &age, sizeof(int));` en principe).

## 7. Symbolic constants : `#define`

`#define symbolic-name value-of-constant` — **pas de `;`**.

```c
#define PI 3.14159
#define MAX 200
MAX = 120;            /* ILLÉGAL : une symbolic constant ne se réassigne pas */
```

Avantages : **modifiability** (on change la valeur à un seul endroit) et
**understandability** (un nom plutôt qu'un nombre magique).

| `#define` (Table 3.11) | Valide ? | Pourquoi |
|---|---|---|
| `#define X = 2.5` | ❌ | pas de **`=`** |
| `# define MAX 10` | ❌ | pas d'**espace** entre `#` et `define` |
| `#define N 25;` | ❌ | pas de **`;`** |
| `#define N 5, M 10` | ❌ | **un seul** nom par `#define` |
| `#Define ARRAY 11` | ❌ | `define` en **minuscules** |
| `#define PRICE$ 100` | ❌ | **`$`** interdit dans le nom |

## 8. `const` et `volatile`

```c
const int class_size = 40;          /* ne peut plus être modifiée */
volatile int date;                  /* peut changer à tout moment DE L'EXTÉRIEUR du programme */
volatile const int location = 100;  /* le programme ne peut pas la modifier, mais l'extérieur si */
```

## 9. Les trois sortes d'erreurs

```diagram
{
  "title": "Plus l'erreur est détectée tard, plus elle est difficile à trouver.",
  "nodes": [
    { "id": "s", "x": 110, "y": 60, "w": 190, "h": 90, "label": "Syntax error\nviolation de la grammaire\ndétectée à la COMPILATION\n→ le programme ne tourne pas", "tone": "amber", "filled": true, "size": 12 },
    { "id": "r", "x": 330, "y": 60, "w": 190, "h": 90, "label": "Run-time error\nopération illégale (÷ 0)\ndétectée à l'EXÉCUTION\n→ arrêt + message diagnostic", "tone": "rose", "filled": true, "size": 12 },
    { "id": "l", "x": 550, "y": 60, "w": 190, "h": 90, "label": "Logic / design error\nmauvais algorithme\nAUCUN message\n→ seulement un résultat faux", "tone": "violet", "filled": true, "size": 12 }
  ],
  "edges": [
    { "from": "s", "to": "r" }, { "from": "r", "to": "l" }
  ]
}
```

- **Debugging** = trouver les erreurs et les corriger.
- Une **logic error** se détecte en **testant** et en **comparant** les
  résultats à des valeurs calculées à la main ; on la **prévient** en vérifiant
  l'**algorithme avant** de taper le code.

---

## 10. Exercices du TD, expliqués

### Exo 1 & 2 — Celsius ↔ Fahrenheit

**F = (9/5) · C + 32** et **C = (F − 32) · 5/9**. Exemple : 25 °C → **77 °F**.

```flowchart
{
  "title": "Celsius → Fahrenheit (feuille d'exercice). Attention à la division entière dans 9/5.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "START" },
    { "id": "in", "kind": "io", "label": "READ cel" },
    { "id": "i", "kind": "process", "label": "f = 0" },
    { "id": "p", "kind": "process", "label": "f = (9 * cel) / 5 + 32" },
    { "id": "out", "kind": "io", "label": "DISPLAY f" },
    { "id": "e", "kind": "end", "label": "STOP" }
  ],
  "edges": [
    { "from": "s", "to": "in" }, { "from": "in", "to": "i" }, { "from": "i", "to": "p" },
    { "from": "p", "to": "out" }, { "from": "out", "to": "e" }
  ]
}
```

```diagram
{
  "title": "Le piège de la division entière : 9/5 et 5/9 sont calculés entre int AVANT de toucher au float.",
  "nodes": [
    { "id": "t", "x": 300, "y": 30, "shape": "table", "size": 12, "label": "cel = 25", "rows": [["expression","calcul","résultat"],["(9/5) * cel + 32","1 * 25 + 32","57  ❌"],["9 * cel / 5 + 32","225.0 / 5 + 32","77  ✅"],["(9.0/5) * cel + 32","1.8 * 25 + 32","77  ✅"],["(5/9) * (F - 32)","0 * …","0  ❌"],["(F - 32) * 5.0 / 9.0","45 * 0.555…","25  ✅"]], "mark": [2,3,5], "cols": [170,140,80] }
  ],
  "edges": []
}
```

> La feuille d'exercice écrit à l'étape 5 `f = ((5/9) * cel) + 32` : c'est
> **faux deux fois** (5/9 au lieu de 9/5, et 5/9 vaut **0** en division
> entière). Le code de la feuille, `f = ((cel*9)/5)+32`, est correct car
> `cel` est un `float`.

### Exo 3 — formats d'affichage

```c
float x = 1.234567890000;  double y = 9.87654321;
printf("x = %.12lf\n", x);   /* 1.234567880630 : float n'a que ~6-7 chiffres fiables */
printf("y = %.12lf\n", y);   /* 9.876543210000 : double en a ~14-15 */
printf("n = %ld\n", n);      /* long -> %ld */
printf("k = %u\n", k);       /* unsigned -> %u */
```

### Exo 4, 5, 8, 9 — formules géométriques

```diagram
{
  "title": "Les formules des exercices et leur traduction en C.",
  "nodes": [
    { "id": "t", "x": 320, "y": 30, "shape": "table", "size": 12, "label": "", "header": true, "rows": [["Exo","Calcul","Formule","En C"],["4","aire du cercle","A = π r²","PI * r * r"],["5","aire du triangle","A = ½ · b · h","0.5 * b * h"],["6","triangle par 3 côtés (Héron)","s = (a+b+c)/2, A = √(s(s−a)(s−b)(s−c))","sqrt(s*(s-a)*(s-b)*(s-c))"],["7","distance entre 2 points","d = √((x2−x1)² + (y2−y1)²)","sqrt(dx*dx + dy*dy)"],["8","cercle centré en (0,0)","R = √(x² + y²), P = 2πR, A = πR²","2 * PI * radius"],["9","cercle par son diamètre","D = distance, R = D / 2","diameter / 2"]], "cols": [40,180,250,170] }
  ],
  "edges": []
}
```

```flowchart
{
  "title": "Exo 6 : aire par la formule de Héron, avec les deux vérifications avant le calcul.",
  "nodes": [
    { "id": "s", "x": 150, "y": 30, "kind": "start", "label": "START" },
    { "id": "in", "x": 150, "y": 100, "kind": "io", "label": "READ a, b, c" },
    { "id": "d1", "x": 150, "y": 185, "kind": "decision", "label": "a, b, c > 0 ?" },
    { "id": "d2", "x": 150, "y": 295, "kind": "decision", "label": "triangle\nvalide ?" },
    { "id": "p", "x": 150, "y": 430, "kind": "process", "label": "s = (a+b+c) / 2.0\narea = sqrt(s(s−a)(s−b)(s−c))" },
    { "id": "out", "x": 150, "y": 510, "kind": "io", "label": "DISPLAY area" },
    { "id": "err1", "x": 480, "y": 240, "kind": "io", "label": "\"sides must be > 0\"" },
    { "id": "err2", "x": 340, "y": 345, "kind": "io", "label": "\"invalid triangle\"" },
    { "id": "e", "x": 150, "y": 590, "kind": "end", "label": "END" }
  ],
  "edges": [
    { "from": "s", "to": "in" }, { "from": "in", "to": "d1" },
    { "from": "d1", "to": "d2", "branch": "yes" }, { "from": "d1", "to": "err1", "branch": "no" },
    { "from": "d2", "to": "p", "branch": "yes" }, { "from": "d2", "to": "err2", "branch": "no" },
    { "from": "p", "to": "out" }, { "from": "out", "to": "e" }, { "from": "err1", "to": "e" }, { "from": "err2", "to": "e" }
  ]
}
```

- **Triangle valide** = chaque côté est plus petit que la somme des deux
  autres : `a+b > c`, `a+c > b` et `b+c > a`.
- Le `/ 2.0` (et non `/ 2`) force une division **réelle** : avec a = 3, b = 4,
  c = 4, `(a+b+c)/2` vaudrait 5 au lieu de 5.5.
- `sqrt` vient de **`<math.h>`** → compiler avec **`-lm`**.
- **Bug dans l'exo 7** : `double x1;` puis `scanf("%d", &x1)` est faux, il faut
  **`%lf`** pour lire un `double` (et `%f` pour un `float`).

---

## Pièges d'exam

- Littéral entier = `int`, littéral réel = **`double`**.
- `float` : 32 bits, **6** chiffres ; `double` : 64 bits, **14** chiffres ;
  `long double` : 80 bits.
- `short int` : 8 bits sur 16-bit machine, **16 bits** sur 32-bit ; `int` :
  16 → **32** bits.
- `auto` = garbage ; `static` / `extern` = **0** par défaut.
- `static` local garde sa valeur entre les appels (20, 30, 40, …).
- `#define` : pas de `=`, pas de `;`, pas d'espace après `#`, un nom par
  ligne, pas de `$` ; on ne peut pas faire `MAX = 120;`.
- `9/5` en int vaut **1**, `5/9` vaut **0**.
- Run-time error = détectée **pendant l'exécution** (÷ 0) ; logic error =
  **aucun message**.

## À retenir

- `typedef type nouveau_nom;` crée un alias ; `enum` numérote à partir de 0.
- `scanf("%d", &x)` : format **sans texte**, `&` obligatoire pour les types de
  base ; `%f` pour `float`, `%lf` pour `double`.
- `const` = non modifiable ; `volatile` = peut changer de l'extérieur.
- Syntax (compilation) → run-time (exécution) → logic (résultat faux).
