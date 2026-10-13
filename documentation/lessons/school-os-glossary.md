# Operating System — Glossaire (W1–W6)

Termes en anglais (comme au quiz), définitions en français.

---

## Semaine 1 – Introduction (ch. 1)

### L'OS et ses composants
- **Operating System (OS)** : logiciel intermédiaire entre l'utilisateur et le matériel.
- **Kernel** : le cœur de l'OS, « le programme qui tourne en permanence ».
- **System program** : programme livré avec l'OS mais hors du noyau (shell, `ls`).
- **Application program** : programme de l'utilisateur, sans lien avec l'OS.
- **Middleware** : frameworks en plus pour les développeurs (base de données, multimédia).
- **Resource allocator** : rôle de l'OS qui répartit CPU, mémoire et disque.
- **Control program** : rôle de l'OS qui surveille les programmes pour éviter erreurs et abus.

### Matériel et interruptions
- **Bus** : canal commun qui relie le CPU, la mémoire et les contrôleurs.
- **Device controller** : puce qui gère un type de périphérique, avec un buffer local.
- **Device driver** : partie de l'OS qui sait piloter un contrôleur.
- **Interrupt** : signal qui force le CPU à traiter un événement.
- **Interrupt vector** : table des adresses des routines qui traitent chaque interruption.
- **ISR (Interrupt Service Routine)** : code exécuté pour traiter une interruption.
- **Trap / Exception** : interruption **logicielle** (erreur, ou demande d'un system call).
- **Interrupt driven** : l'OS agit en réaction aux interruptions.
- **DMA (Direct Memory Access)** : le contrôleur copie un bloc directement en RAM, avec **une interruption par bloc** (et non par octet).
- **Von Neumann architecture** : les instructions et les données sont dans la même mémoire.

### Stockage
- **Main memory (RAM / DRAM)** : la seule mémoire accessible directement par le CPU ; elle est volatile.
- **Volatile** : perd son contenu quand le courant est coupé.
- **Secondary storage** : stockage non volatile (HDD, SSD).
- **Track / Sector** : piste et secteur, le découpage d'un disque dur.
- **NVM (Non-Volatile Memory)** : mémoire flash (SSD), plus rapide qu'un HDD.
- **Storage hierarchy** : classement des mémoires par vitesse, coût et volatilité (registres → cache → RAM → SSD → HDD).
- **Caching** : copier des données vers une mémoire plus rapide ; on regarde d'abord dans le cache.
- **Cache coherency** : garantir que tous les CPU voient la même valeur dans leur cache.
- **Bit / Byte / Word** : 0 ou 1 / 8 bits / unité native du CPU (8 octets sur une machine 64 bits).
- **KB / MB / GB** : 1024 / 1024² / 1024³ octets.

### Fonctionnement de l'OS
- **Bootstrap program** : code de démarrage qui charge le noyau.
- **Daemon** : service qui tourne en arrière-plan, hors du noyau.
- **Multiprogramming (batch)** : plusieurs jobs en mémoire ; quand l'un attend une I/O, le CPU passe à un autre.
- **Job scheduling** : choisir quel job charger en mémoire.
- **Multitasking / Time sharing** : le CPU alterne très vite entre les tâches, avec un temps de réponse < 1 s.
- **Swapping** : déplacer un processus entre la RAM et le disque.
- **Virtual memory** : exécuter un programme qui ne tient pas entièrement en RAM.
- **Dual-mode operation** : deux modes d'exécution, user et kernel.
- **User mode / Kernel mode** : droits limités / tous les droits.
- **Mode bit** : bit matériel qui indique le mode courant (user ou kernel).
- **Privileged instruction** : instruction autorisée seulement en mode kernel.
- **Timer** : interruption programmée pour que l'OS reprenne le contrôle du CPU (évite les boucles infinies).

### Gestion des ressources
- **Process** : programme en cours d'exécution (entité **active**).
- **Program** : fichier exécutable sur le disque (entité **passive**).
- **Program counter (PC)** : adresse de la prochaine instruction à exécuter.
- **Single-threaded / Multi-threaded process** : un seul PC / un PC par thread.
- **Deadlock** : interblocage, des processus s'attendent mutuellement pour toujours.
- **Mass-storage management** : montage, espace libre, partitions, disk scheduling.
- **Buffering** : stocker temporairement des données pendant un transfert.
- **Spooling** : mettre en file des sorties (par exemple pour l'imprimante) pendant qu'un autre job travaille.

### Protection et sécurité
- **Protection** : contrôler l'accès des processus et des utilisateurs aux ressources.
- **Security** : se défendre contre les attaques internes et externes (virus, vers, déni de service).
- **User ID / Group ID** : identifiant d'un utilisateur / d'un groupe.
- **Privilege escalation** : obtenir temporairement plus de droits (`sudo`).

### Architectures
- **Multiprocessor / Parallel / Tightly-coupled system** : plusieurs CPU qui partagent la mémoire.
- **Throughput** : quantité de travail accomplie par unité de temps.
- **Economy of scale** : partager les périphériques et l'alimentation coûte moins cher.
- **Graceful degradation / Fault tolerance** : le système continue de fonctionner si un composant tombe en panne.
- **Asymmetric multiprocessing** : chaque CPU a une tâche spécifique.
- **Symmetric multiprocessing (SMP)** : tous les CPU sont égaux et font tout.
- **Multicore** : plusieurs cœurs sur une même puce.
- **NUMA (Non-Uniform Memory Access)** : chaque CPU a sa mémoire proche ; la mémoire des autres CPU est plus lente.
- **Clustered system** : plusieurs ordinateurs reliés qui travaillent ensemble.
- **Asymmetric clustering** : une machine en **hot-standby** attend et prend le relais en cas de panne.
- **Symmetric clustering** : tous les nœuds travaillent et se surveillent.
- **SAN (Storage-Area Network)** : réseau de stockage partagé.
- **HPC (High-Performance Computing)** : calcul haute performance.
- **DLM (Distributed Lock Manager)** : évite les opérations conflictuelles dans un cluster.

### Virtualisation et environnements
- **Emulation** : simuler un **autre** type de CPU ; c'est le plus lent.
- **Interpretation** : exécuter un langage non compilé en code natif.
- **Virtualization** : faire tourner un OS invité sur le **même** type de CPU.
- **Host / Guest** : OS hôte / OS invité.
- **VMM (Virtual Machine Manager)** : hyperviseur qui gère les VM (VMware, VirtualBox).
- **Distributed system** : machines en réseau qui donnent l'illusion d'un seul système.
- **LAN / WAN / MAN / PAN** : réseau local / étendu / à l'échelle d'une ville / personnel (Bluetooth).
- **Network Operating System** : OS qui offre des services entre plusieurs machines.
- **Client-server** : le serveur répond aux requêtes des clients.
- **Compute-server / File-server** : serveur qui fournit des calculs / des fichiers.
- **Peer-to-peer (P2P)** : chaque nœud est à la fois client et serveur (Napster, Skype).
- **Discovery protocol** : trouver un service sur un réseau P2P.
- **Cloud computing** : calcul et stockage fournis comme un service sur Internet.
- **Public / Private / Hybrid cloud** : ouvert à tous / interne à une entreprise / un mélange des deux.
- **SaaS (Software as a Service)** : le fournisseur donne une application (Google Docs).
- **PaaS (Platform as a Service)** : le fournisseur donne une plateforme (par exemple une base de données).
- **IaaS (Infrastructure as a Service)** : le fournisseur donne l'infrastructure (serveurs, stockage).
- **Load balancer** : répartit le trafic entre plusieurs serveurs.
- **Real-time embedded system** : système embarqué avec des contraintes de temps fixes.
- **Free / Open-source OS** : OS dont le code source est disponible (GNU/Linux, BSD).
- **GPL / Copyleft** : licence qui oblige les versions modifiées à rester libres.
- **DRM** : protection anti-copie (l'opposé de l'esprit open source).

### Structures de données du noyau
- **Linked list (singly / doubly / circular)** : liste chaînée simple / double / circulaire.
- **Binary search tree** : arbre de recherche, O(n) dans le pire cas, O(log n) s'il est équilibré.
- **Hash map** : table de hachage, accès rapide par clé.
- **Bitmap** : suite de bits qui indique l'état de n éléments.

---

## Semaine 2 – Installation (lab)

- **VMware Workstation Player / VirtualBox** : logiciels pour créer des machines virtuelles.
- **Ubuntu LTS** : distribution Linux ; LTS = Long Term Support (support long).
- **Git repository** : dépôt qui contient l'historique d'un projet.
- **Staging area** : zone de préparation avant un commit (`git add`).
- **Commit** : version enregistrée du projet.
- **Branch** : ligne de développement parallèle.
- **Remote / origin** : dépôt distant / son nom par défaut.
- **`git status` / `git diff` / `git log`** : fichiers modifiés / différences / historique.
- **`git fetch` vs `git pull`** : récupère sans fusionner / récupère **et** fusionne.
- **`git push`** : envoie les commits vers le dépôt distant.
- **`git merge`** : fusionne une branche dans la branche courante.
- **`git checkout -b`** : crée une branche et bascule dessus.
- **`.gitignore`** : liste des fichiers à ne pas suivre.
- **Relational DB (SQL)** : base de données organisée en tables.
- **NoSQL** : bases non relationnelles : Key-Value, Document, Graph, Column-Family.

---

## Semaine 3 – Structures de l'OS (ch. 2)

### Services et interfaces
- **OS services** : UI, exécution de programmes, I/O, fichiers, communications, détection d'erreurs, allocation de ressources, logging, protection.
- **CLI (Command-Line Interface)** : interface en ligne de commande.
- **GUI (Graphical User Interface)** : interface graphique, inventée chez **Xerox PARC**.
- **Batch** : exécution de commandes par lots, sans interaction.
- **Shell / Command interpreter** : programme qui lit et exécute les commandes (bash, sh).
- **Built-in command** : commande intégrée au shell (`cd`), par opposition à un programme séparé (`ls`).
- **Aqua** : interface graphique de macOS.

### System calls
- **System call** : demande de service faite par un programme à l'OS ; c'est la porte d'entrée vers le noyau.
- **API (Application Programming Interface)** : fonctions de haut niveau qui appellent les system calls (Win32, POSIX, Java API).
- **POSIX** : standard d'API pour Unix, Linux et macOS.
- **JVM (Java Virtual Machine)** : machine virtuelle qui exécute le Java.
- **System-call interface** : table où chaque system call a un numéro.
- **Run-time support library** : bibliothèque fournie avec le compilateur, qui fait le lien avec les system calls.
- **Parameter passing** : par registres, par bloc/table en mémoire (Linux, Solaris) ou par la pile ; les deux derniers n'ont pas de limite.
- **Types de system calls** : process control, file management, device management, information maintenance, communications, protection.
- **Exit code** : 0 = pas d'erreur, > 0 = code d'erreur.

### System programs, linker et loader
- **System services / System programs** : outils livrés avec l'OS (gestion de fichiers, état du système, éditeurs, compilateurs, communications, daemons).
- **Registry** : base qui stocke la configuration (Windows).
- **Background services** : daemons qui tournent en **user context**, pas dans le noyau.
- **Relocatable object file** : fichier compilé qui peut être chargé n'importe où en mémoire.
- **Linker** : combine les fichiers objets et les bibliothèques en un seul exécutable.
- **Loader** : charge l'exécutable du disque vers la mémoire.
- **Relocation** : attribuer les adresses mémoire définitives.
- **DLL (Dynamically Linked Library)** : bibliothèque chargée à l'exécution et partagée (`.so` sous Linux).
- **ABI (Application Binary Interface)** : l'équivalent de l'API au niveau binaire, pour une architecture et un OS donnés.

### Conception
- **User goals / System goals** : pratique, fiable, rapide / facile à concevoir et à maintenir, efficace.
- **Policy** : **quoi** faire (par exemple « interrompre toutes les 100 s »).
- **Mechanism** : **comment** le faire (par exemple le timer). On sépare policy et mechanism pour plus de flexibilité.

### Structures d'OS
- **Simple structure** : MS-DOS, sans vraie organisation.
- **Monolithic structure** : tout le noyau dans un seul gros programme (UNIX original) ; rapide mais difficile à maintenir.
- **Layered approach** : OS en couches ; la couche 0 est le matériel, la couche N l'interface ; chaque couche n'utilise que celles du dessous.
- **Microkernel** : noyau minimal, le reste en espace utilisateur, communication par messages (Mach). Plus sûr et plus fiable, mais **plus lent**.
- **Mach** : microkernel qui sert de base à macOS (Darwin).
- **LKM (Loadable Kernel Modules)** : morceaux du noyau chargeables à chaud (Linux, Solaris).
- **Hybrid system** : mélange de plusieurs approches (Linux, Windows, macOS).
- **Darwin** : noyau de macOS (Mach + BSD).
- **Kernel extensions** : modules chargeables de macOS.
- **Android** : noyau Linux modifié, avec une VM (Dalvik/ART) pour les applications Java.

### Démarrage et débogage
- **vmlinuz** : image compilée du noyau Linux.
- **`make menuconfig`** : configurer le noyau avant compilation.
- **Bootstrap loader** : petit programme qui trouve et charge le noyau.
- **BIOS** : firmware de démarrage historique, stocké en ROM.
- **UEFI** : remplaçant moderne du BIOS.
- **GRUB** : boot loader de Linux, permet de choisir le noyau.
- **Single-user mode** : mode de démarrage minimal pour la maintenance.
- **Log files** : journaux d'événements et d'erreurs.
- **Core dump** : copie de la mémoire d'une **application** plantée.
- **Crash dump** : copie de la mémoire du **noyau** après un plantage de l'OS.
- **Performance tuning** : supprimer les **bottlenecks** (goulots d'étranglement).
- **Profiling** : échantillonner régulièrement le pointeur d'instruction pour voir où le temps est passé.
- **Tracing** : enregistrer les étapes d'un événement précis.
- **strace / gdb / perf / tcpdump** : trace les system calls / débogueur / performances / capture réseau.
- **BCC / BPF / DTrace** : outils de traçage avancé du noyau.

---

## Semaine 4 – Processus (ch. 3)

### Concept de processus
- **Text section** : le code du programme.
- **Data section** : les variables globales.
- **Heap** : la mémoire allouée dynamiquement pendant l'exécution (`malloc`).
- **Stack** : paramètres de fonctions, adresses de retour, variables locales.
- **Process states** : new (en création), ready (attend le CPU), running (s'exécute), waiting (attend un événement), terminated (fini).
- **PCB (Process Control Block)** : la « carte d'identité » du processus : état, PC, registres, ordonnancement, mémoire, comptabilité, I/O.
- **task_struct** : la structure C qui représente un processus sous Linux.
- **PID** : identifiant du processus.

### Ordonnancement des processus
- **Process scheduler** : choisit le prochain processus à exécuter.
- **Ready queue** : file des processus prêts à tourner.
- **Wait queue** : file des processus qui attendent un événement (I/O).
- **Context switch** : sauvegarder l'état de l'ancien processus et charger celui du nouveau ; c'est du **pure overhead**.

### Création et terminaison
- **Parent / Child process** : processus créateur / processus créé ; ils forment un **arbre de processus**.
- **fork()** : crée une copie du processus.
- **exec()** : remplace le programme du processus par un autre.
- **wait()** : le parent attend la fin de l'enfant et récupère son statut.
- **exit()** : le processus se termine.
- **abort()** : le parent tue un enfant.
- **Cascading termination** : si le parent meurt, tous ses descendants sont tués.
- **Zombie** : enfant terminé dont le parent n'a pas encore fait `wait()`.
- **Orphan** : processus dont le parent est mort sans faire `wait()`.

### Mobile et Chrome
- **Foreground / Background process** : visible à l'écran / en arrière-plan.
- **Service (Android)** : tâche de fond sans interface.
- **Android importance hierarchy** : foreground > visible > service > background > empty.
- **Chrome multiprocess** : un processus browser, un renderer par site (dans une **sandbox**), un processus par plug-in.
- **Sandbox** : environnement isolé avec des accès restreints.

### IPC (Interprocess Communication)
- **Independent / Cooperating process** : n'interagit pas / partage des données avec d'autres processus.
- **IPC** : mécanisme qui permet à des processus de communiquer.
- **Shared memory** : zone mémoire commune ; rapide, contrôlée par les processus utilisateurs.
- **Message passing** : échange de messages avec `send()` et `receive()`.
- **Producer-consumer problem** : un processus produit des données, un autre les consomme.
- **Unbounded buffer** : buffer sans limite ; le producteur n'attend jamais.
- **Bounded buffer** : buffer de taille fixe ; seulement **BUFFER_SIZE − 1** cases utilisables dans la solution du cours.
- **Race condition** : le résultat dépend de l'ordre d'exécution de processus qui modifient les mêmes données.
- **Communication link** : canal logique entre deux processus.
- **Direct communication** : on nomme explicitement le processus (`send(P, msg)`).
- **Indirect communication** : on passe par une **mailbox / port** (`send(A, msg)`).
- **Blocking (synchronous)** : l'émetteur ou le récepteur attend.
- **Non-blocking (asynchronous)** : personne n'attend.
- **Rendezvous** : send et receive sont tous les deux bloquants.
- **Zero / Bounded / Unbounded capacity** : aucun message en file (l'émetteur attend) / n messages au maximum / file infinie.
- **shm_open / ftruncate / mmap** : créer un segment de mémoire partagée POSIX / fixer sa taille / l'attacher à l'espace mémoire.
- **Mach ports** : boîtes aux lettres de Mach ; chaque tâche a un port Kernel et un port Notify.
- **ALPC / LPC (Windows)** : appels de procédure locaux par messages, sur une même machine.
- **Pipe** : conduit entre deux processus.
- **Ordinary pipe** : à sens unique, entre un parent et son enfant (« anonymous pipe » sous Windows).
- **Named pipe** : bidirectionnel, sans besoin de relation parent-enfant.
- **Half / Full duplex** : un sens à la fois / les deux sens en même temps.

### Client-serveur
- **Socket** : point de communication réseau = adresse IP + port.
- **Port** : numéro qui identifie un service sur une machine ; < 1024 = ports « well known ».
- **Loopback (127.0.0.1)** : adresse qui désigne la machine elle-même.
- **TCP / UDP / Multicast** : avec connexion / sans connexion / vers plusieurs destinataires.
- **RPC (Remote Procedure Call)** : appeler une fonction qui s'exécute sur une autre machine.
- **Stub** : intermédiaire côté client (et serveur) qui emballe et déballe les paramètres.
- **Marshalling** : emballer les paramètres pour les envoyer sur le réseau.
- **XDR (External Data Representation)** : format neutre pour gérer big-endian et little-endian.
- **Big-endian / Little-endian** : ordre des octets en mémoire (poids fort d'abord / poids faible d'abord).
- **Matchmaker / Rendezvous service** : service qui met en relation un client et un serveur RPC.

---

## Semaine 5 – Threads (ch. 4)

### Bases
- **Thread** : fil d'exécution à l'intérieur d'un processus ; les threads partagent la mémoire du processus.
- **Responsiveness** : l'application reste réactive même si une partie est bloquée.
- **Resource sharing** : les threads partagent naturellement les ressources.
- **Economy** : créer un thread coûte moins cher que créer un processus.
- **Scalability** : profiter de plusieurs cœurs.
- **Concurrency** : plusieurs tâches progressent, même sur un seul cœur.
- **Parallelism** : plusieurs tâches s'exécutent vraiment en même temps (plusieurs cœurs).
- **Data parallelism** : même opération sur différents morceaux de données.
- **Task parallelism** : opérations différentes réparties sur les cœurs.
- **Amdahl's Law** : speedup ≤ 1 / (S + (1−S)/N) ; la partie séquentielle S limite le gain ; avec N → ∞, le speedup tend vers 1/S.

### Modèles
- **User thread** : géré par une bibliothèque, sans que le noyau le sache.
- **Kernel thread** : géré directement par l'OS.
- **Many-to-one** : plusieurs threads user pour un thread kernel ; un blocage bloque tout ; pas de vrai parallélisme.
- **One-to-one** : un thread kernel par thread user (Windows, Linux).
- **Many-to-many** : plusieurs threads user sur plusieurs threads kernel.
- **Two-level model** : comme many-to-many, mais un thread user peut être lié à un thread kernel.
- **Thread library** : API pour créer et gérer des threads (Pthreads, Windows, Java).
- **Pthreads** : standard POSIX pour les threads ; c'est une **spécification**, pas une implémentation.
- **pthread_create / pthread_join** : créer un thread / attendre sa fin.

### Implicit threading
- **Implicit threading** : le compilateur ou la bibliothèque gère les threads à la place du programmeur.
- **Thread pool** : threads créés à l'avance qui attendent du travail.
- **Fork-join** : découper une tâche en sous-tâches, puis rassembler les résultats.
- **OpenMP** : directives de compilation (`#pragma omp parallel`) pour paralléliser du code.
- **GCD (Grand Central Dispatch)** : outil Apple ; des blocs `^{ }` placés dans des **dispatch queues** (serial ou concurrent).
- **Intel TBB** : bibliothèque C++ de parallélisme (`parallel_for`).

### Problèmes liés aux threads
- **Signal** : notification envoyée à un processus pour un événement.
- **Synchronous / Asynchronous signal** : causé par le processus lui-même / venu de l'extérieur.
- **Signal handler** : fonction qui traite un signal (par défaut ou définie par l'utilisateur).
- **Thread cancellation** : arrêter un thread avant la fin ; le thread visé s'appelle **target thread**.
- **Asynchronous cancellation** : arrêt immédiat.
- **Deferred cancellation** : le thread vérifie lui-même s'il doit s'arrêter (comportement par défaut).
- **Cancellation point** : endroit où un thread vérifie s'il doit s'arrêter (`pthread_testcancel()`).
- **Cleanup handler** : code exécuté quand un thread est annulé.
- **TLS (Thread-Local Storage)** : données propres à chaque thread, visibles d'une fonction à l'autre.
- **LWP (Lightweight Process)** : « processeur virtuel » intermédiaire entre les threads user et kernel.
- **Scheduler activations / Upcall** : le noyau prévient la bibliothèque de threads d'un événement.

### Exemples d'OS
- **Windows thread context** : registres, piles user et kernel, zone de stockage privée.
- **ETHREAD / KTHREAD / TEB** : blocs de thread Windows (kernel / kernel / user space).
- **Task (Linux)** : nom que Linux donne aux threads et aux processus.
- **clone()** : system call Linux qui crée un thread, avec des options de partage.

---

## Semaine 6 – Ordonnancement CPU (ch. 5)

### Bases
- **CPU burst / I/O burst** : phase de calcul / phase d'attente d'entrée-sortie.
- **CPU scheduler** : choisit dans la ready queue le processus à exécuter.
- **Preemptive scheduling** : l'OS peut retirer le CPU à un processus en cours.
- **Non-preemptive scheduling** : le processus garde le CPU jusqu'à sa fin ou jusqu'à une attente.
- **Dispatcher** : donne le CPU au processus choisi (context switch, retour en user mode, saut dans le programme).
- **Dispatch latency** : temps pour arrêter un processus et en lancer un autre.

### Critères
- **CPU utilization** : pourcentage du temps où le CPU travaille (à maximiser).
- **Throughput** : nombre de processus terminés par unité de temps (à maximiser).
- **Turnaround time** : fin − arrivée (à minimiser).
- **Waiting time** : temps passé **dans la ready queue** (à minimiser).
- **Response time** : temps entre la requête et la **première** réponse (à minimiser).
- **Gantt chart** : frise chronologique qui montre quel processus tourne quand.

### Algorithmes
- **FCFS (First-Come, First-Served)** : premier arrivé, premier servi.
- **Convoy effect** : des processus courts bloqués derrière un processus long.
- **SJF (Shortest Job First)** : le processus le plus court passe en premier ; **optimal** pour le temps d'attente moyen.
- **Exponential averaging** : estimation du prochain burst à partir des précédents (α souvent = ½).
- **SRTF (Shortest Remaining Time First)** : version préemptive de SJF.
- **RR (Round Robin)** : chacun reçoit un **time quantum (q)** puis retourne en fin de file ; si q est très grand, RR devient FCFS.
- **Time quantum** : tranche de temps CPU (10 à 100 ms) ; aucun processus n'attend plus de (n−1)q.
- **Priority scheduling** : le CPU va au processus le plus prioritaire (**petit nombre = haute priorité**).
- **Starvation** : un processus peu prioritaire n'est jamais exécuté.
- **Aging** : augmenter la priorité d'un processus au fil de son attente.
- **Multilevel queue** : plusieurs files séparées (par priorité ou par type), chacune avec son algorithme.
- **Multilevel feedback queue (MLFQ)** : un processus peut changer de file selon son comportement.

### Threads et multiprocesseur
- **PCS (Process-Contention Scope)** : les threads d'un même processus se disputent le CPU.
- **SCS (System-Contention Scope)** : tous les threads du système se disputent le CPU.
- **PTHREAD_SCOPE_PROCESS / PTHREAD_SCOPE_SYSTEM** : PCS / SCS (Linux et macOS : SYSTEM uniquement).
- **Multithreaded core / Hardware thread** : un cœur qui exécute plusieurs threads matériels.
- **Memory stall** : le CPU attend des données de la mémoire.
- **CMT (Chip Multithreading) / Hyperthreading** : plusieurs threads matériels par cœur ; 4 cœurs × 2 = 8 CPU logiques.
- **Heterogeneous multiprocessing** : cœurs de types différents (performance et économie).
- **Load balancing** : répartir la charge entre les CPU.
- **Push migration** : le CPU surchargé pousse des tâches vers les autres.
- **Pull migration** : un CPU inactif va chercher une tâche chez un CPU occupé.
- **Processor affinity** : un thread préfère rester sur le même CPU (son cache contient ses données).
- **Soft affinity / Hard affinity** : l'OS essaie sans garantie / le processus impose ses CPU.
- **NUMA-aware** : l'OS place la mémoire près du CPU qui l'utilise.

### Temps réel
- **Soft real-time** : tâches critiques prioritaires, mais sans garantie.
- **Hard real-time** : la deadline doit absolument être respectée.
- **Event latency** : temps entre un événement et son traitement.
- **Interrupt latency** : temps entre l'arrivée d'une interruption et le début de son traitement.
- **Periodic task (t, d, p)** : tâche répétée ; temps de calcul t, deadline d, période p, avec 0 ≤ t ≤ d ≤ p.
- **Rate Monotonic Scheduling** : priorité **fixe**, période courte = haute priorité.
- **EDF (Earliest Deadline First)** : priorité **dynamique**, deadline la plus proche = haute priorité.
- **Proportional share** : T parts réparties ; une application qui a N parts obtient N/T du CPU.
- **SCHED_FIFO / SCHED_RR / SCHED_OTHER** : temps réel FCFS sans découpage / temps réel avec découpage / politique normale.

### Exemples d'OS
- **O(1) scheduler** : ancien ordonnanceur Linux, avec deux tableaux (active et expired).
- **CFS (Completely Fair Scheduler)** : ordonnanceur Linux actuel ; il choisit la tâche au plus petit vruntime.
- **vruntime** : temps CPU virtuel consommé par une tâche.
- **nice value** : de −20 à +19 ; **plus bas = plus prioritaire** ; −20 → priorité globale 100, +19 → 139.
- **Target latency** : intervalle pendant lequel chaque tâche doit tourner au moins une fois.
- **Scheduling domain** : groupe de cœurs entre lesquels Linux équilibre la charge.

### Évaluation
- **Deterministic modeling** : comparer les algorithmes sur une charge fixe.
- **Queueing models** : modèles probabilistes des arrivées et des bursts.
- **Little's formula (n = λ × W)** : longueur de la file = taux d'arrivée × temps d'attente moyen.
- **Simulation** : modèle programmé du système pour mesurer les performances.
- **Trace tape** : enregistrement d'événements réels utilisé pour une simulation.

---

## Labs Linux (semaines 3 à 6)

### Fichiers et arborescence
- **/ (root directory)** : racine de toute l'arborescence.
- **/etc** : fichiers de configuration.
- **/var** : données variables (logs dans `/var/log`).
- **/home** : dossiers personnels des utilisateurs.
- **/root** : dossier personnel de root.
- **/tmp** : fichiers temporaires, supprimés automatiquement.
- **/boot** : fichiers de démarrage.
- **/dev** : périphériques vus comme des fichiers (`/dev/sda`).
- **/usr/bin / /usr/sbin** : commandes utilisateur / commandes d'administration.
- **/run** : données d'exécution depuis le dernier démarrage.
- **/proc** : faux système de fichiers en RAM qui montre les infos du noyau.
- **Everything is a file** : principe Linux, tout est représenté comme un fichier.
- **touch / mkdir -p** : créer un fichier vide / créer des dossiers avec leurs parents.
- **cp -r / mv / rm -r / rmdir** : copier un dossier / déplacer ou renommer / supprimer un dossier plein / supprimer un dossier vide.

### Permissions et utilisateurs
- **r / w / x** : lecture (4) / écriture (2) / exécution (1).
- **u / g / o / a** : propriétaire / groupe / autres / tout le monde.
- **chmod** : changer les permissions (`chmod 750`, `chmod g+w`).
- **chown** : changer le propriétaire (`chown user:group f`) ; seul root peut le faire.
- **UID / GID** : numéro d'utilisateur / de groupe.
- **Primary group** : groupe principal d'un utilisateur (un seul).
- **User Private Group (UPG)** : groupe créé avec le même nom que l'utilisateur.
- **/etc/passwd / /etc/group** : liste des utilisateurs / des groupes.
- **root / superuser** : administrateur avec tous les droits.
- **sudo** : exécuter une commande en tant que root.
- **su / su -** : changer d'utilisateur / avec un shell de connexion complet.
- **id** : affiche UID, GID et groupes.

### Entrées-sorties
- **File descriptor** : numéro d'un canal d'entrée-sortie.
- **stdin (0) / stdout (1) / stderr (2)** : entrée / sortie normale / sortie d'erreurs.
- **`>` / `>>`** : rediriger en écrasant / en ajoutant.
- **`2>` / `2>/dev/null`** : rediriger les erreurs / les jeter.
- **`&>` ou `2>&1`** : rediriger sortie et erreurs ensemble.
- **/dev/null** : « poubelle » qui avale tout.
- **Pipe (`|`)** : la sortie d'une commande devient l'entrée de la suivante.
- **tee** : écrit à la fois dans un fichier et vers la sortie.

### Processus et signaux
- **PPID** : PID du processus parent.
- **systemd (PID 1)** : premier processus, ancêtre de tous les autres.
- **R / S / D / T / Z** : running / sleeping / attente non interruptible / stopped / zombie.
- **ps aux** : liste tous les processus (style BSD, différent de `ps -aux`).
- **top / htop** : moniteur de processus en temps réel.
- **Signal** : message envoyé par l'OS à un processus.
- **SIGINT (2)** : Ctrl+C, demande l'arrêt.
- **SIGTSTP** : Ctrl+Z, met en pause.
- **SIGTERM (15)** : `kill PID`, arrêt poli.
- **SIGKILL (9)** : `kill -9 PID`, arrêt forcé, impossible à ignorer.
- **Foreground / Background job** : au premier plan / en arrière-plan (`&`).
- **bg / fg** : reprendre un job en arrière-plan / le ramener au premier plan.
- **nice / renice** : régler la priorité d'un processus.

### Services, planification et monitoring
- **Daemon** : service en arrière-plan, nom souvent terminé par « d » (`sshd`).
- **systemctl start / stop** : démarrer / arrêter un service maintenant.
- **systemctl enable / disable** : lancer / ne pas lancer le service au démarrage.
- **systemctl status / reload** : état du service / recharger sa configuration.
- **cron / crontab** : planificateur de tâches / sa table (`min heure jour mois jour_semaine`).
- **uptime** : temps de fonctionnement et load average.
- **Load average** : nombre moyen de processus qui veulent le CPU (sur 1, 5 et 15 min) ; à lire par cœur.
- **free -h** : utilisation de la mémoire et du swap.
- **Swap space** : partie du disque utilisée comme RAM de secours.
- **Thrashing** : la machine passe son temps à échanger entre RAM et swap ; elle devient très lente.
- **df -h / iostat** : espace disque / vitesses de lecture et d'écriture.
- **-h (human-readable)** : affiche les tailles en Go, Mo, etc.

### Scripts et paquets
- **Shebang (`#!/bin/bash`)** : première ligne qui indique l'interpréteur du script.
- **chmod +x** : rendre un script exécutable.
- **bash -x** : exécuter un script en mode débogage.
- **APT** : gestionnaire de paquets d'Ubuntu.
- **apt update / apt upgrade / apt install** : mettre à jour la liste des paquets / mettre à jour les paquets installés / installer un paquet.
- **grep / wc** : chercher du texte / compter lignes, mots et caractères.
- **ping / wget / scp** : tester une connexion / télécharger / copier vers une machine distante.
- **PuTTY / WinSCP** : client SSH Windows / transfert de fichiers vers un serveur.
