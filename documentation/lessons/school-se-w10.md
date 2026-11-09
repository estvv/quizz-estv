# Software Engineering — Week 10 · Software Testing

**Cours** : *Unit tests, feature tests, and automation* (Sommerville 2021,
chapitre 9 ; Python `unittest`). Ce que prouve (et ne prouve pas) un test, les
**niveaux de test fonctionnel**, le **unit test** et son **contrat**,
l'**equivalence partitioning**, les **boundary values**, l'exemple du **name
checker**, le **feature testing**, l'**automatisation** (test runner,
**Arrange / Action / Assert**, assertions, fixtures, rapports), la
**regression testing** et la **test pyramid**. (Les slides sont titrées
« Week 9 », le fichier est dans `week_10`.)

> **En bref.** Tester = **exécuter** le logiciel sur des **entrées choisies**
> et **comparer** le résultat **observé** au résultat **attendu**. Un test qui
> **passe** ne prouve que les **cas vérifiés** ; un test qui **échoue** est
> une **preuve à examiner** (le code, l'attendu ou le setup peut être faux).
> On choisit les entrées par **equivalence partitioning** (des groupes
> traités pareil) et **boundary values** (là où le comportement change :
> 1, 2, 40, 41 caractères). Un test automatisé suit **Arrange → Action →
> Assert** ; la **test pyramid** recommande **beaucoup de unit tests**, moins
> de feature tests, peu de system tests.

---

## 1. Politique de sécurité → comportement observable

Le lien avec la Week 7 : une **access policy** devient **testable** en
comparant un résultat observé au résultat exigé.

| Exemple (université) | Condition de la policy | Attendu observable |
|---|---|---|
| un étudiant lit **son** dossier | le dossier lui appartient | le dossier est **renvoyé** |
| il demande **celui d'un autre** | condition fausse | le dossier est **refusé** |

> Il faut **des cas distincts** pour une requête **permise** et une requête
> **refusée**.

## 2. Tester, et ses limites

```diagram
{
  "title": "Un test compare le comportement attendu (issu des exigences) au comportement réel (issu de l'exécution).",
  "nodes": [
    { "id": "a", "x": 110, "y": 50, "w": 190, "h": 56, "label": "Required behavior\nand selected inputs", "tone": "sky", "filled": true, "size": 12 },
    { "id": "b", "x": 340, "y": 50, "w": 190, "h": 56, "label": "Execute the software\nand observe the result", "tone": "violet", "filled": true, "size": 12 },
    { "id": "c", "x": 570, "y": 50, "w": 190, "h": 56, "label": "Compare expected\nand actual behavior", "tone": "emerald", "filled": true, "size": 12 }
  ],
  "edges": [ { "from": "a", "to": "b" }, { "from": "b", "to": "c" } ]
}
```

- Un test peut révéler un **défaut d'implémentation** ou une **mauvaise
  compréhension** du comportement requis.
- Un test qui **passe** soutient une affirmation **sur les cas testés**
  seulement : il **ne prouve pas** que toutes les entrées, combinaisons,
  environnements ou futurs changements sont corrects.
- Un test qui **échoue** est une preuve **à investiguer** : le **code**,
  l'**attendu** ou le **setup** du test peut être faux.

## 3. Les niveaux de test fonctionnel

```diagram
{
  "title": "Du plus petit au plus grand. On n'attend pas que tout le système soit fini pour tester.",
  "nodes": [
    { "id": "u", "x": 90, "y": 50, "w": 150, "h": 66, "label": "Unit\nune responsabilité,\nisolée", "tone": "sky", "filled": true, "size": 12 },
    { "id": "f", "x": 260, "y": 50, "w": 150, "h": 66, "label": "Feature\ndes units qui coopèrent\npour une fonction utile", "tone": "amber", "filled": true, "size": 12 },
    { "id": "s", "x": 430, "y": 50, "w": 150, "h": 66, "label": "System\nles features dans un\nproduit qui marche", "tone": "violet", "filled": true, "size": 12 },
    { "id": "r", "x": 600, "y": 50, "w": 150, "h": 66, "label": "Release\nle produit packagé\ndans son contexte", "tone": "emerald", "filled": true, "size": 12 }
  ],
  "edges": [ { "from": "u", "to": "f" }, { "from": "f", "to": "s" }, { "from": "s", "to": "r" } ]
}
```

> La **portée** du test détermine ce qu'il prouve : une fonction correcte ne
> prouve pas que les **features interagissent** correctement. Ce cours se
> concentre sur **unit** et **feature** testing.

## 4. Le unit test et son contrat

Un **unit** a une **responsabilité bien définie** : souvent une **fonction**
ou une **méthode**, parfois un petit **module**. Le unit testing vérifie cette
responsabilité **en isolation**, pendant le développement.

| Contrat (ce qui fixe les attentes) | Isolation |
|---|---|
| entrées supportées, **préconditions**, valeur de retour ou changement d'état attendu, traitement des **entrées invalides** | contrôler les entrées et les **dépendances** pour qu'un échec pointe vers une **petite** responsabilité ; ça aide le diagnostic mais **ne remplace pas** les tests d'intégration |

| | Rôle | Exemple (name checker) |
|---|---|---|
| **Input** | un cas **significatif** | un caractère : `'S'` |
| **Expected result** | ce que la **règle exige** | **Reject** : longueur < 2 |
| **Actual result** | ce qu'on **observe** | `namecheck('S')` |

> L'attendu doit être justifié **indépendamment** du code, sinon le test
> **recopie l'erreur** de l'implémentation.

## 5. Equivalence partitioning

On **regroupe** les entrées qui doivent être **traitées de la même façon**
et on prend des **représentants** de chaque groupe, y compris des entrées à
**rejeter**.

```diagram
{
  "title": "Partitions sur la seule dimension « longueur » (les autres règles restent valides).",
  "nodes": [
    { "id": "a", "x": 110, "y": 50, "w": 190, "h": 60, "label": "Below the valid range\n→ reject", "tone": "rose", "filled": true },
    { "id": "b", "x": 330, "y": 50, "w": 190, "h": 60, "label": "Within the valid range\n→ accept", "tone": "emerald", "filled": true },
    { "id": "c", "x": 550, "y": 50, "w": 190, "h": 60, "label": "Above the valid range\n→ reject", "tone": "rose", "filled": true }
  ],
  "edges": []
}
```

Plusieurs représentants et des cas aux **frontières** apportent plus de
preuves qu'un seul cas intérieur… mais **ne prouvent pas** chaque membre.

## 6. L'exemple du name checker (Program 9.1)

| Condition | Comportement |
|---|---|
| **Longueur** | accepter de **2 à 40** caractères, **inclus** |
| **Jeu de caractères** | lettres **ASCII**, **trait d'union**, **apostrophe** |
| **Premier caractère** | une **lettre ASCII** |
| **Séparateurs** | rejeter un **double trait d'union** et **deux apostrophes** |

> Le texte du livre parle de lettres accentuées, mais l'expression régulière
> imprimée utilise **[a-zA-Z]** : les tests doivent dire **quel contrat** ils
> vérifient (ici, l'ASCII du programme).

### Représentants valides et invalides

**Faire varier une règle à la fois** : un échec est alors plus
**informatif**.

| Input | Attendu | Raison |
|---|---|---|
| `Sommerville` | **Accept** | lettres, longueur valide |
| `O'Reilly` | **Accept** | une apostrophe permise |
| `Washington-Wilson` | **Accept** | un trait d'union permis |
| `Sommer_ville` | **Reject** | `_` hors du jeu permis |
| `-Wesley` | **Reject** | le 1er caractère n'est pas une lettre |
| `Anne--Marie` | **Reject** | double trait d'union (les autres règles tiennent) |

### Boundary values (off-by-one)

Les erreurs se cachent au **premier** et au **dernier** cas permis.

| Longueur | 1 | **2** | 3 | 39 | **40** | 41 |
|---|---|---|---|---|---|---|
| Attendu | Reject | **Accept** | Accept | Accept | **Accept** | Reject |
| Position | below | **lower** | inside | inside | **upper** | above |

> Si le code écrit **« < 40 »** alors que le contrat dit **« au plus 40 »**,
> seul le cas **40** révèle le défaut : les noms plus courts passent tous.
> Les 6 longueurs sont un choix pédagogique ; la **chaîne vide** est un autre
> cas invalide utile.

### Isoler une règle

| Cas | Ce qu'il vérifie | Limite de diagnostic |
|---|---|---|
| `--badcode` | le rejet d'un nom invalide | viole **deux** règles (1re lettre **et** double `-`) |
| `Anne--Marie` | le rejet du **double** trait d'union | les autres règles restent valides |
| `Anne-Marie` | l'acceptation d'**un** trait d'union | distingue un séparateur **permis** d'une paire **interdite** |

La paire `Anne-Marie` / `Anne--Marie` révèle aussi un code qui rejetterait
**tous** les traits d'union.

### Autres heuristiques

| Guideline | Risque examiné |
|---|---|
| **vide, zéro, un élément** | initialisation, hypothèse « il y a des données » |
| **bornes haute et basse** | comparaisons fausses, erreurs 1er / dernier élément |
| **entrées invalides, erreurs forcées** | l'erreur **exigée** plutôt qu'un crash |
| **répétition, nombre d'éléments** | fuite d'état, éléments perdus |

## 7. Feature testing

Une **feature** apporte une fonction **utile** à l'utilisateur et combine
souvent plusieurs **units**.

| **Interaction tests** | **Usefulness tests** |
|---|---|
| vérifier les hypothèses **aux frontières** des units : formats, appels, changements d'état ; des units **correctes isolément** peuvent **ne pas s'accorder** sur le sens d'une entrée | vérifier que les **choix et défauts** implémentés répondent aux **attentes** : une inscription par email qui marche peut avoir un **défaut** que les users ne veulent pas |

Les **scenarios** et **user stories** (W4) organisent ces tests ; les devs
apportent la connaissance technique, les product managers et représentants
des users précisent le comportement voulu.

| Intention (sign-in with Google) | Feature checks |
|---|---|
| s'inscrire **sans nouveau compte** | la route de sign-in s'affiche ; identifiants faux → **erreur et nouvel essai** |
| comprendre le **partage d'infos** | les infos partagées et **cancel / confirm** s'affichent ; **cancel arrête** l'inscription |
| choisir les **emails** | plusieurs choix possibles ; **aucun choix = aucun abonnement** |

> Observer les **abonnements enregistrés**, pas seulement les cases cochées.

| | **Unit test** | **Feature test** |
|---|---|---|
| Question | une responsabilité marche-t-elle avec des entrées contrôlées ? | des units qui coopèrent donnent-elles le comportement utile ? |
| Frontière | fonction, méthode, petit module | un chemin de feature à travers plusieurs units |
| Preuve | le name checker rejette un caractère interdit | annuler arrête l'inscription ; aucun email choisi = aucun abonnement |
| Limite | ne prouve pas l'**intégration** | plus **dur à diagnostiquer**, plusieurs observations |

## 8. Automatisation

Un **executable test** contient des **entrées**, un **résultat attendu** et
une **vérification**. Un **test runner** exécute une collection de tests et
**rapporte** les résultats.

```diagram
{
  "title": "Le runner exécute les tests contre le code et produit un rapport : passes, failures, errors.",
  "nodes": [
    { "id": "a", "x": 100, "y": 60, "w": 160, "h": 56, "label": "Executable test files\ninputs + assertions", "tone": "sky", "filled": true, "size": 12 },
    { "id": "b", "x": 330, "y": 60, "w": 170, "h": 56, "label": "Test runner\n+ testing framework", "tone": "violet", "filled": true, "size": 12 },
    { "id": "c", "x": 560, "y": 60, "w": 160, "h": 56, "label": "Code under test\nobserved behavior", "tone": "amber", "filled": true, "size": 12 },
    { "id": "d", "x": 330, "y": 160, "w": 170, "h": 56, "label": "Test report\npasses, failures, errors", "tone": "emerald", "filled": true, "size": 12 }
  ],
  "edges": [ { "from": "a", "to": "b" }, { "from": "b", "to": "c", "arrow": "both" }, { "from": "b", "to": "d" } ]
}
```

L'automatisation rend la répétition **économique** ; c'est le **design des
tests** qui détermine quels défauts la suite peut révéler.

### Arrange, Action, Assert

```python
def test_zero_principal(self):
    # Arrange : définir le cas et le résultat attendu
    principal, rate, days = 0, 3, 31
    expected = 0
    # Action : exécuter le unit
    actual = interest_calculator(principal, rate, days)
    # Assert : comparer observé et attendu
    self.assertEqual(expected, actual)
```

Attendu justifié : **pas de capital → pas d'intérêts**.

### Les assertions

```python
self.assertEqual(expected, actual)        # une VALEUR exigée
self.assertTrue(namecheck('Sx'))          # une ACCEPTATION exigée
self.assertFalse(namecheck('S'))          # un REJET exigé
with self.assertRaises(ValueError):       # une EXCEPTION exigée
    int('not-a-number')
```

**Une condition principale par unit test** simplifie le diagnostic ; un
résultat composite peut justifier plusieurs assertions liées.

### Une assertion qui passe peut ne rien tester

```python
self.assertTrue('Sx')              # Program 9.3 imprimé : une chaîne non vide est TOUJOURS vraie
self.assertTrue(namecheck('Sx'))   # correction : on vérifie le résultat de la fonction
```

> La première ligne **passe même si namecheck est complètement cassé** : elle
> n'appelle jamais la fonction. **Les tests sont aussi des programmes** : il
> faut les relire.

### Fixtures et indépendance

Une **test fixture** prépare l'état et les ressources dont un test a besoin.
Des tests **indépendants** marchent seuls ou ensemble, sans dépendre de
l'état laissé par un autre.

`Prepare known inputs and initial state → Run one case and check → Clean up
or restore` (en `unittest` : **`setUp`** / **`tearDown`**).

### Découverte et rapport

En `unittest`, les méthodes de test commencent par **`test`** ; la découverte
cherche les fichiers **`test*.py`** : `python -m unittest discover -v`.

> **Piège :** une commande qui **réussit** mais a découvert **zéro test** ne
> prouve **rien**. Regarder le **nombre** de tests (« Ran 14 tests »).

| Résultat | Sens |
|---|---|
| **Pass** | le test s'est terminé sans assertion fausse ni exception inattendue |
| **Failure** | une **assertion n'a pas tenu** : examiner l'attendu et le réel |
| **Error** | une **exception inattendue** a empêché la fin (setup ou exécution) |
| **Skip** | **non exécuté** : n'apporte **aucune** preuve |

Une exception **attendue** capturée par `assertRaises` **passe**.

## 9. Regression testing

**Rejouer les tests précédents après un changement** pour détecter des
**effets non voulus**.

`Existing suite and known baseline → Implementation change → Rerun new and
previous tests → Inspect changes in observed behavior`.

Les tests qui passent soutiennent la préservation de **ce qu'ils vérifient**,
pas de **tout** ; un nouveau défaut découvert est une raison d'**étendre la
suite**.

## 10. La test pyramid

```diagram
{
  "title": "Beaucoup de petits tests rapides en bas, peu de tests larges en haut. Cohn suggère 70 / 20 / 10 : une heuristique, pas une cible universelle.",
  "nodes": [
    { "id": "s", "x": 300, "y": 30, "w": 200, "h": 40, "label": "System tests (≈ 10 %)", "tone": "rose", "filled": true, "size": 12 },
    { "id": "f", "x": 300, "y": 85, "w": 260, "h": 40, "label": "Feature tests (≈ 20 %)", "tone": "amber", "filled": true, "size": 12 },
    { "id": "u", "x": 300, "y": 140, "w": 400, "h": 40, "label": "Unit tests (≈ 70 %) — faciles à automatiser et à diagnostiquer", "tone": "emerald", "filled": true, "size": 12 }
  ],
  "edges": []
}
```

Les tests larges restent **nécessaires** : units et features peuvent faire des
**hypothèses incompatibles**.

**Feature tests via une API** : une API permet d'appeler le comportement d'une
feature **sans** rejouer chaque interaction GUI — mais il faut quand même des
tests des **écrans** et du **navigateur**.

**Une feature peut demander plusieurs observations** (partage de document) :

| Postcondition | Ce qu'une seule assertion pourrait rater |
|---|---|
| le statut du document est **shared** | un statut changé peut ne pas donner l'accès |
| l'utilisateur est dans la **liste de partage** | en ajouter un peut **retirer** un ancien |
| les **anciens** utilisateurs restent dans la liste | garder la liste ne prouve pas le **nouvel accès** |
| **tous** voient le document | l'état stocké et la visibilité réelle doivent **concorder** |

## 11. Preuves et jugement

| Preuve | Ce qu'elle soutient, et sa limite |
|---|---|
| **Unit cases** | les cas choisis sont vérifiés ; les autres entrées restent |
| **Feature / API checks** | les interactions choisies sont vérifiées ; le GUI demande d'autres preuves |
| **Regression run** | les assertions précédentes tiennent **dans ce run** ; le non-asserté reste inconnu |
| **Manual exploration** | examine des conditions oubliées ; la **répétabilité** demande du soin |

> **Automation bias** : on favorise les cas **faciles à automatiser** plutôt
> que les cas **nécessaires**. La **revue** et l'exploration manuelle
> complètent la suite.

---

## Pièges d'exam

- Un test qui passe **ne prouve pas** l'absence de bug, seulement les cas
  testés ; un échec peut venir du **code, de l'attendu ou du setup**.
- Unit = **une responsabilité isolée** ; feature = **units qui coopèrent** ;
  un unit correct ne prouve pas l'intégration.
- Equivalence partitioning = **groupes** traités pareil ; boundary values =
  **2 et 40** (et 1, 41) pour le name checker 2–40.
- `Anne--Marie` isole **une** règle ; `--badcode` en viole **deux**.
- **Arrange → Action → Assert** ; `assertEqual`, `assertTrue`,
  `assertFalse`, `assertRaises`.
- `self.assertTrue('Sx')` passe **toujours** : il n'appelle pas la fonction.
- **Failure** = assertion fausse ; **error** = exception inattendue ;
  **skip** = aucune preuve ; **0 test découvert** = aucune preuve.
- Regression = **rejouer** les anciens tests après un changement.
- Pyramide : **unit (70) > feature (20) > system (10)**, heuristique de
  Cohn.

## À retenir

- Tester : entrées choisies → exécuter → comparer attendu / réel.
- Niveaux : unit, feature, system, release.
- Choisir les entrées : partitions, frontières, une règle à la fois,
  heuristiques (vide, bornes, invalides, répétitions).
- Automatiser : runner, AAA, assertions, fixtures (setUp / tearDown),
  discovery `test*.py`, rapport.
- Regression testing, test pyramid, automation bias.
