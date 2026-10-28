"use client";

import { useId } from "react";
import { ClassDiagram, EdgeLine, Figure, Markers, Steps, TONE, type Kind, type Tone } from "./visuals/kit";
import { DBMS_DIAGRAMS } from "./visuals/dbms";
import { SD_DIAGRAMS } from "./visuals/sd";

function UmlArrows() {
  const p = useId().replace(/:/g, "");
  const rows: { kind: Kind; name: string; meaning: string; ex: string }[] = [
    { kind: "inherit", name: "Inheritance", meaning: "is-a (extends)", ex: "Dog → Animal" },
    { kind: "realize", name: "Realisation", meaning: "implements an interface", ex: "ArrayList ⇢ List" },
    { kind: "assoc", name: "Association", meaning: "knows / uses long-term", ex: "Teacher → Student" },
    { kind: "depend", name: "Dependency", meaning: "uses briefly (param, local)", ex: "Order ⇢ Printer" },
    { kind: "aggregate", name: "Aggregation", meaning: "has-a, parts live on", ex: "Team ◇ Player" },
    { kind: "compose", name: "Composition", meaning: "owns, parts die with it", ex: "House ◆ Room" },
  ];
  return (
    <Figure caption="UML relationship arrows, weakest (dependency) to strongest (composition)">
      <svg viewBox="0 0 520 228" className="h-auto w-full" role="img" aria-label="UML relationship arrows">
        <Markers p={p} />
        {rows.map((r, i) => {
          const y = 18 + i * 36;
          const diamond = r.kind === "aggregate" || r.kind === "compose";
          return (
            <g key={r.kind}>
              <EdgeLine p={p} kind={r.kind} a={{ x: diamond ? 16 : 16, y }} b={{ x: 120, y }} />
              <text x={136} y={y + 4} fontSize="12" fontWeight="600" fill="var(--color-ink)">
                {r.name}
              </text>
              <text x={240} y={y + 4} fontSize="11" fill="var(--color-muted)">
                {r.meaning}
              </text>
              <text x={420} y={y + 4} fontSize="10.5" fill="var(--color-topic)" className="font-mono">
                {r.ex}
              </text>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

function Pillars() {
  const items: { name: string; idea: string; code: string; tone: Tone }[] = [
    { name: "Encapsulation", idea: "Hide state, expose safe methods", code: "private double balance;\npublic void deposit(x)", tone: "new" },
    { name: "Abstraction", idea: "Show what, hide how", code: "interface Payment {\n  void pay(amount);\n}", tone: "rev" },
    { name: "Inheritance", idea: "Reuse via is-a", code: "class Car\n  extends Vehicle", tone: "topic" },
    { name: "Polymorphism", idea: "One call, many forms", code: "Shape s = new Circle();\ns.area(); // Circle's", tone: "pulse" },
  ];
  return (
    <Figure caption="The four pillars, each in one line of Java">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((it) => (
          <div key={it.name} className="rounded-md border p-2.5" style={{ borderColor: TONE[it.tone] }}>
            <div className="text-xs font-semibold" style={{ color: TONE[it.tone] }}>
              {it.name}
            </div>
            <div className="mt-0.5 text-[11px] text-muted">{it.idea}</div>
            <pre className="mt-1.5 whitespace-pre-wrap font-mono text-[10.5px] text-ink/85">{it.code}</pre>
          </div>
        ))}
      </div>
    </Figure>
  );
}

function StackHeap() {
  return (
    <Figure caption="References live on the stack, objects on the heap; two references can point at one object">
      <svg viewBox="0 0 480 170" className="h-auto w-full" role="img" aria-label="Stack and heap">
        <text x="20" y="18" fontSize="11" fill="var(--color-muted)">STACK (per thread)</text>
        <text x="260" y="18" fontSize="11" fill="var(--color-muted)">HEAP (shared)</text>
        {[
          ["Car a", 40],
          ["Car b", 82],
          ["int n = 5", 124],
        ].map(([label, y]) => (
          <g key={label as string}>
            <rect x="20" y={y as number} width="150" height="30" rx="5" fill="var(--color-panel)" stroke="var(--color-new)" />
            <text x="32" y={(y as number) + 19} fontSize="11.5" fill="var(--color-ink)" className="font-mono">
              {label}
            </text>
          </g>
        ))}
        <rect x="260" y="40" width="190" height="72" rx="6" fill="var(--color-panel)" stroke="var(--color-topic)" />
        <text x="272" y="60" fontSize="12" fontWeight="600" fill="var(--color-topic)">Car object</text>
        <text x="272" y="80" fontSize="10.5" fill="var(--color-ink)" className="font-mono">model = &quot;Swift&quot;</text>
        <text x="272" y="97" fontSize="10.5" fill="var(--color-ink)" className="font-mono">speed = 0</text>
        <path d="M170 55 C 210 55, 220 70, 258 70" fill="none" stroke="var(--color-muted)" strokeWidth="1.3" />
        <path d="M170 97 C 210 97, 220 82, 258 82" fill="none" stroke="var(--color-muted)" strokeWidth="1.3" />
        <circle cx="258" cy="70" r="2.5" fill="var(--color-muted)" />
        <circle cx="258" cy="82" r="2.5" fill="var(--color-muted)" />
        <text x="20" y="166" fontSize="10.5" fill="var(--color-muted)" className="font-mono">Car a = new Car(&quot;Swift&quot;); Car b = a; // primitives stay on the stack</text>
      </svg>
    </Figure>
  );
}

function Dispatch() {
  return (
    <Figure caption="Animal a = new Dog(); a.speak() follows the object's class pointer at runtime, not the variable's type">
      <svg viewBox="0 0 520 150" className="h-auto w-full" role="img" aria-label="Dynamic dispatch through a vtable">
        <rect x="10" y="50" width="110" height="34" rx="5" fill="var(--color-panel)" stroke="var(--color-new)" />
        <text x="22" y="71" fontSize="11.5" fill="var(--color-ink)" className="font-mono">Animal a</text>
        <rect x="160" y="34" width="120" height="66" rx="6" fill="var(--color-panel)" stroke="var(--color-topic)" />
        <text x="172" y="54" fontSize="12" fontWeight="600" fill="var(--color-topic)">Dog object</text>
        <text x="172" y="74" fontSize="10.5" fill="var(--color-ink)" className="font-mono">class ptr ●</text>
        <text x="172" y="90" fontSize="10.5" fill="var(--color-ink)" className="font-mono">name = &quot;Rex&quot;</text>
        <rect x="320" y="20" width="190" height="96" rx="6" fill="var(--color-panel)" stroke="var(--color-rev)" />
        <text x="332" y="40" fontSize="12" fontWeight="600" fill="var(--color-rev)">Dog vtable</text>
        <text x="332" y="62" fontSize="10.5" fill="var(--color-ink)" className="font-mono">speak() → Dog.speak</text>
        <text x="332" y="80" fontSize="10.5" fill="var(--color-ink)" className="font-mono">eat()   → Animal.eat</text>
        <text x="332" y="98" fontSize="10.5" fill="var(--color-muted)" className="font-mono">toString → Object…</text>
        <path d="M120 67 L158 67" stroke="var(--color-muted)" strokeWidth="1.3" />
        <path d="M262 70 C 292 70, 292 58, 318 58" fill="none" stroke="var(--color-muted)" strokeWidth="1.3" />
        <text x="10" y="140" fontSize="10.5" fill="var(--color-muted)">
          Compile time: checks Animal has speak(). Runtime: looks up speak() in Dog&apos;s table → &quot;Woof&quot;.
        </text>
      </svg>
    </Figure>
  );
}

function LruCache() {
  const nodes = ["head", "k3", "k1", "k7", "tail"];
  return (
    <Figure caption="HashMap gives O(1) lookup; the doubly linked list keeps recency. Hit → move to front, full → evict before tail">
      <svg viewBox="0 0 520 150" className="h-auto w-full" role="img" aria-label="LRU cache structure">
        <rect x="10" y="10" width="110" height="96" rx="6" fill="var(--color-panel)" stroke="var(--color-new)" />
        <text x="22" y="28" fontSize="12" fontWeight="600" fill="var(--color-new)">HashMap</text>
        {["k1 ●", "k3 ●", "k7 ●"].map((t, i) => (
          <text key={t} x="22" y={50 + i * 18} fontSize="10.5" fill="var(--color-ink)" className="font-mono">
            {t}
          </text>
        ))}
        {nodes.map((n, i) => {
          const x = 150 + i * 74;
          const sentinel = n === "head" || n === "tail";
          return (
            <g key={n}>
              <rect x={x} y="44" width="56" height="30" rx="5" fill="var(--color-panel)" stroke={sentinel ? "var(--color-muted)" : "var(--color-topic)"} strokeDasharray={sentinel ? "4 3" : undefined} />
              <text x={x + 28} y="63" textAnchor="middle" fontSize="11" fill={sentinel ? "var(--color-muted)" : "var(--color-ink)"} className="font-mono">
                {n}
              </text>
              {i < nodes.length - 1 && <text x={x + 59} y="63" fontSize="12" fill="var(--color-muted)">⇄</text>}
            </g>
          );
        })}
        <text x="224" y="100" fontSize="10.5" fill="var(--color-pulse)">most recent</text>
        <text x="372" y="100" fontSize="10.5" fill="var(--color-hard)">least recent → evict</text>
        <path d="M120 52 C 160 20, 330 20, 393 42" fill="none" stroke="var(--color-muted)" strokeDasharray="3 3" />
        <text x="10" y="138" fontSize="10.5" fill="var(--color-muted)" className="font-mono">get(k) / put(k,v): O(1) — map finds the node, list unlinks and relinks it</text>
      </svg>
    </Figure>
  );
}

function HashBuckets() {
  const buckets = [0, 1, 2, 3];
  return (
    <Figure caption="Overriding equals() without hashCode(): two equal Emp(1) keys hash to different buckets, so get() looks in the wrong one and returns null">
      <svg viewBox="0 0 520 170" className="h-auto w-full" role="img" aria-label="HashMap buckets">
        <text x="10" y="18" fontSize="11" fill="var(--color-muted)">HashMap buckets</text>
        {buckets.map((b) => (
          <g key={b}>
            <rect x="10" y={28 + b * 32} width="60" height="26" rx="4" fill="var(--color-panel)" stroke="var(--color-line)" />
            <text x="40" y={45 + b * 32} textAnchor="middle" fontSize="11" fill="var(--color-muted)" className="font-mono">
              [{b}]
            </text>
          </g>
        ))}
        <rect x="110" y="60" width="130" height="26" rx="4" fill="var(--color-panel)" stroke="var(--color-new)" />
        <text x="122" y="77" fontSize="10.5" fill="var(--color-ink)" className="font-mono">Emp(1) → &quot;A&quot;</text>
        <line x1="70" y1="73" x2="108" y2="73" stroke="var(--color-muted)" />
        <text x="260" y="77" fontSize="10.5" fill="var(--color-muted)">put(new Emp(1), &quot;A&quot;) — hash lands in [1]</text>
        <text x="110" y="141" fontSize="10.5" fill="var(--color-hard)" className="font-mono">get(new Emp(1))</text>
        <line x1="70" y1="137" x2="106" y2="137" stroke="var(--color-hard)" strokeDasharray="4 3" />
        <text x="230" y="141" fontSize="10.5" fill="var(--color-muted)">different hash → looks in [3] → null ✗</text>
      </svg>
    </Figure>
  );
}

function Race() {
  const rows = [
    ["reads count = 5", ""],
    ["", "reads count = 5"],
    ["writes 6", ""],
    ["", "writes 6  ✗ (should be 7)"],
  ];
  return (
    <Figure caption="A race condition: count++ is read → add → write. Two threads interleave and one update is lost">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 text-xs">
          <thead>
            <tr className="text-muted">
              <th className="w-10 text-left font-normal">time</th>
              <th className="text-left font-medium text-new">Thread A</th>
              <th className="text-left font-medium text-rev">Thread B</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([a, b], i) => (
              <tr key={i}>
                <td className="font-mono text-muted">t{i + 1}</td>
                <td className={a ? "rounded border border-new/50 px-2 py-1 font-mono" : ""}>{a}</td>
                <td className={b ? `rounded border px-2 py-1 font-mono ${b.includes("✗") ? "border-hard text-hard" : "border-rev/50"}` : ""}>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Figure>
  );
}

const DIAGRAMS: Record<string, () => React.ReactNode> = {
  "hash-buckets": HashBuckets,
  race: Race,
  "class-objects": () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="One class (the blueprint), many objects (the real things) — each object has its own copy of the fields"
      nodes={[
        { id: "c", x: 180, y: 6, w: 160, title: "Car", stereo: "class", lines: ["model, speed", "accelerate()"], tone: "topic" },
        { id: "a", x: 20, y: 116, w: 140, title: "car1", lines: ["model = \"Swift\""] },
        { id: "b", x: 190, y: 116, w: 140, title: "car2", lines: ["model = \"Nexon\""] },
        { id: "d", x: 360, y: 116, w: 140, title: "car3", lines: ["model = \"City\""] },
      ]}
      edges={[
        { from: "c", to: "a", kind: "flow", label: "new" },
        { from: "c", to: "b", kind: "flow", label: "new" },
        { from: "c", to: "d", kind: "flow", label: "new" },
      ]}
    />
  ),
  encapsulation: () => (
    <ClassDiagram
      width={520}
      height={150}
      caption="Outside code can only go through the public methods; the private field is locked inside"
      nodes={[
        { id: "u", x: 10, y: 40, w: 110, title: "Other code", tone: "muted" },
        { id: "b", x: 290, y: 10, w: 210, title: "BankAccount", lines: ["- balance   (private, hidden)", "+ deposit(amt)   checks amt > 0", "+ getBalance()"], tone: "topic" },
      ]}
      edges={[{ from: "u", to: "b", kind: "flow", label: "deposit(500)" }]}
    />
  ),
  "abstraction-layers": () => (
    <Steps
      caption="Abstraction: you see one simple button; everything after it is hidden behind the interface"
      steps={[
        { label: "You", note: "tap Pay", tone: "new" },
        { label: "payment.pay(500)", note: "the only thing you see", tone: "pulse" },
        { label: "UPI / card logic", note: "hidden", tone: "muted" },
        { label: "Bank APIs, OTP, retries", note: "hidden", tone: "muted" },
      ]}
    />
  ),
  polymorphism: () => (
    <ClassDiagram
      width={520}
      height={160}
      caption="One call, shape.area(), gives a different answer depending on which object is behind the reference"
      nodes={[
        { id: "s", x: 190, y: 6, w: 140, title: "Shape", stereo: "interface", lines: ["+ area()"], tone: "pulse" },
        { id: "c", x: 20, y: 106, w: 140, title: "Circle", lines: ["π × r × r"] },
        { id: "q", x: 190, y: 106, w: 140, title: "Square", lines: ["side × side"] },
        { id: "t", x: 360, y: 106, w: 140, title: "Triangle", lines: ["½ × b × h"] },
      ]}
      edges={[
        { from: "c", to: "s", kind: "realize" },
        { from: "q", to: "s", kind: "realize" },
        { from: "t", to: "s", kind: "realize" },
      ]}
    />
  ),
  immutable: () => (
    <Steps
      caption="Immutable objects never change: 'changing' one gives you a new object and the old one stays the same"
      steps={[
        { label: "Money a = 100", tone: "new" },
        { label: "a.plus(50)", note: "doesn't touch a", tone: "topic" },
        { label: "returns new Money 150", tone: "pulse" },
        { label: "a is still 100", note: "safe to share", tone: "muted" },
      ]}
    />
  ),
  exceptions: () => (
    <ClassDiagram
      width={520}
      height={200}
      caption="Java's exception family tree: checked exceptions must be handled; RuntimeException and Error are unchecked"
      nodes={[
        { id: "t", x: 200, y: 6, w: 120, title: "Throwable", tone: "muted" },
        { id: "e", x: 80, y: 76, w: 130, title: "Exception", lines: ["checked"], tone: "topic" },
        { id: "er", x: 330, y: 76, w: 130, title: "Error", lines: ["don't catch"], tone: "hard" },
        { id: "io", x: 10, y: 156, w: 120, title: "IOException", tone: "topic" },
        { id: "rt", x: 150, y: 150, w: 150, title: "RuntimeException", lines: ["unchecked"], tone: "rev" },
        { id: "oom", x: 330, y: 156, w: 150, title: "OutOfMemoryError", tone: "hard" },
      ]}
      edges={[
        { from: "e", to: "t", kind: "inherit" },
        { from: "er", to: "t", kind: "inherit" },
        { from: "io", to: "e", kind: "inherit" },
        { from: "rt", to: "e", kind: "inherit" },
        { from: "oom", to: "er", kind: "inherit" },
      ]}
    />
  ),
  srp: () => (
    <ClassDiagram
      width={520}
      height={184}
      caption="Single responsibility: split a class that changes for three different reasons into three focused classes"
      nodes={[
        { id: "big", x: 10, y: 30, w: 170, title: "Invoice ✗", lines: ["calculateTotal()", "printPdf()", "saveToDb()"], tone: "hard" },
        { id: "i", x: 300, y: 6, w: 190, title: "Invoice", lines: ["calculateTotal()"], tone: "topic" },
        { id: "p", x: 300, y: 72, w: 190, title: "InvoicePrinter", lines: ["printPdf(invoice)"] },
        { id: "r", x: 300, y: 128, w: 190, title: "InvoiceRepository", lines: ["save(invoice)"] },
      ]}
      edges={[
        { from: "big", to: "i", kind: "flow", label: "split" },
        { from: "p", to: "i", kind: "depend" },
      ]}
    />
  ),
  "di-flow": () => (
    <Steps
      caption="Dependency injection: something outside (Spring, or your main method) builds the pieces and hands them in"
      steps={[
        { label: "Container / main()", note: "creates objects", tone: "muted" },
        { label: "new MySqlRepo()", tone: "new" },
        { label: "new OrderService(repo)", note: "repo passed in", tone: "topic" },
        { label: "In tests", note: "new OrderService(fakeRepo)", tone: "pulse" },
      ]}
    />
  ),
  builder: () => (
    <Steps
      caption="Builder: set only the options you need, step by step, then build() gives one finished object"
      steps={[
        { label: "new Pizza.Builder(\"large\")", tone: "new" },
        { label: ".cheese(true)", note: "optional" },
        { label: ".topping(\"olive\")", note: "optional" },
        { label: ".build()", note: "validates", tone: "rev" },
        { label: "Pizza", note: "complete, immutable", tone: "pulse" },
      ]}
    />
  ),
  "machine-coding": () => (
    <Steps
      caption="A clean machine-coding layout: each layer only talks to the one below it"
      steps={[
        { label: "Main / Driver", note: "reads input, prints", tone: "muted" },
        { label: "Service", note: "rules & flow", tone: "topic" },
        { label: "Strategy", note: "swappable logic", tone: "pulse" },
        { label: "Model", note: "data + checks", tone: "new" },
        { label: "Repository", note: "in-memory Map", tone: "rev" },
      ]}
    />
  ),
  events: () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="Events: OrderService just announces 'order placed'; new features subscribe without touching OrderService"
      nodes={[
        { id: "o", x: 10, y: 60, w: 140, title: "OrderService", lines: ["publish(OrderPlaced)"], tone: "topic" },
        { id: "b", x: 200, y: 66, w: 110, title: "EventBus", tone: "rev" },
        { id: "e", x: 370, y: 10, w: 140, title: "EmailListener" },
        { id: "a", x: 370, y: 70, w: 140, title: "AnalyticsListener" },
        { id: "l", x: 370, y: 130, w: 140, title: "LoyaltyListener", tone: "pulse" },
      ]}
      edges={[
        { from: "o", to: "b", kind: "flow" },
        { from: "b", to: "e", kind: "flow" },
        { from: "b", to: "a", kind: "flow" },
        { from: "b", to: "l", kind: "flow", label: "new" },
      ]}
    />
  ),
  pillars: Pillars,
  "uml-arrows": UmlArrows,
  "stack-heap": StackHeap,
  dispatch: Dispatch,
  lru: LruCache,
  diamond: () => (
    <ClassDiagram
      width={420}
      height={210}
      caption="Diamond problem: if B and C both override greet(), which one does D inherit? Java forbids this for classes; interfaces with defaults must override explicitly"
      nodes={[
        { id: "a", x: 150, y: 6, w: 120, title: "A", lines: ["greet()"] },
        { id: "b", x: 20, y: 76, w: 120, title: "B", lines: ["greet() // B"], tone: "topic" },
        { id: "c", x: 280, y: 76, w: 120, title: "C", lines: ["greet() // C"], tone: "topic" },
        { id: "d", x: 150, y: 150, w: 120, title: "D", lines: ["greet() // ?"], tone: "hard" },
      ]}
      edges={[
        { from: "b", to: "a", kind: "inherit" },
        { from: "c", to: "a", kind: "inherit" },
        { from: "d", to: "b", kind: "inherit" },
        { from: "d", to: "c", kind: "inherit" },
      ]}
    />
  ),
  "inheritance-types": () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="Single (Car → Vehicle), multilevel (SportsCar → Car → Vehicle), hierarchical (Car and Bike → Vehicle); for multiple inheritance Java uses interfaces"
      nodes={[
        { id: "a", x: 200, y: 6, w: 110, title: "Vehicle" },
        { id: "b", x: 80, y: 66, w: 110, title: "Car", tone: "topic" },
        { id: "d", x: 320, y: 66, w: 110, title: "Bike", tone: "topic" },
        { id: "c", x: 80, y: 128, w: 110, title: "SportsCar", tone: "rev" },
        { id: "i", x: 320, y: 128, w: 110, title: "Electric", stereo: "interface", tone: "pulse" },
      ]}
      edges={[
        { from: "b", to: "a", kind: "inherit" },
        { from: "d", to: "a", kind: "inherit" },
        { from: "c", to: "b", kind: "inherit" },
        { from: "c", to: "i", kind: "realize" },
      ]}
    />
  ),
  "abstract-vs-interface": () => (
    <ClassDiagram
      width={520}
      height={190}
      caption="An abstract class shares state and code with its subclasses; an interface adds a capability to unrelated classes"
      nodes={[
        { id: "abs", x: 10, y: 8, w: 200, title: "Employee", stereo: "abstract", lines: ["# name, salary", "+ payslip()", "+ bonus() «abstract»"], tone: "rev" },
        { id: "eng", x: 10, y: 136, w: 95, title: "Engineer", tone: "topic" },
        { id: "mgr", x: 115, y: 136, w: 95, title: "Manager", tone: "topic" },
        { id: "itf", x: 310, y: 8, w: 200, title: "Payable", stereo: "interface", lines: ["+ amountDue()", "+ default currency()"], tone: "pulse" },
        { id: "inv", x: 300, y: 136, w: 95, title: "Invoice", tone: "topic" },
        { id: "mgr2", x: 415, y: 136, w: 95, title: "Contractor", tone: "topic" },
      ]}
      edges={[
        { from: "eng", to: "abs", kind: "inherit" },
        { from: "mgr", to: "abs", kind: "inherit" },
        { from: "inv", to: "itf", kind: "realize" },
        { from: "mgr2", to: "itf", kind: "realize" },
      ]}
    />
  ),
  "has-a": () => (
    <ClassDiagram
      width={520}
      height={150}
      caption="Composition (filled ◆): a Room can't exist without its House. Aggregation (hollow ◇): a Player outlives the Team"
      nodes={[
        { id: "h", x: 10, y: 10, w: 110, title: "House", tone: "topic" },
        { id: "r", x: 10, y: 100, w: 110, title: "Room" },
        { id: "t", x: 200, y: 10, w: 110, title: "Team", tone: "topic" },
        { id: "p", x: 200, y: 100, w: 110, title: "Player" },
        { id: "o", x: 400, y: 10, w: 110, title: "Order", tone: "topic" },
        { id: "pr", x: 400, y: 100, w: 110, title: "Printer" },
      ]}
      edges={[
        { from: "h", to: "r", kind: "compose", label: "1..*" },
        { from: "t", to: "p", kind: "aggregate", label: "0..*" },
        { from: "o", to: "pr", kind: "depend", label: "uses" },
      ]}
    />
  ),
  "composition-over-inheritance": () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="Instead of FlyingSwimmingDuck subclasses, a Duck holds behaviours it can swap at runtime"
      nodes={[
        { id: "duck", x: 10, y: 50, w: 150, title: "Duck", lines: ["- fly: FlyBehavior", "+ setFly(f)", "+ performFly()"], tone: "topic" },
        { id: "fb", x: 270, y: 10, w: 140, title: "FlyBehavior", stereo: "interface", tone: "pulse" },
        { id: "w", x: 220, y: 116, w: 120, title: "FlyWithWings" },
        { id: "n", x: 360, y: 116, w: 120, title: "CantFly" },
      ]}
      edges={[
        { from: "duck", to: "fb", kind: "assoc", label: "has-a" },
        { from: "w", to: "fb", kind: "realize" },
        { from: "n", to: "fb", kind: "realize" },
      ]}
    />
  ),
  dip: () => (
    <ClassDiagram
      width={520}
      height={180}
      caption="Left: high-level code depends on a concrete DB. Right: both depend on an abstraction, so the DB can be swapped or mocked"
      nodes={[
        { id: "s1", x: 20, y: 20, w: 150, title: "OrderService", tone: "topic" },
        { id: "m1", x: 20, y: 120, w: 150, title: "MySqlOrderRepo", tone: "hard" },
        { id: "s2", x: 300, y: 10, w: 190, title: "OrderService", tone: "topic" },
        { id: "r2", x: 300, y: 72, w: 190, title: "OrderRepository", stereo: "interface", tone: "pulse" },
        { id: "m2", x: 270, y: 140, w: 120, title: "MySqlRepo" },
        { id: "f2", x: 400, y: 140, w: 110, title: "FakeRepo" },
      ]}
      edges={[
        { from: "s1", to: "m1", kind: "assoc", label: "new MySql…()" },
        { from: "s2", to: "r2", kind: "assoc" },
        { from: "m2", to: "r2", kind: "realize" },
        { from: "f2", to: "r2", kind: "realize" },
      ]}
    />
  ),
  ocp: () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="Open/closed: adding UPI means a new class, not another case in a switch inside Checkout"
      nodes={[
        { id: "c", x: 10, y: 50, w: 140, title: "Checkout", lines: ["+ pay(method, amt)"], tone: "topic" },
        { id: "p", x: 250, y: 10, w: 160, title: "PaymentMethod", stereo: "interface", lines: ["+ pay(amt)"], tone: "pulse" },
        { id: "a", x: 190, y: 124, w: 90, title: "Card" },
        { id: "b", x: 290, y: 124, w: 90, title: "Wallet" },
        { id: "u", x: 390, y: 124, w: 90, title: "UPI (new)", tone: "rev" },
      ]}
      edges={[
        { from: "c", to: "p", kind: "depend" },
        { from: "a", to: "p", kind: "realize" },
        { from: "b", to: "p", kind: "realize" },
        { from: "u", to: "p", kind: "realize" },
      ]}
    />
  ),
  lsp: () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="Square extends Rectangle breaks LSP: setWidth(5) on a 'Rectangle' also changes its height. Model both as Shapes instead"
      nodes={[
        { id: "r", x: 20, y: 10, w: 160, title: "Rectangle", lines: ["+ setWidth(w)", "+ setHeight(h)"] },
        { id: "s", x: 20, y: 116, w: 160, title: "Square ✗", lines: ["sets both sides"], tone: "hard" },
        { id: "sh", x: 320, y: 10, w: 160, title: "Shape", stereo: "interface", lines: ["+ area()"], tone: "pulse" },
        { id: "r2", x: 280, y: 124, w: 100, title: "Rectangle" },
        { id: "s2", x: 400, y: 124, w: 100, title: "Square" },
      ]}
      edges={[
        { from: "s", to: "r", kind: "inherit" },
        { from: "r2", to: "sh", kind: "realize" },
        { from: "s2", to: "sh", kind: "realize" },
      ]}
    />
  ),
  singleton: () => (
    <ClassDiagram
      width={420}
      height={120}
      caption="Singleton: private constructor + one static instance, usually created lazily and thread-safely"
      nodes={[
        { id: "s", x: 100, y: 10, w: 220, title: "ConfigManager", lines: ["- static instance: ConfigManager", "- ConfigManager()", "+ static getInstance()"], tone: "topic" },
      ]}
      edges={[]}
    />
  ),
  factory: () => (
    <ClassDiagram
      width={520}
      height={180}
      caption="Factory: callers ask for a Notification by type and never call new on concrete classes"
      nodes={[
        { id: "c", x: 10, y: 20, w: 120, title: "Client", tone: "muted" },
        { id: "f", x: 10, y: 110, w: 170, title: "NotificationFactory", lines: ["+ create(type)"], tone: "topic" },
        { id: "n", x: 300, y: 10, w: 160, title: "Notification", stereo: "interface", lines: ["+ send(msg)"], tone: "pulse" },
        { id: "e", x: 250, y: 130, w: 80, title: "Email" },
        { id: "s", x: 340, y: 130, w: 80, title: "SMS" },
        { id: "p", x: 430, y: 130, w: 80, title: "Push" },
      ]}
      edges={[
        { from: "c", to: "f", kind: "depend" },
        { from: "f", to: "n", kind: "depend", label: "returns" },
        { from: "e", to: "n", kind: "realize" },
        { from: "s", to: "n", kind: "realize" },
        { from: "p", to: "n", kind: "realize" },
      ]}
    />
  ),
  decorator: () => (
    <ClassDiagram
      width={520}
      height={190}
      caption="Decorator: each wrapper is a Coffee and holds a Coffee, so toppings stack — new Milk(new Sugar(new Espresso()))"
      nodes={[
        { id: "c", x: 180, y: 6, w: 160, title: "Coffee", stereo: "interface", lines: ["+ cost()"], tone: "pulse" },
        { id: "e", x: 20, y: 120, w: 120, title: "Espresso" },
        { id: "d", x: 200, y: 110, w: 150, title: "ToppingDecorator", stereo: "abstract", lines: ["- inner: Coffee"], tone: "rev" },
        { id: "m", x: 400, y: 100, w: 100, title: "Milk", tone: "topic" },
        { id: "s", x: 400, y: 150, w: 100, title: "Sugar", tone: "topic" },
      ]}
      edges={[
        { from: "e", to: "c", kind: "realize" },
        { from: "d", to: "c", kind: "realize", label: "is-a + wraps one" },
        { from: "m", to: "d", kind: "inherit" },
        { from: "s", to: "d", kind: "inherit" },
      ]}
    />
  ),
  strategy: () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="Strategy: the context holds an interface and the algorithm is chosen (or swapped) at runtime"
      nodes={[
        { id: "ctx", x: 10, y: 40, w: 160, title: "Navigator", lines: ["- route: RouteStrategy", "+ setRoute(r)", "+ go(a, b)"], tone: "topic" },
        { id: "s", x: 280, y: 10, w: 180, title: "RouteStrategy", stereo: "interface", lines: ["+ build(a, b)"], tone: "pulse" },
        { id: "a", x: 220, y: 126, w: 90, title: "Car" },
        { id: "b", x: 320, y: 126, w: 90, title: "Walking" },
        { id: "c", x: 420, y: 126, w: 90, title: "Transit" },
      ]}
      edges={[
        { from: "ctx", to: "s", kind: "assoc" },
        { from: "a", to: "s", kind: "realize" },
        { from: "b", to: "s", kind: "realize" },
        { from: "c", to: "s", kind: "realize" },
      ]}
    />
  ),
  observer: () => (
    <ClassDiagram
      width={520}
      height={180}
      caption="Observer: the subject keeps a list of subscribers and notifies each when its state changes — it never knows their concrete types"
      nodes={[
        { id: "s", x: 10, y: 40, w: 170, title: "StockTicker", lines: ["- observers: List", "+ subscribe(o)", "+ setPrice(p) → notify"], tone: "topic" },
        { id: "o", x: 300, y: 10, w: 160, title: "Observer", stereo: "interface", lines: ["+ update(price)"], tone: "pulse" },
        { id: "a", x: 240, y: 130, w: 120, title: "MobileAlert" },
        { id: "b", x: 380, y: 130, w: 120, title: "Dashboard" },
      ]}
      edges={[
        { from: "s", to: "o", kind: "aggregate", label: "0..*" },
        { from: "a", to: "o", kind: "realize" },
        { from: "b", to: "o", kind: "realize" },
      ]}
    />
  ),
  "parking-lot": () => (
    <ClassDiagram
      width={540}
      height={250}
      caption="Parking lot: composition down the physical hierarchy; strategies for allocation and pricing keep it open for change"
      nodes={[
        { id: "lot", x: 10, y: 10, w: 150, title: "ParkingLot", lines: ["+ park(vehicle): Ticket", "+ unpark(ticket): Bill"], tone: "topic" },
        { id: "floor", x: 10, y: 110, w: 150, title: "Floor", lines: ["- spots: List<Spot>"] },
        { id: "spot", x: 10, y: 196, w: 150, title: "Spot", lines: ["type, isFree"] },
        { id: "veh", x: 210, y: 196, w: 130, title: "Vehicle", stereo: "abstract", tone: "rev" },
        { id: "tkt", x: 210, y: 100, w: 130, title: "Ticket", lines: ["spot, vehicle, inTime"] },
        { id: "alloc", x: 380, y: 10, w: 150, title: "SpotAllocation", stereo: "interface", tone: "pulse" },
        { id: "price", x: 380, y: 100, w: 150, title: "PricingStrategy", stereo: "interface", tone: "pulse" },
        { id: "car", x: 420, y: 168, w: 80, title: "Car" },
        { id: "bike", x: 420, y: 214, w: 80, title: "Bike" },
      ]}
      edges={[
        { from: "lot", to: "floor", kind: "compose", label: "1..*" },
        { from: "floor", to: "spot", kind: "compose", label: "1..*" },
        { from: "lot", to: "alloc", kind: "assoc" },
        { from: "lot", to: "price", kind: "assoc" },
        { from: "tkt", to: "spot", kind: "assoc" },
        { from: "tkt", to: "veh", kind: "assoc" },
        { from: "car", to: "veh", kind: "inherit" },
        { from: "bike", to: "veh", kind: "inherit" },
      ]}
    />
  ),
  splitwise: () => (
    <ClassDiagram
      width={520}
      height={200}
      caption="Splitwise: an Expense delegates how it's divided to a SplitStrategy; balances are a map of who-owes-whom"
      nodes={[
        { id: "g", x: 10, y: 10, w: 140, title: "Group", lines: ["members, expenses"], tone: "topic" },
        { id: "e", x: 200, y: 10, w: 150, title: "Expense", lines: ["paidBy, amount", "splits: List<Split>"], tone: "topic" },
        { id: "u", x: 10, y: 130, w: 140, title: "User" },
        { id: "s", x: 390, y: 10, w: 120, title: "SplitStrategy", stereo: "interface", tone: "pulse" },
        { id: "eq", x: 296, y: 140, w: 70, title: "Equal" },
        { id: "ex", x: 372, y: 140, w: 66, title: "Exact" },
        { id: "pc", x: 444, y: 140, w: 72, title: "Percent" },
        { id: "b", x: 170, y: 130, w: 110, title: "BalanceSheet", lines: ["Map<User,Map>"], tone: "rev" },
      ]}
      edges={[
        { from: "g", to: "e", kind: "compose", label: "0..*" },
        { from: "g", to: "u", kind: "aggregate", label: "2..*" },
        { from: "e", to: "s", kind: "assoc" },
        { from: "eq", to: "s", kind: "realize" },
        { from: "ex", to: "s", kind: "realize" },
        { from: "pc", to: "s", kind: "realize" },
        { from: "e", to: "b", kind: "depend", label: "updates" },
      ]}
    />
  ),
  "lld-steps": () => (
    <Steps
      caption="A 45–60 minute LLD round: spend the first 10 minutes before drawing a single class"
      steps={[
        { label: "Requirements", note: "5–8 min", tone: "new" },
        { label: "Entities", note: "nouns → classes" },
        { label: "Relationships", note: "is-a / has-a" },
        { label: "Class diagram", note: "+ patterns", tone: "rev" },
        { label: "Key flows", note: "methods, sequence" },
        { label: "Code", note: "core classes", tone: "pulse" },
        { label: "Extend", note: "edge cases, concurrency", tone: "hard" },
      ]}
    />
  ),
  "elevator-states": () => (
    <Steps
      caption="Elevator as a State machine: each state class decides how to handle a request or arrival"
      loop="DoorsOpen → (timeout) → Idle or Moving to the next stop; Maintenance can be entered from any state"
      steps={[
        { label: "Idle", tone: "muted" },
        { label: "MovingUp", note: "serve stops ↑", tone: "new" },
        { label: "DoorsOpen", note: "at a floor", tone: "pulse" },
        { label: "MovingDown", note: "serve stops ↓", tone: "rev" },
        { label: "Idle", tone: "muted" },
      ]}
    />
  ),
  "seat-booking": () => (
    <Steps
      caption="Seat states in a booking system: the lock with a TTL is what prevents double booking"
      loop="Locked → (TTL expires or payment fails) → Available"
      steps={[
        { label: "Available", tone: "pulse" },
        { label: "Locked", note: "user X, 10 min TTL", tone: "topic" },
        { label: "Payment", note: "pending", tone: "new" },
        { label: "Booked", note: "final", tone: "rev" },
      ]}
    />
  ),
  "object-lifecycle": () => (
    <Steps
      caption="An object's life in Java: you never free memory yourself — the GC reclaims objects nothing points to"
      steps={[
        { label: "Class loaded", note: "static blocks run", tone: "muted" },
        { label: "new", note: "memory on heap", tone: "new" },
        { label: "Constructor", note: "super() first", tone: "topic" },
        { label: "In use", note: "referenced", tone: "pulse" },
        { label: "Unreachable", note: "no references", tone: "hard" },
        { label: "Garbage collected", tone: "muted" },
      ]}
    />
  ),
};

export function QAVisual({ name }: { name: string }) {
  const Diagram = DIAGRAMS[name] ?? DBMS_DIAGRAMS[name] ?? SD_DIAGRAMS[name];
  return Diagram ? <Diagram /> : null;
}
