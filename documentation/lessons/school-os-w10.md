# Operating System — Week 10 · Deadlocks, Logs & Archives

**Cours** : chapitre 8 du Silberschatz, *Deadlocks* : le **system model**, les
**4 conditions** du deadlock, le **resource-allocation graph**, les méthodes
de traitement (**prevention**, **avoidance**, **detection**, **recovery**),
le **safe state**, le **Banker's algorithm** (safety et resource-request),
le **wait-for graph** et l'algorithme de **détection**.
**Lab** : *Analyzing and storing logs* (rsyslog, journald, `/var/log`) et
*Archiving and copying files* (`tar`), avec les scripts `syslog_lab.sh` et
`tar_lab.sh`.

> **En bref.** Un **deadlock** exige **4 conditions à la fois** : **mutual
> exclusion**, **hold and wait**, **no preemption**, **circular wait**. Dans un
> resource-allocation graph : **pas de cycle → pas de deadlock** ; un cycle
> avec **une instance par ressource → deadlock** ; avec **plusieurs instances
> → deadlock possible**. **Prevention** = casser une des 4 conditions ;
> **avoidance** = ne jamais entrer dans un état **unsafe** (Banker's,
> **Need = Max − Allocation**) ; **detection** = laisser arriver puis
> chercher un cycle (wait-for graph) ; **recovery** = tuer des processus ou
> préempter des ressources.

---

# Partie 1 — Cours

## 1. System model

- Le système a des **types de ressources** R1, R2, …, Rm (cycles CPU, espace
  mémoire, périphériques d'E/S).
- Chaque type Ri a **Wi instances**.
- Chaque processus utilise une ressource dans l'ordre : **request → use →
  release**.

**Deadlock avec des semaphores** (S1 = S2 = 1) :

```c
/* T1 */            /* T2 */
wait(s1);           wait(s2);
wait(s2);           wait(s1);
```

T1 tient s1 et attend s2, T2 tient s2 et attend s1 → **deadlock**.

## 2. Les 4 conditions (simultanées)

| Condition | Sens | Exemple (imprimante / scanner) |
|---|---|---|
| **Mutual exclusion** | un seul thread à la fois utilise la ressource | une seule personne imprime à la fois |
| **Hold and wait** | un thread qui **tient** au moins une ressource **attend** d'en obtenir d'autres | PA tient l'imprimante et attend le scanner |
| **No preemption** | une ressource n'est libérée que **volontairement**, par le thread qui la tient, **après sa tâche** | on ne peut pas retirer l'imprimante à PA |
| **Circular wait** | T0 attend T1, T1 attend T2, …, Tn attend **T0** | PA attend PB, PB attend PA |

> **Piège :** il faut les **quatre en même temps**. Si une seule manque, pas
> de deadlock : c'est l'idée de la **prevention**.

## 3. Resource-allocation graph

Sommets : les **threads** T = {T1, …, Tn} (cercles) et les **types de
ressources** R = {R1, …, Rm} (rectangles, avec un point par **instance**).

| Arc | Sens | Signification |
|---|---|---|
| **Request edge** | **Ti → Rj** | Ti **demande** une instance de Rj |
| **Assignment edge** | **Rj → Ti** | une instance de Rj est **allouée** à Ti |

```diagram
{
  "title": "L'exemple du cours : R1 (1 instance), R2 (2), R3 (1), R4 (3). T1 tient R2, attend R1 ; T2 tient R1 et R2, attend R3 ; T3 tient R3. Pas de cycle → pas de deadlock.",
  "nodes": [
    { "id": "r1", "x": 160, "y": 40, "w": 90, "label": "R1 •", "tone": "violet", "filled": true },
    { "id": "r3", "x": 480, "y": 40, "w": 90, "label": "R3 •", "tone": "violet", "filled": true },
    { "id": "t1", "x": 80, "y": 160, "w": 70, "shape": "ellipse", "label": "T1", "tone": "sky", "filled": true },
    { "id": "t2", "x": 320, "y": 160, "w": 70, "shape": "ellipse", "label": "T2", "tone": "sky", "filled": true },
    { "id": "t3", "x": 560, "y": 160, "w": 70, "shape": "ellipse", "label": "T3", "tone": "sky", "filled": true },
    { "id": "r2", "x": 160, "y": 280, "w": 90, "label": "R2 • •", "tone": "violet", "filled": true },
    { "id": "r4", "x": 480, "y": 280, "w": 110, "label": "R4 • • •", "tone": "violet", "filled": true }
  ],
  "edges": [
    { "from": "t1", "to": "r1", "label": "request", "dashed": true },
    { "from": "r1", "to": "t2", "label": "assigned" },
    { "from": "r2", "to": "t1", "label": "assigned" },
    { "from": "r2", "to": "t2", "label": "assigned" },
    { "from": "t2", "to": "r3", "label": "request", "dashed": true },
    { "from": "r3", "to": "t3", "label": "assigned" }
  ]
}
```

Si T3 demande en plus une instance de R2 (déjà toutes prises) : cycles
T1 → R1 → T2 → R3 → T3 → R2 → T1 → **deadlock**.

| Le graphe… | Conclusion |
|---|---|
| **n'a pas de cycle** | **pas de deadlock** |
| a un cycle, **une instance** par type de ressource | **deadlock** |
| a un cycle, **plusieurs instances** par type | **possibilité** de deadlock (cycle sans deadlock possible) |

## 4. Les méthodes de traitement

```diagram
{
  "title": "Trois stratégies (plus la quatrième : ignorer le problème, comme le font la plupart des OS).",
  "nodes": [
    { "id": "a", "x": 110, "y": 50, "w": 180, "h": 70, "label": "Prevention\ncasser une des\n4 conditions", "tone": "emerald", "filled": true, "size": 12 },
    { "id": "b", "x": 330, "y": 50, "w": 180, "h": 70, "label": "Avoidance\nne jamais entrer en\nétat unsafe (Banker's)", "tone": "sky", "filled": true, "size": 12 },
    { "id": "c", "x": 550, "y": 50, "w": 180, "h": 70, "label": "Detection + recovery\nlaisser arriver,\ndétecter, réparer", "tone": "amber", "filled": true, "size": 12 },
    { "id": "d", "x": 330, "y": 150, "w": 560, "h": 40, "label": "Ignorer le problème : faire comme si les deadlocks n'arrivaient jamais", "tone": "neutral", "filled": true, "size": 12 }
  ],
  "edges": []
}
```

- **Garantir** que le système n'entre **jamais** en deadlock : **prevention**
  ou **avoidance**.
- **Permettre** le deadlock puis **récupérer** : **detection + recovery**.
- **Ignorer** le problème.

## 5. Deadlock prevention

On **invalide une** des quatre conditions :

| Condition cassée | Comment | Prix |
|---|---|---|
| **Mutual exclusion** | inutile pour les ressources **partageables** (fichiers en **lecture seule**) ; **obligatoire** pour les non partageables | ne s'applique pas à tout |
| **Hold and wait** | un thread qui demande une ressource **n'en tient aucune** : tout demander **avant de commencer**, ou ne demander que quand on n'a rien | **faible utilisation** des ressources, **starvation** possible |
| **No preemption** | si un thread qui tient des ressources demande une ressource indisponible, il **libère tout** ce qu'il tient ; il ne redémarre que quand il peut **tout récupérer** | redémarrages |
| **Circular wait** | imposer un **ordre total** sur les types de ressources ; chaque thread demande **dans l'ordre croissant** | il faut numéroter |

> **La plus utilisée :** casser le **circular wait**. On donne à chaque
> ressource (ex. mutex lock) un **numéro unique**, et on les acquiert **dans
> l'ordre**. Avec `first_mutex = 1` et `second_mutex = 5`, `thread_two` **ne
> peut pas** prendre `second_mutex` puis `first_mutex`.

## 6. Deadlock avoidance

Il faut une information **a priori** : le modèle le plus simple demande à
chaque thread de **déclarer le maximum** de chaque type de ressource dont il
pourrait avoir besoin. L'algorithme examine **dynamiquement** l'état
d'allocation (ressources **disponibles**, **allouées**, **demandes
maximales**) pour qu'il n'y ait **jamais** de circular wait.

### Safe state

Le système est en **safe state** s'il existe une **séquence ⟨T1, …, Tn⟩ de
TOUS les threads** telle que, pour chaque Ti, ce que Ti peut encore demander
peut être satisfait par **les ressources disponibles + celles tenues par
tous les Tj avec j < i**.

```diagram
{
  "title": "Safe ⊂ (pas de deadlock) ; unsafe contient le deadlock. L'avoidance reste dans la zone safe.",
  "groups": [
    { "x": 330, "y": 110, "w": 600, "h": 200, "label": "tous les états", "tone": "neutral", "dashed": false }
  ],
  "nodes": [
    { "id": "s", "x": 180, "y": 110, "w": 220, "h": 140, "shape": "ellipse", "label": "SAFE\npas de deadlock", "tone": "emerald", "filled": true, "bold": true },
    { "id": "u", "x": 470, "y": 110, "w": 250, "h": 150, "shape": "ellipse", "label": "UNSAFE\ndeadlock possible\n\n\n", "tone": "amber", "filled": true, "bold": true },
    { "id": "d", "x": 470, "y": 150, "w": 120, "h": 44, "shape": "ellipse", "label": "DEADLOCK", "tone": "rose", "filled": true, "bold": true, "size": 12 }
  ],
  "edges": []
}
```

| État | Conclusion |
|---|---|
| **safe** | **pas de deadlock** |
| **unsafe** | **possibilité** de deadlock |
| **avoidance** | garantir que le système **n'entre jamais** dans un état unsafe |

| Cas | Algorithme d'avoidance |
|---|---|
| **une instance** par type | **resource-allocation graph** (avec **claim edges**) |
| **plusieurs instances** | **Banker's algorithm** |

### Resource-allocation graph scheme (une instance)

- **Claim edge** Ti → Rj : Ti **pourra** demander Rj ; tracé en
  **pointillés**. Les ressources doivent être **réclamées a priori**.
- Claim edge → **request edge** quand le thread demande ; → **assignment
  edge** quand la ressource est allouée ; quand elle est libérée, l'assignment
  edge **redevient un claim edge**.
- Une demande n'est accordée que si transformer la request edge en
  assignment edge **ne crée pas de cycle**.

## 7. Banker's algorithm (plusieurs instances)

Chaque thread **déclare son maximum** a priori ; une demande peut devoir
**attendre** ; un thread qui a toutes ses ressources les **rend en un temps
fini**.

| Structure (n threads, m types) | Sens |
|---|---|
| **Available** (vecteur m) | `Available[j] = k` : k instances de Rj **disponibles** |
| **Max** (n × m) | `Max[i,j] = k` : Ti peut demander **au plus** k instances de Rj |
| **Allocation** (n × m) | `Allocation[i,j] = k` : Ti **a** k instances de Rj |
| **Need** (n × m) | `Need[i,j] = k` : Ti peut encore avoir besoin de k instances |

> **La formule : Need = Max − Allocation.**

### Safety algorithm

1. `Work = Available` ; `Finish[i] = false` pour tout i.
2. Trouver un i tel que **Finish[i] == false** et **Needᵢ ≤ Work**. S'il n'y
   en a pas, aller en 4.
3. **Work = Work + Allocationᵢ** ; `Finish[i] = true` ; retour en 2.
4. Si **Finish[i] == true pour tout i** → **safe state**.

### Resource-request algorithm (pour Ti)

1. Si **Requestᵢ ≤ Needᵢ**, aller en 2 ; sinon **erreur** (le thread dépasse
   son maximum déclaré).
2. Si **Requestᵢ ≤ Available**, aller en 3 ; sinon Ti **attend**.
3. **Faire semblant** d'allouer : `Available −= Request` ; `Allocationᵢ +=
   Request` ; `Needᵢ −= Request`. Si l'état est **safe** → on alloue ; sinon
   Ti **attend** et on **restaure** l'ancien état.

### L'exemple du cours

5 threads T0 à T4 ; 3 types : **A (10 instances)**, **B (5)**, **C (7)**.

| | Allocation (A B C) | Max (A B C) | **Need = Max − Alloc** |
|---|---|---|---|
| T0 | 0 1 0 | 7 5 3 | **7 4 3** |
| T1 | 2 0 0 | 3 2 2 | **1 2 2** |
| T2 | 3 0 2 | 9 0 2 | **6 0 0** |
| T3 | 2 1 1 | 2 2 2 | **0 1 1** |
| T4 | 0 0 2 | 4 3 3 | **4 3 1** |

**Available = (3 3 2).**

```diagram
{
  "title": "Safety algorithm : la séquence ⟨T1, T3, T4, T2, T0⟩ fonctionne, donc l'état est SAFE.",
  "nodes": [
    { "id": "t", "x": 300, "y": 30, "shape": "table", "size": 12, "label": "Work = Available = (3 3 2)", "rows": [["étape","thread","Need ≤ Work ?","Work + Allocation"],["1","T1","(1 2 2) ≤ (3 3 2) ✓","(3 3 2) + (2 0 0) = (5 3 2)"],["2","T3","(0 1 1) ≤ (5 3 2) ✓","(5 3 2) + (2 1 1) = (7 4 3)"],["3","T4","(4 3 1) ≤ (7 4 3) ✓","(7 4 3) + (0 0 2) = (7 4 5)"],["4","T2","(6 0 0) ≤ (7 4 5) ✓","(7 4 5) + (3 0 2) = (10 4 7)"],["5","T0","(7 4 3) ≤ (10 4 7) ✓","(10 4 7) + (0 1 0) = (10 5 7)"]], "cols": [45,55,170,210] }
  ],
  "edges": []
}
```

> À la fin, Work = (10 5 7) = **le total** des instances : tout a été rendu.

**T1 demande (1 0 2)** : (1 0 2) ≤ Need₁ (1 2 2) ✓ ; (1 0 2) ≤ Available
(3 3 2) ✓ ; on fait semblant : Available = **(2 3 0)**, Allocation₁ =
**(3 0 2)**, Need₁ = **(0 2 0)**. La séquence **⟨T1, T3, T4, T0, T2⟩** est
safe → **demande accordée**.

| Question des slides (après la demande de T1) | Réponse |
|---|---|
| T4 demande **(3 3 0)** ? | **Non** : (3 3 0) > Available (2 3 0) (A : 3 > 2) → T4 **attend** |
| T0 demande **(0 2 0)** ? | **Non** : c'est disponible, mais après l'allocation Available = (2 1 0) et **aucun** thread n'a Need ≤ (2 1 0) → **unsafe** → T0 attend |

## 8. Deadlock detection

On **laisse** le système entrer en deadlock, puis on utilise un **algorithme
de détection** et un **schéma de recovery**.

### Une instance par type : le wait-for graph

On garde un **wait-for graph** : les **nœuds sont des threads**, **Ti → Tj**
si Ti **attend** Tj (on supprime les ressources du resource-allocation graph).
On cherche **périodiquement** un **cycle** : un cycle = un deadlock. Coût :
**O(n²)** opérations (n = nombre de sommets).

```diagram
{
  "title": "Du resource-allocation graph au wait-for graph : on court-circuite les ressources. Le cycle T1 → T2 → T3 → T1 = deadlock.",
  "nodes": [
    { "id": "a", "x": 100, "y": 40, "w": 70, "shape": "ellipse", "label": "T1", "tone": "sky", "filled": true },
    { "id": "b", "x": 300, "y": 40, "w": 70, "shape": "ellipse", "label": "T2", "tone": "sky", "filled": true },
    { "id": "c", "x": 200, "y": 160, "w": 70, "shape": "ellipse", "label": "T3", "tone": "sky", "filled": true },
    { "id": "d", "x": 470, "y": 100, "w": 70, "shape": "ellipse", "label": "T4", "tone": "sky", "filled": true }
  ],
  "edges": [
    { "from": "a", "to": "b", "label": "attend", "tone": "rose" },
    { "from": "b", "to": "c", "label": "attend", "tone": "rose" },
    { "from": "c", "to": "a", "label": "attend", "tone": "rose" },
    { "from": "b", "to": "d", "label": "attend" }
  ]
}
```

### Plusieurs instances : l'algorithme de détection

Structures : **Available** (m), **Allocation** (n × m), **Request** (n × m :
la demande **actuelle** de chaque thread).

1. `Work = Available` ; pour chaque i, si **Allocationᵢ ≠ 0** alors
   `Finish[i] = false`, sinon `Finish[i] = true`.
2. Trouver i avec **Finish[i] == false** et **Requestᵢ ≤ Work** ; sinon aller
   en 4.
3. `Work = Work + Allocationᵢ` ; `Finish[i] = true` ; retour en 2.
4. Si **Finish[i] == false** pour un i → **deadlock**, et **Ti est
   deadlocked**.

Coût : **O(m × n²)**.

> **Différence avec la safety :** on compare **Request** (la demande actuelle)
> et non **Need** (le maximum restant), et un thread **sans ressource**
> commence avec `Finish = true`.

**Exemple** : A (7 instances), B (2), C (6) ; **Available = (0 0 0)**.

| | Allocation | Request |
|---|---|---|
| T0 | 0 1 0 | 0 0 0 |
| T1 | 2 0 0 | 2 0 2 |
| T2 | 3 0 3 | 0 0 0 |
| T3 | 2 1 1 | 1 0 0 |
| T4 | 0 0 2 | 0 0 2 |

Séquence **⟨T0, T2, T3, T1, T4⟩** → Finish = true pour tous → **pas de
deadlock**. Si **T2 demande une instance de C** (Request₂ = 0 0 1) : on peut
récupérer les ressources de **T0**, mais pas assez pour les autres →
**deadlock de T1, T2, T3 et T4**.

### Quand lancer la détection ?

Selon **la fréquence** probable des deadlocks et **le nombre de threads** à
annuler (*rolled back*, un par cycle disjoint). Si on l'appelle à des moments
**arbitraires**, il peut y avoir plusieurs cycles et on ne sait pas quel
thread a **causé** le deadlock.

## 9. Recovery from deadlock

**Process termination** : soit **tuer tous** les threads en deadlock, soit
**un à la fois** jusqu'à ce que le cycle disparaisse. Critères pour choisir :

- la **priorité** du thread ;
- depuis **combien de temps** il calcule et combien il lui reste ;
- les ressources **utilisées** et celles **nécessaires** pour finir ;
- **combien** de threads il faudra terminer ;
- **interactif ou batch**.

**Resource preemption** :

| Étape | Sens |
|---|---|
| **Selecting a victim** | choisir pour **minimiser le coût** |
| **Rollback** | ramener le thread à un **safe state** et le redémarrer |
| **Starvation** | le même thread pourrait toujours être la victime → inclure le **nombre de rollbacks** dans le coût |

---

# Partie 2 — Lab : logs et archives

## 10. Analyser et stocker les logs

Les processus et le **noyau** enregistrent les événements dans des logs
(audit, dépannage) ; ils sont stockés de façon **persistante** dans
**`/var/log`**. Deux services (protocole **Syslog**) :

| Service | Rôle |
|---|---|
| **systemd-journald** | collecte les messages du **noyau**, du **boot**, la sortie standard et les erreurs des daemons ; les écrit dans un **journal structuré** (par défaut **non persistant** entre reboots) ; les transmet à rsyslog |
| **rsyslog** | **trie** les messages syslog par **type (facility)** et **priorité**, et les écrit dans des fichiers persistants de `/var/log` |

| Fichier | Contenu |
|---|---|
| **`/var/log/messages`** | la plupart des messages syslog (sauf authentification, mail, cron, debug) |
| **`/var/log/secure`** | **sécurité** et **authentification** |
| **`/var/log/maillog`** | serveur **mail** |
| **`/var/log/cron`** | tâches **périodiques** |
| **`/var/log/boot.log`** | **démarrage** du système |

(Ubuntu utilise aussi **`/var/log/syslog`** et **`/var/log/auth.log`**.)

Le script `syslog_lab.sh` :

```bash
sudo systemctl enable --now rsyslog
echo "kern.* /var/log/kernel.log" >> /etc/rsyslog.d/50-default.conf   # messages noyau à part
logger -p local0.notice "Test log entry"   # écrire un message de test
journalctl                     # tout le journal
journalctl -k                  # messages du noyau
journalctl -u rsyslog          # un service
journalctl --since today       # depuis aujourd'hui
journalctl --priority=err      # priorité erreur
journalctl --boot              # boot courant
journalctl --since "2021-01-01" --until "2021-01-02"
```

## 11. Archiver avec tar

**tar** regroupe beaucoup de fichiers en **une archive**, éventuellement
**compressée** (gzip, bzip2, xz). Il faut **une** des trois actions :

| Option | Sens |
|---|---|
| **c** | **créer** une archive |
| **t** | **lister** le contenu |
| **x** | **extraire** |
| **f** *fichier* | le **nom** de l'archive (à mettre juste avant le nom) |
| **v** | **verbose** : affiche les fichiers traités |
| **p** | **préserve les permissions** à l'extraction (sans soustraire l'umask) |
| **z** | compression **gzip** (`.tar.gz`, `.tgz`) — la plus **rapide** et la plus **ancienne** |
| **j** | compression **bzip2** (`.tar.bz2`) — meilleur ratio que gzip |
| **J** | compression **xz** (`.tar.xz`) — en général le **meilleur ratio** |

```bash
tar cf archive.tar file1 file2 file3     # créer
tar cf /root/etc.tar /etc                # "Removing leading '/' from member names"
tar tf /root/etc.tar                     # lister
tar xf /root/etc.tar                     # extraire (dans le dossier courant)
tar xpf /root/myscripts.tar              # extraire en gardant les permissions
tar czf /root/etcbackup.tar.gz /etc      # gzip
tar cjf /root/logbackup.tar.bz2 /var/log # bzip2
tar cJf /root/sshconfig.tar.xz /etc/ssh  # xz
tar xzf /root/etcbackup.tar.gz           # extraire du gzip
tar xJf /root/sshbackup.tar.xz           # extraire du xz
```

| À savoir | |
|---|---|
| Chemins absolus | tar **retire le `/` initial** (on extrait **relativement** au dossier courant → pas d'écrasement accidentel) |
| Attributs étendus | `--xattrs` pour garder le **contexte SELinux** et les **ACLs** |
| Où extraire | dans un **dossier vide** (créer puis `cd`), pour ne rien écraser |
| Utilisateur normal | les fichiers extraits lui **appartiennent** |
| Compression seule | `gzip etc.tar` → `etc.tar.gz` ; `bunzip2`, `unxz`, `gunzip` décompressent |
| Bon usage | archiver **un dossier de premier niveau** pour une extraction ordonnée |

Avancé (`tar_lab.sh`) : `tar czvf - /etc | ssh user@host "cat > backup.tar.gz"`
(archive envoyée à distance), **sauvegardes incrémentales**
`--listed-incremental=snapshot.file`, **archives découpées** `| split
--bytes=100M`, **vérification** `--verify`.

---

## Pièges d'exam

- Deadlock = **les 4 conditions en même temps** ; la prevention en casse
  **une** (le plus souvent **circular wait** par un ordre sur les
  ressources).
- RAG : request **Ti → Rj**, assignment **Rj → Ti** ; cycle + une instance =
  deadlock ; cycle + plusieurs instances = **possible**.
- **Safe → pas de deadlock** ; **unsafe → possible**, pas certain.
- **Need = Max − Allocation** ; safety : `Need ≤ Work` puis `Work +=
  Allocation`.
- Une demande doit vérifier **Request ≤ Need** (sinon erreur) puis **Request
  ≤ Available** (sinon attente) puis l'état simulé doit être **safe**.
- Claim edge = **pointillés**, réclamée **a priori**.
- Wait-for graph : **threads seulement**, cycle = deadlock, **O(n²)** ;
  détection multi-instances **O(m × n²)**, compare **Request** (pas Need).
- Recovery : terminer (tout / un par un) ou préempter (victim, rollback,
  starvation).
- tar : **c / t / x** + **f** ; **z** gzip, **j** bzip2, **J** xz ; **p**
  permissions ; le `/` initial est retiré.
- journald (journal structuré, non persistant) vs rsyslog (fichiers dans
  `/var/log`) ; **`/var/log/secure`** = authentification.

## À retenir

- Request → use → release ; 4 conditions ; RAG.
- Prevention / avoidance / detection + recovery / ignorer.
- Banker's : Available, Max, Allocation, Need ; exemple safe ⟨T1, T3, T4,
  T2, T0⟩.
- Logs : journald + rsyslog, `/var/log`, `journalctl` ; archives : `tar`.
