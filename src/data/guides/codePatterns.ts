import type { TopicGuide } from "./index";

// Programming track, part 2: a code template for each DSA pattern, plus debugging.
// Keyed by topic title (see src/data/topics.ts). Every program is complete and runnable; `output` is what it prints.
export const CODE_PATTERN_GUIDES: Record<string, TopicGuide> = {
  "Two pointers": {
    simple: `Two pointers means using two indexes that move through the array in a planned way, instead of checking every pair with a nested loop. It turns many O(n²) ideas into O(n).

    There are two common shapes. Opposite ends: one pointer at the start and one at the end, moving toward each other — great on sorted arrays (pair sums, palindromes, container with most water). Same direction: a slow "write" pointer and a fast "read" pointer — great for removing or compacting elements in place.`,
    analogy: `Two people searching a bookshelf for two books whose prices add up to ₹500. One starts at the cheap end, one at the expensive end. Too expensive together? The expensive side steps down. Too cheap? The cheap side steps up. They never need to try every pair.`,
    how: {
      steps: [
        "Opposite ends: set `l = 0`, `r = n - 1` and loop `while (l < r)`.",
        "Look at `a[l]` and `a[r]` together and decide which pointer to move — the one that can only make things worse if left where it is.",
        "Same direction: `write = 0`; for each `read` index, if `a[read]` should be kept, copy it to `a[write]` and do `write++`.",
        "Each pointer moves only forward (or only inward), so the total work is O(n).",
        "For problems like 3Sum, sort first, fix one element in an outer loop and run two pointers on the rest — and skip duplicates.",
      ],
    },
    concepts: [
      { term: "Opposite-ends pointers", meaning: "`l` from the left, `r` from the right, moving inward. Needs sorted data or a symmetric check." },
      { term: "Read / write pointers", meaning: "`read` scans every element; `write` marks where the next kept element goes." },
      { term: "l < r vs l <= r", meaning: "`l < r` when you compare two different elements; `l <= r` when one element on its own still matters." },
      { term: "Why it's correct", meaning: "Every move throws away options that can't be part of the answer — say which ones out loud in interviews." },
      { term: "In place", meaning: "Changing the input array instead of building a new one: O(1) extra space." },
    ],
    syntax: [
      { task: "Opposite ends loop", java: "int l = 0, r = n - 1;\nwhile (l < r) { ... }", python: "l, r = 0, len(a) - 1\nwhile l < r:\n    ..." },
      { task: "Move inward", java: "l++;  r--;", python: "l += 1; r -= 1" },
      { task: "Swap", java: "int t = a[l]; a[l] = a[r]; a[r] = t;", python: "a[l], a[r] = a[r], a[l]" },
      { task: "Skip duplicates", java: "while (l < r && a[l] == a[l + 1]) l++;", python: "while l < r and a[l] == a[l + 1]:\n    l += 1" },
      { task: "Read / write", java: "int w = 0;\nfor (int x : a) if (keep(x)) a[w++] = x;", python: "w = 0\nfor x in a:\n    if keep(x):\n        a[w] = x; w += 1" },
    ],
    code: [
      {
        title: "Pair with a given sum in a sorted array",
        note: "Sum too small → the left value is too small for any partner, move `l` right. Sum too big → move `r` left.",
        java: `
          import java.util.Arrays;

          public class Main {
              static int[] pairSum(int[] a, int target) {
                  int l = 0, r = a.length - 1;
                  while (l < r) {
                      int sum = a[l] + a[r];
                      if (sum == target) return new int[]{l, r};
                      if (sum < target) l++;      // need a bigger sum
                      else r--;                   // need a smaller sum
                  }
                  return new int[]{-1, -1};
              }

              public static void main(String[] args) {
                  System.out.println(Arrays.toString(pairSum(new int[]{1, 2, 3, 4, 6}, 6)));
                  System.out.println(Arrays.toString(pairSum(new int[]{1, 2, 3}, 10)));
              }
          }`,
        python: `
          def pair_sum(a, target):
              l, r = 0, len(a) - 1
              while l < r:
                  s = a[l] + a[r]
                  if s == target:
                      return [l, r]
                  if s < target:
                      l += 1          # need a bigger sum
                  else:
                      r -= 1          # need a smaller sum
              return [-1, -1]

          print(pair_sum([1, 2, 3, 4, 6], 6))
          print(pair_sum([1, 2, 3], 10))`,
        output: `
          [1, 3]
          [-1, -1]`,
      },
      {
        title: "Same direction: move zeroes, remove duplicates",
        java: `
          import java.util.Arrays;

          public class Main {
              static void moveZeroes(int[] a) {
                  int write = 0;
                  for (int read = 0; read < a.length; read++) {
                      if (a[read] != 0) a[write++] = a[read];    // keep non-zeros, in order
                  }
                  while (write < a.length) a[write++] = 0;       // fill the rest with zeros
              }

              static int removeDuplicates(int[] a) {             // a is sorted
                  if (a.length == 0) return 0;
                  int write = 1;
                  for (int read = 1; read < a.length; read++) {
                      if (a[read] != a[write - 1]) a[write++] = a[read];
                  }
                  return write;                                  // new length
              }

              public static void main(String[] args) {
                  int[] a = {0, 1, 0, 3, 12};
                  moveZeroes(a);
                  System.out.println(Arrays.toString(a));

                  int[] b = {1, 1, 2, 2, 3};
                  int k = removeDuplicates(b);
                  System.out.println(k + " " + Arrays.toString(Arrays.copyOf(b, k)));
              }
          }`,
        python: `
          def move_zeroes(a):
              write = 0
              for read in range(len(a)):
                  if a[read] != 0:            # keep non-zeros, in order
                      a[write] = a[read]
                      write += 1
              for i in range(write, len(a)):  # fill the rest with zeros
                  a[i] = 0

          def remove_duplicates(a):           # a is sorted
              if not a:
                  return 0
              write = 1
              for read in range(1, len(a)):
                  if a[read] != a[write - 1]:
                      a[write] = a[read]
                      write += 1
              return write                    # new length

          a = [0, 1, 0, 3, 12]
          move_zeroes(a)
          print(a)

          b = [1, 1, 2, 2, 3]
          k = remove_duplicates(b)
          print(k, b[:k])`,
        output: `
          [1, 3, 12, 0, 0]
          3 [1, 2, 3]`,
      },
    ],
    mistakes: [
      "Using opposite-ends pointers on an unsorted array for a pair sum — sort first, or use a hash map.",
      "Moving both pointers when only one should move, skipping valid answers.",
      "3Sum: forgetting to skip duplicates for the fixed element *and* for `l` / `r`, so the same triplet appears twice.",
      "Reading `a[l + 1]` while skipping duplicates without checking `l < r` first — index out of range.",
    ],
    remember: "Sorted or symmetric? Start at both ends. Removing in place? Read pointer scans, write pointer keeps.",
    exercises: [
      {
        q: "3Sum: find all unique triplets in `[-1, 0, 1, 2, -1, -4]` that add up to 0.",
        example: "Output: [[-1, -1, 2], [-1, 0, 1]]",
        hint: "Sort. For each `i`, run two pointers on `i+1 .. n-1` looking for `-a[i]`. Skip `i` if `a[i] == a[i-1]`, and skip equal neighbours after a match.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  int[] a = {-1, 0, 1, 2, -1, -4};
                  Arrays.sort(a);
                  List<List<Integer>> res = new ArrayList<>();
                  for (int i = 0; i < a.length - 2; i++) {
                      if (i > 0 && a[i] == a[i - 1]) continue;       // same fixed value as before
                      int l = i + 1, r = a.length - 1;
                      while (l < r) {
                          int sum = a[i] + a[l] + a[r];
                          if (sum == 0) {
                              res.add(List.of(a[i], a[l], a[r]));
                              while (l < r && a[l] == a[l + 1]) l++;
                              while (l < r && a[r] == a[r - 1]) r--;
                              l++;
                              r--;
                          } else if (sum < 0) l++;
                          else r--;
                      }
                  }
                  System.out.println(res);
              }
          }`,
        python: `
          a = sorted([-1, 0, 1, 2, -1, -4])
          res = []
          for i in range(len(a) - 2):
              if i > 0 and a[i] == a[i - 1]:        # same fixed value as before
                  continue
              l, r = i + 1, len(a) - 1
              while l < r:
                  s = a[i] + a[l] + a[r]
                  if s == 0:
                      res.append([a[i], a[l], a[r]])
                      while l < r and a[l] == a[l + 1]:
                          l += 1
                      while l < r and a[r] == a[r - 1]:
                          r -= 1
                      l += 1
                      r -= 1
                  elif s < 0:
                      l += 1
                  else:
                      r -= 1
          print(res)`,
        output: "[[-1, -1, 2], [-1, 0, 1]]",
      },
      {
        q: "Container with most water: heights `[1, 8, 6, 2, 5, 4, 8, 3, 7]`. Pick two lines that hold the most water (width × shorter height).",
        example: "Output: 49",
        hint: "Start at both ends. The shorter line limits the area, so moving the taller one can never help — always move the shorter one.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int[] h = {1, 8, 6, 2, 5, 4, 8, 3, 7};
                  int l = 0, r = h.length - 1, best = 0;
                  while (l < r) {
                      best = Math.max(best, (r - l) * Math.min(h[l], h[r]));
                      if (h[l] < h[r]) l++;
                      else r--;
                  }
                  System.out.println(best);
              }
          }`,
        python: `
          h = [1, 8, 6, 2, 5, 4, 8, 3, 7]
          l, r, best = 0, len(h) - 1, 0
          while l < r:
              best = max(best, (r - l) * min(h[l], h[r]))
              if h[l] < h[r]:
                  l += 1
              else:
                  r -= 1
          print(best)`,
        output: "49",
      },
    ],
  },

  "Sliding window": {
    simple: `A sliding window is a range of the array, from index left to index right, that you slide forward instead of recomputing from scratch. Use it for questions about contiguous subarrays or substrings: "longest", "shortest", "maximum sum of size k", "at most k distinct".

    Fixed-size window: add the element entering on the right, remove the one leaving on the left. Variable-size window: always grow on the right; while the window breaks the rule, shrink from the left. Each element enters and leaves at most once, so it's O(n).`,
    analogy: `Looking at a long train through a window that shows exactly three coaches. As the train moves, one coach enters on one side and one leaves on the other — you don't need to look at all three again, just update for the one that came in and the one that went out.`,
    how: {
      steps: [
        "Set `left = 0` and the window state (a sum, or a count map) to empty.",
        "Loop `right` from 0 to n - 1 and add `a[right]` to the state.",
        "Fixed size k: once `right - left + 1 > k`, remove `a[left]` and `left++`.",
        "Variable size: `while` the window is invalid (sum too big, a repeated character…), remove `a[left]` and `left++`.",
        "Update the answer when the window is valid — for \"longest\" after shrinking, for \"shortest\" inside the shrink loop.",
      ],
    },
    concepts: [
      { term: "Window", meaning: "The current subarray `a[left..right]`; its length is `right - left + 1`." },
      { term: "Window state", meaning: "What you need to know about the window without rescanning it: a running sum, or a map of counts." },
      { term: "Expand / shrink", meaning: "`right++` adds one element; `left++` removes one. Each happens at most n times in total." },
      { term: "Valid window", meaning: "The window meets the condition (sum ≥ target, no repeats, at most k zeros…)." },
      { term: "When not to use it", meaning: "If elements can be negative and you need \"sum = k\", the window can't tell when to shrink — use prefix sums." },
    ],
    syntax: [
      { task: "Template", java: "int left = 0;\nfor (int right = 0; right < n; right++) {\n    add(a[right]);\n    while (invalid()) remove(a[left++]);\n    best = Math.max(best, right - left + 1);\n}", python: "left = 0\nfor right in range(n):\n    add(a[right])\n    while invalid():\n        remove(a[left]); left += 1\n    best = max(best, right - left + 1)" },
      { task: "Window length", java: "right - left + 1", python: "right - left + 1" },
      { task: "Count in window", java: "cnt.merge(ch, 1, Integer::sum);", python: "cnt[ch] = cnt.get(ch, 0) + 1" },
      { task: "Remove from count", java: "cnt.merge(ch, -1, Integer::sum);\nif (cnt.get(ch) == 0) cnt.remove(ch);", python: "cnt[ch] -= 1\nif cnt[ch] == 0: del cnt[ch]" },
    ],
    code: [
      {
        title: "Fixed window: maximum sum of k consecutive elements",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int[] a = {2, 1, 5, 1, 3, 2};
                  int k = 3, sum = 0, best = Integer.MIN_VALUE;
                  for (int right = 0; right < a.length; right++) {
                      sum += a[right];                     // element entering
                      if (right >= k) sum -= a[right - k]; // element leaving
                      if (right >= k - 1) best = Math.max(best, sum);
                  }
                  System.out.println(best);
              }
          }`,
        python: `
          a, k = [2, 1, 5, 1, 3, 2], 3
          s, best = 0, float("-inf")
          for right in range(len(a)):
              s += a[right]                 # element entering
              if right >= k:
                  s -= a[right - k]         # element leaving
              if right >= k - 1:
                  best = max(best, s)
          print(best)`,
        output: "9",
      },
      {
        title: "Variable window: longest substring without repeating characters",
        note: "Grow on the right. While the new character is already in the window, shrink from the left.",
        java: `
          import java.util.*;

          public class Main {
              static int longest(String s) {
                  Set<Character> window = new HashSet<>();
                  int left = 0, best = 0;
                  for (int right = 0; right < s.length(); right++) {
                      char ch = s.charAt(right);
                      while (window.contains(ch)) {         // invalid: ch repeats
                          window.remove(s.charAt(left));
                          left++;
                      }
                      window.add(ch);
                      best = Math.max(best, right - left + 1);
                  }
                  return best;
              }

              public static void main(String[] args) {
                  for (String s : new String[]{"abcabcbb", "bbbbb", "pwwkew"}) System.out.println(longest(s));
              }
          }`,
        python: `
          def longest(s):
              window = set()
              left = best = 0
              for right, ch in enumerate(s):
                  while ch in window:           # invalid: ch repeats
                      window.remove(s[left])
                      left += 1
                  window.add(ch)
                  best = max(best, right - left + 1)
              return best

          for s in ["abcabcbb", "bbbbb", "pwwkew"]:
              print(longest(s))`,
        output: `
          3
          1
          3`,
      },
      {
        title: "Shortest window: minimum length with sum ≥ target",
        note: "For \"shortest\", update the answer inside the shrink loop — every time the window is still valid.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int[] a = {2, 3, 1, 2, 4, 3};
                  int target = 7, left = 0, sum = 0, best = Integer.MAX_VALUE;
                  for (int right = 0; right < a.length; right++) {
                      sum += a[right];
                      while (sum >= target) {
                          best = Math.min(best, right - left + 1);
                          sum -= a[left++];
                      }
                  }
                  System.out.println(best == Integer.MAX_VALUE ? 0 : best);
              }
          }`,
        python: `
          a, target = [2, 3, 1, 2, 4, 3], 7
          left = s = 0
          best = float("inf")
          for right in range(len(a)):
              s += a[right]
              while s >= target:
                  best = min(best, right - left + 1)
                  s -= a[left]
                  left += 1
          print(0 if best == float("inf") else best)`,
        output: "2",
      },
    ],
    mistakes: [
      "Using `if` instead of `while` to shrink — the window may need to drop several elements at once.",
      "Updating the answer before the window is valid again.",
      "Off-by-one in the window length — it's `right - left + 1`.",
      "Using a sliding window for \"subarray sum = k\" with negative numbers — use prefix sums + a map.",
      "Forgetting to delete zero counts from the map when you track \"number of distinct\" with `map.size()`.",
    ],
    remember: "Grow with right, shrink with left while invalid, update the answer — each element enters and leaves once.",
    exercises: [
      {
        q: "Count the distinct numbers in every window of size 4 of `[1, 2, 1, 3, 4, 2, 3]`.",
        example: "Output: [3, 4, 4, 3]",
        hint: "Keep a count map for the window. When an element leaves and its count drops to 0, remove the key; the answer is the map's size.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  int[] a = {1, 2, 1, 3, 4, 2, 3};
                  int k = 4;
                  Map<Integer, Integer> cnt = new HashMap<>();
                  List<Integer> res = new ArrayList<>();
                  for (int right = 0; right < a.length; right++) {
                      cnt.merge(a[right], 1, Integer::sum);
                      if (right >= k) {
                          int out = a[right - k];
                          cnt.merge(out, -1, Integer::sum);
                          if (cnt.get(out) == 0) cnt.remove(out);
                      }
                      if (right >= k - 1) res.add(cnt.size());
                  }
                  System.out.println(res);
              }
          }`,
        python: `
          a, k = [1, 2, 1, 3, 4, 2, 3], 4
          cnt, res = {}, []
          for right in range(len(a)):
              cnt[a[right]] = cnt.get(a[right], 0) + 1
              if right >= k:
                  out = a[right - k]
                  cnt[out] -= 1
                  if cnt[out] == 0:
                      del cnt[out]
              if right >= k - 1:
                  res.append(len(cnt))
          print(res)`,
        output: "[3, 4, 4, 3]",
      },
      {
        q: "Longest run of 1s if you may flip at most `k = 2` zeros: `[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0]`.",
        example: "Output: 6",
        hint: "Rephrase: the longest window containing at most k zeros. Count zeros in the window; shrink while there are more than k.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int[] a = {1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0};
                  int k = 2, left = 0, zeros = 0, best = 0;
                  for (int right = 0; right < a.length; right++) {
                      if (a[right] == 0) zeros++;
                      while (zeros > k) {
                          if (a[left] == 0) zeros--;
                          left++;
                      }
                      best = Math.max(best, right - left + 1);
                  }
                  System.out.println(best);
              }
          }`,
        python: `
          a, k = [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2
          left = zeros = best = 0
          for right, x in enumerate(a):
              if x == 0:
                  zeros += 1
              while zeros > k:
                  if a[left] == 0:
                      zeros -= 1
                  left += 1
              best = max(best, right - left + 1)
          print(best)`,
        output: "6",
      },
    ],
  },

  "Prefix sums & hashing": {
    simple: `A prefix sum array stores, at each position, the total of everything before it. With it, the sum of any range a[i..j] is just prefix[j + 1] - prefix[i] — one subtraction instead of a loop.

    Combine that with a hash map and you can count subarrays with a given sum in one pass: as you walk, keep a running sum; a subarray ending here sums to k exactly when an earlier running sum equals (running - k). Unlike a sliding window, this works with negative numbers too.`,
    analogy: `A car's odometer. To know how far you drove between Pune and Mumbai you don't re-measure the road — you subtract the odometer reading at Pune from the reading at Mumbai. The prefix array is a list of odometer readings.`,
    how: {
      steps: [
        "Build `prefix` of size `n + 1` with `prefix[0] = 0` and `prefix[i + 1] = prefix[i] + a[i]`.",
        "Range sum of `a[l..r]` (both included) = `prefix[r + 1] - prefix[l]`.",
        "For \"count subarrays with sum k\": keep `running` and a map `seen[sum] = how many times`.",
        "Seed the map with `{0: 1}` so subarrays that start at index 0 are counted.",
        "At each element: `running += x`; `answer += seen[running - k]`; then `seen[running]++`.",
      ],
    },
    concepts: [
      { term: "Prefix sum", meaning: "`prefix[i]` = sum of the first `i` elements. The extra leading 0 removes special cases." },
      { term: "Range query in O(1)", meaning: "After an O(n) build, every range sum is one subtraction." },
      { term: "Running sum + map", meaning: "Counts subarrays with a target sum in O(n), negatives included." },
      { term: "Seed {0: 1}", meaning: "Pretends there's an empty prefix with sum 0 before the array starts." },
      { term: "Remainders", meaning: "For \"sum divisible by k\", store `running % k` — and make negative remainders positive first." },
    ],
    syntax: [
      { task: "Build prefix", java: "long[] p = new long[n + 1];\nfor (int i = 0; i < n; i++) p[i + 1] = p[i] + a[i];", python: "p = [0] * (n + 1)\nfor i in range(n):\n    p[i + 1] = p[i] + a[i]" },
      { task: "Shortcut in Python", java: "", python: "from itertools import accumulate\np = [0] + list(accumulate(a))" },
      { task: "Sum of a[l..r]", java: "p[r + 1] - p[l]", python: "p[r + 1] - p[l]" },
      { task: "Seeded count map", java: "Map<Integer, Integer> seen = new HashMap<>();\nseen.put(0, 1);", python: "seen = {0: 1}" },
      { task: "Non-negative mod", java: "((x % k) + k) % k", python: "x % k  # already non-negative" },
    ],
    code: [
      {
        title: "Range sums in O(1)",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int[] a = {3, 1, 4, 1, 5, 9};
                  int n = a.length;
                  long[] prefix = new long[n + 1];                 // prefix[0] = 0
                  for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + a[i];

                  int[][] queries = {{0, 2}, {2, 5}, {1, 1}};      // sum of a[l..r]
                  for (int[] q : queries) {
                      System.out.println(q[0] + ".." + q[1] + " -> " + (prefix[q[1] + 1] - prefix[q[0]]));
                  }
              }
          }`,
        python: `
          a = [3, 1, 4, 1, 5, 9]
          n = len(a)
          prefix = [0] * (n + 1)                   # prefix[0] = 0
          for i in range(n):
              prefix[i + 1] = prefix[i] + a[i]

          for l, r in [(0, 2), (2, 5), (1, 1)]:   # sum of a[l..r]
              print(f"{l}..{r} -> {prefix[r + 1] - prefix[l]}")`,
        output: `
          0..2 -> 8
          2..5 -> 19
          1..1 -> 1`,
      },
      {
        title: "Count subarrays whose sum is k",
        java: `
          import java.util.*;

          public class Main {
              static int subarraySum(int[] nums, int k) {
                  Map<Integer, Integer> seen = new HashMap<>();
                  seen.put(0, 1);                         // the empty prefix
                  int running = 0, count = 0;
                  for (int x : nums) {
                      running += x;
                      count += seen.getOrDefault(running - k, 0);   // earlier prefixes that leave exactly k
                      seen.put(running, seen.getOrDefault(running, 0) + 1);
                  }
                  return count;
              }

              public static void main(String[] args) {
                  System.out.println(subarraySum(new int[]{1, 1, 1}, 2));
                  System.out.println(subarraySum(new int[]{1, 2, 3}, 3));
                  System.out.println(subarraySum(new int[]{3, -1, 1, 2}, 3));
              }
          }`,
        python: `
          def subarray_sum(nums, k):
              seen = {0: 1}                           # the empty prefix
              running = count = 0
              for x in nums:
                  running += x
                  count += seen.get(running - k, 0)   # earlier prefixes that leave exactly k
                  seen[running] = seen.get(running, 0) + 1
              return count

          print(subarray_sum([1, 1, 1], 2))
          print(subarray_sum([1, 2, 3], 3))
          print(subarray_sum([3, -1, 1, 2], 3))`,
        output: `
          2
          2
          3`,
      },
    ],
    mistakes: [
      "Making the prefix array size `n` instead of `n + 1` and then special-casing `l = 0`.",
      "Forgetting to seed the map with `0 → 1`, which misses subarrays starting at index 0.",
      "Updating the map before reading it — that can count an empty subarray when `k = 0`.",
      "Java: `-7 % 5` is `-2`. For remainder keys, use `((x % k) + k) % k`.",
      "Using `int` for prefix sums of large values — use `long` in Java.",
    ],
    remember: "Range sum = prefix[r + 1] − prefix[l]; subarrays summing to k = how many earlier prefixes equal running − k.",
    exercises: [
      {
        q: "Find the pivot index of `[1, 7, 3, 6, 5, 6]`: the first index where the sum of the left side equals the sum of the right side.",
        example: "Output: 3   (1 + 7 + 3 = 11 = 5 + 6)",
        hint: "Compute the total once. Walk with `leftSum`; the right side is `total - leftSum - a[i]`.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int[] a = {1, 7, 3, 6, 5, 6};
                  int total = 0;
                  for (int x : a) total += x;
                  int left = 0, ans = -1;
                  for (int i = 0; i < a.length; i++) {
                      if (left == total - left - a[i]) {
                          ans = i;
                          break;
                      }
                      left += a[i];
                  }
                  System.out.println(ans);
              }
          }`,
        python: `
          a = [1, 7, 3, 6, 5, 6]
          total, left, ans = sum(a), 0, -1
          for i, x in enumerate(a):
              if left == total - left - x:
                  ans = i
                  break
              left += x
          print(ans)`,
        output: "3",
      },
      {
        q: "Count the subarrays of `[4, 5, 0, -2, -3, 1]` whose sum is divisible by 5.",
        example: "Output: 7",
        hint: "Two prefixes with the same remainder mod 5 enclose a subarray divisible by 5. Count remainders in a map seeded with `0 → 1`. In Java, fix negative remainders.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  int[] a = {4, 5, 0, -2, -3, 1};
                  int k = 5, running = 0, count = 0;
                  Map<Integer, Integer> seen = new HashMap<>();
                  seen.put(0, 1);
                  for (int x : a) {
                      running += x;
                      int rem = ((running % k) + k) % k;    // keep it in 0..k-1
                      count += seen.getOrDefault(rem, 0);
                      seen.put(rem, seen.getOrDefault(rem, 0) + 1);
                  }
                  System.out.println(count);
              }
          }`,
        python: `
          a, k = [4, 5, 0, -2, -3, 1], 5
          seen = {0: 1}
          running = count = 0
          for x in a:
              running += x
              rem = running % k            # Python's % is already 0..k-1
              count += seen.get(rem, 0)
              seen[rem] = seen.get(rem, 0) + 1
          print(count)`,
        output: "7",
      },
    ],
  },

  "Binary search": {
    simple: `Binary search finds a target in a sorted array by checking the middle and throwing away the half that can't contain it. Each step halves the search space, so a million elements take about 20 steps: O(log n).

    The idea is easy; the code is where people slip — the loop condition, how to move lo and hi, and avoiding an infinite loop. Learn one template exactly, and the variant for "first position where the condition becomes true". That second form also solves "binary search on the answer": the smallest speed, capacity or time that works.`,
    analogy: `Guessing a number between 1 and 100 when you're told "higher" or "lower". You'd guess 50, then 25 or 75, and so on — never 1, 2, 3… Seven guesses are always enough.`,
    how: {
      steps: [
        "Set `lo = 0`, `hi = n - 1` and loop `while (lo <= hi)`.",
        "Compute `mid = lo + (hi - lo) / 2` (Java, avoids overflow) or `mid = (lo + hi) // 2` (Python).",
        "Found it? Return `mid`. Middle too small? `lo = mid + 1`. Too big? `hi = mid - 1`.",
        "For the first position where something is true: when `check(mid)` is true, save `ans = mid` and go left (`hi = mid - 1`); otherwise go right.",
        "On the answer: search over possible answers (e.g. speeds 1..max), with `check(x)` = \"does x work?\" — it must be false…false, true…true.",
      ],
    },
    concepts: [
      { term: "Sorted / monotonic", meaning: "Binary search needs data (or a yes/no check) that changes direction only once." },
      { term: "mid without overflow", meaning: "`lo + (hi - lo) / 2` — `(lo + hi) / 2` can overflow an int in Java." },
      { term: "Lower bound", meaning: "The first index whose value is ≥ target — where the target is, or would be inserted." },
      { term: "Search on the answer", meaning: "Binary search over possible answers, using a feasibility check instead of an array." },
      { term: "Library helpers", meaning: "`Arrays.binarySearch` in Java; `bisect_left` / `bisect_right` in Python." },
    ],
    syntax: [
      { task: "Middle", java: "int mid = lo + (hi - lo) / 2;", python: "mid = (lo + hi) // 2" },
      { task: "Classic loop", java: "while (lo <= hi)", python: "while lo <= hi:" },
      { task: "Library: exact match", java: "Arrays.binarySearch(a, x)  // negative if absent", python: "from bisect import bisect_left\ni = bisect_left(a, x)" },
      { task: "Insert position", java: "// write lower bound yourself", python: "bisect_left(a, x)   # first >= x\nbisect_right(a, x)  # first > x" },
      { task: "Ceiling division", java: "(p + k - 1) / k", python: "(p + k - 1) // k   # or -(-p // k)" },
    ],
    code: [
      {
        title: "The classic template",
        java: `
          public class Main {
              static int search(int[] a, int target) {
                  int lo = 0, hi = a.length - 1;
                  while (lo <= hi) {
                      int mid = lo + (hi - lo) / 2;       // no overflow
                      if (a[mid] == target) return mid;
                      if (a[mid] < target) lo = mid + 1;  // target is on the right
                      else hi = mid - 1;                  // target is on the left
                  }
                  return -1;
              }

              public static void main(String[] args) {
                  int[] a = {-1, 0, 3, 5, 9, 12};
                  System.out.println(search(a, 9));
                  System.out.println(search(a, 2));
              }
          }`,
        python: `
          def search(a, target):
              lo, hi = 0, len(a) - 1
              while lo <= hi:
                  mid = (lo + hi) // 2
                  if a[mid] == target:
                      return mid
                  if a[mid] < target:
                      lo = mid + 1        # target is on the right
                  else:
                      hi = mid - 1        # target is on the left
              return -1

          a = [-1, 0, 3, 5, 9, 12]
          print(search(a, 9))
          print(search(a, 2))`,
        output: `
          4
          -1`,
      },
      {
        title: "First and last position of a value",
        note: "Same loop, but on a match you remember the index and keep searching one side.",
        java: `
          import java.util.Arrays;

          public class Main {
              // first = true: leftmost match; first = false: rightmost match
              static int find(int[] a, int target, boolean first) {
                  int lo = 0, hi = a.length - 1, ans = -1;
                  while (lo <= hi) {
                      int mid = lo + (hi - lo) / 2;
                      if (a[mid] == target) {
                          ans = mid;
                          if (first) hi = mid - 1;   // keep looking left
                          else lo = mid + 1;         // keep looking right
                      } else if (a[mid] < target) lo = mid + 1;
                      else hi = mid - 1;
                  }
                  return ans;
              }

              public static void main(String[] args) {
                  int[] a = {5, 7, 7, 8, 8, 10};
                  System.out.println(Arrays.toString(new int[]{find(a, 8, true), find(a, 8, false)}));
                  System.out.println(Arrays.toString(new int[]{find(a, 6, true), find(a, 6, false)}));
              }
          }`,
        python: `
          from bisect import bisect_left, bisect_right

          def search_range(a, target):
              l = bisect_left(a, target)            # first index with a[i] >= target
              if l == len(a) or a[l] != target:
                  return [-1, -1]
              return [l, bisect_right(a, target) - 1]   # bisect_right: first a[i] > target

          a = [5, 7, 7, 8, 8, 10]
          print(search_range(a, 8))
          print(search_range(a, 6))`,
        output: `
          [3, 4]
          [-1, -1]`,
      },
      {
        title: "Binary search on the answer: Koko eating bananas",
        note: "Find the smallest eating speed `k` that finishes all piles within `h` hours. Faster speeds always work if slower ones do, so search the speed.",
        java: `
          public class Main {
              static boolean canFinish(int[] piles, int k, int h) {
                  long hours = 0;
                  for (int p : piles) hours += (p + k - 1) / k;   // ceil(p / k)
                  return hours <= h;
              }

              public static void main(String[] args) {
                  int[] piles = {3, 6, 7, 11};
                  int h = 8;
                  int lo = 1, hi = 0;
                  for (int p : piles) hi = Math.max(hi, p);
                  int ans = hi;
                  while (lo <= hi) {
                      int mid = lo + (hi - lo) / 2;
                      if (canFinish(piles, mid, h)) {
                          ans = mid;           // works: try slower
                          hi = mid - 1;
                      } else {
                          lo = mid + 1;        // too slow: go faster
                      }
                  }
                  System.out.println(ans);
              }
          }`,
        python: `
          def can_finish(piles, k, h):
              return sum((p + k - 1) // k for p in piles) <= h   # ceil(p / k) hours per pile

          piles, h = [3, 6, 7, 11], 8
          lo, hi = 1, max(piles)
          ans = hi
          while lo <= hi:
              mid = (lo + hi) // 2
              if can_finish(piles, mid, h):
                  ans = mid            # works: try slower
                  hi = mid - 1
              else:
                  lo = mid + 1         # too slow: go faster
          print(ans)`,
        output: "4",
      },
    ],
    mistakes: [
      "Writing `lo = mid` or `hi = mid` with `while (lo <= hi)` — the loop can get stuck forever.",
      "Java: `(lo + hi) / 2` overflowing when both are near 2×10⁹.",
      "Binary searching an unsorted array.",
      "Search on the answer with the wrong range — `lo` must be a value that might work, `hi` one that surely works.",
      "Using `/` for ceiling division: `p / k` rounds down. Use `(p + k - 1) / k`.",
    ],
    remember: "lo ≤ hi, mid = lo + (hi − lo) / 2, then move past mid: lo = mid + 1 or hi = mid − 1.",
    exercises: [
      {
        q: "Compute the integer square root (rounded down) of 8 and of 26 with binary search — no `sqrt` function.",
        example: `
          Output: 2
                  5`,
        hint: "Search `m` in `1..x` for the last value with `m * m <= x`. Use `long` for `m * m` in Java.",
        java: `
          public class Main {
              static int mySqrt(int x) {
                  long lo = 0, hi = x, ans = 0;
                  while (lo <= hi) {
                      long mid = lo + (hi - lo) / 2;
                      if (mid * mid <= x) {
                          ans = mid;
                          lo = mid + 1;
                      } else {
                          hi = mid - 1;
                      }
                  }
                  return (int) ans;
              }

              public static void main(String[] args) {
                  System.out.println(mySqrt(8));
                  System.out.println(mySqrt(26));
              }
          }`,
        python: `
          def my_sqrt(x):
              lo, hi, ans = 0, x, 0
              while lo <= hi:
                  mid = (lo + hi) // 2
                  if mid * mid <= x:
                      ans = mid
                      lo = mid + 1
                  else:
                      hi = mid - 1
              return ans

          print(my_sqrt(8))
          print(my_sqrt(26))`,
        output: `
          2
          5`,
      },
      {
        q: "Search in a rotated sorted array `[4, 5, 6, 7, 0, 1, 2]`: find 0, then 3.",
        example: `
          Output: 4
                  -1`,
        hint: "At every `mid`, one half is still sorted. Check whether the target lies inside that sorted half; if yes go there, otherwise go to the other half.",
        java: `
          public class Main {
              static int search(int[] a, int t) {
                  int lo = 0, hi = a.length - 1;
                  while (lo <= hi) {
                      int mid = lo + (hi - lo) / 2;
                      if (a[mid] == t) return mid;
                      if (a[lo] <= a[mid]) {                      // left half is sorted
                          if (a[lo] <= t && t < a[mid]) hi = mid - 1;
                          else lo = mid + 1;
                      } else {                                    // right half is sorted
                          if (a[mid] < t && t <= a[hi]) lo = mid + 1;
                          else hi = mid - 1;
                      }
                  }
                  return -1;
              }

              public static void main(String[] args) {
                  int[] a = {4, 5, 6, 7, 0, 1, 2};
                  System.out.println(search(a, 0));
                  System.out.println(search(a, 3));
              }
          }`,
        python: `
          def search(a, t):
              lo, hi = 0, len(a) - 1
              while lo <= hi:
                  mid = (lo + hi) // 2
                  if a[mid] == t:
                      return mid
                  if a[lo] <= a[mid]:                  # left half is sorted
                      if a[lo] <= t < a[mid]:
                          hi = mid - 1
                      else:
                          lo = mid + 1
                  else:                                # right half is sorted
                      if a[mid] < t <= a[hi]:
                          lo = mid + 1
                      else:
                          hi = mid - 1
              return -1

          a = [4, 5, 6, 7, 0, 1, 2]
          print(search(a, 0))
          print(search(a, 3))`,
        output: `
          4
          -1`,
      },
    ],
  },

  "Backtracking: subsets & permutations": {
    simple: `Backtracking builds answers one choice at a time and undoes the last choice to try the next one. It's how you generate all subsets, permutations, combinations, or search for a valid arrangement (N-Queens, Sudoku, word search).

    Every backtracking solution has the same three lines at its heart: choose (add an item to the current path), explore (recurse), un-choose (remove it again). When the path is complete, save a copy of it.`,
    analogy: `Finding your way through a maze. At every fork you pick a corridor and walk on. If you hit a dead end, you walk back to the last fork and try the next corridor. Walking back is the "un-choose" step.`,
    how: {
      steps: [
        "Write a helper `backtrack(start or used[], path)` that carries the partial answer.",
        "If the path is a complete answer, add a copy of it to the results (and return, if nothing more can be added).",
        "Loop over the choices still available: `i` from `start` for subsets and combinations; every unused `i` for permutations.",
        "Choose: `path.add(nums[i])`. Explore: recurse with `i + 1` (or mark `used[i]`). Un-choose: remove the last item.",
        "Prune: skip choices that can't lead to an answer (sum already too big, duplicates).",
      ],
    },
    concepts: [
      { term: "Path", meaning: "The choices made so far — the partial answer you're building." },
      { term: "Choose / explore / un-choose", meaning: "The three-line core of every backtracking solution." },
      { term: "Copy the path", meaning: "`new ArrayList<>(path)` / `path[:]`. Saving `path` itself saves a reference that keeps changing." },
      { term: "start index", meaning: "For subsets and combinations, only pick items after the last one, so you don't get [1,2] and [2,1]." },
      { term: "used[]", meaning: "For permutations, every unused item can go next, so track which ones are taken." },
      { term: "Pruning", meaning: "Stopping a branch early when it can't succeed — the main speed-up in backtracking." },
    ],
    syntax: [
      { task: "Add a copy", java: "res.add(new ArrayList<>(path));", python: "res.append(path[:])" },
      { task: "Choose", java: "path.add(nums[i]);", python: "path.append(nums[i])" },
      { task: "Un-choose", java: "path.remove(path.size() - 1);", python: "path.pop()" },
      { task: "Results list", java: "List<List<Integer>> res = new ArrayList<>();", python: "res = []" },
      { task: "Nested helper", java: "// a static method with res and path\n// passed in (or as static fields)", python: "def backtrack(start):\n    ...  # inner function sees res, path" },
    ],
    code: [
      {
        title: "All subsets",
        note: "Every node of the recursion is a valid subset, so save the path on every call.",
        java: `
          import java.util.*;

          public class Main {
              static void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> res) {
                  res.add(new ArrayList<>(path));            // every path is a subset: save a copy
                  for (int i = start; i < nums.length; i++) {
                      path.add(nums[i]);                     // choose
                      backtrack(nums, i + 1, path, res);     // explore (only later items)
                      path.remove(path.size() - 1);          // un-choose
                  }
              }

              public static void main(String[] args) {
                  List<List<Integer>> res = new ArrayList<>();
                  backtrack(new int[]{1, 2, 3}, 0, new ArrayList<>(), res);
                  System.out.println(res);
              }
          }`,
        python: `
          def subsets(nums):
              res, path = [], []

              def backtrack(start):
                  res.append(path[:])              # every path is a subset: save a copy
                  for i in range(start, len(nums)):
                      path.append(nums[i])         # choose
                      backtrack(i + 1)             # explore (only later items)
                      path.pop()                   # un-choose

              backtrack(0)
              return res

          print(subsets([1, 2, 3]))`,
        output: "[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]",
      },
      {
        title: "All permutations",
        note: "Any unused number can go next, so loop over all of them and track `used`.",
        java: `
          import java.util.*;

          public class Main {
              static void backtrack(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> res) {
                  if (path.size() == nums.length) {          // complete
                      res.add(new ArrayList<>(path));
                      return;
                  }
                  for (int i = 0; i < nums.length; i++) {
                      if (used[i]) continue;
                      used[i] = true;
                      path.add(nums[i]);                     // choose
                      backtrack(nums, used, path, res);      // explore
                      path.remove(path.size() - 1);          // un-choose
                      used[i] = false;
                  }
              }

              public static void main(String[] args) {
                  int[] nums = {1, 2, 3};
                  List<List<Integer>> res = new ArrayList<>();
                  backtrack(nums, new boolean[nums.length], new ArrayList<>(), res);
                  for (List<Integer> p : res) System.out.println(p);
              }
          }`,
        python: `
          def permutations(nums):
              res, path = [], []
              used = [False] * len(nums)

              def backtrack():
                  if len(path) == len(nums):       # complete
                      res.append(path[:])
                      return
                  for i in range(len(nums)):
                      if used[i]:
                          continue
                      used[i] = True
                      path.append(nums[i])         # choose
                      backtrack()                  # explore
                      path.pop()                   # un-choose
                      used[i] = False

              backtrack()
              return res

          for p in permutations([1, 2, 3]):
              print(p)`,
        output: `
          [1, 2, 3]
          [1, 3, 2]
          [2, 1, 3]
          [2, 3, 1]
          [3, 1, 2]
          [3, 2, 1]`,
      },
    ],
    mistakes: [
      "Adding `path` instead of a copy — at the end every saved answer is the same (usually empty) list.",
      "Forgetting the un-choose step, so items pile up in the path.",
      "Starting the loop at 0 for subsets / combinations — you get duplicates like [1, 2] and [2, 1].",
      "Not sorting before skipping duplicates (`if (i > start && nums[i] == nums[i - 1]) continue;`).",
      "Not pruning: carrying on when the running sum already passed the target.",
    ],
    remember: "Choose, explore, un-choose — and always save a copy of the path.",
    exercises: [
      {
        q: "Combination sum: find every combination of `[2, 3, 6, 7]` that sums to 7. Each number may be used any number of times.",
        example: "Output: [[2, 2, 3], [7]]",
        hint: "Recurse with the same `i` (not `i + 1`) because a number can be reused. Stop when the remaining target hits 0; prune when it goes negative.",
        java: `
          import java.util.*;

          public class Main {
              static void backtrack(int[] c, int start, int remain, List<Integer> path, List<List<Integer>> res) {
                  if (remain == 0) {
                      res.add(new ArrayList<>(path));
                      return;
                  }
                  for (int i = start; i < c.length; i++) {
                      if (c[i] > remain) continue;            // prune
                      path.add(c[i]);
                      backtrack(c, i, remain - c[i], path, res);   // i, not i + 1: reuse allowed
                      path.remove(path.size() - 1);
                  }
              }

              public static void main(String[] args) {
                  List<List<Integer>> res = new ArrayList<>();
                  backtrack(new int[]{2, 3, 6, 7}, 0, 7, new ArrayList<>(), res);
                  System.out.println(res);
              }
          }`,
        python: `
          def combination_sum(c, target):
              res, path = [], []

              def backtrack(start, remain):
                  if remain == 0:
                      res.append(path[:])
                      return
                  for i in range(start, len(c)):
                      if c[i] > remain:                # prune
                          continue
                      path.append(c[i])
                      backtrack(i, remain - c[i])      # i, not i + 1: reuse allowed
                      path.pop()

              backtrack(0, target)
              return res

          print(combination_sum([2, 3, 6, 7], 7))`,
        output: "[[2, 2, 3], [7]]",
      },
      {
        q: "Generate all balanced strings of 3 pairs of parentheses, one per line.",
        example: "Output: ((())) (()()) (())() ()(()) ()()()   (one per line)",
        hint: "Track how many `(` and `)` you've used. You may add `(` while open < n, and `)` while close < open.",
        java: `
          import java.util.*;

          public class Main {
              static void gen(int n, int open, int close, StringBuilder sb, List<String> res) {
                  if (sb.length() == 2 * n) {
                      res.add(sb.toString());
                      return;
                  }
                  if (open < n) {
                      sb.append('(');
                      gen(n, open + 1, close, sb, res);
                      sb.deleteCharAt(sb.length() - 1);
                  }
                  if (close < open) {
                      sb.append(')');
                      gen(n, open, close + 1, sb, res);
                      sb.deleteCharAt(sb.length() - 1);
                  }
              }

              public static void main(String[] args) {
                  List<String> res = new ArrayList<>();
                  gen(3, 0, 0, new StringBuilder(), res);
                  for (String s : res) System.out.println(s);
              }
          }`,
        python: `
          def generate(n):
              res, path = [], []

              def gen(open_, close):
                  if len(path) == 2 * n:
                      res.append("".join(path))
                      return
                  if open_ < n:
                      path.append("(")
                      gen(open_ + 1, close)
                      path.pop()
                  if close < open_:
                      path.append(")")
                      gen(open_, close + 1)
                      path.pop()

              gen(0, 0)
              return res

          for s in generate(3):
              print(s)`,
        output: `
          ((()))
          (()())
          (())()
          ()(())
          ()()()`,
      },
    ],
  },

  "Linked lists in code": {
    simple: `A linked list is a chain of nodes; each node holds a value and a reference to the next node. There are no indexes — to reach the 5th node you walk from the head, one next at a time.

    Most linked-list questions are about moving references around without losing any part of the chain. Three habits make them manageable: draw the boxes and arrows, save next before you change it, and use a dummy node in front of the head so the first node isn't a special case.`,
    analogy: `A treasure hunt: each clue tells you where the next clue is hidden. You can't jump to clue 5 — you follow them in order. Reversing the list is like rewriting every clue to point back at the previous hiding place.`,
    how: {
      steps: [
        "Write the Node class: a value and a `next` reference (`null` / `None` at the end).",
        "Traverse with `cur = head; while (cur != null) { ...; cur = cur.next; }`.",
        "Before changing `cur.next`, save it: `Node next = cur.next;` — otherwise the rest of the list is lost.",
        "When the head might change (insert at front, delete the first node, merge), start with `dummy = new Node(0); dummy.next = head` and return `dummy.next`.",
        "For middle / cycle / n-th from end, use two pointers moving at different speeds or with a gap.",
      ],
    },
    concepts: [
      { term: "Node", meaning: "One box of the chain: `val` and `next`." },
      { term: "head", meaning: "The first node. If you lose the reference to it, you lose the list." },
      { term: "Dummy node", meaning: "A fake node before the head, so code that inserts or deletes at the front needs no special case." },
      { term: "prev / curr / next", meaning: "The three references needed to reverse a list in place." },
      { term: "Fast & slow pointers", meaning: "Fast moves 2 steps, slow 1. When fast reaches the end, slow is in the middle; if they meet, there's a cycle." },
      { term: "null check", meaning: "Always check `cur != null` (and `cur.next != null` before using `cur.next.next`)." },
    ],
    syntax: [
      { task: "Node class", java: "static class Node {\n    int val; Node next;\n    Node(int v) { val = v; }\n}", python: "class Node:\n    def __init__(self, val, next=None):\n        self.val = val\n        self.next = next" },
      { task: "Walk the list", java: "for (Node c = head; c != null; c = c.next)", python: "cur = head\nwhile cur:\n    cur = cur.next" },
      { task: "Insert at front", java: "Node n = new Node(5); n.next = head; head = n;", python: "head = Node(5, head)" },
      { task: "Delete the next node", java: "cur.next = cur.next.next;", python: "cur.next = cur.next.next" },
      { task: "Dummy head", java: "Node dummy = new Node(0); dummy.next = head;\n...\nreturn dummy.next;", python: "dummy = Node(0, head)\n...\nreturn dummy.next" },
    ],
    code: [
      {
        title: "Build, print and reverse a list",
        java: `
          public class Main {
              static class Node {
                  int val;
                  Node next;
                  Node(int val) { this.val = val; }
              }

              static Node build(int[] vals) {
                  Node dummy = new Node(0), tail = dummy;     // dummy: no special case for the first node
                  for (int v : vals) {
                      tail.next = new Node(v);
                      tail = tail.next;
                  }
                  return dummy.next;
              }

              static void print(Node head) {
                  StringBuilder sb = new StringBuilder();
                  for (Node cur = head; cur != null; cur = cur.next) {
                      sb.append(cur.val);
                      if (cur.next != null) sb.append(" -> ");
                  }
                  System.out.println(sb);
              }

              static Node reverse(Node head) {
                  Node prev = null, curr = head;
                  while (curr != null) {
                      Node next = curr.next;   // 1. save the rest of the list
                      curr.next = prev;        // 2. point this node backwards
                      prev = curr;             // 3. move prev forward
                      curr = next;             // 4. move curr forward
                  }
                  return prev;                 // prev is the new head
              }

              public static void main(String[] args) {
                  Node head = build(new int[]{1, 2, 3, 4, 5});
                  print(head);
                  head = reverse(head);
                  print(head);
              }
          }`,
        python: `
          class Node:
              def __init__(self, val, next=None):
                  self.val = val
                  self.next = next

          def build(vals):
              dummy = tail = Node(0)       # dummy: no special case for the first node
              for v in vals:
                  tail.next = Node(v)
                  tail = tail.next
              return dummy.next

          def show(head):
              vals = []
              cur = head
              while cur:
                  vals.append(str(cur.val))
                  cur = cur.next
              print(" -> ".join(vals))

          def reverse(head):
              prev, curr = None, head
              while curr:
                  nxt = curr.next          # 1. save the rest of the list
                  curr.next = prev         # 2. point this node backwards
                  prev = curr              # 3. move prev forward
                  curr = nxt               # 4. move curr forward
              return prev                  # prev is the new head

          head = build([1, 2, 3, 4, 5])
          show(head)
          head = reverse(head)
          show(head)`,
        output: `
          1 -> 2 -> 3 -> 4 -> 5
          5 -> 4 -> 3 -> 2 -> 1`,
      },
      {
        title: "Fast and slow pointers: middle node and cycle check",
        java: `
          public class Main {
              static class Node {
                  int val;
                  Node next;
                  Node(int val) { this.val = val; }
              }

              static Node middle(Node head) {
                  Node slow = head, fast = head;
                  while (fast != null && fast.next != null) {
                      slow = slow.next;          // 1 step
                      fast = fast.next.next;     // 2 steps
                  }
                  return slow;
              }

              static boolean hasCycle(Node head) {
                  Node slow = head, fast = head;
                  while (fast != null && fast.next != null) {
                      slow = slow.next;
                      fast = fast.next.next;
                      if (slow == fast) return true;   // fast lapped slow
                  }
                  return false;
              }

              public static void main(String[] args) {
                  Node[] nodes = new Node[5];
                  for (int i = 0; i < 5; i++) nodes[i] = new Node(i + 1);
                  for (int i = 0; i < 4; i++) nodes[i].next = nodes[i + 1];
                  System.out.println("middle = " + middle(nodes[0]).val);
                  System.out.println(hasCycle(nodes[0]) ? "cycle" : "no cycle");
                  nodes[4].next = nodes[1];                // 5 -> 2 makes a loop
                  System.out.println(hasCycle(nodes[0]) ? "cycle" : "no cycle");
              }
          }`,
        python: `
          class Node:
              def __init__(self, val, next=None):
                  self.val = val
                  self.next = next

          def middle(head):
              slow = fast = head
              while fast and fast.next:
                  slow = slow.next          # 1 step
                  fast = fast.next.next     # 2 steps
              return slow

          def has_cycle(head):
              slow = fast = head
              while fast and fast.next:
                  slow = slow.next
                  fast = fast.next.next
                  if slow is fast:          # fast lapped slow
                      return True
              return False

          nodes = [Node(i + 1) for i in range(5)]
          for i in range(4):
              nodes[i].next = nodes[i + 1]
          print("middle =", middle(nodes[0]).val)
          print("cycle" if has_cycle(nodes[0]) else "no cycle")
          nodes[4].next = nodes[1]          # 5 -> 2 makes a loop
          print("cycle" if has_cycle(nodes[0]) else "no cycle")`,
        output: `
          middle = 3
          no cycle
          cycle`,
      },
    ],
    mistakes: [
      "Changing `cur.next` before saving it — the rest of the list becomes unreachable.",
      "Calling `cur.next.next` without checking `cur.next != null` first — NullPointerException / AttributeError.",
      "Returning `head` after the head changed (reversal, deleting the first node) — return the new head or `dummy.next`.",
      "Moving `cur` forward after deleting `cur.next`, which skips the node that slid into its place.",
      "Python: naming a variable `next` hides the built-in `next()` — use `nxt`.",
    ],
    remember: "Draw it, save next before you rewire, and put a dummy in front when the head can change.",
    exercises: [
      {
        q: "Merge the sorted lists `1 -> 2 -> 4` and `1 -> 3 -> 4` into one sorted list.",
        example: "Output: 1 -> 1 -> 2 -> 3 -> 4 -> 4",
        hint: "Dummy node + tail. Repeatedly attach the smaller head to `tail`, advance that list, advance `tail`. Attach whatever is left at the end.",
        java: `
          public class Main {
              static class Node {
                  int val;
                  Node next;
                  Node(int val) { this.val = val; }
              }

              static Node build(int[] vals) {
                  Node dummy = new Node(0), t = dummy;
                  for (int v : vals) t = t.next = new Node(v);
                  return dummy.next;
              }

              static Node merge(Node a, Node b) {
                  Node dummy = new Node(0), tail = dummy;
                  while (a != null && b != null) {
                      if (a.val <= b.val) {
                          tail.next = a;
                          a = a.next;
                      } else {
                          tail.next = b;
                          b = b.next;
                      }
                      tail = tail.next;
                  }
                  tail.next = (a != null) ? a : b;
                  return dummy.next;
              }

              public static void main(String[] args) {
                  Node head = merge(build(new int[]{1, 2, 4}), build(new int[]{1, 3, 4}));
                  StringBuilder sb = new StringBuilder();
                  for (Node c = head; c != null; c = c.next) sb.append(c.val).append(c.next != null ? " -> " : "");
                  System.out.println(sb);
              }
          }`,
        python: `
          class Node:
              def __init__(self, val, next=None):
                  self.val = val
                  self.next = next

          def build(vals):
              dummy = t = Node(0)
              for v in vals:
                  t.next = Node(v)
                  t = t.next
              return dummy.next

          def merge(a, b):
              dummy = tail = Node(0)
              while a and b:
                  if a.val <= b.val:
                      tail.next, a = a, a.next
                  else:
                      tail.next, b = b, b.next
                  tail = tail.next
              tail.next = a or b
              return dummy.next

          head = merge(build([1, 2, 4]), build([1, 3, 4]))
          vals = []
          while head:
              vals.append(str(head.val))
              head = head.next
          print(" -> ".join(vals))`,
        output: "1 -> 1 -> 2 -> 3 -> 4 -> 4",
      },
      {
        q: "Remove the 2nd node from the end of `1 -> 2 -> 3 -> 4 -> 5` in one pass.",
        example: "Output: 1 -> 2 -> 3 -> 5",
        hint: "Start two pointers at a dummy node. Move `fast` n steps ahead, then move both until `fast.next` is null. `slow.next` is the node to delete.",
        java: `
          public class Main {
              static class Node {
                  int val;
                  Node next;
                  Node(int val) { this.val = val; }
              }

              public static void main(String[] args) {
                  Node dummy = new Node(0), t = dummy;
                  for (int v : new int[]{1, 2, 3, 4, 5}) t = t.next = new Node(v);
                  int n = 2;

                  Node fast = dummy, slow = dummy;
                  for (int i = 0; i < n; i++) fast = fast.next;     // gap of n
                  while (fast.next != null) {
                      fast = fast.next;
                      slow = slow.next;
                  }
                  slow.next = slow.next.next;                        // unlink it

                  StringBuilder sb = new StringBuilder();
                  for (Node c = dummy.next; c != null; c = c.next) sb.append(c.val).append(c.next != null ? " -> " : "");
                  System.out.println(sb);
              }
          }`,
        python: `
          class Node:
              def __init__(self, val, next=None):
                  self.val = val
                  self.next = next

          dummy = t = Node(0)
          for v in [1, 2, 3, 4, 5]:
              t.next = Node(v)
              t = t.next
          n = 2

          fast = slow = dummy
          for _ in range(n):                  # gap of n
              fast = fast.next
          while fast.next:
              fast, slow = fast.next, slow.next
          slow.next = slow.next.next          # unlink it

          vals, cur = [], dummy.next
          while cur:
              vals.append(str(cur.val))
              cur = cur.next
          print(" -> ".join(vals))`,
        output: "1 -> 2 -> 3 -> 5",
      },
    ],
  },

  "Binary trees in code": {
    simple: `A binary tree is made of nodes where each node has a value and up to two children, left and right. Almost every tree problem is solved with recursion: solve it for the left subtree, solve it for the right subtree, and combine the two answers at the current node.

    The other tool is level-order traversal (BFS) with a queue, for anything about levels: the level-by-level list, the right side view, minimum depth. To practise outside LeetCode you'll also want to build a tree from the LeetCode-style list like [3, 9, 20, null, null, 15, 7] — the code below does that.`,
    analogy: `A family tree, or a company org chart. To count everyone in a department, a manager asks each of their two team leads "how many people under you?", adds the two answers, and adds 1 for themselves. Each team lead does the same with their own reports. That's tree recursion.`,
    how: {
      steps: [
        "Write the TreeNode class: `val`, `left`, `right`.",
        "Recursive template: if `node == null` return the base value; get `left = f(node.left)` and `right = f(node.right)`; combine them with `node.val`.",
        "Traversal order is just where you \"visit\" the node: before the children (preorder), between them (inorder), after them (postorder).",
        "Level order: put the root in a queue; while it's not empty, take `size = queue.size()` nodes — that's one level — and add their children.",
        "If you need to pass information down (a running sum, allowed min/max), add it as a parameter.",
      ],
    },
    concepts: [
      { term: "TreeNode", meaning: "`val`, `left`, `right`. A leaf has both children `null`." },
      { term: "Preorder / inorder / postorder", meaning: "Node-left-right / left-node-right / left-right-node. Inorder of a BST is sorted." },
      { term: "Level order (BFS)", meaning: "Visit level by level using a queue." },
      { term: "Height / depth", meaning: "Height = 1 + max(height(left), height(right)); an empty tree has height 0." },
      { term: "BST", meaning: "Binary search tree: everything in the left subtree is smaller, everything in the right is larger." },
      { term: "Return up vs pass down", meaning: "Return values carry answers up from children; parameters carry context down from parents." },
    ],
    syntax: [
      { task: "TreeNode", java: "static class TreeNode {\n    int val; TreeNode left, right;\n    TreeNode(int v) { val = v; }\n}", python: "class TreeNode:\n    def __init__(self, val):\n        self.val = val\n        self.left = self.right = None" },
      { task: "Recursive template", java: "int f(TreeNode n) {\n    if (n == null) return 0;\n    int l = f(n.left), r = f(n.right);\n    return combine(n.val, l, r);\n}", python: "def f(n):\n    if not n:\n        return 0\n    l, r = f(n.left), f(n.right)\n    return combine(n.val, l, r)" },
      { task: "Level loop", java: "while (!q.isEmpty()) {\n    int size = q.size();\n    for (int i = 0; i < size; i++) { ... }\n}", python: "while q:\n    for _ in range(len(q)):\n        node = q.popleft()" },
      { task: "Nullable input array", java: "Integer[] vals = {3, 9, 20, null, null, 15, 7};", python: "vals = [3, 9, 20, None, None, 15, 7]" },
    ],
    code: [
      {
        title: "Build a tree from a LeetCode-style list, then traverse it",
        java: `
          import java.util.*;

          public class Main {
              static class TreeNode {
                  int val;
                  TreeNode left, right;
                  TreeNode(int val) { this.val = val; }
              }

              // Builds from level order with nulls for missing children, like LeetCode's [3,9,20,null,null,15,7]
              static TreeNode build(Integer[] vals) {
                  if (vals.length == 0 || vals[0] == null) return null;
                  TreeNode root = new TreeNode(vals[0]);
                  Queue<TreeNode> q = new ArrayDeque<>();
                  q.offer(root);
                  int i = 1;
                  while (i < vals.length) {
                      TreeNode node = q.poll();
                      if (vals[i] != null) {
                          node.left = new TreeNode(vals[i]);
                          q.offer(node.left);
                      }
                      i++;
                      if (i < vals.length && vals[i] != null) {
                          node.right = new TreeNode(vals[i]);
                          q.offer(node.right);
                      }
                      i++;
                  }
                  return root;
              }

              static void preorder(TreeNode n, List<Integer> out) {
                  if (n == null) return;
                  out.add(n.val);              // node first
                  preorder(n.left, out);
                  preorder(n.right, out);
              }

              static void inorder(TreeNode n, List<Integer> out) {
                  if (n == null) return;
                  inorder(n.left, out);
                  out.add(n.val);              // node in the middle
                  inorder(n.right, out);
              }

              static void postorder(TreeNode n, List<Integer> out) {
                  if (n == null) return;
                  postorder(n.left, out);
                  postorder(n.right, out);
                  out.add(n.val);              // node last
              }

              public static void main(String[] args) {
                  TreeNode root = build(new Integer[]{3, 9, 20, null, null, 15, 7});
                  List<Integer> pre = new ArrayList<>(), in = new ArrayList<>(), post = new ArrayList<>();
                  preorder(root, pre);
                  inorder(root, in);
                  postorder(root, post);
                  System.out.println("pre  " + pre);
                  System.out.println("in   " + in);
                  System.out.println("post " + post);
              }
          }`,
        python: `
          from collections import deque

          class TreeNode:
              def __init__(self, val):
                  self.val = val
                  self.left = self.right = None

          # Builds from level order with None for missing children, like LeetCode's [3,9,20,null,null,15,7]
          def build(vals):
              if not vals or vals[0] is None:
                  return None
              root = TreeNode(vals[0])
              q = deque([root])
              i = 1
              while i < len(vals):
                  node = q.popleft()
                  if vals[i] is not None:
                      node.left = TreeNode(vals[i])
                      q.append(node.left)
                  i += 1
                  if i < len(vals) and vals[i] is not None:
                      node.right = TreeNode(vals[i])
                      q.append(node.right)
                  i += 1
              return root

          def preorder(n, out):
              if not n:
                  return
              out.append(n.val)            # node first
              preorder(n.left, out)
              preorder(n.right, out)

          def inorder(n, out):
              if not n:
                  return
              inorder(n.left, out)
              out.append(n.val)            # node in the middle
              inorder(n.right, out)

          def postorder(n, out):
              if not n:
                  return
              postorder(n.left, out)
              postorder(n.right, out)
              out.append(n.val)            # node last

          root = build([3, 9, 20, None, None, 15, 7])
          pre, ino, post = [], [], []
          preorder(root, pre)
          inorder(root, ino)
          postorder(root, post)
          print("pre ", pre)
          print("in  ", ino)
          print("post", post)`,
        output: `
          pre  [3, 9, 20, 15, 7]
          in   [9, 3, 15, 20, 7]
          post [9, 15, 7, 20, 3]`,
      },
      {
        title: "Level order and maximum depth",
        note: "The tree is built by hand here to keep the program short; use `build` from the example above for bigger ones.",
        java: `
          import java.util.*;

          public class Main {
              static class TreeNode {
                  int val;
                  TreeNode left, right;
                  TreeNode(int val) { this.val = val; }
              }

              static List<List<Integer>> levelOrder(TreeNode root) {
                  List<List<Integer>> res = new ArrayList<>();
                  if (root == null) return res;
                  Queue<TreeNode> q = new ArrayDeque<>();
                  q.offer(root);
                  while (!q.isEmpty()) {
                      int size = q.size();                 // nodes on this level
                      List<Integer> level = new ArrayList<>();
                      for (int i = 0; i < size; i++) {
                          TreeNode n = q.poll();
                          level.add(n.val);
                          if (n.left != null) q.offer(n.left);
                          if (n.right != null) q.offer(n.right);
                      }
                      res.add(level);
                  }
                  return res;
              }

              static int maxDepth(TreeNode n) {
                  if (n == null) return 0;
                  return 1 + Math.max(maxDepth(n.left), maxDepth(n.right));
              }

              public static void main(String[] args) {
                  TreeNode root = new TreeNode(3);
                  root.left = new TreeNode(9);
                  root.right = new TreeNode(20);
                  root.right.left = new TreeNode(15);
                  root.right.right = new TreeNode(7);
                  System.out.println(levelOrder(root));
                  System.out.println("depth = " + maxDepth(root));
              }
          }`,
        python: `
          from collections import deque

          class TreeNode:
              def __init__(self, val):
                  self.val = val
                  self.left = self.right = None

          def level_order(root):
              res = []
              if not root:
                  return res
              q = deque([root])
              while q:
                  level = []
                  for _ in range(len(q)):          # nodes on this level
                      n = q.popleft()
                      level.append(n.val)
                      if n.left:
                          q.append(n.left)
                      if n.right:
                          q.append(n.right)
                  res.append(level)
              return res

          def max_depth(n):
              if not n:
                  return 0
              return 1 + max(max_depth(n.left), max_depth(n.right))

          root = TreeNode(3)
          root.left = TreeNode(9)
          root.right = TreeNode(20)
          root.right.left = TreeNode(15)
          root.right.right = TreeNode(7)
          print(level_order(root))
          print("depth =", max_depth(root))`,
        output: `
          [[3], [9, 20], [15, 7]]
          depth = 3`,
      },
    ],
    mistakes: [
      "Forgetting the `null` base case — the first leaf's child crashes the program.",
      "In level order, using `q.size()` in the loop condition while adding children — read the size once before the loop.",
      "Validating a BST by only comparing a node with its direct children — every node must fit the range set by all its ancestors.",
      "Python: comparing nodes with `==` to check if they're the same object — use `is`.",
      "Recomputing height inside another recursion (e.g. for diameter), making it O(n²) — return the height and update the answer in the same pass.",
    ],
    remember: "Null base case, solve left, solve right, combine at the node — and a queue with a level size for BFS.",
    exercises: [
      {
        q: "Invert (mirror) the tree `[4, 2, 7, 1, 3, 6, 9]` and print its level order.",
        example: "Output: [[4], [7, 2], [9, 6, 3, 1]]",
        hint: "Recursively invert both subtrees, then swap `left` and `right` at the current node.",
        java: `
          import java.util.*;

          public class Main {
              static class TreeNode {
                  int val;
                  TreeNode left, right;
                  TreeNode(int val) { this.val = val; }
              }

              static TreeNode build(Integer[] v) {
                  TreeNode root = new TreeNode(v[0]);
                  Queue<TreeNode> q = new ArrayDeque<>(List.of(root));
                  for (int i = 1; i < v.length; i += 2) {
                      TreeNode n = q.poll();
                      if (v[i] != null) q.offer(n.left = new TreeNode(v[i]));
                      if (i + 1 < v.length && v[i + 1] != null) q.offer(n.right = new TreeNode(v[i + 1]));
                  }
                  return root;
              }

              static TreeNode invert(TreeNode n) {
                  if (n == null) return null;
                  TreeNode left = invert(n.left), right = invert(n.right);
                  n.left = right;
                  n.right = left;
                  return n;
              }

              public static void main(String[] args) {
                  TreeNode root = invert(build(new Integer[]{4, 2, 7, 1, 3, 6, 9}));
                  List<List<Integer>> res = new ArrayList<>();
                  Queue<TreeNode> q = new ArrayDeque<>(List.of(root));
                  while (!q.isEmpty()) {
                      List<Integer> level = new ArrayList<>();
                      for (int i = q.size(); i > 0; i--) {
                          TreeNode n = q.poll();
                          level.add(n.val);
                          if (n.left != null) q.offer(n.left);
                          if (n.right != null) q.offer(n.right);
                      }
                      res.add(level);
                  }
                  System.out.println(res);
              }
          }`,
        python: `
          from collections import deque

          class TreeNode:
              def __init__(self, val):
                  self.val = val
                  self.left = self.right = None

          def build(v):
              root = TreeNode(v[0])
              q = deque([root])
              for i in range(1, len(v), 2):
                  n = q.popleft()
                  if v[i] is not None:
                      n.left = TreeNode(v[i])
                      q.append(n.left)
                  if i + 1 < len(v) and v[i + 1] is not None:
                      n.right = TreeNode(v[i + 1])
                      q.append(n.right)
              return root

          def invert(n):
              if not n:
                  return None
              n.left, n.right = invert(n.right), invert(n.left)
              return n

          root = invert(build([4, 2, 7, 1, 3, 6, 9]))
          res, q = [], deque([root])
          while q:
              level = []
              for _ in range(len(q)):
                  n = q.popleft()
                  level.append(n.val)
                  if n.left:
                      q.append(n.left)
                  if n.right:
                      q.append(n.right)
              res.append(level)
          print(res)`,
        output: "[[4], [7, 2], [9, 6, 3, 1]]",
      },
      {
        q: "Check whether `[2, 1, 3]` and `[5, 1, 4, null, null, 3, 6]` are valid binary search trees.",
        example: `
          Output: valid
                  not valid   (3 is in 5's right subtree but smaller than 5)`,
        hint: "Pass down the allowed range `(low, high)`. Going left, the node's value becomes the new `high`; going right, the new `low`.",
        java: `
          import java.util.*;

          public class Main {
              static class TreeNode {
                  int val;
                  TreeNode left, right;
                  TreeNode(int val) { this.val = val; }
              }

              static TreeNode build(Integer[] v) {
                  TreeNode root = new TreeNode(v[0]);
                  Queue<TreeNode> q = new ArrayDeque<>(List.of(root));
                  for (int i = 1; i < v.length; i += 2) {
                      TreeNode n = q.poll();
                      if (v[i] != null) q.offer(n.left = new TreeNode(v[i]));
                      if (i + 1 < v.length && v[i + 1] != null) q.offer(n.right = new TreeNode(v[i + 1]));
                  }
                  return root;
              }

              // long bounds so values equal to Integer.MIN_VALUE / MAX_VALUE still work
              static boolean valid(TreeNode n, long low, long high) {
                  if (n == null) return true;
                  if (n.val <= low || n.val >= high) return false;
                  return valid(n.left, low, n.val) && valid(n.right, n.val, high);
              }

              public static void main(String[] args) {
                  for (Integer[] t : new Integer[][]{{2, 1, 3}, {5, 1, 4, null, null, 3, 6}}) {
                      System.out.println(valid(build(t), Long.MIN_VALUE, Long.MAX_VALUE) ? "valid" : "not valid");
                  }
              }
          }`,
        python: `
          from collections import deque

          class TreeNode:
              def __init__(self, val):
                  self.val = val
                  self.left = self.right = None

          def build(v):
              root = TreeNode(v[0])
              q = deque([root])
              for i in range(1, len(v), 2):
                  n = q.popleft()
                  if v[i] is not None:
                      n.left = TreeNode(v[i])
                      q.append(n.left)
                  if i + 1 < len(v) and v[i + 1] is not None:
                      n.right = TreeNode(v[i + 1])
                      q.append(n.right)
              return root

          def valid(n, low=float("-inf"), high=float("inf")):
              if not n:
                  return True
              if not (low < n.val < high):
                  return False
              return valid(n.left, low, n.val) and valid(n.right, n.val, high)

          for t in [[2, 1, 3], [5, 1, 4, None, None, 3, 6]]:
              print("valid" if valid(build(t)) else "not valid")`,
        output: `
          valid
          not valid`,
      },
    ],
  },

  "Graphs: BFS & DFS": {
    simple: `A graph is a set of nodes connected by edges — cities and roads, people and friendships, cells in a grid and their neighbours. In code you almost always store it as an adjacency list: for each node, the list of its neighbours.

    Two traversals solve most graph questions. BFS (breadth-first) uses a queue and explores in rings: all nodes 1 step away, then 2 steps… so it finds the shortest path in an unweighted graph. DFS (depth-first) uses recursion or a stack and goes as deep as possible before backing up — good for connected components, cycle detection and exploring regions. Both need a visited set so you never process a node twice.`,
    analogy: `BFS is a ripple in a pond: it spreads out evenly, ring by ring, so it reaches nearer places first. DFS is exploring a cave: you follow one tunnel to its end before coming back to try the next one.`,
    how: {
      steps: [
        "Build the adjacency list: for each edge `(u, v)`, add `v` to `adj[u]` (and `u` to `adj[v]` if undirected).",
        "BFS: put the start in a queue and mark it visited. Pop a node, then push every unvisited neighbour — marking it visited when you push it.",
        "DFS: `dfs(u)`: mark `u` visited, then call `dfs(v)` for every unvisited neighbour `v`.",
        "Components: loop over every node; each time you find an unvisited one, run DFS/BFS from it and add 1 to the count.",
        "Grids: a cell `(r, c)` has neighbours `(r±1, c)` and `(r, c±1)`. Check bounds before reading, and mark cells visited.",
      ],
    },
    concepts: [
      { term: "Adjacency list", meaning: "`List<List<Integer>>` / `list of lists` (or a dict): neighbours of each node. O(V + E) memory." },
      { term: "Visited", meaning: "A boolean array or set. Without it, cycles make the traversal loop forever." },
      { term: "BFS", meaning: "Queue-based, level by level. Shortest path in steps when every edge costs the same." },
      { term: "DFS", meaning: "Recursion or an explicit stack. Explores one branch fully before the next." },
      { term: "Directions array", meaning: "`{{1,0},{-1,0},{0,1},{0,-1}}` — loop over it to visit the 4 neighbours of a grid cell." },
      { term: "Multi-source BFS", meaning: "Start BFS with several nodes in the queue at once (all rotten oranges, all fires)." },
    ],
    syntax: [
      { task: "Adjacency list", java: "List<List<Integer>> adj = new ArrayList<>();\nfor (int i = 0; i < n; i++) adj.add(new ArrayList<>());\nadj.get(u).add(v); adj.get(v).add(u);", python: "adj = [[] for _ in range(n)]\nadj[u].append(v); adj[v].append(u)" },
      { task: "BFS queue", java: "Queue<Integer> q = new ArrayDeque<>();\nq.offer(start); visited[start] = true;", python: "q = deque([start])\nvisited[start] = True" },
      { task: "Four directions", java: "int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};", python: "dirs = [(1, 0), (-1, 0), (0, 1), (0, -1)]" },
      { task: "Bounds check", java: "if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;", python: "if 0 <= nr < rows and 0 <= nc < cols:" },
      { task: "Deep recursion", java: "// recursion depth ~10^4 is usually fine", python: "sys.setrecursionlimit(10**6)  # or use BFS" },
    ],
    code: [
      {
        title: "Adjacency list, BFS (with distances) and DFS",
        java: `
          import java.util.*;

          public class Main {
              static void dfs(int u, List<List<Integer>> adj, boolean[] seen, List<Integer> order) {
                  seen[u] = true;
                  order.add(u);
                  for (int v : adj.get(u)) {
                      if (!seen[v]) dfs(v, adj, seen, order);
                  }
              }

              public static void main(String[] args) {
                  int n = 6;
                  int[][] edges = {{0, 1}, {0, 2}, {1, 3}, {2, 4}, {4, 5}};
                  List<List<Integer>> adj = new ArrayList<>();
                  for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
                  for (int[] e : edges) {                     // undirected: add both ways
                      adj.get(e[0]).add(e[1]);
                      adj.get(e[1]).add(e[0]);
                  }

                  // BFS from 0: dist[v] = fewest edges from 0 to v
                  int[] dist = new int[n];
                  Arrays.fill(dist, -1);
                  Queue<Integer> q = new ArrayDeque<>();
                  q.offer(0);
                  dist[0] = 0;                                // dist != -1 doubles as "visited"
                  List<Integer> bfsOrder = new ArrayList<>();
                  while (!q.isEmpty()) {
                      int u = q.poll();
                      bfsOrder.add(u);
                      for (int v : adj.get(u)) {
                          if (dist[v] == -1) {                // mark when pushing, not when popping
                              dist[v] = dist[u] + 1;
                              q.offer(v);
                          }
                      }
                  }
                  System.out.println("BFS  " + bfsOrder);
                  System.out.println("dist " + Arrays.toString(dist));

                  List<Integer> dfsOrder = new ArrayList<>();
                  dfs(0, adj, new boolean[n], dfsOrder);
                  System.out.println("DFS  " + dfsOrder);
              }
          }`,
        python: `
          from collections import deque

          def dfs(u, adj, seen, order):
              seen[u] = True
              order.append(u)
              for v in adj[u]:
                  if not seen[v]:
                      dfs(v, adj, seen, order)

          n = 6
          edges = [(0, 1), (0, 2), (1, 3), (2, 4), (4, 5)]
          adj = [[] for _ in range(n)]
          for u, v in edges:                     # undirected: add both ways
              adj[u].append(v)
              adj[v].append(u)

          # BFS from 0: dist[v] = fewest edges from 0 to v
          dist = [-1] * n
          dist[0] = 0                            # dist != -1 doubles as "visited"
          q = deque([0])
          bfs_order = []
          while q:
              u = q.popleft()
              bfs_order.append(u)
              for v in adj[u]:
                  if dist[v] == -1:              # mark when pushing, not when popping
                      dist[v] = dist[u] + 1
                      q.append(v)
          print("BFS ", bfs_order)
          print("dist", dist)

          dfs_order = []
          dfs(0, adj, [False] * n, dfs_order)
          print("DFS ", dfs_order)`,
        output: `
          BFS  [0, 1, 2, 3, 4, 5]
          dist [0, 1, 1, 2, 2, 3]
          DFS  [0, 1, 3, 2, 4, 5]`,
      },
      {
        title: "Grid as a graph: number of islands",
        note: "Each land cell `1` is a node connected to its land neighbours. Every DFS started from unvisited land floods one whole island.",
        java: `
          public class Main {
              static int rows, cols;

              static void sink(char[][] g, int r, int c) {
                  if (r < 0 || c < 0 || r >= rows || c >= cols || g[r][c] != '1') return;   // bounds + water/visited
                  g[r][c] = '0';                        // mark visited by sinking it
                  sink(g, r + 1, c);
                  sink(g, r - 1, c);
                  sink(g, r, c + 1);
                  sink(g, r, c - 1);
              }

              public static void main(String[] args) {
                  String[] rowsText = {"11000", "11000", "00100", "00011"};
                  char[][] g = new char[rowsText.length][];
                  for (int i = 0; i < rowsText.length; i++) g[i] = rowsText[i].toCharArray();
                  rows = g.length;
                  cols = g[0].length;

                  int islands = 0;
                  for (int r = 0; r < rows; r++) {
                      for (int c = 0; c < cols; c++) {
                          if (g[r][c] == '1') {
                              islands++;
                              sink(g, r, c);
                          }
                      }
                  }
                  System.out.println(islands);
              }
          }`,
        python: `
          grid = [list(row) for row in ["11000", "11000", "00100", "00011"]]
          rows, cols = len(grid), len(grid[0])

          def sink(r, c):
              if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != "1":   # bounds + water/visited
                  return
              grid[r][c] = "0"                  # mark visited by sinking it
              sink(r + 1, c)
              sink(r - 1, c)
              sink(r, c + 1)
              sink(r, c - 1)

          islands = 0
          for r in range(rows):
              for c in range(cols):
                  if grid[r][c] == "1":
                      islands += 1
                      sink(r, c)
          print(islands)`,
        output: "3",
      },
    ],
    mistakes: [
      "No visited check — the traversal loops forever on the first cycle.",
      "Marking visited when popping instead of when pushing in BFS — the same node gets queued many times.",
      "Undirected graph: adding the edge only one way.",
      "Grid: reading `grid[r][c]` before checking `r` and `c` are inside the bounds.",
      "Python: deep recursive DFS on a 1000×1000 grid hits the recursion limit — use BFS or an explicit stack.",
    ],
    remember: "Adjacency list + visited. Shortest steps → BFS with a queue; explore everything / components → DFS.",
    exercises: [
      {
        q: "Rotting oranges: in `[[2, 1, 1], [1, 1, 0], [0, 1, 1]]`, each minute a rotten orange (2) rots its 4 fresh neighbours (1). How many minutes until none are fresh? Print -1 if that never happens.",
        example: "Output: 4",
        hint: "Multi-source BFS: start with every rotten orange in the queue. Process the queue one level (minute) at a time and count fresh oranges as they rot.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  int[][] g = {{2, 1, 1}, {1, 1, 0}, {0, 1, 1}};
                  int rows = g.length, cols = g[0].length, fresh = 0;
                  Queue<int[]> q = new ArrayDeque<>();
                  for (int r = 0; r < rows; r++) {
                      for (int c = 0; c < cols; c++) {
                          if (g[r][c] == 2) q.offer(new int[]{r, c});
                          else if (g[r][c] == 1) fresh++;
                      }
                  }
                  int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
                  int minutes = 0;
                  while (!q.isEmpty() && fresh > 0) {
                      for (int i = q.size(); i > 0; i--) {         // one minute = one level
                          int[] cell = q.poll();
                          for (int[] d : dirs) {
                              int nr = cell[0] + d[0], nc = cell[1] + d[1];
                              if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || g[nr][nc] != 1) continue;
                              g[nr][nc] = 2;
                              fresh--;
                              q.offer(new int[]{nr, nc});
                          }
                      }
                      minutes++;
                  }
                  System.out.println(fresh == 0 ? minutes : -1);
              }
          }`,
        python: `
          from collections import deque

          g = [[2, 1, 1], [1, 1, 0], [0, 1, 1]]
          rows, cols = len(g), len(g[0])
          q, fresh = deque(), 0
          for r in range(rows):
              for c in range(cols):
                  if g[r][c] == 2:
                      q.append((r, c))
                  elif g[r][c] == 1:
                      fresh += 1

          minutes = 0
          while q and fresh > 0:
              for _ in range(len(q)):                      # one minute = one level
                  r, c = q.popleft()
                  for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                      nr, nc = r + dr, c + dc
                      if 0 <= nr < rows and 0 <= nc < cols and g[nr][nc] == 1:
                          g[nr][nc] = 2
                          fresh -= 1
                          q.append((nr, nc))
              minutes += 1
          print(minutes if fresh == 0 else -1)`,
        output: "4",
      },
      {
        q: "Course order (topological sort): 4 courses, prerequisites `[[1, 0], [2, 0], [3, 1], [3, 2]]` where `[a, b]` means b must be taken before a. Print a valid order.",
        example: "Output: 0 1 2 3",
        hint: "Kahn's algorithm: count incoming edges (indegree). Start a queue with every course whose indegree is 0. Pop one, add it to the order, and reduce its neighbours' indegree — push any that reach 0.",
        java: `
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  int n = 4;
                  int[][] pre = {{1, 0}, {2, 0}, {3, 1}, {3, 2}};
                  List<List<Integer>> adj = new ArrayList<>();
                  for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
                  int[] indeg = new int[n];
                  for (int[] p : pre) {
                      adj.get(p[1]).add(p[0]);      // b -> a
                      indeg[p[0]]++;
                  }
                  Queue<Integer> q = new ArrayDeque<>();
                  for (int i = 0; i < n; i++) if (indeg[i] == 0) q.offer(i);
                  List<Integer> order = new ArrayList<>();
                  while (!q.isEmpty()) {
                      int u = q.poll();
                      order.add(u);
                      for (int v : adj.get(u)) {
                          if (--indeg[v] == 0) q.offer(v);
                      }
                  }
                  if (order.size() < n) {
                      System.out.println("impossible (cycle)");
                  } else {
                      StringBuilder sb = new StringBuilder();
                      for (int x : order) sb.append(x).append(' ');
                      System.out.println(sb.toString().trim());
                  }
              }
          }`,
        python: `
          from collections import deque

          n = 4
          pre = [[1, 0], [2, 0], [3, 1], [3, 2]]
          adj = [[] for _ in range(n)]
          indeg = [0] * n
          for a, b in pre:
              adj[b].append(a)             # b -> a
              indeg[a] += 1

          q = deque(i for i in range(n) if indeg[i] == 0)
          order = []
          while q:
              u = q.popleft()
              order.append(u)
              for v in adj[u]:
                  indeg[v] -= 1
                  if indeg[v] == 0:
                      q.append(v)
          if len(order) < n:
              print("impossible (cycle)")
          else:
              print(*order)`,
        output: "0 1 2 3",
      },
    ],
  },

  "Dynamic programming: memo to table": {
    simple: `Dynamic programming (DP) is recursion that remembers. If your recursive solution calls itself with the same arguments again and again — like fib(2) in the recursion lesson — store each answer the first time and reuse it. That alone usually turns exponential time into polynomial time.

    The reliable way to write DP: first write the plain recursion (what does f(i) mean, what's the base case, how does f(i) use smaller calls?). Then add a cache (memoisation, top-down). Optionally turn it into a table filled from the smallest case upwards (tabulation, bottom-up), and finally keep only the rows you still need.`,
    analogy: `Someone writes 1+1+1+1+1 on a board and asks you the total. You count: 5. Then they add "+1" and ask again. You don't recount — you say 6, because you remembered the previous answer. That memory is DP.`,
    how: {
      steps: [
        "Define the state in words: \"`dp[i]` = number of ways to reach step `i`\" or \"best loot from the first `i` houses\".",
        "Write the recurrence: how `dp[i]` comes from smaller states (`dp[i-1] + dp[i-2]`, `max(dp[i-1], dp[i-2] + nums[i])`).",
        "Base cases: the smallest states you can answer directly (`dp[0]`, `dp[1]`).",
        "Top-down: recursion + a memo array / map (or `@lru_cache` in Python). Bottom-up: a loop filling `dp` from the base cases up.",
        "Read the answer from the right cell, then check whether only the last one or two values are needed to save space.",
      ],
    },
    concepts: [
      { term: "Overlapping subproblems", meaning: "The same smaller question is asked many times — the reason caching helps." },
      { term: "Optimal substructure", meaning: "The best answer is built from best answers to smaller problems." },
      { term: "State", meaning: "The parameters that identify a subproblem: `i`, or `(i, j)`, or `(i, remaining)`." },
      { term: "Memoisation (top-down)", meaning: "Recursion that checks the cache before computing and stores the result after." },
      { term: "Tabulation (bottom-up)", meaning: "A loop that fills the table from base cases to the answer — no recursion depth limits." },
      { term: "Space optimisation", meaning: "If `dp[i]` only uses `dp[i-1]` and `dp[i-2]`, keep two variables instead of an array." },
    ],
    syntax: [
      { task: "Memo array", java: "long[] memo = new long[n + 1];\nArrays.fill(memo, -1);", python: "memo = [-1] * (n + 1)" },
      { task: "Automatic memo", java: "// no built-in: use an array or HashMap", python: "from functools import lru_cache\n@lru_cache(maxsize=None)\ndef f(i): ..." },
      { task: "1D table", java: "int[] dp = new int[n + 1];", python: "dp = [0] * (n + 1)" },
      { task: "2D table", java: "int[][] dp = new int[m + 1][n + 1];", python: "dp = [[0] * (n + 1) for _ in range(m + 1)]" },
      { task: "\"Impossible\" value", java: "Integer.MAX_VALUE / 2   // safe to add 1 to", python: "float('inf')" },
    ],
    code: [
      {
        title: "Climbing stairs four ways: recursion → memo → table → two variables",
        note: "You can climb 1 or 2 steps at a time. `ways(n) = ways(n - 1) + ways(n - 2)`, with `ways(0) = ways(1) = 1`. All four functions give the same answer; only the speed and memory change.",
        java: `
          public class Main {
              // 1. Plain recursion: correct but O(2^n)
              static int rec(int n) {
                  if (n <= 1) return 1;
                  return rec(n - 1) + rec(n - 2);
              }

              // 2. Memoisation: same recursion, but remember each answer. O(n)
              static int memo(int n, int[] cache) {
                  if (n <= 1) return 1;
                  if (cache[n] != 0) return cache[n];        // already solved
                  return cache[n] = memo(n - 1, cache) + memo(n - 2, cache);
              }

              // 3. Tabulation: fill the table from small to big. O(n)
              static int table(int n) {
                  int[] dp = new int[n + 1];
                  dp[0] = 1;
                  dp[1] = 1;
                  for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
                  return dp[n];
              }

              // 4. Only the last two values are ever used: O(1) space
              static int twoVars(int n) {
                  int prev2 = 1, prev1 = 1;
                  for (int i = 2; i <= n; i++) {
                      int cur = prev1 + prev2;
                      prev2 = prev1;
                      prev1 = cur;
                  }
                  return prev1;
              }

              public static void main(String[] args) {
                  int n = 5;
                  System.out.println(rec(n) + " " + memo(n, new int[n + 1]) + " " + table(n) + " " + twoVars(n));
              }
          }`,
        python: `
          from functools import lru_cache

          # 1. Plain recursion: correct but O(2^n)
          def rec(n):
              if n <= 1:
                  return 1
              return rec(n - 1) + rec(n - 2)

          # 2. Memoisation: lru_cache remembers every answer. O(n)
          @lru_cache(maxsize=None)
          def memo(n):
              if n <= 1:
                  return 1
              return memo(n - 1) + memo(n - 2)

          # 3. Tabulation: fill the table from small to big. O(n)
          def table(n):
              dp = [0] * (n + 1)
              dp[0] = dp[1] = 1
              for i in range(2, n + 1):
                  dp[i] = dp[i - 1] + dp[i - 2]
              return dp[n]

          # 4. Only the last two values are ever used: O(1) space
          def two_vars(n):
              prev2 = prev1 = 1
              for _ in range(2, n + 1):
                  prev2, prev1 = prev1, prev1 + prev2
              return prev1

          n = 5
          print(rec(n), memo(n), table(n), two_vars(n))`,
        output: "8 8 8 8",
      },
      {
        title: "Coin change: fewest coins for an amount",
        note: "`dp[a]` = fewest coins that make amount `a`. For every coin `c ≤ a`: `dp[a] = min(dp[a], dp[a - c] + 1)`. Amounts that can't be made stay at \"infinity\".",
        java: `
          import java.util.Arrays;

          public class Main {
              static int coinChange(int[] coins, int amount) {
                  int INF = Integer.MAX_VALUE / 2;         // big, but adding 1 can't overflow
                  int[] dp = new int[amount + 1];
                  Arrays.fill(dp, INF);
                  dp[0] = 0;                               // 0 coins make amount 0
                  for (int a = 1; a <= amount; a++) {
                      for (int c : coins) {
                          if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
                      }
                  }
                  return dp[amount] >= INF ? -1 : dp[amount];
              }

              public static void main(String[] args) {
                  System.out.println(coinChange(new int[]{1, 2, 5}, 11));
                  System.out.println(coinChange(new int[]{2}, 3));
              }
          }`,
        python: `
          def coin_change(coins, amount):
              INF = float("inf")
              dp = [0] + [INF] * amount            # 0 coins make amount 0
              for a in range(1, amount + 1):
                  for c in coins:
                      if c <= a:
                          dp[a] = min(dp[a], dp[a - c] + 1)
              return -1 if dp[amount] == INF else dp[amount]

          print(coin_change([1, 2, 5], 11))
          print(coin_change([2], 3))`,
        output: `
          3
          -1`,
      },
    ],
    mistakes: [
      "Jumping straight to a table without being able to say what `dp[i]` means in one sentence.",
      "Wrong base cases or table size — `dp` usually needs `n + 1` cells so `dp[n]` exists.",
      "Using 0 as \"not computed yet\" in a memo when 0 is also a valid answer — fill the memo with -1.",
      "Java: `Integer.MAX_VALUE + 1` overflows to negative inside `min(...)`. Use `MAX_VALUE / 2` as infinity.",
      "Filling the table in the wrong order, so a cell reads a neighbour that isn't computed yet.",
    ],
    remember: "Define dp in words, write the recurrence and base cases, cache it — then turn it into a loop if you like.",
    exercises: [
      {
        q: "House robber: you can't rob two neighbouring houses. What's the most you can rob from `[2, 7, 9, 3, 1]`?",
        example: "Output: 12   (2 + 9 + 1)",
        hint: "At house `i` you either skip it (`best up to i - 1`) or rob it (`best up to i - 2` + `nums[i]`). Two variables are enough.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int[] nums = {2, 7, 9, 3, 1};
                  int prev2 = 0, prev1 = 0;            // best up to i-2 and i-1
                  for (int x : nums) {
                      int cur = Math.max(prev1, prev2 + x);
                      prev2 = prev1;
                      prev1 = cur;
                  }
                  System.out.println(prev1);
              }
          }`,
        python: `
          nums = [2, 7, 9, 3, 1]
          prev2 = prev1 = 0                    # best up to i-2 and i-1
          for x in nums:
              prev2, prev1 = prev1, max(prev1, prev2 + x)
          print(prev1)`,
        output: "12",
      },
      {
        q: "Longest common subsequence of `\"abcde\"` and `\"ace\"` (letters in order, not necessarily next to each other).",
        example: "Output: 3   (\"ace\")",
        hint: "`dp[i][j]` = LCS of the first `i` letters of `a` and the first `j` of `b`. Equal letters: `dp[i-1][j-1] + 1`; otherwise `max(dp[i-1][j], dp[i][j-1])`.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  String a = "abcde", b = "ace";
                  int m = a.length(), n = b.length();
                  int[][] dp = new int[m + 1][n + 1];          // row 0 / column 0 = empty prefix
                  for (int i = 1; i <= m; i++) {
                      for (int j = 1; j <= n; j++) {
                          if (a.charAt(i - 1) == b.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1] + 1;
                          else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                      }
                  }
                  System.out.println(dp[m][n]);
              }
          }`,
        python: `
          a, b = "abcde", "ace"
          m, n = len(a), len(b)
          dp = [[0] * (n + 1) for _ in range(m + 1)]   # row 0 / column 0 = empty prefix
          for i in range(1, m + 1):
              for j in range(1, n + 1):
                  if a[i - 1] == b[j - 1]:
                      dp[i][j] = dp[i - 1][j - 1] + 1
                  else:
                      dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
          print(dp[m][n])`,
        output: "3",
      },
    ],
  },

  "Common bugs & how to debug them": {
    simple: `Most wrong answers in coding rounds don't come from a wrong idea — they come from a handful of small, repeatable bugs: an index that's one off, a number that overflows, comparing objects instead of values, or sharing a list you meant to copy.

    Learn the usual suspects for your language, and learn a calm way to find the rest: reproduce with the smallest failing input, print the state each step, compare with a hand dry run, and fix the first line where they differ.`,
    analogy: `A doctor doesn't guess randomly — they check the common causes first (fever? infection?), then run tests to narrow it down. Debugging is the same: check the usual bugs first, then add prints (tests) to find exactly where things go wrong.`,
    how: {
      steps: [
        "Read the error message: the exception type and the line number usually point straight at the bug.",
        "Shrink the failing input to the smallest case that still fails (often 1–3 elements).",
        "Print the key variables at the start or end of each loop round.",
        "Dry-run the same input by hand; the first round where your table and the prints differ is the bug.",
        "Check the usual suspects: loop bounds, `<` vs `<=`, int overflow, integer division, `==` on objects (Java), shared lists (Python).",
      ],
    },
    concepts: [
      { term: "Off-by-one", meaning: "A loop or index that goes one step too far or stops one too early." },
      { term: "Integer overflow", meaning: "Java `int` past ~2.1×10⁹ wraps negative. Use `long` and cast before multiplying." },
      { term: "Reference equality", meaning: "Java `==` on `Integer`, `String` or other objects compares references, not values." },
      { term: "Aliasing", meaning: "Two names for the same list or array, so changing one changes \"both\"." },
      { term: "Mutable default argument", meaning: "Python evaluates `def f(x, acc=[])` once, so every call shares that one list." },
      { term: "TLE vs WA vs RE", meaning: "Time Limit Exceeded = too slow; Wrong Answer = logic bug; Runtime Error = crash (index, null, recursion depth)." },
    ],
    syntax: [
      { task: "Debug print", java: 'System.out.println("i=" + i + " sum=" + sum);', python: 'print(f"{i=} {sum=}")' },
      { task: "Print to stderr (judges ignore it)", java: "System.err.println(x);", python: "print(x, file=sys.stderr)" },
      { task: "Compare values safely", java: "a.equals(b)   // Integer, String", python: "a == b" },
      { task: "Same object?", java: "a == b        // objects", python: "a is b" },
      { task: "Safe midpoint", java: "lo + (hi - lo) / 2", python: "(lo + hi) // 2" },
      { task: "Catch an error", java: "try { ... } catch (Exception e) { ... }", python: "try:\n    ...\nexcept Exception as e:\n    ..." },
    ],
    code: [
      {
        title: "The classic traps, one tab per language",
        note: "These programs are different on purpose: the Java tab shows Java traps, the Python tab shows Python traps.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  Integer a = 127, b = 127, c = 1000, d = 1000;
                  System.out.println(a == b);          // true: small Integers are cached
                  System.out.println(c == d);          // false! == compares references
                  System.out.println(c.equals(d));     // true: compare values with equals

                  int lo = 2_000_000_000, hi = 2_100_000_000;
                  System.out.println((lo + hi) / 2);       // overflow: a negative number
                  System.out.println(lo + (hi - lo) / 2);  // safe midpoint

                  int[] arr = new int[3];
                  try {
                      arr[3] = 1;                      // valid indexes are 0..2
                  } catch (ArrayIndexOutOfBoundsException e) {
                      System.out.println("Error: " + e.getMessage());
                  }
              }
          }`,
        python: `
          def add_item(item, bucket=[]):       # BUG: one default list shared by every call
              bucket.append(item)
              return bucket

          print(add_item(1))
          print(add_item(2))                   # [1, 2], not [2]

          def add_item_fixed(item, bucket=None):
              if bucket is None:
                  bucket = []                  # a new list on every call
              bucket.append(item)
              return bucket

          print(add_item_fixed(2))

          grid = [[0] * 3] * 2                 # BUG: both rows are the same list
          grid[0][0] = 5
          print(grid)
          grid = [[0] * 3 for _ in range(2)]   # one new list per row
          grid[0][0] = 5
          print(grid)

          nums = [1, 2, 2, 3]
          for x in nums[:]:                    # loop over a copy when removing
              if x == 2:
                  nums.remove(x)
          print(nums)`,
        output: {
          java: `
            true
            false
            true
            -97483648
            2050000000
            Error: Index 3 out of bounds for length 3`,
          python: `
            [1]
            [1, 2]
            [2]
            [[5, 0, 0], [5, 0, 0]]
            [[5, 0, 0], [0, 0, 0]]
            [1, 3]`,
        },
      },
    ],
    mistakes: [
      "Changing code at random until the output looks right — find the first wrong step instead.",
      "Only testing the sample input. Also try empty, one element, all equal, negatives and the largest size.",
      "Leaving debug prints in the submission — the extra output makes it a wrong answer.",
      "Ignoring TLE as \"probably fine\". It means the complexity is too high for the constraints.",
      "Java: forgetting to reset per-test-case variables (static arrays, counters) between test cases.",
    ],
    remember: "Smallest failing input, print the state, compare with your dry run, fix the first difference.",
    exercises: [
      {
        q: "This should print the sum of 1..n for n = 5 (expected 15) but prints 10. Fix it.",
        example: `
          sum = 0
          for i from 1 while i < n:
              sum += i
          print(sum)`,
        hint: "Which numbers does the loop actually visit? Write them down for n = 5.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int n = 5, sum = 0;
                  for (int i = 1; i <= n; i++) sum += i;   // <= so that n itself is included
                  System.out.println(sum);
              }
          }`,
        python: `
          n, total = 5, 0
          for i in range(1, n + 1):    # range stops before its end, so use n + 1
              total += i
          print(total)`,
        output: "15",
      },
      {
        q: "This should print the average of `[1, 2]` (1.5) but prints 1. Fix it.",
        example: `
          sum = 1 + 2
          count = 2
          avg = sum / count      # Java with ints, or // in Python
          print(avg)`,
        hint: "Whole-number division throws away the .5. Make the division a decimal one.",
        java: `
          public class Main {
              public static void main(String[] args) {
                  int[] a = {1, 2};
                  int sum = 0;
                  for (int x : a) sum += x;
                  double avg = (double) sum / a.length;    // cast BEFORE dividing
                  System.out.println(avg);
              }
          }`,
        python: `
          a = [1, 2]
          avg = sum(a) / len(a)        # / is decimal division; // would give 1
          print(avg)`,
        output: "1.5",
      },
    ],
  },
};
