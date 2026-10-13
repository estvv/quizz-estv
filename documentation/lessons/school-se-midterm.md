# Software Engineering — Mid Term (W2–W7) · Plan de révision

> **Attention :** cette année, le **midterm exam (30 %)** est **remplacé par le
> Team Project Midterm Report** (dimanche de la semaine 8, 2026-10-25, 23:59
> KST ; voir la leçon **Week 7**, partie 2). Ce quiz sert à **vérifier ta
> maîtrise du cours** des semaines 2 à 7 : c'est elle qui permet d'expliquer
> tes décisions dans le rapport (partie individuelle : *understanding of your
> work and decisions*, 20 points) et qui sera évaluée au **final (50 %)**.

Toutes les questions viennent des leçons **Week 2 à Week 7** de Software
Engineering.

**Méthode conseillée :**

1. Faire ce quiz une première fois à froid : **Toutes** puis **Aléatoire**.
2. Pour chaque semaine où tu rates des questions, relire la **leçon**
   (sections *Pièges* et *À retenir*) puis refaire son quiz.
3. Pour le rapport : relier chaque section du plan à la leçon correspondante
   (requirements → W4, design → W5–W6, security → W7).

---

## La checklist par semaine

| Semaine | Ce qu'il faut savoir sans hésiter |
|---|---|
| **W2** · Vision & prototype | **programming** (make it work) vs **software engineering** (build, test, maintain, improve) ; **QuickCampus** (toutes les features, et pourtant échec) ; vision **What / Who / Why** ; « everyone, all-in-one, easy » cachent des décisions ; *We help [user] do [task] in [situation]* ; **risky assumption → small prototype → observable evidence** ; first version = **1 tâche, ≤ 3 features, 1 boundary** |
| **W3** · Agile & Scrum | plan-driven vs **agile** ; **incremental** (ajouter) vs **iterative** (améliorer) ; **Agile Manifesto** (plus de poids à gauche, pas *à la place de*) ; 5 principes ; **XP** (TDD, CI, refactoring, small releases) ; piliers **transparency → inspection → adaptation** ; valeurs **commitment, focus, openness, respect, courage** ; **Product Owner / Developers / Scrum Master** ; artefacts ↔ engagements : **Product Backlog ↔ Product Goal**, **Sprint Backlog ↔ Sprint Goal**, **Increment ↔ Definition of Done** ; Sprint **≤ 1 mois**, Planning (≤ 8 h), **Daily 15 min**, **Review (produit)** vs **Retrospective (processus)** |
| **W4** · Users & stories | **persona** (type d'utilisateur) vs **proto-persona** (hypothèses) ; **scenario** (récit, incomplet) ; **user story** *As a… I want… so that…* (rationale optionnelle), **epic** = plusieurs Sprints ; **feature** (independence, coherence, relevance) ; trade-offs ; **feature creep** ; **acceptance criteria** observables (pas « good », « fast »), **Given / When / Then** ; criteria ≠ tests ≠ **DoD** |
| **W5** · Architecture | composants, responsabilités, relations, principes ; **7 quality attributes** (availability ≠ resilience ≠ reliability) ; **shared vs separate database** ; relations **part-of, uses, is-located-with, shares-data-with** ; **separation of concerns, implement once, stable interfaces** ; **layers** (jamais vers le haut), **cross-cutting** ; **client–server, MVC, multi-tier, service-oriented** ; Git / PR |
| **W6** · Services & APIs | service / **API** / implementation ; microservices ; **cohesion** (dedans, haute) / **coupling** (dehors, faible) ; mots de passe = **un** service ; contrat **operation, input, result, failure** ; timeout ≠ échec ; **6 contraintes REST** (code-on-demand optionnel), **uniform interface** (dont HATEOAS) ; **stateless** ; resource vs representation ; **GET safe + idempotent**, PUT / DELETE idempotents, **POST non** ; **201** + Location, **204**, 400, 404, 500 ; breaking changes |
| **W7** · Security & privacy | **CIA** ; **threat / vulnerability / attack / risk** ; trust boundary ; **SQL injection → parameter binding**, **XSS → output encoding**, session hijacking, DDoS ; **authentication vs authorization** ; salt + hash + work factor ; **MFA** (types différents) ; **OAuth 2.0** (autorisation) vs **OpenID Connect** (identité) ; subject / action / resource / context ; **ACL**, **RBAC**, **IDOR** ; **least privilege**, **default deny** ; **security vs privacy**, **data minimization** |

## Les confusions qui coûtent des points

| Ne pas confondre | |
|---|---|
| **Incremental** / **iterative** | ajouter des fonctionnalités / améliorer l'existant |
| **Sprint Review** / **Retrospective** | le produit, avec les stakeholders / le processus, l'équipe seule |
| **Product Goal** / **Sprint Goal** / **DoD** | Product Backlog / Sprint Backlog / Increment |
| **Persona** / **role** | type d'utilisateur avec contexte / simple catégorie |
| **Story** / **epic** | tient dans un Sprint / plusieurs Sprints |
| **Acceptance criteria** / **acceptance tests** / **DoD** | spécifier / vérifier / qualité commune |
| **Availability** / **resilience** / **reliability** | là quand on le demande / malgré une panne / fait ce qu'on attend |
| **Decomposition** / **distribution** | quelle partie / où elle tourne |
| **Cohesion** / **coupling** | dedans (haute) / dehors (faible) |
| **Safe** / **idempotent** | aucun changement d'état / N fois = même effet qu'une fois |
| **POST** / **PUT** | le serveur choisit l'URI / le client fournit l'état à l'URI |
| **Vulnerability** / **attack** | la faiblesse / la tentative |
| **Authentication** / **authorization** | qui es-tu / as-tu le droit |
| **Security** / **privacy** | accès non autorisé / usage inapproprié des données |
