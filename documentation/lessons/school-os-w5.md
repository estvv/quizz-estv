# Operating System — Week 5 · Threads & server monitoring

**Cours** : chapitre 4 du Silberschatz, *Threads & Concurrency* : ce qu'est un
thread, ses avantages, **concurrency vs parallelism**, la **loi d'Amdahl**,
les modèles **many-to-one / one-to-one / many-to-many**, les bibliothèques
(Pthreads), l'**implicit threading** (thread pools, fork-join, OpenMP, GCD,
TBB), les problèmes (fork/exec, signaux, annulation, TLS) et les threads sous
Windows et Linux.
**Lab** : *Server Health Checkup* (CPU, zombies, load, mémoire, disque), puis
les redirections, les utilisateurs et permissions, et les processus sous
Linux.

> **En bref.** Un **thread** est un « fil d'exécution » à l'intérieur d'un
> processus : les threads d'un même processus **partagent** le code, les
> données et les fichiers ouverts, mais chacun a **sa propre pile, ses
> registres et son program counter**. Créer un thread est **beaucoup moins
> cher** que créer un processus. La **loi d'Amdahl** rappelle que la partie
> **séquentielle** d'un programme limite le gain apporté par les cœurs.

---

# Partie 1 — Cours

## 1. Pourquoi des threads ?

La plupart des applications modernes sont **multithreaded**. Dans un
traitement de texte, un thread met à jour l'affichage, un autre lit les
frappes, un autre vérifie l'orthographe. Un serveur web crée un thread par
requête plutôt qu'un processus.

- La **création d'un processus** est **lourde** (*heavy-weight*), celle d'un
  **thread** est **légère** (*light-weight*).
- Les **noyaux** eux-mêmes sont en général multithread.

```diagram
{
  "title": "Processus mono-thread vs multithread : le code, les données et les fichiers sont partagés ; registres, PC et pile sont propres à chaque thread.",
  "nodes": [
    { "id": "h1", "x": 130, "y": 12, "shape": "text", "label": "single-threaded process", "bold": true, "size": 12 },
    { "id": "h2", "x": 470, "y": 12, "shape": "text", "label": "multithreaded process", "bold": true, "size": 12 },
    { "id": "s1", "x": 130, "y": 50, "shape": "table", "size": 11, "header": false, "cols": [60, 60, 60], "rows": [["code", "data", "files"]] },
    { "id": "s2", "x": 130, "y": 90, "shape": "table", "size": 11, "header": false, "cols": [60, 60, 60], "rows": [["registers", "PC", "stack"]] },
    { "id": "st", "x": 130, "y": 150, "w": 40, "h": 50, "label": "T", "tone": "emerald", "size": 14 },
    { "id": "sl", "x": 130, "y": 190, "shape": "text", "label": "1 thread", "size": 11 },
    { "id": "m1", "x": 470, "y": 50, "shape": "table", "size": 11, "header": false, "cols": [90, 90, 90], "rows": [["code", "data", "files"]] },
    { "id": "m2", "x": 470, "y": 120, "shape": "table", "size": 11, "header": false, "cols": [90, 90, 90], "rows": [["registers", "registers", "registers"], ["PC", "PC", "PC"], ["stack", "stack", "stack"]] },
    { "id": "t1", "x": 380, "y": 215, "w": 40, "h": 40, "label": "T", "tone": "emerald", "size": 14 },
    { "id": "t2", "x": 470, "y": 215, "w": 40, "h": 40, "label": "T", "tone": "emerald", "size": 14 },
    { "id": "t3", "x": 560, "y": 215, "w": 40, "h": 40, "label": "T", "tone": "emerald", "size": 14 },
    { "id": "ml", "x": 470, "y": 250, "shape": "text", "label": "3 threads", "size": 11 }
  ],
  "edges": []
}
```

| Partagé entre les threads du processus | Propre à chaque thread |
|---|---|
| **code** (text section) | **thread ID** |
| **data** (variables globales) | **program counter** |
| **fichiers ouverts**, autres ressources | **registres** |
| | **stack** (pile) |

### Les 4 avantages (à connaître par cœur)

| Avantage | Explication |
|---|---|
| **Responsiveness** | le programme continue de répondre même si une partie est **bloquée** (important pour les interfaces) |
| **Resource sharing** | les threads **partagent les ressources** du processus : plus simple que la mémoire partagée ou les messages |
| **Economy** | **moins cher** que créer un processus ; changer de thread coûte moins qu'un context switch de processus |
| **Scalability** | un processus peut tirer parti d'une **architecture multicœur** |

## 2. Programmation multicœur

Les systèmes multicœurs mettent la pression sur les développeurs. Défis :
**dividing activities** (découper le travail), **balance** (répartir
équitablement), **data splitting** (découper les données), **data dependency**
(gérer les dépendances), **testing and debugging**.

| **Concurrency** | **Parallelism** |
|---|---|
| **plusieurs tâches progressent** | plusieurs tâches s'exécutent **en même temps** |
| possible **sur un seul cœur** : l'ordonnanceur alterne vite | nécessite **plusieurs cœurs** |

```diagram
{
  "title": "Concurrence sur un cœur (les tâches alternent) vs parallélisme sur deux cœurs (elles tournent en même temps).",
  "nodes": [
    { "id": "l1", "x": 40, "y": 30, "shape": "text", "label": "1 cœur", "bold": true, "size": 12 },
    { "id": "a1", "x": 120, "y": 30, "w": 60, "h": 28, "label": "T1", "tone": "sky", "filled": true, "size": 11 },
    { "id": "a2", "x": 180, "y": 30, "w": 60, "h": 28, "label": "T2", "tone": "amber", "filled": true, "size": 11 },
    { "id": "a3", "x": 240, "y": 30, "w": 60, "h": 28, "label": "T3", "tone": "emerald", "filled": true, "size": 11 },
    { "id": "a4", "x": 300, "y": 30, "w": 60, "h": 28, "label": "T4", "tone": "rose", "filled": true, "size": 11 },
    { "id": "a5", "x": 360, "y": 30, "w": 60, "h": 28, "label": "T1", "tone": "sky", "filled": true, "size": 11 },
    { "id": "a6", "x": 420, "y": 30, "w": 60, "h": 28, "label": "T2", "tone": "amber", "filled": true, "size": 11 },
    { "id": "a7", "x": 480, "y": 30, "w": 60, "h": 28, "label": "T3", "tone": "emerald", "filled": true, "size": 11 },
    { "id": "a8", "x": 540, "y": 30, "w": 60, "h": 28, "label": "T4", "tone": "rose", "filled": true, "size": 11 },
    { "id": "l2", "x": 40, "y": 100, "shape": "text", "label": "core 1", "bold": true, "size": 12 },
    { "id": "b1", "x": 120, "y": 100, "w": 60, "h": 28, "label": "T1", "tone": "sky", "filled": true, "size": 11 },
    { "id": "b2", "x": 180, "y": 100, "w": 60, "h": 28, "label": "T3", "tone": "emerald", "filled": true, "size": 11 },
    { "id": "b3", "x": 240, "y": 100, "w": 60, "h": 28, "label": "T1", "tone": "sky", "filled": true, "size": 11 },
    { "id": "b4", "x": 300, "y": 100, "w": 60, "h": 28, "label": "T3", "tone": "emerald", "filled": true, "size": 11 },
    { "id": "l3", "x": 40, "y": 140, "shape": "text", "label": "core 2", "bold": true, "size": 12 },
    { "id": "c1", "x": 120, "y": 140, "w": 60, "h": 28, "label": "T2", "tone": "amber", "filled": true, "size": 11 },
    { "id": "c2", "x": 180, "y": 140, "w": 60, "h": 28, "label": "T4", "tone": "rose", "filled": true, "size": 11 },
    { "id": "c3", "x": 240, "y": 140, "w": 60, "h": 28, "label": "T2", "tone": "amber", "filled": true, "size": 11 },
    { "id": "c4", "x": 300, "y": 140, "w": 60, "h": 28, "label": "T4", "tone": "rose", "filled": true, "size": 11 },
    { "id": "t0", "x": 90, "y": 180, "shape": "text" },
    { "id": "t9", "x": 580, "y": 180, "shape": "text", "label": "temps", "size": 11 }
  ],
  "edges": [
    { "from": "t0", "to": "t9" }
  ]
}
```

> **Piège :** on peut avoir de la **concurrence sans parallélisme** (un seul
> cœur), mais pas de parallélisme sans plusieurs cœurs.

### Deux types de parallélisme

| **Data parallelism** | **Task parallelism** |
|---|---|
| découper **les données** entre les cœurs, **même opération** sur chaque morceau | répartir **des threads différents** sur les cœurs, chacun fait une **opération différente** |
| ex. sommer un tableau : cœur 1 fait la 1re moitié, cœur 2 la 2de | ex. un thread calcule la moyenne, un autre le maximum |

## 3. La loi d'Amdahl

Elle donne le gain de performance (*speedup*) quand on ajoute des cœurs à une
application qui a une partie **séquentielle** (*serial*) **S** et une partie
parallèle **1 − S**, avec **N** cœurs :

```
                    1
speedup  ≤  ─────────────────
             S  +  (1 − S) / N
```

Quand **N → ∞**, le speedup tend vers **1 / S**.

**Exemple du cours :** 75 % parallèle, 25 % séquentiel (S = 0,25) :

| Cœurs N | Calcul | Speedup |
|---|---|---|
| 1 | 1 / (0,25 + 0,75) | **1** |
| 2 | 1 / (0,25 + 0,375) = 1 / 0,625 | **1,6** |
| 4 | 1 / (0,25 + 0,1875) = 1 / 0,4375 | **≈ 2,29** |
| ∞ | 1 / 0,25 | **4** (le maximum) |

> **À retenir :** la partie séquentielle a un effet **disproportionné**. Avec
> 25 % de code séquentiel, même une infinité de cœurs ne donne **jamais plus
> que ×4**. Avec 10 % séquentiel, le maximum est ×10 ; avec 50 %, ×2.

**Méthode rapide pour le quiz :** speedup maximal = **1 / (part séquentielle)**.

## 4. User threads et kernel threads

| **User threads** | **Kernel threads** |
|---|---|
| gérés par une **bibliothèque de threads** en espace utilisateur | gérés **directement par le noyau** |
| 3 bibliothèques principales : **POSIX Pthreads**, **Windows threads**, **Java threads** | présents dans quasiment tous les OS : Windows, Linux, macOS, iOS, Android |

### Les modèles de correspondance

```diagram
{
  "title": "Les trois modèles : plusieurs user threads sur un kernel thread, un pour un, ou plusieurs sur plusieurs.",
  "nodes": [
    { "id": "h1", "x": 110, "y": 12, "shape": "text", "label": "many-to-one", "bold": true, "size": 12 },
    { "id": "h2", "x": 340, "y": 12, "shape": "text", "label": "one-to-one", "bold": true, "size": 12 },
    { "id": "h3", "x": 570, "y": 12, "shape": "text", "label": "many-to-many", "bold": true, "size": 12 },
    { "id": "u1", "x": 50, "y": 60, "w": 36, "h": 30, "shape": "ellipse", "label": "U", "tone": "sky", "size": 11 },
    { "id": "u2", "x": 110, "y": 60, "w": 36, "h": 30, "shape": "ellipse", "label": "U", "tone": "sky", "size": 11 },
    { "id": "u3", "x": 170, "y": 60, "w": 36, "h": 30, "shape": "ellipse", "label": "U", "tone": "sky", "size": 11 },
    { "id": "k1", "x": 110, "y": 160, "w": 36, "h": 30, "shape": "ellipse", "label": "K", "tone": "amber", "filled": true, "size": 11 },
    { "id": "v1", "x": 280, "y": 60, "w": 36, "h": 30, "shape": "ellipse", "label": "U", "tone": "sky", "size": 11 },
    { "id": "v2", "x": 340, "y": 60, "w": 36, "h": 30, "shape": "ellipse", "label": "U", "tone": "sky", "size": 11 },
    { "id": "v3", "x": 400, "y": 60, "w": 36, "h": 30, "shape": "ellipse", "label": "U", "tone": "sky", "size": 11 },
    { "id": "j1", "x": 280, "y": 160, "w": 36, "h": 30, "shape": "ellipse", "label": "K", "tone": "amber", "filled": true, "size": 11 },
    { "id": "j2", "x": 340, "y": 160, "w": 36, "h": 30, "shape": "ellipse", "label": "K", "tone": "amber", "filled": true, "size": 11 },
    { "id": "j3", "x": 400, "y": 160, "w": 36, "h": 30, "shape": "ellipse", "label": "K", "tone": "amber", "filled": true, "size": 11 },
    { "id": "w1", "x": 500, "y": 60, "w": 36, "h": 30, "shape": "ellipse", "label": "U", "tone": "sky", "size": 11 },
    { "id": "w2", "x": 550, "y": 60, "w": 36, "h": 30, "shape": "ellipse", "label": "U", "tone": "sky", "size": 11 },
    { "id": "w3", "x": 600, "y": 60, "w": 36, "h": 30, "shape": "ellipse", "label": "U", "tone": "sky", "size": 11 },
    { "id": "w4", "x": 650, "y": 60, "w": 36, "h": 30, "shape": "ellipse", "label": "U", "tone": "sky", "size": 11 },
    { "id": "x1", "x": 525, "y": 160, "w": 36, "h": 30, "shape": "ellipse", "label": "K", "tone": "amber", "filled": true, "size": 11 },
    { "id": "x2", "x": 575, "y": 160, "w": 36, "h": 30, "shape": "ellipse", "label": "K", "tone": "amber", "filled": true, "size": 11 },
    { "id": "x3", "x": 625, "y": 160, "w": 36, "h": 30, "shape": "ellipse", "label": "K", "tone": "amber", "filled": true, "size": 11 },
    { "id": "lu", "x": 340, "y": 200, "shape": "text", "label": "U = user thread · K = kernel thread", "size": 11 }
  ],
  "edges": [
    { "from": "u1", "to": "k1", "arrow": "none" }, { "from": "u2", "to": "k1", "arrow": "none" }, { "from": "u3", "to": "k1", "arrow": "none" },
    { "from": "v1", "to": "j1", "arrow": "none" }, { "from": "v2", "to": "j2", "arrow": "none" }, { "from": "v3", "to": "j3", "arrow": "none" },
    { "from": "w1", "to": "x1", "arrow": "none" }, { "from": "w2", "to": "x1", "arrow": "none" }, { "from": "w2", "to": "x2", "arrow": "none" },
    { "from": "w3", "to": "x2", "arrow": "none" }, { "from": "w3", "to": "x3", "arrow": "none" }, { "from": "w4", "to": "x3", "arrow": "none" }
  ]
}
```

| Modèle | Principe | Conséquences | Exemples |
|---|---|---|---|
| **Many-to-One** | **plusieurs** user threads sur **un seul** kernel thread | **un thread qui bloque bloque tous les autres** ; **pas de vrai parallélisme** sur multicœur (un seul peut être dans le noyau à la fois) ; peu utilisé aujourd'hui | Solaris Green Threads, GNU Portable Threads |
| **One-to-One** | **chaque** user thread a **son** kernel thread | créer un user thread crée un kernel thread ; **plus de concurrence** ; nombre de threads parfois **limité** à cause du coût | **Windows, Linux** |
| **Many-to-Many** | **plusieurs** user threads sur **plusieurs** kernel threads | l'OS crée **autant de kernel threads que nécessaire** ; peu courant | Windows avec ThreadFiber |
| **Two-level** | comme many-to-many, mais un user thread **peut être lié** (*bound*) à un kernel thread | | |

## 5. Les bibliothèques de threads

Une **thread library** donne au programmeur une API pour créer et gérer des
threads. Deux implémentations : **entièrement en espace utilisateur**, ou
**au niveau noyau** (supportée par l'OS).

**Pthreads** : standard **POSIX** (IEEE 1003.1c) pour créer et synchroniser des
threads. C'est une **spécification, pas une implémentation** : elle décrit le
comportement, chaque système l'implémente à sa façon. Courante sous UNIX (Linux,
macOS).

```c
pthread_t tid;
pthread_create(&tid, NULL, runner, argv[1]);  /* crée le thread */
pthread_join(tid, NULL);                      /* attend sa fin */
```

## 6. Implicit threading

Avec beaucoup de threads, les gérer à la main devient difficile. L'**implicit
threading** confie la création et la gestion des threads aux **compilateurs et
bibliothèques d'exécution**. Cinq méthodes :

| Méthode | Idée |
|---|---|
| **Thread pools** | créer à l'avance un **groupe de threads** qui attendent du travail |
| **Fork-Join** | plusieurs threads (tâches) sont **forkés** puis **rejoints** (*joined*) |
| **OpenMP** | **directives de compilation** + API pour C, C++, FORTRAN ; `#pragma omp parallel` crée **autant de threads que de cœurs** |
| **Grand Central Dispatch (GCD)** | technologie **Apple** (macOS, iOS) ; des **blocks** `^{ … }` placés dans des **dispatch queues** |
| **Intel TBB** | bibliothèque de **templates C++** ; `parallel_for` |

**Avantages des thread pools :**

1. servir une requête avec un **thread existant** est un peu **plus rapide**
   que d'en créer un ;
2. le nombre de threads est **borné** par la taille du pool ;
3. séparer la tâche de la façon de la lancer permet différentes stratégies
   (ex. exécution **périodique**).

**GCD** : deux types de files. **Serial** : blocs retirés en ordre **FIFO**, un
à la fois (la **main queue** par processus). **Concurrent** : ordre FIFO, mais
**plusieurs à la fois** ; quatre files système par **qualité de service**
(`USER_INTERACTIVE`, `USER_INITIATED`, `UTILITY`, `BACKGROUND`).

## 7. Les problèmes du multithreading

### fork() et exec()

**`fork()` copie-t-il seulement le thread appelant, ou tous les threads ?**
Certains UNIX ont **deux versions** de `fork()`. **`exec()`** fonctionne
normalement : il **remplace tout le processus**, **threads compris**.

### Les signaux

Un **signal** notifie un processus qu'un événement s'est produit : il est
**généré** par un événement, **délivré** au processus, puis **traité** par un
**signal handler** : le handler **par défaut** (celui du noyau) ou un handler
**défini par l'utilisateur**, qui peut remplacer le défaut.

Pour un processus multithread, où délivrer le signal ? Quatre options :
au **thread concerné**, à **tous les threads**, à **certains threads**, ou à un
**thread désigné** qui reçoit tous les signaux.

### L'annulation de threads (thread cancellation)

Terminer un thread (**target thread**) avant la fin :

| **Asynchronous cancellation** | **Deferred cancellation** |
|---|---|
| le thread cible est tué **immédiatement** | le thread cible **vérifie régulièrement** s'il doit s'arrêter |
| | **mode par défaut** ; l'annulation a lieu à un **cancellation point** (ex. `pthread_testcancel()`), puis un **cleanup handler** s'exécute |

Si l'annulation est **désactivée**, la demande reste **en attente** jusqu'à ce
que le thread la réactive. Sous Linux, l'annulation passe par des **signaux**.

### Thread-local storage (TLS)

Chaque thread a **sa propre copie** d'une donnée. Utile quand on ne contrôle
pas la création des threads (thread pool). À ne pas confondre :

- une **variable locale** n'est visible que **pendant un appel de fonction** ;
- une donnée **TLS** est visible **à travers les appels de fonctions**, comme une
  donnée `static`, mais **propre à chaque thread**.

### Scheduler activations

Les modèles many-to-many et two-level ont besoin d'une communication pour
garder le bon nombre de kernel threads. On utilise une structure
intermédiaire, le **LWP** (*lightweight process*), vu comme un **processeur
virtuel** sur lequel l'application place ses user threads, chaque LWP étant
attaché à un kernel thread. Les **scheduler activations** fournissent des
**upcalls** : le noyau prévient la bibliothèque de threads.

## 8. Threads sous Windows et Linux

**Windows** : API Windows, modèle **one-to-one**. Chaque thread contient un
**thread id**, un **jeu de registres**, des **piles utilisateur et noyau**
séparées, une zone de **stockage privée** ; ensemble = le **contexte** du
thread. Structures :

| Structure | Où | Contenu |
|---|---|---|
| **ETHREAD** (executive thread block) | noyau | pointeur vers le processus et vers le KTHREAD |
| **KTHREAD** (kernel thread block) | noyau | ordonnancement, synchronisation, pile noyau, pointeur vers le TEB |
| **TEB** (thread environment block) | **espace utilisateur** | thread id, pile utilisateur, **thread-local storage** |

**Linux** : parle de **tasks** plutôt que de threads. Un thread est créé avec
l'appel système **`clone()`**, qui permet à la tâche enfant de **partager
l'espace d'adressage** du parent ; des **flags** contrôlent ce qui est partagé.
`struct task_struct` pointe vers les structures du processus (partagées ou
non).

---

# Partie 2 — Lab

## 9. Server Health Checkup

Surveiller régulièrement un serveur : repérer les goulots d'étranglement, les
problèmes matériels, la latence réseau, vérifier les sauvegardes. Le script du
lab est découpé en fonctions :

| Fonction | Commande clé | Ce qu'elle vérifie |
|---|---|---|
| `check_running_processes` | `ps aux --sort=-%cpu \| awk 'NR<=5'` | les **processus qui consomment le plus de CPU** |
| — | `ps aux \| grep 'java'` | les processus qui contiennent « java » |
| `check_cpu_utilization` | `ps -eo %cpu,command \| egrep '(java\|http\|mysql)' \| awk '$1 > 10'` | les services critiques à **plus de 10 % CPU** |
| `check_memory_utilization` | `free -h`, `swapon` | RAM et swap |
| — | `sync && echo 3 > /proc/sys/vm/drop_caches` | écrire le cache sur disque puis **vider le cache** (root) |
| `check_zombie_processes` | `ps aux \| awk '$8=="Z"'` | les processus **zombies** (colonne STAT = Z) |
| `check_load_average` | `uptime` | le **load average** sur 1, 5 et 15 min |
| `check_disk_utilization` | `iostat`, `df -h` | les **E/S disque** et l'**espace disque** |

Boucle de surveillance du CPU :

```bash
#!/bin/bash
while true; do
    top -b -n1 | grep 'Cpu(s)' | awk '{print $2 + $4}'   # user + system
    sleep 5
done
```

> **Piège :** `kill -9` sur un **zombie** ne sert à rien : il est **déjà
> mort**. Il disparaît quand son **parent** appelle `wait()` ou se termine.

## 10. Commandes simples : date

```bash
date                 # Wed Apr  5 06:52:20 UTC 2023
date +%R             # 06:53        (heure:minute)
date +"%m-%d-%y"     # 04-05-23
date +"%D"           # 04/05/23
date +"%T"           # 07:14:10     (heure:minute:seconde)
Year=`date +%Y`      # capturer une valeur dans une variable
```

## 11. Redirections et pipes

Chaque processus a trois **canaux** (*file descriptors*) :

| N° | Nom | Par défaut | Usage |
|---|---|---|---|
| **0** | **stdin** | clavier | lecture seule |
| **1** | **stdout** | terminal | écriture seule |
| **2** | **stderr** | terminal | écriture seule |
| 3+ | *filename* | — | autres fichiers |

| Syntaxe | Effet |
|---|---|
| `> file` | stdout vers un fichier, **écrase** |
| `>> file` | stdout vers un fichier, **ajoute à la fin** |
| `2> file` | **stderr** vers un fichier |
| `2> /dev/null` | **jeter** les erreurs |
| `> file 2>&1` ou `&> file` | stdout **et** stderr dans le **même** fichier |
| `>> file 2>&1` ou `&>> file` | les deux, **en ajout** |
| `cmd1 \| cmd2` | **pipe** : stdout de cmd1 → stdin de cmd2 |
| `cmd \| tee file` | **enregistre** dans un fichier **et** affiche |

```bash
date > /tmp/saved-timestamp                      # écrase
find /etc -name passwd > output 2> errors        # résultats et erreurs séparés
find /etc -name passwd 2> /dev/null              # ignorer "Permission denied"
ls -l | tee saved-output | less                  # garder une copie au milieu d'un pipe
```

> **Piège :** `>` **écrase**, `>>` **ajoute**. Et `2>` redirige **stderr**
> (les erreurs), pas stdout.

## 12. Utilisateurs, groupes et permissions

- `id` : UID, GID et groupes de l'utilisateur.
- `ls -l` : la 3e colonne est le **propriétaire** du fichier.
- `ps au` : la 1re colonne est l'**utilisateur** de chaque processus.
- `su - user` : ouvre un **login shell** (environnement propre de
  l'utilisateur) ; `su user` : garde l'environnement courant. Sans nom,
  `su` passe en **root**.

### chmod : méthode symbolique

`chmod WhoWhatWhich file` :

| Qui (*who*) | Quoi (*what*) | Lequel (*which*) |
|---|---|---|
| **u** user, **g** group, **o** other, **a** all | **+** ajouter, **-** retirer, **=** fixer exactement | **r**, **w**, **x** |

```bash
chmod go-rw file1      # retire read et write au groupe et aux autres
chmod a+x file2        # ajoute execute pour tout le monde
chmod -R g+rwX demodir # récursif ; X majuscule = execute seulement sur les dossiers
```

### chmod : méthode numérique

**r = 4, w = 2, x = 1**, un chiffre pour user, group, other.

| Exemple | Calcul | Résultat |
|---|---|---|
| `-rwxr-x---` | 4+2+1, 4+0+1, 0 | **750** |
| `-rw-r-----` | 4+2, 4, 0 | **640** |
| `chmod 750 sampledir` | | `rwxr-x---` |

### chown : changer le propriétaire

```bash
chown student foofile          # nouveau propriétaire
chown -R student foodir        # récursif sur tout un dossier
chown :admins foofile          # changer seulement le groupe
```

## 13. Les processus sous Linux

- Un processus est une **instance en cours d'exécution** d'un programme : un
  **espace d'adressage**, des **propriétés de sécurité** (propriétaire,
  privilèges), **un ou plusieurs threads**, un **état**.
- Un parent **duplique** son espace d'adressage (**fork**) pour créer un
  enfant ; chaque processus a un **PID** unique et connaît le **PPID** de son
  parent. Tous descendent du premier processus, **systemd (PID 1)**.
- L'enfant peut **exec** son propre code ; le parent **dort** (*wait*) jusqu'à
  la fin de l'enfant. À sa sortie, l'enfant libère ses ressources ; ce qui
  reste est le **zombie**, que le parent nettoie.

**États dans `ps` (colonne STAT) :**

| Lettre | État |
|---|---|
| **R** | running (ou prêt à tourner) |
| **S** | sleeping (en attente, interruptible) |
| **D** | uninterruptible sleep (souvent une E/S disque) |
| **T** | stopped (mis en pause, ex. Ctrl+Z) |
| **Z** | zombie |

## 14. Daemons et systemd (rappel)

**systemd** gère le démarrage et les services, au boot et pendant le
fonctionnement. Un **daemon** attend ou tourne **en arrière-plan** ; il
démarre en général au boot et tourne jusqu'à l'arrêt ; son nom finit souvent
par **« d »**. Pour écouter les connexions, un daemon utilise un **socket**.

---

## À retenir

- Thread = unité d'exécution **dans** un processus ; **partage** code, data,
  fichiers ; **propre** : ID, PC, registres, **stack**.
- Avantages : **responsiveness, resource sharing, economy, scalability**.
- **Concurrency** = plusieurs tâches progressent (1 cœur possible) ;
  **parallelism** = en même temps (plusieurs cœurs). **Data** vs **task**
  parallelism.
- **Amdahl** : speedup ≤ 1 / (S + (1 − S)/N) ; maximum = **1 / S**. 25 %
  séquentiel → ×1,6 avec 2 cœurs, ×4 au maximum.
- **Many-to-one** (un blocage bloque tout, pas de parallélisme),
  **one-to-one** (**Linux, Windows**), **many-to-many**, **two-level**.
- **Pthreads** = spécification POSIX. Implicit threading : **thread pools,
  fork-join, OpenMP, GCD, TBB**.
- `exec()` remplace **tout le processus**. Signal : handler **par défaut** ou
  **utilisateur**. Annulation **asynchrone** (immédiate) vs **différée** (par
  défaut, aux cancellation points). **TLS** = copie par thread.
- Windows : ETHREAD, KTHREAD (noyau), **TEB** (utilisateur). Linux : **tasks**,
  **`clone()`**.
- Lab : zombies = STAT **Z** ; `uptime` = load 1/5/15 min ; `df -h` disque ;
  `free -h` RAM. **0 stdin, 1 stdout, 2 stderr** ; `>` écrase, `>>` ajoute,
  `2>&1` fusionne ; `tee`. `chmod u/g/o/a +-= rwx` ; **r4 w2 x1**.

## Pièges classiques du quiz

| Affirmation | Vrai / Faux |
|---|---|
| Les threads d'un processus partagent leur pile | **Faux** : chaque thread a sa pile |
| Créer un thread coûte plus cher que créer un processus | **Faux** |
| La concurrence nécessite plusieurs cœurs | **Faux** : c'est le parallélisme |
| Avec 25 % séquentiel et une infinité de cœurs, le speedup est infini | **Faux** : 4 au maximum |
| Linux utilise le modèle many-to-one | **Faux** : one-to-one |
| Dans le many-to-one, un thread qui bloque bloque tous les autres | **Vrai** |
| Pthreads est une implémentation précise | **Faux** : une spécification |
| L'annulation par défaut est asynchrone | **Faux** : différée |
| `exec()` ne remplace que le thread appelant | **Faux** : tout le processus |
| `>>` écrase le fichier | **Faux** : il ajoute |
| stderr est le descripteur 1 | **Faux** : 2 |
