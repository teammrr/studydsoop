import { sameFormula } from "./sumMath";

export type Rubric = { t: string; pts: number };
export type Part =
  | { kind: "blank"; id: string; label: string; pts: number; accept: string[]; mode: "loose" | "code"; model: string; why: string; placeholder?: string }
  | { kind: "free"; id: string; label: string; pts: number; rows?: number; model: string; rubric: Rubric[]; formula?: (n: number) => number; placeholder?: string };
export type Prob = { id: string; title: string; intro: string; code?: string; parts: Part[] };
export type Paper = { id: string; title: string; blurb: string; mins: number; probs: Prob[] };

export const partMax = (p: Part) => p.pts;
export const probMax = (pr: Prob) => pr.parts.reduce((a, p) => a + p.pts, 0);
export const paperMax = (pa: Paper) => pa.probs.reduce((a, pr) => a + probMax(pr), 0);
export { sameFormula };

const ID_BLANK = (id: string, n: number, label: string, ans: string, why: string): Part => ({ kind: "blank", id, label: `${n} · ${label}`, pts: 0.5, accept: [ans], mode: "loose", model: ans, why, placeholder: "output" });

/* ============================ the quiz you were given ============================ */
const ORIGINAL_P1 = `class Puppy {
    String name;
    static String breed;
    int weight;
    Puppy(String name, int weight) { this.name = name; this.weight = weight; }
}
public class Main {
    static void magicTrick(Puppy a, Puppy b) {
        Puppy t = a; a = b; b = t;
    }
    static void spellPotion(Puppy x) { x.weight = x.weight / 2; }
    static void reboot(Puppy x) {
        x = new Puppy(x.name, 0);
        x.breed = "mixed";
    }
    public static void main(String[] args) {
        Puppy kone = new Puppy("Fluffy", 25);
        Puppy ktwo = new Puppy("Mittens", 30);
        Puppy kthree = new Puppy("Fl" + "u" + "ffy", 30-5);
        Puppy[] puppies = {kone, ktwo, kthree};
        Puppy[] woofies = {kone, ktwo, kthree};
        kone.breed = "Goldie";
        ktwo.breed = "Poodle";
        println(kone.breed);                      // 1
        println(puppies == woofies);              // 2
        println(kone.breed.equals(kthree.breed)); // 3
        spellPotion(puppies[1]);
        println(ktwo.weight);                     // 4
        magicTrick(kone, ktwo);
        println(kone.name);                       // 5
        println(ktwo.name);                       // 6
        println(kone.weight == kthree.weight);    // 7
        woofies[0] = puppies[1];
        println(kone.weight);                     // 8
        reboot(kone);
        println(kone.weight);                     // 9
        println(ktwo.breed);                      // 10
    }
}`;

const ORIGINAL_P3 = `public int[] numA(String[] charArray) {
    int n = charArray.length;

    ____(1)____ counts = new ____(2)____;
    for (int k=0; k<n; k++) {
        String st = charArray[k];
        for (int j=0; j<st.length(); j++) {

            char ch = ____(3)____;  // extract the j-th character

            if (____(4)____)

                ____(5)____;
        }
    }
    return counts;
}`;

const LIST_CODE = `public class SLList {
    private static class StrNode {
        String head;   // a String data item
        StrNode next;  // ref to the next node

        public StrNode(String val, StrNode next) {
            this.head = val; this.next = next;
        }
    }

    private StrNode sen;

    public SLList() { sen = new StrNode("dummy", null); }

    public void addFirst(String x) { sen.next = new StrNode(x, sen.next); }
}`;

export const ORIGINAL: Paper = {
  id: "original",
  title: "Original paper (T.III/24–25)",
  blurb: "The exact quiz you were given. Try it cold, then compare with the model answers.",
  mins: 45,
  probs: [
    {
      id: "p1",
      title: "Problem 1 · Instant Questions (0.5 × 10)",
      intro: "Indicate what each print will display. (println here means System.out.println.)",
      code: ORIGINAL_P1,
      parts: [
        ID_BLANK("o1-1", 1, "kone.breed", "Poodle", "breed is static: one shared box. Poodle was written last."),
        ID_BLANK("o1-2", 2, "puppies == woofies", "false", "Two different array objects. == compares arrows, not contents."),
        ID_BLANK("o1-3", 3, "kone.breed.equals(kthree.breed)", "true", "Both read the same static box."),
        ID_BLANK("o1-4", 4, "ktwo.weight", "15", "spellPotion wrote through a copy of the arrow: 30 / 2."),
        ID_BLANK("o1-5", 5, "kone.name", "Fluffy", "magicTrick swapped only its own copies."),
        ID_BLANK("o1-6", 6, "ktwo.name", "Mittens", "Same reason."),
        ID_BLANK("o1-7", 7, "kone.weight == kthree.weight", "true", "== on ints compares values: 25 == 25."),
        ID_BLANK("o1-8", 8, "kone.weight", "25", "woofies[0] = ... changes an array slot, not the variable kone."),
        ID_BLANK("o1-9", 9, "kone.weight", "25", "reboot re-pointed only its local x."),
        ID_BLANK("o1-10", 10, "ktwo.breed", "mixed", "reboot wrote the one static box."),
      ],
    },
    {
      id: "p2",
      title: "Problem 2 · Summation technique and math proof (10)",
      intro: "T(n) is what specialSum(n) returns: T(n) = 1 + 6 + 11 + … + (5n − 4). Type your answers as plain text (write Σ as sum, e.g. sum_{i=1}^{n} (…)).",
      code: `int specialSum(int n) { // computes the sum of 1, 6, 11, 16, 21, ..., 5n-4
    int total = 0;
    for (int i=1; i<=n; i++) total += 5*i - 4;
    return total;
}`,
      parts: [
        {
          kind: "free", id: "o2-1", label: "1 · T(n) in summation notation  [1 pt]", pts: 1, rows: 2,
          model: "T(n) = Σ_{i=1}^{n} (5i − 4)",
          rubric: [{ t: "Bounds i = 1 to n and body 5i − 4", pts: 1 }],
        },
        {
          kind: "free", id: "o2-2", label: "2 · Rewrite with the largest term first  [2 pts]", pts: 2, rows: 2,
          model: "T(n) = Σ_{i=1}^{n} (5(n − i + 1) − 4) = Σ_{i=1}^{n} (5n − 5i + 1)\n(i.e. n-th term first: 5n−4, 5n−9, …, 1)",
          rubric: [{ t: "Replaces i by (n − i + 1) (or lists the terms backwards)", pts: 1 }, { t: "Simplifies correctly to 5n − 5i + 1 (or leaves a correct equivalent)", pts: 1 }],
        },
        {
          kind: "free", id: "o2-3", label: "3 · Add the two equations: 2T(n) = ?  [2 pts, show work]", pts: 2, rows: 3,
          model: "2T(n) = Σ [(5i − 4) + (5n − 5i + 1)] = Σ_{i=1}^{n} (5n − 3) = n(5n − 3)",
          rubric: [{ t: "Adds term by term and the i's cancel to 5n − 3", pts: 1 }, { t: "Sums n equal terms to n(5n − 3)", pts: 1 }],
        },
        {
          kind: "free", id: "o2-4", label: "4 · Closed form of T(n)  [1 pt]", pts: 1, rows: 1, formula: (n) => (n * (5 * n - 3)) / 2, placeholder: "e.g. n(5n-3)/2",
          model: "T(n) = n(5n − 3) / 2",
          rubric: [{ t: "Divides 2T(n) by 2: n(5n − 3)/2", pts: 1 }],
        },
        {
          kind: "free", id: "o2-5", label: "5 · True or False: if n is odd then T(n) is odd?  Prove or refute.  [4 pts]", pts: 4, rows: 6,
          model: "FALSE. Counterexample: n = 3 is odd (3 = 2·1 + 1).\nT(3) = 1 + 6 + 11 = 18 = 2·9, which is even (it is 2k, not 2k + 1).\n(Check with the formula: 3·12/2 = 18.)",
          rubric: [{ t: "Says FALSE", pts: 1 }, { t: "Picks a valid ODD n (n = 3, 7, 11 …) and shows it is odd", pts: 1 }, { t: "Computes T(n) correctly", pts: 1 }, { t: "Concludes T(n) is even, so not of the form 2k + 1", pts: 1 }],
        },
      ],
    },
    {
      id: "p3",
      title: "Problem 3 · Fill in the blanks (5)",
      intro: "numA returns an int[] whose j-th number is the number of lowercase i's in the j-th String. Example: numA({\"b1n\", \"iRS\", \"mini\", \"viii\", \"I1iI1\"}) returns {0,1,2,3,1}. Fill the blanks.",
      code: ORIGINAL_P3,
      parts: [
        { kind: "blank", id: "o3-1", label: "(1) type of counts", pts: 1, mode: "code", accept: ["int[]"], model: "int[]", why: "The method returns an int[], and counts is what we return.", placeholder: "type" },
        { kind: "blank", id: "o3-2", label: "(2) create the array", pts: 1, mode: "code", accept: ["new int[n]", "new int[charArray.length]"], model: "new int[n]", why: "One tally per input string, so size n. (The right-hand side already says new, so write the whole 'new int[…]' piece.)", placeholder: "new …" },
        { kind: "blank", id: "o3-3", label: "(3) the j-th character", pts: 1, mode: "code", accept: ["st.charAt(j)"], model: "st.charAt(j)", why: "Strings use charAt(index), not st[j].", placeholder: "expression" },
        { kind: "blank", id: "o3-4", label: "(4) the test", pts: 1, mode: "code", accept: ["ch == 'i'", "'i' == ch"], model: "ch == 'i'", why: "A char is compared with == and SINGLE quotes. Only lowercase i counts (see the I1iI1 example → 1).", placeholder: "condition" },
        { kind: "blank", id: "o3-5", label: "(5) the update", pts: 1, mode: "code", accept: ["counts[k]++", "++counts[k]", "counts[k] += 1", "counts[k] = counts[k] + 1"], model: "counts[k]++", why: "Tally for the k-th string goes up by one (k, not j).", placeholder: "statement" },
      ],
    },
    {
      id: "p4",
      title: "Problem 4 · Singly-linked list with a sentinel (2 + 2 + 6)",
      intro: "sen refers to the sentinel node; sen.next is the real first node. Add three methods to SLList (no new member variables; do not change existing methods): (1) isEmpty() returns whether the list is empty (must not break on empty; must not modify the list). (2) removeFirst() removes the front item; does nothing if empty. (3) count(String target) returns how many times target occurs; walk the list once; do not modify it. (The paper says 'void count', but it must return the number: use int.)",
      code: LIST_CODE,
      parts: [
        {
          kind: "free", id: "o4-1", label: "(1) isEmpty()  [2 pts]", pts: 2, rows: 4,
          model: "public boolean isEmpty() {\n    return sen.next == null;\n}",
          rubric: [{ t: "Looks at sen.next (NOT sen, which is never null)", pts: 1 }, { t: "Returns a boolean and does not modify anything", pts: 1 }],
        },
        {
          kind: "free", id: "o4-2", label: "(2) removeFirst()  [2 pts]", pts: 2, rows: 6,
          model: "public void removeFirst() {\n    if (sen.next != null) {\n        sen.next = sen.next.next;\n    }\n}",
          rubric: [{ t: "Guards the empty case (no NullPointerException)", pts: 1 }, { t: "Rewires sen.next = sen.next.next", pts: 1 }],
        },
        {
          kind: "free", id: "o4-3", label: "(3) count(String target)  [6 pts]", pts: 6, rows: 11,
          model: "public int count(String target) {\n    int c = 0;\n    StrNode p = sen.next;\n    while (p != null) {\n        if (p.head.equals(target)) {\n            c++;\n        }\n        p = p.next;\n    }\n    return c;\n}",
          rubric: [
            { t: "Counter initialised to 0 and returned at the end", pts: 1 },
            { t: "Starts the walk at sen.next (not at the dummy node)", pts: 1 },
            { t: "Loop condition stops at null (p != null)", pts: 1 },
            { t: "Compares Strings with .equals (not ==)", pts: 1 },
            { t: "Increments the counter on a match", pts: 1 },
            { t: "Advances p = p.next on EVERY iteration (so it terminates) and does not modify the list", pts: 1 },
          ],
        },
      ],
    },
  ],
};

/* ============================ a fresh mock, same shape ============================ */
const FRESH_P1 = `class Robot {
    String id;
    static String mode;
    int power;
    Robot(String id, int power) { this.id = id; this.power = power; }
}
public class Main {
    static void shuffle(Robot a, Robot b) {
        Robot t = a; a = b; b = t;
    }
    static void charge(Robot x) { x.power = x.power + 10; }
    static void wipe(Robot x) {
        x = new Robot(x.id, 0);
        x.mode = "idle";
    }
    public static void main(String[] args) {
        Robot r1 = new Robot("A1", 40);
        Robot r2 = new Robot("B2", 20);
        Robot r3 = new Robot("A" + "1", 50 - 10);
        Robot[] fleet = {r1, r2, r3};
        Robot[] backup = fleet;
        r1.mode = "run";
        r2.mode = "sleep";
        println(r1.mode);                  // 1
        println(fleet == backup);          // 2
        println(r1.id.equals(r3.id));      // 3
        charge(fleet[1]);
        println(r2.power);                 // 4
        shuffle(r1, r2);
        println(r1.id);                    // 5
        println(r2.id);                    // 6
        println(r1.power == r3.power);     // 7
        backup[0] = fleet[1];
        println(fleet[0].id);              // 8
        wipe(r1);
        println(r1.power);                 // 9
        println(r2.mode);                  // 10
    }
}`;

const FRESH_P3 = `public int[] numDigits(String[] words) {
    int n = words.length;

    ____(1)____ counts = new ____(2)____;
    for (int k=0; k<n; k++) {
        String st = words[k];
        for (int j=0; j<st.length(); j++) {

            char ch = ____(3)____;  // extract the j-th character

            if (____(4)____)

                ____(5)____;
        }
    }
    return counts;
}`;

export const FRESH: Paper = {
  id: "fresh",
  title: "Fresh mock (same shape, new content)",
  blurb: "Same four problem types, same points, new code. This is your honest test after the stations.",
  mins: 45,
  probs: [
    {
      id: "p1",
      title: "Problem 1 · Instant Questions (0.5 × 10)",
      intro: "Indicate what each print will display. Watch the line that makes backup.",
      code: FRESH_P1,
      parts: [
        ID_BLANK("f1-1", 1, "r1.mode", "sleep", "mode is static: one shared box; sleep was written last."),
        ID_BLANK("f1-2", 2, "fleet == backup", "true", "backup = fleet copies the arrow, so both names point at the SAME array. (Unlike the Puppy quiz, there is no second array.)"),
        ID_BLANK("f1-3", 3, "r1.id.equals(r3.id)", "true", "\"A1\" and \"A\" + \"1\" have the same contents: equals compares contents."),
        ID_BLANK("f1-4", 4, "r2.power", "30", "charge wrote through a copy of the arrow: 20 + 10."),
        ID_BLANK("f1-5", 5, "r1.id", "A1", "shuffle swapped only its own copies."),
        ID_BLANK("f1-6", 6, "r2.id", "B2", "Same reason."),
        ID_BLANK("f1-7", 7, "r1.power == r3.power", "true", "== on ints compares values: 40 == 40."),
        ID_BLANK("f1-8", 8, "fleet[0].id", "B2", "backup and fleet are the same array, so backup[0] = fleet[1] changed fleet[0] too. It now holds the B2 robot."),
        ID_BLANK("f1-9", 9, "r1.power", "40", "wipe re-pointed only its local x. r1 still points at its robot."),
        ID_BLANK("f1-10", 10, "r2.mode", "idle", "wipe wrote the one static box."),
      ],
    },
    {
      id: "p2",
      title: "Problem 2 · Summation technique and math proof (10)",
      intro: "T(n) is what tripleSum(n) returns: T(n) = 2 + 5 + 8 + … + (3n − 1). Type your answers as plain text.",
      code: `int tripleSum(int n) { // computes 2 + 5 + 8 + ... + (3n - 1)
    int total = 0;
    for (int i=1; i<=n; i++) total += 3*i - 1;
    return total;
}`,
      parts: [
        {
          kind: "free", id: "f2-1", label: "1 · T(n) in summation notation  [1 pt]", pts: 1, rows: 2,
          model: "T(n) = Σ_{i=1}^{n} (3i − 1)",
          rubric: [{ t: "Bounds i = 1 to n and body 3i − 1", pts: 1 }],
        },
        {
          kind: "free", id: "f2-2", label: "2 · Rewrite with the largest term first  [2 pts]", pts: 2, rows: 2,
          model: "T(n) = Σ_{i=1}^{n} (3(n − i + 1) − 1) = Σ_{i=1}^{n} (3n − 3i + 2)",
          rubric: [{ t: "Replaces i by (n − i + 1) (or lists the terms backwards)", pts: 1 }, { t: "Simplifies correctly to 3n − 3i + 2", pts: 1 }],
        },
        {
          kind: "free", id: "f2-3", label: "3 · Add the two equations: 2T(n) = ?  [2 pts, show work]", pts: 2, rows: 3,
          model: "2T(n) = Σ [(3i − 1) + (3n − 3i + 2)] = Σ_{i=1}^{n} (3n + 1) = n(3n + 1)",
          rubric: [{ t: "Adds term by term and the i's cancel to 3n + 1", pts: 1 }, { t: "Sums n equal terms to n(3n + 1)", pts: 1 }],
        },
        {
          kind: "free", id: "f2-4", label: "4 · Closed form of T(n)  [1 pt]", pts: 1, rows: 1, formula: (n) => (n * (3 * n + 1)) / 2, placeholder: "e.g. n(3n+1)/2",
          model: "T(n) = n(3n + 1) / 2",
          rubric: [{ t: "Divides by 2: n(3n + 1)/2", pts: 1 }],
        },
        {
          kind: "free", id: "f2-5", label: "5 · True or False: if n is even then T(n) is even?  Prove or refute.  [4 pts]", pts: 4, rows: 6,
          model: "FALSE. Counterexample: n = 2 is even (2 = 2·1).\nT(2) = 2 + 5 = 7 = 2·3 + 1, which is odd.\n(Check with the formula: 2·7/2 = 7.)",
          rubric: [{ t: "Says FALSE", pts: 1 }, { t: "Picks a valid EVEN n (n = 2, 6, 10 …) and shows it is even", pts: 1 }, { t: "Computes T(n) correctly", pts: 1 }, { t: "Concludes T(n) is odd, so not even (not of the form 2k)", pts: 1 }],
        },
      ],
    },
    {
      id: "p3",
      title: "Problem 3 · Fill in the blanks (5)",
      intro: "numDigits returns an int[] whose j-th number is the number of digit characters ('0' to '9') in the j-th String. Example: numDigits({\"a1b2\", \"xyz\", \"007\", \"9\"}) returns {2,0,3,1}. Fill the blanks.",
      code: FRESH_P3,
      parts: [
        { kind: "blank", id: "f3-1", label: "(1) type of counts", pts: 1, mode: "code", accept: ["int[]"], model: "int[]", why: "The method returns int[].", placeholder: "type" },
        { kind: "blank", id: "f3-2", label: "(2) create the array", pts: 1, mode: "code", accept: ["new int[n]", "new int[words.length]"], model: "new int[n]", why: "One tally per word.", placeholder: "new …" },
        { kind: "blank", id: "f3-3", label: "(3) the j-th character", pts: 1, mode: "code", accept: ["st.charAt(j)"], model: "st.charAt(j)", why: "charAt(j) on the String st.", placeholder: "expression" },
        { kind: "blank", id: "f3-4", label: "(4) the test", pts: 1, mode: "code", accept: ["ch >= '0' && ch <= '9'", "Character.isDigit(ch)", "ch >= 48 && ch <= 57", "'0' <= ch && ch <= '9'"], model: "ch >= '0' && ch <= '9'", why: "Digits are the chars '0'..'9' in order, so a range test works. Character.isDigit(ch) is also fine.", placeholder: "condition" },
        { kind: "blank", id: "f3-5", label: "(5) the update", pts: 1, mode: "code", accept: ["counts[k]++", "++counts[k]", "counts[k] += 1", "counts[k] = counts[k] + 1"], model: "counts[k]++", why: "Tally for word k goes up by one.", placeholder: "statement" },
      ],
    },
    {
      id: "p4",
      title: "Problem 4 · Singly-linked list with a sentinel (2 + 2 + 6)",
      intro: "Same SLList as before (sen is the sentinel; sen.next is the first real node). Add: (1) size() returns the number of items (the sentinel does not count); must not modify the list. (2) contains(String target) returns whether target is in the list; must not modify it. (3) removeAll(String target) removes EVERY node whose data equals target, in a single pass; if none match, nothing changes. No new member variables.",
      code: LIST_CODE,
      parts: [
        {
          kind: "free", id: "f4-1", label: "(1) size()  [2 pts]", pts: 2, rows: 6,
          model: "public int size() {\n    int c = 0;\n    for (StrNode p = sen.next; p != null; p = p.next) {\n        c++;\n    }\n    return c;\n}",
          rubric: [{ t: "Walks from sen.next until null (does not count the dummy)", pts: 1 }, { t: "Counts once per node and returns the count", pts: 1 }],
        },
        {
          kind: "free", id: "f4-2", label: "(2) contains(String target)  [2 pts]", pts: 2, rows: 7,
          model: "public boolean contains(String target) {\n    for (StrNode p = sen.next; p != null; p = p.next) {\n        if (p.head.equals(target)) return true;\n    }\n    return false;\n}",
          rubric: [{ t: "Safe walk over the whole list (stops at null)", pts: 1 }, { t: "Uses .equals; returns true on a match and false only after the loop", pts: 1 }],
        },
        {
          kind: "free", id: "f4-3", label: "(3) removeAll(String target)  [6 pts]", pts: 6, rows: 12,
          model: "public void removeAll(String target) {\n    StrNode prev = sen;\n    while (prev.next != null) {\n        if (prev.next.head.equals(target)) {\n            prev.next = prev.next.next;   // unlink; do NOT advance\n        } else {\n            prev = prev.next;\n        }\n    }\n}",
          rubric: [
            { t: "Walks with a 'previous' pointer that starts at the sentinel", pts: 1 },
            { t: "Loop stops when prev.next is null (no NullPointerException)", pts: 1 },
            { t: "Compares with .equals", pts: 1 },
            { t: "Unlinks with prev.next = prev.next.next", pts: 1 },
            { t: "Does NOT advance after an unlink (so consecutive matches are removed)", pts: 1 },
            { t: "Advances prev = prev.next otherwise, so the loop terminates", pts: 1 },
          ],
        },
      ],
    },
  ],
};

export const PAPERS: Paper[] = [FRESH, ORIGINAL];
