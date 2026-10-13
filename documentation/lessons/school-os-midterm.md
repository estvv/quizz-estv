# Operating System — Mid Term (W1–W7) · Plan de révision

Le **Midterm Quiz** (semaine 8 du syllabus) porte sur **tout le contenu des
semaines 1 à 7**. Cette catégorie mélange des questions de **toutes les
leçons** d'OS dans le style d'un QCM d'examen. Toutes les réponses se trouvent
dans les leçons Week 1 à Week 6 (la semaine 7 est un lab, couvert dans la
partie Lab de Week 5) ; le **Glossaire** reprend tous les termes.

**Méthode conseillée :**

1. Faire ce quiz une première fois à froid : **Toutes** puis **Aléatoire**.
2. Pour chaque semaine où tu rates des questions, relire la **leçon** de la
   semaine (sections *À retenir* et *Pièges classiques*) puis refaire son
   quiz.
3. Réviser le vocabulaire avec les flashcards du **Glossaire (W1–W6)**.
4. Refaire le Mid Term complet la veille, et **refaire à la main** les
   calculs (Gantt, Amdahl, Little, chmod).

---

## La checklist par semaine

| Semaine | Ce qu'il faut savoir sans hésiter |
|---|---|
| **W1** · Introduction | OS = **intermédiaire** utilisateur / matériel ; **kernel** = seul programme toujours en marche ; **interrupt driven**, **interrupt vector**, **trap** = interruption logicielle ; **DMA** = 1 interruption par bloc ; RAM **volatile**, 1 KB = 1 024 B ; **multiprogramming** vs **timesharing** (< 1 s) ; **mode bit** user = 1 / kernel = 0 ; **timer** contre les boucles infinies ; **protection** vs **security** ; emulation (la plus lente) ; **SMP**, multicore, **NUMA**, **clusters** ; cloud **public / private / hybrid**, **SaaS / PaaS / IaaS** |
| **W2** · VM & Git | **host / guest / hypervisor** ; dépôts Ubuntu **main / universe / restricted / multiverse** ; `apt update` vs `install` ; Git **working dir → add → staging → commit → push** ; `pull` = `fetch` + `merge` ; `init` vs `clone` ; `reset <file>` |
| **W3** · Structures | services **user** (UI, execution, I/O, files, communications, errors) vs **système** (allocation, logging, protection) ; **system call** via **API** (Win32, **POSIX**, Java) ; paramètres par **registers / block (Linux) / stack** ; 6 catégories ; `printf` → `write()` ; **linker / loader**, DLL, **ABI** ; **policy (quoi) vs mechanism (comment)** ; **monolithic / layered (0 = matériel) / microkernel (Mach, lent) / modules / hybrid** ; boot **BIOS/UEFI → GRUB** ; core vs crash dump ; `/etc`, `/var`, `/root` ≠ `/` ; `cp -r`, `rmdir` ; **r4 w2 x1** |
| **W4** · Processus | **text / data / heap / stack** ; états **new, ready, running, waiting, terminated** (waiting → **ready**) ; **PCB** (`task_struct`) ; **context switch = overhead** ; `fork()` = **0** dans l'enfant ; `exec`, `wait` ; **zombie** vs **orphan** ; **shared memory** vs **message passing** ; buffer borné **B − 1** ; **direct / indirect (mailbox)**, **rendezvous**, buffering 0 / borné / illimité ; **ordinary** (uni, parent-enfant) vs **named** pipes ; socket = **IP + port**, RPC **stub / marshalling / XDR** ; signaux **2 / 20 / 15 / 9** ; `&`, `bg`, `fg` ; **cron** (minute d'abord) ; **systemd PID 1**, `start` vs `enable` ; load average **par cœur** |
| **W5** · Threads | partagé (code, data, fichiers) vs propre (**ID, PC, registres, stack**) ; **responsiveness, resource sharing, economy, scalability** ; **concurrency** vs **parallelism** ; data vs task ; **Amdahl** 1 / (S + (1 − S)/N), max **1/S** ; **many-to-one / one-to-one (Linux, Windows) / many-to-many / two-level** ; Pthreads = **spécification** ; thread pools, fork-join, OpenMP, GCD, TBB ; annulation **différée par défaut** ; **TLS** ; ETHREAD / KTHREAD / **TEB** ; `clone()` ; lab : STAT **Z**, `uptime`, **0 stdin / 1 stdout / 2 stderr**, `>` vs `>>`, `2>&1`, `tee`, `chmod` symbolique, PuTTY / WinSCP |
| **W6** · Scheduling | cas **1 et 4** = nonpreemptive ; **scheduler choisit, dispatcher donne** ; critères (**waiting = turnaround − burst**) ; **FCFS** (convoy, 17 vs 3), **SJF** (optimal, 7), **SRTF** (6,5), **RR** (q, (n − 1)·q, q grand → FCFS), **Priority** (petit nombre = haut, **starvation → aging**, 8,2), **MLQ / MLFQ** ; **PCS / SCS** ; push / pull migration ; **soft / hard affinity** ; **RMS** (période) vs **EDF** (deadline) ; SCHED_FIFO / SCHED_RR ; **CFS** (nice −20…+19, plus petit **vruntime**) ; **Little n = λW** ; groupes primaires (`/etc/passwd` 4e champ), états **R S D K T Z X** |

## Les calculs à savoir refaire

| Calcul | Formule / méthode | Exemple de la leçon |
|---|---|---|
| Temps d'attente | waiting = turnaround − burst ; turnaround = fin − arrivée | FCFS P1 24, P2 3, P3 3 → **17** ; ordre P2, P3, P1 → **3** |
| SJF | trier par burst croissant | 6, 8, 7, 3 → **7** |
| SRTF | recalculer à chaque arrivée | → **6,5** |
| RR q = 4 | file circulaire | 24, 3, 3 → **≈ 5,66** |
| Amdahl | 1 / (S + (1 − S)/N), max 1/S | S = 0,25 : N = 2 → **1,6** ; ∞ → **4** |
| Little | n = λ × W | 14 = 7 × W → **W = 2 s** |
| chmod | r = 4, w = 2, x = 1 | `rwxr-x---` = **750** ; `rw-r-----` = **640** |
| Load average | ÷ nombre de cœurs | 2,00 sur 4 cœurs = **50 %** |

## Les confusions qui coûtent des points

| Ne pas confondre | |
|---|---|
| **Trap** / **hardware interrupt** | logiciel (erreur, system call) / périphérique |
| **Mode bit** / **timer** | empêche les instructions privilégiées / empêche la boucle infinie |
| **Protection** / **security** | contrôle d'accès interne / défense contre les attaques |
| **Program** / **process** | passif / actif |
| **Zombie** / **orphan** | enfant fini, parent sans `wait()` / parent mort |
| **Policy** / **mechanism** | quoi / comment |
| **Concurrency** / **parallelism** | progresse (1 cœur possible) / en même temps (plusieurs cœurs) |
| **Scheduler** / **dispatcher** | choisit / donne le CPU |
| **SJF** / **SRTF** | non préemptif / préemptif |
| **RMS** / **EDF** | période la plus courte, fixe / deadline la plus proche, dynamique |
| **Soft** / **hard affinity** | essaie / impose |
| `apt update` / `apt upgrade` | rafraîchit la liste / met à jour les paquets |
| `git fetch` / `git pull` | récupère / récupère + fusionne |
| `kill` / `kill -9` | SIGTERM 15 (poli) / SIGKILL 9 (forcé) |
| `systemctl start` / `enable` | maintenant / au prochain boot |
| `>` / `>>` | écrase / ajoute |
