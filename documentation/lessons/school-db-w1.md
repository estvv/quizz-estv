# Database Design — Week 1

Lectures 01–02 — *Introduction & Course Overview*, *Introduction to DBMS*.
Data and information, the DBMS concept, the eight advantages of a database,
basic terminology, the three-level ANSI-SPARC architecture, data independence,
types of users, the role of the DBA and the database system architecture.

---

## 1. Data, information, DBMS

**Data** is raw, unorganized facts, observations or symbols: numbers (50, 62),
text ("apple"), an image, an audio clip, a video. **Without context, data is
useless.** Once it is processed, organized, structured or presented in a
context that makes it useful, it becomes **information**.

```diagram
{
  "title": "Data becomes information once it is processed and given a context.",
  "nodes": [
    { "id": "d", "x": 90, "y": 40, "w": 160, "h": 56, "label": "Data\nStudent_1 = 50/100\nStudent_2 = 25/100", "tone": "neutral" },
    { "id": "p", "x": 320, "y": 40, "h": 48, "label": "process\norganise · structure", "shape": "ellipse", "tone": "amber", "filled": true },
    { "id": "i", "x": 550, "y": 40, "w": 160, "h": 56, "label": "Information\nStudent_1 = Pass\nStudent_2 = Fail", "tone": "emerald", "filled": true }
  ],
  "edges": [
    { "from": "d", "to": "p" },
    { "from": "p", "to": "i" }
  ]
}
```

The acronym **DBMS** breaks down as:

| Term | Meaning | Example |
|---|---|---|
| **Data** | a fact that can be recorded or stored | a person's name, age, gender, weight |
| **Database** | a collection of logically related data | the books database of a library, the student database of a university |
| **Management** | manipulation, searching and security of the data | viewing a result on a website, searching exam papers |
| **System** | the programs or tools used to manage the database | SQL Server Studio Express, Oracle |

A **DBMS** is therefore **software designed to define, manipulate, retrieve and
manage the data in a database**. Examples: MS SQL Server, Oracle, MySQL, SQLite,
MongoDB.

It is a **computerized record-keeping system**, required wherever data needs to
be stored: e-commerce (Amazon, eBay), streaming (Prime, Hotstar), social media,
banking and insurance, airlines and railways, universities and schools, library
management, human resources, hospitals and medical stores, government
organizations.

## 2. The eight advantages of a DBMS

The slides illustrate every advantage with the same `Faculty` record for
*Prof. Lee* stored by several departments of a college. Keep that picture in
mind: without a DBMS, each department keeps **its own file**.

### 2.1 Reduce data redundancy (duplication)

Four departments, four copies of the same row.

```diagram
{
  "title": "Without a DBMS the same data is stored at four different places.",
  "nodes": [
    { "id": "t1", "x": 150, "y": 45, "shape": "table", "label": "Computer", "size": 12, "rows": [["Emp_Name","Address","Mobile","Subject"],["Prof. Lee","Busan","8235","DB"]], "mark": [1] },
    { "id": "t2", "x": 470, "y": 45, "shape": "table", "label": "Business", "size": 12, "rows": [["Emp_Name","Address","Mobile","Subject"],["Prof. Lee","Busan","8235","DB"]], "mark": [1] },
    { "id": "t3", "x": 150, "y": 265, "shape": "table", "label": "Electrical", "size": 12, "rows": [["Emp_Name","Address","Mobile","Subject"],["Prof. Lee","Busan","8235","DB"]], "mark": [1] },
    { "id": "t4", "x": 470, "y": 265, "shape": "table", "label": "Mechanical", "size": 12, "rows": [["Emp_Name","Address","Mobile","Subject"],["Prof. Lee","Busan","8235","DB"]], "mark": [1] },
    { "id": "db", "x": 310, "y": 155, "w": 150, "h": 60, "shape": "cylinder", "label": "DBMS\none central copy", "tone": "emerald", "filled": true }
  ],
  "edges": [
    { "from": "t1", "to": "db", "tone": "emerald" },
    { "from": "t2", "to": "db", "tone": "emerald" },
    { "from": "t3", "to": "db", "tone": "emerald" },
    { "from": "t4", "to": "db", "tone": "emerald" }
  ]
}
```

A DBMS removes the redundancy by **storing the data centrally**: one copy that
every department reads.

### 2.2 Remove data inconsistency

Redundancy leads straight to inconsistency: Prof. Lee changes his mobile number,
the Computer department updates its file… and the other three copies now
disagree. The **same data exists in different states** depending on where you
look.

```diagram
{
  "title": "Same data having different states (values): the mobile number was changed in one file only.",
  "nodes": [
    { "id": "t1", "x": 150, "y": 45, "shape": "table", "label": "Computer", "size": 12, "rows": [["Emp_Name","Address","Mobile","Subject"],["Prof. Lee","Busan","2237","DB"]], "mark": [1] },
    { "id": "t2", "x": 470, "y": 45, "shape": "table", "label": "Business", "size": 12, "rows": [["Emp_Name","Address","Mobile","Subject"],["Prof. Lee","Busan","5235","DB"]], "mark": [1] },
    { "id": "t3", "x": 150, "y": 140, "shape": "table", "label": "Electrical", "size": 12, "rows": [["Emp_Name","Address","Mobile","Subject"],["Prof. Lee","Busan","8235","DB"]], "mark": [1] },
    { "id": "t4", "x": 470, "y": 140, "shape": "table", "label": "Mechanical", "size": 12, "rows": [["Emp_Name","Address","Mobile","Subject"],["Prof. Lee","Busan","9235","DB"]], "mark": [1] },
    { "id": "n", "x": 310, "y": 225, "w": 360, "h": 34, "shape": "note", "label": "Which mobile number is the right one? Nobody knows.", "tone": "rose" }
  ],
  "edges": []
}
```

By eliminating the redundancy, the DBMS **keeps the data in a consistent
state**: there is only one value to update.

### 2.3 Data isolation

Data is scattered across **various files**, possibly in **different formats**,
so retrieving the appropriate data is difficult. The DBMS lets us access
(retrieve) the right data easily.

```diagram
{
  "title": "Three files, three formats: answering \"everything about Prof. Lee\" means opening all of them.",
  "nodes": [
    { "id": "q", "x": 70, "y": 120, "w": 110, "h": 56, "shape": "ellipse", "label": "Everything\nabout Prof. Lee?", "tone": "amber", "filled": true },
    { "id": "f1", "x": 380, "y": 40, "shape": "table", "label": "File 1", "size": 12, "rows": [["Emp_Name","Address","Mobile","Subject"],["Prof. Lee","Busan","1234","DB"]] },
    { "id": "f2", "x": 380, "y": 130, "shape": "table", "label": "File 2", "size": 12, "rows": [["Emp_Name","Post","Salary","Load"],["Prof. Lee","Professor","50,000","15"]] },
    { "id": "f3", "x": 380, "y": 220, "shape": "table", "label": "File 3", "size": 12, "rows": [["Emp_Name","Teaching","Knowledge","Rating"],["Prof. Lee","Good","Excellent","9"]] }
  ],
  "edges": [
    { "from": "q", "to": "f1", "dashed": true },
    { "from": "q", "to": "f2", "dashed": true },
    { "from": "q", "to": "f3", "dashed": true }
  ]
}
```

> The slides also give the transactional meaning of the word: **isolation** is
> the property that determines *when and how* the changes made by one operation
> become visible to other concurrent users and systems. It only matters in a
> **concurrency** situation. Week 2 comes back to it with ACID.

### 2.4 Guaranteed atomicity

**Atomicity: a transaction executes either 0 % or 100 %.** A transfer of 500
from account A to account B is *two* steps; if the system fails after step 1,
the money has vanished.

```diagram
{
  "title": "A transfer is two steps. Atomicity guarantees both happen, or neither.",
  "nodes": [
    { "id": "a", "x": 90, "y": 50, "w": 130, "h": 54, "label": "Person A\nAccount A\nBal : 2000", "tone": "sky" },
    { "id": "b", "x": 550, "y": 50, "w": 130, "h": 54, "label": "Person B\nAccount B\nBal : 1000", "tone": "sky" },
    { "id": "s1", "x": 320, "y": 30, "shape": "text", "label": "Transfer 500", "bold": true },
    { "id": "s2", "x": 320, "y": 100, "w": 300, "h": 40, "shape": "note", "label": "Step 1 : debit 500 from Account A\nStep 2 : credit 500 into Account B", "tone": "neutral" },
    { "id": "ok", "x": 160, "y": 190, "w": 300, "h": 52, "shape": "note", "label": "Both steps done (100 %)\nA = 1500, B = 1500 → sum still 3000", "tone": "emerald" },
    { "id": "ko", "x": 500, "y": 190, "w": 340, "h": 52, "shape": "note", "label": "Failure after step 1 (50 %)\nA = 1500, B = 1000 → sum 2500, inconsistent", "tone": "rose" }
  ],
  "edges": [
    { "from": "a", "to": "b", "tone": "sky" },
    { "from": "s2", "to": "ok", "tone": "emerald" },
    { "from": "s2", "to": "ko", "tone": "rose", "dashed": true }
  ]
}
```

The sum of both accounts is 3000 before the transfer and must be 3000 after it.
A half-executed transaction would leave 2500: the DBMS **rolls back** step 1
instead.

### 2.5 Allow to implement integrity constraints

Business rules can be enforced by the database itself.

```diagram
{
  "title": "Integrity constraints: business rules checked by the DBMS on every write.",
  "nodes": [
    { "id": "f", "x": 190, "y": 40, "shape": "table", "label": "Faculty", "size": 12, "rows": [["Emp_Name","Address","Mobile_No","Subject"],["Prof. Lee","Busan","8256974180","DB"]] },
    { "id": "s", "x": 190, "y": 140, "shape": "table", "label": "Student", "size": 12, "rows": [["Student_Name","Branch","Backlog","SPI"],["Irmun","Juan","0","8.5"]] },
    { "id": "c1", "x": 540, "y": 50, "w": 240, "h": 36, "shape": "note", "label": "should contain exactly 10 digits", "tone": "amber" },
    { "id": "c2", "x": 540, "y": 150, "w": 240, "h": 36, "shape": "note", "label": "should be between 0 and 10", "tone": "amber" }
  ],
  "edges": [
    { "from": "c1", "to": "f", "tone": "amber" },
    { "from": "c2", "to": "s", "tone": "amber" }
  ]
}
```

Other examples from the slides: *do not allow to store an amount less than 0 in
a balance*.

### 2.6 Sharing of data among multiple users & 2.7 restricting unauthorized access

More than one user can access the **same data at the same time** — and only
the users who are **authorized** to.

```diagram
{
  "title": "One central copy, shared by the college's departments; a faculty from another university is refused.",
  "nodes": [
    { "id": "u1", "x": 80, "y": 40, "w": 120, "h": 44, "shape": "ellipse", "label": "Computer dept.", "tone": "sky" },
    { "id": "u2", "x": 80, "y": 110, "w": 120, "h": 44, "shape": "ellipse", "label": "Business dept.", "tone": "sky" },
    { "id": "u3", "x": 80, "y": 180, "w": 120, "h": 44, "shape": "ellipse", "label": "Mechanical dept.", "tone": "sky" },
    { "id": "db", "x": 360, "y": 110, "shape": "table", "label": "Faculty (DBMS)", "size": 12, "rows": [["Emp_Name","Address","Mobile","Subject"],["Prof. Lee","Busan","8253","DB"]] },
    { "id": "x", "x": 610, "y": 110, "w": 120, "h": 52, "shape": "ellipse", "label": "Faculty of\nanother univ.", "tone": "rose" }
  ],
  "edges": [
    { "from": "u1", "to": "db", "tone": "sky", "label": "read" },
    { "from": "u2", "to": "db", "tone": "sky", "label": "update" },
    { "from": "u3", "to": "db", "tone": "sky", "label": "read" },
    { "from": "x", "to": "db", "tone": "rose", "dashed": true, "label": "denied" }
  ]
}
```

### 2.8 Providing backup and recovery services

The DBMS provides facilities to **back up** the database (auto or manual,
regular) and to **restore** it in case of failure or corruption.

```diagram
{
  "title": "Backup and recovery: a regular copy, restored after a failure (flood, virus…).",
  "nodes": [
    { "id": "db", "x": 90, "y": 60, "w": 120, "h": 64, "shape": "cylinder", "label": "Database", "tone": "sky", "filled": true },
    { "id": "bk", "x": 430, "y": 60, "w": 200, "h": 64, "shape": "cylinder", "label": "Backup\nDVD · tape · remote server", "tone": "neutral", "filled": true }
  ],
  "edges": [
    { "from": "db", "to": "bk", "label": "backup (regular)", "via": [[90, 20], [430, 20]] },
    { "from": "bk", "to": "db", "label": "restore after failure", "via": [[430, 100], [90, 100]], "tone": "emerald" }
  ]
}
```

### Summary of the eight advantages

| # | Advantage | One line |
|---|---|---|
| 1 | Reduce data redundancy | avoid duplication by storing data centrally |
| 2 | Remove data inconsistency | no redundancy ⇒ no contradictory copies |
| 3 | Data isolation | a user easily retrieves the proper data |
| 4 | Guaranteed atomicity | a transaction executes 0 % or 100 % |
| 5 | Integrity constraints | business rules enforced (balance ≥ 0, 10-digit mobile) |
| 6 | Sharing of data | several users access the same data simultaneously |
| 7 | Restricting unauthorized access | a user only reaches what is authorized to them |
| 8 | Backup and recovery | regular backups, restore if the database corrupts |

## 3. Basic terms

- **Data**: raw, unorganized facts that need to be processed
  (Student_1 = 50/100, Student_2 = 25/100).
- **Information**: data processed, organized, structured or presented in a
  context that makes it useful (Student_1 = Pass, Student_2 = Fail).
- **Metadata**: *data about data* — for a table: its name, its column names,
  the data types, the authorized users and their access privileges.
- **Data dictionary**: an information repository that contains the **metadata**.
- **Data warehouse**: an information repository that stores the **data** itself.

```diagram
{
  "title": "Data dictionary (metadata) vs data warehouse (the data): two repositories, stored in different places.",
  "nodes": [
    { "id": "dd", "x": 170, "y": 90, "w": 320, "h": 124, "shape": "note", "tone": "violet", "size": 12, "label": "Data dictionary — metadata\nTable name – Faculty\nColumns – Emp_Name, Address, Mobile_No, Subject\nDatatype – Varchar, Decimal\nPrivileges – Read, Write (Update)" },
    { "id": "dw", "x": 590, "y": 90, "shape": "table", "label": "Data warehouse — the data", "size": 12, "tone": "sky", "rows": [["Emp_Name","Address","Mobile_No","Subject"],["Prof. Lee","Busan","8564721390","DB"],["Prof. Lee","Degu","0123456789","Math"]] }
  ],
  "edges": [
    { "from": "dd", "to": "dw", "dashed": true, "label": "describes" }
  ]
}
```

> *Exercise from the slides — why are the data dictionary and the data warehouse
> stored in different places?* Because they change at very different rates and
> serve different readers: the metadata is small, changes only when the schema
> changes and is consulted by the DBMS on every query; the data is large and
> changes constantly.

- **Field**: a character or group of characters that has a specific meaning —
  each value of `Emp_Name`, `Address`, `Mobile_No`… is a field.
- **Record / tuple**: a collection of logically related fields — the four
  fields `(Emp_Name, Address, Mobile_No, Subject)` of one professor form one
  record of the `Faculty` table.

```diagram
{
  "title": "Fields are the individual values; a record (tuple) is one full row of related fields.",
  "nodes": [
    { "id": "t", "x": 250, "y": 70, "shape": "table", "label": "Faculty", "size": 12, "cols": [80, 70, 100, 70], "rows": [["Emp_Name","Address","Mobile_No","Subject"],["Prof. Lee","Busan","8756940123","DB"],["Prof. Lee","Degu","0123456789","Math"]], "mark": [1] },
    { "id": "c1", "x": 205, "y": 103, "shape": "text" },
    { "id": "c2", "x": 290, "y": 103, "shape": "text" },
    { "id": "r", "x": 414, "y": 81, "shape": "text" },
    { "id": "lf", "x": 250, "y": 180, "w": 90, "h": 30, "shape": "note", "label": "Fields", "tone": "amber" },
    { "id": "lr", "x": 560, "y": 81, "w": 130, "h": 30, "shape": "note", "label": "Record / Tuple", "tone": "emerald" }
  ],
  "edges": [
    { "from": "lf", "to": "c1", "tone": "amber" },
    { "from": "lf", "to": "c2", "tone": "amber" },
    { "from": "lr", "to": "r", "tone": "emerald" }
  ]
}
```

## 4. The three-level ANSI-SPARC architecture

Database systems are made up of complex data structures. To ease the user's
interaction, the developers **hide the internal, irrelevant details** from the
users: this is **data abstraction**. ANSI-SPARC formalises it in three levels.

```diagram
{
  "title": "The three levels of the ANSI-SPARC architecture.",
  "groups": [
    { "x": 330, "y": 62, "w": 300, "h": 100, "label": "External level", "tone": "sky" },
    { "x": 330, "y": 190, "w": 300, "h": 58, "label": "Conceptual level", "tone": "amber", "labelAlign": "right" },
    { "x": 330, "y": 290, "w": 300, "h": 58, "label": "Internal level", "tone": "violet", "labelAlign": "right" }
  ],
  "nodes": [
    { "id": "q1", "x": 98, "y": 80, "w": 150, "h": 44, "shape": "note", "size": 12, "label": "How is data viewed\nby each user?", "tone": "sky" },
    { "id": "q2", "x": 98, "y": 196, "w": 150, "h": 44, "shape": "note", "size": 12, "label": "What data is stored?\nWhat relationships exist?", "tone": "amber" },
    { "id": "q3", "x": 98, "y": 296, "w": 150, "h": 44, "shape": "note", "size": 12, "label": "How is the data actually\nstored on the device?", "tone": "violet" },
    { "id": "u1", "x": 240, "y": 46, "w": 70, "h": 30, "shape": "ellipse", "label": "User 1", "size": 11 },
    { "id": "u2", "x": 330, "y": 46, "w": 70, "h": 30, "shape": "ellipse", "label": "User 2", "size": 11 },
    { "id": "u3", "x": 420, "y": 46, "w": 70, "h": 30, "shape": "ellipse", "label": "User 3", "size": 11 },
    { "id": "v1", "x": 240, "y": 100, "w": 70, "h": 30, "label": "View 1", "tone": "sky", "filled": true, "size": 12 },
    { "id": "v2", "x": 330, "y": 100, "w": 70, "h": 30, "label": "View 2", "tone": "sky", "filled": true, "size": 12 },
    { "id": "v3", "x": 420, "y": 100, "w": 70, "h": 30, "label": "View 3", "tone": "sky", "filled": true, "size": 12 },
    { "id": "c", "x": 330, "y": 203, "w": 170, "h": 38, "label": "Conceptual (logical) level", "tone": "amber", "filled": true, "size": 12 },
    { "id": "i", "x": 330, "y": 303, "w": 170, "h": 38, "label": "Internal (physical) level", "tone": "violet", "filled": true, "size": 12 },
    { "id": "db", "x": 330, "y": 390, "w": 130, "h": 56, "shape": "cylinder", "label": "Database", "tone": "neutral", "filled": true },
    { "id": "s1", "x": 560, "y": 100, "shape": "text", "label": "external schemas", "size": 11 },
    { "id": "s2", "x": 560, "y": 200, "shape": "text", "label": "conceptual schema", "size": 11 },
    { "id": "s3", "x": 560, "y": 300, "shape": "text", "label": "internal schema", "size": 11 }
  ],
  "edges": [
    { "from": "u1", "to": "v1", "arrow": "none" }, { "from": "u2", "to": "v2", "arrow": "none" }, { "from": "u3", "to": "v3", "arrow": "none" },
    { "from": "v1", "to": "c", "arrow": "none", "via": [[240, 150], [330, 150]] }, { "from": "v2", "to": "c", "arrow": "none" }, { "from": "v3", "to": "c", "arrow": "none", "via": [[420, 150], [330, 150]] },
    { "from": "c", "to": "i", "arrow": "none" },
    { "from": "i", "to": "db", "arrow": "none" }
  ]
}
```

| Level | Question it answers | Described by | Who works there |
|---|---|---|---|
| **Internal (physical)** | *how* the data is stored on the storage device: structure of records on disk — files, pages, blocks, indexes, ordering of records | the **internal schema** | the DBMS, storage details hidden from programmers |
| **Conceptual (logical)** | *what* data is stored and *what relationships* exist among it; hides the low-level complexities of physical storage | the **conceptual schema** | the **DBA** decides what data to keep; programmers generally work here |
| **External (view)** | the **part** of the database a given end user is concerned with, i.e. how data is viewed by each user; different users need different views, so there can be many | the **external schemas** | end users (via a GUI, unaware of storage) and application programmers |

Example: a `STUDENT` database contains `STUDENT` and `COURSE` tables that are
visible to the users, who have no idea how they are stored. At the internal
level the records are blocks of storage (bytes, gigabytes…); at the conceptual
level they are fields and attributes with their data types and the relationships
between them; at the view level a user just interacts with a GUI.

### Mapping and data independence

The process of **transforming requests and results between the three levels**
is called **mapping**: a request goes down through the levels, the result comes
back up.

**Data independence** is the ability to modify a schema definition at one level
**without affecting the schema definition at the next higher level**.

```diagram
{
  "title": "Mapping (request down, result up) and the two kinds of data independence.",
  "nodes": [
    { "id": "app", "x": 300, "y": 30, "w": 220, "h": 34, "label": "Application programs · views", "tone": "sky", "filled": true },
    { "id": "c", "x": 300, "y": 140, "w": 220, "h": 34, "label": "Conceptual (logical) schema", "tone": "amber", "filled": true },
    { "id": "i", "x": 300, "y": 250, "w": 220, "h": 34, "label": "Internal (physical) schema", "tone": "violet", "filled": true },
    { "id": "db", "x": 300, "y": 340, "w": 120, "h": 50, "shape": "cylinder", "label": "Database", "tone": "neutral", "filled": true },
    { "id": "li", "x": 570, "y": 85, "w": 230, "h": 64, "shape": "note", "size": 11, "label": "Logical data independence\nchange the conceptual schema\nwithout touching the programs", "tone": "amber" },
    { "id": "pi", "x": 570, "y": 195, "w": 230, "h": 64, "shape": "note", "size": 11, "label": "Physical data independence\nchange the physical schema\nwithout touching the logical one", "tone": "violet" },
    { "id": "rq", "x": 60, "y": 140, "shape": "text", "label": "request ↓", "size": 12 },
    { "id": "rs", "x": 60, "y": 250, "shape": "text", "label": "↑ result", "size": 12 }
  ],
  "edges": [
    { "from": "app", "to": "c", "arrow": "both" },
    { "from": "c", "to": "i", "arrow": "both" },
    { "from": "i", "to": "db", "arrow": "both" }
  ]
}
```

| | Physical data independence | Logical data independence |
|---|---|---|
| definition | modify the **physical** schema without any change in the logical (conceptual) schema or the application programs | modify the **conceptual** schema without any change in the application programs |
| when | occasionally, to **improve performance** | whenever the **logical structure** of the database changes |
| typical changes | file structures, compression techniques, hashing algorithms, storage devices | adding a field, splitting a table… |
| difficulty | easy: nothing above depends on the storage details | hard: programs depend heavily on the logical structure of the data they access, so a logical change usually forces program changes |

## 5. Types of database users

| Type | Description | Example |
|---|---|---|
| **Naive users (end users)** | unsophisticated users with zero knowledge of the database system; interact through sophisticated software or tools | a clerk in a bank |
| **Application programmers** | write software using tools such as Java, .Net, PHP | software developers |
| **Sophisticated users** | interact with the database **without an application program**, through query tools like SQL | an analyst |
| **Specialized users (DBA)** | write specialized database application programs, use administration tools | the database administrator |

## 6. Role of the DBA (Database Administrator)

1. **Schema definition** — defines the logical schema of the database.
2. **Storage structure and access method definition** — decides how the data
   is represented in the database and how it is accessed.
3. **Defining security and integrity constraints**.
4. **Granting of authorization for data access** — which user needs access to
   which part of the database.
5. **Liaison with users** — provides the necessary data to the users.
6. **Assisting application programmers** in developing their programs.
7. **Monitoring performance** — changes the physical or logical schema when
   needed to keep performance good.
8. **Backup and recovery** — backs the database up (DVD, tape, remote servers)
   and recovers the system after a failure such as a flood or a virus attack.

## 7. Database system architecture

The whole picture: each type of user reaches the DBMS through their own tool;
inside, a **query processor** turns requests into low-level operations and a
**storage manager** executes them against the data on disk.

```diagram
{
  "title": "Database system architecture: users, query processor, storage manager, disk storage.",
  "groups": [
    { "x": 330, "y": 262, "w": 600, "h": 178, "label": "Query processor", "tone": "amber" },
    { "x": 330, "y": 420, "w": 600, "h": 66, "label": "Storage manager", "tone": "violet" },
    { "x": 330, "y": 528, "w": 600, "h": 66, "label": "Disk storage", "tone": "neutral", "dashed": false }
  ],
  "nodes": [
    { "id": "u1", "x": 90, "y": 30, "w": 110, "h": 38, "shape": "ellipse", "label": "Naive users", "size": 11, "tone": "sky" },
    { "id": "u2", "x": 250, "y": 30, "w": 120, "h": 38, "shape": "ellipse", "label": "Application\nprogrammers", "size": 11, "tone": "sky" },
    { "id": "u3", "x": 410, "y": 30, "w": 120, "h": 38, "shape": "ellipse", "label": "Sophisticated\nusers", "size": 11, "tone": "sky" },
    { "id": "u4", "x": 570, "y": 30, "w": 120, "h": 38, "shape": "ellipse", "label": "Database\nadministrator", "size": 11, "tone": "sky" },
    { "id": "t1", "x": 90, "y": 100, "w": 120, "h": 38, "shape": "ellipse", "label": "Application\ninterfaces", "size": 11 },
    { "id": "t2", "x": 250, "y": 100, "w": 120, "h": 38, "shape": "ellipse", "label": "Application\nprograms", "size": 11 },
    { "id": "t3", "x": 410, "y": 100, "w": 120, "h": 38, "shape": "ellipse", "label": "Query\ntools", "size": 11 },
    { "id": "t4", "x": 570, "y": 100, "w": 120, "h": 38, "shape": "ellipse", "label": "Administration\ntools", "size": 11 },
    { "id": "cl", "x": 250, "y": 200, "w": 120, "h": 34, "label": "Compiler & linker", "size": 11 },
    { "id": "dq", "x": 410, "y": 200, "w": 110, "h": 34, "label": "DML queries", "size": 11 },
    { "id": "ddl", "x": 570, "y": 200, "w": 120, "h": 34, "label": "DDL interpreter", "size": 11, "tone": "amber", "filled": true },
    { "id": "oc", "x": 130, "y": 270, "w": 140, "h": 40, "label": "Application program\nobject code", "size": 11, "tone": "amber", "filled": true },
    { "id": "dml", "x": 410, "y": 270, "w": 140, "h": 40, "label": "DML compiler &\norganizer", "size": 11, "tone": "amber", "filled": true },
    { "id": "qe", "x": 270, "y": 335, "w": 150, "h": 36, "label": "Query evaluation engine", "size": 11, "tone": "amber", "filled": true },
    { "id": "bm", "x": 100, "y": 428, "w": 100, "h": 40, "label": "Buffer\nmanager", "size": 11, "tone": "violet", "filled": true },
    { "id": "fm", "x": 245, "y": 428, "w": 100, "h": 40, "label": "File\nmanager", "size": 11, "tone": "violet", "filled": true },
    { "id": "am", "x": 400, "y": 428, "w": 130, "h": 40, "label": "Authorization &\nintegrity manager", "size": 11, "tone": "violet", "filled": true },
    { "id": "tm", "x": 560, "y": 428, "w": 110, "h": 40, "label": "Transaction\nmanager", "size": 11, "tone": "violet", "filled": true },
    { "id": "d1", "x": 100, "y": 545, "w": 90, "h": 30, "label": "Data", "size": 11 },
    { "id": "d2", "x": 245, "y": 545, "w": 90, "h": 30, "label": "Indices", "size": 11 },
    { "id": "d3", "x": 400, "y": 545, "w": 110, "h": 30, "label": "Data dictionary", "size": 11 },
    { "id": "d4", "x": 560, "y": 545, "w": 110, "h": 30, "label": "Statistical data", "size": 11 }
  ],
  "edges": [
    { "from": "u1", "to": "t1", "arrow": "none" }, { "from": "u2", "to": "t2", "arrow": "none" },
    { "from": "u3", "to": "t3", "arrow": "none" }, { "from": "u4", "to": "t4", "arrow": "none" },
    { "from": "t1", "to": "oc", "via": [[90, 235]] },
    { "from": "t2", "to": "cl" },
    { "from": "t3", "to": "dq" },
    { "from": "t4", "to": "ddl" },
    { "from": "cl", "to": "oc" },
    { "from": "cl", "to": "dq" },
    { "from": "dq", "to": "dml" },
    { "from": "oc", "to": "qe" },
    { "from": "dml", "to": "qe" },
    { "from": "qe", "to": "bm" }, { "from": "qe", "to": "fm" }, { "from": "qe", "to": "am" }, { "from": "qe", "to": "tm" },
    { "from": "ddl", "to": "d3", "via": [[650, 200], [650, 600], [400, 600]] },
    { "from": "bm", "to": "d1", "arrow": "both" }, { "from": "fm", "to": "d2", "arrow": "both" },
    { "from": "am", "to": "d3", "arrow": "both" }, { "from": "tm", "to": "d4", "arrow": "both" }
  ]
}
```

### Query processor

- **DDL interpreter** — processes the DDL statements (`CREATE`, `ALTER`,
  `DROP`) and records the definitions in the **data dictionary**.
- **DML compiler & organizer** — translates a DML statement into a low-level
  evaluation plan and picks the cheapest one (query optimisation).
- **Compiler & linker** — turns an application program, including the DML
  embedded in it, into object code.
- **Query evaluation engine** — actually executes the low-level instructions
  produced by the DML compiler.

### Storage manager

The interface between the low-level data on disk and the queries.

- **Buffer manager** — brings blocks from disk into main memory and decides
  what to keep cached.
- **File manager** — manages the disk-space allocation and the on-disk data
  structures.
- **Authorization & integrity manager** — checks that users have the rights
  they claim and that updates respect the integrity constraints.
- **Transaction manager** — keeps the database consistent despite failures and
  concurrent access (atomicity, isolation).

### Disk storage

The database on disk holds four kinds of data: the **data** itself, the
**indices**, the **data dictionary** (metadata) and **statistical data** (used
by the query optimiser).

---

## To remember

- Data = raw facts; information = data given a context. A DBMS is software to
  **define, manipulate, retrieve and manage** the data of a database.
- Eight advantages: no redundancy, no inconsistency, easy retrieval
  (isolation), atomicity (0 % or 100 %), integrity constraints, sharing,
  access control, backup & recovery.
- Metadata = data about data; data **dictionary** holds the metadata, data
  **warehouse** holds the data. Field = one value; record/tuple = one row.
- ANSI-SPARC: **external** (views, one per user) / **conceptual** (what data,
  what relationships — the DBA's level) / **internal** (how it is stored).
  Hiding details = data abstraction; translating between levels = mapping.
- Data independence: **physical** = change storage without touching the
  logical schema; **logical** = change the logical schema without touching the
  programs (much harder).
- Users: naive (clerk) · application programmers · sophisticated (analyst, SQL)
  · specialized (DBA). The DBA defines the schema, storage, security,
  authorizations, helps users and programmers, monitors performance, does backups.
- Architecture: query processor (DDL interpreter, DML compiler, query
  evaluation engine) over a storage manager (buffer, file, authorization &
  integrity, transaction managers) over the disk (data, indices, data
  dictionary, statistics).
