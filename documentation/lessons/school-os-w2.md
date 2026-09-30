# Operating System — Week 2 · Lab environment & Git

Semaine d'installation : monter une **machine virtuelle Ubuntu** avec VMware
Workstation Player (ou VirtualBox), la configurer, puis apprendre les bases de
**Git** et **GitHub**. Les slides finissent par un rappel des **types de bases
de données**.

> **En bref.** Une VM est un ordinateur **simulé** par un **hyperviseur** :
> ton vrai OS (*host*) fait tourner Ubuntu (*guest*) dans une fenêtre. Git
> enregistre l'historique de ton code en trois étapes : **modifier →
> `git add` (staging) → `git commit`**, puis **`git push`** l'envoie sur
> GitHub.

---

## 1. Pourquoi une machine virtuelle ?

Les labs se font sous **Ubuntu 20.04 LTS** (*Focal Fossa*). Plutôt que
d'installer Linux à la place de ton OS, on le fait tourner dans une **virtual
machine** :

- rien ne casse sur ta vraie machine : la VM est **isolée** ;
- on peut la **suspendre**, la **copier**, la **supprimer** ;
- tout le monde a le **même environnement**.

C'est exactement la **virtualisation** vue au chapitre 1 : un **VMM**
(*virtual machine manager*, ou **hypervisor**) partage le matériel entre l'OS
**host** et un ou plusieurs OS **guests**.

```diagram
{
  "title": "Ta configuration de lab : Ubuntu (guest) tourne dans VMware, qui tourne sur ton OS (host).",
  "nodes": [
    { "id": "apps", "x": 330, "y": 30, "w": 360, "h": 34, "label": "terminal · git · python3 · VS Code", "tone": "sky", "filled": true, "size": 12 },
    { "id": "guest", "x": 330, "y": 80, "w": 360, "h": 36, "label": "guest OS : Ubuntu 20.04 LTS", "tone": "emerald", "filled": true },
    { "id": "vhw", "x": 330, "y": 128, "w": 400, "h": 36, "label": "matériel virtuel : 2 vCPU · 4 GB RAM · disque 25 GB", "tone": "neutral", "size": 12 },
    { "id": "vmm", "x": 330, "y": 185, "w": 420, "h": 36, "label": "hypervisor (VMM) : VMware Workstation Player / VirtualBox", "tone": "amber", "filled": true, "size": 12 },
    { "id": "host", "x": 330, "y": 235, "w": 520, "h": 36, "label": "host OS : Windows / macOS / Linux", "tone": "sky", "size": 12 },
    { "id": "hw", "x": 330, "y": 285, "w": 580, "h": 36, "label": "vrai matériel : CPU · RAM · SSD", "tone": "violet", "filled": true }
  ],
  "edges": [
    { "from": "apps", "to": "guest", "arrow": "none" },
    { "from": "guest", "to": "vhw", "arrow": "none" },
    { "from": "vhw", "to": "vmm", "arrow": "none" },
    { "from": "vmm", "to": "host", "arrow": "none" },
    { "from": "host", "to": "hw", "arrow": "none" }
  ]
}
```

| Terme | Sens |
|---|---|
| **Host** | l'OS réel de ta machine, celui sur lequel tourne l'hyperviseur |
| **Guest** | l'OS installé **dans** la VM (ici Ubuntu) |
| **Hypervisor / VMM** | le logiciel qui crée et fait tourner les VM |
| **ISO** | l'image du disque d'installation d'Ubuntu, téléchargée sur ubuntu.com |
| **Snapshot** | une photo de l'état de la VM, pour revenir en arrière |

> **À savoir :** VMware Workstation Player et VirtualBox tournent **au-dessus
> d'un OS hôte**. VMware ESX ou Xen tournent **directement sur le matériel**
> (vus au chapitre 1).

## 2. Installer et configurer la VM

Les étapes des slides :

1. télécharger l'**ISO Ubuntu 20.04 LTS** (*Download Ubuntu Desktop*) ;
2. installer **VMware Workstation Player** : accepter la licence (EULA),
   choisir le dossier, décocher éventuellement le *Customer Experience
   Improvement Program*, créer les raccourcis, **Install**, **Finish** ;
3. **Create a New Virtual Machine** → choisir l'ISO (*Installer disc image
   file*) → *Easy Install* : nom complet, **user name** et **password** ;
4. nommer la VM et choisir son emplacement ;
5. **Specify Disk Capacity** : taille du disque virtuel (20 GB recommandés au
   minimum), en un seul fichier ou découpé en plusieurs ;
6. **Customize Hardware** : mémoire, processeurs ;
7. démarrer : Ubuntu s'installe tout seul, puis on arrive au bureau.

| Ressource | Valeur typique pour le lab | Pourquoi |
|---|---|---|
| **Memory (RAM)** | 4 096 MB | Ubuntu Desktop est à l'étroit sous 2 GB |
| **Processors** | 2 | de quoi faire tourner des processus en parallèle |
| **Hard disk** | 20–25 GB | système + outils + projets |
| **Network** | NAT | la VM accède à Internet via le host |

> La VM ne peut **jamais** avoir plus de ressources que ta vraie machine : les
> vCPU et la RAM qu'on lui donne sont **pris** au host pendant qu'elle tourne.

### Les dépôts logiciels d'Ubuntu

Dans **Software & Updates**, Ubuntu tire ses paquets de quatre dépôts. Les
quatre doivent être cochés pour le lab :

| Dépôt | Contenu |
|---|---|
| **main** | logiciels libres **supportés officiellement** par Canonical |
| **universe** | logiciels libres **maintenus par la communauté** |
| **restricted** | pilotes **propriétaires** (ex. certains pilotes graphiques) |
| **multiverse** | logiciels **non libres** ou soumis à des restrictions légales |

### Les outils installés

```bash
sudo apt update                 # mettre à jour la liste des paquets
sudo apt install git python3    # installer git et python3
git --version                   # vérifier
python3 --version
code --version                  # VS Code (installé via le .deb ou snap)
nano fichier.txt                # éditeur en terminal, déjà présent
```

`sudo` exécute une commande **en tant que root** (l'administrateur).
`apt` est le **gestionnaire de paquets** d'Ubuntu (détaillé en Week 4).

## 3. Git : le principe

**Git** est un **système de gestion de versions distribué** (*distributed
version control system*) : il garde tout l'historique d'un projet, et chaque
développeur en a une copie complète. **GitHub** est un **service en ligne** qui
héberge des dépôts Git (*remote repositories*).

> **Piège :** Git ≠ GitHub. Git est l'**outil** (installé localement), GitHub
> est un **site** qui héberge des dépôts Git.

Un fichier passe par quatre endroits :

```diagram
{
  "title": "Les zones de Git : un changement passe du working directory au staging, puis au dépôt local, puis au dépôt distant.",
  "nodes": [
    { "id": "wd", "x": 80, "y": 60, "w": 130, "h": 50, "label": "working\ndirectory", "tone": "sky", "filled": true, "size": 12 },
    { "id": "st", "x": 290, "y": 60, "w": 130, "h": 50, "label": "staging area\n(index)", "tone": "amber", "filled": true, "size": 12 },
    { "id": "lr", "x": 500, "y": 60, "w": 130, "h": 50, "label": "local\nrepository", "tone": "emerald", "filled": true, "size": 12 },
    { "id": "rr", "x": 710, "y": 60, "w": 140, "h": 50, "label": "remote repository\n(GitHub)", "tone": "violet", "filled": true, "size": 12 }
  ],
  "edges": [
    { "from": "wd", "to": "st", "label": "git add" },
    { "from": "st", "to": "lr", "label": "git commit" },
    { "from": "lr", "to": "rr", "label": "git push" },
    { "from": "rr", "to": "wd", "label": "git pull (= fetch + merge) · git clone", "via": [[710, 140], [80, 140]] }
  ]
}
```

| Zone | Ce que c'est |
|---|---|
| **Working directory** | tes fichiers tels que tu les modifies |
| **Staging area** (index) | les changements **sélectionnés** pour le prochain commit |
| **Local repository** | l'historique des commits, dans le dossier caché `.git` |
| **Remote repository** | une copie du dépôt sur un serveur (GitHub) |

## 4. Les commandes Git du cours

**Démarrer et enregistrer**

| Commande | Effet |
|---|---|
| `git init` | crée un **nouveau dépôt local** (le dossier `.git`) |
| `git clone <url>` | **copie** un dépôt existant (distant) sur ta machine |
| `git status` | liste les fichiers **nouveaux ou modifiés, pas encore commités** |
| `git diff` | montre les **changements** ligne par ligne (et les conflits) |
| `git add <file>` / `git add .` | met un fichier / tout le dossier dans le **staging** |
| `git reset <file>` | **retire** un fichier du staging, **en gardant** ses modifications |
| `git commit -m "message"` | enregistre un **snapshot** du staging dans l'historique |
| `git log` | affiche l'**historique** des commits de la branche |

**Branches**

| Commande | Effet |
|---|---|
| `git branch` | **liste** les branches |
| `git checkout <branch>` | **bascule** sur une autre branche |
| `git checkout -b <branch>` | **crée** une branche et bascule dessus |
| `git merge <branch>` | **fusionne** l'historique de la branche dans la branche courante |

**Synchroniser avec GitHub**

| Commande | Effet |
|---|---|
| `git remote add origin <url>` | crée une connexion nommée **origin** vers un dépôt distant |
| `git fetch` | **récupère** les changements du distant **sans fusionner** |
| `git pull` | récupère **et fusionne** (*fetch + merge*) |
| `git push origin <branch>` | **envoie** tes commits locaux vers le distant |

> **Piège :** `git fetch` ne touche **pas** à tes fichiers ; `git pull`, si
> (il fusionne). Et `git commit` n'envoie **rien** sur GitHub : il faut
> `git push`.

### Le scénario complet du lab

```bash
git config --global user.name  "Prénom Nom"   # identité (une seule fois)
git config --global user.email "moi@example.com"

mkdir os-lab && cd os-lab
git init                                     # 1. nouveau dépôt
echo "# OS lab" > README.md
git add .                                    # 2. staging
git commit -m "ver1"                         # 3. commit
git remote add origin https://github.com/<user>/os-lab.git
git push -u origin main                      # 4. envoi sur GitHub
```

Pour s'authentifier en HTTPS, GitHub n'accepte plus le mot de passe du compte :
il faut un **personal access token** (ou une clé **SSH**).

## 5. Bonus des slides : les types de bases de données

| Type | Famille | Idée | Exemple |
|---|---|---|---|
| **Relational** | SQL | tables, lignes, colonnes, relations | PostgreSQL, MySQL |
| **Analytical (OLAP)** | SQL | analyses sur de gros volumes, stockage en colonnes | data warehouses |
| **Key-Value** | NoSQL | une clé → une valeur | Redis |
| **Column-Family** | NoSQL | lignes avec des familles de colonnes variables | Cassandra |
| **Graph** | NoSQL | nœuds et arêtes (relations) | Neo4j |
| **Document** | NoSQL | documents JSON imbriqués | MongoDB |

---

## À retenir

- **Host** = ton OS réel ; **guest** = l'OS dans la VM ; l'**hypervisor / VMM**
  fait le lien. Lab : Ubuntu 20.04 LTS, 2 CPU, 4 GB RAM, ~25 GB de disque.
- Dépôts Ubuntu : **main** (officiel libre), **universe** (communauté),
  **restricted** (pilotes propriétaires), **multiverse** (non libre).
- `sudo` = en root ; `apt update` rafraîchit la **liste**, `apt install`
  installe.
- Git : **working directory → `add` → staging → `commit` → local repo →
  `push` → remote**. `pull` = `fetch` + `merge`.
- `init` crée, `clone` copie, `status` liste les changements, `log`
  l'historique, `branch` / `checkout` / `merge` pour les branches.

## Pièges classiques du quiz

| Affirmation | Vrai / Faux |
|---|---|
| Git et GitHub sont la même chose | **Faux** |
| `git commit` envoie les changements sur GitHub | **Faux** : c'est `git push` |
| `git fetch` fusionne automatiquement | **Faux** : c'est `git pull` |
| `git clone` crée un dépôt vide | **Faux** : c'est `git init` |
| `git reset <file>` supprime les modifications du fichier | **Faux** : il le retire seulement du staging |
| Le guest OS est celui qui tourne dans la VM | **Vrai** |
| Le dépôt *universe* contient les logiciels maintenus par la communauté | **Vrai** |
