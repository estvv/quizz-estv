# Operating System — Week 4 · Processes & Linux administration

**Cours** : chapitre 3 du Silberschatz, *Processes* : le concept de
processus, ses états, le **PCB**, l'ordonnancement et le **context switch**, la
création (`fork` / `exec` / `wait`) et la terminaison (zombie, orphelin), la
communication entre processus (**IPC** : shared memory, message passing,
pipes, sockets, RPC).
**Lab** (manuel *OS Lab*) : utilisateurs et permissions, **APT**, **signaux**,
jobs en arrière-plan, **cron**, **systemd**, surveillance du système.

> **En bref.** Un **processus** = un programme **en cours d'exécution**, avec sa
> mémoire (text, data, heap, stack) et son état (new, ready, running, waiting,
> terminated), le tout décrit dans un **PCB**. Sous Linux, un processus en crée
> un autre avec **`fork()`**, le remplace par un autre programme avec
> **`exec()`**, et attend sa fin avec **`wait()`**. Deux processus
> communiquent soit en **partageant de la mémoire**, soit en **s'envoyant des
> messages**.

---

# Partie 1 — Cours

## 1. Qu'est-ce qu'un processus ?

Un **process** est un **programme en exécution**. Son exécution progresse de
façon **séquentielle** : pas d'exécution parallèle des instructions d'un même
processus (un seul thread pour l'instant).

| **Program** | **Process** |
|---|---|
| entité **passive** : un fichier exécutable sur le disque | entité **active** : chargée en mémoire, en train de s'exécuter |
| un seul fichier `firefox` | peut donner **plusieurs** processus (plusieurs utilisateurs, plusieurs fenêtres) |

Un programme devient un processus quand son exécutable est **chargé en
mémoire** (clic dans la GUI, nom tapé dans le terminal…).

### Le processus en mémoire

```diagram
{
  "title": "Organisation mémoire d'un processus : la pile descend, le tas monte.",
  "nodes": [
    { "id": "max", "x": 120, "y": 30, "shape": "text", "label": "max", "size": 11 },
    { "id": "zero", "x": 120, "y": 290, "shape": "text", "label": "0", "size": 11 },
    { "id": "stack", "x": 300, "y": 40, "w": 220, "h": 40, "label": "stack", "tone": "rose", "filled": true },
    { "id": "free", "x": 300, "y": 110, "w": 220, "h": 60, "label": "(espace libre)", "tone": "neutral", "size": 11, "dashed": true },
    { "id": "heap", "x": 300, "y": 180, "w": 220, "h": 40, "label": "heap", "tone": "amber", "filled": true },
    { "id": "data", "x": 300, "y": 230, "w": 220, "h": 40, "label": "data", "tone": "emerald", "filled": true },
    { "id": "text", "x": 300, "y": 280, "w": 220, "h": 40, "label": "text", "tone": "sky", "filled": true },
    { "id": "n1", "x": 560, "y": 40, "shape": "text", "label": "paramètres de fonctions,\nadresses de retour, variables locales", "size": 11 },
    { "id": "n3", "x": 560, "y": 180, "shape": "text", "label": "mémoire allouée à l'exécution\n(malloc, new)", "size": 11 },
    { "id": "n4", "x": 560, "y": 230, "shape": "text", "label": "variables globales", "size": 11 },
    { "id": "n5", "x": 560, "y": 280, "shape": "text", "label": "le code du programme", "size": 11 },
    { "id": "a1", "x": 300, "y": 85, "shape": "text" },
    { "id": "a2", "x": 300, "y": 140, "shape": "text" }
  ],
  "edges": [
    { "from": "stack", "to": "a1", "label": "grandit ↓" },
    { "from": "heap", "to": "a2", "label": "grandit ↑" }
  ]
}
```

| Section | Contenu |
|---|---|
| **Text section** | le **code** du programme |
| **Data section** | les **variables globales** |
| **Heap** | la mémoire **allouée dynamiquement** pendant l'exécution |
| **Stack** | données temporaires : **paramètres de fonctions, adresses de retour, variables locales** |
| + l'activité courante | le **program counter** et les **registres** du processeur |

> **Piège :** une variable **locale** va sur la **stack**, un `malloc` sur le
> **heap**, une variable **globale** dans **data**.

## 2. Les états d'un processus

| État | Signification |
|---|---|
| **New** | le processus est **en cours de création** |
| **Ready** | il **attend qu'on lui donne un processeur** |
| **Running** | ses instructions **sont en train d'être exécutées** |
| **Waiting** | il **attend un événement** (fin d'une E/S, un signal) |
| **Terminated** | il a **fini** son exécution |

```diagram
{
  "title": "Diagramme d'états d'un processus.",
  "nodes": [
    { "id": "new", "x": 70, "y": 40, "w": 100, "h": 40, "shape": "ellipse", "label": "new", "tone": "neutral", "filled": true },
    { "id": "ready", "x": 200, "y": 150, "w": 110, "h": 44, "shape": "ellipse", "label": "ready", "tone": "sky", "filled": true },
    { "id": "running", "x": 480, "y": 150, "w": 120, "h": 44, "shape": "ellipse", "label": "running", "tone": "emerald", "filled": true },
    { "id": "waiting", "x": 340, "y": 300, "w": 120, "h": 44, "shape": "ellipse", "label": "waiting", "tone": "amber", "filled": true },
    { "id": "term", "x": 610, "y": 40, "w": 120, "h": 40, "shape": "ellipse", "label": "terminated", "tone": "rose", "filled": true }
  ],
  "edges": [
    { "from": "new", "to": "ready", "label": "admitted" },
    { "from": "ready", "to": "running", "label": "scheduler dispatch", "via": [[340, 110]] },
    { "from": "running", "to": "ready", "label": "interrupt", "via": [[340, 190]] },
    { "from": "running", "to": "waiting", "label": "I/O or event wait", "via": [[480, 300]] },
    { "from": "waiting", "to": "ready", "label": "I/O or event completion", "via": [[200, 300]] },
    { "from": "running", "to": "term", "label": "exit" }
  ]
}
```

Les transitions à connaître :

- **ready → running** : l'ordonnanceur le choisit (*scheduler dispatch*) ;
- **running → ready** : **interruption** (fin du quantum de temps) ;
- **running → waiting** : il demande une **E/S** ou attend un événement ;
- **waiting → ready** : l'E/S est **terminée**. Attention : il retourne en
  **ready**, **pas directement en running** ;
- **running → terminated** : `exit`.

> **Piège :** un processus en **waiting** ne passe **jamais directement en
> running** : il repasse d'abord par **ready**.

## 3. Le PCB (Process Control Block)

Chaque processus est décrit par un **PCB** (aussi appelé **task control
block**) :

| Champ du PCB | Contenu |
|---|---|
| **Process state** | running, waiting… |
| **Program counter** | l'adresse de la **prochaine instruction** à exécuter |
| **CPU registers** | le contenu de tous les registres du processus |
| **CPU-scheduling information** | priorités, pointeurs vers les files d'attente |
| **Memory-management information** | la mémoire allouée au processus |
| **Accounting information** | temps CPU utilisé, temps écoulé, limites |
| **I/O status information** | périphériques alloués, **liste des fichiers ouverts** |

Sous Linux, le PCB est la structure C **`task_struct`** : `pid`, `state`,
`time_slice`, pointeur vers le `parent`, liste des `children`, fichiers ouverts
(`files`), espace d'adressage (`mm`).

Un processus peut avoir **plusieurs threads** : il faut alors **plusieurs
program counters** dans le PCB (chapitre 4).

## 4. L'ordonnancement et le context switch

Le **process scheduler** choisit parmi les processus disponibles le prochain à
exécuter sur un cœur. Objectif : **maximiser l'utilisation du CPU** et changer
de processus rapidement.

| File | Contenu |
|---|---|
| **Ready queue** | les processus **en mémoire, prêts**, qui attendent le CPU |
| **Wait queues** | les processus qui **attendent un événement** (une E/S) |

Les processus **migrent** d'une file à l'autre au fil de leur vie.

```diagram
{
  "title": "Files d'attente : un processus tourne sur le CPU, puis retourne dans la ready queue ou part dans une wait queue.",
  "nodes": [
    { "id": "rq", "x": 170, "y": 60, "w": 220, "h": 40, "label": "ready queue", "tone": "sky", "filled": true },
    { "id": "cpu", "x": 440, "y": 60, "w": 100, "h": 40, "shape": "ellipse", "label": "CPU", "tone": "emerald", "filled": true },
    { "id": "io", "x": 170, "y": 150, "w": 220, "h": 36, "label": "I/O wait queue ← I/O request", "tone": "amber", "size": 12 },
    { "id": "ts", "x": 170, "y": 200, "w": 220, "h": 36, "label": "time slice expired", "tone": "neutral", "size": 12 },
    { "id": "ch", "x": 170, "y": 250, "w": 220, "h": 36, "label": "child termination wait queue", "tone": "amber", "size": 12 },
    { "id": "it", "x": 170, "y": 300, "w": 220, "h": 36, "label": "interrupt wait queue", "tone": "amber", "size": 12 },
    { "id": "back", "x": 30, "y": 60, "shape": "text" },
    { "id": "out", "x": 560, "y": 60, "shape": "text", "label": "exit", "size": 11 }
  ],
  "edges": [
    { "from": "rq", "to": "cpu" },
    { "from": "cpu", "to": "out" },
    { "from": "cpu", "to": "io", "via": [[440, 150]], "dashed": true },
    { "from": "cpu", "to": "ts", "via": [[440, 200]], "dashed": true },
    { "from": "cpu", "to": "ch", "via": [[440, 250]], "dashed": true },
    { "from": "cpu", "to": "it", "via": [[440, 300]], "dashed": true },
    { "from": "io", "to": "back", "via": [[30, 150]] },
    { "from": "ts", "to": "back", "via": [[30, 200]] },
    { "from": "ch", "to": "back", "via": [[30, 250]] },
    { "from": "it", "to": "back", "via": [[30, 300]] },
    { "from": "back", "to": "rq" }
  ]
}
```

### Le context switch

Quand le CPU passe d'un processus à un autre, le système doit **sauvegarder
l'état de l'ancien** (dans son PCB) et **charger l'état sauvegardé du
nouveau** : c'est le **context switch**.

```diagram
{
  "title": "Context switch : le CPU sauvegarde l'état de P0 dans PCB0 et recharge celui de P1 depuis PCB1, puis l'inverse.",
  "nodes": [
    { "id": "h0", "x": 100, "y": 15, "shape": "text", "label": "process P0", "bold": true, "size": 12 },
    { "id": "hos", "x": 340, "y": 15, "shape": "text", "label": "operating system", "bold": true, "size": 12 },
    { "id": "h1", "x": 580, "y": 15, "shape": "text", "label": "process P1", "bold": true, "size": 12 },
    { "id": "e0", "x": 100, "y": 60, "w": 110, "h": 34, "label": "executing", "tone": "emerald", "filled": true, "size": 12 },
    { "id": "t1", "x": 340, "y": 70, "shape": "text", "label": "interrupt or system call", "size": 11 },
    { "id": "s0", "x": 340, "y": 105, "w": 200, "h": 30, "label": "save state into PCB0", "tone": "amber", "size": 11 },
    { "id": "r1", "x": 340, "y": 145, "w": 200, "h": 30, "label": "reload state from PCB1", "tone": "amber", "size": 11 },
    { "id": "e1", "x": 580, "y": 190, "w": 110, "h": 34, "label": "executing", "tone": "emerald", "filled": true, "size": 12 },
    { "id": "t2", "x": 340, "y": 225, "shape": "text", "label": "interrupt or system call", "size": 11 },
    { "id": "s1", "x": 340, "y": 260, "w": 200, "h": 30, "label": "save state into PCB1", "tone": "amber", "size": 11 },
    { "id": "r0", "x": 340, "y": 300, "w": 200, "h": 30, "label": "reload state from PCB0", "tone": "amber", "size": 11 },
    { "id": "e0b", "x": 100, "y": 345, "w": 110, "h": 34, "label": "executing", "tone": "emerald", "filled": true, "size": 12 },
    { "id": "i0", "x": 100, "y": 200, "w": 110, "h": 190, "label": "idle", "tone": "neutral", "size": 12, "dashed": true },
    { "id": "i1", "x": 580, "y": 90, "w": 110, "h": 80, "label": "idle", "tone": "neutral", "size": 12, "dashed": true },
    { "id": "i1b", "x": 580, "y": 305, "w": 110, "h": 80, "label": "idle", "tone": "neutral", "size": 12, "dashed": true }
  ],
  "edges": [
    { "from": "e0", "to": "s0" },
    { "from": "s0", "to": "r1", "arrow": "none" },
    { "from": "r1", "to": "e1" },
    { "from": "e1", "to": "s1" },
    { "from": "s1", "to": "r0", "arrow": "none" },
    { "from": "r0", "to": "e0b" }
  ]
}
```

- Le **contexte** d'un processus est stocké dans son **PCB**.
- **Le temps de context switch est du pur overhead** : le système ne fait
  **aucun travail utile** pendant ce temps.
- Plus l'OS et le PCB sont complexes, plus le switch est long.
- Le coût dépend du **matériel** : certains CPU ont **plusieurs jeux de
  registres**, ce qui permet de garder plusieurs contextes chargés.

### Multitâche sur mobile

- **iOS** (anciennes versions) : **un seul processus au premier plan**
  (*foreground*), les autres suspendus ; plus tard, plusieurs processus en
  arrière-plan, avec des limites (tâche courte, notifications, audio…).
- **Android** : premier et arrière-plan avec moins de limites ; un processus
  en arrière-plan utilise un **service**, qui continue même si le processus est
  suspendu, **sans interface** et avec peu de mémoire.

## 5. Créer et terminer des processus

### La création

Un **parent** crée des **children**, qui en créent à leur tour : on obtient un
**arbre de processus**. Chaque processus est identifié par un **pid**
(*process identifier*).

```diagram
{
  "title": "Un arbre de processus sous Linux : tout descend de systemd (pid 1).",
  "nodes": [
    { "id": "sd", "x": 330, "y": 30, "w": 130, "h": 36, "shape": "ellipse", "label": "systemd\npid = 1", "tone": "amber", "filled": true, "size": 11 },
    { "id": "lg", "x": 110, "y": 110, "w": 120, "h": 36, "shape": "ellipse", "label": "logind\npid = 8415", "size": 11 },
    { "id": "py", "x": 330, "y": 110, "w": 120, "h": 36, "shape": "ellipse", "label": "python\npid = 2808", "size": 11 },
    { "id": "ssh", "x": 550, "y": 110, "w": 120, "h": 36, "shape": "ellipse", "label": "sshd\npid = 3028", "size": 11 },
    { "id": "bash", "x": 110, "y": 190, "w": 120, "h": 36, "shape": "ellipse", "label": "bash\npid = 8416", "tone": "sky", "filled": true, "size": 11 },
    { "id": "sshd2", "x": 550, "y": 190, "w": 120, "h": 36, "shape": "ellipse", "label": "sshd\npid = 3610", "size": 11 },
    { "id": "ps", "x": 40, "y": 270, "w": 110, "h": 36, "shape": "ellipse", "label": "ps\npid = 9298", "size": 11 },
    { "id": "vim", "x": 180, "y": 270, "w": 110, "h": 36, "shape": "ellipse", "label": "vim\npid = 9204", "size": 11 },
    { "id": "tcsh", "x": 550, "y": 270, "w": 120, "h": 36, "shape": "ellipse", "label": "tcsh\npid = 4005", "size": 11 }
  ],
  "edges": [
    { "from": "sd", "to": "lg", "arrow": "none" }, { "from": "sd", "to": "py", "arrow": "none" }, { "from": "sd", "to": "ssh", "arrow": "none" },
    { "from": "lg", "to": "bash", "arrow": "none" }, { "from": "ssh", "to": "sshd2", "arrow": "none" },
    { "from": "bash", "to": "ps", "arrow": "none" }, { "from": "bash", "to": "vim", "arrow": "none" },
    { "from": "sshd2", "to": "tcsh", "arrow": "none" }
  ]
}
```

| Choix de conception | Options |
|---|---|
| **Partage des ressources** | parent et enfant partagent **tout** / l'enfant partage **une partie** / **rien** |
| **Exécution** | parent et enfant s'exécutent **en même temps** / le parent **attend** la fin des enfants |
| **Espace d'adressage** | l'enfant est une **copie** du parent / l'enfant **charge un nouveau programme** |

### fork(), exec(), wait() sous UNIX

| System call | Effet |
|---|---|
| **`fork()`** | crée un **nouveau processus**, **copie** du parent. Renvoie **0 dans l'enfant**, le **pid de l'enfant dans le parent**, **-1** en cas d'erreur |
| **`exec()`** | **remplace** la mémoire du processus par un **nouveau programme** |
| **`wait()`** | le parent **attend la fin** d'un enfant ; renvoie le pid de l'enfant terminé et son **statut** |
| **`exit()`** | le processus demande à l'OS de le supprimer ; son statut remonte au parent via `wait()` |

```diagram
{
  "title": "Création d'un processus avec fork() : l'enfant fait exec() et exit(), le parent fait wait() puis reprend.",
  "nodes": [
    { "id": "parent", "x": 70, "y": 110, "w": 90, "h": 40, "shape": "ellipse", "label": "parent", "tone": "sky", "filled": true, "size": 12 },
    { "id": "fork", "x": 200, "y": 110, "w": 80, "h": 36, "label": "fork()", "tone": "amber", "filled": true, "size": 12 },
    { "id": "wait", "x": 380, "y": 50, "w": 90, "h": 36, "label": "wait()", "tone": "amber", "filled": true, "size": 12 },
    { "id": "resumes", "x": 570, "y": 110, "w": 100, "h": 40, "shape": "ellipse", "label": "parent\nresumes", "tone": "sky", "filled": true, "size": 11 },
    { "id": "child", "x": 290, "y": 180, "w": 80, "h": 36, "shape": "ellipse", "label": "child", "tone": "emerald", "filled": true, "size": 12 },
    { "id": "exec", "x": 390, "y": 180, "w": 80, "h": 36, "label": "exec()", "tone": "amber", "filled": true, "size": 12 },
    { "id": "exit", "x": 490, "y": 180, "w": 80, "h": 36, "label": "exit()", "tone": "amber", "filled": true, "size": 12 }
  ],
  "edges": [
    { "from": "parent", "to": "fork" },
    { "from": "fork", "to": "wait", "label": "pid > 0" },
    { "from": "fork", "to": "child", "label": "pid = 0" },
    { "from": "child", "to": "exec" },
    { "from": "exec", "to": "exit" },
    { "from": "exit", "to": "resumes" },
    { "from": "wait", "to": "resumes" }
  ]
}
```

```c
pid_t pid = fork();
if (pid < 0) {            /* erreur */
    fprintf(stderr, "Fork Failed");
} else if (pid == 0) {    /* enfant */
    execlp("/bin/ls", "ls", NULL);
} else {                  /* parent */
    wait(NULL);
    printf("Child Complete");
}
```

Sous Windows, l'équivalent est **`CreateProcess()`**, qui crée le processus
**et** charge le programme en un seul appel.

### La terminaison

- Le processus exécute sa dernière instruction et appelle **`exit()`** ; ses
  ressources sont libérées par l'OS.
- Le parent peut tuer un enfant avec **`abort()`** : l'enfant a dépassé ses
  ressources, sa tâche n'est plus utile, ou le parent se termine.
- **Cascading termination** : certains OS n'autorisent pas un enfant à survivre
  à son parent ; si le parent meurt, **tous** ses descendants sont tués, à
  l'initiative de l'OS.

| | Définition |
|---|---|
| **Zombie** | l'enfant est **terminé** mais le parent **n'a pas encore appelé `wait()`** : son entrée reste dans la table des processus |
| **Orphan** | le **parent s'est terminé sans appeler `wait()`** : l'enfant est adopté par `systemd` / `init` (pid 1) |

> **Piège :** zombie = **enfant mort**, parent vivant qui n'a pas fait
> `wait()`. Orphelin = **parent mort**, enfant vivant.

### Android : l'ordre d'importance

Pour libérer de la mémoire, Android tue d'abord les processus **les moins
importants**. Du plus au moins important : **foreground → visible → service →
background → empty**.

### Chrome : une architecture multiprocessus

Avant, un navigateur = un processus : un site qui plante faisait tout planter.
**Chrome** utilise trois types de processus :

| Processus | Rôle |
|---|---|
| **Browser** | l'interface, les E/S disque et réseau |
| **Renderer** | affiche les pages (HTML, JavaScript) ; **un par site**, dans une **sandbox** qui limite les E/S |
| **Plug-in** | un par type de plug-in |

## 6. La communication entre processus (IPC)

Les processus sont **indépendants** ou **coopérants** (un processus coopérant
peut affecter les autres ou être affecté, par exemple en partageant des
données). Pourquoi coopérer : **partage d'information**, **accélération du
calcul**, **modularité**, **confort**.

Les processus coopérants ont besoin d'**IPC** (*interprocess communication*).
Deux modèles :

```diagram
{
  "title": "Les deux modèles d'IPC : (a) mémoire partagée, (b) échange de messages via le noyau.",
  "nodes": [
    { "id": "ha", "x": 150, "y": 12, "shape": "text", "label": "(a) shared memory", "bold": true },
    { "id": "hb", "x": 490, "y": 12, "shape": "text", "label": "(b) message passing", "bold": true },
    { "id": "pa", "x": 150, "y": 60, "w": 200, "h": 34, "label": "process A", "tone": "sky", "filled": true, "size": 12 },
    { "id": "sm", "x": 150, "y": 110, "w": 200, "h": 34, "label": "shared memory", "tone": "emerald", "filled": true, "size": 12 },
    { "id": "pb", "x": 150, "y": 160, "w": 200, "h": 34, "label": "process B", "tone": "sky", "filled": true, "size": 12 },
    { "id": "ka", "x": 150, "y": 230, "w": 200, "h": 34, "label": "kernel", "tone": "amber", "filled": true, "size": 12 },
    { "id": "qa", "x": 380, "y": 80, "w": 140, "h": 34, "label": "process A", "tone": "sky", "filled": true, "size": 12 },
    { "id": "qb", "x": 660, "y": 80, "w": 140, "h": 34, "label": "process B", "tone": "sky", "filled": true, "size": 12 },
    { "id": "mq", "x": 510, "y": 220, "w": 300, "h": 44, "label": "kernel : message queue\nm0 · m1 · m2 · … · mn", "tone": "amber", "filled": true, "size": 11 }
  ],
  "edges": [
    { "from": "pa", "to": "sm", "arrow": "both" },
    { "from": "pb", "to": "sm", "arrow": "both" },
    { "from": "qa", "to": "mq", "label": "send(msg)" },
    { "from": "mq", "to": "qb", "label": "receive(msg)" }
  ]
}
```

| | **Shared memory** | **Message passing** |
|---|---|---|
| Principe | une zone de mémoire **commune** aux processus | les processus s'envoient des **messages** (`send` / `receive`) |
| Contrôlé par | les **processus utilisateur**, pas l'OS | l'**OS** (le noyau transporte les messages) |
| Vitesse | **plus rapide** : system calls seulement pour créer la zone | plus lent : un system call par échange |
| Difficulté | il faut **synchroniser** les accès | pas de variables partagées ; pratique pour de petites données et en **distribué** |

### Le problème producteur-consommateur

Le paradigme des processus coopérants : un **producer** produit des données
consommées par un **consumer**.

| Buffer | Producteur | Consommateur |
|---|---|---|
| **Unbounded** (illimité) | n'attend **jamais** | attend si le buffer est **vide** |
| **Bounded** (taille fixe) | attend si le buffer est **plein** | attend si le buffer est **vide** |

Solution en mémoire partagée avec un **tableau circulaire** et deux indices
`in` (prochaine case libre) et `out` (prochaine case pleine) :

```c
#define BUFFER_SIZE 10
item buffer[BUFFER_SIZE];
int in = 0, out = 0;

/* producteur */
while (((in + 1) % BUFFER_SIZE) == out)
    ;                           /* plein : attendre */
buffer[in] = next_produced;
in = (in + 1) % BUFFER_SIZE;

/* consommateur */
while (in == out)
    ;                           /* vide : attendre */
next_consumed = buffer[out];
out = (out + 1) % BUFFER_SIZE;
```

> **À retenir :** cette solution est correcte mais ne peut utiliser que
> **BUFFER_SIZE − 1** cases (**N = B − 1**), car `in == out` doit vouloir dire
> « vide ».

Pour utiliser **toutes** les cases, on ajoute un compteur `counter`
(incrémenté par le producteur, décrémenté par le consommateur). Mais
`counter++` et `counter--` ne sont **pas atomiques** (lire → modifier →
écrire) : si les deux s'entremêlent, on obtient une **race condition** (avec
counter = 5 au départ, on peut finir à 4 ou 6 au lieu de 5). Solution au
chapitre 6 (synchronisation).

### Le message passing en détail

Deux opérations : **`send(message)`** et **`receive(message)`**, avec des
messages de taille **fixe ou variable**. Il faut d'abord **établir un lien**
de communication.

| **Direct communication** | **Indirect communication** |
|---|---|
| on **nomme** le processus : `send(P, msg)`, `receive(Q, msg)` | on passe par une **mailbox** (ou **port**) : `send(A, msg)`, `receive(A, msg)` |
| lien établi **automatiquement** | lien établi seulement si les processus **partagent une mailbox** |
| un lien = **exactement une paire** de processus | un lien peut concerner **plusieurs** processus |
| **un seul lien** par paire | une paire peut partager **plusieurs** liens |

Si P1, P2 et P3 partagent la mailbox A et que P1 envoie, qui reçoit ? Solutions :
limiter un lien à deux processus, n'autoriser qu'un `receive` à la fois, ou
laisser le système choisir (et prévenir l'émetteur).

**Synchronisation :**

| | Send | Receive |
|---|---|---|
| **Blocking** (= synchrone) | l'émetteur est bloqué **jusqu'à ce que le message soit reçu** | le récepteur est bloqué **jusqu'à ce qu'un message arrive** |
| **Non-blocking** (= asynchrone) | l'émetteur envoie et **continue** | le récepteur reçoit un message valide **ou null** |

Si `send` **et** `receive` sont bloquants : **rendezvous**.

**Buffering** (la file de messages attachée au lien) :

| Capacité | Conséquence |
|---|---|
| **Zero capacity** | aucun message en file : l'émetteur **attend** le récepteur (rendezvous) |
| **Bounded capacity** | *n* messages max : l'émetteur attend si la file est **pleine** |
| **Unbounded capacity** | file infinie : l'émetteur **n'attend jamais** |

### Exemples de systèmes d'IPC

- **POSIX shared memory** : `shm_open()` crée (ou ouvre) le segment,
  `ftruncate()` fixe sa taille, `mmap()` le mappe en mémoire ; on lit et écrit
  ensuite via le pointeur renvoyé.
- **Mach** : tout passe par des **messages**, **même les system calls**.
  Chaque tâche reçoit deux ports à sa création (**Kernel** et **Notify**) ;
  `mach_msg()` envoie et reçoit, `mach_port_allocate()` crée un port. Si la
  mailbox est pleine : attendre indéfiniment, attendre *n* ms, revenir tout de
  suite, ou mettre en cache temporairement.
- **Windows** : **ALPC** (*advanced local procedure call*), uniquement entre
  processus **de la même machine**, via des ports (connexion, puis deux ports
  privés).

### Les pipes

Un **pipe** est un conduit qui permet à deux processus de communiquer.

| **Ordinary pipe** | **Named pipe** |
|---|---|
| **unidirectionnel** : on écrit à la *write-end*, on lit à la *read-end* | **bidirectionnel** |
| exige une relation **parent-enfant** | **pas besoin** de relation parent-enfant |
| inaccessible hors du processus qui l'a créé | **plusieurs processus** peuvent l'utiliser |
| Windows : **anonymous pipes** | UNIX (FIFO) et Windows |

Dans le terminal, `ls | grep txt` utilise un pipe : la sortie de `ls` devient
l'entrée de `grep`.

### Communication client-serveur

- **Socket** : une **extrémité de communication** = **adresse IP + port**.
  `161.25.19.8:1625` = port 1625 sur la machine 161.25.19.8. Les ports **< 1024**
  sont **well-known** (services standard : 22 SSH, 80 HTTP). **127.0.0.1** =
  **loopback** (la machine elle-même). En Java : sockets **TCP**
  (connection-oriented), **UDP** (connectionless), **multicast**.
- **RPC** (*remote procedure call*) : appeler une procédure **sur une autre
  machine** comme si elle était locale. Le **stub** côté client localise le
  serveur et **marshalle** (emballe) les paramètres ; le stub côté serveur les
  déballe et exécute la procédure. La représentation des données passe par
  **XDR** (*External Data Representation*) pour gérer **big-endian / little-endian**.
  Un message peut être livré **exactly once** plutôt que **at most once** ; un
  service de **rendezvous / matchmaker** met en relation client et serveur.

---

# Partie 2 — Lab : administration Linux

## 7. La philosophie Linux

1. **Everything is a file** : périphériques, sockets, processus sont
   représentés comme des fichiers.
2. **Small, single-purpose tools** : de petits outils qui font une chose bien
   (`grep`, `cat`).
3. **Chaining tools** : on enchaîne les outils avec des **pipes** `|`.

## 8. Utilisateurs et permissions (DevOps Task 1)

Linux est **multi-utilisateur** : chaque fichier a des droits **r** (read),
**w** (write), **x** (execute) pour **owner**, **group** et **others**.

```bash
sudo adduser dev_alice                       # 1. créer l'utilisateur
sudo mkdir /project_alpha                    # 2. créer le dossier projet
sudo chown dev_alice:dev_alice /project_alpha   # 3. le donner à Alice
sudo chmod 700 /project_alpha                # 4. seule Alice a accès
ls -ld /project_alpha
# drwx------ 2 dev_alice dev_alice 4096 ... /project_alpha
```

`sudo` donne les privilèges **root**. `chmod 700` = owner **7** (4 + 2 + 1 =
rwx), group **0**, others **0** (aucun accès).

## 9. Gérer les paquets avec APT

Sous Ubuntu, on n'installe pas un `.exe` trouvé sur le web : on passe par les
**dépôts** avec **APT** (*Advanced Package Tool*), qui **résout les
dépendances** tout seul.

| Commande | Effet |
|---|---|
| `sudo apt update` | met à jour la **liste** des paquets disponibles |
| `sudo apt upgrade -y` | **met à jour** les paquets installés |
| `sudo apt install nginx -y` | **installe** un paquet |
| `sudo apt remove apache2` | **supprime** un paquet |

> **Piège :** `apt update` n'installe **rien** : il rafraîchit seulement la
> liste. C'est `apt upgrade` qui met à jour les logiciels.

## 10. Les signaux

Un **signal** est une **interruption logicielle** envoyée à un processus pour
lui signaler un événement : une « tape sur l'épaule ».

| Signal | N° | Envoyé par | Effet |
|---|---|---|---|
| **SIGINT** | **2** | **Ctrl+C** | demande poliment au processus au premier plan de s'arrêter |
| **SIGTSTP** | **20** | **Ctrl+Z** | **met en pause** le processus, qui reste en mémoire |
| **SIGTERM** | **15** | **`kill PID`** (par défaut) | demande **polie** de terminer : le processus peut sauvegarder et fermer ses fichiers |
| **SIGKILL** | **9** | **`kill -9 PID`** | le **noyau détruit** le processus immédiatement ; il ne peut ni l'intercepter ni sauvegarder |

**DevOps Task 2 : un processus bloqué à 100 % CPU**

```bash
ps aux | grep heavy_calc.sh    # 1. trouver le PID (ex. 4052)
kill 4052                      # 2. d'abord poliment (SIGTERM)
kill -9 4052                   # 3. s'il résiste, de force (SIGKILL)
```

> **Pièges :** `kill` **sans option** envoie **SIGTERM (15)**, pas SIGKILL.
> SIGKILL ne peut **pas** être intercepté ni ignoré ; SIGTERM, si. Et `kill -9`
> ne fait **rien** sur un zombie, qui est déjà mort.

## 11. Premier plan, arrière-plan, jobs

| Action | Commande |
|---|---|
| Lancer en **arrière-plan** | ajouter **`&`** : `tar -czf backup.tar.gz /var/www &` |
| **Mettre en pause** le job au premier plan | **Ctrl+Z** → `[1]+ Stopped` |
| **Reprendre en arrière-plan** | **`bg %1`** |
| **Ramener au premier plan** | **`fg %1`** |
| Lister les jobs | `jobs` |

## 12. Planifier avec cron

**Cron** exécute des commandes à heure fixe. On édite sa table avec
**`crontab -e`**. Syntaxe : **5 champs** puis la commande.

```
[minute] [hour] [day of month] [month] [day of week]  command
```

| Ligne | Signification |
|---|---|
| `0 3 * * * /backup.sh` | **tous les jours à 3 h 00** |
| `30 14 * * 5 /report.sh` | **tous les vendredis à 14 h 30** (5 = vendredi) |
| `*/15 * * * * /healthcheck.sh` | **toutes les 15 minutes** |
| `0 * * * * /script.sh` | **toutes les heures**, à la minute 0 |

> **Piège :** le **1er champ est la minute**, pas l'heure. `30 14` = 14 h 30.

## 13. Daemons et systemd

Un **daemon** est un **processus d'arrière-plan** qui tourne en continu et
attend des requêtes, **sans interface graphique**. Par convention son nom
**finit par « d »** : `sshd`, `httpd`, `crond`.

Au boot, le noyau lance le **tout premier processus : systemd (PID 1)**, « la
mère de tous les processus ». Il lit la configuration et démarre les autres
daemons.

| Commande | Effet | Type d'état |
|---|---|---|
| `sudo systemctl start nginx` | démarre **maintenant** | **current state** |
| `sudo systemctl stop nginx` | arrête maintenant | current state |
| `sudo systemctl status nginx` | est-ce qu'il tourne ? | — |
| `sudo systemctl enable nginx` | démarre **à chaque boot** | **boot state** |
| `sudo systemctl disable nginx` | ne démarre plus au boot | boot state |
| `sudo systemctl reload nginx` | recharge la config **sans couper** les connexions | — |

> **Piège :** `enable` ne démarre **pas** le service tout de suite ; il le
> programme pour les **prochains** démarrages. `start` le lance maintenant.

## 14. Surveiller le système

| Outil | Ce qu'il montre |
|---|---|
| `/proc` | un **pseudo-filesystem en RAM**, tenu par le noyau : un dossier par PID |
| `cat /proc/cpuinfo` | infos sur le **CPU** |
| `cat /proc/meminfo` | **mémoire** et swap en temps réel |
| `uptime` | durée de fonctionnement + **load average** sur **1, 5 et 15 min** |
| `ps aux` | **photo** statique des processus |
| `top` / `htop` | tableau de bord **en temps réel** (`htop` : couleurs, F9 pour tuer) |
| `free -h` | RAM et **swap** |

**Le load average est par cœur.** Le CPU est un pont, les processus sont des
voitures : 0.00 = pont vide, **1.00 = pont plein** sur 1 cœur. Sur **4 cœurs**,
**4.00 = 100 %** ; 12.00 sur 4 cœurs = forte saturation.

**Swap** : quand la RAM est pleine, l'OS utilise une partie du disque comme RAM
de secours (lente). Beaucoup de swap = manque de RAM, les données font des
allers-retours RAM ↔ disque : c'est le **thrashing**.

---

## À retenir

- **Process** = programme **en exécution** (actif) ; mémoire : **text**
  (code), **data** (globales), **heap** (dynamique), **stack** (locales,
  paramètres, retours).
- États : **new, ready, running, waiting, terminated** ; waiting → **ready**
  (jamais direct en running).
- **PCB** (`task_struct` sous Linux) : état, **program counter**, registres,
  scheduling, mémoire, accounting, E/S.
- **Ready queue** / **wait queues**. **Context switch** = sauver l'ancien PCB,
  charger le nouveau = **pur overhead**.
- `fork()` : **0 dans l'enfant**, pid de l'enfant dans le parent. `exec()`
  remplace le programme, `wait()` attend l'enfant. **Zombie** = enfant fini
  sans `wait()` du parent ; **orphan** = parent mort.
- IPC : **shared memory** (rapide, synchronisation à gérer) vs **message
  passing** (`send` / `receive`, direct ou via **mailbox**, blocking =
  synchrone, **rendezvous**). Buffer borné : **N = B − 1**.
- **Ordinary pipe** : unidirectionnel, parent-enfant. **Named pipe** :
  bidirectionnel, sans parenté. **Socket** = IP + port ; **RPC** avec **stubs**
  et **marshalling**.
- Lab : `chmod 700` ; `apt update` (liste) vs `upgrade` ; **SIGINT 2 (Ctrl+C),
  SIGTSTP 20 (Ctrl+Z), SIGTERM 15 (`kill`), SIGKILL 9 (`kill -9`)** ; `&`,
  `bg`, `fg` ; cron **minute heure jour mois jour-semaine** ; **systemd = PID
  1**, `start` (maintenant) vs `enable` (au boot) ; load average **par cœur**.

## Pièges classiques du quiz

| Affirmation | Vrai / Faux |
|---|---|
| Un programme est une entité active | **Faux** : passive ; le processus est actif |
| Les variables locales sont stockées dans le heap | **Faux** : dans la stack |
| Un processus en waiting passe directement en running | **Faux** : il repasse par ready |
| `fork()` renvoie 0 au parent | **Faux** : 0 à l'enfant |
| Un orphelin est un processus terminé dont le parent n'a pas fait `wait()` | **Faux** : ça, c'est un zombie |
| La mémoire partagée est contrôlée par l'OS | **Faux** : par les processus |
| Les ordinary pipes sont bidirectionnels | **Faux** : unidirectionnels |
| Blocking send et blocking receive = rendezvous | **Vrai** |
| `kill` envoie SIGKILL par défaut | **Faux** : SIGTERM |
| `systemctl enable` démarre le service immédiatement | **Faux** : au prochain boot |
| Un load average de 2.00 sur 4 cœurs = CPU saturé | **Faux** : 50 % |
