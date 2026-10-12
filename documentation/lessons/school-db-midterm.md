# Database Design — Mid Term (W1–W7) · Plan de révision

Le midterm (semaine 8 du syllabus) couvre **tout le cours depuis la semaine 1**.
Cette catégorie mélange des questions de **toutes les semaines** dans le style
d'un QCM d'examen. Chaque semaine a aussi sa propre leçon, son quiz et ses
flashcards : sers-t'en pour combler les trous.

> **Semaine 7 :** pas encore de slides dans le dossier du cours ; les
> questions couvrent les **Lectures 01 à 11** (W1–W6). La semaine 7 sera
> ajoutée dès que ses slides seront là.

Pour les semaines 4 à 6, la catégorie **Quiz (W4–W7)** a une fiche plus
détaillée et une banque de questions dédiée.

**Méthode conseillée :**

1. Faire ce quiz une première fois à froid : **Toutes** puis **Aléatoire**.
2. Pour chaque semaine où tu rates des questions, relire la **leçon** de la
   semaine puis refaire son quiz.
3. Revoir les ratées avec la tuile **Flashcards** (elle reprend les questions
   du quiz).
4. Refaire le Mid Term complet la veille.

---

## La checklist par semaine

| Semaine | Ce qu'il faut savoir sans hésiter |
|---|---|
| **W1** · Intro DBMS | data vs information ; DBMS = logiciel qui définit / manipule / récupère / gère ; les **8 advantages** (redundancy, inconsistency, isolation, atomicity, integrity, sharing, access, backup) ; metadata / data dictionary / data warehouse ; **ANSI-SPARC** internal / conceptual / external ; **physical vs logical data independence** (logical = plus dure) ; les 4 types d'utilisateurs ; rôles du DBA ; query processor (DDL interpreter, DML compiler, query evaluation engine) et storage manager (buffer, file, authorization, transaction) |
| **W2** · ACID, data models, E-R 1 | schema vs instance ; **ACID** et qui l'assure (transaction-recovery, programmeur, concurrency control, recovery) ; dirty read / dirty write / non-repeatable read / phantom ; **data models** : hierarchical (arbre, 1 parent), network (graphe), E-R, relational, OO (OID), OR (FK), semi-structured (XML) ; symboles E-R et **types d'attributs** (simple / composite, single / multi-valued, stored / derived) ; descriptive attribute ; binary / ternary |
| **W3** · E-R 2 et 3 | roles, **recursive** ; **mapping cardinality** 1:1, 1:N, N:1, N:N ; **participation** partial / total ; **weak entity** (double rectangle, double losange, discriminator en pointillés, PK = PK forte + discriminator) ; superclass / subclass ; **generalization bottom-up, specialization top-down** ; total / partial, disjoint / overlapping ; **aggregation** ; **E-R → tables** (5 steps) ; **integrity constraints** (Check, Not null, Unique, PK = Unique + Not null, FK) |
| **W4** · Keys & Crow's Foot | degree = colonnes, cardinality = lignes, domain ; super / candidate / primary / alternate / foreign key ; compter les super keys (2ⁿ) ; symboles **Crow's Foot** |
| **W5** · XAMPP & Normalization 1 | modules XAMPP et ports ; anomalies insertion / deletion / update ; **1NF** (atomique) ; **2NF** (pas de partial) |
| **W6** · FD & normal forms | types de FD ; **Armstrong** ; **closure α⁺** ; canonical cover ; lossy / lossless ; **3NF, BCNF, 4NF, 5NF** ; trouver la **clé** et la **meilleure forme normale** |

## Les confusions qui coûtent des points

| Ne pas confondre | |
|---|---|
| **Database** / **DBMS** | les données / le logiciel |
| **Data dictionary** / **data warehouse** | la metadata / les données |
| **Physical** / **logical** independence | changer le stockage / changer le schéma logique |
| **Dirty read** / **non-repeatable read** / **phantom** | valeur non commitée / même ligne, autre valeur / autre ensemble de lignes |
| **Hierarchical** / **network** | un parent (arbre) / plusieurs parents (graphe) |
| **Derived** / **multivalued** | ovale pointillé / double ovale |
| **Generalization** / **specialization** | bottom-up / top-down |
| **Aggregation** / **generalization** | regrouper une relationship + ses entités / fusionner des entités (ISA) |
| **Cardinality d'une table** / **mapping cardinality** | nombre de lignes / 1:1, 1:N… |
| **Super key** / **candidate key** | identifie / identifie **et** minimale |
| **Unique** / **Primary key** | NULL autorisé / NULL interdit |
| **Partial** / **transitive** dependency | casse la 2NF / casse la 3NF |
| **3NF** / **BCNF** | BCNF ⇒ 3NF, pas l'inverse |
