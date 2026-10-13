# Computer Programming — Mid Term (W1–W7) · Plan de révision

Le **midterm** (semaine 8 du syllabus) couvre **tout le cours depuis la
semaine 1**. Cette catégorie mélange des questions de **toutes les leçons** de
Computer Programming dans le style d'un QCM d'examen : chaque réponse se
trouve dans une leçon Week 1 à Week 7.

**Méthode conseillée :**

1. Faire ce quiz une première fois à froid : **Toutes** puis **Aléatoire**.
2. Pour chaque semaine où tu rates des questions, relire la **leçon** (sections
   *Pièges d'exam* et *À retenir*) puis refaire son quiz.
3. **Dérouler à la main** les petits programmes : opérateurs, `printf`,
   `switch` sans `break`.
4. Relire la **fiche midterm de Week 7** (les 12 réflexes) la veille.

---

## La checklist par semaine

| Semaine | Ce qu'il faut savoir sans hésiter |
|---|---|
| **W1** · Problem solving | machine code → assembly → **HLL** (portabilité) ; **edit → compile → link → run** ; CPU = **ALU + CU + registers** ; RAM volatile / ROM non volatile ; system software (OS, **loader**, **linker**, **translator**) ; **algorithm** = fini, non ambigu, indépendant du langage ; constructs **imperative / conditional / iterative** ; symboles de **flowchart** (terminal ovale, **I/O parallélogramme**, **process rectangle**, **decision losange à 2 sorties**, connector cercle) |
| **W2** · Overview & constants | 6 sections, **une seule `main()`** ; `cc` → **`a.out`**, `-o`, **`-lm`** ; character set (4 catégories) ; **tokens** ; 32 **keywords** en minuscules ; **identifiers** (lettre ou `_` d'abord, pas de `-` `$` espace keyword) ; **octal `0…`**, **hexa `0x…`**, suffixes `U L UL` ; exposant **entier** ; `'5'` (53) ≠ `5` ≠ `"5"` ; **escape sequences** |
| **W3** · Types & storage | `int` **32 bits** (16 sur machine 16 bits), `float` 32 / **6** chiffres, `double` 64 / **14** ; littéral réel = **`double`** ; `typedef`, `enum` (0, 1, 2…) ; **`auto`** (garbage) / **`static`** (garde sa valeur, 0) / **`extern`** (global, 0) / **`register`** ; `scanf("%d", &x)` ; `#define` **sans `=` ni `;`** ; `const` / `volatile` ; erreurs **syntax / run-time / logic** |
| **W4** · Operators | `14/4 = 3`, `14%4 = 2`, `%` entiers seulement, signe du **dividende** ; mixed-mode ; **`++m` vs `m++`** ; `v op= exp` ; `?:` ; bitwise (pas sur float) ; comma (plus faible) ; `sizeof` ; precedence `* / %` avant `+ -` ; **conversion hierarchy** ; cast `(float) a / b` ; `<math.h>` (double, radians, `-lm`) |
| **W5** · I/O & if | `getchar` / `putchar`, le **`\n`** qui reste ; `<ctype.h>` ; `scanf` **`%2d`**, **`%*d`**, `%lf`, `%s`, **`%[^\n]`**, **valeur de retour** ; `printf` **`%6d`**, `%-6d`, `%06d`, **`%7.2f`**, **`%.5s`** ; 4 formes de `if` ; **dangling else** ; **De Morgan** ; leap year ; else if ladder (facture) |
| **W6** · switch, ?:, goto | expression **integral**, case **constants uniques**, **`break`** (sinon **fall through**), **un seul `default`** ; switch pour **3 à 10** alternatives ; `?:` (prêt, max de trois) ; **GCD(a, b) = GCD(b, a % b)** ; `goto label;` forward / backward, **boucle infinie** |
| **W7** · Exercise 2 | `/` et `%` pour découper (jours → années / semaines / jours, chiffres d'un nombre) ; `(int)` avant `%` sur un réel ; somme des chiffres ; moyenne `/ 3.0` ; min / max avec `?:` |

## Les sorties à savoir prédire

| Code | Sortie |
|---|---|
| `m = 5; y = ++m;` | y = 6, m = 6 |
| `m = 5; y = m++;` | y = 5, m = 6 |
| `9 - 12/3 + 3*2 - 1` | 10 |
| `(int) 21.3 / (int) 4.5` | 5 |
| `printf("%6d", 9876)` | `··9876` |
| `printf("%7.2f", 98.7654)` | `··98.77` |
| `printf("%.5s", "NEW DELHI 110001")` | `NEW D` |
| `scanf("%2d %5d")` sur `31426 50` | 31 et 426 |
| `switch (2)` sans `break` : cases 1, 2, 3, default | `two three other` |
| `static int d = 10; d = d + 10;` appelée 3 fois | 20, 30, 40 |
