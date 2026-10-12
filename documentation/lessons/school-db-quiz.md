# Database Design — Quiz (W4–W7) · Fiche de révision

Le QCM porte sur les **semaines 4 à 7**. Cette fiche résume ce qui tombe ; le
détail (figures, exemples complets) est dans les leçons **Week 4**, **Week 5**
et **Week 6**.

> **Semaine 7 :** les slides ne sont pas encore dans le dossier du cours. Les
> questions couvrent pour l'instant les **Lectures 07 à 11** (W4–W6) ; la
> semaine 7 sera ajoutée dès que ses slides seront là.

**Méthode conseillée :** **Toutes** puis **Aléatoire**, puis la tuile
**Flashcards** (elle reprend les questions du quiz) pour revoir les ratées.

---

## Week 4 — Keys & ERD notations

| Terme | À savoir |
|---|---|
| Relation / attribute / tuple | table / colonne / ligne (record) |
| **Degree** | nombre de **colonnes** |
| **Cardinality** (d'une table) | nombre de **lignes** |
| **Domain** | toutes les valeurs possibles d'une colonne |
| **Super key** | identifie chaque ligne (attributs en trop permis) |
| **Candidate key** | super key **minimale** |
| **Primary key** | candidate key **choisie** : une seule, jamais NULL, ne change pas |
| **Alternate key** | candidate key **non choisie** |
| **Foreign key** | référence la PK d'une autre table ; **child** = contient la FK, **parent** = contient la PK ; elle **peut se répéter** |

- Si A est la seule candidate key de R(A + n autres attributs) : **2ⁿ super
  keys**.
- Car insurance : `participated` est **ternaire** ; `damage-amount` est un
  attribut **de la relationship** ; PK de sa table = les 3 PK.

**Crow's Foot** — le symbole **intérieur** donne le minimum, celui **près de
l'entité** le maximum :

| Symbole | Sens |
|---|---|
| une barre | one |
| deux barres | one and only one |
| cercle + barre | zero or one |
| barre + patte | one or many |
| cercle + patte | zero or many |

Chen = losange pour la relationship, ovales pour les attributs. Crow's Foot =
**ligne** pour la relationship, attributs **listés dans la boîte**.

## Week 5 — XAMPP & Normalization 1

| Module XAMPP | Rôle | Port |
|---|---|---|
| Apache | web server | 80 / 443 |
| MySQL / MariaDB | database server | 3306 |
| FileZilla | FTP server | 21 |
| Mercury | mail server | 25 |
| Tomcat | Java web server | 8080 |

phpMyAdmin : `http://localhost/phpmyadmin/`. Bases système à ne pas toucher :
`information_schema`, `mysql`, `performance_schema`, `phpmyadmin`.

| Anomalie | Exemple |
|---|---|
| **Insertion** | impossible d'ajouter une branche sans étudiant / il faut recopier la branche à chaque ligne |
| **Deletion** | supprimer le dernier étudiant fait perdre la branche |
| **Update** | changer le HOD sur toutes les lignes ; en oublier une → incohérence |

- La normalisation **minimise** la redondance (elle ne l'élimine pas).
- **1NF** : valeurs atomiques, même type par colonne, noms uniques, ordre des
  lignes sans importance, pas de repeating groups.
- **2NF** : 1NF + **pas de partial dependency** (attribut non premier qui
  dépend d'une **partie** d'une clé **composée**).

## Week 6 — Functional dependency & normal forms

**Types de FD :** full (tout X est nécessaire), partial (une partie de X
suffit), transitive (A → B → C), trivial (Y ⊆ X), non-trivial.

| Armstrong | Règle |
|---|---|
| Reflexivity | B ⊆ A ⇒ A → B |
| Augmentation | A → B ⇒ AC → BC |
| Transitivity | A → B, B → C ⇒ A → C |
| Pseudo-transitivity | A → B, BD → C ⇒ AD → C |
| Union | A → B, A → C ⇒ A → BC |
| Decomposition | A → BC ⇒ A → B, A → C |
| Composition | A → B, C → D ⇒ AC → BD |

On ne coupe **jamais** le côté **gauche** : AB → C n'implique pas A → C.

**Closure α⁺ :** partir de α, ajouter le côté droit de chaque FD dont le côté
gauche est déjà dedans, recommencer jusqu'à stabilité. **α⁺ = tous les
attributs ⇒ α est une super key.**

**Trouver la clé :** attribut jamais à droite (ou dans aucune FD) ⇒ dans la
clé ; seulement à droite ⇒ hors de la clé ; des deux côtés ⇒ peut-être.

**Canonical cover :** union des FD au même côté gauche + suppression des
attributs **extraneous** (AB → C avec A → C : B est extraneous).

**Decomposition :** **lossless** si l'attribut commun est une **clé** d'un des
morceaux ; sinon **lossy** (la jointure crée des tuples parasites).

| Forme | Condition |
|---|---|
| 1NF | valeurs atomiques |
| 2NF | 1NF + pas de **partial** |
| 3NF | 2NF + pas de **transitive** |
| BCNF | tout **déterminant** est une clé |
| 4NF | BCNF + pas de **MVD** (X →→ Y) |
| 5NF | plus de décomposition lossless possible |

**Meilleure forme normale, la méthode :** trouver la clé, puis pour chaque FD :
gauche = partie de clé ⇒ pas 2NF ; gauche non clé, droite non premier ⇒ pas
3NF ; gauche non clé, droite **premier** ⇒ 3NF mais pas BCNF. Clé à un seul
attribut ⇒ au moins 2NF.
