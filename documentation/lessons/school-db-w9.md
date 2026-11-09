# Database Design — Week 9 · Relational Algebra 2 : Selection & Projection

**Cours** : Lecture 14, *Relational Algebra Operations – 2* : la liste des
opérations de l'algèbre relationnelle, puis **Selection (σ)**, **Projection
(∏)** et leur **combinaison**, sur les tables **Student** et **Employee**.
**Exercices** : la feuille *DB Design exercises* (corrigé complet).

> **En bref.** **σ<sub>condition</sub>(Relation)** garde les **lignes** qui
> vérifient la condition (opérateurs **= <> < > <= >=**, **∧** = AND,
> **∨** = OR). **∏<sub>attributs</sub>(Relation)** garde les **colonnes**
> demandées et **supprime les doublons**. Pour « afficher **telles colonnes**
> des lignes qui **vérifient telle condition** », on **sélectionne d'abord**,
> puis on **projette** : **∏<sub>colonnes</sub>(σ<sub>condition</sub>(R))**.

---

## 1. Les opérations de l'algèbre relationnelle

| Opérateur | Symbole | Ce qu'il fait | Semaine |
|---|---|---|---|
| **Selection** | **σ** (sigma) | affiche certaines **lignes** (tuples) | W7, W9 |
| **Projection** | **∏** (pi) | affiche certaines **colonnes** | W7, W9 |
| **Cross Product** | **×** | multiplie chaque tuple d'une relation par chaque tuple de l'autre | W10 |
| **Joins** | **⋈**, **⟕ ⟖ ⟗** | combine des tables : **natural / inner join**, **outer join** (left, right, full) | W10 |
| **Set operators** | **∪ ∩ −** | combine les résultats de deux requêtes : **union**, **intersection**, **minus / set-difference** | à venir |
| **Division** | **÷** | divise une relation par une autre | à venir |
| **Rename** | **ρ** (rho) | renomme une colonne ou une table | à venir |

```diagram
{
  "title": "σ coupe horizontalement (des lignes), ∏ coupe verticalement (des colonnes).",
  "nodes": [
    { "id": "s", "x": 140, "y": 30, "shape": "table", "size": 12, "label": "σ Branch='CE' (Student)", "rows": [["RollNo","Name","Branch","SPI"],["101","Raju","CE","8"],["102","Mitesh","ME","9"],["103","Nilesh","CI","9"],["104","Meet","CE","9"]], "mark": [1,4], "cols": [55,60,55,40] },
    { "id": "p", "x": 470, "y": 30, "shape": "table", "size": 12, "label": "∏ Name, Branch (Student)", "rows": [["Name","Branch"],["Raju","CE"],["Mitesh","ME"],["Nilesh","CI"],["Meet","CE"]], "cols": [70,60] },
    { "id": "n1", "x": 140, "y": 175, "shape": "text", "label": "on GARDE les lignes surlignées", "size": 11 },
    { "id": "n2", "x": 470, "y": 175, "shape": "text", "label": "on GARDE seulement 2 colonnes", "size": 11 }
  ],
  "edges": []
}
```

## 2. Selection (σ)

| | |
|---|---|
| **Symbol** | **σ** (Sigma) |
| **Notation** | **σ<sub>condition</sub>(Relation)** |
| **Operation** | sélectionne les **tuples** qui satisfont la condition |
| **Operators** | **=, <>, <, >, <=, >=, ∧ (AND), ∨ (OR)** |

### Les exemples des slides (table Student 1)

| RollNo | Name | Branch | SPI |
|---|---|---|---|
| 101 | Raju | CE | 8 |
| 102 | Mitesh | ME | 9 |
| 103 | Nilesh | CI | 9 |
| 104 | Meet | CE | 9 |

| Requête | Algèbre relationnelle | Résultat |
|---|---|---|
| étudiants de la branche **CE** | **σ<sub>Branch='CE'</sub>(Student)** | 101 Raju, 104 Meet |
| CE **et** SPI > 8 | **σ<sub>Branch='CE' ∧ SPI>8</sub>(Student)** | 104 Meet |
| **CI ou ME** | **σ<sub>Branch='CI' ∨ Branch='ME'</sub>(Student)** | 102 Mitesh, 103 Nilesh |
| SPI **entre 7 et 9** (slide) | **σ<sub>SPI>7 ∧ SPI<9</sub>(Student)** | 101 Raju (SPI 8) |

> **Piège « between » :** la slide traduit « between 7 and 9 » par
> **SPI > 7 ∧ SPI < 9** (bornes **exclues** : seul Raju, 8). Le corrigé des
> exercices utilise **SPI ≥ 6 ∧ SPI ≤ 9** (bornes **incluses**). À l'examen,
> le plus sûr est **≥ / ≤** (comme `BETWEEN` en SQL, qui inclut les bornes),
> ou de préciser son choix.

### Équivalent SQL

| Algèbre | SQL |
|---|---|
| σ<sub>Branch='CE' ∧ SPI>8</sub>(Student) | `SELECT * FROM Student WHERE Branch = 'CE' AND SPI > 8;` |

> **Attention au vocabulaire :** le **SELECT** de SQL correspond à la
> **projection ∏** (le choix des colonnes) ; c'est le **WHERE** qui
> correspond à la **sélection σ**.

## 3. Projection (∏)

| | |
|---|---|
| **Symbol** | **∏** (Pi) |
| **Notation** | **∏<sub>attribute set</sub>(Relation)** |
| **Operation** | sélectionne les **attributs** (colonnes) demandés |
| **Doublons** | **supprimés** du résultat |

| Requête | Algèbre | Résultat |
|---|---|---|
| RollNo, Name, Branch de tous | **∏<sub>RollNo, Name, Branch</sub>(Student)** | 4 lignes |
| le nom de **toutes les branches** | **∏<sub>Branch</sub>(Student)** | CE, ME, CI → **3** lignes (CE une seule fois) |

Équivalent SQL : `SELECT DISTINCT Branch FROM Student;` (le `DISTINCT`
reproduit la suppression des doublons).

## 4. Combiner Projection et Selection

On applique **d'abord σ** (les lignes), **puis ∏** (les colonnes) :
**∏<sub>colonnes</sub>(σ<sub>condition</sub>(Relation))**.

```flowchart
{
  "title": "Méthode pour traduire une phrase en algèbre relationnelle.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "Phrase en anglais" },
    { "id": "a", "kind": "process", "label": "1. Quelle table ? (Student, Employee…)" },
    { "id": "b", "kind": "process", "label": "2. Quelle condition sur les lignes ?\n→ σ condition (Table)" },
    { "id": "d", "kind": "decision", "label": "Toutes les colonnes ?\n(« the detail of »)" },
    { "id": "c", "kind": "process", "label": "3. Entourer de ∏ colonnes ( … )" },
    { "id": "e", "kind": "end", "label": "Expression finale" }
  ],
  "edges": [
    { "from": "s", "to": "a" }, { "from": "a", "to": "b" }, { "from": "b", "to": "d" },
    { "from": "d", "to": "e", "branch": "yes" }, { "from": "d", "to": "c", "branch": "no" },
    { "from": "c", "to": "e" }
  ]
}
```

Exemples des slides (table Student 2 : Meet a SPI **7**) :

| Requête | Step 1 | Answer | Output |
|---|---|---|---|
| RollNo, Name, Branch des étudiants **ME** | σ<sub>Branch='ME'</sub>(Student) | **∏<sub>RollNo, Name, Branch</sub>(σ<sub>Branch='ME'</sub>(Student))** | 102 Mitesh ME |
| Name, Branch, SPI des SPI **> 8** | σ<sub>SPI>8</sub>(Student) | **∏<sub>Name, Branch, SPI</sub>(σ<sub>SPI>8</sub>(Student))** | Mitesh ME 9, Nilesh CI 9 |
| Name, Branch, SPI des **CE** avec SPI **> 7** | σ<sub>Branch='CE' ∧ SPI>7</sub>(Student) | **∏<sub>Name, Branch, SPI</sub>(σ<sub>Branch='CE' ∧ SPI>7</sub>(Student))** | Raju CE 8 |
| Name, Branch des **ME ou CI** | σ<sub>Branch='ME' ∨ Branch='CI'</sub>(Student) | **∏<sub>Name, Branch</sub>(σ<sub>Branch='ME' ∨ Branch='CI'</sub>(Student))** | Mitesh ME, Nilesh CI |

> La slide écrit `σBranch='E'` dans le dernier exemple : c'est une coquille
> pour **'ME'**.

```diagram
{
  "title": "∏ Name, Branch, SPI (σ SPI>8 (Student)) : d'abord les lignes, puis les colonnes.",
  "nodes": [
    { "id": "a", "x": 100, "y": 40, "shape": "table", "size": 11, "label": "Student", "rows": [["RollNo","Name","Branch","SPI"],["101","Raju","CE","8"],["102","Mitesh","ME","9"],["103","Nilesh","CI","9"],["104","Meet","CE","7"]], "mark": [2,3], "cols": [50,55,50,35] },
    { "id": "b", "x": 360, "y": 40, "shape": "table", "size": 11, "label": "Output-1 : σ SPI>8", "rows": [["RollNo","Name","Branch","SPI"],["102","Mitesh","ME","9"],["103","Nilesh","CI","9"]], "cols": [50,55,50,35] },
    { "id": "c", "x": 590, "y": 40, "shape": "table", "size": 11, "label": "Output-2 : ∏", "rows": [["Name","Branch","SPI"],["Mitesh","ME","9"],["Nilesh","CI","9"]], "cols": [55,50,35] }
  ],
  "edges": [ { "from": "a", "to": "b", "label": "σ" }, { "from": "b", "to": "c", "label": "∏" } ]
}
```

---

## 5. Exercices : corrigé complet

Les deux tables des exercices :

| RollNo | Name | Branch | SPI |
|---|---|---|---|
| 101 | Raj | CE | 6 |
| 102 | Meet | ME | 8 |
| 103 | Harsh | EE | 7 |
| 104 | Punit | CE | 9 |

| EmpID | Name | Dept | Salary |
|---|---|---|---|
| 101 | Nilesh | Sales | 10000 |
| 102 | Mayur | HR | 25000 |
| 103 | Hardik | HR | 15000 |
| 104 | Ajay | Admin | 20000 |

### Selection seule

| # | Requête | Algèbre relationnelle | Résultat |
|---|---|---|---|
| 1 | RollNo **< 104** | **σ<sub>RollNo<104</sub>(Student)** | Raj, Meet, Harsh |
| 2 | SPI **> 8** | **σ<sub>SPI>8</sub>(Student)** | Punit |
| 3 | **CE** et SPI **< 8** | **σ<sub>Branch='CE' ∧ SPI<8</sub>(Student)** | Raj |
| 4 | **CE ou ME** | **σ<sub>Branch='CE' ∨ Branch='ME'</sub>(Student)** | Raj, Meet, Punit |
| 5 | SPI entre **6 et 9** | **σ<sub>SPI≥6 ∧ SPI≤9</sub>(Student)** | les 4 |
| 6 | **tous** les employés | **σ<sub>TRUE</sub>(Employee)** ou simplement **Employee** | les 4 |
| 7 | Salary **> 10000** | **σ<sub>Salary>10000</sub>(Employee)** | Mayur, Hardik, Ajay |
| 8 | **HR** et Salary **> 20000** | **σ<sub>Dept='HR' ∧ Salary>20000</sub>(Employee)** | Mayur |
| 9 | **HR ou Admin** | **σ<sub>Dept='HR' ∨ Dept='Admin'</sub>(Employee)** | Mayur, Hardik, Ajay |
| 10 | Salary entre **10000 et 25000** et **HR** | **σ<sub>Salary≥10000 ∧ Salary≤25000 ∧ Dept='HR'</sub>(Employee)** | Mayur, Hardik |

### Projection seule

| # | Requête | Algèbre | Résultat |
|---|---|---|---|
| 11 | RollNo, Name, SPI | **∏<sub>RollNo, Name, SPI</sub>(Student)** | 4 lignes |
| 12 | Name, SPI | **∏<sub>Name, SPI</sub>(Student)** | 4 lignes |
| 13 | Name | **∏<sub>Name</sub>(Student)** | Raj, Meet, Harsh, Punit |
| 14 | le nom de **toutes les branches** | **∏<sub>Branch</sub>(Student)** | CE, ME, EE (**3**) |
| 15 | EmpID et Name | **∏<sub>EmpID, Name</sub>(Employee)** | 4 lignes |
| 16 | Name et Salary | **∏<sub>Name, Salary</sub>(Employee)** | 4 lignes |
| 17 | Name | **∏<sub>Name</sub>(Employee)** | 4 noms |
| 18 | le nom de **tous les départements** | **∏<sub>Dept</sub>(Employee)** | Sales, HR, Admin (**3**) |

### Projection + Selection

| # | Requête | Algèbre | Résultat |
|---|---|---|---|
| 19 | RollNo, Name, SPI des **CE** | **∏<sub>RollNo, Name, SPI</sub>(σ<sub>Branch='CE'</sub>(Student))** | 101 Raj 6, 104 Punit 9 |
| 20 | Name, Branch : SPI **> 8** et **CE** | **∏<sub>Name, Branch</sub>(σ<sub>SPI>8 ∧ Branch='CE'</sub>(Student))** | Punit CE |
| 21 | Name, Branch, SPI : (**CE ou ME**) et SPI **> 8** | **∏<sub>Name, Branch, SPI</sub>(σ<sub>(Branch='CE' ∨ Branch='ME') ∧ SPI>8</sub>(Student))** | Punit CE 9 |
| 22 | Name, Branch : SPI entre **7 et 9** | **∏<sub>Name, Branch</sub>(σ<sub>SPI≥7 ∧ SPI≤9</sub>(Student))** | Meet ME, Harsh EE, Punit CE |
| 23 | Name : **HR** et salary **> 20000** | **∏<sub>Name</sub>(σ<sub>Dept='HR' ∧ Salary>20000</sub>(Employee))** | Mayur |
| 24 | Name des **Admin et HR** | **∏<sub>Name</sub>(σ<sub>Dept='Admin' ∨ Dept='HR'</sub>(Employee))** | Mayur, Hardik, Ajay |
| 25 | Name, Salary : (**HR ou Admin**) et salary **> 15000** | **∏<sub>Name, Salary</sub>(σ<sub>(Dept='HR' ∨ Dept='Admin') ∧ Salary>15000</sub>(Employee))** | Mayur 25000, Ajay 20000 |
| 26 | Name, Dept : salary entre **15000 et 30000** | **∏<sub>Name, Dept</sub>(σ<sub>Salary≥15000 ∧ Salary≤30000</sub>(Employee))** | Mayur HR, Hardik HR, Ajay Admin |

> **Deux pièges des exercices :**
> - « the Name of all **Admin and HR** Dept's employees » se traduit par
>   **∨ (OR)** : un employé ne peut pas être dans **les deux** départements à
>   la fois, `Dept='Admin' ∧ Dept='HR'` donnerait un résultat **vide**.
> - Dans le n° 21 et le n° 25, les **parenthèses** sont obligatoires :
>   `(A ∨ B) ∧ C` ≠ `A ∨ (B ∧ C)`. Lu `CE ∨ (ME ∧ SPI>8)`, le n° 21
>   garderait à tort **Raj** (CE, SPI 6) ; lu `HR ∨ (Admin ∧ Salary>15000)`,
>   le n° 25 garderait à tort **Hardik** (HR, 15000).

---

## Pièges d'exam

- **σ** = lignes, **∏** = colonnes ; **∏ supprime les doublons**
  (∏<sub>Branch</sub> → 3 lignes, pas 4).
- « **the detail of** » = **toutes les colonnes** → σ seul, **pas de ∏**.
- Ordre : **∏(σ(R))** — on projette **après** avoir filtré ; si on projette
  d'abord, la colonne de la condition peut avoir disparu.
- **∧ = AND, ∨ = OR** ; « X **and** Y department » = **∨** ; parenthèses
  autour des ∨ combinés avec un ∧.
- « **between** a and b » : **≥ a ∧ ≤ b** (bornes incluses) dans le corrigé.
- Les valeurs texte entre **apostrophes** : `Branch='CE'`, pas les nombres :
  `SPI>8`.
- SQL : `SELECT` ↔ **∏**, `WHERE` ↔ **σ**.

## À retenir

- σ<sub>condition</sub>(Relation), opérateurs = <> < > <= >= ∧ ∨.
- ∏<sub>attributs</sub>(Relation), doublons supprimés.
- Combiner : **∏<sub>colonnes</sub>(σ<sub>condition</sub>(Relation))**.
- Opérations à venir : ×, ⋈, outer joins (W10), ∪ ∩ −, ÷, ρ.
