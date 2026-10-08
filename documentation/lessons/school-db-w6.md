# Database Design — Week 6 · Functional Dependency & Normal Forms

**Cours** : Lecture 11, *Functional Dependency*. Les **functional
dependencies** (FD) et leurs types, les **Armstrong's axioms**, la **closure**
d'un ensemble de FD (F⁺) et d'un ensemble d'attributs (α⁺), le **canonical
cover**, la **decomposition** (lossy / lossless), les **anomalies**, les
**normal forms** de la 1NF à la 5NF, et comment **trouver une clé** et la
**meilleure forme normale** d'une relation.

> **En bref.** `X → Y` : connaître X **détermine** Y. Avec les **Armstrong's
> axioms** on déduit de nouvelles FD. Pour savoir si X est une clé, on calcule
> **X⁺** : si X⁺ contient **tous** les attributs, X est une super key. Les
> formes normales enlèvent une dépendance « gênante » à chaque étape :
> **2NF** = pas de **partial**, **3NF** = pas de **transitive**, **BCNF** =
> tout **déterminant** est une clé, **4NF** = pas de **multivalued**, **5NF** =
> plus de décomposition lossless possible. Au quiz, sache **calculer une
> closure** et **trouver la clé et la forme normale** d'une relation R(ABCD).

---

## 1. Functional dependency (FD)

Soit une relation R et deux ensembles d'attributs X et Y de R. Si la valeur de
X dans un tuple **détermine de façon unique** la valeur de Y, il existe une
**functional dependency** de X vers Y :

**X → Y** : « Y est **functionally dependent** de X », « X **functionally
determines** Y ». X est le **determinant**, Y le **dependent**.

Exemple : dans `Student(RollNo, Name, SPI, BL)`, `RollNo → Name, SPI, BL`.
Dans `Account(account_no, balance, branch)`,
`account_no → {balance, branch}`.

```diagram
{
  "title": "Les trois formes d'une FD : un attribut vers un attribut, un groupe vers un attribut, un attribut vers un groupe.",
  "nodes": [
    { "id": "x1", "x": 40, "y": 40, "w": 50, "label": "X", "tone": "sky", "filled": true },
    { "id": "y1", "x": 150, "y": 40, "w": 50, "label": "Y", "tone": "amber", "filled": true },
    { "id": "x21", "x": 250, "y": 40, "w": 50, "label": "X1", "tone": "sky", "filled": true },
    { "id": "x22", "x": 310, "y": 40, "w": 50, "label": "X2", "tone": "sky", "filled": true },
    { "id": "y2", "x": 420, "y": 40, "w": 50, "label": "Y", "tone": "amber", "filled": true },
    { "id": "x3", "x": 520, "y": 40, "w": 50, "label": "X", "tone": "sky", "filled": true },
    { "id": "y31", "x": 630, "y": 40, "w": 50, "label": "Y1", "tone": "amber", "filled": true },
    { "id": "y32", "x": 690, "y": 40, "w": 50, "label": "Y2", "tone": "amber", "filled": true },
    { "id": "l1", "x": 95, "y": 95, "shape": "text", "label": "X → Y" },
    { "id": "l2", "x": 335, "y": 95, "shape": "text", "label": "{X1, X2} → Y" },
    { "id": "l3", "x": 605, "y": 95, "shape": "text", "label": "X → {Y1, Y2}" }
  ],
  "edges": [
    { "from": "x1", "to": "y1" },
    { "from": "x22", "to": "y2" },
    { "from": "x3", "to": "y31" }
  ]
}
```

## 2. Les types de FD

| Type | Définition | Exemple des slides |
|---|---|---|
| **Full** functional dependency | B dépend de A, mais **d'aucun sous-ensemble strict** de A | `{Roll_No, Semester, Department_Name} → SPI` : il faut les trois |
| **Partial** functional dependency | B dépend de A **et aussi d'un sous-ensemble strict** de A (on peut retirer un attribut de A) | `{Enrollment_No, Department_Name} → SPI` : Enrollment_No suffit |
| **Transitive** functional dependency | si A → B et B → C, alors A → C (C dépend de A **via** B) | `Subject → Faculty`, `Faculty → Age` ⇒ `Subject → Age` |
| **Trivial** FD | X → Y avec **Y ⊆ X** | `{Roll_No, Department_Name, Semester} → Roll_No` |
| **Non-trivial** FD | X → Y avec **Y ⊄ X** | `{Roll_No, Department_Name, Semester} → Student_Name` |

> **Piège :** une FD trivial est **toujours vraie** (connaître Roll_No
> détermine… Roll_No). Elle n'apporte aucune information.

## 3. Armstrong's axioms (inference rules)

Les **Armstrong's axioms** servent à **déduire toutes les FD** d'une relation à
partir de celles qu'on connaît.

| Règle | Si… | alors… |
|---|---|---|
| **Reflexivity** | B ⊆ A | A → B |
| **Augmentation** | A → B | AC → BC |
| **Self-determination** | — | A → A |
| **Transitivity** | A → B et B → C | A → C |
| **Pseudo-transitivity** | A → B et BD → C | AD → C |
| **Decomposition** | A → BC | A → B et A → C |
| **Union** | A → B et A → C | A → BC |
| **Composition** | A → B et C → D | AC → BD |

> **Moyen mnémotechnique :** *decomposition* **coupe** le côté droit, *union*
> le **recolle**, *composition* combine **deux FD aux côtés gauches
> différents**.

## 4. Closure d'un ensemble de FD (F⁺)

Étant donné un ensemble F de FD, d'autres FD en découlent **logiquement**.
L'ensemble de **toutes** les FD impliquées par F s'appelle la **closure of F**,
notée **F⁺**.

Exemple : R(A, B, C, G, H, I) et
**F = {A → B, A → C, CG → H, CG → I, B → H}**.

| FD déduite | Comment |
|---|---|
| **A → H** | A → B et B → H : **transitivity** |
| **CG → HI** | CG → H et CG → I : **union** |
| **AG → I** | A → C et CG → I : **pseudo-transitivity** (ou : augmentation A → C donne AG → CG, puis transitivity avec CG → I) |

Quelques membres de F⁺ : `A → H`, `CG → HI`, `AG → I`.

**Autre exemple** : R(A, B, C, D, E, F), F = {A → B, A → C, CD → E, CD → F,
B → E}.

| Règle | Résultat |
|---|---|
| A → B & A → C, **union** | A → BC |
| CD → E & CD → F, **union** | CD → EF |
| A → B & B → E, **transitivity** | A → E |
| A → C & CD → E, **pseudo-transitivity** | AD → E |
| A → C & CD → F, **pseudo-transitivity** | AD → F |

**Troisième** : R(A, B, C, D, E), F = {AB → C, D → AC, D → E}.
D → AC par **decomposition** donne D → A et D → C ; avec D → E, **union** :
D → ACE.

## 5. Closure d'un ensemble d'attributs (α⁺)

La **closure of α** sous F, notée **α⁺**, est l'ensemble des attributs
**déterminés fonctionnellement** par α.

**Algorithme :**

1. `result = α`
2. **tant que** result change :
   pour chaque FD `β → γ` de F : **si β ⊆ result**, alors
   `result = result ∪ γ`.

```flowchart
{
  "title": "Calcul de α⁺ : on ajoute le côté droit de chaque FD dont le côté gauche est déjà dans result, jusqu'à ce que plus rien ne change.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "START" },
    { "id": "i", "kind": "process", "label": "result = α" },
    { "id": "f", "kind": "process", "label": "pour chaque β → γ :\nsi β ⊆ result, result = result ∪ γ" },
    { "id": "d", "kind": "decision", "label": "result a changé ?" },
    { "id": "o", "kind": "io", "label": "α⁺ = result" },
    { "id": "e", "kind": "end", "label": "END" }
  ],
  "edges": [
    { "from": "s", "to": "i" }, { "from": "i", "to": "f" }, { "from": "f", "to": "d" },
    { "from": "d", "to": "f", "branch": "yes" }, { "from": "d", "to": "o", "branch": "no" },
    { "from": "o", "to": "e" }
  ]
}
```

**Exemple : (AG)⁺** avec F = {A → B, A → C, CG → H, CG → I, B → H}.

| FD | Côté gauche ⊆ result ? | result |
|---|---|---|
| (départ) | | **AG** |
| A → B | A ⊆ AG ✓ | ABG |
| A → C | A ⊆ ABG ✓ | ABCG |
| CG → H | CG ⊆ ABCG ✓ | ABCGH |
| CG → I | CG ⊆ ABCGH ✓ | ABCGHI |
| B → H | B ⊆ ABCGHI ✓ | ABCGHI |

**AG⁺ = ABCGHI** : AG détermine **tous** les attributs de R, donc **AG est une
super key** (et une candidate key, car ni A⁺ = ABCH ni G⁺ = G ne suffisent).

**Exercice** : R(A, B, C, D, E), F = {A → BC, CD → E, B → D, E → A}.

| Closure | Résultat | Pourquoi |
|---|---|---|
| A⁺ | **ABCDE** | A → BC, B → D, CD → E |
| CD⁺ | **ABCDE** | CD → E, E → A, A → BC |
| B⁺ | **BD** | seulement B → D |
| BC⁺ | **ABCDE** | B → D, CD → E, E → A |
| E⁺ | **ABCDE** | E → A, A → BC, B → D |

> **Usage clé :** X est une **super key** si **X⁺ contient tous les
> attributs** de R ; c'est une **candidate key** si en plus aucun sous-ensemble
> strict de X n'y arrive.

## 6. Canonical cover (Fc)

### Extraneous attribute

Un attribut d'une FD est **extraneous** (en trop) si on peut le **retirer sans
changer la closure** de l'ensemble de FD. Avec F = {AB → C, A → C}, **B est
extraneous** dans AB → C : A seul détermine déjà C.

### Canonical cover

Le **canonical cover** Fc est un ensemble **minimal** de FD **équivalent** à
F, **sans dépendance redondante ni partie redondante** :

- F implique toutes les FD de Fc, et Fc implique toutes celles de F ;
- aucune FD de Fc ne contient d'attribut extraneous ;
- **chaque côté gauche est unique** dans Fc.

Ex : F = {A → B, A → C} ⇒ Fc = {A → BC}.

**Algorithme :** répéter — appliquer l'**union** (α → β1 et α → β2 deviennent
α → β1β2) ; chercher un attribut extraneous dans α ou β et le supprimer —
**jusqu'à ce que F ne change plus** (l'union peut redevenir applicable après
une suppression).

**Exemple :** R(A, B, C), F = {A → BC, B → C, A → B, AB → C}.

1. Union de A → BC et A → B : {A → BC, B → C, AB → C}.
2. **A est extraneous** dans AB → C (B → C existe déjà) : {A → BC, B → C}.
3. **C est extraneous** dans A → BC (A → B et B → C donnent A → C) :
   **Fc = {A → B, B → C}**.

**Exemple 2 :** F = {A → BC, CD → E, B → D, E → A} : côtés gauches uniques,
aucun attribut extraneous ⇒ **Fc = F**.

## 7. Decomposition

La **decomposition** remplace une relation R par **deux ou plusieurs**
relations : chacune contient un **sous-ensemble** des attributs de R, et
ensemble elles **contiennent tous les tuples et attributs** de R.

### Lossy decomposition

Elle est **lossy** quand la **jointure** de R1 et R2 **ne redonne pas** R
(*lossy-join decomposition*) : on récupère des tuples **en trop** et
l'information d'origine est perdue. **À éviter.**

### Lossless decomposition

Elle est **lossless** (*non-additive*, *non-loss*) quand la jointure de R1 et
R2 **redonne exactement** R. **Toute décomposition doit être lossless.**

```diagram
{
  "title": "Customer(Ano, Balance, Bname). Couper sur Balance (non clé) est lossy : la jointure fabrique 4 lignes. Couper sur Ano (clé) est lossless.",
  "nodes": [
    { "id": "c", "x": 110, "y": 50, "shape": "table", "size": 12, "tone": "sky", "label": "Customer", "rows": [["Ano","Balance","Bname"],["A01","5000","Rajkot"],["A02","5000","Surat"]], "cols": [50, 60, 60] },
    { "id": "l1", "x": 340, "y": 10, "shape": "table", "size": 12, "tone": "rose", "label": "Lossy : R1", "rows": [["Ano","Balance"],["A01","5000"],["A02","5000"]], "cols": [50, 60] },
    { "id": "l2", "x": 500, "y": 10, "shape": "table", "size": 12, "tone": "rose", "label": "R2", "rows": [["Balance","Bname"],["5000","Rajkot"],["5000","Surat"]], "cols": [60, 60] },
    { "id": "j", "x": 680, "y": 30, "shape": "table", "size": 12, "tone": "rose", "label": "R1 ⋈ R2 ≠ Customer", "rows": [["Ano","Balance","Bname"],["A01","5000","Rajkot"],["A01","5000","Surat"],["A02","5000","Rajkot"],["A02","5000","Surat"]], "cols": [50, 60, 60] },
    { "id": "g1", "x": 340, "y": 160, "shape": "table", "size": 12, "tone": "emerald", "label": "Lossless : R1", "rows": [["Ano","Balance"],["A01","5000"],["A02","5000"]], "cols": [50, 60] },
    { "id": "g2", "x": 500, "y": 160, "shape": "table", "size": 12, "tone": "emerald", "label": "R2", "rows": [["Ano","Bname"],["A01","Rajkot"],["A02","Surat"]], "cols": [50, 60] }
  ],
  "edges": [
    { "from": "l2", "to": "j", "tone": "rose", "label": "join" }
  ]
}
```

> **Règle pratique :** la décomposition en R1 et R2 est lossless si l'attribut
> commun (R1 ∩ R2) est une **clé** de R1 ou de R2. `Balance` n'est clé de
> rien ⇒ lossy ; `Ano` est clé ⇒ lossless.

## 8. Les anomalies

Les **anomalies** sont les problèmes d'une base **mal conçue, non
normalisée**, où tout est dans une seule table. Exemple :
`Emp_Dept(EID, Ename, City, DID, Dname, Manager)`, EID primary key.

| Anomalie | Exemple |
|---|---|
| **Insert anomaly** | un nouveau département **IT** sans employé : impossible de l'insérer, car **EID (PK) serait NULL** |
| **Delete anomaly** | Jay est le seul employé d'IT ; il part, on supprime sa ligne… et **le département IT disparaît** |
| **Update anomaly** | le manager de CE change : il faut modifier **toutes** les lignes de CE ; en oublier une → **incohérence** (Shah / Sah / Shaah) |

Solution : **normaliser** — `Emp(EID, Ename, City, DID)` et
`Dept(DID, Dname, Manager)`.

## 9. Normalization et normal forms

La **normalization** retire les données redondantes pour améliorer :

- la **data integrity** (exactitude, complétude, cohérence) ;
- la **scalability** (continuer à bien fonctionner quand la charge grandit) ;
- la **storage efficiency** (consommer le moins de place possible).

Concrètement : on **découpe** une table en plusieurs, qu'on **rejoint** à la
requête.

```diagram
{
  "title": "Chaque forme normale suppose la précédente. En montant : plus de tables et de complexité, moins de redondance.",
  "nodes": [
    { "id": "n1", "x": 70, "y": 230, "w": 135, "label": "1NF\natomic values", "tone": "sky", "filled": true },
    { "id": "n2", "x": 220, "y": 190, "w": 135, "label": "2NF\nno partial", "tone": "sky", "filled": true },
    { "id": "n3", "x": 370, "y": 150, "w": 135, "label": "3NF\nno transitive", "tone": "emerald", "filled": true },
    { "id": "nb", "x": 520, "y": 110, "w": 135, "label": "BCNF\ndeterminant = key", "tone": "emerald", "filled": true },
    { "id": "n4", "x": 670, "y": 70, "w": 135, "label": "4NF\nno MVD", "tone": "violet", "filled": true },
    { "id": "n5", "x": 820, "y": 30, "w": 135, "label": "5NF\nno lossless split", "tone": "violet", "filled": true }
  ],
  "edges": [
    { "from": "n1", "to": "n2" }, { "from": "n2", "to": "n3" }, { "from": "n3", "to": "nb" },
    { "from": "nb", "to": "n4" }, { "from": "n4", "to": "n5" }
  ]
}
```

### 1NF — First Normal Form

R est en **1NF** si et seulement si elle ne contient **aucun attribut
composite ni multivalued** ; autrement dit, tous ses domaines contiennent des
**valeurs atomiques** (une seule valeur par case).

- **Composite** : `Address = "Jamnagar Road, Rajkot"` mélange la route et la
  ville ; chercher les clients de la **ville** Jamnagar trouve aussi la
  **route** Jamnagar Road. Solution : **découper** en `Road` et `City`.
- **Multivalued** : `FailedinSubjects = "DS, DBMS"`. Solution : **deux
  tables** — `Student(Rno, Name)` et `Result(RID, Rno, Subject)` où `Rno` est
  une **foreign key** vers Student.

### 2NF — Second Normal Form

R est en **2NF** si elle est **en 1NF** et que **tout attribut non clé dépend
pleinement** de la primary key (aucune **partial dependency**).

Exemple : `Customer(CID, ANO, AccessDate, Balance, BranchName)`, clé
**(CID, ANO)**.

- FD1 : {CID, ANO} → {AccessDate, Balance, BranchName}
- FD2 : **ANO → {Balance, BranchName}** ⇒ partial dependency.

Problème : un compte joint (A01 de C01 et C02) répète Balance et BranchName.
Solution : sortir les attributs partiellement dépendants avec la partie de clé
dont ils dépendent : `Account(ANO, Balance, BranchName)` et
`Customer(CID, ANO, AccessDate)`.

### 3NF — Third Normal Form

R est en **3NF** si elle est **en 2NF** et qu'**aucun attribut non clé ne
dépend transitivement** de la primary key.

Exemple : `Account(ANO, Balance, BranchName, BranchAddress)`.

- FD1 : ANO → {Balance, BranchName, BranchAddress}
- FD2 : **BranchName → BranchAddress** ⇒ ANO → BranchAddress **par
  transitivité**.

Problème : l'adresse de la branche est répétée pour chaque compte. Solution :
`Branch(BranchName, BranchAddress)` et `Account(ANO, Balance, BranchName)` avec
`BranchName` en **foreign key**.

### BCNF — Boyce-Codd Normal Form

Basée sur la notion de **determinant** (le côté gauche d'une FD). R est en
**BCNF** si elle est **en 3NF** et que **pour toute FD X → Y, X est une clé**
(« tout déterminant est une clé »).

Exemple : `Student(RNO, Subject, Faculty)`.

- FD1 : {RNO, Subject} → Faculty
- FD2 : **Faculty → Subject** — un prof n'enseigne qu'une matière, mais une
  matière a plusieurs profs.

`Faculty` est un **déterminant** qui n'est **pas une clé** ⇒ **pas en BCNF**.
Solution : `FacultySubject(Faculty, Subject)` et `StudentFaculty(RNO, Faculty)`.

> **Piège :** une relation en BCNF est toujours en 3NF ; **l'inverse est
> faux**. La différence apparaît quand le côté droit d'une FD est un attribut
> **premier** (ici Subject, qui fait partie de la clé).

### Multivalued dependency et 4NF

Pour X → Y, si **une seule valeur de X** correspond à **plusieurs valeurs
indépendantes** de Y, on a une **multivalued dependency (MVD)**, notée
**X →→ Y**.

Exemple : l'étudiant 101 suit DS et DBMS, avec les profs Patel et Shah,
indépendamment : `RNO →→ Subject` et `RNO →→ Faculty`. Il faut 4 lignes pour
toutes les combinaisons.

R est en **4NF** si elle est **en BCNF** et **sans multivalued dependency**.
Solution : `Subject(RNO, Subject)` et `Faculty(RNO, Faculty)`. Une table peut
avoir à la fois des FD et des MVD (`RNO → Address`, `RNO →→ Subject`).

### 5NF — Fifth Normal Form

R est en **5NF** si elle est **en 4NF** et qu'**on ne peut plus la décomposer
de façon lossless** en tables plus petites.

`Student_Result(RID, RNO, Name, Subject, Result)` se décompose encore en
`Student(RNO, Name)`, `Subject(SID, Name)` et `Result(RID, RNO, SID, Result)` ;
ces trois-là ne se décomposent plus : la base est en 5NF.

| Forme | Condition (en plus de la précédente) |
|---|---|
| **1NF** | valeurs atomiques (ni composite, ni multivalued) |
| **2NF** | pas de **partial** dependency |
| **3NF** | pas de **transitive** dependency |
| **BCNF** | tout **determinant** est une **clé** |
| **4NF** | pas de **multivalued** dependency |
| **5NF** | plus aucune décomposition **lossless** possible |

## 10. Trouver la clé

Règles pour chaque attribut, en regardant où il apparaît dans les FD :

| L'attribut apparaît… | Dans la clé ? |
|---|---|
| dans **aucune** FD | **oui** (rien ne le détermine) |
| **seulement à gauche** | **oui** |
| **seulement à droite** | **non** |
| **des deux côtés** | **peut-être** |

On part du **noyau** (*core*) = les attributs « oui », on calcule sa closure,
et on ajoute des attributs « peut-être » si elle ne couvre pas tout.

**Exemple :** R(ABCD), F = {C → A, B → C}.

- D : dans aucune FD ⇒ **oui** ; B : seulement à gauche ⇒ **oui** ;
  A : seulement à droite ⇒ **non** ; C : des deux côtés ⇒ **?**
- Noyau **BD** : B → C, C → A ⇒ BD⁺ = ABCD. **Clé : BD.**

| FD | Clé |
|---|---|
| C → D, C → A, B → C | **B** (B → C → A, D) |
| B → C, D → A | **BD** |
| A → B, BC → D, A → C | **A** (A → B, C puis BC → D) |

## 11. Clé + meilleure forme normale

Méthode : trouver la clé, puis regarder chaque FD.

- côté gauche = **partie** de la clé, côté droit non premier ⇒ **partial** ⇒
  pas 2NF ;
- côté gauche **non clé**, côté droit non premier ⇒ **transitive** ⇒ pas 3NF ;
- côté gauche non clé mais côté droit **premier** ⇒ 3NF mais **pas BCNF**.

| R(ABCD), F | Candidate key(s) | Meilleure forme | Pourquoi |
|---|---|---|---|
| B → C, D → A | **BD** | **1NF** (pas 2NF) | C dépend de B seul, A de D seul : **partial** |
| C → D, C → A, B → C | **B** | **2NF** (pas 3NF) | B → C → D et B → C → A : **transitive** |
| A → B, BC → D, A → C | **A** | **2NF** (pas 3NF) | A → BC → D : **transitive** |
| ABC → D, D → A | **ABC** et **BCD** | **3NF** (pas BCNF) | D → A : D n'est pas une clé, mais A est **premier** |

> **Astuce :** une clé à **un seul attribut** ne peut pas avoir de partial
> dependency ⇒ la relation est **au moins en 2NF**.

---

## À retenir

- **X → Y** : X détermine Y. **Full** (tout X nécessaire), **partial** (une
  partie suffit), **transitive** (via un intermédiaire), **trivial** (Y ⊆ X).
- **Armstrong** : reflexivity, augmentation, transitivity (+ union,
  decomposition, pseudo-transitivity, composition, self-determination).
- **F⁺** = toutes les FD déduites de F. **α⁺** = tous les attributs déterminés
  par α ; **α⁺ = tous les attributs ⇒ α est une super key**.
- **Canonical cover** : union des côtés gauches identiques + suppression des
  attributs **extraneous**.
- **Lossless** : la jointure redonne R (attribut commun = clé d'un morceau) ;
  **lossy** : tuples parasites.
- **2NF** pas de partial, **3NF** pas de transitive, **BCNF** déterminant = clé,
  **4NF** pas de MVD (→→), **5NF** plus de décomposition lossless.
- Clé : attributs **jamais à droite** = dans la clé ; **seulement à droite** =
  hors de la clé.

## Pièges classiques du quiz

| Affirmation | Vrai / Faux |
|---|---|
| {Roll_No, Dept} → Roll_No est une FD non triviale | **Faux** : triviale (Roll_No ⊆ côté gauche) |
| Si A → BC, alors A → B (decomposition) | **Vrai** |
| Si AB → C, alors A → C | **Faux** : on ne peut pas couper le côté gauche |
| Si A → B et BD → C, alors AD → C (pseudo-transitivity) | **Vrai** |
| B⁺ = BD avec F = {A → BC, CD → E, B → D, E → A} | **Vrai** |
| Une décomposition lossy redonne la table d'origine par jointure | **Faux** : elle donne des tuples en trop |
| Toute relation en 3NF est en BCNF | **Faux** : l'inverse est vrai |
| 3NF interdit les partial dependencies | **Vrai** (elle suppose la 2NF), et en plus les transitive |
| La MVD se note X →→ Y | **Vrai** |
| Un attribut qui n'apparaît qu'à droite des FD fait partie de la clé | **Faux** |
| R(ABCD), F = {B → C, D → A} est en 2NF | **Faux** : clé BD, deux partial dependencies |
