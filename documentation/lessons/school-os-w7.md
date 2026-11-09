# Operating System — Week 7 · Synchronization Tools

**Cours** : chapitre 6 du Silberschatz, *Synchronization Tools* : la **race
condition**, le **critical-section problem** et ses **3 exigences**, la
solution **par interruptions**, les solutions **logicielles** (le `turn`
simple, **Peterson**), la **memory barrier**, le support **matériel**
(**test_and_set**, **compare_and_swap**, **atomic variables**), les **mutex
locks**, les **semaphores**, les **monitors** et **condition variables**, et
la **liveness** (**deadlock**, **starvation**, **priority inversion**).
**Lab** : la *lab session* (synthèse du cours et tableau comparatif) ; le
*Week 7 Lab* (Oracle Cloud, PuTTY, WinSCP, `date`, redirections, users,
processus, systemd) est déjà couvert dans la partie Lab de **Week 5**.

> **En bref.** Quand plusieurs processus modifient une **donnée partagée**
> en même temps, le résultat dépend de l'ordre d'exécution : c'est une **race
> condition**. On protège le code qui touche cette donnée (la **critical
> section**) avec un protocole qui garantit **mutual exclusion**,
> **progress** et **bounded waiting**. Outils, du plus bas au plus haut
> niveau : **Peterson** (logiciel, 2 processus), **test_and_set /
> compare_and_swap** (matériel, atomiques), **mutex** (acquire / release,
> spinlock), **semaphore** (entier, `wait()` / `signal()`), **monitor** (un
> seul processus actif à la fois). Mal utilisés, ils provoquent **deadlock**
> et **starvation**.

---

## 1. Race condition

Deux processus P0 et P1 font `fork()` en même temps. Le noyau leur attribue
un PID en lisant puis en incrémentant la variable **`next_available_pid`**.
Sans protection, les deux peuvent lire **la même valeur** :

```diagram
{
  "title": "Race condition sur next_available_pid : les deux enfants reçoivent le PID 2615.",
  "nodes": [
    { "id": "p0", "x": 120, "y": 30, "w": 170, "label": "P0 : fork()", "tone": "sky", "filled": true },
    { "id": "p1", "x": 470, "y": 30, "w": 170, "label": "P1 : fork()", "tone": "amber", "filled": true },
    { "id": "v", "x": 295, "y": 120, "w": 230, "label": "next_available_pid = 2615", "tone": "violet", "filled": true, "bold": true },
    { "id": "c0", "x": 120, "y": 210, "w": 170, "label": "child pid = 2615", "tone": "rose", "filled": true },
    { "id": "c1", "x": 470, "y": 210, "w": 170, "label": "child pid = 2615", "tone": "rose", "filled": true }
  ],
  "edges": [
    { "from": "p0", "to": "v", "label": "lit" }, { "from": "p1", "to": "v", "label": "lit" },
    { "from": "v", "to": "c0" }, { "from": "v", "to": "c1" }
  ]
}
```

> **Définition :** une **race condition** se produit quand plusieurs
> processus accèdent **simultanément** à des données partagées et que le
> **résultat dépend de l'ordre** dans lequel ils s'exécutent.

## 2. Le critical-section problem

*n* processus {P0, …, Pn−1} ; chacun a une **critical section** (il y
modifie des variables communes, met à jour une table, écrit un fichier…).
Quand un processus est dans sa critical section, **aucun autre** ne doit être
dans la sienne.

```diagram
{
  "title": "Structure générale du processus Pi : on demande la permission (entry), on travaille (CS), on libère (exit), puis le reste.",
  "nodes": [
    { "id": "w", "x": 250, "y": 30, "w": 220, "label": "while (true) {", "tone": "neutral", "size": 12 },
    { "id": "en", "x": 250, "y": 90, "w": 220, "label": "entry section", "tone": "amber", "filled": true, "bold": true },
    { "id": "cs", "x": 250, "y": 150, "w": 220, "label": "critical section", "tone": "rose", "filled": true, "bold": true },
    { "id": "ex", "x": 250, "y": 210, "w": 220, "label": "exit section", "tone": "amber", "filled": true, "bold": true },
    { "id": "rs", "x": 250, "y": 270, "w": 220, "label": "remainder section", "tone": "neutral", "filled": true },
    { "id": "e", "x": 250, "y": 330, "w": 220, "label": "}", "tone": "neutral", "size": 12 }
  ],
  "edges": [
    { "from": "en", "to": "cs" }, { "from": "cs", "to": "ex" }, { "from": "ex", "to": "rs" },
    { "from": "rs", "to": "en", "via": [[420, 270], [420, 90]], "dashed": true }
  ]
}
```

### Les 3 exigences d'une solution

| Exigence | Sens |
|---|---|
| **Mutual exclusion** | si Pi est dans sa critical section, **aucun autre** processus n'est dans la sienne |
| **Progress** | si **personne** n'est en critical section et que certains veulent y entrer, le choix du suivant **ne peut pas être reporté indéfiniment** |
| **Bounded waiting** | il existe une **borne** sur le nombre de fois où les autres entrent avant qu'une demande soit satisfaite (pas de **starvation**) |

Hypothèses : chaque processus s'exécute à une **vitesse non nulle** ; **aucune
hypothèse** sur les vitesses relatives.

### Solution par interruptions

**Entry** : désactiver les interruptions ; **exit** : les réactiver.
Problèmes : une critical section qui dure **une heure** ; des processus
peuvent **ne jamais entrer** (starvation) ; et avec **deux CPU**, désactiver
les interruptions d'un CPU **n'empêche pas l'autre** d'entrer.

## 3. Solutions logicielles

On suppose que **load** et **store** sont **atomiques** (non
interruptibles).

### Software Solution 1 : une variable `turn`

```c
while (true) {
    while (turn == j)
        ;                    /* attendre son tour */
    /* critical section */
    turn = j;                /* donner le tour à l'autre */
    /* remainder section */
}
```

- **Mutual exclusion : oui** (Pi n'entre que si `turn == i`, et `turn` ne vaut
  pas 0 et 1 à la fois).
- **Progress : non**. Les processus doivent **strictement alterner** : si Pj
  ne veut plus entrer, Pi reste bloqué après son passage.

### Peterson's solution

Deux variables partagées : **`int turn`** (à qui le tour) et **`boolean
flag[2]`** (`flag[i] = true` : Pi est **prêt** à entrer).

```c
while (true) {
    flag[i] = true;          /* je veux entrer        */
    turn = j;                /* mais je laisse la main */
    while (flag[j] && turn == j)
        ;                    /* attendre si l'autre veut ET que c'est son tour */
    /* critical section */
    flag[i] = false;         /* je sors */
    /* remainder section */
}
```

```diagram
{
  "title": "Peterson : P0 et P1 veulent entrer en même temps. Le DERNIER à écrire turn se met en attente.",
  "nodes": [
    { "id": "t", "x": 320, "y": 30, "shape": "table", "size": 12, "label": "Déroulé", "rows": [["étape","P0","P1","flag[0]","flag[1]","turn"],["1","flag[0] = true","","true","false","—"],["2","","flag[1] = true","true","true","—"],["3","turn = 1","","true","true","1"],["4","","turn = 0","true","true","0"],["5","test : turn≠1 → ENTRE","test : flag[0] ∧ turn==0 → ATTEND","true","true","0"],["6","sort : flag[0] = false","condition fausse → ENTRE","false","true","0"]], "mark": [5], "cols": [45,190,190,55,55,40] }
  ],
  "edges": []
}
```

Peterson satisfait les **trois** exigences : Pi entre seulement si
**`flag[j] == false`** ou **`turn == i`**.

> **Mais :** Peterson **n'est pas garanti sur les architectures modernes** :
> pour gagner en performance, le **processeur ou le compilateur réordonnent**
> des instructions sans dépendance. Si `flag[i] = true` et `turn = j` sont
> inversés, **les deux processus peuvent être en critical section en même
> temps**. Peterson reste utile pour **comprendre** les race conditions.

### L'exemple du réordonnancement

```c
boolean flag = false;  int x = 0;

/* Thread 1 */                 /* Thread 2 */
while (!flag)                  x = 100;
    ;                          flag = true;
print x;
```

Sortie attendue : **100**. Mais `x` et `flag` sont **indépendants** : Thread 2
peut exécuter `flag = true` **avant** `x = 100` → Thread 1 affiche **0**.

## 4. Memory barrier

| Memory model | Sens |
|---|---|
| **Strongly ordered** | une modification mémoire d'un processeur est **immédiatement visible** par tous les autres |
| **Weakly ordered** | une modification **peut ne pas être immédiatement visible** |

Une **memory barrier** est une instruction qui **force** la propagation de
toute modification mémoire : tous les **loads et stores** précédents sont
**terminés** avant les suivants.

```c
/* Thread 1 */                 /* Thread 2 */
while (!flag)                  x = 100;
    memory_barrier();          memory_barrier();
print x;                       flag = true;
```

Thread 2 : l'affectation de `x` a lieu **avant** celle de `flag`. Thread 1 :
`flag` est chargé **avant** `x`. → la sortie est **100**.

## 5. Support matériel

Sur un **uniprocesseur**, on pourrait désactiver les interruptions (le code
s'exécute sans préemption), mais c'est **trop inefficace sur multiprocesseur**
et **pas scalable**. Trois formes de support : les **hardware instructions**,
les **atomic variables** (et les memory barriers).

### test_and_set

```c
boolean test_and_set(boolean *target) {
    boolean rv = *target;    /* ancienne valeur */
    *target = true;          /* toujours mise à true */
    return rv;
}
```

Exécutée **atomiquement** ; renvoie la **valeur d'origine** et met la variable
à **true**.

```c
/* lock partagé, initialisé à false */
do {
    while (test_and_set(&lock))
        ;                    /* lock était true : quelqu'un est dedans */
    /* critical section */
    lock = false;
    /* remainder section */
} while (true);
```

Le premier qui appelle `test_and_set` reçoit **false** (il entre) et laisse
**true** : les suivants bouclent.

### compare_and_swap (CAS)

```c
int compare_and_swap(int *value, int expected, int new_value) {
    int temp = *value;
    if (*value == expected)
        *value = new_value;  /* swap SEULEMENT si *value == expected */
    return temp;             /* renvoie toujours l'ancienne valeur */
}
```

```c
/* lock partagé, initialisé à 0 */
while (true) {
    while (compare_and_swap(&lock, 0, 1) != 0)
        ;                    /* ne réussit que si lock valait 0 */
    /* critical section */
    lock = 0;
    /* remainder section */
}
```

| | test_and_set | compare_and_swap |
|---|---|---|
| Atomique | oui | oui |
| Renvoie | l'**ancienne** valeur | l'**ancienne** valeur |
| Écrit | **toujours true** | **new_value seulement si *value == expected** |
| Exigences | mutual exclusion **oui**, bounded waiting **non** | idem (la version avec `waiting[]` ajoute le **bounded waiting**) |

**Bounded waiting avec CAS** : un tableau **`waiting[n]`** ; à la sortie, Pi
cherche le **prochain processus en attente** dans l'ordre circulaire
`(i + 1) % n` et lui passe la main (`waiting[j] = false`) ; s'il n'y en a
aucun, il libère le lock. Chaque processus attend donc **au plus n − 1
tours**.

### Atomic variables

Une **atomic variable** offre des mises à jour **atomiques** sur des types de
base (entiers, booléens), construites sur CAS :

```c
void increment(atomic_int *v) {
    int temp;
    do {
        temp = *v;
    } while (temp != compare_and_swap(v, temp, temp + 1));
}
```

`increment(&sequence);` incrémente **sans interruption**.

## 6. Mutex locks

Les solutions précédentes sont **compliquées** et peu accessibles aux
programmeurs d'applications. L'outil le plus simple : le **mutex lock**, un
**booléen** qui dit si le lock est disponible.

```c
while (true) {
    acquire();               /* prendre le lock */
    /* critical section */
    release();               /* le rendre */
    /* remainder section */
}
```

- `acquire()` et `release()` doivent être **atomiques** (implémentés avec
  CAS, par exemple).
- Cette solution demande du **busy waiting** : le processus **boucle** en
  attendant → on l'appelle **spinlock**.

## 7. Semaphores

Un **semaphore S** est une **variable entière** accessible **uniquement** par
deux opérations **atomiques** : **`wait()`** et **`signal()`** (à l'origine
**P()** et **V()**).

```c
wait(S) {                    signal(S) {
    while (S <= 0)               S++;
        ;   /* busy wait */  }
    S--;
}
```

| Type | Valeurs | Remarque |
|---|---|---|
| **Counting semaphore** | domaine **non borné** | compte des ressources |
| **Binary semaphore** | **0 ou 1** | **comme un mutex lock** |

### Deux usages

```c
/* 1. Critical section : mutex initialisé à 1 */
wait(mutex);
    /* CS */
signal(mutex);

/* 2. Ordonner : S1 (dans P1) doit s'exécuter AVANT S2 (dans P2) ; synch = 0 */
P1:  S1;  signal(synch);
P2:  wait(synch);  S2;
```

```diagram
{
  "title": "synch = 0 : P2 bloque sur wait(synch) tant que P1 n'a pas fait signal(synch) après S1.",
  "nodes": [
    { "id": "a", "x": 120, "y": 40, "w": 120, "label": "P1 : S1", "tone": "sky", "filled": true },
    { "id": "b", "x": 120, "y": 120, "w": 160, "label": "signal(synch) → 1", "tone": "emerald", "filled": true },
    { "id": "c", "x": 420, "y": 40, "w": 200, "label": "P2 : wait(synch) → bloqué", "tone": "rose", "filled": true },
    { "id": "d", "x": 420, "y": 120, "w": 160, "label": "débloqué → 0", "tone": "amber", "filled": true },
    { "id": "e", "x": 420, "y": 200, "w": 120, "label": "P2 : S2", "tone": "sky", "filled": true }
  ],
  "edges": [
    { "from": "a", "to": "b" }, { "from": "b", "to": "d", "label": "réveille" }, { "from": "c", "to": "d" }, { "from": "d", "to": "e" }
  ]
}
```

### Implémentation sans busy waiting

L'implémentation doit garantir que deux processus n'exécutent pas `wait()`
et `signal()` sur le même semaphore en même temps : c'est **elle-même un
critical-section problem** (busy waiting court, acceptable si la CS est
rarement occupée, mauvais si les applications y passent longtemps). Mieux :
une **file d'attente** par semaphore et deux opérations, **block** (mettre
le processus dans la file) et **wakeup** (le passer dans la ready queue).

```c
typedef struct {
    int value;
    struct process *list;    /* file d'attente */
} semaphore;

wait(semaphore *S) {               signal(semaphore *S) {
    S->value--;                        S->value++;
    if (S->value < 0) {                if (S->value <= 0) {
        add this process to S->list;       remove a process P from S->list;
        block();                           wakeup(P);
    }                                  }
}                                  }
```

> **Astuce :** avec cette version, une **valeur négative** −k signifie que
> **k processus attendent** dans la file.

### Mauvais usages

- `signal(mutex) … wait(mutex)` : ordre **inversé** → plusieurs processus en
  CS ;
- `wait(mutex) … wait(mutex)` : **blocage** (deadlock) ;
- **oublier** `wait()` ou `signal()`.

## 8. Monitors

Un **monitor** est une **abstraction de haut niveau** (un type abstrait) :
ses variables internes ne sont accessibles **que par ses procédures**, et
**un seul processus peut être actif dans le monitor à la fois**.

```
monitor monitor-name {
    // shared variable declarations
    procedure P1 (…) { … }
    procedure P2 (…) { … }
    procedure Pn (…) { … }
    initialization code (…) { … }
}
```

**Implémentation avec semaphores** : `semaphore mutex = 1;` chaque procédure
devient `wait(mutex); … body … signal(mutex);` (version complète : un
semaphore `next = 0` et un compteur `next_count` pour les processus qui
attendent **à l'intérieur**).

### Condition variables

`condition x, y;` avec deux opérations :

| Opération | Effet |
|---|---|
| **`x.wait()`** | le processus est **suspendu** jusqu'à un `x.signal()` |
| **`x.signal()`** | **reprend un** processus qui a fait `x.wait()` ; s'il n'y en a **aucun**, **aucun effet** |

> **Piège :** contrairement à `signal()` d'un semaphore (qui incrémente
> toujours), **`x.signal()` sans processus en attente est perdu**.

Exemple « S1 avant S2 » avec un monitor : `F1 : S1; done = true; x.signal();`
et `F2 : if (done == false) x.wait(); S2;`.

**Conditional wait** `x.wait(c)` : *c* = **priority number** ; le processus
au **plus petit nombre** (plus haute priorité) est repris en premier.

```c
monitor ResourceAllocator {
    boolean busy;
    condition x;
    void acquire(int time) {
        if (busy)
            x.wait(time);    /* la plus petite durée passe d'abord */
        busy = true;
    }
    void release() {
        busy = false;
        x.signal();
    }
    initialization code() { busy = false; }
}
```

Usage : `R.acquire(t); … accès à la ressource … R.release();` (le processus
qui prévoit **le temps le plus court** obtient la ressource d'abord). Mauvais
usages : `release()` avant `acquire()`, deux `acquire()`, oublier l'un des
deux.

## 9. Liveness

La **liveness** est l'ensemble des propriétés qui garantissent que les
processus **progressent**. Attendre **indéfiniment** viole **progress** et
**bounded waiting** : c'est une **liveness failure**.

```diagram
{
  "title": "Deadlock avec S = Q = 1 : P0 a S et attend Q ; P1 a Q et attend S. Aucun signal() ne viendra.",
  "nodes": [
    { "id": "p0", "x": 100, "y": 60, "w": 130, "h": 70, "label": "P0\nwait(S) ✓\nwait(Q) …", "tone": "sky", "filled": true, "size": 12 },
    { "id": "p1", "x": 500, "y": 60, "w": 130, "h": 70, "label": "P1\nwait(Q) ✓\nwait(S) …", "tone": "amber", "filled": true, "size": 12 },
    { "id": "s", "x": 300, "y": 20, "w": 80, "shape": "ellipse", "label": "S", "tone": "violet", "filled": true },
    { "id": "q", "x": 300, "y": 110, "w": 80, "shape": "ellipse", "label": "Q", "tone": "violet", "filled": true }
  ],
  "edges": [
    { "from": "s", "to": "p0", "label": "tenu par" }, { "from": "p0", "to": "q", "label": "attend", "dashed": true, "tone": "rose" },
    { "from": "q", "to": "p1", "label": "tenu par" }, { "from": "p1", "to": "s", "label": "attend", "dashed": true, "tone": "rose" }
  ]
}
```

| Problème | Définition |
|---|---|
| **Deadlock** | deux processus ou plus attendent **indéfiniment** un événement que **seul l'un d'eux** peut provoquer |
| **Starvation** | **blocage indéfini** : un processus n'est **jamais retiré** de la file du semaphore |
| **Priority inversion** | un processus de **faible priorité** tient un lock dont a besoin un processus de **haute priorité** ; résolu par le **priority-inheritance protocol** |

## 10. Comparaison des méthodes (lab session)

| Méthode | Type | Avantages | Inconvénients | Usage |
|---|---|---|---|---|
| **Peterson** | logiciel | simple, assure la mutual exclusion | **échoue sur les architectures modernes** | pédagogique |
| **Test-and-Set** | matériel | rapide, atomique | **busy waiting** | spinlocks |
| **Compare-and-Swap** | matériel | atomique, évite le busy waiting (lock-free) | complexe à implémenter | algorithmes **lock-free** |
| **Mutex locks** | logiciel | simple à utiliser | limité à la mutual exclusion | critical section générale |
| **Semaphores** | logiciel | synchronisation complexe | un mauvais usage crée des problèmes | coordination de processus |
| **Monitors** | logiciel | abstraction de haut niveau | disponibles seulement dans certains langages | synchronisation structurée |

> Le tableau de la lab session dit « mutex : no busy waiting », alors que les
> slides appellent le mutex à attente active un **spinlock**. Pour le quiz,
> retiens les slides : **un mutex implémenté par busy waiting = spinlock**.

---

## Pièges d'exam

- **Race condition** = résultat qui dépend de l'**ordre** d'exécution.
- Les 3 exigences : **mutual exclusion, progress, bounded waiting**.
- Le `turn` simple : mutual exclusion **oui**, progress **non** (alternance
  stricte).
- Peterson = **2 processus**, `turn` + `flag[2]` ; correct en théorie,
  **pas** sur architecture moderne sans **memory barrier**.
- test_and_set **met toujours true** ; CAS n'écrit que si `*value ==
  expected` ; les deux **renvoient l'ancienne valeur**.
- Mutex à busy waiting = **spinlock**. Binary semaphore ≈ **mutex**.
- `wait()` = **P()** (décrémente / bloque), `signal()` = **V()**
  (incrémente / réveille).
- Valeur de semaphore **négative** = nombre de processus en attente.
- `x.signal()` sans attente : **aucun effet** (≠ semaphore).
- Monitor : **un seul processus actif** à la fois.
- Priority inversion → **priority inheritance**.

## À retenir

- Entry section → critical section → exit section → remainder section.
- Désactiver les interruptions : ne marche pas avec plusieurs CPU.
- Outils : Peterson → memory barrier → test_and_set / CAS → atomic variables
  → mutex → semaphore → monitor + condition variables.
- Semaphore pour la CS : `mutex = 1` ; pour ordonner S1 avant S2 : `synch =
  0`.
- Liveness : deadlock, starvation, priority inversion.
