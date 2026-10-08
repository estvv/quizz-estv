# Database Design — Week 5 · XAMPP & Normalization 1

**Cours** : Lecture 08, *Introduction to XAMPP* (les modules du Control
Panel, phpMyAdmin, créer une base et une table) et Lecture 09,
*Normalization – 1* (la redondance, les trois **anomalies**, la **1NF** et la
**2NF** avec la **partial dependency**).

> **En bref.** La **redondance** (répéter la même donnée sur plusieurs lignes)
> gaspille de la place et provoque trois **anomalies** : **insertion**,
> **deletion** et **update**. La **normalisation** découpe une grosse table en
> petites tables reliées. **1NF** : valeurs **atomiques**, pas de groupes
> répétés. **2NF** : 1NF **+ aucune partial dependency** (aucun attribut non
> clé ne dépend d'une **partie seulement** de la clé composée).

---

# Partie 1 — XAMPP

## 1. Qu'est-ce que XAMPP ?

**XAMPP** est un paquet gratuit (téléchargé sur `apachefriends.org`) qui
installe d'un coup un **serveur web local** et ses compagnons, pilotés depuis
le **XAMPP Control Panel**. Le nom vient de ses briques : **X** (cross-platform),
**A**pache, **M**ySQL/**M**ariaDB, **P**HP, **P**erl.

| Module | Ce que c'est | À quoi il sert | Port |
|---|---|---|---|
| **Apache** | **web server** | fait tourner tes sites **en local** : `http://localhost` | **80** (HTTP), **443** (HTTPS) |
| **MySQL** | **database server** (souvent **MariaDB** dans les XAMPP récents) | stocke et gère les données (WordPress, Laravel…) | **3306** |
| **FileZilla** | **FTP server** | **transférer des fichiers** entre machines sur le réseau | 21 |
| **Mercury** | **mail server** | **envoyer et recevoir des e-mails** en local (tester un mail de reset de mot de passe) | 25 |
| **Tomcat** | **Java web server** | faire tourner des applis **Java** (JSP, Servlets) | 8080 |

> **Piège :** **Apache** sert les **pages web**, **MySQL** stocke les
> **données**. Le port de MySQL est **3306**, celui d'Apache **80 / 443**.

```diagram
{
  "title": "Le navigateur parle à Apache ; PHP (et phpMyAdmin) parle à MySQL/MariaDB.",
  "nodes": [
    { "id": "b", "x": 80, "y": 60, "label": "Navigateur\nhttp://localhost", "tone": "neutral" },
    { "id": "a", "x": 360, "y": 60, "label": "Apache\nweb server · port 80/443", "tone": "sky", "filled": true },
    { "id": "p", "x": 360, "y": 170, "label": "PHP / phpMyAdmin", "tone": "violet", "filled": true },
    { "id": "m", "x": 610, "y": 170, "shape": "cylinder", "label": "MySQL / MariaDB\nport 3306", "tone": "amber" }
  ],
  "edges": [
    { "from": "b", "to": "a", "arrow": "both", "label": "HTTP" },
    { "from": "a", "to": "p" },
    { "from": "p", "to": "m", "arrow": "both", "label": "SQL" }
  ]
}
```

## 2. phpMyAdmin : créer une base et une table

On administre MySQL depuis le navigateur avec **phpMyAdmin** :

- en local : `http://localhost/phpmyadmin/`
- depuis une autre machine : `http://[YOUR_IP]/phpmyadmin/`

Étapes vues en cours :

1. **Démarrer Apache et MySQL** dans le Control Panel.
2. Ouvrir `http://localhost/phpmyadmin/`.
3. Onglet **Databases** → **Create database** : taper le nom, choisir la
   **collation** (`utf8mb4_general_ci`) → **Create**.
4. Dans la base : **Create new table** → **Table name** + **Number of
   columns** → **Create**.
5. Remplir chaque colonne : **Name**, **Type** (`INT`, `VARCHAR`, `DATE`…),
   **Length/Values**, **Default**, **Collation**, **Attributes**, **Index**
   (`PRIMARY`), **A_I** (auto-increment) → **Save**.

> Les bases déjà présentes (`information_schema`, `mysql`,
> `performance_schema`, `phpmyadmin`) sont des **bases système** : ne pas y
> toucher.

---

# Partie 2 — Normalization 1

## 3. Qu'est-ce que la normalisation ?

- La **normalization** est une technique de conception qui **organise les
  tables** pour **réduire la redondance et la dépendance** des données.
- Elle **divise les grosses tables en petites tables** et les **relie par des
  relationships**.
- Autrement dit : organiser les données en **plusieurs tables liées** pour
  **minimiser la data redundancy**.

## 4. La redondance et ses problèmes

La **data redundancy**, c'est la **répétition** de la même donnée. Dans la
table des slides, `branch`, `hod` et `office_tel` sont recopiés sur **chaque**
ligne d'étudiant :

```diagram
{
  "title": "Students : les trois colonnes en rouge répètent la même information sur chaque ligne.",
  "nodes": [
    { "id": "t", "x": 300, "y": 80, "shape": "table", "size": 12, "tone": "sky", "label": "STUDENTS TABLE",
      "rows": [["rollno","name","branch","hod","office_tel"],["1","Akon","CSE","Mr. X","53337"],["2","Bkon","CSE","Mr. X","53337"],["3","Ckon","CSE","Mr. X","53337"],["4","Dkon","CSE","Mr. X","53337"]],
      "cols": [60, 70, 70, 70, 80] },
    { "id": "n", "x": 300, "y": 200, "w": 360, "shape": "note", "tone": "rose", "size": 12, "label": "branch · hod · office_tel : redondants" }
  ]
}
```

Conséquences :

- la **taille de la base augmente** (place gaspillée) ;
- trois anomalies : **insertion**, **deletion**, **updation**.

### Insertion anomaly

Pour **insérer** un nouvel étudiant, il faut **recopier** les données de la
branche (`CSE`, `Mr. X`, `53337`) à chaque fois. Insérer des données
**redondantes pour chaque nouvelle ligne** est une **insertion anomaly**.
(Et inversement : impossible d'enregistrer une branche **sans** étudiant.)

### Deletion anomaly

**Perte de données liées quand on supprime d'autres données.** Si on supprime
les étudiants un par un, à la dernière suppression **les infos de la branche
disparaissent avec eux** : elles n'étaient stockées **nulle part ailleurs**.

### Update (modification) anomaly

Mr. X part, Mr. Y devient le nouveau HOD de CSE : il faut modifier **toutes**
les lignes. **Si on en oublie une**, la table devient **incohérente** (une
ligne dit Mr. X, les autres Mr. Y).

> **À retenir :** la redondance entraîne l'**incohérence** (*inconsistency*)
> des données, à cause de l'update anomaly.

| Anomalie | Ce qui se passe |
|---|---|
| **Insertion** | il faut répéter des données à chaque insertion (ou on ne peut pas insérer sans une autre donnée) |
| **Deletion** | supprimer une ligne fait perdre une autre information |
| **Update** | modifier une info demande de changer plusieurs lignes ; en oublier une → incohérence |

## 5. La solution : découper la table

La normalisation coupe `Students` en **Student** + **Branch** :

```diagram
{
  "title": "Students → Student + Branch. La branche n'est plus écrite qu'une fois ; Student garde seulement son code.",
  "nodes": [
    { "id": "s", "x": 140, "y": 70, "shape": "table", "size": 12, "tone": "sky", "label": "STUDENTS TABLE",
      "rows": [["rollno","name","branch"],["1","Akon","CSE"],["2","Bkon","CSE"],["3","Ckon","CSE"],["4","Dkon","CSE"]], "cols": [60, 70, 70] },
    { "id": "b", "x": 470, "y": 50, "shape": "table", "size": 12, "tone": "emerald", "label": "BRANCH TABLE",
      "rows": [["branch","hod","office_tel"],["CSE","Mr. Y","53337"]], "cols": [70, 70, 80] }
  ],
  "edges": [
    { "from": "s", "to": "b", "label": "branch" }
  ]
}
```

- **Insertion résolue** : un nouvel étudiant ne porte que `CSE`.
- **Deletion résolue** : supprimer tous les étudiants laisse la ligne `CSE`
  dans Branch.
- **Update résolue** : changer de HOD = **une seule** ligne à modifier.

> **Piège :** on ne **supprime pas** la redondance (la colonne `branch` se
> répète encore dans Student), on la **minimise** (*not eliminating, but
> minimizing redundancy*).

Pourquoi c'est bien : **diviser pour régner** (*divide and rule*), des données
**logiques, indépendantes mais reliées**.

### Les notions qui viennent ensuite

- **Dependency** : functional, fully functional, **partial**, **transitive**,
  multi-valued, trivial, non-trivial (détaillées en semaine 6).
- **Decomposition** : **lossy** ou **non-lossy (lossless)**.
- **Pourquoi** : rendre la base adaptée aux requêtes et **libre des anomalies
  d'insertion, de mise à jour et de suppression** qui menacent l'**intégrité**
  des données.
- **But** : **réduire la redondance** et **améliorer l'intégrité** ; plus
  propre et plus facile à faire évoluer.

## 6. First Normal Form (1NF)

C'est l'**étape 1** de la normalisation : **toute table** devrait au moins être
en 1NF, sinon c'est une **mauvaise conception**.

### Les 4 règles de la 1NF

| Règle | Énoncé | Exemple de violation |
|---|---|---|
| **1** | chaque colonne contient des **valeurs atomiques** (une seule valeur par case) | `X, Y` dans une case |
| **2** | une colonne contient des valeurs **du même type** | une date dans la colonne `Name` |
| **3** | chaque colonne a un **nom unique** | deux colonnes `Name` → `F_Name`, `L_Name` |
| **4** | l'**ordre** des lignes **n'a pas d'importance** | — (SQL trie comme on veut) |

Formulation « officielle » :

1. chaque **nom d'attribut** est **unique** ;
2. chaque **valeur d'attribut** est **simple** (*single*) ;
3. chaque **ligne** est **unique** ;
4. **pas de repeating groups**.

### Exemple : la colonne subject

```diagram
{
  "title": "À gauche : « OS, CN » dans une case viole la 1NF. À droite : une ligne par matière.",
  "nodes": [
    { "id": "a", "x": 140, "y": 60, "shape": "table", "size": 12, "tone": "rose", "label": "Pas en 1NF",
      "rows": [["rollno","name","subject"],["101","Akon","OS, CN"],["103","Ckon","JAVA"],["102","Bkon","C, C++"]], "mark": [1, 3], "cols": [60, 60, 70] },
    { "id": "b", "x": 470, "y": 80, "shape": "table", "size": 12, "tone": "emerald", "label": "En 1NF",
      "rows": [["rollno","name","subject"],["101","Akon","OS"],["101","Akon","CN"],["103","Ckon","JAVA"],["102","Bkon","C"],["102","Bkon","C++"]], "cols": [60, 60, 70] }
  ],
  "edges": [
    { "from": "a", "to": "b", "label": "aplatir" }
  ]
}
```

On **aplatit** (*flatten*) la table : une ligne par valeur.

### Exemple : groupes répétés

`Group A — Intro MongoDB — Sok San 18, Sao Ry 17` : une case `Student` contient
**plusieurs étudiants** (valeurs non simples) et le groupe se répète
(**repeating group**). Correction : une ligne par étudiant, et `Student`
découpé en `Family Name` + `Given Name`. La table est alors en 1NF… mais
peut encore violer la 2NF.

## 7. Second Normal Form (2NF)

Une table est en **2NF** si :

1. elle est **en 1NF** ;
2. elle **n'a aucune partial dependency**.

### Dependency

Dans `Student(student_id, name, reg_no, branch, address)`, connaître
`student_id` permet de retrouver **toutes** les autres colonnes : c'est une
**dependency** (ou **functional dependency**). Le nom ne suffit pas (deux
étudiants s'appellent Akon).

### Partial dependency

Une **partial dependency**, c'est quand un **attribut non premier** dépend
d'une **partie seulement** de la **primary key** (composée).

```diagram
{
  "title": "Partial dependency : une partie de la clé détermine un attribut non premier.",
  "nodes": [
    { "id": "k", "x": 120, "y": 40, "w": 180, "label": "part of primary key", "tone": "sky", "filled": true },
    { "id": "n", "x": 470, "y": 40, "w": 180, "label": "non-prime attribute", "tone": "amber", "filled": true }
  ],
  "edges": [
    { "from": "k", "to": "n", "tone": "rose", "label": "partial dependency" }
  ]
}
```

L'exemple des slides : trois tables **Student**, **Subject** et **Score**
(notes de chaque étudiant dans chaque matière). Student–Subject est une
relation **many-to-many** (un étudiant suit plusieurs matières, une matière a
plusieurs étudiants). La primary key significative de Score est
**`student_id + subject_id`**.

```diagram
{
  "title": "Score : la clé est (student_id, subject_id) mais teacher ne dépend que de subject_id → partial dependency.",
  "nodes": [
    { "id": "t", "x": 260, "y": 80, "shape": "table", "size": 12, "tone": "sky", "label": "SCORE TABLE",
      "rows": [["score_id","student_id","subject_id","marks","teacher"],["1","10","1","82","Mr. J"],["2","10","2","77","Mr. C++"],["3","11","1","85","Mr. J"],["4","11","2","82","Mr. C++"],["5","11","4","95","Mr. P"]],
      "cols": [70, 80, 80, 60, 80] },
    { "id": "n", "x": 590, "y": 80, "w": 190, "shape": "note", "tone": "rose", "size": 12, "label": "teacher dépend\nseulement du subject,\npas du student" }
  ]
}
```

`teacher` dépend **seulement de la matière**, pas de l'étudiant : c'est une
**partial dependency**, donc Score **n'est pas en 2NF**.

### Supprimer la partial dependency

Plusieurs solutions possibles ; le but est de **sortir `teacher` de Score**.
On le **déplace dans Subject** (où il « a plus de sens »), ou mieux, dans une
table **Teacher** séparée (où l'on peut ajouter date d'embauche, salaire…).

```diagram
{
  "title": "Après : Score(student_id, subject_id, marks) ; teacher va dans Subject (ou dans sa propre table Teacher).",
  "nodes": [
    { "id": "sc", "x": 130, "y": 70, "shape": "table", "size": 12, "tone": "sky", "label": "SCORE",
      "rows": [["student_id","subject_id","marks"],["10","1","82"],["10","2","77"],["11","1","85"]], "cols": [80, 80, 50] },
    { "id": "su", "x": 440, "y": 70, "shape": "table", "size": 12, "tone": "emerald", "label": "SUBJECT",
      "rows": [["subject_id","subject_name","teacher"],["1","Java","Mr. J"],["2","C++","Mr. C++"],["3","C#","Mr. C#"],["4","Php","Mr. P"]], "cols": [80, 100, 70] },
    { "id": "te", "x": 720, "y": 70, "shape": "table", "size": 12, "tone": "violet", "label": "TEACHER",
      "rows": [["teacher_id","teacher_name"],["1","Mr. J"],["2","Mr. C++"]], "cols": [80, 100] }
  ],
  "edges": [
    { "from": "sc", "to": "su", "label": "subject_id" },
    { "from": "su", "to": "te", "dashed": true }
  ]
}
```

---

## À retenir

- XAMPP : **Apache** = web server (80/443), **MySQL/MariaDB** = database
  server (3306), **FileZilla** = FTP, **Mercury** = mail, **Tomcat** = Java.
  phpMyAdmin : `http://localhost/phpmyadmin/`.
- **Normalization** : découper en petites tables reliées pour **réduire la
  redondance**.
- Redondance → **plus de place** + anomalies **insertion / deletion /
  update** → **incohérence**.
- La normalisation **minimise** la redondance, elle ne l'élimine pas.
- **1NF** : valeurs **atomiques**, même type par colonne, noms de colonnes
  **uniques**, ordre sans importance ; pas de **repeating groups**.
- **2NF** : **1NF + pas de partial dependency** (un attribut non premier qui
  dépend d'une **partie** de la clé composée).

## Pièges classiques du quiz

| Affirmation | Vrai / Faux |
|---|---|
| MySQL écoute par défaut sur le port 80 | **Faux** : 3306 (80 = Apache) |
| FileZilla, dans XAMPP, est un serveur mail | **Faux** : FTP ; le mail, c'est Mercury |
| Tomcat sert les applis PHP | **Faux** : les applis Java (JSP, Servlets) |
| La normalisation élimine toute redondance | **Faux** : elle la minimise |
| Supprimer le dernier étudiant fait perdre la branche : deletion anomaly | **Vrai** |
| Oublier de modifier une ligne en changeant de HOD : update anomaly | **Vrai** |
| « OS, CN » dans une seule case respecte la 1NF | **Faux** : valeur non atomique |
| En 1NF, l'ordre des lignes compte | **Faux** |
| Une table en 2NF peut avoir une partial dependency | **Faux** |
| Une partial dependency ne peut exister qu'avec une clé composée | **Vrai** |
