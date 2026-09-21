# Computer Programming — Week 1

Two lectures: (1) solving problems with a computer, from machine language to
high-level languages, the compilation chain, and the structure of a C program;
(2) the components of a computer, software types, and above all **algorithms and
flowcharts**.

---

## 1. From machine language to high-level languages

The processor only executes **machine code**: strings of 0s and 1s.
**Assembly** puts mnemonics on those instructions but stays tied to one
architecture. A **high-level language (HLL)** finally lets you write programs
that are **independent of a particular type of computer**: this is
**portability**.

```diagram
{
  "title": "The same function at three levels: high-level language, assembly, machine code.",
  "nodes": [
    { "id": "hll", "x": 250, "y": 40, "w": 380, "h": 40, "label": "int square(int num) { return num * num; }", "tone": "emerald", "filled": true, "size": 12 },
    { "id": "asm", "x": 250, "y": 130, "w": 380, "h": 40, "label": "push rbp · mov rbp, rsp · imul eax, edi, edi · pop rbp · ret", "tone": "amber", "filled": true, "size": 12 },
    { "id": "mc", "x": 250, "y": 220, "w": 380, "h": 40, "label": "0111000001101000101010010010010100…", "tone": "violet", "filled": true, "size": 12 },
    { "id": "l1", "x": 540, "y": 40, "shape": "text", "label": "high-level language\nportable", "size": 11 },
    { "id": "l2", "x": 540, "y": 130, "shape": "text", "label": "assembly\none architecture", "size": 11 },
    { "id": "l3", "x": 540, "y": 220, "shape": "text", "label": "machine code\nwhat the CPU runs", "size": 11 }
  ],
  "edges": [
    { "from": "hll", "to": "asm", "label": "compiler" },
    { "from": "asm", "to": "mc", "label": "assembler" }
  ]
}
```

Portability is aided by an **agreed standard** (for example **C99**). A
**compiler** (**gcc**, **icc**) translates the HLL program into executable
machine code.

## 2. Why C?

Because it **produces code that runs nearly as fast as assembly while still
being a high-level language**.

Cited uses: operating systems, compilers, assemblers, text editors, print
spoolers, network drivers, interpreters, utilities.

## 3. Executing a program

The full chain, from source code to results:

```diagram
{
  "title": "Executing a program: edit, compile, link, run.",
  "nodes": [
    { "id": "prog", "x": 60, "y": 40, "w": 100, "h": 36, "shape": "ellipse", "label": "programmer", "size": 12 },
    { "id": "ed", "x": 210, "y": 40, "w": 100, "h": 36, "label": "text editor", "tone": "amber", "filled": true, "size": 12 },
    { "id": "src", "x": 360, "y": 40, "w": 100, "h": 40, "shape": "note", "label": "source\n(.c)", "tone": "sky", "size": 12 },
    { "id": "cc", "x": 360, "y": 120, "w": 100, "h": 36, "label": "compiler", "tone": "amber", "filled": true, "size": 12 },
    { "id": "obj", "x": 360, "y": 200, "w": 100, "h": 40, "shape": "note", "label": "object\n(.o)", "tone": "sky", "size": 12 },
    { "id": "lib", "x": 160, "y": 280, "w": 100, "h": 36, "shape": "note", "label": "library", "tone": "neutral", "size": 12 },
    { "id": "ld", "x": 360, "y": 280, "w": 100, "h": 36, "label": "linker", "tone": "amber", "filled": true, "size": 12 },
    { "id": "exe", "x": 360, "y": 360, "w": 100, "h": 40, "shape": "note", "label": "executable", "tone": "emerald", "size": 12 },
    { "id": "run", "x": 360, "y": 440, "w": 100, "h": 36, "label": "runner", "tone": "amber", "filled": true, "size": 12 },
    { "id": "res", "x": 540, "y": 440, "w": 100, "h": 40, "shape": "note", "label": "results", "tone": "emerald", "size": 12 }
  ],
  "edges": [
    { "from": "prog", "to": "ed" }, { "from": "ed", "to": "src" }, { "from": "src", "to": "cc" }, { "from": "cc", "to": "obj" },
    { "from": "obj", "to": "ld" }, { "from": "lib", "to": "ld" }, { "from": "ld", "to": "exe" }, { "from": "exe", "to": "run" }, { "from": "run", "to": "res" }
  ]
}
```

Four stages: you **edit** the source; the **compiler** produces an **object**
file; the **linker** combines that object with the **libraries** to produce the
**executable**; the **runner** executes it.

## 4. A minimal C program

```c
#include <stdio.h>
main()
{
    printf("hello, world\n");
}
```

Output:

```
hello, world
```

- `#include <stdio.h>` is a **preprocessor directive**: it inserts the header of
  the standard input/output library, needed to use `printf`.
- `main()` is the **entry point**: execution begins there.
- **Braces** `{ }` delimit the body; every **statement** ends with a
  **semicolon**.
- `\n` is an **escape sequence**: a newline.

---

## 5. Components of a computer

A **computer** is an electronic device that performs **arithmetic and logical**
operations. Four blocks:

```diagram
{
  "title": "The four blocks of a computer: input devices, CPU (control unit, ALU, registers), main memory, output devices.",
  "groups": [
    { "x": 330, "y": 70, "w": 250, "h": 110, "label": "CPU (VLSI)", "tone": "amber" }
  ],
  "nodes": [
    { "id": "in", "x": 80, "y": 70, "w": 120, "h": 50, "label": "input devices\nkeyboard · mouse", "tone": "sky", "filled": true, "size": 12 },
    { "id": "cu", "x": 275, "y": 85, "w": 110, "h": 40, "label": "control unit\n(CU)", "tone": "amber", "filled": true, "size": 11 },
    { "id": "alu", "x": 395, "y": 85, "w": 100, "h": 40, "label": "ALU", "tone": "amber", "filled": true, "size": 11 },
    { "id": "reg", "x": 335, "y": 115, "shape": "text", "label": "registers (general · special purpose)", "size": 10 },
    { "id": "out", "x": 590, "y": 70, "w": 120, "h": 50, "label": "output devices\nmonitor", "tone": "emerald", "filled": true, "size": 12 },
    { "id": "mem", "x": 330, "y": 210, "w": 200, "h": 40, "label": "main memory", "tone": "violet", "filled": true },
    { "id": "mt", "x": 330, "y": 128, "shape": "text" }
  ],
  "edges": [
    { "from": "in", "to": "cu", "label": "data · instructions" },
    { "from": "alu", "to": "out", "label": "results" },
    { "from": "mem", "to": "mt", "arrow": "both", "label": "data bus · address bus" }
  ]
}
```

- **CPU**: a **VLSI** integrated circuit containing the **arithmetic and logic
  unit (ALU)**, the **control unit (CU)** and **registers** (general and
  special purpose). The **CU** generates the control signals; the **ALU** does
  the computation. The CPU talks to memory over the **data bus** and the
  **address bus**.
- **Input devices**: the user feeds data and instructions (keyboard, mouse).
- **Output devices**: the computer returns its results (monitor).

### Memory

```diagram
{
  "title": "Memory: primary (RAM, ROM) addressed directly by the CPU; secondary (disk, flash) as a data reservoir.",
  "nodes": [
    { "id": "m", "x": 300, "y": 30, "w": 120, "h": 36, "label": "Memory", "tone": "violet", "filled": true },
    { "id": "p", "x": 170, "y": 110, "w": 130, "h": 36, "label": "Primary", "tone": "amber", "filled": true },
    { "id": "s", "x": 450, "y": 110, "w": 220, "h": 50, "label": "Secondary\nhard disk · flash drives…", "tone": "sky", "filled": true, "size": 12 },
    { "id": "ram", "x": 100, "y": 200, "w": 120, "h": 50, "label": "RAM\n(volatile)", "size": 12 },
    { "id": "rom", "x": 250, "y": 200, "w": 120, "h": 50, "label": "ROM\n(non-volatile)", "size": 12 }
  ],
  "edges": [
    { "from": "m", "to": "p", "arrow": "none" }, { "from": "m", "to": "s", "arrow": "none" },
    { "from": "p", "to": "ram", "arrow": "none" }, { "from": "p", "to": "rom", "arrow": "none" }
  ]
}
```

- **Primary memory**: the CPU addresses it directly (data + address bus). **RAM**
  is **volatile** (current instructions and data); **ROM** is **non-volatile**.
- **Secondary memory**: large capacity, non-volatile, acts as a **data
  reservoir**.

## 6. Software

- **System software**: interacts with the hardware and manages resources —
  **operating system**, **loader**, **linker**, **translator**.
  OS: Linux, Windows, UNIX, macOS.
- **Translator**: turns an HLL program (C, C++, Java...) into machine language.
- **Linker**: links the object codes of the subroutines/functions into an
  executable.
- **Loader**: loads a program from secondary memory into primary memory so it
  can run.
- **Application software**: word processing, image editing, spreadsheet,
  database software...

---

## 7. Algorithms

An **algorithm** is a **finite set of unambiguous instructions** which, when
executed, performs a task correctly.

- It uses **English-like** statements, step by step.
- It has **no fixed writing style**.
- It must be **finite** and **unambiguous**.
- It is **independent of the programming language**.

**Example — average of three numbers:**

```
Step 0  START
Step 1  INPUT first number into A
Step 2  INPUT second number into B
Step 3  INPUT third number into C
Step 4  COMPUTE SUM = A + B + C
Step 5  COMPUTE AVG = SUM / 3
Step 6  DISPLAY AVG
Step 7  END
```

```flowchart
{
  "title": "Average of three numbers: a purely sequential (imperative) flowchart.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "START" },
    { "id": "a", "kind": "io", "label": "INPUT A" },
    { "id": "b", "kind": "io", "label": "INPUT B" },
    { "id": "c", "kind": "io", "label": "INPUT C" },
    { "id": "sum", "kind": "process", "label": "SUM = A + B + C" },
    { "id": "avg", "kind": "process", "label": "AVG = SUM / 3" },
    { "id": "d", "kind": "io", "label": "DISPLAY AVG" },
    { "id": "e", "kind": "end", "label": "END" }
  ],
  "edges": [
    { "from": "s", "to": "a" }, { "from": "a", "to": "b" }, { "from": "b", "to": "c" }, { "from": "c", "to": "sum" },
    { "from": "sum", "to": "avg" }, { "from": "avg", "to": "d" }, { "from": "d", "to": "e" }
  ]
}
```

**Example — maximum of two numbers (conditional):**

```
Step 0  START
Step 1  INPUT A
Step 2  INPUT B
Step 3  IF A > B THEN
            MAX = A
        ELSE
            MAX = B
        END IF
Step 4  DISPLAY MAX
Step 5  END
```

```flowchart
{
  "title": "Maximum of two numbers: the decision diamond has two exits, yes and no, that merge again before DISPLAY.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "START" },
    { "id": "in", "kind": "io", "label": "INPUT A, B" },
    { "id": "d", "kind": "decision", "label": "Is A > B ?" },
    { "id": "ma", "kind": "process", "label": "MAX = A" },
    { "id": "mb", "kind": "process", "label": "MAX = B" },
    { "id": "out", "kind": "io", "label": "DISPLAY MAX" },
    { "id": "e", "kind": "end", "label": "END" }
  ],
  "edges": [
    { "from": "s", "to": "in" }, { "from": "in", "to": "d" },
    { "from": "d", "to": "ma", "branch": "yes" }, { "from": "d", "to": "mb", "branch": "no" },
    { "from": "ma", "to": "out" }, { "from": "mb", "to": "out" }, { "from": "out", "to": "e" }
  ]
}
```

**Example — sum of the even numbers among N (iterative):**

```
Step 0  START
Step 1  INPUT N
Step 2  I = 1
Step 3  SUM = 0
Step 4  REPEAT WHILE I <= N
            INPUT NUM
            REM = NUM mod 2
            IF REM == 0 THEN
                SUM = SUM + NUM
            END IF
            I = I + 1
        END WHILE
Step 5  DISPLAY SUM
Step 6  END
```

```flowchart
{
  "title": "Sum of the even numbers among N inputs: the loop is a decision whose yes branch comes back up to the test.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "START" },
    { "id": "n", "kind": "io", "label": "INPUT N" },
    { "id": "init", "kind": "process", "label": "I = 1\nSUM = 0" },
    { "id": "loop", "kind": "decision", "label": "I <= N ?" },
    { "id": "num", "kind": "io", "label": "INPUT NUM" },
    { "id": "rem", "kind": "process", "label": "REM = NUM mod 2" },
    { "id": "even", "kind": "decision", "label": "REM == 0 ?" },
    { "id": "add", "kind": "process", "label": "SUM = SUM + NUM" },
    { "id": "inc", "kind": "process", "label": "I = I + 1" },
    { "id": "out", "kind": "io", "label": "DISPLAY SUM" },
    { "id": "e", "kind": "end", "label": "END" }
  ],
  "edges": [
    { "from": "s", "to": "n" }, { "from": "n", "to": "init" }, { "from": "init", "to": "loop" },
    { "from": "loop", "to": "num", "branch": "yes" }, { "from": "loop", "to": "out", "branch": "no" },
    { "from": "num", "to": "rem" }, { "from": "rem", "to": "even" },
    { "from": "even", "to": "add", "branch": "yes" }, { "from": "even", "to": "inc", "branch": "no" },
    { "from": "add", "to": "inc" }, { "from": "inc", "to": "loop" },
    { "from": "out", "to": "e" }
  ]
}
```

### The three programming constructs

Every piece of logic reduces to three kinds of statement:

| construct | role | algorithm keyword |
|---|---|---|
| **imperative** | do an action, in order | `COMPUTE`, `INPUT`, `DISPLAY`, `=` |
| **conditional** | choose based on a condition | `IF ... THEN ... ELSE ... END IF` |
| **iterative** | repeat while a condition holds | `REPEAT WHILE ... END WHILE` |

---

## 8. Flowcharts

A **flowchart** is a **graphical tool** that shows the **flow of control**
within a sequence of statements.

### Notations

```flowchart
{
  "title": "The flowchart symbols used in this course.",
  "nodes": [
    { "id": "t", "kind": "start", "label": "Terminal", "x": 80, "y": 40 },
    { "id": "io", "kind": "io", "label": "Input / Output", "x": 250, "y": 40 },
    { "id": "p", "kind": "process", "label": "Process", "x": 430, "y": 40 },
    { "id": "d", "kind": "decision", "label": "Decision ?", "x": 610, "y": 40 }
  ],
  "edges": []
}
```

| symbol | shape | role |
|---|---|---|
| **Terminal** | oval / rounded rectangle | start and end of the flowchart |
| **Input/output** | parallelogram | an input or output operation |
| **Process** | rectangle | a processing operation (imperative logic) |
| **Decision** | diamond | a condition; **two exits** (true / false) |
| **Connector** | circle | link two points on the same page |
| **Off-page connector** | pentagon | link two points on different pages |
| **Arrows** | arrowed lines | the order of the flow |

### Flowchart — division avoiding division by zero

```flowchart
{
  "title": "Division avoiding division by zero: when B is 0 the no branch skips straight to END.",
  "nodes": [
    { "id": "s", "kind": "start", "label": "START" },
    { "id": "in", "kind": "io", "label": "INPUT A, B" },
    { "id": "d", "kind": "decision", "label": "Is B != 0 ?" },
    { "id": "q", "kind": "process", "label": "Q = A / B" },
    { "id": "out", "kind": "io", "label": "DISPLAY Q" },
    { "id": "e", "kind": "end", "label": "END" }
  ],
  "edges": [
    { "from": "s", "to": "in" }, { "from": "in", "to": "d" },
    { "from": "d", "to": "q", "branch": "yes" }, { "from": "d", "to": "e", "branch": "no" },
    { "from": "q", "to": "out" }, { "from": "out", "to": "e" }
  ]
}
```

### To remember

- A **decision** (diamond) has **exactly two exits**, one for *true*, one for
  *false*.
- The **process** (rectangle) carries the **imperative** logic; the **I/O**
  (parallelogram) carries `INPUT` / `DISPLAY`.
- **Before writing a program**, develop the **algorithm** and/or the
  **flowchart** for it.
- Algorithm and flowchart are **language-independent** and give two views of the
  same reasoning: textual for one, graphical for the other.
