"use client";
import { ReactNode, useState } from "react";
import { Callout, Check, Code, I, Sec } from "./ui";

/* ---------- small building block: toy-box story + real Java ---------- */
function Story({ emoji, title, toy, java }: { emoji: string; title: string; toy: ReactNode; java: ReactNode }) {
  return (
    <div className="card card-pad my-4">
      <div className="text-lg font-semibold">
        <span className="mr-2">{emoji}</span>
        {title}
      </div>
      <div className="mt-2 rounded-lg px-3 py-2" style={{ background: "var(--warn-soft)" }}>
        <div className="mb-0.5 text-xs font-bold uppercase tracking-wider">Toy-box version</div>
        <div className="prose-l text-[0.95rem]">{toy}</div>
      </div>
      <div className="mt-2 rounded-lg px-3 py-2" style={{ background: "var(--teal-soft)" }}>
        <div className="mb-0.5 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--teal)" }}>
          Real Java version
        </div>
        <div className="prose-l text-[0.95rem]">{java}</div>
      </div>
    </div>
  );
}

/* ================= L6: constructor birth-order stepper ================= */
const AB = String.raw`
class A {
  int y;
  A(int x) {
    System.out.printf("A(%d)\n", x);
    y = 2*x+1;
  }
  A() {
    this(3);
    System.out.println("A()");
  }
}

class B extends A {
  B(String st) {
    System.out.printf("B(st:%s)\n", st);
  }
  B(int val) {
    this(Integer.toString(val));
    System.out.printf("B(val:%d)\n", val);
  }
  B() {
    this(1);
    System.out.println("B()");
  }
}

// main: B b = new B();
`;

const STEPS: { stack: string[]; out: string[]; say: string }[] = [
  { stack: ["B()"], out: [], say: "new B() starts. Its first line is this(1), so it says: let me ask B(int) to do this first." },
  { stack: ["B()", "B(int val = 1)"], out: [], say: "B(int) also starts with this(...). It turns 1 into the text \"1\" and hands off to B(String)." },
  { stack: ["B()", "B(int)", "B(String st = \"1\")"], out: [], say: "B(String) has no this(...) or super(...) on its first line, so Java quietly inserts super(). A child cannot exist before its parent, so A() runs first." },
  { stack: ["B()", "B(int)", "B(String)", "A()"], out: [], say: "A() starts with this(3), so it hands off to A(int)." },
  { stack: ["B()", "B(int)", "B(String)", "A()", "A(int x = 3)"], out: ["A(3)"], say: "A(int) has no hand-off (A's parent is Object), so it finally does real work: prints A(3) and sets y = 7." },
  { stack: ["B()", "B(int)", "B(String)", "A()"], out: ["A(3)", "A()"], say: "A(int) is finished. Back in A(), the next line prints A()." },
  { stack: ["B()", "B(int)", "B(String)"], out: ["A(3)", "A()", "B(st:1)"], say: "The parent is fully born. Now B(String) runs its own body and prints B(st:1)." },
  { stack: ["B()", "B(int)"], out: ["A(3)", "A()", "B(st:1)", "B(val:1)"], say: "Back in B(int): the line after this(...) prints B(val:1)." },
  { stack: ["B()"], out: ["A(3)", "A()", "B(st:1)", "B(val:1)", "B()"], say: "Back in B(): the line after this(1) prints B(). Done. Parent first, then the chain unwinds back down to the child." },
];

function BirthOrder() {
  const [k, setK] = useState(0);
  const s = STEPS[k];
  return (
    <div className="card card-pad my-4">
      <div className="mb-2 font-semibold">Watch the baby get born (step through new B())</div>
      <Code code={AB} />
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-wider muted">Who is waiting (call stack, newest at the bottom)</div>
          <div className="flex flex-col gap-1">
            {s.stack.map((f, i) => (
              <div
                key={i}
                className="mono rounded-lg border px-3 py-1 text-sm pop"
                style={i === s.stack.length - 1 ? { background: "var(--accent-soft)", borderColor: "var(--accent)" } : { borderColor: "var(--line)" }}
              >
                {f}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-wider muted">Printed so far</div>
          <div className="codeblock !px-3 min-h-[7.5rem]">
            {s.out.length === 0 ? <span className="muted">(nothing yet)</span> : s.out.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--panel2)" }}>
        <strong>Step {k + 1} of {STEPS.length}.</strong> {s.say}
      </div>
      <div className="mt-3 flex gap-2">
        <button className="btn" disabled={k === 0} onClick={() => setK(k - 1)}>← Back</button>
        <button className="btn btn-primary" disabled={k === STEPS.length - 1} onClick={() => setK(k + 1)}>Next →</button>
        <button className="btn" onClick={() => setK(0)}>Restart</button>
      </div>
    </div>
  );
}

function Interfaces() {
  return (
    <div>
      <Callout kind="key" title="One breath">
        Different things can be the same kind of thing (<strong>polymorphism</strong>). Children get stuff from their parents (<strong>inheritance</strong>). A promise says what you must do, not how (<strong>interface</strong>).
      </Callout>

      <Sec title="Many shapes" kicker="Polymorphism">
        <Story
          emoji="🚗"
          title="The toy box"
          toy={<>A red car, a blue car and a fire truck are different toys, but you can say &quot;these are all <strong>vehicles</strong>!&quot; and zoom them all the same way.</>}
          java={<>An <I>ArrayList</I> and a <I>LinkedList</I> are built differently, but both are a <strong>List</strong>. Code can say &quot;give me a list&quot; and not care which kind. &quot;Many forms&quot;: one idea, lots of implementations.</>}
        />
      </Sec>

      <Sec title="The family tree" kicker="Inheritance">
        <Story
          emoji="🍎"
          title="Apple, fruit, food"
          toy={<>A Fuji apple is an apple. An apple is a fruit. A fruit is food. The Fuji does not have to learn how to be food from scratch. It gets that from its parents and only adds what is special: sweet and crunchy.</>}
          java={<>A child class gets all the fields and methods of its parent (<I>extends</I>) and only defines what is different. Without inheritance, every class would redefine everything from scratch.</>}
        />
      </Sec>

      <Sec title="The promise" kicker="Interface">
        <Story
          emoji="🤝"
          title="Build me a toy that can go, stop and honk"
          toy={<>You tell your friend: &quot;Make a toy that can <strong>go, stop, honk</strong>. I will start playing now, you finish it later.&quot; You do not know <em>how</em> it goes. You only know it promised to. Any toy that keeps the promise can join the game.</>}
          java={<>The lesson&apos;s motivation: programmer A needs to use programmer B&apos;s class before B has written it. The <strong>interface</strong> is the contract (&quot;will have methods x, y, z&quot;). Any class that <I>implements</I> it can be used.</>}
        />
        <Callout kind="tip" title="Two magic words">
          <ul>
            <li><I>implements</I> = &quot;I keep the promise&quot; (a class conforms to an interface).</li>
            <li><I>extends</I> = &quot;I am a child of this parent&quot; (all other cases).</li>
          </ul>
        </Callout>
      </Sec>

      <Sec title="Same name, two tricks" kicker="Overloading vs overriding">
        <Story
          emoji="🎵"
          title="Two different games"
          toy={<><strong>Overloading:</strong> one toy name, different ways to play: <I>play(ball)</I> and <I>play(ball, friend)</I>. <strong>Overriding:</strong> the child says &quot;Mommy sings the lullaby this way, but I will sing it <em>my</em> way!&quot; Same name, same job, new way.</>}
          java={<><strong>Overloading</strong> = same method name, different parameter lists (signatures). <strong>Overriding</strong> = a subclass replaces an inherited method with the same signature and a new body.</>}
        />
      </Sec>

      <Sec title="Who gets born first?" kicker="The code from the lesson">
        <p>Parents are always born first. Step through it and watch the order.</p>
        <BirthOrder />
        <Check
          q="What does new B() print, in order?"
          options={[
            "A(3), A(), B(st:1), B(val:1), B()",
            "B(), B(val:1), B(st:1), A(), A(3)",
            "A(), A(3), B(st:1), B(val:1), B()",
            "B(st:1), B(val:1), B(), A(3), A()",
          ]}
          answer={0}
          why={<>B() hands off to B(int), which hands off to B(String). Before B(String) runs, Java inserts <I>super()</I>, and A() hands off to A(3). So the parent prints first (A(3), then A()), then the children finish from the inside out.</>}
        />
        <Check
          q="A class wants to follow an interface. Which keyword?"
          options={["implements", "extends", "overrides", "inherits"]}
          answer={0}
          why={<>You use <I>implements</I> for an interface and <I>extends</I> in all other cases.</>}
        />
        <Check
          q="A subclass writes its own body for a method it inherited, same name and same parameters. What is this called?"
          options={["Overriding", "Overloading", "Encapsulation", "Overflowing"]}
          answer={0}
          why={<>Overriding replaces an inherited method. Overloading is the same name with <em>different</em> signatures.</>}
        />
      </Sec>
    </div>
  );
}

/* ================= W5: factorial invariant stepper ================= */
const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));

function FactorialSteps() {
  const [n, setN] = useState(4);
  const rows: { m: number; r: number }[] = [];
  let r = 1;
  let m = n;
  rows.push({ m, r });
  while (m > 0) {
    r *= m;
    m -= 1;
    rows.push({ m, r });
  }
  return (
    <div className="card card-pad my-4">
      <div className="mb-2 font-semibold">Watch the invariant stay true (factorial)</div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="muted">Pick n:</span>
        {[0, 1, 2, 3, 4, 5, 6].map((v) => (
          <button key={v} className="btn mono !text-xs" onClick={() => setN(v)} style={v === n ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}>
            {v}
          </button>
        ))}
      </div>
      <Code
        code={`
int factorial(int n) {      // precondition: n >= 0
  int r = 1, m = n;
  while (m > 0) {           // invariant: r * m! = n!  and  m >= 0
    r *= m;
    m -= 1;
  }
  return r;                 // postcondition: n!
}
`}
      />
      <div className="mt-3 overflow-x-auto">
        <table className="mono w-full text-sm">
          <thead>
            <tr className="muted text-left text-xs uppercase tracking-wider">
              <th className="py-1 pr-4">When</th>
              <th className="pr-4">m</th>
              <th className="pr-4">r</th>
              <th className="pr-4">r × m!</th>
              <th>= n! ({fact(n)})?</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((x, i) => {
              const v = x.r * fact(x.m);
              return (
                <tr key={i} className="border-t" style={{ borderColor: "var(--line)" }}>
                  <td className="py-1 pr-4">{i === 0 ? "before loop (init)" : `after round ${i}`}</td>
                  <td className="pr-4">{x.m}</td>
                  <td className="pr-4">{x.r}</td>
                  <td className="pr-4">{v}</td>
                  <td style={{ color: v === fact(n) ? "var(--good)" : "var(--bad)" }}>{v === fact(n) ? "✓ yes" : "✗ no"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--panel2)" }}>
        Every row is a <strong>✓</strong>. The last row has m = 0, so r × 0! = r × 1 = n!, which means <strong>r = n!</strong> is the answer. Notice m also drops by exactly 1 each round until it hits 0: that is the termination proof.
      </div>
    </div>
  );
}

function Invariants() {
  return (
    <div>
      <Callout kind="key" title="One breath">
        An <strong>invariant</strong> is a rule that stays true. To trust a loop, show the rule is true at the start (<strong>init</strong>), stays true after every round (<strong>preservation</strong>), and that the loop eventually stops (<strong>termination</strong>).
      </Callout>

      <Sec title="A rule that never changes" kicker="Invariant">
        <Story
          emoji="🧱"
          title="Blocks in the tower + blocks in the box = 10"
          toy={<>You have 10 blocks. Move one from the box to the tower, and the tower has one more but the box has one less. No matter how many you move, <strong>tower + box is always 10</strong>. That never-changing rule is an invariant.</>}
          java={<>An invariant is a relationship among variables that is always true at a given point in the program. A <strong>loop invariant</strong> is true right before the loop condition is tested: before entering, and at the end of every round.</>}
        />
      </Sec>

      <Sec title="Signs along the road" kicker="Hoare logic">
        <Story
          emoji="🚦"
          title="A sign before the door, a sign after the door"
          toy={<>Before the door the sign says &quot;you must be holding a ticket&quot; (<strong>precondition</strong>). After the door the sign says &quot;now you are inside&quot; (<strong>postcondition</strong>). In between, little signs explain why each step is safe.</>}
          java={<>Hoare logic annotates code with assertions in braces: what is true before a line, and what that line makes true after it.</>}
        />
        <Story
          emoji="🚪"
          title="The if has two doors"
          toy={<>If you walk through the &quot;x is negative&quot; door, you <em>know</em> x is negative. If you walk through the other door, you know it is <em>not</em>. Either way the sign at the end says &quot;a is the size of x, ignoring minus&quot;.</>}
          java={<>In <I>abs(x)</I>: the if branch guarantees <I>x &lt; 0</I> so <I>a = -x = |x|</I>; the else branch guarantees <I>x &gt;= 0</I> so <I>a = x = |x|</I>. After the if, both cases agree: <I>a = |x|</I>.</>}
        />
      </Sec>

      <Sec title="The three-part proof" kicker="Init, preservation, termination">
        <Story
          emoji="🎢"
          title="Dominoes and a countdown"
          toy={<><strong>Init:</strong> the first domino is standing. <strong>Preservation:</strong> if one domino is standing right before a push, one is still standing right after. <strong>Termination:</strong> a rocket countdown 5, 4, 3, 2, 1 must reach 0 eventually, so the game ends.</>}
          java={<><strong>Init:</strong> the invariant holds before the first test of the loop condition. <strong>Preservation:</strong> if it holds on entering the body, it holds again after the body (like induction). <strong>Termination:</strong> some quantity (m, or x - i) shrinks every round and the loop ends when it is small enough.</>}
        />
        <FactorialSteps />
        <Story
          emoji="🍪"
          title="Cookies done times cookies left to bake"
          toy={<>Think of <I>r</I> as cookies already boxed and <I>m!</I> as the work still left. Boxing one more cookie (r gets multiplied) and shrinking the leftover work (m goes down) keeps &quot;boxed × leftover&quot; the same. When no work is left (m = 0, and 0! = 1), what is boxed is the full answer.</>}
          java={<>Invariant: <I>r × m! = n!</I> and <I>m &gt;= 0</I>. Exit means <I>!(m &gt; 0)</I> and <I>m &gt;= 0</I>, so <I>m = 0</I>, so <I>r × 0! = n!</I>, so <I>r = n!</I>.</>}
        />
        <Story
          emoji="📏"
          title="The shrinking gap (sum loop)"
          toy={<>You are at step <I>i</I> of a staircase with <I>x</I> steps. The gap <I>x - i</I> shrinks by one with every step you climb. When the gap hits 0 you are at the top and you stop. It cannot go on forever.</>}
          java={<>For <I>sum(x)</I> the invariant is <I>0 &lt;= i &lt;= x</I> and <I>p = 2^i - 1</I>. Termination: track <I>x - i</I>. It starts at x, drops by 1 per round, and the loop ends when it reaches 0. On exit <I>i = x</I>, so <I>p = 2^x - 1</I>.</>}
        />
      </Sec>

      <Sec title="Test yourself" kicker="Quiz-style">
        <Check
          q="When is a loop invariant true?"
          options={[
            "Right before the loop condition is tested: before entering and at the end of every iteration",
            "Only after the loop finishes",
            "Only inside the loop body, halfway through",
            "Only on the first iteration",
          ]}
          answer={0}
          why={<>The invariant is checked at the top of the loop, each time the condition is about to be tested.</>}
        />
        <Check
          q="Which three things do you show to justify a loop?"
          options={[
            "Init, preservation, termination",
            "Declaration, assignment, return",
            "Compile, run, test",
            "Overload, override, overflow",
          ]}
          answer={0}
          why={<>Init and preservation show the invariant holds whenever the loop would exit; termination shows the loop really does exit.</>}
        />
        <Check
          q="In the sum loop (while i < x, i += 1 each round), what quantity shows the loop terminates?"
          options={["x - i, which drops by 1 each round until it reaches 0", "p, which doubles each round", "x, which stays the same", "2^i, which shrinks"]}
          answer={0}
          why={<>x stays fixed and i goes up by 1, so the gap x - i goes down by 1 and the loop stops when it is 0.</>}
        />
        <Check
          q="After the factorial loop exits, why does r equal n!?"
          options={[
            "m >= 0 and !(m > 0) give m = 0, so r × 0! = n! and r = n!",
            "Because r was set to n at the start",
            "Because the loop ran n times, so it must be right",
            "Because m = n when the loop exits",
          ]}
          answer={0}
          why={<>The invariant plus the negated loop condition pin down m = 0. Since 0! = 1, the invariant r × m! = n! becomes r = n!.</>}
        />
      </Sec>
    </div>
  );
}

/* ================= Ch1: How to attack a problem ================= */
function Approach() {
  return (
    <div>
      <Callout kind="key" title="One breath">
        Do not run at the problem. <strong>Read it, try a tiny example by hand, spot a pattern you know, make a plan, then code, then test.</strong>
      </Callout>
      <Sec title="The 6-step loop" kicker="Method">
        <Story
          emoji="🎂"
          title="Baking a cake"
          toy={<>You do not throw flour in the oven. First you <strong>read the recipe</strong>, then you <strong>try a tiny cupcake</strong> to see what happens, then you remember &quot;this is like the cookies I made&quot;, then you <strong>write your steps</strong>, then you bake, then you <strong>taste it</strong>.</>}
          java={<>The 6 steps: <strong>restate</strong> the problem in your own words, <strong>trace</strong> a small example by hand, recognise a <strong>pattern</strong>, write a <strong>plan</strong> in plain words, <strong>code</strong> it, and <strong>test</strong> it (including the edge cases).</>}
        />
        <Story
          emoji="🪜"
          title="Stuck? Climb down the ladder"
          toy={<>If the big puzzle is too hard, shrink it. Try a puzzle with just 2 pieces. Then 3. Then see what changed.</>}
          java={<>When stuck, make the input smaller (an array of 1 or 2 items), do it by hand, and notice what you did. That hand procedure is your algorithm. Then check for <strong>off-by-one</strong> mistakes: counting fence posts versus fence pieces.</>}
        />
      </Sec>
      <Sec title="Test yourself" kicker="Quiz-style">
        <Check
          q="What should you do before writing any code?"
          options={[
            "Restate the problem and trace a small example by hand",
            "Start typing the loop and fix errors as they come",
            "Copy a solution that looks similar",
            "Run the test cases first",
          ]}
          answer={0}
          why={<>Tracing a small example by hand shows you the actual steps. Those steps become the plan, and the plan becomes the code.</>}
        />
        <Check
          q="You are stuck on a problem about a big array. Best next move?"
          options={[
            "Try the same problem on a tiny array (1 or 2 items) by hand",
            "Give up on that approach",
            "Use a bigger array",
            "Rewrite the loop with different variable names",
          ]}
          answer={0}
          why={<>Shrinking the input is the first rung of the ladder. It makes the pattern visible.</>}
        />
      </Sec>
    </div>
  );
}

/* ================= Ch2: Java basics ================= */
function JavaBasics() {
  return (
    <div>
      <Callout kind="key" title="One breath">
        In Java every box has a <strong>label that says what can go inside</strong>. Arrays are fixed-size egg cartons. Numbers have a size limit, and too big means they wrap around.
      </Callout>
      <Sec title="Labelled boxes" kicker="Python to Java">
        <Story
          emoji="🏷️"
          title="Every box has a sticker"
          toy={<>In Python you can put anything in any box. In Java the box has a sticker: &quot;ONLY NUMBERS&quot;. If you try to put a banana in, the grown-up (the compiler) says no before you even start.</>}
          java={<>Java is <strong>statically typed</strong>: <I>int x = 5;</I> says x holds an int forever. Statements end with <I>;</I> and blocks use <I>{"{ }"}</I>. Indentation is only for humans.</>}
        />
      </Sec>
      <Sec title="Loops and arrays" kicker="Repeat and store">
        <Story
          emoji="🥚"
          title="The egg carton"
          toy={<>An egg carton has a fixed number of slots, say 6. You cannot add a 7th. Each slot has a number: 0, 1, 2... A grid of cartons stacked together is a <strong>2D array</strong>.</>}
          java={<>An array has a <strong>fixed size</strong> and positions start at 0. A 2D array is an array of arrays. <I>b = a</I> makes an <strong>alias</strong> (two names, one carton). To copy, use <I>Arrays.copyOf(a, a.length)</I>.</>}
        />
        <Story
          emoji="🥤"
          title="The cup that overflows"
          toy={<>A small cup holds only so much juice. Pour more and it spills over, and the cup looks nearly empty again! A big bucket (<I>BigInteger</I>) holds way more.</>}
          java={<>An <I>int</I> has a maximum size. Go past it and it <strong>overflows</strong> (wraps around to a negative number) with no error. For huge values use <I>long</I> or <I>BigInteger</I>.</>}
        />
      </Sec>
      <Sec title="Test yourself" kicker="Quiz-style">
        <Check
          q="int[] a = {1, 2, 3}; int[] b = a; b[0] = 99; What is a[0]?"
          options={["99", "1", "0", "Compile error"]}
          answer={0}
          why={<>b = a copies the reference, not the array. Both names point at the same carton.</>}
        />
        <Check
          q="What is the index of the first slot of a Java array?"
          options={["0", "1", "-1", "It depends"]}
          answer={0}
          why={<>Arrays start at 0, so the last index is length - 1.</>}
        />
      </Sec>
    </div>
  );
}

/* ================= Ch3: Classes, objects & references ================= */
function References() {
  return (
    <div>
      <Callout kind="key" title="One breath">
        A class is a <strong>blueprint</strong>, an object is the <strong>thing built</strong>. Number boxes hold the number. Object boxes hold a <strong>treasure map</strong> to the object. And <I>=</I> always copies what is in the box.
      </Callout>
      <Sec title="Blueprint and toy" kicker="Class vs object">
        <Story
          emoji="🧩"
          title="The cookie cutter"
          toy={<>The cookie cutter is the <strong>class</strong>. Each cookie you press out is an <strong>object</strong>. One cutter, many cookies, and each cookie can have its own sprinkles.</>}
          java={<>A class defines what data (instance variables) and code (methods) an object has. <I>new Vehicle()</I> builds one object from the blueprint.</>}
        />
      </Sec>
      <Sec title="Two kinds of boxes" kicker="Primitives and references">
        <Story
          emoji="🗺️"
          title="Treasure maps"
          toy={<>A number box holds the number itself. An object box holds only a <strong>map</strong> saying where the toy is. If you copy the box, you copy the <em>map</em>, so two kids now have maps to the <em>same</em> toy. Paint it red and both see red.</>}
          java={<><strong>Rule of Equals:</strong> <I>a = b</I> copies whatever is in b&apos;s box. For primitives that is the value. For objects that is the <strong>reference</strong>, so both variables alias one object. Parameters work the same way: passing is just <I>=</I>.</>}
        />
        <Story
          emoji="🕳️"
          title="An empty map"
          toy={<>A kid with a blank map tries to go find the toy. Oops, there is no toy! That is a <strong>NullPointerException</strong>.</>}
          java={<><I>null</I> means the reference points at nothing. Calling a method or reading a field on it throws a <I>NullPointerException</I>.</>}
        />
      </Sec>
      <Sec title="Test yourself" kicker="Quiz-style">
        <Check
          q="Feline f1 = new Feline(); f1.age = 3; Feline f2 = f1; f2.age = 9; What is f1.age?"
          options={["9", "3", "0", "null"]}
          answer={0}
          why={<>f2 = f1 copied the map, so both reach the same object. Changing age through f2 changes it for f1 too.</>}
        />
        <Check
          q="int a = 5; int b = a; b = 7; What is a?"
          options={["5", "7", "12", "null"]}
          answer={0}
          why={<>For primitives, = copies the number. b is its own box now, so a stays 5.</>}
        />
        <Check
          q="What happens when you call a method on a variable that holds null?"
          options={["NullPointerException", "It returns 0", "It creates a new object", "Nothing"]}
          answer={0}
          why={<>There is no object at the end of the map, so the call fails.</>}
        />
      </Sec>
    </div>
  );
}

/* ================= Ch4: Overloading & static ================= */
function OverloadingStatic() {
  return (
    <div>
      <Callout kind="key" title="One breath">
        Same name, different inputs = <strong>overloading</strong> (Java picks one before running). <strong>static</strong> = shared by the whole class. No keyword = each object has its own.
      </Callout>
      <Sec title="Which one runs?" kicker="Overloading">
        <Story
          emoji="📞"
          title="Same name, different questions"
          toy={<>You ask &quot;Can you <em>draw</em>?&quot; and a friend asks back &quot;Draw what? A circle? A circle with a color?&quot; Same word, different details, different drawings.</>}
          java={<>A method&apos;s <strong>signature</strong> is its name plus parameter types. Overloads share a name but differ in signature. Java picks one at <strong>compile time</strong> from the argument types, and an <I>int</I> can widen to <I>double</I> if there is no exact match.</>}
        />
      </Sec>
      <Sec title="Mine or ours?" kicker="Static vs instance">
        <Story
          emoji="🎒"
          title="Backpacks and the classroom jar"
          toy={<>Every kid has their <strong>own backpack</strong> (instance). The classroom has <strong>one cookie jar</strong> that everyone shares (static). The jar is there even before any kid arrives.</>}
          java={<>Instance members belong to one object (<I>obj.x</I>). <I>static</I> members belong to the class, one shared copy (<I>ClassName.y</I>). A static method has no <I>this</I>, so it cannot use instance variables directly.</>}
        />
      </Sec>
      <Sec title="Test yourself" kicker="Quiz-style">
        <Check
          q="Only draw(double r) exists. You call draw(5). What happens?"
          options={["It runs draw(double) after widening 5 to 5.0", "Compile error", "It runs draw(int)", "Runtime error"]}
          answer={0}
          why={<>No exact match, so Java widens int to double and finds draw(double).</>}
        />
        <Check
          q="Can a static method directly use an instance variable?"
          options={["No, a static method has no this", "Yes, always", "Only if it is public", "Only in main"]}
          answer={0}
          why={<>Static means &quot;belongs to the class, not to a particular object&quot;, so there is no &quot;me&quot; whose variable to use.</>}
        />
      </Sec>
    </div>
  );
}

/* ================= Ch5: Linked lists ================= */
function LinkedLists() {
  return (
    <div>
      <Callout kind="key" title="One breath">
        A linked list is a <strong>train</strong>. Each car holds a value and a hook to the next car. To reach car 5, you walk past cars 1 to 4. Adding at the front is easy: hook on a new car.
      </Callout>
      <Sec title="The train" kicker="IntNode chain">
        <Story
          emoji="🚂"
          title="Cars hooked together"
          toy={<>Each train car holds one toy and is hooked to the next car. The last car is hooked to nothing. You only hold the first car, so to find the 3rd toy you walk: car 1, car 2, car 3.</>}
          java={<>An <I>IntNode</I> has <I>head</I> (the value) and <I>next</I> (the reference). The last node&apos;s <I>next</I> is <I>null</I>. An array jumps straight to index i, but a chain must hop i times.</>}
        />
        <Story
          emoji="🚶"
          title="Walk with a finger"
          toy={<>Put your finger on the first car. Move it car by car. Count as you go. When your finger has nothing left to touch, you are at the end.</>}
          java={<><strong>Pattern 1: walk a pointer</strong> (<I>while (p != null) p = p.next</I>). Choose the stop carefully: stop <em>at null</em> to visit every node, but stop <em>on the last node</em> (<I>p.next == null</I>) when you want to attach something after it (<I>addLast</I>).</>}
        />
        <Story
          emoji="🗣️"
          title="Ask the next car"
          toy={<>&quot;How long is the train?&quot; Each car says: &quot;I do not know, let me ask the car behind me, then I will add 1 for myself.&quot; The last car says &quot;just me, 1!&quot;</>}
          java={<><strong>Pattern 2: recurse on the rest.</strong> Base case: <I>next == null</I>. Recursive case: use <I>next.method()</I> and combine. Great for returning a new list (<I>copy</I>, <I>incrList</I>). Very long lists could overflow the call stack.</>}
        />
      </Sec>
      <Sec title="Test yourself" kicker="Quiz-style">
        <Check
          q="To add a node at the end of a non-empty chain, where should your pointer stop?"
          options={["On the last node (p.next == null)", "After the last node (p == null)", "On the first node", "On the middle node"]}
          answer={0}
          why={<>If you walk off the end into null, you have lost the last car and cannot hook anything to it.</>}
        />
        <Check
          q="Which is faster for get(i) with large i?"
          options={["Array, it jumps straight to the slot", "Linked list, it jumps straight there", "They are always the same", "Neither can do get(i)"]}
          answer={0}
          why={<>A linked list has to hop through i nodes. An array computes the position directly.</>}
        />
      </Sec>
    </div>
  );
}

/* ================= Ch6: SLList & sentinel ================= */
function SLListChapter() {
  return (
    <div>
      <Callout kind="key" title="One breath">
        Hide the train behind a <strong>ticket counter</strong> (the SLList wrapper) and put a <strong>fake first car</strong> (the sentinel) so the front is never a special case.
      </Callout>
      <Sec title="Wrapper and sentinel" kicker="Design">
        <Story
          emoji="🎟️"
          title="The ticket counter"
          toy={<>Kids do not climb onto the train themselves. They talk to the ticket counter: &quot;add me to the front!&quot; The counter does the hooking and keeps count of the cars. Kids never touch the hooks.</>}
          java={<>A wrapper class (<I>SLList</I>) holds the first node and <I>size</I>, hidden with <I>private</I>. Users call <I>list.addFirst(5)</I> and never see nodes.</>}
        />
        <Story
          emoji="🚃"
          title="The pretend first car"
          toy={<>Every real car has a car in front of it, even the first one, because we put a <strong>pretend car</strong> up front that carries nobody. Now hooking a car at the front looks exactly like hooking one in the middle. No special rules.</>}
          java={<>The <strong>sentinel</strong> is a dummy node always at the front. Because every real node has a node before it, <I>addFirst</I>, <I>addLast</I> and inserting into an <em>empty</em> list need no special cases.</>}
        />
      </Sec>
      <Sec title="Order of hooks" kicker="Pointer changes">
        <Story
          emoji="🔗"
          title="Hold the rest before you unhook"
          toy={<>To put a new car between car A and car B: first hook the new car to B, <em>then</em> hook A to the new car. If you unhook A from B first, the rest of the train rolls away and is lost!</>}
          java={<>Insert after node <I>p</I>: <I>n.next = p.next;</I> first, then <I>p.next = n;</I>. Reverse the order and you lose the rest of the list.</>}
        />
      </Sec>
      <Sec title="Test yourself" kicker="Quiz-style">
        <Check
          q="Why use a sentinel node?"
          options={[
            "So adding to the front or to an empty list is not a special case",
            "To make the list run faster than an array",
            "To store the biggest value",
            "To avoid using the next field",
          ]}
          answer={0}
          why={<>Every real node then has a node before it, so one set of pointer steps works everywhere.</>}
        />
        <Check
          q="Inserting new node n after node p. Which order is safe?"
          options={["n.next = p.next; then p.next = n;", "p.next = n; then n.next = p.next;", "Either order works", "Set both to null first"]}
          answer={0}
          why={<>In the second order, p.next is overwritten before you save it, so n.next points to n itself and the rest is lost.</>}
        />
      </Sec>
    </div>
  );
}

/* ================= Ch7: Generics, stacks & queues ================= */
function StackQueueToy() {
  const [items, setItems] = useState<string[]>([]);
  const [next, setNext] = useState(0);
  const letter = (i: number) => String.fromCharCode(65 + (i % 26));
  const add = () => {
    setItems([...items, letter(next)]);
    setNext(next + 1);
  };
  const remove = () => setItems(items.slice(0, -1));
  const [q, setQ] = useState<string[]>([]);
  const addBoth = () => {
    add();
    setQ([...q, letter(next)]);
  };
  const removeBoth = () => {
    remove();
    setQ(q.slice(1));
  };
  const reset = () => {
    setItems([]);
    setQ([]);
    setNext(0);
  };
  const cell = (l: string, i: number, hot: boolean) => (
    <div key={i + l} className="cell pop !min-w-[40px] !h-[40px]" style={hot ? { background: "var(--accent-soft)", borderColor: "var(--accent)" } : undefined}>
      {l}
    </div>
  );
  return (
    <div className="card card-pad my-4">
      <div className="mb-2 font-semibold">Put things in, take things out</div>
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={addBoth}>Put in {letter(next)}</button>
        <button className="btn" disabled={!items.length} onClick={removeBoth}>Take out</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-wider muted">Stack of plates (take from the top)</div>
          <div className="flex min-h-[48px] items-end gap-1">{items.map((l, i) => cell(l, i, i === items.length - 1))}</div>
          <div className="text-xs muted mt-1">leaves: the <strong>last</strong> one in (LIFO)</div>
        </div>
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-wider muted">Queue for ice cream (front is on the left)</div>
          <div className="flex min-h-[48px] items-end gap-1">{q.map((l, i) => cell(l, i, i === 0))}</div>
          <div className="text-xs muted mt-1">leaves: the <strong>first</strong> one in (FIFO)</div>
        </div>
      </div>
    </div>
  );
}

function GenericsStacksQueues() {
  return (
    <div>
      <Callout kind="key" title="One breath">
        Generics put a <strong>label on the lunchbox</strong> (what type goes inside). A <strong>stack</strong> is a pile of plates (last in, first out). A <strong>queue</strong> is a line (first in, first out).
      </Callout>
      <Sec title="Labelled lunchboxes" kicker="Generics">
        <Story
          emoji="🍱"
          title="A box that says what it holds"
          toy={<>One lunchbox design can be a &quot;box of apples&quot; or a &quot;box of crayons&quot;. You write the label once when you pick the box, and from then on only that thing fits.</>}
          java={<><I>SLList&lt;Double&gt; list = new SLList&lt;&gt;();</I> The type goes in angle brackets, and the empty <I>&lt;&gt;</I> after <I>new</I> lets Java fill it in. The type must be a <strong>reference type</strong> (<I>Integer</I>, not <I>int</I>); Java boxes and unboxes primitives automatically.</>}
        />
      </Sec>
      <Sec title="Two lines, two rules" kicker="Stacks and queues">
        <StackQueueToy />
        <Story
          emoji="🍽️"
          title="Plates and ice-cream line"
          toy={<>A pile of plates: you add and take from the <strong>top</strong>, so the last plate you put on is the first one you take. An ice-cream line: new kids join the <strong>back</strong>, and the kid at the <strong>front</strong> gets served first.</>}
          java={<><strong>Stack (LIFO):</strong> <I>push</I> and <I>pop</I> at the same end. Used for undo, function calls and matching brackets. <strong>Queue (FIFO):</strong> <I>enqueue</I> at the rear, <I>dequeue</I> from the front. Used for waiting lines and print jobs.</>}
        />
      </Sec>
      <Sec title="Test yourself" kicker="Quiz-style">
        <Check
          q="You push A, B, C onto a stack, then pop once. What comes out?"
          options={["C", "A", "B", "Nothing"]}
          answer={0}
          why={<>Last in, first out: C went in last, so it comes out first.</>}
        />
        <Check
          q="You enqueue A, B, C into a queue, then dequeue once. What comes out?"
          options={["A", "C", "B", "Nothing"]}
          answer={0}
          why={<>First in, first out: A joined the line first.</>}
        />
        <Check
          q="Which is a valid generic declaration?"
          options={["ArrayList<Integer> a = new ArrayList<>();", "ArrayList<int> a = new ArrayList<>();", "ArrayList a<Integer> = new ArrayList();", "ArrayList<Integer> a = ArrayList<Integer>;"]}
          answer={0}
          why={<>Type arguments must be reference types, so Integer works and int does not.</>}
        />
      </Sec>
    </div>
  );
}

/* ================= Ch8: ArrayList ================= */
function DoublingToy() {
  const [size, setSize] = useState(0);
  const [cap, setCap] = useState(1);
  const [copies, setCopies] = useState(0);
  const [msg, setMsg] = useState("Press Add to put a toy on the shelf.");
  const add = () => {
    if (size === cap) {
      setCopies(copies + size);
      setCap(cap * 2);
      setMsg(`Shelf was full (${size}/${cap}). Buy a shelf of ${cap * 2} and move ${size} toys over. Then add the new one.`);
    } else {
      setMsg("Room on the shelf, so just drop it in. Cheap!");
    }
    setSize(size + 1);
  };
  const reset = () => {
    setSize(0);
    setCap(1);
    setCopies(0);
    setMsg("Press Add to put a toy on the shelf.");
  };
  return (
    <div className="card card-pad my-4">
      <div className="mb-2 font-semibold">The shelf that doubles</div>
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={add}>Add a toy</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {Array.from({ length: cap }).map((_, i) => (
          <div key={i} className="cell !min-w-[34px] !h-[34px] !text-xs" style={i < size ? { background: "var(--accent-soft)", borderColor: "var(--accent)" } : undefined}>
            {i < size ? "🧸" : ""}
          </div>
        ))}
      </div>
      <div className="mono mt-2 text-sm">size = {size} · capacity = {cap} · total toys moved = {copies}</div>
      <div className="mt-2 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--panel2)" }}>{msg}</div>
      <div className="mt-1 text-xs muted">After {size} adds you moved {copies} toys: always under about 2 × {size}. That is why adding is cheap on average.</div>
    </div>
  );
}

function ArrayListChapter() {
  return (
    <div>
      <Callout kind="key" title="One breath">
        An ArrayList is a <strong>shelf</strong>. When it is full, buy a shelf <strong>twice as big</strong> and move everything over. Big moves are rare, so adding at the end is cheap on average. Adding at the front makes everyone shuffle.
      </Callout>
      <Sec title="The shelf" kicker="Arrays and resizing">
        <Story
          emoji="🧸"
          title="A shelf with a fixed number of spots"
          toy={<>The shelf has a fixed number of spots, but you keep a number in your head: &quot;how many toys are really on it.&quot; New toy goes in the next free spot.</>}
          java={<>An array list wraps a fixed array plus <I>size</I>. Invariants: <I>size</I> is how many real items there are, items live in positions 0 to size-1, and size never exceeds the array length.</>}
        />
        <DoublingToy />
        <Story
          emoji="🛒"
          title="Why doubling, not +1"
          toy={<>If you bought a shelf only <em>one</em> spot bigger every time, you would carry all your toys every single time. Doubling means you carry a lot, but only once in a long while.</>}
          java={<>Grow by +1: about n²/2 copies in total. <strong>Doubling:</strong> copies happen at sizes 1, 2, 4, 8, ... summing to less than 2n, so <strong>constant work per add on average</strong> (amortized). Watch out: if capacity is ever 0, then 0 × 2 = 0 and it never grows.</>}
        />
        <Story
          emoji="🪑"
          title="Everybody scoot over"
          toy={<>To squeeze a new kid into the <em>first</em> seat, every other kid must scoot one seat over. That is a lot of scooting, every time.</>}
          java={<><I>addFirst</I> on an array list shifts all n items right by one, so it costs about n steps. A linked list just hooks a new node on the front.</>}
        />
      </Sec>
      <Sec title="Test yourself" kicker="Quiz-style">
        <Check
          q="Why is doubling the array size on a full add efficient?"
          options={[
            "Resizes are rare, so total copies stay under about 2n for n adds",
            "Copying is free in Java",
            "It never needs to copy",
            "It makes the array smaller",
          ]}
          answer={0}
          why={<>Copies happen at sizes 1, 2, 4, 8, ... and those add up to less than 2n, so each add costs a constant amount on average.</>}
        />
        <Check
          q="Which is slow on an array list?"
          options={["addFirst (shifts everything)", "addLast (usually)", "get(i)", "size()"]}
          answer={0}
          why={<>Everything has to shift right by one to make room at index 0.</>}
        />
        <Check
          q="What goes wrong if the initial capacity is 0 and you resize by capacity × 2?"
          options={["It never grows, since 0 × 2 = 0", "It grows too fast", "Nothing", "It becomes negative"]}
          answer={0}
          why={<>Start at capacity 1 or higher, or use Math.max.</>}
        />
      </Sec>
    </div>
  );
}

/* ================= page ================= */
const TABS = [
  { id: "approach", label: "1 · The Approach", C: Approach },
  { id: "java-basics", label: "2 · Java Basics", C: JavaBasics },
  { id: "references", label: "3 · References", C: References },
  { id: "overloading-static", label: "4 · Overloading & Static", C: OverloadingStatic },
  { id: "linked-lists", label: "5 · Linked Lists", C: LinkedLists },
  { id: "sllist", label: "6 · SLList & Sentinel", C: SLListChapter },
  { id: "generics-stacks-queues", label: "7 · Generics, Stacks & Queues", C: GenericsStacksQueues },
  { id: "arraylist", label: "8 · ArrayList", C: ArrayListChapter },
  { id: "invariants", label: "9 · Loop Invariants (W5)", C: Invariants },
  { id: "interfaces", label: "10 · Interfaces & Inheritance (L6)", C: Interfaces },
] as const;

export default function Eli3() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("approach");
  const i = TABS.findIndex((t) => t.id === tab);
  const cur = TABS[i];
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>Study feature</div>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Explain it like I&apos;m 3 🧸</h1>
      <p className="mt-2 max-w-2xl muted">
        Every chapter told as a toy-box story first, then the real Java idea right under it. Read the story, play with the toy, then check yourself.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            className="btn"
            onClick={() => setTab(t.id)}
            style={t.id === tab ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <cur.C />
      </div>
      <div className="mt-10 flex justify-between gap-3">
        <button className="btn" disabled={i === 0} onClick={() => { setTab(TABS[i - 1].id); window.scrollTo({ top: 0 }); }}>
          ← {i > 0 ? TABS[i - 1].label : ""}
        </button>
        <button className="btn btn-primary" disabled={i === TABS.length - 1} onClick={() => { setTab(TABS[i + 1].id); window.scrollTo({ top: 0 }); }}>
          {i < TABS.length - 1 ? TABS[i + 1].label : ""} →
        </button>
      </div>
    </div>
  );
}
