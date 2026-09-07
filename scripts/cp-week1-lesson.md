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

```
  int square(int num) { return num * num; }     <-  HLL
                  |
                  v
  push rbp / mov rbp, rsp / imul eax, ...        <-  Assembly
                  |
                  v
  0111000001101000101010010010010100...           <-  Machine code
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

```
Programmer -> [Text Editor] -> Source (.c)
                                   |
                                   v
                             [Compiler] -> Object
                                   |
              Library ----------> [Linker] -> Executable
                                   |
                                   v
                              [Runner] -> Results
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

```
  [ Input       ] --->  [ CPU ]  --->  [ Output       ]
  [ device(s)   ]         ^  |          [ device(s)    ]
  (keyboard, mouse) <----> v            (monitor)
                     [ Main memory ]
```

- **CPU**: a **VLSI** integrated circuit containing the **arithmetic and logic
  unit (ALU)**, the **control unit (CU)** and **registers** (general and
  special purpose). The **CU** generates the control signals; the **ALU** does
  the computation. The CPU talks to memory over the **data bus** and the
  **address bus**.
- **Input devices**: the user feeds data and instructions (keyboard, mouse).
- **Output devices**: the computer returns its results (monitor).

### Memory

```
                  Memory
                /        \
        Primary            Secondary
        /      \          (hard disk, flash drives...)
    RAM          ROM
 (volatile)  (non-volatile)
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

```
        ( START )
            |
    /  INPUT A, B  /
            |
        < Is B != 0 ? >---- no ----+
            |                       |
           yes                      |
            |                       |
      [ Q = A / B ]                 |
            |                       |
      /  DISPLAY Q  /               |
            |                       |
            +-----------------------+
            |
         ( END )
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
