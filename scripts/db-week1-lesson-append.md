

## 6. Database system architecture

The DBMS is organised into a **query processor** and a **storage manager**,
sitting above the database on disk. Users reach it through one interface per user
type: application interfaces (naive users), application programs (application
programmers), query tools (sophisticated users), administration tools (the DBA).

### Query processor

- **DDL interpreters** — process the DDL statements (`CREATE`, `ALTER`, `DROP`)
  and record the definitions in the data dictionary.
- **DML compiler & organizer** — translate a DML statement into a low-level
  evaluation plan and pick the cheapest one (query optimisation).
- **Compiler & linker** — turn the DML embedded in an application program into
  object code.
- **Query evaluation engine** — actually executes the low-level instructions
  produced by the DML compiler.

### Storage manager

The interface between the low-level data on disk and the queries.

- **Buffer manager** — brings blocks from disk into main memory and decides what
  to keep cached.
- **File manager** — manages disk-space allocation and the on-disk data
  structures.
- **Authorization & integrity manager** — checks that users have the rights they
  claim and that updates respect the integrity constraints.
- **Transaction manager** — keeps the database consistent despite failures and
  concurrent access (atomicity, isolation).

### Disk storage

The database on disk holds four kinds of data: the **data** itself, the
**indices**, the **data dictionary** (metadata), and **statistical data** (used
by the query optimiser).
