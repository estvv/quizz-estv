# Operating System — Week 1

Chapter 1 — *Introduction* (Silberschatz, Galvin & Gagne, 10th ed.). What an
OS does, computer-system organization and interrupts, storage, operating-system
operations, the main OS functions, protection and security, virtualization,
architectures and computing environments, kernel data structures.

---

## 1. What is an operating system?

An OS is a **program that acts as an intermediary between the user and the
hardware**. Its three goals: **execute user programs** and make solving user
problems easier, make the computer **convenient to use**, and use the hardware
in an **efficient** manner.

A computer system has **four components**: the hardware (CPU, memory, I/O
devices), the operating system, the application programs, and the users.

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

- **Hardware** provides the basic computing resources.
- The **operating system** controls and coordinates the use of the hardware
  among the various applications and users.
- **Application programs** define the ways the resources are used to solve the
  users' computing problems (word processors, compilers, browsers, databases,
  video games).
- **Users**: people, machines, other computers.

There is **no universally accepted definition**. Two useful approximations:

- *everything a vendor ships when you order an operating system*;
- the **kernel** is *the one program running at all times on the computer*.

Everything else is either a **system program** (ships with the OS but is not part
of the kernel) or an **application program**. Modern OSes also add
**middleware**: software frameworks that give application developers extra
services such as databases, multimedia and graphics.

Point of view matters: users want convenience, ease of use and performance and
don't care about resource utilization; on a shared machine (mainframe,
minicomputer) the OS is a **resource allocator and control program** that must
keep all users happy. Workstation users have dedicated resources but use shared
servers. Mobile devices are resource-poor and optimized for **usability and
battery life** (touch screens, voice recognition). Embedded computers (devices,
cars) have little or no user interface and run without user intervention.

## 2. Computer-system organization and interrupts

One or more CPUs and the device controllers connect through a **common bus**
providing access to **shared memory**, and execute **concurrently**, competing
for memory cycles.

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

- I/O devices and the CPU can execute **concurrently**.
- Each **device controller** is in charge of a particular device type and has a
  **local buffer**; each controller type has an OS **device driver** to manage
  it, which gives the kernel a uniform interface.
- The CPU moves data from/to main memory to/from the local buffers; I/O goes
  from the device to the controller's local buffer.
- The controller informs the CPU that it has finished its operation by
  **causing an interrupt**.

### Interrupts

- An interrupt **transfers control to the interrupt service routine**,
  generally through the **interrupt vector**, which contains the addresses of
  all the service routines.
- The interrupt architecture must **save the address of the interrupted
  instruction**; the OS preserves the CPU state by storing the **registers and
  the program counter**, determines which type of interrupt occurred, and runs
  the segment of code for that type.
- A **trap** or **exception** is a *software*-generated interrupt caused either
  by an **error** (division by zero) or by a **user request** (a system call).

**An operating system is interrupt driven.**

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

### I/O structure

Two methods after an I/O starts:

- **synchronous**: control returns to the user program only **upon I/O
  completion**. A `wait` instruction idles the CPU until the next interrupt
  (or a wait loop contends for memory access); at most **one I/O request** is
  outstanding at a time, no simultaneous I/O processing.
- **asynchronous**: control returns **without waiting** for completion. A
  **system call** lets the program request to wait for completion, and the
  **device-status table** keeps an entry per device (type, address, state); the
  OS indexes into it to determine the device status and records the interrupt.

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

**DMA** (Direct Memory Access) is for high-speed devices able to transmit close
to memory speed: the controller transfers **whole blocks** from its buffer
straight into main memory **without CPU intervention**, generating **one
interrupt per block** instead of one per byte.

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

## 3. Storage

**Main memory** is the only large storage media the CPU can access directly:
**random access**, typically **volatile**, built as **DRAM**. **Secondary
storage** extends it: large **nonvolatile** capacity.

- **Hard disk drives (HDD)**: rigid metal or glass platters covered with
  magnetic recording material. The surface is logically divided into
  **tracks**, subdivided into **sectors**; the **disk controller** determines
  the logical interaction between the device and the computer.
- **Non-volatile memory (NVM)**: faster than hard disks, nonvolatile; various
  technologies, more popular as capacity and performance grow and prices drop.

### Units

The basic unit of storage is the **bit** (0 or 1). A **byte** is 8 bits — the
smallest convenient chunk (most computers have no instruction to move a bit,
but one to move a byte). A **word** is a given architecture's native unit of
data, one or more bytes (64-bit registers → 8-byte words); a computer executes
many operations in its native word size.

1 KB = **1,024** bytes, 1 MB = 1,024², 1 GB = 1,024³, 1 TB = 1,024⁴,
1 PB = 1,024⁵ (manufacturers round: a megabyte ≈ 1 million bytes).
**Exception: networking is measured in bits**, because networks move data one
bit at a time.

### Storage hierarchy

Storage systems are organized in a hierarchy by **speed, cost and
volatility**.

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

Movement between levels can be explicit or implicit. **Caching** copies
information in use from slower to faster storage temporarily: the cache is
checked first; if the information is there it is used directly (fast),
otherwise it is copied into the cache and used there. Main memory can be viewed
as a cache for secondary storage. A cache is **smaller** than what it caches,
hence two design problems: **its size and its replacement policy**.

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

In a **multitasking** environment the system must use the **most recent
value**, wherever it is stored. On a **multiprocessor** the hardware must
provide **cache coherency** so that all CPUs have the most recent value in
their cache. In a **distributed** environment several copies of a datum can
exist — even more complex.

## 4. Operating-system operations

At start-up the **bootstrap program** (simple code) initializes the system and
loads the **kernel**; the kernel then starts the **system daemons** (services
provided outside the kernel). The kernel is **interrupt driven**: hardware
interrupts from devices, software interrupts (**exception** or **trap**) for a
software error (division by zero), a request for OS service (**system call**),
or other process problems (infinite loop, processes modifying each other or the
OS).

- **Multiprogramming (batch system)**: a single user cannot keep the CPU and
  I/O devices busy, so several **jobs** (code and data) are kept in memory and
  the CPU always has one to execute. One job is selected via **job
  scheduling**; when it has to wait (for I/O), the OS switches to another.
- **Multitasking (timesharing)**: a logical extension of batch — the CPU
  switches jobs so frequently that users can **interact** with each job while
  it runs. Response time should be **< 1 second**; each user has at least one
  program in memory (a **process**); several ready jobs → **CPU scheduling**;
  if processes don't fit in memory, **swapping** moves them in and out; **virtual
  memory** allows executing processes not completely in memory.

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

### Hardware protection

**Dual-mode operation** allows the OS to protect itself and the other system
components: **user mode** and **kernel mode**. A **mode bit** provided by the
hardware tells whether the system is running user code or kernel code. The
user cannot set the mode bit to "kernel" themselves: a **system call** changes
the mode to kernel, and the **return** from the call resets it to user. Some
instructions are **privileged**, executable only in kernel mode.

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

A **timer** prevents an infinite loop or a process hogging resources: the timer
is set to interrupt the computer after some period — a counter decremented by
the physical clock, set by the OS (a **privileged** instruction); when it
reaches zero it generates an interrupt. It is set up before scheduling a
process, to regain control or terminate a program that exceeds its allotted
time.

## 5. The main OS functions

- **Process management**: a process is a **program in execution**, a unit of
  work within the system. The program is a **passive** entity, the process an
  **active** one. A process needs resources (CPU, memory, I/O, files,
  initialization data); termination requires reclaiming them. A
  single-threaded process has **one program counter**; a multi-threaded one
  has **one per thread**. Many processes run concurrently on one or more CPUs
  by **multiplexing** the CPUs among them. Activities: creating and deleting
  user and system processes; suspending and resuming; mechanisms for
  **synchronization**, **communication** and **deadlock handling**.
- **Memory management**: all (or part) of a program's instructions and data
  must be in memory to execute. It determines **what is in memory and when**,
  optimizing CPU utilization and response: keeping track of which parts of
  memory are used and by whom, deciding which processes and data to move in
  and out, allocating and deallocating space.
- **File-system management**: a uniform, logical view of information storage —
  the **file** abstracts the physical properties of the medium (each medium,
  disk or tape, has its own speed, capacity, transfer rate, sequential or random
  access). Files are organized in **directories** with access control;
  activities: create/delete files and directories, primitives to manipulate
  them, map files onto secondary storage, back up onto stable media.
- **Mass-storage management**: disks hold what does not fit in main memory or
  must be kept for a long period; the entire speed of the computer hinges on
  the disk subsystem. Activities: mounting/unmounting, **free-space
  management**, storage allocation, **disk scheduling**, partitioning,
  protection.
- **I/O subsystem**: hides the peculiarities of hardware devices from the user.
  Responsible for memory management of I/O — **buffering** (storing data
  temporarily while it is transferred), **caching** (parts of data in faster
  storage), **spooling** (overlapping the output of one job with the input of
  others) — plus a general device-driver interface and the drivers for specific
  devices.

## 6. Protection, security, virtualization

**Protection** = any mechanism for controlling the access of processes or users
to the resources defined by the OS. **Security** = defense of the system
against internal and external attacks (denial-of-service, worms, viruses,
identity theft, theft of service). Systems first distinguish users: a **user
ID** (name + number, one per user) is associated with all the user's files and
processes to determine access control; a **group ID** defines a set of users
with shared controls; **privilege escalation** lets a user change to an
effective ID with more rights.

**Virtualization** allows operating systems to run applications within other
OSes — a vast and growing industry. **Emulation** is used when the source CPU
type differs from the target (PowerPC to Intel x86) — generally the **slowest**
method (a language not compiled to native code is *interpreted*).
Virtualization proper: an OS natively compiled for the CPU running **guest**
OSes also natively compiled (VMware running Windows XP guests on a Windows XP
host). The **VMM** (virtual machine manager) provides the virtualization
services; it can also run natively, being then itself the host (VMware ESX,
Citrix XenServer — no general-purpose host OS).

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

Use cases: a laptop running macOS as host and Windows as guest, developing or
QA-testing apps for multiple OSes without multiple machines, executing and
managing compute environments within data centers.

**Distributed systems**: a collection of separate, possibly heterogeneous,
systems networked together. The network is a communications path — **TCP/IP**
most common — sized as **LAN**, **WAN**, **MAN**, **PAN**. A **network operating
system** provides features between systems across the network (message
exchange, the illusion of a single system).

## 7. Computer-system architecture

Most systems use a **single general-purpose processor** (plus special-purpose
ones). **Multiprocessor** systems — also called **parallel** or
**tightly-coupled** systems — bring three advantages: **increased throughput,
economy of scale, increased reliability** (graceful degradation / fault
tolerance). Two types: **asymmetric multiprocessing** (each processor is
assigned a specific task) and **symmetric multiprocessing (SMP)** (each
processor performs all tasks).

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

**Multicore**: several computing cores on one chip (each core has its CPU,
registers and L1 cache; the L2 cache is shared), as opposed to multi-chip
systems; a **chassis** can even contain multiple separate systems.

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

**NUMA** (non-uniform memory access): each CPU has its own local memory,
reachable fast; accessing another CPU's memory goes through the interconnect
and is slower — the memory-access time **varies by bank**.

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

**Clustered systems**: like multiprocessors, but **multiple systems** working
together, usually sharing storage via a **storage-area network (SAN)**. They
provide a **high-availability** service that survives failures: **asymmetric
clustering** keeps one machine in **hot-standby**, **symmetric clustering** has
multiple nodes running applications and monitoring each other. Some clusters
target **high-performance computing (HPC)** — applications must be written to
use **parallelization** — and some use a **distributed lock manager (DLM)** to
avoid conflicting operations.

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

## 8. Computing environments

- **Traditional**: stand-alone general-purpose machines, now blurred since most
  systems interconnect (the Internet). **Portals** provide web access to
  internal systems; **network computers (thin clients)** are like web
  terminals; mobile computers interconnect via wireless; even home systems use
  **firewalls**.
- **Mobile**: handheld smartphones, tablets. Extra OS features (GPS,
  gyroscope) allow new app types like augmented reality; connectivity via
  IEEE 802.11 wireless or cellular data. Leaders: Apple iOS and Google Android.
- **Client-server**: dumb terminals supplanted by smart PCs; many systems are
  now **servers** responding to requests from **clients**. A **compute-server**
  system provides an interface to request services (a database); a
  **file-server** system provides an interface to store and retrieve files.
- **Peer-to-peer**: another distributed model with **no distinction between
  clients and servers** — all nodes are peers, each may act as client, server
  or both. A node joins the network by registering its service with a
  **central lookup service**, or by **broadcasting** a request and answering
  through a **discovery protocol**. Examples: Napster, Gnutella, VoIP (Skype).

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

- **Cloud computing**: delivers computing, storage, even apps **as a service
  across a network**; a logical extension of virtualization, which it uses as
  its base (Amazon EC2: thousands of servers, millions of VMs, petabytes of
  storage, pay per usage). Types: **public** cloud (anyone willing to pay),
  **private** (a company for its own use), **hybrid**; by layer **SaaS** (an
  application via the Internet — a word processor), **PaaS** (a software stack
  ready for application use — a database server), **IaaS** (servers or storage
  over the Internet — backup storage). A cloud environment = traditional OSes +
  VMMs + cloud management tools; Internet connectivity requires **firewalls**;
  **load balancers** spread traffic across applications.

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

- **Real-time embedded systems**: the most prevalent form of computers — vary
  considerably, special purpose, limited-purpose OS or real-time OS. A
  **real-time OS** has **well-defined fixed time constraints**: processing must
  be done within the constraint, correct operation **only if constraints are
  met**.

## 9. Free and open-source OS, kernel data structures

An **open-source** OS is available in **source-code** format rather than just
binary, closed-source and proprietary — counter to copy protection and **DRM**.
Started by the **Free Software Foundation (FSF)** with its **copyleft GNU
Public License (GPL)** (free software and open-source software are two
different ideas). Examples: **GNU/Linux**, **BSD UNIX** (core of macOS). A VMM
(VMware Player, VirtualBox) lets you run guest OSes for exploration.

Kernel data structures are similar to standard programming data structures:

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

- **Bitmap**: a string of *n* binary digits representing the status of *n*
  items (free / used blocks, for instance).
- Linux defines these in include files: `<linux/list.h>`, `<linux/kfifo.h>`,
  `<linux/rbtree.h>`.

---

## To remember

- OS = intermediary between user and hardware; the **kernel** is the one
  program always running; system programs, applications and middleware sit
  above it. Four components: hardware, OS, applications, users.
- CPUs and controllers share a **bus** to memory; each controller has a local
  buffer and a **driver**; it signals completion with an **interrupt** routed
  through the **interrupt vector**. Trap/exception = software interrupt. The OS
  is **interrupt driven**. **DMA** = one interrupt per block.
- Storage hierarchy by speed/cost/volatility: registers → cache → main memory
  (volatile) → NVM → HDD → optical → tape. **Caching** at every level; cache
  coherency on multiprocessors. Units: 1 KB = 1,024 B; networks count in bits.
- Boot: bootstrap → kernel → daemons. **Multiprogramming** keeps the CPU busy,
  **timesharing** adds interactivity (< 1 s), swapping and virtual memory.
- **Dual mode**: mode bit, system call → kernel, return → user; privileged
  instructions; **timer** against infinite loops.
- Process = program in execution (passive vs active), one PC per thread.
  Memory, file, mass-storage and I/O management (buffering, caching, spooling).
- Protection vs security; user ID, group ID, privilege escalation.
  Virtualization: emulation (slowest) vs native VMM; guests on a host.
- Multiprocessors: throughput, economy of scale, reliability; asymmetric vs
  **SMP**; multicore, **NUMA**; clusters over a SAN (asymmetric hot-standby vs
  symmetric), HPC, DLM.
- Environments: traditional, mobile, client-server (compute vs file server),
  P2P, cloud (public/private/hybrid, SaaS/PaaS/IaaS), real-time embedded.
- Open source: FSF, GPL, GNU/Linux, BSD. Kernel structures: linked lists,
  BST (O(n), O(lg n) balanced), hash map, bitmap.
