import type { InterviewQA } from "./index";

// Interview Q&A for the Programming track's one-language lessons, keyed by topic title (see src/data/topics.ts).
// Java questions follow the usual GeeksforGeeks / javatpoint Collections lists; Python ones its data-type lists.
export const CODE_QA: Record<string, InterviewQA[]> = {
  "Collections Framework & List: ArrayList vs LinkedList": [
    {
      q: "What is the Java Collections Framework?",
      short: "Ready-made data structures in java.util: interfaces (List, Set, Queue, Map) plus classes that implement them.",
      a: `A unified set of interfaces, implementations and algorithms in \`java.util\` for storing and processing groups of objects.

      - Interfaces: \`Collection\` → \`List\`, \`Set\`, \`Queue\` / \`Deque\`; plus \`Map\` as a separate hierarchy.
      - Classes: \`ArrayList\`, \`LinkedList\`, \`HashSet\`, \`TreeSet\`, \`ArrayDeque\`, \`PriorityQueue\`, \`HashMap\`, \`TreeMap\`...
      - Algorithms: static helpers in \`Collections\` (sort, max, reverse, frequency...).

      Benefits: less code to write, well-tested fast structures, and code written against interfaces can swap implementations.`,
    },
    {
      q: "ArrayList vs LinkedList — which would you use and why?",
      short: "ArrayList for almost everything (O(1) get, cache-friendly); LinkedList only for heavy add/remove at the ends.",
      a: `- Inside: ArrayList is a resizable array; LinkedList is a doubly linked list.
      - \`get(i)\`: O(1) vs O(n).
      - Add / remove at the end: both O(1) (ArrayList amortised).
      - Add / remove at the front or middle: ArrayList O(n) (shifts elements); LinkedList O(1) *once you are at the node*, but finding it is O(n).
      - Memory: LinkedList stores two extra pointers per element.

      I'd pick ArrayList by default. For a queue or stack I'd pick ArrayDeque over LinkedList too.`,
    },
    {
      q: "Why doesn't Map extend Collection?",
      short: "A Collection holds single elements; a Map holds key-value pairs, so methods like add(E) don't fit.",
      a: `\`Collection\` is defined around single elements: \`add(E)\`, \`remove(Object)\`, \`contains(Object)\`. A Map stores pairs and needs \`put(K, V)\`, \`get(K)\`, \`containsKey\`. Forcing it into Collection would make those methods ambiguous.

      Map still connects to the framework through its views: \`keySet()\` (a Set), \`values()\` (a Collection) and \`entrySet()\` (a Set of entries).`,
    },
    {
      q: "Difference between Collection and Collections?",
      short: "Collection is the root interface; Collections is a utility class of static methods.",
      a: `- \`Collection\` (interface): the root of List, Set and Queue, declaring \`add\`, \`remove\`, \`size\`, \`iterator\`...
      - \`Collections\` (class): static helpers that work on collections — \`sort\`, \`reverse\`, \`max\`, \`min\`, \`frequency\`, \`swap\`, \`unmodifiableList\`, \`synchronizedList\`.

      Similarly, \`Arrays\` is the utility class for arrays.`,
    },
    {
      q: "ArrayList vs Vector?",
      short: "Same resizable array, but Vector is synchronised (slower) and legacy.",
      a: `- Vector's methods are synchronised, so every call pays a locking cost; ArrayList is not synchronised.
      - Vector doubles its size when full; ArrayList grows by about 50%.
      - Vector is a Java 1.0 legacy class.

      For thread safety today use \`Collections.synchronizedList(new ArrayList<>())\` or \`CopyOnWriteArrayList\`.`,
    },
  ],

  "Set & Map: HashMap internals, TreeMap & LinkedHashMap": [
    {
      q: "How does HashMap work internally?",
      short: "An array of buckets: hashCode picks the bucket, equals finds the key inside it; it resizes at 75% full.",
      a: `- HashMap keeps an array of buckets (default capacity 16).
      - \`put(k, v)\`: compute \`k.hashCode()\`, spread it (\`h ^ (h >>> 16)\`), and take \`hash & (capacity - 1)\` as the bucket index.
      - If the bucket is empty, store a new node. Otherwise walk the bucket: if a node's key \`equals\` k, replace its value; if none does, append a node (a collision).
      - Since Java 8, a bucket with more than 8 nodes (when capacity ≥ 64) becomes a red-black tree, so the worst case is O(log n).
      - When size exceeds capacity × load factor (0.75), the array doubles and entries are redistributed (rehashing).
      - \`get(k)\` follows the same hash → bucket → equals path, which is why it's O(1) on average.`,
    },
    {
      q: "Why must you override hashCode() when you override equals()?",
      short: "Equal objects must land in the same bucket; without hashCode they get different hashes and lookups fail.",
      a: `The contract: if \`a.equals(b)\` then \`a.hashCode() == b.hashCode()\`.

      HashMap and HashSet first use hashCode to choose a bucket and only then call equals. If you override only equals, two "equal" objects keep different identity hash codes, land in different buckets, and \`contains\` / \`get\` return false / null. The set can even hold duplicates.

      Unequal objects may share a hash code (a collision) — that's allowed, just slower.`,
    },
    {
      q: "HashMap vs LinkedHashMap vs TreeMap?",
      short: "Same Map API; no order vs insertion order vs sorted order. TreeMap is O(log n), the others O(1).",
      a: `- HashMap: no guaranteed order, O(1) average, one null key allowed.
      - LinkedHashMap: insertion order (or access order — used for LRU caches), O(1), slightly more memory.
      - TreeMap: sorted by key (red-black tree), O(log n), no null keys, and navigation methods like \`floorKey\`, \`ceilingKey\`, \`headMap\`.

      Pick by the order you need; when you don't need any, HashMap.`,
    },
    {
      q: "HashMap vs Hashtable vs ConcurrentHashMap?",
      short: "HashMap is not thread-safe; Hashtable locks everything (legacy); ConcurrentHashMap is the modern thread-safe map.",
      a: `- HashMap: not synchronised, allows one null key and null values.
      - Hashtable: every method synchronised (one lock for the whole table), no nulls, legacy.
      - ConcurrentHashMap: thread-safe with fine-grained locking / CAS on individual buckets, so many threads can read and write at once; no nulls.`,
    },
    {
      q: "How does HashSet work internally?",
      short: "It's a HashMap underneath: each element is a key, with a dummy constant as the value.",
      a: `HashSet wraps a HashMap. \`set.add(x)\` calls \`map.put(x, PRESENT)\`, where PRESENT is a shared dummy object, and returns whether the key was new. So everything about HashMap applies: O(1) average, and elements need correct \`equals\` and \`hashCode\`.

      LinkedHashSet uses a LinkedHashMap and TreeSet uses a TreeMap in the same way.`,
    },
  ],

  "Iterator, Comparable vs Comparator, generics & wrappers": [
    {
      q: "What is ConcurrentModificationException and how do you avoid it?",
      short: "Thrown when a collection is changed during iteration other than through the iterator; use iterator.remove() or removeIf.",
      a: `ArrayList, HashMap and most collections keep a modification count. Their iterators are *fail-fast*: if the count changes behind the iterator's back — e.g. \`list.remove(x)\` inside a for-each — the next \`next()\` throws ConcurrentModificationException.

      Fixes: remove through the iterator (\`it.remove()\`), use \`list.removeIf(...)\`, loop over indexes backwards, or collect items to remove and call \`removeAll\` afterwards. For multi-threaded code, concurrent collections (\`CopyOnWriteArrayList\`, \`ConcurrentHashMap\`) have fail-safe iterators.`,
    },
    {
      q: "Comparable vs Comparator?",
      short: "Comparable = the class's own natural order (compareTo); Comparator = any external order (compare).",
      a: `- Comparable (\`java.lang\`): implemented by the class itself, one method \`compareTo(T o)\`, defines a single natural order. Used by \`Collections.sort(list)\` and TreeMap / TreeSet by default.
      - Comparator (\`java.util\`): a separate object or lambda with \`compare(T a, T b)\`; you can have many, and use it on classes you can't modify.

      \`\`\`
      list.sort(Comparator.comparingInt(Student::getMarks).reversed()
                          .thenComparing(Student::getName));
      \`\`\``,
    },
    {
      q: "What are generics and what is type erasure?",
      short: "Type parameters like List<String> that give compile-time checks; erasure removes them at runtime.",
      a: `Generics let classes and methods work with any type while the compiler still checks it: a \`List<String>\` rejects an Integer at compile time and needs no casts when reading.

      Type erasure: the compiler checks the types and then erases them, so at runtime \`List<String>\` and \`List<Integer>\` are both just \`List\`. Consequences: you can't do \`new T()\`, \`T[]\` creation, or \`instanceof List<String>\`, and generics only work with objects (hence \`List<Integer>\`, not \`List<int>\`).`,
    },
    {
      q: "What are wrapper classes and autoboxing? Why is Integer == Integer risky?",
      short: "Wrappers are object versions of primitives; == compares references, and only -128..127 are cached.",
      a: `Collections can only hold objects, so each primitive has a wrapper: \`int\` → \`Integer\`, \`char\` → \`Character\`, and so on. Autoboxing converts \`int\` → \`Integer\` automatically, and unboxing goes back.

      \`==\` on two Integers compares references. \`Integer.valueOf\` caches -128 to 127, so \`127 == 127\` is true but \`128 == 128\` is false. Always use \`.equals()\`. Also, unboxing a null (e.g. from \`map.get\`) throws NullPointerException.`,
    },
  ],

  "list vs tuple vs set vs dict": [
    {
      q: "What is the difference between a list and a tuple?",
      short: "Both are ordered sequences; a list can change, a tuple can't — so a tuple can be a dict key.",
      a: `- Mutability: lists can be changed (append, remove, assign); tuples are immutable.
      - Hashable: a tuple of immutable items can be a dict key or set item; a list can't.
      - Syntax: \`[1, 2]\` vs \`(1, 2)\`; a one-item tuple needs a comma, \`(1,)\`.
      - Methods: lists have many (append, sort, pop...); tuples only \`count\` and \`index\`.
      - Tuples are slightly smaller and faster to create, but the real reason to use one is fixed data, like \`(x, y)\` or returning several values.`,
    },
    {
      q: "Compare list, tuple, set and dict.",
      short: "list: ordered & mutable; tuple: ordered & immutable; set: unique & unordered; dict: key → value.",
      a: `- list: ordered, mutable, duplicates allowed, indexable; \`in\` is O(n).
      - tuple: ordered, immutable, duplicates allowed, indexable, hashable.
      - set: unordered, mutable, unique items only, no indexing; \`in\` is O(1) average.
      - dict: key → value, keys unique and hashable, insertion-ordered since 3.7; lookup by key is O(1) average.`,
    },
    {
      q: "What does hashable mean? Why can't a list be a dictionary key?",
      short: "Hashable = has a hash that never changes; a list can change, so its hash would change and it'd be lost.",
      a: `dict and set store items by their hash. If a key could change after insertion, its hash would change and the dict would look in the wrong slot. So Python only allows hashable objects — immutable built-ins like int, str, tuple and frozenset — as keys and set items. Lists, dicts and sets are mutable and raise \`TypeError: unhashable type\`.

      Convert first: \`d[tuple(lst)] = value\`.`,
    },
    {
      q: "Are dictionaries ordered in Python?",
      short: "Yes, since Python 3.7 dicts keep insertion order (officially part of the language).",
      a: `From Python 3.7 a dict remembers the order keys were first inserted, and iterating gives them in that order (updating a value doesn't move the key). Sets do **not** keep any order. \`collections.OrderedDict\` still exists for extra tools like \`move_to_end\` and order-sensitive equality.`,
    },
  ],

  "Tuples, unpacking & comprehensions": [
    {
      q: "What is a list comprehension? When should you not use one?",
      short: "A one-line way to build a list from a loop; avoid it when the logic gets long or has side effects.",
      a: `\`[expr for x in items if cond]\` builds a list in one expression — it's shorter and usually a little faster than appending in a loop. Dict and set comprehensions work the same way with \`{k: v ...}\` and \`{x ...}\`.

      Don't use one when it needs several nested loops and conditions (readability wins), when you only want side effects like printing, or when the result goes straight into \`sum\` / \`any\` — use a generator expression there.`,
    },
    {
      q: "List comprehension vs generator expression?",
      short: "[ ] builds the whole list in memory; ( ) produces values one at a time, lazily.",
      a: `\`[x * x for x in nums]\` creates a full list immediately. \`(x * x for x in nums)\` creates a generator that computes each value only when asked, using constant memory, and can be consumed only once.

      Use a generator when you just iterate or aggregate: \`sum(x * x for x in nums)\`, \`any(x < 0 for x in nums)\`.`,
    },
    {
      q: "How do you swap two variables in Python, and how does it work?",
      short: "a, b = b, a — the right side is packed into a tuple, then unpacked into the names.",
      a: `\`a, b = b, a\` first evaluates the right side and packs it into a tuple \`(b, a)\`, then unpacks that tuple into \`a\` and \`b\`. No temporary variable is needed. The same unpacking powers \`for i, x in enumerate(...)\`, returning multiple values, and \`first, *rest = items\`.`,
    },
    {
      q: "Why does [[0] * 3] * 3 give a wrong grid?",
      short: "The outer * copies references, so all three rows are the same list object.",
      a: `\`[0] * 3\` makes one list; multiplying the outer list repeats a *reference* to that one list three times. Changing \`grid[0][0]\` changes every row. Build each row separately:

      \`\`\`
      grid = [[0] * 3 for _ in range(3)]
      \`\`\``,
    },
  ],

  "collections module, copying & Python gotchas": [
    {
      q: "Shallow copy vs deep copy?",
      short: "Shallow copies only the outer container (inner objects shared); deep copies everything recursively.",
      a: `- Assignment \`b = a\` copies nothing — both names refer to the same object.
      - Shallow copy (\`a.copy()\`, \`a[:]\`, \`list(a)\`, \`copy.copy(a)\`): a new outer object whose items are the same inner objects.
      - Deep copy (\`copy.deepcopy(a)\`): recursively copies the inner objects too, so nothing is shared.

      For a flat list of numbers or strings a shallow copy is enough; for nested lists (grids) use a deep copy or \`[row[:] for row in grid]\`.`,
    },
    {
      q: "What is the difference between is and ==?",
      short: "== compares values; is checks that two names refer to the same object.",
      a: `\`a == b\` calls \`__eq__\` and compares contents; \`a is b\` compares identity (\`id(a) == id(b)\`). Two separate lists \`[1, 2]\` are \`==\` but not \`is\`.

      Use \`is\` only for singletons like \`None\` (\`if x is None\`). Don't use it for numbers or strings: CPython reuses some small ints and strings, so \`is\` can seem to work and then fail on other values.`,
    },
    {
      q: "Why is a mutable default argument dangerous?",
      short: "The default is created once when the function is defined and shared by all calls.",
      a: `\`def add(x, items=[])\` evaluates \`[]\` once, at definition time. Every call that uses the default appends to the same list, so values from earlier calls leak into later ones. Use \`None\` as the default and create the list inside:

      \`\`\`
      def add(x, items=None):
          if items is None:
              items = []
          items.append(x)
          return items
      \`\`\``,
    },
    {
      q: "Which collections module classes have you used?",
      short: "Counter, defaultdict, deque, OrderedDict and namedtuple.",
      a: `- \`Counter\`: counting hashable items, \`most_common(k)\`, arithmetic between counters.
      - \`defaultdict\`: supplies a default (list, int, set) for missing keys — great for grouping and graphs.
      - \`deque\`: O(1) append / pop at both ends; BFS queues and sliding windows; \`maxlen\` for "last n".
      - \`OrderedDict\`: \`move_to_end\` and \`popitem(last=False)\` for LRU caches.
      - \`namedtuple\`: lightweight immutable records with named fields.`,
    },
  ],
};
