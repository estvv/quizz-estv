# Operating System — Week 3

Chapter 2 — *Operating-System Structures* (Silberschatz, Galvin & Gagne, 10th
ed.). Services, user interfaces, system calls, system programs, linkers and
loaders, design and implementation, the ways an OS is structured (monolithic,
layered, microkernel, modules, hybrid), building and booting, debugging.

---

## 1. Operating-system services

An OS provides an **environment for the execution of programs** and services
to programs and users.

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

One set of services provides functions that are **helpful to the user**:

| Service | What it does |
|---|---|
| **User interface (UI)** | almost all OSes have one: command-line (**CLI**), graphical (**GUI**), touch-screen, or batch |
| **Program execution** | load a program into memory and run it; end execution normally or abnormally (indicating an error) |
| **I/O operations** | a running program may require I/O on a file or an I/O device |
| **File-system manipulation** | read and write files and directories, create and delete them, search, list information, manage permissions |
| **Communications** | processes exchange information, on the same computer or over a network — via **shared memory** or **message passing** (packets moved by the OS) |
| **Error detection** | the OS is constantly aware of possible errors (CPU and memory hardware, I/O devices, user program) and takes the appropriate action; debugging facilities help users and programmers |

Another set exists for the **efficient operation of the system itself** via
resource sharing:

| Service | What it does |
|---|---|
| **Resource allocation** | when multiple users or jobs run concurrently, resources must be allocated to each: CPU cycles, main memory, file storage, I/O devices |
| **Logging** | keep track of which users use how much and what kinds of resources |
| **Protection and security** | owners of information may want to control its use; concurrent processes should not interfere. **Protection**: all access to system resources is controlled. **Security** from outsiders: user authentication, defending external I/O devices from invalid access |

## 2. User – operating-system interface

- **Command-line interpreter (CLI)**: allows direct command entry. Sometimes
  implemented in the kernel, sometimes by a system program; sometimes several
  flavours — **shells**. It primarily **fetches a command from the user and
  executes it**. Some commands are **built in**, others are just the **names of
  programs** — in that case adding a feature needs no shell modification.
- **GUI**: user-friendly **desktop metaphor** (mouse, keyboard, monitor);
  **icons** represent files, programs, actions; mouse buttons over objects
  trigger actions (information, options, execute, open a directory — a
  *folder*). Invented at **Xerox PARC**. Many systems have both: Windows is a
  GUI with a CLI "command" shell; macOS is the "Aqua" GUI over a UNIX kernel
  with shells available; UNIX/Linux are CLI with optional GUIs (CDE, KDE,
  GNOME).
- **Touchscreen** interfaces: mouse not possible or not desired; actions and
  selection based on **gestures**; virtual keyboard; voice commands.

## 3. System calls

A **system call** is the **programming interface to the services provided by
the OS**, typically written in a high-level language (C or C++). Programs
mostly use a high-level **API** (Application Programming Interface) rather than
direct system calls. The three most common APIs: **Win32 API** (Windows),
**POSIX API** (virtually all UNIX, Linux, macOS), **Java API** (the JVM).

Example — the system-call sequence to **copy one file to another**:

1. acquire the input file name, acquire the output file name (write prompts,
   accept input — or select from a GUI);
2. open the input file (if it does not exist → abort); create the output file
   (if it exists → abort or ask);
3. loop: read from the input file, write to the output file — until read
   fails;
4. close the output file, write a completion message, terminate normally.

Even a tiny program is a long sequence of system calls.

### Implementation

Typically **a number is associated with each system call**; the **system-call
interface** maintains a **table indexed by these numbers**, invokes the intended
call in the kernel and returns its status and any return values. The caller
needs to know nothing about how the call is implemented — just obey the API.
Most details are hidden by the API and managed by the **run-time support
library** (functions built into the libraries shipped with the compiler).

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

The standard C library is the usual middleman: a C program calling `printf()`
invokes the library, which calls the `write()` system call.

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

### Parameter passing

Often more information is required than just the identity of the system call
(type and amount vary by OS and call). Three general methods:

| Method | How | Note |
|---|---|---|
| **Registers** | pass the parameters in CPU registers | simplest; there may be more parameters than registers |
| **Block / table** | store the parameters in a block in memory, pass the **address** of the block in a register | approach of **Linux and Solaris** |
| **Stack** | the program **pushes** the parameters onto the stack, the OS **pops** them off | |

Block and stack methods **do not limit the number or length** of the
parameters.

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

### Types of system calls

| Category | Examples |
|---|---|
| **Process control** | create / terminate process; end, abort; load, execute; get / set process attributes; wait for time; wait event, signal event; allocate and free memory; dump memory on error; debugger (single step); locks for shared data |
| **File management** | create / delete file; open, close; read, write, reposition; get / set file attributes |
| **Device management** | request / release device; read, write, reposition; get / set device attributes; logically attach or detach devices |
| **Information maintenance** | get / set time or date, system data; get / set process, file or device attributes |
| **Communications** | create / delete communication connection; send / receive messages (message-passing model: from client to server); shared-memory model: create and gain access to memory regions; transfer status information; attach / detach remote devices |
| **Protection** | control access to resources; get / set permissions; allow / deny user access |

### Two examples

- **Arduino** — single-tasking, **no operating system**. Programs (*sketches*)
  are loaded via USB into flash memory; single memory space; a **boot loader**
  loads the program; at program exit the shell is reloaded.
- **FreeBSD** — UNIX variant, multitasking. User login → invoke the user's
  shell. The shell executes the **`fork()`** system call to create a process,
  then **`exec()`** to load the program into it; the shell **waits** for the
  process to terminate or continues with user commands. The process exits with
  code **0** (no error) or **> 0** (error code).

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

## 4. System services (system programs)

**System programs** provide a convenient environment for program development
and execution. Most users' view of the OS is defined by **system programs, not
by the actual system calls**. Some are simple interfaces to system calls, others
are considerably more complex.

| Category | Content |
|---|---|
| **File management** | create, delete, copy, rename, print, dump, list and generally manipulate files and directories |
| **Status information** | date, time, available memory, disk space, number of users; detailed performance, logging and debugging information; some systems keep a **registry** for configuration |
| **File modification** | text editors; commands to search file contents or transform text |
| **Programming-language support** | compilers, assemblers, debuggers, interpreters |
| **Program loading and execution** | absolute loaders, relocatable loaders, linkage editors, overlay loaders; debugging systems |
| **Communications** | virtual connections among processes, users and computer systems: messages to another's screen, browsing, e-mail, remote login, file transfer |
| **Background services** | launched at boot time (some terminate after startup, some run until shutdown); disk checking, process scheduling, error logging, printing. Run in **user context**, not kernel context. Known as **services, subsystems, daemons** |
| **Application programs** | do not pertain to the system; run by users; not considered part of the OS; launched by command line, mouse click, finger poke |

## 5. Linkers and loaders

Source code is compiled into **object files** designed to be loaded into any
physical memory location — **relocatable object files**. The **linker**
combines them into a single **binary executable** file, also bringing in
**libraries**. The program resides on secondary storage as a binary executable
and must be brought into memory by the **loader** to be executed;
**relocation** assigns final addresses to the program parts and adjusts code and
data to match. Modern systems do not link libraries into executables: they use
**dynamically linked libraries** (**DLLs** on Windows), loaded as needed and
**shared** by all programs using the same version (loaded once). Object and
executable files have **standard formats** (ELF on Linux), so the OS knows how
to load and start them.

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

### Why applications are operating-system specific

Apps compiled on one system are usually not executable on other OSes: each OS
provides its **own unique system calls**, file formats, etc. An app can be
multi-OS if it is written in an **interpreted** language with an interpreter
available on each OS (Python, Ruby), if it runs in a **VM** shipped with the
language (Java), or if it is written in a standard language (C) and
**compiled separately** on each OS. The **Application Binary Interface (ABI)**
is the architecture-level equivalent of the API: it defines how the components
of binary code interface for a given OS on a given architecture and CPU.

## 6. Design and implementation

Designing an OS is not "solvable", but some approaches have proven
successful. Start by defining **goals and specifications**, affected by the
choice of hardware and type of system. **User goals**: convenient to use, easy
to learn, reliable, safe, fast. **System goals**: easy to design, implement and
maintain; flexible, reliable, error-free, efficient.

**Policy vs mechanism** — *policy*: **what** needs to be done (interrupt every
100 seconds); *mechanism*: **how** to do it (the timer). **Separating policy
from mechanism** is a very important principle: it gives maximum flexibility if
policy decisions change later (change 100 to 200 without touching the timer).

**Implementation**: early OSes in assembly, then system programming languages
(Algol, PL/1), now **C, C++** — usually a mix: lowest levels in assembly, main
body in C, system programs in C, C++ and scripting languages (Perl, Python,
shell). A higher-level language is easier to **port** to other hardware, but
slower; **emulation** can run an OS on non-native hardware.

## 7. Operating-system structure

A general-purpose OS is a very large program. Ways to structure it: **simple**
(MS-DOS), **monolithic** (UNIX), **layered** (an abstraction), **microkernel**
(Mach), plus **modules** and **hybrids**.

### Monolithic structure — original UNIX

Limited by the hardware of its time, the original UNIX had limited
structuring: two separable parts, the **system programs** and the **kernel** —
everything **below the system-call interface and above the physical
hardware**, providing the file system, CPU scheduling, memory management and
other OS functions: a large number of functions for one level.

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

**Linux** is monolithic **plus modular**: applications call **glibc**, which
crosses the system-call interface into a kernel made of file systems, CPU
scheduler, networks, memory manager, block and character devices, device
drivers — with **loadable kernel modules** for dynamic loading.

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

### Layered approach

The OS is divided into a number of **layers (levels)**, each built on top of
lower layers. The bottom layer (**layer 0**) is the **hardware**; the highest
(**layer N**) is the **user interface**. With modularity, each layer uses the
functions and services **of lower-level layers only**.

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

### Microkernels

Move **as much as possible from the kernel into user space**. **Mach** is an
example; the macOS kernel (**Darwin**) is partly based on Mach. Communication
between user modules uses **message passing**.

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

| Benefits | Detriment |
|---|---|
| easier to **extend** a microkernel; easier to **port** the OS to new architectures; more **reliable** (less code runs in kernel mode); more **secure** | **performance overhead** of user-space ↔ kernel-space communication |

### Modules and hybrid systems

Many modern OSes implement **loadable kernel modules (LKMs)**: an
object-oriented approach where each core component is separate, talks to the
others over **known interfaces**, and is **loadable as needed** within the
kernel. Overall similar to layers but more flexible (Linux, Solaris).

Most modern OSes are **not one pure model** — **hybrid** systems combine
approaches for performance, security and usability:

| System | Structure |
|---|---|
| **Linux, Solaris** | kernel in kernel address space → **monolithic**, plus **modular** for dynamic loading |
| **Windows** | mostly **monolithic**, plus **microkernel** for the different subsystem *personalities* |
| **macOS / iOS** | **hybrid, layered**: Aqua UI + Cocoa; below, a kernel made of the **Mach microkernel** and **BSD UNIX** parts, plus the I/O kit and dynamically loadable modules (**kernel extensions**) |
| **Android** | based on a modified **Linux kernel** (process, memory, device-driver management + power management); runtime with core libraries and the **Dalvik / ART** VM; apps in Java + Android API, compiled to bytecode then to an executable for the VM; libraries: webkit, SQLite, multimedia, a smaller libc (Bionic) |

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

### The five strategies side by side

| Strategy | Idea | Pros | Cons | Example |
|---|---|---|---|---|
| **Monolithic** | one large kernel, everything below the system-call interface | fast (no boundary crossings) | hard to extend, a bug anywhere crashes all | original UNIX, Linux core |
| **Layered** | layers 0…N, each uses only lower layers | modular, easy to debug layer by layer | hard to define layers, overhead of traversing them | THE, early designs |
| **Microkernel** | minimum in the kernel (IPC, memory, scheduling); services in user space, message passing | extensible, portable, reliable, secure | message-passing performance overhead | Mach, Darwin (partly) |
| **Modules** | separate loadable components with known interfaces | flexible, load on demand | still kernel-mode code | Linux LKMs, Solaris |
| **Hybrid** | mix of the above | pragmatic balance of performance / security / usability | no pure model | Windows, macOS, Android |

## 8. Building and booting an operating system

OSes are designed to run on a **class of systems** with a variety of
peripherals; commonly the OS is already installed on the purchased computer.
Generating one from scratch: **write** the source, **configure** it for the
target system, **compile**, **install**, **boot**.

**Building Linux**: download the source from kernel.org → `make menuconfig`
(configure) → `make` (compile — produces **vmlinuz**, the kernel image) →
`make modules` (compile the modules) → `make modules_install` (install them
into vmlinuz) → `make install` (install the new kernel).

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

- Power on: execution starts at a **fixed memory location**.
- A small piece of code — the **bootstrap loader** (BIOS), stored in **ROM or
  EEPROM** — locates the kernel, loads it into memory and starts it. Sometimes a
  **two-step** process: a **boot block** at a fixed location is loaded by the
  ROM code and loads the bootstrap loader from disk.
- Modern systems replace BIOS with **UEFI** (Unified Extensible Firmware
  Interface).
- **GRUB** is a common bootstrap loader: it allows selecting the kernel from
  multiple disks, versions and kernel options; boot loaders often offer boot
  states such as **single-user mode**.
- The kernel loads and the system is running.

## 9. Operating-system debugging

**Debugging** = finding and fixing errors (bugs) — also **performance tuning**.
The OS generates **log files** with error information; a failing application
produces a **core dump** (the process memory), a failing OS a **crash dump**
(kernel memory). Performance tuning removes bottlenecks, using **trace
listings** and **profiling** (periodic sampling of the instruction pointer);
the OS must provide measures of system behaviour (`top`, Windows Task Manager).

**Tracing** tools collect data for a specific event: **strace** (system calls
of a process), **gdb** (source-level debugger), **perf** (Linux performance
tools), **tcpdump** (network packets). **BCC** (BPF Compiler Collection) is a
rich toolkit for tracing Linux interactions between user-level and kernel code
(e.g. `disksnoop.py` traces disk I/O) — successor to DTrace.

> **Kernighan's law**: "Debugging is twice as hard as writing the code in the
> first place. Therefore, if you write the code as cleverly as possible, you
> are, by definition, not smart enough to debug it."

---

## To remember

- Services for the user: UI, program execution, I/O, file system,
  communication (shared memory / message passing), error detection. For the
  system: resource allocation, logging, protection & security.
- UI: CLI / shells (built-in vs program-name commands), GUI (Xerox PARC),
  touchscreen.
- **System call** = programming interface to OS services, reached through an
  **API** (Win32, POSIX, Java); number → **system-call table**; hidden by the
  run-time support library. Parameters via **registers**, **block/table**
  (Linux, Solaris) or **stack**. Six categories: process control, file, device,
  information maintenance, communications, protection.
- `printf()` → C library → `write()`. FreeBSD shell: `fork()` then `exec()`,
  exit code 0 = OK. Arduino: no OS, boot loader + one sketch.
- **System programs** define the user's view of the OS; daemons run in user
  context.
- Compiler → relocatable **object file** → **linker** (+ libraries) →
  **executable** → **loader** (relocation) → memory; **DLLs** loaded once,
  shared. Apps are OS-specific because of system calls and file formats; the
  **ABI** is the binary-level API.
- Design: user goals vs system goals; **separate policy (what) from mechanism
  (how)**.
- Structures: **monolithic** (UNIX), **layered** (0 = hardware, N = UI),
  **microkernel** (Mach: message passing, extensible/portable/reliable/secure
  but slower), **modules** (LKMs), **hybrid** (Linux, Windows, macOS = Mach +
  BSD, Android = Linux + ART).
- Boot: fixed address → BIOS/UEFI in ROM → (boot block) → **GRUB** → kernel
  (vmlinuz) → daemons. Build Linux: `make menuconfig`, `make`,
  `make modules`, `make modules_install`, `make install`.
- Debugging: logs, core dump vs crash dump, profiling; strace, gdb, perf,
  tcpdump, BCC/BPF.
