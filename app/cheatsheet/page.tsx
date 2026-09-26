import { Code, I } from "@/components/ui";

export const metadata = { title: "Cheat sheet · DSOOP Quiz Prep" };

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-2 mt-8 text-xl font-semibold tracking-tight">{children}</h2>
);

export default function Page() {
  return (
    <div className="prose-l">
      <h1 className="text-4xl font-bold tracking-tight">Cheat sheet</h1>
      <p className="muted">Read this on quiz morning. Everything links back to a lesson if a line doesn&apos;t make sense.</p>

      <H>The 6-step loop</H>
      <ol>
        <li><strong>Restate:</strong> inputs, output, mutate or return new? Smallest input?</li>
        <li><strong>Trace</strong> a small example by hand, narrating what you do.</li>
        <li><strong>Name the pattern:</strong> accumulator · running best · scan with index · walk a pointer · build new · recurse on the rest · shift items · stack.</li>
        <li><strong>Plan</strong> in plain words; say what each variable means.</li>
        <li><strong>Code</strong> the skeleton; get bounds right first.</li>
        <li><strong>Test</strong> empty / one / boundary, then trace your code.</li>
      </ol>

      <H>Java essentials</H>
      <Code code={`int[] a = new int[n];     // zero-filled, fixed length\na.length                  // array: field; String: s.length()\nfor (int i = 0; i < a.length; i++) { }\nfor (int x : a) { }\nint[][] g = new int[r][c];   int[][] t = new int[n][];  // t[i] must be created\nArrays.toString(a)   Arrays.copyOf(a, a.length)\n7 / 2 == 3   7 / 2.0 == 3.5\ns.equals(t)   // not ==\nBigInteger x = BigInteger.valueOf(5).multiply(y);`} />

      <H>References: the Rule of Equals</H>
      <ul>
        <li><I>=</I> and parameter passing <strong>copy the bits</strong>. Primitive: the value. Reference: the arrow.</li>
        <li>Only <I>new</I> makes an object.</li>
        <li>Changing an object through a copied arrow is visible to the caller. Re-pointing the local arrow is not.</li>
        <li>Following <I>null</I> → NullPointerException.</li>
      </ul>

      <H>Overloading & static</H>
      <ul>
        <li>Signature = name + parameter types. Return type and parameter names don&apos;t count.</li>
        <li>Resolution: exact match → widening (int→double) → compile error. double→int needs a cast.</li>
        <li><I>static</I> = one copy owned by the class (<I>Class.x</I>). No <I>this</I> inside static methods.</li>
      </ul>

      <H>Linked list templates</H>
      <Code code={`// visit every node\nIntNode cur = this;\nwhile (cur != null) { …; cur = cur.next; }\n\n// stop ON the last node\nwhile (cur.next != null) cur = cur.next;\n\n// recursion on the rest\nif (next == null) return BASE;\nreturn COMBINE(head, next.method());\n\n// insert after p (order matters!)\np.next = new IntNode(x, p.next);\n\n// delete the node after p\np.next = p.next.next;`} />

      <H>SLList with sentinel</H>
      <ul>
        <li>Fields: <I>sentinel</I> (dummy node), <I>size</I>. Empty list: <I>sentinel.next == null</I>.</li>
        <li>addFirst: <I>sentinel.next = new IntNode(x, sentinel.next); size++;</I></li>
        <li>addLast: <I>p = sentinel</I>, walk while <I>p.next != null</I>, attach.</li>
        <li>removeFirst: guard <I>size == 0</I>; <I>sentinel.next = sentinel.next.next; size--;</I></li>
        <li>Every mutator keeps <I>size</I> right.</li>
      </ul>

      <H>Generics, stacks, queues</H>
      <ul>
        <li><I>SLList&lt;T&gt;</I>; type argument must be a reference type: int→Integer, double→Double, char→Character, boolean→Boolean, long→Long.</li>
        <li>Autoboxing: int → Integer only. <I>SLList&lt;Double&gt;.addFirst(5)</I> fails; use <I>5.0</I>.</li>
        <li>Stack = LIFO (push/pop same end). Queue = FIFO (enqueue rear, dequeue front).</li>
        <li>&quot;Match/undo/most-recent&quot; → stack. &quot;In arrival order&quot; → queue.</li>
      </ul>

      <H>ArrayList</H>
      <Code code={`items = (T[]) new Object[cap];   // can't do new T[cap]\n// invariants: items[0..size-1] valid; last = items[size-1]; next free = items[size]\nif (size == items.length) resize(size * 2);\nitems[size] = x;  size++;\n\nT r = items[size - 1];  items[size - 1] = null;  size--;  return r;`} />
      <ul>
        <li>Doubling: total copying over n adds is under 2n (amortized constant). +1 growth: about n²/2.</li>
        <li>get(i) constant. addFirst / removeFirst shift everything: grows with n.</li>
        <li>Null out removed slots so garbage collection can free objects.</li>
      </ul>

      <H>Running time table</H>
      <div className="card my-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr style={{ background: "var(--panel2)" }}><th className="px-3 py-2">op</th><th className="px-3 py-2">AList</th><th className="px-3 py-2">SLList (sentinel)</th></tr></thead>
          <tbody>
            {[["get(i)", "const", "∝ i"], ["addFirst", "∝ n", "const"], ["addLast", "const (amortized)", "∝ n"], ["removeFirst", "∝ n", "const"], ["removeLast", "const", "∝ n"], ["size()", "const", "const (stored)"]].map(([a, b, c]) => (
              <tr key={a} className="border-t" style={{ borderColor: "var(--line)" }}><td className="mono px-3 py-1.5">{a}</td><td className="px-3 py-1.5">{b}</td><td className="px-3 py-1.5">{c}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <H>Loop invariants</H>
      <ul>
        <li>Invariant = true just before every loop-condition test (entry + after each iteration).</li>
        <li>Prove: <strong>init</strong>, <strong>preservation</strong>, <strong>termination</strong> (a measure that shrinks). At exit: invariant ∧ ¬condition ⇒ postcondition.</li>
        <li>Find it by tabulating variables per iteration. Sentence form: &quot;at the top I have already ____&quot;.</li>
        <li><I>if (P)</I>: P holds in the branch; <I>else</I>: ¬P.</li>
      </ul>

      <H>Which exception, when?</H>
      <div className="card my-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <tbody>
            {[
              ["ArrayIndexOutOfBoundsException", "index < 0 or ≥ length, e.g. a[a.length], i <= a.length"],
              ["NullPointerException", "using . or [] on null: t[0][0] on unmade row, cur.next after cur == null, removeFirst on empty w/o guard"],
              ["StackOverflowError", "recursion never reaches its base case"],
              ["compile error", "static method using instance variable; int→Double boxing; duplicate signature; variable out of scope"],
            ].map(([a, b]) => (
              <tr key={a} className="border-t first:border-t-0" style={{ borderColor: "var(--line)" }}><td className="mono px-3 py-1.5">{a}</td><td className="px-3 py-1.5">{b}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
