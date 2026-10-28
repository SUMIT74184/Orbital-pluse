import type { TopicGuide } from "./index";

// Plain-language lessons for the DBMS track, keyed by topic title (see src/data/topics.ts).
export const DBMS_GUIDES: Record<string, TopicGuide> = {
  "What a DBMS is & why not plain files": {
    simple: `A database is an organised collection of data. A DBMS (Database Management System) is the software that stores it, lets you query it, and protects it: MySQL, PostgreSQL, Oracle, MongoDB.

    Before DBMSs, every program kept its own files. The same data got copied everywhere and went out of sync, every new question needed a new program, two people editing together corrupted files, and a crash mid-update left half-written data. A DBMS solves all of these in one place.`,
    analogy: `A college where the fees office, library and hostel each keep their own register of students. Asha moves house and tells only the fees office — now the library still has the old address. A DBMS is one central register that every office reads and updates, with rules about who can change what.`,
    visual: "dbms-vs-files",
    concepts: [
      { term: "Data redundancy", meaning: "The same data stored in many places — wastes space and causes inconsistency." },
      { term: "Data inconsistency", meaning: "Copies of the same data disagree." },
      { term: "Data isolation", meaning: "Data scattered in different files and formats, hard to combine." },
      { term: "Integrity constraints", meaning: "Rules like 'age > 0' enforced by the DBMS, not each program." },
      { term: "Atomicity", meaning: "A transfer either fully happens or not at all, even if the system crashes." },
      { term: "Concurrency control", meaning: "Many users can work at once without corrupting data." },
    ],
    compare: {
      head: ["", "File system", "DBMS"],
      rows: [
        ["Redundancy", "High", "Controlled"],
        ["Querying", "Write a program", "SQL"],
        ["Concurrent users", "Unsafe", "Locks / MVCC"],
        ["Crash recovery", "None", "Logs, rollback"],
        ["Security", "File-level", "User/table/column-level"],
        ["Cost & complexity", "Low", "Higher"],
      ],
    },
    mistakes: [
      "Saying a DBMS removes redundancy completely — it controls it (some is kept on purpose for speed).",
      "Mixing up 'database' (the data) and 'DBMS' (the software).",
      "Forgetting the disadvantages: cost, complexity, overhead for tiny apps.",
    ],
    remember: "A DBMS gives one controlled copy of data with querying, integrity, concurrency, security and crash recovery.",
  },

  "Three-schema architecture & data independence": {
    simple: `The three-schema architecture separates how users see data from how it's actually stored, in three levels:

    - External level: what each user or app sees (views).
    - Conceptual level: the full logical design — tables, columns, relationships, constraints.
    - Internal level: how it's physically stored — files, pages, indexes.

    Because each level is hidden from the one above, you can change a lower level without breaking the upper one. That's called data independence.`,
    analogy: `A restaurant. Customers see the menu (external). The chef knows all recipes and ingredients (conceptual). The storeroom layout — which shelf, fridge, freezer — is internal. Rearranging the storeroom doesn't change the recipes; adding a new recipe doesn't change the menu card of customers who never order it.`,
    visual: "three-schema",
    concepts: [
      { term: "Schema", meaning: "The design/structure of the database. Changes rarely." },
      { term: "Instance", meaning: "The actual data at a moment. Changes all the time." },
      { term: "Logical data independence", meaning: "Change the conceptual schema (add a column/table) without changing external views or apps." },
      { term: "Physical data independence", meaning: "Change storage (add an index, move files) without changing the conceptual schema." },
      { term: "Mapping", meaning: "The translation between two levels, maintained by the DBMS." },
      { term: "View", meaning: "A virtual table showing a subset or combination of data for one user group." },
    ],
    compare: {
      head: ["", "Logical independence", "Physical independence"],
      rows: [
        ["Protects", "External views / apps", "Conceptual schema"],
        ["From changes in", "Conceptual schema", "Internal (storage) schema"],
        ["Example", "Add an 'email' column", "Add an index, change file organisation"],
        ["Difficulty", "Harder to achieve", "Easier"],
      ],
    },
    mistakes: [
      "Swapping the definitions of logical and physical independence.",
      "Calling the conceptual level 'physical'.",
      "Confusing schema (structure) with instance (data snapshot).",
    ],
    remember: "External (views) → conceptual (tables) → internal (storage); logical independence protects views, physical protects the logical schema.",
  },

  "DBMS architecture & languages": {
    simple: `DBMS architecture describes where the database sits relative to users. In 1-tier, the user works directly on the DB machine. In 2-tier, a client app talks directly to the DB server. In 3-tier — how almost every web app works — the client talks to an application server, which talks to the database.

    SQL commands are grouped by purpose: DDL defines structure, DML works with the rows, DCL controls permissions, and TCL controls transactions.`,
    analogy: `Ordering food. 1-tier: you cook in your own kitchen. 2-tier: you shout your order straight into the restaurant kitchen. 3-tier: you order through a waiter who checks the menu rules and talks to the kitchen for you. The waiter is the application server.`,
    visual: "three-tier",
    how: {
      visual: "sql-languages",
      steps: [
        "**DDL** — CREATE, ALTER, DROP, TRUNCATE, RENAME. Changes structure; auto-commits in MySQL.",
        "**DML** — SELECT, INSERT, UPDATE, DELETE. Works on rows; can be rolled back.",
        "**DCL** — GRANT, REVOKE. Who can do what.",
        "**TCL** — COMMIT, ROLLBACK, SAVEPOINT. Ends or undoes a transaction.",
        "Inside the DBMS, the **query processor** (parser, optimizer, executor) decides how to run SQL; the **storage manager** (buffer, file, transaction, lock and recovery managers) actually reads and writes data.",
      ],
    },
    concepts: [
      { term: "2-tier", meaning: "Client app ↔ DB server. Simple, but every client needs DB credentials." },
      { term: "3-tier", meaning: "Client ↔ app server ↔ DB. Business logic and security in the middle; scales well." },
      { term: "Query processor", meaning: "DDL interpreter, DML compiler, optimizer, execution engine." },
      { term: "Storage manager", meaning: "Buffer manager, file manager, transaction manager, authorization." },
      { term: "Data dictionary", meaning: "Metadata about tables, columns, users — the DB describing itself." },
      { term: "DBA", meaning: "Database administrator: schema, security, backups, tuning." },
    ],
    example: `~~~
    CREATE TABLE student (roll INT PRIMARY KEY, name VARCHAR(50));   -- DDL
    INSERT INTO student VALUES (1, 'Asha');                          -- DML
    GRANT SELECT ON student TO 'library_app';                        -- DCL
    START TRANSACTION; UPDATE student SET name='Asha K' WHERE roll=1;
    ROLLBACK;                                                        -- TCL
    ~~~`,
    mistakes: [
      "Calling SELECT DDL (it's DML; some books call it DQL).",
      "Classing TRUNCATE as DML — it's DDL.",
      "Saying a 3-tier app's browser connects to the database.",
    ],
    remember: "3-tier = client → app server → DB; DDL shapes, DML changes rows, DCL grants, TCL commits/rolls back.",
  },

  "Data models": {
    simple: `A data model is the way you organise and connect data. Old systems used the hierarchical model (a tree: each child has one parent) and the network model (a graph of linked records). Today the relational model — tables linked by keys — is the default.

    Newer models include object-oriented/object-relational (tables that support objects and custom types, like PostgreSQL) and NoSQL models: key-value, document, wide-column and graph, each tuned for one kind of access.`,
    analogy: `Organising your contacts. Hierarchical: a folder tree — Family → Cousins → Rahul. Network: a web where Rahul links to both Family and College. Relational: a neat spreadsheet of people plus a separate sheet of groups, linked by IDs. Document: one index card per person with everything about them on it.`,
    visual: "data-models",
    concepts: [
      { term: "Hierarchical model", meaning: "Tree structure, 1:N only. IBM IMS. Hard to model M:N." },
      { term: "Network model", meaning: "Records linked by pointers; supports M:N. CODASYL. Complex to query." },
      { term: "Relational model", meaning: "Data in relations (tables); relationships via keys; queried with SQL." },
      { term: "Object-relational", meaning: "Relational + user-defined types, arrays, inheritance (PostgreSQL)." },
      { term: "Document model", meaning: "Self-contained JSON-like records (MongoDB)." },
      { term: "Graph model", meaning: "Nodes and edges for relationship-heavy data (Neo4j)." },
    ],
    compare: {
      head: ["Model", "Structure", "Good at", "Weak at"],
      rows: [
        ["Hierarchical", "Tree", "Fixed 1:N lookups", "M:N, flexibility"],
        ["Network", "Graph of records", "M:N links", "Complex navigation"],
        ["Relational", "Tables + keys", "Ad-hoc queries, integrity", "Very deep relationships, huge scale-out"],
        ["Document", "Nested JSON", "Flexible records", "Joins across documents"],
        ["Graph", "Nodes + edges", "Many-hop traversals", "Bulk aggregation"],
      ],
    },
    mistakes: [
      "Thinking NoSQL means 'no structure' — each NoSQL type has its own model.",
      "Forgetting that the relational model is based on set theory and relational algebra.",
    ],
    remember: "Hierarchical = tree, network = graph, relational = tables + keys (today's default), NoSQL = models built for specific access patterns.",
  },

  "Entities, attributes & relationships": {
    simple: `The ER (Entity–Relationship) model is how you design a database on paper before creating tables. You find the entities (things: Student, Course), their attributes (properties: name, roll number), and the relationships between them (a Student enrols in a Course).

    In ER diagrams: rectangles are entities, ovals are attributes, diamonds are relationships. A weak entity can't be identified on its own — it needs its owner (a room number only makes sense inside a building).`,
    analogy: `Describing a school to a new friend: "There are students and teachers (entities). Each student has a name, roll number and phone numbers (attributes). Teachers teach students (relationship)."`,
    visual: "er-basics",
    concepts: [
      { term: "Entity / entity set", meaning: "One real thing (student Asha) / the collection of all such things (all students)." },
      { term: "Key attribute", meaning: "Uniquely identifies an entity (roll_no). Underlined in ER diagrams." },
      { term: "Composite attribute", meaning: "Made of parts: name = first + last; address = street + city." },
      { term: "Multi-valued attribute", meaning: "Can have many values: phone numbers. Double oval." },
      { term: "Derived attribute", meaning: "Computed from others: age from date of birth. Dashed oval." },
      { term: "Weak entity", meaning: "No key of its own; identified by owner's key + a partial key (Dependent of an Employee). Double rectangle, double diamond for its identifying relationship." },
      { term: "Degree of relationship", meaning: "Number of entity sets involved: unary (Employee manages Employee), binary, ternary." },
    ],
    compare: {
      head: ["", "Strong entity", "Weak entity"],
      rows: [
        ["Own primary key", "Yes", "No (partial key only)"],
        ["Depends on another entity", "No", "Yes (total participation)"],
        ["ER symbol", "Single rectangle", "Double rectangle"],
        ["Example", "Employee", "Dependent (child of an employee)"],
      ],
    },
    mistakes: [
      "Making a multi-valued attribute a single column with comma-separated values.",
      "Storing a derived attribute (age) that goes stale.",
      "Forgetting a weak entity's key is owner key + partial key.",
    ],
    remember: "Entities are things, attributes describe them, relationships connect them; a weak entity borrows its owner's key.",
  },

  "Cardinality & participation constraints": {
    simple: `Cardinality says how many entities on one side can be linked to how many on the other: one-to-one (1:1), one-to-many (1:N) or many-to-many (M:N).

    Participation says whether every entity must take part. Total participation (double line) means every entity must be in the relationship — every loan must belong to a customer. Partial (single line) means some may not — a customer may have no loan.`,
    analogy: `In a college: one HOD heads one department (1:1). One department has many teachers (1:N). Many students take many courses (M:N). Every student must belong to a department (total), but not every student is in the sports team (partial).`,
    visual: "cardinality",
    how: {
      visual: "participation",
      steps: [
        "Read cardinality by asking both directions: 'one department has how many teachers?' and 'one teacher belongs to how many departments?'.",
        "Total participation on side A means 'every A must appear' → the foreign key on A's table is NOT NULL.",
        "(min, max) notation: write (min, max) next to each entity. (1, 1) = exactly one; (0, N) = any number, possibly none.",
        "In (min, max) notation, min = 0 means partial participation, min ≥ 1 means total.",
      ],
    },
    concepts: [
      { term: "1:1", meaning: "One on each side: Person–Passport. FK on either side with UNIQUE." },
      { term: "1:N", meaning: "One to many: Department–Teacher. FK on the many side." },
      { term: "M:N", meaning: "Many to many: Student–Course. Needs a separate junction table." },
      { term: "Total participation", meaning: "Every entity participates. Double line." },
      { term: "Partial participation", meaning: "Some entities may not participate. Single line." },
      { term: "(min, max)", meaning: "Exact lower and upper limits on participation." },
    ],
    mistakes: [
      "Reading cardinality from only one direction.",
      "Mixing up the arrow/line conventions between textbooks — say which notation you use.",
      "Putting the foreign key on the 'one' side of a 1:N relationship.",
    ],
    remember: "Cardinality = how many (1:1, 1:N, M:N); participation = must everyone take part (total) or not (partial).",
  },

  "Extended ER: generalization, specialization & aggregation": {
    simple: `Extended ER (EER) adds object-oriented ideas to ER diagrams.

    Specialization is top-down: split a general entity into sub-types (Employee → Manager, Engineer). Generalization is bottom-up: combine similar entities into a common parent (Car and Bike → Vehicle). Sub-types inherit the parent's attributes. Aggregation treats a whole relationship as an entity so it can take part in another relationship.`,
    analogy: `Specialization: starting from "Vehicle" and noticing cars need 'seats' and trucks need 'load capacity' — so you make sub-types. Generalization: you first had separate Car and Truck forms, noticed both have registration number and owner, and pulled those into a common Vehicle form. Same result, different direction.`,
    visual: "specialization",
    concepts: [
      { term: "Specialization", meaning: "Top-down: create sub-classes with extra attributes." },
      { term: "Generalization", meaning: "Bottom-up: merge common attributes into a super-class." },
      { term: "Attribute inheritance", meaning: "Sub-classes get all the super-class's attributes and relationships." },
      { term: "Disjoint vs overlapping", meaning: "An entity can be in only one sub-class vs in several." },
      { term: "Total vs partial", meaning: "Every super-class entity must be in some sub-class vs not necessarily." },
      { term: "Aggregation", meaning: "Treat a relationship (Employee works-on Project) as one unit that relates to another entity (Manager monitors it)." },
    ],
    compare: {
      head: ["", "Specialization", "Generalization"],
      rows: [
        ["Direction", "Top-down", "Bottom-up"],
        ["Starts from", "One general entity", "Several specific entities"],
        ["Purpose", "Add specific attributes", "Remove repeated attributes"],
      ],
    },
    mistakes: [
      "Using aggregation when a simple ternary relationship would do.",
      "Forgetting to say disjoint/overlapping and total/partial for a specialization.",
    ],
    remember: "Specialization splits down, generalization merges up, aggregation makes a relationship act like an entity.",
  },

  "Converting an ER diagram to tables": {
    simple: `Once the ER diagram is ready, you turn it into tables with a few fixed rules. Every strong entity becomes a table. Each M:N relationship becomes its own junction table. 1:N relationships don't need a new table — just put a foreign key on the 'many' side. Multi-valued attributes get their own table.

    Interviews often ask "what's the minimum number of tables?" — apply these rules and merge wherever a 1:1 or 1:N with total participation allows it.`,
    analogy: `Turning a family tree drawing into a phone contact list: each person gets a contact card (entity → table). "Parent of" can be noted on the child's card (1:N → FK on many side). Friendships between many people need a separate list of pairs (M:N → junction table).`,
    visual: "er-to-tables",
    how: {
      steps: [
        "Strong entity → table with its attributes; key attribute → primary key. Composite attributes → separate columns.",
        "Weak entity → table with owner's PK + partial key as the composite PK, and FK to the owner (ON DELETE CASCADE).",
        "1:1 → FK on either side (prefer the side with total participation) with UNIQUE; or merge both into one table.",
        "1:N → FK on the N side. Relationship attributes go there too.",
        "M:N → new table with both PKs as FKs; together they form its primary key. Relationship attributes go here.",
        "Multi-valued attribute → new table (entity PK, value).",
      ],
    },
    concepts: [
      { term: "Junction / bridge table", meaning: "Table for an M:N relationship: Enrolment(roll, cid)." },
      { term: "Foreign key placement", meaning: "On the 'many' side for 1:N; either side for 1:1." },
      { term: "Composite primary key", meaning: "PK of more than one column (roll, cid)." },
      { term: "Minimum tables", meaning: "Usually: one per strong entity + one per M:N + one per multi-valued attribute; 1:1 and 1:N merge." },
    ],
    example: `~~~
    CREATE TABLE enrolment (
      roll  INT REFERENCES student(roll),
      cid   VARCHAR(10) REFERENCES course(cid),
      grade CHAR(1),
      PRIMARY KEY (roll, cid)
    );
    ~~~`,
    mistakes: [
      "Creating a separate table for every 1:N relationship.",
      "Putting a list of course ids in one student column.",
      "Forgetting relationship attributes (grade) belong to the junction table.",
    ],
    remember: "Entity → table, 1:N → FK on many side, M:N → junction table, multi-valued → own table.",
  },

  "Relational model concepts": {
    simple: `In the relational model, data lives in relations, which are just tables. Each row is a tuple, each column an attribute, and each attribute has a domain (allowed values, like integers 1–100).

    A relation is a set, so it has no duplicate rows and no meaningful order of rows or columns. Degree is the number of columns; cardinality is the number of rows. NULL means "unknown / not applicable", which is different from zero or an empty string.`,
    analogy: `An attendance register: the page is the relation, each student's line is a tuple, the printed column headings are attributes, and "the date column can only hold dates" is a domain.`,
    visual: "relation-anatomy",
    concepts: [
      { term: "Relation", meaning: "A table: a set of tuples with the same attributes." },
      { term: "Tuple", meaning: "A row." },
      { term: "Attribute", meaning: "A column, with a name and a domain." },
      { term: "Domain", meaning: "Set of allowed atomic values for an attribute." },
      { term: "Degree / arity", meaning: "Number of attributes (columns)." },
      { term: "Cardinality", meaning: "Number of tuples (rows)." },
      { term: "Relation schema vs instance", meaning: "Student(roll, name, city) vs the rows currently in it." },
    ],
    example: `~~~
    -- NULL is "unknown": comparisons with it are neither true nor false
    SELECT * FROM student WHERE city = NULL;     -- returns nothing!
    SELECT * FROM student WHERE city IS NULL;    -- correct
    SELECT COUNT(city) FROM student;             -- NULLs are not counted
    ~~~`,
    mistakes: [
      "Saying row order matters in a relation.",
      "Using = NULL instead of IS NULL.",
      "Confusing cardinality of a relation (rows) with cardinality of a relationship (1:N).",
    ],
    remember: "Relation = table, tuple = row, attribute = column; degree counts columns, cardinality counts rows; NULL means unknown.",
  },

  Keys: {
    simple: `A key is a set of columns that uniquely identifies each row.

    - Super key: any set of columns that is unique (may have extra columns).
    - Candidate key: a minimal super key — remove any column and it's no longer unique.
    - Primary key: the one candidate key you choose; can't be NULL.
    - Alternate key: the candidate keys you didn't choose.
    - Foreign key: a column that refers to a key in another table.`,
    analogy: `Identifying a student: {roll no} works, {email} works, {roll no, name} also works but name is unnecessary. The first two are candidate keys (minimal). The college picks roll no as the primary key; email becomes an alternate key. In the library table, the roll no column pointing to the student table is a foreign key.`,
    visual: "key-sets",
    how: {
      steps: [
        "Find the candidate keys using attribute closure (an attribute set whose closure is all attributes, and no subset of it works).",
        "Every superset of a candidate key is a super key.",
        "**Counting super keys** with n attributes and one candidate key of k attributes: 2^(n−k).",
        "With two candidate keys A and B: |A| + |B| − |A ∩ B| by inclusion–exclusion — e.g. R(A,B,C,D), keys {A} and {B}: 2³ + 2³ − 2² = 12.",
      ],
    },
    concepts: [
      { term: "Composite key", meaning: "A key made of 2+ columns: (roll, cid)." },
      { term: "Surrogate key", meaning: "An artificial id (AUTO_INCREMENT) with no business meaning." },
      { term: "Natural key", meaning: "A real-world identifier (PAN, email)." },
      { term: "Prime attribute", meaning: "Part of some candidate key." },
      { term: "Unique key", meaning: "Unique but allows NULL (one or many depending on DBMS); many per table." },
      { term: "Foreign key", meaning: "References a primary/unique key elsewhere; enforces referential integrity." },
    ],
    compare: {
      head: ["", "Primary key", "Unique key"],
      rows: [
        ["NULL allowed", "No", "Yes"],
        ["How many per table", "One", "Many"],
        ["Index", "Clustered in InnoDB", "Secondary (non-clustered)"],
      ],
    },
    mistakes: [
      "Calling every unique column set a candidate key — it must be minimal.",
      "Saying a primary key must be a single column.",
      "Forgetting that a foreign key can be NULL (unless declared NOT NULL).",
    ],
    remember: "Super key ⊇ candidate key (minimal) ⊇ primary key (the chosen one); the rest are alternate keys.",
  },

  "Integrity constraints": {
    simple: `Integrity constraints are rules the DBMS enforces so bad data can't get in, no matter which app writes it.

    - Domain: the value must be of the right type and range (age between 0 and 120).
    - Entity integrity: the primary key can't be NULL.
    - Referential integrity: a foreign key must match an existing row in the referenced table (or be NULL).
    - Key / unique and CHECK constraints for other business rules.`,
    analogy: `A bank form with rules printed on it: account number required (entity integrity), branch code must be a real branch (referential integrity), age must be a number (domain), withdrawal can't exceed balance (check). The clerk rejects forms that break any rule.`,
    visual: "referential",
    how: {
      visual: "on-delete",
      steps: [
        "Inserting a child row with a non-existent parent → rejected.",
        "Deleting a parent that has children → depends on ON DELETE: CASCADE, SET NULL, SET DEFAULT, or RESTRICT/NO ACTION (reject).",
        "Updating a parent key → same choices with ON UPDATE.",
        "CHECK constraints are evaluated on each insert/update (MySQL enforces them from 8.0.16).",
      ],
    },
    concepts: [
      { term: "Domain constraint", meaning: "Type, range, format of a column." },
      { term: "Entity integrity", meaning: "PK is unique and NOT NULL." },
      { term: "Referential integrity", meaning: "FK values must exist in the parent table." },
      { term: "CASCADE", meaning: "Delete/update the parent → do the same to its children." },
      { term: "SET NULL", meaning: "Delete the parent → children's FK becomes NULL." },
      { term: "CHECK", meaning: "Custom condition: CHECK (salary > 0)." },
    ],
    example: `~~~
    CREATE TABLE orders (
      id          INT PRIMARY KEY,
      customer_id INT NOT NULL,
      amount      DECIMAL(10,2) CHECK (amount > 0),
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );
    ~~~`,
    mistakes: [
      "Relying only on application code for rules — another app or a manual query can still break them.",
      "Using CASCADE carelessly and wiping out order history when a customer is deleted.",
      "Thinking a foreign key must reference a primary key — a unique key also works.",
    ],
    remember: "Domain = valid values, entity = PK not NULL, referential = FKs point to real rows, plus CHECK/UNIQUE for business rules.",
  },

  "Relational algebra": {
    simple: `Relational algebra is the maths behind SQL: a small set of operations that take tables and return tables. Because outputs are tables, you can chain them.

    The basic ones are selection σ (filter rows), projection π (pick columns), union ∪, set difference −, Cartesian product × and rename ρ. Joins, intersection and division are built from these. The DBMS's optimizer actually rewrites your SQL as relational algebra to plan how to run it.`,
    analogy: `Working with a class register: σ is "only students from Pune", π is "only the name column", × is "pair every student with every course", ⋈ is "pair each student only with the courses they took", ÷ is "students who took every course".`,
    visual: "algebra-ops",
    concepts: [
      { term: "Selection σ", meaning: "σ condition(R) — rows satisfying the condition (WHERE)." },
      { term: "Projection π", meaning: "π columns(R) — chosen columns, duplicates removed." },
      { term: "Cartesian product ×", meaning: "Every row of R with every row of S: |R| × |S| rows." },
      { term: "Natural join ⋈", meaning: "Join on all same-named columns, keep one copy of them." },
      { term: "Theta / equi join", meaning: "Join on any condition / on equality only." },
      { term: "Outer joins ⟕ ⟖ ⟗", meaning: "Keep unmatched rows from left / right / both, padded with NULLs." },
      { term: "Division ÷", meaning: "'For all' queries: students who enrolled in all courses." },
    ],
    example: `~~~
    Names of students who took course C1:
      π name ( σ cid='C1' ( Student ⋈ Enrol ) )

    SQL: SELECT DISTINCT s.name FROM Student s JOIN Enrol e ON s.roll = e.roll
         WHERE e.cid = 'C1';

    Union / difference need union-compatible relations (same number and types of columns).
    ~~~`,
    mistakes: [
      "Forgetting projection removes duplicates (SQL SELECT doesn't unless DISTINCT).",
      "Using union on tables with different columns.",
      "Mixing up σ (rows) and π (columns).",
    ],
    remember: "σ filters rows, π picks columns, ⋈ matches rows, ÷ answers 'for all' — and every result is again a table.",
  },

  "Relational calculus": {
    simple: `Relational algebra is procedural: you say how to get the answer, step by step. Relational calculus is declarative: you describe what the answer looks like, and leave the how to the system. SQL is closer to calculus.

    Tuple relational calculus (TRC) uses variables that stand for whole rows. Domain relational calculus (DRC) uses variables for individual column values. Both are as powerful as relational algebra — this is called relational completeness.`,
    analogy: `Algebra is giving directions: "go straight, turn left at the temple, second right". Calculus is giving the address: "the blue house next to the temple" — and the driver figures out the route.`,
    visual: "query-forms",
    concepts: [
      { term: "TRC", meaning: "{ t | P(t) } — all tuples t for which P is true." },
      { term: "DRC", meaning: "{ ⟨a, b⟩ | P(a, b) } — variables range over attribute values." },
      { term: "Quantifiers", meaning: "∃ (there exists), ∀ (for all)." },
      { term: "Safe expression", meaning: "Guaranteed to return a finite result from values in the database." },
      { term: "Unsafe expression", meaning: "{ t | ¬(t ∈ Student) } — infinite answer (everything not a student)." },
      { term: "Relationally complete", meaning: "A language that can express any relational algebra query (SQL is)." },
    ],
    compare: {
      head: ["", "Relational algebra", "Relational calculus"],
      rows: [
        ["Style", "Procedural (how)", "Declarative (what)"],
        ["Building blocks", "Operators σ π ⋈ …", "Predicates with ∃ ∀"],
        ["Order of steps", "Given", "Not specified"],
        ["Power", "Same (for safe expressions)", "Same"],
      ],
    },
    mistakes: [
      "Saying calculus is more powerful than algebra — safe calculus and algebra are equivalent.",
      "Writing an unsafe expression with an unbounded negation.",
    ],
    remember: "Algebra says how, calculus says what; TRC uses row variables, DRC column variables; SQL is based on TRC.",
  },

  "Functional dependencies & Armstrong's axioms": {
    simple: `A functional dependency X → Y means: if two rows have the same X, they must have the same Y. "roll → name" says one roll number can't have two different names.

    FDs are business rules written formally, and they're the basis of normalization. Armstrong's axioms (reflexivity, augmentation, transitivity) let you derive every FD that follows from the ones you're given.`,
    analogy: `Your Aadhaar number determines your name and date of birth: same Aadhaar → same person details. But your city doesn't determine your name — many people live in Pune. So Aadhaar → name holds; city → name doesn't.`,
    visual: "fd-arrows",
    how: {
      visual: "armstrong",
      steps: [
        "Write down the FDs from the business rules (or check them against sample data — a counter-example breaks an FD).",
        "Trivial FD: Y ⊆ X (e.g. {roll, name} → name) — always true, ignored.",
        "Use transitivity to find hidden ones: roll → dept and dept → hod give roll → hod.",
        "Use union/decomposition to combine or split right sides.",
      ],
    },
    concepts: [
      { term: "Determinant", meaning: "The left side X of X → Y." },
      { term: "Trivial FD", meaning: "X → Y where Y ⊆ X." },
      { term: "Non-trivial FD", meaning: "Y has something not in X." },
      { term: "Reflexivity", meaning: "If Y ⊆ X then X → Y." },
      { term: "Augmentation", meaning: "If X → Y then XZ → YZ." },
      { term: "Transitivity", meaning: "If X → Y and Y → Z then X → Z." },
      { term: "Closure F⁺", meaning: "All FDs implied by a set F." },
    ],
    mistakes: [
      "Deciding an FD holds just because current data happens to fit it — FDs come from rules, data can only disprove them.",
      "Splitting the left side: XY → Z does NOT imply X → Z.",
      "Reading X → Y as 'Y determines X'.",
    ],
    remember: "X → Y: same X always means same Y; Armstrong's three axioms derive every implied FD.",
  },

  "Attribute closure & canonical cover": {
    simple: `The closure of a set of attributes X (written X⁺) is everything X can determine using the FDs. It's the main tool for finding keys: if X⁺ contains all attributes, X is a super key; if no smaller part of X does, X is a candidate key.

    A canonical (minimal) cover is the simplest equivalent set of FDs: single attributes on the right, no extra attributes on the left, and no redundant FDs. It's used before designing 3NF tables.`,
    analogy: `Closure is like asking "if I know a student's roll number, what else can I find out?" — name, then department, then the HOD of that department… keep going until nothing new turns up.`,
    visual: "closure",
    how: {
      steps: [
        "**Closure X⁺:** start with result = X. Repeat: for each FD A → B, if A ⊆ result, add B. Stop when nothing changes.",
        "**Candidate keys:** attributes never on any right side must be in every key. Start with them, compute the closure, add attributes until it covers everything; then check minimality.",
        "**Canonical cover step 1:** split right sides (A → BC becomes A → B, A → C).",
        "**Step 2:** remove extraneous left attributes: in AB → C, if A⁺ already contains C, drop B.",
        "**Step 3:** remove redundant FDs: drop A → B if A⁺ computed without it still contains B.",
        "**Equivalence of F and G:** every FD of G follows from F (via closures) and vice versa.",
      ],
    },
    concepts: [
      { term: "X⁺", meaning: "All attributes functionally determined by X." },
      { term: "Super key test", meaning: "X⁺ = all attributes of R." },
      { term: "Essential attributes", meaning: "Never on any FD's right side → part of every candidate key." },
      { term: "Extraneous attribute", meaning: "Can be removed from an FD without changing what it implies." },
      { term: "Canonical cover Fc", meaning: "Minimal equivalent FD set; not always unique." },
    ],
    example: `~~~
    R(A, B, C, D, E)   F = { A → B, B → C, CD → E }
    D never appears on a right side → every key contains D. A neither.
    {A,D}⁺ = {A,D} → +B → +C → +E = all  ⇒ AD is a candidate key
    {D}⁺ = {D}, {A}⁺ = {A,B,C}             ⇒ neither alone works
    Only candidate key: AD
    ~~~`,
    mistakes: [
      "Stopping the closure loop after one pass — repeat until nothing changes.",
      "Forgetting to check minimality when declaring a candidate key.",
      "Dropping an FD as redundant using the closure computed WITH that FD.",
    ],
    remember: "X⁺: keep applying FDs until nothing new; X is a key when X⁺ is everything and no subset works.",
  },

  "Anomalies, 1NF & 2NF": {
    simple: `Normalization means splitting badly designed tables so each fact is stored once. A table that mixes several facts suffers from anomalies:

    - Update anomaly: the same fact stored in many rows; change one, forget another.
    - Insertion anomaly: you can't add a fact without unrelated data (a new department with no students).
    - Deletion anomaly: deleting one fact accidentally deletes another.

    1NF: every cell holds a single value. 2NF: 1NF plus no non-key column depends on only part of a composite key.`,
    analogy: `A class WhatsApp group where the teacher's phone number is written in every student's intro message. If the teacher changes the number, you'd have to edit 60 messages (update anomaly). Store it once, in the group description.`,
    visual: "anomalies",
    how: {
      visual: "nf-1-2",
      steps: [
        "**1NF:** split multi-valued cells (\"C1, C2\") into separate rows or a separate table. No repeating groups.",
        "Find the candidate keys; mark **prime** attributes (part of any candidate key) and **non-prime** ones.",
        "**2NF check:** is any non-prime attribute determined by a proper part of a candidate key? That's a partial dependency.",
        "Move that part of the key and what it determines into a new table (cid → c_name goes to Course).",
        "A table whose candidate keys are all single columns is automatically in 2NF.",
      ],
    },
    concepts: [
      { term: "Atomic value", meaning: "Can't be meaningfully split for the database's purposes." },
      { term: "Prime attribute", meaning: "Belongs to at least one candidate key." },
      { term: "Non-prime attribute", meaning: "Not in any candidate key." },
      { term: "Partial dependency", meaning: "Non-prime attribute depends on part of a composite key." },
      { term: "Full functional dependency", meaning: "Depends on the whole key, not any part of it." },
    ],
    mistakes: [
      "Checking 2NF against only the primary key instead of all candidate keys.",
      "Saying a single-column-key table might violate 2NF — it can't.",
      "Calling a comma-separated list 'atomic'.",
    ],
    remember: "1NF = one value per cell; 2NF = non-key columns depend on the whole key, not part of it.",
  },

  "3NF & BCNF": {
    simple: `3NF removes transitive dependencies: a non-key column must not depend on another non-key column. In "roll → dept → hod", hod depends on dept, not directly on the student, so it moves to a Dept table.

    BCNF is a stricter version: for every non-trivial FD X → Y, X must be a super key. Every BCNF table is in 3NF, but not the other way round. The difference only shows up when a non-key attribute determines part of a key.`,
    analogy: `"The key, the whole key, and nothing but the key." 1NF gives you a key, 2NF says depend on the whole key, 3NF says depend on nothing but the key. BCNF says even key parts must only be determined by keys.`,
    visual: "nf-3",
    how: {
      visual: "nf-ladder",
      steps: [
        "For each non-trivial FD X → A, check the **3NF rule**: X is a super key OR A is a prime attribute.",
        "For **BCNF**, only the first part counts: X must be a super key.",
        "Fix a violation: split R into (X ∪ {A}) and (R − {A}).",
        "Classic 3NF-but-not-BCNF case: R(student, course, teacher), FDs {student, course} → teacher and teacher → course. Keys: {student, course}, {student, teacher}. teacher → course breaks BCNF (teacher isn't a super key) but course is prime, so 3NF holds.",
        "Splitting it into (teacher, course) and (student, teacher) is BCNF but loses the FD {student, course} → teacher.",
      ],
    },
    concepts: [
      { term: "Transitive dependency", meaning: "A → B and B → C where B is not a key, so A → C indirectly." },
      { term: "3NF condition", meaning: "For X → A: X is a super key or A is prime." },
      { term: "BCNF condition", meaning: "For every non-trivial X → Y: X is a super key." },
      { term: "Determinant", meaning: "Left side of an FD; in BCNF every determinant is a candidate key." },
      { term: "Dependency preservation", meaning: "3NF can always keep it; BCNF sometimes can't." },
    ],
    compare: {
      head: ["", "3NF", "BCNF"],
      rows: [
        ["Rule", "X super key OR A prime", "X super key"],
        ["Strictness", "Allows some redundancy", "Stricter"],
        ["Lossless decomposition", "Always possible", "Always possible"],
        ["Dependency preserving", "Always possible", "Not always"],
      ],
    },
    mistakes: [
      "Saying 3NF and BCNF are the same.",
      "Forgetting the 'A is prime' escape clause in 3NF.",
      "Only checking FDs on the primary key instead of all candidate keys.",
    ],
    remember: "3NF: no non-key → non-key; BCNF: every determinant is a super key. BCNF may lose dependency preservation.",
  },

  "Lossless join & dependency preservation": {
    simple: `When you split (decompose) a table during normalization, two properties matter:

    Lossless join: joining the pieces back gives exactly the original table — no missing rows and no fake extra rows. This is mandatory. Dependency preservation: every original FD can still be checked within a single piece, without joining. This is nice to have.

    Quick lossless test for a split into R1 and R2: the common columns must be a key of R1 or of R2.`,
    analogy: `Tearing a page in two to file it: lossless means you can tape it back and read it exactly as before. If you tore along the wrong line and lost the matching edge, taping gives nonsense combinations — fake rows.`,
    visual: "lossy-join",
    how: {
      steps: [
        "Compute common attributes: R1 ∩ R2.",
        "Lossless if (R1 ∩ R2) → R1 or (R1 ∩ R2) → R2, i.e. the common part is a super key of one side.",
        "Dependency preserving if (F1 ∪ F2)⁺ = F⁺, where Fi are the FDs that can be checked inside Ri.",
        "3NF synthesis: from a canonical cover, one table per FD (+ one with a candidate key if none has it) → always lossless and dependency-preserving.",
        "BCNF decomposition: keep splitting on violating FDs → always lossless, sometimes not dependency-preserving.",
        "Highest normal form of R: check BCNF → 3NF → 2NF → 1NF in that order, against all candidate keys.",
      ],
    },
    concepts: [
      { term: "Decomposition", meaning: "Replacing R with smaller relations whose attributes cover R." },
      { term: "Lossless (non-additive) join", meaning: "R1 ⋈ R2 = R exactly." },
      { term: "Spurious tuples", meaning: "Fake rows created by joining a lossy decomposition." },
      { term: "Dependency preservation", meaning: "Each FD can be enforced in one table." },
      { term: "3NF synthesis", meaning: "Algorithm guaranteeing both properties." },
    ],
    example: `~~~
    R(A, B, C), F = { A → B }
    Split into R1(A, B) and R2(A, C): common = {A}, A → B so A is a key of R1 ⇒ lossless ✓
    Split into R1(A, B) and R2(B, C): common = {B}, B is a key of neither ⇒ lossy ✗
    ~~~`,
    mistakes: [
      "Thinking 'lossy' means rows go missing — it means extra, wrong rows appear.",
      "Accepting a decomposition that isn't lossless to achieve BCNF.",
    ],
    remember: "Lossless if the common columns are a key of one side; 3NF can always keep dependencies, BCNF may not.",
  },

  "4NF, 5NF & denormalization": {
    simple: `4NF deals with multivalued dependencies: when one column has several independent lists of facts (a teacher's subjects and a teacher's languages), storing them in one table forces every combination. Split each independent fact into its own table.

    5NF deals with join dependencies — tables that can only be rebuilt losslessly by joining three or more pieces. It's rare in practice.

    Denormalization goes the other way on purpose: add redundancy back (duplicate columns, summary tables) to make reads faster, accepting harder writes.`,
    analogy: `A teacher teaches DBMS and OS and speaks English and Hindi. Writing every pair in one list gives 4 rows — and adding a language means adding a row per subject. Keep two separate lists: subjects, languages.`,
    visual: "mvd",
    concepts: [
      { term: "Multivalued dependency X ↠ Y", meaning: "For each X there's a set of Y values independent of other columns." },
      { term: "4NF", meaning: "BCNF + no non-trivial MVD unless X is a super key." },
      { term: "Join dependency", meaning: "R equals the join of several projections of itself." },
      { term: "5NF (PJNF)", meaning: "Every join dependency is implied by candidate keys." },
      { term: "Denormalization", meaning: "Deliberately storing redundant data to avoid joins." },
      { term: "Materialized view", meaning: "A stored, refreshable query result — controlled denormalization." },
    ],
    compare: {
      head: ["", "Normalized", "Denormalized"],
      rows: [
        ["Redundancy", "Minimal", "Deliberate"],
        ["Writes", "Simple, safe", "Must update copies"],
        ["Reads", "More joins", "Fewer joins, faster"],
        ["Typical use", "OLTP systems", "Reporting, read-heavy APIs, data warehouses"],
      ],
    },
    mistakes: [
      "Denormalizing before measuring a real performance problem.",
      "Forgetting how the redundant copies will be kept in sync (triggers, jobs, events).",
    ],
    remember: "4NF splits independent multi-valued facts; denormalize only to speed reads, and plan how copies stay in sync.",
  },

  "Transactions, ACID & transaction states": {
    simple: `A transaction is a group of operations treated as one unit of work — like transferring money: debit A, credit B. ACID describes the guarantees:

    - Atomicity: all or nothing.
    - Consistency: the database moves from one valid state to another (rules and constraints hold).
    - Isolation: concurrent transactions don't see each other's half-done work.
    - Durability: once committed, it survives crashes.`,
    analogy: `Paying at a shop by UPI. ₹500 leaves your account and reaches the shop's — never just one of the two (atomicity). Total money in the system is unchanged (consistency). Someone checking your balance mid-payment sees either before or after, not in between (isolation). Once you see 'Payment successful', a server crash can't undo it (durability).`,
    visual: "acid",
    how: {
      visual: "txn-states",
      steps: [
        "**Active:** the transaction is running its statements.",
        "**Partially committed:** the last statement has run; changes may still be only in memory.",
        "**Committed:** the commit log record is safely on disk — durable.",
        "**Failed:** an error or a crash means it can't continue.",
        "**Aborted:** changes are rolled back; the DBMS may restart or kill the transaction.",
      ],
    },
    concepts: [
      { term: "Atomicity → recovery manager", meaning: "Undo log rolls back incomplete transactions." },
      { term: "Consistency → constraints + programmer", meaning: "DBMS enforces declared rules; app logic must be correct too." },
      { term: "Isolation → concurrency control", meaning: "Locks, MVCC, isolation levels." },
      { term: "Durability → recovery manager", meaning: "Write-ahead / redo log flushed at commit." },
      { term: "COMMIT / ROLLBACK", meaning: "Make permanent / undo everything since the start (or a SAVEPOINT)." },
      { term: "Autocommit", meaning: "Each statement is its own transaction unless you START TRANSACTION." },
    ],
    example: `~~~
    START TRANSACTION;
    UPDATE account SET balance = balance - 500 WHERE id = 'A';
    UPDATE account SET balance = balance + 500 WHERE id = 'B';
    COMMIT;      -- or ROLLBACK if anything failed
    ~~~`,
    mistakes: [
      "Saying the DBMS alone guarantees consistency — wrong application logic can still break business rules.",
      "Confusing ACID consistency with CAP consistency.",
      "Forgetting partially committed ≠ committed.",
    ],
    remember: "ACID: all-or-nothing, valid states, no peeking, survives crashes; states go active → partially committed → committed, or failed → aborted.",
  },

  "Schedules: serial, recoverable & cascadeless": {
    simple: `A schedule is the order in which operations of concurrent transactions actually run. A serial schedule runs one transaction fully, then the next — always correct but slow. Concurrent schedules interleave operations for speed, and we need rules so they stay safe.

    Recoverable: a transaction commits only after every transaction it read from has committed. Cascadeless: transactions only read committed data, so one abort never forces others to abort. Strict: nobody even writes over uncommitted data.`,
    analogy: `Group project: Ravi uses Asha's draft numbers in his section and submits. Then Asha withdraws her draft. Now Ravi's submission is based on numbers that never existed — that's not recoverable. Rule: don't submit before the person you copied from does (recoverable), or better, only copy from final versions (cascadeless).`,
    visual: "cascading-rollback",
    concepts: [
      { term: "Serial schedule", meaning: "Transactions run one after another, no interleaving." },
      { term: "Concurrent schedule", meaning: "Operations interleave." },
      { term: "Dirty read", meaning: "Reading a value written by a transaction that hasn't committed." },
      { term: "Recoverable", meaning: "If Tj reads from Ti, Ti commits before Tj commits." },
      { term: "Cascading rollback", meaning: "One abort forcing several dependent transactions to abort." },
      { term: "Cascadeless (ACA)", meaning: "Read only committed data." },
      { term: "Strict", meaning: "No read or write of an item until the last writer of it has committed/aborted." },
    ],
    compare: {
      head: ["Class", "Rule", "Prevents"],
      rows: [
        ["Recoverable", "Commit after those you read from", "Committing on data that's later undone"],
        ["Cascadeless", "Read only committed values", "Cascading rollbacks"],
        ["Strict", "Read/write only committed values", "Above + easy undo with before-images"],
      ],
    },
    mistakes: [
      "Forgetting the hierarchy: strict ⊂ cascadeless ⊂ recoverable.",
      "Calling a schedule recoverable just because it has no dirty reads (that's the stronger cascadeless).",
    ],
    remember: "Recoverable: commit after whoever you read from; cascadeless: read only committed; strict: touch only committed.",
  },

  "Conflict & view serializability": {
    simple: `A concurrent schedule is serializable if its result is the same as some serial (one-after-another) order. That's the definition of 'correct' for concurrency.

    Two operations conflict if they're from different transactions, touch the same item, and at least one is a write (R-W, W-R, W-W). A schedule is conflict serializable if you can swap non-conflicting operations to make it serial. The easy test: draw a precedence graph — no cycle means conflict serializable.`,
    analogy: `Two cooks sharing one kitchen. Swapping who chops onions and who boils rice doesn't matter (no conflict). But if both use the same pan, the order matters. If cook A needs the pan before B, and B needs it before A, there's no valid order — a cycle.`,
    visual: "conflict-schedule",
    how: {
      visual: "precedence-graph",
      steps: [
        "Draw one node per transaction.",
        "For each conflicting pair where Ti's operation comes before Tj's, add an edge Ti → Tj.",
        "Cycle → not conflict serializable. No cycle → conflict serializable.",
        "The equivalent serial order is a topological sort of the graph.",
        "If not conflict serializable, check view serializability: same initial reads, same reads-from, same final writes as some serial schedule.",
      ],
    },
    concepts: [
      { term: "Conflicting operations", meaning: "Different transactions, same item, at least one write." },
      { term: "Conflict equivalent", meaning: "Same conflicting pairs in the same order." },
      { term: "Precedence graph", meaning: "Edges for conflict order; acyclic ⇔ conflict serializable." },
      { term: "View serializable", meaning: "Same reads-from and final writes as a serial schedule." },
      { term: "Blind write", meaning: "Writing an item without reading it first; needed for view-but-not-conflict serializable." },
    ],
    compare: {
      head: ["", "Conflict serializable", "View serializable"],
      rows: [
        ["Test", "Precedence graph (polynomial)", "NP-complete in general"],
        ["Relationship", "Subset of view serializable", "Superset"],
        ["Extra schedules allowed", "—", "Ones with blind writes"],
      ],
    },
    mistakes: [
      "Treating two reads of the same item as a conflict.",
      "Drawing edges in the wrong direction.",
      "Forgetting every conflict-serializable schedule is view serializable, not vice versa.",
    ],
    remember: "Conflict = same item, different txns, at least one write; precedence graph with no cycle ⇒ serializable.",
  },

  "Concurrency problems & isolation levels": {
    simple: `When transactions run at the same time without enough isolation, strange things happen:

    - Dirty read: reading data that's later rolled back.
    - Lost update: two transactions overwrite each other's changes.
    - Non-repeatable read: reading the same row twice gives different values.
    - Phantom read: running the same range query twice returns new rows.

    SQL defines four isolation levels; each higher level prevents more of these, at a cost in performance.`,
    analogy: `Checking movie seats on BookMyShow. Dirty read: you see a seat as booked by someone whose payment then fails. Non-repeatable: the seat shows free, you refresh, now it's booked. Phantom: you count 10 free seats, refresh, now there are 12 because someone cancelled.`,
    visual: "isolation-matrix",
    how: {
      visual: "dirty-read",
      steps: [
        "**Read Uncommitted:** sees uncommitted changes. Almost never used.",
        "**Read Committed:** each statement sees only committed data (Postgres, Oracle default).",
        "**Repeatable Read:** rows you've read won't change for your transaction (MySQL InnoDB default; MVCC snapshot).",
        "**Serializable:** behaves as if transactions ran one by one; may block or abort transactions.",
        "**Write skew:** two transactions read the same rows, then update different rows based on them, together breaking a rule. Only Serializable (or explicit locks) prevents it.",
      ],
    },
    concepts: [
      { term: "Dirty read", meaning: "Read uncommitted data." },
      { term: "Non-repeatable read", meaning: "Same row, different value within one transaction." },
      { term: "Phantom", meaning: "Same query, different set of rows." },
      { term: "Lost update", meaning: "One write silently overwrites another based on stale reads." },
      { term: "Write skew", meaning: "Two doctors each see 'another doctor is on call' and both go off call." },
      { term: "SET TRANSACTION ISOLATION LEVEL", meaning: "Choose the level per session/transaction." },
    ],
    example: `~~~
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
    START TRANSACTION;
    SELECT COUNT(*) FROM doctors WHERE on_call = 1;   -- 2
    UPDATE doctors SET on_call = 0 WHERE id = 7;
    COMMIT;
    ~~~`,
    mistakes: [
      "Assuming the default level prevents all anomalies.",
      "Mixing up non-repeatable reads (row changed) and phantoms (new rows).",
      "Using Serializable everywhere and then wondering why throughput dropped.",
    ],
    remember: "RU allows dirty reads, RC stops them, RR stops non-repeatable reads, Serializable stops phantoms and write skew.",
  },

  "Lock-based protocols & two-phase locking": {
    simple: `Locks stop transactions from stepping on each other. A shared (S) lock is for reading: many transactions can hold it together. An exclusive (X) lock is for writing: only one transaction, and no readers.

    Locks alone aren't enough — releasing them too early can still give wrong results. Two-phase locking (2PL) adds a rule: a transaction first only acquires locks (growing phase), then only releases them (shrinking phase). Once it releases any lock, it can't take a new one. This guarantees conflict serializability.`,
    analogy: `A library reference book: many students can read it at once (shared lock), but if someone wants to correct a page, everyone else must wait until they're done (exclusive lock). 2PL is like collecting all the books you need before you start returning any.`,
    visual: "two-phase-locking",
    how: {
      visual: "lock-matrix",
      steps: [
        "Before reading an item, get an S lock; before writing, get an X lock.",
        "If an incompatible lock is held, wait.",
        "Growing phase: keep acquiring as needed. Lock point = when the last lock is acquired.",
        "Shrinking phase: release locks, never acquire again.",
        "**Strict 2PL:** hold X locks until commit/abort → also cascadeless. **Rigorous 2PL:** hold all locks until commit.",
        "Lock upgrade (S → X) only in the growing phase; downgrade (X → S) only in the shrinking phase.",
      ],
    },
    concepts: [
      { term: "Shared lock (S)", meaning: "Read lock; compatible with other S locks." },
      { term: "Exclusive lock (X)", meaning: "Write lock; incompatible with everything." },
      { term: "Basic 2PL", meaning: "Grow then shrink; ensures conflict serializability, may cascade aborts." },
      { term: "Strict 2PL", meaning: "X locks held till commit; prevents cascading rollbacks. Most common." },
      { term: "Rigorous 2PL", meaning: "All locks held till commit; transactions serialise in commit order." },
      { term: "Lock point", meaning: "Moment a transaction holds all its locks; defines its serial order." },
    ],
    mistakes: [
      "Thinking 2PL prevents deadlocks — it doesn't.",
      "Saying basic 2PL prevents cascading rollbacks — only strict/rigorous do.",
      "Allowing an upgrade in the shrinking phase.",
    ],
    remember: "S = shared read, X = exclusive write; 2PL = acquire all, then release; strict 2PL keeps X locks to commit.",
  },

  Deadlocks: {
    simple: `A deadlock happens when transactions wait for each other in a circle: T1 holds row A and wants B; T2 holds B and wants A. Neither can ever continue.

    Databases handle this by detecting the cycle in a wait-for graph and killing one transaction (the victim), or by preventing cycles in the first place using timestamps (wait-die, wound-wait), or simply with lock timeouts.`,
    analogy: `Two cars meet on a narrow one-lane bridge from opposite ends. Each waits for the other to reverse. Forever. Someone has to back out — that's the victim being rolled back.`,
    visual: "deadlock",
    how: {
      visual: "wait-die",
      steps: [
        "**Coffman conditions** — all four must hold: mutual exclusion, hold and wait, no preemption, circular wait. Break any one to prevent deadlock.",
        "**Detection:** periodically build the wait-for graph (Ti → Tj if Ti waits for Tj). A cycle = deadlock.",
        "**Recovery:** abort a victim (least work done, fewest locks, youngest), roll it back, let others continue.",
        "**Prevention with timestamps:** older transactions have priority — wait-die (young requester dies) or wound-wait (old requester wounds the young holder).",
        "**Timeouts:** give up after waiting N seconds (`innodb_lock_wait_timeout`).",
        "**In application code:** always lock rows in the same order (e.g. smaller account id first).",
      ],
    },
    concepts: [
      { term: "Wait-for graph", meaning: "Nodes = transactions, edge = waiting for a lock; cycle ⇒ deadlock." },
      { term: "Victim", meaning: "The transaction chosen to be rolled back." },
      { term: "Wait-die", meaning: "Older waits for younger; younger requesting from older dies. Non-preemptive." },
      { term: "Wound-wait", meaning: "Older forces younger to abort; younger waits for older. Preemptive." },
      { term: "Starvation", meaning: "The same transaction is always chosen as victim; restart with its original timestamp to avoid it." },
      { term: "Lock ordering", meaning: "Acquire locks in a fixed global order — no cycles possible." },
    ],
    mistakes: [
      "Confusing wait-die and wound-wait.",
      "Thinking 2PL avoids deadlocks — it can cause them.",
      "Giving a restarted transaction a new timestamp, so it starves.",
    ],
    remember: "Deadlock = circular wait; detect with a wait-for graph and kill a victim, or prevent with lock ordering / wait-die / wound-wait.",
  },

  "Timestamp ordering & optimistic concurrency": {
    simple: `Instead of locks, timestamp ordering gives each transaction a timestamp when it starts and makes sure conflicting operations happen in timestamp order — older transactions 'go first'. If a transaction tries to do something that would break that order, it's rolled back and restarted with a new timestamp. No locks, so no deadlocks.

    Optimistic concurrency control assumes conflicts are rare: let transactions work freely on private copies, then validate at commit; if someone changed what you read, restart.`,
    analogy: `A token system at a bank: token 41 must be served before token 42. If 42's work would need to happen 'before' 41 already did something, 42 is sent back to take a new token.`,
    visual: "ts-ordering",
    how: {
      visual: "occ",
      steps: [
        "Each item X keeps R-TS(X) and W-TS(X): the largest timestamps that read and wrote it.",
        "**T reads X:** if TS(T) < W-TS(X), a younger transaction already overwrote it → abort T. Else read and set R-TS(X) = max(R-TS(X), TS(T)).",
        "**T writes X:** if TS(T) < R-TS(X) → abort (a younger one already read the old value). If TS(T) < W-TS(X) → abort, or with the **Thomas write rule**, just skip the outdated write.",
        "Otherwise write and set W-TS(X) = TS(T).",
        "**Optimistic (validation) protocol:** read phase on local copies → validation at commit → write phase if valid.",
      ],
    },
    concepts: [
      { term: "Timestamp TS(T)", meaning: "Unique, increasing number given at start; defines serial order." },
      { term: "R-TS / W-TS", meaning: "Latest read / write timestamp stored per data item." },
      { term: "Thomas write rule", meaning: "Ignore an obsolete write instead of aborting; allows some view-serializable schedules." },
      { term: "Cascading restarts", meaning: "Basic TO can cause them; strict TO avoids by delaying reads of uncommitted writes." },
      { term: "Optimistic concurrency", meaning: "Validate at the end; great for low-conflict workloads." },
      { term: "Version column", meaning: "Practical optimistic locking: UPDATE … WHERE version = ?." },
    ],
    compare: {
      head: ["", "2PL (pessimistic)", "Timestamp ordering", "Optimistic"],
      rows: [
        ["Mechanism", "Locks", "Timestamps per item", "Validation at commit"],
        ["Deadlocks", "Possible", "None", "None"],
        ["On conflict", "Wait", "Abort & restart", "Abort & restart"],
        ["Best when", "Conflicts common", "Short transactions", "Conflicts rare"],
      ],
    },
    mistakes: [
      "Restarting the aborted transaction with its old timestamp in basic TO (it would fail again).",
      "Using optimistic concurrency for hot rows with many conflicts — constant retries.",
    ],
    remember: "Timestamp ordering = older goes first, violate it and you restart; optimistic = work freely, validate at commit.",
  },

  "MVCC & multiple-granularity locking": {
    simple: `MVCC (Multi-Version Concurrency Control) keeps several versions of each row. A write creates a new version instead of overwriting; each transaction reads the version that was committed when its snapshot started. So readers never block writers and writers never block readers. MySQL InnoDB, PostgreSQL and Oracle all use it.

    Multiple-granularity locking lets the DBMS lock at different sizes — whole database, table, page or row — using intention locks on the parents, so a table-level lock can quickly tell whether any row below is locked.`,
    analogy: `MVCC is like Google Docs version history: while someone types new edits, you can still read the version as of 10 AM without waiting for them.

    Granularity locks are like a hotel: an 'occupied' sign on a floor (intention lock) tells the cleaning manager not to lock the whole floor, without checking every room.`,
    visual: "mvcc",
    how: {
      visual: "granularity",
      steps: [
        "Each row version records which transaction created it (and, in Postgres, which deleted it).",
        "A transaction's snapshot lists which transactions were committed when it started.",
        "A read walks the version chain to the newest version visible to that snapshot (InnoDB rebuilds old versions from the undo log).",
        "Writes still lock the row, so two writers to the same row still wait for each other.",
        "Old versions are cleaned once no snapshot needs them (Postgres VACUUM, InnoDB purge).",
        "For granularity locks, take IS/IX on ancestors before S/X on a node: e.g. IX on the table, then X on one row.",
      ],
    },
    concepts: [
      { term: "Snapshot isolation", meaning: "Each transaction sees a consistent snapshot as of its start." },
      { term: "Version chain", meaning: "Linked old versions of a row." },
      { term: "IS / IX", meaning: "Intention shared / exclusive: a descendant will be locked S / X." },
      { term: "SIX", meaning: "Shared on this node + intention exclusive below (read whole table, update some rows)." },
      { term: "Lock escalation", meaning: "Replace thousands of row locks with one table lock to save memory." },
      { term: "Garbage collection", meaning: "VACUUM / purge removes versions no one can see." },
    ],
    compare: {
      head: ["Held → / Requested ↓", "IS", "IX", "S", "SIX", "X"],
      rows: [
        ["IS", "✓", "✓", "✓", "✓", "✗"],
        ["IX", "✓", "✓", "✗", "✗", "✗"],
        ["S", "✓", "✗", "✓", "✗", "✗"],
        ["SIX", "✓", "✗", "✗", "✗", "✗"],
        ["X", "✗", "✗", "✗", "✗", "✗"],
      ],
    },
    mistakes: [
      "Saying MVCC means no locks at all — writers still lock rows.",
      "Long-running transactions that keep old versions alive and bloat the database.",
      "Thinking snapshot isolation = serializable (it allows write skew).",
    ],
    remember: "MVCC: writes create versions, reads use a snapshot, so reads and writes don't block; intention locks make coarse and fine locks work together.",
  },

  "Failures & log-based recovery": {
    simple: `Things fail: a transaction hits an error, the server crashes (memory lost, disk fine), or a disk dies. Recovery must make sure committed work survives (durability) and uncommitted work disappears (atomicity).

    The tool is a log: before changing any data on disk, the DBMS writes a log record describing the change (transaction, item, old value, new value). This rule is called Write-Ahead Logging (WAL). After a crash, the log tells it what to redo and what to undo.`,
    analogy: `An accountant who, before changing any figure in the ledger, first writes in a notebook: "changing Asha's balance from 1000 to 500 for transfer #7". If the power goes out mid-change, the notebook says exactly what to finish or reverse.`,
    visual: "wal",
    how: {
      visual: "undo-redo",
      steps: [
        "Log record: `<T1, start>`, `<T1, A, old=1000, new=500>`, `<T1, commit>`.",
        "**WAL rule 1:** the log record for a change must be on disk before the changed data page is written.",
        "**WAL rule 2:** all of a transaction's log records must be on disk before it's declared committed.",
        "After a crash, **redo** every transaction with a commit record (reapply new values).",
        "**Undo** every transaction with a start but no commit/abort (restore old values, newest first).",
      ],
    },
    concepts: [
      { term: "Transaction failure", meaning: "Logical error or deadlock victim; roll back that transaction." },
      { term: "System crash", meaning: "Power / OS failure; RAM lost, disk intact. Recover from the log." },
      { term: "Media failure", meaning: "Disk lost; restore from backup + archived logs." },
      { term: "Undo", meaning: "Restore old values of uncommitted transactions." },
      { term: "Redo", meaning: "Reapply new values of committed transactions." },
      { term: "Deferred vs immediate update", meaning: "Write data only after commit (redo only) vs any time (undo + redo)." },
    ],
    mistakes: [
      "Writing data pages before their log records (breaks WAL).",
      "Saying redo is for uncommitted transactions — redo is for committed, undo for uncommitted.",
      "Thinking a commit flushes all data pages — only the log must be flushed.",
    ],
    remember: "Log first, data later (WAL); after a crash, redo the committed and undo the uncommitted.",
  },

  "Checkpoints, shadow paging & ARIES": {
    simple: `Without help, recovery would have to read the entire log from the beginning of time. A checkpoint periodically records 'everything up to here is safely on disk', so recovery only needs to start from the last checkpoint.

    Shadow paging is a different approach: never modify pages in place — write changed pages to new locations and switch a pointer at commit. ARIES is the algorithm real databases use: analyse the log, redo everything ('repeat history'), then undo the losers.`,
    analogy: `Saving a video game at checkpoints. If you die, you restart from the last checkpoint, not from level 1. Shadow paging is like editing a copy of a document and only replacing the original when you click Save.`,
    visual: "recovery-timeline",
    how: {
      visual: "aries",
      steps: [
        "**Checkpoint:** write a checkpoint record with the list of active transactions (and in ARIES, dirty pages); fuzzy checkpoints don't stop the system.",
        "**Analysis pass:** from the last checkpoint, find which transactions were active at the crash (losers) and which pages may be dirty.",
        "**Redo pass:** from the oldest relevant log record, reapply every change (committed or not) whose page isn't already up to date (compare LSNs).",
        "**Undo pass:** roll back losers, newest first, writing compensation log records (CLRs) so a crash during recovery doesn't redo the undo work.",
      ],
    },
    concepts: [
      { term: "Checkpoint", meaning: "Point that bounds how far back recovery must read." },
      { term: "Shadow paging", meaning: "Copy-on-write pages with a page table swap at commit; no undo/redo log, but fragmentation." },
      { term: "LSN", meaning: "Log sequence number; each page stores the LSN of its latest change." },
      { term: "CLR", meaning: "Compensation log record written during undo." },
      { term: "Steal", meaning: "Buffer may write uncommitted pages to disk → needs UNDO." },
      { term: "No-force", meaning: "Committed pages needn't be flushed at commit → needs REDO." },
    ],
    compare: {
      head: ["Buffer policy", "Needs UNDO", "Needs REDO", "Note"],
      rows: [
        ["Steal + no-force", "Yes", "Yes", "Fastest; used by ARIES and real DBMSs"],
        ["No-steal + force", "No", "No", "Simple but slow"],
        ["No-steal + no-force", "No", "Yes", ""],
        ["Steal + force", "Yes", "No", ""],
      ],
    },
    mistakes: [
      "Thinking ARIES redoes only committed transactions — it redoes everything, then undoes losers.",
      "Mixing up steal (about uncommitted writes) and force (about committed writes).",
    ],
    remember: "Checkpoints limit how much log to read; ARIES = analysis, redo all, undo losers; steal ⇒ undo, no-force ⇒ redo.",
  },

  "Storage & file organization": {
    simple: `On disk, a table is a file made of fixed-size blocks called pages (InnoDB: 16 KB). Each page holds many rows (records). The database always reads and writes whole pages, because disk access is the slow part — so a good design minimises how many pages a query touches.

    File organisation decides how records are placed: heap (anywhere there's space), sequential (sorted by a key) or hashed (position from a hash of the key). A buffer manager keeps recently used pages in RAM.`,
    analogy: `A library where books (rows) sit on shelves (pages) in rooms (files). Fetching one book means carrying the whole shelf to your desk — so you'd like related books on the same shelf. The desk holds a few shelves at a time (buffer pool); when it's full, you send back the one you haven't used for longest (LRU).`,
    visual: "storage-hierarchy",
    how: {
      visual: "page-layout",
      steps: [
        "Query asks for a row → buffer manager checks whether its page is in the buffer pool (RAM).",
        "Hit → use it. Miss → read the page from disk into a free frame.",
        "No free frame → evict a page by policy (LRU, clock); if it's dirty, write it to disk first.",
        "Pinned pages (in use) can't be evicted.",
        "Inside a slotted page, a slot array points to each record, so variable-length records can move without changing their id.",
      ],
    },
    concepts: [
      { term: "Block / page", meaning: "Unit of disk I/O and buffering." },
      { term: "Heap file", meaning: "Unordered; fast inserts, full scans for search." },
      { term: "Sequential file", meaning: "Sorted on a key; fast range scans, slow inserts." },
      { term: "Hashed file", meaning: "Location = hash(key); fast equality search." },
      { term: "Fixed vs variable-length records", meaning: "Simple offsets vs slotted pages with offsets." },
      { term: "Buffer manager", meaning: "Caches pages in RAM; replacement policy, pinning, dirty pages." },
      { term: "Blocking factor", meaning: "Records per block = ⌊block size ÷ record size⌋." },
    ],
    mistakes: [
      "Counting rows instead of page reads when estimating query cost.",
      "Assuming MRU is always worse than LRU — for repeated sequential scans MRU can win.",
    ],
    remember: "Data lives in pages; the DBMS moves whole pages between disk and a RAM buffer pool, so fewer page reads = faster queries.",
  },

  "Index types": {
    simple: `An index is a small sorted structure that helps find rows without scanning the whole table.

    A primary/clustering index is built on the column the file is physically sorted by; there can be only one. A secondary index is on any other column, with its own sorted list of pointers. Dense indexes have an entry for every key; sparse indexes have one per block (and need the file to be sorted). When an index gets big, you index the index — a multilevel index, which is essentially a B+ tree.`,
    analogy: `A dictionary's thumb tabs (A, B, C…) are a sparse index — one per section, and the pages are sorted. A textbook's back index listing every term with page numbers is a dense secondary index — the book isn't sorted by those terms.`,
    visual: "dense-sparse",
    how: {
      visual: "clustered-index",
      steps: [
        "Sparse index search: find the largest index key ≤ the search key, jump to that block, scan within it.",
        "Dense index search: find the exact key entry, follow its pointer.",
        "Secondary indexes are always dense (the file isn't sorted on that column).",
        "If the index itself spans many blocks, build an outer sparse index on it → multilevel → B+ tree.",
        "In InnoDB the table is the clustered index on the PK; secondary index leaves store the PK, so a lookup by a secondary column does two tree searches.",
      ],
    },
    concepts: [
      { term: "Primary index", meaning: "On the ordered key field of a sorted file; sparse." },
      { term: "Clustering index", meaning: "On an ordered non-key field (many rows share a value)." },
      { term: "Secondary index", meaning: "On a non-ordering field; dense; many per table." },
      { term: "Dense / sparse", meaning: "Entry per record / entry per block." },
      { term: "Clustered vs non-clustered", meaning: "Rows stored in index order / index points to rows elsewhere." },
      { term: "Multilevel index", meaning: "Index on an index to reduce search to a few block reads." },
    ],
    compare: {
      head: ["", "Clustered", "Non-clustered"],
      rows: [
        ["Rows stored", "In index order", "Separately"],
        ["Per table", "One", "Many"],
        ["Range scans", "Very fast", "Slower (random lookups)"],
        ["Leaf contains", "Row data", "Key + pointer / PK"],
      ],
    },
    mistakes: [
      "Saying a table can have multiple clustered indexes.",
      "Saying a secondary index can be sparse.",
      "Forgetting each index slows inserts and updates.",
    ],
    remember: "Clustered = rows in index order (one per table); secondary = separate dense index; sparse needs sorted data.",
  },

  "B-trees & B+ trees": {
    simple: `A B-tree is a balanced, wide, shallow search tree designed for disks. Each node is one page holding many keys, so even crores of rows need only 3–4 levels — 3–4 page reads per lookup. It stays balanced automatically: nodes split when full and merge when too empty.

    A B+ tree, used by almost every database, stores all data pointers only in the leaves and links the leaves together. Internal nodes just guide the search, so more keys fit per node (shorter tree), and range queries walk the leaf chain.`,
    analogy: `A library catalogue: the first cabinet says "A–F: cabinet 2, G–M: cabinet 3…"; cabinet 3 says "G–H: drawer 1…"; the drawer has the actual cards. Three lookups find any book among millions. B+ tree drawers are also chained, so 'all books from G to K' means opening drawers one after another.`,
    visual: "bplus-tree",
    how: {
      visual: "btree-split",
      steps: [
        "**Search:** from the root, follow the child whose range contains the key, down to a leaf.",
        "**Insert:** add to the right leaf. If it overflows, split into two and copy the middle key up to the parent (in a B+ tree the key stays in the leaf too).",
        "If the parent overflows, split it and push its middle key up; splitting the root adds a level.",
        "**Delete:** remove from the leaf; if it falls below half full, borrow from a sibling or merge with it (and remove a separator from the parent).",
        "**Height:** with order p (max children), height ≈ ⌈log_p(N)⌉. Max keys at height h for a B-tree of order p = p^h − 1.",
      ],
    },
    concepts: [
      { term: "Order p", meaning: "Maximum children per node (max keys = p − 1)." },
      { term: "Occupancy", meaning: "Every node except the root is at least half full (⌈p/2⌉ children)." },
      { term: "Balanced", meaning: "All leaves at the same depth." },
      { term: "Fan-out", meaning: "Children per node; high fan-out → very shallow tree." },
      { term: "Leaf links", meaning: "B+ tree leaves form a linked list for range scans." },
      { term: "Order from block size", meaning: "p × pointer + (p − 1) × key ≤ block size → solve for p." },
    ],
    compare: {
      head: ["", "B-tree", "B+ tree"],
      rows: [
        ["Data pointers", "In all nodes", "Only in leaves"],
        ["Keys repeated", "No", "Yes (separators copied up)"],
        ["Range queries", "Tree traversal", "Walk linked leaves"],
        ["Fan-out of internal nodes", "Lower", "Higher → shorter tree"],
        ["Used in", "Some file systems", "MySQL, Postgres, Oracle indexes"],
      ],
    },
    example: `~~~
    Block 4096 B, key 8 B, pointer 8 B (B+ tree internal node):
      p × 8 + (p − 1) × 8 ≤ 4096  →  p = 256
    Three levels: 256 × 256 × 255 ≈ 1.67 crore keys in 3 page reads
    ~~~`,
    mistakes: [
      "Calling a B-tree a binary tree.",
      "Saying B+ tree internal nodes store row data.",
      "Forgetting the root is allowed to be less than half full.",
    ],
    remember: "B+ tree: wide balanced tree, data only in linked leaves, 3–4 page reads for crores of rows, great for ranges.",
  },

  Hashing: {
    simple: `Hashing finds a record's location by computing hash(key) — one step, no tree to walk. It's perfect for equality lookups (WHERE id = 42) but useless for ranges, because hashing scatters neighbouring keys.

    Static hashing has a fixed number of buckets; as data grows, overflow chains get long and slow. Dynamic schemes grow gracefully: extendible hashing keeps a directory that doubles when needed; linear hashing splits buckets one at a time in order.`,
    analogy: `Lockers numbered 0–99 at a gym: your locker is your phone number's last two digits. Instant to find. But "all members with phone numbers between X and Y" means checking every locker. And if the gym grows to 10,000 members, lockers overflow — you need a way to add lockers without renumbering everyone.`,
    visual: "extendible-hash",
    how: {
      steps: [
        "**Static:** bucket = h(key) mod M. Full bucket → overflow chain.",
        "**Extendible:** directory of 2^d pointers using the last d bits of the hash (global depth d). Each bucket has a local depth.",
        "Bucket overflows and local depth < global depth → split the bucket, redistribute by one more bit, update the pointers that shared it.",
        "Local depth = global depth → double the directory first (d + 1), then split.",
        "**Linear hashing:** no directory; split buckets in round-robin order whenever load passes a threshold; use h mod 2M for already-split buckets.",
      ],
    },
    concepts: [
      { term: "Hash function", meaning: "Maps a key to a bucket; should spread keys evenly." },
      { term: "Bucket", meaning: "A block (or blocks) holding records with the same hash." },
      { term: "Overflow chain", meaning: "Extra blocks linked when a bucket is full." },
      { term: "Global depth", meaning: "Bits used by the extendible hashing directory." },
      { term: "Local depth", meaning: "Bits that records in one bucket share." },
      { term: "Linear hashing", meaning: "Grows one bucket at a time, no directory." },
    ],
    compare: {
      head: ["", "Hash index", "B+ tree index"],
      rows: [
        ["Equality lookup", "O(1), ~1 I/O", "O(log n), 3–4 I/O"],
        ["Range / ORDER BY", "Not supported", "Excellent"],
        ["Prefix (LIKE 'ab%')", "No", "Yes"],
        ["Used by", "MySQL MEMORY engine, Postgres hash, hash joins", "Default index almost everywhere"],
      ],
    },
    mistakes: [
      "Suggesting a hash index for range queries.",
      "Thinking the directory doubles on every split in extendible hashing — only when local depth = global depth.",
    ],
    remember: "Hashing = one-step equality lookups, no ranges; extendible doubles a directory, linear splits buckets in turn.",
  },

  "Query processing & optimization": {
    simple: `When you send a SQL query, the DBMS parses it, turns it into relational algebra, then the optimizer picks the cheapest of many equivalent ways to run it (which index, which join order, which join algorithm), and the executor runs that plan.

    The same query can be 1000× faster or slower depending on the plan. The optimizer uses equivalence rules to rewrite queries (e.g. filter before joining) and statistics about the data to estimate costs.`,
    analogy: `Google Maps: you say where to go (SQL says what you want). It considers many routes (plans), uses traffic data (statistics) to estimate times (cost), and picks the fastest one. You never tell it which roads to take.`,
    visual: "query-pipeline",
    how: {
      visual: "push-selection",
      steps: [
        "**Parse & validate:** syntax, table and column names, permissions.",
        "**Translate** into a relational algebra tree.",
        "**Heuristic rewrites:** push selections and projections down, combine σ and × into joins, perform the most selective joins first.",
        "**Cost-based choice:** for each candidate plan, estimate rows (selectivity × table size) and I/O using statistics; pick the cheapest.",
        "**Execute** the physical plan (index scan, hash join…); see it with `EXPLAIN`.",
      ],
    },
    concepts: [
      { term: "Logical vs physical plan", meaning: "What operations (σ, ⋈) vs how (index scan, hash join)." },
      { term: "Equivalence rules", meaning: "σ over a join can move to the input that has its columns; joins are commutative/associative." },
      { term: "Selectivity", meaning: "Fraction of rows a condition keeps; = 1/distinct values for equality, roughly." },
      { term: "Statistics", meaning: "Row counts, distinct values, histograms — kept with ANALYZE." },
      { term: "Heuristic optimization", meaning: "Rule-based rewrites that are almost always good." },
      { term: "Cost-based optimization", meaning: "Estimate cost of alternatives and pick the lowest." },
    ],
    example: `~~~
    EXPLAIN SELECT c.name, o.total
    FROM customers c JOIN orders o ON o.customer_id = c.id
    WHERE c.city = 'Pune';
    -- good plan: index on customers(city) → ~200 customers → index lookups into orders(customer_id)
    ~~~`,
    mistakes: [
      "Stale statistics leading the optimizer to a terrible plan.",
      "Assuming the order of tables in your SQL is the order they're joined.",
      "Not using EXPLAIN when a query is slow.",
    ],
    remember: "Parse → algebra → optimizer (rewrites + cost with statistics) → physical plan → execute; push filters down early.",
  },

  "Join algorithms": {
    simple: `A join pairs rows from two tables that match. The DBMS has several ways to do it, and choosing well matters enormously:

    - Nested loop: for each row of R, scan all of S. Simple, very slow on big tables.
    - Block nested loop: same, but per block of R — far fewer disk reads.
    - Index nested loop: for each row of R, use an index on S to find matches.
    - Sort-merge: sort both on the join key, then walk them together like a zipper.
    - Hash join: build a hash table on the smaller table, probe it with the bigger one.`,
    analogy: `Matching students to their exam results. Nested loop: for each student, read the entire results list. Index: look the roll number up in a sorted results index. Sort-merge: sort both lists by roll number and go down them side by side. Hash: put results into 100 boxes by last two digits of roll number, then each student checks only their box.`,
    visual: "join-costs",
    how: {
      steps: [
        "Notation: bR, bS = blocks; nR = rows of R (the outer table).",
        "**Nested loop:** nR × bS + bR block transfers.",
        "**Block nested loop:** bR × bS + bR (put the smaller table outside).",
        "**Index nested loop:** bR + nR × c, where c = cost of one index lookup.",
        "**Sort-merge:** bR + bS after sorting (sorting costs about 2b × passes each).",
        "**Hash join:** about 3(bR + bS) — partition both, then build and probe each partition. Equi-joins only.",
      ],
    },
    concepts: [
      { term: "Outer / inner relation", meaning: "Table in the outer loop / scanned for each outer row or block." },
      { term: "Build / probe", meaning: "Hash join phases: hash the smaller input, look up the larger one." },
      { term: "Equi-join", meaning: "Join on equality; required for hash and merge joins." },
      { term: "Block transfer", meaning: "Unit of I/O cost used in textbook formulas." },
      { term: "Grace hash join", meaning: "Partitions both inputs to disk when the build side doesn't fit in memory." },
    ],
    compare: {
      head: ["Algorithm", "Needs", "Best when"],
      rows: [
        ["Nested loop", "Nothing", "Tiny tables"],
        ["Block nested loop", "Memory buffers", "No index, one small table"],
        ["Index nested loop", "Index on inner join column", "Few outer rows (selective filter)"],
        ["Sort-merge", "Sorted or sortable inputs", "Inputs already sorted; range-like joins"],
        ["Hash join", "Equality condition, memory", "Large unsorted inputs"],
      ],
    },
    mistakes: [
      "Putting the bigger table as the outer in block nested loop.",
      "Suggesting hash join for a non-equality (<, >) condition.",
      "Forgetting to add the outer table's own scan cost.",
    ],
    remember: "Nested loop is the fallback, index NL for selective lookups, sort-merge for sorted inputs, hash join for big equi-joins.",
  },

  "OLTP vs OLAP & data warehousing": {
    simple: `OLTP (online transaction processing) systems run the business: many small, fast reads and writes — place an order, update a balance. OLAP (online analytical processing) systems answer big questions over history: "sales by region by month for 3 years" — few, huge, read-only queries.

    Because the workloads are so different, analytics runs in a separate data warehouse, loaded from OLTP systems by ETL/ELT pipelines and usually stored in columns rather than rows, organised as a star schema.`,
    analogy: `A supermarket's billing counters are OLTP: thousands of quick transactions a day. The head office analyst asking "which products sell best in monsoon in South India?" is OLAP — they work on a copy of years of data, not on the live billing machines.`,
    visual: "star-schema",
    how: {
      visual: "row-vs-column",
      steps: [
        "**Extract** data from OLTP databases, apps and logs.",
        "**Transform**: clean, deduplicate, conform ids and dates (ETL does this before loading; ELT loads raw data and transforms inside the warehouse).",
        "**Load** into the warehouse as fact tables (events with numbers) and dimension tables (descriptions).",
        "Analysts query with GROUP BY, rollups and dashboards; columnar storage reads only the needed columns and compresses well.",
      ],
    },
    concepts: [
      { term: "Fact table", meaning: "Events with measures (qty, amount) + foreign keys to dimensions. Very long." },
      { term: "Dimension table", meaning: "Descriptive attributes to filter/group by (date, product, store)." },
      { term: "Star schema", meaning: "One fact table with denormalized dimensions around it." },
      { term: "Snowflake schema", meaning: "Dimensions normalized into sub-tables (product → category)." },
      { term: "Column store", meaning: "Stores each column together; fast scans and compression (BigQuery, Redshift)." },
      { term: "ETL vs ELT", meaning: "Transform before load vs load raw then transform in the warehouse." },
    ],
    compare: {
      head: ["", "OLTP", "OLAP"],
      rows: [
        ["Purpose", "Run the business", "Analyse the business"],
        ["Queries", "Short, many, read/write", "Long, few, read-mostly"],
        ["Data", "Current, normalized", "Historical, denormalized"],
        ["Storage", "Row store", "Column store"],
        ["Examples", "MySQL, Postgres", "Snowflake, BigQuery, Redshift"],
      ],
    },
    mistakes: [
      "Running heavy reports on the production OLTP database.",
      "Mixing up star (denormalized dimensions) and snowflake (normalized dimensions).",
    ],
    remember: "OLTP = many small transactions on rows; OLAP = big analytical scans on columns, in a star-schema warehouse fed by ETL/ELT.",
  },

  "Distributed databases": {
    simple: `A distributed database stores data on several machines (often in different places) but lets users query it as if it were one database. Data is split (fragmentation) and/or copied (replication) across sites.

    Horizontal fragmentation splits rows (Mumbai customers on the Mumbai server); vertical fragmentation splits columns (profile vs billing). Transactions across sites need a distributed commit protocol like two-phase commit, and the CAP theorem limits what you can guarantee during network failures.`,
    analogy: `A bank with branches in many cities. Each branch keeps its own customers' accounts (horizontal fragmentation), head office has copies of everything for backup (replication), and a customer can check their balance from any ATM without knowing which branch holds the record (transparency).`,
    visual: "fragmentation",
    how: {
      visual: "two-phase-commit",
      steps: [
        "Decide fragmentation: by rows (region, tenant) or by columns (hot vs cold data).",
        "Decide replication: full, partial or none, and sync vs async.",
        "Queries are rewritten into per-fragment queries and results combined (union for horizontal, join on key for vertical).",
        "Multi-site updates use **2PC**: coordinator sends PREPARE, all vote YES/NO, then COMMIT or ABORT.",
        "During a network partition, choose consistency (block) or availability (accept, reconcile later) — CAP.",
      ],
    },
    concepts: [
      { term: "Horizontal fragmentation", meaning: "Subsets of rows via selection σ; rebuilt with union." },
      { term: "Vertical fragmentation", meaning: "Subsets of columns via projection π, each with the key; rebuilt with a join." },
      { term: "Transparency", meaning: "Users don't see fragmentation, replication or location." },
      { term: "Homogeneous vs heterogeneous", meaning: "Same DBMS everywhere vs different ones." },
      { term: "Two-phase commit", meaning: "Prepare/vote, then commit/abort; blocks if the coordinator fails." },
      { term: "CAP", meaning: "Under a partition, choose consistency or availability." },
    ],
    mistakes: [
      "Forgetting to include the primary key in every vertical fragment.",
      "Assuming 2PC never blocks.",
      "Calling replication and fragmentation the same thing.",
    ],
    remember: "Fragment rows or columns across sites, replicate for availability, use 2PC for multi-site commits, and CAP limits you during partitions.",
  },

  "NoSQL & BASE": {
    simple: `NoSQL databases drop some relational features — fixed schemas, joins, multi-row ACID transactions — to scale out easily across many machines and fit specific access patterns. There are four main families: key-value, document, wide-column and graph.

    Many follow BASE instead of ACID: Basically Available, Soft state, Eventually consistent. They stay up during failures and let copies catch up later.`,
    analogy: `ACID is a bank: every rupee must add up at every moment. BASE is the 'likes' counter on a viral reel: it might show 10,412 on your phone and 10,415 on your friend's for a few seconds, and nobody minds as long as it settles.`,
    visual: "nosql-types",
    concepts: [
      { term: "Key-value", meaning: "get/put by key; fastest, simplest (Redis, DynamoDB)." },
      { term: "Document", meaning: "JSON documents, queryable fields, flexible schema (MongoDB)." },
      { term: "Wide-column", meaning: "Rows by partition key with many dynamic columns; huge write throughput (Cassandra)." },
      { term: "Graph", meaning: "Nodes + edges; fast multi-hop traversals (Neo4j)." },
      { term: "BASE", meaning: "Basically available, soft state, eventually consistent." },
      { term: "Schema-on-read", meaning: "Structure interpreted when reading, not enforced when writing." },
    ],
    compare: {
      head: ["", "ACID (SQL)", "BASE (many NoSQL)"],
      rows: [
        ["Consistency", "Strong, immediate", "Eventual"],
        ["Availability under failure", "May reject requests", "Stays available"],
        ["Schema", "Fixed", "Flexible"],
        ["Scaling", "Mostly vertical / complex sharding", "Horizontal by design"],
        ["Best for", "Money, orders, inventory", "Feeds, sessions, logs, catalogues"],
      ],
    },
    mistakes: [
      "Saying NoSQL databases never support transactions — MongoDB and DynamoDB do, with limits.",
      "Choosing NoSQL for data that is highly relational and needs joins.",
      "Thinking 'schema-less' means no data modelling — NoSQL modelling starts from queries.",
    ],
    remember: "NoSQL trades joins and strict consistency for scale and flexibility; pick the family that matches the access pattern.",
  },

  "DBMS rapid-fire round-up": {
    simple: `Interviews often end with quick 'difference between' questions. The trick is to answer each in one line with the key difference, then one example. This page collects the most common pairs.`,
    analogy: `Like a formula sheet before an exam: no long explanations, just the crisp distinctions you need to say confidently in 20 seconds.`,
    visual: "sql-order",
    concepts: [
      { term: "DELETE", meaning: "DML; removes chosen rows with WHERE; logged per row; can roll back; fires triggers." },
      { term: "TRUNCATE", meaning: "DDL; removes all rows fast, resets AUTO_INCREMENT; no WHERE; usually can't roll back in MySQL." },
      { term: "DROP", meaning: "DDL; removes the table itself (structure + data + indexes)." },
      { term: "WHERE vs HAVING", meaning: "WHERE filters rows before grouping; HAVING filters groups after GROUP BY (can use aggregates)." },
      { term: "UNION vs UNION ALL", meaning: "UNION removes duplicates (extra sort/hash); UNION ALL keeps them and is faster." },
      { term: "CHAR vs VARCHAR", meaning: "Fixed length, padded vs variable length + length prefix." },
      { term: "View vs materialized view", meaning: "Stored query run every time vs stored result refreshed periodically." },
      { term: "Trigger vs stored procedure", meaning: "Runs automatically on INSERT/UPDATE/DELETE vs called explicitly." },
    ],
    compare: {
      head: ["", "DELETE", "TRUNCATE", "DROP"],
      rows: [
        ["Type", "DML", "DDL", "DDL"],
        ["WHERE clause", "Yes", "No", "No"],
        ["Rollback (InnoDB)", "Yes", "No (implicit commit)", "No"],
        ["Triggers fire", "Yes", "No", "No"],
        ["Structure kept", "Yes", "Yes", "No"],
        ["Speed on big tables", "Slow", "Fast", "Fast"],
      ],
    },
    example: `~~~
    SELECT dept, COUNT(*) AS n
    FROM employee
    WHERE salary > 30000        -- row filter, before grouping
    GROUP BY dept
    HAVING COUNT(*) > 5         -- group filter, after grouping
    ORDER BY n DESC;
    ~~~`,
    mistakes: [
      "Saying TRUNCATE is DML.",
      "Using an aggregate in WHERE.",
      "Using UNION when duplicates are impossible anyway — UNION ALL avoids a needless sort.",
    ],
    remember: "One line, the key difference, one example — DELETE rows, TRUNCATE all rows, DROP the table; WHERE before grouping, HAVING after.",
  },
};
