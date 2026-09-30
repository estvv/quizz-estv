# Operating System — Week 6 · CPU Scheduling

**Cours** : chapitre 5 du Silberschatz, *CPU Scheduling*, et la *lecture note*
du professeur : les notions de base (CPU–I/O burst, scheduler, dispatcher,
préemption), les **critères**, les **algorithmes** (FCFS, SJF, SRTF, Round
Robin, Priority, Multilevel Queue, Multilevel Feedback Queue), l'ordonnancement
des threads et des multiprocesseurs, le **temps réel** (RMS, EDF), Linux (CFS)
et l'évaluation des algorithmes (Little's formula).
**Lab** : utilisateurs et groupes (`id`, `/etc/passwd`, `/etc/group`, `su`),
processus et états Linux.

> **En bref.** Le **CPU scheduler** choisit quel processus de la **ready
> queue** reçoit le CPU. On juge un algorithme sur l'**utilisation CPU**, le
> **throughput**, le **turnaround**, le **waiting time** et le **response
> time**. **SJF** donne le plus petit temps d'attente moyen, **Round Robin**
> est le plus équitable, **Priority** risque la **starvation** (solution :
> l'**aging**). Au quiz, sache **lire et calculer un diagramme de Gantt**.

---

# Partie 1 — Cours

## 1. Notions de base

- La **multiprogrammation** sert à **maximiser l'utilisation du CPU**.
- L'exécution d'un processus alterne des **CPU bursts** (calcul) et des **I/O
  bursts** (attente d'E/S) : c'est le **CPU–I/O burst cycle**.
- La distribution des CPU bursts : **beaucoup de bursts courts**, **peu de
  bursts longs**.

| Type de processus | Profil |
|---|---|
| **I/O-bound** | beaucoup de bursts CPU **courts** (un éditeur, un navigateur) |
| **CPU-bound** | quelques bursts CPU **longs** (un calcul scientifique) |

### Le CPU scheduler

Il choisit un processus dans la **ready queue** et lui alloue un cœur. Une
décision d'ordonnancement peut avoir lieu quand un processus :

1. passe de **running à waiting** (demande d'E/S) ;
2. passe de **running à ready** (interruption) ;
3. passe de **waiting à ready** (fin d'E/S) ;
4. **se termine**.

Dans les cas **1 et 4**, pas le choix : il faut prendre un nouveau processus.
Dans les cas **2 et 3**, il y a un choix.

| **Nonpreemptive** | **Preemptive** |
|---|---|
| ordonnancement **seulement dans les cas 1 et 4** | ordonnancement aussi dans les cas 2 et 3 |
| une fois le CPU obtenu, le processus le garde **jusqu'à ce qu'il se termine ou passe en waiting** | l'OS peut **retirer** le CPU à un processus |
| | utilisé par **quasiment tous les OS modernes** : Windows, macOS, Linux, UNIX |

> **Attention :** la préemption peut créer des **race conditions** si des
> processus partagent des données : l'un est interrompu en pleine mise à jour,
> l'autre lit des données incohérentes (chapitre 6).

### Le dispatcher

Le **dispatcher** donne le contrôle du CPU au processus choisi par le
scheduler :

1. **context switch** ;
2. **passage en user mode** ;
3. **saut au bon endroit** du programme pour le reprendre.

La **dispatch latency** est le temps qu'il faut au dispatcher pour **arrêter
un processus et en lancer un autre**.

> **Piège :** le **scheduler** **choisit** le processus ; le **dispatcher**
> lui **donne** le CPU.

## 2. Les critères d'ordonnancement

| Critère | Définition | On veut |
|---|---|---|
| **CPU utilization** | garder le CPU **le plus occupé possible** | **max** |
| **Throughput** | nombre de processus **terminés par unité de temps** | **max** |
| **Turnaround time** | temps total pour exécuter un processus (arrivée → fin) | **min** |
| **Waiting time** | temps passé **à attendre dans la ready queue** | **min** |
| **Response time** | temps entre la soumission d'une requête et la **première réponse** | **min** |

Les formules :

```
Turnaround time = completion time − arrival time
Waiting time    = turnaround time − burst time
Response time   = first time on the CPU − arrival time
Throughput      = number of processes completed / total time
```

> **Piège :** le **waiting time** ne compte **que** le temps dans la **ready
> queue**, pas le temps d'exécution ni le temps d'E/S.

## 3. Les algorithmes

### First-Come, First-Served (FCFS)

Les processus sont servis **dans l'ordre d'arrivée** (une file FIFO).
**Nonpreemptive.**

| Process | Burst time |
|---|---|
| P1 | 24 |
| P2 | 3 |
| P3 | 3 |

Arrivée dans l'ordre P1, P2, P3 :

```diagram
{
  "title": "FCFS, arrival order P1, P2, P3 — average waiting time 17",
  "nodes": [
    {
      "id": "s0",
      "x": 264.0,
      "y": 40,
      "w": 448.0,
      "h": 34,
      "label": "P1",
      "tone": "sky",
      "filled": true,
      "size": 12
    },
    {
      "id": "s1",
      "x": 516.0,
      "y": 40,
      "w": 56.0,
      "h": 34,
      "label": "P2",
      "tone": "amber",
      "filled": true,
      "size": 12
    },
    {
      "id": "s2",
      "x": 572.0,
      "y": 40,
      "w": 56.0,
      "h": 34,
      "label": "P3",
      "tone": "emerald",
      "filled": true,
      "size": 12
    },
    {
      "id": "t0",
      "x": 40.0,
      "y": 72,
      "shape": "text",
      "label": "0",
      "size": 10
    },
    {
      "id": "t24",
      "x": 488.0,
      "y": 72,
      "shape": "text",
      "label": "24",
      "size": 10
    },
    {
      "id": "t27",
      "x": 544.0,
      "y": 72,
      "shape": "text",
      "label": "27",
      "size": 10
    },
    {
      "id": "t30",
      "x": 600.0,
      "y": 72,
      "shape": "text",
      "label": "30",
      "size": 10
    }
  ],
  "edges": []
}
```

Waiting : P1 = 0, P2 = 24, P3 = 27 → **moyenne = (0 + 24 + 27) / 3 = 17**.

Arrivée dans l'ordre P2, P3, P1 :

```diagram
{
  "title": "FCFS, arrival order P2, P3, P1 — average waiting time 3",
  "nodes": [
    {
      "id": "s0",
      "x": 68.0,
      "y": 40,
      "w": 56.0,
      "h": 34,
      "label": "P2",
      "tone": "amber",
      "filled": true,
      "size": 12
    },
    {
      "id": "s1",
      "x": 124.0,
      "y": 40,
      "w": 56.0,
      "h": 34,
      "label": "P3",
      "tone": "emerald",
      "filled": true,
      "size": 12
    },
    {
      "id": "s2",
      "x": 376.0,
      "y": 40,
      "w": 448.0,
      "h": 34,
      "label": "P1",
      "tone": "sky",
      "filled": true,
      "size": 12
    },
    {
      "id": "t0",
      "x": 40.0,
      "y": 72,
      "shape": "text",
      "label": "0",
      "size": 10
    },
    {
      "id": "t3",
      "x": 96.0,
      "y": 72,
      "shape": "text",
      "label": "3",
      "size": 10
    },
    {
      "id": "t6",
      "x": 152.0,
      "y": 72,
      "shape": "text",
      "label": "6",
      "size": 10
    },
    {
      "id": "t30",
      "x": 600.0,
      "y": 72,
      "shape": "text",
      "label": "30",
      "size": 10
    }
  ],
  "edges": []
}
```

Waiting : P1 = 6, P2 = 0, P3 = 3 → **moyenne = (6 + 0 + 3) / 3 = 3**. Bien
mieux !

- **Avantage** : simple à implémenter.
- **Inconvénient** : l'**effet convoi** (*convoy effect*) : les processus
  courts attendent derrière un processus long ; temps d'attente moyen élevé.

### Shortest-Job-First (SJF)

On associe à chaque processus la **longueur de son prochain CPU burst**, et on
exécute **le plus court d'abord**.

| Process | Burst time |
|---|---|
| P1 | 6 |
| P2 | 8 |
| P3 | 7 |
| P4 | 3 |

```diagram
{
  "title": "SJF — average waiting time 7",
  "nodes": [
    {
      "id": "s0",
      "x": 75.0,
      "y": 40,
      "w": 70.0,
      "h": 34,
      "label": "P4",
      "tone": "violet",
      "filled": true,
      "size": 12
    },
    {
      "id": "s1",
      "x": 180.0,
      "y": 40,
      "w": 140.0,
      "h": 34,
      "label": "P1",
      "tone": "sky",
      "filled": true,
      "size": 12
    },
    {
      "id": "s2",
      "x": 331.7,
      "y": 40,
      "w": 163.3,
      "h": 34,
      "label": "P3",
      "tone": "emerald",
      "filled": true,
      "size": 12
    },
    {
      "id": "s3",
      "x": 506.7,
      "y": 40,
      "w": 186.7,
      "h": 34,
      "label": "P2",
      "tone": "amber",
      "filled": true,
      "size": 12
    },
    {
      "id": "t0",
      "x": 40.0,
      "y": 72,
      "shape": "text",
      "label": "0",
      "size": 10
    },
    {
      "id": "t3",
      "x": 110.0,
      "y": 72,
      "shape": "text",
      "label": "3",
      "size": 10
    },
    {
      "id": "t9",
      "x": 250.0,
      "y": 72,
      "shape": "text",
      "label": "9",
      "size": 10
    },
    {
      "id": "t16",
      "x": 413.3,
      "y": 72,
      "shape": "text",
      "label": "16",
      "size": 10
    },
    {
      "id": "t24",
      "x": 600.0,
      "y": 72,
      "shape": "text",
      "label": "24",
      "size": 10
    }
  ],
  "edges": []
}
```

Waiting : P1 = 3, P2 = 16, P3 = 9, P4 = 0 → **moyenne = (3 + 16 + 9 + 0) / 4 = 7**.

- **SJF est optimal** : il donne le **temps d'attente moyen minimal** pour un
  ensemble de processus donné.
- **Problème** : il faut **connaître la durée du prochain burst**. On peut
  demander à l'utilisateur, ou **l'estimer** à partir des bursts précédents par
  une **moyenne exponentielle** (*exponential averaging*) :
  τₙ₊₁ = α·tₙ + (1 − α)·τₙ, avec en général **α = ½**.
- La version **préemptive** s'appelle **SRTF**.

### Shortest-Remaining-Time-First (SRTF)

Version **préemptive** de SJF : à chaque **arrivée** d'un processus, on
recalcule ; si le nouveau a un temps **restant** plus court que le processus en
cours, il prend le CPU.

| Process | Arrival | Burst |
|---|---|---|
| P1 | 0 | 8 |
| P2 | 1 | 4 |
| P3 | 2 | 9 |
| P4 | 3 | 5 |

```diagram
{
  "title": "SRTF (preemptive SJF) — average waiting time 6.5",
  "nodes": [
    {
      "id": "s0",
      "x": 50.8,
      "y": 40,
      "w": 21.5,
      "h": 34,
      "label": "",
      "tone": "sky",
      "filled": true,
      "size": 12
    },
    {
      "id": "s1",
      "x": 104.6,
      "y": 40,
      "w": 86.2,
      "h": 34,
      "label": "P2",
      "tone": "amber",
      "filled": true,
      "size": 12
    },
    {
      "id": "s2",
      "x": 201.5,
      "y": 40,
      "w": 107.7,
      "h": 34,
      "label": "P4",
      "tone": "violet",
      "filled": true,
      "size": 12
    },
    {
      "id": "s3",
      "x": 330.8,
      "y": 40,
      "w": 150.8,
      "h": 34,
      "label": "P1",
      "tone": "sky",
      "filled": true,
      "size": 12
    },
    {
      "id": "s4",
      "x": 503.1,
      "y": 40,
      "w": 193.8,
      "h": 34,
      "label": "P3",
      "tone": "emerald",
      "filled": true,
      "size": 12
    },
    {
      "id": "t0",
      "x": 40.0,
      "y": 72,
      "shape": "text",
      "label": "0",
      "size": 10
    },
    {
      "id": "t1",
      "x": 61.5,
      "y": 72,
      "shape": "text",
      "label": "1",
      "size": 10
    },
    {
      "id": "t5",
      "x": 147.7,
      "y": 72,
      "shape": "text",
      "label": "5",
      "size": 10
    },
    {
      "id": "t10",
      "x": 255.4,
      "y": 72,
      "shape": "text",
      "label": "10",
      "size": 10
    },
    {
      "id": "t17",
      "x": 406.2,
      "y": 72,
      "shape": "text",
      "label": "17",
      "size": 10
    },
    {
      "id": "t26",
      "x": 600.0,
      "y": 72,
      "shape": "text",
      "label": "26",
      "size": 10
    }
  ],
  "edges": []
}
```

À t = 1, P2 (4) est plus court que ce qui reste à P1 (7) : **préemption**.
Waiting = (fin − arrivée − burst) :

| Process | Calcul | Waiting |
|---|---|---|
| P1 | 17 − 0 − 8 | 9 |
| P2 | 5 − 1 − 4 | 0 |
| P3 | 26 − 2 − 9 | 15 |
| P4 | 10 − 3 − 5 | 2 |

**Moyenne = 26 / 4 = 6,5.**

- **Avantage** : réduit encore le temps d'attente.
- **Inconvénient** : **overhead** dû aux préemptions.

### Round Robin (RR)

Chaque processus reçoit un petit **time quantum q** (en général **10 à 100 ms**).
Quand il est écoulé, le processus est **préempté** et remis **à la fin de la
ready queue**. Un **timer** interrompt à chaque quantum.

- Avec *n* processus et un quantum *q*, chacun reçoit **1/n du CPU**, par
  tranches d'au plus *q*. **Aucun processus n'attend plus de (n − 1)·q.**
- **q très grand → RR devient FCFS.** q trop petit → trop de context switches.
- **q doit être grand devant le temps de context switch** (< 10 µs).
- Règle pratique : **80 % des CPU bursts** doivent être **plus courts que q**.

Même exemple que FCFS (P1 = 24, P2 = 3, P3 = 3), **q = 4** :

```diagram
{
  "title": "Round Robin, q = 4 — average waiting time 17/3 ≈ 5.66",
  "nodes": [
    {
      "id": "s0",
      "x": 77.3,
      "y": 40,
      "w": 74.7,
      "h": 34,
      "label": "P1",
      "tone": "sky",
      "filled": true,
      "size": 12
    },
    {
      "id": "s1",
      "x": 142.7,
      "y": 40,
      "w": 56.0,
      "h": 34,
      "label": "P2",
      "tone": "amber",
      "filled": true,
      "size": 12
    },
    {
      "id": "s2",
      "x": 198.7,
      "y": 40,
      "w": 56.0,
      "h": 34,
      "label": "P3",
      "tone": "emerald",
      "filled": true,
      "size": 12
    },
    {
      "id": "s3",
      "x": 264.0,
      "y": 40,
      "w": 74.7,
      "h": 34,
      "label": "P1",
      "tone": "sky",
      "filled": true,
      "size": 12
    },
    {
      "id": "s4",
      "x": 338.7,
      "y": 40,
      "w": 74.7,
      "h": 34,
      "label": "P1",
      "tone": "sky",
      "filled": true,
      "size": 12
    },
    {
      "id": "s5",
      "x": 413.3,
      "y": 40,
      "w": 74.7,
      "h": 34,
      "label": "P1",
      "tone": "sky",
      "filled": true,
      "size": 12
    },
    {
      "id": "s6",
      "x": 488.0,
      "y": 40,
      "w": 74.7,
      "h": 34,
      "label": "P1",
      "tone": "sky",
      "filled": true,
      "size": 12
    },
    {
      "id": "s7",
      "x": 562.7,
      "y": 40,
      "w": 74.7,
      "h": 34,
      "label": "P1",
      "tone": "sky",
      "filled": true,
      "size": 12
    },
    {
      "id": "t0",
      "x": 40.0,
      "y": 72,
      "shape": "text",
      "label": "0",
      "size": 10
    },
    {
      "id": "t4",
      "x": 114.7,
      "y": 72,
      "shape": "text",
      "label": "4",
      "size": 10
    },
    {
      "id": "t7",
      "x": 170.7,
      "y": 72,
      "shape": "text",
      "label": "7",
      "size": 10
    },
    {
      "id": "t10",
      "x": 226.7,
      "y": 72,
      "shape": "text",
      "label": "10",
      "size": 10
    },
    {
      "id": "t14",
      "x": 301.3,
      "y": 72,
      "shape": "text",
      "label": "14",
      "size": 10
    },
    {
      "id": "t18",
      "x": 376.0,
      "y": 72,
      "shape": "text",
      "label": "18",
      "size": 10
    },
    {
      "id": "t22",
      "x": 450.7,
      "y": 72,
      "shape": "text",
      "label": "22",
      "size": 10
    },
    {
      "id": "t26",
      "x": 525.3,
      "y": 72,
      "shape": "text",
      "label": "26",
      "size": 10
    },
    {
      "id": "t30",
      "x": 600.0,
      "y": 72,
      "shape": "text",
      "label": "30",
      "size": 10
    }
  ],
  "edges": []
}
```

Waiting : P1 = 30 − 24 = 6, P2 = 4, P3 = 7 → moyenne ≈ **5,66**.

- **Avantage** : **équitable**, bon **temps de réponse**.
- **Inconvénient** : **turnaround** en général **plus élevé que SJF**, surtout
  avec un petit quantum.

### Priority Scheduling

Chaque processus a une **priorité** (un entier). Le CPU va au processus de
**plus haute priorité** : **le plus petit entier = la plus haute priorité**.
Existe en **préemptif** et **non préemptif**.

| Process | Burst | Priority |
|---|---|---|
| P1 | 10 | 3 |
| P2 | 1 | 1 |
| P3 | 2 | 4 |
| P4 | 1 | 5 |
| P5 | 5 | 2 |

```diagram
{
  "title": "Priority (smallest number = highest priority) — average waiting time 8.2",
  "nodes": [
    {
      "id": "s0",
      "x": 54.7,
      "y": 40,
      "w": 29.5,
      "h": 34,
      "label": "P2",
      "tone": "amber",
      "filled": true,
      "size": 12
    },
    {
      "id": "s1",
      "x": 143.2,
      "y": 40,
      "w": 147.4,
      "h": 34,
      "label": "P5",
      "tone": "rose",
      "filled": true,
      "size": 12
    },
    {
      "id": "s2",
      "x": 364.2,
      "y": 40,
      "w": 294.7,
      "h": 34,
      "label": "P1",
      "tone": "sky",
      "filled": true,
      "size": 12
    },
    {
      "id": "s3",
      "x": 541.1,
      "y": 40,
      "w": 58.9,
      "h": 34,
      "label": "P3",
      "tone": "emerald",
      "filled": true,
      "size": 12
    },
    {
      "id": "s4",
      "x": 585.3,
      "y": 40,
      "w": 29.5,
      "h": 34,
      "label": "P4",
      "tone": "violet",
      "filled": true,
      "size": 12
    },
    {
      "id": "t0",
      "x": 40.0,
      "y": 72,
      "shape": "text",
      "label": "0",
      "size": 10
    },
    {
      "id": "t1",
      "x": 69.5,
      "y": 72,
      "shape": "text",
      "label": "1",
      "size": 10
    },
    {
      "id": "t6",
      "x": 216.8,
      "y": 72,
      "shape": "text",
      "label": "6",
      "size": 10
    },
    {
      "id": "t16",
      "x": 511.6,
      "y": 72,
      "shape": "text",
      "label": "16",
      "size": 10
    },
    {
      "id": "t18",
      "x": 570.5,
      "y": 72,
      "shape": "text",
      "label": "18",
      "size": 10
    },
    {
      "id": "t19",
      "x": 600.0,
      "y": 72,
      "shape": "text",
      "label": "19",
      "size": 10
    }
  ],
  "edges": []
}
```

Waiting : P1 = 6, P2 = 0, P3 = 16, P4 = 18, P5 = 1 → **moyenne = 41 / 5 = 8,2**.

- **SJF est un cas particulier** : la priorité est l'**inverse** de la durée
  prévue du prochain burst.
- **Problème : la starvation** (famine) : un processus de faible priorité
  peut **ne jamais s'exécuter**.
- **Solution : l'aging** (vieillissement) : **augmenter la priorité** d'un
  processus **avec le temps** qu'il passe à attendre.

**Priority + Round Robin** : on exécute la plus haute priorité ; les processus
de **même priorité** tournent en **round robin**.

| Process | Burst | Priority |
|---|---|---|
| P1 | 4 | 3 |
| P2 | 5 | 2 |
| P3 | 8 | 2 |
| P4 | 7 | 1 |
| P5 | 3 | 3 |

```diagram
{
  "title": "Priority + Round Robin (q = 2) for equal priorities",
  "nodes": [
    {
      "id": "s0",
      "x": 112.6,
      "y": 40,
      "w": 145.2,
      "h": 34,
      "label": "P4",
      "tone": "violet",
      "filled": true,
      "size": 12
    },
    {
      "id": "s1",
      "x": 205.9,
      "y": 40,
      "w": 41.5,
      "h": 34,
      "label": "P2",
      "tone": "amber",
      "filled": true,
      "size": 12
    },
    {
      "id": "s2",
      "x": 247.4,
      "y": 40,
      "w": 41.5,
      "h": 34,
      "label": "P3",
      "tone": "emerald",
      "filled": true,
      "size": 12
    },
    {
      "id": "s3",
      "x": 288.9,
      "y": 40,
      "w": 41.5,
      "h": 34,
      "label": "P2",
      "tone": "amber",
      "filled": true,
      "size": 12
    },
    {
      "id": "s4",
      "x": 330.4,
      "y": 40,
      "w": 41.5,
      "h": 34,
      "label": "P3",
      "tone": "emerald",
      "filled": true,
      "size": 12
    },
    {
      "id": "s5",
      "x": 361.5,
      "y": 40,
      "w": 20.7,
      "h": 34,
      "label": "",
      "tone": "amber",
      "filled": true,
      "size": 12
    },
    {
      "id": "s6",
      "x": 413.3,
      "y": 40,
      "w": 83.0,
      "h": 34,
      "label": "P3",
      "tone": "emerald",
      "filled": true,
      "size": 12
    },
    {
      "id": "s7",
      "x": 475.6,
      "y": 40,
      "w": 41.5,
      "h": 34,
      "label": "P1",
      "tone": "sky",
      "filled": true,
      "size": 12
    },
    {
      "id": "s8",
      "x": 517.0,
      "y": 40,
      "w": 41.5,
      "h": 34,
      "label": "P5",
      "tone": "rose",
      "filled": true,
      "size": 12
    },
    {
      "id": "s9",
      "x": 558.5,
      "y": 40,
      "w": 41.5,
      "h": 34,
      "label": "P1",
      "tone": "sky",
      "filled": true,
      "size": 12
    },
    {
      "id": "s10",
      "x": 589.6,
      "y": 40,
      "w": 20.7,
      "h": 34,
      "label": "",
      "tone": "rose",
      "filled": true,
      "size": 12
    },
    {
      "id": "t0",
      "x": 40.0,
      "y": 72,
      "shape": "text",
      "label": "0",
      "size": 10
    },
    {
      "id": "t7",
      "x": 185.2,
      "y": 72,
      "shape": "text",
      "label": "7",
      "size": 10
    },
    {
      "id": "t9",
      "x": 226.7,
      "y": 72,
      "shape": "text",
      "label": "9",
      "size": 10
    },
    {
      "id": "t11",
      "x": 268.1,
      "y": 72,
      "shape": "text",
      "label": "11",
      "size": 10
    },
    {
      "id": "t13",
      "x": 309.6,
      "y": 72,
      "shape": "text",
      "label": "13",
      "size": 10
    },
    {
      "id": "t15",
      "x": 351.1,
      "y": 72,
      "shape": "text",
      "label": "15",
      "size": 10
    },
    {
      "id": "t16",
      "x": 371.9,
      "y": 72,
      "shape": "text",
      "label": "16",
      "size": 10
    },
    {
      "id": "t20",
      "x": 454.8,
      "y": 72,
      "shape": "text",
      "label": "20",
      "size": 10
    },
    {
      "id": "t22",
      "x": 496.3,
      "y": 72,
      "shape": "text",
      "label": "22",
      "size": 10
    },
    {
      "id": "t24",
      "x": 537.8,
      "y": 72,
      "shape": "text",
      "label": "24",
      "size": 10
    },
    {
      "id": "t26",
      "x": 579.3,
      "y": 72,
      "shape": "text",
      "label": "26",
      "size": 10
    },
    {
      "id": "t27",
      "x": 600.0,
      "y": 72,
      "shape": "text",
      "label": "27",
      "size": 10
    }
  ],
  "edges": []
}
```

### Multilevel Queue

La ready queue est **divisée en plusieurs files**, souvent par **type de
processus** ou par priorité ; **chaque file a son propre algorithme**. On sert
d'abord la file de **plus haute priorité**.

```diagram
{
  "title": "Multilevel queue : une file par type de processus, de la plus haute à la plus basse priorité.",
  "nodes": [
    { "id": "hp", "x": 40, "y": 30, "shape": "text", "label": "highest\npriority", "size": 11 },
    { "id": "q1", "x": 300, "y": 30, "w": 360, "h": 34, "label": "real-time processes", "tone": "rose", "filled": true, "size": 12 },
    { "id": "q2", "x": 300, "y": 75, "w": 360, "h": 34, "label": "system processes", "tone": "amber", "filled": true, "size": 12 },
    { "id": "q3", "x": 300, "y": 120, "w": 360, "h": 34, "label": "interactive processes", "tone": "sky", "filled": true, "size": 12 },
    { "id": "q4", "x": 300, "y": 165, "w": 360, "h": 34, "label": "batch processes", "tone": "emerald", "filled": true, "size": 12 },
    { "id": "lp", "x": 40, "y": 165, "shape": "text", "label": "lowest\npriority", "size": 11 },
    { "id": "a", "x": 40, "y": 60, "shape": "text" },
    { "id": "b", "x": 40, "y": 135, "shape": "text" }
  ],
  "edges": [
    { "from": "a", "to": "b" }
  ]
}
```

Paramètres : **nombre de files**, **algorithme de chaque file**, **méthode
pour choisir la file** d'un processus, **ordonnancement entre les files**.
**Inconvénient** : configuration complexe.

### Multilevel Feedback Queue (MLFQ)

Comme la multilevel queue, mais **un processus peut changer de file** selon son
comportement. C'est le plus **adaptable**, mais le plus **complexe** à régler.
On peut y implémenter l'**aging**.

```diagram
{
  "title": "Exemple de multilevel feedback queue : un processus qui ne finit pas descend d'un niveau.",
  "nodes": [
    { "id": "in", "x": 40, "y": 40, "shape": "text", "label": "new\nprocess", "size": 11 },
    { "id": "q0", "x": 260, "y": 40, "w": 300, "h": 36, "label": "Q0 — RR, quantum = 8 ms", "tone": "sky", "filled": true, "size": 12 },
    { "id": "q1", "x": 260, "y": 120, "w": 300, "h": 36, "label": "Q1 — RR, quantum = 16 ms", "tone": "amber", "filled": true, "size": 12 },
    { "id": "q2", "x": 260, "y": 200, "w": 300, "h": 36, "label": "Q2 — FCFS", "tone": "rose", "filled": true, "size": 12 },
    { "id": "d0", "x": 560, "y": 40, "shape": "text", "label": "finished", "size": 11 },
    { "id": "d1", "x": 560, "y": 120, "shape": "text", "label": "finished", "size": 11 },
    { "id": "d2", "x": 560, "y": 200, "shape": "text", "label": "finished", "size": 11 }
  ],
  "edges": [
    { "from": "in", "to": "q0" },
    { "from": "q0", "to": "q1", "label": "not done in 8 ms" },
    { "from": "q1", "to": "q2", "label": "not done in 16 more ms" },
    { "from": "q0", "to": "d0" }, { "from": "q1", "to": "d1" }, { "from": "q2", "to": "d2" }
  ]
}
```

Un nouveau processus entre dans **Q0** (RR, 8 ms). S'il ne finit pas en 8 ms,
il descend dans **Q1** (RR, 16 ms de plus) ; s'il ne finit toujours pas, il
descend dans **Q2** (**FCFS**). Les processus courts (interactifs) restent en
haut, les longs (CPU-bound) descendent.

Paramètres : nombre de files, algorithme de chaque file, méthode pour **promouvoir**
(*upgrade*), pour **rétrograder** (*demote*), et pour choisir la file d'entrée.

### Tableau comparatif (lecture note du professeur)

| Algorithme | Préemptif ? | Avantage | Inconvénient |
|---|---|---|---|
| **FCFS** | non | simple | **convoy effect**, attente élevée |
| **SJF** | non | **attente moyenne minimale** (optimal) | il faut **prédire** la durée du burst |
| **SRTF** | **oui** | attente encore plus faible | **overhead** des préemptions |
| **Round Robin** | **oui** | **équitable**, bon temps de réponse | turnaround élevé avec un petit quantum |
| **Priority** | les deux | flexible | **starvation** → **aging** |
| **Multilevel Queue** | selon les files | gère bien des priorités différentes | configuration complexe |
| **MLFQ** | oui | **adaptable, dynamique** | le plus complexe à configurer |

## 4. Ordonnancement des threads

Quand l'OS gère des threads, ce sont **les threads** (pas les processus) qui
sont ordonnancés.

| **Process-contention scope (PCS)** | **System-contention scope (SCS)** |
|---|---|
| la bibliothèque de threads place les **user threads** sur les **LWP** (modèles many-to-one, many-to-many) | le noyau place les **kernel threads** sur les CPU |
| la compétition a lieu **à l'intérieur du processus** | la compétition a lieu **entre tous les threads du système** |
| en général selon une priorité fixée par le programmeur | |

Pthreads permet de choisir à la création : `PTHREAD_SCOPE_PROCESS` (PCS) ou
`PTHREAD_SCOPE_SYSTEM` (SCS). **Linux et macOS n'autorisent que
`PTHREAD_SCOPE_SYSTEM`.**

## 5. Ordonnancement multiprocesseur

Architectures possibles : multicore, cœurs multithreads, NUMA, multiprocesseur
hétérogène.

- **SMP** (*symmetric multiprocessing*) : **chaque processeur s'ordonnance
  lui-même**. Soit **une ready queue commune** à tous, soit **une file privée
  par processeur**.
- **Multicore** : plusieurs cœurs sur une puce ; plus rapide et consomme moins.
- **Chip multithreading (CMT)** = **hyperthreading** chez Intel : chaque cœur a
  **plusieurs hardware threads**. Quand un thread attend la mémoire (*memory
  stall*), le cœur passe à un autre. **4 cœurs × 2 hardware threads = 8
  processeurs logiques** vus par l'OS. Deux niveaux d'ordonnancement : l'OS
  choisit le thread logiciel pour chaque CPU logique ; chaque cœur choisit son
  hardware thread.

### Load balancing

Garder **tous les CPU chargés** de façon équilibrée :

| **Push migration** | **Pull migration** |
|---|---|
| une tâche périodique vérifie la charge et **pousse** des tâches d'un CPU surchargé vers les autres | un CPU **inactif tire** une tâche d'un CPU occupé |

### Processor affinity

Un thread qui a tourné sur un processeur a **rempli son cache** : il a une
**affinité** pour ce processeur. Le load balancing peut casser cette affinité
(le thread perd son cache en changeant de CPU).

| **Soft affinity** | **Hard affinity** |
|---|---|
| l'OS **essaie** de garder le thread sur le même CPU, **sans garantie** | le processus **impose** l'ensemble des CPU sur lesquels il peut tourner |

**NUMA** : un OS **NUMA-aware** alloue la mémoire **la plus proche** du CPU
où tourne le thread.

## 6. Ordonnancement temps réel

| **Soft real-time** | **Hard real-time** |
|---|---|
| les tâches critiques ont la **plus haute priorité**, mais **aucune garantie** de délai | une tâche **doit** être servie **avant sa deadline** |

**Event latency** : temps entre un événement et son traitement. Deux
composantes :

- **Interrupt latency** : de l'arrivée de l'interruption au début de la routine
  qui la traite ;
- **Dispatch latency** : le temps pour retirer le processus courant du CPU et
  lancer l'autre.

Pour le temps réel, le scheduler doit être **préemptif et à priorités** (ce qui
suffit pour du soft real-time). Les tâches **périodiques** ont un temps de
traitement **t**, une deadline **d**, une période **p**, avec **0 ≤ t ≤ d ≤ p** ;
leur **rate** est **1/p**.

| Algorithme | Priorité | Règle |
|---|---|---|
| **Rate Monotonic (RMS)** | **fixe** (statique) | **période plus courte = priorité plus haute** |
| **Earliest Deadline First (EDF)** | **dynamique** | **deadline la plus proche = priorité la plus haute** |
| **Proportional share** | parts | *T* parts au total ; une appli qui a *N* parts reçoit **N / T** du CPU |

**POSIX real-time** (POSIX.1b) : deux classes.
**`SCHED_FIFO`** : FCFS avec une file FIFO, **sans time-slicing** entre threads de
même priorité. **`SCHED_RR`** : pareil, mais **avec time-slicing** entre threads
de même priorité.

## 7. Exemple : l'ordonnancement sous Linux

- **Avant 2.5** : variante de l'algorithme UNIX classique.
- **2.5** : ordonnanceur **O(1)**, préemptif, à priorités ; deux plages :
  **temps réel 0–99** et **nice 100–140** ; un plus petit nombre = plus haute
  priorité ; deux tableaux *active* / *expired*. Mauvais temps de réponse pour
  les processus interactifs.
- **Depuis 2.6.23 : CFS (Completely Fair Scheduler)** :
  - des **classes d'ordonnancement** (défaut et temps réel) ;
  - pas de quantum fixe : une **proportion du temps CPU** ;
  - quantum calculé à partir de la **nice value, de −20 à +19** (plus petit =
    plus prioritaire) ;
  - **target latency** : intervalle pendant lequel chaque tâche doit tourner au
    moins une fois ;
  - chaque tâche a un **`vruntime`** (temps d'exécution virtuel) ; **le
    scheduler choisit la tâche au plus petit `vruntime`**.
- Nice −20 → priorité globale 100 ; nice +19 → 139.
- Linux fait du **load balancing** et est **NUMA-aware** (**scheduling domains**).

## 8. Évaluer un algorithme

| Méthode | Principe | Limite |
|---|---|---|
| **Deterministic modeling** | on prend une **charge fixe** et on calcule la performance de chaque algorithme | simple et rapide, mais **valable seulement pour ces données** |
| **Queueing models** | décrire arrivées et bursts de façon **probabiliste** | modèles limités |
| **Simulation** | programmer un modèle du système, avec des données aléatoires ou des **trace tapes** (événements réels enregistrés) | plus précis, mais coûteux |
| **Implementation** | implémenter pour de vrai et tester | coût et risque élevés |

**Exemple déterministe du cours** (5 processus à t = 0, bursts 10, 29, 3, 7,
12) : FCFS = **28 ms**, SJF non préemptif = **13 ms**, RR = **23 ms**.

### Little's formula

```
n = λ × W
```

- **n** : longueur moyenne de la file ;
- **λ** : taux d'arrivée moyen ;
- **W** : temps d'attente moyen dans la file.

Valable **pour n'importe quel algorithme et n'importe quelle distribution**
d'arrivées, en régime stable. **Exemple :** 7 processus arrivent par seconde
et il y a normalement 14 processus dans la file → **W = n / λ = 14 / 7 = 2 s**.

---

# Partie 2 — Lab : utilisateurs, groupes, processus

## 9. Utilisateurs et groupes

- **Tout processus tourne en tant qu'un utilisateur**, et **tout fichier
  appartient à un utilisateur**. L'utilisateur d'un processus détermine les
  fichiers auxquels il a accès.
- `id` : infos sur l'utilisateur courant (ou `id autre_user`) ;
  exemple : `uid=1000(student) gid=1000(student) groups=1000(student),10(wheel)`.
- `ls -l` : la **3e colonne** est le propriétaire du fichier.
- `ps au` : la **1re colonne** est l'utilisateur du processus (`a` = tous les
  processus avec un terminal, `u` = afficher l'utilisateur).

### Les groupes

- Un groupe a un **nom** et un **numéro (GID)**. Les groupes locaux sont
  définis dans **`/etc/group`**.
- **Chaque utilisateur a exactement un groupe primaire** (*primary group*).
- Pour les utilisateurs locaux, il est défini par le **GID du 4e champ de
  `/etc/passwd`**.
- En général, **le groupe primaire possède les nouveaux fichiers** créés par
  l'utilisateur.
- Un nouvel utilisateur reçoit en général un groupe **du même nom** dont il
  est le seul membre : un **User Private Group (UPG)**.
- Les autres groupes d'un utilisateur sont ses **supplementary groups** (ex.
  `wheel`, le groupe des administrateurs).

### Changer d'utilisateur

| Commande | Effet |
|---|---|
| `su - username` | **login shell** : l'environnement est celui de l'utilisateur, comme à une vraie connexion |
| `su username` | shell **non-login** : garde l'environnement courant |
| `su -` (sans nom) | passe en **root** ; demande le mot de passe de **root** |

Un utilisateur normal doit donner **le mot de passe du compte cible** ; root,
lui, n'a pas besoin de mot de passe.

## 10. Processus et états Linux

Un processus = **espace d'adressage**, **propriétés de sécurité**
(propriétaire, privilèges), **un ou plusieurs threads**, un **état**. Son
**environnement** : variables locales et globales, contexte d'ordonnancement,
ressources (descripteurs de fichiers, ports réseau).

```diagram
{
  "title": "États des processus sous Linux (lettre affichée par ps).",
  "nodes": [
    { "id": "new", "x": 60, "y": 150, "w": 80, "h": 40, "shape": "ellipse", "label": "new", "tone": "neutral", "filled": true, "size": 12 },
    { "id": "rr", "x": 210, "y": 150, "w": 120, "h": 44, "shape": "ellipse", "label": "R · runnable\n(ready)", "tone": "sky", "filled": true, "size": 11 },
    { "id": "rk", "x": 400, "y": 150, "w": 120, "h": 44, "shape": "ellipse", "label": "R · running\n(kernel)", "tone": "emerald", "filled": true, "size": 11 },
    { "id": "ru", "x": 400, "y": 40, "w": 120, "h": 44, "shape": "ellipse", "label": "R · running\n(user)", "tone": "emerald", "filled": true, "size": 11 },
    { "id": "t", "x": 210, "y": 40, "w": 110, "h": 40, "shape": "ellipse", "label": "T · stopped", "tone": "amber", "filled": true, "size": 11 },
    { "id": "s", "x": 300, "y": 260, "w": 190, "h": 44, "shape": "ellipse", "label": "S / D / K · sleeping", "tone": "violet", "filled": true, "size": 11 },
    { "id": "z", "x": 580, "y": 150, "w": 100, "h": 40, "shape": "ellipse", "label": "Z · zombie", "tone": "rose", "filled": true, "size": 11 },
    { "id": "x", "x": 580, "y": 40, "w": 90, "h": 36, "shape": "ellipse", "label": "X · dead", "tone": "neutral", "size": 11 }
  ],
  "edges": [
    { "from": "new", "to": "rr", "label": "fork" },
    { "from": "rr", "to": "rk", "label": "run" },
    { "from": "rk", "to": "ru", "arrow": "both", "label": "syscall / return" },
    { "from": "rr", "to": "t", "arrow": "both", "label": "suspend / resume" },
    { "from": "rk", "to": "s", "label": "wait" },
    { "from": "s", "to": "rr", "label": "event or signal" },
    { "from": "rk", "to": "z", "label": "exit" },
    { "from": "z", "to": "x", "label": "reap" }
  ]
}
```

| Lettre | Nom noyau | Signification |
|---|---|---|
| **R** | TASK_RUNNING | s'exécute sur un CPU **ou** attend de s'exécuter (*runnable*) |
| **S** | TASK_INTERRUPTIBLE | **sleeping** : attend une condition (matériel, E/S, signal) |
| **D** | TASK_UNINTERRUPTIBLE | sleeping, mais **ne répond pas aux signaux** (souvent une E/S) |
| **K** | TASK_KILLABLE | comme D, mais **peut être tué** |
| **T** | TASK_STOPPED / TRACED | **suspendu** (signal, Ctrl+Z) ou en cours de **débogage** |
| **Z** | EXIT_ZOMBIE | l'enfant a fini, **seul son PID** reste en attendant le parent |
| **X** | EXIT_DEAD | le parent a **récupéré** (*reaped*) l'enfant : il est entièrement libéré |

`ps` affiche : l'**UID**, le **PID**, le temps CPU consommé, la mémoire
allouée, le **terminal de contrôle** (où va stdout), l'**état**. Pour tracer
plus finement : les outils **bcc / BPF**.

---

## À retenir

- **CPU–I/O burst cycle** ; beaucoup de bursts courts, peu de longs.
- Décisions en cas **1** (running → waiting) et **4** (terminate) =
  **nonpreemptive** ; en plus 2 et 3 = **preemptive** (tous les OS modernes).
- **Dispatcher** : context switch + user mode + saut dans le programme ;
  **dispatch latency**.
- Critères : **max** CPU utilization et throughput ; **min** turnaround,
  waiting, response. **Waiting = turnaround − burst.**
- **FCFS** : convoy effect (17 vs 3). **SJF** : optimal (7), mais il faut
  prédire (moyenne exponentielle, α = ½). **SRTF** : SJF préemptif (6,5).
  **RR** : quantum 10–100 ms, attente max (n − 1)·q, q grand → FCFS.
  **Priority** : petit nombre = haute priorité, **starvation → aging** (8,2).
  **MLFQ** : les processus changent de file.
- **PCS** (dans le processus) vs **SCS** (tout le système) ; Linux : SCS
  uniquement.
- SMP : file commune ou privée ; **hyperthreading** ; **push / pull
  migration** ; **soft / hard affinity** ; NUMA-aware.
- **Soft** vs **hard** real-time ; **RMS** = période courte, priorité fixe ;
  **EDF** = deadline proche, priorité dynamique ; SCHED_FIFO vs SCHED_RR.
- Linux **CFS** : nice −20 à +19, plus petit **vruntime** d'abord.
- Évaluation : deterministic, queueing, simulation, implementation. **Little :
  n = λ × W**.
- Lab : groupe primaire = 4e champ de `/etc/passwd` ; groupes dans
  `/etc/group` ; UPG ; `su -` = login shell. États ps : R, S, D, K, T, Z, X.

## Pièges classiques du quiz

| Affirmation | Vrai / Faux |
|---|---|
| Le dispatcher choisit le prochain processus | **Faux** : c'est le scheduler |
| En nonpreemptive, un processus garde le CPU jusqu'à sa fin ou jusqu'à une attente | **Vrai** |
| Le waiting time inclut le temps d'exécution | **Faux** : seulement la ready queue |
| SJF minimise le temps d'attente moyen | **Vrai** |
| SRTF est la version non préemptive de SJF | **Faux** : préemptive |
| Avec un quantum très grand, RR se comporte comme FCFS | **Vrai** |
| Une plus grande valeur de priorité = plus prioritaire | **Faux** : plus petit = plus prioritaire |
| L'aging provoque la starvation | **Faux** : il la résout |
| RMS donne la priorité à la deadline la plus proche | **Faux** : c'est EDF ; RMS = période la plus courte |
| Hard affinity : l'OS essaie sans garantie | **Faux** : ça, c'est soft affinity |
| Little's formula ne vaut que pour FCFS | **Faux** : pour tout algorithme |
| Un utilisateur a plusieurs groupes primaires | **Faux** : exactement un |
