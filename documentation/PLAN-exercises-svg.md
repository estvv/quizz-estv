# Plan — moteur d'exercices générique, contenu coréen, couverture SVG

> Statut : **proposition, à valider avant implémentation.**
> Décidé avec l'utilisateur : (1) moteur **générique** de types d'exercices réutilisable par toute
> catégorie, (2) **pas d'audio**, (3) SVG — l'objectif est d'**en avoir sur beaucoup plus de
> questions** (12/702 aujourd'hui), avec l'outillage pour que ça reste tenable.

---

## 1. Où on en est

| Brique | État actuel |
|---|---|
| Contenu | `backend/src/db/seed.json` → SQLite au 1er boot, **lecture seule** ensuite |
| `questions` | schéma rigide : `question_text`, `choice_a..d`, `correct_choice` (A/B/C/D), `explanation`, `diagram_svg` |
| `flashcards` | table séparée |
| Routes | `/api/questions`, `/api/questions/quiz` (`category_id` | `ids`, cap 300), `/api/questions/:id` |
| Front | `QuizSessionPage` reçoit la liste complète via le router state ; `QuestionCard` gère l'unique type QCM |
| SVG | injecté par `dangerouslySetInnerHTML` dans `QuestionCard` et `MarkdownRenderer`, thémé via `currentColor` |

Contraintes à respecter :

- **API 100 % lecture seule**, tout est `GET`, aucune écriture. Seed au 1er boot uniquement.
- `seed.json` doit rester **éditable à la main**.
- Seed = *fail loudly* : un payload mal formé doit faire planter le boot, pas passer en silence.
- CSP verrouillée (`script-src 'self'`, pas de `media-src`) — le choix « pas d'audio » évite d'y toucher.
- Budget bundle : react-markdown est déjà lazy-loadé car ~340 kB ; les nouveaux types d'exercices
  ne doivent pas tirer de grosse dépendance (pas de lib drag-and-drop → **tap-to-select**).

---

## 2. Modèle de données : table `exercises` unifiée

Nouvelle table qui **remplace** `questions` comme stockage. On garde la table `questions`
existante intacte (aucune migration destructive), mais plus rien n'y est inséré.

```sql
CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('mcq','multi','type_answer','match_pairs','order_tokens','cloze')),
    prompt TEXT NOT NULL,               -- l'énoncé affiché
    payload TEXT NOT NULL,              -- JSON spécifique au type (voir §3)
    explanation TEXT,
    diagram_svg TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category_id);
```

`schema.sql` est exécuté (`db.exec`) à **chaque** boot → la table apparaît toute seule sur une
base existante, **aucune fonction de migration ni bump de `SCHEMA_VERSION` nécessaire** (ajout pur).

### Chargement du seed — rétro-compatible

`seedIfEmpty()` accepte deux tableaux par catégorie, et insère **tout** dans `exercises` :

```jsonc
{
  "name": "Réseau",
  "questions": [ /* format actuel, inchangé */ ],   // ← converti en exercices type "mcq"
  "exercises": [ /* nouveaux types, voir §3 */ ]      // ← nouveau, optionnel
}
```

- Chaque entrée de `questions[]` devient un exercice `type:"mcq"` :
  `payload = { choices: [a,b,c,d], correct: <index de correct_choice> }`, `prompt = question_text`.
- `position` : les `questions[]` d'abord (ordre du fichier), puis les `exercises[]`.
- **Aucune reprise des 617 kB de `seed.json` existant** — le contenu déjà écrit continue de marcher tel quel.

### Comptage sur les catégories

`CATEGORY_COLUMNS` : `question_count` repointé sur `exercises` (la sous-requête corrélée devient
`SELECT COUNT(*) FROM exercises`). Le nom `question_count` est conservé côté API/front pour limiter
la casse (le champ veut dire « nombre d'exercices »). `categoryTree.ts` (`totalQuestionCount`) est
inchangé, il consomme juste ce champ.

---

## 3. Types d'exercices (v1)

Chaque type = une forme de `payload` validée au seed + un composant de rendu. La correction est
**côté client** (cohérent avec « les réponses ne sont pas un secret », cf. ARCHITECTURE.md).

| type | pour quoi | `payload` | rendu |
|---|---|---|---|
| `mcq` | QCM 1 bonne réponse (existant, généralisé à N choix) | `{ choices: string[], correct: number, hint?: string }` | boutons, feedback vert/rouge |
| `type_answer` | saisie libre (romanisation, terme exact) | `{ accept: string[], placeholder?: string, hint?: string, normalize?: "loose"\|"exact" }` | `<input>` + comparaison normalisée |
| `match_pairs` | associer 2 colonnes (hangeul ↔ sens) | `{ pairs: { a: string, b: string }[] }` | tap gauche puis tap droite, paires verrouillées |
| `order_tokens` | reconstituer une phrase (tap-the-words) | `{ tokens: string[], solution: number[], distractors?: string[] }` | banque de jetons → zone de réponse, tap pour poser/retirer |

Les **4 types sont dans ce lot** (décision : on les fait maintenant même si le coréen n'utilise
que `mcq` + `type_answer`, pour que les autres catégories puissent s'en servir).

**Fast-follow (v1.1), pas dans ce lot :**

| type | `payload` |
|---|---|
| `multi` | `{ choices: string[], correct: number[] }` |
| `cloze` | `{ text: "나는 ___ 학생 ___", blanks: { accept: string[] }[] }` |

### Normalisation de `type_answer`

- toujours : `trim`, espaces multiples → un seul, `NFC`.
- `normalize:"loose"` (défaut) : minuscules + repli des diacritiques **latins** (jamais le Hangul).
- `normalize:"romaja"` : `loose` + suppression des tirets et espaces (`sa-gwa` == `sagwa`).
- `accept[]` liste toutes les formes acceptées. Pour le coréen : **romaja ET français** acceptés
  au choix selon le mot (ex. `["sagwa","pomme"]`), jamais de saisie en Hangul (public niveau zéro,
  pas de clavier coréen supposé). `hint` porte la romaja quand la cible attendue est le français.

### Validation au seed

`validateExercisePayload(type, payload)` dans `db/index.ts`, appelée pour chaque exercice pendant
la transaction de seed. Erreur explicite (`seed.json: exercise "<prompt>" — payload invalide : …`)
→ `throw` → le boot échoue. Même philosophie que la résolution des `parent`.

---

## 4. Backend — changements

| Fichier | Changement |
|---|---|
| `db/schema.sql` | + table `exercises` + index (§2) |
| `db/index.ts` | `seedIfEmpty` : insère `questions[]` (en `mcq`), `exercises[]`, **et `vocab[]` (expansé en 4 exercices/mot, cf. §6)** dans `exercises` ; `validateExercisePayload` ; `CATEGORY_COLUMNS.question_count` → `exercises` ; nouvelles requêtes `getExercisesBrief / …FullByCategory / …FullByIds / …ById` (parsent `payload` JSON avant retour) |
| `routes/exercises.ts` | **nouveau**, calqué sur `questions.ts` : `GET /api/exercises?category_id=` (brief : `id, category_id, type, prompt`), `GET /api/exercises/quiz?category_id=|ids=` (cap `MAX_IDS=300`, ids entiers positifs), `GET /api/exercises/:id` |
| `routes/questions.ts` | **supprimé** (pré-lancement, pas de compat à tenir) — ou gardé 1 release comme alias déprécié si tu préfères |
| `index.ts` | `app.use('/api/exercises', exercisesRoutes)` à la place de `/api/questions` |
| `types/index.ts` | union discriminée `Exercise`, interfaces `payload` par type, `SeedExercise` |

Le brief n'expose **pas** `payload` (il contient les réponses) — seulement `type` + `prompt`,
comme `questions` brief n'exposait pas `correct_choice`. Le `payload` n'arrive qu'via `/quiz`.

---

## 5. Frontend — changements

### Moteur de rendu

```
components/exercise/
  ExerciseCard.tsx        ← dispatcher sur exercise.type, remonte onGraded(correct: boolean)
  McqExercise.tsx         ← refactor de QuestionCard (N choix, plus juste A-D)
  TypeAnswerExercise.tsx
  MatchPairsExercise.tsx
  OrderTokensExercise.tsx
  Feedback.tsx            ← bloc commun : bon/pas bon + Diagram + explanation
```

Contrat commun : chaque sous-composant est contrôlé, affiche son feedback après validation,
puis appelle `onGraded(correct)`. `ExerciseCard` ne connaît que ce contrat.

### Pages / routing

| Fichier | Changement |
|---|---|
| `pages/QuizSessionPage.tsx` → `SessionPage.tsx` | pilote une liste d'`Exercise[]` quelconque ; garde `ProgressBar` + `ResultsSummary` ; route `/quiz` → `/session` (ou on garde `/quiz`) |
| `components/quiz/ResultsSummary.tsx` | `AnsweredQuestion` → `AnsweredExercise` (revue par exercice ; le rendu détaillé délègue à un mode « lecture seule » d'`ExerciseCard`) |
| `pages/CategoryPage.tsx` | « Aléatoire » / « Par choix » sur les exercices ; la liste *browse* affiche un **badge de type** |
| `components/questions/QuestionListRow.tsx` | + pastille de type |
| `components/categories/StudyModes.tsx` | libellé « Quiz » → « Exercices » (ou garde « Quiz ») |
| `utils/api.ts` | `exercisesApi` remplace `questionsApi` (mêmes signatures) |
| `types/index.ts` | union `Exercise` miroir du backend |
| `App.tsx` | route ajustée |

### Rien ne change visuellement à la fin de la Phase 2

Après le refactor QCM, l'app se comporte **exactement** comme aujourd'hui. Les nouveaux types
n'apparaissent que quand du contenu les utilise.

---

## 6. Contenu coréen  *(fixé lors du dialogue du 2026-09-07)*

Public visé : **niveau zéro absolu**, ne sait pas lire le Hangeul. Tant que la feuille Hangeul
n'est pas faite, la romanisation (Revised Romanization) est visible partout.

### Arborescence (v1)

```
School
└─ Coréen                       (conteneur)
   ├─ Hangeul                    (FEUILLE — leçon + exercices ; = ce que couvraient les notes Week 1)
   └─ Vocabulary                 (conteneur)
       ├─ Nombres (sino + natifs)
       ├─ Nourriture
       ├─ Famille
       └─ …                      (FEUILLES par thème, listes fournies par l'utilisateur)
```

> `Cours` (Week 1, 2, …) est **reporté** : les notes de Week 1 ne sont que du Hangeul, déjà
> porté par la feuille `Hangeul`. On rouvrira `Cours` à la première vraie semaine de grammaire.

### Hangeul — feuille unique

- **1 leçon Markdown** couvrant tout : voyelles simples/composées, consonnes simples/doubles/
  aspirées, structure de la syllabe, **batchim**, et les règles de prononciation annexes
  (liaison, assimilation nasale, palatalisation, tensification, ㅎ faible…).
- Tableaux + **SVG** (ordre de tracé, position dans le bloc syllabique) — thémés `currentColor`,
  dogfood direct de §7.
- Exercices `mcq` + `type_answer` **conçus pour couvrir 100 % de la leçon** : une question par
  lettre / son / règle énoncée. C'est le principe d'authoring — la leçon se lit, les exercices
  garantissent qu'on peut se tester sur chaque point.

### Cours — les Weeks  *(reporté hors v1)*

Chaque Week sera une **feuille** : leçon Markdown (grammaire) + exercices `mcq`/`type_answer`
couvrant 100 % de la leçon. Ouvert à la première semaine de vraie grammaire, pas maintenant.

### Vocabulary — decks par thème

- Chaque thème = **feuille**, **sans leçon**. Un lexique `hangeul / romaja / français`.
- **Pas de flashcards** pour le coréen (mode non utilisé ici).
- Listes fournies par toi (corrigées, cf. `coreen-vocab-review.md`).

#### Sucre de seed : `vocab[]` → 2 exercices générés par mot

Nouveau tableau `vocab[]` sur une catégorie, expansé au seed (comme `questions[]` → `mcq`) :

```jsonc
{ "ko": "사과", "rr": "sagwa", "fr": ["pomme"] }   // rr_accept?: [...] pour des variantes
```

Chaque entrée génère **2 exercices** (jamais de saisie en hangul) :

| # | type | ce qu'on montre | ce qu'on saisit / choisit |
|---|---|---|---|
| 1 | `vocab` | le hangeul **사과** en gros | **Sens (fr)** — *noté* · **Prononciation** — *optionnelle, jamais notée, toujours révélée* |
| 2 | `mcq` | « Que veut dire **사과** ? » | `fr[0]` + 3 distracteurs du même deck |

- **type `vocab`** (nouveau, `payload = { ko, rr, rr_accept?, fr[], hint[] }`) :
  - le **sens FR** est la réponse notée (`fr[]`, normalisation `loose`) ;
  - la **prononciation** est un champ bonus : la remplir ou non ne change pas le score, mais
    `rr` est **toujours** affichée dans la correction (« essaie de la donner à chaque fois »).
    But : prendre le réflexe de taper les deux.
  - bouton **« Indice »** : révèle les 4 propositions (`hint` = les mêmes choix que le mcq),
    cliquables pour remplir le champ sens. Sans clic, aucune proposition affichée.
- **`hint` / mcq** : distracteurs figés au seed (tirage aléatoire parmi les `fr` des autres
  mots du deck). Deck < 4 mots ⇒ moins de distracteurs ; deck < 2 ⇒ pas de mcq.
- **normalisation `romaja`** : `loose` + suppression tirets/espaces (`sa-gwa` == `sagwa`).
- Un deck de 20 mots ⇒ 40 exercices ; sélecteur 5 / 10 / toutes de la page catégorie.
  `seed.json` reste compact (1 ligne par mot).

### Contenu livré en v1

- **Hangeul** : la feuille complète (leçon + SVG + exercices couvrants).
- **Vocabulary** : les decks à partir de **la liste que tu me fournis**.

### Impact sur le reste du plan

- Le coréen n'utilise que `mcq` + `type_answer`. `match_pairs` / `order_tokens` restent construits
  (§3) mais ne sont dogfoodés par aucun contenu coréen — ils attendent une autre catégorie.
- **Flashcards** : inchangées ailleurs, simplement jamais proposées sous `Coréen`. `StudyModes`
  n'affiche déjà un mode que s'il a du contenu → rien à coder de spécial, il suffit de ne pas
  seeder de `flashcards[]` sous cette branche.

---

## 7. SVG — couverture et outillage

Pour que « en mettre partout » reste tenable :

| Livrable | Détail |
|---|---|
| `documentation/DIAGRAMS.md` | conventions d'authoring : `viewBox` obligatoire, **jamais** de `width/height` fixes, `stroke`/`fill="currentColor"` (+ `opacity` pour les teintes), `role="img"` + `aria-label`, largeur ≤ ~640, `<figure>` optionnel. Un gabarit copiable par famille (flux/flèches, boîtes empilées, grille de bits, table). |
| `components/shared/Diagram.tsx` | composant unique qui encapsule le `dangerouslySetInnerHTML` : conteneur `overflow-x-auto`, padding/bordure cohérents, `[&_svg]:w-full [&_svg]:h-auto`, `max-height`. Utilisé par `Feedback.tsx` **et** `MarkdownRenderer.tsx` (supprime la duplication actuelle). |
| lint de seed (léger) | au seed, `console.warn` si un `diagram_svg` n'a pas de `viewBox` ou pas d'`aria-label`. Non bloquant. |
| passe de contenu | repérer les questions où un schéma aide vraiment (structures de données, handshakes réseau, bitwise, layout mémoire, shapes de tenseurs, arbres) et les illustrer. **Itératif**, suivi dans `documentation/TODO.md`. Cible 1er lot : ~20 diagrammes. |

---

## 8. Découpage en phases (chaque phase = 1 PR livrable et vert)

| Phase | Contenu | Visible pour l'utilisateur final |
|---|---|---|
| **0** | table `exercises` + `schema.sql` ; `seedIfEmpty` unifié + `validateExercisePayload` ; `question_count` repointé | non (le contenu existant marche à l'identique) |
| **1** | `routes/exercises.ts` ; retrait `/api/questions` ; `types` backend | non |
| **2** | moteur front : `ExerciseCard` + `McqExercise` (parité totale), `SessionPage`, `ResultsSummary`, `CategoryPage`, `api.ts`, `types` front | non (comportement identique) |
| **3** | `TypeAnswerExercise`, `MatchPairsExercise`, `OrderTokensExercise` + payloads + validateurs + badges de type | oui (dès qu'un contenu les utilise) |
| **4** | branche **Coréen** : `School → Coréen` avec 2 feuilles — **Hangeul** (leçon + SVG + exercices couvrants) et **Vocabulary** (conteneur → decks depuis ta liste) | oui |
| **5** | `DIAGRAMS.md`, `Diagram.tsx` (dédup), lint seed, 1er lot ~20 diagrammes | oui |

Phases 0–2 sont un refactor sans changement fonctionnel : on peut les enchaîner puis livrer.
Phases 3+ apportent la valeur visible.

---

## 9. Décisions — « garde simple »

- 4 types d'exercices dès ce lot · pas de flashcards pour le coréen · type_answer accepte
  romaja + français · exercices d'une leçon = couverture 100 % de la leçon.
- **`/api/questions`** : suppression franche (pré-lancement).
- **Route de session** : on garde `/quiz`.
- **Coréen** : directement sous `School → Coréen`, pas de nœud `Langues`.
- **Libellé** : on garde « Quiz ».
- **Périmètre** : phases 0 → 4.
- **`Cours` / Weeks** : *reporté*. Les notes de Week 1 = uniquement du Hangeul, donc déjà couvert
  par la feuille **Hangeul**. En v1, `Coréen` n'a que **2 feuilles** : `Hangeul` + `Vocabulary`
  (conteneur → thèmes). On rouvrira `Cours` quand il y aura de la vraie grammaire par semaine.
- **Vocabulary** : liste fournie par toi, mise en forme + exercices par moi.
