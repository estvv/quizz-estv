# Software Engineering — Week 4 · Features, Scenarios & User Stories

**Cours** : *Understanding users and specifying outcomes* (Sommerville 2021,
chapitre 3). Les **personas**, les **scenarios**, les **user stories** (et les
**epics**), les **features** (dérivation, description, propriétés,
trade-offs, **feature creep**), les **acceptance criteria** au format
**Given / When / Then**, et la différence avec les **acceptance tests** et la
**Definition of Done**.
**Lab** : *Two stories, checkable outcomes* (M2_story_slice.md).

> **En bref.** Une **persona** = un **type d'utilisateur** imaginé. Un
> **scenario** = un **récit** de cette personne qui utilise le produit dans
> une situation. Une **user story** = **un besoin précis** : *As a [role], I
> want [action], so that [reason]*. Une **feature** = une **capacité du
> produit**. Les **acceptance criteria** rendent le besoin **vérifiable**
> (*Given / When / Then*). Au quiz, sache **distinguer ces représentations**
> et **reconnaître un bon critère** (observable, sans « good » ni « fast »).

---

# Partie 1 — Cours

## 1. Pourquoi ces représentations ?

La **product vision** donne la direction (*users and value*). Le développement
incrémental doit aussi décider **quelles capacités** les utilisateurs
trouveront utiles et **comment** chacune doit se comporter.

```diagram
{
  "title": "Les nouvelles informations issues de l'évaluation font évoluer le choix des features.",
  "nodes": [
    { "id": "v", "x": 70, "y": 50, "w": 120, "label": "Product vision\nusers and value", "tone": "sky", "filled": true },
    { "id": "u", "x": 240, "y": 50, "w": 150, "label": "Understand use\nand refine features", "tone": "amber", "filled": true },
    { "id": "d", "x": 420, "y": 50, "w": 140, "label": "Develop a usable\nincrement", "tone": "emerald", "filled": true },
    { "id": "e", "x": 590, "y": 50, "w": 120, "label": "Evaluate\nwith users", "tone": "violet", "filled": true }
  ],
  "edges": [
    { "from": "v", "to": "u" }, { "from": "u", "to": "d" }, { "from": "d", "to": "e" },
    { "from": "e", "to": "u", "dashed": true, "label": "new information", "via": [[590, 120], [240, 120]] }
  ]
}
```

**Personas, scenarios et stories** aident l'équipe à raisonner sur ces choix :
ils rendent **visibles les hypothèses** sur les utilisateurs et servent de
support de discussion.

```diagram
{
  "title": "Persona → scenario → user story → feature. Un scenario suggère aussi directement des features.",
  "nodes": [
    { "id": "p", "x": 70, "y": 50, "w": 120, "label": "Persona\na type of user", "tone": "sky", "filled": true },
    { "id": "s", "x": 240, "y": 50, "w": 130, "label": "Scenario\nuse in a situation", "tone": "amber", "filled": true },
    { "id": "u", "x": 410, "y": 50, "w": 130, "label": "User story\na specific need", "tone": "emerald", "filled": true },
    { "id": "f", "x": 580, "y": 50, "w": 130, "label": "Feature\nproduct capability", "tone": "violet", "filled": true }
  ],
  "edges": [
    { "from": "p", "to": "s" }, { "from": "s", "to": "u" }, { "from": "u", "to": "f" },
    { "from": "s", "to": "f", "dashed": true, "via": [[240, 120], [580, 120]] }
  ]
}
```

- **Un** scenario peut suggérer **plusieurs** stories.
- **Plusieurs** stories peuvent décrire différents aspects d'**une** feature.
- Une **feature** est un **fragment de fonctionnalité** qui répond à un besoin
  de l'utilisateur ou du système.

## 2. Personas

Une **persona** est un **personnage imaginé** qui représente **un type
d'utilisateur potentiel**. Elle aide les développeurs à partager une
compréhension de la **situation**, des **capacités** et des **raisons** de cet
utilisateur.

| Aspect | Ce qu'il apporte au design |
|---|---|
| **Personal context** | un nom et une situation rendent l'utilisateur concret |
| **Work or activity** | ses responsabilités expliquent les tâches à supporter |
| **Skills and experience** | son niveau technique dit ce qu'il peut comprendre et utiliser |
| **Product relevance** | pourquoi le produit compte pour lui |

> **Piège :** un **rôle** (« teacher ») est une **catégorie** ; une
> **persona** ajoute le **contexte** pour raisonner sur un **type** précis de
> teacher.

### Evidence et proto-personas

| **Personas grounded in user research** | **Proto-personas** |
|---|---|
| tirées d'**interviews, observations**, données utilisateurs ; on abstrait les **traits récurrents** puis on compare | construites avec les **connaissances limitées** de l'équipe pour **rendre explicite** sa vision des users |
| représentent un **type** d'utilisateur, pas la retranscription d'un individu | **base de preuves plus faible** : les hypothèses importantes restent **à vérifier** |

> **À retenir :** une description **convaincante** n'est **pas une preuve**.

### Les personas d'iLearn

**iLearn** permet aux écoles de configurer des outils d'apprentissage.

| Persona | Profil | Usage |
|---|---|---|
| **Jack** | instituteur, **ancien web developer**, croit au digital learning | projets de classe collaboratifs |
| **Emma** | prof d'**histoire**, veut **moins d'administratif**, préfère enseigner en classe | organiser des groupes, accéder à du matériel |
| **Elena** | **technicienne IT** compétente, se forme au digital learning | configurer et maintenir les environnements |

Même pour un seul produit, **compétences techniques et enthousiasme
varient**.

## 3. Scenarios

Un **scenario** est un **récit** (*narrative*) d'un utilisateur qui utilise le
produit **dans une situation particulière**. Il relie :

`user and situation` → `objective and current activity` → `difficulty or
unmet need` → `possible use of the product`.

- Il donne quelque chose de **concret** à discuter, révèle des **capacités
  manquantes** et des **contraintes**.
- Les premiers scenarios sont **généralement incomplets** : ils **ne sont pas
  une spécification complète**.

### Le scenario de Jack

Les élèves de Jack étudient l'**industrie de la pêche locale** : souvenirs de
famille, archives, **photos**, avec un **wiki iLearn** et l'archive **SCRAN**.

| Besoin | Contrainte | Réponse |
|---|---|---|
| partager et commenter des photos | Jack **vérifie les photos avant publication** | ajouter un service photo **modéré** |

Des collègues recommandent **KidsTakePics** ; comme il **n'utilise pas
l'authentification iLearn**, Jack crée des comptes prof et classe séparés puis
ajoute le service à l'environnement de la classe. Le récit révèle trois
besoins : **modération**, **accès à un service externe**, **configuration**.

### Contrainte réelle ou simple solution ?

Un détail concret peut être une **vraie contrainte** ou **une solution parmi
d'autres** :

| Détail du scenario | Sens pour le design |
|---|---|
| Emma se connecte avec ses **identifiants Google** | le vrai besoin est sans doute **d'éviter un login de plus** : d'autres mécanismes conviennent |
| les profs veulent des blogs **WordPress** | peut être une **vraie exigence** : la remplacer par « any blog » perdrait de l'information |

## 4. User stories

| | **Scenario** | **User story** |
|---|---|---|
| Focus | une **personne** dans une **activité** | un **rôle** qui a besoin d'**une capacité** |
| Contexte | relie actions, difficultés, travail autour | se concentre sur **un besoin** (et parfois sa raison) |
| Usage | communiquer avec les users, explorer | **affiner les features** et, assez détaillée, **planifier** |

Les deux sont **complémentaires** : des stories isolées peuvent perdre la
**situation** qui explique pourquoi elles vont ensemble.

### La structure

```diagram
{
  "title": "As a [role], I need/want [action], so that [rationale]. La rationale est utile, pas obligatoire.",
  "nodes": [
    { "id": "r", "x": 100, "y": 40, "w": 170, "label": "As a teacher,", "tone": "sky", "filled": true },
    { "id": "a", "x": 330, "y": 40, "w": 260, "label": "I need to report attendance\nfor a class trip,", "tone": "amber", "filled": true },
    { "id": "w", "x": 590, "y": 40, "w": 230, "label": "so that the school can maintain\nits health and safety records.", "tone": "emerald", "filled": true },
    { "id": "rl", "x": 100, "y": 110, "shape": "text", "label": "Role : whose need?" },
    { "id": "al", "x": 330, "y": 110, "shape": "text", "label": "Action : what capability?" },
    { "id": "wl", "x": 590, "y": 110, "shape": "text", "label": "Rationale : why useful?" }
  ]
}
```

- **Role** : le besoin de qui ?
- **Action** : quelle capacité ?
- **Rationale** : pourquoi c'est utile ? Sommerville la juge utile **quand elle
  apporte de la compréhension**, pas **obligatoire** à chaque story.
- La phrase est un **point de départ** pour clarifier, pas toute la
  connaissance nécessaire.

### Stories tirées du scenario d'Emma

Emma travaille de chez elle et a un compte **teacher** et un compte
**parent**. Trois besoins distincts :

| Détail | Story |
|---|---|
| identifiants existants | *As a teacher, I want to use my Google credentials from home so that I do not need another login and password.* |
| choisir un compte | *As a teacher and parent, I want to choose the appropriate iLearn account while using one set of credentials.* |
| atteindre ses outils | *As a teacher, I want access to the applications I use for class management and administration.* |

Elles séparent **authentification**, **choix du compte** et **accès aux
applis**.

### Taille des stories et epics

- Pour le **Sprint planning**, une story doit tenir **dans un Sprint**.
- Une story trop large, qui **s'étale sur plusieurs Sprints**, s'appelle un
  **epic**. Ex : un administrateur veut **sauvegarder et restaurer** applis,
  fichiers, dossiers et tout le système → à **découper**.
- En **découverte**, une story large peut rester utile : le niveau de détail
  dépend de la décision à prendre.

## 5. Features

### Dériver des features d'un scenario

On regarde **ce que font les users**, les **capacités** qui le permettent, et
si une capacité **plus générale** est nécessaire.

| Action dans le scenario de Jack | Feature |
|---|---|
| rassembler des histoires dans un **wiki** | **collaborative writing** |
| accéder à l'archive **SCRAN** | **accès à des ressources externes** (et à d'autres archives ?) |
| contacter un groupe de profs par **email** | **email groups** |
| ajouter **KidsTakePics** à la classe | **configurer les outils** d'un environnement |

> **Piège :** une action est un **indice**, pas un **ordre** de construire une
> feature séparée : on peut **regrouper** des actions ou trouver un besoin
> plus large.

### Une feature, plusieurs stories

La feature **Groups** d'iLearn regroupe : **créer un groupe** et choisir ses
membres, **envoyer un email** à tous via une adresse, **partager** des
fichiers. Ces stories **ne spécifient pas tout** : il manque **modifier /
supprimer** un groupe, **restreindre l'accès**… Après dérivation, il faut
**relire pour trouver les oublis**.

### Décrire une feature : New Group

```diagram
{
  "title": "New Group : input, action, output, et une activation (menu ou raccourci clavier).",
  "nodes": [
    { "id": "i", "x": 90, "y": 50, "w": 160, "label": "Input\na group name\nchosen by the user", "tone": "sky", "filled": true },
    { "id": "a", "x": 320, "y": 50, "w": 170, "label": "Action\ncreate a container\nwith that name", "tone": "amber", "filled": true },
    { "id": "o", "x": 560, "y": 50, "w": 180, "label": "Output\nan empty container +\nan updated document list", "tone": "emerald", "filled": true },
    { "id": "t", "x": 320, "y": 150, "w": 440, "shape": "note", "label": "Activation : New Group menu option or keyboard shortcut", "tone": "violet" }
  ],
  "edges": [
    { "from": "i", "to": "a" }, { "from": "a", "to": "o" }, { "from": "t", "to": "a", "dashed": true }
  ]
}
```

Une utilité **familière** a besoin d'une description **courte** ; une
capacité **inhabituelle** demande plus d'explications avant
l'implémentation.

### Propriétés souhaitables d'une feature

| Propriété | Sens |
|---|---|
| **Independence** | ne dépend pas de l'**implémentation interne** d'une autre feature ni d'un **ordre d'activation** de features sans rapport |
| **Coherence** | supporte **un seul** élément de fonctionnalité cohérent, **sans effets de bord** sans rapport |
| **Relevance** | supporte des tâches que les users **font normalement**, pas des possibilités obscures |

### Les sources de connaissance

| Source | Apport |
|---|---|
| **Users** | leurs besoins, comment la capacité s'intègre à leur travail |
| **Existing products** | les capacités **familières** que les users attendent |
| **Domain** | les pratiques et contraintes du métier ; de nouvelles approches |
| **Technology** | des opportunités que les anciens produits n'ont pas |

Leur poids varie : un logiciel métier spécialisé demande plus de
connaissance du **domaine** qu'un utilitaire grand public.

### Les trade-offs

| Trade-off | Conséquence |
|---|---|
| **Simplicity / functionality** | plus de capacités = plus de besoins couverts, mais produit **plus dur** à comprendre |
| **Familiarity / novelty** | le familier facilite l'adoption ; la nouveauté donne une **raison de changer** |
| **Automation / control** | l'automatisation réduit le travail manuel, mais certains users veulent **contrôler** |

Aucun ensemble de features ne **maximise tout** : on choisit
**délibérément** (ex : favoriser la simplicité).

### Feature creep

Le **feature creep** est l'**expansion progressive** de l'ensemble des
features au fil des demandes. `user requests and competitive pressure` →
`more overlapping capabilities` → `more complexity in use and
implementation` (et plus de **bugs**).

Avant d'accepter une proposition, se demander :

1. ajoute-t-elle une **capacité générale utile** ?
2. **assez d'utilisateurs** en ont-ils besoin ?
3. peut-on plutôt **étendre une feature existante** ?

On la compare à l'**ensemble de features accepté**, pas à l'attrait de l'idée
seule.

## 6. Acceptance criteria

Les **acceptance criteria** énoncent les **conditions** qu'une story ou une
feature doit remplir : ils transforment la valeur visée en **résultats
convenus et vérifiables**.

Un bon critère est **clair**, **testable** et centré sur des **résultats
observables**. Des **quantités** ou des **conditions explicites** remplacent
les mots flous comme « **good** » ou « **fast** ». Il décrit **ce qui est
attendu**, pas **comment** l'implémenter.

**Critères tirés de New Group :**

- après création, le groupe porte **le nom fourni** par l'utilisateur ;
- le groupe est **initialement vide** (ni documents ni sous-groupes) ;
- la **liste des documents** contient le nouveau groupe.

> **Piège :** « *Group creation works well* » n'est **pas** un critère : on ne
> sait pas quel nom, quel contenu, quelle visibilité vérifier.

### Given, When, Then (Gherkin)

```diagram
{
  "title": "Gherkin : un état de départ, un événement, un résultat observable.",
  "nodes": [
    { "id": "g", "x": 100, "y": 40, "w": 170, "label": "Given\nthe starting state", "tone": "sky", "filled": true },
    { "id": "w", "x": 330, "y": 40, "w": 170, "label": "When\nan action or event", "tone": "amber", "filled": true },
    { "id": "t", "x": 560, "y": 40, "w": 170, "label": "Then\nan observable outcome", "tone": "emerald", "filled": true }
  ],
  "edges": [ { "from": "g", "to": "w" }, { "from": "w", "to": "t" } ]
}
```

Exemple iLearn :

> **Given** Emma is authenticated and is offered her teacher and parent
> accounts, **When** she chooses her teacher account, **Then** her welcome
> screen shows her selected applications and teacher management tools.

Un **Scenario** Gherkin est un **exemple concret**, plus étroit que le
scenario « récit » du début.

### Criteria, tests, Definition of Done

| Concept | But | Portée |
|---|---|---|
| **Acceptance criteria** | **énoncer** les résultats attendus | **une** story ou feature |
| **Acceptance tests** | **comparer** résultat observé et attendu | vérifications concrètes des criteria |
| **Definition of Done** | standard de **qualité commun** d'un Increment | **tout** le produit |

- Les criteria sont des **spécifications**, **pas des résultats de test**.
- Un Gherkin **exécutable** a besoin de **step definitions**.
- Le travail doit **aussi** respecter la **Definition of Done**.

### Les cas non résolus

La description de New Group précise la création, mais **pas** :

- un **nom vide** : rejeter ou nom par défaut ? **non spécifié** ;
- un nom **déjà existant** : autoriser, refuser, renommer ? **non spécifié**.

Une règle manquante doit être **clarifiée** avant de devenir un résultat
attendu.

## 7. Stories et Product Backlog

- Le détail d'une story **se développe à l'approche de l'implémentation** ;
  une phrase courte est un **rappel**, pas toute la connaissance.
- **Scrum ne prescrit pas** le format *As a… I want… so that…*.
- Le **Product Backlog refinement** ajoute du détail et **découpe** les items.

`User need and candidate feature` → `Discuss, divide, add detail` → `Select
feasible Sprint work` → `Develop and inspect outcomes` → feedback.

| Représentation | Apport à la décision |
|---|---|
| **Persona** | caractéristiques et capacités des users |
| **Scenario** | la situation et la séquence qui donnent du contexte |
| **Story** | un besoin précis ou un aspect d'une feature |
| **Feature description** | comportement, inputs, outputs, contraintes |
| **Acceptance criteria** | les conditions pour vérifier le résultat |

---

# Partie 2 — Lab : Two stories, checkable outcomes

**Résultat** : un document d'équipe `M2_story_slice.md` avec **deux user
stories**, **au moins deux acceptance criteria par story**, et un lien vers
l'**utilisateur** et le **scenario**.

| Temps | Étape |
|---|---|
| 0–5 | **Prepare** : relire M1, garder ou réviser un énoncé user / problème ; noter le feedback reçu (sinon « No feedback yet ») ; un **writer**, un **reviewer** |
| 5–10 | **Apply** : profil utilisateur bref + scenario de 2–3 phrases ; marquer **connu** vs **supposé** |
| 10–15 | **Apply** : deux stories (role, action, reason), dans un ordre provisoire justifié |
| 15–25 | **Apply** : deux critères vérifiables par story (**condition + action + résultat visible**) ; traiter un cas **alternatif / invalide** ou noter la règle non résolue |
| 25–30 | **Check** : un coéquipier lit les critères **sans aide** ; clarifier une ambiguïté ; sauvegarder |

**Exemple Meeting Helper** :

- *As a meeting organizer, I want to see common available times so that I can
  propose a time all members can attend.*
- **Critère 1** : Given 10:00–11:00 et 10:30–11:30 (même date, même fuseau),
  When on demande les créneaux communs, the displayed interval is
  **10:30–11:00**.
- **Critère 2** : Given 10:00–10:30 et 11:00–11:30, the result states that **no
  common interval exists**. (Le cas des **extrémités qui se touchent** reste à
  convenir.)

> **Règle du lab :** les criteria décrivent un **comportement futur** : ne
> jamais écrire « passed » si le test n'a **pas été exécuté**.

---

## À retenir

- **Persona** = type d'utilisateur imaginé (context, activity, skills,
  relevance). **Proto-persona** = sans recherche, hypothèses à vérifier.
- **Scenario** = récit d'usage dans une situation ; incomplet, pas une spec.
- **User story** = *As a [role], I want [action], so that [reason]* ;
  rationale **optionnelle**. Trop grosse pour un Sprint = **epic**.
- **Feature** = fragment de fonctionnalité ; description = **input, action,
  output, activation** ; propriétés : **independence, coherence, relevance**.
- Trade-offs : simplicity/functionality, familiarity/novelty,
  automation/control. **Feature creep** = expansion progressive.
- **Acceptance criteria** : clairs, testables, observables ; **Given / When /
  Then**. Criteria ≠ tests ≠ **Definition of Done**.

## Pièges classiques du quiz

| Affirmation | Vrai / Faux |
|---|---|
| Une persona est la retranscription d'un utilisateur réel interviewé | **Faux** : elle représente un **type** d'utilisateur |
| Une proto-persona repose sur une recherche utilisateur approfondie | **Faux** : sur les connaissances limitées de l'équipe |
| Un scenario est une spécification complète | **Faux** : il est généralement incomplet |
| La rationale (*so that…*) est obligatoire dans chaque story | **Faux** : utile quand elle aide à comprendre |
| Une story qui prend plusieurs Sprints est un epic | **Vrai** |
| Chaque action d'un scenario devient une feature séparée | **Faux** : c'est un indice, on peut regrouper |
| « The page loads fast » est un bon acceptance criterion | **Faux** : pas mesurable |
| Les acceptance criteria sont des résultats de test | **Faux** : ce sont des spécifications |
| La Definition of Done s'applique à une seule story | **Faux** : à tout le produit (chaque Increment) |
| Scrum impose le format *As a… I want… so that…* | **Faux** |
| Le feature creep réduit la complexité | **Faux** : il l'augmente |
