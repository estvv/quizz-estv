# Software Engineering — Week 5 · Software Architecture

**Cours** : *Responsibilities, dependencies, and design choices*
(Sommerville 2021, chapitre 4). Composants, services et interfaces, les
**quality attributes** et leurs **trade-offs**, ce qui influence
l'architecture, **abstraction / decomposition**, les relations entre
composants, les **guidelines** (separation of concerns, implement once, stable
interfaces), l'architecture **en couches**, les **cross-cutting concerns**,
l'exemple **iLearn**, puis la **distribution** : client–server, **MVC**,
**multi-tier**, **service-oriented**.
**Lab** : *From requirements to structure* (Architecture_v1.md).
**Self-study** : *Git and GitHub* (branch, commit, PR, review, merge ; add,
commit, push, pull).

> **En bref.** L'**architecture** décrit les **composants**, leurs
> **relations** et les **principes** qui guident le design. Elle détermine les
> **quality attributes** (responsiveness, reliability, availability, security,
> usability, maintainability, resilience) — et améliorer l'un en dégrade
> souvent un autre. On **décompose** en respectant **separation of concerns**,
> **implement once** et des **stable interfaces** ; on **distribue** ensuite
> sur des clients et des serveurs. Au quiz : **les attributs**, **les
> trade-offs** (shared vs separate database) et **les modèles** (layers, MVC,
> multi-tier, services).

---

# Partie 1 — Cours

## 1. Des requirements à l'architecture

Une **user story** exprime un besoin, une **feature** décrit la capacité, les
**acceptance criteria** rendent le résultat vérifiable, et les **décisions
d'architecture** organisent le logiciel qui produit ce résultat.

```diagram
{
  "title": "Stories → criteria → components → relationships. Les priorités de qualité et les contraintes influencent la répartition.",
  "nodes": [
    { "id": "s", "x": 80, "y": 50, "w": 150, "label": "Stories and features\nrequired behavior", "tone": "sky", "filled": true },
    { "id": "c", "x": 270, "y": 50, "w": 165, "label": "Acceptance criteria\nobservable outcomes", "tone": "amber", "filled": true },
    { "id": "o", "x": 475, "y": 50, "w": 190, "label": "Components\nassigned responsibilities", "tone": "emerald", "filled": true },
    { "id": "r", "x": 690, "y": 50, "w": 180, "label": "Relationships\nrequired interactions", "tone": "violet", "filled": true }
  ],
  "edges": [ { "from": "s", "to": "c" }, { "from": "c", "to": "o" }, { "from": "o", "to": "r" } ]
}
```

- **Une** feature peut demander **plusieurs** composants, et **un** composant
  peut servir **plusieurs** features.
- Les requirements **ne déterminent pas une architecture unique**.

## 2. Architecture, composants, services

La **software architecture** décrit les **composants** du système, leurs
**relations** entre eux et avec l'environnement, et les **principes** qui
guident son design et son évolution.

| Notion | Sens |
|---|---|
| **Component** | unité nommée qui fournit une **fonctionnalité cohérente** (d'un objet à un programme entier) |
| **Responsibility** | les fonctionnalités et **services** confiés à un composant |
| **Relationship** | comment les composants **s'utilisent**, se **contiennent** ou **partagent des données** |
| **Design principle** | une **priorité** ou **contrainte** qui guide l'organisation |

- Un **service** est une **unité cohérente de fonctionnalité**. Un composant
  offre un ou plusieurs services via une **interface** (une **API**).
- Un **module** regroupe des composants liés.
- Le composant **utilisateur** ne doit **pas dépendre des détails cachés** de
  l'implémentation.
- Ici, « service » **n'implique pas** un serveur séparé ni un microservice.
- On peut concevoir les **interfaces avant l'implémentation**.

## 3. Les quality attributes

| Attribut | Préoccupation |
|---|---|
| **Responsiveness** | renvoyer les résultats dans un **délai acceptable** |
| **Reliability** | les features se comportent **comme prévu** |
| **Availability** | fournir le service **quand les users le demandent** |
| **Security** | protéger le système et les données contre **accès non autorisé et attaques** |
| **Usability** | atteindre et utiliser les features **avec peu d'erreurs** |
| **Maintainability** | mettre à jour et ajouter des features **à un coût acceptable** |
| **Resilience** | continuer à fournir le service **malgré une panne partielle ou une attaque** |

> **Piège :** **availability** = le service **est là quand on le demande** ;
> **resilience** = il **continue malgré une panne** ; **reliability** = il
> **fait ce qu'on attend**.

### Shared database vs separate databases

```diagram
{
  "title": "À gauche : C1 et C2 partagent une base (une dépendance commune). À droite : chacun a sa base, et C3 réconcilie les données.",
  "groups": [
    { "x": 160, "y": 155, "w": 300, "h": 330, "label": "Shared database", "tone": "sky" },
    { "x": 520, "y": 155, "w": 380, "h": 330, "label": "Separate databases", "tone": "amber" }
  ],
  "nodes": [
    { "id": "u1", "x": 160, "y": 70, "w": 220, "label": "User interface" },
    { "id": "a1", "x": 100, "y": 150, "w": 60, "label": "C1" },
    { "id": "b1", "x": 220, "y": 150, "w": 60, "label": "C2" },
    { "id": "d1", "x": 160, "y": 240, "shape": "cylinder", "label": "Shared database" },
    { "id": "u2", "x": 520, "y": 70, "w": 260, "label": "User interface" },
    { "id": "a2", "x": 420, "y": 150, "w": 60, "label": "C1" },
    { "id": "b2", "x": 620, "y": 150, "w": 60, "label": "C2" },
    { "id": "da", "x": 420, "y": 240, "shape": "cylinder", "label": "C1 database" },
    { "id": "db", "x": 620, "y": 240, "shape": "cylinder", "label": "C2 database" },
    { "id": "c3", "x": 520, "y": 285, "w": 120, "label": "C3\nreconcile data", "tone": "rose", "filled": true }
  ],
  "edges": [
    { "from": "u1", "to": "a1" }, { "from": "u1", "to": "b1" }, { "from": "a1", "to": "d1" }, { "from": "b1", "to": "d1" },
    { "from": "u2", "to": "a2" }, { "from": "u2", "to": "b2" }, { "from": "a2", "to": "da" }, { "from": "b2", "to": "db" },
    { "from": "c3", "to": "da", "arrow": "both", "dashed": true }, { "from": "c3", "to": "db", "arrow": "both", "dashed": true }
  ]
}
```

**Shared database** : organisation commune des données, mais **dépendance
partagée**. Exemple du livre : C1 est **lent** car il doit réorganiser les
données ; changer la structure de la base accélérerait C1… mais **C2 utilise
la même structure** : il faudra peut-être le modifier, et son temps de réponse
peut changer.

**Separate databases** : chacun organise ses données à sa façon et **évolue
indépendamment** ; mais les infos dupliquées demandent une **réconciliation**
(C3) : **délai**, travail, **stockage** en plus, et les users peuvent voir des
**données incohérentes**. Avantage : une base en panne laisse **une partie**
du système disponible.

### Trade-offs entre qualités

| Choix | Bénéfice | Coût |
|---|---|---|
| **Separate data structures** | changements indépendants, optimisation locale | réconciliation, incohérence possible |
| **Small, focused components** | remplacer une partie plus facilement | la **communication** prend du temps |
| **Multiple protection layers** (security) | une faille ne supprime pas toute la protection | **authentifications répétées** pour l'user (usability) |
| **Redundant components** (availability) | survit à la panne d'un composant | détection et bascule : **coût et complexité** |

## 4. Ce qui influence l'architecture

| Influence | Conséquence |
|---|---|
| **Quality priorities** | concentrer l'effort sur les attributs **les plus importants** pour ce produit |
| **Product lifetime** | un produit qui dure doit pouvoir **évoluer** |
| **Software reuse** | réutiliser économise du travail mais **contraint** le design |
| **Number of users** | une demande qui change vite peut exiger du **scaling** |
| **Compatibility** | le logiciel et les données existants **limitent** les choix |

Et aussi : **compétences** de l'équipe, **budget**, **planning** (apprendre une
techno inconnue peut retarder la livraison).

### Description et rationale

- Une **architectural description** sert à **discuter** et à garder une
  **compréhension partagée**.
- La **rationale** (les raisons d'un choix) explique les **compromis** et les
  **hypothèses** : comparer des alternatives plausibles, dire **le bénéfice
  accepté et le coût subi**.
- Un **diagramme informel** est rapide à modifier mais peut **cacher des
  ambiguïtés**. Le système réel peut **différer** du modèle : le modèle seul
  **ne prouve pas** la structure livrée.

## 5. Abstraction et decomposition

- **Abstraction** : se concentrer sur l'**essentiel**, cacher le détail.
- **Decomposition** : représenter un gros composant comme des **parties plus
  petites** aux responsabilités liées.

Exemple : le **document retrieval system** d'une bibliothèque (documents payants
de bases privées) se décompose en **search and document retrieval**, **rights
management and accounting**, **index and database services**.

### Les types de relations

| Relation | Sens | Impact d'un changement |
|---|---|---|
| **Part-of** | un composant est **dans** un autre | le conteneur donne le contexte |
| **Uses** | un composant **appelle** les fonctions d'un autre | l'appelant dépend de l'**interface** et du **comportement** |
| **Is-located-with** | dans le **même module** ou objet | localise des fonctions liées |
| **Shares-data-with** | utilisent des **données communes** | un changement de représentation **touche les deux** |

> **Piège :** des données **renvoyées** ne sont pas une relation **uses** : la
> flèche « uses » va de l'appelant vers l'appelé.

### Maîtriser la complexité

La complexité dépend du **nombre et de la nature des relations**, pas du
nombre de boîtes. **Localiser** les relations (regrouper ce qui interagit) et
**réduire les dépendances partagées**.

### Les trois guidelines de décomposition

| Guideline | Sens | Pourquoi |
|---|---|---|
| **Separation of concerns** | regrouper autour d'une **préoccupation cohérente** (ex : l'interaction user) | **localise** les changements |
| **Implement once** | un service **à un seul endroit** | la duplication impose des changements coordonnés |
| **Stable interfaces** | cacher l'interne derrière une **interface stable** | un changement interne **ne casse pas** les appelants |

**Information hiding** : A utilise **l'interface** de B, jamais sa structure
de données interne ni son algorithme. Si l'**interface** ou le comportement
promis change, les appelants devront quand même être revus.

## 6. L'architecture en couches

```diagram
{
  "title": "Le modèle en couches générique d'une application web. Une couche utilise les services de la couche du dessous.",
  "nodes": [
    { "id": "l1", "x": 300, "y": 30, "w": 440, "label": "Browser-based or mobile user interface", "tone": "sky", "filled": true },
    { "id": "l2", "x": 300, "y": 85, "w": 440, "label": "Authentication and user interaction management", "tone": "sky", "filled": true },
    { "id": "l3", "x": 300, "y": 140, "w": 440, "label": "Application-specific functionality", "tone": "emerald", "filled": true },
    { "id": "l4", "x": 300, "y": 195, "w": 440, "label": "Basic shared services", "tone": "amber", "filled": true },
    { "id": "l5", "x": 300, "y": 250, "w": 440, "label": "Transaction and database management", "tone": "violet", "filled": true },
    { "id": "t", "x": 600, "y": 140, "shape": "text", "label": "uses lower-level\nservices ↓" }
  ]
}
```

- C'est un **point de départ** : plus ou moins de couches selon le produit
  (pas de base de données = pas de couche base de données).
- Ce sont des **regroupements logiques**, pas forcément des exécutables ou
  serveurs séparés.
- Une couche **haute utilise** une couche basse ; les **données remontent**
  sans créer de dépendance vers le haut. Idéalement on utilise la couche
  **juste en dessous**, mais on peut sauter une couche pour éviter des
  composants qui ne font que transmettre.
- Une couche **basse ne doit jamais dépendre** d'une couche haute.

### Cross-cutting concerns

Certaines préoccupations touchent **toutes les couches** : **security**,
**performance**, **reliability**. On ne peut pas les mettre dans une seule
boîte.

- **Validation** : en **local** pour la réactivité ; sur le **serveur** pour
  ce qui demande la base, les permissions, et les champs **critiques pour la
  sécurité**.
- **Security** : chaque techno a ses vulnérabilités ; protéger **dans chaque
  couche**. Un **composant de sécurité unique** est un **point de défaillance
  unique**.

## 7. L'exemple iLearn

| Principe | Intention |
|---|---|
| **Replaceability** | ajouter des applis et **substituer** des alternatives |
| **Extensibility** | **étendre ou limiter** le système standard |
| **Age-appropriate interfaces** | des interfaces différentes selon l'**âge** des élèves |
| **Programmability** | **combiner** des applis existantes en nouvelles fonctions |
| **Minimum work** | **pas de travail en plus** pour qui ne veut pas personnaliser |

Conflit : **remplacer** un service peut **casser** des applis combinées → garder
l'ancien service à côté de l'alternative.

Couches d'iLearn : **User interface** → **UI management** → **Configuration**
(groupes, applis, UI, sécurité) → **Application services** (blog, wiki,
drawing…) → **Integrated services** (analytics, archive access) → **Shared
infrastructure** (**authentication**, storage, search, logs).

Le critère d'Emma (« choisir le compte teacher affiche ses applis ») se
répartit : **authentication/authorization** → contexte d'accès ;
**configuration services** → applis pertinentes ; **UI management** → écran
d'accueil.

## 8. Distribution

| | **Decomposition** | **Distribution** |
|---|---|---|
| Question | **quelle partie** fournit chaque service ? | **où** chaque partie s'exécute ? |
| Éléments | composants **logiques** | **clients** et **serveurs** |
| Relations | uses, part-of, shared data | **communication** entre emplacements |

### Client–server

Les **clients** gèrent l'interaction utilisateur (et un peu de calcul local) ;
les **serveurs** fournissent les données partagées et les services. Un **load
balancer** répartit les requêtes entre plusieurs instances de serveur.

```diagram
{
  "title": "Client–server avec load balancer : les requêtes sont réparties entre les instances (les réponses reviennent aux clients).",
  "nodes": [
    { "id": "c1", "x": 70, "y": 40, "label": "Client 1", "tone": "sky", "filled": true },
    { "id": "c2", "x": 70, "y": 140, "label": "Client 2", "tone": "sky", "filled": true },
    { "id": "lb", "x": 290, "y": 90, "label": "Load balancer", "tone": "amber", "filled": true },
    { "id": "s1", "x": 510, "y": 40, "label": "Server instance", "tone": "emerald", "filled": true },
    { "id": "s2", "x": 510, "y": 140, "label": "Server instance", "tone": "emerald", "filled": true }
  ],
  "edges": [
    { "from": "c1", "to": "lb" }, { "from": "c2", "to": "lb" }, { "from": "lb", "to": "s1" }, { "from": "lb", "to": "s2" }
  ]
}
```

### Model–View–Controller (MVC)

```diagram
{
  "title": "MVC : le Controller traite l'entrée et demande un changement au Model ; le Model notifie la View, qui affiche les données.",
  "nodes": [
    { "id": "c", "x": 90, "y": 60, "w": 140, "label": "Controller\nhandles user input", "tone": "amber", "filled": true },
    { "id": "m", "x": 330, "y": 60, "w": 140, "label": "Model\ndata and logic", "tone": "emerald", "filled": true },
    { "id": "v", "x": 570, "y": 60, "w": 140, "label": "View\npresents data", "tone": "sky", "filled": true }
  ],
  "edges": [
    { "from": "c", "to": "m", "label": "change request" },
    { "from": "m", "to": "v", "label": "change notice" },
    { "from": "v", "to": "m", "dashed": true, "label": "refresh request", "via": [[570, 130], [330, 130]] }
  ]
}
```

- **Model** : les **données** et la **logique métier**.
- **View** : la **présentation**.
- **Controller** : gère l'**entrée utilisateur** et demande des changements au
  model.
- L'essentiel est la **séparation model / présentation**. Côté client–server,
  le **serveur garde le model partagé** et chaque client peut avoir
  **plusieurs views**.

### Multi-tier client–server

```diagram
{
  "title": "Multi-tier : chaque rôle de serveur est séparé (une instance chacun ici).",
  "nodes": [
    { "id": "c", "x": 70, "y": 50, "w": 110, "label": "Client\nuser interaction", "tone": "sky", "filled": true },
    { "id": "w", "x": 240, "y": 50, "w": 130, "label": "Web server\nHTTP and pages", "tone": "amber", "filled": true },
    { "id": "a", "x": 420, "y": 50, "w": 140, "label": "Application server\nproduct operations", "tone": "emerald", "filled": true },
    { "id": "d", "x": 600, "y": 50, "w": 140, "label": "Database server\ndata management", "tone": "violet", "filled": true }
  ],
  "edges": [ { "from": "c", "to": "w" }, { "from": "w", "to": "a" }, { "from": "a", "to": "d" } ]
}
```

Exemple du **théâtre** : l'application server fournit les infos des spectacles
et la **réservation** ; un **payment server** spécialisé peut gérer les cartes.
Les **couches logiques** et les **tiers de serveurs** ne correspondent **pas
forcément un pour un**.

### Service-oriented

Chaque fonctionnalité est isolée en **service** (A, B, C), derrière un
**service gateway**, potentiellement sur des serveurs différents. Des
instances **stateless** peuvent être **répliquées ou déplacées** selon la
demande. iLearn l'a choisi pour **mettre à jour** et **ajouter des services
imprévus** facilement. Coûts : une **stratégie de cohérence** pour les
données partagées, et la **communication**.

> **Piège :** *stateless* ne veut pas dire que le produit **n'a pas de données
> persistantes** : elles sont stockées ailleurs.

| Facteur | Choix | Conséquence |
|---|---|---|
| mises à jour structurées **partagées** | centraliser **verrous et transactions** | dépendance commune à l'organisation des données |
| **remplacements fréquents** | **services séparés** | soigner les interfaces et la cohérence |
| **demande** variable | **répliquer** les services | coordonner les parties distribuées |

---

# Partie 2 — Lab : From requirements to structure

**Résultat** : `Architecture_v1.md` avec **un diagramme de structure** et **une
décision de design justifiée**. 3 à 5 composants principaux (recommandation de
classe, pas une règle).

| Temps | Étape |
|---|---|
| 0–5 | choisir **une tâche** et **deux acceptance criteria** ; writer, reviewer |
| 5–15 | dessiner les **composants** avec leurs **responsabilités**, la **frontière du système** et des **flèches de dépendance étiquetées** (dire ce qu'une flèche veut dire) ; **tracer les deux critères** dans la structure |
| 15–25 | comparer **deux options** pour une décision ; en choisir une et la relier aux **criterion IDs**, à un **quality attribute**, un **bénéfice**, un **coût** et une **prochaine vérification** |
| 25–30 | un coéquipier explique les deux chemins et **conteste** la décision ; sauvegarder |

**Exemple Meeting Helper** : `Meeting UI → Interval calculator`. UI : demander
et afficher les créneaux communs. Calculator : renvoyer le chevauchement ou
« no overlap ». Décision D1 : **séparer le calcul de l'UI** pour **isoler les
changements** de la règle d'intervalle ; coût : **définir et maintenir le
format d'entrée et de résultat** du calculator.

> Une boîte **n'implique pas** un service ou un serveur séparé.

---

# Partie 3 — Self-study : Git et GitHub

**Git** suit les **versions** ; **GitHub** **héberge** les dépôts et ajoute la
collaboration (**pull requests**). Une PR appartient au workflow GitHub ; un
commit local n'en a pas besoin.

```diagram
{
  "title": "Les endroits où vit un changement : add choisit ce qui entre dans le prochain commit, commit l'enregistre, push le partage.",
  "nodes": [
    { "id": "w", "x": 80, "y": 50, "w": 140, "label": "Working tree\nfiles you edit", "tone": "neutral" },
    { "id": "s", "x": 300, "y": 50, "w": 170, "label": "Staging area\nnext commit content", "tone": "amber", "filled": true },
    { "id": "l", "x": 530, "y": 50, "w": 160, "label": "Local repository\nrecorded commits", "tone": "emerald", "filled": true },
    { "id": "r", "x": 530, "y": 160, "w": 160, "label": "Remote on GitHub\nshared commits", "tone": "violet", "filled": true }
  ],
  "edges": [
    { "from": "w", "to": "s", "label": "add" }, { "from": "s", "to": "l", "label": "commit" }, { "from": "l", "to": "r", "label": "push" }
  ]
}
```

| Terme | Sens |
|---|---|
| **Repository** | les fichiers et leur **historique** ; local et GitHub sont **deux copies** |
| **Commit** | un **snapshot** avec un message et un identifiant ; il enregistre le contenu **stagé**, pas toute modif non sauvegardée |
| **Branch** | un **nom mobile** pour une ligne de commits |
| **Diff** | une **comparaison** : lignes ajoutées / supprimées |
| **Pull request (PR)** | une **proposition** d'intégrer une branche dans une autre, avec discussion ; **l'ouvrir ne merge pas** |
| **Merge** | **intégrer** les changements ; ensuite **vérifier** le fichier sur la branche cible |

### Route A — dans le navigateur

1. Créer `ise4133-git-practice` (**Private**, avec README) ; noter la branche
   par défaut (`main`).
2. Créer la branche **`architecture-practice`** ; ajouter
   `Architecture_v1.md` ; **commit**. Modifier la légende des flèches, **commit**
   à nouveau sur la **même** branche.
3. **New pull request** : base = `main`, compare = `architecture-practice` ;
   inspecter le diff ; décrire ce qui a changé et ce qui a été vérifié
   (« Document review only; code not run »).
4. **Review** : un partenaire commente (« the cost is still a placeholder ») ;
   l'auteur corrige sur la même branche, la PR se met à jour ; le reviewer
   soumet **Comment / Approve / Request changes**. Seul : **self-review**,
   **on ne peut pas approuver sa propre PR**.
5. **Merge** si autorisé ; **vérifier** le fichier sur `main`. Si bloqué :
   laisser la PR ouverte et noter « Open; merge blocked » — **ne jamais
   contourner les règles**.

### Route B — Git en local

```sh
git clone --origin origin https://github.com/YOUR_ACCOUNT/ise4133-git-practice.git
git config --local user.name "Your Name"     # métadonnées, pas l'authentification
git pull --ff-only
git switch -c local-check                   # nouvelle branche (Git ≥ 2.23)
git status ; git diff -- Architecture_v1.md # changement non stagé
git add Architecture_v1.md
git diff --staged -- Architecture_v1.md     # ce qui partira dans le commit
git commit -m "Record the unresolved endpoint rule"
git push -u origin local-check              # publier + upstream tracking
git switch main ; git pull --ff-only        # récupérer le merge fait sur GitHub
```

- GitHub **n'accepte pas le mot de passe du compte** en HTTPS : configurer le
  **credential helper**.
- **Clean ne veut pas dire partagé** : un working tree propre peut avoir des
  commits **pas encore pushés**.
- `pull --ff-only` n'avance la branche que si un **fast-forward** est possible ;
  si les historiques **divergent**, il **refuse**.
- En cas de problème : **ne pas** `git init` au hasard, **ne pas** force-push,
  **ne pas** faire de reset destructif ; préserver le travail et demander.

**Auto-vérification** : ouvrir une PR change-t-il `main` ? **Non**. Un message de
commit prouve-t-il qu'un test a tourné ? **Non**. Pourquoi `add` avant `commit` ?
Pour **choisir** le contenu du snapshot. Pourquoi le merge sur GitHub n'a pas
modifié mon fichier local ? **Deux copies séparées** : il faut `pull`.

---

## À retenir

- Architecture = **composants + relations + principes**. Component,
  responsibility, relationship, design principle. Service via une **interface
  (API)**.
- **7 quality attributes** : responsiveness, reliability, availability,
  security, usability, maintainability, resilience.
- **Shared DB** : une dépendance partagée ; **separate DB** : indépendance mais
  **réconciliation** et incohérence possible.
- Influences : quality priorities, product lifetime, reuse, number of users,
  compatibility (+ équipe, budget, planning).
- Relations : **part-of, uses, is-located-with, shares-data-with**.
- Guidelines : **separation of concerns, implement once, stable interfaces**.
- **Layers** : une couche utilise celle du dessous, jamais l'inverse.
  **Cross-cutting** : security, performance, reliability.
- Distribution : **client–server** (+ load balancer), **MVC** (model / view /
  controller), **multi-tier** (web, application, database servers),
  **service-oriented** (gateway, stateless, réplicables).
- Git : working tree → **add** → staging → **commit** → local → **push** →
  remote. Une **PR** propose, le **merge** intègre.

## Pièges classiques du quiz

| Affirmation | Vrai / Faux |
|---|---|
| Les requirements déterminent une architecture unique | **Faux** |
| Un « service » implique forcément un serveur séparé | **Faux** |
| Availability = continuer malgré une panne partielle | **Faux** : c'est la resilience |
| Des bases séparées éliminent tout problème de cohérence | **Faux** : il faut réconcilier |
| Plusieurs couches de protection peuvent gêner l'usability | **Vrai** (authentifications répétées) |
| Plus de boîtes = meilleure décomposition | **Faux** : ce sont les relations qui comptent |
| Une couche basse peut dépendre d'une couche haute | **Faux** |
| La sécurité peut être confiée à un seul composant | **Faux** : cross-cutting, point de défaillance unique |
| En MVC, la View contient la logique métier | **Faux** : c'est le Model |
| Stateless = le produit n'a aucune donnée persistante | **Faux** |
| Ouvrir une PR merge la branche | **Faux** |
| Un working tree « clean » signifie que tout est pushé | **Faux** |
