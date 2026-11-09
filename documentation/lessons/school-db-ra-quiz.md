# Database Design — Quiz du 11/11 · Algèbre relationnelle (notation)

Fiche de révision pour le **quiz du 11 novembre** : la **notation de
l'algèbre relationnelle** vue en **Lectures 13 à 15** (semaines 7, 9 et 10),
et sa **correspondance avec SQL**. Les leçons des semaines 7, 9 et 10
détaillent chaque opération ; ici, tout est réuni pour **écrire vite et sans
erreur** une expression à partir d'une phrase.

> **En bref.** Une requête se lit **de l'intérieur vers l'extérieur** :
> **joindre** les tables (⋈), **filtrer** les lignes (σ), **garder** les
> colonnes (∏). Forme type : **∏<sub>colonnes</sub>(σ<sub>condition</sub>(T1
> ⋈ T2))**. En SQL : `SELECT colonnes FROM T1 NATURAL JOIN T2 WHERE
> condition`.

**Méthode :**

1. Faire ce quiz une première fois à froid : **Toutes** puis **Aléatoire**.
2. Pour chaque erreur, relire la ligne correspondante du **tableau des
   opérations** ci-dessous, puis la leçon de la semaine.
3. **Réécrire à la main** les 26 exercices de la Week 9 et les 6 de la Week
   10 sans regarder le corrigé.

---

## 1. Toutes les opérations

| Opération | Symbole | Notation | Ce qu'elle fait | Résultat |
|---|---|---|---|---|
| **Selection** | **σ** | σ<sub>condition</sub>(R) | garde les **lignes** qui vérifient la condition | mêmes colonnes, **≤** lignes |
| **Projection** | **∏** (π) | ∏<sub>A, B</sub>(R) | garde les **colonnes** listées, **supprime les doublons** | ≤ colonnes, **≤** lignes |
| **Cross product** | **×** | R1 × R2 | chaque tuple de R1 avec chaque tuple de R2 | colonnes **R1 + R2**, lignes **R1 × R2** |
| **Natural / inner join** | **⋈** | R1 ⋈ R2 | × puis garde les lignes où les **attributs communs sont égaux**, puis supprime la colonne en double | il faut **un attribut commun** |
| **Left outer join** | **⟕** | R1 ⟕ R2 | join + **toutes les lignes de R1** (NULL à droite) | |
| **Right outer join** | **⟖** | R1 ⟖ R2 | join + **toutes les lignes de R2** (NULL à gauche) | |
| **Full outer join** | **⟗** | R1 ⟗ R2 | join + toutes les lignes **des deux** | |
| **Union** | **∪** | R1 ∪ R2 | lignes de R1 **ou** de R2 (annoncé, Lecture 14) | |
| **Intersection** | **∩** | R1 ∩ R2 | lignes de R1 **et** de R2 (annoncé) | |
| **Set difference** | **−** | R1 − R2 | lignes de R1 **pas** dans R2 (« minus », annoncé) | |
| **Division** | **÷** | R1 ÷ R2 | divise une relation par une autre (annoncé) | |
| **Rename** | **ρ** | ρ<sub>nouveau</sub>(R) | renomme une colonne ou une table (annoncé) | |

**Opérateurs dans une condition σ** : **=, <> (≠), <, >, <=, >=**, et les
connecteurs **∧ (AND)**, **∨ (OR)**, **NOT**.

## 2. Algèbre ↔ SQL

| Algèbre relationnelle | SQL |
|---|---|
| σ<sub>Branch='CE'</sub>(Student) | `SELECT * FROM Student WHERE Branch = 'CE';` |
| ∏<sub>Name, SPI</sub>(Student) | `SELECT DISTINCT Name, SPI FROM Student;` |
| ∏<sub>Name</sub>(σ<sub>SPI>8</sub>(Student)) | `SELECT DISTINCT Name FROM Student WHERE SPI > 8;` |
| σ<sub>(Dept='HR' ∨ Dept='Admin') ∧ Salary>15000</sub>(Employee) | `… WHERE (Dept = 'HR' OR Dept = 'Admin') AND Salary > 15000;` |
| Student × Result | `SELECT * FROM Student CROSS JOIN Result;` (ou `FROM Student, Result`) |
| Student ⋈ Result | `SELECT * FROM Student NATURAL JOIN Result;` |
| Student ⟕ Result | `SELECT * FROM Student NATURAL LEFT JOIN Result;` |
| Student ⟖ Result | `… RIGHT JOIN …` |
| Student ⟗ Result | `… FULL OUTER JOIN …` |

```diagram
{
  "title": "Le piège du mot SELECT : en SQL il choisit les COLONNES (= ∏) ; c'est le WHERE qui choisit les LIGNES (= σ).",
  "nodes": [
    { "id": "q", "x": 330, "y": 30, "w": 560, "h": 40, "label": "SELECT Name, Branch   FROM Student NATURAL JOIN Academic   WHERE SPI > 8", "tone": "neutral", "filled": true, "size": 12 },
    { "id": "p", "x": 120, "y": 120, "w": 150, "h": 50, "label": "∏ Name, Branch", "tone": "sky", "filled": true, "bold": true },
    { "id": "j", "x": 330, "y": 120, "w": 190, "h": 50, "label": "Student ⋈ Academic", "tone": "amber", "filled": true, "bold": true },
    { "id": "s", "x": 540, "y": 120, "w": 150, "h": 50, "label": "σ SPI>8", "tone": "rose", "filled": true, "bold": true },
    { "id": "r", "x": 330, "y": 210, "w": 520, "h": 40, "label": "∏ Name, Branch ( σ SPI>8 ( Student ⋈ Academic ) )", "tone": "emerald", "filled": true, "bold": true }
  ],
  "edges": [
    { "from": "q", "to": "p", "label": "SELECT" }, { "from": "q", "to": "j", "label": "FROM" }, { "from": "q", "to": "s", "label": "WHERE" },
    { "from": "p", "to": "r" }, { "from": "j", "to": "r" }, { "from": "s", "to": "r" }
  ]
}
```

## 3. Traduire une phrase

| Mot de l'énoncé | Traduction |
|---|---|
| « Display **the detail of** … » | **toutes les colonnes** → **pas de ∏** |
| « Display **Name and SPI** of … » | **∏<sub>Name, SPI</sub>** |
| « … **whose / having / belongs to** … » | une condition **σ** |
| « … **and** … » entre deux conditions sur des colonnes **différentes** | **∧** |
| « all **'Admin' and 'HR'** employees » (une même colonne, deux valeurs) | **∨** (personne n'est dans les deux) |
| « **either** X **or** Y » | **∨** |
| « **more than** 8 » / « **less than** 8 » | **> 8** / **< 8** |
| « **between** 6 and 9 » | **≥ 6 ∧ ≤ 9** (corrigé du cours) |
| « with their **department name** » (colonne d'une autre table) | **⋈** avec la table qui la contient |

```flowchart
{
  "title": "De la phrase à l'expression, de l'intérieur vers l'extérieur.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "Phrase" },
    { "id": "a", "kind": "process", "label": "Tables nécessaires ? (colonnes + condition)" },
    { "id": "d", "kind": "decision", "label": "Plusieurs tables ?" },
    { "id": "j", "kind": "process", "label": "T1 ⋈ T2 ⋈ … (attributs communs)" },
    { "id": "c", "kind": "process", "label": "σ condition ( … )" },
    { "id": "d2", "kind": "decision", "label": "Toutes les colonnes ?" },
    { "id": "p", "kind": "process", "label": "∏ colonnes ( … )" },
    { "id": "e", "kind": "end", "label": "Expression" }
  ],
  "edges": [
    { "from": "s", "to": "a" }, { "from": "a", "to": "d" },
    { "from": "d", "to": "j", "branch": "yes" }, { "from": "d", "to": "c", "branch": "no" },
    { "from": "j", "to": "c" }, { "from": "c", "to": "d2" },
    { "from": "d2", "to": "e", "branch": "yes" }, { "from": "d2", "to": "p", "branch": "no" },
    { "from": "p", "to": "e" }
  ]
}
```

## 4. Compter les lignes et les colonnes

| Expression | Colonnes | Lignes |
|---|---|---|
| σ<sub>c</sub>(R) | = colonnes de R | **≤** lignes de R |
| ∏<sub>liste</sub>(R) | = taille de la liste | **≤** lignes de R ; **=** si la liste contient une **clé** |
| R1 × R2 | **c1 + c2** | **n1 × n2** |
| R1 ⋈ R2 (1 attribut commun) | **c1 + c2 − 1** | ≤ n1 × n2 (les paires cohérentes) |
| R1 ⟕ R2 | c1 + c2 − 1 | ≥ lignes de R1 ⋈ R2 ; **toutes** les lignes de R1 y sont |

Exemple : Student (3 colonnes, 4 lignes) × Result (2 colonnes, 3 lignes) →
**5 colonnes, 12 lignes**.

## 5. Les propriétés

| Propriété | Vrai ? |
|---|---|
| σ<sub>c1</sub>(σ<sub>c2</sub>(R)) = σ<sub>c2</sub>(σ<sub>c1</sub>(R)) | ✅ σ est **commutatif** |
| σ<sub>c1</sub>(σ<sub>c2</sub>(R)) = σ<sub>c1 ∧ c2</sub>(R) | ✅ **cascade** de σ |
| ∏<sub>A</sub>(∏<sub>A, B</sub>(R)) = ∏<sub>A</sub>(R) | ✅ (la liste intérieure contient A) |
| ∏<sub>A, B</sub>(∏<sub>A</sub>(R)) | ❌ impossible : B a disparu — **∏ n'est pas commutatif** |
| R1 ⟕ R2 = R2 ⟖ R1 | ✅ (mêmes lignes) |
| R1 ⟗ R2 = R2 ⟗ R1 | ✅ |
| L'algèbre relationnelle est **procédurale**, SQL **non procédural** | ✅ |

## 6. Entraînement complet sur un jeu de données

| Rno | Sname | City |
|---|---|---|
| 1 | Ana | Seoul |
| 2 | Ben | Incheon |
| 3 | Cho | Seoul |

| Rno | SPI | Backlog |
|---|---|---|
| 1 | 9 | 0 |
| 2 | 7 | 2 |
| 4 | 8 | 0 |

*Student (gauche) et Academic (droite), attribut commun **Rno**.*

| Requête | Expression | Résultat |
|---|---|---|
| étudiants de Seoul | σ<sub>City='Seoul'</sub>(Student) | Ana, Cho |
| noms et SPI (avec la jointure) | ∏<sub>Sname, SPI</sub>(Student ⋈ Academic) | Ana 9, Ben 7 |
| noms des étudiants sans backlog | ∏<sub>Sname</sub>(σ<sub>Backlog=0</sub>(Student ⋈ Academic)) | Ana |
| tous les étudiants avec leur SPI s'il existe | ∏<sub>Sname, SPI</sub>(Student ⟕ Academic) | Ana 9, Ben 7, **Cho NULL** |
| tous les résultats avec le nom s'il existe | ∏<sub>Rno, Sname, SPI</sub>(Student ⟖ Academic) | 1 Ana 9, 2 Ben 7, **4 NULL 8** |
| Student × Academic | — | **3 × 3 = 9** lignes, **3 + 3 = 6** colonnes |
| Student ⋈ Academic | — | **2** lignes (Rno 1 et 2), **5** colonnes |
| Student ⟗ Academic | — | **4** lignes (1, 2, 3, 4) |

---

## Pièges classiques du quiz

| Affirmation | Vrai / Faux |
|---|---|
| σ choisit des colonnes | **Faux** : des lignes (∏ choisit les colonnes) |
| ∏ peut renvoyer moins de lignes que la relation | **Vrai** : il supprime les doublons |
| Le SELECT de SQL correspond à σ | **Faux** : à ∏ ; σ ↔ WHERE |
| R1 × R2 a n1 + n2 lignes | **Faux** : n1 × n2 |
| Une natural join est possible sans attribut commun | **Faux** |
| Dans R1 ⟕ R2, les lignes de R2 sans correspondance sont gardées | **Faux** : celles de **R1** |
| « Admin and HR employees » se traduit avec ∧ | **Faux** : ∨ |
| ∏<sub>Name</sub>(σ<sub>SPI>8</sub>(Student)) = σ<sub>SPI>8</sub>(∏<sub>Name</sub>(Student)) | **Faux** : après ∏<sub>Name</sub>, SPI n'existe plus |
| (A ∨ B) ∧ C = A ∨ (B ∧ C) | **Faux** : mettre les parenthèses |
| La full outer join dépend de l'ordre des tables | **Faux** |
