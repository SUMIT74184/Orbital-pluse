import type { InterviewQA } from "./index";

// Interview Q&A for the OOP & LLD track, keyed by topic title (see src/data/topics.ts).
// Covers the questions most often listed by GeeksforGeeks and TpointTech (javatpoint); examples are in Java.
export const OOP_QA: Record<string, InterviewQA[]> = {
  "What OOP is & why it exists": [
    {
      q: "What is Object-Oriented Programming?",
      short: "Writing code as objects that hold their own data and actions, built on encapsulation, abstraction, inheritance and polymorphism.",
      visual: "pillars",
      a: `OOP is a programming paradigm that organises software around objects — units that bundle data (state, fields) with the code that operates on it (behaviour, methods) — rather than around functions and logic alone.

      It rests on four pillars: encapsulation, abstraction, inheritance and polymorphism. Popular OO languages: Java, C++, C#, Python, Kotlin, Ruby.`,
    },
    {
      q: "Procedural vs object-oriented programming?",
      short: "Procedural = functions working on shared data; OOP = objects that keep their data private and expose actions.",
      a: `- Unit of design: procedural splits a program into functions; OOP splits it into objects.
      - Data: procedural passes data around to functions (often global); OOP keeps data private inside the object that owns it.
      - Approach: procedural is top-down; OOP is bottom-up (build objects, then compose them).
      - Reuse & extension: OOP adds inheritance, polymorphism and interfaces.
      - Examples: C, Pascal vs Java, C++, C#.

      Procedural is simpler for small scripts; OOP pays off as a codebase and team grow.`,
    },
    {
      q: "What are the advantages and limitations of OOP?",
      short: "Pros: reusable, modular, secure, easy to extend. Cons: more upfront design, some overhead, deep hierarchies get rigid.",
      a: `Advantages: models real-world entities naturally, modular and reusable code, easier maintenance (change is localised behind interfaces), data security through encapsulation, and extensibility through inheritance and polymorphism.

      Limitations: more up-front design, larger and sometimes slower programs (object overhead, indirection), deep hierarchies become rigid, and some problems (data pipelines, maths-heavy code) fit functional or procedural styles better.`,
    },
    {
      q: "Is Java a pure object-oriented language?",
      short: "No — it has primitive types (int, char…) and static members that aren't objects.",
      a: `No. A pure OO language (Smalltalk, Ruby) treats everything as an object. Java has primitive types (int, char, boolean…) that aren't objects, and static members that belong to a class rather than an object. Wrapper classes (Integer, Character) and autoboxing narrow the gap, but Java is usually called "mostly" object-oriented. C++ is a hybrid: you can write it entirely procedurally.`,
    },
  ],

  "Classes, objects & memory": [
    {
      q: "What is the difference between a class and an object?",
      short: "Class = blueprint; object = a real instance made from it with new, living on the heap.",
      a: `A class is a blueprint/template that defines fields and methods; it is a logical entity and declaring it uses no heap memory for instances. An object is an instance of a class created at runtime with its own copy of instance fields, occupying heap memory.

      Analogy: the class is the architect's plan for a house; each built house is an object. One class, many objects.`,
    },
    {
      q: "Where are objects and references stored in Java?",
      short: "Objects on the heap; local variables and references on the thread's stack.",
      visual: "stack-heap",
      a: `Objects (and their instance fields) live on the heap, which is shared by all threads and managed by the garbage collector. Local variables — primitives and references — live on the calling thread's stack frame and disappear when the method returns.

      So in Car a = new Car(); the variable a (a reference) is on the stack and the Car object is on the heap. Assigning Car b = a; copies the reference, not the object: both point to the same Car.`,
    },
    {
      q: "In how many ways can you create an object in Java?",
      short: "new, reflection, clone(), deserialization — and factory methods that use these.",
      a: `- The new keyword: new Car() — the usual way.
      - Reflection: Car.class.getDeclaredConstructor().newInstance().
      - clone(): copies an existing object (class must implement Cloneable).
      - Deserialization: ObjectInputStream.readObject() rebuilds an object without calling its constructor.
      - Factory / builder methods that wrap one of the above, e.g. List.of(), LocalDate.now().`,
    },
    {
      q: "Instance members vs static (class) members?",
      short: "Instance = one copy per object; static = one copy shared by the whole class.",
      a: `Instance fields belong to each object — every Car has its own speed. Static fields belong to the class and are shared by all objects — a static counter of cars created.

      Instance methods can use both instance and static members; static methods can only use static members directly because there is no this. Static members are loaded when the class is loaded, before any object exists.`,
    },
  ],

  "Constructors & object lifecycle": [
    {
      q: "What is a constructor? How is it different from a method?",
      short: "Setup code that runs once on new; same name as the class, no return type, not inherited.",
      visual: "object-lifecycle",
      a: `A constructor is a special block that initialises a new object. Differences from a method:
      - Same name as the class and no return type (not even void).
      - Called automatically by new, exactly once per object.
      - Not inherited, so it can't be overridden (but can be overloaded).
      - If you write none, the compiler adds a no-arg default constructor; if you write any, it doesn't.`,
    },
    {
      q: "What types of constructors exist?",
      short: "Default (no args), parameterised, and copy (which you write yourself in Java).",
      a: `- Default (no-arg): sets defaults; compiler-generated if none is written.
      - Parameterised: takes values to initialise fields.
      - Copy constructor: builds a new object from another of the same type. Java doesn't generate one (C++ does) — you write it yourself:

      ~~~
      class Point {
          final int x, y;
          Point(int x, int y) { this.x = x; this.y = y; }
          Point(Point other) { this(other.x, other.y); } // copy constructor
      }
      ~~~`,
    },
    {
      q: "What is constructor chaining?",
      short: "One constructor calling another with this(...) or the parent's with super(...), as the first line.",
      a: `Calling one constructor from another to avoid duplicated initialisation. this(...) calls another constructor of the same class; super(...) calls the parent's constructor. Either must be the first statement, so you can't use both in the same constructor.

      If you don't write super(...), the compiler inserts super() — which is why constructors run from the top of the hierarchy down (Object → Vehicle → Car).`,
    },
    {
      q: "Can a constructor be private? Why would you do that?",
      short: "Yes — to stop outside new: singletons, utility classes, static factories.",
      a: `Yes. A private constructor stops other classes from calling new. Uses:
      - Singleton: only the class itself creates the one instance.
      - Utility classes with only static methods (java.lang.Math).
      - Static factory methods (Optional.of) or a Builder that control creation.`,
    },
    {
      q: "Does Java have destructors?",
      short: "No. The garbage collector frees memory; use try-with-resources to close files and connections.",
      a: `No. Memory is reclaimed by the garbage collector once an object is unreachable; you can't control when. finalize() existed but is deprecated (unpredictable, slow). For releasing non-memory resources (files, sockets, DB connections), implement AutoCloseable and use try-with-resources. C++ has deterministic destructors, which enable RAII.`,
    },
  ],

  "Access modifiers, static & final": [
    {
      q: "Explain the access modifiers in Java.",
      short: "private (class) < default (package) < protected (package + subclasses) < public (everyone).",
      a: `From most to least restrictive:
      - private: same class only.
      - default (no keyword, package-private): same package.
      - protected: same package plus subclasses in other packages.
      - public: everywhere.

      Top-level classes can only be public or default. Rule of thumb: make fields private and widen access only when needed.`,
    },
    {
      q: "What does static mean on a variable, method, block and nested class?",
      short: "It belongs to the class, not to any object — shared, and usable without creating an object.",
      a: `- Static variable: one copy shared by every object of the class.
      - Static method: called on the class (Math.max); can't use this or instance members directly.
      - Static block: runs once when the class is loaded — for initialising static data.
      - Static nested class: doesn't hold a reference to an outer instance (unlike an inner class), so it can be created without one.`,
    },
    {
      q: "What does final mean on a variable, method and class?",
      short: "Variable can't be reassigned, method can't be overridden, class can't be extended.",
      a: `- final variable: assigned once. For a reference, the reference can't change but the object it points to can still be mutated.
      - final method: can't be overridden.
      - final class: can't be extended (String, Integer).

      final is not the same as immutable: a final List can still have items added.`,
    },
    {
      q: "this vs super?",
      short: "this = the current object; super = the parent part of the current object.",
      a: `this refers to the current object: disambiguates fields from parameters (this.name = name), passes the current object, or calls another constructor with this(...). super refers to the parent part of the object: calls an overridden parent method (super.toString()), reads a hidden parent field, or calls the parent constructor with super(...). Neither can be used in a static context.`,
    },
  ],

  Encapsulation: [
    {
      q: "What is encapsulation?",
      short: "Keep data private and let others change it only through methods that enforce the rules.",
      a: `Encapsulation is bundling data and the methods that operate on it into one unit (a class) and restricting direct access to the data. Fields are private; the outside world interacts through public methods that can validate input and keep the object's invariants true.

      ~~~
      class BankAccount {
          private double balance;
          public void deposit(double amt) {
              if (amt <= 0) throw new IllegalArgumentException("amount must be positive");
              balance += amt;
          }
          public double getBalance() { return balance; }
      }
      ~~~

      Nobody can set balance to -500 directly.`,
    },
    {
      q: "Encapsulation vs abstraction?",
      short: "Encapsulation hides data (who can touch it); abstraction hides complexity (how it works).",
      a: `- Abstraction is about design: what an object does — exposing only essential behaviour (an interface, an abstract method).
      - Encapsulation is about implementation: how the data is protected — hiding fields behind access modifiers.

      Abstraction hides complexity; encapsulation hides data. A car's pedals are abstraction; the sealed engine bay is encapsulation.`,
    },
    {
      q: "Is a class with private fields and public getters/setters for all of them encapsulated?",
      short: "Barely — if anyone can set any field, nothing is protected. Expose behaviour, not raw setters.",
      a: `Only technically. If every field has a plain setter, callers can still put the object into any state — the class is just a data bag (an "anaemic" model). Real encapsulation exposes behaviour, not fields: account.withdraw(100) that checks the balance, rather than setBalance(getBalance() - 100). This is the "tell, don't ask" principle and interviewers at mid/senior level like hearing it.`,
    },
    {
      q: "What are the benefits of encapsulation?",
      short: "Valid data always, freedom to change internals, easier testing, loose coupling.",
      a: `Data integrity (validation in one place), flexibility (change the internal representation without touching callers), easier testing and debugging, read-only or write-only properties, and loose coupling between classes.`,
    },
  ],

  "Abstraction: abstract classes & interfaces": [
    {
      q: "What is abstraction and how is it achieved in Java?",
      short: "Show what, hide how — using interfaces and abstract classes.",
      a: `Abstraction means showing only essential features and hiding implementation details. You call list.sort() without knowing which algorithm runs.

      In Java it's achieved with abstract classes (0–100% abstraction: can mix abstract and concrete methods) and interfaces (a pure contract, though Java 8+ allows default methods). JDBC is a classic example: your code uses Connection and Statement interfaces; each database vendor supplies the implementation.`,
    },
    {
      q: "What is an abstract class? Can it have a constructor?",
      short: "A class you can't instantiate that may have unfinished methods — and yes, it can have a constructor.",
      a: `A class declared abstract that can't be instantiated. It may have abstract methods (no body) that subclasses must implement, plus normal fields, concrete methods and constructors.

      Yes, it can have a constructor — it runs when a subclass object is created (via super()) to initialise the shared state. A class with even one abstract method must be declared abstract, but an abstract class needn't have any abstract method.`,
    },
    {
      q: "What is an interface?",
      short: "A contract of methods a class promises to implement; a class can implement many.",
      a: `A contract listing what a class can do. Methods are implicitly public abstract; fields are implicitly public static final constants. A class can implement many interfaces, which is how Java supports multiple inheritance of type.

      ~~~
      interface Payment { void pay(double amount); }
      class UpiPayment implements Payment {
          public void pay(double amount) { /* call UPI API */ }
      }
      ~~~

      Since Java 8 interfaces can have default and static methods; since Java 9, private methods.`,
    },
  ],

  "Inheritance & its types": [
    {
      q: "What is inheritance? What are its types?",
      short: "A child class reuses a parent's code (IS-A): single, multilevel, hierarchical; multiple only via interfaces.",
      visual: "inheritance-types",
      a: `Inheritance lets a class (child/subclass) acquire the fields and methods of another (parent/superclass), modelling an IS-A relationship and enabling reuse and runtime polymorphism.

      - Single: B extends A.
      - Multilevel: C extends B extends A.
      - Hierarchical: B and D both extend A.
      - Multiple: C extends A and B — not allowed for classes in Java, allowed through interfaces.
      - Hybrid: a mix of the above (in Java, only via interfaces).`,
    },
    {
      q: "Why doesn't Java support multiple inheritance of classes? (Diamond problem)",
      short: "Two parents with the same method make it ambiguous which one the child gets.",
      visual: "diamond",
      a: `If B and C both extend A and override the same method, and D extends both B and C, it's ambiguous which version D inherits. C++ resolves this with virtual inheritance and explicit scoping; Java avoids it by allowing only one superclass.

      With interfaces, if two default methods clash, the compiler forces the class to override and pick explicitly, e.g. B.super.greet().`,
    },
    {
      q: "What is not inherited by a subclass?",
      short: "Constructors, access to private members, and static methods (they're hidden, not overridden).",
      a: `- Constructors (but the parent's constructor is called via super()).
      - private members are not accessible (they exist in the object but the child can't reach them directly).
      - static methods aren't overridden — a same-signature static method in the child hides the parent's.`,
    },
    {
      q: "In what order do constructors and initialisers run when creating a subclass object?",
      short: "Parent first, then child: statics on class load, then parent constructor, then child constructor.",
      a: `Once per class load: parent static blocks, then child static blocks. Then per object: parent instance initialisers and constructor, then child instance initialisers and constructor. The parent part of the object is always fully built before the child's constructor body runs.

      Pitfall: calling an overridable method from a parent constructor runs the child's version before the child's fields are initialised.`,
    },
  ],

  "Polymorphism: overloading vs overriding": [
    {
      q: "What is polymorphism? What are its types?",
      short: "One name, many forms: overloading (compile time) and overriding (runtime).",
      a: `Polymorphism ("many forms") lets one interface represent different underlying forms, so the same call behaves differently depending on the object.

      - Compile-time (static): method overloading (and operator overloading in C++). Resolved by the compiler from the argument types.
      - Runtime (dynamic): method overriding. Resolved by the JVM from the actual object type.

      ~~~
      Shape s = new Circle(2);
      s.area();   // Circle's area(), chosen at runtime
      ~~~`,
    },
    {
      q: "Method overloading vs method overriding?",
      short: "Overloading: same name, different parameters, compile time. Overriding: same signature in a child, runtime.",
      a: `- Where: overloading is in the same class (or inherited); overriding needs a parent and child.
      - Signature: overloading needs a different parameter list; overriding must have the same signature.
      - Return type: irrelevant for overloading (can't overload on return type alone); overriding must return the same type or a subtype (covariant).
      - Binding: overloading is compile-time; overriding is runtime.
      - Access: an override can't reduce visibility (protected → private is illegal) and can't throw broader checked exceptions.
      - static/private/final methods can be overloaded but not overridden.`,
    },
    {
      q: "Can you overload a method by changing only the return type?",
      short: "No — the parameter list must differ.",
      a: `No. A call like calc(5) wouldn't tell the compiler which version to pick, since the return value might be ignored. Overloads must differ in number, type or order of parameters.`,
    },
    {
      q: "What are upcasting and downcasting?",
      short: "Upcasting: child as parent type (safe). Downcasting: back to child (needs a cast, can fail).",
      a: `Upcasting: treating a child object as its parent type — Animal a = new Dog(); — implicit and always safe. It's what makes polymorphism work.

      Downcasting: converting back — Dog d = (Dog) a; — explicit and can throw ClassCastException if the object isn't really a Dog. Check first with instanceof (Java 16+: if (a instanceof Dog d) { ... }). Frequent downcasting is a design smell: the behaviour probably belongs in an overridden method.`,
    },
    {
      q: "What does the @Override annotation do?",
      short: "Makes the compiler check you're really overriding a parent method.",
      a: `It tells the compiler you intend to override a parent method; compilation fails if no matching method exists. It catches typos like equals(Car c) instead of equals(Object o), which silently creates an overload instead of an override.`,
    },
  ],

  "Dynamic dispatch & binding": [
    {
      q: "Static binding vs dynamic binding?",
      short: "Static: compiler decides (static/private/final, overloads). Dynamic: JVM decides from the real object (overrides).",
      a: `Static (early) binding: the compiler decides which method runs — for static, private and final methods, overloads, and field access. Dynamic (late) binding: the JVM decides at runtime from the actual object type — for overridden instance methods.

      Fields are not polymorphic: if parent and child both declare name, a Parent-typed reference reads the parent's field.`,
    },
    {
      q: "How does runtime polymorphism work under the hood?",
      short: "Each class has a method table (vtable); the call is looked up in the actual object's table.",
      visual: "dispatch",
      a: `Each class has a method table (vtable): an array of pointers to its method implementations, with overridden entries replaced by the subclass's version. Every object holds a pointer to its class. A virtual call loads the object's class, indexes the method's slot and jumps there — so the variable's declared type only matters at compile time.

      In C++ only methods marked virtual go through the vtable; in Java every non-static, non-private, non-final method is virtual by default. The JIT often inlines monomorphic calls, so the cost is usually negligible.`,
    },
    {
      q: "Can static or private methods be overridden?",
      short: "No — static ones are hidden, private ones aren't visible to the child.",
      a: `No.
      - private methods aren't visible to the subclass, so a same-named method in the child is a brand-new method.
      - static methods belong to the class; a same-signature static method in the child hides the parent's (method hiding). Which one runs depends on the reference type, not the object.

      ~~~
      Parent p = new Child();
      p.staticHello();   // Parent's version — no dynamic dispatch
      ~~~`,
    },
    {
      q: "What is a covariant return type?",
      short: "An override may return a more specific type than the parent method.",
      a: `An overriding method may return a subtype of the parent method's return type. If Animal has Animal reproduce(), Dog may override it as Dog reproduce(). Callers holding a Dog get a Dog without casting. Common with clone() and builder-style methods.`,
    },
  ],

  "Abstract class vs interface": [
    {
      q: "What is the difference between an abstract class and an interface?",
      short: "Abstract class: shared state and code, one parent. Interface: a capability, many allowed, no instance state.",
      visual: "abstract-vs-interface",
      a: `- Methods: abstract class has abstract and concrete methods; interface has abstract, default, static and private methods.
      - State: abstract class can have instance fields of any kind; interface fields are public static final constants only.
      - Constructors: abstract class yes; interface no.
      - Inheritance: a class extends one abstract class but implements many interfaces.
      - Access: abstract class members can be private/protected; interface methods are public (except private helpers).
      - Relationship: abstract class says "is a kind of" (shared identity); interface says "can do" (a capability — Comparable, Runnable).`,
    },
    {
      q: "When would you choose one over the other?",
      short: "Abstract class for related classes sharing code; interface for capabilities and dependencies you want to swap or mock.",
      a: `Choose an abstract class when related classes share state and code (an Employee base with name, salary and a common payslip() using a template method), and you control the hierarchy.

      Choose an interface when unrelated classes need the same capability, you want multiple inheritance of type, or you're defining an API others will implement. Default to interfaces for dependencies (easy to mock), and optionally add an abstract skeletal class beside it — like List and AbstractList in the JDK.`,
    },
    {
      q: "With default methods in Java 8, is there any difference left?",
      short: "Yes — interfaces still have no instance fields or constructors, and methods are public.",
      a: `Yes. Interfaces still can't hold instance state or constructors, and all their methods are public. Default methods exist mainly so interfaces can evolve without breaking implementers (e.g. adding forEach to Iterable), not to replace abstract classes. If you need fields or protected hooks, use an abstract class.`,
    },
    {
      q: "Senior: how do these choices affect API evolution?",
      short: "New abstract interface methods break implementers; defaults don't. Keep public interfaces small and stable.",
      a: `Adding an abstract method to a published interface breaks every implementation; a default method doesn't, but it can still clash with a method an implementer already had. Abstract classes let you add concrete methods freely but lock clients into one inheritance chain. For public libraries, keep interfaces small and stable, give new behaviour defaults, and keep implementation in package-private or skeletal classes so you can change it.`,
    },
  ],

  "Object contracts: equals, hashCode & toString": [
    {
      q: "What is the difference between == and equals()?",
      short: "== checks same object; equals() checks same meaning.",
      a: `== compares references for objects (are these the same object?) and values for primitives. equals() compares logical content as defined by the class; Object's default equals() is just ==. String, Integer and records override it.

      ~~~
      String a = new String("hi"), b = new String("hi");
      a == b;        // false — two objects
      a.equals(b);   // true  — same characters
      ~~~`,
    },
    {
      q: "What is the equals/hashCode contract and what happens if you break it?",
      short: "Equal objects must have equal hash codes, or HashMap/HashSet lookups fail.",
      a: `If two objects are equal by equals(), they must return the same hashCode(). (Unequal objects may share a hash — that's a collision.) equals must also be reflexive, symmetric, transitive, consistent, and x.equals(null) must be false.

      If you override equals but not hashCode, two equal keys land in different HashMap buckets: map.put(new Emp(1), "A"); map.get(new Emp(1)) returns null, and a HashSet will hold "duplicates". Always override both, using the same fields.`,
    },
    {
      q: "Comparable vs Comparator?",
      short: "Comparable = one natural order inside the class; Comparator = any number of orders outside it.",
      a: `Comparable defines a class's natural ordering via compareTo inside the class itself (String, Integer) — one ordering. Comparator is a separate object defining any number of orderings, passed to sort methods: list.sort(Comparator.comparing(Emp::salary).reversed()). Use Comparable for the obvious default order, Comparator for everything else. Keep compareTo consistent with equals.`,
    },
  ],

  "Immutability & value objects": [
    {
      q: "How do you create an immutable class?",
      short: "final class, private final fields, no setters, defensive copies, return new objects for changes.",
      a: `- Declare the class final (or make constructors private with factories) so subclasses can't add mutability.
      - Make all fields private final.
      - No setters.
      - Defensively copy mutable inputs in the constructor and mutable outputs in getters.
      - Return new objects from "modifying" methods.

      ~~~
      public final class Money {
          private final long paise;
          private final String currency;
          public Money(long paise, String currency) { this.paise = paise; this.currency = currency; }
          public Money plus(Money o) { return new Money(paise + o.paise, currency); }
      }
      ~~~

      Java 16 records give you final fields, constructor, equals/hashCode/toString in one line — but still copy mutable components.`,
    },
    {
      q: "Why is String immutable in Java?",
      short: "For the string pool, security, thread safety and cached hash codes.",
      a: `- String pool: literals are shared, which is only safe if they can't change.
      - Security: class names, file paths and URLs can't be altered after validation.
      - Thread safety without synchronisation.
      - hashCode can be cached, making Strings fast HashMap keys.`,
    },
    {
      q: "What are the benefits of immutability for design?",
      short: "Thread-safe, shareable, cacheable, safe as map keys, and easy to reason about.",
      a: `Immutable objects are thread-safe by construction, safe to share and cache, can't be left half-updated if an exception is thrown, make good map keys, and are easier to reason about. The cost is allocation for every change, which is usually cheap with modern GCs; builders help construct complex ones.

      Senior angle: value objects (Money, DateRange, Email) should be immutable and compared by value; entities (User, Order) have identity and controlled mutation.`,
    },
  ],

  "Exceptions in OO design": [
    {
      q: "Checked vs unchecked exceptions?",
      short: "Checked must be handled or declared (IOException); unchecked are bugs (NullPointerException).",
      a: `Checked exceptions (IOException, SQLException) extend Exception and must be caught or declared with throws — for recoverable conditions outside the program's control. Unchecked exceptions (NullPointerException, IllegalArgumentException) extend RuntimeException and signal programming bugs; no declaration needed. Errors (OutOfMemoryError) are serious JVM problems you shouldn't catch.`,
    },
    {
      q: "What rules apply to exceptions when overriding a method?",
      short: "An override can't throw new or broader checked exceptions.",
      a: `The override may throw the same checked exceptions, narrower ones (subclasses), or none — but not new or broader checked exceptions, because callers using the parent type wouldn't be prepared to handle them (it would break substitutability). Unchecked exceptions are unrestricted.`,
    },
    {
      q: "How would you design a custom exception hierarchy?",
      short: "One base domain exception, specific subclasses, useful context, and always keep the cause.",
      a: `Create a base domain exception (e.g. PaymentException extends RuntimeException) and specific subclasses (InsufficientFundsException, CardExpiredException) so callers can catch broadly or precisely. Carry useful context (ids, amounts) and always pass the original cause to keep the stack trace. Don't use exceptions for normal control flow, and translate low-level exceptions at layer boundaries (SQLException → RepositoryException).`,
    },
    {
      q: "What is try-with-resources?",
      short: "A try block that closes AutoCloseable resources automatically, even on errors.",
      a: `Java 7 syntax that closes resources automatically, even if an exception is thrown: try (var in = new FileInputStream(f)) { ... }. The resource must implement AutoCloseable. If both the body and close() throw, the close exception is added as "suppressed" to the main one rather than losing it.`,
    },
  ],

  "Generics & type safety": [
    {
      q: "Why use generics?",
      short: "Type safety at compile time and no casts, while writing code once for any type.",
      a: `Generics let classes and methods work with any type while keeping compile-time type checks. List<String> rejects an Integer at compile time and needs no casts when reading, versus raw List where mistakes surface as ClassCastException at runtime. They also enable reusable, type-safe abstractions like Repository<T, ID> or Cache<K, V>.`,
    },
    {
      q: "What is type erasure?",
      short: "Generic types are checked at compile time and removed at runtime.",
      a: `Generic type information exists only at compile time. The compiler checks types, inserts casts, then erases parameters to their bounds (or Object). Consequences: you can't do new T(), instanceof List<String>, create generic arrays, or overload methods that differ only by type parameter; List<String> and List<Integer> are the same class at runtime.`,
    },
    {
      q: "Explain bounded types and wildcards (PECS).",
      short: "extends for reading (producers), super for writing (consumers).",
      a: `- <T extends Number>: T must be Number or a subclass — lets you call Number methods on T.
      - ? extends T: a producer you read T from (List<? extends Number> can be List<Integer>); you can't add to it.
      - ? super T: a consumer you write T into (List<? super Integer> can be List<Number>).

      PECS: Producer Extends, Consumer Super — e.g. Collections.copy(List<? super T> dest, List<? extends T> src).`,
    },
  ],

  "Association, aggregation & composition": [
    {
      q: "Explain association, aggregation and composition.",
      short: "Association = knows; aggregation = has, parts survive; composition = owns, parts die with it.",
      visual: "has-a",
      a: `All three are HAS-A relationships, in increasing strength:
      - Association: a general "uses/knows" link between independent objects — a Teacher and a Student.
      - Aggregation: a whole-part link where parts can exist on their own and be shared — a Team has Players; disband the team and players remain.
      - Composition: strong ownership — the part's lifecycle is bound to the whole and isn't shared — a House has Rooms; destroy the house and its rooms go too.

      In code, composition usually means the whole creates its parts internally; aggregation means parts are passed in from outside.`,
    },
    {
      q: "IS-A vs HAS-A?",
      short: "IS-A = inheritance (Car is a Vehicle); HAS-A = a field (Car has an Engine).",
      a: `IS-A is inheritance: a Car is a Vehicle (extends/implements). HAS-A is composition/aggregation: a Car has an Engine (a field). Test: if "X is a Y" sounds wrong in every context, don't use inheritance.`,
    },
    {
      q: "What is the UML notation for each?",
      short: "Line for association, hollow diamond for aggregation, filled diamond for composition.",
      visual: "uml-arrows",
      a: `Association is a plain line (arrow for direction), aggregation a hollow diamond on the whole's side, composition a filled diamond on the whole's side, dependency a dashed arrow, inheritance a hollow triangle and interface realisation a dashed line with a hollow triangle. Multiplicities like 1, 0..1, 1..* go at the line ends.`,
    },
  ],

  "Composition over inheritance": [
    {
      q: "What does 'favour composition over inheritance' mean?",
      short: "Reuse behaviour by holding objects you can swap, instead of extending a parent class.",
      visual: "composition-over-inheritance",
      a: `Build behaviour by holding other objects (has-a) and delegating to them, rather than by extending classes (is-a). Composition is more flexible:
      - Behaviour can change at runtime (swap the strategy object).
      - No combinatorial explosion of subclasses (FlyingSwimmingQuackingDuck).
      - Classes depend on interfaces, not on a parent's internals.
      - Easier to test with mocks.`,
    },
    {
      q: "What is the fragile base class problem?",
      short: "Changing a parent class's internals unexpectedly breaks its subclasses.",
      a: `Subclasses depend on the parent's implementation details, so a seemingly safe change to the parent breaks them. Classic example: a subclass of HashSet counts additions by overriding add() and addAll(); but HashSet.addAll() calls add() internally, so every element is counted twice. A wrapper that holds a Set and delegates (a decorator) has no such problem.`,
    },
    {
      q: "When is inheritance still the right choice?",
      short: "For a true, stable IS-A relationship where the child honours the parent's contract.",
      a: `When there's a genuine, stable IS-A relationship, the subclass honours the parent's contract (Liskov), and you control both classes — e.g. a sealed hierarchy of Shapes, or a framework's abstract base designed for extension (template method). Mark classes not designed for extension final; Effective Java's advice is "design and document for inheritance or else prohibit it".`,
    },
  ],

  "UML class diagrams": [
    {
      q: "What does a class box in a UML class diagram contain?",
      short: "Name, fields and methods, with + - # ~ for visibility.",
      a: `Three compartments: class name (italic or «abstract» for abstract, «interface» for interfaces), attributes, and operations. Visibility prefixes: + public, - private, # protected, ~ package. Types follow a colon: - balance: double, + deposit(amt: double): void. Static members are underlined.`,
    },
    {
      q: "Explain the relationship arrows.",
      short: "Triangle = is-a/implements, diamond = has-a, dashed arrow = uses.",
      visual: "uml-arrows",
      a: `- Inheritance (generalisation): solid line, hollow triangle at the parent.
      - Realisation: dashed line, hollow triangle at the interface.
      - Association: solid line, optional open arrow for navigability.
      - Dependency: dashed open arrow (uses temporarily — parameter or local variable).
      - Aggregation: solid line, hollow diamond at the whole.
      - Composition: solid line, filled diamond at the whole.`,
    },
    {
      q: "How much UML should you draw in an LLD interview?",
      short: "Just the core classes, key methods and relationships — skip getters/setters.",
      a: `Enough to communicate, not to be complete. Draw the 6–10 core classes, their key fields and methods, inheritance/interfaces and the important has-a relationships with multiplicities. Skip getters/setters. Interviewers care that the relationships are right and that extension points (interfaces, strategies) are visible.`,
    },
  ],

  "SOLID: SRP & OCP": [
    {
      q: "What is the Single Responsibility Principle?",
      short: "A class should have only one reason to change.",
      a: `A class should have one reason to change — one responsibility, owned by one actor. An Invoice class that calculates totals, prints PDFs and saves to the database changes for accountants, designers and DBAs alike. Split it into Invoice (calculation), InvoicePrinter and InvoiceRepository.

      Don't overdo it: SRP is about reasons to change, not "one method per class".`,
    },
    {
      q: "What is the Open/Closed Principle?",
      short: "Add new behaviour with new code, without editing code that already works.",
      visual: "ocp",
      a: `Software entities should be open for extension but closed for modification: you add behaviour by adding new code, not by editing tested code.

      Smell: a switch on type that grows with every new feature.
      ~~~
      double pay(String method, double amt) {
          switch (method) { case "CARD": ...; case "WALLET": ...; } // edit for each new method
      }
      ~~~
      Fix: a PaymentMethod interface with Card, Wallet, UPI implementations, chosen via a map or factory. Adding UPI is a new class.`,
    },
    {
      q: "How do you spot SRP and OCP violations in a code review?",
      short: "'Manager' god classes and growing switch/if-else chains on a type.",
      a: `SRP: class names with "And" or "Manager", files with many unrelated imports (HTTP, SQL, PDF), methods grouped by different stakeholders, and tests that need lots of unrelated setup. OCP: repeated switch/if-else chains on a type code, flags like isPremium threaded through methods, and every feature touching the same core class. Refactor with Extract Class and Replace Conditional with Polymorphism.`,
    },
  ],

  "SOLID: LSP, ISP & DIP": [
    {
      q: "What is the Liskov Substitution Principle?",
      short: "A child must work anywhere the parent does, without surprises.",
      visual: "lsp",
      a: `Objects of a subtype must be usable anywhere the parent type is expected without breaking correctness. A subclass may not strengthen preconditions, weaken postconditions, or throw unexpected exceptions.

      Classic violation: Square extends Rectangle. Code that sets width 5, height 4 and expects area 20 gets 16. Another: a ReadOnlyList that throws on add(). Fix by modelling them as siblings under a common interface.`,
    },
    {
      q: "What is the Interface Segregation Principle?",
      short: "Prefer small focused interfaces; don't force classes to implement methods they don't need.",
      a: `Clients shouldn't be forced to depend on methods they don't use. A fat Worker interface with work() and eat() forces a Robot to implement eat(). Split into Workable and Eatable, or for a printer: Printer, Scanner, Fax instead of one MultiFunctionDevice. Small role interfaces also make mocking easier.`,
    },
    {
      q: "What is the Dependency Inversion Principle?",
      short: "Business logic should depend on interfaces, not on concrete tools like MySQL.",
      visual: "dip",
      a: `High-level modules shouldn't depend on low-level modules; both should depend on abstractions. And abstractions shouldn't depend on details.

      ~~~
      class OrderService {
          private final OrderRepository repo;            // interface
          OrderService(OrderRepository repo) { this.repo = repo; }
      }
      ~~~
      OrderService no longer cares whether orders go to MySQL, Mongo or an in-memory fake in tests.`,
    },
    {
      q: "Dependency inversion vs dependency injection?",
      short: "Inversion is the principle; injection is the technique of passing dependencies in.",
      a: `DIP is a design principle (depend on abstractions). Dependency injection is a technique for supplying an object's dependencies from outside (constructor, setter) rather than creating them with new — one common way of applying DIP. IoC containers like Spring automate the injection.`,
    },
  ],

  "Coupling, cohesion, DRY, KISS & YAGNI": [
    {
      q: "What are coupling and cohesion?",
      short: "Coupling = how much classes depend on each other (keep low); cohesion = how focused a class is (keep high).",
      a: `Coupling is how much one module depends on another; cohesion is how closely related the responsibilities inside one module are. Aim for low coupling (changes don't ripple) and high cohesion (a class does one focused job). Interfaces, encapsulation and events reduce coupling; SRP raises cohesion.`,
    },
    {
      q: "What is the Law of Demeter?",
      short: "Only talk to your immediate friends — avoid a.getB().getC().doX().",
      a: `"Talk only to your immediate friends": a method should call methods on itself, its fields, its parameters and objects it creates — not on objects returned by those. order.getCustomer().getAddress().getCity() couples you to three classes' structure; prefer order.shippingCity(). It's a guideline, not a rule — fluent builders and streams are fine.`,
    },
    {
      q: "Explain DRY, KISS and YAGNI — and when DRY is wrong.",
      short: "Don't repeat knowledge, keep it simple, don't build for 'maybe'. DRY is wrong when merging things that change for different reasons.",
      a: `- DRY (Don't Repeat Yourself): each piece of knowledge has one authoritative place.
      - KISS: prefer the simplest design that works.
      - YAGNI (You Aren't Gonna Need It): don't build for hypothetical future requirements.

      DRY goes wrong when two pieces of code look the same but change for different reasons — merging them creates coupling. "Duplication is far cheaper than the wrong abstraction." In interviews, mention extension points but implement only what's asked.`,
    },
  ],

  "Dependency injection & testability": [
    {
      q: "Constructor vs setter vs field injection?",
      short: "Prefer constructor injection; setters for optional deps; avoid field injection.",
      a: `- Constructor injection: dependencies are required, can be final, the object is never half-built and tests just call new. Preferred.
      - Setter injection: for optional dependencies or ones that change after creation.
      - Field injection (@Autowired on a field): concise but hides dependencies, prevents final, needs reflection or a container in tests. Avoid in production code.`,
    },
    {
      q: "How does DI make code testable?",
      short: "You can pass fakes or mocks instead of real databases and services.",
      a: `When a class receives its collaborators instead of creating them, a test can pass fakes or mocks: new PaymentService(new FakeGateway(), fixedClock). No network, database or real time is needed, so tests are fast and deterministic. Hard-coded new, static calls (LocalDate.now()) and singletons are "hidden dependencies" that block this — wrap them behind an interface like Clock.`,
    },
    {
      q: "What is the Service Locator pattern and why is it considered an anti-pattern?",
      short: "A global registry that hides dependencies and fails at runtime instead of compile time.",
      a: `A global registry objects query for their dependencies: ServiceLocator.get(PaymentGateway.class). It hides what a class needs (you can't see it from the constructor), fails at runtime instead of compile time, and couples everything to the locator. DI makes dependencies explicit.`,
    },
  ],

  "Creational: Singleton, Factory & Builder": [
    {
      q: "How do you implement a thread-safe Singleton?",
      short: "Holder class, enum, or double-checked locking with a volatile field.",
      visual: "singleton",
      a: `Three common approaches:

      ~~~
      // 1. Bill Pugh holder: lazy and thread-safe through class loading
      public class Config {
          private Config() {}
          private static class Holder { static final Config INSTANCE = new Config(); }
          public static Config getInstance() { return Holder.INSTANCE; }
      }

      // 2. Enum: also safe against reflection and serialization
      public enum Registry { INSTANCE; }

      // 3. Double-checked locking: the field MUST be volatile
      private static volatile Config instance;
      public static Config getInstance() {
          if (instance == null) {
              synchronized (Config.class) {
                  if (instance == null) instance = new Config();
              }
          }
          return instance;
      }
      ~~~

      Without volatile, another thread can see a non-null reference to a partly constructed object.`,
    },
    {
      q: "What are the drawbacks of Singleton?",
      short: "Hidden global state, hard to test, and can be broken by reflection or serialization.",
      a: `It's global mutable state in disguise: hidden dependencies, hard to mock in tests, lifetime tied to the class loader, and a concurrency hotspot. It can also be broken by reflection, serialization or cloning (unless it's an enum). Prefer a single instance managed by your DI container, injected where needed.`,
    },
    {
      q: "Simple factory vs Factory Method vs Abstract Factory?",
      short: "One create() method / subclasses decide what to create / create families of matching objects.",
      visual: "factory",
      a: `- Simple factory: one class with a create(type) method that hides the new calls. Not a GoF pattern, but common.
      - Factory Method: a superclass defines an abstract create method and subclasses decide which concrete class to make (a Dialog's createButton() returns WindowsButton or MacButton).
      - Abstract Factory: an interface for creating families of related objects that must match (a UIFactory that creates Button + Checkbox + Menu for one theme).`,
    },
    {
      q: "When do you use the Builder pattern?",
      short: "When an object has many optional parameters and you want a readable, immutable result.",
      a: `When an object has many parameters, especially optional ones, and telescoping constructors become unreadable. A builder gives named, chainable steps and builds an immutable object in one go, validating it in build().

      ~~~
      Pizza p = new Pizza.Builder("large")
              .cheese(true)
              .topping("olive")
              .build();
      ~~~

      JDK examples: StringBuilder, HttpRequest.newBuilder(); Lombok's @Builder generates one.`,
    },
  ],

  "Structural: Adapter, Decorator, Facade & Proxy": [
    {
      q: "Explain the Adapter pattern.",
      short: "A wrapper that converts one interface into the one your code expects.",
      a: `Adapter converts the interface of a class into one clients expect, letting incompatible classes work together. Your app uses a PaymentGateway interface; a new provider's SDK has a different API, so you write StripeAdapter implements PaymentGateway that translates calls. JDK example: Arrays.asList (array → List), InputStreamReader (bytes → characters).`,
    },
    {
      q: "Explain the Decorator pattern.",
      short: "Wrap an object to add features while keeping the same interface; wrappers can stack.",
      visual: "decorator",
      a: `Decorator adds responsibilities to an object dynamically by wrapping it in another object with the same interface. Wrappers can be stacked in any combination, avoiding a subclass for every combination.

      Classic JDK example: new BufferedReader(new InputStreamReader(new FileInputStream("a.txt"))). Each layer is a Reader/InputStream adding buffering or decoding. Also Collections.unmodifiableList and synchronizedList.`,
    },
    {
      q: "Facade vs Proxy?",
      short: "Facade simplifies a complex subsystem; Proxy stands in for one object to control access.",
      a: `Facade gives a simple, unified interface to a complex subsystem: a VideoConverter.convert(file) that hides codecs, buffers and mixers. It simplifies.

      Proxy has the same interface as the real object and controls access to it: lazy loading (a heavy image loaded on first use), remote proxies (RMI), caching, access control, logging. Spring's @Transactional and Hibernate lazy entities are proxies.`,
    },
    {
      q: "Decorator vs Proxy vs Adapter — they all wrap. How do they differ?",
      short: "Adapter changes the interface, Decorator adds behaviour, Proxy controls access.",
      a: `- Adapter changes the interface.
      - Decorator keeps the interface and adds behaviour, usually stacked and chosen by the client.
      - Proxy keeps the interface and controls access; the client usually doesn't know it's there.`,
    },
  ],

  "Behavioural: Strategy, Observer, State & Command": [
    {
      q: "Explain the Strategy pattern with an example.",
      short: "Put each algorithm in its own class behind one interface and swap it at runtime.",
      visual: "strategy",
      a: `Strategy defines a family of algorithms, encapsulates each in its own class behind a common interface, and lets the client swap them at runtime. It replaces conditionals with composition and follows OCP.

      ~~~
      interface DiscountStrategy { double apply(double amount); }
      class NoDiscount implements DiscountStrategy { public double apply(double a) { return a; } }
      class FestiveDiscount implements DiscountStrategy { public double apply(double a) { return a * 0.8; } }

      class Cart {
          private DiscountStrategy discount = new NoDiscount();
          void setDiscount(DiscountStrategy d) { discount = d; }
          double total(double sum) { return discount.apply(sum); }
      }
      ~~~

      JDK example: Comparator passed to sort().`,
    },
    {
      q: "Explain the Observer pattern.",
      short: "Subscribers register with a subject and get notified automatically when it changes.",
      visual: "observer",
      a: `Observer defines a one-to-many dependency: when the subject changes state, all registered observers are notified automatically. The subject only knows the Observer interface, so new listeners need no change to it.

      Examples: UI event listeners, a stock price notifying apps, pub/sub and event buses. Pitfalls: memory leaks if observers never unsubscribe, unpredictable notification order, and slow observers blocking the subject (use async delivery).`,
    },
    {
      q: "What is the State pattern? How is it different from Strategy?",
      short: "Behaviour changes with the object's state, and states switch themselves; Strategy is chosen by the client.",
      a: `State lets an object change its behaviour when its internal state changes, by delegating to a state object; the state objects themselves usually trigger transitions. A vending machine has Idle, HasCoin, Dispensing and SoldOut states; insertCoin() behaves differently in each.

      Structurally it looks like Strategy, but the intent differs: a Strategy is chosen by the client and states don't know about each other; States replace each other as the object's lifecycle moves on.`,
    },
    {
      q: "Explain the Command pattern.",
      short: "Wrap a request in an object so it can be queued, logged or undone.",
      a: `Command turns a request into an object with an execute() (and often undo()) method. This lets you queue requests, log them, schedule them, and undo/redo — e.g. a text editor keeping a stack of executed commands, a remote control mapping buttons to commands, or a job queue. Runnable is essentially a command.`,
    },
  ],

  "Choosing patterns & anti-patterns": [
    {
      q: "How do you decide whether to apply a design pattern?",
      short: "Start from the problem; use a pattern only when it clearly solves a real need.",
      a: `Start from the force in the problem, then see whether a pattern names the solution:
      - Behaviour varies by type or config → Strategy / polymorphism.
      - Many things must react to an event → Observer.
      - Object creation is complex or must be hidden → Factory / Builder.
      - Behaviour depends on lifecycle state → State.
      - You need to add features without subclassing → Decorator.

      If there's only one implementation and no sign of a second, a plain class is better (YAGNI). Patterns are a vocabulary for communicating, not a checklist.`,
    },
    {
      q: "What are common OO anti-patterns?",
      short: "God object, anaemic model, singleton abuse, deep inheritance, primitive obsession.",
      a: `- God object: one class that knows and does everything.
      - Anaemic domain model: data-only classes with all logic in services.
      - Singleton abuse: global state everywhere.
      - Deep inheritance hierarchies and "util" dumping grounds.
      - Primitive obsession: Strings and ints for money, emails, ids.
      - Speculative generality: interfaces and factories for things that will never vary.`,
    },
    {
      q: "Name design patterns used in the JDK or Spring.",
      short: "Iterator, Decorator (java.io), Strategy (Comparator), Builder (StringBuilder), Proxy (Spring AOP).",
      a: `- Iterator: Iterator over collections.
      - Decorator: java.io streams.
      - Adapter: Arrays.asList, InputStreamReader.
      - Factory: Calendar.getInstance, List.of.
      - Builder: StringBuilder, HttpClient.newBuilder.
      - Strategy: Comparator.
      - Observer: java.beans PropertyChangeListener, Spring ApplicationEvent.
      - Template method: AbstractList, Spring JdbcTemplate.
      - Proxy: Spring AOP, @Transactional.
      - Singleton: Runtime.getRuntime(), Spring's default bean scope.`,
    },
  ],

  "How to approach an LLD interview": [
    {
      q: "What's a good structure for a low-level design interview?",
      short: "Requirements → entities → relationships → class diagram → flows → code → extensions.",
      visual: "lld-steps",
      a: `- Clarify requirements: core use cases, actors, scale, what's out of scope. Write them down.
      - Identify entities: nouns become classes, verbs become methods.
      - Define relationships: is-a vs has-a, multiplicities, which things vary (those become interfaces).
      - Draw the class diagram with key fields/methods; name the patterns you use and why.
      - Walk through main flows (e.g. park → ticket → pay) to validate the design.
      - Write code for the core classes.
      - Discuss extensions: new types, concurrency, failure cases, persistence.`,
    },
    {
      q: "What do interviewers evaluate in an LLD round?",
      short: "Clear requirements, focused classes, right relationships, extensibility, working code and trade-offs.",
      a: `Requirement gathering, clean class responsibilities (SRP), correct relationships, sensible use of interfaces and patterns (not forced), extensibility (adding a new vehicle type shouldn't touch five classes), readable and working code, handling of edge cases and concurrency, and how you explain trade-offs. Senior candidates are also judged on driving the discussion and spotting failure modes unprompted.`,
    },
    {
      q: "What are common mistakes in LLD rounds?",
      short: "Coding before clarifying, god classes, forced patterns, ignoring concurrency, no time left to code.",
      a: `Jumping into code without requirements, one giant Manager class, using inheritance where a field or enum would do, pattern stuffing, ignoring concurrency where it obviously matters (booking, inventory), public mutable fields, and not leaving time to code or walk through a flow.`,
    },
  ],

  "LLD: Parking lot": [
    {
      q: "Design a parking lot. What are the main classes?",
      short: "ParkingLot ◆ Floor ◆ Spot, abstract Vehicle, Ticket, plus allocation and pricing strategies.",
      visual: "parking-lot",
      a: `Requirements to confirm: multiple floors, spot types (bike, compact, large, EV), entry/exit gates, tickets, hourly pricing, a display of free spots.

      - ParkingLot (singleton or injected): floors, gates; park(vehicle) and unpark(ticket).
      - Floor → many Spot (composition). Spot has id, type, isFree, current vehicle.
      - Vehicle (abstract) → Car, Bike, Truck, each with a required spot type.
      - Ticket: id, vehicle, spot, entry time. Payment/Bill computed on exit.
      - SpotAllocationStrategy interface: NearestFirst, FloorByFloor.
      - PricingStrategy interface: HourlyPricing, WeekendPricing.`,
    },
    {
      q: "Show the core park/unpark code.",
      short: "park finds a free spot, occupies it and returns a ticket; unpark frees the spot and prices the stay.",
      a: `~~~
      public Ticket park(Vehicle v) {
          Spot spot = allocation.find(floors, v.spotType())
                  .orElseThrow(() -> new LotFullException(v.spotType()));
          spot.occupy(v);
          Ticket t = new Ticket(UUID.randomUUID().toString(), v, spot, clock.instant());
          active.put(t.id(), t);
          return t;
      }

      public Bill unpark(String ticketId) {
          Ticket t = Optional.ofNullable(active.remove(ticketId))
                  .orElseThrow(() -> new InvalidTicketException(ticketId));
          t.spot().free();
          return new Bill(t, pricing.price(t, clock.instant()));
      }
      ~~~

      Note the injected Clock and strategies — both make it testable and extensible.`,
    },
    {
      q: "How do you handle two cars being assigned the same spot at the same time?",
      short: "Make find-and-occupy atomic: a lock, a concurrent queue of free spots, or compare-and-set.",
      a: `Spot assignment must be atomic. Options: synchronise find-and-occupy on the floor (simple, coarse); keep free spots per type in a concurrent queue and poll() one (lock-free and O(1)); or use a compare-and-set on an AtomicBoolean in each Spot and retry on failure. In a distributed system with many gates, move the state to a database row with optimistic locking or a conditional update.`,
    },
    {
      q: "How would you extend it for EV charging or monthly passes?",
      short: "New spot type and pricing strategies — no change to ParkingLot itself.",
      a: `EV: add an EV spot type with a Charger and a ChargingPricing that decorates the base price. Passes: a PricingStrategy that checks a MembershipRepository and returns zero for valid pass holders. Because pricing and allocation are behind interfaces, neither change touches ParkingLot — OCP in action.`,
    },
  ],

  "LLD: Elevator system": [
    {
      q: "Design an elevator system. What are the main components?",
      short: "Elevator, Request, Dispatcher with a scheduling strategy, and the building's floors.",
      a: `- Elevator: id, current floor, direction, state, a set of target floors.
      - Request: external (floor + direction button) or internal (destination button in the car).
      - ElevatorController / Dispatcher: receives external requests and assigns them to an elevator via a SchedulingStrategy.
      - Door, Display, Button classes as needed.
      - Building with floors and a list of elevators.`,
    },
    {
      q: "How do you model elevator states?",
      short: "With the State pattern: Idle, MovingUp, MovingDown, DoorsOpen, Maintenance.",
      visual: "elevator-states",
      a: `With the State pattern: IdleState, MovingUpState, MovingDownState, DoorsOpenState, MaintenanceState, each implementing handleRequest() and onFloorArrived(). Moving states stop when the current floor is in the targets set, then switch to DoorsOpen; DoorsOpen switches back to Moving or Idle when the doors close. This keeps rules like "doors can't open while moving" in one place instead of scattered ifs.`,
    },
    {
      q: "What scheduling algorithm would you use?",
      short: "LOOK (like SCAN, reversing when nothing is ahead), behind a swappable strategy.",
      a: `- FCFS: simple but lots of back-and-forth.
      - SCAN (elevator algorithm): keep moving in one direction serving all requests, then reverse.
      - LOOK: like SCAN but reverse as soon as there are no more requests ahead — the usual choice.

      For multiple elevators the dispatcher picks the car with the lowest cost: e.g. an idle car nearest the floor, or a car already moving towards the floor in the requested direction. Put it behind a SchedulingStrategy interface so it can be swapped (peak-hour mode, VIP floors).`,
    },
  ],

  "LLD: Movie ticket booking (BookMyShow)": [
    {
      q: "What are the main classes in a movie booking system?",
      short: "Movie, Theatre, Screen, Seat, Show, Booking, Payment, plus booking and seat-lock services.",
      a: `- Movie, Theatre (city), Screen, Seat (row, number, type).
      - Show: movie + screen + start time, with per-seat ShowSeat status and price.
      - Booking: user, show, seats, status, payment.
      - Payment with a PaymentStrategy (card, UPI, wallet).
      - Services: SearchService, BookingService, PaymentService, and a SeatLockProvider.`,
    },
    {
      q: "How do you prevent two users booking the same seat?",
      short: "Lock seats atomically with a timeout, then confirm on payment or release on expiry.",
      visual: "seat-booking",
      a: `Lock seats temporarily when a user selects them, then confirm on payment:
      - lockSeats(show, seats, user) succeeds only if every seat is Available — atomically (all or nothing).
      - The lock has a TTL (e.g. 10 minutes); expiry or payment failure returns seats to Available.
      - On payment success, seats become Booked and the booking Confirmed.

      In memory: a ConcurrentHashMap per show with putIfAbsent per seat (roll back on partial failure). At scale: a database unique constraint on (show_id, seat_id) for confirmed bookings, plus Redis SET NX with expiry for locks.`,
    },
    {
      q: "Which design patterns fit naturally here?",
      short: "Strategy (payment, pricing), Observer (notifications), State (booking status), Factory.",
      a: `Strategy for payment and pricing (weekday, weekend, dynamic), Observer for notifications (email/SMS on booking), State for Booking (Created → Pending → Confirmed / Cancelled / Expired), Factory for creating payment handlers, and Singleton-scoped services injected via DI.`,
    },
  ],

  "LLD: Splitwise (expense sharing)": [
    {
      q: "Design Splitwise. What are the main classes?",
      short: "User, Group, Expense, split types (equal/exact/percent) and a BalanceSheet.",
      visual: "splitwise",
      a: `- User, Group (members, expenses).
      - Expense: paidBy, amount, description, list of Split.
      - Split (abstract): user + amount; subclasses EqualSplit, ExactSplit, PercentSplit.
      - SplitStrategy / ExpenseFactory that validates (exact amounts sum to total, percents sum to 100) and computes each user's share.
      - BalanceSheet: Map<User, Map<User, Double>> of who owes whom.
      - ExpenseService: addExpense, showBalances, settleUp.`,
    },
    {
      q: "How do you update balances when an expense is added?",
      short: "For each split, the user owes the payer their share — update both directions; use integer money.",
      a: `For each split where the user isn't the payer: balance[payer][user] += share and balance[user][payer] -= share. Keeping both directions makes "show my balances" a single map lookup. Store money as integer paise (or BigDecimal), never double, and give rounding leftovers (100 / 3) to a deterministic person such as the payer.`,
    },
    {
      q: "How would you simplify debts in a group?",
      short: "Compute net balances, then greedily match the biggest creditor with the biggest debtor.",
      a: `Compute each person's net balance (total paid − total owed). Then repeatedly match the largest creditor with the largest debtor, settle the smaller of the two amounts, and repeat — a greedy approach using two heaps, O(n log n). It reduces the number of transactions to at most n − 1 (the true minimum is NP-hard in general, so greedy is the accepted interview answer).`,
    },
  ],

  "LLD: LRU cache & rate limiter": [
    {
      q: "Design an LRU cache with O(1) get and put.",
      short: "HashMap for lookup + doubly linked list for usage order; evict from the tail.",
      visual: "lru",
      a: `Combine a HashMap<K, Node> for lookup with a doubly linked list ordered by recency (head = most recent). get: look up the node, move it to the head. put: update and move, or insert at the head; if over capacity, remove the node before the tail sentinel and its map entry.

      ~~~
      class LRUCache<K, V> {
          private final int capacity;
          private final Map<K, Node<K, V>> map = new HashMap<>();
          private final Node<K, V> head = new Node<>(null, null), tail = new Node<>(null, null);
          LRUCache(int capacity) { this.capacity = capacity; head.next = tail; tail.prev = head; }

          V get(K key) {
              Node<K, V> n = map.get(key);
              if (n == null) return null;
              unlink(n); addFirst(n);
              return n.value;
          }
          void put(K key, V value) {
              Node<K, V> n = map.get(key);
              if (n != null) { n.value = value; unlink(n); addFirst(n); return; }
              if (map.size() == capacity) { Node<K, V> lru = tail.prev; unlink(lru); map.remove(lru.key); }
              n = new Node<>(key, value); map.put(key, n); addFirst(n);
          }
          // unlink / addFirst are four pointer updates each
      }
      ~~~

      Shortcut worth mentioning: LinkedHashMap with accessOrder = true and removeEldestEntry overridden.`,
    },
    {
      q: "How would you make the cache thread-safe and extensible?",
      short: "Lock around get/put (both mutate order) and make the eviction policy pluggable.",
      a: `Simplest: synchronise get and put (even get mutates the list). Better throughput: a ReentrantLock, or striping across segments. For extensibility, put eviction behind an EvictionPolicy interface (LRU, LFU, FIFO) and storage behind a Storage interface, so Cache<K,V> just coordinates them. In production, use Caffeine rather than writing your own.`,
    },
    {
      q: "Design a rate limiter class.",
      short: "A RateLimiter interface with token bucket as the default; per-client state updated atomically.",
      a: `Interface: boolean allow(String clientId). Implementations behind a RateLimiter interface:
      - Token bucket: each client has tokens refilled at rate r up to capacity b; a request consumes one. Allows bursts — the common default.
      - Fixed window counter: simple, but allows 2× bursts at window edges.
      - Sliding window log / counter: smoother, more memory.

      Keep per-client state in a ConcurrentHashMap and update it atomically (synchronise per bucket or use compute()). Inject a Clock for testing. Across many servers, move the state to Redis with an atomic Lua script.`,
    },
  ],

  "Machine coding round": [
    {
      q: "What is a machine coding round and how is it evaluated?",
      short: "Build a working app in 60–120 minutes; judged on correctness, structure, OOP and extensibility.",
      a: `You get 60–120 minutes to build a working, runnable solution for a problem like Snake & Ladder, a parking lot, Splitwise or an in-memory key-value store — usually with a console or test driver, no UI.

      Evaluated on: does it run and meet the requirements, code structure (models / services / repositories), OOP and SOLID, naming and readability, extensibility for a follow-up twist the interviewer adds, error handling and edge cases, and sometimes unit tests. Flipkart, Swiggy, Razorpay, PhonePe, Uber and Cred commonly run these rounds.`,
    },
    {
      q: "How should you structure the code?",
      short: "model / service / strategy / repository / exception packages plus a Main driver.",
      a: `~~~
      model/       // Board, Player, Snake, Ladder — data + invariants
      service/     // GameService — orchestration, rules
      strategy/    // DiceStrategy, MovementStrategy
      repository/  // InMemoryPlayerRepository (Map-backed)
      exception/   // InvalidMoveException
      Main.java    // wires everything, runs a demo
      ~~~

      Get a minimal end-to-end flow working in the first 40–50% of the time, then add features. Commit to the given input/output format exactly.`,
    },
    {
      q: "What are tips to do well?",
      short: "Clarify early, get a simple end-to-end flow working first, then add features.",
      a: `Read the whole problem and ask questions in the first 5–10 minutes; keep the domain model free of I/O; use interfaces where the problem hints at variation ("there may be more dice types"); avoid over-engineering; handle invalid input with clear exceptions; and leave 10 minutes to run through the sample cases. A working simple solution beats an elegant unfinished one.`,
    },
  ],

  "Concurrency in OO design": [
    {
      q: "What makes a class thread-safe?",
      short: "It works correctly with many threads: don't share, don't mutate, or synchronize.",
      a: `A class is thread-safe if it behaves correctly when used from multiple threads without extra synchronisation by callers. Strategies, best first:
      - Don't share: keep state confined to one thread (local variables, ThreadLocal).
      - Don't mutate: immutable objects are always thread-safe.
      - Synchronise access to shared mutable state: synchronized, ReentrantLock, or atomics (AtomicInteger, ConcurrentHashMap).

      Encapsulation matters: if internal state escapes (a getter returning the internal list), no amount of locking inside the class helps.`,
    },
    {
      q: "What's wrong with this code, and how do you fix it?",
      short: "count++ isn't atomic — use AtomicInteger or synchronized.",
      a: `~~~
      class Counter {
          private int count;
          public void increment() { count++; }
          public int get() { return count; }
      }
      ~~~

      count++ is read-modify-write, so two threads can both read 5 and write 6 — a lost update. Also, without synchronisation another thread may never see the new value (visibility). Fix with private final AtomicInteger count and incrementAndGet(), or make both methods synchronized. For a check-then-act on a map (if absent, put), use putIfAbsent or computeIfAbsent rather than separate calls.`,
    },
    {
      q: "How do deadlocks happen between objects and how do you prevent them?",
      short: "Threads lock in different orders; always lock in one global order or use tryLock with timeouts.",
      a: `Classic case: transfer(a, b) locks a then b, while transfer(b, a) locks b then a; each thread holds one lock and waits for the other. Prevent by acquiring locks in a global order (e.g. by account id), using tryLock with a timeout, keeping critical sections small, and never calling unknown (overridable or callback) code while holding a lock.`,
    },
    {
      q: "synchronized vs ReentrantLock vs atomics?",
      short: "synchronized is simplest, ReentrantLock adds tryLock and timeouts, atomics are lock-free for single values.",
      a: `- synchronized: simplest, block-scoped, auto-released, reentrant.
      - ReentrantLock: adds tryLock, timeouts, interruptible waits, fairness and multiple Conditions; must unlock in finally.
      - Atomics / CAS: lock-free updates of a single variable — fastest under low contention, but don't compose across several variables.

      Also mention ReadWriteLock for read-heavy data and the java.util.concurrent collections.`,
    },
  ],

  "Code review & refactoring smells": [
    {
      q: "What code smells do you look for in a review?",
      short: "Long methods, large classes, switch on type, feature envy, primitive obsession, shotgun surgery.",
      a: `- Long method / large class: doing too much (SRP).
      - Switch statements on type codes: missing polymorphism (OCP).
      - Feature envy: a method that mostly uses another class's data — move it there.
      - Primitive obsession: String email, double money — introduce value objects.
      - Data clumps: the same 3 parameters always travel together — make a class.
      - Shotgun surgery: one change requires edits in many classes.
      - Refused bequest: a subclass that ignores most of what it inherits (LSP smell).`,
    },
    {
      q: "Refactor this: a method that switches on employee type to compute pay.",
      short: "Replace the switch with an Employee interface and one class per type.",
      a: `~~~
      // before
      double pay(Employee e) {
          switch (e.type) {
              case FULL_TIME: return e.salary / 12;
              case CONTRACT:  return e.hours * e.rate;
              case INTERN:    return e.stipend;
          }
          throw new IllegalStateException();
      }

      // after
      interface Employee { double monthlyPay(); }
      record FullTime(double salary) implements Employee { public double monthlyPay() { return salary / 12; } }
      record Contractor(double hours, double rate) implements Employee { public double monthlyPay() { return hours * rate; } }
      record Intern(double stipend) implements Employee { public double monthlyPay() { return stipend; } }
      ~~~

      Each type owns its rule, a new type is a new class, and fields that only make sense for one type (rate, stipend) stop leaking into the others.`,
    },
    {
      q: "How do you refactor legacy code safely?",
      short: "Pin behaviour with tests, then change in small steps, never mixing refactors with feature changes.",
      a: `Pin current behaviour with characterisation tests first; refactor in small, behaviour-preserving steps (extract method, extract class, introduce interface) and run tests after each; introduce seams (constructor injection) to isolate dependencies; separate refactoring commits from behaviour changes; and use the strangler approach for large modules — new code behind an interface, migrate callers gradually.`,
    },
  ],

  "Designing for extensibility": [
    {
      q: "How do you design a system so new features can be added without modifying the core?",
      short: "Interfaces at the points that vary, plus events so new features can subscribe.",
      a: `Identify the axes of change and put an interface on each: new payment methods (PaymentProvider), new notification channels (Notifier), new rules (Rule chain). Register implementations through DI, a registry map, or Java's ServiceLoader for plugins. Use events (Observer / domain events) so new reactions subscribe instead of being called directly. Keep the extension interfaces small and stable — they're a public contract.`,
    },
    {
      q: "Events vs direct method calls between components?",
      short: "Calls for commands that need a result; events for side effects others can react to.",
      a: `Direct calls are simple, synchronous, easy to trace and give immediate errors — right when the caller needs the result. Events decouple the publisher from subscribers, letting you add behaviour (send email, update analytics) without touching the publisher — but flow becomes implicit, ordering and failures need handling, and debugging is harder. A common rule: commands as calls, side-effects as events.`,
    },
    {
      q: "When is OOP not the right tool?",
      short: "Data pipelines, tiny scripts, data-oriented performance code and message-passing concurrency.",
      a: `Data transformation pipelines and analytics (functional style and immutable data flow better), simple scripts, performance-critical code needing data-oriented layout (arrays of structs over object graphs), and highly concurrent systems where shared mutable objects are a liability (actors, message passing). Senior candidates are expected to say "it depends" and mix paradigms — e.g. records + streams + small interfaces in modern Java.`,
    },
  ],

  "OOP rapid-fire round-up": [
    {
      q: "Can we override a static method? A private method? Can a constructor be final, static or abstract?",
      short: "No, no, and none of the three.",
      a: `- Static: no — it's hidden, not overridden.
      - Private: no — it isn't visible to the subclass.
      - Constructor final/static/abstract: none are allowed. Constructors aren't inherited, so final and abstract are meaningless; static makes no sense because a constructor initialises an instance.`,
    },
    {
      q: "Shallow copy vs deep copy?",
      short: "Shallow copies share nested objects; deep copies duplicate them too.",
      a: `A shallow copy duplicates the object's fields as-is, so references point to the same nested objects — changing a nested list in the copy changes the original. A deep copy recursively copies nested objects too. Object.clone() is shallow by default; implement deep copies with copy constructors or factories.`,
    },
    {
      q: "Can an interface extend another interface? Can a class extend multiple interfaces?",
      short: "An interface can extend many interfaces; a class implements many interfaces but extends one class.",
      a: `An interface can extend one or more interfaces (interface C extends A, B). A class extends at most one class but can implement any number of interfaces.`,
    },
    {
      q: "What is a marker interface?",
      short: "An empty interface used as a tag, like Serializable.",
      a: `An interface with no methods that tags a class with a capability the JVM or a library checks: Serializable, Cloneable, RandomAccess. Annotations are the modern alternative for most new uses.`,
    },
    {
      q: "What is an inner class? Anonymous class? Static nested class?",
      short: "Inner needs an outer object, static nested doesn't, anonymous is a one-off unnamed class.",
      a: `- Inner (non-static nested) class: tied to an instance of the outer class and can access its fields.
      - Static nested class: no outer instance; used for helpers like Builder or Map.Entry.
      - Local class: declared inside a method.
      - Anonymous class: a one-off unnamed implementation, e.g. new Comparator<>() { ... } — mostly replaced by lambdas for functional interfaces.`,
    },
    {
      q: "Class vs struct (C++/C#)?",
      short: "C++: only default access differs. C#: struct is a value type, class a reference type.",
      a: `In C++ they're identical except default access: struct members are public by default, class members private. In C#, struct is a value type (copied on assignment, stack-friendly, no inheritance) while class is a reference type. Java has no struct; records are the closest to value-like data classes.`,
    },
  ],
};
