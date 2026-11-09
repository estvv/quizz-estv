# Database Design — Week 10 · Relational Algebra 3 : Cross Product & Joins

**Cours** : Lecture 15, *Relational Algebra Operations – 3* : le **Cartesian
(Cross) Product ×**, la **Natural / Inner Join ⋈** et les **Outer Joins**
(**left ⟕, right ⟖, full ⟗**), avec des requêtes sur **plusieurs tables**
(Student, Department, Academic, Guide, Faculty).

> **En bref.** **R1 × R2** associe **chaque** tuple de R1 à **chaque** tuple
> de R2 : **attributs = attributs de R1 + attributs de R2**, **tuples = n1 ×
> n2**. La **natural join R1 ⋈ R2** = cross product, puis on **garde les
> lignes où les attributs communs sont égaux**, puis on **supprime la colonne
> en double** ; il faut **au moins un attribut commun**. Les **outer joins**
> récupèrent les lignes **sans correspondance** et complètent avec **NULL** :
> **left** garde tout R1, **right** garde tout R2, **full** garde les deux.

---

## 1. Cartesian Product (Cross Product) ×

| | |
|---|---|
| **Symbol** | **×** (Cross) |
| **Notation** | **Relation-1 (R1) × Relation-2 (R2)** ou **Algebra-1 × Algebra-2** |
| **Operation** | multiplie **chaque tuple** de R1 par **chaque tuple** de R2 |
| **Attributs du résultat** | attributs de R1 **+** attributs de R2 |
| **Tuples du résultat** | tuples de R1 **×** tuples de R2 |

Si les deux relations ont un attribut **du même nom**, on les distingue par
**relation-name.attribute-name** : `Student.RNo`, `Result.RNo`.

```diagram
{
  "title": "(Student) × (Result) : 2 × 2 = 4 tuples, 3 + 2 = 5 attributs. Chaque étudiant est associé à CHAQUE résultat, même ceux qui ne sont pas les siens.",
  "nodes": [
    { "id": "s", "x": 90, "y": 30, "shape": "table", "size": 11, "label": "Student", "rows": [["RNo","Name","Branch"],["101","Raju","CE"],["102","Mitesh","ME"]], "cols": [45,55,50] },
    { "id": "r", "x": 90, "y": 150, "shape": "table", "size": 11, "label": "Result", "rows": [["RNo","SPI"],["101","8"],["102","9"]], "cols": [45,40] },
    { "id": "o", "x": 420, "y": 70, "shape": "table", "size": 11, "label": "(Student) × (Result)", "rows": [["Student.RNo","Name","Branch","Result.RNo","SPI"],["101","Raju","CE","101","8"],["101","Raju","CE","102","9"],["102","Mitesh","ME","101","8"],["102","Mitesh","ME","102","9"]], "mark": [1,4], "cols": [80,55,50,75,35] }
  ],
  "edges": [ { "from": "s", "to": "o", "label": "×" }, { "from": "r", "to": "o" } ]
}
```

On peut faire le produit **d'expressions** :

| Requête | Algèbre | Résultat |
|---|---|---|
| seulement RNo, Name, Branch de Student et RNo, SPI, BL de Result | **∏<sub>RNo, Name, Branch</sub>(Student) × ∏<sub>RNo, SPI, BL</sub>(Result)** | 2 × 2 = 4 tuples, 6 attributs |
| seulement les étudiants **CE en Sem 3** et les résultats **SPI > 7 et BL < 1** | **σ<sub>Branch='CE' ∧ Sem=3</sub>(Student) × σ<sub>SPI>7 ∧ BL<1</sub>(Result)** | 2 étudiants (Raju, Om) × 1 résultat (103) = **2** tuples |

> Le cross product **ne vérifie rien** : il fabrique des lignes
> **incohérentes** (Raju associé au SPI de l'étudiant 102). C'est la jointure
> qui les élimine.

## 2. Natural Join / Inner Join ⋈

| | |
|---|---|
| **Symbol** | **⋈** |
| **Notation** | **Relation-1 (R1) ⋈ Relation-2 (R2)** ou **Algebra-1 ⋈ Algebra-2** |
| **Operation** | récupère les **données cohérentes** de plusieurs relations : combine les lignes qui **satisfont la condition** (valeurs égales sur l'attribut commun) |
| **Condition** | il faut **au moins un attribut (colonne) commun** aux deux relations |

```flowchart
{
  "title": "Les 3 étapes d'une natural join.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "R1 ⋈ R2" },
    { "id": "a", "kind": "process", "label": "Step 1 : Cartesian product R1 × R2" },
    { "id": "b", "kind": "process", "label": "Step 2 : supprimer les tuples incohérents\n(R1.attr commun ≠ R2.attr commun)" },
    { "id": "c", "kind": "process", "label": "Step 3 : supprimer la colonne en double" },
    { "id": "e", "kind": "end", "label": "Résultat" }
  ],
  "edges": [ { "from": "s", "to": "a" }, { "from": "a", "to": "b" }, { "from": "b", "to": "c" }, { "from": "c", "to": "e" } ]
}
```

```diagram
{
  "title": "(Student) ⋈ (Result) : Result ne contient que 101 et 103. Seul 101 existe des deux côtés → une seule ligne.",
  "nodes": [
    { "id": "s", "x": 80, "y": 30, "shape": "table", "size": 11, "label": "Student", "rows": [["RNo","Name","Branch"],["101","Raju","CE"],["102","Mitesh","ME"]], "cols": [45,55,50] },
    { "id": "r", "x": 80, "y": 150, "shape": "table", "size": 11, "label": "Result", "rows": [["RNo","SPI"],["101","8"],["103","9"]], "cols": [45,40] },
    { "id": "x", "x": 360, "y": 60, "shape": "table", "size": 11, "label": "Step 1 : ×  (4 tuples)", "rows": [["S.RNo","Name","Branch","R.RNo","SPI"],["101","Raju","CE","101","8"],["101","Raju","CE","103","9"],["102","Mitesh","ME","101","8"],["102","Mitesh","ME","103","9"]], "mark": [1], "cols": [45,55,50,45,35] },
    { "id": "o", "x": 660, "y": 60, "shape": "table", "size": 11, "label": "Step 2 (S.RNo = R.RNo) + 3", "rows": [["RNo","Name","Branch","SPI"],["101","Raju","CE","8"]], "cols": [45,50,50,35] }
  ],
  "edges": [ { "from": "s", "to": "x" }, { "from": "r", "to": "x" }, { "from": "x", "to": "o" } ]
}
```

Deuxième exemple : **(Branch) ⋈ (Faculty)** sur l'attribut commun **BID** :

| BID | BName | HOD | FID | FName |
|---|---|---|---|---|
| 1 | CE | Shah | 101 | Raj |
| 2 | ME | Patel | 103 | Meet |

Équivalent SQL : `SELECT * FROM Student NATURAL JOIN Result;` ou
`SELECT … FROM Student s JOIN Result r ON s.RNo = r.RNo;`.

## 3. Requêtes sur plusieurs tables

Le schéma des exemples et exercices :

```diagram
{
  "title": "Les 5 relations. Les attributs communs (Rno, Did, Fid) servent aux natural joins.",
  "nodes": [
    { "id": "st", "x": 120, "y": 40, "w": 270, "label": "Student (Rno, Sname, Address, City, Mobile)", "tone": "sky", "filled": true, "size": 11 },
    { "id": "ac", "x": 120, "y": 140, "w": 220, "label": "Academic (Rno, Did, SPI, CPI, Backlog)", "tone": "amber", "filled": true, "size": 11 },
    { "id": "de", "x": 120, "y": 240, "w": 220, "label": "Department (Did, Dname)", "tone": "emerald", "filled": true, "size": 11 },
    { "id": "gu", "x": 450, "y": 40, "w": 220, "label": "Guide (Rno, PName, Fid)", "tone": "violet", "filled": true, "size": 11 },
    { "id": "fa", "x": 450, "y": 200, "w": 240, "label": "Faculty (Fid, Fname, Subject, Did, Salary)", "tone": "rose", "filled": true, "size": 11 }
  ],
  "edges": [
    { "from": "st", "to": "ac", "arrow": "none", "label": "Rno" },
    { "from": "ac", "to": "de", "arrow": "none", "label": "Did" },
    { "from": "st", "to": "gu", "arrow": "none", "label": "Rno" },
    { "from": "gu", "to": "fa", "arrow": "none", "label": "Fid" },
    { "from": "fa", "to": "de", "arrow": "none", "label": "Did" }
  ]
}
```

**Méthode** : repérer **les tables qui contiennent** les colonnes demandées et
celles de la condition ; les **joindre** (en suivant les attributs communs) ;
appliquer **σ** ; puis **∏**.

| Requête (slides) | Algèbre |
|---|---|
| nom des étudiants avec leur département et leur SPI, pour le département **CE** | **∏<sub>Sname, Dname, SPI</sub>(σ<sub>Dname='CE'</sub>(Student ⋈ (Department ⋈ Academic)))** |
| nom des étudiants et nom de leur projet, dont le guide est « K. R » | **∏<sub>Sname, PName</sub>(σ<sub>Fname='K. R'</sub>(Student ⋈ (Guide ⋈ Faculty)))** |

> La slide écrit le guide « K. R » dans la question et « K.H » dans la
> réponse : c'est la même requête, seule la valeur change.

### Exercices (corrigé proposé)

| # | Requête | Algèbre relationnelle |
|---|---|---|
| 1 | nom des étudiants et département, **backlog 0** | **∏<sub>Sname, Dname</sub>(σ<sub>Backlog=0</sub>(Student ⋈ Academic ⋈ Department))** |
| 2 | nom, département et salaire des enseignants : salaire **> 25000** et département **CE** | **∏<sub>Fname, Dname, Salary</sub>(σ<sub>Salary>25000 ∧ Dname='CE'</sub>(Faculty ⋈ Department))** |
| 3 | nom des enseignants de **CE et ME** dont le salaire **> 50000** | **∏<sub>Fname</sub>(σ<sub>(Dname='CE' ∨ Dname='ME') ∧ Salary>50000</sub>(Faculty ⋈ Department))** |
| 4 | nom des étudiants et projet, étudiants de **CE** dont le guide est « Z.Z. Patel » | **∏<sub>Sname, PName</sub>(σ<sub>Dname='CE' ∧ Fname='Z.Z. Patel'</sub>(Student ⋈ Academic ⋈ Department ⋈ Guide ⋈ Faculty))** |
| 5 | nom et département des enseignants de **CE** qui enseignent **« CPU »** avec un salaire **> 25000** | **∏<sub>Fname, Dname</sub>(σ<sub>Dname='CE' ∧ Subject='CPU' ∧ Salary>25000</sub>(Faculty ⋈ Department))** |
| 6 | nom des étudiants et département, projet **« Hackathon »** avec le guide « I. I. Shah » | **∏<sub>Sname, Dname</sub>(σ<sub>PName='Hackathon' ∧ Fname='I. I. Shah'</sub>(Student ⋈ Academic ⋈ Department ⋈ Guide ⋈ Faculty))** |

> **Subtilité (n° 4 et 6) :** une natural join égalise **tous** les attributs
> de même nom. **Did** est à la fois dans Academic et dans Faculty : joindre
> les cinq tables d'un coup impose donc que le **guide soit du même
> département que l'étudiant**. Si l'énoncé ne le garantit pas, on joint
> séparément : **∏<sub>Sname, PName</sub>(σ<sub>Dname='CE'</sub>(Student ⋈
> Academic ⋈ Department) ⋈ ∏<sub>Rno, PName</sub>(σ<sub>Fname='Z.Z.
> Patel'</sub>(Guide ⋈ Faculty)))**. Au quiz, la forme des slides (tout
> joindre, puis σ, puis ∏) est attendue.

## 4. Outer Joins

Dans une natural join, les lignes **sans correspondance disparaissent**. Pour
les garder, on utilise une **outer join** ; les attributs manquants sont
**complétés par NULL**. Il faut **un attribut commun**.

| Outer join | Symbole | Garde toutes les lignes de… |
|---|---|---|
| **Left Outer Join** | **⟕** | la relation de **gauche** (R1) |
| **Right Outer Join** | **⟖** | la relation de **droite** (R2) |
| **Full Outer Join** | **⟗** | des **deux** (left + right) |

```diagram
{
  "title": "Student (101 Raj, 102 Meet) et Result (101, 103). 101 correspond ; 102 n'a pas de résultat ; 103 n'a pas d'étudiant.",
  "nodes": [
    { "id": "s", "x": 80, "y": 30, "shape": "table", "size": 11, "label": "Student", "rows": [["RollNo","Name","Branch"],["101","Raj","CE"],["102","Meet","ME"]], "cols": [55,45,50] },
    { "id": "r", "x": 80, "y": 150, "shape": "table", "size": 11, "label": "Result", "rows": [["RollNo","SPI"],["101","8"],["103","9"]], "cols": [55,40] },
    { "id": "l", "x": 330, "y": 30, "shape": "table", "size": 11, "label": "Student ⟕ Result", "rows": [["RollNo","Name","Branch","SPI"],["101","Raj","CE","8"],["102","Meet","ME","NULL"]], "mark": [2], "cols": [55,45,50,45] },
    { "id": "rr", "x": 330, "y": 150, "shape": "table", "size": 11, "label": "Student ⟖ Result", "rows": [["RollNo","Name","Branch","SPI"],["101","Raj","CE","8"],["103","NULL","NULL","9"]], "mark": [2], "cols": [55,45,50,45] },
    { "id": "f", "x": 590, "y": 80, "shape": "table", "size": 11, "label": "Student ⟗ Result", "rows": [["RollNo","Name","Branch","SPI"],["101","Raj","CE","8"],["102","Meet","ME","NULL"],["103","NULL","NULL","9"]], "mark": [2,3], "cols": [55,45,50,45] }
  ],
  "edges": []
}
```

| Expression | Résultat |
|---|---|
| **(Student) ⋈ (Result)** | 101 Raj CE 8 (une seule ligne) |
| **(Student) ⟕ (Result)** | 101 Raj CE 8 ; **102 Meet ME NULL** |
| **(Student) ⟖ (Result)** | 101 Raj CE 8 ; **103 NULL NULL 9** |
| **(Student) ⟗ (Result)** | 101 ; 102 (SPI NULL) ; 103 (Name, Branch NULL) |
| **∏<sub>RollNo, Name, SPI</sub>((Student) ⟕ (Result))** | 101 Raj 8 ; 102 Meet NULL |
| **∏<sub>RollNo, Name, SPI</sub>((Student) ⟖ (Result))** | 101 Raj 8 ; 103 NULL 9 |

### Les « Exercise » des slides : inverser l'ordre

| Expression | Résultat |
|---|---|
| **(Result) ⟕ (Student)** | garde **tout Result** : 101 → Raj CE 8 ; **103 → NULL NULL 9** (= Student ⟖ Result) |
| **(Result) ⟖ (Student)** | garde **tout Student** : 101 ; **102 Meet ME NULL** (= Student ⟕ Result) |
| **(Result) ⟗ (Student)** | **mêmes lignes** que Student ⟗ Result (la full outer join est symétrique) |

> **À retenir :** R1 ⟕ R2 = R2 ⟖ R1 (mêmes lignes, colonnes dans un autre
> ordre). La **full** outer join ne dépend pas de l'ordre.

Équivalents SQL : `LEFT JOIN`, `RIGHT JOIN`, `FULL OUTER JOIN`.

---

## Pièges d'exam

- **×** : tuples **multipliés** (n1 × n2), attributs **additionnés** ; aucune
  condition, lignes incohérentes incluses.
- **⋈** = × + garder les égalités sur l'attribut commun + supprimer la
  colonne doublon ; **pas d'attribut commun = pas de natural join**.
- Une natural join égalise **tous** les attributs de même nom (Did !).
- Outer join : les lignes sans correspondance reçoivent **NULL** ;
  **left** = tout le gauche, **right** = tout le droit, **full** = tout.
- R1 ⟕ R2 ≡ R2 ⟖ R1.
- Requête multi-tables : **joindre → σ → ∏**.

## À retenir

- R1 × R2 : attributs R1 + R2, tuples R1 × R2 ; `Relation.attribut` pour
  lever l'ambiguïté.
- R1 ⋈ R2 : 3 étapes (×, filtre, colonne doublon).
- ⟕ ⟖ ⟗ : NULL pour les lignes sans correspondance.
- Forme type : **∏<sub>colonnes</sub>(σ<sub>condition</sub>(T1 ⋈ T2 ⋈ …))**.
