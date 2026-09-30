# Operating System — Week 1 · Introduction

Chapitre 1 du Silberschatz (*Operating System Concepts*, 10e éd.) : ce qu'est
un OS, comment l'ordinateur est organisé (bus, contrôleurs, interruptions), la
mémoire et le stockage, le fonctionnement de l'OS (dual mode, timer), ses
grandes fonctions, la virtualisation, les architectures et les environnements.

> **En bref.** L'OS est le **chef d'orchestre** entre le matériel et les
> programmes. Il est **piloté par les interruptions** : il ne « tourne » pas en
> boucle, il **réagit** aux événements (un périphérique a fini, un programme
> fait un appel système, une erreur survient). Il se protège grâce au **dual
> mode** (user / kernel) et au **timer**.

Les termes en **gras anglais** sont ceux qui tombent au quiz : apprends-les
tels quels.

---

## 1. Qu'est-ce qu'un système d'exploitation ?

Un OS est un **programme qui sert d'intermédiaire entre l'utilisateur et le
matériel** (*an intermediary between the user of a computer and the computer
hardware*). Ses trois objectifs :

1. **exécuter les programmes** de l'utilisateur et faciliter la résolution de
   ses problèmes ;
2. rendre l'ordinateur **pratique à utiliser** (*convenient*) ;
3. utiliser le matériel de façon **efficace** (*efficient*).

Un système informatique a **quatre composants** : le **hardware**, l'**operating
system**, les **application programs** et les **users**.

```diagram
{
  "title": "Abstract view of the components of a computer system.",
  "nodes": [
    { "id": "u1", "x": 150, "y": 30, "w": 80, "h": 34, "shape": "ellipse", "label": "user 1", "size": 12 },
    { "id": "u2", "x": 260, "y": 30, "w": 80, "h": 34, "shape": "ellipse", "label": "user 2", "size": 12 },
    { "id": "u3", "x": 370, "y": 30, "w": 80, "h": 34, "shape": "ellipse", "label": "user 3", "size": 12 },
    { "id": "u4", "x": 480, "y": 30, "w": 80, "h": 34, "shape": "ellipse", "label": "user n", "size": 12 },
    { "id": "app", "x": 315, "y": 110, "w": 420, "h": 46, "label": "application programs\ncompilers · web browsers · development kits · databases · games", "tone": "sky", "filled": true, "size": 12 },
    { "id": "os", "x": 315, "y": 185, "w": 420, "h": 40, "label": "operating system", "tone": "amber", "filled": true },
    { "id": "hw", "x": 315, "y": 260, "w": 420, "h": 46, "label": "computer hardware\nCPU · memory · I/O devices", "tone": "violet", "filled": true, "size": 12 }
  ],
  "edges": [
    { "from": "u1", "to": "app", "arrow": "none" }, { "from": "u2", "to": "app", "arrow": "none" }, { "from": "u3", "to": "app", "arrow": "none" }, { "from": "u4", "to": "app", "arrow": "none" },
    { "from": "app", "to": "os", "arrow": "both" },
    { "from": "os", "to": "hw", "arrow": "both" }
  ]
}
```

| Composant | Rôle | Exemples |
|---|---|---|
| **Hardware** | fournit les ressources de base | CPU, mémoire, périphériques d'E/S |
| **Operating system** | **contrôle et coordonne** l'usage du matériel entre applications et utilisateurs | Linux, Windows, macOS |
| **Application programs** | utilisent les ressources pour résoudre les problèmes des utilisateurs | navigateur, compilateur, base de données, jeux |
| **Users** | ceux qui utilisent le système | personnes, machines, autres ordinateurs |

### Pas de définition universelle

Il n'existe **aucune définition universellement acceptée** d'un OS. Deux
approximations utiles :

- « tout ce que le vendeur livre quand on commande un OS » ;
- le **kernel** : *le seul programme qui tourne en permanence sur l'ordinateur*.

Tout le reste est soit un **system program** (livré avec l'OS mais hors du
noyau), soit un **application program**. Les OS modernes ajoutent du
**middleware** : des frameworks qui offrent des services en plus aux
développeurs (bases de données, multimédia, graphisme).

### Le point de vue change tout

| Point de vue | Ce qui compte |
|---|---|
| Utilisateur d'un PC | confort, facilité, performance — il se moque de l'utilisation des ressources |
| Machine partagée (mainframe) | l'OS est un **resource allocator** et un **control program** : il doit satisfaire tout le monde |
| Mobile | pauvre en ressources, optimisé pour l'**utilisabilité** et la **batterie** |
| Embarqué (voiture, électroménager) | peu ou pas d'interface, tourne sans intervention humaine |

## 2. Organisation de l'ordinateur et interruptions

Un ou plusieurs **CPU** et des **device controllers** sont reliés par un **bus
commun** à une **mémoire partagée**. Ils s'exécutent **en parallèle** et se
disputent les cycles mémoire.

```diagram
{
  "title": "Computer-system organization: CPUs and device controllers on a common system bus to shared memory.",
  "nodes": [
    { "id": "mouse", "x": 240, "y": 20, "shape": "text", "label": "mouse", "size": 11 },
    { "id": "kbd", "x": 330, "y": 20, "shape": "text", "label": "keyboard", "size": 11 },
    { "id": "prn", "x": 420, "y": 20, "shape": "text", "label": "printer", "size": 11 },
    { "id": "mon", "x": 580, "y": 20, "shape": "text", "label": "monitor", "size": 11 },
    { "id": "disks", "x": 100, "y": 20, "shape": "text", "label": "disks", "size": 11 },
    { "id": "cpu", "x": 60, "y": 90, "w": 80, "h": 44, "label": "CPU", "tone": "amber", "filled": true },
    { "id": "dc", "x": 190, "y": 90, "w": 100, "h": 44, "label": "disk\ncontroller", "size": 12 },
    { "id": "usb", "x": 340, "y": 90, "w": 110, "h": 44, "label": "USB controller", "size": 12 },
    { "id": "gfx", "x": 520, "y": 90, "w": 110, "h": 44, "label": "graphics\nadapter", "size": 12 },
    { "id": "bus", "x": 340, "y": 165, "w": 620, "h": 22, "label": "system bus", "tone": "neutral", "filled": true, "size": 12 },
    { "id": "b1", "x": 60, "y": 155, "shape": "text" }, { "id": "b2", "x": 190, "y": 155, "shape": "text" }, { "id": "b3", "x": 340, "y": 155, "shape": "text" }, { "id": "b4", "x": 520, "y": 155, "shape": "text" },
    { "id": "mem", "x": 340, "y": 240, "w": 130, "h": 44, "label": "memory", "tone": "violet", "filled": true }
  ],
  "edges": [
    { "from": "disks", "to": "dc", "arrow": "both" },
    { "from": "mouse", "to": "usb", "arrow": "none" }, { "from": "kbd", "to": "usb", "arrow": "none" }, { "from": "prn", "to": "usb", "arrow": "none" },
    { "from": "mon", "to": "gfx", "arrow": "none" },
    { "from": "cpu", "to": "b1", "arrow": "both" }, { "from": "dc", "to": "b2", "arrow": "both" }, { "from": "usb", "to": "b3", "arrow": "both" }, { "from": "gfx", "to": "b4", "arrow": "both" },
    { "from": "bus", "to": "mem", "arrow": "both" }
  ]
}
```

- Chaque **device controller** gère un type de périphérique et possède un
  **local buffer** (petite mémoire tampon).
- Pour chaque contrôleur, l'OS a un **device driver** qui offre au noyau une
  interface uniforme.
- Le CPU déplace les données entre la mémoire principale et les buffers ; l'E/S
  elle-même se fait entre le périphérique et le buffer du contrôleur.
- Quand il a fini, le contrôleur **prévient le CPU en déclenchant une
  interruption** (*interrupt*).

### Les interruptions

Une **interrupt** transfère le contrôle à la **routine de service**
(*interrupt service routine*), en général via l'**interrupt vector** : une
table qui contient l'adresse de toutes les routines.

1. le matériel **sauvegarde l'adresse de l'instruction interrompue** ;
2. l'OS sauvegarde l'état du CPU (**registres** et **program counter**) ;
3. il détermine le type d'interruption et exécute le code correspondant ;
4. il restaure l'état et reprend le programme interrompu.

Un **trap** (ou **exception**) est une interruption **générée par le
logiciel**, soit par une **erreur** (division par zéro, accès mémoire
interdit), soit par une **demande de l'utilisateur** : un **system call**.

> **À retenir mot pour mot :** *An operating system is interrupt driven.*

```diagram
{
  "title": "Interrupt-driven I/O cycle: the device controller works in parallel with the CPU and raises an interrupt when it is done.",
  "groups": [
    { "x": 160, "y": 215, "w": 290, "h": 400, "label": "CPU", "tone": "amber" },
    { "x": 500, "y": 125, "w": 270, "h": 220, "label": "I/O controller", "tone": "sky" }
  ],
  "nodes": [
    { "id": "c1", "x": 160, "y": 60, "w": 240, "h": 44, "label": "1 · device driver initiates I/O", "size": 12 },
    { "id": "d2", "x": 500, "y": 60, "w": 220, "h": 44, "label": "2 · controller starts the transfer", "size": 12, "tone": "sky" },
    { "id": "c3", "x": 160, "y": 150, "w": 240, "h": 44, "label": "3 · CPU executes other work\n(user program)", "size": 12 },
    { "id": "d4", "x": 500, "y": 150, "w": 220, "h": 44, "label": "4 · input ready / output complete\nor error → generate interrupt", "size": 12, "tone": "sky" },
    { "id": "c5", "x": 160, "y": 245, "w": 240, "h": 44, "label": "5 · CPU receives the interrupt,\ntransfers control to the handler", "size": 12 },
    { "id": "c6", "x": 160, "y": 335, "w": 240, "h": 44, "label": "6 · interrupt handler processes\nthe data, returns from interrupt", "size": 12 },
    { "id": "c7", "x": 160, "y": 395, "w": 240, "h": 30, "label": "7 · CPU resumes the interrupted task", "size": 12, "tone": "emerald", "filled": true }
  ],
  "edges": [
    { "from": "c1", "to": "d2", "tone": "amber" },
    { "from": "c1", "to": "c3" },
    { "from": "d2", "to": "d4", "tone": "sky" },
    { "from": "d4", "to": "c5", "tone": "sky", "label": "interrupt" },
    { "from": "c3", "to": "c5", "dashed": true },
    { "from": "c5", "to": "c6" },
    { "from": "c6", "to": "c7" }
  ]
}
```

### Structure des E/S : synchrone ou asynchrone

| | **Synchronous I/O** | **Asynchronous I/O** |
|---|---|---|
| Après la demande d'E/S | le contrôle revient au programme **seulement quand l'E/S est finie** | le contrôle revient **tout de suite**, sans attendre |
| Le CPU pendant ce temps | attend (instruction `wait` ou boucle d'attente) | exécute ce programme ou un autre |
| Nombre d'E/S en cours | **une seule** à la fois | plusieurs |
| Suivi | — | **device-status table** : une entrée par périphérique (type, adresse, état) |

```diagram
{
  "title": "Synchronous vs asynchronous I/O: who waits while the device transfers.",
  "nodes": [
    { "id": "h1", "x": 160, "y": 10, "shape": "text", "label": "synchronous", "bold": true },
    { "id": "h2", "x": 500, "y": 10, "shape": "text", "label": "asynchronous", "bold": true },
    { "id": "s1", "x": 160, "y": 50, "w": 250, "h": 34, "label": "user program requests I/O", "size": 12 },
    { "id": "s2", "x": 160, "y": 115, "w": 250, "h": 44, "label": "CPU waits (wait instruction)\nuntil the interrupt arrives", "size": 12, "tone": "rose", "filled": true },
    { "id": "s3", "x": 160, "y": 185, "w": 250, "h": 34, "label": "interrupt: I/O done, program resumes", "size": 12, "tone": "emerald", "filled": true },
    { "id": "a1", "x": 500, "y": 50, "w": 250, "h": 34, "label": "user program requests I/O", "size": 12 },
    { "id": "a2", "x": 500, "y": 115, "w": 250, "h": 44, "label": "control returns at once,\nCPU runs this or another program", "size": 12, "tone": "emerald", "filled": true },
    { "id": "a3", "x": 500, "y": 185, "w": 250, "h": 44, "label": "device-status table records the request;\ninterrupt updates it when done", "size": 12, "tone": "sky", "filled": true }
  ],
  "edges": [
    { "from": "s1", "to": "s2" }, { "from": "s2", "to": "s3" },
    { "from": "a1", "to": "a2" }, { "from": "a2", "to": "a3" }
  ]
}
```

### DMA (Direct Memory Access)

Pour les périphériques rapides, interrompre le CPU à chaque octet serait
ingérable. Avec le **DMA**, le contrôleur copie des **blocs entiers** de son
buffer vers la mémoire **sans intervention du CPU**, et ne génère **qu'une
interruption par bloc** (au lieu d'une par octet).

```diagram
{
  "title": "How a modern computer works (von Neumann architecture): the CPU runs its instruction cycle against memory, the DMA-capable device moves blocks straight into memory.",
  "nodes": [
    { "id": "cpu", "x": 120, "y": 130, "w": 200, "h": 150, "label": "CPU\n\nthread of execution\ninstruction execution cycle\ndata movement cycle", "tone": "amber", "filled": true, "size": 12 },
    { "id": "cache", "x": 340, "y": 60, "w": 90, "h": 36, "label": "cache", "tone": "amber" },
    { "id": "mem", "x": 560, "y": 130, "w": 150, "h": 150, "label": "memory\n\ninstructions\nand\ndata", "tone": "violet", "filled": true, "size": 12 },
    { "id": "dev", "x": 340, "y": 280, "w": 110, "h": 60, "shape": "cylinder", "label": "device\n(I/O)", "tone": "sky", "filled": true },
    { "id": "dma", "x": 455, "y": 262, "shape": "text", "label": "DMA", "size": 11, "bold": true }
  ],
  "edges": [
    { "from": "cpu", "to": "cache", "arrow": "both", "label": "data" },
    { "from": "cache", "to": "mem", "arrow": "both" },
    { "from": "cpu", "to": "mem", "label": "instructions", "arrow": "both" },
    { "from": "cpu", "to": "dev", "label": "interrupt", "arrow": "both" },
    { "from": "dev", "to": "mem", "arrow": "both", "label": "I/O request · data" }
  ]
}
```

## 3. Le stockage

La **main memory** (RAM) est le **seul grand support que le CPU peut accéder
directement**. Elle est à **accès aléatoire**, en général **volatile**
(perdue à l'extinction) et construite en **DRAM**. Le **secondary storage**
l'étend avec une grande capacité **non volatile** :

- **HDD** (disques durs) : plateaux magnétiques divisés en **tracks**, elles-mêmes
  découpées en **sectors** ; le **disk controller** gère l'interaction avec
  l'ordinateur.
- **NVM** (*non-volatile memory*, SSD, flash) : plus rapide que les disques,
  de plus en plus répandue.

### Les unités

- **bit** : 0 ou 1, l'unité de base.
- **byte** : 8 bits, le plus petit morceau pratique (les CPU savent déplacer un
  octet, rarement un bit).
- **word** : l'unité native d'une architecture (registres 64 bits → mots de 8
  octets).

| Unité | Valeur exacte |
|---|---|
| 1 KB (kilobyte) | 1 024 bytes = 2¹⁰ |
| 1 MB | 1 024² bytes |
| 1 GB | 1 024³ bytes |
| 1 TB | 1 024⁴ bytes |
| 1 PB | 1 024⁵ bytes |

> **Piège :** les **réseaux se mesurent en bits** (Mbit/s), pas en octets,
> parce qu'ils transmettent les données bit par bit.

### La hiérarchie de stockage

Les supports sont organisés selon **vitesse, coût et volatilité** : en haut,
petit, rapide et cher ; en bas, grand, lent et bon marché.

```diagram
{
  "title": "Storage-device hierarchy: faster, smaller and more expensive at the top; volatile above the line, nonvolatile below.",
  "groups": [
    { "x": 330, "y": 90, "w": 400, "h": 118, "label": "volatile", "tone": "rose" },
    { "x": 330, "y": 230, "w": 400, "h": 150, "label": "nonvolatile", "tone": "emerald" }
  ],
  "nodes": [
    { "id": "r", "x": 330, "y": 50, "w": 120, "h": 30, "label": "registers", "tone": "amber", "filled": true, "size": 12 },
    { "id": "c", "x": 330, "y": 90, "w": 160, "h": 30, "label": "cache", "tone": "amber", "filled": true, "size": 12 },
    { "id": "m", "x": 330, "y": 130, "w": 200, "h": 30, "label": "main memory", "tone": "amber", "filled": true, "size": 12 },
    { "id": "n", "x": 330, "y": 170, "w": 240, "h": 30, "label": "nonvolatile memory", "tone": "sky", "filled": true, "size": 12 },
    { "id": "h", "x": 330, "y": 210, "w": 280, "h": 30, "label": "hard-disk drives", "tone": "sky", "filled": true, "size": 12 },
    { "id": "o", "x": 330, "y": 250, "w": 320, "h": 30, "label": "optical disk", "tone": "sky", "filled": true, "size": 12 },
    { "id": "t", "x": 330, "y": 290, "w": 360, "h": 30, "label": "magnetic tapes", "tone": "sky", "filled": true, "size": 12 },
    { "id": "l1", "x": 50, "y": 60, "shape": "text", "label": "smaller\nfaster\nmore expensive", "size": 11 },
    { "id": "l2", "x": 50, "y": 280, "shape": "text", "label": "larger\nslower\ncheaper", "size": 11 },
    { "id": "p1", "x": 30, "y": 110, "shape": "text" },
    { "id": "p2", "x": 30, "y": 230, "shape": "text" },
    { "id": "s1", "x": 600, "y": 60, "shape": "text", "label": "primary storage", "size": 11 },
    { "id": "s2", "x": 600, "y": 190, "shape": "text", "label": "secondary storage", "size": 11 },
    { "id": "s3", "x": 600, "y": 270, "shape": "text", "label": "tertiary storage", "size": 11 }
  ],
  "edges": [
    { "from": "p2", "to": "p1", "label": "access time" }
  ]
}
```

Le **caching** copie temporairement les données utilisées d'un support lent
vers un support plus rapide. On regarde d'abord dans le cache : si la donnée y
est, on l'utilise directement ; sinon on la copie dans le cache. La mémoire
principale sert elle-même de cache pour le disque. Un cache étant **plus petit**
que ce qu'il cache, deux problèmes de conception se posent : **sa taille** et
sa **politique de remplacement** (*replacement policy*).

```diagram
{
  "title": "Migration of a datum A from disk to register: one copy per level of the hierarchy.",
  "nodes": [
    { "id": "d", "x": 70, "y": 50, "w": 110, "h": 56, "shape": "cylinder", "label": "magnetic\ndisk", "tone": "sky", "filled": true, "size": 12 },
    { "id": "m", "x": 260, "y": 50, "w": 120, "h": 44, "label": "main\nmemory", "tone": "amber", "filled": true, "size": 12 },
    { "id": "c", "x": 440, "y": 50, "w": 100, "h": 44, "label": "cache", "tone": "amber", "filled": true, "size": 12 },
    { "id": "r", "x": 610, "y": 50, "w": 120, "h": 44, "label": "hardware\nregister", "tone": "amber", "filled": true, "size": 12 }
  ],
  "edges": [
    { "from": "d", "to": "m", "label": "A" },
    { "from": "m", "to": "c", "label": "A" },
    { "from": "c", "to": "r", "label": "A" }
  ]
}
```

- En **multitâche**, il faut toujours utiliser la **valeur la plus récente**,
  où qu'elle soit.
- En **multiprocesseur**, le matériel doit assurer la **cache coherency** :
  tous les CPU voient la valeur la plus récente.
- En environnement **distribué**, plusieurs copies d'une donnée peuvent
  exister : encore plus complexe.

## 4. Le fonctionnement de l'OS

Au démarrage, le **bootstrap program** (code simple, en ROM) initialise le
système et **charge le kernel**. Le noyau lance ensuite les **system daemons**
(services hors du noyau). À partir de là, le noyau est **interrupt driven** :

- **hardware interrupts** envoyées par les périphériques ;
- **software interrupts** (**trap** / **exception**) : erreur logicielle, appel
  système, ou problème d'un processus (boucle infinie, processus qui modifient
  l'OS ou d'autres processus).

### Multiprogramming et multitasking

| | **Multiprogramming** (batch) | **Multitasking** (timesharing) |
|---|---|---|
| Idée | garder **plusieurs jobs en mémoire** pour que le CPU ait toujours du travail | le CPU change de job **si souvent** que les utilisateurs peuvent **interagir** |
| Quand on change de job | quand le job courant **attend** (une E/S) | très fréquemment (quelques ms) |
| Choix du job | **job scheduling** | **CPU scheduling** |
| Objectif | utilisation du CPU | temps de réponse **< 1 seconde** |
| Si ça ne tient pas en mémoire | — | **swapping** et **virtual memory** |

```diagram
{
  "title": "Memory layout for a multiprogrammed system: the OS plus a subset of the jobs resident at the same time.",
  "nodes": [
    { "id": "max", "x": 60, "y": 22, "shape": "text", "label": "max", "size": 11 },
    { "id": "zero", "x": 60, "y": 258, "shape": "text", "label": "0", "size": 11 },
    { "id": "os", "x": 300, "y": 40, "w": 260, "h": 36, "label": "operating system", "tone": "amber", "filled": true },
    { "id": "p1", "x": 300, "y": 84, "w": 260, "h": 36, "label": "process 1", "tone": "sky" },
    { "id": "p2", "x": 300, "y": 128, "w": 260, "h": 36, "label": "process 2", "tone": "sky" },
    { "id": "p3", "x": 300, "y": 172, "w": 260, "h": 36, "label": "process 3", "tone": "sky" },
    { "id": "p4", "x": 300, "y": 216, "w": 260, "h": 36, "label": "process 4", "tone": "sky" }
  ],
  "edges": []
}
```

### Protection matérielle : le dual mode

Pour se protéger, l'OS distingue deux modes grâce à un **mode bit** fourni par
le matériel :

| Mode | mode bit | Qui s'y exécute |
|---|---|---|
| **User mode** | **1** | les programmes utilisateur |
| **Kernel mode** | **0** | le noyau ; seul mode où les **privileged instructions** sont permises |

L'utilisateur **ne peut pas** mettre lui-même le bit en mode noyau. Un **system
call** fait passer en kernel mode (trap, bit = 0) et le **retour** de l'appel
remet en user mode (bit = 1).

```diagram
{
  "title": "Transition from user mode to kernel mode and back around a system call (mode bit 1 = user, 0 = kernel).",
  "groups": [
    { "x": 360, "y": 60, "w": 680, "h": 70, "label": "user mode (mode bit = 1)", "tone": "sky" },
    { "x": 360, "y": 185, "w": 680, "h": 70, "label": "kernel mode (mode bit = 0)", "tone": "amber" }
  ],
  "nodes": [
    { "id": "u1", "x": 130, "y": 70, "w": 170, "h": 40, "label": "user process executing", "tone": "sky", "filled": true, "size": 12 },
    { "id": "u2", "x": 340, "y": 70, "w": 150, "h": 40, "label": "calls system call", "tone": "sky", "filled": true, "size": 12 },
    { "id": "u3", "x": 600, "y": 70, "w": 190, "h": 40, "label": "return from system call", "tone": "sky", "filled": true, "size": 12 },
    { "id": "k", "x": 470, "y": 195, "w": 400, "h": 40, "label": "execute system call", "tone": "amber", "filled": true, "size": 12 },
    { "id": "kt1", "x": 340, "y": 176, "shape": "text" },
    { "id": "kt2", "x": 600, "y": 176, "shape": "text" }
  ],
  "edges": [
    { "from": "u1", "to": "u2" },
    { "from": "u2", "to": "kt1", "label": "trap · mode bit = 0", "tone": "amber" },
    { "from": "kt2", "to": "u3", "label": "return · mode bit = 1", "tone": "sky" }
  ]
}
```

### Le timer

Un **timer** empêche un programme de monopoliser le CPU (boucle infinie) : l'OS
règle un compteur, décrémenté par l'horloge physique ; à zéro, il génère une
**interruption** et l'OS reprend la main. **Régler le timer est une
instruction privilégiée.**

> **Piège :** c'est le **timer** (et non le mode bit) qui empêche une boucle
> infinie de bloquer la machine. Le mode bit, lui, empêche un programme
> d'exécuter des instructions privilégiées.

## 5. Les grandes fonctions de l'OS

| Fonction | Ce que l'OS fait |
|---|---|
| **Process management** | créer / supprimer des processus, les suspendre / reprendre, fournir des mécanismes de **synchronisation**, de **communication** et de gestion des **deadlocks** |
| **Memory management** | savoir **quelles parties de la mémoire** sont utilisées et **par qui**, décider **quoi charger / décharger**, allouer et libérer |
| **File-system management** | offrir une vue logique uniforme (le **file**), créer / supprimer fichiers et **directories**, les mapper sur le stockage, sauvegarder |
| **Mass-storage management** | monter / démonter, **free-space management**, allocation, **disk scheduling**, partitionnement, protection |
| **I/O subsystem** | cacher les particularités du matériel : **buffering**, **caching**, **spooling**, interface générique de drivers |

Un **process** est un **programme en exécution**, l'unité de travail du
système. Le **program** est une entité **passive** (un fichier sur disque) ; le
**process** est une entité **active**. Un processus mono-thread a **un seul
program counter** ; un processus multi-thread en a **un par thread**.

| Terme d'E/S | Définition |
|---|---|
| **Buffering** | stocker temporairement des données pendant leur transfert |
| **Caching** | garder des parties de données dans un stockage plus rapide |
| **Spooling** | superposer la sortie d'un job avec l'entrée d'autres jobs (ex. file d'impression) |

## 6. Protection, sécurité, virtualisation

| **Protection** | **Security** |
|---|---|
| tout mécanisme qui **contrôle l'accès** des processus ou utilisateurs aux ressources de l'OS | **défense** du système contre les attaques **internes et externes** (DoS, vers, virus, vol d'identité) |

L'OS identifie les utilisateurs par un **user ID** (un par utilisateur, associé
à ses fichiers et processus) et des **group ID** (ensembles d'utilisateurs). La
**privilege escalation** permet de passer temporairement à un ID effectif avec
plus de droits (comme `sudo`).

### Virtualisation et émulation

- **Emulation** : le CPU source est **différent** du CPU cible (PowerPC → x86).
  C'est en général la méthode **la plus lente**.
- **Virtualization** : un OS compilé pour le CPU héberge des OS **guests**
  eux aussi compilés nativement. Le **VMM** (*virtual machine manager*)
  fournit les services de virtualisation. Il peut tourner sur un OS hôte
  (VMware Workstation, VirtualBox) ou **directement sur le matériel** (VMware
  ESX, Citrix XenServer).

```diagram
{
  "title": "(a) A non-virtual machine: processes on one kernel. (b) A virtual machine: a VMM hosts several kernels, each with its own processes.",
  "nodes": [
    { "id": "ha", "x": 130, "y": 10, "shape": "text", "label": "(a) non-virtual machine", "bold": true },
    { "id": "hb", "x": 480, "y": 10, "shape": "text", "label": "(b) virtual machine", "bold": true },
    { "id": "ap", "x": 130, "y": 60, "w": 200, "h": 50, "label": "processes", "tone": "sky", "filled": true },
    { "id": "ak", "x": 130, "y": 150, "w": 200, "h": 36, "label": "kernel", "tone": "amber", "filled": true },
    { "id": "ahw", "x": 130, "y": 250, "w": 200, "h": 36, "label": "hardware", "tone": "violet", "filled": true },
    { "id": "p1", "x": 370, "y": 60, "w": 90, "h": 50, "label": "processes", "tone": "sky", "filled": true, "size": 11 },
    { "id": "p2", "x": 480, "y": 60, "w": 90, "h": 50, "label": "processes", "tone": "sky", "filled": true, "size": 11 },
    { "id": "p3", "x": 590, "y": 60, "w": 90, "h": 50, "label": "processes", "tone": "sky", "filled": true, "size": 11 },
    { "id": "k1", "x": 370, "y": 125, "w": 90, "h": 30, "label": "kernel", "tone": "amber", "filled": true, "size": 11 },
    { "id": "k2", "x": 480, "y": 125, "w": 90, "h": 30, "label": "kernel", "tone": "amber", "filled": true, "size": 11 },
    { "id": "k3", "x": 590, "y": 125, "w": 90, "h": 30, "label": "kernel", "tone": "amber", "filled": true, "size": 11 },
    { "id": "v1", "x": 370, "y": 160, "shape": "text", "label": "VM1", "size": 11 },
    { "id": "v2", "x": 480, "y": 160, "shape": "text", "label": "VM2", "size": 11 },
    { "id": "v3", "x": 590, "y": 160, "shape": "text", "label": "VM3", "size": 11 },
    { "id": "vmm", "x": 480, "y": 200, "w": 320, "h": 34, "label": "virtual machine manager (VMM)", "tone": "emerald", "filled": true, "size": 12 },
    { "id": "bhw", "x": 480, "y": 250, "w": 320, "h": 36, "label": "hardware", "tone": "violet", "filled": true }
  ],
  "edges": [
    { "from": "ap", "to": "ak", "arrow": "none", "label": "programming interface" },
    { "from": "ak", "to": "ahw", "arrow": "none" },
    { "from": "p1", "to": "k1", "arrow": "none" }, { "from": "p2", "to": "k2", "arrow": "none" }, { "from": "p3", "to": "k3", "arrow": "none" },
    { "from": "vmm", "to": "bhw", "arrow": "none" }
  ]
}
```

Usages : lancer Windows sous macOS, tester une appli sur plusieurs OS sans
plusieurs machines, gérer des environnements de calcul dans les data centers.
Tu l'utilises toi-même dans les labs : VMware (ou VirtualBox) fait tourner
Ubuntu comme **guest** sur ton OS **host**.

### Systèmes distribués

Un **distributed system** est un ensemble de systèmes séparés, reliés par un
réseau (le plus souvent **TCP/IP**). Réseaux par taille : **PAN** < **LAN** <
**MAN** < **WAN**. Un **network operating system** fournit des fonctions entre
machines (échange de messages, illusion d'un seul système).

## 7. Architectures matérielles

La plupart des systèmes ont **un processeur généraliste** (plus des
processeurs spécialisés). Les **multiprocessor systems** (aussi appelés
**parallel** ou **tightly-coupled**) apportent trois avantages :

1. **increased throughput** (plus de débit) ;
2. **economy of scale** (on partage périphériques, stockage, alimentation) ;
3. **increased reliability** : *graceful degradation*, *fault tolerance*.

| **Asymmetric multiprocessing** | **Symmetric multiprocessing (SMP)** |
|---|---|
| chaque processeur a **une tâche précise** | **chaque processeur fait toutes les tâches** |

```diagram
{
  "title": "Symmetric multiprocessing architecture: each processor has its own registers and cache, all share main memory.",
  "nodes": [
    { "id": "h0", "x": 180, "y": 12, "shape": "text", "label": "processor 0", "bold": true, "size": 12 },
    { "id": "h1", "x": 460, "y": 12, "shape": "text", "label": "processor 1", "bold": true, "size": 12 },
    { "id": "c0", "x": 180, "y": 50, "w": 90, "h": 34, "label": "CPU 0", "tone": "amber", "filled": true, "size": 12 },
    { "id": "r0", "x": 180, "y": 95, "w": 90, "h": 30, "label": "registers", "size": 11 },
    { "id": "k0", "x": 180, "y": 135, "w": 90, "h": 30, "label": "cache", "size": 11 },
    { "id": "c1", "x": 460, "y": 50, "w": 90, "h": 34, "label": "CPU 1", "tone": "amber", "filled": true, "size": 12 },
    { "id": "r1", "x": 460, "y": 95, "w": 90, "h": 30, "label": "registers", "size": 11 },
    { "id": "k1", "x": 460, "y": 135, "w": 90, "h": 30, "label": "cache", "size": 11 },
    { "id": "mem", "x": 320, "y": 220, "w": 420, "h": 40, "label": "main memory", "tone": "violet", "filled": true }
  ],
  "groups": [
    { "x": 180, "y": 100, "w": 150, "h": 150, "tone": "amber" },
    { "x": 460, "y": 100, "w": 150, "h": 150, "tone": "amber" }
  ],
  "edges": [
    { "from": "k0", "to": "mem", "arrow": "both" }, { "from": "k1", "to": "mem", "arrow": "both" }
  ]
}
```

**Multicore** : plusieurs cœurs sur **une seule puce**. Chaque cœur a ses
registres et son cache L1, le cache L2 est partagé.

```diagram
{
  "title": "Dual-core design: two cores on a single chip share the L2 cache.",
  "groups": [
    { "x": 320, "y": 115, "w": 400, "h": 220, "label": "processor (one chip)", "tone": "amber" }
  ],
  "nodes": [
    { "id": "a", "x": 210, "y": 55, "w": 110, "h": 30, "label": "CPU core 0", "tone": "amber", "filled": true, "size": 12 },
    { "id": "ar", "x": 210, "y": 92, "w": 110, "h": 26, "label": "registers", "size": 11 },
    { "id": "al", "x": 210, "y": 126, "w": 110, "h": 26, "label": "L1 cache", "size": 11 },
    { "id": "b", "x": 430, "y": 55, "w": 110, "h": 30, "label": "CPU core 1", "tone": "amber", "filled": true, "size": 12 },
    { "id": "br", "x": 430, "y": 92, "w": 110, "h": 26, "label": "registers", "size": 11 },
    { "id": "bl", "x": 430, "y": 126, "w": 110, "h": 26, "label": "L1 cache", "size": 11 },
    { "id": "l2", "x": 320, "y": 190, "w": 330, "h": 30, "label": "L2 cache", "size": 12 },
    { "id": "mem", "x": 320, "y": 280, "w": 330, "h": 36, "label": "main memory", "tone": "violet", "filled": true }
  ],
  "edges": [
    { "from": "al", "to": "l2", "arrow": "both" }, { "from": "bl", "to": "l2", "arrow": "both" },
    { "from": "l2", "to": "mem", "arrow": "both" }
  ]
}
```

**NUMA** (*non-uniform memory access*) : chaque CPU a sa mémoire locale,
rapide ; accéder à la mémoire d'un autre CPU passe par l'interconnexion et
coûte plus cher. Le temps d'accès **dépend du banc mémoire**.

```diagram
{
  "title": "Non-uniform memory access: each CPU is close to one memory bank and farther from the others.",
  "nodes": [
    { "id": "m0", "x": 90, "y": 60, "w": 110, "h": 40, "label": "memory 0", "tone": "violet", "filled": true, "size": 12 },
    { "id": "c0", "x": 250, "y": 60, "w": 90, "h": 40, "label": "CPU 0", "tone": "amber", "filled": true, "size": 12 },
    { "id": "c1", "x": 430, "y": 60, "w": 90, "h": 40, "label": "CPU 1", "tone": "amber", "filled": true, "size": 12 },
    { "id": "m1", "x": 590, "y": 60, "w": 110, "h": 40, "label": "memory 1", "tone": "violet", "filled": true, "size": 12 },
    { "id": "m2", "x": 90, "y": 200, "w": 110, "h": 40, "label": "memory 2", "tone": "violet", "filled": true, "size": 12 },
    { "id": "c2", "x": 250, "y": 200, "w": 90, "h": 40, "label": "CPU 2", "tone": "amber", "filled": true, "size": 12 },
    { "id": "c3", "x": 430, "y": 200, "w": 90, "h": 40, "label": "CPU 3", "tone": "amber", "filled": true, "size": 12 },
    { "id": "m3", "x": 590, "y": 200, "w": 110, "h": 40, "label": "memory 3", "tone": "violet", "filled": true, "size": 12 },
    { "id": "n", "x": 340, "y": 248, "shape": "text", "label": "interconnect: local memory is fast, remote memory slower", "size": 11 }
  ],
  "edges": [
    { "from": "m0", "to": "c0", "arrow": "both", "label": "fast" }, { "from": "c1", "to": "m1", "arrow": "both", "label": "fast" },
    { "from": "m2", "to": "c2", "arrow": "both", "label": "fast" }, { "from": "c3", "to": "m3", "arrow": "both", "label": "fast" },
    { "from": "c0", "to": "c1", "arrow": "both" }, { "from": "c2", "to": "c3", "arrow": "both" },
    { "from": "c0", "to": "c2", "arrow": "both" }, { "from": "c1", "to": "c3", "arrow": "both" },
    { "from": "c0", "to": "c3", "arrow": "both", "dashed": true }, { "from": "c1", "to": "c2", "arrow": "both", "dashed": true }
  ]
}
```

### Clusters

Un **clustered system** regroupe **plusieurs systèmes** complets qui
travaillent ensemble, en partageant souvent le stockage via un **SAN**
(*storage-area network*). Objectif : la **high availability** (le service
survit aux pannes).

| **Asymmetric clustering** | **Symmetric clustering** |
|---|---|
| une machine en **hot-standby** surveille les autres et prend le relais | **plusieurs nœuds** font tourner des applications et se surveillent mutuellement |

Certains clusters visent le **HPC** (*high-performance computing*) : les
applications doivent être écrites pour la **parallélisation**. Un **DLM**
(*distributed lock manager*) évite les opérations conflictuelles.

```diagram
{
  "title": "Clustered system: several computers on an interconnect, sharing storage over a SAN.",
  "nodes": [
    { "id": "a", "x": 90, "y": 50, "w": 110, "h": 40, "label": "computer", "tone": "amber", "filled": true },
    { "id": "b", "x": 330, "y": 50, "w": 110, "h": 40, "label": "computer", "tone": "amber", "filled": true },
    { "id": "c", "x": 570, "y": 50, "w": 110, "h": 40, "label": "computer", "tone": "amber", "filled": true },
    { "id": "san", "x": 330, "y": 170, "w": 200, "h": 64, "shape": "cylinder", "label": "storage-area\nnetwork", "tone": "sky", "filled": true }
  ],
  "edges": [
    { "from": "a", "to": "b", "arrow": "both", "label": "interconnect" }, { "from": "b", "to": "c", "arrow": "both", "label": "interconnect" },
    { "from": "a", "to": "san", "arrow": "both" }, { "from": "b", "to": "san", "arrow": "both" }, { "from": "c", "to": "san", "arrow": "both" }
  ]
}
```

> **Piège :** multiprocessor = **plusieurs CPU dans une machine** ; cluster =
> **plusieurs machines** reliées entre elles.

## 8. Les environnements informatiques

| Environnement | Idée clé |
|---|---|
| **Traditional** | machines autonomes, désormais connectées (portails web, **thin clients**, pare-feu à la maison) |
| **Mobile** | smartphones, tablettes ; GPS, gyroscope → réalité augmentée ; leaders **iOS** et **Android** |
| **Client-server** | des **servers** répondent aux requêtes des **clients** ; *compute-server* (ex. base de données) ou *file-server* |
| **Peer-to-peer** | **aucune distinction client / serveur**, chaque nœud peut être les deux ; découverte par un **central lookup service** ou par **broadcast** (*discovery protocol*). Ex. Napster, Gnutella, Skype |
| **Cloud computing** | calcul, stockage et applis **fournis comme service** via le réseau ; bâti sur la **virtualisation** |
| **Real-time embedded** | la forme d'ordinateur **la plus répandue** ; un **real-time OS** a des **contraintes de temps fixes** : correct **seulement si** elles sont respectées |

```diagram
{
  "title": "Client-server (requests converge on servers) vs peer-to-peer (every node is client and server).",
  "nodes": [
    { "id": "h1", "x": 150, "y": 10, "shape": "text", "label": "client-server", "bold": true },
    { "id": "h2", "x": 500, "y": 10, "shape": "text", "label": "peer-to-peer", "bold": true },
    { "id": "srv", "x": 150, "y": 60, "w": 110, "h": 40, "label": "server", "tone": "amber", "filled": true },
    { "id": "net", "x": 150, "y": 140, "w": 90, "h": 40, "shape": "ellipse", "label": "network", "size": 12 },
    { "id": "c1", "x": 40, "y": 220, "w": 80, "h": 34, "label": "client", "tone": "sky", "size": 12 },
    { "id": "c2", "x": 150, "y": 220, "w": 80, "h": 34, "label": "client", "tone": "sky", "size": 12 },
    { "id": "c3", "x": 260, "y": 220, "w": 80, "h": 34, "label": "client", "tone": "sky", "size": 12 },
    { "id": "p1", "x": 500, "y": 55, "w": 80, "h": 34, "shape": "ellipse", "label": "peer", "tone": "emerald", "size": 12 },
    { "id": "p2", "x": 600, "y": 130, "w": 80, "h": 34, "shape": "ellipse", "label": "peer", "tone": "emerald", "size": 12 },
    { "id": "p3", "x": 560, "y": 225, "w": 80, "h": 34, "shape": "ellipse", "label": "peer", "tone": "emerald", "size": 12 },
    { "id": "p4", "x": 440, "y": 225, "w": 80, "h": 34, "shape": "ellipse", "label": "peer", "tone": "emerald", "size": 12 },
    { "id": "p5", "x": 400, "y": 130, "w": 80, "h": 34, "shape": "ellipse", "label": "peer", "tone": "emerald", "size": 12 }
  ],
  "edges": [
    { "from": "srv", "to": "net", "arrow": "both" },
    { "from": "c1", "to": "net", "arrow": "both" }, { "from": "c2", "to": "net", "arrow": "both" }, { "from": "c3", "to": "net", "arrow": "both" },
    { "from": "p1", "to": "p2", "arrow": "none" }, { "from": "p2", "to": "p3", "arrow": "none" }, { "from": "p3", "to": "p4", "arrow": "none" }, { "from": "p4", "to": "p5", "arrow": "none" }, { "from": "p5", "to": "p1", "arrow": "none" },
    { "from": "p1", "to": "p3", "arrow": "none" }, { "from": "p1", "to": "p4", "arrow": "none" }, { "from": "p2", "to": "p4", "arrow": "none" }, { "from": "p2", "to": "p5", "arrow": "none" }, { "from": "p3", "to": "p5", "arrow": "none" }
  ]
}
```

### Le cloud en détail

| Par qui | Par couche |
|---|---|
| **Public** : ouvert à qui paie | **SaaS** : une application via Internet (ex. traitement de texte en ligne) |
| **Private** : une entreprise pour elle-même | **PaaS** : une pile logicielle prête à l'emploi (ex. serveur de base de données) |
| **Hybrid** : mélange des deux | **IaaS** : serveurs ou stockage via Internet (ex. stockage de sauvegarde) |

Un environnement cloud = OS classiques + **VMM** + outils de gestion du cloud,
protégés par des **firewalls**, avec des **load balancers** qui répartissent le
trafic.

```diagram
{
  "title": "Cloud computing environment: customer requests pass a firewall and a load balancer before reaching virtual machines and storage.",
  "nodes": [
    { "id": "cust", "x": 70, "y": 110, "w": 100, "h": 44, "shape": "ellipse", "label": "customer\nrequests", "size": 12 },
    { "id": "inet", "x": 220, "y": 110, "w": 90, "h": 44, "shape": "ellipse", "label": "Internet", "tone": "sky", "filled": true, "size": 12 },
    { "id": "fw", "x": 350, "y": 110, "w": 90, "h": 40, "label": "firewall", "tone": "rose", "filled": true, "size": 12 },
    { "id": "lb", "x": 480, "y": 110, "w": 110, "h": 40, "label": "load balancer", "tone": "amber", "filled": true, "size": 12 },
    { "id": "vm1", "x": 640, "y": 40, "w": 110, "h": 36, "label": "virtual machines", "tone": "emerald", "size": 11 },
    { "id": "vm2", "x": 640, "y": 110, "w": 110, "h": 36, "label": "virtual machines", "tone": "emerald", "size": 11 },
    { "id": "st", "x": 640, "y": 190, "w": 110, "h": 44, "shape": "cylinder", "label": "storage", "tone": "violet", "filled": true, "size": 11 },
    { "id": "mgmt", "x": 480, "y": 200, "w": 140, "h": 40, "label": "cloud management\ncommands", "size": 11, "shape": "note", "tone": "neutral" }
  ],
  "edges": [
    { "from": "cust", "to": "inet" }, { "from": "inet", "to": "fw" }, { "from": "fw", "to": "lb" },
    { "from": "lb", "to": "vm1" }, { "from": "lb", "to": "vm2" },
    { "from": "vm2", "to": "st", "arrow": "both", "dashed": true },
    { "from": "mgmt", "to": "vm2", "dashed": true }
  ]
}
```

## 9. Open source et structures de données du noyau

Un OS **open-source** est distribué sous forme de **code source**, et non
seulement en binaire (fermé, propriétaire), à l'opposé de la protection contre
la copie et du **DRM**. Le mouvement a été lancé par la **Free Software
Foundation (FSF)** et sa licence **copyleft** : la **GNU General Public License
(GPL)**. Exemples : **GNU/Linux**, **BSD UNIX** (le cœur de macOS).

> **Piège :** *free software* et *open-source software* sont **deux idées
> différentes** (liberté vs accès au code), même si elles se recoupent.

Les structures de données du noyau sont les mêmes qu'en programmation
classique :

```diagram
{
  "title": "Linked lists: singly linked (one link per node), doubly linked (previous and next), circular (the last node points back to the first).",
  "nodes": [
    { "id": "h1", "x": 20, "y": 40, "shape": "text", "label": "singly", "size": 11, "bold": true },
    { "id": "s1", "x": 130, "y": 40, "shape": "table", "size": 11, "header": false, "rows": [["data","next"]] },
    { "id": "s2", "x": 280, "y": 40, "shape": "table", "size": 11, "header": false, "rows": [["data","next"]] },
    { "id": "s3", "x": 430, "y": 40, "shape": "table", "size": 11, "header": false, "rows": [["data","next"]] },
    { "id": "snull", "x": 560, "y": 40, "shape": "text", "label": "null", "size": 11 },
    { "id": "h2", "x": 20, "y": 120, "shape": "text", "label": "doubly", "size": 11, "bold": true },
    { "id": "dnull1", "x": 60, "y": 120, "shape": "text", "label": "null", "size": 11 },
    { "id": "d1", "x": 160, "y": 120, "shape": "table", "size": 11, "header": false, "rows": [["prev","data","next"]] },
    { "id": "d2", "x": 330, "y": 120, "shape": "table", "size": 11, "header": false, "rows": [["prev","data","next"]] },
    { "id": "d3", "x": 500, "y": 120, "shape": "table", "size": 11, "header": false, "rows": [["prev","data","next"]] },
    { "id": "dnull2", "x": 620, "y": 120, "shape": "text", "label": "null", "size": 11 },
    { "id": "h3", "x": 20, "y": 210, "shape": "text", "label": "circular", "size": 11, "bold": true },
    { "id": "c1", "x": 130, "y": 210, "shape": "table", "size": 11, "header": false, "rows": [["data","next"]] },
    { "id": "c2", "x": 280, "y": 210, "shape": "table", "size": 11, "header": false, "rows": [["data","next"]] },
    { "id": "c3", "x": 430, "y": 210, "shape": "table", "size": 11, "header": false, "rows": [["data","next"]] }
  ],
  "edges": [
    { "from": "s1", "to": "s2" }, { "from": "s2", "to": "s3" }, { "from": "s3", "to": "snull" },
    { "from": "d1", "to": "d2", "arrow": "both" }, { "from": "d2", "to": "d3", "arrow": "both" }, { "from": "d1", "to": "dnull1" }, { "from": "d3", "to": "dnull2" },
    { "from": "c1", "to": "c2" }, { "from": "c2", "to": "c3" },
    { "from": "c3", "to": "c1", "via": [[430, 260], [130, 260]] }
  ]
}
```

```diagram
{
  "title": "Binary search tree (left ≤ right): search is O(n) in the worst case, O(lg n) when the tree is balanced.",
  "nodes": [
    { "id": "n17", "x": 330, "y": 30, "w": 44, "h": 36, "shape": "ellipse", "label": "17", "tone": "amber", "filled": true },
    { "id": "n12", "x": 230, "y": 110, "w": 44, "h": 36, "shape": "ellipse", "label": "12", "tone": "sky" },
    { "id": "n35", "x": 430, "y": 110, "w": 44, "h": 36, "shape": "ellipse", "label": "35", "tone": "sky" },
    { "id": "n6", "x": 180, "y": 190, "w": 44, "h": 36, "shape": "ellipse", "label": "6", "tone": "sky" },
    { "id": "n14", "x": 280, "y": 190, "w": 44, "h": 36, "shape": "ellipse", "label": "14", "tone": "sky" },
    { "id": "n32", "x": 380, "y": 190, "w": 44, "h": 36, "shape": "ellipse", "label": "32", "tone": "sky" },
    { "id": "n40", "x": 480, "y": 190, "w": 44, "h": 36, "shape": "ellipse", "label": "40", "tone": "sky" }
  ],
  "edges": [
    { "from": "n17", "to": "n12", "arrow": "none" }, { "from": "n17", "to": "n35", "arrow": "none" },
    { "from": "n12", "to": "n6", "arrow": "none" }, { "from": "n12", "to": "n14", "arrow": "none" },
    { "from": "n35", "to": "n32", "arrow": "none" }, { "from": "n35", "to": "n40", "arrow": "none" }
  ]
}
```

```diagram
{
  "title": "Hash map: a hash function turns a key into the index of a bucket holding the value.",
  "nodes": [
    { "id": "key", "x": 80, "y": 60, "w": 80, "h": 36, "label": "key", "tone": "sky", "filled": true },
    { "id": "hf", "x": 250, "y": 60, "w": 140, "h": 40, "label": "hash_function(key)", "tone": "amber", "filled": true, "size": 12 },
    { "id": "map", "x": 500, "y": 60, "shape": "table", "size": 11, "cols": [40, 40, 40, 40, 40, 40], "rows": [["0","1","2","…","n-2","n-1"],["","","value","","",""]], "mark": [1] },
    { "id": "lbl", "x": 500, "y": 130, "shape": "text", "label": "hash map (buckets)", "size": 11 }
  ],
  "edges": [
    { "from": "key", "to": "hf" },
    { "from": "hf", "to": "map", "label": "index" }
  ]
}
```

- **Bitmap** : une chaîne de *n* bits qui représente l'état de *n* éléments
  (par exemple bloc libre / occupé).
- Linux les définit dans `<linux/list.h>`, `<linux/kfifo.h>`,
  `<linux/rbtree.h>`.
- Recherche dans un arbre binaire de recherche : **O(n)** au pire, **O(lg n)**
  s'il est équilibré.

---

## À retenir

- OS = **intermédiaire** entre l'utilisateur et le matériel ; le **kernel** est
  le seul programme qui tourne en permanence. Quatre composants : hardware, OS,
  applications, users.
- CPU et contrôleurs partagent un **bus** vers la mémoire ; chaque contrôleur a
  un **local buffer** et un **driver** ; il signale la fin par une
  **interrupt**, routée via l'**interrupt vector**. **Trap / exception** =
  interruption logicielle (erreur ou system call). L'OS est **interrupt
  driven**.
- **DMA** : une interruption **par bloc**, sans le CPU.
- Hiérarchie : registers → cache → main memory (volatile) → NVM → HDD →
  optical → tape. **Caching** partout, **cache coherency** en multiprocesseur.
  1 KB = 1 024 B ; les réseaux comptent en **bits**.
- **Multiprogramming** : le CPU a toujours un job. **Timesharing** : en plus,
  l'interactivité (< 1 s).
- **Dual mode** : mode bit 1 = user, 0 = kernel ; system call → kernel, retour
  → user ; **privileged instructions**. **Timer** contre les boucles infinies.
- Process = programme **en exécution** (actif) ; program = **passif**.
- **Protection** (contrôle d'accès) ≠ **security** (défense contre les
  attaques). Emulation = CPU différent, la plus lente.
- **SMP** : chaque CPU fait tout. **Multicore** : plusieurs cœurs, une puce.
  **NUMA** : accès mémoire non uniforme. **Cluster** : plusieurs machines + SAN.
- Cloud : public / private / hybrid ; **SaaS / PaaS / IaaS**.

## Pièges classiques du quiz

| Affirmation | Vrai / Faux |
|---|---|
| Le kernel est le seul programme qui tourne en permanence | **Vrai** |
| Un trap est une interruption matérielle | **Faux** : générée par le logiciel |
| Avec le DMA, le CPU reçoit une interruption par octet | **Faux** : une par **bloc** |
| La RAM est non volatile | **Faux** : volatile |
| 1 KB = 1 000 bytes | **Faux** : 1 024 |
| En user mode, le mode bit vaut 0 | **Faux** : user = 1, kernel = 0 |
| Un programme utilisateur peut régler le timer | **Faux** : instruction privilégiée |
| L'emulation est plus rapide que la virtualisation | **Faux** : c'est la plus lente |
| En SMP, chaque processeur a une tâche dédiée | **Faux** : ça, c'est l'asymmetric |
| Un real-time OS n'a pas de contrainte de temps stricte | **Faux** : contraintes fixes |
