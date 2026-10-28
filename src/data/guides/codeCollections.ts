import type { TopicGuide } from "./index";

// Programming track, one-language lessons: Java's Collections Framework and Python's core data types.
// Each guide sets `lang`, so its code is written in that language only and the page says so; the `other`
// box at the end maps it to the other language. Like the rest of the track, every program is complete and
// runnable, and `output` is exactly what it prints.
export const CODE_COLLECTION_GUIDES: Record<string, TopicGuide> = {
  // ───────────────────────── Java · Collections Framework ─────────────────────────

  "Collections Framework & List: ArrayList vs LinkedList": {
    lang: "java",
    simple: `The Java Collections Framework is the set of ready-made data structures in \`java.util\`: lists, sets, queues and maps. You have already used some of them (ArrayList, HashMap, ArrayDeque). This lesson is about the *theory* interviewers ask: how they are organised, and when to pick which.

    It is built in two layers. **Interfaces** say *what* a structure can do (\`List\`: keep items in order, get by index). **Classes** say *how* it is done inside (\`ArrayList\` uses a resizable array, \`LinkedList\` uses linked nodes). You write code against the interface and pick the class that is fastest for your job.`,
    analogy: `"Vehicle licence classes" is the interface level: a car licence lets you drive any car. The actual car (a hatchback or an SUV) is the class. You learn to drive "a car" once, and can switch models without relearning.

    In the same way, code written against \`List\` works with an ArrayList or a LinkedList — you only change the \`new ...\` part.`,
    how: {
      steps: [
        "Pick the interface by what you need: ordered items with duplicates → `List`; no duplicates → `Set`; first-in-first-out or priority → `Queue` / `Deque`; key → value → `Map`.",
        "Pick the class by how you use it: mostly read by index → `ArrayList`; add / remove at both ends → `ArrayDeque` (or `LinkedList`).",
        "Declare with the interface, create with the class: `List<Integer> nums = new ArrayList<>();`.",
        "Use the utility classes instead of writing loops: `Collections.sort / max / min / reverse / frequency`, and `Arrays.sort / asList / toString` for arrays.",
        "Remember: `Map` is part of the framework but does **not** extend `Collection` — it stores pairs, not single items.",
      ],
    },
    concepts: [
      { term: "Collection", meaning: "The root interface for a group of single items. `List`, `Set` and `Queue` extend it." },
      { term: "List", meaning: "Ordered, allows duplicates, access by index. Classes: `ArrayList`, `LinkedList`, `Vector`." },
      { term: "Set / Queue / Deque", meaning: "Set: no duplicates. Queue: process in order (FIFO or by priority). Deque: add / remove at both ends." },
      { term: "Map", meaning: "Key → value pairs with unique keys. A separate hierarchy: `HashMap`, `LinkedHashMap`, `TreeMap`." },
      { term: "ArrayList", meaning: "A resizable array. `get(i)` is O(1); adding at the end is O(1) on average; inserting in the middle shifts elements, O(n)." },
      { term: "LinkedList", meaning: "A doubly linked list. Adding / removing at the ends is O(1), but `get(i)` walks the nodes, O(n). Also implements `Deque`." },
      { term: "Vector", meaning: "An old (Java 1.0) synchronised ArrayList. Slower; not used in new code." },
      { term: "Collections vs Collection", meaning: "`Collection` is the interface; `Collections` is a utility class full of static helpers like `sort` and `max`." },
    ],
    syntax: [
      { task: "Declare by interface", java: "List<Integer> nums = new ArrayList<>();" },
      { task: "Add at the end / at an index", java: "nums.add(5);\nnums.add(0, 9);" },
      { task: "Read / change by index", java: "nums.get(0);\nnums.set(0, 7);" },
      { task: "Remove by index vs by value", java: "nums.remove(0);                  // index 0\nnums.remove(Integer.valueOf(5)); // the value 5" },
      { task: "Size, empty, contains", java: "nums.size(); nums.isEmpty(); nums.contains(7);" },
      { task: "Sort / reverse / max", java: "Collections.sort(nums);\nCollections.reverse(nums);\nCollections.max(nums);" },
      { task: "Quick fixed list", java: "List<Integer> a = Arrays.asList(3, 1, 2); // set ok, add fails\nList<Integer> b = List.of(3, 1, 2);       // fully read-only" },
      { task: "Copy into a changeable list", java: "List<Integer> c = new ArrayList<>(List.of(3, 1, 2));" },
      { task: "LinkedList as a queue", java: "Deque<Integer> q = new LinkedList<>();\nq.addLast(1); q.pollFirst();" },
    ],
    compare: {
      head: ["", "ArrayList", "LinkedList", "Vector"],
      rows: [
        ["Inside", "Resizable array", "Doubly linked nodes", "Resizable array"],
        ["`get(i)`", "O(1)", "O(n) — walks from an end", "O(1)"],
        ["Add / remove at the end", "O(1) on average", "O(1)", "O(1) on average"],
        ["Add / remove at the front", "O(n) — shifts everything", "O(1)", "O(n)"],
        ["Memory", "Compact", "Extra two pointers per item", "Compact"],
        ["Thread-safe", "No", "No", "Yes (synchronised, slower)"],
        ["Grows by", "About 1.5×", "One node at a time", "2×"],
        ["Use it when", "Almost always — reading by index", "Lots of adding / removing at the ends", "Legacy code only"],
      ],
    },
    code: [
      {
        title: "The whole family in one program",
        note: "One example of each interface. The left side of `=` is the interface, the right side is the class doing the work.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  List<String> list = new ArrayList<>();      // ordered, duplicates allowed
                  list.add("red"); list.add("blue"); list.add("red");
                  System.out.println("List:  " + list + " size " + list.size());

                  Set<String> set = new TreeSet<>(list);      // duplicates dropped, kept sorted
                  System.out.println("Set:   " + set);

                  Queue<String> queue = new ArrayDeque<>();   // first in, first out
                  queue.offer("first"); queue.offer("second");
                  System.out.println("Queue: served " + queue.poll() + ", next " + queue.peek());

                  Map<String, Integer> map = new TreeMap<>(); // key -> value, not a Collection
                  for (String c : list) map.put(c, map.getOrDefault(c, 0) + 1);
                  System.out.println("Map:   " + map);

                  // Map is not a Collection, but its views are:
                  Collection<Integer> counts = map.values();
                  System.out.println("Values view: " + counts);
              }
          }`,
        output: `
          List:  [red, blue, red] size 3
          Set:   [blue, red]
          Queue: served first, next second
          Map:   {blue=1, red=2}
          Values view: [1, 2]`,
      },
      {
        title: "ArrayList vs LinkedList: same methods, different insides",
        note: "Both are `List`s, so the same code works on either. The difference is speed: ArrayList is fast at `get(i)`, LinkedList is fast at the ends. Watch the `remove(int)` vs `remove(Object)` trap at the end.",
        java: `
          import java.util.*;

          public class Main {
              static void show(List<Integer> list) {        // works for ANY List
                  list.add(10); list.add(20); list.add(30);
                  list.add(0, 5);                           // insert at the front
                  System.out.println(list.getClass().getSimpleName() + " " + list + ", get(2) = " + list.get(2));
              }

              public static void main(String[] args) {
                  show(new ArrayList<>());
                  show(new LinkedList<>());

                  // LinkedList is also a Deque: cheap work at both ends
                  LinkedList<Integer> dq = new LinkedList<>(List.of(2, 3));
                  dq.addFirst(1); dq.addLast(4);
                  System.out.println("Deque " + dq + ", removeFirst " + dq.removeFirst() + ", removeLast " + dq.removeLast());

                  // remove(int) removes by INDEX, remove(Object) removes by VALUE
                  List<Integer> nums = new ArrayList<>(List.of(10, 20, 30));
                  nums.remove(1);                           // index 1 -> removes 20
                  System.out.println("after remove(1): " + nums);
                  nums.remove(Integer.valueOf(10));         // the value 10
                  System.out.println("after remove(Integer.valueOf(10)): " + nums);
              }
          }`,
        output: `
          ArrayList [5, 10, 20, 30], get(2) = 20
          LinkedList [5, 10, 20, 30], get(2) = 20
          Deque [1, 2, 3, 4], removeFirst 1, removeLast 4
          after remove(1): [10, 30]
          after remove(Integer.valueOf(10)): [30]`,
      },
      {
        title: "Collections and Arrays: helpers you should not rewrite",
        note: "`Arrays.asList` gives a fixed-size view (you can `set`, not `add`), and `List.of` is completely read-only. Copy into `new ArrayList<>(...)` when you need to change it.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  List<Integer> marks = new ArrayList<>(List.of(72, 95, 60, 95, 81));
                  System.out.println("max " + Collections.max(marks) + ", min " + Collections.min(marks));
                  System.out.println("95 appears " + Collections.frequency(marks, 95) + " times");

                  Collections.sort(marks);
                  System.out.println("sorted   " + marks);
                  Collections.sort(marks, Collections.reverseOrder());
                  System.out.println("reversed " + marks);
                  Collections.swap(marks, 0, 4);
                  System.out.println("swapped  " + marks);

                  int[] arr = {4, 1, 3};
                  Arrays.sort(arr);
                  System.out.println("array " + Arrays.toString(arr));

                  List<Integer> fixed = Arrays.asList(4, 1, 3);
                  fixed.set(0, 9);                           // allowed
                  try {
                      fixed.add(5);                          // not allowed: fixed size
                  } catch (UnsupportedOperationException e) {
                      System.out.println("Arrays.asList cannot grow: " + fixed);
                  }
                  try {
                      List.of(1, 2).set(0, 5);               // not allowed: read-only
                  } catch (UnsupportedOperationException e) {
                      System.out.println("List.of is read-only");
                  }
              }
          }`,
        output: `
          max 95, min 60
          95 appears 2 times
          sorted   [60, 72, 81, 95, 95]
          reversed [95, 95, 81, 72, 60]
          swapped  [60, 95, 81, 72, 95]
          array [1, 3, 4]
          Arrays.asList cannot grow: [9, 1, 3]
          List.of is read-only`,
      },
    ],
    mistakes: [
      "Saying `Map` extends `Collection` — it doesn't. It is part of the framework but stores pairs.",
      "`list.remove(2)` on a `List<Integer>` removes **index** 2, not the value 2. Use `list.remove(Integer.valueOf(2))`.",
      "Choosing LinkedList \"because insertion is O(1)\" — only at the ends or with an iterator already in place. Finding the spot is O(n), so ArrayList usually wins.",
      "Calling `add` on `Arrays.asList(...)` or `List.of(...)` → `UnsupportedOperationException`. Wrap it: `new ArrayList<>(Arrays.asList(...))`.",
      "Mixing up `Collection` (interface) and `Collections` (utility class).",
      "Using `Vector` or `Stack` in new code. Use `ArrayList` and `ArrayDeque`.",
    ],
    remember: "Code to the interface (`List`, `Set`, `Map`), pick the class for speed — and ArrayList is the right List almost every time.",
    exercises: [
      {
        q: "Read `n` and then `n` numbers into an `ArrayList`. Print the largest, the smallest and the list sorted from high to low — using `Collections` methods, no loops for these.",
        example: `
          Input:  5
                  4 9 1 7 3
          Output: max 9
                  min 1
                  [9, 7, 4, 3, 1]`,
        hint: "`Collections.max`, `Collections.min`, then `list.sort(Collections.reverseOrder())`.",
        input: `
          5
          4 9 1 7 3`,
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  int n = sc.nextInt();
                  List<Integer> nums = new ArrayList<>();
                  for (int i = 0; i < n; i++) nums.add(sc.nextInt());
                  System.out.println("max " + Collections.max(nums));
                  System.out.println("min " + Collections.min(nums));
                  nums.sort(Collections.reverseOrder());
                  System.out.println(nums);
              }
          }`,
        output: `
          max 9
          min 1
          [9, 7, 4, 3, 1]`,
      },
      {
        q: "From `[5, 2, 8, 2, 9, 2]`, first remove only the **first** `2`, print the list, then remove **every** remaining `2` and print it again.",
        example: `
          Output: [5, 8, 2, 9, 2]
                  [5, 8, 9]`,
        hint: "`remove(Integer.valueOf(2))` removes the first match; `removeIf(x -> x == 2)` removes all.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  List<Integer> nums = new ArrayList<>(List.of(5, 2, 8, 2, 9, 2));
                  nums.remove(Integer.valueOf(2));   // first 2 only (by value, not index)
                  System.out.println(nums);
                  nums.removeIf(x -> x == 2);        // every 2
                  System.out.println(nums);
              }
          }`,
        output: `
          [5, 8, 2, 9, 2]
          [5, 8, 9]`,
      },
      {
        q: "A ticket counter: Asha, Ravi and Meena join a queue, the first person is served, then Kiran joins and someone with a priority pass (Zoya) goes to the very front. Serve everyone and print the order. Use a `LinkedList` through the `Deque` interface.",
        example: `
          Output: served Asha
                  served Zoya
                  served Ravi
                  served Meena
                  served Kiran`,
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Deque<String> line = new LinkedList<>();
                  line.addLast("Asha"); line.addLast("Ravi"); line.addLast("Meena");
                  System.out.println("served " + line.pollFirst());
                  line.addLast("Kiran");
                  line.addFirst("Zoya");                 // priority pass: front of the line
                  while (!line.isEmpty()) System.out.println("served " + line.pollFirst());
              }
          }`,
        output: `
          served Asha
          served Zoya
          served Ravi
          served Meena
          served Kiran`,
      },
    ],
    other: {
      note: `Python has no Collections Framework and no interface / class split: a few built-in types cover the same jobs, and you just use them. See the "Python · Core data types" section for the details.`,
      rows: [
        ["`ArrayList`", "`list`"],
        ["`LinkedList` / `ArrayDeque` as a queue", "`collections.deque`"],
        ["`List.of(...)` (read-only)", "`tuple`"],
        ["`HashSet` / `TreeSet`", "`set` / `sorted(set)`"],
        ["`HashMap` / `LinkedHashMap`", "`dict` (keeps insertion order)"],
        ["`PriorityQueue`", "`heapq` on a list"],
        ["`Collections.sort / max / min`", "`list.sort()`, `max()`, `min()`"],
      ],
    },
  },

  "Set & Map: HashMap internals, TreeMap & LinkedHashMap": {
    lang: "java",
    simple: `Java gives you three versions of each set and map, and they differ only in **order**: \`HashSet\` / \`HashMap\` keep no useful order but are the fastest, \`LinkedHashSet\` / \`LinkedHashMap\` remember insertion order, and \`TreeSet\` / \`TreeMap\` keep keys sorted.

    The favourite interview question here is "How does HashMap work internally?". The short answer: it keeps an array of buckets; a key's \`hashCode()\` decides its bucket, and \`equals()\` finds the exact key inside that bucket. That is also why any class you use as a key must override **both** \`equals()\` and \`hashCode()\`.`,
    analogy: `A HashMap is a post office with numbered pigeonholes. The pin code (hash) tells the clerk which pigeonhole to open — no searching through every letter. If two letters land in the same hole (a collision), the clerk checks the full address (\`equals\`) to pick the right one.

    A TreeMap is a dictionary book: words are always in alphabetical order, so finding the word just before or after another is easy. A LinkedHashMap is a guest register: names stay in the order people arrived.`,
    how: {
      steps: [
        "`put(key, value)` calls `key.hashCode()` and mixes the bits: `h ^ (h >>> 16)`.",
        "The bucket index is `hash & (capacity - 1)` — capacity starts at 16 and is always a power of two.",
        "Empty bucket → store the entry there. Otherwise walk the bucket and compare with `equals()`: same key → replace the value; no match → add a new node (a collision).",
        "If one bucket grows past 8 entries (and the table has at least 64 buckets), it turns into a red-black tree, so a bad bucket is O(log n) instead of O(n).",
        "When size goes above capacity × load factor (0.75 by default, so 12 of 16), the table doubles and every entry is moved to its new bucket (rehashing).",
        "`get(key)` repeats the same steps: hash → bucket → `equals()`. That is why lookups are O(1) on average.",
      ],
    },
    concepts: [
      { term: "Bucket", meaning: "One slot of the internal array. It holds the entries whose hash points there (a linked list, or a tree when crowded)." },
      { term: "hashCode()", meaning: "An int computed from an object. Equal objects must return the same hashCode; different objects may collide." },
      { term: "equals()", meaning: "Decides whether two keys are really the same. Used after the hash finds the bucket." },
      { term: "Collision", meaning: "Two different keys landing in the same bucket. Normal and handled — too many just slow things down." },
      { term: "Load factor & rehashing", meaning: "0.75: when the map is 75% full it doubles its buckets and redistributes entries." },
      { term: "Treeification", meaning: "Since Java 8, a bucket with more than 8 entries becomes a red-black tree." },
      { term: "TreeMap / TreeSet", meaning: "Red-black tree inside: sorted keys, O(log n), plus `floorKey`, `ceilingKey`, `firstKey`, `headMap`..." },
      { term: "LinkedHashMap", meaning: "A HashMap plus a linked list through its entries, so iteration follows insertion (or access) order." },
    ],
    syntax: [
      { task: "Three kinds of set", java: "new HashSet<>()  new LinkedHashSet<>()  new TreeSet<>()" },
      { task: "Three kinds of map", java: "new HashMap<>()  new LinkedHashMap<>()  new TreeMap<>()" },
      { task: "Add returns whether it was new", java: "boolean added = set.add(x);" },
      { task: "Smallest / largest key", java: "tree.firstKey(); tree.lastKey();" },
      { task: "Nearest key ≤ x / ≥ x", java: "tree.floorKey(x); tree.ceilingKey(x);  // null if none" },
      { task: "Keys below x", java: "tree.headMap(x);   // keys < x" },
      { task: "Loop over a map", java: "for (Map.Entry<K, V> e : map.entrySet())\n    e.getKey(); e.getValue();" },
      { task: "Add to a count", java: "map.merge(k, 1, Integer::sum);" },
      { task: "Make a class a good key", java: "@Override public boolean equals(Object o) { ... }\n@Override public int hashCode() { return Objects.hash(x, y); }" },
    ],
    compare: {
      head: ["", "HashMap", "LinkedHashMap", "TreeMap", "Hashtable"],
      rows: [
        ["Iteration order", "None you can rely on", "Insertion (or access) order", "Sorted by key", "None"],
        ["get / put", "O(1) average", "O(1) average", "O(log n)", "O(1) average"],
        ["Inside", "Array of buckets", "Buckets + linked list", "Red-black tree", "Array of buckets"],
        ["null key", "One allowed", "One allowed", "Not allowed", "Not allowed"],
        ["Thread-safe", "No", "No", "No", "Yes (old; use ConcurrentHashMap)"],
        ["The matching Set", "HashSet", "LinkedHashSet", "TreeSet", "—"],
      ],
    },
    code: [
      {
        title: "Same items, three orders",
        note: "All three sets hold the same five words. Only the order they come back in changes. HashSet's order looks random — never rely on it.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  List<String> words = List.of("mango", "apple", "kiwi", "banana", "apple", "cherry");

                  System.out.println("HashSet       " + new HashSet<>(words));
                  System.out.println("LinkedHashSet " + new LinkedHashSet<>(words));
                  System.out.println("TreeSet       " + new TreeSet<>(words));

                  TreeSet<Integer> marks = new TreeSet<>(List.of(40, 75, 62, 90, 55));
                  System.out.println("first " + marks.first() + ", last " + marks.last());
                  System.out.println("floor(70) " + marks.floor(70) + ", ceiling(70) " + marks.ceiling(70));
                  System.out.println("below 60 " + marks.headSet(60));
              }
          }`,
        output: `
          HashSet       [banana, apple, cherry, kiwi, mango]
          LinkedHashSet [mango, apple, kiwi, banana, cherry]
          TreeSet       [apple, banana, cherry, kiwi, mango]
          first 40, last 90
          floor(70) 62, ceiling(70) 75
          below 60 [40, 55]`,
      },
      {
        title: "Peek inside a HashMap: which bucket does a key go to?",
        note: "This repeats HashMap's own maths for a table of 16 buckets. \"Aa\" and \"BB\" have the same `hashCode`, so they collide — yet the map still keeps both, because `equals()` tells them apart.",
        java: `
          import java.util.*;

          public class Main {
              // The same steps HashMap uses: spread the hash bits, then keep the low bits.
              static int bucket(Object key, int capacity) {
                  int h = key.hashCode();
                  return (h ^ (h >>> 16)) & (capacity - 1);
              }

              public static void main(String[] args) {
                  for (String k : List.of("cat", "dog", "Aa", "BB")) {
                      System.out.println(k + ": hashCode " + k.hashCode() + " -> bucket " + bucket(k, 16));
                  }
                  Map<String, Integer> map = new HashMap<>();
                  map.put("Aa", 1);
                  map.put("BB", 2);            // same bucket as "Aa": a collision
                  map.put("Aa", 3);            // same key: value replaced, size unchanged
                  System.out.println("size " + map.size() + ", Aa=" + map.get("Aa") + ", BB=" + map.get("BB"));
              }
          }`,
        output: `
          cat: hashCode 98262 -> bucket 7
          dog: hashCode 99644 -> bucket 13
          Aa: hashCode 2112 -> bucket 0
          BB: hashCode 2112 -> bucket 0
          size 2, Aa=3, BB=2`,
      },
      {
        title: "Why equals() and hashCode() must both be overridden",
        note: "`BadPoint` only overrides `equals`, so two equal points get different hash codes, land in different buckets, and the set treats them as different. `Point` overrides both and works.",
        java: `
          import java.util.*;

          public class Main {
              static class BadPoint {
                  int x, y;
                  BadPoint(int x, int y) { this.x = x; this.y = y; }
                  @Override public boolean equals(Object o) {
                      return o instanceof BadPoint p && p.x == x && p.y == y;
                  }
                  // no hashCode(): each object keeps its own identity-based hash
              }

              static class Point {
                  int x, y;
                  Point(int x, int y) { this.x = x; this.y = y; }
                  @Override public boolean equals(Object o) {
                      return o instanceof Point p && p.x == x && p.y == y;
                  }
                  @Override public int hashCode() { return Objects.hash(x, y); }
              }

              public static void main(String[] args) {
                  Set<BadPoint> bad = new HashSet<>();
                  bad.add(new BadPoint(1, 2));
                  System.out.println("BadPoint equals: " + new BadPoint(1, 2).equals(new BadPoint(1, 2)));
                  System.out.println("BadPoint found in set: " + bad.contains(new BadPoint(1, 2)));

                  Set<Point> good = new HashSet<>();
                  good.add(new Point(1, 2));
                  good.add(new Point(1, 2));       // duplicate, ignored
                  System.out.println("Point found in set: " + good.contains(new Point(1, 2)) + ", size " + good.size());
              }
          }`,
        output: `
          BadPoint equals: true
          BadPoint found in set: false
          Point found in set: true, size 1`,
      },
      {
        title: "TreeMap and LinkedHashMap in action",
        note: "TreeMap answers \"nearest key\" questions. LinkedHashMap with `accessOrder = true` moves each used key to the end — override `removeEldestEntry` and you have an LRU cache, a very common interview question.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  // Grade boundaries: the grade is the floor of the score
                  TreeMap<Integer, String> grade = new TreeMap<>(Map.of(0, "F", 40, "C", 60, "B", 80, "A"));
                  for (int score : new int[]{35, 60, 79, 95}) {
                      System.out.println(score + " -> " + grade.floorEntry(score).getValue());
                  }

                  // LRU cache holding 2 items: the least recently used one is dropped
                  Map<String, Integer> lru = new LinkedHashMap<>(16, 0.75f, true) {
                      @Override protected boolean removeEldestEntry(Map.Entry<String, Integer> eldest) {
                          return size() > 2;
                      }
                  };
                  lru.put("a", 1);
                  lru.put("b", 2);
                  lru.get("a");            // "a" is now the most recently used
                  lru.put("c", 3);         // full: drops "b", the least recently used
                  System.out.println("LRU keeps " + lru.keySet());
              }
          }`,
        output: `
          35 -> F
          60 -> B
          79 -> B
          95 -> A
          LRU keeps [a, c]`,
      },
    ],
    mistakes: [
      "Overriding `equals()` without `hashCode()` — lookups in HashMap / HashSet silently fail.",
      "Changing a field that `hashCode()` uses after the object is already a key — the map now looks in the wrong bucket.",
      "Printing a HashMap and expecting insertion or sorted order. Use LinkedHashMap or TreeMap.",
      "Saying HashMap is always O(1). It is O(1) on average; many collisions make a bucket slower (O(log n) since Java 8 trees).",
      "Putting `null` as a TreeMap key → NullPointerException (it has to compare keys).",
      "`floorKey` / `ceilingKey` return `null` when nothing fits — check before unboxing into an `int`.",
    ],
    remember: "hashCode picks the bucket, equals picks the key — override both, and choose Hash, Linked or Tree by the order you need.",
    exercises: [
      {
        q: "Count the words in `\"the cat and the dog and the bird\"` and print each word with its count in **alphabetical** order.",
        example: `
          Output: and=2
                  bird=1
                  cat=1
                  dog=1
                  the=3`,
        hint: "A TreeMap keeps its keys sorted; `merge(w, 1, Integer::sum)` adds one.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  String text = "the cat and the dog and the bird";
                  Map<String, Integer> count = new TreeMap<>();
                  for (String w : text.split(" ")) count.merge(w, 1, Integer::sum);
                  for (Map.Entry<String, Integer> e : count.entrySet()) {
                      System.out.println(e.getKey() + "=" + e.getValue());
                  }
              }
          }`,
        output: `
          and=2
          bird=1
          cat=1
          dog=1
          the=3`,
      },
      {
        q: "Group students by marks, with the marks from lowest to highest: Asha 82, Ravi 75, Meena 82, Kiran 90, Zoya 75. Inside a group keep the input order.",
        example: `
          Output: 75: [Ravi, Zoya]
                  82: [Asha, Meena]
                  90: [Kiran]`,
        hint: "`TreeMap<Integer, List<String>>` with `computeIfAbsent(marks, k -> new ArrayList<>()).add(name)`.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  String[] names = {"Asha", "Ravi", "Meena", "Kiran", "Zoya"};
                  int[] marks = {82, 75, 82, 90, 75};
                  Map<Integer, List<String>> byMarks = new TreeMap<>();
                  for (int i = 0; i < names.length; i++) {
                      byMarks.computeIfAbsent(marks[i], k -> new ArrayList<>()).add(names[i]);
                  }
                  for (Map.Entry<Integer, List<String>> e : byMarks.entrySet()) {
                      System.out.println(e.getKey() + ": " + e.getValue());
                  }
              }
          }`,
        output: `
          75: [Ravi, Zoya]
          82: [Asha, Meena]
          90: [Kiran]`,
      },
      {
        q: "Count the **distinct** points in `(1,2) (3,4) (1,2) (0,0) (3,4)` by putting them in a `HashSet<Point>`. Write the `Point` class so it works as a key.",
        example: "Output: 3",
        hint: "Override both `equals` and `hashCode` (`Objects.hash(x, y)`). Or use a `record`, which writes both for you.",
        java: `
          import java.util.*;

          public class Main {
              static class Point {
                  final int x, y;
                  Point(int x, int y) { this.x = x; this.y = y; }
                  @Override public boolean equals(Object o) {
                      return o instanceof Point p && p.x == x && p.y == y;
                  }
                  @Override public int hashCode() { return Objects.hash(x, y); }
              }

              public static void main(String[] args) {
                  int[][] pts = {{1, 2}, {3, 4}, {1, 2}, {0, 0}, {3, 4}};
                  Set<Point> set = new HashSet<>();
                  for (int[] p : pts) set.add(new Point(p[0], p[1]));
                  System.out.println(set.size());
              }
          }`,
        output: "3",
      },
    ],
    other: {
      note: `Python's \`dict\` and \`set\` are hash tables too, but there is only one of each. A \`dict\` keeps insertion order (like LinkedHashMap); there is no built-in sorted map, so you sort the keys when you need order. Instead of \`equals\` / \`hashCode\`, Python uses \`__eq__\` / \`__hash__\`, and only immutable values (numbers, strings, tuples) can be keys.`,
      rows: [
        ["`HashMap` / `LinkedHashMap`", "`dict`"],
        ["`TreeMap` (sorted keys)", "`sorted(d)` when needed, or `bisect` on a sorted list"],
        ["`HashSet` / `LinkedHashSet`", "`set` / `dict.fromkeys(items)`"],
        ["`equals()` + `hashCode()`", "`__eq__` + `__hash__` (or use a tuple as the key)"],
        ["`map.merge(k, 1, Integer::sum)`", "`d[k] = d.get(k, 0) + 1` or `Counter`"],
        ["LRU with `LinkedHashMap`", "`OrderedDict` with `move_to_end`"],
      ],
    },
  },

  "Iterator, Comparable vs Comparator, generics & wrappers": {
    lang: "java",
    simple: `Four ideas that hold the Collections Framework together, and each one is a classic interview question:

    - **Iterator** — the object a for-each loop uses behind the scenes. Changing a list while a for-each walks it throws \`ConcurrentModificationException\`; remove through the iterator (or \`removeIf\`) instead.
    - **Comparable vs Comparator** — Comparable is the class's own *natural* order (\`compareTo\`); a Comparator is any extra order you pass in from outside.
    - **Generics** — the \`<String>\` in \`List<String>\`. They let the compiler catch wrong types and save you from casts.
    - **Wrapper classes** — collections hold objects, so \`int\` becomes \`Integer\` automatically (autoboxing). Comparing two \`Integer\`s with \`==\` is a famous bug.`,
    analogy: `An iterator is a bookmark moving through a book. If someone tears pages out while you read (modifying the list in a for-each), the bookmark is lost — Java stops with an error rather than give you a wrong page.

    Comparable is how a class is sorted "by default", like a dictionary sorting words alphabetically. A Comparator is a different sorting rule you hand over when needed — "sort these words by length instead".`,
    how: {
      steps: [
        "Removing while looping? Use `list.removeIf(x -> ...)`, or an explicit `Iterator` with `it.remove()`. Never `list.remove(...)` inside a for-each.",
        "One obvious order for your class (by id, by date)? Implement `Comparable<T>` and write `compareTo`.",
        "Need other orders, or can't edit the class? Pass a `Comparator`: `Comparator.comparing(Student::name)`, then `.reversed()` / `.thenComparing(...)`.",
        "Write generic code with a type parameter: `class Box<T>`, or `static <T> void show(List<T> list)`. Use `<T extends Comparable<T>>` when you need to compare T's.",
        "Compare `Integer`, `Long`, `String` and other objects with `.equals()`, and primitives (`int`) with `==`.",
      ],
    },
    concepts: [
      { term: "Iterator", meaning: "`hasNext()`, `next()`, `remove()`. Every Collection gives you one with `.iterator()`." },
      { term: "Fail-fast", meaning: "ArrayList / HashMap iterators throw `ConcurrentModificationException` if the collection is changed behind their back." },
      { term: "Comparable<T>", meaning: "`int compareTo(T other)` inside the class: negative = this comes first, 0 = equal, positive = this comes after." },
      { term: "Comparator<T>", meaning: "`int compare(T a, T b)` in a separate object or lambda. Lets you sort one class many ways." },
      { term: "Generics & type erasure", meaning: "Type checks happen at compile time; at runtime `List<String>` is just `List`. That's why you can't write `new T()`." },
      { term: "Wrapper class", meaning: "Object version of a primitive: `Integer`, `Long`, `Double`, `Character`, `Boolean`." },
      { term: "Autoboxing / unboxing", meaning: "Automatic `int` ↔ `Integer` conversion. Unboxing `null` throws NullPointerException." },
      { term: "Integer cache", meaning: "`Integer` values from -128 to 127 are cached and shared, so `==` happens to work for them — and fails for 128." },
    ],
    syntax: [
      { task: "Walk with an iterator", java: "Iterator<Integer> it = list.iterator();\nwhile (it.hasNext()) {\n    if (it.next() < 0) it.remove();\n}" },
      { task: "Remove matching items", java: "list.removeIf(x -> x < 0);" },
      { task: "Natural order", java: "class Student implements Comparable<Student> {\n    public int compareTo(Student o) { return Integer.compare(marks, o.marks); }\n}" },
      { task: "Sort with a comparator", java: "list.sort(Comparator.comparing(Student::getName));" },
      { task: "Descending, then a tie-break", java: "Comparator.comparingInt(Student::getMarks).reversed()\n          .thenComparing(Student::getName)" },
      { task: "Generic class", java: "class Pair<A, B> { A first; B second; }" },
      { task: "Generic method", java: "static <T extends Comparable<T>> T maxOf(List<T> list) { ... }" },
      { task: "Compare wrapper objects", java: "a.equals(b)        // not a == b" },
      { task: "Parse / convert", java: "int n = Integer.parseInt(\"42\");\nInteger boxed = n;   // autoboxing" },
    ],
    compare: {
      head: ["", "Comparable", "Comparator"],
      rows: [
        ["Package", "`java.lang`", "`java.util`"],
        ["Method", "`compareTo(T other)`", "`compare(T a, T b)`"],
        ["Where it lives", "Inside the class being sorted", "Outside: a separate class or a lambda"],
        ["How many orders", "One — the natural order", "As many as you like"],
        ["Used by", "`Collections.sort(list)`, TreeSet, TreeMap by default", "`list.sort(cmp)`, `new TreeSet<>(cmp)`"],
        ["Example", "`String`, `Integer`, `LocalDate`", "`Comparator.comparing(Student::getName)`"],
      ],
    },
    code: [
      {
        title: "Removing items while looping: one wrong way, three right ways",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));

                  // WRONG: changing the list inside a for-each
                  try {
                      for (int x : nums) {
                          if (x % 2 == 0) nums.remove(Integer.valueOf(x));
                      }
                  } catch (ConcurrentModificationException e) {
                      System.out.println("for-each + remove -> " + e.getClass().getSimpleName());
                  }

                  // RIGHT 1: remove through the iterator itself
                  List<Integer> a = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
                  Iterator<Integer> it = a.iterator();
                  while (it.hasNext()) {
                      if (it.next() % 2 == 0) it.remove();
                  }
                  System.out.println("iterator.remove " + a);

                  // RIGHT 2: removeIf does the same in one line
                  List<Integer> b = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
                  b.removeIf(x -> x % 2 == 0);
                  System.out.println("removeIf        " + b);

                  // RIGHT 3: an index loop going backwards (removing doesn't shift what's left to visit)
                  List<Integer> c = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
                  for (int i = c.size() - 1; i >= 0; i--) {
                      if (c.get(i) % 2 == 0) c.remove(i);
                  }
                  System.out.println("backwards loop  " + c);
              }
          }`,
        output: `
          for-each + remove -> ConcurrentModificationException
          iterator.remove [1, 3, 5]
          removeIf        [1, 3, 5]
          backwards loop  [1, 3, 5]`,
      },
      {
        title: "Comparable vs Comparator",
        note: "`Student` sorts by roll number by itself (Comparable). Any other order — by name, by marks high to low with a tie-break — is a Comparator passed in.",
        java: `
          import java.util.*;

          public class Main {
              static class Student implements Comparable<Student> {
                  int roll; String name; int marks;
                  Student(int roll, String name, int marks) { this.roll = roll; this.name = name; this.marks = marks; }
                  int getMarks() { return marks; }
                  String getName() { return name; }

                  @Override public int compareTo(Student other) {      // natural order: by roll
                      return Integer.compare(roll, other.roll);
                  }
                  @Override public String toString() { return roll + ":" + name + "(" + marks + ")"; }
              }

              public static void main(String[] args) {
                  List<Student> list = new ArrayList<>(List.of(
                      new Student(3, "Ravi", 82), new Student(1, "Meena", 91),
                      new Student(2, "Asha", 82), new Student(4, "Kiran", 67)));

                  Collections.sort(list);                                  // uses compareTo
                  System.out.println("by roll  " + list);

                  list.sort(Comparator.comparing(Student::getName));       // a Comparator
                  System.out.println("by name  " + list);

                  list.sort(Comparator.comparingInt(Student::getMarks).reversed()
                                      .thenComparing(Student::getName));
                  System.out.println("by marks " + list);
              }
          }`,
        output: `
          by roll  [1:Meena(91), 2:Asha(82), 3:Ravi(82), 4:Kiran(67)]
          by name  [2:Asha(82), 4:Kiran(67), 1:Meena(91), 3:Ravi(82)]
          by marks [1:Meena(91), 2:Asha(82), 3:Ravi(82), 4:Kiran(67)]`,
      },
      {
        title: "Generics: write it once, use it for any type",
        note: "`Pair<A, B>` and `maxOf` work for any type. Without generics you'd store `Object`, cast everywhere, and only find mistakes when the program crashes.",
        java: `
          import java.util.*;

          public class Main {
              static class Pair<A, B> {
                  final A first; final B second;
                  Pair(A first, B second) { this.first = first; this.second = second; }
                  @Override public String toString() { return "(" + first + ", " + second + ")"; }
              }

              // T must be comparable to itself, so compareTo can be called
              static <T extends Comparable<T>> T maxOf(List<T> list) {
                  T best = list.get(0);
                  for (T x : list) if (x.compareTo(best) > 0) best = x;
                  return best;
              }

              public static void main(String[] args) {
                  Pair<String, Integer> p = new Pair<>("Asha", 91);
                  String name = p.first;               // no cast needed
                  System.out.println(p + " -> name " + name);

                  System.out.println(maxOf(List.of(4, 9, 2)));
                  System.out.println(maxOf(List.of("pear", "apple", "fig")));

                  List<String> names = new ArrayList<>();
                  names.add("Ravi");
                  // names.add(42);   // compile error: the compiler stops the wrong type
                  System.out.println(names);
              }
          }`,
        output: `
          (Asha, 91) -> name Asha
          9
          pear
          [Ravi]`,
      },
      {
        title: "Wrapper classes and the Integer == trap",
        note: "`==` on objects asks \"same object?\", not \"same value?\". It looks right for small numbers because Java caches -128..127 — the bug then shows up only on bigger inputs.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Integer a = 127, b = 127;
                  Integer c = 128, d = 128;
                  System.out.println("127 == 127: " + (a == b));        // cached, same object
                  System.out.println("128 == 128: " + (c == d));        // two different objects
                  System.out.println("128 equals 128: " + c.equals(d)); // compares the values
                  int e = 128;
                  System.out.println("Integer == int: " + (c == e));    // unboxed, compares values

                  List<Integer> list = new ArrayList<>();
                  list.add(5);                     // autoboxing: int 5 -> Integer
                  int first = list.get(0);         // unboxing: Integer -> int
                  System.out.println("first " + first);

                  Map<String, Integer> stock = new HashMap<>();
                  try {
                      int pens = stock.get("pens");   // get returns null; unboxing null fails
                  } catch (NullPointerException ex) {
                      System.out.println("unboxing null -> NullPointerException");
                  }
                  System.out.println("safe: " + stock.getOrDefault("pens", 0));
              }
          }`,
        output: `
          127 == 127: true
          128 == 128: false
          128 equals 128: true
          Integer == int: true
          first 5
          unboxing null -> NullPointerException
          safe: 0`,
      },
    ],
    mistakes: [
      "Calling `list.remove(...)` inside a for-each loop → ConcurrentModificationException. Use `removeIf` or `iterator.remove()`.",
      "Writing `compareTo` / `compare` as `a - b`. It overflows for big or negative values; use `Integer.compare(a, b)`.",
      "Comparing `Integer`, `Long` or `String` objects with `==`. Use `.equals()`.",
      "Unboxing a `null` from `map.get(...)` into an `int` → NullPointerException.",
      "Using raw types (`List list = new ArrayList();`) — you lose all type checks. Always give the type: `List<String>`.",
      "Thinking `List<Integer>` is a subtype of `List<Number>`. It isn't; use `List<? extends Number>` to accept both.",
    ],
    remember: "Remove with the iterator, sort with compareTo or a Comparator, let generics catch wrong types, and compare wrapper objects with equals().",
    exercises: [
      {
        q: "Sort the students Asha 82, Ravi 91, Meena 82, Kiran 75 by marks **high to low**, and by name A→Z when marks are equal. Print `name marks` per line.",
        example: `
          Output: Ravi 91
                  Asha 82
                  Meena 82
                  Kiran 75`,
        hint: "`Comparator.comparingInt(...).reversed().thenComparing(...)`. A `record` gives you the getter methods for free.",
        java: `
          import java.util.*;

          public class Main {
              record Student(String name, int marks) {}

              public static void main(String[] args) {
                  List<Student> list = new ArrayList<>(List.of(
                      new Student("Asha", 82), new Student("Ravi", 91),
                      new Student("Meena", 82), new Student("Kiran", 75)));
                  list.sort(Comparator.comparingInt(Student::marks).reversed()
                                      .thenComparing(Student::name));
                  for (Student s : list) System.out.println(s.name() + " " + s.marks());
              }
          }`,
        output: `
          Ravi 91
          Asha 82
          Meena 82
          Kiran 75`,
      },
      {
        q: "From `[\"go\", \"java\", \"c\", \"python\", \"js\", \"rust\"]`, remove every word shorter than 3 letters using an explicit `Iterator`, then print the list.",
        example: "Output: [java, python, rust]",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  List<String> words = new ArrayList<>(List.of("go", "java", "c", "python", "js", "rust"));
                  Iterator<String> it = words.iterator();
                  while (it.hasNext()) {
                      if (it.next().length() < 3) it.remove();
                  }
                  System.out.println(words);
              }
          }`,
        output: "[java, python, rust]",
      },
      {
        q: "Write a generic method `count(List<T> list, T x)` that returns how often `x` appears. Test it on `[1000, 5, 1000, 7]` with `1000`, and on `[\"a\", \"b\", \"a\"]` with `\"a\"`. Make sure the first answer is 2, not 0.",
        example: `
          Output: 2
                  2`,
        hint: "Compare with `x.equals(item)`. With `==`, the two Integer objects holding 1000 are different objects.",
        java: `
          import java.util.*;

          public class Main {
              static <T> int count(List<T> list, T x) {
                  int c = 0;
                  for (T item : list) {
                      if (x.equals(item)) c++;     // not x == item
                  }
                  return c;
              }

              public static void main(String[] args) {
                  System.out.println(count(List.of(1000, 5, 1000, 7), 1000));
                  System.out.println(count(List.of("a", "b", "a"), "a"));
              }
          }`,
        output: `
          2
          2`,
      },
    ],
    other: {
      note: `Python has no checked generics, wrapper classes or ConcurrentModificationException. You loop with \`for\` (iterators are built in), sort with \`key=\` functions, and \`==\` already compares values. The traps are different: changing a list while looping over it silently skips items, so loop over a copy or build a new list.`,
      rows: [
        ["`Iterator` / `it.remove()`", "`for x in items` / build a new list: `[x for x in items if keep(x)]`"],
        ["`ConcurrentModificationException`", "No error — items are silently skipped (a sneakier bug)"],
        ["`Comparable.compareTo`", "`__lt__` on the class"],
        ["`Comparator.comparing(...)`", "`sorted(items, key=lambda s: s.name)`"],
        ["`.reversed().thenComparing(...)`", "`key=lambda s: (-s.marks, s.name)`"],
        ["Generics `List<String>`", "Optional type hints `list[str]`, not checked when running"],
        ["`Integer` vs `int`, `equals` vs `==`", "One `int` type; `==` compares values, `is` compares identity"],
      ],
    },
  },

  // ───────────────────────── Python · Core data types ─────────────────────────

  "list vs tuple vs set vs dict": {
    lang: "python",
    simple: `Python has four built-in containers, and interviewers love asking how they differ:

    - **list** \`[1, 2, 3]\` — ordered, changeable, allows duplicates. Your everyday array.
    - **tuple** \`(1, 2, 3)\` — ordered, allows duplicates, but **cannot be changed** after it is made.
    - **set** \`{1, 2, 3}\` — no duplicates, no positions, very fast "is x in here?".
    - **dict** \`{"a": 1}\` — key → value pairs, keys unique, fast lookup by key, remembers insertion order.

    The deeper idea is **mutable vs immutable**. Only immutable (hashable) values — numbers, strings, tuples — can be set items or dict keys. That's why you can use a tuple \`(row, col)\` as a key, but not a list.`,
    analogy: `A list is a shopping list on a whiteboard: in order, you can erase and add. A tuple is your date of birth printed on an ID card: fixed once issued. A set is the attendance register's "present" ticks: each name once, order doesn't matter. A dict is a phone book: look up the name, get the number.`,
    how: {
      steps: [
        "Need a sequence you will add to, change or sort? → `list`.",
        "A fixed group of values that belong together, like a point `(x, y)` or a function returning two things? → `tuple`.",
        "Only care whether something exists, or need to drop duplicates? → `set`.",
        "Need to look something up by a name or id? → `dict`.",
        "Need one of these as a dict key or inside a set? It must be immutable: convert a list to a `tuple` first.",
      ],
    },
    concepts: [
      { term: "Ordered", meaning: "Items keep their positions: list, tuple, and dict (insertion order, since Python 3.7). Sets have no order." },
      { term: "Mutable", meaning: "Can be changed in place: list, set, dict. Immutable: tuple, str, int, float, frozenset." },
      { term: "Hashable", meaning: "Has a fixed hash value, so it can be a dict key or set item. Immutable built-ins are hashable; lists, sets and dicts are not." },
      { term: "Indexing / slicing", meaning: "`a[0]`, `a[1:3]` work on list and tuple. Sets have no index; dicts are indexed by key." },
      { term: "Membership `in`", meaning: "O(n) for list / tuple (checks one by one), O(1) on average for set and dict keys." },
      { term: "frozenset", meaning: "An immutable set — usable as a dict key or inside another set." },
    ],
    syntax: [
      { task: "Create each one", python: "a = [1, 2, 2]\nt = (1, 2, 2)\ns = {1, 2}\nd = {\"x\": 1}" },
      { task: "Empty versions", python: "[]   ()   set()   {}      # {} is an empty DICT" },
      { task: "Add an item", python: "a.append(3)\ns.add(3)\nd[\"y\"] = 2\n# tuple: make a new one: t + (3,)" },
      { task: "Remove an item", python: "a.remove(2)    # first 2\ns.discard(2)   # no error if missing\nd.pop(\"x\")" },
      { task: "Check membership", python: "2 in a   2 in s   \"x\" in d" },
      { task: "Convert between them", python: "list(t)   tuple(a)   set(a)   dict(pairs)" },
      { task: "Drop duplicates, keep order", python: "list(dict.fromkeys(a))" },
      { task: "Set maths", python: "a | b   a & b   a - b   a ^ b" },
      { task: "Loop over a dict", python: "for key, value in d.items():" },
    ],
    compare: {
      head: ["", "list", "tuple", "set", "dict"],
      rows: [
        ["Written as", "`[1, 2]`", "`(1, 2)`", "`{1, 2}`", "`{\"a\": 1}`"],
        ["Ordered", "Yes", "Yes", "No", "Yes (insertion order)"],
        ["Changeable", "Yes", "No", "Yes", "Yes"],
        ["Duplicates", "Allowed", "Allowed", "Removed", "Keys unique"],
        ["Index access", "`a[0]`", "`t[0]`", "No", "By key: `d[\"a\"]`"],
        ["Can be a dict key", "No", "Yes (if its items are)", "No (frozenset can)", "No"],
        ["`x in ...`", "O(n)", "O(n)", "O(1) average", "O(1) average (keys)"],
        ["Typical use", "A sequence you change", "A fixed record, e.g. `(x, y)`", "Seen / unique checks", "Lookup by key, counting"],
      ],
    },
    code: [
      {
        title: "Same values, four containers",
        note: "The same five values go into each container. Watch what happens to the duplicate 3 and the order.",
        python: `
          values = [3, 1, 3, 2, 5]

          a = list(values)
          t = tuple(values)
          s = set(values)
          d = {v: v * v for v in values}       # value -> its square

          print("list ", a, "len", len(a))
          print("tuple", t, "len", len(t))
          print("set  ", sorted(s), "len", len(s))   # sets have no order; sort to print
          print("dict ", d, "len", len(d))

          a.append(9)                  # list: change in place
          a[0] = 0
          print("list after changes", a)

          try:
              t[0] = 0                 # tuple: cannot change
          except TypeError as e:
              print("tuple:", e)

          print("t[1:3] =", t[1:3], " d[5] =", d[5], " 2 in s:", 2 in s)`,
        output: `
          list  [3, 1, 3, 2, 5] len 5
          tuple (3, 1, 3, 2, 5) len 5
          set   [1, 2, 3, 5] len 4
          dict  {3: 9, 1: 1, 2: 4, 5: 25} len 4
          list after changes [0, 1, 3, 2, 5, 9]
          tuple: 'tuple' object does not support item assignment
          t[1:3] = (1, 3)  d[5] = 25  2 in s: True`,
      },
      {
        title: "Mutable vs immutable, and why only some things can be keys",
        note: "Changing a list changes the same object everyone points to. A tuple can't change, so its hash never changes either — which is exactly what a dict key needs.",
        python: `
          a = [1, 2]
          b = a                    # b is the SAME list, not a copy
          b.append(3)
          print("a =", a)          # a changed too

          t = (1, 2)
          u = t + (3,)             # "changing" a tuple makes a new tuple
          print("t =", t, " u =", u)

          # Grid cells as keys: a tuple works, a list does not
          visited = {(0, 0): "start", (2, 3): "goal"}
          print("goal at (2, 3):", visited[(2, 3)])
          try:
              bad = {[0, 0]: "start"}
          except TypeError as e:
              print("list as key ->", e)

          seen = set()
          seen.add((1, 2))
          seen.add(frozenset({1, 2}))  # a frozen (immutable) set is hashable too
          print("items in seen:", len(seen))`,
        output: `
          a = [1, 2, 3]
          t = (1, 2)  u = (1, 2, 3)
          goal at (2, 3): goal
          list as key -> unhashable type: 'list'
          items in seen: 2`,
      },
      {
        title: "Picking the right container for each job",
        note: "One small program, four jobs, four containers. This is the reasoning interviewers want to hear.",
        python: `
          log = ["asha", "ravi", "asha", "meena", "ravi", "asha"]   # list: visits in order

          unique = set(log)                                     # set: who visited at all
          print("unique visitors:", len(unique))

          visits = {}                                           # dict: name -> count
          for name in log:
              visits[name] = visits.get(name, 0) + 1
          print("visits:", visits)

          top = max(visits.items(), key=lambda kv: kv[1])       # tuple: (name, count)
          name, count = top
          print("top visitor:", name, "with", count)

          print("is kiran a visitor?", "kiran" in unique)       # O(1) check on a set`,
        output: `
          unique visitors: 3
          visits: {'asha': 3, 'ravi': 2, 'meena': 1}
          top visitor: asha with 3
          is kiran a visitor? False`,
      },
    ],
    mistakes: [
      "`{}` is an empty **dict**, not an empty set. Use `set()`.",
      "Checking `x in big_list` inside a loop — that's O(n) each time. Convert the list to a set once.",
      "Expecting a set to keep order or support `s[0]`. Sort it or use `dict.fromkeys` to keep first-seen order.",
      "Using a list as a dict key or set item → `TypeError: unhashable type: 'list'`. Use a tuple.",
      "`b = a` does not copy a list — both names point to the same list. Use `a.copy()` or `a[:]`.",
      "Saying tuples are \"faster lists\". The real reason to use one is that it can't change and can be a key.",
    ],
    remember: "list to change, tuple to fix, set to check, dict to look up — and only immutable things can be keys.",
    exercises: [
      {
        q: "From `[4, 1, 4, 2, 1, 5]`, print the unique values in the order they first appear, then how many there are.",
        example: `
          Output: [4, 1, 2, 5]
                  4`,
        hint: "`set()` loses the order. `dict.fromkeys(nums)` keeps the first-seen order because dicts remember insertion order.",
        python: `
          nums = [4, 1, 4, 2, 1, 5]
          unique = list(dict.fromkeys(nums))
          print(unique)
          print(len(unique))`,
        output: `
          [4, 1, 2, 5]
          4`,
      },
      {
        q: "Store each student as a tuple `(name, marks)`: Asha 82, Ravi 91, Meena 67. Print them from highest to lowest marks, as `name: marks`.",
        example: `
          Output: Ravi: 91
                  Asha: 82
                  Meena: 67`,
        python: `
          students = [("Asha", 82), ("Ravi", 91), ("Meena", 67)]
          for name, marks in sorted(students, key=lambda s: s[1], reverse=True):
              print(f"{name}: {marks}")`,
        output: `
          Ravi: 91
          Asha: 82
          Meena: 67`,
      },
      {
        q: "Find the numbers that appear in both `[1, 3, 5, 7, 9]` and `[3, 4, 5, 6, 7]`, and the ones only in the first list. Print both in sorted order.",
        example: `
          Output: both: [3, 5, 7]
                  only first: [1, 9]`,
        hint: "Set intersection `&` and difference `-`.",
        python: `
          a = {1, 3, 5, 7, 9}
          b = {3, 4, 5, 6, 7}
          print("both:", sorted(a & b))
          print("only first:", sorted(a - b))`,
        output: `
          both: [3, 5, 7]
          only first: [1, 9]`,
      },
    ],
    other: {
      note: `Java has no tuple and no literal syntax for these: you pick a class from the Collections Framework (see "Java · Collections Framework"). Its HashMap and HashSet don't keep insertion order like Python's dict — use LinkedHashMap / LinkedHashSet for that.`,
      rows: [
        ["`list`", "`ArrayList`"],
        ["`tuple`", "A `record`, e.g. `record Point(int x, int y)`, or `List.of(...)` (read-only)"],
        ["`set`", "`HashSet` (`LinkedHashSet` to keep order)"],
        ["`dict`", "`HashMap` (`LinkedHashMap` to keep insertion order)"],
        ["`frozenset`", "`Set.of(...)`"],
        ["Hashable keys", "Keys need `equals()` + `hashCode()`"],
      ],
    },
  },

  "Tuples, unpacking & comprehensions": {
    lang: "python",
    simple: `Two things make Python code short and readable, and both come up in interviews and in every solution you write:

    **Unpacking** pulls a tuple (or any sequence) apart into names in one line: \`x, y = point\`, \`a, b = b, a\` to swap, \`first, *rest = nums\`. It is also what happens in \`for i, x in enumerate(nums)\`.

    **Comprehensions** build a list, dict or set from a loop in one expression: \`[x * x for x in nums if x > 0]\`. Read it left to right as "give me **this** for each **x** in **that**, if **condition**". The same idea without brackets — a *generator expression* — feeds \`sum()\`, \`any()\` and \`max()\` without building a list.`,
    analogy: `Unpacking is opening a lunch box with labelled compartments: one move and the roti, sabzi and dal are each in your hands. A comprehension is a recipe card — "for every tomato, if it's ripe, chop it" — instead of describing each step out loud.`,
    how: {
      steps: [
        "Write the normal loop first: `result = []`, `for x in items:`, `if cond:`, `result.append(expr)`.",
        "Turn it into a comprehension by moving the parts: `[expr for x in items if cond]`.",
        "Need a different value when the condition fails? The if-else goes **before** `for`: `[a if cond else b for x in items]`.",
        "Two loops? Keep them in the same order as the nested loop: `[cell for row in grid for cell in row]`.",
        "Only summing, counting or checking? Drop the brackets: `sum(x for x in items if cond)`.",
        "If the comprehension needs more than one line to understand, go back to the normal loop.",
      ],
    },
    concepts: [
      { term: "Tuple packing", meaning: "`t = 1, 2, 3` — commas make the tuple, not the brackets." },
      { term: "One-element tuple", meaning: "`(5,)` with a trailing comma. `(5)` is just the number 5 in brackets." },
      { term: "Unpacking", meaning: "`a, b = (1, 2)`. The number of names must match the number of items, or you get ValueError." },
      { term: "Star unpacking", meaning: "`first, *middle, last = nums` — the starred name gets a list of whatever is left." },
      { term: "List / dict / set comprehension", meaning: "`[...]`, `{k: v ...}`, `{x ...}` built from a `for` (and optional `if`) in one expression." },
      { term: "Generator expression", meaning: "`(x * x for x in nums)` — produces values one by one, without storing a whole list." },
      { term: "namedtuple", meaning: "A tuple with field names: `p.x` instead of `p[0]` (from `collections`)." },
    ],
    syntax: [
      { task: "Make a tuple", python: "t = (1, 2, 3)\nt = 1, 2, 3\none = (5,)" },
      { task: "Unpack", python: "x, y = (3, 4)" },
      { task: "Swap two variables", python: "a, b = b, a" },
      { task: "Take first and the rest", python: "first, *rest = [1, 2, 3, 4]" },
      { task: "Return two values", python: "def min_max(a):\n    return min(a), max(a)\nlo, hi = min_max(nums)" },
      { task: "Loop with index / two lists", python: "for i, x in enumerate(nums):\nfor a, b in zip(xs, ys):" },
      { task: "List comprehension", python: "[x * x for x in nums if x % 2 == 0]" },
      { task: "With if-else", python: "[\"even\" if x % 2 == 0 else \"odd\" for x in nums]" },
      { task: "Dict / set comprehension", python: "{w: len(w) for w in words}\n{x % 3 for x in nums}" },
      { task: "Flatten a grid", python: "[c for row in grid for c in row]" },
      { task: "Generator in a function", python: "sum(x * x for x in nums)\nany(x < 0 for x in nums)" },
    ],
    code: [
      {
        title: "Tuples and unpacking",
        python: `
          one = (5,)
          not_tuple = (5)
          print(type(one).__name__, type(not_tuple).__name__)    # the comma makes the tuple

          point = (3, 4)
          x, y = point                       # unpacking
          print("x =", x, "y =", y)

          a, b = 1, 2
          a, b = b, a                        # swap without a temp variable
          print("a =", a, "b =", b)

          first, *middle, last = [10, 20, 30, 40, 50]
          print(first, middle, last)

          def min_max(nums):
              return min(nums), max(nums)    # returns ONE tuple
          lo, hi = min_max([7, 2, 9, 4])
          print("lo", lo, "hi", hi)

          for i, (name, marks) in enumerate([("Asha", 82), ("Ravi", 91)], start=1):
              print(i, name, marks)          # nested unpacking in a loop

          try:
              p, q = (1, 2, 3)
          except ValueError:
              print("ValueError: 3 values but only 2 names")   # message wording varies by Python version`,
        output: `
          tuple int
          x = 3 y = 4
          a = 2 b = 1
          10 [20, 30, 40] 50
          lo 2 hi 9
          1 Asha 82
          2 Ravi 91
          ValueError: 3 values but only 2 names`,
      },
      {
        title: "From a loop to a comprehension",
        note: "Each comprehension builds exactly what the loop above it builds. Note the grid at the end: `[[0] * 3] * 3` copies the *same* row three times.",
        python: `
          nums = [1, 2, 3, 4, 5, 6]

          squares = []
          for x in nums:
              if x % 2 == 0:
                  squares.append(x * x)
          print(squares)
          print([x * x for x in nums if x % 2 == 0])          # same thing, one line

          print(["even" if x % 2 == 0 else "odd" for x in nums[:3]])

          words = ["apple", "kiwi", "banana"]
          print({w: len(w) for w in words})                   # dict comprehension
          print(sorted({len(w) for w in words}))              # set comprehension

          grid = [[1, 2], [3, 4], [5, 6]]
          print([c for row in grid for c in row])             # flatten: outer loop first

          good = [[0] * 3 for _ in range(3)]                  # 3 separate rows
          bad = [[0] * 3] * 3                                 # the SAME row 3 times
          good[0][0] = 1
          bad[0][0] = 1
          print("good", good)
          print("bad ", bad)`,
        output: `
          [4, 16, 36]
          [4, 16, 36]
          ['odd', 'even', 'odd']
          {'apple': 5, 'kiwi': 4, 'banana': 6}
          [4, 5, 6]
          [1, 2, 3, 4, 5, 6]
          good [[1, 0, 0], [0, 0, 0], [0, 0, 0]]
          bad  [[1, 0, 0], [1, 0, 0], [1, 0, 0]]`,
      },
      {
        title: "Generator expressions: no list needed",
        note: "When the result goes straight into `sum`, `any`, `all`, `max` or `min`, leave out the square brackets. `any` and `all` even stop early once they know the answer.",
        python: `
          nums = [3, -1, 4, 1, -5, 9]

          print("sum of squares:", sum(x * x for x in nums))
          print("count negatives:", sum(1 for x in nums if x < 0))
          print("any negative?", any(x < 0 for x in nums))
          print("all below 10?", all(x < 10 for x in nums))

          words = ["pear", "banana", "fig"]
          print("longest:", max(words, key=len))
          print("total letters:", sum(len(w) for w in words))`,
        output: `
          sum of squares: 133
          count negatives: 2
          any negative? True
          all below 10? True
          longest: banana
          total letters: 13`,
      },
    ],
    mistakes: [
      "Writing `(5)` for a one-element tuple. It's `(5,)`.",
      "Unpacking the wrong number of names: `a, b = (1, 2, 3)` → ValueError. Use `a, *rest = ...`.",
      "Putting if-else after `for`: `[x for x in a if c else y]` is a syntax error. The if-else goes before `for`; a filter-only `if` goes after.",
      "Building a grid with `[[0] * m] * n` — every row is the same list. Use `[[0] * m for _ in range(n)]`.",
      "Writing a long comprehension with several conditions that nobody can read. A normal loop is fine.",
      "`sum([x for x in nums])` — the brackets build a list for nothing. `sum(x for x in nums)`.",
    ],
    remember: "Unpack with commas, build with `[expr for x in items if cond]`, and drop the brackets when the result goes straight into sum, any or max.",
    exercises: [
      {
        q: "Using one list comprehension, make the squares of the even numbers from 1 to 10.",
        example: "Output: [4, 16, 36, 64, 100]",
        python: `
          print([x * x for x in range(1, 11) if x % 2 == 0])`,
        output: "[4, 16, 36, 64, 100]",
      },
      {
        q: "Read a line of numbers. Without writing an `if` statement, print `min max sum` using unpacking, and the count of positive numbers using a generator expression.",
        example: `
          Input:  4 -2 7 0 -5 3
          Output: -5 7 7
                  3`,
        hint: "`lo, hi, total = min(a), max(a), sum(a)`; count with `sum(1 for x in a if x > 0)`.",
        input: "4 -2 7 0 -5 3",
        python: `
          nums = list(map(int, input().split()))
          lo, hi, total = min(nums), max(nums), sum(nums)
          print(lo, hi, total)
          print(sum(1 for x in nums if x > 0))`,
        output: `
          -5 7 7
          3`,
      },
      {
        q: "Transpose the matrix `[[1, 2, 3], [4, 5, 6]]` (rows become columns) with a comprehension, then do it again with `zip(*m)`.",
        example: `
          Output: [[1, 4], [2, 5], [3, 6]]
                  [[1, 4], [2, 5], [3, 6]]`,
        hint: "Column `c` is `[row[c] for row in m]`. `zip(*m)` unpacks the rows as separate arguments and pairs them up.",
        python: `
          m = [[1, 2, 3], [4, 5, 6]]
          print([[row[c] for row in m] for c in range(len(m[0]))])
          print([list(col) for col in zip(*m)])`,
        output: `
          [[1, 4], [2, 5], [3, 6]]
          [[1, 4], [2, 5], [3, 6]]`,
      },
    ],
    other: {
      note: `Java has neither tuples nor unpacking. A small \`record\` is the usual way to group values, and you read its fields by name. Comprehensions map to plain loops or to streams — in interviews a simple loop is perfectly fine.`,
      rows: [
        ["`(x, y)`", "`record Point(int x, int y)` or `new int[]{x, y}`"],
        ["`x, y = point`", "`int x = p.x(), y = p.y();`"],
        ["`a, b = b, a`", "`int tmp = a; a = b; b = tmp;`"],
        ["Return two values", "Return a `record` or an `int[]`"],
        ["`[x * x for x in a if x % 2 == 0]`", "A loop, or `a.stream().filter(x -> x % 2 == 0).map(x -> x * x).toList()`"],
        ["`sum(x * x for x in a)`", "`a.stream().mapToInt(x -> x * x).sum()`"],
        ["`[[0] * m for _ in range(n)]`", "`new int[n][m]` (always separate rows)"],
      ],
    },
  },

  "collections module, copying & Python gotchas": {
    lang: "python",
    simple: `The \`collections\` module adds specialised containers on top of list and dict. Five are worth knowing for interviews: \`Counter\` (counting), \`defaultdict\` (a dict that fills in missing keys), \`deque\` (fast at both ends), \`OrderedDict\` (move keys to the end — LRU caches) and \`namedtuple\` (tuples with field names).

    The second half of this lesson is about how Python names work, because it causes the most confusing bugs: \`b = a\` does **not** copy anything, \`copy()\` copies only the outer layer, and \`deepcopy()\` copies everything. Along with that come two favourite questions: **\`is\` vs \`==\`**, and why \`def f(items=[])\` remembers old values between calls.`,
    analogy: `A Python variable is a name tag, not a box. \`b = a\` sticks a second tag on the same suitcase. A shallow copy is a new suitcase with the *same* smaller bags moved into it; a deep copy also duplicates every bag inside.

    \`==\` asks "do these two suitcases contain the same things?"; \`is\` asks "is this the very same suitcase?".`,
    how: {
      steps: [
        "Counting things? `Counter(items)`, then `.most_common(k)`.",
        "Grouping into lists or counting without `get(k, 0)`? `defaultdict(list)` / `defaultdict(int)`.",
        "Queue, or adding / removing at the front? `deque` — `append`, `appendleft`, `pop`, `popleft` are all O(1).",
        "Need to copy a list of lists (a grid) before changing it? `copy.deepcopy(grid)` or `[row[:] for row in grid]`.",
        "Comparing values? `==`. Checking for `None`? `is None`. Default argument that is a list or dict? Use `None` and create it inside the function.",
      ],
    },
    concepts: [
      { term: "Counter", meaning: "A dict of counts: `Counter(\"banana\")` → `{'a': 3, 'n': 2, 'b': 1}`. Missing keys count as 0." },
      { term: "defaultdict", meaning: "`defaultdict(list)` creates an empty list the first time you use a key, so `d[k].append(x)` just works." },
      { term: "deque", meaning: "Double-ended queue: O(1) at both ends (a list's `pop(0)` is O(n)). `deque(maxlen=3)` keeps only the last 3." },
      { term: "OrderedDict", meaning: "A dict with `move_to_end(key)` and `popitem(last=False)` — the classic LRU cache tools." },
      { term: "namedtuple", meaning: "`Point = namedtuple(\"Point\", \"x y\")` → `p.x`, `p.y`, still an immutable tuple." },
      { term: "Shallow vs deep copy", meaning: "Shallow: a new outer container sharing the inner objects. Deep: everything copied, nothing shared." },
      { term: "is vs ==", meaning: "`==` compares values; `is` checks that both names point to the same object." },
      { term: "Mutable default argument", meaning: "A default like `[]` is created once, when the function is defined, and shared by every call." },
    ],
    syntax: [
      { task: "Count and get the top k", python: "from collections import Counter\nc = Counter(words)\nc.most_common(2)" },
      { task: "Group into lists", python: "from collections import defaultdict\ng = defaultdict(list)\ng[key].append(item)" },
      { task: "Queue at both ends", python: "from collections import deque\nq = deque([1, 2])\nq.appendleft(0); q.popleft()" },
      { task: "Keep only the last n", python: "recent = deque(maxlen=3)" },
      { task: "LRU moves", python: "od.move_to_end(key)\nod.popitem(last=False)   # oldest" },
      { task: "Named fields", python: "from collections import namedtuple\nPoint = namedtuple(\"Point\", \"x y\")" },
      { task: "Shallow copy", python: "b = a.copy()   b = a[:]   b = list(a)" },
      { task: "Deep copy", python: "import copy\nb = copy.deepcopy(a)" },
      { task: "Check for None", python: "if x is None:" },
      { task: "Safe default argument", python: "def add(x, items=None):\n    if items is None:\n        items = []" },
    ],
    compare: {
      head: ["", "`b = a`", "`b = a.copy()` (shallow)", "`b = copy.deepcopy(a)`"],
      rows: [
        ["New outer list?", "No — same object", "Yes", "Yes"],
        ["Inner lists shared?", "Everything shared", "Yes, shared", "No, all copied"],
        ["`b.append(x)` changes `a`?", "Yes", "No", "No"],
        ["`b[0].append(x)` changes `a`?", "Yes", "Yes", "No"],
        ["Use it for", "A second name for the same thing", "Flat lists of numbers / strings", "Grids and nested data"],
      ],
    },
    code: [
      {
        title: "The collections toolbox",
        python: `
          from collections import Counter, defaultdict, deque, OrderedDict, namedtuple

          votes = ["red", "blue", "red", "green", "red", "blue"]
          c = Counter(votes)
          print("Counter:", c.most_common(2), "| yellow:", c["yellow"])

          words = ["apple", "avocado", "banana", "blueberry", "cherry"]
          by_letter = defaultdict(list)
          for w in words:
              by_letter[w[0]].append(w)          # no "if key not in dict" needed
          print("defaultdict:", dict(by_letter))

          q = deque([2, 3])
          q.appendleft(1); q.append(4)
          print("deque:", list(q), "| popleft:", q.popleft(), "| pop:", q.pop())
          recent = deque(maxlen=3)
          for page in ["home", "cart", "pay", "done"]:
              recent.append(page)                 # oldest drops off automatically
          print("last 3 pages:", list(recent))

          od = OrderedDict(a=1, b=2, c=3)
          od.move_to_end("a")                     # "a" becomes the newest
          print("OrderedDict:", list(od), "| oldest out:", od.popitem(last=False))

          Point = namedtuple("Point", "x y")
          p = Point(3, 4)
          print("namedtuple:", p, "| p.x + p.y =", p.x + p.y)`,
        output: `
          Counter: [('red', 3), ('blue', 2)] | yellow: 0
          defaultdict: {'a': ['apple', 'avocado'], 'b': ['banana', 'blueberry'], 'c': ['cherry']}
          deque: [1, 2, 3, 4] | popleft: 1 | pop: 4
          last 3 pages: ['cart', 'pay', 'done']
          OrderedDict: ['b', 'c', 'a'] | oldest out: ('b', 2)
          namedtuple: Point(x=3, y=4) | p.x + p.y = 7`,
      },
      {
        title: "Assignment vs shallow copy vs deep copy",
        note: "Three \"copies\" of the same grid, then one change through each. Only the deep copy is fully independent.",
        python: `
          import copy

          grid = [[1, 2], [3, 4]]
          same = grid                     # just another name
          shallow = grid.copy()           # new outer list, same inner rows
          deep = copy.deepcopy(grid)      # everything copied

          same.append([5, 6])
          print("after same.append:   grid =", grid)

          shallow[0][0] = 99              # inner row is shared with grid
          print("after shallow[0][0]: grid =", grid)

          deep[1][1] = -1                 # nothing shared
          print("after deep[1][1]:    grid =", grid)
          print("deep =", deep)

          print("same is grid:", same is grid, "| shallow is grid:", shallow is grid,
                "| shallow[0] is grid[0]:", shallow[0] is grid[0])`,
        output: `
          after same.append:   grid = [[1, 2], [3, 4], [5, 6]]
          after shallow[0][0]: grid = [[99, 2], [3, 4], [5, 6]]
          after deep[1][1]:    grid = [[99, 2], [3, 4], [5, 6]]
          deep = [[1, 2], [3, -1]]
          same is grid: True | shallow is grid: False | shallow[0] is grid[0]: True`,
      },
      {
        title: "is vs ==, and the mutable default argument",
        note: "`add_bad` creates its default list once, when Python reads the `def`, and then reuses it on every call. `add_good` creates a fresh list each time.",
        python: `
          a = [1, 2, 3]
          b = [1, 2, 3]
          print("a == b:", a == b)      # same values
          print("a is b:", a is b)      # different objects

          result = None
          print("result is None:", result is None)   # the right way to check None

          def add_bad(item, items=[]):
              items.append(item)
              return items

          def add_good(item, items=None):
              if items is None:
                  items = []            # a new list on every call
              items.append(item)
              return items

          print("bad: ", add_bad(1), add_bad(2))
          print("good:", add_good(1), add_good(2))`,
        output: `
          a == b: True
          a is b: False
          result is None: True
          bad:  [1, 2] [1, 2]
          good: [1] [2]`,
      },
    ],
    mistakes: [
      "Thinking `b = a` copies a list. It only adds a second name.",
      "Copying a grid with `grid.copy()` or `grid[:]` and then changing a cell — the original changes too. Use `deepcopy` or `[row[:] for row in grid]`.",
      "Using `is` to compare numbers or strings. It may work for small values (Python reuses some objects) and then fail on others. Use `==`.",
      "`def f(x, seen=[])` or `seen={}` — the default is shared by every call. Default to `None`.",
      "Using `list.pop(0)` as a queue — O(n) each time. Use `deque.popleft()`.",
      "Checking a defaultdict with `d[k]` — just reading a missing key creates it. Use `k in d` to check.",
    ],
    remember: "Counter counts, defaultdict groups, deque queues; `=` never copies, deepcopy copies all; `==` for values, `is` only for None.",
    exercises: [
      {
        q: "Print the two most common words in `\"to be or not to be that is the question to ask\"` with their counts.",
        example: `
          Output: to 3
                  be 2`,
        python: `
          from collections import Counter

          text = "to be or not to be that is the question to ask"
          for word, n in Counter(text.split()).most_common(2):
              print(word, n)`,
        output: `
          to 3
          be 2`,
      },
      {
        q: "Build an LRU cache of size 2 with `OrderedDict`: put a=1, put b=2, get a, put c=3, then get b and get a. A missing key gives -1.",
        example: `
          Output: get a -> 1
                  get b -> -1
                  get a -> 1`,
        hint: "On `get`, `move_to_end(key)`. On `put`, if the size goes over 2, `popitem(last=False)` removes the least recently used.",
        python: `
          from collections import OrderedDict

          cache = OrderedDict()
          CAP = 2

          def get(key):
              if key not in cache:
                  return -1
              cache.move_to_end(key)         # mark as recently used
              return cache[key]

          def put(key, value):
              cache[key] = value
              cache.move_to_end(key)
              if len(cache) > CAP:
                  cache.popitem(last=False)  # drop the least recently used

          put("a", 1)
          put("b", 2)
          print("get a ->", get("a"))
          put("c", 3)                        # evicts b
          print("get b ->", get("b"))
          print("get a ->", get("a"))`,
        output: `
          get a -> 1
          get b -> -1
          get a -> 1`,
      },
      {
        q: "`mark_visited(grid)` should return a copy of the grid with the top-left cell set to 1, **without** changing the caller's grid. The version below is buggy — fix it and print both grids.",
        example: `
          Output: original [[0, 0], [0, 0]]
                  marked   [[1, 0], [0, 0]]`,
        hint: "`grid.copy()` copies only the outer list; the rows are still shared. Copy every row too.",
        python: `
          def mark_visited(grid):
              new = [row[:] for row in grid]   # was: new = grid.copy()  (rows shared)
              new[0][0] = 1
              return new

          grid = [[0, 0], [0, 0]]
          marked = mark_visited(grid)
          print("original", grid)
          print("marked  ", marked)`,
        output: `
          original [[0, 0], [0, 0]]
          marked   [[1, 0], [0, 0]]`,
      },
    ],
    other: {
      note: `In Java, \`b = a\` also shares the same object (references work the same way), but there are no default arguments, so the mutable-default trap doesn't exist. Java's \`==\` on objects is Python's \`is\`, and Java's \`.equals()\` is Python's \`==\`.`,
      rows: [
        ["`Counter`", "`HashMap` with `merge(k, 1, Integer::sum)`"],
        ["`defaultdict(list)`", "`map.computeIfAbsent(k, x -> new ArrayList<>()).add(v)`"],
        ["`deque`", "`ArrayDeque`"],
        ["`OrderedDict` LRU", "`LinkedHashMap` with access order + `removeEldestEntry`"],
        ["`namedtuple`", "`record`"],
        ["`a.copy()`", "`new ArrayList<>(a)` (also shallow)"],
        ["`copy.deepcopy(grid)`", "Copy each row: `grid[i].clone()`"],
        ["`is` / `==`", "`==` / `.equals()`"],
      ],
    },
  },
};
