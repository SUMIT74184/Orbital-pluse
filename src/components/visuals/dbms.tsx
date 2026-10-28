"use client";

import { Bars, Cards, ClassDiagram, Figure, Layers, Steps, Tables, Timeline } from "./kit";

/* Diagrams for the DBMS track, named from src/data/guides/dbms.ts. */

/** Super keys contain candidate keys, which contain the one primary key. */
function KeySets() {
  const sets = [
    { x: 10, y: 10, w: 500, h: 150, tone: "var(--color-muted)", name: "Super keys", ex: "{roll}, {email}, {roll, name}, {email, phone}, {roll, email} …" },
    { x: 40, y: 54, w: 330, h: 96, tone: "var(--color-new)", name: "Candidate keys (minimal)", ex: "{roll}, {email}" },
    { x: 70, y: 98, w: 150, h: 42, tone: "var(--color-topic)", name: "Primary key", ex: "{roll}" },
  ];
  return (
    <Figure caption="Every candidate key is a super key with nothing extra; the primary key is the one candidate key you pick. The rest are alternate keys">
      <svg viewBox="0 0 520 170" className="h-auto w-full" role="img" aria-label="Super, candidate and primary keys as nested sets">
        {sets.map((s) => (
          <g key={s.name}>
            <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="10" fill="var(--color-panel)" fillOpacity="0.6" stroke={s.tone} strokeWidth="1.3" />
            <text x={s.x + 12} y={s.y + 17} fontSize="11.5" fontWeight="600" fill={s.tone}>
              {s.name}
            </text>
            <text x={s.x + 12} y={s.y + 32} fontSize="10.5" fill="var(--color-ink)" className="font-mono">
              {s.ex}
            </text>
          </g>
        ))}
        <text x="240" y="126" fontSize="10.5" fill="var(--color-muted)">alternate key: {"{email}"}</text>
      </svg>
    </Figure>
  );
}

/** Locks held over time under two-phase locking: only acquire, then only release. */
function TwoPhaseCurve() {
  return (
    <Figure caption="2PL: a transaction first only takes locks (growing), then only releases them (shrinking). Strict 2PL holds the X locks until commit">
      <svg viewBox="0 0 520 170" className="h-auto w-full" role="img" aria-label="Growing and shrinking phase of two-phase locking">
        <line x1="40" y1="140" x2="500" y2="140" stroke="var(--color-line)" />
        <line x1="40" y1="20" x2="40" y2="140" stroke="var(--color-line)" />
        <text x="44" y="16" fontSize="10.5" fill="var(--color-muted)">locks held</text>
        <text x="472" y="134" fontSize="10.5" fill="var(--color-muted)">time</text>
        <path d="M40 140 L80 140 L80 112 L130 112 L130 84 L180 84 L180 56 L250 56" fill="none" stroke="var(--color-new)" strokeWidth="2" />
        <path d="M250 56 L300 56 L300 84 L350 84 L350 112 L400 112 L400 140 L460 140" fill="none" stroke="var(--color-rev)" strokeWidth="2" />
        <line x1="250" y1="40" x2="250" y2="140" stroke="var(--color-topic)" strokeDasharray="4 3" />
        <text x="256" y="44" fontSize="10.5" fill="var(--color-topic)">lock point</text>
        <text x="60" y="158" fontSize="10.5" fill="var(--color-new)">growing: lock(A), lock(B)… only</text>
        <text x="270" y="158" fontSize="10.5" fill="var(--color-rev)">shrinking: unlock… only, no new locks</text>
      </svg>
    </Figure>
  );
}

/** What recovery does with each transaction, given the last checkpoint and the crash. */
function RecoveryTimeline() {
  const bars = [
    { name: "T1", from: 40, to: 150, fate: "committed before checkpoint → nothing to do", tone: "var(--color-muted)" },
    { name: "T2", from: 110, to: 290, fate: "committed after checkpoint → REDO", tone: "var(--color-new)" },
    { name: "T3", from: 230, to: 400, fate: "still running at crash → UNDO", tone: "var(--color-hard)", open: true },
    { name: "T4", from: 320, to: 370, fate: "committed → REDO", tone: "var(--color-new)" },
  ];
  return (
    <Figure caption="After a crash, recovery starts from the last checkpoint: redo what committed, undo what didn't">
      <svg viewBox="0 0 520 190" className="h-auto w-full" role="img" aria-label="Recovery decisions relative to a checkpoint and a crash">
        <line x1="200" y1="10" x2="200" y2="160" stroke="var(--color-topic)" strokeDasharray="4 3" />
        <text x="204" y="20" fontSize="10.5" fill="var(--color-topic)">checkpoint</text>
        <line x1="400" y1="10" x2="400" y2="160" stroke="var(--color-hard)" strokeWidth="1.5" />
        <text x="404" y="20" fontSize="10.5" fill="var(--color-hard)">crash ✗</text>
        {bars.map((b, i) => {
          const y = 36 + i * 30;
          return (
            <g key={b.name}>
              <text x="10" y={y + 9} fontSize="11" fontWeight="600" fill={b.tone}>
                {b.name}
              </text>
              <rect x={b.from} y={y} width={b.to - b.from} height="12" rx="3" fill={b.tone} fillOpacity="0.25" stroke={b.tone} strokeDasharray={b.open ? "4 3" : undefined} />
              {!b.open && <circle cx={b.to} cy={y + 6} r="3.5" fill={b.tone} />}
              <text x={b.from} y={y + 24} fontSize="10" fill="var(--color-muted)">
                {b.fate}
              </text>
            </g>
          );
        })}
        <text x="10" y="182" fontSize="10.5" fill="var(--color-muted)">● = commit record written to the log</text>
      </svg>
    </Figure>
  );
}

const BLOCKS = [
  ["10", "20", "30"],
  ["40", "50", "60"],
];

function IndexColumn({ x, keys, label, perBlock }: { x: number; keys: string[]; label: string; perBlock: boolean }) {
  return (
    <g>
      <text x={x} y="16" fontSize="11" fontWeight="600" fill="var(--color-new)">
        {label}
      </text>
      {keys.map((k, i) => {
        const y = 26 + i * 22;
        const target = perBlock ? 26 + i * 72 + 11 : 26 + Math.floor(i / 3) * 72 + (i % 3) * 22 + 11;
        return (
          <g key={k}>
            <rect x={x} y={y} width="40" height="20" rx="3" fill="var(--color-panel)" stroke="var(--color-new)" />
            <text x={x + 20} y={y + 14} textAnchor="middle" fontSize="10.5" fill="var(--color-ink)" className="font-mono">
              {k}
            </text>
            <line x1={x + 40} y1={y + 10} x2={x + 98} y2={target} stroke="var(--color-muted)" strokeWidth="1" />
          </g>
        );
      })}
      {BLOCKS.map((b, bi) =>
        b.map((r, ri) => (
          <g key={r}>
            <rect x={x + 100} y={26 + bi * 72 + ri * 22} width="80" height="20" rx="2" fill="var(--color-panel)" stroke={ri === 0 ? "var(--color-topic)" : "var(--color-line)"} />
            <text x={x + 108} y={26 + bi * 72 + ri * 22 + 14} fontSize="10.5" fill="var(--color-ink)" className="font-mono">
              {r} | row…
            </text>
          </g>
        )),
      )}
    </g>
  );
}

/** Dense vs sparse index: an entry per record vs an entry per block. */
function DenseSparse() {
  return (
    <Figure caption="Dense: an index entry for every key. Sparse: one entry per block (the block's first key) — smaller, but needs the file sorted on that key">
      <svg viewBox="0 0 520 176" className="h-auto w-full" role="img" aria-label="Dense versus sparse index">
        <IndexColumn x={10} keys={["10", "20", "30", "40", "50", "60"]} label="Dense index" perBlock={false} />
        <IndexColumn x={290} keys={["10", "40"]} label="Sparse index" perBlock />
      </svg>
    </Figure>
  );
}

export const DBMS_DIAGRAMS: Record<string, () => React.ReactNode> = {
  "dbms-vs-files": () => (
    <ClassDiagram
      width={520}
      height={176}
      caption="Left: every app keeps its own copy of the data, so copies drift apart. Right: one DBMS owns the data and every app asks it"
      nodes={[
        { id: "a1", x: 10, y: 6, w: 100, title: "Fees app", tone: "muted" },
        { id: "a2", x: 10, y: 70, w: 100, title: "Library app", tone: "muted" },
        { id: "f1", x: 140, y: 6, w: 100, title: "fees.csv", lines: ["addr: Pune"], tone: "hard" },
        { id: "f2", x: 140, y: 70, w: 100, title: "books.csv", lines: ["addr: Mumbai"], tone: "hard" },
        { id: "b1", x: 280, y: 6, w: 90, title: "Fees app", tone: "muted" },
        { id: "b2", x: 280, y: 70, w: 90, title: "Library app", tone: "muted" },
        { id: "b3", x: 280, y: 134, w: 90, title: "Admin app", tone: "muted" },
        { id: "d", x: 410, y: 56, w: 100, title: "DBMS", lines: ["one copy", "rules, locks"], shape: "db", tone: "topic" },
      ]}
      edges={[
        { from: "a1", to: "f1", kind: "flow" },
        { from: "a2", to: "f2", kind: "flow" },
        { from: "b1", to: "d", kind: "flow" },
        { from: "b2", to: "d", kind: "flow" },
        { from: "b3", to: "d", kind: "flow", label: "SQL" },
      ]}
    />
  ),
  "three-schema": () => (
    <Layers
      caption="Three levels, each hiding the one below. Change a lower level and only the mapping above it changes"
      layers={[
        { label: "External level (views)", note: "Student portal sees name + marks · Accounts sees name + fees", tone: "new", side: "what each user sees" },
        { label: "↕ mapping", note: "logical data independence: add a column, views still work", tone: "muted" },
        { label: "Conceptual level (logical schema)", note: "Tables Student, Course, Fee with columns, keys, constraints", tone: "topic", side: "what is stored" },
        { label: "↕ mapping", note: "physical data independence: add an index, move files — tables unchanged", tone: "muted" },
        { label: "Internal level (physical schema)", note: "Files, pages, B+ tree indexes, compression", tone: "rev", side: "how it is stored" },
      ]}
    />
  ),
  "three-tier": () => (
    <ClassDiagram
      width={520}
      height={110}
      caption="3-tier: the browser never talks to the database directly; the app server in the middle holds the business rules"
      nodes={[
        { id: "c", x: 10, y: 30, w: 120, title: "Client tier", lines: ["browser / app"], tone: "new" },
        { id: "a", x: 200, y: 30, w: 120, title: "Application tier", lines: ["rules, auth"], tone: "topic" },
        { id: "d", x: 390, y: 22, w: 120, title: "Database tier", lines: ["MySQL"], shape: "db", tone: "rev" },
      ]}
      edges={[
        { from: "c", to: "a", kind: "flow", label: "HTTP" },
        { from: "a", to: "d", kind: "flow", label: "SQL" },
      ]}
    />
  ),
  "sql-languages": () => (
    <Cards
      cols={4}
      caption="The four families of SQL commands"
      items={[
        { title: "DDL — define", idea: "Shape of the data", code: "CREATE, ALTER,\nDROP, TRUNCATE", tone: "new" },
        { title: "DML — manipulate", idea: "The rows themselves", code: "SELECT, INSERT,\nUPDATE, DELETE", tone: "topic" },
        { title: "DCL — control", idea: "Who may do what", code: "GRANT, REVOKE", tone: "rev" },
        { title: "TCL — transactions", idea: "Save or undo work", code: "COMMIT, ROLLBACK,\nSAVEPOINT", tone: "pulse" },
      ]}
    />
  ),
  "data-models": () => (
    <Cards
      cols={3}
      caption="The same college data in different data models"
      items={[
        { title: "Hierarchical", idea: "A tree: each child has one parent", code: "College\n └ Dept\n    └ Student", tone: "muted" },
        { title: "Network", idea: "A graph of records with many parents", code: "Student ↔ Course\n(pointer links)", tone: "muted" },
        { title: "Relational", idea: "Tables joined by keys — today's default", code: "Student(roll, name)\nEnrol(roll, cid)", tone: "topic" },
        { title: "Document", idea: "Nested JSON per record", code: '{ roll: 1,\n  courses: ["DBMS"] }', tone: "new" },
        { title: "Key-value", idea: "One key → one blob", code: 'student:1 → "{…}"', tone: "new" },
        { title: "Graph", idea: "Nodes + edges for relationships", code: "(Asha)-[:FRIEND]->(Ravi)", tone: "rev" },
      ]}
    />
  ),
  "er-basics": () => (
    <ClassDiagram
      width={520}
      height={176}
      caption="ER notation: rectangles are entities, ovals attributes (orange = key, {braces} = multi-valued), diamonds relationships. Section is a weak entity: it only exists inside a Course"
      nodes={[
        { id: "roll", x: 6, y: 6, w: 76, title: "roll_no", shape: "pill", tone: "topic" },
        { id: "name", x: 92, y: 6, w: 70, title: "name", shape: "pill", tone: "muted" },
        { id: "ph", x: 6, y: 140, w: 96, title: "{phones}", shape: "pill", tone: "muted" },
        { id: "s", x: 40, y: 70, w: 100, title: "Student", tone: "new" },
        { id: "r", x: 200, y: 58, w: 100, h: 46, title: "Enrolls", shape: "diamond", tone: "pulse" },
        { id: "c", x: 360, y: 70, w: 100, title: "Course", tone: "new" },
        { id: "cid", x: 330, y: 6, w: 70, title: "cid", shape: "pill", tone: "topic" },
        { id: "gr", x: 220, y: 140, w: 70, title: "grade", shape: "pill", tone: "muted" },
        { id: "sec", x: 400, y: 140, w: 110, title: "Section (weak)", tone: "rev" },
      ]}
      edges={[
        { from: "s", to: "roll", kind: "line" },
        { from: "s", to: "name", kind: "line" },
        { from: "s", to: "ph", kind: "line" },
        { from: "s", to: "r", kind: "line", label: "M" },
        { from: "c", to: "r", kind: "line", label: "N" },
        { from: "c", to: "cid", kind: "line" },
        { from: "r", to: "gr", kind: "line" },
        { from: "c", to: "sec", kind: "compose" },
      ]}
    />
  ),
  cardinality: () => (
    <Cards
      cols={3}
      caption="Cardinality: how many of B can one A be linked to (and the other way round)"
      items={[
        { title: "1 : 1", idea: "One person, one Aadhaar number", code: "Person ─ Aadhaar\nFK on either side\n(+ UNIQUE)", tone: "new" },
        { title: "1 : N", idea: "One department, many teachers", code: "Dept ─< Teacher\nFK goes on the\n'many' side", tone: "topic" },
        { title: "M : N", idea: "Many students, many courses", code: "Student >─< Course\nneeds a junction\ntable Enrolment", tone: "pulse" },
      ]}
    />
  ),
  participation: () => (
    <Tables
      caption="Total participation (double line in ER): every Loan must belong to a Customer. Partial: a Customer may have no loan"
      tables={[
        { name: "Customer (partial)", head: ["cust_id", "name"], rows: [["1", "Asha"], ["2", "Ravi"], ["3", "Meena"]], note: "Meena has no loan — allowed" },
        { name: "Loan (total)", head: ["loan_id", "cust_id"], rows: [["L1", "1"], ["L2", "1"], ["L3", "2"]], tone: "topic", note: "cust_id NOT NULL — every loan has an owner" },
      ]}
    />
  ),
  specialization: () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="Specialization goes down (Employee → kinds of employee); generalization goes up (common parts pulled into Employee). Subclasses inherit the attributes"
      nodes={[
        { id: "e", x: 190, y: 6, w: 140, title: "Employee", lines: ["emp_id, name, salary"], tone: "topic" },
        { id: "isa", x: 225, y: 66, w: 70, h: 36, title: "ISA", shape: "diamond", tone: "muted" },
        { id: "m", x: 20, y: 120, w: 140, title: "Manager", lines: ["team_size"] },
        { id: "g", x: 190, y: 120, w: 140, title: "Engineer", lines: ["tech_stack"] },
        { id: "s", x: 360, y: 120, w: 140, title: "Salesperson", lines: ["target"] },
      ]}
      edges={[
        { from: "isa", to: "e", kind: "inherit" },
        { from: "m", to: "isa", kind: "line" },
        { from: "g", to: "isa", kind: "line" },
        { from: "s", to: "isa", kind: "line" },
      ]}
    />
  ),
  "er-to-tables": () => (
    <Tables
      between="+"
      caption="Student M:N Course becomes three tables: each entity gets a table, and the relationship becomes a junction table whose key is both foreign keys"
      tables={[
        { name: "Student", head: ["roll", "name"], key: [0], rows: [["1", "Asha"], ["2", "Ravi"]] },
        { name: "Enrolment", head: ["roll", "cid", "grade"], key: [0, 1], rows: [["1", "C1", "A"], ["1", "C2", "B"], ["2", "C1", "A"]], tone: "topic" },
        { name: "Course", head: ["cid", "title"], key: [0], rows: [["C1", "DBMS"], ["C2", "OS"]] },
      ]}
    />
  ),
  "relation-anatomy": () => (
    <Tables
      caption="A relation (table): columns are attributes, rows are tuples. Degree = number of columns (3), cardinality = number of rows (4)"
      tables={[
        {
          name: "Student  ← relation name",
          head: ["roll (INT)", "name (VARCHAR)", "city"],
          rows: [
            ["1", "Asha", "Pune"],
            ["2", "Ravi", "Delhi"],
            ["3", "Meena", "NULL"],
            ["4", "Arjun", "Pune"],
          ],
          mark: ["2,2"],
          note: "Domain of roll = whole numbers. NULL = unknown, not empty or zero.",
        },
      ]}
    />
  ),
  "key-sets": KeySets,
  referential: () => (
    <Tables
      between="→ FK →"
      caption="Referential integrity: every orders.customer_id must exist in customers.id. Row 3 points at customer 9, who doesn't exist, so the DBMS rejects it"
      tables={[
        { name: "orders (child)", head: ["order_id", "customer_id"], rows: [["101", "1"], ["102", "2"], ["103", "9"]], mark: ["2,1"], tone: "topic" },
        { name: "customers (parent)", head: ["id", "name"], key: [0], rows: [["1", "Asha"], ["2", "Ravi"]] },
      ]}
    />
  ),
  "on-delete": () => (
    <ClassDiagram
      width={520}
      height={180}
      caption="What happens to child rows when you delete a parent row, set by ON DELETE on the foreign key"
      nodes={[
        { id: "q", x: 170, y: 6, w: 180, h: 50, title: "DELETE customer 1?", shape: "diamond", tone: "pulse" },
        { id: "c", x: 6, y: 100, w: 120, title: "CASCADE", lines: ["delete their", "orders too"], tone: "new" },
        { id: "n", x: 136, y: 100, w: 120, title: "SET NULL", lines: ["orders keep,", "customer = NULL"], tone: "rev" },
        { id: "r", x: 266, y: 100, w: 120, title: "RESTRICT", lines: ["refuse if any", "orders exist"], tone: "hard" },
        { id: "d", x: 396, y: 100, w: 118, title: "SET DEFAULT", lines: ["point to a", "default row"], tone: "muted" },
      ]}
      edges={[
        { from: "q", to: "c", kind: "flow" },
        { from: "q", to: "n", kind: "flow" },
        { from: "q", to: "r", kind: "flow" },
        { from: "q", to: "d", kind: "flow" },
      ]}
    />
  ),
  "algebra-ops": () => (
    <Cards
      cols={4}
      caption="The core relational algebra operators and the SQL they become"
      items={[
        { title: "σ select (rows)", idea: "Keep rows matching a condition", code: "σ city='Pune'(Student)\n→ WHERE", tone: "new" },
        { title: "π project (columns)", idea: "Keep some columns, drop duplicates", code: "π name(Student)\n→ SELECT DISTINCT", tone: "new" },
        { title: "⋈ join", idea: "Pair rows that match", code: "Student ⋈ Enrol\n→ JOIN … ON", tone: "topic" },
        { title: "× product", idea: "Every row with every row", code: "R × S\n→ CROSS JOIN", tone: "muted" },
        { title: "∪ ∩ −", idea: "Set operations on compatible tables", code: "R ∪ S → UNION\nR − S → EXCEPT", tone: "rev" },
        { title: "ρ rename", idea: "Give a table / column a new name", code: "ρ S(Student)\n→ AS S", tone: "muted" },
        { title: "÷ division", idea: "\"Matched ALL of\" queries", code: "Enrol ÷ π cid(Course)\n= took every course", tone: "pulse" },
        { title: "γ group", idea: "Aggregates (extended algebra)", code: "γ dept; COUNT(*)\n→ GROUP BY", tone: "muted" },
      ]}
    />
  ),
  "query-forms": () => (
    <Cards
      cols={2}
      caption="One question — names of students from Pune — written four ways"
      items={[
        { title: "Relational algebra (procedural: how)", idea: "Steps to compute it", code: "π name( σ city='Pune' (Student) )", tone: "new" },
        { title: "Tuple relational calculus (what)", idea: "Describe the rows you want", code: "{ t.name | t ∈ Student ∧ t.city = 'Pune' }", tone: "topic" },
        { title: "Domain relational calculus (what)", idea: "Variables range over column values", code: "{ ⟨n⟩ | ∃r ( ⟨r, n, 'Pune'⟩ ∈ Student ) }", tone: "rev" },
        { title: "SQL", idea: "Based on TRC, with algebra-style operators", code: "SELECT name FROM Student\nWHERE city = 'Pune';", tone: "pulse" },
      ]}
    />
  ),
  "fd-arrows": () => (
    <ClassDiagram
      width={520}
      height={140}
      caption="Functional dependencies: roll → name, dept (knowing roll tells you both); dept → hod. So roll → hod transitively"
      nodes={[
        { id: "r", x: 20, y: 52, w: 90, title: "roll", tone: "topic" },
        { id: "n", x: 210, y: 6, w: 90, title: "name" },
        { id: "d", x: 210, y: 98, w: 90, title: "dept" },
        { id: "h", x: 410, y: 98, w: 90, title: "hod" },
      ]}
      edges={[
        { from: "r", to: "n", kind: "flow" },
        { from: "r", to: "d", kind: "flow" },
        { from: "d", to: "h", kind: "flow" },
      ]}
    />
  ),
  armstrong: () => (
    <Cards
      cols={3}
      caption="Armstrong's three axioms, and the rules you can derive from them"
      items={[
        { title: "Reflexivity", idea: "A set determines its own subsets", code: "{roll,name} → name", tone: "new" },
        { title: "Augmentation", idea: "Add the same thing to both sides", code: "roll → name ⇒\nroll,dept → name,dept", tone: "new" },
        { title: "Transitivity", idea: "Chain them", code: "roll → dept, dept → hod\n⇒ roll → hod", tone: "new" },
        { title: "Union (derived)", idea: "Same left side, combine", code: "X→Y, X→Z ⇒ X→YZ", tone: "muted" },
        { title: "Decomposition (derived)", idea: "Split the right side", code: "X→YZ ⇒ X→Y, X→Z", tone: "muted" },
        { title: "Pseudo-transitivity", idea: "Chain with extra attributes", code: "X→Y, WY→Z ⇒ WX→Z", tone: "muted" },
      ]}
    />
  ),
  closure: () => (
    <Steps
      caption="R(A,B,C,D,E), F = {A→B, B→C, CD→E}. Find {A,D}⁺: keep applying FDs whose left side is already inside. It reaches every attribute, so AD is a key"
      loop="repeat until nothing new is added"
      steps={[
        { label: "{A, D}", note: "start", tone: "new" },
        { label: "+B", note: "A → B", tone: "topic" },
        { label: "+C", note: "B → C", tone: "topic" },
        { label: "+E", note: "CD → E", tone: "topic" },
        { label: "{A,B,C,D,E}", note: "all ⇒ super key", tone: "pulse" },
      ]}
    />
  ),
  "nf-1-2": () => (
    <Tables
      between="→"
      caption="Unnormalized → 1NF (one value per cell) → 2NF (course_name depends only on cid, part of the key, so it moves out)"
      tables={[
        { name: "Not 1NF", head: ["roll", "courses"], rows: [["1", "C1, C2"], ["2", "C1"]], mark: ["0,1"], tone: "hard", note: "two values in one cell" },
        { name: "1NF (key: roll, cid)", head: ["roll", "cid", "c_name"], key: [0, 1], rows: [["1", "C1", "DBMS"], ["1", "C2", "OS"], ["2", "C1", "DBMS"]], mark: ["0,2", "2,2"], tone: "pulse", note: "'DBMS' repeats: partial dependency cid → c_name" },
        { name: "2NF", head: ["roll", "cid"], key: [0, 1], rows: [["1", "C1"], ["1", "C2"], ["2", "C1"]], tone: "topic" },
        { name: "", head: ["cid", "c_name"], key: [0], rows: [["C1", "DBMS"], ["C2", "OS"]], tone: "topic" },
      ]}
    />
  ),
  anomalies: () => (
    <Tables
      caption="One badly designed table, three anomalies"
      tables={[
        {
          name: "StudentDept",
          head: ["roll", "name", "dept", "hod"],
          rows: [
            ["1", "Asha", "CS", "Dr. Rao"],
            ["2", "Ravi", "CS", "Dr. Rao"],
            ["3", "Meena", "EE", "Dr. Iyer"],
          ],
          mark: ["0,3", "1,3"],
          note: "Update: change CS's HOD in 2 rows or data disagrees. Insert: can't add a new dept with no students. Delete: removing Meena loses EE's HOD.",
        },
      ]}
    />
  ),
  "nf-3": () => (
    <Tables
      between="→"
      caption="3NF: roll → dept → hod is a transitive dependency (a non-key decides another non-key). Split it out so each fact is stored once"
      tables={[
        { name: "2NF but not 3NF", head: ["roll", "dept", "hod"], key: [0], rows: [["1", "CS", "Dr. Rao"], ["2", "CS", "Dr. Rao"], ["3", "EE", "Dr. Iyer"]], mark: ["0,2", "1,2"], tone: "pulse" },
        { name: "Student", head: ["roll", "dept"], key: [0], rows: [["1", "CS"], ["2", "CS"], ["3", "EE"]], tone: "topic" },
        { name: "Dept", head: ["dept", "hod"], key: [0], rows: [["CS", "Dr. Rao"], ["EE", "Dr. Iyer"]], tone: "topic" },
      ]}
    />
  ),
  "nf-ladder": () => (
    <Layers
      caption="Each normal form adds one rule on top of the previous one"
      layers={[
        { label: "1NF", note: "Atomic values; no repeating groups", tone: "muted", side: "cells hold one value" },
        { label: "2NF", note: "1NF + no partial dependency (non-key on part of a composite key)", tone: "new", side: "whole key" },
        { label: "3NF", note: "2NF + no transitive dependency (non-key → non-key)", tone: "topic", side: "nothing but the key" },
        { label: "BCNF", note: "For every X → Y, X is a super key", tone: "pulse", side: "stricter 3NF" },
        { label: "4NF / 5NF", note: "No multivalued / join dependencies", tone: "rev", side: "rare in practice" },
      ]}
    />
  ),
  "lossy-join": () => (
    <Tables
      between="⋈ →"
      caption="A lossy split: joining on 'city' (not a key of either side) creates rows that never existed. Split on a key and the join gives back exactly the original"
      tables={[
        { name: "R1(name, city)", head: ["name", "city"], rows: [["Asha", "Pune"], ["Ravi", "Pune"]] },
        { name: "R2(city, phone)", head: ["city", "phone"], rows: [["Pune", "111"], ["Pune", "222"]] },
        { name: "R1 ⋈ R2", head: ["name", "city", "phone"], rows: [["Asha", "Pune", "111"], ["Asha", "Pune", "222"], ["Ravi", "Pune", "111"], ["Ravi", "Pune", "222"]], mark: ["1,*", "2,*"], tone: "hard", note: "2 spurious rows" },
      ]}
    />
  ),
  mvd: () => (
    <Tables
      between="→"
      caption="Teacher ↠ subject and teacher ↠ language are independent facts. In one table you must store every combination (4NF violation); split them"
      tables={[
        { name: "Not 4NF", head: ["teacher", "subject", "language"], rows: [["Rao", "DBMS", "English"], ["Rao", "DBMS", "Hindi"], ["Rao", "OS", "English"], ["Rao", "OS", "Hindi"]], mark: ["1,1", "3,1"], tone: "pulse" },
        { name: "Teaches", head: ["teacher", "subject"], rows: [["Rao", "DBMS"], ["Rao", "OS"]], tone: "topic" },
        { name: "Speaks", head: ["teacher", "language"], rows: [["Rao", "English"], ["Rao", "Hindi"]], tone: "topic" },
      ]}
    />
  ),
  acid: () => (
    <Cards
      cols={4}
      caption="ACID, using a ₹500 transfer from A to B"
      items={[
        { title: "Atomicity", idea: "All or nothing — never debit A without crediting B", code: "undo log /\nrollback", tone: "new" },
        { title: "Consistency", idea: "Rules hold before and after: total money unchanged", code: "constraints +\ncorrect code", tone: "topic" },
        { title: "Isolation", idea: "Others never see the half-done transfer", code: "locks / MVCC", tone: "rev" },
        { title: "Durability", idea: "Once 'success' is shown, a crash can't undo it", code: "redo log (WAL)\nflushed on commit", tone: "pulse" },
      ]}
    />
  ),
  "txn-states": () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="Transaction states. 'Partially committed' = last statement ran but changes may still be only in memory"
      nodes={[
        { id: "a", x: 10, y: 60, w: 90, title: "Active", shape: "pill", tone: "new" },
        { id: "p", x: 160, y: 10, w: 150, title: "Partially committed", shape: "pill", tone: "topic" },
        { id: "c", x: 400, y: 10, w: 110, title: "Committed", shape: "pill", tone: "easy" },
        { id: "f", x: 200, y: 112, w: 90, title: "Failed", shape: "pill", tone: "hard" },
        { id: "x", x: 400, y: 112, w: 110, title: "Aborted", shape: "pill", tone: "muted" },
      ]}
      edges={[
        { from: "a", to: "p", kind: "flow", label: "last op" },
        { from: "p", to: "c", kind: "flow", label: "commit" },
        { from: "a", to: "f", kind: "flow", label: "error" },
        { from: "p", to: "f", kind: "flow" },
        { from: "f", to: "x", kind: "flow", label: "rollback" },
      ]}
    />
  ),
  "cascading-rollback": () => (
    <Timeline
      caption="T2 read a value T1 never committed (a dirty read). When T1 aborts, T2 must abort too — a cascading rollback. Cascadeless schedules only read committed data"
      cols={[
        { name: "T1", tone: "new" },
        { name: "T2", tone: "rev" },
      ]}
      rows={[
        ["write(A = 50)", ""],
        ["", "read(A) → 50"],
        ["", "write(B = A + 10)"],
        ["abort ✗", ""],
        ["", "must roll back too ✗"],
      ]}
    />
  ),
  "conflict-schedule": () => (
    <Timeline
      caption="Conflicting pairs (same item, at least one write): T1 r(A) before T2 w(A) gives an edge T1 → T2; T2 w(B) before T1 r(B) gives T2 → T1"
      cols={[
        { name: "T1", tone: "new" },
        { name: "T2", tone: "rev" },
      ]}
      rows={[
        ["read(A)", ""],
        ["", "write(A)"],
        ["", "write(B)"],
        ["read(B)", ""],
      ]}
    />
  ),
  "precedence-graph": () => (
    <ClassDiagram
      width={520}
      height={120}
      caption="Precedence graph of that schedule: T1 → T2 and T2 → T1 form a cycle, so it is NOT conflict serializable. No cycle ⇒ serializable; a topological order gives the equivalent serial order"
      nodes={[
        { id: "a", x: 110, y: 40, w: 80, title: "T1", shape: "pill", tone: "new" },
        { id: "b", x: 330, y: 40, w: 80, title: "T2", shape: "pill", tone: "rev" },
      ]}
      edges={[
        { from: "a", to: "b", kind: "flow", label: "A: r → w" },
        { from: "b", to: "a", kind: "async", label: "B: w → r" },
      ]}
    />
  ),
  "isolation-matrix": () => (
    <Tables
      caption="Which anomalies each isolation level allows (✗ = can happen). MySQL InnoDB defaults to Repeatable Read; PostgreSQL to Read Committed"
      tables={[
        {
          name: "Isolation levels",
          head: ["Level", "Dirty read", "Non-repeatable", "Phantom"],
          rows: [
            ["Read uncommitted", "✗", "✗", "✗"],
            ["Read committed", "✓", "✗", "✗"],
            ["Repeatable read", "✓", "✓", "✗ *"],
            ["Serializable", "✓", "✓", "✓"],
          ],
          mark: ["0,1", "0,2", "0,3", "1,2", "1,3", "2,3"],
          note: "* InnoDB's next-key locks also block most phantoms",
        },
      ]}
    />
  ),
  "dirty-read": () => (
    <Timeline
      caption="The three read anomalies, one row each"
      cols={[
        { name: "Anomaly", tone: "muted" },
        { name: "T1", tone: "new" },
        { name: "T2", tone: "rev" },
      ]}
      time="#"
      rows={[
        ["Dirty read", "UPDATE bal=0 … (then ROLLBACK)", "reads bal = 0 ✗ never existed"],
        ["Non-repeatable", "reads bal=100 … reads again → 50 ✗", "UPDATE bal=50; COMMIT"],
        ["Phantom", "COUNT(*) WHERE dept='CS' → 5 … again → 6 ✗", "INSERT a CS student; COMMIT"],
        ["Lost update", "reads 10, writes 11", "reads 10, writes 11 ✗ (should be 12)"],
      ]}
    />
  ),
  "two-phase-locking": TwoPhaseCurve,
  "lock-matrix": () => (
    <Tables
      caption="Lock compatibility: many readers can share (S + S), but a writer (X) needs the item to itself"
      tables={[
        {
          name: "Requested ↓ / held →",
          head: ["", "S held", "X held"],
          rows: [
            ["S (read)", "✓ grant", "wait"],
            ["X (write)", "wait", "wait"],
          ],
          mark: ["0,2", "1,1", "1,2"],
        },
      ]}
    />
  ),
  deadlock: () => (
    <ClassDiagram
      width={520}
      height={150}
      caption="Deadlock: T1 holds A and waits for B; T2 holds B and waits for A. The wait-for graph has a cycle, so the DBMS kills one (the victim) and rolls it back"
      nodes={[
        { id: "t1", x: 30, y: 54, w: 80, title: "T1", shape: "pill", tone: "new" },
        { id: "a", x: 220, y: 6, w: 80, title: "Row A", shape: "db", tone: "muted" },
        { id: "b", x: 220, y: 100, w: 80, title: "Row B", shape: "db", tone: "muted" },
        { id: "t2", x: 410, y: 54, w: 80, title: "T2", shape: "pill", tone: "rev" },
      ]}
      edges={[
        { from: "a", to: "t1", kind: "flow", label: "held by" },
        { from: "t1", to: "b", kind: "async", label: "waits" },
        { from: "b", to: "t2", kind: "flow", label: "held by" },
        { from: "t2", to: "a", kind: "async", label: "waits" },
      ]}
    />
  ),
  "wait-die": () => (
    <Tables
      caption="Timestamp-based deadlock prevention. Older = smaller timestamp. In both, the younger transaction is the one that gets rolled back, so the old one always finishes"
      tables={[
        {
          name: "When Ti asks for a lock Tj holds",
          head: ["", "Ti older than Tj", "Ti younger than Tj"],
          rows: [
            ["Wait-die (non-preemptive)", "Ti waits", "Ti dies (restarts)"],
            ["Wound-wait (preemptive)", "Ti wounds Tj (Tj aborts)", "Ti waits"],
          ],
        },
      ]}
    />
  ),
  "ts-ordering": () => (
    <ClassDiagram
      width={520}
      height={190}
      caption="Basic timestamp ordering for write(X) by T. Every item remembers the largest timestamps that read (R-TS) and wrote (W-TS) it"
      nodes={[
        { id: "s", x: 6, y: 74, w: 100, title: "T: write(X)", shape: "pill", tone: "new" },
        { id: "q1", x: 130, y: 52, w: 140, h: 66, title: "TS(T) < R-TS(X)?", shape: "diamond", tone: "pulse" },
        { id: "a1", x: 140, y: 150, w: 120, title: "abort T ✗", tone: "hard" },
        { id: "q2", x: 290, y: 52, w: 140, h: 66, title: "TS(T) < W-TS(X)?", shape: "diamond", tone: "pulse" },
        { id: "a2", x: 300, y: 150, w: 210, title: "abort T (Thomas: just skip)", tone: "hard" },
        { id: "ok", x: 440, y: 74, w: 74, title: "write ✓", tone: "easy" },
      ]}
      edges={[
        { from: "s", to: "q1", kind: "flow" },
        { from: "q1", to: "a1", kind: "flow", label: "yes" },
        { from: "q1", to: "q2", kind: "flow", label: "no" },
        { from: "q2", to: "a2", kind: "flow", label: "yes" },
        { from: "q2", to: "ok", kind: "flow", label: "no" },
      ]}
    />
  ),
  occ: () => (
    <Steps
      caption="Optimistic concurrency: work on private copies, check for conflicts only at the end. Great when conflicts are rare"
      steps={[
        { label: "Read phase", note: "read, write to a private copy", tone: "new" },
        { label: "Validation", note: "did anyone change what I read?", tone: "pulse" },
        { label: "Write phase", note: "no conflict → apply", tone: "easy" },
        { label: "or Restart", note: "conflict → retry", tone: "hard" },
      ]}
    />
  ),
  mvcc: () => (
    <ClassDiagram
      width={520}
      height={150}
      caption="MVCC: an update writes a new version instead of overwriting. A reader whose snapshot started at txn 105 follows the chain to the version that was committed then — no lock needed"
      nodes={[
        { id: "v3", x: 10, y: 10, w: 150, title: "price = 120", lines: ["by txn 130 (newest)"], tone: "topic" },
        { id: "v2", x: 185, y: 10, w: 150, title: "price = 110", lines: ["by txn 100"], tone: "new" },
        { id: "v1", x: 360, y: 10, w: 150, title: "price = 100", lines: ["by txn 50"], tone: "muted" },
        { id: "r", x: 185, y: 106, w: 150, title: "Reader, snapshot 105", shape: "pill", tone: "rev" },
      ]}
      edges={[
        { from: "v3", to: "v2", kind: "flow" },
        { from: "v2", to: "v1", kind: "flow" },
        { from: "r", to: "v2", kind: "async", label: "sees 110" },
      ]}
    />
  ),
  granularity: () => (
    <Layers
      caption="Multiple-granularity locking: lock big things coarsely, or small things finely. Intention locks on the parents say what's happening below, so a table lock doesn't need to check every row"
      layers={[
        { label: "Database", note: "IX — someone below intends to write", tone: "muted", side: "IS / IX / SIX" },
        { label: "Table orders", note: "IX", tone: "new", side: "S on table = read all" },
        { label: "Page 42", note: "IX", tone: "topic" },
        { label: "Row 1007", note: "X — the actual write lock", tone: "hard", side: "finest grain" },
      ]}
    />
  ),
  wal: () => (
    <ClassDiagram
      width={520}
      height={160}
      caption="Write-ahead logging: the log record reaches disk BEFORE the changed data page does. On commit only the (sequential, fast) log must be flushed"
      nodes={[
        { id: "t", x: 6, y: 60, w: 100, title: "UPDATE", shape: "pill", tone: "new" },
        { id: "bp", x: 140, y: 6, w: 140, title: "Buffer pool", lines: ["page changed (dirty)"], tone: "topic" },
        { id: "lb", x: 140, y: 100, w: 140, title: "Log buffer", lines: ["<T1, A, 100, 50>"], tone: "rev" },
        { id: "d", x: 380, y: 0, w: 130, title: "Data files", lines: ["later, lazily"], shape: "db", tone: "muted" },
        { id: "l", x: 380, y: 94, w: 130, title: "Log on disk", lines: ["1st, on commit"], shape: "db", tone: "pulse" },
      ]}
      edges={[
        { from: "t", to: "bp", kind: "flow" },
        { from: "t", to: "lb", kind: "flow" },
        { from: "lb", to: "l", kind: "flow", label: "① flush" },
        { from: "bp", to: "d", kind: "async", label: "② later" },
      ]}
    />
  ),
  "undo-redo": () => (
    <Tables
      caption="Which log information each update style needs"
      tables={[
        {
          name: "Update policies",
          head: ["Policy", "When data hits disk", "Needs UNDO?", "Needs REDO?"],
          rows: [
            ["Deferred update", "only after commit", "No", "Yes"],
            ["Immediate update", "any time, even before commit", "Yes", "Yes"],
            ["Shadow paging", "new pages, swap pointer at commit", "No", "No"],
          ],
        },
      ]}
    />
  ),
  "recovery-timeline": RecoveryTimeline,
  aries: () => (
    <Steps
      caption="ARIES recovery runs three passes over the log"
      steps={[
        { label: "1. Analysis", note: "from checkpoint: which txns were active, which pages dirty", tone: "new" },
        { label: "2. Redo", note: "repeat history — replay ALL logged changes", tone: "topic" },
        { label: "3. Undo", note: "roll back the losers, newest first (writing CLRs)", tone: "hard" },
      ]}
    />
  ),
  "storage-hierarchy": () => (
    <Bars
      log
      caption="Why databases care about pages and caching: each step down is roughly 100–1000× slower (log scale, typical access times)"
      rows={[
        { label: "CPU cache", value: 1, shown: "~1 ns", tone: "easy" },
        { label: "RAM (buffer pool)", value: 100, shown: "~100 ns", tone: "topic" },
        { label: "NVMe SSD", value: 100_000, shown: "~100 µs", tone: "pulse" },
        { label: "Hard disk seek", value: 10_000_000, shown: "~10 ms", tone: "hard" },
      ]}
    />
  ),
  "page-layout": () => (
    <ClassDiagram
      width={520}
      height={150}
      caption="A table is a file of fixed-size pages (InnoDB: 16 KB). Each slotted page keeps a header, a slot array, and rows packed from the end. The DBMS reads whole pages, never single rows"
      nodes={[
        { id: "f", x: 10, y: 40, w: 120, title: "students.ibd", lines: ["page 0", "page 1", "page 2 …"], tone: "muted" },
        { id: "p", x: 200, y: 6, w: 300, title: "Page 1 (16 KB)", lines: ["header: page id, free space", "slots: [1]→ off 900  [2]→ off 820", "        … free space …", "row 2 | row 1   ← rows from the end"], tone: "topic" },
      ]}
      edges={[{ from: "f", to: "p", kind: "flow" }]}
    />
  ),
  "dense-sparse": DenseSparse,
  "clustered-index": () => (
    <ClassDiagram
      width={520}
      height={150}
      caption="Clustered: the table's rows ARE the leaves, stored in key order (one per table). Secondary: leaves hold the key + a pointer (in InnoDB, the primary key) back to the row"
      nodes={[
        { id: "ci", x: 20, y: 6, w: 200, title: "Clustered index (id)", tone: "topic" },
        { id: "rows", x: 20, y: 76, w: 200, title: "leaves = full rows", lines: ["1 Asha Pune | 2 Ravi Delhi"], tone: "topic" },
        { id: "si", x: 300, y: 6, w: 200, title: "Secondary index (city)", tone: "new" },
        { id: "sl", x: 300, y: 76, w: 200, title: "leaves = city → id", lines: ["Delhi→2 | Pune→1"], tone: "new" },
      ]}
      edges={[
        { from: "ci", to: "rows", kind: "flow" },
        { from: "si", to: "sl", kind: "flow" },
        { from: "sl", to: "rows", kind: "async", label: "lookup by id" },
      ]}
    />
  ),
  "bplus-tree": () => (
    <ClassDiagram
      width={520}
      height={160}
      caption="A B+ tree: internal nodes only guide the search; all data sits in the leaves, which are linked so a range scan just walks sideways"
      nodes={[
        { id: "r", x: 190, y: 6, w: 140, title: "[ 30 | 60 ]", tone: "topic" },
        { id: "l1", x: 6, y: 100, w: 150, title: "10 · 20", lines: ["→ rows"], tone: "new" },
        { id: "l2", x: 185, y: 100, w: 150, title: "30 · 40 · 50", lines: ["→ rows"], tone: "new" },
        { id: "l3", x: 364, y: 100, w: 150, title: "60 · 70 · 80", lines: ["→ rows"], tone: "new" },
      ]}
      edges={[
        { from: "r", to: "l1", kind: "flow", label: "< 30" },
        { from: "r", to: "l2", kind: "flow", label: "30–59" },
        { from: "r", to: "l3", kind: "flow", label: "≥ 60" },
        { from: "l1", to: "l2", kind: "async" },
        { from: "l2", to: "l3", kind: "async" },
      ]}
    />
  ),
  "btree-split": () => (
    <Steps
      caption="Inserting 25 into a full leaf (max 3 keys): split it and push the middle key up. If the parent is full too, it splits the same way — that's how the tree grows taller, from the top"
      steps={[
        { label: "[20 · 30 · 40]", note: "full leaf", tone: "muted" },
        { label: "+25", note: "overflow: 20 25 30 40", tone: "hard" },
        { label: "[20 · 25] [30 · 40]", note: "split in two", tone: "new" },
        { label: "30 ↑ to parent", note: "new separator", tone: "topic" },
      ]}
    />
  ),
  "extendible-hash": () => (
    <ClassDiagram
      width={520}
      height={180}
      caption="Extendible hashing: a directory of 2^global-depth pointers using the last bits of the hash. Two entries may share a bucket (local depth < global). A full bucket splits; the directory doubles only when needed"
      nodes={[
        { id: "d", x: 10, y: 20, w: 130, title: "Directory (gd=2)", lines: ["00 ●", "01 ●", "10 ●", "11 ●"], tone: "topic" },
        { id: "b1", x: 300, y: 0, w: 210, title: "Bucket A (ld=2)", lines: ["4, 12, 32"], tone: "new" },
        { id: "b2", x: 300, y: 64, w: 210, title: "Bucket B (ld=1)", lines: ["1, 5, 7, 13  (01 & 11 share)"], tone: "rev" },
        { id: "b3", x: 300, y: 128, w: 210, title: "Bucket C (ld=2)", lines: ["10, 18"], tone: "new" },
      ]}
      edges={[
        { from: "d", to: "b1", kind: "flow", label: "00" },
        { from: "d", to: "b2", kind: "flow", label: "01, 11" },
        { from: "d", to: "b3", kind: "flow", label: "10" },
      ]}
    />
  ),
  "query-pipeline": () => (
    <Steps
      caption="What happens to a SQL query inside the DBMS"
      steps={[
        { label: "SQL text", tone: "muted" },
        { label: "Parser", note: "syntax + names valid?", tone: "new" },
        { label: "Relational algebra", note: "logical plan", tone: "new" },
        { label: "Optimizer", note: "rewrite + cost with stats", tone: "topic" },
        { label: "Physical plan", note: "index scan, hash join…", tone: "pulse" },
        { label: "Execution engine", note: "rows out", tone: "easy" },
      ]}
    />
  ),
  "push-selection": () => (
    <ClassDiagram
      width={520}
      height={176}
      caption="Pushing the selection down: filter 1 lakh orders to 200 BEFORE joining instead of joining everything and filtering after. Same answer, far less work"
      nodes={[
        { id: "p1", x: 40, y: 4, w: 170, title: "σ city='Pune'", tone: "hard" },
        { id: "j1", x: 40, y: 64, w: 170, title: "⋈ (1 lakh rows)", tone: "hard" },
        { id: "o1", x: 6, y: 130, w: 100, title: "Orders", shape: "db", tone: "muted" },
        { id: "c1", x: 146, y: 130, w: 100, title: "Customers", shape: "db", tone: "muted" },
        { id: "j2", x: 310, y: 4, w: 170, title: "⋈ (200 rows)", tone: "easy" },
        { id: "o2", x: 276, y: 130, w: 100, title: "Orders", shape: "db", tone: "muted" },
        { id: "p2", x: 400, y: 64, w: 116, title: "σ city='Pune'", tone: "easy" },
        { id: "c2", x: 410, y: 130, w: 100, title: "Customers", shape: "db", tone: "muted" },
      ]}
      edges={[
        { from: "o1", to: "j1", kind: "flow" },
        { from: "c1", to: "j1", kind: "flow" },
        { from: "j1", to: "p1", kind: "flow" },
        { from: "c2", to: "p2", kind: "flow" },
        { from: "o2", to: "j2", kind: "flow" },
        { from: "p2", to: "j2", kind: "flow" },
      ]}
    />
  ),
  "join-costs": () => (
    <Bars
      log
      caption="Cost in block transfers to join R (1,000 blocks, 10,000 rows) with S (500 blocks), memory of a few blocks, log scale. The algorithm choice changes cost by 1000×"
      rows={[
        { label: "Nested loop (tuple)", value: 5_001_000, shown: "5,001,000", tone: "hard" },
        { label: "Block nested loop", value: 501_000, shown: "501,000", tone: "pulse" },
        { label: "Index nested loop", value: 31_000, shown: "~31,000", tone: "topic" },
        { label: "Sort-merge join", value: 7_500, shown: "~7,500", tone: "new" },
        { label: "Hash join", value: 4_500, shown: "~4,500", tone: "easy" },
      ]}
    />
  ),
  "star-schema": () => (
    <ClassDiagram
      width={520}
      height={186}
      caption="Star schema: a big fact table of events (numbers you add up) in the middle, small dimension tables (the who / what / when / where you filter by) around it"
      nodes={[
        { id: "f", x: 180, y: 58, w: 160, title: "fact_sales", lines: ["date_id, product_id", "store_id, cust_id", "qty, amount"], tone: "topic" },
        { id: "d", x: 6, y: 6, w: 130, title: "dim_date", lines: ["day, month, year"] },
        { id: "p", x: 384, y: 6, w: 130, title: "dim_product", lines: ["name, category"] },
        { id: "s", x: 6, y: 128, w: 130, title: "dim_store", lines: ["city, region"] },
        { id: "c", x: 384, y: 128, w: 130, title: "dim_customer", lines: ["age, segment"] },
      ]}
      edges={[
        { from: "f", to: "d", kind: "assoc" },
        { from: "f", to: "p", kind: "assoc" },
        { from: "f", to: "s", kind: "assoc" },
        { from: "f", to: "c", kind: "assoc" },
      ]}
    />
  ),
  "row-vs-column": () => (
    <Cards
      cols={2}
      caption="The same table on disk. Row stores suit 'fetch this order'; column stores suit 'SUM(amount) over 1 crore rows' — they read one column and compress it well"
      items={[
        { title: "Row store (OLTP: MySQL)", idea: "Whole rows together", code: "[1, Asha, Pune, 500]\n[2, Ravi, Delhi, 300]\n[3, Meena, Pune, 200]", tone: "new" },
        { title: "Column store (OLAP: BigQuery, Redshift)", idea: "Each column together", code: "id:     1, 2, 3\nname:   Asha, Ravi, Meena\ncity:   Pune, Delhi, Pune\namount: 500, 300, 200", tone: "topic" },
      ]}
    />
  ),
  fragmentation: () => (
    <Tables
      between="|"
      caption="Horizontal fragmentation splits rows (e.g. by region, each site stores its own customers). Vertical splits columns (keep the key in every piece so you can join back)"
      tables={[
        { name: "Horizontal: Mumbai site", head: ["id", "name", "city"], rows: [["1", "Asha", "Mumbai"], ["4", "Arjun", "Mumbai"]], tone: "new" },
        { name: "Horizontal: Delhi site", head: ["id", "name", "city"], rows: [["2", "Ravi", "Delhi"]], tone: "new" },
        { name: "Vertical: profile", head: ["id", "name"], rows: [["1", "Asha"], ["2", "Ravi"]], tone: "rev" },
        { name: "Vertical: billing", head: ["id", "card"], rows: [["1", "•••• 42"], ["2", "•••• 17"]], tone: "rev" },
      ]}
    />
  ),
  "nosql-types": () => (
    <Cards
      cols={4}
      caption="The four NoSQL families, each built for one access pattern"
      items={[
        { title: "Key-value", idea: "get / put by key. Sessions, carts, caching", code: "Redis, DynamoDB\nsession:91 → {…}", tone: "new" },
        { title: "Document", idea: "JSON per record, query inside it. Catalogues, profiles", code: "MongoDB\n{ name, tags: […] }", tone: "topic" },
        { title: "Wide-column", idea: "Huge write volume, rows by partition key. Logs, chats", code: "Cassandra, HBase\n(user, time) → msg", tone: "pulse" },
        { title: "Graph", idea: "Traverse relationships. Social, fraud, maps", code: "Neo4j\n(a)-[:FOLLOWS]->(b)", tone: "rev" },
      ]}
    />
  ),
  "sql-order": () => (
    <Steps
      caption="The order SQL actually runs a SELECT — this is why WHERE can't use an alias or an aggregate, but HAVING can use aggregates"
      steps={[
        { label: "FROM / JOIN", tone: "new" },
        { label: "WHERE", note: "filters rows", tone: "new" },
        { label: "GROUP BY", tone: "topic" },
        { label: "HAVING", note: "filters groups", tone: "topic" },
        { label: "SELECT", note: "aliases born", tone: "pulse" },
        { label: "DISTINCT", tone: "pulse" },
        { label: "ORDER BY", tone: "rev" },
        { label: "LIMIT", tone: "rev" },
      ]}
    />
  ),
};
