# Operating System — Week 9 · Synchronization Examples & Server Hardening

**Cours** : chapitre 7 du Silberschatz, *Synchronization Examples* : les trois
**problèmes classiques** (**bounded-buffer**, **readers-writers**,
**dining-philosophers**), la synchronisation sous **Linux** et **POSIX**
(mutex, semaphores nommés / non nommés, condition variables), et les
**approches alternatives** (**transactional memory**, **OpenMP**,
**functional programming**).
**Lab** : *Server Hardening for Ubuntu OS* (BIOS, GRUB, root SSH, sudo, TCP
wrappers, firewall, antivirus, logs, logrotate) et le script
`server_hardening.sh`.

> **En bref.** **Bounded buffer** : 3 semaphores, **mutex = 1**, **full = 0**,
> **empty = n** ; le producteur fait `wait(empty)` puis `wait(mutex)`, le
> consommateur `wait(full)` puis `wait(mutex)`. **Readers-writers** :
> plusieurs lecteurs **en même temps**, un seul écrivain ; `rw_mutex = 1`,
> `mutex = 1`, `read_count = 0` ; le **premier** lecteur bloque les
> écrivains, le **dernier** les libère. **Dining philosophers** : 5
> philosophes, 5 baguettes, risque de **deadlock** et de **starvation**.
> POSIX fournit **mutex**, **semaphores** et **condition variables**.

---

# Partie 1 — Cours

## 1. Les problèmes classiques

Ils servent à **tester** les nouveaux schémas de synchronisation.

| Problème | Processus | But | Difficulté |
|---|---|---|---|
| **Bounded-Buffer** (producer-consumer) | producteur, consommateur | coordonner l'accès au buffer | éviter **overflow** et **underflow** |
| **Readers-Writers** | lecteurs, écrivains | **plusieurs lecteurs OU un seul écrivain** | **starvation**, priorités |
| **Dining-Philosophers** | philosophes | partager des ressources limitées (baguettes) | **deadlock** et **starvation** |

## 2. Bounded-Buffer Problem

*n* buffers, chacun contient **un** item. Trois semaphores :

| Semaphore | Initialisé à | Rôle |
|---|---|---|
| **mutex** | **1** | exclusion mutuelle sur le buffer |
| **full** | **0** | nombre de cases **pleines** |
| **empty** | **n** | nombre de cases **vides** |

```c
/* Producer */                    /* Consumer */
while (true) {                    while (true) {
    /* produire un item */            wait(full);
    wait(empty);                      wait(mutex);
    wait(mutex);                      /* retirer un item du buffer */
    /* ajouter au buffer */           signal(mutex);
    signal(mutex);                    signal(empty);
    signal(full);                     /* consommer l'item */
}                                 }
```

```diagram
{
  "title": "Les deux semaphores de comptage se répondent : le producteur consomme une case vide (empty) et crée une case pleine (full), le consommateur fait l'inverse.",
  "nodes": [
    { "id": "p", "x": 90, "y": 80, "w": 150, "h": 110, "label": "Producer\nwait(empty)\nwait(mutex)\n+ item\nsignal(mutex)\nsignal(full)", "tone": "sky", "filled": true, "size": 12 },
    { "id": "b", "x": 330, "y": 80, "w": 190, "h": 60, "label": "buffer (n cases)\nmutex = 1", "tone": "violet", "filled": true },
    { "id": "c", "x": 570, "y": 80, "w": 150, "h": 110, "label": "Consumer\nwait(full)\nwait(mutex)\n− item\nsignal(mutex)\nsignal(empty)", "tone": "amber", "filled": true, "size": 12 },
    { "id": "e", "x": 330, "y": 190, "w": 140, "label": "empty = n", "tone": "emerald", "filled": true },
    { "id": "f", "x": 330, "y": 10, "w": 140, "label": "full = 0", "tone": "rose", "filled": true }
  ],
  "edges": [
    { "from": "p", "to": "b" }, { "from": "b", "to": "c" },
    { "from": "c", "to": "e", "label": "signal", "dashed": true }, { "from": "e", "to": "p", "label": "wait", "dashed": true },
    { "from": "p", "to": "f", "label": "signal", "dashed": true }, { "from": "f", "to": "c", "label": "wait", "dashed": true }
  ]
}
```

| Situation | Ce qui bloque |
|---|---|
| buffer **plein** (empty = 0) | le **producteur** sur `wait(empty)` (pas d'**overflow**) |
| buffer **vide** (full = 0) | le **consommateur** sur `wait(full)` (pas d'**underflow**) |

> **Piège :** l'ordre compte. Si le producteur fait `wait(mutex)` **avant**
> `wait(empty)` et que le buffer est plein, il bloque **en tenant le mutex** :
> le consommateur ne peut plus entrer → **deadlock**.

Exemple d'usage : un **téléchargement** où plusieurs consommateurs lisent un
buffer limité.

## 3. Readers-Writers Problem

Un **data set** partagé par des processus concurrents :

- **Readers** : **lisent seulement** (aucune mise à jour) ;
- **Writers** : lisent **et écrivent**.

Problème : autoriser **plusieurs lecteurs en même temps**, mais **un seul
écrivain** à la fois (et aucun lecteur pendant qu'il écrit).

| Donnée partagée | Initialisée à | Rôle |
|---|---|---|
| **rw_mutex** | **1** | exclusion des écrivains (commun lecteurs / écrivains) |
| **mutex** | **1** | protège **read_count** |
| **read_count** | **0** | nombre de lecteurs **en train de lire** |

```c
/* Writer */                     /* Reader */
wait(rw_mutex);                  wait(mutex);
/* writing */                    read_count++;
signal(rw_mutex);                if (read_count == 1) wait(rw_mutex);   /* 1er lecteur */
                                 signal(mutex);
                                 /* reading */
                                 wait(mutex);
                                 read_count--;
                                 if (read_count == 0) signal(rw_mutex); /* dernier lecteur */
                                 signal(mutex);
```

```diagram
{
  "title": "Le premier lecteur ferme la porte aux écrivains (wait rw_mutex), le dernier la rouvre (signal rw_mutex). Entre les deux, les lecteurs entrent librement.",
  "nodes": [
    { "id": "t", "x": 300, "y": 30, "shape": "table", "size": 12, "label": "Deux lecteurs R1, R2 puis un écrivain W", "rows": [["événement","read_count","rw_mutex","effet"],["R1 entre","1","0","1er lecteur : bloque les écrivains"],["R2 entre","2","0","lit en même temps"],["W arrive","2","0","W bloqué sur wait(rw_mutex)"],["R1 sort","1","0","—"],["R2 sort","0","1","dernier lecteur : signal(rw_mutex)"],["W écrit","0","0","seul dans le data set"]], "mark": [3,5], "cols": [80,80,70,230] }
  ],
  "edges": []
}
```

### Les variations

| Variation | Règle | Risque |
|---|---|---|
| **First reader-writer problem** (la solution ci-dessus) | aucun lecteur n'attend tant qu'un autre lit | un **écrivain peut ne jamais écrire** (starvation des writers) |
| **Second reader-writer problem** | dès qu'un écrivain est **prêt**, **aucun nouveau lecteur** n'entre | les **lecteurs** peuvent attendre longtemps |

Les deux peuvent provoquer de la **starvation** → encore d'autres variantes.
Certains systèmes règlent le problème avec des **reader-writer locks**
fournis par le noyau. Usage typique : les **bases de données** (beaucoup de
lectures, écritures exclusives).

## 4. Dining-Philosophers Problem

5 philosophes autour d'une table, **5 baguettes** (une entre chaque voisin).
Un philosophe **pense** ou **mange** ; pour manger il lui faut **les deux
baguettes** voisines.

```diagram
{
  "title": "5 philosophes, 5 baguettes. Si chacun prend sa baguette gauche en même temps, personne n'obtient la droite : deadlock.",
  "nodes": [
    { "id": "p0", "x": 300, "y": 20, "w": 70, "shape": "ellipse", "label": "P0", "tone": "sky", "filled": true },
    { "id": "p1", "x": 480, "y": 120, "w": 70, "shape": "ellipse", "label": "P1", "tone": "sky", "filled": true },
    { "id": "p2", "x": 410, "y": 290, "w": 70, "shape": "ellipse", "label": "P2", "tone": "sky", "filled": true },
    { "id": "p3", "x": 190, "y": 290, "w": 70, "shape": "ellipse", "label": "P3", "tone": "sky", "filled": true },
    { "id": "p4", "x": 120, "y": 120, "w": 70, "shape": "ellipse", "label": "P4", "tone": "sky", "filled": true },
    { "id": "r", "x": 300, "y": 160, "w": 130, "shape": "cylinder", "label": "riz" },
    { "id": "c0", "x": 405, "y": 60, "shape": "text", "label": "🥢 C0", "size": 12 },
    { "id": "c1", "x": 470, "y": 210, "shape": "text", "label": "🥢 C1", "size": 12 },
    { "id": "c2", "x": 300, "y": 320, "shape": "text", "label": "🥢 C2", "size": 12 },
    { "id": "c3", "x": 130, "y": 210, "shape": "text", "label": "🥢 C3", "size": 12 },
    { "id": "c4", "x": 195, "y": 60, "shape": "text", "label": "🥢 C4", "size": 12 }
  ],
  "edges": []
}
```

Solution du cours :

- trois **états** : **THINKING**, **HUNGRY**, **EATING** ;
- un **mutex** : deux philosophes ne peuvent pas faire **pickup** ou
  **putdown** en même temps ;
- un **tableau de semaphores** : contrôle le comportement de **chaque**
  philosophe ;
- un philosophe ne mange que si **aucun de ses deux voisins ne mange**.

> Les semaphores peuvent quand même mener au **deadlock** à cause d'erreurs
> de programmation. Pour l'éviter : un **ordre** d'acquisition, par exemple
> **toujours prendre la baguette de plus petit numéro d'abord**.

## 5. Synchronisation sous Linux et POSIX

**Linux** : des **atomic variables**, type **`atomic_t`** (entier atomique),
pour des opérations simples **sans lock**.

```c
atomic_t counter;
int value;
atomic_set(&counter, 5);         /* counter = 5 */
atomic_add(10, &counter);        /* counter = counter + 10 */
atomic_sub(4, &counter);         /* counter = counter - 4 */
atomic_inc(&counter);            /* counter = counter + 1 */
value = atomic_read(&counter);   /* value = 12 */
```

**POSIX** (UNIX, Linux, macOS) fournit **mutex locks**, **semaphores** et
**condition variables**.

```c
#include <pthread.h>
pthread_mutex_t mutex;
pthread_mutex_init(&mutex, NULL);   /* créer et initialiser */
pthread_mutex_lock(&mutex);         /* acquérir */
/* critical section */
pthread_mutex_unlock(&mutex);       /* libérer */
```

| Semaphores POSIX | Partage |
|---|---|
| **Named** (`sem_open("SEM", O_CREAT, 0666, 1)`) | utilisables par des processus **sans lien** : un autre processus y accède par son **nom** |
| **Unnamed** (`sem_init(&sem, 0, 1)`) | **non** partageables entre processus sans lien (au sein d'un processus) |

Dans les deux cas : `sem_wait(sem)` pour acquérir, `sem_post(sem)` pour
libérer.

**Condition variables POSIX** : C/C++ n'ont **pas de monitor**, donc une
condition variable est **associée à un mutex POSIX** :

```c
pthread_mutex_lock(&mutex);
while (a != b)
    pthread_cond_wait(&cond_var, &mutex);   /* libère le mutex en attendant */
pthread_mutex_unlock(&mutex);

/* autre thread */
pthread_mutex_lock(&mutex);
a = b;
pthread_cond_signal(&cond_var);
pthread_mutex_unlock(&mutex);
```

## 6. Approches alternatives

| Approche | Idée | Exemple |
|---|---|---|
| **Transactional memory** | une **memory transaction** est une suite de lectures / écritures exécutées **atomiquement** ; plus besoin de locks | `atomic { count += value; }` |
| **OpenMP** | directives de compilation ; le bloc `#pragma omp critical` est une **critical section** exécutée atomiquement | voir ci-dessous |
| **Functional programming** | les variables sont **immuables** (pas d'état) → pas de data race | **Erlang**, **Scala** |

```c
void update(int value) {
    #pragma omp critical
    {
        count += value;
    }
}
```

## 7. Termes clés (lab session)

| Terme | Définition |
|---|---|
| **Critical section** | segment de code qui accède aux ressources partagées |
| **Race condition** | accès simultanés sans synchronisation → résultat imprévisible |
| **Mutex** | mécanisme de **verrou** : un seul processus en critical section |
| **Semaphore** | mécanisme de **signalisation** selon la disponibilité des ressources |
| **Deadlock** | processus qui attendent indéfiniment des ressources tenues par les autres |
| **Starvation** | un processus est **toujours** privé de ressource au profit des autres |
| **Atomic operation** | opération **indivisible**, non interruptible |

---

# Partie 2 — Lab : Server Hardening for Ubuntu

**Server hardening** = réduire la **surface d'attaque** d'un serveur.

| Mesure | Objectif | Commande / fichier |
|---|---|---|
| **BIOS password** | empêcher de modifier les réglages BIOS | au démarrage : F2 / F10 / DEL → onglet **Security** (pas de code) |
| **GRUB password** | empêcher de modifier le **bootloader** | `grub-mkpasswd-pbkdf2` (hash) ; dans **`/etc/grub.d/40_custom`** : `set superusers="root"` et `password_pbkdf2 root <hash>` ; puis `sudo update-grub` |
| **Deny root access** | interdire la connexion **SSH en root** | **`/etc/ssh/sshd_config`** : **`PermitRootLogin no`** ; `sudo systemctl restart sshd` |
| **Sudo users** | des comptes admin **aux droits limités** | `sudo adduser <user>` ; `sudo usermod -aG sudo <user>` ; `sudo visudo` : `<user> ALL=(ALL:ALL) /usr/bin/apt-get` |
| **TCP wrappers** | n'autoriser que des **hôtes de confiance** | **`/etc/hosts.allow`** : `sshd : 192.168.1.` ; **`/etc/hosts.deny`** : `sshd : ALL` |
| **Firewalld / iptables** | filtrer le **trafic entrant** | `sudo apt install firewalld` ; `systemctl start/enable firewalld` ; `firewall-cmd --zone=public --add-port=22/tcp --permanent` ; `--add-source=192.168.1.0/24` ; `--reload` |
| **Antivirus** | une couche de sécurité en plus | `sudo apt install clamav clamav-daemon` ; **`sudo freshclam`** (mettre à jour les définitions) ; scan : `clamscan -r /home` |
| **Auditer les logs** | repérer les activités suspectes | `sudo less /var/log/auth.log` (authentification), `/var/log/syslog` (système) |
| **Rotation des logs** | garder les logs un temps limité (ex. 7) pour économiser le disque | **`/etc/logrotate.conf`** : **`rotate 7`** |

```diagram
{
  "title": "Les couches du durcissement, du démarrage au réseau.",
  "nodes": [
    { "id": "a", "x": 80, "y": 40, "w": 130, "h": 54, "label": "BIOS\nmot de passe", "tone": "neutral", "filled": true, "size": 12 },
    { "id": "b", "x": 230, "y": 40, "w": 130, "h": 54, "label": "GRUB\nsuperuser + hash", "tone": "violet", "filled": true, "size": 12 },
    { "id": "c", "x": 380, "y": 40, "w": 130, "h": 54, "label": "Comptes\nno root SSH, sudo", "tone": "sky", "filled": true, "size": 12 },
    { "id": "d", "x": 530, "y": 40, "w": 130, "h": 54, "label": "Réseau\nTCP wrappers,\nfirewalld", "tone": "amber", "filled": true, "size": 12 },
    { "id": "e", "x": 305, "y": 140, "w": 200, "h": 54, "label": "Surveillance\nClamAV, logs, logrotate, cron", "tone": "emerald", "filled": true, "size": 12 }
  ],
  "edges": [ { "from": "a", "to": "b" }, { "from": "b", "to": "c" }, { "from": "c", "to": "d" } ]
}
```

### Ce que fait aussi `server_hardening.sh`

- écrit une configuration **logrotate** dans `/etc/logrotate.d/custom` pour
  `/var/log/*.log` : **`weekly`**, **`rotate 7`**, **`compress`**,
  `delaycompress`, `missingok`, `notifempty`, `create 0640 root adm` ;
- **bloque les requêtes ICMP** (ping) :
  `firewall-cmd --add-rich-rule='rule protocol value="icmp" drop' --permanent` ;
- planifie un **scan antivirus quotidien** dans `/etc/crontab` :
  **`0 3 * * * root clamscan -r /home`** (tous les jours à **3 h**) ;
- puis **annule tout** (script pédagogique) : `apt remove --purge`,
  `PermitRootLogin yes`, `deluser --remove-home`, suppression des lignes
  avec `sed -i '/…/d'`, `systemctl stop/disable firewalld`.

> **Piège :** **`hosts.allow`** est lu **avant** **`hosts.deny`** : `sshd :
> 192.168.1.` dans allow + `sshd : ALL` dans deny = **seul le réseau
> 192.168.1.x** peut se connecter en SSH.

---

## Pièges d'exam

- Bounded buffer : **mutex = 1, full = 0, empty = n** ; producteur
  **wait(empty)** puis **wait(mutex)** ; consommateur **wait(full)** puis
  **wait(mutex)** ; inverser l'ordre peut donner un **deadlock**.
- Readers-writers : **plusieurs lecteurs ou un seul écrivain** ;
  `rw_mutex = 1`, `mutex = 1`, `read_count = 0` ; **1er** lecteur
  `wait(rw_mutex)`, **dernier** `signal(rw_mutex)`.
- First R-W : les **écrivains** peuvent souffrir de starvation ; second R-W :
  pas de nouveau lecteur quand un écrivain est prêt.
- Dining philosophers : **THINKING / HUNGRY / EATING**, mutex + tableau de
  semaphores ; risque de **deadlock**.
- Linux : **`atomic_t`** ; POSIX : `pthread_mutex_lock/unlock`, semaphores
  **named** (processus sans lien) vs **unnamed**, condition variable **+ mutex**.
- `#pragma omp critical` = critical section ; **functional languages** =
  variables immuables.
- `PermitRootLogin no` dans **sshd_config** ; **`freshclam`** met à jour
  ClamAV ; **`rotate 7`** dans logrotate ; `grub-mkpasswd-pbkdf2`.

## À retenir

- Trois problèmes classiques, trois risques : overflow / underflow,
  starvation, deadlock.
- POSIX : mutex, semaphores, condition variables ; Linux : atomic variables.
- Alternatives : transactional memory, OpenMP, functional programming.
- Hardening : BIOS, GRUB, root SSH, sudo limité, TCP wrappers, firewall,
  antivirus, audit et rotation des logs.
