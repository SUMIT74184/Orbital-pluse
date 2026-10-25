import type { TopicGuide } from "./index";

// Plain-language lessons for the OOP & LLD track, keyed by topic title (see src/data/topics.ts).
export const OOP_GUIDES: Record<string, TopicGuide> = {
  "What OOP is & why it exists": {
    simple: `Object-Oriented Programming is a way of writing code where you model your program as a set of "things" (objects) that each hold their own data and know how to do their own jobs.

    Instead of one long list of functions passing data around, you ask: what are the things in this problem? In a food delivery app that's Customer, Restaurant, Order and DeliveryPartner. Each becomes a class with its own data (an order has items and a total) and its own actions (an order can be placed or cancelled).`,
    analogy: `Think of a restaurant. The chef cooks, the waiter takes orders, the cashier takes payment. Each person has their own job and their own tools, and they talk to each other through simple requests ("one paneer tikka please"). Nobody needs to know how the chef cooks.

    That's OOP: objects with clear jobs, talking through simple methods, hiding their inner details.`,
    visual: "pillars",
    concepts: [
      { term: "Object", meaning: "A thing in your program with data (state) and actions (behaviour), e.g. one particular order." },
      { term: "Class", meaning: "The blueprint that says what data and actions every object of that type has." },
      { term: "State", meaning: "The data an object holds right now — an order's items, status and total." },
      { term: "Behaviour", meaning: "What an object can do — its methods, like place() or cancel()." },
      { term: "Four pillars", meaning: "Encapsulation, Abstraction, Inheritance, Polymorphism — the ideas OOP is built on." },
      { term: "Procedural programming", meaning: "The older style: a sequence of functions that work on shared data (C, Pascal)." },
    ],
    compare: {
      head: ["", "Procedural", "Object-oriented"],
      rows: [
        ["Built from", "Functions", "Objects (data + functions together)"],
        ["Data", "Often shared / global", "Private inside each object"],
        ["Adding a new type", "Edit many functions", "Add a new class"],
        ["Best for", "Small scripts, maths", "Large apps, teams, long-lived code"],
        ["Examples", "C", "Java, C++, C#, Python"],
      ],
    },
    mistakes: [
      "Reciting only the four pillar names — always add a one-line real example for each.",
      "Saying OOP is always better. It isn't: a 50-line script doesn't need classes.",
      "Saying Java is a pure OO language — it has primitives like int that aren't objects.",
    ],
    remember: "OOP = model the problem as objects that own their data and expose simple actions.",
  },

  "Classes, objects & memory": {
    simple: `A class is a plan; an object is the real thing built from that plan. You write the class once and create as many objects as you like with new.

    In memory, the object itself lives on the heap (a big shared area). The variable you hold — like car1 — is just a reference (an address) pointing to that object. Copying the variable copies the address, not the object.`,
    analogy: `A house plan from an architect is the class. Every actual house built from it is an object. All the houses have the same rooms (fields), but each has its own paint colour and its own family living in it (its own values).

    Your house address written on a piece of paper is the reference. Give a friend a copy of the paper and you both point at the same house.`,
    visual: "class-objects",
    concepts: [
      { term: "Class", meaning: "A template that defines fields and methods. No object exists until you call new." },
      { term: "Object / instance", meaning: "One real copy created at runtime, with its own field values." },
      { term: "Reference", meaning: "A variable that holds where the object is, not the object itself." },
      { term: "Heap", meaning: "Shared memory where all objects live; cleaned by the garbage collector." },
      { term: "Stack", meaning: "Per-thread memory for method calls: local variables and references." },
      { term: "Static member", meaning: "Belongs to the class, shared by all objects (like a counter of cars made)." },
    ],
    example: `~~~
    class Car {
        String model;                 // each object gets its own
        static int carsMade = 0;      // one shared copy for the class
        Car(String model) { this.model = model; carsMade++; }
    }

    Car a = new Car("Swift");   // object 1 on the heap, 'a' points to it
    Car b = a;                  // copies the reference — same object!
    b.model = "Nexon";
    System.out.println(a.model); // Nexon
    System.out.println(Car.carsMade); // 1
    ~~~`,
    mistakes: [
      "Thinking Car b = a creates a second car. It only copies the reference.",
      "Saying a class takes heap memory for each object before any object is created.",
      "Using static for data that should be different per object.",
    ],
    remember: "Class = blueprint, object = the real thing on the heap, variable = an address pointing to it.",
  },

  "Constructors & object lifecycle": {
    simple: `A constructor is the setup code that runs automatically the moment an object is created. Its job is to put the new object into a valid starting state — fill in required fields, check inputs.

    It looks like a method with the same name as the class and no return type. If you don't write one, Java gives you an empty no-argument one. When an object is no longer referenced by anything, the garbage collector frees its memory — you never delete objects yourself in Java.`,
    analogy: `Buying a new phone: when you switch it on for the first time, a setup screen makes you choose a language, log in and set a PIN before you can use it. That setup screen is the constructor — it runs once, at the start, and makes sure the phone is ready to use.`,
    visual: "object-lifecycle",
    concepts: [
      { term: "Default constructor", meaning: "No parameters. Java adds an empty one only if you write no constructor at all." },
      { term: "Parameterised constructor", meaning: "Takes values to set fields: new User(\"Asha\", 24)." },
      { term: "Copy constructor", meaning: "Builds a new object from an existing one. In Java you write it yourself." },
      { term: "this(...)", meaning: "Calls another constructor of the same class (must be the first line)." },
      { term: "super(...)", meaning: "Calls the parent class's constructor (must be the first line)." },
      { term: "Garbage collection", meaning: "Java automatically frees objects nothing points to; no destructors." },
    ],
    example: `~~~
    class User {
        private final String name;
        private final int age;

        User(String name, int age) {          // parameterised
            if (age < 0) throw new IllegalArgumentException("age");
            this.name = name;
            this.age = age;
        }
        User(String name) { this(name, 18); } // chaining with this()
        User(User other) { this(other.name, other.age); } // copy
    }
    ~~~`,
    compare: {
      head: ["", "Constructor", "Method"],
      rows: [
        ["Name", "Same as the class", "Any name"],
        ["Return type", "None, not even void", "Must have one (or void)"],
        ["Called", "Automatically by new, once", "Whenever you call it"],
        ["Inherited?", "No", "Yes"],
        ["Can be overridden?", "No (only overloaded)", "Yes"],
      ],
    },
    mistakes: [
      "Writing a return type on a constructor — then it's just a normal method with the class's name.",
      "Adding a parameterised constructor and expecting new User() to still compile.",
      "Calling overridable methods from a constructor (the child version runs before the child is ready).",
    ],
    remember: "A constructor runs once on new and makes the object valid from its first moment.",
  },

  "Access modifiers, static & final": {
    simple: `These keywords control who can see something and whether it can change.

    Access modifiers (private, default, protected, public) decide which code can use a field or method. static means "belongs to the class, shared by everyone" rather than to each object. final means "can't be changed": a final variable can't be reassigned, a final method can't be overridden, a final class can't be extended.`,
    analogy: `In a house: your diary is private (only you), the kitchen is default/package (only family at home), the living room is protected (family plus close relatives visiting), the front porch is public (anyone).

    The building's water tank is static — one tank shared by every flat. Your date of birth is final — set once, never changes.`,
    concepts: [
      { term: "private", meaning: "Visible only inside the same class. Default choice for fields." },
      { term: "default (package-private)", meaning: "No keyword. Visible to classes in the same package." },
      { term: "protected", meaning: "Same package plus subclasses in other packages." },
      { term: "public", meaning: "Visible everywhere." },
      { term: "static", meaning: "One copy for the class. Static methods have no this." },
      { term: "final", meaning: "Variable: assign once. Method: no override. Class: no subclass." },
    ],
    compare: {
      head: ["Modifier", "Same class", "Same package", "Subclass (other package)", "Anywhere"],
      rows: [
        ["private", "✓", "✗", "✗", "✗"],
        ["default", "✓", "✓", "✗", "✗"],
        ["protected", "✓", "✓", "✓", "✗"],
        ["public", "✓", "✓", "✓", "✓"],
      ],
    },
    example: `~~~
    public final class AppConfig {           // final: nobody can extend it
        public static final int MAX_USERS = 100; // constant shared by all
        private static int instances = 0;        // shared counter
        private final String env;                // set once per object

        public AppConfig(String env) { this.env = env; instances++; }
    }
    ~~~`,
    mistakes: [
      "Believing a final List can't change — you can still add items; only the reference is fixed.",
      "Using this inside a static method.",
      "Making fields public 'for convenience' — it breaks encapsulation.",
    ],
    remember: "private by default, static = shared by the class, final = can't change.",
  },

  Encapsulation: {
    simple: `Encapsulation means keeping an object's data private and only letting the outside world change it through methods that follow the rules.

    That way the object can never end up in a broken state. A bank account's balance should never go negative — so you don't let anyone set balance directly; you give them deposit() and withdraw(), and those methods check the rules.`,
    analogy: `A medicine capsule keeps the powder inside a shell — you take the capsule as a whole, you don't handle the powder. Or an ATM: you can't open it and grab cash; you use the buttons, and the machine checks your PIN and balance first.`,
    visual: "encapsulation",
    concepts: [
      { term: "Data hiding", meaning: "Fields are private so outside code can't touch them directly." },
      { term: "Invariant", meaning: "A rule that must always be true, e.g. balance ≥ 0. Methods protect it." },
      { term: "Getter / setter", meaning: "Methods to read / change a field. Setters should validate." },
      { term: "Tell, don't ask", meaning: "Ask the object to do the job (account.withdraw(100)) instead of pulling its data out and doing it yourself." },
    ],
    example: `~~~
    class BankAccount {
        private double balance;           // hidden

        public void deposit(double amt) {
            if (amt <= 0) throw new IllegalArgumentException("Amount must be positive");
            balance += amt;
        }
        public void withdraw(double amt) {
            if (amt > balance) throw new IllegalStateException("Insufficient balance");
            balance -= amt;
        }
        public double getBalance() { return balance; }  // read-only from outside
    }
    ~~~

    There is no setBalance(), so nobody can write account.setBalance(-500).`,
    compare: {
      head: ["", "Encapsulation", "Abstraction"],
      rows: [
        ["Hides", "Data (the fields)", "Complexity (the how)"],
        ["Question it answers", "Who can touch this data?", "What does the user need to see?"],
        ["Done with", "private fields + methods", "interfaces, abstract classes"],
        ["Example", "private balance", "Payment.pay() hides UPI details"],
      ],
    },
    mistakes: [
      "Saying 'private fields with getters and setters' is encapsulation — if every field has a plain setter, nothing is protected.",
      "Returning an internal list directly — callers can modify it. Return a copy or an unmodifiable view.",
      "Mixing up encapsulation and abstraction.",
    ],
    remember: "Encapsulation = private data + methods that enforce the rules.",
  },

  "Abstraction: abstract classes & interfaces": {
    simple: `Abstraction means showing only what something does and hiding how it does it.

    When you call payment.pay(500), you don't care whether it's UPI, a card or a wallet, or how the bank APIs work. In Java you get abstraction with interfaces (a list of things a class promises to do) and abstract classes (a half-finished class that subclasses complete).`,
    analogy: `Driving a car: you use the steering wheel, accelerator and brake. You don't need to understand fuel injection or the gearbox. The pedals are the abstraction; the engine is the hidden implementation. Any car — petrol, diesel, electric — gives you the same pedals.`,
    visual: "abstraction-layers",
    concepts: [
      { term: "Interface", meaning: "A contract: method names a class promises to implement. A class can implement many." },
      { term: "Abstract class", meaning: "Can't be created with new; may have both finished and unfinished (abstract) methods." },
      { term: "Abstract method", meaning: "A method with no body that subclasses must implement." },
      { term: "Implementation", meaning: "The concrete class that does the real work, e.g. UpiPayment." },
    ],
    example: `~~~
    interface Payment {                 // WHAT
        void pay(double amount);
    }

    class UpiPayment implements Payment {   // HOW (hidden from callers)
        public void pay(double amount) {
            // talk to the UPI app, wait for PIN, confirm with bank...
        }
    }

    Payment p = new UpiPayment();
    p.pay(500);   // caller only knows about Payment
    ~~~`,
    mistakes: [
      "Thinking abstraction only means abstract classes — interfaces are the main tool.",
      "Saying an abstract class can't have a constructor. It can; it runs when a subclass is created.",
      "Creating interfaces for things that will only ever have one implementation and no tests needing a fake.",
    ],
    remember: "Abstraction = expose the what, hide the how.",
  },

  "Inheritance & its types": {
    simple: `Inheritance lets one class take on the fields and methods of another and add or change some. The new class (child) "is a" kind of the old one (parent): a Car is a Vehicle.

    It saves you from rewriting shared code and it's what makes polymorphism possible. In Java a class can extend only one class, but can implement many interfaces.`,
    analogy: `A child inherits traits from their parents — surname, eye colour — and also has their own talents. Or a smartphone "is a" phone: it can still call and text (inherited), and it adds apps and a camera (its own).`,
    visual: "inheritance-types",
    concepts: [
      { term: "Parent / superclass", meaning: "The class being inherited from (Vehicle)." },
      { term: "Child / subclass", meaning: "The class that extends it (Car)." },
      { term: "IS-A", meaning: "The test for inheritance: 'a Car is a Vehicle' must make sense." },
      { term: "Single / multilevel / hierarchical", meaning: "One parent / a chain / many children of one parent — all allowed in Java." },
      { term: "Multiple inheritance", meaning: "Two parent classes — not allowed in Java for classes; use interfaces." },
      { term: "Diamond problem", meaning: "Ambiguity when two parents have the same method; the reason Java bans it." },
    ],
    example: `~~~
    class Vehicle {
        protected int wheels;
        void start() { System.out.println("Starting"); }
    }

    class Car extends Vehicle {
        Car() { wheels = 4; }
        void playMusic() { System.out.println("Playing"); }
    }

    Car c = new Car();
    c.start();      // inherited from Vehicle
    c.playMusic();  // Car's own
    ~~~`,
    mistakes: [
      "Using inheritance just to reuse code when 'X is a Y' isn't really true (a Stack is not a Vector).",
      "Building deep 5-level hierarchies that are hard to change.",
      "Saying Java supports multiple inheritance — only of interfaces (types), not classes.",
    ],
    remember: "Inheritance is for real IS-A relationships; Java allows one parent class, many interfaces.",
  },

  "Polymorphism: overloading vs overriding": {
    simple: `Polymorphism means "many forms": the same method name does different things depending on the situation.

    There are two kinds. Overloading: several methods in one class with the same name but different parameters — Java picks the right one while compiling. Overriding: a child class gives its own version of a parent's method — Java picks the right one while running, based on the actual object.`,
    analogy: `The word "open": open a door, open a bottle, open an app — same word, different action depending on what you're opening (overloading: decided by the argument).

    A "speak" instruction to different animals: a dog barks, a cat meows (overriding: decided by which animal is actually there).`,
    visual: "polymorphism",
    concepts: [
      { term: "Compile-time polymorphism", meaning: "Method overloading; the compiler chooses using argument types." },
      { term: "Runtime polymorphism", meaning: "Method overriding; the JVM chooses using the real object's class." },
      { term: "Upcasting", meaning: "Using a child object through a parent type: Shape s = new Circle();" },
      { term: "@Override", meaning: "Annotation that makes the compiler check you really are overriding." },
    ],
    example: `~~~
    // Overloading — same name, different parameters
    int add(int a, int b)          { return a + b; }
    double add(double a, double b) { return a + b; }
    int add(int a, int b, int c)   { return a + b + c; }

    // Overriding — child replaces parent's version
    class Animal { String speak() { return "..."; } }
    class Dog extends Animal {
        @Override String speak() { return "Woof"; }
    }
    Animal a = new Dog();
    a.speak();   // "Woof" — decided at runtime
    ~~~`,
    compare: {
      head: ["", "Overloading", "Overriding"],
      rows: [
        ["Where", "Same class", "Parent and child classes"],
        ["Parameters", "Must differ", "Must be the same"],
        ["Return type", "Can differ (but not alone)", "Same or a subtype"],
        ["Decided", "Compile time", "Runtime"],
        ["static / private / final", "Can be overloaded", "Cannot be overridden"],
        ["Access", "Any", "Can't be more restrictive"],
      ],
    },
    mistakes: [
      "Trying to overload by changing only the return type — it won't compile.",
      "Writing equals(Dog d) instead of equals(Object o): that's an overload, not an override. @Override catches it.",
      "Saying static methods can be overridden — they're hidden, not overridden.",
    ],
    remember: "Overloading = same name, different inputs, compile time. Overriding = same signature in a child, runtime.",
  },

  "Dynamic dispatch & binding": {
    simple: `When you write animal.speak(), something has to decide which speak() to run. Binding is that decision.

    For overridden methods Java decides at runtime by looking at the real object (dynamic binding). For static, private and final methods, and for overloads, it decides at compile time from the variable's type (static binding). Under the hood each class has a small table of its methods (a vtable), and the call jumps through the object's table.`,
    analogy: `You call a company's helpline number (the reference type). Which person picks up depends on who's on shift right now (the actual object). The number is fixed when you dial; the person is decided at the moment of the call.`,
    visual: "dispatch",
    concepts: [
      { term: "Static (early) binding", meaning: "Decided by the compiler: static, private, final methods, overloads, fields." },
      { term: "Dynamic (late) binding", meaning: "Decided at runtime from the object's class: overridden methods." },
      { term: "vtable", meaning: "A per-class table of method addresses used for runtime lookup." },
      { term: "Method hiding", meaning: "A static method in the child with the same signature hides (not overrides) the parent's." },
      { term: "Covariant return", meaning: "An override may return a more specific type (Dog instead of Animal)." },
    ],
    example: `~~~
    class Parent {
        static String who() { return "static Parent"; }
        String name()       { return "Parent"; }
    }
    class Child extends Parent {
        static String who() { return "static Child"; }
        @Override String name() { return "Child"; }
    }

    Parent p = new Child();
    p.name();  // "Child"         — dynamic binding
    p.who();   // "static Parent" — static binding (hiding)
    ~~~`,
    mistakes: [
      "Expecting fields to behave polymorphically — they don't; the reference type decides.",
      "Thinking virtual calls are slow in Java — the JIT usually inlines them.",
    ],
    remember: "Variable type decides what you may call; object type decides which version runs.",
  },

  "Abstract class vs interface": {
    simple: `Both let you define methods without fully implementing them, but they serve different purposes.

    An abstract class is a partly built parent: it can hold fields, constructors and shared code, and a class can extend only one. An interface is a promise of abilities: "can be compared", "can be paid", and a class can implement many. Rule of thumb: abstract class for "is a kind of" with shared code; interface for "can do".`,
    analogy: `An abstract class is like a franchise kit: the brand gives you the kitchen, recipes and uniform (shared state and code), and you add the local menu. You can belong to only one franchise.

    An interface is like a certification: "certified driver", "certified first-aider". It says what you can do, not how you learned it, and one person can hold many.`,
    visual: "abstract-vs-interface",
    concepts: [
      { term: "Abstract class", meaning: "Can have fields, constructors, concrete and abstract methods; single inheritance." },
      { term: "Interface", meaning: "Constants and methods (abstract, default, static, private); multiple implementation." },
      { term: "Default method", meaning: "Java 8+: an interface method with a body, so old implementers don't break." },
      { term: "Capability", meaning: "What interfaces usually express: Comparable, Runnable, Serializable." },
    ],
    compare: {
      head: ["", "Abstract class", "Interface"],
      rows: [
        ["Keyword", "extends", "implements"],
        ["How many", "One", "Many"],
        ["Fields", "Any instance fields", "Only public static final constants"],
        ["Constructor", "Yes", "No"],
        ["Methods", "Abstract + concrete, any access", "Abstract, default, static, private"],
        ["Use for", "Shared state & code (is-a)", "Capabilities (can-do), APIs, mocking"],
      ],
    },
    mistakes: [
      "Saying interfaces can't have method bodies — default and static methods exist since Java 8.",
      "Saying abstract classes can't have constructors.",
      "Choosing an abstract class for something unrelated classes need to share.",
    ],
    remember: "Abstract class = shared base with state (one only). Interface = a capability (many allowed).",
  },

  "Object contracts: equals, hashCode & toString": {
    simple: `Every Java class inherits equals(), hashCode() and toString() from Object.

    == checks if two references point to the same object. equals() checks if two objects mean the same thing (two Money objects of ₹100 are equal). If you override equals, you must also override hashCode so equal objects give the same hash — otherwise HashMap and HashSet stop working correctly.`,
    analogy: `Two ₹100 notes are different pieces of paper (== is false), but they have the same value (equals is true).

    hashCode is like the shelf number in a library: equal books must be put on the same shelf, or you'll never find the copy you're looking for.`,
    visual: "hash-buckets",
    concepts: [
      { term: "==", meaning: "Same object in memory (for objects); same value (for primitives)." },
      { term: "equals()", meaning: "Logical equality, defined by the class. Object's default is ==." },
      { term: "hashCode()", meaning: "A number used to pick a bucket in hash-based collections." },
      { term: "The contract", meaning: "a.equals(b) ⇒ a.hashCode() == b.hashCode(). The reverse isn't required." },
      { term: "Comparable vs Comparator", meaning: "Natural order inside the class vs any number of external orderings." },
    ],
    example: `~~~
    final class Emp {
        private final int id;
        Emp(int id) { this.id = id; }

        @Override public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Emp other)) return false;
            return id == other.id;
        }
        @Override public int hashCode() { return Integer.hashCode(id); }
        @Override public String toString() { return "Emp(" + id + ")"; }
    }
    // Or in Java 16+: record Emp(int id) {}  — all three generated for you
    ~~~`,
    mistakes: [
      "Overriding equals but not hashCode — lookups in HashMap silently fail.",
      "Using mutable fields in hashCode and then changing them while the object is in a HashSet.",
      "Comparing Strings with ==.",
    ],
    remember: "Override equals and hashCode together, using the same fields.",
  },

  "Immutability & value objects": {
    simple: `An immutable object can never change after it's created. To "change" it, you create a new one. String is the most famous example.

    Immutable objects are simple and safe: they can be shared between threads without locks, used as map keys, and cached, because nobody can modify them behind your back.`,
    analogy: `A printed train ticket can't be edited — to change the date you cancel it and get a new ticket. Because it can't be edited, the TTE can trust whatever is printed on it.`,
    visual: "immutable",
    concepts: [
      { term: "Immutable class", meaning: "final class, private final fields, no setters, defensive copies." },
      { term: "Defensive copy", meaning: "Copy mutable inputs/outputs (like a List or Date) so callers can't change your internals." },
      { term: "Value object", meaning: "Defined by its values, not identity: Money, Email, DateRange. Should be immutable." },
      { term: "Entity", meaning: "Has an identity that persists while data changes: User, Order." },
      { term: "record", meaning: "Java 16+ shorthand for small immutable data classes." },
    ],
    example: `~~~
    public final class Money {
        private final long paise;
        private final String currency;

        public Money(long paise, String currency) {
            this.paise = paise;
            this.currency = currency;
        }
        public Money plus(Money other) {
            return new Money(paise + other.paise, currency);  // new object
        }
        public long paise() { return paise; }
    }

    Money a = new Money(10000, "INR");
    Money b = a.plus(new Money(5000, "INR"));  // a is still ₹100
    ~~~`,
    mistakes: [
      "Marking fields final but returning an internal List — callers can still add to it.",
      "Forgetting to make the class final, so a subclass can add mutable state.",
      "Using double for money — use long paise or BigDecimal.",
    ],
    remember: "Immutable = no changes after creation; changes return a new object.",
  },

  "Exceptions in OO design": {
    simple: `An exception is Java's way of saying "something went wrong and normal flow can't continue".

    Checked exceptions (like IOException) are problems you should expect and handle — the compiler forces you to catch or declare them. Unchecked exceptions (RuntimeException, like NullPointerException) usually mean a bug. In good OO design you create meaningful exception classes for your domain, like InsufficientBalanceException.`,
    analogy: `Ordering food: "restaurant closed" is an expected problem the app should handle gracefully (checked). The app crashing because a developer forgot a null check is a bug (unchecked). The phone's battery dying is an Error — the app can't do anything about it.`,
    visual: "exceptions",
    concepts: [
      { term: "Checked", meaning: "Extends Exception; must be caught or declared with throws." },
      { term: "Unchecked", meaning: "Extends RuntimeException; compiler doesn't force handling." },
      { term: "Error", meaning: "Serious JVM problems (OutOfMemoryError). Don't catch." },
      { term: "Custom exception", meaning: "Your own class with a clear name and useful details." },
      { term: "try-with-resources", meaning: "Closes files/connections automatically, even on error." },
    ],
    example: `~~~
    class InsufficientBalanceException extends RuntimeException {
        InsufficientBalanceException(long needed, long available) {
            super("Need " + needed + " but only " + available);
        }
    }

    try (var reader = new BufferedReader(new FileReader("orders.csv"))) {
        // reader is closed automatically
    } catch (IOException e) {
        throw new ImportFailedException("Could not read orders", e); // keep the cause
    }
    ~~~`,
    mistakes: [
      "catch (Exception e) {} — swallowing errors silently.",
      "Using exceptions for normal flow (like ending a loop).",
      "Throwing a new exception without passing the original as the cause.",
      "An overriding method throwing a broader checked exception than the parent — not allowed.",
    ],
    remember: "Checked = expected problems to handle; unchecked = bugs; wrap and keep the cause.",
  },

  "Generics & type safety": {
    simple: `Generics let you write a class or method once and use it with any type, while the compiler still checks the types for you.

    List<String> can only hold Strings — try adding a number and it won't compile, and when you read from it you get a String without casting. Before generics, mistakes only showed up as crashes at runtime.`,
    analogy: `Labelled storage boxes: a box labelled "Shoes" only takes shoes, and when you open it you know you'll get shoes. A generic class is the box design; the label (the type argument) is chosen when you use it.`,
    concepts: [
      { term: "Type parameter", meaning: "The placeholder in a generic class, like T in Box<T>." },
      { term: "Bounded type", meaning: "<T extends Number> — T must be Number or a subclass." },
      { term: "Wildcard ?", meaning: "An unknown type: List<?>, List<? extends Number>, List<? super Integer>." },
      { term: "PECS", meaning: "Producer Extends, Consumer Super — which wildcard to use." },
      { term: "Type erasure", meaning: "Generic types are removed after compiling; at runtime List<String> is just List." },
    ],
    example: `~~~
    class Box<T> {
        private T item;
        void put(T item) { this.item = item; }
        T get() { return item; }
    }

    Box<String> b = new Box<>();
    b.put("hello");
    String s = b.get();       // no cast needed
    // b.put(42);             // compile error — type safety

    static double sum(List<? extends Number> nums) {  // works for List<Integer>, List<Double>
        double total = 0;
        for (Number n : nums) total += n.doubleValue();
        return total;
    }
    ~~~`,
    mistakes: [
      "Using raw types (List instead of List<String>).",
      "Trying new T() or instanceof List<String> — erasure makes them impossible.",
      "Expecting List<Integer> to be a List<Number> — it isn't; use List<? extends Number>.",
    ],
    remember: "Generics = write once for any type, with compile-time checks.",
  },

  "Association, aggregation & composition": {
    simple: `These describe how objects are connected when one "has" another (HAS-A), from weakest to strongest:

    - Association: two objects simply know each other (a teacher and a student).
    - Aggregation: a whole contains parts, but the parts can live on their own (a team and its players).
    - Composition: a whole owns its parts completely; when the whole is gone, the parts are gone too (a house and its rooms).`,
    analogy: `- A doctor and patients: they interact, but neither owns the other — association.
    - A WhatsApp group and its members: delete the group, the people still exist — aggregation.
    - Your body and your heart: the heart doesn't exist separately from you — composition.`,
    visual: "has-a",
    concepts: [
      { term: "IS-A", meaning: "Inheritance. A Car is a Vehicle." },
      { term: "HAS-A", meaning: "A field pointing to another object. A Car has an Engine." },
      { term: "Aggregation", meaning: "Weak has-a; parts are passed in and can be shared. UML: hollow diamond ◇." },
      { term: "Composition", meaning: "Strong has-a; parts are created and owned by the whole. UML: filled diamond ◆." },
      { term: "Multiplicity", meaning: "How many: 1, 0..1, 1..*, 0..*." },
    ],
    example: `~~~
    // Composition: House creates and owns its rooms
    class House {
        private final List<Room> rooms = List.of(new Room("Hall"), new Room("Kitchen"));
    }

    // Aggregation: Team is given players that exist independently
    class Team {
        private final List<Player> players;
        Team(List<Player> players) { this.players = players; }
    }
    ~~~`,
    compare: {
      head: ["", "Association", "Aggregation", "Composition"],
      rows: [
        ["Relationship", "uses / knows", "has-a (weak)", "owns (strong)"],
        ["Part lives without whole?", "Yes", "Yes", "No"],
        ["Shared?", "Yes", "Can be", "No"],
        ["UML", "line / arrow", "hollow diamond ◇", "filled diamond ◆"],
        ["Example", "Doctor – Patient", "Team – Player", "House – Room"],
      ],
    },
    mistakes: [
      "Putting the diamond on the wrong end — it goes on the whole (the owner).",
      "Calling every has-a 'composition' — check whether the part can exist alone.",
    ],
    remember: "Association knows, aggregation has (parts survive), composition owns (parts die with it).",
  },

  "Composition over inheritance": {
    simple: `This principle says: prefer building a class out of other objects (has-a) instead of extending a parent class (is-a), unless there's a genuine is-a relationship.

    With inheritance you're stuck with one parent and all its internals, and behaviour is fixed when you write the code. With composition you hold a reference to a helper object and can swap it any time — even while the program runs.`,
    analogy: `A phone with a fixed built-in camera is inheritance: to get a better camera you need a new phone. A DSLR with interchangeable lenses is composition: swap the lens (behaviour) whenever you need, without replacing the camera.`,
    visual: "composition-over-inheritance",
    concepts: [
      { term: "Delegation", meaning: "Your object forwards work to an object it holds." },
      { term: "Fragile base class", meaning: "A change in the parent unexpectedly breaks children." },
      { term: "Class explosion", meaning: "Needing a subclass for every combination: FlyingSwimmingDuck…" },
      { term: "Runtime flexibility", meaning: "With composition you can change behaviour by setting a different object." },
    ],
    example: `~~~
    interface FlyBehavior { void fly(); }
    class FlyWithWings implements FlyBehavior { public void fly() { System.out.println("Flap flap"); } }
    class CantFly implements FlyBehavior { public void fly() { System.out.println("Can't fly"); } }

    class Duck {
        private FlyBehavior flyBehavior;
        Duck(FlyBehavior f) { this.flyBehavior = f; }
        void setFlyBehavior(FlyBehavior f) { this.flyBehavior = f; }  // swap at runtime
        void performFly() { flyBehavior.fly(); }
    }

    Duck rubberDuck = new Duck(new CantFly());
    ~~~`,
    mistakes: [
      "Saying 'never use inheritance' — it's right for real, stable is-a hierarchies.",
      "Extending a class just to reuse one or two methods.",
    ],
    remember: "Reuse by holding objects (has-a) unless it truly is-a.",
  },

  "UML class diagrams": {
    simple: `A UML class diagram is a quick drawing of your classes and how they connect. In LLD interviews it's how you show your design before writing code.

    Each class is a box with three parts: name, fields, methods. Lines and arrows between boxes show relationships: inheritance, implementing an interface, has-a, uses-a.`,
    analogy: `It's the floor plan of your code. Before building a house you draw rooms and doors on paper so everyone agrees; before coding, you draw classes and their connections so the interviewer can follow your design.`,
    visual: "uml-arrows",
    concepts: [
      { term: "Visibility", meaning: "+ public, - private, # protected, ~ package." },
      { term: "Inheritance arrow", meaning: "Solid line with hollow triangle pointing at the parent." },
      { term: "Realisation", meaning: "Dashed line with hollow triangle pointing at the interface." },
      { term: "Aggregation / composition", meaning: "Hollow ◇ / filled ◆ diamond on the owner's side." },
      { term: "Dependency", meaning: "Dashed open arrow — 'uses for a moment' (parameter or local variable)." },
      { term: "Multiplicity", meaning: "Numbers on line ends: 1, 0..1, 1..*, 0..*." },
    ],
    example: `How a class box is written:

    ~~~
    +---------------------------+
    | ParkingLot                |
    +---------------------------+
    | - floors: List<Floor>     |
    | - pricing: PricingStrategy|
    +---------------------------+
    | + park(v: Vehicle): Ticket|
    | + unpark(id: String): Bill|
    +---------------------------+
    ~~~`,
    mistakes: [
      "Drawing every getter and setter — skip them.",
      "Arrowheads pointing the wrong way: inheritance points from child to parent.",
      "Spending 20 minutes on a perfect diagram and running out of time to code.",
    ],
    remember: "Boxes for classes, triangles for is-a, diamonds for has-a, dashes for 'implements' or 'uses'.",
  },

  "SOLID: SRP & OCP": {
    simple: `SOLID is five design rules for code that's easy to change. These are the first two.

    - S — Single Responsibility: a class should have only one reason to change. If accountants, designers and DBAs would all ask you to edit the same class, it's doing too much.
    - O — Open/Closed: you should be able to add new behaviour by adding new code, not by editing code that already works. The classic sign of breaking it is a switch/if-else on a type that grows every time a feature is added.`,
    analogy: `SRP: in a hospital, the receptionist books appointments, the doctor treats, the pharmacist gives medicine. If one person did all three, any change in any area would disrupt everything.

    OCP: a phone charger with a universal socket. New devices plug in with their own cable (new code); you don't rewire the socket (old code).`,
    visual: "srp",
    concepts: [
      { term: "Responsibility", meaning: "A reason to change, usually tied to one group of people asking for changes." },
      { term: "Cohesion", meaning: "How closely related a class's parts are. SRP increases it." },
      { term: "Extension point", meaning: "An interface where new behaviour plugs in (PaymentMethod)." },
      { term: "Replace conditional with polymorphism", meaning: "The usual fix for OCP: each case becomes a class." },
    ],
    example: `Breaking OCP — every new payment method edits this method:

    ~~~
    double fee(String method, double amt) {
        if (method.equals("CARD")) return amt * 0.02;
        else if (method.equals("UPI")) return 0;
        else if (method.equals("WALLET")) return amt * 0.01;
        throw new IllegalArgumentException(method);
    }
    ~~~

    Following OCP — new methods are new classes:

    ~~~
    interface PaymentMethod { double fee(double amt); }
    class Card implements PaymentMethod   { public double fee(double a) { return a * 0.02; } }
    class Upi implements PaymentMethod    { public double fee(double a) { return 0; } }
    class Wallet implements PaymentMethod { public double fee(double a) { return a * 0.01; } }
    ~~~`,
    mistakes: [
      "Thinking SRP means one method per class.",
      "Adding interfaces 'for OCP' where nothing will ever vary — that's over-engineering.",
    ],
    remember: "SRP: one reason to change. OCP: add new classes, don't edit working ones.",
  },

  "SOLID: LSP, ISP & DIP": {
    simple: `The last three SOLID rules:

    - L — Liskov Substitution: a child class must work anywhere the parent works, without surprises. If code breaks when you pass a subclass, the inheritance is wrong.
    - I — Interface Segregation: many small, focused interfaces are better than one giant one. Don't force a class to implement methods it doesn't need.
    - D — Dependency Inversion: important business code should depend on interfaces, not on specific tools like MySQL. Then you can swap the tool, or use a fake in tests.`,
    analogy: `LSP: if you hire a "driver", any driver should be able to drive your car. Someone who's a "driver" but can only drive automatics breaks your expectations.

    ISP: a restaurant menu split into veg, non-veg and drinks, instead of one 40-page book everyone must read.

    DIP: a wall socket. Your laptop depends on the standard socket shape (the interface), not on which power plant made the electricity.`,
    visual: "dip",
    concepts: [
      { term: "Substitutability", meaning: "Child objects can replace parent objects without breaking callers." },
      { term: "Square–Rectangle problem", meaning: "The classic LSP violation: setting a square's width also changes its height." },
      { term: "Fat interface", meaning: "An interface with methods many implementers don't need." },
      { term: "High-level module", meaning: "Business logic (OrderService)." },
      { term: "Low-level module", meaning: "Details like databases, email or HTTP clients." },
      { term: "Dependency injection", meaning: "Passing dependencies in from outside — a common way to apply DIP." },
    ],
    example: `ISP — split the fat interface:

    ~~~
    // ✗ A simple printer is forced to implement scan() and fax()
    interface Machine { void print(); void scan(); void fax(); }

    // ✓
    interface Printer { void print(); }
    interface Scanner { void scan(); }
    class SimplePrinter implements Printer { public void print() { } }
    class OfficeMachine implements Printer, Scanner { public void print() { } public void scan() { } }
    ~~~

    DIP — depend on the interface:

    ~~~
    class OrderService {
        private final OrderRepository repo;          // interface, not MySqlOrderRepo
        OrderService(OrderRepository repo) { this.repo = repo; }
    }
    ~~~`,
    mistakes: [
      "Overriding a method to throw UnsupportedOperationException — a red flag for LSP.",
      "Confusing DIP (a principle) with DI (a technique).",
    ],
    remember: "LSP: children don't surprise. ISP: small interfaces. DIP: depend on interfaces, not tools.",
  },

  "Coupling, cohesion, DRY, KISS & YAGNI": {
    simple: `A handful of everyday design rules:

    - Low coupling: classes shouldn't depend heavily on each other's insides, so a change in one doesn't ripple everywhere.
    - High cohesion: each class does one focused job.
    - DRY (Don't Repeat Yourself): each piece of knowledge lives in one place.
    - KISS (Keep It Simple): choose the simplest design that works.
    - YAGNI (You Aren't Gonna Need It): don't build features "just in case".
    - Law of Demeter: talk to your direct friends, not to friends of friends (avoid a.getB().getC().doX()).`,
    analogy: `Low coupling, high cohesion is like a well-organised kitchen: spices in one drawer, utensils in another (cohesion), and you can replace the toaster without rewiring the fridge (low coupling).

    YAGNI: don't buy a 10-seater car "in case" you have a big family someday.`,
    concepts: [
      { term: "Coupling", meaning: "How much one class depends on another. Aim low." },
      { term: "Cohesion", meaning: "How related the things inside one class are. Aim high." },
      { term: "DRY", meaning: "Don't duplicate knowledge or rules." },
      { term: "KISS", meaning: "Simple beats clever." },
      { term: "YAGNI", meaning: "Build only what's needed now." },
      { term: "Law of Demeter", meaning: "Only call methods on yourself, your fields, parameters and objects you create." },
    ],
    example: `Law of Demeter:

    ~~~
    // ✗ reaches through three objects
    String city = order.getCustomer().getAddress().getCity();

    // ✓ ask the object you have
    String city = order.shippingCity();
    ~~~`,
    mistakes: [
      "Applying DRY to code that only looks similar but changes for different reasons — merging it couples them.",
      "Building plugin systems and factories nobody asked for in an interview (YAGNI).",
    ],
    remember: "Low coupling, high cohesion, and only build what's needed — simply.",
  },

  "Dependency injection & testability": {
    simple: `Dependency injection (DI) means a class receives the objects it needs from outside instead of creating them itself with new.

    Why it matters: if OrderService creates its own MySQL repository inside, you can never test it without a real database. If the repository is passed in, a test can pass a fake one. Frameworks like Spring do this wiring for you automatically.`,
    analogy: `A cook who's handed ingredients (injected) can cook in any kitchen and you can test their recipe with sample ingredients. A cook who insists on growing their own vegetables before cooking (creating dependencies) can only work on their own farm.`,
    visual: "di-flow",
    concepts: [
      { term: "Dependency", meaning: "An object your class needs to do its job (repository, payment gateway, clock)." },
      { term: "Constructor injection", meaning: "Pass dependencies in the constructor. Preferred: required, final, visible." },
      { term: "Setter injection", meaning: "For optional dependencies." },
      { term: "IoC container", meaning: "A framework (Spring) that creates and wires objects for you." },
      { term: "Mock / fake", meaning: "A test stand-in for a real dependency." },
    ],
    example: `~~~
    class PaymentService {
        private final PaymentGateway gateway;
        private final Clock clock;

        PaymentService(PaymentGateway gateway, Clock clock) {   // injected
            this.gateway = gateway;
            this.clock = clock;
        }
    }

    // production
    new PaymentService(new RazorpayGateway(), Clock.systemUTC());
    // test
    new PaymentService(new FakeGateway(), Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC));
    ~~~`,
    mistakes: [
      "Field injection (@Autowired on private fields) everywhere — hides dependencies and blocks final.",
      "Calling LocalDate.now() or new HttpClient() deep inside business logic — hidden dependencies.",
    ],
    remember: "Don't create what you depend on — receive it. That's what makes code testable.",
  },

  "Creational: Singleton, Factory & Builder": {
    simple: `Creational patterns are about how objects get created.

    - Singleton: only one object of a class should ever exist (a config manager, a logger).
    - Factory: callers ask for "a notification of type SMS" and the factory decides which class to create, so callers never use new on concrete classes.
    - Builder: build an object with many optional settings step by step, instead of a constructor with 10 parameters.`,
    analogy: `Singleton: a country has one Prime Minister at a time.

    Factory: at a car showroom you say "I want the SUV model" — you don't assemble it yourself; the factory decides how it's built.

    Builder: ordering a Subway sandwich — choose bread, then filling, then sauces, step by step, and at the end you get one finished sandwich.`,
    visual: "builder",
    concepts: [
      { term: "Singleton", meaning: "Private constructor + one static instance + a global access method." },
      { term: "Lazy initialisation", meaning: "Create the instance only when first needed." },
      { term: "Simple factory", meaning: "One method that returns the right subclass based on input." },
      { term: "Factory Method", meaning: "Subclasses decide which object to create." },
      { term: "Abstract Factory", meaning: "Creates families of related objects (all dark-theme widgets)." },
      { term: "Builder", meaning: "Chain optional settings, then build() a complete (often immutable) object." },
    ],
    example: `~~~
    // Thread-safe lazy singleton (holder idiom)
    class Logger {
        private Logger() {}
        private static class Holder { static final Logger INSTANCE = new Logger(); }
        static Logger get() { return Holder.INSTANCE; }
    }

    // Simple factory
    class NotificationFactory {
        static Notification create(String type) {
            return switch (type) {
                case "SMS" -> new SmsNotification();
                case "EMAIL" -> new EmailNotification();
                default -> throw new IllegalArgumentException(type);
            };
        }
    }
    ~~~`,
    compare: {
      head: ["Pattern", "Use it when", "Real example"],
      rows: [
        ["Singleton", "Exactly one shared instance is needed", "Runtime.getRuntime(), Spring beans"],
        ["Factory", "Callers shouldn't know which concrete class they get", "Calendar.getInstance(), List.of()"],
        ["Builder", "Many optional parameters, want an immutable result", "StringBuilder, HttpRequest.newBuilder()"],
      ],
    },
    mistakes: [
      "Double-checked locking without volatile — another thread can see a half-built object.",
      "Using a singleton as a global variable bucket — makes testing hard.",
    ],
    remember: "Singleton = one instance, Factory = hide which class, Builder = step-by-step construction.",
  },

  "Structural: Adapter, Decorator, Facade & Proxy": {
    simple: `Structural patterns are about how objects fit together.

    - Adapter: makes an object with the "wrong" interface fit the one your code expects.
    - Decorator: adds extra features to an object by wrapping it, layer by layer.
    - Facade: gives one simple entry point to a complicated set of classes.
    - Proxy: a stand-in with the same interface that controls access to the real object (loads it lazily, caches, checks permissions).`,
    analogy: `- Adapter: a travel plug adapter so your Indian charger fits a UK socket.
    - Decorator: a plain coffee, then add milk, then add sugar, then whipped cream — each layer adds something and it's still a coffee.
    - Facade: a hotel receptionist — one person handles taxis, room service and laundry for you.
    - Proxy: a security guard at the office gate who checks your ID before letting you reach the real office.`,
    visual: "decorator",
    concepts: [
      { term: "Adapter", meaning: "Converts one interface into another. Example: Arrays.asList." },
      { term: "Decorator", meaning: "Same interface, adds behaviour, stackable. Example: BufferedReader(FileReader)." },
      { term: "Facade", meaning: "Simple front for a complex subsystem." },
      { term: "Proxy", meaning: "Same interface, controls access. Example: Spring @Transactional, lazy loading." },
    ],
    compare: {
      head: ["Pattern", "Interface", "Purpose"],
      rows: [
        ["Adapter", "Changes it", "Make incompatible things work together"],
        ["Decorator", "Keeps it", "Add features in layers"],
        ["Facade", "New, simpler one", "Hide a complicated subsystem"],
        ["Proxy", "Keeps it", "Control access to the real object"],
      ],
    },
    example: `~~~
    interface Coffee { int cost(); }
    class Espresso implements Coffee { public int cost() { return 100; } }

    abstract class Topping implements Coffee {
        protected final Coffee inner;
        Topping(Coffee inner) { this.inner = inner; }
    }
    class Milk extends Topping {
        Milk(Coffee c) { super(c); }
        public int cost() { return inner.cost() + 20; }
    }

    Coffee c = new Milk(new Milk(new Espresso()));  // 140
    ~~~`,
    mistakes: [
      "Confusing Decorator and Proxy — decorator adds features the client chooses; proxy quietly controls access.",
    ],
    remember: "Adapter converts, Decorator adds, Facade simplifies, Proxy guards.",
  },

  "Behavioural: Strategy, Observer, State & Command": {
    simple: `Behavioural patterns are about how objects share work and communicate.

    - Strategy: put each way of doing something (each algorithm) in its own class and swap them at runtime.
    - Observer: when one object changes, it automatically notifies everyone subscribed to it.
    - State: an object behaves differently depending on its current state, and each state is its own class.
    - Command: wrap a request ("turn on light") in an object so you can queue it, log it or undo it.`,
    analogy: `- Strategy: Google Maps route options — car, bike, walk, metro. Same "get me there", different algorithm.
    - Observer: YouTube subscriptions — upload a video and every subscriber gets notified.
    - State: a traffic light — what happens next depends on whether it's red, yellow or green.
    - Command: a TV remote — each button is a command; the remote doesn't know how the TV works.`,
    visual: "strategy",
    concepts: [
      { term: "Strategy", meaning: "Family of interchangeable algorithms behind one interface. Example: Comparator." },
      { term: "Observer", meaning: "Subject + list of subscribers notified on change. Example: event listeners." },
      { term: "State", meaning: "Behaviour changes with internal state; states switch to each other." },
      { term: "Command", meaning: "A request as an object with execute() (and undo())." },
    ],
    compare: {
      head: ["", "Strategy", "State"],
      rows: [
        ["Who picks it", "The client", "The object itself, as it moves between states"],
        ["Do they know each other?", "No", "Yes — a state decides the next state"],
        ["Example", "Discount: festive / none / coupon", "Order: placed → shipped → delivered"],
      ],
    },
    example: `~~~
    interface DiscountStrategy { double apply(double amount); }
    class NoDiscount implements DiscountStrategy      { public double apply(double a) { return a; } }
    class FestiveDiscount implements DiscountStrategy { public double apply(double a) { return a * 0.8; } }

    class Cart {
        private DiscountStrategy discount = new NoDiscount();
        void setDiscount(DiscountStrategy d) { this.discount = d; }
        double total(double sum) { return discount.apply(sum); }
    }
    ~~~`,
    mistakes: [
      "Saying Strategy and State are the same because the diagrams look alike — the intent differs.",
      "Forgetting to unsubscribe observers, causing memory leaks.",
    ],
    remember: "Strategy swaps algorithms, Observer broadcasts changes, State changes behaviour, Command packages requests.",
  },

  "Choosing patterns & anti-patterns": {
    simple: `Design patterns are named solutions to common problems — a shared vocabulary, not a checklist. Good engineers start from the problem and reach for a pattern only when it clearly helps.

    Anti-patterns are common "solutions" that cause problems: a God class that does everything, singletons used as global variables, or factories and interfaces for things that will never change.`,
    analogy: `Patterns are like cooking techniques: you don't sauté, braise and flambé the same dish just because you know how. You pick the technique the dish needs.`,
    concepts: [
      { term: "Over-engineering", meaning: "Extra layers and patterns with no current need." },
      { term: "God object", meaning: "One class that knows and does everything." },
      { term: "Anaemic model", meaning: "Classes with only data; all logic lives in big service classes." },
      { term: "Primitive obsession", meaning: "Using String/int for things like money, email, phone." },
    ],
    compare: {
      head: ["If you see…", "Consider…"],
      rows: [
        ["if/switch on type that keeps growing", "Strategy or polymorphism"],
        ["Many parts must react when something happens", "Observer / events"],
        ["Constructor with many optional parameters", "Builder"],
        ["Callers shouldn't know the concrete class", "Factory"],
        ["Behaviour depends on lifecycle status", "State"],
        ["Need to add features without subclassing", "Decorator"],
        ["Third-party API doesn't match your interface", "Adapter"],
        ["Complex subsystem, callers need one simple call", "Facade"],
      ],
    },
    mistakes: [
      "Naming patterns to impress without explaining why they fit.",
      "Forcing a pattern into a 30-line problem.",
    ],
    remember: "Start from the problem; use a pattern only when you can say what it buys you.",
  },

  "How to approach an LLD interview": {
    simple: `In a Low-Level Design round you're asked to design the classes for a system like a parking lot or a movie booking app, and usually write the core code.

    The secret is the order: first understand what's being asked, then find the main objects, then connect them, then code. Interviewers judge your process as much as your final answer.`,
    analogy: `Like building furniture from IKEA: first check the picture and parts list (requirements), lay out the parts (classes), see what connects to what (relationships), then assemble (code). Starting with a screwdriver in hand before reading usually ends badly.`,
    visual: "lld-steps",
    concepts: [
      { term: "Functional requirements", meaning: "What the system must do: park, unpark, pay." },
      { term: "Nouns → classes", meaning: "Pick out nouns in the problem: Lot, Floor, Spot, Vehicle, Ticket." },
      { term: "Verbs → methods", meaning: "park(), assignSpot(), calculateFee()." },
      { term: "What varies → interface", meaning: "Pricing and spot allocation may change, so put them behind interfaces." },
      { term: "Walk-through", meaning: "Trace one full flow through your classes to prove the design works." },
    ],
    example: `A good opening in the interview:

    "Before I design, let me confirm the scope. Are there multiple floors? Which vehicle types? Is pricing hourly or flat? Do we need payments, or just tickets? I'll assume a single building, three vehicle types and hourly pricing — I'll make pricing pluggable so we can change it later."`,
    mistakes: [
      "Coding before agreeing on requirements.",
      "One huge Manager class that does everything.",
      "Using a pattern for every class.",
      "Not leaving time to write code and walk through a flow.",
    ],
    remember: "Requirements → entities → relationships → class diagram → flows → code → extensions.",
  },

  "LLD: Parking lot": {
    simple: `The most common LLD question. You design classes so cars can enter, get a spot and a ticket, and pay when they leave.

    Main ideas: the lot has floors, floors have spots (composition). Different vehicles need different spot sizes. How a spot is chosen and how the price is calculated are likely to change, so each goes behind an interface (Strategy pattern).`,
    analogy: `A mall parking: a gate gives you a ticket with the time, a display shows free spots per floor, and at exit you pay based on time parked. Bikes go in small spots, SUVs in large ones.`,
    visual: "parking-lot",
    concepts: [
      { term: "ParkingLot", meaning: "Entry point: park(vehicle) → Ticket, unpark(ticket) → Bill." },
      { term: "Floor / Spot", meaning: "Physical structure; a Spot has a type and is free or occupied." },
      { term: "Vehicle", meaning: "Abstract; Car, Bike, Truck each know which spot type they need." },
      { term: "Ticket", meaning: "Which vehicle, which spot, entry time." },
      { term: "SpotAllocationStrategy", meaning: "Nearest first, floor by floor… swappable." },
      { term: "PricingStrategy", meaning: "Hourly, weekend, flat… swappable." },
    ],
    example: `~~~
    public Ticket park(Vehicle v) {
        Spot spot = allocation.find(floors, v.spotType())
                .orElseThrow(() -> new LotFullException(v.spotType()));
        spot.occupy(v);
        Ticket t = new Ticket(UUID.randomUUID().toString(), v, spot, clock.instant());
        active.put(t.id(), t);
        return t;
    }
    ~~~`,
    mistakes: [
      "Ignoring two cars grabbing the same spot at the same moment — mention locking or atomic allocation.",
      "Hard-coding pricing inside ParkingLot.",
      "Making Spot know about pricing or tickets.",
    ],
    remember: "Lot ◆ Floor ◆ Spot, abstract Vehicle, and strategies for allocation and pricing.",
  },

  "LLD: Elevator system": {
    simple: `Design the classes for elevators in a building: people press a button on a floor (up/down) or inside the lift (a floor number), and the system decides which elevator goes where.

    Key ideas: each elevator moves through states (idle, moving up, moving down, doors open) — a natural fit for the State pattern. A dispatcher assigns floor requests to elevators using a pluggable scheduling algorithm.`,
    analogy: `An office lift: if it's going up, it stops at every requested floor on the way up before turning around — just like a person running errands in one direction before coming back.`,
    visual: "elevator-states",
    concepts: [
      { term: "Elevator", meaning: "Current floor, direction, state, set of stops." },
      { term: "Request", meaning: "External (floor + direction) or internal (target floor)." },
      { term: "Dispatcher", meaning: "Chooses which elevator handles an external request." },
      { term: "SCAN / LOOK", meaning: "Keep going in one direction serving stops, then reverse. LOOK reverses early when nothing is ahead." },
      { term: "State pattern", meaning: "Each state class decides what a request or arrival means." },
    ],
    example: `~~~
    interface ElevatorState {
        void onRequest(Elevator e, int floor);
        void onArrive(Elevator e, int floor);
    }

    class MovingUp implements ElevatorState {
        public void onArrive(Elevator e, int floor) {
            if (e.hasStopAt(floor)) e.setState(new DoorsOpen());
        }
        public void onRequest(Elevator e, int floor) { e.addStop(floor); }
    }
    ~~~`,
    mistakes: [
      "Putting all state logic in one huge if-else on a status field.",
      "Forgetting the multiple-elevator case and how the dispatcher chooses.",
    ],
    remember: "State pattern for each elevator, a dispatcher with a pluggable scheduling strategy.",
  },

  "LLD: Movie ticket booking (BookMyShow)": {
    simple: `Design a system where users search movies, pick a show and seats, pay, and get a ticket.

    The tricky part is making sure two people can't book the same seat. The standard answer: when you select seats, they're temporarily locked for a few minutes; if you pay in time they become booked, otherwise the lock expires and the seats are free again.`,
    analogy: `Like putting items in your cart during a flash sale: the item is held for you for 10 minutes. Pay in time and it's yours; otherwise it goes back for someone else.`,
    visual: "seat-booking",
    concepts: [
      { term: "Show", meaning: "A movie on a screen at a time; holds per-seat status for that show." },
      { term: "Seat lock", meaning: "A temporary hold with a time limit (TTL)." },
      { term: "Booking states", meaning: "Created → Pending payment → Confirmed / Cancelled / Expired." },
      { term: "Atomic locking", meaning: "Lock all chosen seats or none, so a group booking never half-succeeds." },
    ],
    example: `~~~
    boolean lockSeats(Show show, List<Seat> seats, User user) {
        synchronized (show) {                       // or a DB/Redis lock at scale
            if (seats.stream().anyMatch(s -> !show.isAvailable(s))) return false;
            seats.forEach(s -> show.lock(s, user, Duration.ofMinutes(10)));
            return true;
        }
    }
    ~~~`,
    mistakes: [
      "Booking seats directly without a lock step — two users race to pay for the same seat.",
      "Forgetting to release locks when payment fails or times out.",
    ],
    remember: "Available → Locked (with timeout) → Booked; lock all seats atomically.",
  },

  "LLD: Splitwise (expense sharing)": {
    simple: `Design an app where friends add shared expenses and see who owes whom.

    An expense has a payer, an amount and splits — equal, exact amounts, or percentages. Each split type follows different rules, so they're separate classes behind one interface (Strategy). A balance sheet keeps a running total of who owes whom.`,
    analogy: `A Goa trip with friends: Rahul pays ₹3,000 for dinner split equally among three; Priya pays ₹2,000 for cab split 50/30/20. At the end you want "who pays whom" with the fewest transfers.`,
    visual: "splitwise",
    concepts: [
      { term: "Expense", meaning: "Payer, amount, and a list of splits." },
      { term: "Split types", meaning: "Equal, Exact, Percent — each validates its own rules." },
      { term: "Balance sheet", meaning: "Map of user → (user → amount owed)." },
      { term: "Simplify debts", meaning: "Net each person's balance, then match biggest creditor with biggest debtor." },
    ],
    example: `~~~
    interface SplitStrategy {
        Map<User, Long> shares(long amountPaise, List<User> users, List<Double> values);
    }

    class EqualSplit implements SplitStrategy {
        public Map<User, Long> shares(long amt, List<User> users, List<Double> ignored) {
            long each = amt / users.size();
            long leftover = amt - each * users.size();          // give rounding paise to the first user
            Map<User, Long> out = new LinkedHashMap<>();
            for (int i = 0; i < users.size(); i++) out.put(users.get(i), each + (i == 0 ? leftover : 0));
            return out;
        }
    }
    ~~~`,
    mistakes: [
      "Using double for money — rounding errors. Use paise (long) or BigDecimal.",
      "Not validating that percentages add to 100 or exact amounts add to the total.",
    ],
    remember: "Expense + pluggable split strategies + a balance sheet; money as integers.",
  },

  "LLD: LRU cache & rate limiter": {
    simple: `Two favourite senior-level design-and-code questions.

    LRU cache: a fixed-size store that, when full, throws out the item used least recently. To make both get and put O(1) you combine a HashMap (fast lookup) with a doubly linked list (keeps the usage order).

    Rate limiter: decides whether a client's request is allowed, e.g. "max 100 requests per minute". The token bucket algorithm is the usual answer: tokens refill at a steady rate, each request spends one.`,
    analogy: `LRU: your phone's recent apps list — open an app and it jumps to the front; when there's no room, the one you haven't used for longest gets closed.

    Token bucket: a metro card topped up with a fixed amount every minute. Each ride spends some; if the card is empty you wait.`,
    visual: "lru",
    concepts: [
      { term: "HashMap + doubly linked list", meaning: "Map finds the node; the list moves it to the front or evicts the tail, all O(1)." },
      { term: "Eviction policy", meaning: "LRU, LFU, FIFO — make it pluggable." },
      { term: "Token bucket", meaning: "Refill r tokens per second up to b; allows short bursts." },
      { term: "Fixed vs sliding window", meaning: "Counting per clock-minute can allow 2× bursts at the edges; sliding windows smooth it out." },
    ],
    example: `Quick LRU in Java using LinkedHashMap (mention it, then show the manual version if asked):

    ~~~
    class LRUCache<K, V> extends LinkedHashMap<K, V> {
        private final int capacity;
        LRUCache(int capacity) {
            super(16, 0.75f, true);          // true = order by access
            this.capacity = capacity;
        }
        @Override protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
            return size() > capacity;
        }
    }
    ~~~`,
    mistakes: [
      "Using a singly linked list — removing a node from the middle becomes O(n).",
      "Forgetting that get() also changes the order, so it must be thread-safe too.",
    ],
    remember: "LRU = HashMap + doubly linked list. Rate limiter = token bucket per client.",
  },

  "Machine coding round": {
    simple: `In a machine coding round you get 60–120 minutes to build a small working program (like Snake & Ladder, Splitwise or a parking lot) that actually runs — usually from the console, no UI.

    You're judged on: does it work, is the code cleanly organised, are classes well named and focused, and can it handle the twist the interviewer adds near the end ("now add a second type of dice").`,
    analogy: `It's like a cooking competition with a time limit: a simple dish that's fully cooked and plated beats an ambitious one that's half-raw when time's up.`,
    visual: "machine-coding",
    concepts: [
      { term: "Models", meaning: "Plain classes for the domain: Board, Player, Snake." },
      { term: "Services", meaning: "The rules and flow: GameService.play()." },
      { term: "Strategies", meaning: "Parts likely to change: DiceStrategy." },
      { term: "Repository", meaning: "In-memory storage using a Map." },
      { term: "Driver", meaning: "A Main class that wires everything and runs sample input." },
    ],
    example: `~~~
    src/
      model/       Board, Player, Snake, Ladder
      service/     GameService
      strategy/    DiceStrategy, NormalDice, CrookedDice
      repository/  InMemoryPlayerRepository
      exception/   InvalidMoveException
      Main.java
    ~~~

    Timeline for 90 minutes: 10 min understand & ask, 10 min class sketch, 45 min core flow working end to end, 15 min extras/edge cases, 10 min run samples and clean up.`,
    mistakes: [
      "Writing everything in one file/class.",
      "Building a fancy framework and not finishing the basic flow.",
      "Not matching the given input/output format exactly.",
    ],
    remember: "Working first, clean second, clever last.",
  },

  "Concurrency in OO design": {
    simple: `When several threads use the same object at once, things can go wrong in subtle ways. A class is thread-safe if it still behaves correctly when many threads call it together.

    The safest options, in order: don't share the object between threads; make it immutable so it can't be changed; or protect the shared data with synchronization, locks or atomic classes.`,
    analogy: `Two people editing the same Google Sheet cell at the same moment: one person's change can overwrite the other's. Locks are like "only one person can edit this cell at a time".`,
    visual: "race",
    concepts: [
      { term: "Race condition", meaning: "The result depends on the timing of threads — like two count++ losing an update." },
      { term: "synchronized", meaning: "Only one thread at a time can run the block for that lock." },
      { term: "Atomic classes", meaning: "AtomicInteger etc. — lock-free safe updates of one value." },
      { term: "Deadlock", meaning: "Two threads each wait for a lock the other holds — both stuck forever." },
      { term: "Thread confinement", meaning: "Keep data used by only one thread (local variables)." },
    ],
    example: `~~~
    // ✗ Not thread-safe: count++ is read, add, write
    class Counter { private int count; void increment() { count++; } }

    // ✓ Thread-safe
    class SafeCounter {
        private final AtomicInteger count = new AtomicInteger();
        void increment() { count.incrementAndGet(); }
        int get() { return count.get(); }
    }

    // ✓ Avoid deadlock: always lock accounts in the same order (by id)
    void transfer(Account a, Account b, long amt) {
        Account first = a.id() < b.id() ? a : b, second = first == a ? b : a;
        synchronized (first) { synchronized (second) { a.debit(amt); b.credit(amt); } }
    }
    ~~~`,
    mistakes: [
      "Making only the write method synchronized but not the read.",
      "Check-then-act on a map (if (!map.containsKey(k)) map.put(k, v)) — use putIfAbsent / computeIfAbsent.",
      "Returning internal mutable collections from a thread-safe class.",
    ],
    remember: "Don't share, or don't mutate, or lock — in that order of preference.",
  },

  "Code review & refactoring smells": {
    simple: `A "code smell" is a sign that code might be badly designed — it works, but it'll be painful to change. Senior interviews often show you messy code and ask "what's wrong and how would you fix it?"

    Refactoring is improving the design without changing what the code does, in small safe steps, with tests running after each step.`,
    analogy: `Like a messy room: you can still live in it, but finding anything takes forever. Refactoring is tidying up one shelf at a time without throwing away anything you need.`,
    concepts: [
      { term: "Long method / large class", meaning: "Doing too much — split it (SRP)." },
      { term: "Switch on type", meaning: "Missing polymorphism — replace with classes." },
      { term: "Feature envy", meaning: "A method that mostly uses another class's data — move it there." },
      { term: "Primitive obsession", meaning: "Using String/double for money, email — create small value classes." },
      { term: "Shotgun surgery", meaning: "One change needs edits in many places." },
      { term: "Characterisation test", meaning: "A test that pins current behaviour before you refactor legacy code." },
    ],
    compare: {
      head: ["Smell", "Typical fix"],
      rows: [
        ["Long method", "Extract method"],
        ["Large class", "Extract class"],
        ["switch on type code", "Replace conditional with polymorphism"],
        ["Feature envy", "Move method"],
        ["Long parameter list / data clumps", "Introduce parameter object"],
        ["Primitive obsession", "Introduce value object (Money, Email)"],
        ["Duplicate code", "Extract and reuse (if it changes for the same reason)"],
      ],
    },
    example: `~~~
    // before: smells of switch-on-type
    double pay(Employee e) {
        switch (e.type) {
            case FULL_TIME: return e.salary / 12;
            case CONTRACT:  return e.hours * e.rate;
            default:        return e.stipend;
        }
    }

    // after: each type owns its rule
    interface Employee { double monthlyPay(); }
    record FullTime(double salary) implements Employee { public double monthlyPay() { return salary / 12; } }
    record Contractor(double hours, double rate) implements Employee { public double monthlyPay() { return hours * rate; } }
    ~~~`,
    mistakes: [
      "Refactoring and changing behaviour in the same step.",
      "Pointing out smells without suggesting a concrete fix.",
    ],
    remember: "Name the smell, name the fix, change in small steps under tests.",
  },

  "Designing for extensibility": {
    simple: `Extensible design means new features can be added mostly by adding new code, not by rewriting the core.

    You do this by finding the parts that are likely to change (payment providers, notification channels, rules) and putting an interface there. For things like "when an order is placed, also do X", publishing an event lets new features subscribe without the order code ever knowing about them.`,
    analogy: `A power strip: the strip doesn't care whether you plug in a lamp, a laptop or a phone charger. New devices just plug in; you never rewire the strip.`,
    visual: "events",
    concepts: [
      { term: "Extension point", meaning: "An interface where new implementations plug in." },
      { term: "Plugin / registry", meaning: "Implementations registered by name or discovered (Spring beans, ServiceLoader)." },
      { term: "Domain event", meaning: "A message like OrderPlaced that other parts can react to." },
      { term: "Backward compatibility", meaning: "Changing a public interface without breaking existing users." },
    ],
    compare: {
      head: ["", "Direct method call", "Event"],
      rows: [
        ["Coupling", "Caller knows the receiver", "Publisher doesn't know subscribers"],
        ["Adding a new reaction", "Edit the caller", "Add a subscriber"],
        ["Errors", "Immediate, easy to trace", "Must be handled separately"],
        ["Use for", "Commands that need a result", "Side effects (emails, analytics)"],
      ],
    },
    mistakes: [
      "Making everything an event — flow becomes impossible to follow.",
      "Adding abstract methods to a widely used interface (breaks every implementer) instead of a default method.",
    ],
    remember: "Interfaces where things vary, events for side effects, keep public contracts stable.",
  },

  "OOP rapid-fire round-up": {
    simple: `Short questions interviewers fire at the end of an OOP round to check your basics. You should answer each in one or two sentences, ideally with a tiny example.`,
    analogy: `Like a quick viva after a lab exam: confident, short, correct answers matter more than long explanations.`,
    concepts: [
      { term: "Override static?", meaning: "No — it's method hiding." },
      { term: "Override private?", meaning: "No — not visible to the child." },
      { term: "final / static / abstract constructor?", meaning: "None are allowed." },
      { term: "Shallow vs deep copy", meaning: "Shallow shares nested objects; deep copies them too." },
      { term: "Marker interface", meaning: "No methods, just a tag: Serializable, Cloneable." },
      { term: "Static nested vs inner class", meaning: "Inner class needs an outer object; static nested doesn't." },
    ],
    compare: {
      head: ["Question", "Answer"],
      rows: [
        ["Can an abstract class have a constructor?", "Yes"],
        ["Can an interface have a constructor?", "No"],
        ["Can we create an object of an abstract class?", "No (only of a concrete subclass, or an anonymous class)"],
        ["Can a class extend two classes?", "No; it can implement many interfaces"],
        ["Can main() be overloaded?", "Yes, but the JVM only calls main(String[])"],
        ["Is Java pass-by-reference?", "No — always pass-by-value (the value of a reference is copied)"],
        ["Can an interface extend another interface?", "Yes, even several"],
        ["== vs equals()", "Same object vs same meaning"],
      ],
    },
    example: `Shallow vs deep copy:

    ~~~
    class Team { List<String> players = new ArrayList<>(); }

    Team a = new Team();
    Team shallow = new Team(); shallow.players = a.players;                   // shares the list
    Team deep = new Team();    deep.players = new ArrayList<>(a.players);     // own copy

    a.players.add("Virat");
    // shallow.players has Virat, deep.players doesn't
    ~~~`,
    mistakes: [
      "Saying Java is pass-by-reference for objects.",
      "Long, rambling answers to yes/no questions.",
    ],
    remember: "Short, correct, with a one-line example.",
  },
};
