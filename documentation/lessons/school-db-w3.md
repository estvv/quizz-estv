# Database Design — Week 3

Lecture 05 — *E-R Diagrams – 2*. Roles, recursive relationship sets, mapping
cardinality, participation constraints, weak entity sets, superclass /
subclass, generalization vs specialization, and a full worked example (the NHL
database).

---

## 0. The symbols, all in one place

```er
{
  "title": "E-R diagram symbols (Chen notation, as used in the course).",
  "nodes": [
    { "id": "e", "kind": "entity", "label": "Strong entity set", "x": 130, "y": 40 },
    { "id": "w", "kind": "weak_entity", "label": "Weak entity set", "x": 130, "y": 115 },
    { "id": "r", "kind": "relationship", "label": "Strong relationship", "x": 130, "y": 205 },
    { "id": "ir", "kind": "identifying_relationship", "label": "Weak relationship", "x": 130, "y": 300 },
    { "id": "isa", "kind": "isa", "label": "ISA", "x": 130, "y": 385 },
    { "id": "a", "kind": "attribute", "label": "Simple attribute", "x": 450, "y": 40 },
    { "id": "k", "kind": "key_attribute", "label": "Key attribute", "x": 450, "y": 105 },
    { "id": "pk", "kind": "partial_key_attribute", "label": "Partial key (discriminator)", "x": 450, "y": 170 },
    { "id": "m", "kind": "multi_attribute", "label": "Multivalued attribute", "x": 450, "y": 240 },
    { "id": "d", "kind": "derived_attribute", "label": "Derived attribute", "x": 450, "y": 310 },
    { "id": "c", "kind": "attribute", "label": "Composite attribute", "x": 450, "y": 375 },
    { "id": "c1", "kind": "attribute", "label": "part 1", "x": 380, "y": 440 },
    { "id": "c2", "kind": "attribute", "label": "part 2", "x": 520, "y": 440 }
  ],
  "edges": [
    { "from": "c", "to": "c1" }, { "from": "c", "to": "c2" }
  ]
}
```

| Symbol | Meaning |
|---|---|
| rectangle | strong entity set (has its own primary key) |
| **double** rectangle | **weak** entity set (no primary key of its own) |
| diamond | relationship set |
| **double** diamond | **identifying** (weak) relationship, tying a weak entity to its strong entity |
| oval | attribute; **underlined** = key attribute; **dashed underline** = discriminator; **double** oval = multivalued; **dashed** oval = derived; oval with sub-ovals = composite |
| triangle "ISA" | superclass / subclass link (generalization, specialization) |
| single line | (partial) participation of an entity set in a relationship |
| **double** line | **total** participation |
| `1` / `N` on a line | mapping cardinality |

## 1. Role names

**Roles** are indicated by **labelling the lines** that connect a diamond
(relationship) to a rectangle (entity). Role labels are **optional**; they are
used to clarify the **semantics** (meaning) of the relationship — especially
when the same entity set appears twice.

```er
{
  "title": "Faculty takes part in Reports_To twice, once as Coordinator and once as Head: the two labels are roles.",
  "nodes": [
    { "id": "f", "kind": "entity", "label": "Faculty", "x": 200, "y": 160 },
    { "id": "id", "kind": "key_attribute", "label": "EmpID", "x": 100, "y": 60 },
    { "id": "nm", "kind": "attribute", "label": "Name", "x": 270, "y": 50 },
    { "id": "br", "kind": "attribute", "label": "Branch", "x": 100, "y": 270 },
    { "id": "ex", "kind": "attribute", "label": "Experience", "x": 280, "y": 280 },
    { "id": "r", "kind": "relationship", "label": "Reports_To", "x": 520, "y": 160 }
  ],
  "edges": [
    { "from": "f", "to": "id" }, { "from": "f", "to": "nm" }, { "from": "f", "to": "br" }, { "from": "f", "to": "ex" },
    { "from": "f", "to": "r", "role": "Coordinator" },
    { "from": "f", "to": "r", "role": "Head" }
  ]
}
```

The labels *Coordinator* and *Head* specify **which Faculty entities interact
with which** via the `Reports_To` relationship set.

## 2. Recursive relationship set

When **the same entity set participates in a relationship set more than
once**, the relationship set is **recursive**. `Reports_To` above is recursive:
both of its ends are `Faculty`.

```er
{
  "title": "Faculty works in a Department (ordinary binary relationship) and Faculty reports to Faculty (recursive relationship set).",
  "nodes": [
    { "id": "f", "kind": "entity", "label": "Faculty", "x": 160, "y": 160 },
    { "id": "fi", "kind": "key_attribute", "label": "FacID", "x": 60, "y": 60 },
    { "id": "fn", "kind": "attribute", "label": "FName", "x": 220, "y": 50 },
    { "id": "po", "kind": "attribute", "label": "Post", "x": 40, "y": 260 },
    { "id": "w", "kind": "relationship", "label": "Works", "x": 380, "y": 160 },
    { "id": "d", "kind": "entity", "label": "Department", "x": 590, "y": 160 },
    { "id": "di", "kind": "key_attribute", "label": "DeptID", "x": 520, "y": 60 },
    { "id": "dn", "kind": "attribute", "label": "DName", "x": 660, "y": 60 },
    { "id": "rr", "kind": "relationship", "label": "Reports_To", "x": 160, "y": 330 }
  ],
  "edges": [
    { "from": "f", "to": "fi" }, { "from": "f", "to": "fn" }, { "from": "f", "to": "po" },
    { "from": "f", "to": "w" }, { "from": "w", "to": "d" },
    { "from": "d", "to": "di" }, { "from": "d", "to": "dn" },
    { "from": "f", "to": "rr", "role": "HOD" },
    { "from": "f", "to": "rr", "role": "Prof." }
  ]
}
```

With data, the recursion is obvious: a professor's *head* is another row of the
same `Faculty` table.

```diagram
{
  "title": "Instances: Lee and Kim (professors) report to David (HOD) — all three are Faculty rows.",
  "nodes": [
    { "id": "f", "x": 160, "y": 60, "shape": "table", "size": 12, "tone": "sky", "label": "Faculty", "rows": [["FName","Post"],["Lee","Professor"],["Kim","Professor"],["David","HOD"]], "mark": [3] },
    { "id": "d", "x": 500, "y": 60, "shape": "table", "size": 12, "tone": "sky", "label": "Department", "rows": [["DName"],["Computer"],["Civil"],["Mechanical"]] },
    { "id": "n", "x": 160, "y": 175, "w": 260, "h": 34, "shape": "note", "size": 12, "label": "Reports_To: Lee → David, Kim → David", "tone": "amber" }
  ],
  "edges": [
    { "from": "n", "to": "f", "tone": "amber", "dashed": true }
  ]
}
```

## 3. Mapping cardinality (cardinality constraints)

The mapping cardinality represents **the number of entities of another entity
set that can be connected to one entity through a relationship set**. It is
most useful for describing **binary** relationship sets, where it must be one
of four types. The examples use `customer` —`borrow`— `loan`.

### One-to-one (1 – 1)

An entity in A is associated with **only one** entity in B, and an entity in B
is associated with **only one** entity in A.

```diagram
{
  "title": "1 – 1: each customer holds one loan and each loan belongs to one customer.",
  "nodes": [
    { "id": "ha", "x": 80, "y": 12, "shape": "text", "label": "customer", "bold": true },
    { "id": "hb", "x": 240, "y": 12, "shape": "text", "label": "loan", "bold": true },
    { "id": "sa", "x": 80, "y": 110, "w": 64, "h": 150, "shape": "ellipse" },
    { "id": "sb", "x": 240, "y": 110, "w": 64, "h": 150, "shape": "ellipse" },
    { "id": "c1", "x": 80, "y": 70, "shape": "text", "label": "C1" }, { "id": "c2", "x": 80, "y": 110, "shape": "text", "label": "C2" }, { "id": "c3", "x": 80, "y": 150, "shape": "text", "label": "C3" },
    { "id": "l1", "x": 240, "y": 70, "shape": "text", "label": "L1" }, { "id": "l2", "x": 240, "y": 110, "shape": "text", "label": "L2" }, { "id": "l3", "x": 240, "y": 150, "shape": "text", "label": "L3" },
    { "id": "e1", "x": 400, "y": 110, "w": 100, "label": "customer", "tone": "sky" },
    { "id": "r", "x": 540, "y": 110, "shape": "diamond", "label": "borrow", "tone": "amber" },
    { "id": "e2", "x": 680, "y": 110, "w": 100, "label": "loan", "tone": "sky" }
  ],
  "edges": [
    { "from": "c1", "to": "l1", "arrow": "none" }, { "from": "c2", "to": "l2", "arrow": "none" }, { "from": "c3", "to": "l3", "arrow": "none" },
    { "from": "e1", "to": "r", "arrow": "none", "label": "1", "bold": true },
    { "from": "r", "to": "e2", "arrow": "none", "label": "1", "bold": true }
  ]
}
```

### One-to-many (1 – N)

An entity in A is associated with **more than one** entity in B, and an entity
in B is associated with **only one** entity in A. *A loan is connected with only
one customer, but a customer may hold several loans.*

```diagram
{
  "title": "1 – N: a customer may hold several loans; each loan has a single customer.",
  "nodes": [
    { "id": "ha", "x": 80, "y": 12, "shape": "text", "label": "customer", "bold": true },
    { "id": "hb", "x": 240, "y": 12, "shape": "text", "label": "loan", "bold": true },
    { "id": "sa", "x": 80, "y": 120, "w": 64, "h": 150, "shape": "ellipse" },
    { "id": "sb", "x": 240, "y": 120, "w": 64, "h": 180, "shape": "ellipse" },
    { "id": "c1", "x": 80, "y": 80, "shape": "text", "label": "C1" }, { "id": "c2", "x": 80, "y": 120, "shape": "text", "label": "C2" }, { "id": "c3", "x": 80, "y": 160, "shape": "text", "label": "C3" },
    { "id": "l1", "x": 240, "y": 66, "shape": "text", "label": "L1" }, { "id": "l2", "x": 240, "y": 102, "shape": "text", "label": "L2" }, { "id": "l3", "x": 240, "y": 138, "shape": "text", "label": "L3" }, { "id": "l4", "x": 240, "y": 174, "shape": "text", "label": "L4" },
    { "id": "e1", "x": 400, "y": 120, "w": 100, "label": "customer", "tone": "sky" },
    { "id": "r", "x": 540, "y": 120, "shape": "diamond", "label": "borrow", "tone": "amber" },
    { "id": "e2", "x": 680, "y": 120, "w": 100, "label": "loan", "tone": "sky" }
  ],
  "edges": [
    { "from": "c1", "to": "l1", "arrow": "none" }, { "from": "c1", "to": "l2", "arrow": "none" }, { "from": "c2", "to": "l3", "arrow": "none" }, { "from": "c3", "to": "l4", "arrow": "none" },
    { "from": "e1", "to": "r", "arrow": "none", "label": "1", "bold": true },
    { "from": "r", "to": "e2", "arrow": "none", "label": "N", "bold": true }
  ]
}
```

### Many-to-one (N – 1)

An entity in A is associated with **only one** entity in B, and an entity in B
is associated with **more than one** entity in A. *A loan is connected with
more than one customer (a joint loan), but a customer holds only one loan.*

```diagram
{
  "title": "N – 1: several customers can share one loan; each customer holds a single loan.",
  "nodes": [
    { "id": "ha", "x": 80, "y": 12, "shape": "text", "label": "customer", "bold": true },
    { "id": "hb", "x": 240, "y": 12, "shape": "text", "label": "loan", "bold": true },
    { "id": "sa", "x": 80, "y": 120, "w": 64, "h": 180, "shape": "ellipse" },
    { "id": "sb", "x": 240, "y": 120, "w": 64, "h": 150, "shape": "ellipse" },
    { "id": "c1", "x": 80, "y": 66, "shape": "text", "label": "C1" }, { "id": "c2", "x": 80, "y": 102, "shape": "text", "label": "C2" }, { "id": "c3", "x": 80, "y": 138, "shape": "text", "label": "C3" }, { "id": "c4", "x": 80, "y": 174, "shape": "text", "label": "C4" },
    { "id": "l1", "x": 240, "y": 80, "shape": "text", "label": "L1" }, { "id": "l2", "x": 240, "y": 120, "shape": "text", "label": "L2" }, { "id": "l3", "x": 240, "y": 160, "shape": "text", "label": "L3" },
    { "id": "e1", "x": 400, "y": 120, "w": 100, "label": "customer", "tone": "sky" },
    { "id": "r", "x": 540, "y": 120, "shape": "diamond", "label": "borrow", "tone": "amber" },
    { "id": "e2", "x": 680, "y": 120, "w": 100, "label": "loan", "tone": "sky" }
  ],
  "edges": [
    { "from": "c1", "to": "l1", "arrow": "none" }, { "from": "c2", "to": "l1", "arrow": "none" }, { "from": "c3", "to": "l2", "arrow": "none" }, { "from": "c4", "to": "l3", "arrow": "none" },
    { "from": "e1", "to": "r", "arrow": "none", "label": "N", "bold": true },
    { "from": "r", "to": "e2", "arrow": "none", "label": "1", "bold": true }
  ]
}
```

### Many-to-many (N – N)

An entity in A is associated with **more than one** entity in B, and an entity
in B is associated with **more than one** entity in A. *A customer holds
several loans and a loan can be shared by several customers.*

```diagram
{
  "title": "N – N: customers hold several loans and loans are shared by several customers.",
  "nodes": [
    { "id": "ha", "x": 80, "y": 12, "shape": "text", "label": "customer", "bold": true },
    { "id": "hb", "x": 240, "y": 12, "shape": "text", "label": "loan", "bold": true },
    { "id": "sa", "x": 80, "y": 120, "w": 64, "h": 180, "shape": "ellipse" },
    { "id": "sb", "x": 240, "y": 120, "w": 64, "h": 180, "shape": "ellipse" },
    { "id": "c1", "x": 80, "y": 66, "shape": "text", "label": "C1" }, { "id": "c2", "x": 80, "y": 102, "shape": "text", "label": "C2" }, { "id": "c3", "x": 80, "y": 138, "shape": "text", "label": "C3" }, { "id": "c4", "x": 80, "y": 174, "shape": "text", "label": "C4" },
    { "id": "l1", "x": 240, "y": 66, "shape": "text", "label": "L1" }, { "id": "l2", "x": 240, "y": 102, "shape": "text", "label": "L2" }, { "id": "l3", "x": 240, "y": 138, "shape": "text", "label": "L3" }, { "id": "l4", "x": 240, "y": 174, "shape": "text", "label": "L4" },
    { "id": "e1", "x": 400, "y": 120, "w": 100, "label": "customer", "tone": "sky" },
    { "id": "r", "x": 540, "y": 120, "shape": "diamond", "label": "borrow", "tone": "amber" },
    { "id": "e2", "x": 680, "y": 120, "w": 100, "label": "loan", "tone": "sky" }
  ],
  "edges": [
    { "from": "c1", "to": "l1", "arrow": "none" }, { "from": "c1", "to": "l2", "arrow": "none" }, { "from": "c2", "to": "l2", "arrow": "none" }, { "from": "c3", "to": "l3", "arrow": "none" }, { "from": "c3", "to": "l4", "arrow": "none" }, { "from": "c4", "to": "l4", "arrow": "none" },
    { "from": "e1", "to": "r", "arrow": "none", "label": "N", "bold": true },
    { "from": "r", "to": "e2", "arrow": "none", "label": "N", "bold": true }
  ]
}
```

How to read the marks: the `1` or `N` written on the **loan side** says how
many loans **one customer** can have; the mark on the **customer side** says
how many customers **one loan** can have.

### Exercise — which cardinality?

> Draw the E-R diagram and give the mapping cardinality for each statement.

| Statement | Cardinality | Why |
|---|---|---|
| Each customer has only one account and each account is held by only one customer *(single account)* | **1 : 1** | one on both sides |
| Each customer has only one account but an account can be held by more than one customer *(joint account)* | **N : 1** (customer : account) | many customers → one account |
| A customer may have more than one account but each account is held by only one customer *(multiple accounts)* | **1 : N** | one customer → many accounts |
| A customer may have more than one account and each account is held by more than one customer *(joint + multiple)* | **N : N** | many on both sides |
| A student can work in more than one project and a project can be done by more than one student | **N : N** | |
| A student can issue more than one book but a book is issued to only one student | **1 : N** (student : book) | |
| A subject is taught by more than one faculty and a faculty can teach more than one subject | **N : N** | |

## 4. Participation constraints

A participation constraint specifies **the participation of an entity set in a
relationship set**. Two kinds:

| Kind | Meaning | Drawn as |
|---|---|---|
| **Partial participation** | **some** entities of the set may **not participate** in any relationship of the set | **single line** |
| **Total participation** | **every** entity of the set participates in **at least one** relationship of the set | **double line** |

```diagram
{
  "title": "Each customer has at most one loan; every loan has a customer. Customer C3 has no loan → partial on the customer side; every loan is connected → total on the loan side.",
  "nodes": [
    { "id": "ha", "x": 80, "y": 12, "shape": "text", "label": "customer", "bold": true },
    { "id": "hb", "x": 240, "y": 12, "shape": "text", "label": "loan", "bold": true },
    { "id": "sa", "x": 80, "y": 110, "w": 64, "h": 150, "shape": "ellipse" },
    { "id": "sb", "x": 240, "y": 110, "w": 64, "h": 120, "shape": "ellipse" },
    { "id": "c1", "x": 80, "y": 70, "shape": "text", "label": "C1" }, { "id": "c2", "x": 80, "y": 110, "shape": "text", "label": "C2" }, { "id": "c3", "x": 80, "y": 150, "shape": "text", "label": "C3", "tone": "rose" },
    { "id": "l1", "x": 240, "y": 90, "shape": "text", "label": "L1" }, { "id": "l2", "x": 240, "y": 130, "shape": "text", "label": "L2" },
    { "id": "n1", "x": 480, "y": 60, "w": 260, "h": 44, "shape": "note", "size": 12, "label": "customer side: partial\nC3 has no loan — single line", "tone": "rose" },
    { "id": "n2", "x": 480, "y": 150, "w": 260, "h": 44, "shape": "note", "size": 12, "label": "loan side: total\nevery loan has a customer — double line", "tone": "emerald" }
  ],
  "edges": [
    { "from": "c1", "to": "l1", "arrow": "none" }, { "from": "c2", "to": "l2", "arrow": "none" }
  ]
}
```

```er
{
  "title": "The same constraint in E-R notation: single line on the customer side (partial), double line on the loan side (total).",
  "nodes": [
    { "id": "c", "kind": "entity", "label": "customer", "x": 110, "y": 60 },
    { "id": "b", "kind": "relationship", "label": "borrow", "x": 340, "y": 60 },
    { "id": "l", "kind": "entity", "label": "loan", "x": 570, "y": 60 }
  ],
  "edges": [
    { "from": "c", "to": "b", "role": "partial" },
    { "from": "b", "to": "l", "total": true, "role": "total" }
  ]
}
```

Participation and cardinality are **independent**: a line can be double *and*
carry an `N`. Read them separately — *how many?* (cardinality) and *must
every one take part?* (participation).

## 5. Weak entity sets

An entity set that **does not have a primary key** is called a **weak entity
set**. Its existence **depends on the existence of a strong entity set**.

```er
{
  "title": "loan (strong entity set) — L_P (weak / identifying relationship, double diamond) — payment (weak entity set, double rectangle). payment-no is the discriminator (dashed underline).",
  "nodes": [
    { "id": "l", "kind": "entity", "label": "loan", "x": 150, "y": 160 },
    { "id": "ln", "kind": "key_attribute", "label": "loan-no", "x": 70, "y": 50 },
    { "id": "am", "kind": "attribute", "label": "amount", "x": 210, "y": 50 },
    { "id": "lp", "kind": "identifying_relationship", "label": "L_P", "x": 350, "y": 160 },
    { "id": "p", "kind": "weak_entity", "label": "payment", "x": 560, "y": 160 },
    { "id": "pn", "kind": "partial_key_attribute", "label": "payment-no", "x": 450, "y": 50 },
    { "id": "pd", "kind": "attribute", "label": "payment-date", "x": 600, "y": 40 },
    { "id": "pa", "kind": "attribute", "label": "payment-amount", "x": 620, "y": 270 }
  ],
  "edges": [
    { "from": "l", "to": "ln" }, { "from": "l", "to": "am" },
    { "from": "l", "to": "lp", "card": "1" },
    { "from": "lp", "to": "p", "card": "N", "total": true },
    { "from": "p", "to": "pn" }, { "from": "p", "to": "pd" }, { "from": "p", "to": "pa" }
  ]
}
```

- Drawn as a **double rectangle**; the relationship that ties it to its strong
  entity (the **weak entity relationship**, or identifying relationship) is a
  **double diamond**.
- The **discriminator** (**partial key**) of a weak entity set is the set of
  attributes that distinguishes all the entities of the weak entity set *among
  those attached to the same strong entity*. It is underlined with a **dashed
  line**.
- The **primary key** of a weak entity set = **primary key of the strong entity
  set** it depends on **+ its own discriminator**.
- Example: `payment` has `payment-no` as discriminator; `loan` has `loan-no` as
  primary key; so the primary key of `payment` is **(loan-no, payment-no)**.
  Payment n° 1 of loan 17 and payment n° 1 of loan 42 are two different
  payments — `payment-no` alone cannot tell them apart.
- A weak entity always participates **totally** in its identifying relationship
  (a payment cannot exist without its loan), hence the double line on the
  `payment` side.

## 6. Superclass vs subclass

| Super class | Sub class |
|---|---|
| an entity from which **other entities can be derived** | an entity that is **derived from another entity** |
| `Account` has two subsets, `Saving_Account` and `Current_Account`, so `Account` is a superclass | `Saving_Account` and `Current_Account` are derived from `Account`, so they are subclasses |

```er
{
  "title": "Account is the superclass; Saving_Account and Current_Account are its subclasses, linked through the ISA triangle.",
  "nodes": [
    { "id": "a", "kind": "entity", "label": "Account", "x": 330, "y": 40 },
    { "id": "isa", "kind": "isa", "label": "ISA", "x": 330, "y": 130 },
    { "id": "s", "kind": "entity", "label": "Saving_Account", "x": 180, "y": 230 },
    { "id": "c", "kind": "entity", "label": "Current_Account", "x": 480, "y": 230 }
  ],
  "edges": [
    { "from": "a", "to": "isa" }, { "from": "isa", "to": "s" }, { "from": "isa", "to": "c" }
  ]
}
```

A subclass **inherits** all the attributes of its superclass and adds its own.

## 7. Generalization vs specialization

Both produce the **same picture** — a superclass above an ISA triangle,
subclasses below — but they are built in **opposite directions**.

```diagram
{
  "title": "Generalization builds the superclass bottom-up from common features; specialization splits a superclass top-down into subsets.",
  "nodes": [
    { "id": "h1", "x": 160, "y": 12, "shape": "text", "label": "Generalization — bottom-up", "bold": true },
    { "id": "h2", "x": 500, "y": 12, "shape": "text", "label": "Specialization — top-down", "bold": true },
    { "id": "g1", "x": 160, "y": 60, "w": 200, "h": 40, "label": "Person\n(Name, Address)", "tone": "emerald", "filled": true },
    { "id": "g2", "x": 80, "y": 200, "w": 130, "h": 40, "label": "Student\n(Name, Address, SPI)", "tone": "sky", "size": 11 },
    { "id": "g3", "x": 240, "y": 200, "w": 140, "h": 40, "label": "Faculty\n(Name, Address, Salary)", "tone": "sky", "size": 11 },
    { "id": "gn", "x": 160, "y": 245, "shape": "text", "label": "↑ extract the common features", "size": 11 },
    { "id": "s1", "x": 500, "y": 60, "w": 200, "h": 40, "label": "Person\n(Name, Address)", "tone": "sky" },
    { "id": "s2", "x": 420, "y": 200, "w": 130, "h": 40, "label": "Student\n(+ SPI)", "tone": "emerald", "filled": true, "size": 11 },
    { "id": "s3", "x": 580, "y": 200, "w": 130, "h": 40, "label": "Faculty\n(+ Salary)", "tone": "emerald", "filled": true, "size": 11 },
    { "id": "sn", "x": 500, "y": 245, "shape": "text", "label": "↓ split by distinguishing features", "size": 11 }
  ],
  "edges": [
    { "from": "g2", "to": "g1", "tone": "emerald" }, { "from": "g3", "to": "g1", "tone": "emerald" },
    { "from": "s1", "to": "s2", "tone": "emerald" }, { "from": "s1", "to": "s3", "tone": "emerald" }
  ]
}
```

| | Generalization | Specialization |
|---|---|---|
| definition | **extracts the common features of multiple entities to form a new entity** | **splits an entity to form multiple new entities that inherit some feature of the splitting entity** |
| process | creation of a **group** from various entities | creation of **sub-groups** within an entity |
| approach | **bottom-up** | **top-down** |
| set operation | takes the **union** of two or more **lower-level** entity sets to produce a **higher-level** entity set | takes a **subset** of a **higher-level** entity set to form a **lower-level** entity set |
| starting point | starts from **several** entity sets and creates a high-level entity set using their **common** features | starts from a **single** entity set and creates different low-level entity sets using **different** features |

Example from the slides: `Student(Name, Address, SPI)` and `Faculty(Name,
Address, Salary)` share `Name` and `Address` → generalize into `Person(Name,
Address)`; conversely, `Person` specializes into `Student` (adds `SPI`) and
`Faculty` (adds `Salary`).

### A two-level example

```er
{
  "title": "Person is specialized into Employee and Customer; Employee is further specialized into Full Time and Part Time. Subclasses can have subclasses.",
  "nodes": [
    { "id": "p", "kind": "entity", "label": "Person", "x": 330, "y": 80 },
    { "id": "pid", "kind": "key_attribute", "label": "PID", "x": 170, "y": 30 },
    { "id": "pn", "kind": "attribute", "label": "Name", "x": 280, "y": 10 },
    { "id": "pa", "kind": "attribute", "label": "Address", "x": 410, "y": 10 },
    { "id": "pc", "kind": "attribute", "label": "City", "x": 520, "y": 40 },
    { "id": "isa1", "kind": "isa", "label": "ISA", "x": 330, "y": 170 },
    { "id": "e", "kind": "entity", "label": "Employee", "x": 200, "y": 260 },
    { "id": "es", "kind": "attribute", "label": "Salary", "x": 70, "y": 260 },
    { "id": "c", "kind": "entity", "label": "Customer", "x": 470, "y": 260 },
    { "id": "cb", "kind": "attribute", "label": "Balance", "x": 610, "y": 260 },
    { "id": "isa2", "kind": "isa", "label": "ISA", "x": 200, "y": 350 },
    { "id": "ft", "kind": "entity", "label": "Full Time", "x": 100, "y": 440 },
    { "id": "fd", "kind": "attribute", "label": "Days Worked", "x": 100, "y": 520 },
    { "id": "pt", "kind": "entity", "label": "Part Time", "x": 300, "y": 440 },
    { "id": "ph", "kind": "attribute", "label": "Hour Worked", "x": 300, "y": 520 }
  ],
  "edges": [
    { "from": "p", "to": "pid" }, { "from": "p", "to": "pn" }, { "from": "p", "to": "pa" }, { "from": "p", "to": "pc" },
    { "from": "p", "to": "isa1" }, { "from": "isa1", "to": "e" }, { "from": "isa1", "to": "c" },
    { "from": "e", "to": "es" }, { "from": "c", "to": "cb" },
    { "from": "e", "to": "isa2" }, { "from": "isa2", "to": "ft" }, { "from": "isa2", "to": "pt" },
    { "from": "ft", "to": "fd" }, { "from": "pt", "to": "ph" }
  ]
}
```

### Exercise — find generalization / specialization

> Give examples of generalization / specialization in: a hospital management
> system, a college management system, a bank management system, an insurance
> company.

| System | Superclass | Subclasses |
|---|---|---|
| Hospital | `Person` | `Patient`, `Doctor`, `Nurse` (then `Doctor` → `Surgeon`, `Physician`) |
| College | `Person` | `Student`, `Faculty`, `Staff`; `Student` → `Undergraduate`, `Postgraduate` |
| Bank | `Account` | `Saving_Account`, `Current_Account`, `Fixed_Deposit`; `Customer` → `Individual`, `Corporate` |
| Insurance | `Policy` | `Life_Policy`, `Vehicle_Policy`, `Health_Policy`; `Person` → `Policy_Holder`, `Agent` |

## 8. Worked example — the NHL database

> The NHL has many **teams**; each team has a name, a city, a coach, a captain
> and a set of players. Each **player** belongs to only one team; a player has a
> name, a position (left wing, goalie…), a skill level and a set of **injury
> records**. A team captain is also a player. A **game** is played between two
> teams (host team and guest team) and has a date and a score. Construct a
> clean and concise E-R diagram.

Method — the same five steps for any description:

1. **Entities** (nouns that have their own data): team, player, game, injury
   record → rectangles.
2. **Attributes** for each, and the **primary key** underlined. An injury
   record has no key of its own — it only makes sense for a given player →
   **weak entity** with a discriminator.
3. **Relationships** (verbs): a player *belongs to* a team; a team *has a
   captain*; a game is *hosted by* a team and *visited by* a team; a player
   *logs* injury records.
4. **Roles** where one entity plays two parts in one relationship (a team is
   `host` in one game and `guest` in another).
5. **Cardinality and participation** on every line.

```er
{
  "title": "NHL database: team, player, game, and injury record as a weak entity identified through player.",
  "nodes": [
    { "id": "t", "kind": "entity", "label": "team", "x": 150, "y": 170 },
    { "id": "tn", "kind": "key_attribute", "label": "t-name", "x": 50, "y": 70 },
    { "id": "tc", "kind": "attribute", "label": "city", "x": 160, "y": 50 },
    { "id": "tco", "kind": "attribute", "label": "coach", "x": 270, "y": 70 },
    { "id": "p", "kind": "entity", "label": "player", "x": 530, "y": 170 },
    { "id": "pn", "kind": "key_attribute", "label": "p-name", "x": 430, "y": 60 },
    { "id": "pp", "kind": "attribute", "label": "position", "x": 545, "y": 50 },
    { "id": "ps", "kind": "attribute", "label": "skill level", "x": 660, "y": 90 },
    { "id": "bt", "kind": "relationship", "label": "belongs_to", "x": 340, "y": 170 },
    { "id": "cap", "kind": "relationship", "label": "captain", "x": 340, "y": 270 },
    { "id": "g", "kind": "entity", "label": "game", "x": 150, "y": 440 },
    { "id": "gd", "kind": "attribute", "label": "date", "x": 50, "y": 530 },
    { "id": "gs", "kind": "attribute", "label": "score", "x": 190, "y": 530 },
    { "id": "host", "kind": "relationship", "label": "host", "x": 70, "y": 305 },
    { "id": "guest", "kind": "relationship", "label": "guest", "x": 230, "y": 340 },
    { "id": "log", "kind": "identifying_relationship", "label": "log", "x": 530, "y": 300 },
    { "id": "ir", "kind": "weak_entity", "label": "injury record", "x": 530, "y": 440 },
    { "id": "ii", "kind": "partial_key_attribute", "label": "id", "x": 440, "y": 530 },
    { "id": "id", "kind": "attribute", "label": "description", "x": 610, "y": 530 }
  ],
  "edges": [
    { "from": "t", "to": "tn" }, { "from": "t", "to": "tc" }, { "from": "t", "to": "tco" },
    { "from": "p", "to": "pn" }, { "from": "p", "to": "pp" }, { "from": "p", "to": "ps" },
    { "from": "t", "to": "bt", "card": "1" }, { "from": "bt", "to": "p", "card": "N", "total": true },
    { "from": "t", "to": "cap", "card": "1" }, { "from": "cap", "to": "p", "card": "1" },
    { "from": "g", "to": "host", "card": "N", "total": true }, { "from": "host", "to": "t", "card": "1" },
    { "from": "g", "to": "guest", "card": "N", "total": true }, { "from": "guest", "to": "t", "card": "1" },
    { "from": "g", "to": "gd" }, { "from": "g", "to": "gs" },
    { "from": "p", "to": "log", "card": "1" }, { "from": "log", "to": "ir", "card": "N", "total": true },
    { "from": "ir", "to": "ii" }, { "from": "ir", "to": "id" }
  ]
}
```

Reading the answer:

- `belongs_to` is **1 : N** (one team, many players) with **total**
  participation of `player` — every player belongs to a team.
- `captain` is **1 : 1** — one captain per team, and that captain is a player
  (so no separate *captain* entity: the relationship does the job).
- `host` and `guest` are two relationships between `game` and `team`; each
  game has exactly **one** host and **one** guest (total on the game side), a
  team can host or visit **many** games.
- `injury record` is **weak**: identified by `(p-name, id)` through the
  identifying relationship `log` (double diamond, double line).

---

## To remember

- **Role** = label on a line, needed when the same entity set takes part twice
  in one relationship (**recursive** relationship set).
- **Mapping cardinality** of a binary relationship: **1:1, 1:N, N:1, N:N** —
  the `1`/`N` on one side says how many of *that* side one entity of the other
  side can have.
- **Participation**: single line = **partial** (some entities may not take
  part), double line = **total** (every entity takes part).
- **Weak entity set** = no primary key of its own; **double rectangle**, tied
  by a **double diamond** (identifying relationship); **discriminator** with a
  **dashed underline**; primary key = strong key + discriminator.
- **Superclass / subclass** linked through the **ISA** triangle; the subclass
  inherits the superclass's attributes.
- **Generalization = bottom-up** (union of lower-level sets into one
  higher-level set, from common features); **specialization = top-down**
  (subsets of a higher-level set, from distinguishing features).
- Method for any statement: entities → attributes & keys → relationships →
  roles → cardinality & participation.
