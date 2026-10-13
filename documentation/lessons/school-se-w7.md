# Software Engineering — Week 7 · Security and Privacy

**Cours** : *Attacks, identity, access, and personal data* (Sommerville 2021,
chapitre 7 ; compléments NIST SP 800-63B-4 et OWASP). La triade **CIA** ;
**threat / vulnerability / attack** ; **trust boundaries** ; les attaques
(**SQL injection**, buffer overflow, **credential theft / session
hijacking**, **XSS**, **DoS / DDoS**) ; **authentication vs authorization** ;
mots de passe (**salt + hash**), **MFA**, **federated identity** (OAuth 2.0 /
OpenID Connect) ; **access policy**, **ACL**, **RBAC**, contexte, **IDOR**,
**least privilege** et **default deny** ; **security vs privacy**, **data
minimization**, privacy policy. Puis le **Team Project Midterm Report**, qui
**remplace l'examen**.

> **En bref.** **Confidentiality** (seuls les autorisés lisent),
> **Integrity** (pas de modification non autorisée), **Availability** (le
> service répond). Une **vulnerability** est une **faiblesse** ; un
> **attack** est une **tentative de l'exploiter** ; un **threat** est ce qui
> **pourrait** causer du tort. **Authentication** = *qui es-tu ?* ;
> **Authorization** = *as-tu le droit de faire **cette** action sur **cette**
> ressource ?* — vérifiée **côté serveur à chaque requête**. **Security** =
> protéger contre l'accès non autorisé ; **privacy** = utiliser les données
> personnelles de façon **appropriée** (but, consentement, minimisation).

---

## 1. Du contrat d'API au résultat sécurisé

```diagram
{
  "title": "La sécurité ajoute une décision d'identité et d'accès entre la requête et le résultat.",
  "nodes": [
    { "id": "a", "x": 90, "y": 50, "w": 150, "h": 56, "label": "Request and\nAPI contract", "tone": "neutral", "filled": true, "size": 12 },
    { "id": "b", "x": 270, "y": 50, "w": 150, "h": 56, "label": "Identity and\naccess decision", "tone": "violet", "filled": true, "size": 12 },
    { "id": "c", "x": 450, "y": 50, "w": 150, "h": 56, "label": "Permitted action\nand limited data", "tone": "sky", "filled": true, "size": 12 },
    { "id": "d", "x": 630, "y": 50, "w": 150, "h": 56, "label": "Observable\nresult", "tone": "emerald", "filled": true, "size": 12 }
  ],
  "edges": [ { "from": "a", "to": "b" }, { "from": "b", "to": "c" }, { "from": "c", "to": "d" } ]
}
```

Trois distinctions centrales : **attack vs vulnerability**, **authentication
vs authorization**, **security vs privacy**.

## 2. Confidentiality, Integrity, Availability (CIA)

| Propriété | Comportement attendu | Menace (livre) |
|---|---|---|
| **Confidentiality** | seules les parties **autorisées** obtiennent l'info protégée | **data theft** : vol de dossiers privés |
| **Integrity** | données et logiciel **résistent aux modifications** non autorisées | **malware** qui endommage programmes ou fichiers |
| **Availability** | les utilisateurs légitimes **accèdent** au service quand il faut | **DDoS** qui empêche l'accès |

- Les **règles d'accès** protègent **confidentiality** et **integrity**.
- **Capacité** et **recovery** protègent l'**availability**.
- Une attaque peut toucher **plusieurs** propriétés.

## 3. Threat, vulnerability, attack

```diagram
{
  "title": "Exemple du livre : une requête qui devait renvoyer UN compte les renvoie TOUS.",
  "nodes": [
    { "id": "t", "x": 110, "y": 70, "w": 180, "h": 80, "label": "THREAT\nce qui POURRAIT nuire\n« unauthorized\ndisclosure »", "tone": "amber", "filled": true, "size": 12 },
    { "id": "v", "x": 330, "y": 70, "w": 180, "h": 80, "label": "VULNERABILITY\nla FAIBLESSE\n« l'input devient\ndu code SQL »", "tone": "rose", "filled": true, "size": 12 },
    { "id": "a", "x": 550, "y": 70, "w": 180, "h": 80, "label": "ATTACK\nla TENTATIVE d'exploiter\n« un input forgé change\nla condition »", "tone": "violet", "filled": true, "size": 12 }
  ],
  "edges": [ { "from": "t", "to": "v" }, { "from": "v", "to": "a" } ]
}
```

- **Threat** : circonstance ou événement **pouvant** causer un tort.
- **Vulnerability** : **faiblesse** qui peut permettre ce tort (ici :
  construction de requête **non sûre**).
- **Attack** : **tentative d'exploiter** la faiblesse (ici : l'input
  malveillant).
- **Risk** = **probabilité** du tort × ses **conséquences**.

## 4. Couches et trust boundary

```diagram
{
  "title": "La ligne pointillée = trust boundary : tout ce qui vient du client est moins fiable et doit être vérifié par le serveur.",
  "groups": [
    { "x": 500, "y": 70, "w": 430, "h": 110, "label": "côté serveur (trusted)", "tone": "emerald" }
  ],
  "nodes": [
    { "id": "c", "x": 110, "y": 70, "w": 170, "h": 56, "label": "Client input\nand user actions", "tone": "rose", "filled": true, "size": 12 },
    { "id": "a", "x": 400, "y": 70, "w": 180, "h": 56, "label": "Application checks\nand access policy", "tone": "violet", "filled": true, "size": 12 },
    { "id": "i", "x": 610, "y": 70, "w": 180, "h": 56, "label": "Libraries, database,\nOS, network", "tone": "sky", "filled": true, "size": 12 }
  ],
  "edges": [ { "from": "c", "to": "a", "label": "trust boundary", "dashed": true, "tone": "rose" }, { "from": "a", "to": "i" } ]
}
```

- Les contrôles applicatifs **reposent sur l'infrastructure** (librairies à
  jour, systèmes configurés, pratiques opérationnelles).
- Le **navigateur peut afficher** des contrôles d'accès ; c'est le **serveur
  qui les applique**.

## 5. Les attaques

### Injection

Une **injection** a lieu quand un **interpréteur** traite un **input non fiable
comme des instructions**.

| Frontière | Mécanisme | Défense |
|---|---|---|
| application → **base de données** | concaténer l'input dans du **SQL** change la **structure** de la requête | **parameter binding** (prepared statements) |
| input → **buffer mémoire** | une écriture **non vérifiée** écrase la mémoire, peut changer le flot d'exécution (**buffer overflow**) | **bounds checks**, API sûres |

### SQL injection

```sql
SELECT * FROM AccountHolders
WHERE accountnumber = '10010010' OR '1' = '1';
```

```diagram
{
  "title": "L'input « 10010010' OR '1' = '1 » ferme la chaîne et ajoute une condition toujours vraie : TOUS les comptes sont renvoyés.",
  "nodes": [
    { "id": "q", "x": 330, "y": 40, "w": 620, "h": 40, "label": "\"... WHERE accountnumber = '\"  +  input  +  \"'\"", "tone": "neutral", "filled": true, "size": 12 },
    { "id": "bad", "x": 170, "y": 140, "w": 300, "h": 70, "shape": "note", "tone": "rose", "size": 12, "label": "Concaténation (VULNÉRABLE)\nl'input devient du code SQL\n→ OR '1'='1' toujours vrai" },
    { "id": "ok", "x": 500, "y": 140, "w": 300, "h": 70, "shape": "note", "tone": "emerald", "size": 12, "label": "Paramétré (SÛR)\ndb.execute(\"... = ?\", (account_number,))\n→ l'input reste une VALEUR" }
  ],
  "edges": [ { "from": "q", "to": "bad" }, { "from": "q", "to": "ok", "dashed": true } ]
}
```

La **validation de format** reste utile, et le **contrôle d'accès** décide
toujours **quel** compte l'appelant peut lire.

### Credential theft et session hijacking

| Route d'attaque | L'attaquant obtient | Contrôle |
|---|---|---|
| **Phishing** ou **key logging** | les identifiants tapés par l'utilisateur | authentification **résistante**, guidance claire |
| **Vol du session token** | un token d'une session **déjà établie** (**session hijacking**) | **transport protégé**, gestion soigneuse des tokens |
| **Devinettes** répétées | un mot de passe **faible** | **limiter les échecs**, vérification plus forte |

L'**expiration de session** limite la durée de vie d'un token volé.

### Cross-site scripting (XSS)

```diagram
{
  "title": "Stored XSS : le contenu malveillant passe par un commentaire enregistré puis s'exécute dans le navigateur de la victime.",
  "nodes": [
    { "id": "a", "x": 80, "y": 50, "w": 140, "h": 56, "label": "Attacker submits\nmalicious content", "tone": "rose", "filled": true, "size": 12 },
    { "id": "s", "x": 260, "y": 50, "w": 140, "h": 56, "label": "Site stores and\nserves the content", "tone": "amber", "filled": true, "size": 12 },
    { "id": "v", "x": 440, "y": 50, "w": 140, "h": 56, "label": "Victim browser\nexecutes script", "tone": "violet", "filled": true, "size": 12 },
    { "id": "g", "x": 620, "y": 50, "w": 140, "h": 56, "label": "Attacker gains\ndata or actions", "tone": "rose", "filled": true, "size": 12 }
  ],
  "edges": [ { "from": "a", "to": "s" }, { "from": "s", "to": "v" }, { "from": "v", "to": "g" } ]
}
```

Défense : **output encoding** selon le contexte (le texte reste du texte) ; si
la feature **autorise du HTML**, le **sanitizer** doit le restreindre.

### Denial of service

Rendre le service **indisponible** en épuisant des ressources **finies**
(bande passante, CPU, mémoire). Un **DDoS** coordonne **beaucoup de sources** :
bloquer **une** source ne suffit pas. Défenses : **filtrage**, **limites**,
défenses **au niveau du fournisseur** ; plus de **capacité** coûte et ne
garantit rien face à un trafic illimité.

## 6. Authentication et authorization

| **Authentication** | **Authorization** |
|---|---|
| vérifie un mot de passe, un authenticator ou une **identity assertion** | évalue la **policy** pour **subject, action, resource, context** |
| **reconnaît** un compte | détermine ses **droits** |
| établit un **contexte d'identité** | **autorise cette requête précise** |
| *Qui es-tu ?* | *As-tu le droit ?* |

> Exemple du **dossier partagé** : le propriétaire autorise la **lecture**
> mais pas la **modification** → une identité **connue** peut quand même
> recevoir un **refus**.

### Vérification des mots de passe

```diagram
{
  "title": "On ne stocke JAMAIS le mot de passe : on stocke un verifier = hash(password + salt) avec un work factor.",
  "nodes": [
    { "id": "a", "x": 110, "y": 50, "w": 180, "h": 56, "label": "Submitted password\n+ stored salt", "tone": "sky", "filled": true, "size": 12 },
    { "id": "b", "x": 340, "y": 50, "w": 180, "h": 56, "label": "Password hashing\nwith a work factor", "tone": "violet", "filled": true, "size": 12 },
    { "id": "c", "x": 570, "y": 50, "w": 180, "h": 56, "label": "Compare with\nstored verifier", "tone": "emerald", "filled": true, "size": 12 }
  ],
  "edges": [ { "from": "a", "to": "b" }, { "from": "b", "to": "c" } ]
}
```

- **Salt unique** : deux mots de passe identiques n'ont **pas le même hash**.
- **Work factor** : rend chaque essai **coûteux** pour l'attaquant.
- **NIST** actuel : **blocklist** des mots de passe compromis, **rate
  limits**, et **rejet des règles obligatoires de mélange de caractères**.

### Multi-factor authentication (MFA)

Facteurs : ce que l'utilisateur **sait** (password), **possède** (téléphone,
clé), **est** (biométrie). **MFA = types de facteurs différents** : **deux
mots de passe = un seul type**, ce n'est pas du MFA.

| Mécanisme | Protection et limite |
|---|---|
| Password + **one-time code** | facteurs distincts ; un imposteur peut **relayer** le code (phishing) |
| **Cryptographic authenticator** | lie la preuve au **vrai service** → **phishing-resistant** si le protocole le permet |
| **Biometric activation** | **déverrouille** un authenticator de l'appareil |

### Federated identity

```diagram
{
  "title": "Federation : un identity provider de confiance vérifie l'identité ; l'application garde SA propre policy d'accès.",
  "nodes": [
    { "id": "u", "x": 100, "y": 50, "w": 160, "h": 56, "label": "User\nauthenticates", "tone": "sky", "filled": true, "size": 12 },
    { "id": "p", "x": 330, "y": 50, "w": 180, "h": 56, "label": "Identity provider\nissues an assertion", "tone": "violet", "filled": true, "size": 12 },
    { "id": "a", "x": 570, "y": 50, "w": 190, "h": 56, "label": "Application validates\nand establishes identity", "tone": "emerald", "filled": true, "size": 12 }
  ],
  "edges": [ { "from": "u", "to": "p" }, { "from": "p", "to": "a" } ]
}
```

- **OAuth 2.0** = **delegated authorization** (accès à des ressources
  protégées).
- **OpenID Connect** = ajoute une **couche d'identité** (l'**ID Token**).
- Un **access token seul** ne définit **pas** un protocole de **login** (le
  livre mélange ; les slides corrigent).

## 7. Access policy

| Élément | Sens | Exemple université |
|---|---|---|
| **Subject** | l'utilisateur ou le processus demandeur | un étudiant, un enseignant |
| **Action** | l'opération demandée | read, create, edit, delete |
| **Resource** | l'objet protégé | le dossier d'un étudiant |
| **Context** | une condition pertinente | **son propre** dossier, **même département** |

### Access control list (ACL)

Une **ACL** relie une **ressource** à des utilisateurs/**groupes** et leurs
**permissions** (les groupes évitent les répétitions).

| Ressource | Utilisateur / groupe | Permission |
|---|---|---|
| A : document public | Everyone | Read |
| | Institutional staff | Create and edit |
| | System administrators | Delete |
| B : programme exécutable | Everyone | Execute |
| | System administrators | Create and delete |

### Role-based access control (RBAC)

Les permissions sont données à des **rôles**, et les utilisateurs sont reliés
aux rôles.

| Rôle | Opération permise | Portée |
|---|---|---|
| **Doctor** | **read and modify** | dossiers médicaux du système |
| **Nurse** | **read and add** new information | dossiers médicaux du système |
| **Patient** | **read and request a correction** | **son propre** dossier |

> Nuances : **modifier** ≠ **ajouter** ; **demander une correction** ≠
> **éditer** directement.

### Contexte et restrictions de ressource (dossiers étudiants)

| Groupe | Actions | Condition sur la ressource |
|---|---|---|
| Administrative staff | create, read, edit | tous les dossiers |
| Teaching staff | read, edit | étudiant de **son département** |
| Student | read | **son propre** dossier |

**Aucun groupe ne peut supprimer** (politique de rétention). Être étudiant
**ne suffit pas** pour lire le dossier d'un autre.

### Appliquer la policy à chaque requête

```flowchart
{
  "title": "Le serveur décide AVANT de renvoyer des données ou d'agir, à chaque requête.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "Request" },
    { "id": "i", "kind": "process", "label": "Identity context (trusted)" },
    { "id": "r", "kind": "process", "label": "Resolve resource and action" },
    { "id": "d", "kind": "decision", "label": "Policy + conditions\nhold ?" },
    { "id": "ok", "kind": "io", "label": "Allow permitted operation" },
    { "id": "no", "kind": "io", "label": "Deny without protected data" },
    { "id": "e", "kind": "end", "label": "Response" }
  ],
  "edges": [
    { "from": "s", "to": "i" }, { "from": "i", "to": "r" }, { "from": "r", "to": "d" },
    { "from": "d", "to": "ok", "branch": "yes" }, { "from": "d", "to": "no", "branch": "no" },
    { "from": "ok", "to": "e" }, { "from": "no", "to": "e" }
  ]
}
```

Un **bouton caché** ne protège rien : le même contrôle doit s'appliquer si
l'appelant **change l'URL**, appelle **l'API directement** ou **change
l'identifiant d'objet**.

### IDOR (insecure direct object reference)

Accéder à un objet **en changeant son identifiant** parce que l'application
**oublie le contrôle de permission**. **Connaître un identifiant ≠ avoir la
permission.**

| Contrôle incomplet | Contrôle requis |
|---|---|
| le demandeur a un compte **authentifié** | il peut faire **cette action** sur **cet objet précis** |
| l'identifiant a le **bon format** | l'objet respecte la condition de **propriété / relation** |
| l'identifiant est **difficile à deviner** | le serveur évalue **quand même** la permission |

### Least privilege et default deny

- **Least privilege** : n'accorder **que** l'accès nécessaire (un lecteur lit
  sans pouvoir écraser).
- **Default deny** : **refuser** sauf permission valide (policy manquante ou
  condition échouée → **refus**).
- **Révocation** : change les décisions **futures**.

## 8. Security vs privacy

| **Security failure** | **Privacy failure** |
|---|---|
| un **attaquant externe** obtient des dossiers médicaux **sans permission** | un prestataire utilise les infos médicales pour envoyer du **marketing** non désiré (maisons de retraite) |
| la **frontière d'accès** échoue | l'**usage** contredit les **attentes** de la personne et le **but de la collecte** |

Un système peut **respecter ses règles d'accès** et pourtant **violer la vie
privée**.

### Data minimization

Collecter **seulement** ce qui est nécessaire à un **but déclaré**.

| Données utiles au service (learning environment) | Données hors besoin |
|---|---|
| identité de l'apprenant, participation | **origine ethnique**, situation familiale |
| services et modules utilisés | **autres logiciels** utilisés |
| résultats aux évaluations | détails personnels **sans but produit** |

> « Ça pourrait servir plus tard » **ne justifie pas** la collecte. Collecter
> crée des responsabilités de **stockage**, d'**accès** et de **rétention**.

### Privacy policy et cycle de vie

| Préoccupation | Comportement du produit |
|---|---|
| **Collection and purpose** | expliquer les données requises et **pourquoi** |
| **Storage and access** | protéger et appliquer les **droits** de chacun |
| **Discovery and correction** | permettre de **voir** ses données et de **corriger** |
| **Retention and deletion** | définir la **durée de vie** et implémenter sa **fin** |

**Sharing** : l'utilisateur doit comprendre **l'audience** et trouver
facilement les réglages (un **privacy dashboard**) ; le service applique la
visibilité choisie **partout** (écrans, réponses API, ressources partagées).

### Exemple complet : un étudiant lit un dossier

```flowchart
{
  "title": "Student S demande un dossier : la même identité est refusée si le dossier appartient à un autre étudiant.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "Trusted identity : Student S" },
    { "id": "d", "kind": "decision", "label": "Le dossier\nappartient à S ?" },
    { "id": "ok", "kind": "io", "label": "Return permitted record data\n(champs limités au but)" },
    { "id": "no", "kind": "io", "label": "Deny" },
    { "id": "e", "kind": "end", "label": "END" }
  ],
  "edges": [
    { "from": "s", "to": "d" },
    { "from": "d", "to": "ok", "branch": "yes" }, { "from": "d", "to": "no", "branch": "no" },
    { "from": "ok", "to": "e" }, { "from": "no", "to": "e" }
  ]
}
```

## 9. Synthèse

| Concept | Question |
|---|---|
| **Attack and defense** | quelle faiblesse peut permettre le tort, quel contrôle la traite ? |
| **Authentication** | quelle identité a-t-on des **preuves** de reconnaître ? |
| **Authorization** | **ce sujet** peut-il faire **cette action** sur **cette ressource**, **maintenant** ? |
| **Privacy and minimization** | **pourquoi** ces données personnelles, comment les **utiliser** et les **garder** ? |

---

# Partie 2 — Team Project Midterm Report

Le **midterm exam est remplacé** par un **rapport d'avancement** sur le
service / l'app de l'équipe.

| Élément | Détail |
|---|---|
| **Deadline** | **dimanche de la semaine 8, 2026-10-25, 23:59 KST**, sur **I-Class** |
| **Équipe** | **un** PDF par un représentant, **5–7 pages** de corps (hors couverture, références, annexe) + lien du repo, **commit ou tag** soumis, instructions de lancement (ou ZIP + README) → `TeamID_Midterm.pdf` |
| **Individuel** | PDF séparé de **0.5–1 page** : ton travail, **une décision**, comment tu as **vérifié**, avec liens → `StudentID_Midterm.pdf` |

### Plan du rapport d'équipe

1. **Product and problem** : utilisateur cible, problème, **alternatives
   actuelles**.
2. **Final demo scope** : tâche principale, features essentielles, features
   **exclues** ce semestre.
3. **Requirements** : **deux user stories** cœur, **≥ 2 acceptance criteria
   observables** chacune.
4. **Design** : **un diagramme de structure** + **une décision** (alternative,
   raison, coût).
5. **Current implementation** : une feature cœur qui marche ou un check
   technique exécuté ; marquer **complete / partial / not started** avec
   preuves ; expliquer les **données temporaires** ou réponses simulées.
6. **Security and privacy** : **un risque**, la réponse, ce qui a été
   **vérifié**.
7. **Plan for the final demo** : priorités restantes, **owners**, semaines
   cibles, **risque principal**.

**Evidence appendix** : captures / logs avec la feature ou le critère qu'ils
soutiennent ; **aide IA ou externe** déclarée et vérifiée (`AI_USAGE.md`).

### Barème

| Partie | Critère | Points |
|---|---|---|
| Team | Problem and requirements | 15 |
| Team | Design and rationale | 15 |
| Team | **Prototype and verification evidence** | **20** |
| Team | Security and privacy | 10 |
| Team | Remaining scope and final demo plan | 10 |
| Individual | Understanding of your work and decisions | **20** |
| Individual | Contribution and verification responsibility | 10 |

**Team 70 + individual 30 = 100.** Ce sont les **preuves et les
explications** qui comptent : **ni le nombre de pages, ni de features, ni de
commits** ne rapportent de points.

---

## Pièges d'exam

- CIA : **data theft** → confidentiality ; **malware** → integrity ;
  **DDoS** → availability.
- **Vulnerability** = faiblesse ; **attack** = tentative ; **threat** =
  potentiel de tort.
- SQL injection → **parameter binding** ; XSS → **output encoding** ;
  buffer overflow → **bounds checks**.
- **Session hijacking** = vol du **token**, pas du mot de passe.
- MFA = facteurs de **types différents** (deux passwords ≠ MFA).
- **OAuth 2.0** = autorisation déléguée ; **OpenID Connect** = identité
  (ID Token).
- Authorization côté **serveur**, à **chaque requête** ; un bouton caché ne
  protège rien ; **IDOR** = permission non vérifiée sur l'identifiant.
- **Least privilege** + **default deny**.
- Security ≠ privacy : un usage **marketing** de données médicales légalement
  stockées est un problème de **privacy**.
- Rapport midterm : **70 équipe + 30 individuel** ; 5–7 pages ;
  25/10 23:59.

## À retenir

- CIA ; threat / vulnerability / attack / risk ; trust boundary.
- Injection, credential theft, session hijacking, XSS, DoS.
- AuthN (salt + hash + work factor, MFA, federation) vs AuthZ (subject,
  action, resource, context ; ACL, RBAC, IDOR).
- Privacy : purpose, minimization, policy, retention, sharing controls.
