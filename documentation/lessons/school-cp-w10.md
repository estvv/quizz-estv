# Computer Programming — Week 10 · Arrays

**Thème** (syllabus) : *Arrays* : les tableaux à **une dimension**, à **deux
dimensions**, leur **initialisation**, et des **applications** (somme de
tableaux, comptage de fréquences, recherche, tri). Pas de slides dans le
dossier cette semaine : la leçon suit le chapitre 8 de Balagurusamy
(*Arrays*) et corrige les **exercices du TD** (`exo1.c`, `exo2.c`).

> **En bref.** Un **array** est une suite de **variables de même type**,
> rangées **côte à côte** en mémoire et repérées par un **indice**.
> `int a[5];` crée **5 cases**, indices **0 à 4** (le dernier indice est
> **taille − 1**). On le parcourt avec une **boucle `for`**. Accéder à
> `a[5]` **dépasse** le tableau : C ne vérifie rien (**comportement
> indéfini**). `int c[10] = {0};` met **toutes** les cases à 0.

---

## 1. Déclarer un tableau à une dimension

`type name[size];` — **size** est une **constante entière** positive.

```c
int marks[50];        /* 50 entiers      : marks[0] … marks[49] */
float height[10];     /* 10 réels                                 */
char name[20];        /* 20 caractères (une string, W11)          */
```

```diagram
{
  "title": "int a[5] = {10, 20, 30, 40, 50} : 5 cases contiguës ; l'indice commence à 0, le dernier est 4.",
  "nodes": [
    { "id": "t", "x": 300, "y": 40, "shape": "table", "size": 13, "label": "int a[5]", "rows": [["a[0]","a[1]","a[2]","a[3]","a[4]"],["10","20","30","40","50"]], "cols": [60,60,60,60,60] },
    { "id": "x", "x": 560, "y": 60, "w": 110, "shape": "note", "tone": "rose", "label": "a[5] → hors\ndu tableau !", "size": 12 }
  ],
  "edges": []
}
```

| À savoir | |
|---|---|
| Premier indice | **0** |
| Dernier indice | **size − 1** |
| Taille en octets | `sizeof(a)` = size × `sizeof(int)` → `int a[5]` = **20** octets (int de 4 octets) |
| Nombre d'éléments | `sizeof(a) / sizeof(a[0])` |
| Dépassement | **non vérifié** par C : `a[5]` lit ou écrase une autre zone mémoire |

## 2. Initialiser

```c
int a[5] = {10, 20, 30, 40, 50};   /* toutes les valeurs                       */
int b[5] = {1, 2};                 /* b = {1, 2, 0, 0, 0} : le reste vaut 0    */
int c[10] = {0};                   /* les 10 cases à 0 (utilisé dans exo2)     */
int d[] = {3, 6, 9};               /* taille déduite : 3                       */
int e[5];                          /* local, non initialisé : garbage !        */
```

> **Piège :** un tableau **local non initialisé** contient du **garbage**
> (comme une variable `auto`, W3). `= {0}` est le moyen simple de tout
> mettre à zéro. Donner **plus** de valeurs que la taille est une
> **erreur** : `int f[2] = {1, 2, 3};`.

Initialiser **à l'exécution**, avec une boucle :

```c
for (i = 0; i < 5; i++)
    scanf("%d", &a[i]);     /* & devant chaque case */
```

## 3. Parcourir : la boucle standard

```c
for (i = 0; i < SIZE; i++)        /* < SIZE, et pas <= SIZE */
    sum += a[i];
```

> **Off-by-one :** `for (i = 0; i <= 5; i++)` sur `int a[5]` lit **a[5]**, une
> case qui n'existe pas. La condition correcte est **`i < 5`**.

## 4. Tableaux à deux dimensions

`type name[rows][columns];` — un tableau **de lignes**, rangé **ligne par
ligne** en mémoire.

```c
int m[2][3] = { {1, 2, 3},
                {4, 5, 6} };

for (i = 0; i < 2; i++) {          /* lignes   */
    for (j = 0; j < 3; j++)        /* colonnes */
        printf("%d ", m[i][j]);
    printf("\n");
}
```

```diagram
{
  "title": "int m[2][3] : m[i][j] = ligne i, colonne j. 2 × 3 = 6 éléments ; m[1][2] vaut 6.",
  "nodes": [
    { "id": "t", "x": 200, "y": 40, "shape": "table", "size": 13, "label": "m[2][3]", "rows": [["","col 0","col 1","col 2"],["ligne 0","1","2","3"],["ligne 1","4","5","6"]], "cols": [70,60,60,60] },
    { "id": "mem", "x": 520, "y": 50, "shape": "table", "size": 12, "label": "en mémoire (row-major)", "header": false, "rows": [["1","2","3","4","5","6"]], "cols": [36,36,36,36,36,36] }
  ],
  "edges": []
}
```

- Initialisation partielle : `int z[3][3] = {0};` → toutes les cases à 0.
- On peut omettre **seulement la première** dimension :
  `int t[][3] = {{1,2,3},{4,5,6}};`.

## 5. Applications classiques

| But | Idée |
|---|---|
| **Somme / moyenne** | une boucle qui accumule, puis `(float)sum / n` |
| **Maximum** | `max = a[0];` puis `if (a[i] > max) max = a[i];` |
| **Recherche linéaire** | comparer chaque case à la valeur cherchée ; `break` dès qu'on trouve |
| **Tri (bubble sort)** | deux boucles imbriquées, on échange les voisins mal ordonnés |
| **Fréquences** | un tableau de **compteurs** indexé par une **catégorie** (exo 2) |

```c
/* maximum */
int max = a[0];
for (i = 1; i < n; i++)
    if (a[i] > max)
        max = a[i];

/* bubble sort (ordre croissant) */
for (i = 0; i < n - 1; i++)
    for (j = 0; j < n - 1 - i; j++)
        if (a[j] > a[j + 1]) {
            int tmp = a[j];  a[j] = a[j + 1];  a[j + 1] = tmp;
        }
```

> Pour le maximum, on initialise avec **`a[0]`** (et pas 0) : sinon un
> tableau de nombres **négatifs** donnerait un maximum faux.

---

## 6. Exercices du TD, expliqués

### exo1.c — additionner deux tableaux case par case

```c
int arr1[5] = {1, 2, 3, 4, 5};
int arr2[5] = {6, 7, 8, 9, 10};
int arr3[5];
for (int i = 0; i < 5; i++) {
    arr3[i] = arr1[i] + arr2[i];
    printf("[%d] = %d\n", i, arr3[i]);
}
```

```diagram
{
  "title": "arr3[i] = arr1[i] + arr2[i] : même indice dans les trois tableaux.",
  "nodes": [
    { "id": "a", "x": 250, "y": 30, "shape": "table", "size": 12, "label": "arr1", "header": false, "rows": [["1","2","3","4","5"]], "cols": [45,45,45,45,45] },
    { "id": "b", "x": 250, "y": 100, "shape": "table", "size": 12, "label": "arr2", "header": false, "rows": [["6","7","8","9","10"]], "cols": [45,45,45,45,45] },
    { "id": "c", "x": 250, "y": 170, "shape": "table", "size": 12, "label": "arr3 = arr1 + arr2", "header": false, "rows": [["7","9","11","13","15"]], "cols": [45,45,45,45,45] },
    { "id": "n", "x": 540, "y": 100, "shape": "text", "label": "[0] = 7\n[1] = 9\n[2] = 11\n[3] = 13\n[4] = 15", "size": 12 }
  ],
  "edges": []
}
```

### exo2.c — compter les notes par tranche de 10

50 notes entre 0 et 100 ; on veut le nombre de notes dans 0–9, 10–19, …,
90–99.

```c
int count[10] = {0};                 /* 10 compteurs à zéro */
for (int i = 0; i < 50; i++)
    if (marks[i] >= 0 && marks[i] <= 100)
        count[marks[i] / 10]++;      /* la dizaine sert d'INDICE */
for (int i = 0; i < 10; i++)
    printf("%d-%d:\t%d\n", i * 10, i * 10 + 9, count[i]);
```

```diagram
{
  "title": "L'astuce : marks[i] / 10 (division entière) donne directement l'indice de la tranche. 43 → 4, 9 → 0, 93 → 9.",
  "nodes": [
    { "id": "t", "x": 300, "y": 30, "shape": "table", "size": 12, "label": "Résultat sur les 50 notes du TD", "rows": [["tranche","0-9","10-19","20-29","30-39","40-49","50-59","60-69","70-79","80-89","90-99"],["indice","0","1","2","3","4","5","6","7","8","9"],["count","2","4","4","5","8","8","7","6","4","2"]], "cols": [60,40,45,45,45,45,45,45,45,45,45] }
  ],
  "edges": []
}
```

> **Bug caché :** la condition accepte **100** (`<= 100`), et `100 / 10 =
> 10` → `count[10]`, **hors du tableau** `count[10]` (indices 0 à 9) !
> Aucune note du TD ne vaut 100, donc ça ne se voit pas. Corrections : un
> tableau `count[11]`, ou compter 100 dans la dernière tranche :
> `count[marks[i] == 100 ? 9 : marks[i] / 10]++;`.

Total des compteurs : 2 + 4 + 4 + 5 + 8 + 8 + 7 + 6 + 4 + 2 = **50** ✓.

---

## Pièges d'exam

- `int a[N]` : indices **0 à N − 1** ; `a[N]` est **hors limites**, et C ne
  vérifie pas.
- Boucle : **`i < N`**, pas `i <= N`.
- `int b[5] = {1, 2};` → les cases restantes valent **0** ; `int e[5];`
  (local) → **garbage**.
- `sizeof(a) / sizeof(a[0])` = nombre d'éléments.
- 2D : `m[ligne][colonne]` ; stockage **ligne par ligne** ; seule la
  **première** dimension peut être omise.
- `scanf("%d", &a[i])` : **&** devant la case.
- Maximum : initialiser avec **a[0]**.
- Compter par tranches : `count[valeur / 10]++` — attention à la valeur
  **maximale** (100 → indice 10).

## À retenir

- Déclaration `type name[size]`, initialisation `{…}`, `{0}`.
- Parcours avec `for (i = 0; i < size; i++)`.
- 2D : deux boucles imbriquées (lignes puis colonnes).
- Applications : somme, max, recherche, tri à bulles, histogramme de
  fréquences.
