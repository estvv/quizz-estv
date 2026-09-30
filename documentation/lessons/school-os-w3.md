# Operating System — Week 3 · OS structures & Shell basics

**Cours** : chapitre 2 du Silberschatz, *Operating-System Structures* : les
services de l'OS, les interfaces, les **system calls**, les programmes système,
linker et loader, les structures d'OS (**monolithic, layered, microkernel,
modules, hybrid**), le boot, le debugging.
**Lab** : la hiérarchie du système de fichiers Linux, la gestion des fichiers,
les commandes Ubuntu, les premiers scripts shell et le push sur GitHub.

> **En bref.** Les programmes n'accèdent jamais directement au matériel : ils
> demandent un service à l'OS via un **system call**, en général à travers une
> **API** (POSIX, Win32, Java). La façon d'organiser le noyau est un compromis
> entre **performance** (tout dans un gros noyau) et **fiabilité / modularité**
> (le minimum dans le noyau).

---

# Partie 1 — Cours

## 1. Les services de l'OS

L'OS fournit un **environnement d'exécution** pour les programmes, et des
services aux programmes et aux utilisateurs.

```diagram
{
  "title": "A view of operating-system services: user interfaces on top, the services reached through system calls, the hardware below.",
  "groups": [
    { "x": 340, "y": 82, "w": 640, "h": 48, "label": "user interfaces", "tone": "sky", "labelAlign": "right" },
    { "x": 340, "y": 235, "w": 640, "h": 150, "label": "services", "tone": "amber", "labelAlign": "right" }
  ],
  "nodes": [
    { "id": "u", "x": 340, "y": 25, "w": 380, "h": 34, "label": "user and other system programs", "tone": "neutral", "filled": true },
    { "id": "gui", "x": 140, "y": 90, "w": 90, "h": 30, "label": "GUI", "tone": "sky", "filled": true, "size": 12 },
    { "id": "touch", "x": 250, "y": 90, "w": 100, "h": 30, "label": "touch screen", "tone": "sky", "filled": true, "size": 12 },
    { "id": "cli", "x": 370, "y": 90, "w": 100, "h": 30, "label": "command line", "tone": "sky", "filled": true, "size": 12 },
    { "id": "batch", "x": 490, "y": 90, "w": 90, "h": 30, "label": "batch", "tone": "sky", "filled": true, "size": 12 },
    { "id": "sc", "x": 340, "y": 138, "w": 640, "h": 30, "label": "system calls", "tone": "emerald", "filled": true },
    { "id": "s1", "x": 100, "y": 220, "w": 110, "h": 44, "label": "program\nexecution", "size": 12 },
    { "id": "s2", "x": 220, "y": 220, "w": 110, "h": 44, "label": "I/O\noperations", "size": 12 },
    { "id": "s3", "x": 340, "y": 220, "w": 110, "h": 44, "label": "file\nsystems", "size": 12 },
    { "id": "s4", "x": 460, "y": 220, "w": 110, "h": 44, "label": "communication", "size": 12 },
    { "id": "s5", "x": 580, "y": 220, "w": 110, "h": 44, "label": "resource\nallocation", "size": 12 },
    { "id": "s6", "x": 160, "y": 280, "w": 110, "h": 44, "label": "logging /\naccounting", "size": 12 },
    { "id": "s7", "x": 340, "y": 280, "w": 130, "h": 44, "label": "error\ndetection", "size": 12 },
    { "id": "s8", "x": 520, "y": 280, "w": 130, "h": 44, "label": "protection\nand security", "size": 12 },
    { "id": "os", "x": 340, "y": 345, "w": 640, "h": 30, "label": "operating system", "tone": "amber", "filled": true },
    { "id": "hw", "x": 340, "y": 400, "w": 640, "h": 30, "label": "hardware", "tone": "violet", "filled": true }
  ],
  "edges": []
}
```

**Services utiles à l'utilisateur :**

| Service | Rôle |
|---|---|
| **User interface (UI)** | **CLI** (ligne de commande), **GUI** (graphique), **touch-screen**, **batch** |
| **Program execution** | charger un programme en mémoire, l'exécuter, le terminer normalement ou anormalement (erreur) |
| **I/O operations** | un programme peut avoir besoin d'E/S sur un fichier ou un périphérique |
| **File-system manipulation** | lire, écrire, créer, supprimer, chercher des fichiers et dossiers, gérer les **permissions** |
| **Communications** | échanges entre processus, sur la même machine ou via le réseau : **shared memory** ou **message passing** |
| **Error detection** | surveiller les erreurs (CPU, mémoire, E/S, programme) et réagir ; outils de debugging |

**Services pour le bon fonctionnement du système lui-même :**

| Service | Rôle |
|---|---|
| **Resource allocation** | répartir CPU, mémoire, stockage, périphériques entre les jobs concurrents |
| **Logging** (accounting) | savoir qui utilise combien et quelles ressources |
| **Protection and security** | **protection** : tout accès aux ressources est contrôlé ; **security** : défense contre l'extérieur (authentification…) |

> **Piège :** *resource allocation*, *logging* et *protection & security*
> servent **le système**, pas directement l'utilisateur.

## 2. Les interfaces utilisateur

- **CLI** (*command-line interpreter*) : on tape des commandes. Parfois dans le
  noyau, souvent un programme système ; il en existe plusieurs variantes : les
  **shells** (bash, zsh…). Son travail : **lire une commande et l'exécuter**.
  Certaines commandes sont **intégrées** (*built-in*, comme `cd`), d'autres sont
  juste **des noms de programmes** (`ls` est le programme `/bin/ls`) : ajouter
  une commande ne demande alors **pas de modifier le shell**.
- **GUI** : la **métaphore du bureau** (icônes, dossiers, souris), inventée au
  **Xerox PARC**. Windows = GUI + shell « command » ; macOS = GUI *Aqua* sur un
  noyau UNIX ; Linux = CLI + GUI optionnelle (**GNOME**, KDE).
- **Touchscreen** : gestes, clavier virtuel, commandes vocales.

## 3. Les system calls

Un **system call** est l'**interface de programmation vers les services de
l'OS**. Les programmes passent le plus souvent par une **API** de haut niveau
plutôt que d'appeler directement les system calls :

| API | Où |
|---|---|
| **Win32 API** | Windows |
| **POSIX API** | quasiment tous les UNIX, **Linux**, macOS |
| **Java API** | la machine virtuelle Java (JVM) |

**Exemple : copier un fichier**, c'est déjà une longue suite de system calls :
demander les noms des fichiers, ouvrir l'entrée (abandon si elle n'existe pas),
créer la sortie (abandon ou question si elle existe), boucle *lire → écrire*
jusqu'à la fin, fermer, afficher un message, terminer normalement.

### Comment c'est implémenté

Chaque system call a un **numéro**. La **system-call interface** tient une
**table indexée par ces numéros** : elle appelle la bonne fonction du noyau et
renvoie le statut et les valeurs de retour. L'appelant n'a **rien besoin de
savoir** de l'implémentation : il suit l'API, et la **run-time support
library** (livrée avec le compilateur) cache les détails.

```diagram
{
  "title": "API – system call – OS relationship: open() in a user program becomes system call i through the system-call interface.",
  "groups": [
    { "x": 360, "y": 70, "w": 620, "h": 90, "label": "user mode", "tone": "sky", "labelAlign": "right" },
    { "x": 360, "y": 260, "w": 620, "h": 170, "label": "kernel mode", "tone": "amber", "labelAlign": "right" }
  ],
  "nodes": [
    { "id": "app", "x": 200, "y": 70, "w": 200, "h": 60, "label": "user application\n\nopen()", "tone": "sky", "filled": true, "size": 12 },
    { "id": "sci", "x": 360, "y": 150, "w": 300, "h": 34, "label": "system call interface", "tone": "emerald", "filled": true },
    { "id": "tbl", "x": 560, "y": 245, "shape": "table", "size": 11, "cols": [36, 120], "header": false, "rows": [["","..."],["i","open()"],["","..."]], "mark": [1] },
    { "id": "impl", "x": 200, "y": 300, "w": 220, "h": 60, "label": "implementation\nof open() system call\n…\nreturn", "tone": "amber", "filled": true, "size": 12 }
  ],
  "edges": [
    { "from": "app", "to": "sci", "label": "call" },
    { "from": "sci", "to": "tbl", "label": "index i", "dashed": true },
    { "from": "tbl", "to": "impl", "dashed": true },
    { "from": "impl", "to": "app", "label": "return", "via": [[70, 300], [70, 70]] }
  ]
}
```

Exemple typique : en C, `printf()` appelle la **bibliothèque C standard**, qui
fait elle-même le system call **`write()`**.

```diagram
{
  "title": "Standard C library example: printf() in user mode ends up in the write() system call in kernel mode.",
  "groups": [
    { "x": 330, "y": 90, "w": 560, "h": 150, "label": "user mode", "tone": "sky", "labelAlign": "right" },
    { "x": 330, "y": 270, "w": 560, "h": 70, "label": "kernel mode", "tone": "amber", "labelAlign": "right" }
  ],
  "nodes": [
    { "id": "prog", "x": 180, "y": 85, "w": 220, "h": 50, "label": "C program\nprintf(\"Greetings\");", "size": 12, "tone": "sky", "filled": true },
    { "id": "lib", "x": 330, "y": 150, "w": 480, "h": 34, "label": "standard C library", "tone": "neutral", "filled": true, "size": 12 },
    { "id": "sc", "x": 480, "y": 210, "label": "system call boundary", "size": 11, "shape": "text" },
    { "id": "wr", "x": 330, "y": 285, "w": 240, "h": 34, "label": "write() system call", "tone": "amber", "filled": true, "size": 12 },
    { "id": "lt", "x": 180, "y": 134, "shape": "text" },
    { "id": "lb", "x": 330, "y": 168, "shape": "text" }
  ],
  "edges": [
    { "from": "prog", "to": "lt", "label": "printf()" },
    { "from": "lb", "to": "wr", "arrow": "both" }
  ]
}
```

### Passer des paramètres au noyau

| Méthode | Comment | Remarque |
|---|---|---|
| **Registers** | paramètres dans les registres du CPU | le plus simple, mais le nombre de registres est limité |
| **Block / table** | paramètres dans un bloc mémoire, **l'adresse** du bloc dans un registre | méthode de **Linux** et **Solaris** |
| **Stack** | le programme **empile** (*push*), l'OS **dépile** (*pop*) | |

Les méthodes **block** et **stack** ne limitent **ni le nombre ni la taille**
des paramètres.

```diagram
{
  "title": "Parameter passing via table: the register holds the address X of the block; the kernel reads the parameters from there.",
  "nodes": [
    { "id": "x", "x": 100, "y": 60, "w": 130, "h": 44, "label": "X: parameters\nfor call", "tone": "violet", "filled": true, "size": 12 },
    { "id": "xv", "x": 330, "y": 150, "w": 110, "h": 44, "label": "register\nX", "tone": "amber", "filled": true, "size": 12 },
    { "id": "up", "x": 100, "y": 290, "w": 160, "h": 50, "label": "load address X\nsystem call 13", "tone": "sky", "filled": true, "size": 12 },
    { "id": "upl", "x": 100, "y": 345, "shape": "text", "label": "user program", "size": 11 },
    { "id": "os", "x": 560, "y": 190, "w": 190, "h": 60, "label": "use parameters\nfrom table X", "tone": "amber", "filled": true, "size": 12 },
    { "id": "c13", "x": 560, "y": 270, "w": 190, "h": 40, "label": "code for\nsystem call 13", "size": 12 },
    { "id": "osl", "x": 560, "y": 320, "shape": "text", "label": "operating system", "size": 11 }
  ],
  "edges": [
    { "from": "up", "to": "xv", "label": "1 · load X" },
    { "from": "xv", "to": "os", "label": "2 · system call 13" },
    { "from": "os", "to": "x", "label": "3 · read parameters", "dashed": true, "via": [[560, 60]] },
    { "from": "os", "to": "c13", "arrow": "none" }
  ]
}
```

### Les six catégories de system calls

| Catégorie | Exemples | Équivalents UNIX |
|---|---|---|
| **Process control** | créer / terminer un processus, charger, exécuter, attendre, allouer de la mémoire | `fork()`, `exec()`, `exit()`, `wait()` |
| **File management** | créer, supprimer, ouvrir, fermer, lire, écrire | `open()`, `read()`, `write()`, `close()` |
| **Device management** | demander / libérer un périphérique, lire, écrire | `ioctl()`, `read()`, `write()` |
| **Information maintenance** | lire / régler l'heure, la date, les attributs | `getpid()`, `alarm()`, `sleep()` |
| **Communications** | créer une connexion, envoyer / recevoir des messages, mémoire partagée | `pipe()`, `shm_open()`, `mmap()` |
| **Protection** | contrôler l'accès, lire / changer les permissions | `chmod()`, `umask()`, `chown()` |

> **Astuce :** retiens l'acronyme **P-F-D-I-C-P** : **P**rocess, **F**ile,
> **D**evice, **I**nformation, **C**ommunications, **P**rotection.

### Deux exemples

- **Arduino** : **mono-tâche**, **pas d'OS**. Un **boot loader** charge le
  programme (*sketch*) envoyé par USB dans la mémoire flash.
- **FreeBSD** (UNIX, multitâche) : à la connexion, le shell de l'utilisateur
  démarre. Pour lancer une commande, le shell fait **`fork()`** (crée un
  processus) puis **`exec()`** (y charge le programme), et **attend** sa fin.
  Le processus se termine avec le code **0 = pas d'erreur**, **> 0 = code
  d'erreur**.

```diagram
{
  "title": "Arduino memory at startup and while running a sketch (left); FreeBSD memory with several processes resident (right).",
  "nodes": [
    { "id": "ha", "x": 150, "y": 12, "shape": "text", "label": "Arduino", "bold": true },
    { "id": "hb", "x": 520, "y": 12, "shape": "text", "label": "FreeBSD", "bold": true },
    { "id": "a1f", "x": 80, "y": 70, "w": 110, "h": 60, "label": "free memory", "size": 11 },
    { "id": "a1b", "x": 80, "y": 115, "w": 110, "h": 30, "label": "boot loader", "size": 11, "tone": "amber", "filled": true },
    { "id": "a1l", "x": 80, "y": 145, "shape": "text", "label": "(a) at system startup", "size": 10 },
    { "id": "a2f", "x": 220, "y": 55, "w": 110, "h": 30, "label": "free memory", "size": 11 },
    { "id": "a2p", "x": 220, "y": 85, "w": 110, "h": 30, "label": "user program\n(sketch)", "size": 10, "tone": "sky", "filled": true },
    { "id": "a2b", "x": 220, "y": 115, "w": 110, "h": 30, "label": "boot loader", "size": 11, "tone": "amber", "filled": true },
    { "id": "a2l", "x": 220, "y": 145, "shape": "text", "label": "(b) running a program", "size": 10 },
    { "id": "hi", "x": 420, "y": 40, "shape": "text", "label": "high memory", "size": 10 },
    { "id": "lo", "x": 420, "y": 240, "shape": "text", "label": "low memory", "size": 10 },
    { "id": "k", "x": 560, "y": 50, "w": 160, "h": 30, "label": "kernel", "size": 11, "tone": "amber", "filled": true },
    { "id": "fm", "x": 560, "y": 80, "w": 160, "h": 30, "label": "free memory", "size": 11 },
    { "id": "pc", "x": 560, "y": 110, "w": 160, "h": 30, "label": "process C", "size": 11, "tone": "sky", "filled": true },
    { "id": "in", "x": 560, "y": 140, "w": 160, "h": 30, "label": "interpreter", "size": 11, "tone": "emerald", "filled": true },
    { "id": "pb", "x": 560, "y": 170, "w": 160, "h": 30, "label": "process B", "size": 11, "tone": "sky", "filled": true },
    { "id": "pd", "x": 560, "y": 200, "w": 160, "h": 30, "label": "process D", "size": 11, "tone": "sky", "filled": true }
  ],
  "edges": []
}
```

## 4. Les programmes système

Les **system programs** offrent un environnement pratique pour développer et
exécuter des programmes. **La vision que les utilisateurs ont de l'OS vient des
programmes système, pas des system calls.**

| Catégorie | Exemples |
|---|---|
| **File management** | créer, copier, renommer, lister des fichiers (`cp`, `mv`, `ls`) |
| **Status information** | date, heure, mémoire libre, espace disque ; parfois un **registry** |
| **File modification** | éditeurs de texte, recherche et transformation de texte (`nano`, `grep`) |
| **Programming-language support** | compilateurs, assembleurs, debuggers, interpréteurs |
| **Program loading and execution** | loaders, linkage editors |
| **Communications** | messages, navigation, e-mail, connexion à distance, transfert de fichiers |
| **Background services** | lancés au boot : **services**, **subsystems**, **daemons** ; ils tournent en **user context** |
| **Application programs** | pas considérés comme faisant partie de l'OS |

## 5. Linker et loader

1. Le **compiler** transforme le code source en **relocatable object files**
   (`main.o`), chargeables à n'importe quelle adresse.
2. Le **linker** les combine, avec les **bibliothèques**, en un **binary
   executable**.
3. Le **loader** charge l'exécutable en mémoire ; la **relocation** fixe les
   adresses finales.

Les systèmes modernes utilisent des **dynamically linked libraries** (**DLL**
sous Windows, `.so` sous Linux) : chargées **à la demande** et **partagées**
par tous les programmes qui utilisent la même version. Les fichiers objets et
exécutables ont un **format standard** (**ELF** sous Linux).

```diagram
{
  "title": "The role of the linker and loader: from source to a program running in memory.",
  "nodes": [
    { "id": "src", "x": 70, "y": 40, "w": 90, "h": 40, "label": "main.c", "shape": "note", "tone": "sky" },
    { "id": "cc", "x": 210, "y": 40, "w": 90, "h": 40, "label": "compiler\n(gcc)", "tone": "amber", "filled": true, "size": 12 },
    { "id": "obj", "x": 350, "y": 40, "w": 110, "h": 40, "label": "main.o\n(object file)", "shape": "note", "tone": "sky", "size": 12 },
    { "id": "others", "x": 350, "y": 120, "w": 110, "h": 40, "label": "other\nobject files", "shape": "note", "tone": "neutral", "size": 12 },
    { "id": "ld", "x": 520, "y": 80, "w": 90, "h": 40, "label": "linker", "tone": "amber", "filled": true, "size": 12 },
    { "id": "exe", "x": 520, "y": 170, "w": 130, "h": 40, "label": "main\n(executable file)", "shape": "note", "tone": "emerald", "size": 12 },
    { "id": "loader", "x": 520, "y": 260, "w": 90, "h": 40, "label": "loader", "tone": "amber", "filled": true, "size": 12 },
    { "id": "mem", "x": 520, "y": 350, "w": 150, "h": 44, "label": "program\nin memory", "tone": "violet", "filled": true, "size": 12 },
    { "id": "dll", "x": 300, "y": 260, "w": 150, "h": 44, "label": "dynamically\nlinked libraries", "shape": "note", "tone": "neutral", "size": 12 },
    { "id": "run", "x": 300, "y": 350, "shape": "text", "label": "./main", "size": 12, "bold": true }
  ],
  "edges": [
    { "from": "src", "to": "cc" },
    { "from": "cc", "to": "obj" },
    { "from": "obj", "to": "ld" }, { "from": "others", "to": "ld" },
    { "from": "ld", "to": "exe" },
    { "from": "exe", "to": "loader" },
    { "from": "dll", "to": "loader", "dashed": true, "label": "loaded on demand" },
    { "from": "loader", "to": "mem" },
    { "from": "run", "to": "loader", "dashed": true }
  ]
}
```

### Pourquoi une appli est liée à son OS

Un binaire compilé pour un OS ne tourne en général pas sur un autre : chaque OS
a **ses propres system calls** et formats de fichiers. Une appli peut être
multi-OS si elle est écrite dans un **langage interprété** (Python), si elle
tourne dans une **VM** (Java) ou si elle est **recompilée** pour chaque OS (C).
L'**ABI** (*Application Binary Interface*) est l'équivalent de l'API **au
niveau binaire** : comment le code binaire interagit avec un OS donné sur une
architecture donnée.

## 6. Conception : policy vs mechanism

- **User goals** : pratique, facile à apprendre, fiable, sûr, rapide.
- **System goals** : facile à concevoir, implémenter, maintenir ; flexible,
  fiable, sans erreurs, efficace.

**Le principe clé :** séparer la **policy** (**quoi** faire) du **mechanism**
(**comment** le faire).

| | Exemple |
|---|---|
| **Policy** (*what*) | « interrompre le programme toutes les 100 ms » |
| **Mechanism** (*how*) | le **timer** matériel |

Si la politique change (200 ms au lieu de 100), on ne touche **pas** au
mécanisme : maximum de **flexibilité**.

**Implémentation** : avant en assembleur, aujourd'hui surtout en **C / C++**
(bas niveau en assembleur, programmes système en C, C++, Python, shell). Un
langage de haut niveau est plus facile à **porter**, mais plus lent.

## 7. Les structures d'OS

### Monolithic — UNIX d'origine

Deux parties : les **programmes système** et le **kernel**, qui contient
**tout** ce qui est sous l'interface des system calls et au-dessus du matériel
(fichiers, ordonnancement, mémoire…). Beaucoup de fonctions à un seul niveau.

```diagram
{
  "title": "Traditional UNIX system structure: beyond simple, but not fully layered.",
  "nodes": [
    { "id": "users", "x": 330, "y": 20, "w": 640, "h": 30, "label": "(the users)", "tone": "neutral", "filled": true, "size": 12 },
    { "id": "sh", "x": 330, "y": 62, "w": 640, "h": 40, "label": "shells and commands · compilers and interpreters · system libraries", "tone": "sky", "filled": true, "size": 12 },
    { "id": "sci", "x": 330, "y": 105, "w": 640, "h": 26, "label": "system-call interface to the kernel", "tone": "emerald", "filled": true, "size": 11 },
    { "id": "k1", "x": 140, "y": 165, "w": 240, "h": 70, "label": "signals · terminal handling\ncharacter I/O system\nterminal drivers", "tone": "amber", "filled": true, "size": 11 },
    { "id": "k2", "x": 330, "y": 165, "w": 130, "h": 70, "label": "file system\nswapping\nblock I/O system\ndisk and tape drivers", "tone": "amber", "filled": true, "size": 11 },
    { "id": "k3", "x": 520, "y": 165, "w": 240, "h": 70, "label": "CPU scheduling\npage replacement\ndemand paging\nvirtual memory", "tone": "amber", "filled": true, "size": 11 },
    { "id": "khi", "x": 330, "y": 213, "w": 640, "h": 26, "label": "kernel interface to the hardware", "tone": "emerald", "filled": true, "size": 11 },
    { "id": "h1", "x": 140, "y": 260, "w": 240, "h": 34, "label": "terminal controllers · terminals", "tone": "violet", "filled": true, "size": 11 },
    { "id": "h2", "x": 330, "y": 260, "w": 130, "h": 34, "label": "device controllers\ndisks and tapes", "tone": "violet", "filled": true, "size": 11 },
    { "id": "h3", "x": 520, "y": 260, "w": 240, "h": 34, "label": "memory controllers · physical memory", "tone": "violet", "filled": true, "size": 11 }
  ],
  "edges": []
}
```

**Linux** est **monolithique + modulaire** : les applis appellent **glibc**,
qui passe l'interface des system calls ; le noyau accepte des **loadable
kernel modules**.

```diagram
{
  "title": "Linux system structure: monolithic kernel plus loadable modules.",
  "nodes": [
    { "id": "app", "x": 330, "y": 20, "w": 600, "h": 30, "label": "applications", "tone": "sky", "filled": true, "size": 12 },
    { "id": "glibc", "x": 330, "y": 56, "w": 600, "h": 26, "label": "glibc standard C library", "tone": "sky", "size": 11 },
    { "id": "sci", "x": 330, "y": 90, "w": 600, "h": 26, "label": "system-call interface", "tone": "emerald", "filled": true, "size": 11 },
    { "id": "fs", "x": 100, "y": 135, "w": 120, "h": 34, "label": "file systems", "tone": "amber", "filled": true, "size": 11 },
    { "id": "sched", "x": 255, "y": 135, "w": 140, "h": 34, "label": "CPU scheduler", "tone": "amber", "filled": true, "size": 11 },
    { "id": "net", "x": 410, "y": 135, "w": 120, "h": 34, "label": "networks", "tone": "amber", "filled": true, "size": 11 },
    { "id": "mm", "x": 560, "y": 135, "w": 140, "h": 34, "label": "memory manager", "tone": "amber", "filled": true, "size": 11 },
    { "id": "blk", "x": 180, "y": 178, "w": 140, "h": 30, "label": "block devices", "tone": "amber", "filled": true, "size": 11 },
    { "id": "chr", "x": 480, "y": 178, "w": 160, "h": 30, "label": "character devices", "tone": "amber", "filled": true, "size": 11 },
    { "id": "drv", "x": 330, "y": 218, "w": 600, "h": 30, "label": "device drivers  (loadable kernel modules)", "tone": "amber", "size": 11 },
    { "id": "kl", "x": 20, "y": 175, "shape": "text", "label": "kernel", "size": 11, "bold": true },
    { "id": "hw", "x": 330, "y": 265, "w": 600, "h": 30, "label": "hardware", "tone": "violet", "filled": true, "size": 12 }
  ],
  "edges": []
}
```

### Layered

L'OS est découpé en **couches** : la **couche 0** est le **matériel**, la
**couche N** l'**interface utilisateur**. Chaque couche n'utilise **que les
couches inférieures**. Facile à déboguer couche par couche, mais difficile de
bien définir les couches, et traverser les couches coûte du temps.

```diagram
{
  "title": "Layered approach: layer 0 is the hardware, each layer only uses the layers below it, layer N is the user interface.",
  "nodes": [
    { "id": "l3", "x": 330, "y": 150, "w": 440, "h": 260, "shape": "ellipse", "tone": "sky", "filled": true },
    { "id": "l2", "x": 330, "y": 150, "w": 330, "h": 195, "shape": "ellipse", "tone": "emerald", "filled": true },
    { "id": "l1", "x": 330, "y": 150, "w": 220, "h": 130, "shape": "ellipse", "tone": "amber", "filled": true },
    { "id": "l0", "x": 330, "y": 150, "w": 110, "h": 65, "shape": "ellipse", "tone": "violet", "filled": true, "label": "layer 0\nhardware", "size": 11 },
    { "id": "t1", "x": 330, "y": 100, "shape": "text", "label": "layer 1", "size": 11 },
    { "id": "t2", "x": 330, "y": 66, "shape": "text", "label": "…", "size": 11 },
    { "id": "t3", "x": 330, "y": 34, "shape": "text", "label": "layer N — user interface", "size": 11, "bold": true }
  ],
  "edges": []
}
```

### Microkernel

On déplace **le plus de choses possible du noyau vers l'espace utilisateur**.
Il ne reste dans le noyau que le minimum : **communication (IPC), gestion
mémoire, ordonnancement CPU**. Les modules utilisateur communiquent par
**message passing**. Exemple : **Mach** (dont est en partie issu **Darwin**,
le noyau de macOS).

```diagram
{
  "title": "Microkernel system structure: file system, device drivers and applications run in user mode and talk through messages; only IPC, memory management and scheduling stay in the kernel.",
  "groups": [
    { "x": 330, "y": 50, "w": 640, "h": 70, "label": "user mode", "tone": "sky", "labelAlign": "right" },
    { "x": 330, "y": 170, "w": 640, "h": 70, "label": "kernel mode", "tone": "amber", "labelAlign": "right" }
  ],
  "nodes": [
    { "id": "app", "x": 130, "y": 60, "w": 130, "h": 40, "label": "application\nprogram", "tone": "sky", "filled": true, "size": 12 },
    { "id": "fs", "x": 330, "y": 60, "w": 130, "h": 40, "label": "file\nsystem", "tone": "sky", "filled": true, "size": 12 },
    { "id": "dd", "x": 530, "y": 60, "w": 130, "h": 40, "label": "device\ndriver", "tone": "sky", "filled": true, "size": 12 },
    { "id": "mk", "x": 330, "y": 180, "w": 600, "h": 44, "label": "microkernel:  interprocess communication · memory management · CPU scheduling", "tone": "amber", "filled": true, "size": 12 },
    { "id": "hw", "x": 330, "y": 260, "w": 600, "h": 30, "label": "hardware", "tone": "violet", "filled": true, "size": 12 },
    { "id": "m1", "x": 130, "y": 159, "shape": "text" },
    { "id": "m2", "x": 330, "y": 159, "shape": "text" },
    { "id": "m3", "x": 530, "y": 159, "shape": "text" }
  ],
  "edges": [
    { "from": "app", "to": "m1", "arrow": "both", "label": "messages" },
    { "from": "fs", "to": "m2", "arrow": "both", "label": "messages" },
    { "from": "dd", "to": "m3", "arrow": "both", "label": "messages" },
    { "from": "mk", "to": "hw", "arrow": "none" }
  ]
}
```

| Avantages | Inconvénient |
|---|---|
| plus facile à **étendre**, à **porter**, plus **fiable** (moins de code en mode noyau), plus **sûr** | **surcoût de performance** des messages entre espace utilisateur et noyau |

### Modules

La plupart des OS modernes utilisent des **loadable kernel modules (LKMs)** :
chaque composant est séparé, parle aux autres via des **interfaces connues** et
se **charge à la demande** dans le noyau. Ressemble aux couches, mais plus
flexible (Linux, Solaris).

### Hybrid

Aucun OS moderne n'est un modèle pur :

| Système | Structure |
|---|---|
| **Linux, Solaris** | **monolithique** + **modules** |
| **Windows** | surtout **monolithique**, + **microkernel** pour les sous-systèmes |
| **macOS / iOS** | **hybride en couches** : noyau **Darwin** = **Mach** + **BSD UNIX** + I/O kit + *kernel extensions* |
| **Android** | noyau **Linux modifié** + runtime **ART** (ex-Dalvik) + bibliothèques (Bionic, SQLite, webkit) |

```diagram
{
  "title": "macOS/iOS layers and the Darwin kernel environment underneath.",
  "nodes": [
    { "id": "h1", "x": 150, "y": 10, "shape": "text", "label": "macOS / iOS", "bold": true },
    { "id": "h2", "x": 500, "y": 10, "shape": "text", "label": "Darwin", "bold": true },
    { "id": "a1", "x": 150, "y": 45, "w": 220, "h": 30, "label": "applications", "tone": "sky", "filled": true, "size": 12 },
    { "id": "a2", "x": 150, "y": 85, "w": 220, "h": 30, "label": "user experience (Aqua · Springboard)", "tone": "sky", "size": 11 },
    { "id": "a3", "x": 150, "y": 125, "w": 220, "h": 30, "label": "application frameworks (Cocoa)", "tone": "sky", "size": 11 },
    { "id": "a4", "x": 150, "y": 165, "w": 220, "h": 30, "label": "core frameworks", "tone": "sky", "size": 11 },
    { "id": "a5", "x": 150, "y": 205, "w": 220, "h": 30, "label": "kernel environment (Darwin)", "tone": "amber", "filled": true, "size": 11 },
    { "id": "d1", "x": 500, "y": 45, "w": 260, "h": 30, "label": "applications", "tone": "sky", "filled": true, "size": 12 },
    { "id": "d2", "x": 500, "y": 85, "w": 260, "h": 30, "label": "library interface", "tone": "sky", "size": 11 },
    { "id": "d3a", "x": 435, "y": 125, "w": 130, "h": 30, "label": "Mach traps", "tone": "emerald", "filled": true, "size": 11 },
    { "id": "d3b", "x": 570, "y": 125, "w": 130, "h": 30, "label": "BSD (POSIX) calls", "tone": "emerald", "filled": true, "size": 11 },
    { "id": "d4", "x": 500, "y": 172, "w": 280, "h": 50, "label": "Mach kernel: memory mgmt · IPC · scheduling\nBSD kernel · I/O kit · kexts", "tone": "amber", "filled": true, "size": 11 }
  ],
  "edges": [
    { "from": "a5", "to": "d4", "dashed": true, "arrow": "none", "label": "zoom" }
  ]
}
```

```diagram
{
  "title": "Android architecture: a Linux kernel under a Java-oriented runtime and framework stack.",
  "nodes": [
    { "id": "a1", "x": 330, "y": 20, "w": 500, "h": 30, "label": "applications", "tone": "sky", "filled": true, "size": 12 },
    { "id": "a2", "x": 330, "y": 58, "w": 500, "h": 30, "label": "Android frameworks", "tone": "sky", "size": 11 },
    { "id": "a3", "x": 190, "y": 100, "w": 200, "h": 34, "label": "Android runtime (ART)\nJava virtual machine", "tone": "emerald", "filled": true, "size": 11 },
    { "id": "a3b", "x": 330, "y": 100, "w": 60, "h": 34, "label": "JNI", "tone": "emerald", "size": 11 },
    { "id": "a4", "x": 470, "y": 100, "w": 200, "h": 34, "label": "native libraries\nSQLite · openGL · webkit …", "tone": "emerald", "filled": true, "size": 11 },
    { "id": "a5", "x": 330, "y": 145, "w": 500, "h": 30, "label": "HAL (hardware abstraction layer)", "tone": "neutral", "size": 11 },
    { "id": "a6", "x": 330, "y": 182, "w": 500, "h": 30, "label": "Bionic (libc)", "tone": "neutral", "size": 11 },
    { "id": "a7", "x": 330, "y": 222, "w": 500, "h": 34, "label": "Linux kernel (modified: power management, binder IPC…)", "tone": "amber", "filled": true, "size": 11 },
    { "id": "a8", "x": 330, "y": 264, "w": 500, "h": 30, "label": "hardware", "tone": "violet", "filled": true, "size": 12 }
  ],
  "edges": []
}
```

### Tableau comparatif

| Structure | Idée | Pour | Contre | Exemple |
|---|---|---|---|---|
| **Monolithic** | un gros noyau | **rapide** | dur à étendre, un bug fait tout planter | UNIX, cœur de Linux |
| **Layered** | couches 0…N | modulaire, debug facile | couches dures à définir, lent à traverser | THE |
| **Microkernel** | minimum dans le noyau, messages | extensible, portable, fiable, sûr | **lent** (messages) | Mach |
| **Modules** | composants chargeables | flexible | toujours en mode noyau | Linux LKMs |
| **Hybrid** | mélange | compromis | pas de modèle pur | Windows, macOS, Android |

## 8. Construire et démarrer un OS

**Compiler Linux** : télécharger les sources (kernel.org) → `make menuconfig`
(configurer) → `make` (compiler → image **vmlinuz**) → `make modules` →
`make modules_install` → `make install`.

**Le boot :**

```diagram
{
  "title": "System boot: from power-on to a running kernel.",
  "nodes": [
    { "id": "p", "x": 60, "y": 50, "w": 90, "h": 40, "label": "power on", "tone": "rose", "filled": true, "size": 12 },
    { "id": "rom", "x": 200, "y": 50, "w": 130, "h": 50, "label": "ROM / EEPROM\nBIOS or UEFI", "tone": "violet", "filled": true, "size": 11 },
    { "id": "bb", "x": 370, "y": 50, "w": 120, "h": 50, "label": "boot block\n(fixed disk location)", "tone": "neutral", "size": 11 },
    { "id": "grub", "x": 540, "y": 50, "w": 130, "h": 50, "label": "bootstrap loader\nGRUB", "tone": "amber", "filled": true, "size": 11 },
    { "id": "k", "x": 540, "y": 160, "w": 130, "h": 50, "label": "kernel\nvmlinuz", "tone": "emerald", "filled": true, "size": 11 },
    { "id": "d", "x": 370, "y": 160, "w": 120, "h": 50, "label": "system daemons\n(init / systemd)", "tone": "emerald", "size": 11 },
    { "id": "run", "x": 200, "y": 160, "w": 130, "h": 50, "label": "system running\n(or single-user mode)", "tone": "sky", "filled": true, "size": 11 }
  ],
  "edges": [
    { "from": "p", "to": "rom" },
    { "from": "rom", "to": "bb", "label": "loads" },
    { "from": "bb", "to": "grub", "label": "loads" },
    { "from": "grub", "to": "k", "label": "selects & loads" },
    { "from": "k", "to": "d", "label": "starts" },
    { "from": "d", "to": "run" }
  ]
}
```

1. à l'allumage, l'exécution commence à une **adresse mémoire fixe** ;
2. le **bootstrap loader** (le **BIOS**), stocké en **ROM / EEPROM**, trouve le
   noyau. Parfois en deux temps : un **boot block** à un endroit fixe du disque
   charge le vrai bootstrap loader ;
3. les systèmes modernes remplacent le BIOS par l'**UEFI** ;
4. **GRUB** permet de choisir le noyau et ses options (dont le **single-user
   mode**) ;
5. le noyau démarre, puis les daemons (**systemd**).

## 9. Debugging et performance

- **Log files** : l'OS y écrit les erreurs.
- **Core dump** : mémoire d'un **processus** qui plante. **Crash dump** :
  mémoire du **noyau** quand l'OS plante.
- **Performance tuning** : trouver les goulots d'étranglement ; **profiling**
  (échantillonner régulièrement le pointeur d'instruction) ; outils `top`, Task
  Manager.
- **Tracing** : **strace** (system calls d'un processus), **gdb** (debugger),
  **perf** (performances Linux), **tcpdump** (paquets réseau), **BCC / BPF**.

> **Kernighan's law :** « Debugging is twice as hard as writing the code in the
> first place. »

---

# Partie 2 — Lab : shell Linux

## 10. La hiérarchie du système de fichiers

Sous Linux, **tout est dans un seul arbre** qui part de la racine **`/`** (pas
de `C:\`). Le `/` sert aussi de séparateur : `/etc/issue` est le fichier
`issue` du dossier `/etc`.

```diagram
{
  "title": "L'arborescence Linux : un seul arbre inversé, enraciné en /.",
  "nodes": [
    { "id": "root", "x": 330, "y": 30, "w": 50, "h": 34, "label": "/", "tone": "amber", "filled": true, "bold": true },
    { "id": "bin", "x": 40, "y": 110, "w": 56, "h": 30, "label": "bin", "size": 12 },
    { "id": "boot", "x": 105, "y": 110, "w": 56, "h": 30, "label": "boot", "size": 12 },
    { "id": "dev", "x": 170, "y": 110, "w": 56, "h": 30, "label": "dev", "size": 12 },
    { "id": "etc", "x": 235, "y": 110, "w": 56, "h": 30, "label": "etc", "tone": "sky", "filled": true, "size": 12 },
    { "id": "home", "x": 300, "y": 110, "w": 56, "h": 30, "label": "home", "tone": "sky", "filled": true, "size": 12 },
    { "id": "rootd", "x": 365, "y": 110, "w": 56, "h": 30, "label": "root", "size": 12 },
    { "id": "run", "x": 430, "y": 110, "w": 56, "h": 30, "label": "run", "size": 12 },
    { "id": "tmp", "x": 495, "y": 110, "w": 56, "h": 30, "label": "tmp", "size": 12 },
    { "id": "usr", "x": 560, "y": 110, "w": 56, "h": 30, "label": "usr", "size": 12 },
    { "id": "var", "x": 625, "y": 110, "w": 56, "h": 30, "label": "var", "size": 12 },
    { "id": "alice", "x": 260, "y": 190, "w": 56, "h": 30, "label": "alice", "size": 11 },
    { "id": "bob", "x": 330, "y": 190, "w": 56, "h": 30, "label": "bob", "size": 11 },
    { "id": "issue", "x": 200, "y": 190, "w": 56, "h": 30, "label": "issue", "shape": "note", "size": 11 },
    { "id": "ubin", "x": 530, "y": 190, "w": 56, "h": 30, "label": "bin", "size": 11 },
    { "id": "ulocal", "x": 595, "y": 190, "w": 56, "h": 30, "label": "local", "size": 11 },
    { "id": "vlog", "x": 660, "y": 190, "w": 56, "h": 30, "label": "log", "size": 11 }
  ],
  "edges": [
    { "from": "root", "to": "bin", "arrow": "none" }, { "from": "root", "to": "boot", "arrow": "none" }, { "from": "root", "to": "dev", "arrow": "none" },
    { "from": "root", "to": "etc", "arrow": "none" }, { "from": "root", "to": "home", "arrow": "none" }, { "from": "root", "to": "rootd", "arrow": "none" },
    { "from": "root", "to": "run", "arrow": "none" }, { "from": "root", "to": "tmp", "arrow": "none" }, { "from": "root", "to": "usr", "arrow": "none" },
    { "from": "root", "to": "var", "arrow": "none" },
    { "from": "home", "to": "alice", "arrow": "none" }, { "from": "home", "to": "bob", "arrow": "none" },
    { "from": "etc", "to": "issue", "arrow": "none" },
    { "from": "usr", "to": "ubin", "arrow": "none" }, { "from": "usr", "to": "ulocal", "arrow": "none" },
    { "from": "var", "to": "vlog", "arrow": "none" }
  ]
}
```

| Dossier | Contenu | Moyen mnémotechnique |
|---|---|---|
| **`/etc`** | **fichiers de configuration** du système | *et cetera* = les réglages |
| **`/var`** | données **variables** qui persistent : **logs** (`/var/log`), bases, cache | **var**iable |
| **`/home`** | fichiers personnels des utilisateurs (`/home/alice`) | la maison |
| **`/root`** | dossier personnel du **superutilisateur root** | ≠ la racine `/` ! |
| **`/tmp`** | fichiers **temporaires**, accessibles à tous, nettoyés régulièrement | **t**e**mp** |
| **`/dev`** | **fichiers de périphériques** (`/dev/sda` = premier disque) | **dev**ices |
| **`/boot`** | fichiers nécessaires au **démarrage** (noyau) | boot |
| **`/usr`** | logiciels installés, bibliothèques (`/usr/bin`, `/usr/sbin`, `/usr/local`) | |
| **`/bin`** | commandes essentielles (`ls`, `cp`, `mkdir`) | **bin**aires |
| **`/run`** | données d'exécution depuis le dernier boot (PID, verrous) | |

Types de contenu : **static** (ne change pas sans intervention), **dynamic /
variable** (modifié par les processus), **persistent** (survit au reboot, comme
la configuration), **runtime** (propre à un processus, effacé au reboot).

> **Piège :** **`/root`** (dossier de l'admin) ≠ **`/`** (la racine de
> l'arbre).

## 11. Gérer les fichiers et dossiers

| Action | Commande |
|---|---|
| Créer un dossier | `mkdir dir` |
| Créer des dossiers parents manquants | `mkdir -p a/b/c` |
| Créer un fichier vide | `touch file` |
| Copier un fichier | `cp file new-file` |
| Copier un dossier **et son contenu** | `cp -r dir new-dir` |
| Déplacer **ou renommer** | `mv old new` |
| Supprimer un fichier | `rm file` |
| Supprimer un dossier **non vide** | `rm -r dir` |
| Supprimer un dossier **vide** | `rmdir dir` |
| Où suis-je ? | `pwd` |
| Changer de dossier / remonter | `cd dir` / `cd ..` |
| Lister (détaillé, récursif, cachés) | `ls -l`, `ls -R`, `ls -a` |

À savoir, tiré des exemples du lab :

- `cp` **écrase** le fichier de destination s'il existe, **sans prévenir**.
- Avec plusieurs sources, le **dernier argument doit être un dossier** :
  `cp f1 f2 dossier/`.
- Sans `-r`, `cp` **ignore les dossiers** : `cp: omitting directory 'Thesis'`.
- `cp /etc/hostname .` copie dans le **dossier courant** (le `.`).
- `mv` sert **à la fois** à renommer et à déplacer.
- `rm` sans `-r` **échoue** sur un dossier : `Is a directory`.
- `rmdir` **échoue** si le dossier n'est pas vide.
- Il n'y a **pas de corbeille** en ligne de commande : `rm` est définitif.
  Vérifie avec `pwd` avant de supprimer.

```bash
mkdir -p Thesis/Chapter1 Thesis/Chapter2    # crée Thesis et ses sous-dossiers
cp -r Thesis ProjectX                       # copie tout l'arbre
mv thesis_chapter2.odf thesis_reviewed.odf  # renomme
rm -r Thesis/Chapter1                       # supprime un dossier non vide
```

## 12. Commandes Ubuntu utiles

| Commande | Rôle |
|---|---|
| `top` | processus en **temps réel** |
| `df -h` | **espace disque** en format lisible (*human-readable*) |
| `ping google.com` | tester la **connexion réseau** |
| `wget <url>` | **télécharger** un fichier |
| `grep "mot" file` | **chercher** un texte dans un fichier |
| `wc file` | compter **lignes, mots, caractères** |
| `chmod 755 file` | changer les **permissions** |
| `sudo chown user:group file` | changer le **propriétaire** et le groupe |
| `sudo apt update && sudo apt upgrade` | mettre à jour la liste des paquets puis les paquets |

### Lire des permissions

`ls -l` affiche par exemple `-rwxr-xr-x`. Le 1er caractère est le type (`-`
fichier, `d` dossier), puis **3 groupes de 3** : **user** (propriétaire),
**group**, **others**. En numérique, **r = 4, w = 2, x = 1**, on additionne :

```
-  rwx   r-x   r-x
   4+2+1 4+0+1 4+0+1
   7     5     5      →  chmod 755
```

| Chiffre | Droits |
|---|---|
| 7 | `rwx` |
| 6 | `rw-` |
| 5 | `r-x` |
| 4 | `r--` |
| 0 | `---` |

Valeurs classiques : **755** (scripts, dossiers), **644** (fichiers normaux),
**700** (privé), **600** (fichier privé).

## 13. Premiers scripts shell

Un **shell script** est un fichier texte qui contient des commandes.

```bash
nano myscript.sh          # 1. écrire le script
```

```bash
#!/bin/bash
# La 1re ligne, le "shebang", indique l'interpréteur à utiliser.
for file in *.jpg; do                 # boucle sur les fichiers
    mv "$file" "prefix_$file"         # renommage
done

for seed in {1..5}; do                # lancer 5 expériences
    python3 experiment.py --seed $seed
done
```

```bash
chmod +x myscript.sh      # 2. le rendre exécutable
./myscript.sh             # 3a. le lancer
bash myscript.sh          # 3b. ou via bash (pas besoin de +x)
bash -x myscript.sh       # debug : affiche chaque commande avant de l'exécuter
```

| Élément | Rôle |
|---|---|
| `#!/bin/bash` | le **shebang** : l'interpréteur du script |
| `chmod +x` | ajoute le droit d'**exécution** |
| `./script.sh` | lance le script du dossier courant |
| `bash -x` | mode **debug** (trace) |
| `$variable` | valeur d'une variable |
| `for … do … done` | boucle |
| `0 * * * * /path/script.sh` | ligne **cron** : lancer le script toutes les heures |

> **Attention** à l'exemple des notes `rm -rf /tmp/*` : il efface les fichiers
> temporaires **de tous les programmes**. Ne supprime que ce que ton script a
> créé.

## 14. Pousser son code sur GitHub (Remote GitHub Notes)

Les 8 étapes du cours :

1. `cd project_folder` : aller dans le projet ;
2. `git init` : initialiser le dépôt (si ce n'est pas fait) ;
3. créer un **`.gitignore`**, puis `git rm -r --cached .` pour ne plus suivre
   les fichiers désormais ignorés ;
4. `git checkout -b local-branch-name` : créer / choisir la branche locale ;
5. `git add .` : tout mettre en staging ;
6. `git commit -m "Initial commit"` : commiter ;
7. `git remote add origin <url>` (ou `git remote set-url origin <url>` si
   origin existe déjà) ;
8. `git push origin <branch>` : envoyer.

---

## À retenir

- Services **pour l'utilisateur** : UI, program execution, I/O, file system,
  communications, error detection. **Pour le système** : resource allocation,
  logging, protection & security.
- **System call** = interface vers les services de l'OS, via une **API**
  (Win32, **POSIX**, Java) ; un **numéro** par appel, une **table** ; paramètres
  par **registers**, **block** (Linux) ou **stack**. Six catégories : process,
  file, device, information, communications, protection.
- `printf()` → bibliothèque C → `write()`. Shell : **`fork()` puis `exec()`**,
  code 0 = OK.
- Compiler → **object file** → **linker** → **executable** → **loader** →
  mémoire ; **DLL** partagées. **ABI** = API binaire.
- **Policy = quoi, mechanism = comment** : les séparer.
- Monolithic (UNIX, rapide), layered (0 = matériel, N = UI), **microkernel**
  (Mach, messages, lent mais fiable), **modules** (LKM), **hybrid** (Windows,
  macOS, Android).
- Boot : adresse fixe → **BIOS / UEFI** en ROM → boot block → **GRUB** →
  kernel → daemons. **Core dump** = processus, **crash dump** = noyau.
- Lab : `/etc` config, `/var` logs, `/dev` périphériques, `/tmp` temporaire,
  `/root` ≠ `/`. `cp -r`, `rm -r`, `rmdir` (vide), `mkdir -p`. r = 4, w = 2,
  x = 1. Script : `#!/bin/bash`, `chmod +x`, `bash -x`.

## Pièges classiques du quiz

| Affirmation | Vrai / Faux |
|---|---|
| Les programmes appellent en général directement les system calls | **Faux** : via une API |
| Linux passe les paramètres par un bloc en mémoire | **Vrai** |
| Logging est un service pour l'utilisateur | **Faux** : pour le système |
| Un microkernel est plus rapide qu'un noyau monolithique | **Faux** : les messages coûtent |
| Dans l'approche en couches, la couche 0 est l'interface utilisateur | **Faux** : c'est le matériel |
| La vision de l'OS qu'ont les utilisateurs vient des system calls | **Faux** : des programmes système |
| Policy = comment, mechanism = quoi | **Faux** : c'est l'inverse |
| `rmdir` supprime un dossier non vide | **Faux** : `rm -r` |
| `/root` est la racine du système de fichiers | **Faux** : la racine est `/` |
| `cp` sans option copie les dossiers | **Faux** : il faut `-r` |
