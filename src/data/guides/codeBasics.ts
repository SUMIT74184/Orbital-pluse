import type { TopicGuide } from "./index";

// Programming track, part 1: syntax, built-in data structures and turning logic into code.
// Keyed by topic title (see src/data/topics.ts). Every `java` / `python` program is complete and runnable,
// and `output` is exactly what it prints, so students can copy, run and compare.
export const CODE_BASICS_GUIDES: Record<string, TopicGuide> = {
  "Your first program: structure, print & comments": {
    simple: `A program is a list of instructions the computer runs from top to bottom. Your first job is just to make it print something.

    Java is strict about structure: every line of code lives inside a class, and the program starts in a method called main. Python is relaxed: you write the instructions at the top level of the file and it runs them in order.

    Once you can print text and values in the exact format a question asks for, you can see what your code is doing — which is the most useful debugging tool you will ever have.`,
    analogy: `Think of Java as a formal letter: it needs a header, an address block and a signature (class, main, braces) before the actual message. Python is a sticky note: you just write the message.

    Both deliver the same message — Java just asks for more envelope.`,
    how: {
      steps: [
        "Java: create a file named `Main.java` with `public class Main` inside it — the file name must match the class name.",
        "Java: put your code inside `public static void main(String[] args) { ... }`. That is where running starts.",
        "Python: create `main.py` and write your code directly. Indentation (4 spaces) is part of the syntax, not decoration.",
        "Print with `System.out.println(...)` in Java or `print(...)` in Python. Both move to a new line afterwards.",
        "Run it: `javac Main.java` then `java Main` (or just `java Main.java` on Java 11+); for Python, `python3 main.py`.",
      ],
    },
    concepts: [
      { term: "class", meaning: "In Java, a container for code. Every program needs at least one; for practice, call it `Main`." },
      { term: "main method", meaning: "`public static void main(String[] args)` — the entry point Java looks for when you run the program." },
      { term: "Statement", meaning: "One instruction. Java ends each with `;`. Python ends it with a new line." },
      { term: "Block", meaning: "A group of statements. Java wraps blocks in `{ }`; Python uses a `:` and indentation." },
      { term: "Comment", meaning: "Notes for humans, ignored by the computer: `//` in Java, `#` in Python." },
      { term: "Compile vs interpret", meaning: "Java is compiled to bytecode first (`javac`) and then run; Python reads and runs the file directly." },
    ],
    syntax: [
      { task: "Print and go to a new line", java: 'System.out.println("Hi");', python: 'print("Hi")' },
      { task: "Print without a new line", java: 'System.out.print("Hi");', python: 'print("Hi", end="")' },
      { task: "Print several values", java: 'System.out.println(a + " " + b);', python: "print(a, b)" },
      { task: "Formatted print", java: 'System.out.printf("%d + %d = %d%n", a, b, a + b);', python: 'print(f"{a} + {b} = {a + b}")' },
      { task: "Print a blank line", java: "System.out.println();", python: "print()" },
      { task: "Single-line comment", java: "// note", python: "# note" },
      { task: "Multi-line comment", java: "/* line 1\n   line 2 */", python: '"""line 1\nline 2"""' },
      { task: "End of a statement", java: "x = 5;", python: "x = 5" },
    ],
    code: [
      {
        title: "Hello, world — and printing values",
        note: "Same output, two languages. Notice what Java needs around the code and what Python doesn't.",
        java: `
          // The file must be called Main.java because the class is called Main.
          public class Main {
              // Running starts here.
              public static void main(String[] args) {
                  System.out.println("Hello, Orbit!");    // print, then new line
                  System.out.print("Score: ");            // print, stay on this line
                  System.out.println(42);

                  int a = 7, b = 5;
                  System.out.println("Sum = " + (a + b)); // + joins text and numbers
                  System.out.printf("%d + %d = %d%n", a, b, a + b);
              }
          }`,
        python: `
          # Python runs from top to bottom: no class or main needed.
          print("Hello, Orbit!")         # print adds a new line at the end
          print("Score: ", end="")       # end="" stays on the same line
          print(42)

          a, b = 7, 5
          print("Sum =", a + b)          # commas put a space between values
          print(f"{a} + {b} = {a + b}")  # f-string: put values inside {}`,
        output: `
          Hello, Orbit!
          Score: 42
          Sum = 12
          7 + 5 = 12`,
      },
      {
        title: "The interview-style layout",
        note: "In interviews you usually write a function and call it from main. Python programs often use the `if __name__ == \"__main__\":` guard so the file can also be imported without running.",
        java: `
          public class Main {
              static int add(int a, int b) {
                  return a + b;
              }

              public static void main(String[] args) {
                  System.out.println(add(2, 3));
              }
          }`,
        python: `
          def add(a, b):
              return a + b

          def main():
              print(add(2, 3))

          if __name__ == "__main__":
              main()`,
        output: "5",
      },
    ],
    mistakes: [
      "Naming the Java file differently from the public class (`Hello.java` containing `public class Main`) — it won't compile.",
      "Forgetting a `;` or a closing `}` in Java. Read the first compiler error first; later ones are often caused by it.",
      'Mixing tabs and spaces in Python, or indenting a line by accident — you get `IndentationError`.',
      'Writing `System.out.println("Sum = " + a + b)` — it prints `Sum = 75`, because the text is joined first. Use brackets: `(a + b)`.',
      "Printing extra spaces or labels the question didn't ask for — online judges compare output exactly.",
    ],
    remember: "Java: code lives in a class, starts at main, and ends lines with `;`. Python: code runs top to bottom and blocks are made by indentation.",
    exercises: [
      {
        q: "Store a rectangle's length (8) and width (3) in variables, then print its area and perimeter in exactly this format.",
        example: `
          Area = 24
          Perimeter = 22`,
        hint: "Area is length × width; perimeter is 2 × (length + width). Wrap sums in brackets when joining with text in Java.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int length = 8, width = 3;
                  System.out.println("Area = " + (length * width));
                  System.out.println("Perimeter = " + (2 * (length + width)));
              }
          }`,
        python: `
          length, width = 8, 3
          print("Area =", length * width)
          print("Perimeter =", 2 * (length + width))`,
        output: `
          Area = 24
          Perimeter = 22`,
      },
      {
        q: "Using two print statements, print `Hello` and `World` on the same line, then one empty line, then `Done`.",
        example: `
          Hello World

          Done`,
        java: `
          public class Main {
              public static void main(String[] args) {
                  System.out.print("Hello ");
                  System.out.println("World");
                  System.out.println();
                  System.out.println("Done");
              }
          }`,
        python: `
          print("Hello", end=" ")
          print("World")
          print()
          print("Done")`,
        output: `
          Hello World

          Done`,
      },
    ],
  },

  "Reading input & printing output": {
    simple: `Most coding platforms (HackerRank, GfG practice, company online tests) send the test data to your program as text on standard input. Your program has to read that text, turn it into numbers or strings, solve the problem and print the answer.

    In Java, Scanner is the easy way to read; BufferedReader is the fast way. In Python, input() reads one line as a string, and you convert it with int() or split it into parts with split().

    LeetCode is different: it calls your function directly, so you don't read input there — but OAs and GfG do.`,
    analogy: `Input is a parcel arriving at your door. Everything inside is wrapped as text. Before you can use it you have to unwrap it: split the line into pieces, then convert each piece to the type you need ("42" → 42).`,
    how: {
      steps: [
        "Look at the input format in the question: what's on each line, and in what order?",
        "Read the first line — often a count `n` or the number of test cases `t`.",
        "Read the next line(s) and split them into parts (`split()` / `nextInt()` in a loop).",
        "Convert each part to the right type: `int`, `long`, `double` or keep it as a string.",
        "Solve, then print in exactly the format asked. For many lines of output, collect them and print once.",
      ],
    },
    concepts: [
      { term: "Standard input (stdin)", meaning: "The text stream your program reads from — the keyboard, or the judge's test file." },
      { term: "Scanner", meaning: "Java class that reads words and numbers one at a time: `nextInt()`, `next()`, `nextLine()`." },
      { term: "BufferedReader", meaning: "Java class that reads whole lines fast; you split and parse them yourself. Use it for big inputs." },
      { term: "input()", meaning: "Python function that reads one line as a string, without the newline." },
      { term: "split()", meaning: "Breaks a string into a list of words on whitespace: `\"3 1 4\".split()` → `['3', '1', '4']`." },
      { term: "map(int, ...)", meaning: "Python: converts every item of a list of strings to int in one go." },
    ],
    syntax: [
      { task: "Set up the reader", java: "Scanner sc = new Scanner(System.in);", python: "# nothing needed" },
      { task: "Read one integer", java: "int n = sc.nextInt();", python: "n = int(input())" },
      { task: "Read one word", java: "String w = sc.next();", python: "w = input().strip()" },
      { task: "Read a whole line", java: "String line = sc.nextLine();", python: "line = input()" },
      { task: "Read n numbers on one line", java: "for (int i = 0; i < n; i++)\n    a[i] = sc.nextInt();", python: "a = list(map(int, input().split()))" },
      { task: "Read two numbers on one line", java: "int x = sc.nextInt(), y = sc.nextInt();", python: "x, y = map(int, input().split())" },
      { task: "Text to number", java: 'Integer.parseInt("42")\nLong.parseLong("42")', python: 'int("42")\nfloat("4.2")' },
      { task: "Print a list space-separated", java: "for (int x : a) System.out.print(x + \" \");", python: "print(*a)" },
    ],
    code: [
      {
        title: "Read a name, a count and a list of numbers",
        note: "Typical OA input: a word, then `n`, then `n` numbers on one line.",
        input: `
          Asha
          5
          3 1 4 1 5`,
        java: `
          import java.util.Scanner;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  String name = sc.next();          // one word
                  int n = sc.nextInt();             // how many numbers follow
                  int[] nums = new int[n];
                  for (int i = 0; i < n; i++) {
                      nums[i] = sc.nextInt();       // nextInt skips spaces and new lines
                  }
                  int sum = 0;
                  for (int x : nums) sum += x;
                  System.out.println("Hi " + name + ", sum = " + sum);
              }
          }`,
        python: `
          name = input()                           # whole line, as a string
          n = int(input())                         # convert text to int
          nums = list(map(int, input().split()))   # "3 1 4 1 5" -> [3, 1, 4, 1, 5]
          print(f"Hi {name}, sum = {sum(nums)}")`,
        output: "Hi Asha, sum = 14",
      },
      {
        title: "Many test cases, read fast",
        note: "When the input can be 10⁵ lines or more, Scanner and repeated input() get slow. Read everything quickly and print once at the end.",
        input: `
          3
          2 3
          10 -4
          7 7`,
        java: `
          import java.io.*;
          import java.util.*;

          public class Main {
              public static void main(String[] args) throws IOException {
                  BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                  int t = Integer.parseInt(br.readLine().trim());
                  StringBuilder out = new StringBuilder();     // collect all output, print once
                  while (t-- > 0) {
                      StringTokenizer st = new StringTokenizer(br.readLine());
                      long a = Long.parseLong(st.nextToken());
                      long b = Long.parseLong(st.nextToken());
                      out.append(a + b).append('\\n');
                  }
                  System.out.print(out);
              }
          }`,
        python: `
          import sys

          def main():
              data = sys.stdin.read().split()   # every word of the whole input, at once
              t = int(data[0])
              idx = 1
              out = []
              for _ in range(t):
                  a, b = int(data[idx]), int(data[idx + 1])
                  idx += 2
                  out.append(str(a + b))
              print("\\n".join(out))

          main()`,
        output: `
          5
          6
          14`,
      },
    ],
    mistakes: [
      "Java: calling `nextLine()` right after `nextInt()` returns an empty string — the rest of the number's line. Call `sc.nextLine()` once to skip it.",
      "Python: forgetting to convert — `input()` always returns a string, so `\"2\" + \"3\"` is `\"23\"`.",
      "Python: `input().split()` gives strings; wrap in `map(int, ...)` and `list(...)` before indexing or sorting.",
      "Printing with `System.out.println` inside a loop of 10⁵ items — use a `StringBuilder` and print once.",
      "Printing prompts like `Enter n:` on a judge — the extra text makes the answer wrong.",
    ],
    remember: "Read the format line by line, split, convert to the right type — and print exactly what's asked, nothing more.",
    exercises: [
      {
        q: "Read two integers on one line. Print their product on the first line and the larger one on the second.",
        example: `
          Input:  6 9
          Output: 54
                  9`,
        input: "6 9",
        java: `
          import java.util.Scanner;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  int a = sc.nextInt(), b = sc.nextInt();
                  System.out.println(a * b);
                  System.out.println(Math.max(a, b));
              }
          }`,
        python: `
          a, b = map(int, input().split())
          print(a * b)
          print(max(a, b))`,
        output: `
          54
          9`,
      },
      {
        q: "Read `n`, then `n` integers on the next line. Print the largest and the smallest in the format shown.",
        example: `
          Input:  5
                  4 -2 9 0 7
          Output: Max = 9, Min = -2`,
        hint: "Start max and min at the first number, not at 0 — the numbers can be negative.",
        input: `
          5
          4 -2 9 0 7`,
        java: `
          import java.util.Scanner;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  int n = sc.nextInt();
                  int max = Integer.MIN_VALUE, min = Integer.MAX_VALUE;
                  for (int i = 0; i < n; i++) {
                      int x = sc.nextInt();
                      max = Math.max(max, x);
                      min = Math.min(min, x);
                  }
                  System.out.println("Max = " + max + ", Min = " + min);
              }
          }`,
        python: `
          n = int(input())
          nums = list(map(int, input().split()))
          print(f"Max = {max(nums)}, Min = {min(nums)}")`,
        output: "Max = 9, Min = -2",
      },
    ],
  },

  "Variables, data types & operators": {
    simple: `A variable is a named box that holds a value. In Java you must say what type of value the box holds (int, long, double, String…) and that never changes. In Python the box can hold anything; the value carries its own type.

    The type matters more than it looks. A Java int can only hold up to about 2.1 billion — go past that and it silently wraps around to a negative number. Dividing two ints throws away the decimal part. These two facts cause a large share of wrong answers in coding rounds.`,
    analogy: `Java variables are labelled jars: a jar marked "int" only takes whole numbers, and only up to a certain size — overfill it and it spills over to the start. Python variables are sticky labels: you can stick the label "x" on a number today and on a string tomorrow, and Python's number jars stretch as big as you need.`,
    how: {
      steps: [
        "Pick the type from the constraints: values up to ~2×10⁹ fit in `int`; sums or products of big values need `long`.",
        "Declare and set the variable: `int count = 0;` in Java, `count = 0` in Python.",
        "For division, decide if you want a whole number (`/` on ints in Java, `//` in Python) or a decimal (`/` with a double, `/` in Python).",
        "When mixing types, cast on purpose: `(long) a * b` in Java so the multiplication happens in `long`.",
        "If the answer must be \"modulo 10⁹ + 7\", take `% MOD` after every addition or multiplication.",
      ],
    },
    concepts: [
      { term: "int / long", meaning: "Java whole numbers: `int` up to 2,147,483,647, `long` up to ~9.2×10¹⁸. Write long literals with `L`." },
      { term: "double", meaning: "Decimal numbers in both languages (`float` in Python). Not exact: `0.1 + 0.2` isn't `0.3`." },
      { term: "char vs String", meaning: "Java has a 1-character type `char` in single quotes. Python only has strings: `'a'` and `\"a\"` are the same." },
      { term: "boolean", meaning: "`true` / `false` in Java, `True` / `False` in Python." },
      { term: "Overflow", meaning: "A Java `int` that goes past its maximum wraps around to negative — no error, just a wrong answer." },
      { term: "Casting", meaning: "Converting a value's type: `(int) 3.9` → 3, `(long) x`; `int(\"5\")`, `str(5)` in Python." },
    ],
    syntax: [
      { task: "Whole number", java: "int n = 10;", python: "n = 10" },
      { task: "Big whole number", java: "long big = 3_000_000_000L;", python: "big = 3_000_000_000" },
      { task: "Decimal", java: "double p = 9.5;", python: "p = 9.5" },
      { task: "Constant", java: "final int MOD = 1_000_000_007;", python: "MOD = 10**9 + 7  # by convention" },
      { task: "Whole-number division", java: "7 / 2      // 3", python: "7 // 2     # 3" },
      { task: "Decimal division", java: "7 / 2.0    // 3.5", python: "7 / 2      # 3.5" },
      { task: "Power", java: "Math.pow(2, 10)  // 1024.0, a double", python: "2 ** 10          # 1024" },
      { task: "And / or / not", java: "a && b, a || b, !a", python: "a and b, a or b, not a" },
      { task: "Increment", java: "i++;  i += 2;", python: "i += 1  # no ++ in Python" },
      { task: "If-else in one line", java: "int m = a > b ? a : b;", python: "m = a if a > b else b" },
      { task: "Largest / smallest int", java: "Integer.MAX_VALUE\nInteger.MIN_VALUE", python: "float('inf')\nfloat('-inf')" },
    ],
    code: [
      {
        title: "Types and integer overflow",
        note: "Java's `int` silently wraps around. Python's ints never overflow, so the same idea prints something different.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int age = 21;                  // whole number, up to about 2.1 billion
                  long big = 3_000_000_000L;     // bigger whole numbers need long and an L
                  double price = 99.5;           // decimal
                  char grade = 'A';              // one character, single quotes
                  boolean passed = true;
                  String name = "Ravi";          // text, double quotes

                  int max = Integer.MAX_VALUE;   // 2147483647
                  System.out.println(max + 1);           // overflow: wraps to -2147483648
                  System.out.println((long) max + 1);    // cast first: 2147483648
                  System.out.println(name + " " + age + " " + grade + " " + passed + " " + price + " " + big);
              }
          }`,
        python: `
          age = 21              # int: no size limit
          big = 3_000_000_000
          price = 99.5          # float
          grade = "A"           # no char type: a one-letter string
          passed = True         # capital T
          name = "Ravi"

          max_int = 2147483647
          print(max_int + 1)    # 2147483648: Python ints never overflow
          print(name, age, grade, passed, price, big)`,
        output: {
          java: `
            -2147483648
            2147483648
            Ravi 21 A true 99.5 3000000000`,
          python: `
            2147483648
            Ravi 21 A True 99.5 3000000000`,
        },
      },
      {
        title: "Division, modulo and rounding",
        note: "The two languages agree on positive numbers and disagree on negatives — a classic interview trap.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  System.out.println(7 / 2);                 // 3   int / int drops the decimal
                  System.out.println(7 / 2.0);               // 3.5 one double -> decimal division
                  System.out.println(-7 / 2);                // -3  rounds toward zero
                  System.out.println(-7 % 3);                // -1  sign follows the left number
                  System.out.println(Math.floorMod(-7, 3));  // 2   always non-negative
                  System.out.println((int) 3.99);            // 3   casting cuts, doesn't round
                  System.out.println(Math.round(3.5));       // 4
              }
          }`,
        python: `
          print(7 // 2)      # 3   // is whole-number division
          print(7 / 2)       # 3.5 / always gives a float
          print(-7 // 2)     # -4  rounds DOWN, toward minus infinity
          print(-7 % 3)      # 2   sign follows the right number
          print(int(3.99))   # 3   int() cuts, doesn't round
          print(round(3.5))  # 4   (but round(2.5) is 2: it rounds to even)`,
        output: {
          java: `
            3
            3.5
            -3
            -1
            2
            3
            4`,
          python: `
            3
            3.5
            -4
            2
            3
            4`,
        },
      },
    ],
    mistakes: [
      "Multiplying two ints whose result is past 2×10⁹ (`a * b` with `a, b` up to 10⁵) — cast first: `(long) a * b`.",
      "`double avg = sum / n;` with int `sum` and `n` — the division already threw away the decimal. Use `(double) sum / n`.",
      "Using `Math.pow` for integer powers in Java — it returns a double and loses precision past 2⁵³. Multiply in a loop instead.",
      "Writing `i++` in Python — it doesn't exist. Use `i += 1`.",
      "Comparing decimals with `==` — use a small tolerance, e.g. `Math.abs(a - b) < 1e-9`.",
    ],
    remember: "Check the constraints before choosing int or long, and know whether your division should keep the decimal.",
    exercises: [
      {
        q: "Given `3725` seconds, print it as hours, minutes and seconds in the format shown.",
        example: "Output: 1h 2m 5s",
        hint: "An hour is 3600 seconds. Use whole-number division for the count and `%` for what's left over.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int total = 3725;
                  int h = total / 3600;
                  int m = (total % 3600) / 60;
                  int s = total % 60;
                  System.out.println(h + "h " + m + "m " + s + "s");
              }
          }`,
        python: `
          total = 3725
          h = total // 3600
          m = (total % 3600) // 60
          s = total % 60
          print(f"{h}h {m}m {s}s")`,
        output: "1h 2m 5s",
      },
      {
        q: "The marks are 87, 92 and 78. Print their average rounded to two decimal places.",
        example: "Output: Average = 85.67",
        hint: "Make the division a decimal one, then format: `%.2f` in Java, `:.2f` in a Python f-string.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int a = 87, b = 92, c = 78;
                  double avg = (a + b + c) / 3.0;          // 3.0 keeps the decimal
                  System.out.printf("Average = %.2f%n", avg);
              }
          }`,
        python: `
          a, b, c = 87, 92, 78
          avg = (a + b + c) / 3
          print(f"Average = {avg:.2f}")`,
        output: "Average = 85.67",
      },
      {
        q: "Swap the values of `a = 5` and `b = 9`, then print them.",
        example: "Output: a = 9, b = 5",
        hint: "Java needs a temporary variable; Python can swap in one line with tuple assignment.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int a = 5, b = 9;
                  int temp = a;
                  a = b;
                  b = temp;
                  System.out.println("a = " + a + ", b = " + b);
              }
          }`,
        python: `
          a, b = 5, 9
          a, b = b, a
          print(f"a = {a}, b = {b}")`,
        output: "a = 9, b = 5",
      },
    ],
  },

  "Conditions & loops": {
    simple: `Conditions let your program choose: if this is true, do that, otherwise do something else. Loops let it repeat: do this for every item, or keep going while something is true.

    Almost every interview solution is a loop with a condition inside it. If you can write these two confidently — and know exactly where a loop starts and stops — most logic becomes much easier to type out.`,
    analogy: `A traffic signal is a condition: if green, go; else if yellow, slow down; else stop. Climbing stairs is a loop: take one step, check if you've reached the top, repeat. "Skip the broken step" is continue; "stop climbing, the fire alarm went off" is break.`,
    how: {
      steps: [
        "Decide the loop type: you know how many times → `for`; you repeat until something happens → `while`.",
        "Write the start, the stop condition and the step: `for (int i = 0; i < n; i++)` / `for i in range(n)`.",
        "Check the boundaries by hand: does `i` take the first value? The last? Does it stop one too early or late?",
        "Put the condition inside: `if` for the special case, `else if` / `elif` for the next, `else` for everything left.",
        "Use `continue` to skip the rest of this round and `break` to leave the loop completely.",
      ],
    },
    concepts: [
      { term: "if / else if / else", meaning: "Checks conditions top to bottom and runs only the first block that's true. Python spells it `elif`." },
      { term: "for loop", meaning: "Java: `for (start; condition; step)`. Python: `for x in something` — usually `range(...)` or a list." },
      { term: "range(start, stop, step)", meaning: "Python numbers from start up to but NOT including stop. `range(5)` is 0, 1, 2, 3, 4." },
      { term: "for-each", meaning: "Visit every element without an index: `for (int x : arr)` / `for x in arr`." },
      { term: "while", meaning: "Repeats while the condition is true. Something inside must change, or it never ends." },
      { term: "break / continue", meaning: "`break` exits the loop now; `continue` jumps to the next round." },
    ],
    syntax: [
      { task: "if / else if / else", java: "if (x > 0) { ... }\nelse if (x == 0) { ... }\nelse { ... }", python: "if x > 0:\n    ...\nelif x == 0:\n    ...\nelse:\n    ..." },
      { task: "Count 0 to n-1", java: "for (int i = 0; i < n; i++)", python: "for i in range(n):" },
      { task: "Count 1 to n", java: "for (int i = 1; i <= n; i++)", python: "for i in range(1, n + 1):" },
      { task: "Count down", java: "for (int i = n - 1; i >= 0; i--)", python: "for i in range(n - 1, -1, -1):" },
      { task: "Every element", java: "for (int x : arr)", python: "for x in arr:" },
      { task: "While loop", java: "while (n > 0) { ... }", python: "while n > 0:\n    ..." },
      { task: "Equal / not equal", java: "a == b, a != b", python: "a == b, a != b" },
      { task: "Range check", java: "if (x >= 1 && x <= 10)", python: "if 1 <= x <= 10:" },
    ],
    code: [
      {
        title: "Grades with if / else if / else",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int[] marks = {95, 72, 58, 31};
                  for (int m : marks) {
                      String grade;
                      if (m >= 90) grade = "A";
                      else if (m >= 70) grade = "B";      // only checked if m < 90
                      else if (m >= 50) grade = "C";
                      else grade = "Fail";
                      System.out.println(m + " -> " + grade);
                  }
              }
          }`,
        python: `
          marks = [95, 72, 58, 31]
          for m in marks:
              if m >= 90:
                  grade = "A"
              elif m >= 70:          # Python writes "else if" as elif
                  grade = "B"
              elif m >= 50:
                  grade = "C"
              else:
                  grade = "Fail"
              print(m, "->", grade)`,
        output: `
          95 -> A
          72 -> B
          58 -> C
          31 -> Fail`,
      },
      {
        title: "Every kind of loop",
        java: `
          public class Main {
              public static void main(String[] args) {
                  // 1. Count from 1 to 5
                  for (int i = 1; i <= 5; i++) System.out.print(i + " ");
                  System.out.println();

                  // 2. Count down by 2
                  for (int i = 10; i > 0; i -= 2) System.out.print(i + " ");
                  System.out.println();

                  // 3. while: add up the digits of a number
                  int n = 9045, digitSum = 0;
                  while (n > 0) {
                      digitSum += n % 10;    // last digit
                      n /= 10;               // drop the last digit
                  }
                  System.out.println("digit sum = " + digitSum);

                  // 4. continue skips, break stops
                  for (int i = 1; i <= 10; i++) {
                      if (i % 2 == 0) continue;   // skip even numbers
                      if (i > 7) break;           // leave the loop
                      System.out.print(i + " ");
                  }
                  System.out.println();
              }
          }`,
        python: `
          # 1. Count from 1 to 5: range stops BEFORE its end
          for i in range(1, 6):
              print(i, end=" ")
          print()

          # 2. Count down by 2: range(start, stop, step)
          for i in range(10, 0, -2):
              print(i, end=" ")
          print()

          # 3. while: add up the digits of a number
          n, digit_sum = 9045, 0
          while n > 0:
              digit_sum += n % 10
              n //= 10
          print("digit sum =", digit_sum)

          # 4. continue skips, break stops
          for i in range(1, 11):
              if i % 2 == 0:
                  continue
              if i > 7:
                  break
              print(i, end=" ")
          print()`,
        output: `
          1 2 3 4 5
          10 8 6 4 2
          digit sum = 18
          1 3 5 7`,
      },
      {
        title: "Nested loops: a star triangle",
        note: "The outer loop picks the row; the inner loop prints that row. Row `i` has `i` stars.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int n = 4;
                  for (int i = 1; i <= n; i++) {          // rows
                      for (int j = 1; j <= i; j++) {      // stars in row i
                          System.out.print("* ");
                      }
                      System.out.println();
                  }
              }
          }`,
        python: `
          n = 4
          for i in range(1, n + 1):       # rows
              for j in range(i):          # stars in row i
                  print("*", end=" ")
              print()`,
        output: `
          *
          * *
          * * *
          * * * *`,
      },
    ],
    mistakes: [
      "Off-by-one: `i <= n` on an array of length `n` reads past the end. Arrays go from `0` to `n - 1`.",
      "Python: `range(1, n)` stops at `n - 1`. Write `range(1, n + 1)` to include `n`.",
      "A `while` loop whose variable never changes — the program hangs (Time Limit Exceeded).",
      "Java: `if (x = 5)` instead of `if (x == 5)` — `=` assigns, `==` compares.",
      "Python: forgetting the `:` after `if`, `for`, `while`, or indenting the body inconsistently.",
    ],
    remember: "Before you run a loop, say out loud its first value, its last value and what changes each round.",
    exercises: [
      {
        q: "FizzBuzz: print the numbers 1 to 15, but print `Fizz` for multiples of 3, `Buzz` for multiples of 5 and `FizzBuzz` for multiples of both.",
        example: "Output: 1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz (one per line)",
        hint: "Check the \"both\" case first — otherwise 15 stops at the Fizz branch.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  for (int i = 1; i <= 15; i++) {
                      if (i % 15 == 0) System.out.println("FizzBuzz");
                      else if (i % 3 == 0) System.out.println("Fizz");
                      else if (i % 5 == 0) System.out.println("Buzz");
                      else System.out.println(i);
                  }
              }
          }`,
        python: `
          for i in range(1, 16):
              if i % 15 == 0:
                  print("FizzBuzz")
              elif i % 3 == 0:
                  print("Fizz")
              elif i % 5 == 0:
                  print("Buzz")
              else:
                  print(i)`,
        output: `
          1
          2
          Fizz
          4
          Buzz
          Fizz
          7
          8
          Fizz
          Buzz
          11
          Fizz
          13
          14
          FizzBuzz`,
      },
      {
        q: "Check whether 29 and 91 are prime, printing a line for each.",
        example: `
          Output: 29 is prime
                  91 is not prime`,
        hint: "Try divisors from 2 while `d * d <= n`. If any divides `n`, it isn't prime — break early.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  for (int n : new int[]{29, 91}) {
                      boolean prime = n > 1;
                      for (int d = 2; d * d <= n; d++) {
                          if (n % d == 0) {
                              prime = false;
                              break;
                          }
                      }
                      System.out.println(n + (prime ? " is prime" : " is not prime"));
                  }
              }
          }`,
        python: `
          for n in [29, 91]:
              prime = n > 1
              d = 2
              while d * d <= n:
                  if n % d == 0:
                      prime = False
                      break
                  d += 1
              print(n, "is prime" if prime else "is not prime")`,
        output: `
          29 is prime
          91 is not prime`,
      },
      {
        q: "Reverse the digits of `1230` and of `4567` using a loop (no strings).",
        example: `
          Output: 321
                  7654`,
        hint: "Repeat: take the last digit with `% 10`, append it with `rev = rev * 10 + digit`, drop it with whole-number division by 10.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  for (int n : new int[]{1230, 4567}) {
                      int rev = 0;
                      while (n > 0) {
                          rev = rev * 10 + n % 10;
                          n /= 10;
                      }
                      System.out.println(rev);
                  }
              }
          }`,
        python: `
          for n in [1230, 4567]:
              rev = 0
              while n > 0:
                  rev = rev * 10 + n % 10
                  n //= 10
              print(rev)`,
        output: `
          321
          7654`,
      },
    ],
  },

  "Functions & methods": {
    simple: `A function (called a method in Java) is a named, reusable piece of code. You give it inputs (parameters), it does some work, and it can give back one result (the return value).

    In interviews you almost always write a function: LeetCode hands you its signature and you fill in the body. Splitting a solution into small functions — isValid(), countWays(), helper() — also makes your logic easier to explain and debug.`,
    analogy: `A function is a juice machine. You put in fruit (arguments), it does the same steps every time, and out comes juice (the return value). You don't rebuild the machine every time you want juice — you just press the button (call the function).`,
    how: {
      steps: [
        "Name the function after what it returns or does: `isPrime`, `maxProfit`, `reverse`.",
        "List the inputs and their types: `(int[] nums, int target)` / `(nums, target)`.",
        "Decide the return type: a value (`int`, `boolean`, `List<Integer>`) or nothing (`void` / no return).",
        "Write the body; every path must reach a `return` with the right type (Java checks this for you).",
        "Call it from main with test values and print the result.",
      ],
    },
    concepts: [
      { term: "Parameter vs argument", meaning: "Parameter is the name in the definition (`x`); argument is the value you pass in (`5`)." },
      { term: "Return value", meaning: "What the function gives back. `return` also ends the function immediately." },
      { term: "void / None", meaning: "A function that returns nothing: `void` in Java, implicitly `None` in Python." },
      { term: "static", meaning: "Java: the method belongs to the class, so `main` (also static) can call it without creating an object." },
      { term: "Scope", meaning: "Variables made inside a function exist only inside it." },
      { term: "Pass by value", meaning: "The function gets a copy of the variable. For arrays and lists that copy is a reference, so changes to the contents are visible outside." },
    ],
    syntax: [
      { task: "Define a function", java: "static int square(int x) {\n    return x * x;\n}", python: "def square(x):\n    return x * x" },
      { task: "Return nothing", java: "static void greet(String n) { ... }", python: "def greet(n):\n    ...  # returns None" },
      { task: "Call it", java: "int s = square(5);", python: "s = square(5)" },
      { task: "Return two values", java: "return new int[]{lo, hi};", python: "return lo, hi" },
      { task: "Receive two values", java: "int[] r = minMax(a);", python: "lo, hi = min_max(a)" },
      { task: "Default parameter", java: "// overload: f(x) calls f(x, 0)", python: "def f(x, start=0):" },
      { task: "Type hints (optional in Python)", java: "int add(int a, int b)", python: "def add(a: int, b: int) -> int:" },
    ],
    code: [
      {
        title: "Defining and calling functions",
        java: `
          public class Main {
              // static: main can call it directly
              static int square(int x) {
                  return x * x;
              }

              static boolean isEven(int x) {
                  return x % 2 == 0;
              }

              static void greet(String name) {    // void: returns nothing
                  System.out.println("Hello, " + name);
              }

              public static void main(String[] args) {
                  System.out.println(square(6));
                  greet("Meera");
                  for (int i = 1; i <= 4; i++) {
                      if (isEven(i)) System.out.println(i + " is even");
                  }
              }
          }`,
        python: `
          def square(x):
              return x * x

          def is_even(x):
              return x % 2 == 0

          def greet(name):        # no return: gives back None
              print("Hello,", name)

          print(square(6))
          greet("Meera")
          for i in range(1, 5):
              if is_even(i):
                  print(i, "is even")`,
        output: `
          36
          Hello, Meera
          2 is even
          4 is even`,
      },
      {
        title: "Passing numbers vs passing arrays",
        note: "Changing a number inside a function doesn't affect the caller. Changing the *contents* of an array or list does — both names point at the same one.",
        java: `
          import java.util.Arrays;

          public class Main {
              static void addOne(int x) {
                  x = x + 1;                  // changes only the local copy
              }

              static void addOneToAll(int[] arr) {
                  for (int i = 0; i < arr.length; i++) arr[i]++;   // same array as the caller's
              }

              static int[] minMax(int[] arr) {                     // two results in one array
                  int lo = arr[0], hi = arr[0];
                  for (int x : arr) {
                      lo = Math.min(lo, x);
                      hi = Math.max(hi, x);
                  }
                  return new int[]{lo, hi};
              }

              public static void main(String[] args) {
                  int n = 5;
                  addOne(n);
                  System.out.println(n);                       // still 5
                  int[] nums = {3, 8, 1};
                  addOneToAll(nums);
                  System.out.println(Arrays.toString(nums));   // changed
                  int[] mm = minMax(nums);
                  System.out.println(mm[0] + " " + mm[1]);
              }
          }`,
        python: `
          def add_one(x):
              x = x + 1               # rebinds the local name only

          def add_one_to_all(arr):    # arr is the same list as the caller's
              for i in range(len(arr)):
                  arr[i] += 1

          def min_max(arr):
              return min(arr), max(arr)   # a tuple of two values

          n = 5
          add_one(n)
          print(n)
          nums = [3, 8, 1]
          add_one_to_all(nums)
          print(nums)
          lo, hi = min_max(nums)
          print(lo, hi)`,
        output: `
          5
          [4, 9, 2]
          2 9`,
      },
    ],
    mistakes: [
      "Java: forgetting `static` on a helper called from `main` — \"non-static method cannot be referenced from a static context\".",
      "Missing a `return` on one path (e.g. after a loop) — Java won't compile, Python silently returns `None`.",
      "Printing the answer inside the function instead of returning it — LeetCode checks the return value.",
      "Expecting `x = x + 1` inside a function to change the caller's number.",
    ],
    remember: "Inputs in, one result out: name it well, return the value, and test it from main with a couple of examples.",
    exercises: [
      {
        q: "Write `factorial(n)` with a loop and print `factorial(5)` and `factorial(10)`.",
        example: `
          Output: 120
                  3628800`,
        hint: "Start `result` at 1, multiply by 2, 3, …, n. Use `long` in Java — factorials grow fast.",
        java: `
          public class Main {
              static long factorial(int n) {
                  long result = 1;
                  for (int i = 2; i <= n; i++) result *= i;
                  return result;
              }

              public static void main(String[] args) {
                  System.out.println(factorial(5));
                  System.out.println(factorial(10));
              }
          }`,
        python: `
          def factorial(n):
              result = 1
              for i in range(2, n + 1):
                  result *= i
              return result

          print(factorial(5))
          print(factorial(10))`,
        output: `
          120
          3628800`,
      },
      {
        q: "Write `gcd(a, b)` using Euclid's method and print `gcd(48, 18)` and `gcd(17, 5)`.",
        example: `
          Output: 6
                  1`,
        hint: "While `b` isn't 0: replace `(a, b)` with `(b, a % b)`. When `b` is 0, `a` is the answer.",
        java: `
          public class Main {
              static int gcd(int a, int b) {
                  while (b != 0) {
                      int r = a % b;
                      a = b;
                      b = r;
                  }
                  return a;
              }

              public static void main(String[] args) {
                  System.out.println(gcd(48, 18));
                  System.out.println(gcd(17, 5));
              }
          }`,
        python: `
          def gcd(a, b):
              while b != 0:
                  a, b = b, a % b
              return a

          print(gcd(48, 18))
          print(gcd(17, 5))`,
        output: `
          6
          1`,
      },
    ],
  },

  "Arrays & lists": {
    simple: `An array is a row of boxes numbered from 0. You reach any box instantly by its number (index). Java has two kinds: a fixed-size array (int[]) and a growable ArrayList. Python has one list that does both.

    Arrays are the input to most interview problems, so you need to be fluent: create one, read and update by index, loop with and without the index, and know the difference between copying a list and giving it a second name.`,
    analogy: `Lockers in a school corridor: numbered 0, 1, 2…, each holding one thing. You can open locker 7 directly without opening the first six. A Java int[] is a corridor with a fixed number of lockers; an ArrayList (or a Python list) is a corridor that builds a new locker whenever you need one.`,
    how: {
      steps: [
        "Create it: with values (`{5, 2, 9}` / `[5, 2, 9]`) or with a size (`new int[n]` / `[0] * n`).",
        "Read and write by index: `arr[i]`; valid indexes are `0` to `length - 1`.",
        "Loop with the index when you need neighbours or positions (`arr[i - 1]`, `arr[i + 1]`); use for-each when you only need values.",
        "For a grid, think rows then columns: `grid[r][c]`, with `r` in `0..rows-1` and `c` in `0..cols-1`.",
        "Need an independent copy? Copy explicitly (`clone()`, `Arrays.copyOf`, `a[:]`) — plain `=` only adds a second name.",
      ],
    },
    concepts: [
      { term: "Index", meaning: "A position, starting at 0. The last element is at `length - 1` (Python also allows `-1`)." },
      { term: "int[] vs ArrayList", meaning: "Java arrays have a fixed size and can hold primitives; `ArrayList<Integer>` grows but holds objects." },
      { term: "Python list", meaning: "One growable list type that can hold anything; `append` adds to the end in O(1)." },
      { term: "2D array", meaning: "An array of rows: `int[][] grid = new int[r][c]` / `[[0] * c for _ in range(r)]`." },
      { term: "Aliasing", meaning: "Two variables pointing at the same array. Changing one changes \"both\"." },
      { term: "Slicing", meaning: "Python `a[i:j]` makes a new list from index `i` to `j - 1`. It costs O(j - i)." },
    ],
    syntax: [
      { task: "Create with values", java: "int[] a = {5, 2, 9};", python: "a = [5, 2, 9]" },
      { task: "Create with size n", java: "int[] a = new int[n];  // all 0", python: "a = [0] * n" },
      { task: "Length", java: "a.length", python: "len(a)" },
      { task: "Last element", java: "a[a.length - 1]", python: "a[-1]" },
      { task: "Growable list", java: "List<Integer> l = new ArrayList<>();\nl.add(4); l.get(0); l.size();", python: "l = []\nl.append(4); l[0]; len(l)" },
      { task: "Remove last", java: "l.remove(l.size() - 1);", python: "l.pop()" },
      { task: "Index and value", java: "for (int i = 0; i < a.length; i++)", python: "for i, x in enumerate(a):" },
      { task: "Print it", java: "Arrays.toString(a)", python: "print(a)" },
      { task: "Copy", java: "int[] b = a.clone();", python: "b = a[:]" },
      { task: "Sum / max", java: "Arrays.stream(a).sum()\nArrays.stream(a).max().getAsInt()", python: "sum(a)\nmax(a)" },
      { task: "2D grid", java: "int[][] g = new int[r][c];", python: "g = [[0] * c for _ in range(r)]" },
    ],
    code: [
      {
        title: "Arrays and growable lists",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  int[] arr = {5, 2, 9, 1};          // fixed size
                  int[] zeros = new int[3];          // [0, 0, 0]
                  arr[1] = 7;                        // update by index
                  System.out.println(arr.length + " " + arr[arr.length - 1]);
                  System.out.println(Arrays.toString(arr) + " " + Arrays.toString(zeros));

                  List<Integer> list = new ArrayList<>();   // grows as you add
                  list.add(10);
                  list.add(20);
                  list.add(30);
                  list.set(0, 15);                   // update
                  list.remove(list.size() - 1);      // remove the last one
                  System.out.println(list + " size=" + list.size() + " first=" + list.get(0));

                  for (int i = 0; i < arr.length; i++) System.out.print(i + ":" + arr[i] + " ");
                  System.out.println();
              }
          }`,
        python: `
          arr = [5, 2, 9, 1]
          zeros = [0] * 3
          arr[1] = 7
          print(len(arr), arr[-1])          # -1 is the last element
          print(arr, zeros)

          lst = []
          lst.append(10)
          lst.append(20)
          lst.append(30)
          lst[0] = 15
          lst.pop()                         # remove the last one
          print(lst, "size=" + str(len(lst)), "first=" + str(lst[0]))

          for i, x in enumerate(arr):       # index and value together
              print(f"{i}:{x}", end=" ")
          print()`,
        output: `
          4 1
          [5, 7, 9, 1] [0, 0, 0]
          [15, 20] size=2 first=15
          0:5 1:7 2:9 3:1`,
      },
      {
        title: "A 2D grid",
        note: "Rows first, then columns. In Python, build each row separately — `[[0] * cols] * rows` makes every row the same list.",
        java: `
          import java.util.Arrays;

          public class Main {
              public static void main(String[] args) {
                  int rows = 3, cols = 4;
                  int[][] grid = new int[rows][cols];
                  for (int r = 0; r < rows; r++) {
                      for (int c = 0; c < cols; c++) {
                          grid[r][c] = r * cols + c;
                      }
                  }
                  for (int[] row : grid) System.out.println(Arrays.toString(row));
                  System.out.println(grid[2][1]);      // row 2, column 1
              }
          }`,
        python: `
          rows, cols = 3, 4
          grid = [[0] * cols for _ in range(rows)]   # a new list for each row
          for r in range(rows):
              for c in range(cols):
                  grid[r][c] = r * cols + c
          for row in grid:
              print(row)
          print(grid[2][1])                          # row 2, column 1`,
        output: `
          [0, 1, 2, 3]
          [4, 5, 6, 7]
          [8, 9, 10, 11]
          9`,
      },
      {
        title: "Copy or alias?",
        java: `
          import java.util.Arrays;

          public class Main {
              public static void main(String[] args) {
                  int[] a = {1, 2, 3};
                  int[] b = a;            // same array, second name
                  int[] c = a.clone();    // a real copy
                  b[0] = 99;
                  System.out.println(Arrays.toString(a) + " " + Arrays.toString(c));
              }
          }`,
        python: `
          a = [1, 2, 3]
          b = a          # same list, second name
          c = a[:]       # a real copy (a.copy() works too)
          b[0] = 99
          print(a, c)`,
        output: "[99, 2, 3] [1, 2, 3]",
      },
    ],
    mistakes: [
      "`ArrayIndexOutOfBoundsException` / `IndexError`: looping with `i <= n`, or reading `arr[i + 1]` on the last element.",
      "Java: printing an array with `System.out.println(arr)` prints an address like `[I@1b6d3586` — use `Arrays.toString(arr)`.",
      "Java: `list.remove(1)` on a `List<Integer>` removes index 1, not the value 1. Use `list.remove(Integer.valueOf(1))` for the value.",
      "Python: `[[0] * c] * r` — all rows are the same list, so writing one row writes all of them.",
      "Modifying a list while looping over it with for-each — loop over a copy or build a new list.",
    ],
    remember: "Indexes run 0 to n - 1; `=` gives a second name, not a copy.",
    exercises: [
      {
        q: "Reverse the array `[1, 2, 3, 4, 5]` in place (no second array), then print it.",
        example: "Output: [5, 4, 3, 2, 1]",
        hint: "Put one index at each end, swap, move both inward, stop when they meet.",
        java: `
          import java.util.Arrays;

          public class Main {
              public static void main(String[] args) {
                  int[] a = {1, 2, 3, 4, 5};
                  int l = 0, r = a.length - 1;
                  while (l < r) {
                      int t = a[l];
                      a[l] = a[r];
                      a[r] = t;
                      l++;
                      r--;
                  }
                  System.out.println(Arrays.toString(a));
              }
          }`,
        python: `
          a = [1, 2, 3, 4, 5]
          l, r = 0, len(a) - 1
          while l < r:
              a[l], a[r] = a[r], a[l]
              l += 1
              r -= 1
          print(a)`,
        output: "[5, 4, 3, 2, 1]",
      },
      {
        q: "Find the second largest distinct value in `[12, 35, 1, 10, 34, 1]` in one pass, without sorting.",
        example: "Output: 34",
        hint: "Track `first` and `second`. A bigger number pushes `first` down into `second`; a number between them only replaces `second`.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int[] a = {12, 35, 1, 10, 34, 1};
                  int first = Integer.MIN_VALUE, second = Integer.MIN_VALUE;
                  for (int x : a) {
                      if (x > first) {
                          second = first;
                          first = x;
                      } else if (x > second && x != first) {
                          second = x;
                      }
                  }
                  System.out.println(second);
              }
          }`,
        python: `
          a = [12, 35, 1, 10, 34, 1]
          first = second = float("-inf")
          for x in a:
              if x > first:
                  second = first
                  first = x
              elif first > x > second:
                  second = x
          print(second)`,
        output: "34",
      },
      {
        q: "Print the sum of each row of the grid `[[1, 2, 3], [4, 5, 6]]`.",
        example: `
          Output: Row 0: 6
                  Row 1: 15`,
        java: `
          public class Main {
              public static void main(String[] args) {
                  int[][] g = {{1, 2, 3}, {4, 5, 6}};
                  for (int r = 0; r < g.length; r++) {
                      int sum = 0;
                      for (int x : g[r]) sum += x;
                      System.out.println("Row " + r + ": " + sum);
                  }
              }
          }`,
        python: `
          g = [[1, 2, 3], [4, 5, 6]]
          for r, row in enumerate(g):
              print(f"Row {r}: {sum(row)}")`,
        output: `
          Row 0: 6
          Row 1: 15`,
      },
    ],
  },

  "Strings & characters": {
    simple: `A string is a sequence of characters, indexed from 0 just like an array. In both Java and Python strings are immutable: you can't change one character in place — every "change" creates a new string.

    That's why building a string with += inside a loop is slow (it copies everything every time). Java gives you StringBuilder for this; in Python you collect pieces in a list and "".join() them at the end.

    Many string problems become easy once you know two tricks: a character is really a number ('a' is 97), so ch - 'a' turns letters into 0–25; and a count array of size 26 beats a map for lowercase letters.`,
    analogy: `A string is a word printed on a sign. To change one letter you can't scratch it off — you print a whole new sign. StringBuilder (or a Python list of pieces) is a whiteboard: write, erase and add freely, then print the sign once when you're done.`,
    how: {
      steps: [
        "Loop over characters: `for (char ch : s.toCharArray())` / `for ch in s`, or by index with `s.charAt(i)` / `s[i]`.",
        "Classify a character: digit, letter, upper, lower (`Character.isDigit(ch)` / `ch.isdigit()`).",
        "Turn letters into indexes with `ch - 'a'` (Java) or `ord(ch) - ord('a')` (Python) to count with an `int[26]`.",
        "Build the answer in a `StringBuilder` / list of pieces, never with `+=` in a loop.",
        "Compare strings with `.equals()` in Java (never `==`); `==` is correct in Python.",
      ],
    },
    concepts: [
      { term: "Immutable", meaning: "A string can't be changed after it's made. Methods like `toUpperCase()` return a new string." },
      { term: "char", meaning: "Java's single-character type, really a number: `'a' + 1` is 98, `(char) ('a' + 1)` is `'b'`." },
      { term: "ord / chr", meaning: "Python: `ord('a')` → 97 and `chr(98)` → `'b'`." },
      { term: "StringBuilder", meaning: "Java's mutable string: `append`, `insert`, `reverse`, `setCharAt`, then `toString()`." },
      { term: "Substring / slice", meaning: "`s.substring(i, j)` / `s[i:j]` — from `i` up to but not including `j`." },
      { term: "equals vs ==", meaning: "Java `==` checks whether two variables are the same object; `.equals()` checks the text." },
    ],
    syntax: [
      { task: "Length", java: "s.length()", python: "len(s)" },
      { task: "Character at i", java: "s.charAt(i)", python: "s[i]" },
      { task: "Substring i..j-1", java: "s.substring(i, j)", python: "s[i:j]" },
      { task: "Find text", java: 's.indexOf("ab")  // -1 if absent', python: 's.find("ab")  # -1 if absent' },
      { task: "Compare text", java: "a.equals(b)", python: "a == b" },
      { task: "Split into words", java: 'String[] w = s.split(" ");', python: "w = s.split()" },
      { task: "Join words", java: 'String.join(" ", w)', python: '" ".join(w)' },
      { task: "Build a string", java: "StringBuilder sb = new StringBuilder();\nsb.append(x); sb.toString();", python: 'parts = []\nparts.append(x); "".join(parts)' },
      { task: "Reverse", java: "new StringBuilder(s).reverse().toString()", python: "s[::-1]" },
      { task: "Letter → 0..25", java: "ch - 'a'", python: "ord(ch) - ord('a')" },
      { task: "Digit char → number", java: "ch - '0'", python: "int(ch)" },
      { task: "Checks", java: "Character.isDigit(ch)\nCharacter.isLetterOrDigit(ch)", python: "ch.isdigit()\nch.isalnum()" },
      { task: "Number ↔ text", java: 'String.valueOf(42)\nInteger.parseInt("42")', python: 'str(42)\nint("42")' },
    ],
    code: [
      {
        title: "Everyday string operations",
        java: `
          public class Main {
              public static void main(String[] args) {
                  String s = "Hello World";
                  System.out.println(s.length());             // 11
                  System.out.println(s.charAt(4));            // o
                  System.out.println(s.substring(0, 5));      // Hello (index 5 not included)
                  System.out.println(s.indexOf("World"));     // 6
                  System.out.println(s.toUpperCase());
                  String[] words = s.split(" ");
                  System.out.println(words.length + " " + words[1]);
                  System.out.println(String.join("-", words));

                  String a = new String("hi"), b = "hi";
                  System.out.println(a.equals(b) ? "same text" : "different");  // equals, never ==
              }
          }`,
        python: `
          s = "Hello World"
          print(len(s))
          print(s[4])
          print(s[0:5])                  # slice: start included, end not
          print(s.find("World"))
          print(s.upper())
          words = s.split(" ")
          print(len(words), words[1])
          print("-".join(words))

          a, b = "hi", "hi"
          print("same text" if a == b else "different")   # == compares text in Python`,
        output: `
          11
          o
          Hello
          6
          HELLO WORLD
          2 World
          Hello-World
          same text`,
      },
      {
        title: "Counting letters and building a string",
        note: "Count with an array of 26, then build the answer with StringBuilder / a list of pieces.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  String word = "banana";
                  int[] count = new int[26];
                  for (char ch : word.toCharArray()) {
                      count[ch - 'a']++;                 // 'a' -> 0, 'b' -> 1, ...
                  }

                  StringBuilder sb = new StringBuilder();
                  for (int i = 0; i < 26; i++) {
                      if (count[i] > 0) sb.append((char) ('a' + i)).append(count[i]);
                  }
                  String res = sb.toString();
                  System.out.println(res);                                     // a3b1n2
                  System.out.println(new StringBuilder(res).reverse());        // 2n1b3a

                  char d = '7';
                  System.out.println(d - '0' + 1);       // digit character to number: 8
              }
          }`,
        python: `
          word = "banana"
          count = [0] * 26
          for ch in word:
              count[ord(ch) - ord("a")] += 1     # ord gives the character code

          parts = []                             # build a list, join once
          for i in range(26):
              if count[i] > 0:
                  parts.append(chr(ord("a") + i) + str(count[i]))
          res = "".join(parts)
          print(res)
          print(res[::-1])                       # reversed copy

          d = "7"
          print(int(d) + 1)`,
        output: `
          a3b1n2
          2n1b3a
          8`,
      },
    ],
    mistakes: [
      "Java: comparing strings with `==`. It can work in a quick test and fail on the judge. Always use `.equals()`.",
      "Building a long string with `+=` in a loop — O(n²). Use StringBuilder or `\"\".join(parts)`.",
      "Java: `s.charAt(i) == \"a\"` — a char is compared with single quotes: `'a'`.",
      "Python: trying `s[0] = 'x'` — strings are immutable. Convert to a list, change it, then join.",
      "Java: `s.split(\" \")` on text with double spaces gives empty strings; use `s.trim().split(\"\\\\s+\")`.",
    ],
    remember: "Strings can't be edited in place: count with int[26], build with StringBuilder / join, compare with equals in Java.",
    exercises: [
      {
        q: "Check if a sentence is a palindrome, ignoring case and everything except letters and digits. Test `\"A man, a plan, a canal: Panama\"` and `\"race a car\"`.",
        example: `
          Output: Palindrome
                  Not palindrome`,
        hint: "Two indexes from both ends. Skip characters that aren't letters or digits, then compare in lower case.",
        java: `
          public class Main {
              static boolean isPalindrome(String s) {
                  int l = 0, r = s.length() - 1;
                  while (l < r) {
                      while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;
                      while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;
                      if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;
                      l++;
                      r--;
                  }
                  return true;
              }

              public static void main(String[] args) {
                  for (String s : new String[]{"A man, a plan, a canal: Panama", "race a car"}) {
                      System.out.println(isPalindrome(s) ? "Palindrome" : "Not palindrome");
                  }
              }
          }`,
        python: `
          def is_palindrome(s):
              l, r = 0, len(s) - 1
              while l < r:
                  while l < r and not s[l].isalnum():
                      l += 1
                  while l < r and not s[r].isalnum():
                      r -= 1
                  if s[l].lower() != s[r].lower():
                      return False
                  l += 1
                  r -= 1
              return True

          for s in ["A man, a plan, a canal: Panama", "race a car"]:
              print("Palindrome" if is_palindrome(s) else "Not palindrome")`,
        output: `
          Palindrome
          Not palindrome`,
      },
      {
        q: "Reverse every word of `\"I love coding\"` but keep the words in their order.",
        example: "Output: I evol gnidoc",
        java: `
          public class Main {
              public static void main(String[] args) {
                  String[] words = "I love coding".split(" ");
                  StringBuilder sb = new StringBuilder();
                  for (int i = 0; i < words.length; i++) {
                      if (i > 0) sb.append(' ');
                      sb.append(new StringBuilder(words[i]).reverse());
                  }
                  System.out.println(sb);
              }
          }`,
        python: `
          words = "I love coding".split()
          print(" ".join(w[::-1] for w in words))`,
        output: "I evol gnidoc",
      },
      {
        q: "Check whether `\"listen\"` and `\"silent\"` are anagrams (same letters, same counts).",
        example: "Output: Anagram",
        hint: "Add 1 for each letter of the first word and subtract 1 for each letter of the second. All 26 counts must end at 0.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  String a = "listen", b = "silent";
                  boolean ok = a.length() == b.length();
                  int[] count = new int[26];
                  for (int i = 0; ok && i < a.length(); i++) {
                      count[a.charAt(i) - 'a']++;
                      count[b.charAt(i) - 'a']--;
                  }
                  for (int c : count) if (c != 0) ok = false;
                  System.out.println(ok ? "Anagram" : "Not anagram");
              }
          }`,
        python: `
          a, b = "listen", "silent"
          count = [0] * 26
          for ch in a:
              count[ord(ch) - ord("a")] += 1
          for ch in b:
              count[ord(ch) - ord("a")] -= 1
          print("Anagram" if all(c == 0 for c in count) else "Not anagram")`,
        output: "Anagram",
      },
    ],
  },

  "HashMap & HashSet (dict & set)": {
    simple: `A hash map stores key → value pairs and finds any key in about O(1) time, no matter how many entries it has. A hash set is the same idea with only keys: "have I seen this before?" in O(1).

    These two are the most useful tools in coding interviews. Whenever your first idea is a nested loop that searches for something, ask: could I remember what I've already seen in a map or set and look it up instead? That turns O(n²) into O(n) — Two Sum is the classic example.`,
    analogy: `A map is your phone's contact list: type a name (key) and the number (value) appears instantly — the phone doesn't read every contact from the top. A set is the guest list at the door: the guard only needs to know whether your name is on it.`,
    how: {
      steps: [
        "Decide what the key is (the thing you'll look up) and what the value is (what you need to know about it).",
        "Counting? `map.put(x, map.getOrDefault(x, 0) + 1)` / `freq[x] = freq.get(x, 0) + 1`.",
        "Looking for a partner? Before storing the current item, check whether its partner (`target - x`) is already in the map.",
        "Just need \"seen or not\"? Use a set: `add`, `contains` / `in`.",
        "Need keys in sorted order? Use `TreeMap` in Java, or `sorted(d)` in Python — hash maps have no useful order.",
      ],
    },
    concepts: [
      { term: "Key / value", meaning: "Keys are unique; putting the same key again replaces its value." },
      { term: "O(1) average lookup", meaning: "Finding, inserting or removing a key takes constant time on average." },
      { term: "getOrDefault / get", meaning: "Read a value with a fallback when the key is missing: `getOrDefault(k, 0)` / `d.get(k, 0)`." },
      { term: "Counter / defaultdict", meaning: "Python helpers: `Counter(list)` counts for you; `defaultdict(list)` creates missing values automatically." },
      { term: "TreeMap", meaning: "Java map that keeps keys sorted (O(log n) operations), with `firstKey()`, `floorKey()` and more." },
      { term: "Hashable keys", meaning: "Python keys must be immutable: use a tuple, not a list. Java keys need proper `equals`/`hashCode` (String and Integer have them)." },
    ],
    syntax: [
      { task: "Create a map", java: "Map<String, Integer> m = new HashMap<>();", python: "m = {}" },
      { task: "Put / update", java: 'm.put("a", 1);', python: 'm["a"] = 1' },
      { task: "Get with default", java: 'm.getOrDefault("a", 0)', python: 'm.get("a", 0)' },
      { task: "Count one more", java: "m.put(x, m.getOrDefault(x, 0) + 1);", python: "m[x] = m.get(x, 0) + 1" },
      { task: "Has key?", java: 'm.containsKey("a")', python: '"a" in m' },
      { task: "Remove key", java: 'm.remove("a");', python: 'del m["a"]' },
      { task: "Loop over entries", java: "for (Map.Entry<String, Integer> e : m.entrySet())\n    e.getKey(); e.getValue();", python: "for k, v in m.items():" },
      { task: "Count everything", java: "// loop with getOrDefault", python: "from collections import Counter\nc = Counter(items)" },
      { task: "Map of lists", java: "m.computeIfAbsent(k, z -> new ArrayList<>()).add(v);", python: "from collections import defaultdict\nd = defaultdict(list); d[k].append(v)" },
      { task: "Set", java: "Set<Integer> s = new HashSet<>();\ns.add(3); s.contains(3);", python: "s = set()\ns.add(3); 3 in s" },
    ],
    code: [
      {
        title: "Counting with a map",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  String[] fruits = {"apple", "banana", "apple", "cherry", "banana", "apple"};
                  Map<String, Integer> freq = new HashMap<>();
                  for (String f : fruits) {
                      freq.put(f, freq.getOrDefault(f, 0) + 1);   // 0 if not seen yet
                  }
                  System.out.println(freq.get("apple"));
                  System.out.println(freq.containsKey("mango") ? "has mango" : "no mango");
                  // HashMap has no order; a TreeMap copy prints the keys sorted
                  for (Map.Entry<String, Integer> e : new TreeMap<>(freq).entrySet()) {
                      System.out.println(e.getKey() + " = " + e.getValue());
                  }
              }
          }`,
        python: `
          fruits = ["apple", "banana", "apple", "cherry", "banana", "apple"]
          freq = {}
          for f in fruits:
              freq[f] = freq.get(f, 0) + 1     # 0 if not seen yet
          print(freq["apple"])
          print("has mango" if "mango" in freq else "no mango")
          for key in sorted(freq):             # sorted keys for a predictable print
              print(key, "=", freq[key])
          # collections.Counter(fruits) does the counting in one line`,
        output: `
          3
          no mango
          apple = 3
          banana = 2
          cherry = 1`,
      },
      {
        title: "Two Sum and duplicate check",
        note: "Two Sum: for each number, check whether the number it needs (`target - x`) was already seen. One pass, O(n).",
        java: `
          import java.util.*;

          public class Main {
              static int[] twoSum(int[] nums, int target) {
                  Map<Integer, Integer> seen = new HashMap<>();   // value -> index
                  for (int i = 0; i < nums.length; i++) {
                      int need = target - nums[i];
                      if (seen.containsKey(need)) return new int[]{seen.get(need), i};
                      seen.put(nums[i], i);                       // store AFTER checking
                  }
                  return new int[]{-1, -1};
              }

              static boolean hasDuplicate(int[] nums) {
                  Set<Integer> set = new HashSet<>();
                  for (int x : nums) {
                      if (!set.add(x)) return true;   // add returns false if x was already there
                  }
                  return false;
              }

              public static void main(String[] args) {
                  System.out.println(Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9)));
                  System.out.println(hasDuplicate(new int[]{1, 2, 3, 1}) ? "duplicate" : "all unique");
                  System.out.println(hasDuplicate(new int[]{1, 2, 3}) ? "duplicate" : "all unique");
              }
          }`,
        python: `
          def two_sum(nums, target):
              seen = {}                    # value -> index
              for i, x in enumerate(nums):
                  need = target - x
                  if need in seen:
                      return [seen[need], i]
                  seen[x] = i              # store AFTER checking
              return [-1, -1]

          def has_duplicate(nums):
              seen = set()
              for x in nums:
                  if x in seen:
                      return True
                  seen.add(x)
              return False

          print(two_sum([2, 7, 11, 15], 9))
          print("duplicate" if has_duplicate([1, 2, 3, 1]) else "all unique")
          print("duplicate" if has_duplicate([1, 2, 3]) else "all unique")`,
        output: `
          [0, 1]
          duplicate
          all unique`,
      },
    ],
    mistakes: [
      "Two Sum: storing the number before checking — then `target = 2 × x` matches the number with itself.",
      "Java: `map.get(k)` on a missing key returns `null`; unboxing it into an `int` throws NullPointerException. Use `getOrDefault`.",
      "Python: `d[k]` on a missing key raises KeyError. Use `d.get(k, 0)`, `Counter` or `defaultdict`.",
      "Expecting a HashMap to remember insertion or sorted order. Use `LinkedHashMap` / `TreeMap`, or sort the keys.",
      "Python: using a list as a key — convert it to a tuple first.",
    ],
    remember: "When you're about to search with a nested loop, remember what you've seen in a map or set instead.",
    exercises: [
      {
        q: "Find the first character that appears exactly once in `\"swiss\"`.",
        example: "Output: w",
        hint: "Two passes: count every character, then walk the string again and return the first with count 1.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  String s = "swiss";
                  Map<Character, Integer> count = new HashMap<>();
                  for (char ch : s.toCharArray()) count.put(ch, count.getOrDefault(ch, 0) + 1);
                  String ans = "-1";
                  for (char ch : s.toCharArray()) {
                      if (count.get(ch) == 1) {
                          ans = String.valueOf(ch);
                          break;
                      }
                  }
                  System.out.println(ans);
              }
          }`,
        python: `
          from collections import Counter

          s = "swiss"
          count = Counter(s)
          ans = "-1"
          for ch in s:
              if count[ch] == 1:
                  ans = ch
                  break
          print(ans)`,
        output: "w",
      },
      {
        q: "Group anagrams together: `[\"eat\", \"tea\", \"tan\", \"ate\", \"nat\", \"bat\"]`. Print each group on its own line, groups in the order they first appear.",
        example: `
          Output: eat tea ate
                  tan nat
                  bat`,
        hint: "Anagrams have the same letters once sorted: use the sorted word as the key and a list of words as the value.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  String[] words = {"eat", "tea", "tan", "ate", "nat", "bat"};
                  Map<String, List<String>> groups = new LinkedHashMap<>();   // keeps first-seen order
                  for (String w : words) {
                      char[] chars = w.toCharArray();
                      Arrays.sort(chars);
                      String key = new String(chars);
                      groups.computeIfAbsent(key, k -> new ArrayList<>()).add(w);
                  }
                  for (List<String> g : groups.values()) System.out.println(String.join(" ", g));
              }
          }`,
        python: `
          from collections import defaultdict

          words = ["eat", "tea", "tan", "ate", "nat", "bat"]
          groups = defaultdict(list)          # dicts keep first-seen order
          for w in words:
              key = "".join(sorted(w))
              groups[key].append(w)
          for g in groups.values():
              print(" ".join(g))`,
        output: `
          eat tea ate
          tan nat
          bat`,
      },
    ],
  },

  "Stack, queue & deque": {
    simple: `A stack is last in, first out: you add and remove at the top, like a pile of plates. A queue is first in, first out: you add at the back and remove from the front, like a line at a ticket counter. A deque (double-ended queue) lets you add and remove at both ends.

    Stacks solve "match the most recent thing" problems (brackets, undo, next greater element) and power DFS. Queues power BFS and anything processed in arrival order.

    In Java, use ArrayDeque for both. In Python, a list is a fine stack, but use collections.deque for a queue.`,
    analogy: `Stack: browser back button — the last page you opened is the first one you return to. Queue: a printer — documents print in the order they were sent. Deque: a train where passengers can board or leave at either end.`,
    how: {
      steps: [
        "Ask: do I need the most recent item (stack) or the oldest item (queue)?",
        "Java: `Deque<Integer> st = new ArrayDeque<>()` — `push`, `pop`, `peek` for a stack; `offer`, `poll`, `peek` for a queue.",
        "Python: stack = list with `append` / `pop` / `[-1]`; queue = `deque` with `append` / `popleft` / `[0]`.",
        "Always check it's not empty before `pop` / `peek` — an empty pop is a crash.",
        "At the end, check what's left: in bracket matching, leftovers mean the input was invalid.",
      ],
    },
    concepts: [
      { term: "LIFO", meaning: "Last In, First Out — a stack." },
      { term: "FIFO", meaning: "First In, First Out — a queue." },
      { term: "ArrayDeque", meaning: "Java's go-to stack and queue. Faster than the old `Stack` class and `LinkedList`." },
      { term: "collections.deque", meaning: "Python's queue: O(1) at both ends. `list.pop(0)` is O(n) and makes BFS slow." },
      { term: "Monotonic stack", meaning: "A stack kept in increasing or decreasing order — finds the next greater/smaller element in O(n)." },
      { term: "peek", meaning: "Look at the top / front without removing it." },
    ],
    syntax: [
      { task: "Create a stack", java: "Deque<Integer> st = new ArrayDeque<>();", python: "st = []" },
      { task: "Push / pop / top", java: "st.push(x); st.pop(); st.peek();", python: "st.append(x); st.pop(); st[-1]" },
      { task: "Create a queue", java: "Queue<Integer> q = new ArrayDeque<>();", python: "from collections import deque\nq = deque()" },
      { task: "Add back / remove front", java: "q.offer(x); q.poll(); q.peek();", python: "q.append(x); q.popleft(); q[0]" },
      { task: "Deque both ends", java: "d.offerFirst(x); d.offerLast(x);\nd.pollFirst(); d.pollLast();", python: "d.appendleft(x); d.append(x)\nd.popleft(); d.pop()" },
      { task: "Empty?", java: "st.isEmpty()", python: "not st" },
      { task: "Size", java: "st.size()", python: "len(st)" },
    ],
    code: [
      {
        title: "Stack and queue operations",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Deque<Integer> stack = new ArrayDeque<>();   // last in, first out
                  stack.push(1);
                  stack.push(2);
                  stack.push(3);
                  System.out.println(stack.peek());    // 3: the top
                  System.out.println(stack.pop());     // removes 3
                  System.out.println(stack.size());    // 2

                  Queue<String> queue = new ArrayDeque<>();    // first in, first out
                  queue.offer("A");
                  queue.offer("B");
                  queue.offer("C");
                  System.out.println(queue.poll());    // A: the front
                  System.out.println(queue.peek());    // B
                  System.out.println(queue.isEmpty() ? "empty" : "not empty");
              }
          }`,
        python: `
          from collections import deque

          stack = []              # a list works as a stack: add and remove at the end
          stack.append(1)
          stack.append(2)
          stack.append(3)
          print(stack[-1])        # 3: the top
          print(stack.pop())      # removes 3
          print(len(stack))       # 2

          queue = deque()         # fast at both ends
          queue.append("A")
          queue.append("B")
          queue.append("C")
          print(queue.popleft())  # A: the front
          print(queue[0])         # B
          print("empty" if not queue else "not empty")`,
        output: `
          3
          3
          2
          A
          B
          not empty`,
      },
      {
        title: "Valid parentheses",
        note: "Push every opening bracket. On a closing bracket, the top of the stack must be its partner.",
        java: `
          import java.util.*;

          public class Main {
              static boolean isValid(String s) {
                  Deque<Character> stack = new ArrayDeque<>();
                  for (char ch : s.toCharArray()) {
                      if (ch == '(' || ch == '[' || ch == '{') {
                          stack.push(ch);                      // opening: remember it
                      } else {
                          if (stack.isEmpty()) return false;   // closing with nothing open
                          char open = stack.pop();
                          if (ch == ')' && open != '(') return false;
                          if (ch == ']' && open != '[') return false;
                          if (ch == '}' && open != '{') return false;
                      }
                  }
                  return stack.isEmpty();                      // anything left open is invalid
              }

              public static void main(String[] args) {
                  for (String s : new String[]{"({[]})", "([)]", "(("}) {
                      System.out.println(s + " -> " + (isValid(s) ? "valid" : "invalid"));
                  }
              }
          }`,
        python: `
          def is_valid(s):
              pairs = {")": "(", "]": "[", "}": "{"}
              stack = []
              for ch in s:
                  if ch in "([{":
                      stack.append(ch)                 # opening: remember it
                  elif not stack or stack.pop() != pairs[ch]:
                      return False                     # nothing open, or the wrong partner
              return not stack                         # anything left open is invalid

          for s in ["({[]})", "([)]", "(("]:
              print(s, "->", "valid" if is_valid(s) else "invalid")`,
        output: `
          ({[]}) -> valid
          ([)] -> invalid
          (( -> invalid`,
      },
    ],
    mistakes: [
      "Popping an empty stack: `NoSuchElementException` in Java, `IndexError` in Python. Check `isEmpty()` / `if stack` first.",
      "Python: using `list.pop(0)` as a queue — each call shifts every element, O(n).",
      "Java: using `java.util.Stack` — it's an old, synchronised class. `ArrayDeque` is the modern choice.",
      "Java: mixing `push` (adds at the front) with `offer` (adds at the back) on the same ArrayDeque by accident.",
      "Forgetting to check the stack is empty at the end (`\"((\"` would wrongly pass).",
    ],
    remember: "Most recent first → stack. Oldest first → queue. In Java both are ArrayDeque; in Python, list and deque.",
    exercises: [
      {
        q: "For each element of `[4, 5, 2, 25]`, find the next greater element to its right, or -1 if there isn't one.",
        example: "Output: [5, 25, 25, -1]",
        hint: "Walk from right to left with a stack. Pop everything ≤ the current number; whatever is left on top is the answer; then push the current number.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  int[] a = {4, 5, 2, 25};
                  int[] ans = new int[a.length];
                  Deque<Integer> st = new ArrayDeque<>();
                  for (int i = a.length - 1; i >= 0; i--) {
                      while (!st.isEmpty() && st.peek() <= a[i]) st.pop();
                      ans[i] = st.isEmpty() ? -1 : st.peek();
                      st.push(a[i]);
                  }
                  System.out.println(Arrays.toString(ans));
              }
          }`,
        python: `
          a = [4, 5, 2, 25]
          ans = [0] * len(a)
          st = []
          for i in range(len(a) - 1, -1, -1):
              while st and st[-1] <= a[i]:
                  st.pop()
              ans[i] = st[-1] if st else -1
              st.append(a[i])
          print(ans)`,
        output: "[5, 25, 25, -1]",
      },
      {
        q: "Build a queue using two stacks. Run: push 1, push 2, pop, push 3, pop, pop — printing each popped value.",
        example: `
          Output: 1
                  2
                  3`,
        hint: "Push onto an `in` stack. To pop, if the `out` stack is empty, move everything from `in` to `out` (that reverses the order), then pop from `out`.",
        java: `
          import java.util.*;

          public class Main {
              static class MyQueue {
                  private final Deque<Integer> in = new ArrayDeque<>(), out = new ArrayDeque<>();

                  void push(int x) {
                      in.push(x);
                  }

                  int pop() {
                      if (out.isEmpty()) {
                          while (!in.isEmpty()) out.push(in.pop());
                      }
                      return out.pop();
                  }
              }

              public static void main(String[] args) {
                  MyQueue q = new MyQueue();
                  q.push(1);
                  q.push(2);
                  System.out.println(q.pop());
                  q.push(3);
                  System.out.println(q.pop());
                  System.out.println(q.pop());
              }
          }`,
        python: `
          class MyQueue:
              def __init__(self):
                  self.inbox, self.outbox = [], []

              def push(self, x):
                  self.inbox.append(x)

              def pop(self):
                  if not self.outbox:
                      while self.inbox:
                          self.outbox.append(self.inbox.pop())
                  return self.outbox.pop()

          q = MyQueue()
          q.push(1)
          q.push(2)
          print(q.pop())
          q.push(3)
          print(q.pop())
          print(q.pop())`,
        output: `
          1
          2
          3`,
      },
    ],
  },

  "Heap / priority queue": {
    simple: `A heap (priority queue) always hands you the smallest item first — or the largest, if you set it up that way — no matter what order you added things in. Adding and removing take O(log n); looking at the top is O(1).

    Use it whenever a problem says "k largest", "k smallest", "closest", "most frequent", "merge sorted lists", or "always process the cheapest next" (Dijkstra). Both Java's PriorityQueue and Python's heapq are min-heaps by default.`,
    analogy: `A hospital emergency room: patients aren't seen in arrival order but by how urgent they are. Whoever is most critical is always next, and a new critical patient jumps straight to the front.`,
    how: {
      steps: [
        "Decide what \"first\" means: smallest number, largest number, or a custom rule (by distance, by frequency).",
        "Create it: `new PriorityQueue<>()` (min) or `new PriorityQueue<>(Collections.reverseOrder())` (max); in Python `heapq` on a list, pushing `-x` for a max-heap.",
        "For pairs, store `int[]` with a comparator in Java, or a tuple `(priority, value)` in Python — tuples compare item by item.",
        "For top-K: keep a min-heap of size K; when it grows past K, pop the smallest. What's left are the K largest.",
        "Pop until empty (or K times) to read results in priority order.",
      ],
    },
    concepts: [
      { term: "Min-heap", meaning: "The smallest element is always on top. Default in both Java and Python." },
      { term: "Max-heap", meaning: "The largest element on top. Java: reverse comparator. Python: push negatives." },
      { term: "offer / poll / peek", meaning: "Java's add, remove-top and look-at-top. Python: `heappush`, `heappop`, `heap[0]`." },
      { term: "Comparator", meaning: "A rule saying which of two items comes first: `(a, b) -> a[0] - b[0]`." },
      { term: "heapify", meaning: "Python: `heapq.heapify(list)` turns a list into a heap in O(n)." },
      { term: "Top-K pattern", meaning: "A size-K heap gives the K largest in O(n log k) — better than sorting everything." },
    ],
    syntax: [
      { task: "Min-heap", java: "PriorityQueue<Integer> pq = new PriorityQueue<>();", python: "import heapq\npq = []" },
      { task: "Max-heap", java: "new PriorityQueue<>(Collections.reverseOrder())", python: "heapq.heappush(pq, -x)  # negate" },
      { task: "Add", java: "pq.offer(x);", python: "heapq.heappush(pq, x)" },
      { task: "Remove top", java: "pq.poll()", python: "heapq.heappop(pq)" },
      { task: "Look at top", java: "pq.peek()", python: "pq[0]" },
      { task: "Heap of pairs", java: "new PriorityQueue<int[]>((a, b) -> a[0] - b[0])", python: "heapq.heappush(pq, (dist, node))" },
      { task: "List → heap", java: "new PriorityQueue<>(list)", python: "heapq.heapify(a)" },
      { task: "k largest (shortcut)", java: "// size-k min-heap", python: "heapq.nlargest(k, a)" },
    ],
    code: [
      {
        title: "Min-heap and max-heap",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  PriorityQueue<Integer> minHeap = new PriorityQueue<>();   // smallest on top
                  for (int x : new int[]{5, 1, 8, 3}) minHeap.offer(x);
                  System.out.println(minHeap.peek());          // 1
                  StringBuilder sb = new StringBuilder();
                  while (!minHeap.isEmpty()) sb.append(minHeap.poll()).append(' ');
                  System.out.println(sb.toString().trim());    // comes out sorted

                  PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
                  for (int x : new int[]{5, 1, 8, 3}) maxHeap.offer(x);
                  System.out.println(maxHeap.poll());          // 8
              }
          }`,
        python: `
          import heapq

          min_heap = []
          for x in [5, 1, 8, 3]:
              heapq.heappush(min_heap, x)     # heapq is always a min-heap
          print(min_heap[0])                  # 1
          out = []
          while min_heap:
              out.append(heapq.heappop(min_heap))
          print(*out)                         # * prints items separated by spaces

          max_heap = []
          for x in [5, 1, 8, 3]:
              heapq.heappush(max_heap, -x)    # max-heap trick: store negatives
          print(-heapq.heappop(max_heap))     # 8`,
        output: `
          1
          1 3 5 8
          8`,
      },
      {
        title: "Tasks by priority (a heap of pairs)",
        note: "Lower number = more urgent. Ties are broken by the order the tasks were added.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  String[] names = {"email", "deploy", "lunch", "bugfix"};
                  int[] priority = {3, 1, 5, 1};
                  // Each entry is {priority, index}; compare priority first, then index
                  PriorityQueue<int[]> pq = new PriorityQueue<>(
                      (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]));
                  for (int i = 0; i < names.length; i++) pq.offer(new int[]{priority[i], i});
                  while (!pq.isEmpty()) {
                      int[] top = pq.poll();
                      System.out.println(top[0] + " " + names[top[1]]);
                  }
              }
          }`,
        python: `
          import heapq

          names = ["email", "deploy", "lunch", "bugfix"]
          priority = [3, 1, 5, 1]
          pq = []
          for i, name in enumerate(names):
              heapq.heappush(pq, (priority[i], i, name))   # tuples compare item by item
          while pq:
              p, i, name = heapq.heappop(pq)
              print(p, name)`,
        output: `
          1 deploy
          1 bugfix
          3 email
          5 lunch`,
      },
    ],
    mistakes: [
      "Expecting a max-heap by default — both languages give you a min-heap.",
      "Java: comparator `(a, b) -> a - b` can overflow for large or negative values; `Integer.compare(a, b)` is always safe.",
      "Java: printing or looping over a PriorityQueue directly — it isn't sorted inside. Only `poll()` gives priority order.",
      "Python: pushing tuples whose first items tie and whose second items can't be compared (e.g. two ListNodes) — add an index as a tie-breaker.",
      "Sorting the whole array for top-K when K is small — a size-K heap is O(n log k).",
    ],
    remember: "Need the smallest or largest over and over? Use a heap — and remember both languages start as a min-heap.",
    exercises: [
      {
        q: "Find the 2nd largest element of `[3, 2, 1, 5, 6, 4]` using a min-heap of size k.",
        example: "Output: 5",
        hint: "Push every number; whenever the heap has more than k items, pop the smallest. The top is the k-th largest.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  int[] nums = {3, 2, 1, 5, 6, 4};
                  int k = 2;
                  PriorityQueue<Integer> pq = new PriorityQueue<>();
                  for (int x : nums) {
                      pq.offer(x);
                      if (pq.size() > k) pq.poll();
                  }
                  System.out.println(pq.peek());
              }
          }`,
        python: `
          import heapq

          nums, k = [3, 2, 1, 5, 6, 4], 2
          pq = []
          for x in nums:
              heapq.heappush(pq, x)
              if len(pq) > k:
                  heapq.heappop(pq)
          print(pq[0])`,
        output: "5",
      },
      {
        q: "Merge the sorted lists `[1, 4, 7]`, `[2, 5, 8]` and `[3, 6, 9]` into one sorted list.",
        example: "Output: 1 2 3 4 5 6 7 8 9",
        hint: "Put the first element of each list in a heap as (value, list number, index). Pop the smallest, then push the next element from the same list.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  int[][] lists = {{1, 4, 7}, {2, 5, 8}, {3, 6, 9}};
                  // {value, which list, index in that list}
                  PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
                  for (int i = 0; i < lists.length; i++) pq.offer(new int[]{lists[i][0], i, 0});
                  StringBuilder sb = new StringBuilder();
                  while (!pq.isEmpty()) {
                      int[] top = pq.poll();
                      sb.append(top[0]).append(' ');
                      int li = top[1], next = top[2] + 1;
                      if (next < lists[li].length) pq.offer(new int[]{lists[li][next], li, next});
                  }
                  System.out.println(sb.toString().trim());
              }
          }`,
        python: `
          import heapq

          lists = [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
          pq = [(lst[0], i, 0) for i, lst in enumerate(lists)]   # (value, which list, index)
          heapq.heapify(pq)
          out = []
          while pq:
              val, li, idx = heapq.heappop(pq)
              out.append(val)
              if idx + 1 < len(lists[li]):
                  heapq.heappush(pq, (lists[li][idx + 1], li, idx + 1))
          print(*out)`,
        output: "1 2 3 4 5 6 7 8 9",
      },
    ],
  },

  "Sorting & custom comparators": {
    simple: `Sorting puts things in order, and a surprising number of problems get simpler once the data is sorted: duplicates sit next to each other, intervals can be merged left to right, and two pointers start to work.

    Both languages sort numbers and strings for you in O(n log n). The skill to practise is sorting by your own rule — by length, by the second value of a pair, by marks descending and then name ascending. Java does this with a Comparator; Python does it with a key function.`,
    analogy: `Sorting a class register: first by marks, highest first; when two students have the same marks, alphabetically by name. A comparator is exactly that rule written down, so the computer can apply it to any two students.`,
    how: {
      steps: [
        "Ask whether sorting helps: will sorted order make neighbours meaningful or let you scan once?",
        "Simple case: `Arrays.sort(arr)` / `Collections.sort(list)`; `arr.sort()` / `sorted(arr)`.",
        "Custom rule in Java: a comparator returning negative (a first), zero (tie) or positive (b first). Build it with `Comparator.comparing(...)` and `.thenComparing(...)`.",
        "Custom rule in Python: `key=` returns what to compare; return a tuple for multiple levels, negate numbers for descending.",
        "Remember the cost: sorting is O(n log n) — fine for n up to ~10⁶.",
      ],
    },
    concepts: [
      { term: "In place vs new", meaning: "`Arrays.sort` / `list.sort()` change the original; Python's `sorted()` returns a new list." },
      { term: "Comparator", meaning: "Java rule `(a, b) -> ...`: negative puts `a` first, positive puts `b` first." },
      { term: "key function", meaning: "Python: `sort(key=lambda x: ...)` sorts by whatever the lambda returns." },
      { term: "Stable sort", meaning: "Equal items keep their original order. Python's sort and Java's object sort are stable." },
      { term: "Reverse order", meaning: "Java needs objects (`Integer[]`) for `Collections.reverseOrder()`; Python uses `reverse=True`." },
      { term: "Lambda", meaning: "A tiny unnamed function written inline: `(a, b) -> a[0] - b[0]` / `lambda x: x[0]`." },
    ],
    syntax: [
      { task: "Sort an array", java: "Arrays.sort(arr);", python: "arr.sort()" },
      { task: "Sorted copy", java: "int[] b = arr.clone(); Arrays.sort(b);", python: "b = sorted(arr)" },
      { task: "Descending", java: "Integer[] a = ...;\nArrays.sort(a, Collections.reverseOrder());", python: "arr.sort(reverse=True)" },
      { task: "Sort a list", java: "Collections.sort(list);", python: "lst.sort()" },
      { task: "By string length", java: "words.sort((a, b) -> a.length() - b.length());", python: "words.sort(key=len)" },
      { task: "Pairs by first value", java: "Arrays.sort(iv, (a, b) -> Integer.compare(a[0], b[0]));", python: "iv.sort(key=lambda x: x[0])" },
      { task: "Two levels", java: "Comparator.comparingInt(S::marks).reversed()\n    .thenComparing(S::name)", python: "key=lambda s: (-s.marks, s.name)" },
    ],
    code: [
      {
        title: "Sorting numbers and words",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  int[] nums = {5, 2, 9, 1};
                  Arrays.sort(nums);                                  // ascending, in place
                  System.out.println(Arrays.toString(nums));

                  Integer[] boxed = {5, 2, 9, 1};                     // descending needs objects, not int[]
                  Arrays.sort(boxed, Collections.reverseOrder());
                  System.out.println(Arrays.toString(boxed));

                  List<String> words = new ArrayList<>(List.of("pear", "fig", "banana", "kiwi"));
                  Collections.sort(words);                            // alphabetical
                  System.out.println(String.join(" ", words));
                  words.sort((a, b) -> a.length() - b.length());      // by length; ties keep their order
                  System.out.println(String.join(" ", words));
              }
          }`,
        python: `
          nums = [5, 2, 9, 1]
          nums.sort()                                 # ascending, in place
          print(nums)
          print(sorted([5, 2, 9, 1], reverse=True))   # sorted() returns a new list

          words = ["pear", "fig", "banana", "kiwi"]
          words.sort()                                # alphabetical
          print(" ".join(words))
          words.sort(key=len)                         # by length; ties keep their order
          print(" ".join(words))`,
        output: `
          [1, 2, 5, 9]
          [9, 5, 2, 1]
          banana fig kiwi pear
          fig kiwi pear banana`,
      },
      {
        title: "Sorting by two rules, and sorting intervals",
        java: `
          import java.util.*;

          public class Main {
              record Student(String name, int marks) {}

              public static void main(String[] args) {
                  List<Student> list = new ArrayList<>(List.of(
                      new Student("Riya", 82), new Student("Aman", 91),
                      new Student("Zoya", 82), new Student("Dev", 75)));
                  // Highest marks first; equal marks -> name A to Z
                  list.sort(Comparator.comparingInt(Student::marks).reversed().thenComparing(Student::name));
                  for (Student s : list) System.out.println(s.name() + " " + s.marks());

                  int[][] intervals = {{8, 10}, {1, 3}, {2, 6}};
                  Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));   // by start
                  System.out.println(Arrays.deepToString(intervals));
              }
          }`,
        python: `
          students = [("Riya", 82), ("Aman", 91), ("Zoya", 82), ("Dev", 75)]
          # The key says what to compare: -marks puts the highest first, then name A to Z
          students.sort(key=lambda s: (-s[1], s[0]))
          for name, marks in students:
              print(name, marks)

          intervals = [[8, 10], [1, 3], [2, 6]]
          intervals.sort(key=lambda iv: iv[0])       # by start
          print(intervals)`,
        output: `
          Aman 91
          Riya 82
          Zoya 82
          Dev 75
          [[1, 3], [2, 6], [8, 10]]`,
      },
    ],
    mistakes: [
      "Java: `Arrays.sort(int[], Collections.reverseOrder())` doesn't compile — reverse sorting needs `Integer[]` (or sort ascending and read backwards).",
      "Java: comparator `(a, b) -> a - b` overflows when values are near the int limits; use `Integer.compare`.",
      "Python: `x = arr.sort()` — `sort()` returns `None`. Use `sorted(arr)` if you need the result.",
      "Sorting inside a loop — O(n² log n). Sort once, before the loop.",
      "Forgetting that sorting loses original indexes. If you need them, sort indexes or pairs `(value, index)`.",
    ],
    remember: "Java: comparator says who goes first. Python: key says what to compare — use a tuple for tie-breaks.",
    exercises: [
      {
        q: "Merge overlapping intervals: `[[1, 3], [2, 6], [8, 10], [15, 18]]`.",
        example: "Output: [[1, 6], [8, 10], [15, 18]]",
        hint: "Sort by start. Walk through: if an interval starts before the last merged one ends, extend that end; otherwise start a new merged interval.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  int[][] iv = {{1, 3}, {2, 6}, {8, 10}, {15, 18}};
                  Arrays.sort(iv, (a, b) -> Integer.compare(a[0], b[0]));
                  List<int[]> merged = new ArrayList<>();
                  for (int[] cur : iv) {
                      if (!merged.isEmpty() && cur[0] <= merged.get(merged.size() - 1)[1]) {
                          int[] last = merged.get(merged.size() - 1);
                          last[1] = Math.max(last[1], cur[1]);
                      } else {
                          merged.add(cur);
                      }
                  }
                  System.out.println(Arrays.deepToString(merged.toArray(new int[0][])));
              }
          }`,
        python: `
          iv = [[1, 3], [2, 6], [8, 10], [15, 18]]
          iv.sort(key=lambda x: x[0])
          merged = []
          for start, end in iv:
              if merged and start <= merged[-1][1]:
                  merged[-1][1] = max(merged[-1][1], end)
              else:
                  merged.append([start, end])
          print(merged)`,
        output: "[[1, 6], [8, 10], [15, 18]]",
      },
      {
        q: "Sort `[\"bb\", \"a\", \"ccc\", \"ab\", \"b\"]` by length, and alphabetically when lengths are equal.",
        example: "Output: a b ab bb ccc",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  List<String> w = new ArrayList<>(List.of("bb", "a", "ccc", "ab", "b"));
                  w.sort(Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder()));
                  System.out.println(String.join(" ", w));
              }
          }`,
        python: `
          w = ["bb", "a", "ccc", "ab", "b"]
          w.sort(key=lambda s: (len(s), s))
          print(" ".join(w))`,
        output: "a b ab bb ccc",
      },
    ],
  },

  "Turning an algorithm into code": {
    simple: `Many students can explain the idea ("keep track of the biggest so far") but freeze when they have to type it. The gap is almost always the same: they jump from the idea straight to code without deciding what the variables are and exactly what changes on each step.

    The fix is a short, repeatable routine: solve a tiny example by hand, write the steps in plain words, name the variables those steps need, then translate one line at a time. Finally, dry-run the code on the example to prove it does what your hands did.`,
    analogy: `It's like giving directions to someone new in town. "Go to the market" (the idea) isn't enough. "Walk straight, take the second left, stop at the blue gate" (steps with clear checkpoints) is something they can actually follow. Code needs that second kind of directions.`,
    how: {
      steps: [
        "**Understand**: restate the input, the output and the constraints. Ask about empty input, duplicates and negatives.",
        "**Solve by hand**: take a small example (4–6 items) and solve it on paper. Watch what you keep track of in your head.",
        "**Write steps in words**: \"go through each number; if it's bigger than the best so far, update the best\".",
        "**Name the variables**: every \"thing you kept track of\" becomes a variable with a starting value (`best = nums[0]`, `count = 0`).",
        "**Translate line by line**: \"go through each\" → a `for` loop; \"if bigger\" → `if`; \"update\" → assignment.",
        "**Dry-run**: run the code on your example with a table of variable values after each loop round.",
        "**Edge cases**: try empty, one element, all equal, all negative, largest input size (does it overflow? is it fast enough?).",
      ],
    },
    concepts: [
      { term: "Pseudocode", meaning: "The steps in plain words, structured like code but without syntax. Write it first; it's easy to fix." },
      { term: "State", meaning: "The variables you carry from one loop round to the next — what you'd keep in your head doing it by hand." },
      { term: "Invariant", meaning: "Something that's always true at the start of each round, e.g. \"`best` is the max of everything seen so far\"." },
      { term: "Dry run", meaning: "Tracing the code by hand on a small input, writing down every variable after each step." },
      { term: "Edge case", meaning: "An unusual input that breaks naive code: empty, one item, duplicates, negatives, very large values." },
      { term: "Template", meaning: "A memorised code shape for a pattern (sliding window, BFS…). The later lessons give you one per pattern." },
    ],
    syntax: [
      { task: "\"go through each item\"", java: "for (int x : nums)", python: "for x in nums:" },
      { task: "\"…and its position\"", java: "for (int i = 0; i < n; i++)", python: "for i, x in enumerate(nums):" },
      { task: "\"keep the best so far\"", java: "best = Math.max(best, x);", python: "best = max(best, x)" },
      { task: "\"count how many\"", java: "if (cond) count++;", python: "if cond: count += 1" },
      { task: "\"stop as soon as found\"", java: "if (found) break;  // or return", python: "if found: break  # or return" },
      { task: "\"start with nothing\"", java: "int best = Integer.MIN_VALUE;", python: "best = float('-inf')" },
      { task: "\"remember what I've seen\"", java: "Set<Integer> seen = new HashSet<>();", python: "seen = set()" },
    ],
    code: [
      {
        title: "Example: longest run of consecutive 1s",
        note: `Steps in words: walk through the array; keep the length of the current run; a 1 makes the run one longer, a 0 resets it to 0; after each step, the answer is the best run seen so far.

        Variables: \`current\` (run ending here) and \`best\`. Dry run on [1, 1, 0, 1, 1, 1]: current goes 1, 2, 0, 1, 2, 3 and best goes 1, 2, 2, 2, 2, 3.`,
        java: `
          public class Main {
              static int longestOnes(int[] nums) {
                  int current = 0, best = 0;          // the state from the steps
                  for (int x : nums) {                // "walk through the array"
                      if (x == 1) current++;          // "a 1 makes the run longer"
                      else current = 0;               // "a 0 resets it"
                      best = Math.max(best, current); // "keep the best so far"
                  }
                  return best;
              }

              public static void main(String[] args) {
                  System.out.println(longestOnes(new int[]{1, 1, 0, 1, 1, 1}));  // normal case
                  System.out.println(longestOnes(new int[]{0, 0}));              // edge: no 1s
                  System.out.println(longestOnes(new int[]{}));                  // edge: empty
              }
          }`,
        python: `
          def longest_ones(nums):
              current = best = 0              # the state from the steps
              for x in nums:                  # "walk through the array"
                  if x == 1:
                      current += 1            # "a 1 makes the run longer"
                  else:
                      current = 0             # "a 0 resets it"
                  best = max(best, current)   # "keep the best so far"
              return best

          print(longest_ones([1, 1, 0, 1, 1, 1]))  # normal case
          print(longest_ones([0, 0]))              # edge: no 1s
          print(longest_ones([]))                  # edge: empty`,
        output: `
          3
          0
          0`,
      },
      {
        title: "Debug by printing the state",
        note: "When your output is wrong, print the variables at the end of each loop round and compare them with your hand dry run. The first row that differs is where the bug is. (Remove the prints before submitting.)",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int[] prices = {7, 1, 5, 3, 6, 4};       // best time to buy and sell a stock once
                  int minSoFar = Integer.MAX_VALUE, profit = 0;
                  for (int i = 0; i < prices.length; i++) {
                      minSoFar = Math.min(minSoFar, prices[i]);
                      profit = Math.max(profit, prices[i] - minSoFar);
                      System.out.println("i=" + i + " price=" + prices[i] + " min=" + minSoFar + " profit=" + profit);
                  }
                  System.out.println("answer = " + profit);
              }
          }`,
        python: `
          prices = [7, 1, 5, 3, 6, 4]        # best time to buy and sell a stock once
          min_so_far, profit = float("inf"), 0
          for i, p in enumerate(prices):
              min_so_far = min(min_so_far, p)
              profit = max(profit, p - min_so_far)
              print(f"i={i} price={p} min={min_so_far} profit={profit}")
          print("answer =", profit)`,
        output: `
          i=0 price=7 min=7 profit=0
          i=1 price=1 min=1 profit=0
          i=2 price=5 min=1 profit=4
          i=3 price=3 min=1 profit=4
          i=4 price=6 min=1 profit=5
          i=5 price=4 min=1 profit=5
          answer = 5`,
      },
    ],
    mistakes: [
      "Starting to type before you can solve a small example by hand.",
      "Starting `best` at 0 when the values can be negative — start at the first element or at the minimum value.",
      "Updating the answer in the wrong place (before vs after changing the state). The dry run shows this immediately.",
      "Only testing the example from the question. Always try empty, one element and \"all the same\".",
      "Rewriting the whole solution when one line is wrong — find the first wrong row in your trace instead.",
    ],
    remember: "Hand example → steps in words → variables → code line by line → dry run → edge cases.",
    exercises: [
      {
        q: "The array `[1, 2, 4, 5, 6]` holds the numbers 1 to 6 with exactly one missing. Find it.",
        example: "Output: 3",
        hint: "Steps: the sum of 1..n is n(n+1)/2; subtract the actual sum. Here n is the array length + 1.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int[] a = {1, 2, 4, 5, 6};
                  int n = a.length + 1;
                  long expected = (long) n * (n + 1) / 2;
                  long actual = 0;
                  for (int x : a) actual += x;
                  System.out.println(expected - actual);
              }
          }`,
        python: `
          a = [1, 2, 4, 5, 6]
          n = len(a) + 1
          print(n * (n + 1) // 2 - sum(a))`,
        output: "3",
      },
      {
        q: "Print the \"leaders\" of `[16, 17, 4, 3, 5, 2]`: elements greater than everything to their right, in their original order.",
        example: "Output: 17 5 2",
        hint: "Walk from the right, keeping the max seen so far. A number bigger than that max is a leader. Collect them and reverse at the end.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  int[] a = {16, 17, 4, 3, 5, 2};
                  List<Integer> leaders = new ArrayList<>();
                  int maxRight = Integer.MIN_VALUE;
                  for (int i = a.length - 1; i >= 0; i--) {
                      if (a[i] > maxRight) {
                          leaders.add(a[i]);
                          maxRight = a[i];
                      }
                  }
                  Collections.reverse(leaders);
                  StringBuilder sb = new StringBuilder();
                  for (int x : leaders) sb.append(x).append(' ');
                  System.out.println(sb.toString().trim());
              }
          }`,
        python: `
          a = [16, 17, 4, 3, 5, 2]
          leaders = []
          max_right = float("-inf")
          for x in reversed(a):
              if x > max_right:
                  leaders.append(x)
                  max_right = x
          print(*reversed(leaders))`,
        output: "17 5 2",
      },
    ],
  },

  Recursion: {
    simple: `Recursion is a function that calls itself on a smaller version of the same problem. It needs two parts: a base case — the smallest input, answered directly — and a recursive step that shrinks the problem and trusts the function to solve the smaller one.

    You don't need to trace every call in your head. Write down: "if I already had the answer for n - 1, how would I get the answer for n?" That sentence is your recursive step. Recursion is the foundation for trees, backtracking and dynamic programming, so it's worth getting comfortable here.`,
    analogy: `You're in a long queue and want to know your position. You ask the person in front, "What's your position?" They ask the person in front of them, and so on, until the first person says "I'm 1" (the base case). Each answer comes back one step at a time: "then I'm 2", "then I'm 3"… until it reaches you.`,
    how: {
      steps: [
        "Define the function in words: `sum(arr, i)` = the sum of `arr` from index `i` to the end.",
        "Base case: the smallest input you can answer immediately (`i == arr.length` → 0; `n <= 1` → 1).",
        "Recursive step: express the answer using a smaller call (`arr[i] + sum(arr, i + 1)`).",
        "Check that every call moves toward the base case, otherwise it recurses forever (StackOverflowError / RecursionError).",
        "For arrays and strings, pass an index (or two) instead of slicing — slicing copies on every call.",
      ],
    },
    concepts: [
      { term: "Base case", meaning: "The input where recursion stops and returns directly. Missing it = infinite recursion." },
      { term: "Recursive case", meaning: "The step that calls the function on a smaller input and combines the result." },
      { term: "Call stack", meaning: "Each call waits on the stack for its inner call to return. Depth n uses O(n) memory." },
      { term: "Recursion tree", meaning: "A drawing of which calls each call makes — shows the total work (fib(n) is ~2ⁿ calls)." },
      { term: "Stack overflow", meaning: "Too-deep recursion. Java: `StackOverflowError`; Python: `RecursionError` after ~1000 calls by default." },
      { term: "Helper with index", meaning: "A second function that carries extra parameters like `i` or `l, r`, so the main signature stays simple." },
    ],
    syntax: [
      { task: "Shape of a recursive function", java: "static int f(int n) {\n    if (n <= 1) return 1;\n    return n * f(n - 1);\n}", python: "def f(n):\n    if n <= 1:\n        return 1\n    return n * f(n - 1)" },
      { task: "Recurse over an array", java: "static int sum(int[] a, int i) {\n    if (i == a.length) return 0;\n    return a[i] + sum(a, i + 1);\n}", python: "def total(a, i):\n    if i == len(a):\n        return 0\n    return a[i] + total(a, i + 1)" },
      { task: "Raise the depth limit", java: "// usually not needed; or run in a\n// new Thread with a bigger stack", python: "import sys\nsys.setrecursionlimit(10**6)" },
      { task: "Repeat a string (for tracing)", java: '"  ".repeat(depth)', python: '"  " * depth' },
    ],
    code: [
      {
        title: "Factorial, array sum and palindrome",
        java: `
          public class Main {
              static int factorial(int n) {
                  if (n <= 1) return 1;                 // base case: stop here
                  return n * factorial(n - 1);          // smaller problem: n - 1
              }

              static int sum(int[] arr, int i) {        // sum of arr[i..end]
                  if (i == arr.length) return 0;
                  return arr[i] + sum(arr, i + 1);
              }

              static boolean isPalindrome(String s, int l, int r) {
                  if (l >= r) return true;              // 0 or 1 characters left
                  if (s.charAt(l) != s.charAt(r)) return false;
                  return isPalindrome(s, l + 1, r - 1); // the inside must be a palindrome too
              }

              public static void main(String[] args) {
                  System.out.println(factorial(5));
                  System.out.println(sum(new int[]{4, 1, 7}, 0));
                  String w = "level";
                  System.out.println(isPalindrome(w, 0, w.length() - 1) ? "palindrome" : "not palindrome");
              }
          }`,
        python: `
          def factorial(n):
              if n <= 1:                    # base case: stop here
                  return 1
              return n * factorial(n - 1)   # smaller problem: n - 1

          def total(arr, i):                # sum of arr[i..end]
              if i == len(arr):
                  return 0
              return arr[i] + total(arr, i + 1)

          def is_palindrome(s, l, r):
              if l >= r:                    # 0 or 1 characters left
                  return True
              if s[l] != s[r]:
                  return False
              return is_palindrome(s, l + 1, r - 1)

          print(factorial(5))
          print(total([4, 1, 7], 0))
          w = "level"
          print("palindrome" if is_palindrome(w, 0, len(w) - 1) else "not palindrome")`,
        output: `
          120
          12
          palindrome`,
      },
      {
        title: "Seeing the recursion tree",
        note: "Printing each call indented by its depth shows the tree. Notice `fib(2)` is computed twice — dynamic programming fixes that later.",
        java: `
          public class Main {
              static int fib(int n, int depth) {
                  System.out.println("  ".repeat(depth) + "fib(" + n + ")");
                  if (n < 2) return n;
                  return fib(n - 1, depth + 1) + fib(n - 2, depth + 1);
              }

              public static void main(String[] args) {
                  System.out.println("= " + fib(4, 0));
              }
          }`,
        python: `
          def fib(n, depth):
              print("  " * depth + f"fib({n})")
              if n < 2:
                  return n
              return fib(n - 1, depth + 1) + fib(n - 2, depth + 1)

          print("=", fib(4, 0))`,
        output: `
          fib(4)
            fib(3)
              fib(2)
                fib(1)
                fib(0)
              fib(1)
            fib(2)
              fib(1)
              fib(0)
          = 3`,
      },
    ],
    mistakes: [
      "No base case, or a base case that's never reached (e.g. `n == 0` when `n` jumps by 2 from an odd number).",
      "Forgetting to `return` the recursive result: writing `isPalindrome(s, l + 1, r - 1);` without `return`.",
      "Python: recursing 10⁴+ deep and hitting `RecursionError` — raise the limit with `sys.setrecursionlimit` or switch to a loop.",
      "Slicing (`s[1:]`, `Arrays.copyOfRange`) in every call — that's O(n) extra work per call. Pass indexes.",
      "Trying to trace every call mentally — trust the function on the smaller input instead.",
    ],
    remember: "Base case first, then \"if I had the answer for the smaller input, how do I build this one?\"",
    exercises: [
      {
        q: "Write a fast recursive `power(x, n)` that uses `x^n = (x^(n/2))²`. Print `power(2, 10)` and `power(3, 5)`.",
        example: `
          Output: 1024
                  243`,
        hint: "Base case `n == 0` → 1. Compute `half = power(x, n / 2)` once; return `half * half`, times `x` again if `n` is odd. That's O(log n).",
        java: `
          public class Main {
              static long power(long x, int n) {
                  if (n == 0) return 1;
                  long half = power(x, n / 2);
                  return n % 2 == 0 ? half * half : half * half * x;
              }

              public static void main(String[] args) {
                  System.out.println(power(2, 10));
                  System.out.println(power(3, 5));
              }
          }`,
        python: `
          def power(x, n):
              if n == 0:
                  return 1
              half = power(x, n // 2)
              return half * half if n % 2 == 0 else half * half * x

          print(power(2, 10))
          print(power(3, 5))`,
        output: `
          1024
          243`,
      },
      {
        q: "Reverse the string `\"hello\"` recursively.",
        example: "Output: olleh",
        hint: "The reverse of a string is: the reverse of everything after the first character, followed by the first character.",
        java: `
          public class Main {
              static String reverse(String s, int i) {
                  if (i == s.length()) return "";
                  return reverse(s, i + 1) + s.charAt(i);
              }

              public static void main(String[] args) {
                  System.out.println(reverse("hello", 0));
              }
          }`,
        python: `
          def reverse(s, i):
              if i == len(s):
                  return ""
              return reverse(s, i + 1) + s[i]

          print(reverse("hello", 0))`,
        output: "olleh",
      },
    ],
  },

  "Time & space complexity of your code": {
    simple: `Big-O describes how your code's running time grows as the input grows. You don't need maths for it — mostly you count loops: one loop over n items is O(n), a loop inside a loop is O(n²), and a loop that halves (or doubles) each round is O(log n).

    Use it before you code: read the constraint on n in the question, and it tells you roughly which complexity will pass. A judge runs around 10⁸ simple operations per second, so n = 10⁵ rules out O(n²) (10¹⁰ steps), while O(n log n) is fine.`,
    analogy: `Finding a friend's name in a phone book. Reading every page from the start is O(n). Opening the middle and jumping to the half the name must be in, again and again, is O(log n) — a 1,000-page book takes about 10 jumps. Comparing every name with every other name to find duplicates is O(n²) — a million comparisons.`,
    how: {
      steps: [
        "Find the loops. A single loop over the input is O(n); nested loops over the input multiply: O(n × m).",
        "A loop variable that doubles or halves (`i *= 2`, `n /= 2`, binary search) gives O(log n).",
        "Add up phases that run one after another and keep the biggest: sort (n log n) + one scan (n) = O(n log n).",
        "Count hidden loops: `list.contains`, `list.remove`, `indexOf`, slicing and string `+=` are O(n) each.",
        "Space: count the extra memory you create — a map of n items is O(n); recursion depth counts too.",
      ],
    },
    concepts: [
      { term: "O(1)", meaning: "Constant: array index, map lookup, push/pop." },
      { term: "O(log n)", meaning: "Halving each step: binary search, heap push/pop, balanced-tree operations." },
      { term: "O(n)", meaning: "One pass over the input." },
      { term: "O(n log n)", meaning: "Sorting, or n heap operations." },
      { term: "O(n²)", meaning: "Every pair: nested loops over the same array." },
      { term: "O(2ⁿ) / O(n!)", meaning: "All subsets / all permutations — only possible for n up to ~20 / ~10." },
    ],
    compare: {
      head: ["If n is up to…", "Aim for", "Typical approach"],
      rows: [
        ["10", "O(n!)", "Try all permutations"],
        ["20", "O(2ⁿ)", "All subsets / backtracking"],
        ["500", "O(n³)", "Three nested loops, interval DP"],
        ["5,000", "O(n²)", "Nested loops, 2D DP"],
        ["10⁶", "O(n log n)", "Sorting, heap, binary search"],
        ["10⁸", "O(n)", "One pass, two pointers, prefix sums"],
        ["More than 10⁸", "O(log n) or O(1)", "Maths formula, binary search on the answer"],
      ],
    },
    syntax: [
      { task: "O(n) membership test — avoid in loops", java: "list.contains(x)", python: "x in some_list" },
      { task: "O(1) membership test", java: "set.contains(x)", python: "x in some_set" },
      { task: "O(n) remove from front", java: "arrayList.remove(0)", python: "lst.pop(0)" },
      { task: "O(1) remove from front", java: "deque.pollFirst()", python: "dq.popleft()" },
      { task: "O(n) copy (hidden)", java: "s.substring(i)\nArrays.copyOfRange(a, i, j)", python: "s[i:]\na[i:j]" },
      { task: "O(n²) string building", java: "res += ch;  // in a loop", python: "res += ch  # in a loop" },
    ],
    code: [
      {
        title: "Counting the steps of different loops",
        note: "Same n = 1000, very different amounts of work.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int n = 1000;
                  long ops = 0;
                  for (int i = 0; i < n; i++) ops++;                          // O(n)
                  System.out.println("single loop:   " + ops);

                  ops = 0;
                  for (int i = 0; i < n; i++)
                      for (int j = 0; j < n; j++) ops++;                      // O(n^2)
                  System.out.println("nested loop:   " + ops);

                  ops = 0;
                  for (int i = 1; i < n; i *= 2) ops++;                       // O(log n): i doubles
                  System.out.println("doubling loop: " + ops);

                  ops = 0;
                  for (int i = 0; i < n; i++)
                      for (int j = i + 1; j < n; j++) ops++;                  // n(n-1)/2: still O(n^2)
                  System.out.println("pairs loop:    " + ops);
              }
          }`,
        python: `
          n = 1000
          ops = 0
          for i in range(n):                 # O(n)
              ops += 1
          print("single loop:  ", ops)

          ops = 0
          for i in range(n):                 # O(n^2)
              for j in range(n):
                  ops += 1
          print("nested loop:  ", ops)

          ops = 0
          i = 1
          while i < n:                       # O(log n): i doubles
              ops += 1
              i *= 2
          print("doubling loop:", ops)

          ops = 0
          for i in range(n):                 # n(n-1)/2: still O(n^2)
              for j in range(i + 1, n):
                  ops += 1
          print("pairs loop:   ", ops)`,
        output: `
          single loop:   1000
          nested loop:   1000000
          doubling loop: 10
          pairs loop:    499500`,
      },
    ],
    mistakes: [
      "Calling `list.contains` / `x in list` inside a loop — that's O(n²). Put the items in a set first.",
      "Thinking two separate loops one after the other make O(n²) — it's O(n + n) = O(n).",
      "Ignoring the cost of sorting — O(n log n) — when describing a solution.",
      "Forgetting recursion depth in space complexity: a recursive DFS on a path of n nodes uses O(n) stack.",
      "Writing an O(n²) solution without checking the constraints — n = 10⁵ will time out.",
    ],
    remember: "Read n in the constraints first: it tells you which Big-O will pass before you write a line.",
    exercises: [
      {
        q: "Count the pairs in `[1, 5, 7, -1, 5]` whose sum is 6 — in O(n), not with two nested loops.",
        example: "Output: 3   (pairs: 1+5, 1+5, 7+(-1))",
        hint: "Walk once. Before adding `x` to a count map, add `count[6 - x]` to the answer — that's how many earlier numbers pair with `x`.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  int[] a = {1, 5, 7, -1, 5};
                  int k = 6, pairs = 0;
                  Map<Integer, Integer> count = new HashMap<>();
                  for (int x : a) {
                      pairs += count.getOrDefault(k - x, 0);
                      count.put(x, count.getOrDefault(x, 0) + 1);
                  }
                  System.out.println(pairs);
              }
          }`,
        python: `
          a, k = [1, 5, 7, -1, 5], 6
          count = {}
          pairs = 0
          for x in a:
              pairs += count.get(k - x, 0)
              count[x] = count.get(x, 0) + 1
          print(pairs)`,
        output: "3",
      },
      {
        q: "Find the maximum sum of a contiguous subarray of `[-2, 1, -3, 4, -1, 2, 1, -5, 4]` in O(n) (Kadane's algorithm).",
        example: "Output: 6   (subarray [4, -1, 2, 1])",
        hint: "At each number, the best subarray ending here is either the number alone or the number added to the best one ending just before.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int[] a = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
                  int cur = a[0], best = a[0];
                  for (int i = 1; i < a.length; i++) {
                      cur = Math.max(a[i], cur + a[i]);
                      best = Math.max(best, cur);
                  }
                  System.out.println(best);
              }
          }`,
        python: `
          a = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
          cur = best = a[0]
          for x in a[1:]:
              cur = max(x, cur + x)
              best = max(best, cur)
          print(best)`,
        output: "6",
      },
    ],
  },
};
