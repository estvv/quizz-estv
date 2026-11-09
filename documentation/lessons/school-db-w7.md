# Database Design — Week 7 · Normalization problems & Relational Algebra 1

**Cours** : Lecture 12, *FD and Normalization Example Problems*, et la feuille
*Assignments*. Trois exercices types du midterm : **(1)** normaliser une table
« à plat » de **UNF jusqu'à 3NF** (cas employés / projets, puis cas
enseignants / matières) ; **(2)** calculer une **attribute closure** ;
**(3)** trouver **toutes les candidate keys** d'une relation.
Puis **Lecture 13**, *Relational Algebra – 1* : un exercice d'**E-R diagram**
(vendeurs, commandes, pièces), les **deux classes de DML**, et les deux
premières opérations de l'**algèbre relationnelle** : **Select (σ)** et
**Project (π)** sur la *Company Database* (partie 2).

> **En bref.** On normalise en **trois coups** : **1NF** = sortir les
> **repeating fields** dans une table à part (clé composée) ; **2NF** =
> supprimer les **partial dependencies** (un attribut qui ne dépend que
> d'**une partie** de la clé composée part dans sa propre table) ; **3NF** =
> supprimer les **transitive dependencies** (un attribut non-clé qui dépend
> d'un autre non-clé part dans sa propre table, l'ancien attribut devient
> **FK**). Pour les clés : calculer X⁺ pour chaque attribut **puis pour les
> paires** ; une **candidate key** est **minimale**. En algèbre relationnelle,
> **σ** garde des **lignes** (selon une condition), **π** garde des
> **colonnes** (et **supprime les doublons**).

---

## 1. La méthode en 3 étapes

```diagram
{
  "title": "UNF → 1NF → 2NF → 3NF : à chaque étape on retire un type de problème.",
  "nodes": [
    { "id": "u", "x": 70, "y": 50, "w": 120, "h": 70, "label": "UNF\nrepeating\nfields", "tone": "rose", "filled": true, "bold": true },
    { "id": "f1", "x": 250, "y": 50, "w": 120, "h": 70, "label": "1NF\nvaleurs\natomiques", "tone": "amber", "filled": true, "bold": true },
    { "id": "f2", "x": 430, "y": 50, "w": 120, "h": 70, "label": "2NF\n1NF + pas de\npartial FD", "tone": "sky", "filled": true, "bold": true },
    { "id": "f3", "x": 610, "y": 50, "w": 120, "h": 70, "label": "3NF\n2NF + pas de\ntransitive FD", "tone": "emerald", "filled": true, "bold": true },
    { "id": "a1", "x": 160, "y": 140, "w": 150, "h": 60, "shape": "note", "tone": "amber", "size": 11, "label": "isoler le groupe\nqui se répète\n(+ PK de l'entité)" },
    { "id": "a2", "x": 340, "y": 140, "w": 150, "h": 60, "shape": "note", "tone": "sky", "size": 11, "label": "ce qui dépend d'une\nPARTIE de la clé\n→ sa propre table" },
    { "id": "a3", "x": 520, "y": 140, "w": 150, "h": 60, "shape": "note", "tone": "emerald", "size": 11, "label": "non-clé → non-clé\n→ sa propre table\n(+ FK)" }
  ],
  "edges": [
    { "from": "u", "to": "f1" }, { "from": "f1", "to": "f2" }, { "from": "f2", "to": "f3" }
  ]
}
```

| Forme | Condition | Ce qu'on fait |
|---|---|---|
| **UNF** (unnormalized) | une « ligne » contient des **groupes qui se répètent** | — |
| **1NF** | chaque cellule contient **une seule valeur** (atomique), pas de groupe répété | on met le **repeating group** dans une **nouvelle table** avec la **PK de l'entité** + son propre identifiant → **clé composée** |
| **2NF** | 1NF **et** chaque attribut non-clé dépend de **toute** la clé (pas de **partial dependency**) | ce qui ne dépend que d'une partie de la clé composée part dans sa table ; il reste une **table de liaison** |
| **3NF** | 2NF **et** aucun attribut non-clé ne dépend d'un autre attribut non-clé (pas de **transitive dependency**) | on sort `B → C` (B non-clé) dans une table `(B, C)` ; B reste comme **FK** |

> **Moyen mnémotechnique :** « the **key** (1NF), the **whole key** (2NF),
> and **nothing but the key** (3NF) ».

## 2. Exemple du cours : employés et projets

Une firme garde : *Employee Number, Employee Name, Date of Birth, Department
Code, Department Name, Project Code, Project Description, Project
Supervisor*. Hypothèses :

- chaque **employee number est unique** ; les **noms ne le sont pas** ;
- chaque département a **un seul code** ;
- chaque projet a **un seul code et un seul supervisor** ;
- un employé peut travailler sur **un ou plusieurs projets** ;
- *Project Code, Project Description, Project Supervisor* sont des
  **repeating fields**.

### UNF

```diagram
{
  "title": "UNF : Raj (EmpNo 1) apparaît deux fois car il travaille sur deux projets. Ses infos sont recopiées.",
  "nodes": [
    { "id": "t", "x": 330, "y": 30, "shape": "table", "size": 11, "label": "UNF", "rows": [["EmpNo","EmpName","DOB","DeptCode","DeptName","ProjCode","ProjDesc","ProjSupervisor"],["1","Raj","1-1-85","1","CE","1","IOT","Patel"],["2","Meet","4-4-86","2","EC","2","PHP","Shah"],["3","Suresh","2-2-85","1","CE","1","IOT","Patel"],["1","Raj","1-1-85","1","CE","2","PHP","Shah"]], "mark": [1,4], "cols": [55,70,60,70,70,70,65,100] }
  ],
  "edges": []
}
```

### 1NF — sortir le groupe répété

Le groupe *(ProjCode, ProjDesc, ProjSupervisor)* part dans une table à part,
avec **EmpNo** pour savoir à qui il appartient : **PK = EmpNo + ProjCode**.

```diagram
{
  "title": "1NF : Employee (PK EmpNo) et Project (PK EmpNo + ProjCode). Plus de groupe répété, mais ProjDesc / ProjSupervisor sont recopiés.",
  "nodes": [
    { "id": "e", "x": 150, "y": 30, "shape": "table", "size": 11, "label": "Employee (PK: EmpNo)", "rows": [["EmpNo","EmpName","DOB","DeptCode","DeptName"],["1","Raj","1-1-85","1","CE"],["2","Meet","4-4-86","2","EC"],["3","Suresh","2-2-85","1","CE"]], "cols": [50,60,60,65,65] },
    { "id": "p", "x": 520, "y": 30, "shape": "table", "size": 11, "label": "Project (PK: EmpNo + ProjCode)", "rows": [["EmpNo","ProjCode","ProjDesc","ProjSupervisor"],["1","1","IOT","Patel"],["1","2","PHP","Shah"],["2","2","PHP","Shah"],["3","1","IOT","Patel"]], "cols": [50,65,65,100] }
  ],
  "edges": []
}
```

### 2NF — supprimer la partial dependency

Dans `Project(EmpNo, ProjCode, ProjDesc, ProjSupervisor)`, **ProjDesc et
ProjSupervisor ne dépendent que de ProjCode** (une **partie** de la clé) :
`ProjCode → ProjDesc, ProjSupervisor` est une **partial dependency**. On la
sort :

```diagram
{
  "title": "2NF : Project ne garde que ProjCode → ProjDesc, ProjSupervisor ; WorksOn relie employés et projets.",
  "nodes": [
    { "id": "e", "x": 140, "y": 30, "shape": "table", "size": 11, "label": "Employee (PK: EmpNo)", "rows": [["EmpNo","EmpName","DOB","DeptCode","DeptName"],["1","Raj","1-1-85","1","CE"],["2","Meet","4-4-86","2","EC"],["3","Suresh","2-2-85","1","CE"]], "cols": [50,60,60,65,65] },
    { "id": "p", "x": 440, "y": 30, "shape": "table", "size": 11, "label": "Project (PK: ProjCode)", "rows": [["ProjCode","ProjDesc","ProjSupervisor"],["1","IOT","Patel"],["2","PHP","Shah"]], "cols": [65,65,100] },
    { "id": "w", "x": 680, "y": 30, "shape": "table", "size": 11, "label": "WorksOn (PK both)", "rows": [["EmpNo","ProjCode"],["1","1"],["1","2"],["2","2"],["3","1"]], "cols": [55,65] }
  ],
  "edges": []
}
```

### 3NF — supprimer la transitive dependency

Dans `Employee`, **EmpNo → DeptCode** et **DeptCode → DeptName** : DeptName
dépend de la clé **via** DeptCode (non-clé) → **transitive dependency**. On
sort `Department(DeptCode, DeptName)` ; **DeptCode** reste dans Employee
comme **foreign key**.

```diagram
{
  "title": "3NF : quatre tables. Chaque fait n'est stocké qu'une fois (CE, IOT/Patel, PHP/Shah).",
  "nodes": [
    { "id": "e", "x": 120, "y": 30, "shape": "table", "size": 11, "label": "Employee (PK EmpNo, FK DeptCode)", "rows": [["EmpNo","EmpName","DOB","DeptCode"],["1","Raj","1-1-85","1"],["2","Meet","4-4-86","2"],["3","Suresh","2-2-85","1"]], "cols": [50,60,60,65] },
    { "id": "d", "x": 360, "y": 30, "shape": "table", "size": 11, "label": "Department (PK DeptCode)", "rows": [["DeptCode","DeptName"],["1","CE"],["2","EC"]], "cols": [65,70] },
    { "id": "p", "x": 360, "y": 175, "shape": "table", "size": 11, "label": "Project (PK ProjCode)", "rows": [["ProjCode","ProjDesc","ProjSupervisor"],["1","IOT","Patel"],["2","PHP","Shah"]], "cols": [65,65,100] },
    { "id": "w", "x": 120, "y": 175, "shape": "table", "size": 11, "label": "WorksOn (PK EmpNo + ProjCode)", "rows": [["EmpNo","ProjCode"],["1","1"],["1","2"],["2","2"],["3","1"]], "cols": [55,65] }
  ],
  "edges": [
    { "from": "e", "to": "d", "label": "DeptCode", "tone": "violet" },
    { "from": "w", "to": "e", "label": "EmpNo", "tone": "violet" },
    { "from": "w", "to": "p", "label": "ProjCode", "tone": "violet" }
  ]
}
```

| Étape | Tables obtenues | Dépendance supprimée |
|---|---|---|
| 1NF | Employee(**EmpNo**, EmpName, DOB, DeptCode, DeptName), Project(**EmpNo, ProjCode**, ProjDesc, ProjSupervisor) | repeating group |
| 2NF | Employee, Project(**ProjCode**, ProjDesc, ProjSupervisor), WorksOn(**EmpNo, ProjCode**) | partial : ProjCode → ProjDesc, ProjSupervisor |
| 3NF | Employee(**EmpNo**, EmpName, DOB, *DeptCode*), Department(**DeptCode**, DeptName), Project, WorksOn | transitive : EmpNo → DeptCode → DeptName |

## 3. Exercice 3 : enseignants et matières (même schéma)

Un collège garde : *Lecturer Number, Lecturer Name, Lecturer Grade,
Department Code, Department Name, Subject Code, Subject Name, Subject Level*.
Un enseignant enseigne **plusieurs matières** mais n'appartient qu'à **un seul
département** ; *Subject Code, Subject Name, Subject Level* sont des
**repeating fields**.

```diagram
{
  "title": "Même raisonnement que l'exemple du cours : Lecturer ↔ Employee, Subject ↔ Project, Teaches ↔ WorksOn. Clé en gras dans le texte.",
  "nodes": [
    { "id": "u", "x": 330, "y": 25, "w": 600, "h": 46, "label": "UNF : LecturerNo, LecturerName, LecturerGrade, DeptCode, DeptName,\n{ SubjectCode, SubjectName, SubjectLevel } (repeating)", "tone": "rose", "filled": true, "size": 11 },
    { "id": "n1a", "x": 180, "y": 105, "w": 290, "h": 46, "label": "Lecturer (PK LecturerNo)\nName, Grade, DeptCode, DeptName", "tone": "amber", "filled": true, "size": 11 },
    { "id": "n1b", "x": 490, "y": 105, "w": 290, "h": 46, "label": "Subject (PK LecturerNo + SubjectCode)\nSubjectName, SubjectLevel", "tone": "amber", "filled": true, "size": 11 },
    { "id": "n2a", "x": 120, "y": 185, "w": 200, "h": 46, "label": "Lecturer (PK LecturerNo)\nName, Grade, DeptCode, DeptName", "tone": "sky", "filled": true, "size": 10 },
    { "id": "n2b", "x": 335, "y": 185, "w": 200, "h": 46, "label": "Subject (PK SubjectCode)\nSubjectName, SubjectLevel", "tone": "sky", "filled": true, "size": 10 },
    { "id": "n2c", "x": 550, "y": 185, "w": 200, "h": 46, "label": "Teaches\n(PK LecturerNo + SubjectCode)", "tone": "sky", "filled": true, "size": 10 },
    { "id": "n3a", "x": 95, "y": 265, "w": 155, "h": 46, "label": "Lecturer (PK LecturerNo)\nName, Grade, DeptCode FK", "tone": "emerald", "filled": true, "size": 10 },
    { "id": "n3d", "x": 260, "y": 265, "w": 155, "h": 46, "label": "Department\n(PK DeptCode) DeptName", "tone": "emerald", "filled": true, "size": 10 },
    { "id": "n3b", "x": 425, "y": 265, "w": 155, "h": 46, "label": "Subject (PK SubjectCode)\nSubjectName, Level", "tone": "emerald", "filled": true, "size": 10 },
    { "id": "n3c", "x": 590, "y": 265, "w": 155, "h": 46, "label": "Teaches (PK\nLecturerNo + SubjectCode)", "tone": "emerald", "filled": true, "size": 10 },
    { "id": "l1", "x": -10, "y": 105, "shape": "text", "label": "1NF", "bold": true },
    { "id": "l2", "x": -10, "y": 185, "shape": "text", "label": "2NF", "bold": true },
    { "id": "l3", "x": -10, "y": 265, "shape": "text", "label": "3NF", "bold": true }
  ],
  "edges": []
}
```

- **1NF** : Lecturer(**LecturerNo**, LecturerName, LecturerGrade, DeptCode,
  DeptName) + Subject(**LecturerNo, SubjectCode**, SubjectName,
  SubjectLevel).
- **2NF** : SubjectName et SubjectLevel ne dépendent que de **SubjectCode** →
  Subject(**SubjectCode**, SubjectName, SubjectLevel) +
  Teaches(**LecturerNo, SubjectCode**).
- **3NF** : `LecturerNo → DeptCode → DeptName` est transitive →
  Department(**DeptCode**, DeptName) ; Lecturer garde **DeptCode** en FK.

## 4. Exercice 1 : attribute closure de (E-ID)⁺

`EMPLOYEE(E-ID, E-NAME, E-CITY, E-STATE)`,
F = {E-ID → E-NAME, E-ID → E-CITY, E-ID → E-STATE, E-CITY → E-STATE}.

| Étape | FD appliquée | result |
|---|---|---|
| départ | | {E-ID} |
| 1 | E-ID → E-NAME | {E-ID, E-NAME} |
| 2 | E-ID → E-CITY | {E-ID, E-NAME, E-CITY} |
| 3 | E-ID → E-STATE (ou E-CITY → E-STATE) | {E-ID, E-NAME, E-CITY, E-STATE} |

**(E-ID)⁺ = {E-ID, E-NAME, E-CITY, E-STATE}** = tous les attributs →
**E-ID est une candidate key** (un seul attribut, donc minimale).

> **Bonus quiz :** EMPLOYEE est-elle en 3NF ? **Non** : `E-ID → E-CITY →
> E-STATE` est une **transitive dependency** (E-CITY n'est pas une clé). En
> 3NF : EMPLOYEE(**E-ID**, E-NAME, E-CITY) + CITY(**E-CITY**, E-STATE). Elle
> est bien en **2NF** (clé à un seul attribut : pas de partial dependency
> possible).

## 5. Exercice 2 : candidate keys de R(A, B, C, D, E)

F = {A → BC, CD → E, B → D, E → A}.

```flowchart
{
  "title": "Méthode : closure de chaque attribut, puis des paires qui ne contiennent pas déjà une clé.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "START" },
    { "id": "a", "kind": "process", "label": "calculer X⁺ pour chaque attribut seul" },
    { "id": "b", "kind": "process", "label": "garder ceux où X⁺ = R : clés à 1 attribut" },
    { "id": "c", "kind": "process", "label": "calculer X⁺ des paires SANS clé déjà trouvée" },
    { "id": "d", "kind": "process", "label": "X⁺ = R et aucun sous-ensemble n'y arrive → candidate key" },
    { "id": "e", "kind": "end", "label": "END" }
  ],
  "edges": [
    { "from": "s", "to": "a" }, { "from": "a", "to": "b" }, { "from": "b", "to": "c" }, { "from": "c", "to": "d" }, { "from": "d", "to": "e" }
  ]
}
```

| X | X⁺ | = R ? | Candidate key ? |
|---|---|---|---|
| A | A → BC → (B → D) → (CD → E) = **ABCDE** | ✅ | **oui** |
| B | B → D = BD | ❌ | |
| C | C | ❌ | |
| D | D | ❌ | |
| E | E → A → BC → D = **ABCDE** | ✅ | **oui** |
| BC | B → D, CD → E, E → A = **ABCDE** | ✅ | **oui** (B⁺ = BD, C⁺ = C) |
| CD | CD → E, E → A, A → BC = **ABCDE** | ✅ | **oui** (C⁺ = C, D⁺ = D) |
| BD | BD | ❌ | |

**Candidate keys : A, E, BC et CD.**

> **Attention :** le corrigé de la feuille d'assignment ne teste que les
> attributs **seuls** et répond **{A} et {E}**. C'est **incomplet** : **BC**
> et **CD** sont aussi des candidate keys (minimales, car aucun de leurs
> attributs seul ne suffit). Les paires contenant A ou E (AB, AE, CE…) sont
> des **super keys** mais **pas** des candidate keys.

---

---

# Partie 2 — Lecture 13 : Relational Algebra 1

## 6. Exercice E-R : vendeurs, clients, commandes, pièces

*Un salesperson peut manager plusieurs autres salespeople, et n'est managé
que par un seul. Un salesperson est l'agent de plusieurs customers ; un
customer est géré par un seul salesperson. Un customer passe plusieurs
orders ; un order est passé par un seul customer. Un order liste plusieurs
inventory items (products) ; un item peut être listé dans plusieurs orders.
Un item est assemblé à partir de plusieurs parts ; une part entre dans
plusieurs items. Plusieurs employees assemblent un item à partir de plusieurs
parts. Un supplier fournit plusieurs parts ; une part peut être fournie par
plusieurs suppliers.*

```er
{
  "title": "Le corrigé des slides : 7 entités, 7 relationships. Manages est récursive (1 : M) sur SALESPERSON.",
  "nodes": [
    { "id": "sp", "kind": "entity", "label": "SALESPERSON", "x": 120, "y": 40 },
    { "id": "mg", "kind": "relationship", "label": "Manages", "x": 330, "y": 40 },
    { "id": "ag", "kind": "relationship", "label": "Agent for", "x": 120, "y": 140 },
    { "id": "cu", "kind": "entity", "label": "CUSTOMER", "x": 120, "y": 240 },
    { "id": "pl", "kind": "relationship", "label": "Places", "x": 330, "y": 240 },
    { "id": "or", "kind": "entity", "label": "ORDER", "x": 540, "y": 240 },
    { "id": "li", "kind": "relationship", "label": "Lists", "x": 540, "y": 340 },
    { "id": "pr", "kind": "entity", "label": "PRODUCT", "x": 540, "y": 440 },
    { "id": "ai", "kind": "relationship", "label": "Assembled into", "x": 330, "y": 440 },
    { "id": "pa", "kind": "entity", "label": "PART", "x": 120, "y": 440 },
    { "id": "su", "kind": "relationship", "label": "Supplies", "x": 120, "y": 540 },
    { "id": "sr", "kind": "entity", "label": "SUPPLIER", "x": 120, "y": 640 },
    { "id": "as", "kind": "relationship", "label": "Assembles", "x": 540, "y": 540 },
    { "id": "em", "kind": "entity", "label": "EMPLOYEE", "x": 540, "y": 640 }
  ],
  "edges": [
    { "from": "sp", "to": "mg", "card": "1", "role": "manager" },
    { "from": "sp", "to": "mg", "card": "M", "role": "managed" },
    { "from": "sp", "to": "ag", "card": "1" },
    { "from": "ag", "to": "cu", "card": "M" },
    { "from": "cu", "to": "pl", "card": "1" },
    { "from": "pl", "to": "or", "card": "M" },
    { "from": "or", "to": "li", "card": "M" },
    { "from": "li", "to": "pr", "card": "M" },
    { "from": "pa", "to": "ai", "card": "M" },
    { "from": "ai", "to": "pr", "card": "M" },
    { "from": "pa", "to": "su", "card": "M" },
    { "from": "su", "to": "sr", "card": "M" },
    { "from": "pr", "to": "as", "card": "M" },
    { "from": "as", "to": "em", "card": "M" }
  ]
}
```

| Phrase de l'énoncé | Relationship | Cardinalité |
|---|---|---|
| un salesperson manage plusieurs salespeople, managé par un seul | **Manages** (récursive) | **1 : M** |
| un salesperson est agent de plusieurs customers, un customer a un seul agent | **Agent for** | **1 : M** |
| un customer passe plusieurs orders, un order a un seul customer | **Places** | **1 : M** |
| un order liste plusieurs items, un item dans plusieurs orders | **Lists** | **M : N** |
| un item assemblé de plusieurs parts, une part dans plusieurs items | **Assembled into** | **M : N** |
| plusieurs employees assemblent un item | **Assembles** | **M : N** |
| un supplier fournit plusieurs parts, une part fournie par plusieurs suppliers | **Supplies** | **M : N** |

> **Méthode :** pour chaque phrase, lire **les deux sens** (« un A a
> combien de B ? » puis « un B a combien de A ? »). « only one » d'un côté
> + « many » de l'autre → **1 : M** ; « many » des deux côtés → **M : N**.

## 7. DML : procédural ou non procédural

| | **Procedural** (low level) | **Nonprocedural** (high level) |
|---|---|---|
| L'utilisateur dit… | **quelles** données **et comment** les obtenir | **quelles** données, **sans** dire comment |
| Exemple | **Relational Algebra** : on fixe **l'ordre** des opérations | **SQL** |

SQL s'utilise **seul** (*standalone*, comme query language) ou **intégré**
dans un langage de programmation (*embedded*, dans un **host language**).

**Relational algebra** = un **ensemble d'opérations** pour exprimer des
**retrieval requests (queries)** dans le modèle relationnel. Une
**relational algebra expression** est une **séquence** de ces opérations ; le
résultat d'une opération est **une relation**, qu'on peut réutiliser.

## 8. La Company Database

```diagram
{
  "title": "Le schéma utilisé dans tous les exemples : EMPLOYEE.Dno → DEPARTMENT, WORKS_ON relie EMPLOYEE et PROJECT.",
  "nodes": [
    { "id": "e", "x": 330, "y": 30, "shape": "table", "size": 11, "label": "EMPLOYEE", "rows": [["Fname","Minit","Lname","Ssn","Bdate","Address","Sex","Salary","Super_ssn","Dno"]], "mark": [], "cols": [50,40,50,40,45,55,35,45,65,35] },
    { "id": "d", "x": 160, "y": 110, "shape": "table", "size": 11, "label": "DEPARTMENT", "rows": [["Dname","Dnumber","Mgr_ssn","Mgr_start_date"]], "cols": [55,65,60,100] },
    { "id": "p", "x": 520, "y": 110, "shape": "table", "size": 11, "label": "PROJECT", "rows": [["Pname","Pnumber","Plocation","Dnum"]], "cols": [55,65,65,45] },
    { "id": "w", "x": 160, "y": 190, "shape": "table", "size": 11, "label": "WORKS_ON", "rows": [["Essn","Pno","Hours"]], "cols": [50,45,50] },
    { "id": "dl", "x": 520, "y": 190, "shape": "table", "size": 11, "label": "DEPT_LOCATIONS", "rows": [["Dnumber","Dlocation"]], "cols": [65,75] },
    { "id": "dp", "x": 330, "y": 260, "shape": "table", "size": 11, "label": "DEPENDENT", "rows": [["Essn","Dependent_name","Sex","Bdate","Relationship"]], "cols": [50,110,35,45,85] }
  ],
  "edges": []
}
```

Les 8 employés (colonnes utiles) :

| Fname | Lname | Ssn | Salary | Super_ssn | Dno |
|---|---|---|---|---|---|
| John | Smith | 123456789 | 30000 | 333445555 | 5 |
| Franklin | Wong | 333445555 | 40000 | 888665555 | 5 |
| Alicia | Zelaya | 999887777 | 25000 | 987654321 | 4 |
| Jennifer | Wallace | 987654321 | 43000 | 888665555 | 4 |
| Ramesh | Narayan | 666884444 | 38000 | 333445555 | 5 |
| Joyce | English | 453453453 | 25000 | 333445555 | 5 |
| Ahmad | Jabbar | 987987987 | 25000 | 987654321 | 4 |
| James | Borg | 888665555 | 55000 | NULL | 1 |

## 9. Select (σ) — choisir des lignes

**Opération unaire** qui garde le **sous-ensemble des tuples** qui
satisfont une **selection condition**.

**Notation : σ<sub>selection condition</sub>(R)**

- La condition est une **expression booléenne** sur les attributs de R :
  opérateurs **AND, OR, NOT** appliqués à **<, >, <=, >=, !=, =**.
- Le résultat a **les mêmes attributs** que R, et **au plus autant** de
  tuples.

| Requête | Expression | Résultat |
|---|---|---|
| employés du département 4 | **σ<sub>Dno = 4</sub>(EMPLOYEE)** | Zelaya, Wallace, Jabbar |
| salaire > 35 000 | **σ<sub>Salary > 35000</sub>(EMPLOYEE)** | Wong, Wallace, Narayan, Borg |
| projets du département 5 | **σ<sub>Dnum = 5</sub>(PROJECT)** | ProductX, ProductY, ProductZ |
| (dept 4 **et** salaire > 25 000) **ou** (dept 5 **et** salaire > 30 000) | **σ<sub>(Dno = 4 AND Salary > 25000) OR (Dno = 5 AND Salary > 30000)</sub>(EMPLOYEE)** | **Wong, Wallace, Narayan** |

```diagram
{
  "title": "σ(Dno = 4 AND Salary > 25000) OR (Dno = 5 AND Salary > 30000) : on teste chaque ligne, on garde celles où la condition est vraie.",
  "nodes": [
    { "id": "t", "x": 300, "y": 30, "shape": "table", "size": 12, "label": "EMPLOYEE → test de la condition", "rows": [["Lname","Salary","Dno","Dno=4 ∧ >25000","Dno=5 ∧ >30000","gardé ?"],["Smith","30000","5","non","non (30000 pas > 30000)","✗"],["Wong","40000","5","non","oui","✓"],["Zelaya","25000","4","non (pas >)","non","✗"],["Wallace","43000","4","oui","non","✓"],["Narayan","38000","5","non","oui","✓"],["English","25000","5","non","non","✗"],["Jabbar","25000","4","non","non","✗"],["Borg","55000","1","non","non","✗"]], "mark": [2,4,5], "cols": [65,55,40,105,150,55] }
  ],
  "edges": []
}
```

> **Piège :** `>` est **strict** : Smith (30 000) n'a **pas** un salaire
> > 30 000, Zelaya (25 000) n'a pas un salaire > 25 000.

**Propriétés :**

- σ est **commutatif** : σ<sub>c1</sub>(σ<sub>c2</sub>(R)) =
  σ<sub>c2</sub>(σ<sub>c1</sub>(R)).
- **Cascade** : une suite de σ équivaut à **un seul σ avec AND** :
  σ<sub>c1</sub>(σ<sub>c2</sub>(σ<sub>c3</sub>(R))) =
  σ<sub>c1 AND c2 AND c3</sub>(R).

## 10. Project (π) — choisir des colonnes

**Opération unaire** qui garde un **sous-ensemble des colonnes**.

**Notation : π<sub>attribute list</sub>(R)**

- Le résultat est un **ensemble** de tuples : **les doublons sont
  supprimés**.
- Nombre de tuples de π<sub>list</sub>(R) **≤** nombre de tuples de R ;
  **égal** si la liste contient une **clé** de R.

| Requête | Expression | Lignes |
|---|---|---|
| nom, prénom, salaire | **π<sub>Lname, Fname, Salary</sub>(EMPLOYEE)** | 8 (aucun doublon) |
| les salaires | **π<sub>Salary</sub>(EMPLOYEE)** | **6** : 30000, 40000, 25000, 43000, 38000, 55000 (25 000 n'apparaît **qu'une fois**) |
| SSN des employés qui travaillent **plus de 10 h** sur un projet | **π<sub>Essn</sub>(σ<sub>Hours > 10</sub>(WORKS_ON))** | 123456789, 666884444, 453453453, 999887777, 987987987, 987654321 |

```diagram
{
  "title": "π Salary(EMPLOYEE) : 8 lignes en entrée, 6 en sortie, car le résultat est un ensemble (les trois 25000 n'en font qu'un).",
  "nodes": [
    { "id": "a", "x": 110, "y": 30, "shape": "table", "size": 12, "label": "EMPLOYEE.Salary", "rows": [["Salary"],["30000"],["40000"],["25000"],["43000"],["38000"],["25000"],["25000"],["55000"]], "mark": [3,6,7], "cols": [80] },
    { "id": "b", "x": 360, "y": 30, "shape": "table", "size": 12, "label": "π Salary", "rows": [["Salary"],["30000"],["40000"],["25000"],["43000"],["38000"],["55000"]], "mark": [3], "cols": [80] }
  ],
  "edges": [ { "from": "a", "to": "b", "label": "doublons supprimés" } ]
}
```

**π n'est pas commutatif :**

- π<sub>Salary</sub>(π<sub>Lname, Fname, Salary</sub>(EMPLOYEE)) fonctionne :
  la liste intérieure **contient** Salary.
- π<sub>Lname, Fname, Salary</sub>(π<sub>Salary</sub>(EMPLOYEE)) est
  **impossible** : après π<sub>Salary</sub>, les colonnes Lname et Fname
  **n'existent plus** (« NOW WHAT ??? »).
- Règle : π<sub>list1</sub>(π<sub>list2</sub>(R)) = π<sub>list1</sub>(R)
  **tant que list2 contient les attributs de list1**.


## Pièges d'exam

- **1NF** : le repeating group part avec la **PK de l'entité** → clé
  **composée** (EmpNo + ProjCode).
- **2NF** n'a de sens que si la clé est **composée** ; une table à clé
  simple en 1NF est déjà en 2NF.
- **3NF** : chercher `non-clé → non-clé` (DeptCode → DeptName,
  E-CITY → E-STATE).
- La table de liaison (**WorksOn**, **Teaches**) n'a que la clé composée.
- Une **candidate key** est **minimale** ; ne pas oublier de tester les
  **paires**.
- **σ** = lignes, **π** = colonnes ; π **supprime les doublons**, σ jamais.
- σ est **commutatif** (et une cascade de σ = un σ avec AND) ; π **ne l'est
  pas** (la liste intérieure doit contenir la liste extérieure).
- Relational algebra = DML **procédural** ; SQL = **non procédural**.

## À retenir

- UNF → 1NF (atomique) → 2NF (pas de partial) → 3NF (pas de transitive).
- Résultat type : **entité principale** + **table de l'entité répétée** +
  **table de liaison** + **table de référence** (Department).
- (E-ID)⁺ = tous les attributs → E-ID est candidate key.
- R(ABCDE), F = {A → BC, CD → E, B → D, E → A} : clés **A, E, BC, CD**.
- **σ<sub>condition</sub>(R)** avec AND / OR / NOT et < > <= >= = != ;
  **π<sub>attributs</sub>(R)** ; on les combine : π…(σ…(R)).
