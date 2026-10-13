# Software Engineering — Week 2 · Semester project, Vision & Prototype

**Cours** : lancement du **semester project** (une app ou un site utile, en
équipe de 2–3), la différence **programming vs software engineering** (le cas
**QuickCampus**), la **product vision** (*What, Who, Why* — Sommerville,
*Engineering Software Products*, §1.1) et le **prototype** (§1.3). **Atelier**
: brainstorm, choisir un problème, rédiger la première version, esquisser et
planifier un test. **À rendre** : **M1** (vision, assumptions, prototype
plan, AI decision log).

> **En bref.** **Programming** = « est-ce que ça marche ? ». **Software
> engineering** = « l'équipe peut-elle le **construire, tester, maintenir et
> améliorer** ? ». Sans client qui donne un contrat, c'est l'équipe qui choisit
> l'utilisateur et les features : la **vision** (*What* / *Who* / *Why*) sert
> à dire **oui, non ou pas encore**. Un **prototype** rend une **assumption
> risquée** testable : *risky assumption → small prototype → observable
> evidence*. Première version : **une tâche principale, au plus trois
> features, une limite explicite**.

---

## 1. Le semester project

- Construire **une app ou un site utile**.
- Partir d'un **problème réel** et d'un **utilisateur précis**.
- Construire une **petite version**, puis l'**améliorer avec des preuves**
  (*evidence*).
- **Tester** les changements, apprendre à **release** et **maintenir**.

### L'équipe

| Élément | Règle |
|---|---|
| Taille | **2–3** personnes qu'on peut rencontrer et joindre |
| À noter | **noms**, **canal de contact**, **heure de réunion** |
| Rôles du jour | **facilitator** (anime), **recorder** (note), **speaker** (présente) |
| À deux | on **combine** les rôles ; on les **fait tourner** ensuite |
| Principe | chacun apporte **une idée** et sait **expliquer** le draft |

## 2. Programming is not engineering : QuickCampus

```diagram
{
  "title": "QuickCampus (cas fictif) : toutes les features étaient livrées et démontrables… et le produit a échoué.",
  "nodes": [
    { "id": "g", "x": 110, "y": 60, "w": 190, "h": 90, "label": "GOAL\naider les étudiants à trouver\ndes espaces et activités\nutiles sur le campus", "tone": "sky", "filled": true, "size": 12 },
    { "id": "l", "x": 330, "y": 60, "w": 190, "h": 90, "label": "LAUNCH\nrooms, events, chat,\nattendance, maps,\nAI recommendations", "tone": "amber", "filled": true, "size": 12 },
    { "id": "r", "x": 550, "y": 60, "w": 190, "h": 90, "label": "RESULT\nstale data, broken\ndependency, slow screens,\none-star reviews", "tone": "rose", "filled": true, "size": 12 }
  ],
  "edges": [
    { "from": "g", "to": "l" }, { "from": "l", "to": "r" }
  ]
}
```

« La plupart des écrans s'ouvraient. L'équipe pouvait faire la démo de chaque
feature. » Le code **marchait** ; ce qui a manqué, c'est l'**ingénierie** :
données à jour, dépendances maintenues, performance, retours utilisateurs.

| | **Programming** | **Software engineering** |
|---|---|---|
| Question | Can you make it **work** ? | Can your **team** **build** it, **test** it, **maintain** it and **improve** it ? |
| Horizon | la démo | la vie du produit |

## 3. Un projet « product-like »

- **Aucun client externe** ne donne un **contrat complet**.
- L'équipe choisit **l'utilisateur cible** et **les features**.
- L'équipe décide **quelles preuves sont convaincantes**.
- → **Freedom creates product responsibility.**

> Une **idée vague** produit des **features arbitraires**. Une **vision**
> donne à l'équipe une base pour dire **yes, no, or not yet**.

## 4. La vision : What, Who, Why

```diagram
{
  "title": "Les trois questions de la product vision (Sommerville §1.1).",
  "nodes": [
    { "id": "w1", "x": 110, "y": 60, "w": 200, "h": 90, "label": "WHAT\nQuel produit proposons-nous ?\nQuelle est sa LIMITE\n(boundary) ?", "tone": "sky", "filled": true, "size": 12 },
    { "id": "w2", "x": 330, "y": 60, "w": 200, "h": 90, "label": "WHO\nQui a le problème,\ndans quelle situation\nPRÉCISE ?", "tone": "amber", "filled": true, "size": 12 },
    { "id": "w3", "x": 550, "y": 60, "w": 200, "h": 90, "label": "WHY\nQuel résultat utile\n(valuable outcome) justifie\nde le choisir ?", "tone": "emerald", "filled": true, "size": 12 },
    { "id": "n", "x": 330, "y": 170, "w": 520, "h": 40, "shape": "note", "tone": "rose", "label": "« Everyone », « all-in-one », « easy » cachent des décisions qui n'ont pas été prises.", "size": 12 }
  ],
  "edges": []
}
```

**Phrase de vision** : *We help **[user]** do **[task]** in **[situation]**.*

### Exemple : trouver un créneau de réunion

| Élément | Contenu |
|---|---|
| **User and problem** | les équipes de projet étudiantes **perdent du temps** à comparer leurs disponibilités dans le **chat** |
| **First version** | saisir ses créneaux libres, **afficher le chevauchement** |
| **Outside the first version** | intégration du chat et du calendrier |
| **Assumption to test** | les équipes **l'utiliseront** pour choisir un créneau |

(Exemple fictif : aucune recherche utilisateur n'a été faite.)

## 5. Le prototype

```diagram
{
  "title": "Un prototype rend une question tangible (Sommerville §1.3).",
  "nodes": [
    { "id": "a", "x": 100, "y": 50, "w": 170, "label": "Risky\nassumption", "tone": "rose", "filled": true, "bold": true },
    { "id": "b", "x": 330, "y": 50, "w": 170, "label": "Small\nprototype", "tone": "amber", "filled": true, "bold": true },
    { "id": "c", "x": 560, "y": 50, "w": 170, "label": "Observable\nevidence", "tone": "emerald", "filled": true, "bold": true }
  ],
  "edges": [
    { "from": "a", "to": "b" }, { "from": "b", "to": "c" }
  ]
}
```

On construit **juste assez** pour apprendre si l'**idée produit**,
l'**interaction** ou la **technologie** est **plausible**. Pas plus.

## 6. L'atelier en 5 étapes

```flowchart
{
  "title": "Le déroulé de la séance (les durées sont celles des slides).",
  "nodes": [
    { "id": "s", "kind": "start", "label": "Intros : 20 s chacun" },
    { "id": "b", "kind": "process", "label": "Brainstorm (3 min) : 2 problèmes chacun\nqui ? quand ? comment aujourd'hui ?" },
    { "id": "c", "kind": "process", "label": "Choose (5 min) : un problème\natteignable ? constructible ? observable ?" },
    { "id": "d", "kind": "process", "label": "Draft (8 min) : We help [user] do [task] in [situation]\n1 tâche, ≤ 3 features, 1 boundary" },
    { "id": "k", "kind": "process", "label": "Sketch & plan a test (4 min)\n2 écrans, 1 assumption, 1 test" },
    { "id": "sh", "kind": "io", "label": "Share (45 s) : users, problem,\nfirst version, what to test" },
    { "id": "e", "kind": "end", "label": "M1 après le cours" }
  ],
  "edges": [
    { "from": "s", "to": "b" }, { "from": "b", "to": "c" }, { "from": "c", "to": "d" },
    { "from": "d", "to": "k" }, { "from": "k", "to": "sh" }, { "from": "sh", "to": "e" }
  ]
}
```

| Étape | Questions / consignes |
|---|---|
| **Brainstorm** | Qui vit le problème ? Quand ? Comment fait-il aujourd'hui ? **Distinguer ce qu'on a observé de ce qu'on suppose.** |
| **Choose** | Peut-on **atteindre** des gens qui ont ce problème ? Construire une **petite** première version avec des **données accessibles** ? **Observer** si le produit aide ? Garder les inconnues **visibles**. |
| **Draft** | une phrase ; le **current workaround** (ce que font les users aujourd'hui) ; **first version = 1 tâche principale, ≤ 3 features** ; **boundary = 1 feature laissée de côté** |
| **Sketch & test** | 2 écrans grossiers ; 1 assumption qui pourrait changer l'idée ; **une personne, une tâche, un résultat observable** |
| **Share** | « Our users are… », « Their problem is… », « Our first version will… », « We need to test whether… » ; le reviewer pose **une** question, l'équipe note **une** révision |

**Exemple de plan de test** : demander à **deux camarades** de trouver un
créneau commun avec le sketch ; si l'un d'eux a **besoin d'aide**, revoir le
flow et recommencer. (C'est un **plan**, pas un résultat.)

## 7. Le semestre : améliorer le même produit

```diagram
{
  "title": "Le fil du semestre. On garde les preuves en continu : feedback, résultats de tests, historique des changements.",
  "nodes": [
    { "id": "a", "x": 80, "y": 50, "w": 140, "h": 60, "label": "W2–4\nproblème et\nrequirements", "tone": "sky", "filled": true, "size": 12 },
    { "id": "b", "x": 230, "y": 50, "w": 140, "h": 60, "label": "W5–7\npetite version\nqui marche", "tone": "amber", "filled": true, "size": 12 },
    { "id": "m", "x": 360, "y": 50, "w": 90, "h": 60, "label": "W8\nmidterm", "tone": "rose", "filled": true, "size": 12 },
    { "id": "c", "x": 490, "y": 50, "w": 150, "h": 60, "label": "W9–12\ntest, refactor,\ndeploy, recovery", "tone": "violet", "filled": true, "size": 12 },
    { "id": "d", "x": 650, "y": 50, "w": 150, "h": 60, "label": "W13–15\nacceptance checks,\nmontrer les changes", "tone": "emerald", "filled": true, "size": 12 }
  ],
  "edges": [
    { "from": "a", "to": "b" }, { "from": "b", "to": "m" }, { "from": "m", "to": "c" }, { "from": "c", "to": "d" }
  ]
}
```

**Avant de partir** : montrer une feuille d'équipe ; **chaque membre** sait
expliquer l'idée et le prochain test. **Après le cours** : compléter **M1** —
**vision**, **assumptions**, **prototype plan** et **AI decision log**.
**La semaine suivante** : un **backlog partagé** et une façon de travailler en
équipe (W3 : Scrum).

## 8. Aperçu : le software process

| Notion | Définition |
|---|---|
| **Software process** | les activités qui produisent un logiciel : **specification**, **design & implementation**, **validation**, **evolution** |
| **Plan-driven** | activités planifiées à l'avance, progrès mesuré **par rapport au plan** |
| **Agile** | **incrémental**, la planification est **entrelacée** avec le travail, le **changement est attendu** |
| **Scrum** | sprints de durée fixe, product backlog, sprint backlog, daily, review, retrospective (détaillé en W3) |
| **Kanban** | visualiser le flux sur un tableau, **limiter le WIP**, tirer l'élément suivant, **pas d'itérations fixes** |

---

## Pièges d'exam

- **Programming** = make it work ; **SE** = build, **test, maintain, improve**
  en équipe.
- QuickCampus **avait** toutes ses features : l'échec vient de la qualité et
  de la maintenance, pas du manque de features.
- Vision = **What, Who, Why** (pas *How*).
- « Everyone », « all-in-one », « easy » = décisions **cachées**.
- Prototype : **assumption risquée** → **petit** prototype → **preuve
  observable** ; on construit le **minimum**.
- First version : **1** tâche, **≤ 3** features, **1** boundary.
- Le plan de test est un **plan**, pas un résultat ; distinguer **observé**
  et **supposé**.

## À retenir

- Équipe de 2–3 ; facilitator, recorder, speaker ; rôles tournants.
- *We help [user] do [task] in [situation].*
- Garder les preuves : **feedback**, **tests**, **change history**.
- M1 = vision + assumptions + prototype plan + AI decision log.
