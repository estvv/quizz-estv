# Database Design — Week 4 · Keys & ERD notations

**Cours** : Lecture 07, *Key and ERD Notations*. Le vocabulaire d'une table
(relation, attribute, tuple, degree, cardinality, domain), les **clés** (super
key, candidate key, primary key, alternate key, foreign key), un exercice
complet (E-R diagram d'une assurance auto, puis ses tables) et la notation
**Crow's Foot**.

> **En bref.** Une **super key** identifie chaque ligne ; une **candidate key**
> est une super key **minimale** ; la **primary key** est la candidate key
> **choisie** par le concepteur ; les autres candidate keys sont des
> **alternate keys**. Une **foreign key** dans la table **child** pointe vers
> la primary key de la table **parent**. Au quiz, sache **reconnaître chaque
> clé dans une table** et **lire les symboles Crow's Foot**.

Les termes en **gras anglais** sont ceux qui tombent au quiz : apprends-les
tels quels.

---

## 1. La structure d'une base relationnelle

Une **database** est une collection de **tables** (relations), chacune avec un
**nom unique**.

| Terme | Synonymes | Définition |
|---|---|---|
| **Table** | **Relation** | objet qui contient les données d'un **sujet précis** ; faite de lignes et de colonnes |
| **Column** | **Attribute**, field | composant **vertical** ; a un **nom** et un **type** (`varchar`, `decimal`, `integer`, `datetime`…) |
| **Record** | **Tuple**, **row** | composant **horizontal** : une valeur pour chaque colonne |
| **Degree** | — | **nombre de colonnes** |
| **Cardinality** | — | **nombre de lignes** (tuples) |
| **Domain** | — | ensemble de **toutes les valeurs possibles** d'une colonne |

```diagram
{
  "title": "Student : degree = 5 (colonnes), cardinality = 7 (lignes). Le domain de Branch est {CE, CI, ME, EE}.",
  "nodes": [
    { "id": "t", "x": 300, "y": 130, "shape": "table", "size": 12, "tone": "sky", "label": "Student",
      "rows": [["RollNo","Name","Branch","Semester","SPI"],["101","Raju","CE","3","8"],["102","Mitesh","CI","3","7"],["103","Mayur","CE","3","6"],["104","Nilesh","EE","3","9"],["105","Hitesh","CI","3","7"],["106","Tarun","ME","3","8"],["107","Suresh","CE","3","9"]],
      "cols": [70, 70, 70, 80, 50] },
    { "id": "a", "x": 300, "y": -20, "shape": "note", "tone": "amber", "size": 12, "label": "Attributes = titres des colonnes · Degree = 5" },
    { "id": "r", "x": 600, "y": 130, "shape": "note", "tone": "emerald", "size": 12, "label": "Rows = tuples = records\nCardinality = 7" },
    { "id": "ra", "x": 470, "y": 130, "shape": "text" }
  ],
  "edges": [
    { "from": "a", "to": "t", "dashed": true, "tone": "amber" },
    { "from": "r", "to": "ra", "dashed": true, "tone": "emerald" }
  ]
}
```

> **Piège :** en base de données, **cardinality d'une table = nombre de
> lignes** et **degree = nombre de colonnes**. Ne confonds pas avec la
> *mapping cardinality* d'une relationship (1:1, 1:N…) vue en semaine 3.

## 2. Les clés

Tous les exemples utilisent la même table `Student` : plusieurs étudiants ont
le même `RollNo` (dans des branches ou semestres différents), mais
l'`EnrollNo` est unique.

```diagram
{
  "title": "La table Student des slides. EnrollNo seul identifie une ligne ; (RollNo, Branch, Sem) aussi.",
  "nodes": [
    { "id": "t", "x": 320, "y": 110, "shape": "table", "size": 12, "tone": "sky", "label": "Student",
      "rows": [["EnrollNo","RollNo","Branch","Sem","SPI","Name","BL"],["190540107001","101","CE","3","8","Raju","0"],["190540107002","102","CE","3","7","Mitesh","1"],["190540106001","101","CI","3","6","Mayur","2"],["190540106002","102","CI","3","9","Nilesh","0"],["180540107001","101","CE","5","7","Hitesh","1"],["180540106001","101","CI","5","8","Tarun","0"],["180540106002","102","CI","5","9","Suresh","0"]],
      "cols": [110, 60, 60, 40, 40, 70, 40] }
  ]
}
```

### Super key

Une **super key** est un **ensemble d'un ou plusieurs attributs** dont les
valeurs **identifient de façon unique chaque record** de la table.

Dans `Student` : `{EnrollNo}`, `{RollNo, Branch, Sem}`, et sur ces données
`{SPI, Name, BL}` sont des super keys. Tout **sur-ensemble** d'une super key
est aussi une super key : `{EnrollNo, Name}`, `{EnrollNo, RollNo, SPI}`…

### Candidate key

- Une **candidate key** est un **sous-ensemble d'une super key**.
- C'est **un seul attribut** ou la **plus petite combinaison** d'attributs
  qui identifie chaque record.
- **La super key minimale est la candidate key** : on ne peut retirer aucun
  attribut sans perdre l'unicité.
- **Toute candidate key est une super key, mais toute super key n'est pas une
  candidate key.**

Dans `Student` : `EnrollNo` et `(RollNo, Branch, Sem)` sont des candidate
keys. `{EnrollNo, Name}` est une super key mais **pas** une candidate key
(`Name` est en trop).

### Primary key

La **primary key** est **la candidate key choisie par le concepteur** pour
identifier les tuples. Ici : `EnrollNo`.

**Règles de la primary key** :

1. elle peut avoir **un ou plusieurs attributs** ;
2. il n'y a **qu'une seule** primary key par table ;
3. sa valeur ne peut **pas être NULL** ;
4. en général, sa valeur **ne change pas** ;
5. **deux lignes ne peuvent pas avoir la même valeur** de primary key.

### Alternate key

Une **alternate key** est une **candidate key qui n'a pas été choisie** comme
primary key. Ici : `(RollNo, Branch, Sem)`.

```diagram
{
  "title": "Les clés s'emboîtent : primary key et alternate keys sont des candidate keys, elles-mêmes des super keys.",
  "groups": [
    { "x": 330, "y": 145, "w": 640, "h": 270, "label": "Super keys (toute combinaison qui identifie une ligne)", "tone": "neutral" },
    { "x": 330, "y": 135, "w": 460, "h": 130, "label": "Candidate keys (super keys minimales)", "tone": "sky" }
  ],
  "nodes": [
    { "id": "pk", "x": 220, "y": 150, "w": 180, "label": "Primary key\nEnrollNo", "tone": "emerald", "filled": true },
    { "id": "ak", "x": 440, "y": 150, "w": 180, "label": "Alternate key\n(RollNo, Branch, Sem)", "tone": "amber", "filled": true },
    { "id": "sk", "x": 330, "y": 245, "w": 360, "shape": "text", "label": "{EnrollNo, Name}, {EnrollNo, SPI, BL}, {RollNo, Branch, Sem, SPI}…" }
  ]
}
```

| Clé | Une phrase |
|---|---|
| **Super key** | identifie chaque ligne, attributs en trop autorisés |
| **Candidate key** | super key **minimale** |
| **Primary key** | candidate key **choisie** ; unique, **jamais NULL** |
| **Alternate key** | candidate key **non choisie** |
| **Foreign key** | attribut(s) qui **référence(nt) la primary key d'une autre table** |

> **Astuce de calcul :** si une table a les attributs A, B, C et que **A est la
> seule candidate key**, les super keys sont A, AB, AC, ABC : **4** (A plus
> n'importe quel sous-ensemble des 2 autres = 2² = 4).

### Foreign key

- Une **foreign key** sert à **relier deux tables**.
- C'est un attribut (ou un groupe d'attributs) d'une table qui **référence la
  primary key d'une autre table**.
- La table qui **contient la foreign key** est la **child table** ; celle qui
  contient la **primary key** est la **parent table**.

```diagram
{
  "title": "Project.EnrollNo est une foreign key vers Student.EnrollNo : Student est la parent table, Project la child table.",
  "nodes": [
    { "id": "s", "x": 150, "y": 70, "shape": "table", "size": 12, "tone": "sky", "label": "Student (parent)",
      "rows": [["EnrollNo (PK)","Name","Branch","Sem"],["190540107001","Raju","CE","3"],["190540107002","Mitesh","CE","3"],["190540107003","Nilesh","CE","3"],["190540107004","Meet","CE","3"]],
      "cols": [110, 60, 55, 40] },
    { "id": "p", "x": 520, "y": 70, "shape": "table", "size": 12, "tone": "violet", "label": "Project (child)",
      "rows": [["ProjectID (PK)","Title","EnrollNo (FK)"],["101","Bank","190540107001"],["102","College","190540107002"],["103","School","190540107003"],["104","Hospital","190540107001"]],
      "cols": [95, 70, 110] }
  ],
  "edges": [
    { "from": "p", "to": "s", "label": "references", "tone": "violet" }
  ]
}
```

> **Piège :** une foreign key **peut se répéter** dans la child table (Raju a
> deux projets, 101 et 104) et elle n'est pas forcément la primary key de la
> child table.

## 3. Exercice ERD 3 : l'assurance auto

**(a)** *Construct an E-R diagram for a car-insurance company whose customers
own one or more cars each. Each car has associated with it zero to any number
of recorded accidents.*

```er
{
  "title": "Solution du professeur : person possède des cars (owns) ; participated relie une person (rôle driver), une car et un accident, avec le damage-amount.",
  "nodes": [
    { "id": "p", "kind": "entity", "label": "person", "x": 120, "y": 200 },
    { "id": "pi", "kind": "key_attribute", "label": "driver-id", "x": 40, "y": 100 },
    { "id": "pa", "kind": "attribute", "label": "address", "x": 140, "y": 60 },
    { "id": "pn", "kind": "attribute", "label": "name", "x": 230, "y": 110 },
    { "id": "o", "kind": "relationship", "label": "owns", "x": 300, "y": 200 },
    { "id": "c", "kind": "entity", "label": "car", "x": 470, "y": 200 },
    { "id": "cl", "kind": "key_attribute", "label": "license", "x": 390, "y": 100 },
    { "id": "cm", "kind": "attribute", "label": "model", "x": 480, "y": 60 },
    { "id": "cy", "kind": "attribute", "label": "year", "x": 570, "y": 110 },
    { "id": "pt", "kind": "relationship", "label": "participated", "x": 470, "y": 360 },
    { "id": "pd", "kind": "attribute", "label": "damage-amount", "x": 470, "y": 460 },
    { "id": "a", "kind": "entity", "label": "accident", "x": 690, "y": 360 },
    { "id": "ar", "kind": "key_attribute", "label": "report-number", "x": 640, "y": 250 },
    { "id": "al", "kind": "attribute", "label": "location", "x": 780, "y": 260 },
    { "id": "ad", "kind": "attribute", "label": "date", "x": 790, "y": 440 }
  ],
  "edges": [
    { "from": "p", "to": "pi" }, { "from": "p", "to": "pa" }, { "from": "p", "to": "pn" },
    { "from": "p", "to": "o" }, { "from": "o", "to": "c" },
    { "from": "c", "to": "cl" }, { "from": "c", "to": "cm" }, { "from": "c", "to": "cy" },
    { "from": "p", "to": "pt", "role": "driver" }, { "from": "c", "to": "pt" }, { "from": "pt", "to": "a" },
    { "from": "pt", "to": "pd" },
    { "from": "a", "to": "ar" }, { "from": "a", "to": "al" }, { "from": "a", "to": "ad" }
  ]
}
```

À remarquer :

- `participated` est une relationship **ternaire** (3 entity sets : person,
  car, accident) ;
- `damage-amount` est un **attribut de la relationship** : le montant dépend
  du conducteur, de la voiture **et** de l'accident, il n'appartient à aucun
  des trois seuls ;
- `driver` est un **rôle** : la person qui participe à l'accident y joue le
  rôle de conducteur.

**(b)** *Construct appropriate tables for the above ER diagram.*

```diagram
{
  "title": "Les tables de la solution. La table d'une relationship reprend les primary keys des entity sets qu'elle relie, plus ses propres attributs.",
  "nodes": [
    { "id": "p", "x": 110, "y": 40, "shape": "table", "size": 12, "tone": "sky", "label": "person", "rows": [["driver-id (PK)","name","address"]], "cols": [105, 60, 70] },
    { "id": "c", "x": 370, "y": 40, "shape": "table", "size": 12, "tone": "sky", "label": "car", "rows": [["license (PK)","year","model"]], "cols": [90, 50, 60] },
    { "id": "a", "x": 640, "y": 40, "shape": "table", "size": 12, "tone": "sky", "label": "accident", "rows": [["report-number (PK)","date","location"]], "cols": [140, 50, 70] },
    { "id": "pt", "x": 370, "y": 220, "shape": "table", "size": 12, "tone": "violet", "label": "participated", "rows": [["driver-id (PK, FK)","license (PK, FK)","report-number (PK, FK)","damage-amount"]], "cols": [135, 120, 170, 115] }
  ],
  "edges": [
    { "from": "pt", "to": "p", "tone": "violet", "dashed": true },
    { "from": "pt", "to": "c", "tone": "violet", "dashed": true },
    { "from": "pt", "to": "a", "tone": "violet", "dashed": true }
  ]
}
```

- person (<u>driver-id</u>, name, address)
- car (<u>license</u>, year, model)
- accident (<u>report-number</u>, date, location)
- participated (<u>driver-id</u>, <u>license</u>, <u>report-number</u>, damage-amount)

> **Attention :** la solution des slides **oublie `owns`**. Si une voiture peut
> avoir plusieurs propriétaires, il faut une table
> `owns (driver-id, license)` ; si elle n'en a qu'un, on ajoute `driver-id`
> comme **foreign key** dans `car`.

**Variante.** On peut aussi modéliser `accident` comme une **weak entity** de
`car` (relation identifiante `Involved`, `ReportNo` en partial key) : la table
`Accident` a alors pour primary key `(LicenseNo, ReportNo)`, avec `LicenseNo`
qui est **à la fois PK et FK**. `Customer —Owns— Car` en 1:N met
`CustomerID` comme FK `NOT NULL` dans `Car` (participation totale).

## 4. La notation Crow's Foot

La notation **Crow's Foot** (« patte de corbeau ») est une autre façon de
dessiner un ERD : les entités sont des **boîtes** avec leurs attributs, et la
cardinalité est dessinée **au bout de chaque ligne**. Le symbole se lit **du
côté de l'entité qu'il touche**.

<svg viewBox="0 0 560 300" width="560" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="14" fill="none" stroke="currentColor" stroke-width="2">
<g><line x1="20" y1="20" x2="150" y2="20"/><text x="190" y="25" fill="currentColor" stroke="none">Relationship (une simple ligne)</text></g>
<g><line x1="20" y1="60" x2="150" y2="60"/><line x1="130" y1="50" x2="130" y2="70"/><text x="190" y="65" fill="currentColor" stroke="none">One (une barre)</text></g>
<g><line x1="20" y1="100" x2="150" y2="100"/><line x1="130" y1="100" x2="150" y2="90"/><line x1="130" y1="100" x2="150" y2="110"/><text x="190" y="105" fill="currentColor" stroke="none">Many (la patte de corbeau)</text></g>
<g><line x1="20" y1="140" x2="150" y2="140"/><line x1="125" y1="130" x2="125" y2="150"/><line x1="135" y1="130" x2="135" y2="150"/><text x="190" y="145" fill="currentColor" stroke="none">One and ONLY one (deux barres)</text></g>
<g><line x1="20" y1="180" x2="112" y2="180"/><circle cx="120" cy="180" r="8"/><line x1="128" y1="180" x2="150" y2="180"/><line x1="140" y1="170" x2="140" y2="190"/><text x="190" y="185" fill="currentColor" stroke="none">Zero or one (cercle + barre)</text></g>
<g><line x1="20" y1="220" x2="150" y2="220"/><line x1="122" y1="210" x2="122" y2="230"/><line x1="132" y1="220" x2="150" y2="210"/><line x1="132" y1="220" x2="150" y2="230"/><text x="190" y="225" fill="currentColor" stroke="none">One or many (barre + patte)</text></g>
<g><line x1="20" y1="260" x2="104" y2="260"/><circle cx="112" cy="260" r="8"/><line x1="120" y1="260" x2="150" y2="260"/><line x1="132" y1="260" x2="150" y2="250"/><line x1="132" y1="260" x2="150" y2="270"/><text x="190" y="265" fill="currentColor" stroke="none">Zero or many (cercle + patte)</text></g>
</svg>

| Notation | Meaning | Exemple des slides |
|---|---|---|
| ligne simple | **Relationship** | Student — *Enrolls* — University |
| une barre `┼` | **One** | Student *Has* Student ID Number |
| patte `<` | **Many** | Student *Attends* Class |
| deux barres `╫` | **One and ONLY one** | Student *Uses* Chair |
| cercle + barre `o┼` | **Zero or one** | Student *Has* Social Security Number |
| barre + patte `┼<` | **One or many** | Instructor *Teaches* Class |
| cercle + patte `o<` | **Zero or many** | Classroom *Has* Chair |

**Comment lire :** le symbole le plus **près de l'entité** donne le **maximum**
(barre = 1, patte = many) ; le symbole **intérieur** donne le **minimum**
(cercle = 0, barre = 1).

> **Piège :** le **cercle** veut dire **zéro** (participation optionnelle), pas
> « un ». La **patte** veut dire **plusieurs**.

### L'exemple Crow's Foot des slides

```diagram
{
  "title": "Le schéma Crow's Foot des slides (les * marquent les clés). Les étiquettes donnent la cardinalité de chaque côté.",
  "nodes": [
    { "id": "s", "x": 90, "y": 60, "shape": "table", "size": 12, "tone": "sky", "label": "Student", "rows": [["*StudentID"],["FName"],["LName"]], "header": false, "cols": [110] },
    { "id": "i", "x": 560, "y": 60, "shape": "table", "size": 12, "tone": "sky", "label": "ID Card", "rows": [["*StudentID"],["Name"]], "header": false, "cols": [110] },
    { "id": "c", "x": 90, "y": 260, "shape": "table", "size": 12, "tone": "sky", "label": "Course", "rows": [["*CourseID"],["*CourseName"],["CourseNum"]], "header": false, "cols": [110] },
    { "id": "ct", "x": 560, "y": 260, "shape": "table", "size": 12, "tone": "sky", "label": "CourseTerm", "rows": [["*CourseID"],["*TermID"],["StartDate"],["EndDate"]], "header": false, "cols": [110] },
    { "id": "t", "x": 560, "y": 460, "shape": "table", "size": 12, "tone": "sky", "label": "Term", "rows": [["*TermID"],["SectionNumber"]], "header": false, "cols": [110] },
    { "id": "p", "x": 90, "y": 460, "shape": "table", "size": 12, "tone": "sky", "label": "Professor", "rows": [["*ProfID"],["Name"],["Status"]], "header": false, "cols": [110] }
  ],
  "edges": [
    { "from": "s", "to": "i", "arrow": "none", "label": "has : one and only one ↔ one and only one" },
    { "from": "s", "to": "c", "arrow": "none", "label": "takes : one or many ↔ one or many" },
    { "from": "c", "to": "ct", "arrow": "none", "label": "has : 1 seul ↔ 1..N" },
    { "from": "ct", "to": "t", "arrow": "none", "label": "has : 1..N ↔ 1 seul" },
    { "from": "p", "to": "t", "arrow": "none", "label": "teaches : 1 seul ↔ 0..N" }
  ]
}
```

- **Student has ID Card** : chaque étudiant a **exactement une** carte, chaque
  carte appartient à **exactement un** étudiant (1:1 obligatoire des deux
  côtés).
- **Student takes Course** : un étudiant suit **un ou plusieurs** cours, un
  cours est suivi par **un ou plusieurs** étudiants (M:N).
- **Course has CourseTerm** : un cours a **une ou plusieurs** sessions, une
  session concerne **un seul** cours.
- **Term has CourseTerm** : un term a une ou plusieurs CourseTerm, une
  CourseTerm est dans **un seul** term.
- **Professor teaches Term** : un professeur enseigne **zéro ou plusieurs**
  terms (il peut ne rien enseigner), un term a **un seul** professeur.

### Chen vs Crow's Foot

| | **Chen** (semaines 2–3) | **Crow's Foot** |
|---|---|---|
| Entité | rectangle | boîte avec la liste des attributs |
| Attribut | ovale | ligne dans la boîte |
| Relationship | **losange** | **ligne** avec un verbe |
| Cardinalité | `1`, `N`, `M` écrits sur la ligne | **symboles** au bout de la ligne |
| Participation | ligne simple / double | **cercle** (0) ou **barre** (1) en minimum |

## 5. Exercice : Library Management System

*Draw an E-R diagram for Library Management System. Assume relevant entities
and attributes for the given system.*

Pas de corrigé dans les slides ; voici une solution classique.

```er
{
  "title": "Une solution : un member emprunte des books (borrows, M:N, avec dates) ; un book est écrit par des authors et édité par un publisher.",
  "nodes": [
    { "id": "m", "kind": "entity", "label": "Member", "x": 110, "y": 200 },
    { "id": "mi", "kind": "key_attribute", "label": "MemberID", "x": 40, "y": 100 },
    { "id": "mn", "kind": "attribute", "label": "Name", "x": 150, "y": 90 },
    { "id": "mp", "kind": "multi_attribute", "label": "Phone", "x": 60, "y": 300 },
    { "id": "b", "kind": "relationship", "label": "Borrows", "x": 320, "y": 200 },
    { "id": "bi", "kind": "attribute", "label": "IssueDate", "x": 260, "y": 310 },
    { "id": "bd", "kind": "attribute", "label": "DueDate", "x": 380, "y": 310 },
    { "id": "k", "kind": "entity", "label": "Book", "x": 530, "y": 200 },
    { "id": "ki", "kind": "key_attribute", "label": "ISBN", "x": 470, "y": 100 },
    { "id": "kt", "kind": "attribute", "label": "Title", "x": 590, "y": 90 },
    { "id": "w", "kind": "relationship", "label": "Written_by", "x": 700, "y": 290 },
    { "id": "a", "kind": "entity", "label": "Author", "x": 700, "y": 400 },
    { "id": "pb", "kind": "relationship", "label": "Published_by", "x": 530, "y": 330 },
    { "id": "p", "kind": "entity", "label": "Publisher", "x": 530, "y": 440 }
  ],
  "edges": [
    { "from": "m", "to": "mi" }, { "from": "m", "to": "mn" }, { "from": "m", "to": "mp" },
    { "from": "m", "to": "b", "card": "M" }, { "from": "b", "to": "k", "card": "N" },
    { "from": "b", "to": "bi" }, { "from": "b", "to": "bd" },
    { "from": "k", "to": "ki" }, { "from": "k", "to": "kt" },
    { "from": "k", "to": "w", "card": "M" }, { "from": "w", "to": "a", "card": "N" },
    { "from": "k", "to": "pb", "card": "N", "total": true }, { "from": "pb", "to": "p", "card": "1" }
  ]
}
```

Tables correspondantes : `Member(MemberID, Name)`, `MemberPhone(MemberID,
Phone)`, `Book(ISBN, Title, PublisherID)`, `Publisher(PublisherID, …)`,
`Author(AuthorID, …)`, `Written_by(ISBN, AuthorID)`,
`Borrows(MemberID, ISBN, IssueDate, DueDate)`. Une relationship **M:N**
devient **sa propre table** ; une **1:N** devient une **foreign key** du côté
N.

---

## À retenir

- Table = **relation**, colonne = **attribute**, ligne = **tuple / record**.
  **Degree = colonnes**, **cardinality = lignes**, **domain = valeurs
  possibles** d'une colonne.
- **Super key** : identifie chaque ligne. **Candidate key** : super key
  **minimale**. **Primary key** : candidate key **choisie** (une seule, **pas
  NULL**, ne change pas). **Alternate key** : candidate key non choisie.
- Toute candidate key est une super key, **l'inverse est faux**.
- **Foreign key** : référence la PK d'une autre table ; **child** = table qui
  contient la FK, **parent** = table qui contient la PK.
- Assurance auto : `participated` est **ternaire**, `damage-amount` est un
  attribut **de la relationship**, sa table a pour PK les 3 clés.
- **Crow's Foot** : barre = 1, patte = many, cercle = 0, deux barres = un et un
  seul.

## Pièges classiques du quiz

| Affirmation | Vrai / Faux |
|---|---|
| La cardinality d'une table est son nombre de colonnes | **Faux** : de lignes (le degree = colonnes) |
| Toute super key est une candidate key | **Faux** : seulement les minimales |
| Toute candidate key est une super key | **Vrai** |
| Une table peut avoir plusieurs primary keys | **Faux** : une seule (mais elle peut avoir plusieurs attributs) |
| Une primary key peut être NULL | **Faux** |
| Une alternate key est une candidate key non choisie | **Vrai** |
| La table qui contient la foreign key est la parent table | **Faux** : c'est la child table |
| Une foreign key doit être unique dans sa table | **Faux** : elle peut se répéter |
| En Crow's Foot, le cercle signifie « un » | **Faux** : zéro |
| En Crow's Foot, la relationship est un losange | **Faux** : une ligne (le losange, c'est Chen) |
