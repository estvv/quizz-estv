# Software Engineering — Week 6 · Services and APIs

**Cours** : *Service boundaries, interfaces, and REST* (Sommerville 2021,
§4.3–4.4 et chapitre 6 ; RFC 9110 pour HTTP ; Fielding 2000 pour REST).
**Service**, **interface**, **API** ; **microservices** et indépendance ;
**cohesion / coupling** (l'exemple des mots de passe) ; le **support code**
d'un service ; quand **séparer** ; le **contrat d'API** ; requêtes
**synchrones** et résultats incertains ; les **6 contraintes REST** et
l'**uniform interface** ; **stateless** ; **resource vs representation** ;
**HTTP** requête / réponse, **méthodes**, **safe / idempotent**, **POST vs
PUT**, **JSON**, **status codes** ; **compatibilité** d'interface.

> **En bref.** Un **service** fournit une capacité ; son **API** dit ce que
> l'appelant peut demander et ce que les résultats **signifient** (le
> **contrat**), en cachant l'implémentation. Une bonne frontière de service a
> une **forte cohesion** (dedans) et un **faible coupling** (dehors). **REST**
> est un **style architectural** à 6 contraintes (client–server,
> **stateless**, cache, **uniform interface**, layered, code-on-demand
> optionnel) — utiliser HTTP + JSON ne suffit pas. **GET** est **safe et
> idempotent**, **PUT** et **DELETE** sont **idempotents**, **POST** ne l'est
> **pas** garanti. Codes : **200** OK, **201** Created, **204** No Content,
> **400** Bad Request, **404** Not Found, **500** Server Error.

---

## 1. Architecture et interfaces

```diagram
{
  "title": "Des requirements au résultat observable : l'interface relie les composants à ceux qui les appellent.",
  "nodes": [
    { "id": "a", "x": 90, "y": 50, "w": 150, "h": 60, "label": "Product behavior\nand requirements", "tone": "neutral", "filled": true, "size": 12 },
    { "id": "b", "x": 270, "y": 50, "w": 150, "h": 60, "label": "Components and\nresponsibilities", "tone": "sky", "filled": true, "size": 12 },
    { "id": "c", "x": 450, "y": 50, "w": 150, "h": 60, "label": "Service interface\nand contract", "tone": "violet", "filled": true, "size": 12 },
    { "id": "d", "x": 630, "y": 50, "w": 150, "h": 60, "label": "Request and\nobservable result", "tone": "emerald", "filled": true, "size": 12 }
  ],
  "edges": [ { "from": "a", "to": "b" }, { "from": "b", "to": "c" }, { "from": "c", "to": "d" } ]
}
```

- L'**architecture** attribue des **responsabilités** aux composants et décide
  **où ils s'exécutent**.
- Une **interface** spécifie **comment** un autre composant demande une
  capacité et **interprète le résultat**.

## 2. Service, API, implementation

| Concept | Ce qu'il décrit | Relation |
|---|---|---|
| **Service** | une **capacité** et le logiciel qui la fournit | un service peut exposer **plusieurs opérations** |
| **API** | *application programming interface* utilisée par **d'autres logiciels** | définit les **opérations accessibles** et leurs **règles d'interaction** |
| **Implementation** | le code, les algorithmes, l'organisation des données | **plusieurs implémentations** peuvent garder **le même comportement d'API** |

- Une **network API** ajoute les **formats de message** et la **sémantique du
  protocole**.
- **Utiliser HTTP ne fait pas une architecture microservices.**

## 3. Microservices et indépendance

Des **microservices** coopèrent pour former une application ; leurs interfaces
doivent permettre des **changements et déploiements indépendants** **sans**
modifier les appelants en même temps.

| Caractéristique | Intention |
|---|---|
| **Business focus** | regrouper les fonctions autour d'une **capacité cohérente** |
| **Implementation** | autoriser des **langages** et des **stockages** différents |
| **Deployment** | **lancer et mettre à jour** chaque service **séparément** |
| **Communication** | échanger requêtes et résultats via des **interfaces explicites** |

> L'indépendance est un **objectif**, pas une garantie : appeler un autre
> service dépend toujours de sa **disponibilité** et de son **contrat**. Un
> **module interne** n'a pas besoin d'être un service déployé à part.

## 4. Cohesion et coupling

```diagram
{
  "title": "Cohesion = l'intérieur (ce qui va ensemble reste ensemble). Coupling = l'extérieur (les dépendances vers les autres).",
  "groups": [
    { "x": 170, "y": 90, "w": 300, "h": 150, "label": "Cohesion (dedans) : HAUTE", "tone": "emerald" },
    { "x": 520, "y": 90, "w": 300, "h": 150, "label": "Coupling (dehors) : FAIBLE", "tone": "sky" }
  ],
  "nodes": [
    { "id": "pm", "x": 170, "y": 90, "w": 240, "h": 70, "label": "Password management\ncreate, change, check, recover", "tone": "emerald", "filled": true, "size": 12 },
    { "id": "cl", "x": 440, "y": 90, "w": 100, "label": "Caller", "tone": "neutral", "filled": true },
    { "id": "sv", "x": 610, "y": 90, "w": 100, "label": "Service", "tone": "sky", "filled": true }
  ],
  "edges": [ { "from": "cl", "to": "sv", "label": "1 interface" } ]
}
```

- **Haute cohesion** : les fonctions **et les données** nécessaires à une
  responsabilité restent **ensemble**.
- **Faible coupling** : limiter les **changements** et les **appels distants**
  nécessaires pour rendre le service.
- **Découper en morceaux plus petits** peut **augmenter** la communication et
  le **shared-data coupling**.

### L'exemple des mots de passe (Fig. 6.3)

```diagram
{
  "title": "Le découpage REJETÉ : trois services qui partagent les mêmes données = couplage fort. Mieux : un seul service « maintenir les mots de passe ».",
  "nodes": [
    { "id": "c1", "x": 120, "y": 40, "w": 140, "label": "Create\npassword", "tone": "rose", "filled": true },
    { "id": "c2", "x": 330, "y": 40, "w": 140, "label": "Change\npassword", "tone": "rose", "filled": true },
    { "id": "c3", "x": 540, "y": 40, "w": 140, "label": "Check\npassword", "tone": "rose", "filled": true },
    { "id": "db", "x": 330, "y": 150, "w": 200, "shape": "cylinder", "label": "Shared password data" }
  ],
  "edges": [
    { "from": "c1", "to": "db", "arrow": "both" }, { "from": "c2", "to": "db", "arrow": "both" }, { "from": "c3", "to": "db", "arrow": "both" }
  ]
}
```

La frontière suit une **responsabilité cohérente** (*maintaining stored
passwords*), **pas le nombre d'opérations**.

## 5. Service functionality et support code

Même si le calcul métier est petit, un service a besoin de **beaucoup de code
autour** :

| Responsabilité | Pourquoi |
|---|---|
| **Message management** | **valider** l'entrée, **extraire** les données, **encoder** les réponses |
| **Failure management** | gérer les opérations **refusées**, les **pannes externes**, les **réponses manquantes** |
| **Data consistency** | coordonner les mises à jour d'informations liées **entre services** |
| **Interface support** | fournir le support d'interaction demandé par le design |

(Le modèle du livre inclut du **code UI** par service : c'est un **choix de
modèle**, les API HTTP n'exigent pas une UI par service.)

## 6. Quand séparer un service ?

| La séparation aide quand… | Le coût grimpe quand… |
|---|---|
| une capacité **change indépendamment** | un changement d'interface **force les appelants** à changer |
| une capacité a besoin de **plus d'instances** (replication) | chaque requête exige **beaucoup d'appels distants** |
| fonctions et données liées tiennent dans **une responsabilité** | plusieurs services **coordonnent des changements sur les mêmes données** |

> **Decomposition** et **distribution** sont deux décisions **séparées** : des
> modules aux interfaces claires peuvent rester dans **un seul exécutable**
> jusqu'à ce que le déploiement séparé devienne utile.

## 7. Le contrat d'API

Un **nom de méthode seul** ne dit ni le sens des entrées, ni les résultats,
ni les échecs.

| Élément du contrat | Ce que l'appelant doit savoir |
|---|---|
| **Operation** | quelle **ressource** viser, quelle **action** demander |
| **Input** | champs **requis**, valeurs **valides**, **types**, **format** |
| **Result** | **status**, champs renvoyés et leur **sens** |
| **Failure** | comment apparaissent entrée **invalide**, ressource **absente**, **panne serveur** |

HTTP fournit une sémantique **commune** (méthodes, status) ; chaque API définit
ses **données métier**. Les clients dépendent du **contrat**, **pas du
stockage interne**.

## 8. Traitement d'une requête

```diagram
{
  "title": "Request processing → service actions → response generation (Fig. 6.13 redessinée).",
  "nodes": [
    { "id": "r", "x": 80, "y": 60, "w": 130, "h": 70, "label": "HTTP request\nmethod, target,\nfields, content", "tone": "neutral", "filled": true, "size": 12 },
    { "id": "p", "x": 250, "y": 60, "w": 130, "h": 70, "label": "Request\nprocessing\ndecode, validate", "tone": "sky", "filled": true, "size": 12 },
    { "id": "s", "x": 420, "y": 60, "w": 130, "h": 70, "label": "Service\nactions\nperform work", "tone": "violet", "filled": true, "size": 12 },
    { "id": "g", "x": 590, "y": 60, "w": 130, "h": 70, "label": "Response\ngeneration\nstatus, fields", "tone": "emerald", "filled": true, "size": 12 },
    { "id": "e1", "x": 250, "y": 170, "w": 160, "shape": "note", "tone": "rose", "label": "malformed → 400\navant le métier", "size": 11 },
    { "id": "e2", "x": 420, "y": 170, "w": 160, "shape": "note", "tone": "amber", "label": "valide mais erreur\nmétier possible", "size": 11 }
  ],
  "edges": [
    { "from": "r", "to": "p" }, { "from": "p", "to": "s" }, { "from": "s", "to": "g" },
    { "from": "p", "to": "e1", "dashed": true }, { "from": "s", "to": "e2", "dashed": true }
  ]
}
```

La réponse doit décrire le **vrai résultat** pour que l'appelant sache quoi
faire ensuite.

### Interaction synchrone et résultat incertain

En **synchrone**, l'appelant **attend la réponse** avant de continuer. Si la
réponse est **retardée ou perdue**, l'appelant **ne sait pas** ce qui s'est
passé côté serveur.

> **Un timeout ne prouve pas que l'opération a échoué.** On ne **retry** que si
> la sémantique de l'opération (idempotence) ou un mécanisme anti-doublon le
> permet.

## 9. REST, un style architectural

**REST** = *Representational State Transfer*. **HTTP + JSON ne suffisent pas**
à faire du REST.

| Contrainte | But et conséquence |
|---|---|
| **Client–server** | séparer l'interaction utilisateur des responsabilités du service |
| **Stateless** | chaque requête est **indépendante** du contexte de session précédent |
| **Cache** | identifier les réponses **réutilisables**, moins de communication |
| **Uniform interface** | des **règles communes** pour toutes les ressources |
| **Layered system** | cacher le chemin complet derrière des **couches intermédiaires** |
| **Code-on-demand** (*optionnel*) | étendre le client avec du **code téléchargé** |

### Uniform interface : 4 contraintes (Fielding)

| Contrainte | Sens |
|---|---|
| **Resource identification** | chaque ressource a un **identifiant** utilisable par le client |
| **Manipulation through representations** | on échange une **représentation** de l'état, pas le stockage interne |
| **Self-descriptive messages** | le message contient de quoi être **interprété** |
| **HATEOAS** (*Hypermedia as the engine of application state*) | des **liens** indiquent les interactions suivantes possibles |

> Une API qui échange du JSON à des URL fixes montre des techniques d'**API
> HTTP**, **pas** forcément le **REST complet**.

### Stateless ≠ sans données

```diagram
{
  "title": "Le contexte voyage dans la requête ; les données persistent dans le resource store. Le service n'a pas besoin de « se souvenir » du client.",
  "nodes": [
    { "id": "c", "x": 90, "y": 60, "w": 140, "h": 60, "label": "Client\nrequest context", "tone": "sky", "filled": true },
    { "id": "s", "x": 330, "y": 60, "w": 140, "h": 60, "label": "Service\ninterprets request", "tone": "violet", "filled": true },
    { "id": "db", "x": 560, "y": 60, "w": 150, "shape": "cylinder", "label": "Resource store\npersistent data" }
  ],
  "edges": [ { "from": "c", "to": "s", "label": "requête complète" }, { "from": "s", "to": "db", "arrow": "both" } ]
}
```

Avantage : on peut **router** la requête suivante vers **une autre instance**
— mais les instances ont toujours besoin d'une **stratégie de cohérence** des
données.

## 10. Resource et representation

- **Resource** : le concept ou l'information **identifiable** exposé.
- **Representation** : les données **dans un format donné** qui communiquent
  son état.
- Exemple du livre : le **contenu du livre** (une ressource) a des
  représentations **Markdown, Word, InDesign, PDF** ; une ressource de service
  peut avoir une représentation **JSON** ou **XML** sans être identique à
  l'une d'elles.

### Identifiants du service d'incidents routiers

`https://trafficinfo.net/incidents/A90/stonehaven/north/1`

| Path | Ressource |
|---|---|
| `/incidents/A90/stonehaven/` | les **incidents** à cet endroit (une **collection**) |
| `/incidents/A90/stonehaven/north/1` | **un** incident sur la voie nord |

La hiérarchie est un **choix de domaine**, pas une structure de base de
données ; l'URI ne révèle pas le stockage.

## 11. Un échange HTTP

```diagram
{
  "title": "GET sur la collection de Stonehaven : 200 OK avec deux représentations d'incidents en JSON (Fig. 6.15).",
  "nodes": [
    { "id": "rq", "x": 170, "y": 70, "w": 300, "h": 90, "shape": "note", "tone": "sky", "size": 12, "label": "GET /incidents/A90/stonehaven/ HTTP/1.1\nHost: trafficinfo.net\nAccept: application/json\n(pas de body)" },
    { "id": "rs", "x": 520, "y": 70, "w": 340, "h": 110, "shape": "note", "tone": "emerald", "size": 12, "label": "HTTP/1.1 200 OK\nContent-Type: application/json\n[ {\"id\":\"A90N…391\",\"severity\":\"significant\"},\n  {\"id\":\"A90S…001\",\"severity\":\"minor\"} ]" }
  ],
  "edges": [ { "from": "rq", "to": "rs", "label": "réponse" } ]
}
```

| Élément | Sens |
|---|---|
| **GET** | demande une **représentation** de la ressource cible |
| path | identifie la ressource **dans l'hôte** |
| **Accept** | les **media types** que le client comprend |
| body d'un GET | **pas de sémantique** définie → les critères vont dans l'**URI** |
| **200 OK** | succès ; la **méthode** donne le sens du contenu |
| **Content-Type** | le **media type** du contenu |
| **Content-Length** | taille du contenu en **octets** (si envoyé) |

## 12. Méthodes HTTP

| Méthode | Sens standard | Service d'incidents |
|---|---|---|
| **GET** | **récupérer** une représentation | lire un incident ou une collection |
| **POST** | demander à la cible de **traiter** le contenu fourni | **ajouter** un incident via la **collection** |
| **PUT** | **créer ou remplacer** l'état à la cible | stocker l'état **complet** à une URI connue |
| **DELETE** | **supprimer l'association** à l'URI | rendre l'incident **indisponible** à cette URI |

> PUT **peut créer** une ressource ; DELETE **n'efface pas forcément** toutes
> les copies ; le **status code** dit le vrai résultat.

### Safe et idempotent

- **Safe** : le client ne demande **aucun changement d'état**.
- **Idempotent** : **N requêtes identiques** ont le **même effet voulu**
  qu'**une seule**.

| Méthode | Safe ? | Idempotent ? | Retry |
|---|---|---|---|
| **GET** | ✅ | ✅ | peut récupérer des données plus récentes |
| **PUT** | ❌ | ✅ | renvoie le **même état voulu** |
| **DELETE** | ❌ | ✅ | la **réponse** peut différer après suppression (ex. 404) |
| **POST** | ❌ | **non garanti** | risque de **traitement en double** |

> **Piège :** l'idempotence porte sur les **effets**, **pas** sur des réponses
> identiques. Un GET « safe » peut quand même générer des **logs**.

### POST vs PUT pour créer

```diagram
{
  "title": "POST : le serveur choisit l'URI. PUT : le client choisit l'URI et fournit l'état complet.",
  "nodes": [
    { "id": "p", "x": 170, "y": 80, "w": 300, "h": 120, "shape": "note", "tone": "amber", "size": 12, "label": "POST /incidents/\n— la collection traite la description\n— le SERVEUR attribue l'URI\n— 201 Created + Location\n— répéter peut créer un DOUBLON" },
    { "id": "u", "x": 520, "y": 80, "w": 300, "h": 120, "shape": "note", "tone": "violet", "size": 12, "label": "PUT /incidents/…/north/1\n— le CLIENT donne l'état à la cible\n— création : 201\n— remplacement : 200 ou 204\n— idempotent (remplacement complet)" }
  ],
  "edges": []
}
```

Une **mise à jour partielle** demande une sémantique définie à part (PUT =
remplacement complet).

## 13. JSON

JSON encode **objects, arrays, strings, numbers, booleans, null** ; les **noms
de membres et les strings** sont entre **guillemets doubles**.

```json
{
  "id": "A90N17061714391",
  "road_id": "A90",
  "place": "Stonehaven",
  "direction": "north",
  "severity": "significant"
}
```

La **syntaxe** permet au parser de lire ; le **contrat** donne le **sens** :
champ **requis** ? valeurs **valides** ? que signifie un champ **absent** ? Un
JSON **syntaxiquement valide** peut **violer le contrat**.

## 14. Résultats vides et erreurs

| Situation | Réponse | Interprétation |
|---|---|---|
| Collection **vide** | **200** avec `[]` | requête réussie, **zéro** élément |
| Pas de contenu | **204** No Content | succès **sans contenu** à parser |
| Requête **invalide** | **400** Bad Request | corriger la requête |
| Cible **absente** | **404** Not Found | introuvable (ou existence non révélée) |
| **Panne serveur** | **500** Internal Server Error | échec inattendu |

> Le livre renvoie **204** quand il n'y a aucun incident ; **200 + `[]`** est
> un **autre** contrat valide. Avec 204, **pas de JSON** à parser.

## 15. Stabilité et compatibilité de l'interface

| Changement | Effet sur les appelants |
|---|---|
| Remplacer un **algorithme interne** à comportement égal | **aucun** : l'interface reste |
| **Renommer** un champ, changer son **type** ou son **sens** | les appelants doivent être **modifiés** (**breaking**) |
| **Ajouter** un champ **optionnel** | OK si les clients **tolèrent** les champs nouveaux |
| Passer le résultat vide de **200 `[]`** à **204** | les clients qui parsent toujours du JSON **plantent** |

Garder les **mêmes URL** ne suffit pas à préserver la compatibilité si les
**données** ou le **comportement** changent.

## 16. Synthèse

| Concept | Question centrale |
|---|---|
| **Service boundary** | quelles fonctions et données partagent **une responsabilité** ? |
| **API contract** | que peut demander l'appelant ? que **signifient** les résultats ? |
| **HTTP semantics** | que signifient **méthodes**, **status codes**, **metadata** ? |
| **REST constraints** | comment les règles d'interaction permettent l'**évolution distribuée** ? |

---

## Pièges d'exam

- HTTP + JSON ≠ REST ; HTTP ≠ microservices.
- REST : **6** contraintes, **code-on-demand optionnel** ; uniform interface :
  **4** sous-contraintes (dont **HATEOAS**).
- **Stateless** : le serveur ne garde pas de **contexte de conversation** —
  mais les **données persistent** en base.
- GET **safe + idempotent** ; PUT, DELETE **idempotents** non safe ; POST
  **ni l'un ni l'autre** garanti.
- **201 Created** (+ `Location`) après une création ; **204** = pas de body.
- 200 `[]` (vide) ≠ 204 ≠ 404.
- Timeout ≠ échec ; **retry** seulement si idempotent.
- Password example : **un** service (cohesion), pas trois (coupling sur les
  données).

## À retenir

- Service = capacité ; API = contrat ; implementation = cachée.
- **High cohesion, low coupling** ; séparer seulement quand ça aide.
- Contrat = **operation, input, result, failure**.
- Resource (concept, URI) vs representation (JSON, XML…).
- Méthodes, safe / idempotent, status codes, compatibilité.
