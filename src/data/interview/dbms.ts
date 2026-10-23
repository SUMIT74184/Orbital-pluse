import type { InterviewQA } from "./index";

// Interview Q&A for the DBMS track, keyed by topic title (see src/data/topics.ts).
export const DBMS_QA: Record<string, InterviewQA[]> = {
  "What a DBMS is & why not plain files": [
    {
      q: "What is a DBMS?",
      a: `A Database Management System is software that stores, retrieves and manages data in a database while providing concurrency control, security, integrity, backup and recovery. Examples: MySQL, PostgreSQL, Oracle, SQL Server, MongoDB. It sits between users/applications and the data, hiding how data is physically stored.`,
    },
    {
      q: "What problems of the file system does a DBMS solve?",
      a: `- Data redundancy and inconsistency: the same data in multiple files gets out of sync.
      - Difficulty accessing data: every new query needs a new program.
      - Data isolation: data scattered in different formats.
      - Integrity problems: constraints buried in application code.
      - Atomicity problems: a crash mid-transfer leaves partial updates.
      - Concurrent access anomalies: two users updating simultaneously.
      - Security problems: hard to give fine-grained access.`,
    },
    {
      q: "What is the difference between DBMS and RDBMS?",
      a: `A DBMS stores data in any form (files, hierarchical, navigational) and may not enforce relationships. An RDBMS stores data in tables (relations) with rows and columns, supports keys and relationships between tables, enforces integrity constraints, uses SQL, follows ACID and supports normalization. Every RDBMS is a DBMS, not vice versa.`,
    },
    {
      q: "What are the disadvantages of using a DBMS?",
      a: `Higher cost (software, hardware, trained staff), complexity, performance overhead from security/concurrency/recovery features for simple applications, larger size, and a central point of failure if not replicated. For a tiny single-user app, plain files may be sufficient.`,
    },
  ],

  "Three-schema architecture & data independence": [
    {
      q: "Explain the three-schema architecture.",
      a: `It separates the user's view from physical storage:
      - Internal (physical) level: how data is stored — files, indexes, record layout.
      - Conceptual (logical) level: what data is stored and relationships — tables, columns, constraints, for the whole database.
      - External (view) level: what each user/group sees — customised views hiding other data.
      Mappings between levels let one level change without affecting others.`,
    },
    {
      q: "What is data independence? Logical vs physical?",
      a: `The ability to change the schema at one level without changing the level above.
      - Physical data independence: change internal storage (add an index, move to SSD, change file organisation) without changing the conceptual schema. Easy to achieve.
      - Logical data independence: change the conceptual schema (add a column, split a table) without changing external views/applications. Harder to achieve.`,
    },
    {
      q: "Schema vs instance?",
      a: `Schema is the overall design/structure of the database — table names, columns, types, constraints. It changes rarely (intension).

      Instance is the actual data stored at a particular moment — it changes constantly (extension). Analogy: schema = class definition, instance = object values at a time.`,
    },
  ],

  "DBMS architecture & languages": [
    {
      q: "Explain 1-tier, 2-tier and 3-tier architectures.",
      a: `- 1-tier: the user works directly on the DBMS on the same machine (e.g. a local SQLite tool).
      - 2-tier: client application talks directly to the DB server (via JDBC/ODBC) — simple but less scalable and secure.
      - 3-tier: client → application server (business logic) → database server. The client never accesses the DB directly — better security, scalability and maintainability; used by web apps.`,
    },
    {
      q: "What are DDL, DML, DCL and TCL?",
      a: `- DDL (Data Definition): CREATE, ALTER, DROP, TRUNCATE, RENAME — define structure; auto-committed in most DBs.
      - DML (Data Manipulation): SELECT, INSERT, UPDATE, DELETE — work with data. (Some classify SELECT as DQL.)
      - DCL (Data Control): GRANT, REVOKE — permissions.
      - TCL (Transaction Control): COMMIT, ROLLBACK, SAVEPOINT — manage transactions.`,
    },
    {
      q: "What are the main components of a DBMS?",
      a: `- Query processor: DDL interpreter, DML compiler, query optimizer, query evaluation engine.
      - Storage manager: authorization and integrity manager, transaction manager, file manager, buffer manager.
      - Disk storage: data files, data dictionary (metadata), indexes, logs.`,
    },
    {
      q: "What is the role of a DBA?",
      a: `The Database Administrator defines schemas and storage structures, grants authorization, monitors and tunes performance, plans capacity, takes backups and handles recovery, applies upgrades and patches, and ensures security and availability.`,
    },
  ],

  "Data models": [
    {
      q: "What is a data model and what types exist?",
      a: `A data model is a collection of concepts to describe data, relationships, semantics and constraints.
      - Hierarchical: tree structure, parent-child (IBM IMS).
      - Network: graph, records with multiple parents (CODASYL).
      - Relational: tables with rows and columns (most common).
      - Entity-Relationship: conceptual design model.
      - Object-oriented / object-relational: objects, inheritance (PostgreSQL has OR features).
      - NoSQL models: key-value, document, column-family, graph.`,
    },
    {
      q: "Why did the relational model replace hierarchical and network models?",
      a: `Hierarchical/network models required navigating pointers in programs — queries depended on the physical structure, so changes broke applications and M:N relationships were awkward. The relational model (Codd, 1970) offers a simple tabular view, declarative queries (SQL), strong mathematical foundation (relational algebra) and data independence.`,
    },
    {
      q: "Where do NoSQL models fit?",
      a: `They trade relational features (joins, strict schemas, multi-row ACID) for horizontal scalability, flexible schemas and performance on specific access patterns: key-value for caches/sessions, document for JSON-like aggregates, column-family for huge write-heavy datasets, graph for highly connected data.`,
    },
  ],

  "Entities, attributes & relationships": [
    {
      q: "Define entity, entity set, attribute and relationship.",
      a: `- Entity: a real-world object distinguishable from others (a specific student).
      - Entity set: a collection of similar entities (all students) — becomes a table.
      - Attribute: a property of an entity (roll_no, name).
      - Relationship: an association among entities (student ENROLLS in course); a relationship set is a collection of such associations.`,
    },
    {
      q: "What is a weak entity?",
      a: `An entity that cannot be uniquely identified by its own attributes and depends on an owner (strong) entity, e.g. Dependent of an Employee. It has a partial key (discriminator) such as dependent name; its full key = owner's primary key + partial key. It's connected via an identifying relationship (double diamond) and always has total participation (double rectangle in ER diagrams).`,
    },
    {
      q: "Explain the types of attributes.",
      a: `- Simple vs composite: age vs name (first, middle, last).
      - Single-valued vs multi-valued: DOB vs phone numbers (double ellipse).
      - Stored vs derived: DOB vs age (dashed ellipse).
      - Key attribute: uniquely identifies the entity (underlined).
      - Complex: composite + multi-valued.`,
    },
    {
      q: "What is the degree of a relationship?",
      a: `The number of entity sets participating: unary/recursive (Employee manages Employee), binary (Student enrolls Course — most common), ternary (Supplier supplies Part to Project). A ternary relationship isn't always equivalent to three binary ones, since it captures facts that only hold for the combination.`,
    },
  ],

  "Cardinality & participation constraints": [
    {
      q: "Explain cardinality ratios (mapping constraints).",
      a: `The number of entities one entity can be associated with:
      - One-to-one: a person has one passport.
      - One-to-many: a department has many employees; each employee belongs to one department.
      - Many-to-one: the reverse view of 1:N.
      - Many-to-many: students enroll in many courses and courses have many students.`,
    },
    {
      q: "Total vs partial participation?",
      a: `Total participation: every entity must participate in the relationship (every loan must belong to a customer) — double line. Partial: some entities may not participate (not every customer has a loan) — single line. Weak entities always have total participation in their identifying relationship.`,
    },
    {
      q: "What is (min, max) notation?",
      a: `Each entity's participation is annotated with (min, max): min = 0 means partial, min ≥ 1 means total; max is the maximum number of relationships (1 or N). E.g. Employee (1,1) works-in Department (1,N): each employee is in exactly one department, each department has at least one employee.`,
    },
  ],

  "Extended ER: generalization, specialization & aggregation": [
    {
      q: "Generalization vs specialization?",
      a: `Both build IS-A hierarchies.
      - Specialization (top-down): split a higher-level entity into sub-entities based on distinguishing features — Employee → Engineer, Manager.
      - Generalization (bottom-up): combine entities sharing common attributes into a higher-level entity — Car, Truck → Vehicle.
      Lower-level entities inherit the attributes and relationships of the higher level.`,
    },
    {
      q: "Explain disjoint/overlapping and total/partial constraints on specialization.",
      a: `- Disjoint: an entity belongs to at most one subclass (an account is either savings or current). Overlapping: it can belong to several (a person is both student and employee).
      - Total: every superclass entity must belong to some subclass. Partial: some may belong to none.`,
    },
    {
      q: "What is aggregation?",
      a: `Treating a relationship set as a higher-level entity so it can participate in another relationship. E.g. Employee WORKS-ON Project, and the (employee, project) combination is MONITORED-BY a Manager. Aggregation avoids awkward ternary relationships and redundancy.`,
    },
  ],

  "Converting an ER diagram to tables": [
    {
      q: "How do you convert entities and relationships to tables?",
      a: `- Strong entity → table with its simple attributes; composite attributes are flattened; key attribute → primary key.
      - Weak entity → table with its attributes + owner's PK as FK; PK = owner PK + partial key.
      - 1:N relationship → put the PK of the "1" side as a foreign key in the "N" side (no extra table).
      - 1:1 → FK on either side, preferably the side with total participation.
      - M:N → a separate junction table with both PKs (composite PK) plus relationship attributes.`,
    },
    {
      q: "How are multi-valued attributes mapped?",
      a: `Create a separate table containing the entity's primary key and the attribute, with both together as the primary key. E.g. Employee(emp_id, name) and Employee_Phone(emp_id, phone).`,
    },
    {
      q: "What is the minimum number of tables for A —(1:N)— R —— B, and for M:N?",
      a: `For 1:N: 2 tables — R merges into the N side as a foreign key. For 1:1 with total participation on one side: can be 1 table (merge both). For M:N: 3 tables (A, B and R). Each multi-valued attribute adds one more table. These counting questions are common in GATE and interviews.`,
    },
  ],

  "Relational model concepts": [
    {
      q: "Define relation, tuple, attribute, domain, degree and cardinality.",
      a: `- Relation: a table.
      - Tuple: a row.
      - Attribute: a column.
      - Domain: the set of allowed values for an attribute.
      - Degree (arity): number of attributes (columns).
      - Cardinality: number of tuples (rows).`,
    },
    {
      q: "What are the properties of a relation?",
      a: `Each cell contains a single atomic value; all values in a column come from the same domain; each attribute has a distinct name; no two tuples are identical (it's a set); the order of tuples and attributes doesn't matter. Note that SQL tables relax some of these (they allow duplicate rows without a key).`,
    },
    {
      q: "What does NULL mean and how does it behave?",
      a: `NULL represents an unknown, missing or inapplicable value — not zero or empty string. Comparisons with NULL yield UNKNOWN (three-valued logic), so WHERE col = NULL never matches; use IS NULL. Aggregates (SUM, AVG, COUNT(col)) ignore NULLs, while COUNT(*) counts rows. NULL in a NOT IN subquery makes it return no rows.`,
    },
  ],

  "Keys": [
    {
      q: "Explain super key, candidate key, primary key and alternate key.",
      a: `- Super key: any set of attributes that uniquely identifies a tuple (may include extra attributes).
      - Candidate key: a minimal super key — no attribute can be removed.
      - Primary key: the candidate key chosen to identify tuples; can't be NULL.
      - Alternate key: candidate keys not chosen as primary.
      Example in Student(roll, email, name): {roll}, {email} are candidate keys; {roll, name} is a super key.`,
    },
    {
      q: "What are foreign, composite and surrogate keys?",
      a: `- Foreign key: attribute(s) referencing the primary/unique key of another (or the same) table, enforcing referential integrity.
      - Composite key: a key made of two or more attributes, e.g. (student_id, course_id) in Enrollment.
      - Surrogate key: an artificial key with no business meaning (auto-increment ID, UUID), used when natural keys are long or may change.`,
    },
    {
      q: "Primary key vs unique key?",
      a: `Primary key: only one per table, cannot contain NULL, typically creates the clustered index (InnoDB). Unique key: many allowed per table, allows NULL (in MySQL/Postgres multiple NULLs; in SQL Server only one), creates a non-clustered unique index. Both enforce uniqueness.`,
    },
    {
      q: "How do you count super keys?",
      a: `With n attributes and one candidate key of k attributes, super keys = 2^(n-k) (any combination of the remaining attributes added). With two candidate keys A and B use inclusion-exclusion: |A| + |B| - |A ∪ B|. Example: R(A,B,C,D), candidate keys A and B: 2^3 + 2^3 - 2^2 = 12.`,
    },
  ],

  "Integrity constraints": [
    {
      q: "What are integrity constraints? Name the types.",
      a: `Rules that keep data valid:
      - Domain constraint: values must belong to the attribute's domain/type (age INT, CHECK age > 0).
      - Entity integrity: primary key cannot be NULL.
      - Referential integrity: a foreign key value must match an existing referenced key or be NULL.
      - Key constraint: key values must be unique.
      - CHECK / NOT NULL / UNIQUE / DEFAULT constraints.`,
    },
    {
      q: "What happens when a referenced row is deleted? Explain ON DELETE options.",
      a: `- RESTRICT / NO ACTION: reject the delete if child rows exist (default).
      - CASCADE: delete the child rows too.
      - SET NULL: set the child's FK to NULL.
      - SET DEFAULT: set the FK to its default value.
      The same options exist for ON UPDATE.`,
    },
    {
      q: "Why is entity integrity important?",
      a: `The primary key identifies each tuple. If it could be NULL, we couldn't distinguish or reference those tuples, and foreign keys pointing to them would be meaningless. So every PK attribute must be NOT NULL and unique.`,
    },
  ],

  "Relational algebra": [
    {
      q: "What is relational algebra and what are its basic operations?",
      a: `A procedural query language whose operations take relations and produce relations — the theoretical basis of SQL and of query optimizers. Fundamental operations:
      - Selection σ: filter rows (σ salary>50000 (Emp)) → WHERE.
      - Projection π: pick columns, removing duplicates → SELECT DISTINCT cols.
      - Union ∪, set difference −, Cartesian product ×, rename ρ.
      Derived: intersection ∩, joins, division.`,
    },
    {
      q: "Explain the types of joins in relational algebra.",
      a: `- Theta join: R ⋈θ S = σθ(R × S) with any condition.
      - Equi join: theta join with only equality conditions.
      - Natural join: equi join on all common attribute names, keeping one copy of them.
      - Outer joins (left, right, full): keep unmatched tuples padding with NULLs.
      - Semi join: tuples of R that have a match in S.`,
    },
    {
      q: "When is the division operator used?",
      a: `For "for all" queries: R ÷ S returns values in R associated with every tuple in S. Example: students who have taken all courses = Enrolled(sid, cid) ÷ Courses(cid). Equivalent: π sid(Enrolled) − π sid((π sid(Enrolled) × Courses) − Enrolled). In SQL, use NOT EXISTS … NOT EXISTS or GROUP BY with COUNT(DISTINCT) = total.`,
    },
    {
      q: "What are the conditions for union compatibility?",
      a: `Both relations must have the same number of attributes (degree) and the corresponding attributes must have compatible domains. Needed for ∪, ∩ and −.`,
    },
  ],

  "Relational calculus": [
    {
      q: "Relational algebra vs relational calculus?",
      a: `Relational algebra is procedural — it describes how to get the result as a sequence of operations. Relational calculus is declarative (non-procedural) — it describes what result you want using predicate logic. SQL is largely based on tuple relational calculus. They're equally expressive (for safe expressions).`,
    },
    {
      q: "Tuple vs domain relational calculus?",
      a: `TRC variables range over tuples: { t | t ∈ Emp ∧ t.salary > 50000 }.

      DRC variables range over attribute domain values: { <n, s> | ∃ i (<i, n, s> ∈ Emp ∧ s > 50000) }. QBE (Query By Example) is based on DRC.`,
    },
    {
      q: "What is an unsafe expression?",
      a: `One that can produce an infinite result, e.g. { t | ¬(t ∈ Emp) } — all tuples not in Emp, which is infinite. Safe expressions restrict results to values appearing in the database (the domain of the expression). A language is relationally complete if it can express every relational algebra query; SQL is relationally complete.`,
    },
  ],

  "Functional dependencies & Armstrong's axioms": [
    {
      q: "What is a functional dependency?",
      a: `X → Y means that if two tuples agree on X they must agree on Y — X determines Y. Example: roll_no → name. FDs come from business rules, not from looking at current data. They're the basis for keys and normalization.`,
    },
    {
      q: "Trivial vs non-trivial FD?",
      a: `Trivial: Y ⊆ X, e.g. {A, B} → A — always holds. Non-trivial: Y ⊄ X, e.g. A → B. Completely non-trivial: X ∩ Y = ∅.`,
    },
    {
      q: "State Armstrong's axioms and derived rules.",
      a: `Axioms (sound and complete):
      - Reflexivity: if Y ⊆ X then X → Y.
      - Augmentation: if X → Y then XZ → YZ.
      - Transitivity: if X → Y and Y → Z then X → Z.
      Derived rules:
      - Union: X → Y and X → Z ⇒ X → YZ.
      - Decomposition: X → YZ ⇒ X → Y and X → Z.
      - Pseudo-transitivity: X → Y and WY → Z ⇒ WX → Z.`,
    },
  ],

  "Attribute closure & canonical cover": [
    {
      q: "How do you compute attribute closure X⁺?",
      a: `Start with X⁺ = X. Repeat: for each FD A → B, if A ⊆ X⁺ add B to X⁺. Stop when nothing changes.
      Example: R(A,B,C,D,E), FDs: A → B, B → C, CD → E. A⁺ = {A, B, C}. (AD)⁺ = {A, D, B, C, E} = all, so AD is a super key.`,
    },
    {
      q: "How do you find all candidate keys?",
      a: `- Attributes that never appear on any right-hand side must be in every key.
      - Compute the closure of that set; if it's all attributes, it's the only candidate key.
      - Otherwise add attributes (starting with those that appear only on the left or on both sides) one at a time and in combinations, keeping only minimal sets whose closure is all attributes.
      In the example above, D and A never appear on the right, (AD)⁺ = all, so AD is the only candidate key.`,
    },
    {
      q: "What is a canonical (minimal) cover and how is it computed?",
      a: `A minimal set of FDs equivalent to the original. Steps:
      - Split right-hand sides into single attributes.
      - Remove extraneous attributes from left-hand sides (A in AB → C is extraneous if B⁺ contains C).
      - Remove redundant FDs (an FD is redundant if it can be derived from the others).
      Used for 3NF synthesis.`,
    },
    {
      q: "How do you check if two FD sets are equivalent?",
      a: `F and G are equivalent if F covers G and G covers F: for every FD X → Y in G, compute X⁺ using F and check Y ⊆ X⁺; then repeat the other way.`,
    },
  ],

  "Anomalies, 1NF & 2NF": [
    {
      q: "What is normalization and why is it needed?",
      a: `Normalization organises tables to reduce redundancy and avoid anomalies by decomposing them according to functional dependencies. It improves data integrity and saves storage; the cost is more joins.`,
    },
    {
      q: "Explain insertion, update and deletion anomalies.",
      a: `Consider Student(roll, name, dept, hod):
      - Insertion: can't add a new department and its HOD without a student.
      - Update: changing a department's HOD requires updating many rows; missing one leaves inconsistency.
      - Deletion: deleting the last student of a department loses the department's HOD info.`,
    },
    {
      q: "What is 1NF?",
      a: `A relation is in 1NF if every attribute contains only atomic (indivisible) values and there are no repeating groups. E.g. a phones column storing "98..., 99..." violates 1NF; fix by putting each phone in its own row or a separate table.`,
    },
    {
      q: "What is 2NF? What are prime attributes?",
      a: `A prime attribute is part of some candidate key. A relation is in 2NF if it is in 1NF and no non-prime attribute is partially dependent on a candidate key (depends on only part of a composite key).
      Example: Enrollment(student_id, course_id, student_name, grade) — student_name depends only on student_id, violating 2NF. Split into Student(student_id, student_name) and Enrollment(student_id, course_id, grade). A relation with only single-attribute candidate keys is automatically in 2NF.`,
    },
  ],

  "3NF & BCNF": [
    {
      q: "What is 3NF?",
      a: `In 2NF and no transitive dependency of non-prime attributes on a key. Formal test: for every non-trivial FD X → A, either X is a super key or A is a prime attribute.
      Example: Employee(emp_id, dept_id, dept_name) — emp_id → dept_id → dept_name is transitive; split into Employee(emp_id, dept_id) and Department(dept_id, dept_name).`,
    },
    {
      q: "What is BCNF and how is it different from 3NF?",
      a: `BCNF: for every non-trivial FD X → A, X must be a super key (every determinant is a candidate key). It is stricter than 3NF because 3NF allows X → A when A is prime; BCNF doesn't.
      Example: R(student, course, teacher) with {student, course} → teacher and teacher → course. It's in 3NF (course is prime) but not BCNF (teacher isn't a super key).`,
    },
    {
      q: "Why don't we always decompose to BCNF?",
      a: `A BCNF decomposition is always lossless but may not preserve all functional dependencies — some FDs can then only be checked by joining tables. 3NF decomposition can always be both lossless and dependency-preserving. So 3NF is the practical target when preserving dependencies matters.`,
    },
  ],

  "Lossless join & dependency preservation": [
    {
      q: "What is a lossless join decomposition and how do you test it?",
      a: `Decomposing R into R1 and R2 is lossless if R1 ⋈ R2 gives exactly R — no spurious tuples. Test for binary decomposition: the common attributes R1 ∩ R2 must be a super key of R1 or of R2 (i.e. R1 ∩ R2 → R1 or R1 ∩ R2 → R2). Lossy decompositions produce extra (spurious) rows on join, not fewer.`,
    },
    {
      q: "What is dependency preservation?",
      a: `A decomposition is dependency preserving if (F1 ∪ F2 ∪ … )⁺ = F⁺, where Fi are the FDs that can be checked within Ri alone. Then every constraint can be enforced on individual tables without joins.`,
    },
    {
      q: "How do you find the highest normal form of a relation?",
      a: `Find all candidate keys, mark prime attributes, then check each FD X → A:
      - X not a super key and A non-prime and X a proper subset of a key → partial dependency → only 1NF.
      - Else, X not a super key and A non-prime → transitive → 2NF.
      - Else, X not a super key but A prime → 3NF.
      - If every X is a super key → BCNF.`,
    },
  ],

  "4NF, 5NF & denormalization": [
    {
      q: "What is a multivalued dependency and 4NF?",
      a: `X →→ Y means for each X value there is a set of Y values independent of the other attributes. Example: Employee(emp, skill, language) — skills and languages are independent, so every combination must be stored (redundancy).
      4NF: BCNF and no non-trivial MVD X →→ Y unless X is a super key. Fix: split into (emp, skill) and (emp, language).`,
    },
    {
      q: "What is 5NF?",
      a: `5NF (project-join normal form): every join dependency is implied by the candidate keys — the table cannot be losslessly decomposed further into smaller tables. It handles cases where a table can be reconstructed only from three or more projections (e.g. agent-company-product rules). Rarely needed in practice.`,
    },
    {
      q: "What is denormalization and when is it used?",
      a: `Intentionally adding redundancy (duplicated columns, precomputed aggregates, merged tables) to speed up reads by avoiding joins. Used in read-heavy systems, reporting/data warehouses, and NoSQL. Costs: more storage, slower writes and the risk of inconsistency, so it needs triggers, jobs or application logic to keep copies in sync.`,
    },
  ],

  "Transactions, ACID & transaction states": [
    {
      q: "What is a transaction? Explain ACID.",
      a: `A transaction is a logical unit of work (e.g. a money transfer) of one or more operations.
      - Atomicity: all or nothing — partial changes are rolled back.
      - Consistency: moves the DB from one valid state to another, preserving constraints.
      - Isolation: concurrent transactions don't interfere; the result is as if run serially.
      - Durability: once committed, changes survive crashes.`,
    },
    {
      q: "Which DBMS component ensures each ACID property?",
      a: `- Atomicity: transaction/recovery manager using undo logs.
      - Consistency: application programmer + integrity constraints.
      - Isolation: concurrency control manager (locks, MVCC).
      - Durability: recovery manager using redo logs / write-ahead logging.`,
    },
    {
      q: "Describe the transaction states.",
      a: `- Active: executing.
      - Partially committed: final statement executed, changes may still be in memory.
      - Committed: changes made permanent.
      - Failed: normal execution can't continue.
      - Aborted: rolled back to the state before the transaction; it can be restarted or killed.
      - Terminated: committed or aborted.`,
    },
  ],

  "Schedules: serial, recoverable & cascadeless": [
    {
      q: "What is a schedule? Serial vs non-serial?",
      a: `A schedule is the chronological order in which operations of concurrent transactions execute. Serial: transactions run one after another without interleaving — always consistent but no concurrency. Non-serial: operations interleave — better throughput but must be checked for serializability.`,
    },
    {
      q: "What is a recoverable schedule?",
      a: `If T2 reads a value written by T1, then T1 must commit before T2 commits. Otherwise, if T1 aborts after T2 committed, T2 has used invalid data and can't be undone — an irrecoverable schedule.`,
    },
    {
      q: "What is cascading rollback and a cascadeless schedule?",
      a: `Cascading rollback: T1 aborts, so T2 (which read T1's uncommitted data) must abort, so T3 that read T2's must abort… wasteful.
      Cascadeless: transactions only read values written by committed transactions — prevents cascading rollbacks.
      Strict: transactions neither read nor write an item until the last writer has committed or aborted — makes recovery simple. Strict ⊂ cascadeless ⊂ recoverable.`,
    },
  ],

  "Conflict & view serializability": [
    {
      q: "What are conflicting operations?",
      a: `Two operations conflict if they belong to different transactions, access the same data item, and at least one is a write: R-W, W-R, W-W conflict; R-R does not. Swapping non-conflicting adjacent operations doesn't change the result.`,
    },
    {
      q: "How do you test conflict serializability?",
      a: `Build a precedence graph: a node per transaction; an edge Ti → Tj if an operation of Ti conflicts with and comes before an operation of Tj. If the graph has no cycle, the schedule is conflict serializable; a topological sort gives the equivalent serial order. A cycle means it's not conflict serializable.`,
    },
    {
      q: "What is view serializability?",
      a: `A schedule is view equivalent to a serial schedule if it has the same initial reads, the same reads-from relations, and the same final writes for each item. Every conflict-serializable schedule is view-serializable, but not vice versa: a view-serializable schedule that isn't conflict-serializable always contains blind writes (writes without a prior read). Testing view serializability is NP-complete.`,
    },
  ],

  "Concurrency problems & isolation levels": [
    {
      q: "Explain dirty read, lost update, unrepeatable read and phantom read.",
      a: `- Dirty read: T2 reads T1's uncommitted write; T1 rolls back.
      - Lost update: T1 and T2 read the same value and both write; one update is overwritten.
      - Unrepeatable read: T1 reads a row twice and gets different values because T2 updated and committed between.
      - Phantom read: T1 re-runs a range query and sees new/missing rows because T2 inserted/deleted.`,
    },
    {
      q: "Which anomalies does each isolation level prevent?",
      a: `- Read Uncommitted: prevents none (dirty reads allowed).
      - Read Committed: prevents dirty reads.
      - Repeatable Read: also prevents unrepeatable reads.
      - Serializable: also prevents phantoms — full isolation.
      MySQL InnoDB defaults to Repeatable Read; PostgreSQL, Oracle and SQL Server default to Read Committed.`,
    },
    {
      q: "What is write skew?",
      a: `Two transactions read overlapping data, make decisions, and write to different rows, together violating a constraint. Example: two on-call doctors both check "at least 2 on call", both go off call → 0 on call. Snapshot isolation allows it; prevent with SERIALIZABLE or by locking the rows read (SELECT … FOR UPDATE).`,
    },
  ],

  "Lock-based protocols & two-phase locking": [
    {
      q: "Explain shared and exclusive locks.",
      a: `Shared (S) lock: for reading; many transactions can hold S locks on the same item. Exclusive (X) lock: for writing; only one transaction can hold it, and no S locks can coexist.
      Compatibility: S-S compatible; S-X, X-S, X-X incompatible.`,
    },
    {
      q: "What is Two-Phase Locking (2PL)?",
      a: `Each transaction has a growing phase (acquire locks, release none) and a shrinking phase (release locks, acquire none). The point of the last lock acquired is the lock point. 2PL guarantees conflict serializability (serial order = order of lock points). It does not prevent deadlocks or cascading rollbacks.`,
    },
    {
      q: "Basic vs strict vs rigorous 2PL?",
      a: `- Basic 2PL: serializable, but cascading rollbacks possible.
      - Strict 2PL: hold all exclusive locks until commit/abort — gives strict, cascadeless schedules. Most common.
      - Rigorous 2PL: hold all locks (S and X) until commit — transactions serialize in commit order.
      - Conservative 2PL: acquire all locks before starting — deadlock-free but often impractical.`,
    },
    {
      q: "What are lock upgrade and downgrade?",
      a: `Upgrade: converting S to X when a transaction that read an item now wants to write it — allowed only in the growing phase. Downgrade: converting X to S — allowed only in the shrinking phase.`,
    },
  ],

  "Deadlocks": [
    {
      q: "What is a deadlock and what are the necessary conditions?",
      a: `A situation where transactions wait for each other forever (T1 holds A and waits for B; T2 holds B and waits for A). Coffman conditions, all needed:
      - Mutual exclusion.
      - Hold and wait.
      - No preemption.
      - Circular wait.
      Breaking any one prevents deadlock.`,
    },
    {
      q: "How are deadlocks detected and resolved?",
      a: `Build a wait-for graph (edge Ti → Tj if Ti waits for a lock held by Tj) and check periodically for cycles. To resolve, choose a victim (least work done, fewest locks, youngest) and roll it back, releasing its locks. Avoid always choosing the same victim (starvation). InnoDB detects deadlocks instantly and rolls back the smaller transaction.`,
    },
    {
      q: "Explain wait-die and wound-wait.",
      a: `Timestamp-based prevention schemes (older = smaller timestamp):
      - Wait-die (non-preemptive): older requester waits for younger; younger requester dies (rolled back, restarted with the same timestamp).
      - Wound-wait (preemptive): older requester wounds (aborts) younger holder; younger requester waits.
      Both prevent deadlock and starvation because restarted transactions keep their original timestamp and eventually become oldest.`,
    },
    {
      q: "What other techniques handle deadlocks?",
      a: `Lock timeouts (abort after waiting too long), acquiring locks in a consistent global order, keeping transactions short, and lower isolation levels. In applications: always access tables/rows in the same order and retry the transaction on deadlock errors.`,
    },
  ],

  "Timestamp ordering & optimistic concurrency": [
    {
      q: "Explain the basic timestamp ordering protocol.",
      a: `Each transaction gets a timestamp TS(T) at start; each item keeps R-TS(X) and W-TS(X) (largest timestamps that read/wrote it).
      - Read(X): if TS(T) < W-TS(X), a younger transaction already wrote it → abort T; else read and update R-TS.
      - Write(X): if TS(T) < R-TS(X) or TS(T) < W-TS(X) → abort T; else write and set W-TS.
      It ensures conflict serializability in timestamp order and is deadlock-free (no waiting), but may cause starvation and cascading rollbacks.`,
    },
    {
      q: "What is the Thomas write rule?",
      a: `A modification of timestamp ordering: if TS(T) < W-TS(X) on a write, instead of aborting, ignore the outdated write — a newer value already exists and would overwrite it anyway. It allows some view-serializable schedules that aren't conflict serializable.`,
    },
    {
      q: "What is optimistic (validation-based) concurrency control?",
      a: `It assumes conflicts are rare. Three phases:
      - Read: execute on private copies.
      - Validation: before commit, check whether the transaction conflicted with others that committed meanwhile.
      - Write: if valid, apply changes; else abort and restart.
      Good for read-heavy, low-contention workloads; wasteful under high contention.`,
    },
  ],

  "MVCC & multiple-granularity locking": [
    {
      q: "What is MVCC and its advantage?",
      a: `Multi-Version Concurrency Control keeps several versions of each row with transaction IDs. A reader sees the snapshot that was committed when its transaction (or statement) began, so readers don't block writers and writers don't block readers. Used by PostgreSQL, InnoDB and Oracle. Old versions must be garbage-collected (VACUUM, purge).`,
    },
    {
      q: "What is snapshot isolation?",
      a: `Each transaction reads from a consistent snapshot as of its start; on commit, if another concurrent transaction already wrote the same row, it aborts (first-committer-wins). It prevents dirty, non-repeatable and phantom reads but allows write skew, so it isn't fully serializable (PostgreSQL's SERIALIZABLE adds SSI checks to fix this).`,
    },
    {
      q: "What is multiple-granularity locking and what are intention locks?",
      a: `Data is a hierarchy: database → table → page → row. Locking a whole table is cheap but blocks everything; locking rows allows concurrency but costs more locks. Intention locks on ancestors announce locks lower down:
      - IS: intends to take S locks on descendants.
      - IX: intends to take X locks on descendants.
      - SIX: S on this node + IX below (read the whole table, update some rows).
      A transaction locks from root to leaf and releases from leaf to root.`,
    },
    {
      q: "What is lock escalation?",
      a: `When a transaction holds too many fine-grained locks (e.g. thousands of row locks), the DBMS converts them into a single coarser lock (table lock) to save memory — at the cost of concurrency. SQL Server does this; InnoDB doesn't escalate.`,
    },
  ],

  "Failures & log-based recovery": [
    {
      q: "What types of failures does recovery handle?",
      a: `- Transaction failure: logical errors (constraint violation) or system errors (deadlock victim).
      - System crash: power failure, OS crash — memory is lost, disk survives.
      - Media/disk failure: disk is damaged — needs backups and archived logs.`,
    },
    {
      q: "What is Write-Ahead Logging (WAL)?",
      a: `Before a modified data page is written to disk, its log record must be written to stable storage, and a transaction is committed only once its commit log record is on disk. Each log record holds <T, X, old value, new value>. WAL makes both undo (old values) and redo (new values) possible after a crash.`,
    },
    {
      q: "Undo vs redo during recovery?",
      a: `After a crash, scan the log:
      - Redo transactions that have a commit record — their changes may not have reached disk (durability).
      - Undo transactions that have a start but no commit/abort record — their partial changes may have reached disk (atomicity).`,
    },
    {
      q: "Deferred vs immediate database modification?",
      a: `Deferred update: changes are written to the DB only after commit — recovery needs only redo, never undo (NO-UNDO/REDO).
      Immediate update: changes may be written before commit — recovery needs both undo and redo (UNDO/REDO). Most real systems use immediate update for performance.`,
    },
  ],

  "Checkpoints, shadow paging & ARIES": [
    {
      q: "What is a checkpoint and why is it needed?",
      a: `Periodically, the DBMS flushes log records and dirty buffer pages to disk and writes a <checkpoint> record listing active transactions. On recovery, it only needs to process the log from the last checkpoint instead of from the beginning, making recovery much faster. Fuzzy checkpoints let transactions continue during the checkpoint.`,
    },
    {
      q: "What is shadow paging?",
      a: `A non-log recovery technique: keep two page tables — a shadow (current committed) page table and a current one. Updates are written to new copies of pages; the current table points to them. On commit, the current page table atomically replaces the shadow (one pointer switch). On abort, discard the current table. No undo/redo needed, but it fragments data, needs garbage collection and is hard with concurrent transactions.`,
    },
    {
      q: "Explain the ARIES recovery algorithm.",
      a: `ARIES uses WAL with LSNs (log sequence numbers) on pages and supports steal/no-force. Recovery has three phases:
      - Analysis: from the last checkpoint, rebuild the dirty page table and active transaction table.
      - Redo: repeat history — redo all logged actions (even of losers) from the earliest dirty page's LSN, skipping pages already up to date.
      - Undo: roll back loser transactions in reverse order, writing compensation log records (CLRs) so undo is never repeated after another crash.`,
    },
    {
      q: "What do steal/no-steal and force/no-force mean?",
      a: `- Steal: dirty pages of uncommitted transactions may be written to disk (requires undo).
      - No-steal: they can't (no undo needed, but needs lots of memory).
      - Force: all pages of a transaction are written at commit (no redo needed, slow commits).
      - No-force: they needn't be (requires redo).
      Steal + no-force gives the best performance and is what ARIES supports.`,
    },
  ],

  "Storage & file organization": [
    {
      q: "How is data stored on disk?",
      a: `Data is stored in blocks/pages (e.g. 4-16 KB), the unit of transfer between disk and memory. A page contains a header, a slot directory and records; slotted pages allow variable-length records and moving records within a page without changing their record IDs (page ID + slot number).`,
    },
    {
      q: "Compare heap, sequential and hashed file organisations.",
      a: `- Heap: records inserted anywhere there's space — fast inserts, searches require a full scan.
      - Sequential (sorted): records ordered by a key — efficient range queries and binary search; inserts are costly (overflow areas, reorganization).
      - Hashed: hash function on a key gives the bucket — very fast equality lookups, no range queries.`,
    },
    {
      q: "What does the buffer manager do?",
      a: `It caches disk pages in memory (buffer pool), deciding which pages to keep and which to evict. It tracks pin counts (pages in use can't be evicted) and dirty flags (dirty pages must be written before eviction, respecting WAL). Replacement policies: LRU, clock, MRU (better for sequential scans that would flood LRU), LRU-K.`,
    },
  ],

  "Index types": [
    {
      q: "What is an index and why is it used?",
      a: `An auxiliary data structure that speeds up searches on a search key, like a book's index — avoiding full table scans. Trade-offs: extra storage and slower inserts/updates/deletes since indexes must be maintained.`,
    },
    {
      q: "Primary vs clustering vs secondary index?",
      a: `- Primary index: on the ordering key field of a sorted file, which is also unique (one entry per block — sparse).
      - Clustering index: on an ordering field that is not unique (one entry per distinct value).
      - Secondary index: on a non-ordering field — the file isn't sorted by it, so it must be dense. A table can have many secondary indexes but only one primary/clustering index.`,
    },
    {
      q: "Dense vs sparse index?",
      a: `Dense: an index entry for every search-key value (every record) — faster lookups, more space. Sparse: entries for only some values (one per block) — less space, requires the file to be sorted on the key; find the largest entry ≤ the key then scan the block.`,
    },
    {
      q: "Clustered vs non-clustered index?",
      a: `Clustered: the table's rows are physically stored in the index order (leaf nodes contain the data); only one per table. Non-clustered: a separate structure whose leaves contain key + pointer (row ID or primary key) to the data; many per table; may need an extra lookup unless it's covering.`,
    },
  ],

  "B-trees & B+ trees": [
    {
      q: "What is a B-tree?",
      a: `A self-balancing multiway search tree of order m: each node has at most m children and m-1 keys; internal nodes (except root) have at least ⌈m/2⌉ children; all leaves are at the same level. Keys and data pointers are stored in all nodes. Height stays O(log n), so few disk reads are needed since each node fills a disk block.`,
    },
    {
      q: "B-tree vs B+ tree — why do databases use B+ trees?",
      a: `In a B+ tree, internal nodes store only keys (routing) and all data pointers are in leaves, which are linked in a list.
      Advantages:
      - Internal nodes hold more keys → higher fan-out → shorter tree → fewer I/Os.
      - Range scans just follow linked leaves.
      - Every search takes the same number of steps (always to a leaf).
      Key values in internal nodes are repeated in leaves.`,
    },
    {
      q: "How do insertion and deletion work in a B+ tree?",
      a: `Insertion: find the leaf; insert in sorted order; if it overflows, split it into two and copy the middle key up to the parent (in internal node splits the key is moved up). Splits can propagate up to the root, increasing height by 1.
      Deletion: remove from the leaf; if it underflows, borrow from a sibling (redistribute) or merge with it and remove the separator from the parent; merges can propagate up and reduce height.`,
    },
    {
      q: "How do you calculate the order of a B+ tree node?",
      a: `Internal node with p pointers and p-1 keys must fit in a block: p × pointer_size + (p-1) × key_size ≤ block_size.
      Example: block 1024 B, key 9 B, pointer 6 B: 6p + 9(p-1) ≤ 1024 → 15p ≤ 1033 → p = 68.
      Leaf: n keys + n record pointers + 1 next-leaf pointer ≤ block. Max records with height h ≈ p^(h-1) × leaf capacity.`,
    },
  ],

  "Hashing": [
    {
      q: "What is static hashing and its problem?",
      a: `A hash function maps a key to one of a fixed number of buckets. If buckets overflow, overflow chains are added, which degrades performance as data grows; if too many buckets are allocated, space is wasted. The bucket count can't adapt to growth without rehashing everything.`,
    },
    {
      q: "Explain extendible hashing.",
      a: `Uses a directory of 2^d pointers (global depth d) to buckets. A key's first/last d bits of its hash index the directory. Each bucket has a local depth. When a bucket overflows:
      - If local depth < global depth: split the bucket, increase its local depth, redistribute and update pointers.
      - If local depth = global depth: double the directory (global depth + 1), then split.
      Only the overflowing bucket is split — no full rehash.`,
    },
    {
      q: "What is linear hashing?",
      a: `It grows the number of buckets one at a time in a linear order (using a split pointer) without a directory. When a load threshold is exceeded, the bucket at the split pointer is split using the next hash function, even if it's not the one that overflowed. Overflow chains are temporary.`,
    },
    {
      q: "Hash index vs B+ tree index?",
      a: `Hash index: O(1) for equality lookups (=), useless for ranges, ordering or prefix searches. B+ tree: O(log n) for equality, also supports ranges (<, >, BETWEEN), ORDER BY and prefix LIKE 'abc%'. B+ trees are the default in most databases; hash indexes are used for in-memory tables or specific engines.`,
    },
  ],

  "Query processing & optimization": [
    {
      q: "What are the steps of query processing?",
      a: `- Parsing and translation: check syntax and semantics (tables/columns exist), translate to relational algebra.
      - Optimization: generate equivalent expressions and physical plans (which indexes, join order, join algorithms), estimate costs and choose the cheapest.
      - Evaluation: the execution engine runs the plan (iterator/pipelining model) and returns results.`,
    },
    {
      q: "What are the main equivalence rules used by the optimizer?",
      a: `- Push selections down: σ before joins to reduce intermediate result sizes.
      - Push projections down: drop unneeded columns early.
      - Joins are commutative and associative: reorder joins to keep intermediate results small.
      - Cascade of selections: σa∧b = σa(σb).
      - Replace σ over × with a join.`,
    },
    {
      q: "Heuristic vs cost-based optimization?",
      a: `Heuristic: apply rules that are usually good (perform selections early, then projections, then smallest joins first). Cost-based: enumerate plans (often with dynamic programming over join orders) and estimate cost using statistics (table sizes, number of distinct values, histograms), mainly in disk block transfers and seeks. Real optimizers combine both.`,
    },
    {
      q: "What is selectivity and why do statistics matter?",
      a: `Selectivity is the fraction of rows that satisfy a predicate (σ age=30 with 50 distinct ages ≈ 1/50). The optimizer uses it to estimate intermediate result sizes and decide, e.g., index scan vs full scan. Stale statistics cause bad plans, so run ANALYZE / update statistics after big data changes.`,
    },
  ],

  "Join algorithms": [
    {
      q: "Explain nested loop and block nested loop join.",
      a: `Nested loop: for each tuple in outer R, scan all of inner S. Cost ≈ n_R × b_S + b_R block transfers — very expensive.
      Block nested loop: for each block of R, scan S once — cost ≈ b_R × b_S + b_R; with M buffer pages use M-2 blocks for the outer: ⌈b_R/(M-2)⌉ × b_S + b_R. Use the smaller relation as the outer.`,
    },
    {
      q: "What is an index nested loop join?",
      a: `For each tuple of the outer relation, use an index on the inner relation's join attribute to find matches instead of scanning. Cost ≈ b_R + n_R × c, where c is the cost of an index lookup. Excellent when the outer is small and the inner has an index on the join column.`,
    },
    {
      q: "Explain sort-merge join.",
      a: `Sort both relations on the join attribute (if not already sorted), then scan both in parallel like merging, matching equal keys. Cost ≈ b_R + b_S block transfers plus sorting cost. Good for equi-joins on large inputs, especially when inputs are already sorted or the output must be sorted.`,
    },
    {
      q: "Explain hash join.",
      a: `Partition phase: hash both relations on the join attribute into partitions so matching tuples land in the same partition. Build/probe phase: for each partition, build an in-memory hash table on the smaller (build) relation and probe it with the other. Cost ≈ 3(b_R + b_S). Best for large equi-joins without useful indexes; doesn't work for non-equality joins.`,
    },
  ],

  "OLTP vs OLAP & data warehousing": [
    {
      q: "OLTP vs OLAP?",
      a: `OLTP (online transaction processing): many short read/write transactions touching few rows (orders, payments), normalized schema, latency-critical, current data. Examples: MySQL, PostgreSQL.

      OLAP (online analytical processing): fewer complex read queries scanning and aggregating millions of rows, denormalized schema, historical data, throughput-critical. Examples: Snowflake, BigQuery, Redshift, ClickHouse.`,
    },
    {
      q: "Row vs column storage?",
      a: `Row stores keep a row's columns together — ideal for OLTP fetching/updating whole rows. Column stores keep each column together — analytical queries read only needed columns, and similar values compress very well (run-length, dictionary encoding), enabling vectorized execution. Updates are slower in column stores.`,
    },
    {
      q: "Star vs snowflake schema; fact vs dimension tables?",
      a: `Fact table: measurable events (sales: quantity, amount) with foreign keys to dimensions; very large.
      Dimension tables: descriptive context (date, product, store, customer).
      Star schema: denormalized dimensions directly around the fact — simple, fewer joins, faster.
      Snowflake schema: dimensions normalized into sub-dimensions (product → category) — less redundancy, more joins.`,
    },
    {
      q: "ETL vs ELT?",
      a: `ETL: extract from sources, transform in a separate engine, then load into the warehouse — classic when warehouse compute was expensive.
      ELT: extract and load raw data into the warehouse first, then transform with SQL inside it (dbt) — the modern approach thanks to cheap, scalable cloud warehouses; keeps raw data for reprocessing.`,
    },
  ],

  "Distributed databases": [
    {
      q: "What is a distributed database and its advantages?",
      a: `A database whose data is stored across multiple sites connected by a network but appears as one database to users. Advantages: scalability, availability via replication, local access to data (lower latency), and fault tolerance. Disadvantages: complex query processing, distributed transactions, consistency and network partition issues.`,
    },
    {
      q: "Horizontal vs vertical fragmentation?",
      a: `Horizontal: split rows by a predicate — e.g. customers from India at the Mumbai site, US customers at the Virginia site; reconstruct with UNION.
      Vertical: split columns — each fragment holds some attributes plus the primary key; reconstruct with JOIN.
      Hybrid: both. Fragments must be complete, reconstructible and disjoint.`,
    },
    {
      q: "What transparencies should a distributed DBMS provide?",
      a: `Location transparency (users don't need to know where data lives), fragmentation transparency (query the table as if unfragmented), replication transparency (unaware of copies), plus failure and concurrency transparency.`,
    },
    {
      q: "How are distributed transactions committed?",
      a: `With Two-Phase Commit: the coordinator sends PREPARE; each site writes its changes and a prepare log record and votes yes/no; if all vote yes, the coordinator logs and sends COMMIT, otherwise ABORT. 2PC is blocking if the coordinator fails after participants voted yes; 3PC and consensus-based commit (Paxos commit, Spanner) address this.`,
    },
  ],

  "NoSQL & BASE": [
    {
      q: "What is NoSQL and its types?",
      a: `"Not only SQL" — non-relational databases designed for horizontal scale, flexible schemas and specific access patterns.
      - Key-value: Redis, DynamoDB.
      - Document: MongoDB, CouchDB.
      - Column-family: Cassandra, HBase.
      - Graph: Neo4j.`,
    },
    {
      q: "Explain BASE and compare with ACID.",
      a: `BASE: Basically Available (the system responds even under failures), Soft state (state may change without input as replicas converge), Eventually consistent. ACID prioritises consistency and correctness per transaction; BASE prioritises availability and scalability, accepting temporary inconsistency. Many NoSQL DBs now offer ACID within a document/partition.`,
    },
    {
      q: "Schema-on-write vs schema-on-read?",
      a: `Schema-on-write (RDBMS): the structure is defined up front and data is validated when written. Schema-on-read (most NoSQL, data lakes): data is stored as-is and structure is interpreted when read — flexible for evolving data, but validation moves into the application.`,
    },
    {
      q: "When would you choose SQL vs NoSQL?",
      a: `SQL: structured, related data needing joins, complex queries, strong consistency and transactions (banking, ERP, orders).
      NoSQL: massive scale or write throughput, simple known access patterns, rapidly changing schema, or specific data shapes (caching, sessions, IoT time series, social graphs, product catalogs).`,
    },
  ],

  "DBMS rapid-fire round-up": [
    {
      q: "DELETE vs TRUNCATE vs DROP?",
      a: `- DELETE (DML): removes selected rows with WHERE, logs each row, fires triggers, can be rolled back; keeps structure; doesn't reset auto-increment.
      - TRUNCATE (DDL): removes all rows quickly by deallocating pages, minimal logging, no WHERE, no row triggers, resets auto-increment; usually can't be rolled back (MySQL).
      - DROP (DDL): removes the table entirely — data, structure, indexes, constraints.`,
    },
    {
      q: "WHERE vs HAVING, and UNION vs UNION ALL?",
      a: `WHERE filters rows before grouping and can't use aggregates; HAVING filters groups after GROUP BY and can use aggregates (HAVING COUNT(*) > 5).

      UNION combines results and removes duplicates (requires a sort/hash, slower); UNION ALL keeps duplicates and is faster. Use UNION ALL when duplicates are impossible or acceptable.`,
    },
    {
      q: "CHAR vs VARCHAR; clustered vs non-clustered index?",
      a: `CHAR(n) is fixed length, padded with spaces — good for fixed-size codes (country codes). VARCHAR(n) is variable length, storing only the actual characters plus a length prefix — saves space for varying text.

      Clustered index determines the physical order of rows (one per table, leaves contain the data). Non-clustered is a separate structure with pointers to rows (many per table).`,
    },
    {
      q: "View vs materialized view; trigger vs stored procedure?",
      a: `A view is a stored query — a virtual table computed on each access, always current, used for security and simplicity. A materialized view stores the query result physically — fast to read but must be refreshed and can be stale.

      A stored procedure is precompiled SQL code called explicitly (CALL proc()), can take parameters and return results. A trigger runs automatically on an event (BEFORE/AFTER INSERT/UPDATE/DELETE) on a table and can't be called directly.`,
    },
    {
      q: "What are joins in SQL? Inner vs outer vs self join?",
      a: `- INNER JOIN: rows with matches in both tables.
      - LEFT/RIGHT OUTER JOIN: all rows from one side plus matches, NULLs where none.
      - FULL OUTER JOIN: all rows from both sides.
      - SELF JOIN: a table joined with itself (employee and manager).
      - CROSS JOIN: Cartesian product.`,
    },
  ],
};
