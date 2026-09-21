# Database Design — Week 2

Lectures 03–04 — *ACID Properties, Data Models* and *E-R Diagrams – 1*.
Tables and schemas, levels of abstraction, the ACID properties, what a data
model is, the classic data models (hierarchical, network, E-R, relational,
object-oriented, object-relational, semi-structured), then the first half of
E-R diagrams: entities, attributes and their types, relationships.

---

## 1. Tables, schema, instance

Data in a database is typically organized into **tables**, made of **rows** and
**columns**. Each **row** is a single record (an *instance* of data); each
**column** is a specific attribute or characteristic of that data.

```diagram
{
  "title": "The elements of a database table.",
  "nodes": [
    { "id": "t", "x": 300, "y": 120, "shape": "table", "size": 12, "cols": [60, 90, 130], "rows": [["ID","Name","Date of Birth"],["1","Kim","2001-03-04"],["2","Lee","2000-11-30"],["3","Park","2002-06-15"]], "mark": [2] },
    { "id": "corner", "x": 172, "y": 82, "shape": "text" },
    { "id": "hdr", "x": 270, "y": 78, "shape": "text" },
    { "id": "key", "x": 172, "y": 87, "shape": "text" },
    { "id": "row", "x": 430, "y": 131, "shape": "text" },
    { "id": "lt", "x": 80, "y": 20, "w": 130, "h": 30, "shape": "note", "label": "Table (Relation)", "tone": "sky" },
    { "id": "lf", "x": 470, "y": 20, "w": 130, "h": 30, "shape": "note", "label": "Field (Column)", "tone": "violet" },
    { "id": "lk", "x": 60, "y": 87, "w": 70, "h": 30, "shape": "note", "label": "Key", "tone": "amber" },
    { "id": "lr", "x": 570, "y": 131, "w": 130, "h": 30, "shape": "note", "label": "Record (Tuple)", "tone": "emerald" }
  ],
  "edges": [
    { "from": "lt", "to": "corner", "tone": "sky" },
    { "from": "lf", "to": "hdr", "tone": "violet" },
    { "from": "lk", "to": "key", "tone": "amber" },
    { "from": "lr", "to": "row", "tone": "emerald" }
  ]
}
```

A **schema** is a description of a particular collection of data, using a
given data model — the **structure or form of the database without any data in
it**. An **instance** is the actual content of the database at a given moment.

```diagram
{
  "title": "Schema vs instances: the plan of a house vs the houses built from it; the template of a table vs the data-filled table.",
  "groups": [
    { "x": 380, "y": 80, "w": 560, "h": 96, "label": "Schema", "tone": "amber" },
    { "x": 380, "y": 225, "w": 560, "h": 150, "label": "Instances", "tone": "emerald" }
  ],
  "nodes": [
    { "id": "h1", "x": 230, "y": 12, "shape": "text", "label": "Real world", "bold": true },
    { "id": "h2", "x": 540, "y": 12, "shape": "text", "label": "Database", "bold": true },
    { "id": "sr", "x": 230, "y": 88, "w": 260, "h": 40, "shape": "note", "label": "Plan for a standard house", "tone": "amber" },
    { "id": "sd", "x": 540, "y": 88, "shape": "table", "size": 12, "tone": "amber", "cols": [70, 80, 90], "rows": [["P-ID","Name","Prename"]] },
    { "id": "ir", "x": 230, "y": 225, "w": 260, "h": 70, "shape": "note", "label": "Built standard houses\nhouse #1 · house #2 · house #3\n(same plan, different owners)", "tone": "emerald" },
    { "id": "id", "x": 540, "y": 225, "shape": "table", "size": 12, "tone": "emerald", "cols": [70, 80, 90], "rows": [["P-ID","Name","Prename"],["102356","Smith","John"],["102357","Potter","Harry"],["523646","Wood","Lucinda"]] }
  ],
  "edges": [
    { "from": "sr", "to": "ir", "dashed": true, "label": "built from" },
    { "from": "sd", "to": "id", "dashed": true, "label": "filled in" }
  ]
}
```

The schema exists at three levels — the same three levels as the ANSI-SPARC
architecture of Week 1:

| Schema | Describes | Who works there |
|---|---|---|
| **Physical schema** | how the data stored in blocks of storage is described | the DBMS (hidden from programmers) |
| **Logical schema** | which types of data records are stored in which data structures; the implementation details of those structures are hidden (they live at the physical level) | programmers and database administrators |
| **View schema** | how the end user interacts with the database system | end users |

### Levels of abstraction

```diagram
{
  "title": "Levels of abstraction: many views, one conceptual schema, one physical schema.",
  "nodes": [
    { "id": "v1", "x": 270, "y": 30, "w": 80, "h": 32, "label": "View 1", "tone": "sky", "filled": true },
    { "id": "v2", "x": 390, "y": 30, "w": 80, "h": 32, "label": "View 2", "tone": "sky", "filled": true },
    { "id": "v3", "x": 510, "y": 30, "w": 80, "h": 32, "label": "View 3", "tone": "sky", "filled": true },
    { "id": "c", "x": 390, "y": 130, "w": 180, "h": 38, "label": "Conceptual schema", "tone": "amber", "filled": true },
    { "id": "p", "x": 390, "y": 230, "w": 180, "h": 38, "label": "Physical schema", "tone": "violet", "filled": true },
    { "id": "db", "x": 390, "y": 320, "w": 110, "h": 50, "shape": "cylinder", "label": "Database", "filled": true },
    { "id": "n1", "x": 90, "y": 30, "w": 150, "h": 44, "shape": "note", "size": 11, "label": "how users see the data\n(external schemas)", "tone": "sky" },
    { "id": "n2", "x": 90, "y": 130, "w": 150, "h": 44, "shape": "note", "size": 11, "label": "single schema defining\nthe logical structure", "tone": "amber" },
    { "id": "n3", "x": 90, "y": 230, "w": 150, "h": 44, "shape": "note", "size": 11, "label": "describes the files\nand indexes used", "tone": "violet" },
    { "id": "d1", "x": 640, "y": 80, "w": 190, "h": 44, "shape": "note", "size": 11, "label": "views are generated on\ndemand from the real data", "tone": "sky" },
    { "id": "d2", "x": 640, "y": 130, "w": 190, "h": 34, "shape": "note", "size": 11, "label": "← conceptual database design", "tone": "amber" },
    { "id": "d3", "x": 640, "y": 230, "w": 190, "h": 34, "shape": "note", "size": 11, "label": "← physical database design", "tone": "violet" }
  ],
  "edges": [
    { "from": "v1", "to": "c", "arrow": "none" }, { "from": "v2", "to": "c", "arrow": "none" }, { "from": "v3", "to": "c", "arrow": "none" },
    { "from": "c", "to": "p", "arrow": "none" },
    { "from": "p", "to": "db", "arrow": "none" }
  ]
}
```

- **Conceptual database design** = producing the conceptual schema.
- **Physical database design** = producing the physical schema.

Example, a university database:

```
Conceptual schema:
    Students(sid: string, name: string, login: string, age: integer, gpa: real)
    Courses(cid: string, cname: string, credits: integer)
    Enrolled(sid: string, cid: string, grade: string)

Physical schema:
    Relations stored as unordered files
    Index on the first column of Students

External schema (view):
    Course_info(cid: string, enrollment: integer)
```

## 2. ACID properties

A **transaction** is a unit of work on the database. Four *desirable
properties* must hold for every transaction — **ACID**:

| Property | Statement | Ensured by |
|---|---|---|
| **Atomicity** | the transaction is performed **in its entirety or not at all** | the **transaction-recovery subsystem** of the DBMS |
| **Consistency** | the database **always remains consistent** | the **database program / the programmer** |
| **Isolation** | a transaction **does not interfere** with other transactions | the **concurrency-control subsystem** |
| **Durability** | the changes of **committed** transactions **must persist** | the **recovery subsystem** |

```diagram
{
  "title": "Which subsystem of the DBMS guarantees which ACID property.",
  "nodes": [
    { "id": "a", "x": 80, "y": 40, "w": 130, "h": 48, "label": "Atomicity\nall or nothing", "tone": "sky", "filled": true },
    { "id": "d", "x": 250, "y": 40, "w": 130, "h": 48, "label": "Durability\ncommits persist", "tone": "sky", "filled": true },
    { "id": "i", "x": 420, "y": 40, "w": 130, "h": 48, "label": "Isolation\nno interference", "tone": "amber", "filled": true },
    { "id": "c", "x": 590, "y": 40, "w": 130, "h": 48, "label": "Consistency\nconstraints hold", "tone": "emerald", "filled": true },
    { "id": "rec", "x": 165, "y": 160, "w": 200, "h": 40, "label": "Transaction-recovery\nsubsystem", "tone": "sky" },
    { "id": "cc", "x": 420, "y": 160, "w": 190, "h": 40, "label": "Concurrency-control\nsubsystem", "tone": "amber" },
    { "id": "prog", "x": 610, "y": 160, "w": 150, "h": 40, "label": "Database program\n(the programmer)", "tone": "emerald" },
    { "id": "log", "x": 165, "y": 260, "w": 130, "h": 54, "shape": "cylinder", "label": "Log\nold values", "tone": "sky", "filled": true }
  ],
  "edges": [
    { "from": "a", "to": "rec", "tone": "sky" },
    { "from": "d", "to": "rec", "tone": "sky" },
    { "from": "i", "to": "cc", "tone": "amber" },
    { "from": "c", "to": "prog", "tone": "emerald" },
    { "from": "rec", "to": "log", "arrow": "both", "tone": "sky", "label": "uses" },
    { "from": "rec", "to": "cc", "arrow": "both", "dashed": true, "label": "cooperate" }
  ]
}
```

### Atomicity

- Ensured by the **transaction-recovery subsystem**.
- The recovery technique must **undo any effect of a failed (aborted)
  transaction** — done by using the **log** and **writing back the old
  values**.
- Cooperation with the **concurrency-control subsystem** is also necessary.

### Consistency

- Each transaction should bring the database **from one consistent state to
  another consistent state**.
- A **consistent state** = the database satisfies the **integrity constraints**
  specified in the schema, as well as any other constraints that should hold.
- It is the **responsibility of the database program (the programmer)**.
- Transactions can use **abort** instructions, leading to **rollbacks**
  (handled by the recovery subsystem).

### Isolation

- Ensured by the **concurrency-control subsystem**.
- Ideally we avoid all the anomalies of concurrent execution:

| Anomaly | What happens |
|---|---|
| **dirty write** | a transaction overwrites a value another uncommitted transaction has written |
| **dirty read** | a transaction reads a value written by a transaction that has not committed yet (and may roll back) |
| **non-repeatable read** | the same row read twice in one transaction gives two different values because another transaction modified it in between |
| **phantom** | the same query run twice returns a different set of rows because another transaction inserted or deleted rows |

- Full isolation may be **too expensive** in terms of efficiency, so it is often
  **relaxed** in one way or another: the **isolation levels**.
- One of the most difficult and interesting issues of transaction management.

### Durability (permanency)

- Ensured by the **recovery subsystem**.
- After a crash, the **log** is used to **restore committed transactions**
  and **roll back uncommitted ones**.
- The **cache** complicates the restoration (a committed change may still be
  sitting in memory, not yet on disk, when the crash happens).

```diagram
{
  "title": "After a crash the log lets the recovery subsystem redo what was committed and undo what was not.",
  "nodes": [
    { "id": "t1", "x": 140, "y": 40, "w": 250, "h": 40, "label": "T1 — committed before the crash", "tone": "emerald", "filled": true },
    { "id": "t2", "x": 140, "y": 120, "w": 250, "h": 40, "label": "T2 — still running at the crash", "tone": "rose", "filled": true },
    { "id": "crash", "x": 330, "y": 80, "shape": "text", "label": "✕ CRASH", "bold": true, "tone": "rose" },
    { "id": "log", "x": 450, "y": 80, "w": 120, "h": 60, "shape": "cylinder", "label": "Log", "tone": "sky", "filled": true },
    { "id": "redo", "x": 640, "y": 40, "w": 170, "h": 40, "label": "restore T1 (redo)", "tone": "emerald" },
    { "id": "undo", "x": 640, "y": 120, "w": 170, "h": 40, "label": "roll back T2 (undo)", "tone": "rose" }
  ],
  "edges": [
    { "from": "t1", "to": "log", "tone": "emerald" },
    { "from": "t2", "to": "log", "tone": "rose" },
    { "from": "log", "to": "redo", "tone": "emerald" },
    { "from": "log", "to": "undo", "tone": "rose" }
  ]
}
```

## 3. Data models

A **data model** is a **collection of conceptual tools for describing data,
data relationships, data semantics and consistency constraints**. It provides a
way to describe the *design* of a database: how data is related, stored,
retrieved and modified, using a set of symbols and terminology that the members
of an organisation can understand before communicating.

### Basic building blocks

| Block | Definition |
|---|---|
| **Entity** | anything about which data is to be collected and stored; represents a particular type of object in the real world |
| **Entity set** | a set of entities of the same type that share the same properties |
| **Attribute** | a characteristic of an entity |
| **Constraint** | a restriction placed on the data; constraints help ensure data integrity |
| **Relationship** | an association among entities |

### Relationships

Three types of relationship between two entity sets:

```diagram
{
  "title": "One-to-one, one-to-many and many-to-many relationships between two sets of entities.",
  "nodes": [
    { "id": "h1", "x": 105, "y": 8, "shape": "text", "label": "One to One (1:1)", "bold": true },
    { "id": "h2", "x": 335, "y": 8, "shape": "text", "label": "One to Many (1:M)", "bold": true },
    { "id": "h3", "x": 565, "y": 8, "shape": "text", "label": "Many to Many (M:N)", "bold": true },
    { "id": "e1a", "x": 60, "y": 100, "w": 56, "h": 130, "shape": "ellipse" }, { "id": "e1b", "x": 150, "y": 100, "w": 56, "h": 130, "shape": "ellipse" },
    { "id": "a1", "x": 60, "y": 65, "shape": "text", "label": "A" }, { "id": "b1", "x": 60, "y": 100, "shape": "text", "label": "B" }, { "id": "c1", "x": 60, "y": 135, "shape": "text", "label": "C" },
    { "id": "x1", "x": 150, "y": 65, "shape": "text", "label": "X" }, { "id": "y1", "x": 150, "y": 100, "shape": "text", "label": "Y" }, { "id": "z1", "x": 150, "y": 135, "shape": "text", "label": "Z" },
    { "id": "e2a", "x": 290, "y": 100, "w": 56, "h": 130, "shape": "ellipse" }, { "id": "e2b", "x": 380, "y": 100, "w": 56, "h": 160, "shape": "ellipse" },
    { "id": "a2", "x": 290, "y": 65, "shape": "text", "label": "A" }, { "id": "b2", "x": 290, "y": 100, "shape": "text", "label": "B" }, { "id": "c2", "x": 290, "y": 135, "shape": "text", "label": "C" },
    { "id": "x2", "x": 380, "y": 45, "shape": "text", "label": "X" }, { "id": "y2", "x": 380, "y": 73, "shape": "text", "label": "Y" }, { "id": "z2", "x": 380, "y": 100, "shape": "text", "label": "Z" }, { "id": "p2", "x": 380, "y": 127, "shape": "text", "label": "P" }, { "id": "q2", "x": 380, "y": 155, "shape": "text", "label": "Q" },
    { "id": "e3a", "x": 520, "y": 100, "w": 56, "h": 150, "shape": "ellipse" }, { "id": "e3b", "x": 610, "y": 100, "w": 56, "h": 150, "shape": "ellipse" },
    { "id": "a3", "x": 520, "y": 55, "shape": "text", "label": "A" }, { "id": "b3", "x": 520, "y": 85, "shape": "text", "label": "B" }, { "id": "c3", "x": 520, "y": 115, "shape": "text", "label": "C" }, { "id": "d3", "x": 520, "y": 145, "shape": "text", "label": "D" },
    { "id": "x3", "x": 610, "y": 55, "shape": "text", "label": "X" }, { "id": "y3", "x": 610, "y": 85, "shape": "text", "label": "Y" }, { "id": "z3", "x": 610, "y": 115, "shape": "text", "label": "Z" }, { "id": "p3", "x": 610, "y": 145, "shape": "text", "label": "P" }
  ],
  "edges": [
    { "from": "a1", "to": "x1", "arrow": "none" }, { "from": "b1", "to": "y1", "arrow": "none" }, { "from": "c1", "to": "z1", "arrow": "none" },
    { "from": "a2", "to": "x2", "arrow": "none" }, { "from": "b2", "to": "y2", "arrow": "none" }, { "from": "b2", "to": "z2", "arrow": "none" }, { "from": "c2", "to": "p2", "arrow": "none" }, { "from": "c2", "to": "q2", "arrow": "none" },
    { "from": "a3", "to": "x3", "arrow": "none" }, { "from": "a3", "to": "y3", "arrow": "none" }, { "from": "b3", "to": "y3", "arrow": "none" }, { "from": "c3", "to": "z3", "arrow": "none" }, { "from": "d3", "to": "z3", "arrow": "none" }, { "from": "d3", "to": "p3", "arrow": "none" }
  ]
}
```

- **One to one (1:1)**: one entity of A is related to exactly one entity of B.
- **One to many (1:M)**: one entity of A is related to many entities of B.
- **Many to many (M:N)**: many entities of A are related to many entities of B.

### Hierarchical model

Classifies the data into a **tree-like structure with a single parent (root)
for each record**. Sibling records are arranged in a certain sequence — the
physical order in which the database is stored. It depicts a set of **1:M
relationships between a parent and its children's segments**.

```diagram
{
  "title": "Hierarchical model: a tree, one parent per record.",
  "nodes": [
    { "id": "r", "x": 330, "y": 30, "w": 130, "h": 40, "label": "(Living)\nGreat apes", "tone": "amber", "filled": true },
    { "id": "o", "x": 90, "y": 115, "w": 110, "label": "Orangutans", "tone": "neutral", "filled": true },
    { "id": "g", "x": 250, "y": 115, "w": 110, "label": "Gorillas", "tone": "neutral", "filled": true },
    { "id": "c", "x": 410, "y": 115, "w": 110, "label": "Chimpanzees", "tone": "neutral", "filled": true },
    { "id": "h", "x": 570, "y": 115, "w": 110, "label": "Humans", "tone": "neutral", "filled": true },
    { "id": "o1", "x": 40, "y": 205, "w": 88, "h": 40, "size": 11, "label": "Bornean\norangutan" },
    { "id": "o2", "x": 135, "y": 205, "w": 88, "h": 40, "size": 11, "label": "Sumatran\norangutan" },
    { "id": "g1", "x": 230, "y": 205, "w": 88, "h": 40, "size": 11, "label": "Eastern\ngorilla" },
    { "id": "g2", "x": 325, "y": 205, "w": 88, "h": 40, "size": 11, "label": "Western\ngorilla" },
    { "id": "c1", "x": 420, "y": 205, "w": 88, "h": 40, "size": 11, "label": "Common\nchimpanzee" },
    { "id": "c2", "x": 515, "y": 205, "w": 88, "h": 40, "size": 11, "label": "Bonobo" },
    { "id": "h1", "x": 610, "y": 205, "w": 88, "h": 40, "size": 11, "label": "Modern\nhumans" }
  ],
  "edges": [
    { "from": "r", "to": "o" }, { "from": "r", "to": "g" }, { "from": "r", "to": "c" }, { "from": "r", "to": "h" },
    { "from": "o", "to": "o1" }, { "from": "o", "to": "o2" }, { "from": "g", "to": "g1" }, { "from": "g", "to": "g2" },
    { "from": "c", "to": "c1" }, { "from": "c", "to": "c2" }, { "from": "h", "to": "h1" }
  ]
}
```

| Advantages | Disadvantages |
|---|---|
| very simple and fast to traverse a tree-like structure | complex relationships are not supported |
| any change in the parent node is automatically reflected in the child node, so data integrity is maintained | a child node cannot have **two parents**: such a relationship cannot be represented |
| | if a parent node is deleted, the child node is **automatically deleted** |

### Network model

An **expansion of the hierarchical model**, the most prevalent model prior to
the relational model. The main difference: **a record can have several
parents** — the hierarchical *tree* is replaced by a **graph**.

```diagram
{
  "title": "Network model: Student has two parents, CSE Department and Library — impossible in the hierarchical model.",
  "nodes": [
    { "id": "col", "x": 330, "y": 30, "w": 110, "label": "College", "tone": "amber", "filled": true },
    { "id": "cse", "x": 190, "y": 115, "w": 130, "label": "CSE Department", "tone": "neutral", "filled": true },
    { "id": "lib", "x": 470, "y": 115, "w": 110, "label": "Library", "tone": "neutral", "filled": true },
    { "id": "stu", "x": 330, "y": 200, "w": 110, "label": "Student", "tone": "rose", "filled": true },
    { "id": "n", "x": 560, "y": 200, "w": 150, "h": 36, "shape": "note", "size": 11, "label": "two parents:\nallowed in a graph", "tone": "rose" }
  ],
  "edges": [
    { "from": "col", "to": "cse" }, { "from": "col", "to": "lib" },
    { "from": "cse", "to": "stu" }, { "from": "lib", "to": "stu" }
  ]
}
```

| Advantages | Disadvantages |
|---|---|
| data may be obtained more quickly than with the hierarchical approach: the data is more linked, there may be **more than one path** to a node, so information can be accessed in a variety of ways | as relationships are added the system gets **increasingly complicated**; a user needs a full understanding of the model to operate it |
| data integrity is present thanks to the parent-child connection: changes to the parent record are mirrored in the child record | any modification (update, deletion, insertion) is quite **difficult** |

### Entity-Relationship (E-R) model

A **high-level data model diagram**: we express the real-world problem **in
visual form** so stakeholders can grasp it easily, and developers understand
the system. The **E-R diagram** is the visual tool used to depict an E-R model.
It is made up of **three parts**:

```er
{
  "title": "The three parts of an E-R diagram: entities (rectangles), attributes (ovals), relationships (diamonds).",
  "nodes": [
    { "id": "e", "kind": "entity", "label": "Entity", "x": 90, "y": 40 },
    { "id": "a", "kind": "attribute", "label": "Attribute", "x": 320, "y": 40 },
    { "id": "r", "kind": "relationship", "label": "Relationship", "x": 560, "y": 40 }
  ],
  "edges": []
}
```

```er
{
  "title": "An E-R model: Teacher works for Department.",
  "nodes": [
    { "id": "t", "kind": "entity", "label": "Teacher", "x": 170, "y": 150 },
    { "id": "tn", "kind": "attribute", "label": "Teacher_name", "x": 70, "y": 50 },
    { "id": "ti", "kind": "key_attribute", "label": "Teacher_id", "x": 220, "y": 40 },
    { "id": "tm", "kind": "attribute", "label": "Mobile_no", "x": 60, "y": 250 },
    { "id": "ts", "kind": "attribute", "label": "Salary", "x": 180, "y": 270 },
    { "id": "ta", "kind": "attribute", "label": "Age", "x": 290, "y": 250 },
    { "id": "w", "kind": "relationship", "label": "Works for", "x": 380, "y": 150 },
    { "id": "d", "kind": "entity", "label": "Department", "x": 580, "y": 150 },
    { "id": "di", "kind": "key_attribute", "label": "Dept_id", "x": 520, "y": 50 },
    { "id": "dn", "kind": "attribute", "label": "Dept_name", "x": 620, "y": 250 }
  ],
  "edges": [
    { "from": "t", "to": "tn" }, { "from": "t", "to": "ti" }, { "from": "t", "to": "tm" }, { "from": "t", "to": "ts" }, { "from": "t", "to": "ta" },
    { "from": "t", "to": "w" }, { "from": "w", "to": "d" },
    { "from": "d", "to": "di" }, { "from": "d", "to": "dn" }
  ]
}
```

| Advantages | Disadvantages |
|---|---|
| **Simple**: conceptually very easy to build — if we know the relationship between the attributes and the entities, we can draw the diagram | **No industry standard for notation**: one developer might use notations other developers do not understand |
| **Effective communication tool**: widely used by database designers to communicate their ideas | **Hidden information**: it is a high-level view, so some details may be lost or hidden |
| **Easy conversion to any model**: maps well to the relational model (E-R → tables) and can also be converted to the network or hierarchical model | |

### Relational model

The **most common** model. Data is kept in **two-dimensional tables** (rows
and columns); the tables are also called **relations**.

```diagram
{
  "title": "Relational model: tables linked through shared key columns.",
  "nodes": [
    { "id": "s", "x": 150, "y": 70, "shape": "table", "size": 12, "tone": "emerald", "label": "student", "rows": [["student_id","name","age"],["1","Akon","17"],["2","Bkon","16"],["3","Ckon","17"],["4","Dkon","18"]] },
    { "id": "j", "x": 480, "y": 70, "shape": "table", "size": 12, "tone": "emerald", "label": "subject", "rows": [["subject_id","name","teacher"],["1","Java","Mr. J"],["2","C++","Miss C"],["3","C#","Mr. C Hash"],["4","Php","Mr. P H P"]] },
    { "id": "m", "x": 315, "y": 270, "shape": "table", "size": 12, "tone": "emerald", "label": "marks", "rows": [["student_id","subject_id","marks"],["1","1","98"],["1","2","78"],["2","1","76"],["3","2","88"]] }
  ],
  "edges": [
    { "from": "s", "to": "m", "label": "student_id", "via": [[150, 190], [250, 190]] },
    { "from": "j", "to": "m", "label": "subject_id", "via": [[480, 190], [380, 190]] }
  ]
}
```

| Advantages | Disadvantages |
|---|---|
| **Simple**: simpler than the network and hierarchical models | **Hardware overheads**: hiding the complexity requires more powerful computers and storage |
| **Scalable**: add as many rows and columns as needed | **Bad design**: it is so easy to design and use that users need not know how the data is stored — which can lead to a poor database that slows down as it grows |
| **Structural independence**: the structure can change without changing the way the data is accessed | |

### Object-oriented (OO) model

A database is a **collection of objects** (reusable software parts) with
related characteristics and operations. Several kinds: a **multimedia
database** holds media (photos) that would be impossible to store in a
relational database; a **hypertext database** lets any object link to any other
object (good for large heterogeneous data, not for numerical analysis). Because
it integrates but is not limited to tables, the OO model is the best-known
**post-relational** (or *hybrid*) paradigm. Most used with OO languages: Java,
Kotlin, C#, Node JS, Swift.

```diagram
{
  "title": "An object bundles attributes and operations; an object-relational table can hold a complex, structured value in a column.",
  "nodes": [
    { "id": "h1", "x": 150, "y": 8, "shape": "text", "label": "Object-oriented: object", "bold": true },
    { "id": "h2", "x": 470, "y": 8, "shape": "text", "label": "Object-relational: table with a complex type", "bold": true },
    { "id": "o", "x": 150, "y": 110, "shape": "table", "size": 12, "tone": "violet", "cols": [180], "rows": [["Employee"],["emp_id : int"],["name : string"],["salary : float"],["raise_salary()"],["get_details()"]] },
    { "id": "t", "x": 470, "y": 80, "shape": "table", "size": 12, "tone": "sky", "rows": [["emp_id","name","address (composite type)"],["1","Kim","{ street, city, zip }"],["2","Lee","{ street, city, zip }"]] }
  ],
  "edges": []
}
```

| Advantages | Disadvantages |
|---|---|
| complex data sets can be saved and retrieved quickly and easily | object databases are **not widely adopted** |
| object IDs are assigned automatically | high complexity can cause **performance problems** |
| works well with OO programming languages; semantic content is added; support for complex objects; visual representation includes semantic content | high system overheads slow transactions |

### Object-relational (OR) model

A **hybrid of the relational and object-oriented models**, created to bridge
the gap between them. It allows sophisticated features such as creating
complicated data types from existing ones. Its issue: it may become complicated
and difficult to manage, so a thorough comprehension of the paradigm is
essential.

| Object-oriented database | Object-relational database |
|---|---|
| represents information as **objects**, as in OOP; depends on OOP | depends on the relational **and** the OO data model: a hybrid |
| relationships represented by **references via the object identifier (OID)** | connections between two relations represented by **foreign key** attributes referencing the primary key of another relation |
| handles larger and more complex data than an RDBMS | handles comparatively simpler data |
| less efficient | comparatively more efficient |
| the data-management language is typically incorporated into a programming language such as C++ | data-manipulation languages such as **SQL, QUEL, QBE**, based on relational calculus |

### Semi-structured model

Emerged from the relational model. **We cannot tell the difference between data
and schema**: for web-based data, the website's structure and its data are not
distinguishable. Some entities may be missing attributes, others may have extra
ones — greater flexibility of storage. Examples of semi-structured sources:
emails, XML and other markup languages, binary executables, TCP/IP packets,
zipped files, data integrated from different sources, web pages.

## 4. E-R diagrams — part 1

**Database design** is a collection of processes that facilitate the designing,
development, implementation and maintenance of enterprise database management
systems. The **E-R diagram** (Entity-Relationship diagram) is a **graphical
(pictorial) representation of a database** that uses different symbols to
represent the different objects of the database.

### Entity

An **entity** is a person, a place or an object. It is represented by a
**rectangle** containing the name of the entity. Entities of a college
database: Student, Professor/Faculty, Course, Department, Result, Class,
Subject.

```er
{
  "title": "Entities are drawn as rectangles.",
  "nodes": [
    { "id": "s", "kind": "entity", "label": "Student", "x": 90, "y": 40 },
    { "id": "f", "kind": "entity", "label": "Faculty", "x": 280, "y": 40 },
    { "id": "c", "kind": "entity", "label": "Course", "x": 470, "y": 40 }
  ],
  "edges": []
}
```

An **entity set** is a set (group) of entities of the same type: all persons
having an account in a bank, all the students studying in a college, all the
professors working in a college, the set of all accounts in a bank.

> *Exercises from the slides:* write down the entities of a bank database
> (Customer, Account, Loan, Branch, Employee, Transaction…) and of a hospital
> database (Patient, Doctor, Nurse, Ward, Appointment, Prescription…).

### Attributes

An **attribute** is a property or detail about an entity, represented by an
**oval** containing its name.

```er
{
  "title": "Attributes of the entity Student, drawn as ovals. The primary key (RollNo) is underlined.",
  "nodes": [
    { "id": "s", "kind": "entity", "label": "Student", "x": 320, "y": 160 },
    { "id": "a1", "kind": "key_attribute", "label": "Roll No", "x": 120, "y": 60 },
    { "id": "a2", "kind": "attribute", "label": "Student Name", "x": 250, "y": 40 },
    { "id": "a3", "kind": "attribute", "label": "Branch", "x": 400, "y": 40 },
    { "id": "a4", "kind": "attribute", "label": "Semester", "x": 540, "y": 60 },
    { "id": "a5", "kind": "attribute", "label": "Address", "x": 110, "y": 160 },
    { "id": "a6", "kind": "attribute", "label": "Mobile No", "x": 540, "y": 160 },
    { "id": "a7", "kind": "attribute", "label": "Age", "x": 200, "y": 270 },
    { "id": "a8", "kind": "attribute", "label": "SPI", "x": 440, "y": 270 }
  ],
  "edges": [
    { "from": "s", "to": "a1" }, { "from": "s", "to": "a2" }, { "from": "s", "to": "a3" }, { "from": "s", "to": "a4" },
    { "from": "s", "to": "a5" }, { "from": "s", "to": "a6" }, { "from": "s", "to": "a7" }, { "from": "s", "to": "a8" }
  ]
}
```

> *Exercises from the slides:* the attributes of a Faculty entity (FacID,
> Name, Branch, Experience, Salary, Mobile No…) and of an Account entity
> (AccNo, Type, Balance, Open Date…).

### Types of attributes

Three independent pairs of opposites.

| | | |
|---|---|---|
| **Simple** | cannot be divided into subparts | `RollNo`, `CPI` |
| **Composite** | can be divided into subparts | `Name` (first name, middle name, last name), `Address` (street, road, city) |

```er
{
  "title": "Simple attribute (Roll No) vs composite attribute (Name, split into first, middle and last name).",
  "nodes": [
    { "id": "r", "kind": "attribute", "label": "Roll No", "x": 90, "y": 60 },
    { "id": "n", "kind": "attribute", "label": "Name", "x": 400, "y": 40 },
    { "id": "f", "kind": "attribute", "label": "First name", "x": 280, "y": 140 },
    { "id": "m", "kind": "attribute", "label": "Middle name", "x": 400, "y": 160 },
    { "id": "l", "kind": "attribute", "label": "Last name", "x": 520, "y": 140 }
  ],
  "edges": [
    { "from": "n", "to": "f" }, { "from": "n", "to": "m" }, { "from": "n", "to": "l" }
  ]
}
```

| | | |
|---|---|---|
| **Single-valued** | has a single value | `RollNo`, `CPI` |
| **Multi-valued** | has multiple (more than one) values | `PhoneNo` (a person may have several phone numbers), `EmailID` |

```er
{
  "title": "Single-valued attribute (one oval) vs multi-valued attribute (double oval).",
  "nodes": [
    { "id": "r", "kind": "attribute", "label": "Roll No", "x": 120, "y": 40 },
    { "id": "p", "kind": "multi_attribute", "label": "Phone No", "x": 380, "y": 40 }
  ],
  "edges": []
}
```

| | | |
|---|---|---|
| **Stored** | its value is stored manually in the database | `Birthdate` |
| **Derived** | its value is derived or calculated from other attributes | `Age` (computed from the current date and the birthdate) |

```er
{
  "title": "Stored attribute (solid oval) vs derived attribute (dashed oval).",
  "nodes": [
    { "id": "b", "kind": "attribute", "label": "Birthdate", "x": 120, "y": 40 },
    { "id": "a", "kind": "derived_attribute", "label": "Age", "x": 380, "y": 40 }
  ],
  "edges": []
}
```

All of them on one entity — **learn this figure**, it is the reference:

```er
{
  "title": "Entity Student with every type of attribute: key, composite (Name, Address), derived (Age), multi-valued (Phone No), stored (Birth Date).",
  "nodes": [
    { "id": "s", "kind": "entity", "label": "Student", "x": 330, "y": 200 },
    { "id": "rn", "kind": "key_attribute", "label": "RollNo", "x": 160, "y": 110 },
    { "id": "n", "kind": "attribute", "label": "Name", "x": 330, "y": 95 },
    { "id": "fn", "kind": "attribute", "label": "First Name", "x": 210, "y": 30 },
    { "id": "mn", "kind": "attribute", "label": "Middle Name", "x": 330, "y": 15 },
    { "id": "ln", "kind": "attribute", "label": "Last Name", "x": 450, "y": 30 },
    { "id": "ag", "kind": "derived_attribute", "label": "Age", "x": 110, "y": 200 },
    { "id": "ph", "kind": "multi_attribute", "label": "Phone No", "x": 160, "y": 295 },
    { "id": "bd", "kind": "attribute", "label": "Birth Date", "x": 330, "y": 310 },
    { "id": "ad", "kind": "attribute", "label": "Address", "x": 530, "y": 200 },
    { "id": "ap", "kind": "attribute", "label": "Apartment", "x": 640, "y": 120 },
    { "id": "st", "kind": "attribute", "label": "Street", "x": 660, "y": 200 },
    { "id": "ar", "kind": "attribute", "label": "Area", "x": 640, "y": 280 }
  ],
  "edges": [
    { "from": "s", "to": "rn" }, { "from": "s", "to": "n" }, { "from": "n", "to": "fn" }, { "from": "n", "to": "mn" }, { "from": "n", "to": "ln" },
    { "from": "s", "to": "ag" }, { "from": "s", "to": "ph" }, { "from": "s", "to": "bd" },
    { "from": "s", "to": "ad" }, { "from": "ad", "to": "ap" }, { "from": "ad", "to": "st" }, { "from": "ad", "to": "ar" }
  ]
}
```

| On the figure | Type | Why |
|---|---|---|
| `RollNo` | key attribute (single-valued, simple) | identifies a student; underlined |
| `Name`, `Address` | composite | split into sub-attributes |
| `Age` | derived | computed from `Birth Date` — dashed oval |
| `Phone No` | multi-valued | a student may have several — double oval |
| `Birth Date` | stored | typed in, kept as is |

### Relationship

A **relationship** is an association (connection) between several entities. It
is placed **between two entities**, with a **line connecting it to each
entity**, and is represented by a **diamond** containing the relationship's
name.

```er
{
  "title": "A relationship (diamond) between two entities.",
  "nodes": [
    { "id": "s", "kind": "entity", "label": "Student", "x": 100, "y": 40 },
    { "id": "i", "kind": "relationship", "label": "Issue", "x": 320, "y": 40 },
    { "id": "b", "kind": "entity", "label": "Book", "x": 540, "y": 40 }
  ],
  "edges": [
    { "from": "s", "to": "i" }, { "from": "i", "to": "b" }
  ]
}
```

A **descriptive attribute** is an attribute **of the relationship** (not of an
entity): the date at which a book is issued belongs to the `Issue`
relationship, not to `Student` nor to `Book`.

### E-R diagram of a library system

```er
{
  "title": "Library system: two entities with their attributes and primary keys, the binary relationship Issue and its descriptive attribute Issue Date.",
  "nodes": [
    { "id": "s", "kind": "entity", "label": "Student", "x": 150, "y": 160 },
    { "id": "rn", "kind": "key_attribute", "label": "RollNo", "x": 60, "y": 60 },
    { "id": "sn", "kind": "attribute", "label": "Name", "x": 200, "y": 50 },
    { "id": "br", "kind": "attribute", "label": "Branch", "x": 60, "y": 260 },
    { "id": "se", "kind": "attribute", "label": "Sem", "x": 200, "y": 270 },
    { "id": "i", "kind": "relationship", "label": "Issue", "x": 330, "y": 160 },
    { "id": "dt", "kind": "attribute", "label": "Issue Date", "x": 330, "y": 50 },
    { "id": "b", "kind": "entity", "label": "Book", "x": 510, "y": 160 },
    { "id": "bn", "kind": "key_attribute", "label": "BookNo", "x": 450, "y": 50 },
    { "id": "bnm", "kind": "attribute", "label": "Name", "x": 600, "y": 60 },
    { "id": "au", "kind": "attribute", "label": "Author", "x": 450, "y": 270 },
    { "id": "pr", "kind": "attribute", "label": "Price", "x": 600, "y": 260 }
  ],
  "edges": [
    { "from": "s", "to": "rn" }, { "from": "s", "to": "sn" }, { "from": "s", "to": "br" }, { "from": "s", "to": "se" },
    { "from": "s", "to": "i" }, { "from": "i", "to": "b" }, { "from": "i", "to": "dt" },
    { "from": "b", "to": "bn" }, { "from": "b", "to": "bnm" }, { "from": "b", "to": "au" }, { "from": "b", "to": "pr" }
  ]
}
```

Two rules stated on the slide:

- **Each and every entity must have one primary key attribute** (underlined).
- A relationship between **2 entities** is called a **binary relationship**.

### Ternary relationship

A relationship between **3 entities** is called a **ternary relationship**.

```er
{
  "title": "Ternary relationship: Guide links Faculty, Student and Project.",
  "nodes": [
    { "id": "p", "kind": "entity", "label": "Project", "x": 330, "y": 70 },
    { "id": "pi", "kind": "key_attribute", "label": "ProjectID", "x": 190, "y": 30 },
    { "id": "pn", "kind": "attribute", "label": "Project Name", "x": 480, "y": 30 },
    { "id": "g", "kind": "relationship", "label": "Guide", "x": 330, "y": 200 },
    { "id": "f", "kind": "entity", "label": "Faculty", "x": 110, "y": 270 },
    { "id": "fi", "kind": "key_attribute", "label": "FacID", "x": 30, "y": 190 },
    { "id": "fn", "kind": "attribute", "label": "Name", "x": 180, "y": 190 },
    { "id": "fb", "kind": "attribute", "label": "Branch", "x": 30, "y": 350 },
    { "id": "ft", "kind": "attribute", "label": "Technology", "x": 180, "y": 350 },
    { "id": "s", "kind": "entity", "label": "Student", "x": 550, "y": 270 },
    { "id": "sr", "kind": "key_attribute", "label": "RollNo", "x": 480, "y": 190 },
    { "id": "sn", "kind": "attribute", "label": "Name", "x": 630, "y": 190 },
    { "id": "sb", "kind": "attribute", "label": "Branch", "x": 480, "y": 350 },
    { "id": "ss", "kind": "attribute", "label": "Sem", "x": 630, "y": 350 }
  ],
  "edges": [
    { "from": "p", "to": "pi" }, { "from": "p", "to": "pn" },
    { "from": "g", "to": "p" }, { "from": "g", "to": "f" }, { "from": "g", "to": "s" },
    { "from": "f", "to": "fi" }, { "from": "f", "to": "fn" }, { "from": "f", "to": "fb" }, { "from": "f", "to": "ft" },
    { "from": "s", "to": "sr" }, { "from": "s", "to": "sn" }, { "from": "s", "to": "sb" }, { "from": "s", "to": "ss" }
  ]
}
```

### Exercise — pairs of entities

> Draw an E-R diagram for each pair: Customer & Account, Customer & Loan,
> Doctor & Patient, Student & Project, Student & Teacher. Take **four
> attributes per entity, one of them the primary key**, and a proper
> relationship between the two.

Worked example, *Customer & Account*:

```er
{
  "title": "Customer holds Account: four attributes per entity, one key each, a diamond in between.",
  "nodes": [
    { "id": "c", "kind": "entity", "label": "Customer", "x": 150, "y": 150 },
    { "id": "c1", "kind": "key_attribute", "label": "CustID", "x": 60, "y": 50 },
    { "id": "c2", "kind": "attribute", "label": "Name", "x": 200, "y": 40 },
    { "id": "c3", "kind": "attribute", "label": "Address", "x": 60, "y": 250 },
    { "id": "c4", "kind": "attribute", "label": "Phone", "x": 200, "y": 260 },
    { "id": "h", "kind": "relationship", "label": "Holds", "x": 340, "y": 150 },
    { "id": "a", "kind": "entity", "label": "Account", "x": 530, "y": 150 },
    { "id": "a1", "kind": "key_attribute", "label": "AccNo", "x": 460, "y": 40 },
    { "id": "a2", "kind": "attribute", "label": "Type", "x": 610, "y": 50 },
    { "id": "a3", "kind": "attribute", "label": "Balance", "x": 460, "y": 260 },
    { "id": "a4", "kind": "attribute", "label": "Open Date", "x": 620, "y": 250 }
  ],
  "edges": [
    { "from": "c", "to": "c1" }, { "from": "c", "to": "c2" }, { "from": "c", "to": "c3" }, { "from": "c", "to": "c4" },
    { "from": "c", "to": "h" }, { "from": "h", "to": "a" },
    { "from": "a", "to": "a1" }, { "from": "a", "to": "a2" }, { "from": "a", "to": "a3" }, { "from": "a", "to": "a4" }
  ]
}
```

Same recipe for the others: `Customer` —`Takes`— `Loan` (LoanNo, Amount,
Rate, Term); `Doctor` —`Treats`— `Patient` (PatientID, Name, Age, Disease);
`Student` —`Works on`— `Project` (ProjectID, Title, Domain, Deadline);
`Student` —`Taught by`— `Teacher` (TeacherID, Name, Subject, Experience).
Week 3 adds what is still missing on these diagrams: the **cardinality** on
each line.

---

## To remember

- Table = rows (records / tuples) × columns (fields / attributes). **Schema** =
  the structure without data; **instance** = the content at one moment.
  Physical / logical / view schema = the three ANSI-SPARC levels.
- **ACID**: Atomicity (all or nothing — recovery subsystem, log, old values),
  Consistency (integrity constraints hold — the programmer), Isolation (no
  interference — concurrency control; anomalies: dirty write/read,
  non-repeatable read, phantom; relaxed via isolation levels), Durability
  (commits persist — recovery subsystem, log redo/undo after a crash).
- A **data model** = conceptual tools to describe data, relationships,
  semantics and constraints. Blocks: entity, entity set, attribute, constraint.
- Models: **hierarchical** (tree, one parent, 1:M), **network** (graph, several
  parents), **E-R** (high-level, visual, three parts), **relational** (tables =
  relations, the most common), **OO** (objects, OID references), **OR**
  (hybrid, foreign keys), **semi-structured** (schema and data mixed: XML,
  emails, web pages).
- E-R: **rectangle** = entity, **oval** = attribute, **diamond** = relationship.
  Key attribute **underlined**. Composite = sub-ovals; multi-valued = **double
  oval**; derived = **dashed oval**. Every entity needs a primary key.
  Descriptive attribute = attribute of a relationship. Binary = 2 entities,
  ternary = 3.
