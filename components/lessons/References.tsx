"use client";
import { Callout, Check, Code, I, Panel, Reveal, Row, Sec } from "../ui";
import { Frame, MObj, MVar, Trace } from "../viz";

const F = (id: string, y: number, w: number, hi = false): MObj => ({ id, cls: "Feline", x: 220, y, hi, fields: [{ name: "w", value: w }] });
const mem = (vars: MVar[], objs: MObj[]) => ({ vars, objs });
const ref = (name: string, to: string | null, type = "Feline"): MVar => ({ name, type, ref: to });

/* ---------- scenario A: aliasing ---------- */
const A_CODE = `Feline a = new Feline();
Feline b;
a.w = 5;
b = a;
b.w = 9;
int x = 42;
int y;
y = x;
x = 2;`;
const A_FRAMES: Frame[] = [
  { line: 1, mem: mem([ref("a", "F1")], [F("F1", 10, 0)]), note: <><I>new Feline()</I> builds an object on the heap (its field w starts at 0). The variable <I>a</I> stores an arrow to it.</> },
  { line: 2, mem: mem([ref("a", "F1"), { name: "b", type: "Feline", unset: true }], [F("F1", 10, 0)]), note: "b is declared but points nowhere yet. No new object is made." },
  { line: 3, mem: mem([ref("a", "F1"), { name: "b", type: "Feline", unset: true }], [F("F1", 10, 5, true)]), note: "a.w = 5: follow a's arrow, set the field." },
  { line: 4, mem: mem([ref("a", "F1"), ref("b", "F1")], [F("F1", 10, 5)]), note: <><strong>b = a copies the arrow.</strong> Two variables, one object.</> },
  { line: 5, mem: mem([ref("a", "F1"), ref("b", "F1")], [F("F1", 10, 9, true)]), note: "b.w = 9 changes the one shared object, so a.w is 9 as well." },
  { line: 6, mem: mem([ref("a", "F1"), ref("b", "F1"), { name: "x", type: "int", value: 42 }], [F("F1", 10, 9)]), note: "x is a primitive: the box holds the number itself." },
  { line: 7, mem: mem([ref("a", "F1"), ref("b", "F1"), { name: "x", type: "int", value: 42 }, { name: "y", type: "int", unset: true }], [F("F1", 10, 9)]), note: "y exists but has no value yet." },
  { line: 8, mem: mem([ref("a", "F1"), ref("b", "F1"), { name: "x", type: "int", value: 42 }, { name: "y", type: "int", value: 42 }], [F("F1", 10, 9)]), note: "y = x copies the number 42 into y's own box." },
  { line: 9, mem: mem([ref("a", "F1"), ref("b", "F1"), { name: "x", type: "int", value: 2 }, { name: "y", type: "int", value: 42 }], [F("F1", 10, 9)]), note: <>x changes to 2, but y is still 42. <strong>That answers the lesson&apos;s question:</strong> both lines copy bits, but a primitive&apos;s bits <em>are</em> the value, while a reference&apos;s bits are an arrow to a shared object.</> },
];

/* ---------- scenario B: parameter passing ---------- */
const B_CODE = `static void update(Feline f, int x) {
    f.w = f.w + 42;
    x = x + 42;
}
// in main:
Feline a = new Feline();   // a.w starts at 0
int y = 5;
update(a, y);
// now: a.w = ?   y = ?`;
const B_FRAMES: Frame[] = (() => {
  const main = () => [ref("a", "F1"), { name: "y", type: "int", value: 5 } as MVar];
  return [
    { line: 6, mem: mem([ref("a", "F1")], [F("F1", 10, 0)]), note: "In main: a points to a fresh Feline with w = 0." },
    { line: 7, mem: mem(main(), [F("F1", 10, 0)]), note: "y = 5." },
    { line: 8, mem: mem([...main(), ref("f", "F1"), { name: "x", type: "int", value: 5 }], [F("F1", 10, 0)]), note: <>The call <I>update(a, y)</I> <strong>copies the bits</strong> of each argument into the parameters: f gets a copy of the arrow, x gets a copy of 5.</> },
    { line: 2, mem: mem([...main(), ref("f", "F1"), { name: "x", type: "int", value: 5 }], [F("F1", 10, 42, true)]), note: "f.w = f.w + 42: f's arrow leads to the same Feline as a, so the shared object changes." },
    { line: 3, mem: mem([...main(), ref("f", "F1"), { name: "x", type: "int", value: 47 }], [F("F1", 10, 42)]), note: "x = x + 42 changes only update's own local copy." },
    { line: 9, mem: mem(main(), [F("F1", 10, 42)]), note: <>update returns and its locals vanish. <strong>a.w = 42</strong> (object changed through the copied arrow), <strong>y = 5</strong> (only the copy changed).</> },
  ] as Frame[];
})();

/* ---------- scenario C: swap ---------- */
const C_CODE = `static void swap(Feline p, Feline q) {
    Feline t = p;
    p = q;
    q = t;
}
// in main:
Feline a = new Feline(1);   // a.w == 1
Feline b = new Feline(2);   // b.w == 2
swap(a, b);
// a.w == ?   b.w == ?`;
const C_FRAMES: Frame[] = (() => {
  const two = [F("F1", 10, 1), F("F2", 120, 2)];
  const mn = [ref("a", "F1"), ref("b", "F2")];
  return [
    { line: 7, mem: mem([ref("a", "F1")], [F("F1", 10, 1)]), note: "a points to a Feline with w = 1." },
    { line: 8, mem: mem(mn, two), note: "b points to a different Feline with w = 2." },
    { line: 9, mem: mem([...mn, ref("p", "F1"), ref("q", "F2")], two), note: "Calling swap copies the arrows into p and q." },
    { line: 2, mem: mem([...mn, ref("p", "F1"), ref("q", "F2"), ref("t", "F1")], two), note: "t = p: t also points at the w = 1 object." },
    { line: 3, mem: mem([...mn, ref("p", "F2"), ref("q", "F2"), ref("t", "F1")], two), note: "p = q: only the local p is re-pointed." },
    { line: 4, mem: mem([...mn, ref("p", "F2"), ref("q", "F1"), ref("t", "F1")], two), note: "q = t: p and q have swapped… but they're only copies." },
    { line: 10, mem: mem(mn, two), note: <>swap returns. main&apos;s a and b were never touched: <strong>a.w == 1, b.w == 2</strong>. Java cannot swap the caller&apos;s variables. It can only change the objects they point to.</> },
  ] as Frame[];
})();

export default function References() {
  return (
    <>
      <p className="text-lg muted">
        This is the single most tested idea in the early weeks: <strong>what does a variable actually hold?</strong> If you can draw boxes and arrows you can answer almost any &quot;what does this print?&quot; question.
      </p>

      <Sec id="class-object" kicker="Part 1" title="Class vs object">
        <Row>
          <Panel title="Class = blueprint">A class defines <em>what data</em> (instance variables) and <em>what code</em> (methods) an object has. It uses no memory per object until you make one.</Panel>
          <Panel title="Object = a thing built from it">
            <I>new Vehicle()</I> builds one. Each object has its <strong>own copy</strong> of every instance variable. Access members with the dot operator: <I>minivan.fuelCap</I>.
          </Panel>
        </Row>
        <Code code={`public class Vehicle {\n    int passengers;\n    int fuelCap;\n    int mpg;\n}\n\nVehicle minivan = new Vehicle();   // one object\nVehicle sportscar = new Vehicle(); // a second, independent one\nminivan.mpg = 21;                  // sportscar.mpg is still 0`} />
        <Callout kind="tip">A public class lives in a file with exactly the same name (<I>Vehicle.java</I>). You only need <I>main</I> in the class where the program starts.</Callout>
      </Sec>

      <Sec id="two-kinds" kicker="Part 2" title="Two kinds of boxes">
        <Row>
          <Panel title="Primitive variables">
            <I>int, double, boolean, char, long…</I><br />The box holds <strong>the value itself</strong>.
          </Panel>
          <Panel title="Reference variables">
            <I>Feline, int[], String, IntNode…</I><br />The box holds an <strong>arrow (address)</strong> to an object on the heap, or <I>null</I> for &quot;no object&quot;.
          </Panel>
        </Row>
        <Callout kind="key" title="The Rule of Equals (RoE)">
          <I>=</I> always <strong>copies the bits</strong> in the box on the right into the box on the left. For a primitive that copies the number. For a reference it copies the <em>arrow</em>, so now two arrows lead to the same object. No new object is created; only <I>new</I> creates objects.
        </Callout>
        <Reveal q={<>Predict before stepping through: after the code below runs, what are <I>a.w, b.w, x, y</I>?</>}>
          <p>a.w = 9, b.w = 9, x = 2, y = 42. Step through to see why.</p>
        </Reveal>
        <Trace title="Aliasing objects vs copying numbers" code={A_CODE} frames={A_FRAMES} />
        <Check
          q="How many Feline objects exist after this runs?"
          code={`Feline a = new Feline();\nFeline b = a;\nFeline c = new Feline();`}
          options={["1", "2", "3", "0"]}
          answer={1}
          why="Only `new` creates objects. `Feline b = a` copies an arrow. There are two objects; a and b share one, c has the other."
        />
      </Sec>

      <Sec id="params" kicker="Part 3" title="Parameter passing is the Rule of Equals">
        <p>Calling a method copies each argument into the parameter, exactly like <I>=</I>. So there are two things that can happen to a parameter:</p>
        <ul>
          <li><strong>Change what the parameter points at</strong> (e.g. <I>p = q</I>): only the local copy of the arrow changes. The caller sees nothing.</li>
          <li><strong>Change the object through the arrow</strong> (e.g. <I>f.w = …</I> or <I>arr[0] = …</I>): the object is shared, so the caller <em>does</em> see it.</li>
        </ul>
        <Trace title="update(Feline f, int x)" code={B_CODE} frames={B_FRAMES} />
        <Trace title="The classic swap trap" code={C_CODE} frames={C_FRAMES} />
        <Check
          q="What is the length of `data` in main after the call?"
          code={`static void grow(int[] arr) {\n    arr = new int[10];\n}\n// main\nint[] data = new int[3];\ngrow(data);\nSystem.out.println(data.length);`}
          options={["10", "3", "0", "Compile error"]}
          answer={1}
          why="`arr = new int[10]` re-points the local copy of the arrow. main's `data` still points to the original length-3 array."
        />
        <Check
          q="What does this print?"
          code={`static void setFirst(int[] arr) {\n    arr[0] = 7;\n}\n// main\nint[] data = {1, 2, 3};\nsetFirst(data);\nSystem.out.println(data[0]);`}
          options={["1", "7", "0", "Compile error"]}
          answer={1}
          why="Here we write through the arrow (arr[0] = 7), so the shared array is changed and main sees it."
        />
      </Sec>

      <Sec id="null" kicker="Part 4" title="null and NullPointerException">
        <Code code={`Feline c = null;   // arrow to nothing\nc.w = 3;           // ✗ NullPointerException at runtime`} />
        <p>Following an arrow that isn&apos;t there crashes. This becomes very common in linked lists, where the last node&apos;s <I>next</I> is <I>null</I>.</p>
        <Check
          q="Which line throws NullPointerException?"
          code={`Feline a = new Feline();\nFeline b = null;\nint u = a.w;   // line 3\nint v = b.w;   // line 4`}
          options={["Line 3", "Line 4", "Both", "Neither"]}
          answer={1}
          why="a points at a real object. b is null, and you can't read a field from nothing."
        />
      </Sec>

      <Sec id="exam" kicker="Part 5" title="How to answer 'what does this print' questions">
        <ol>
          <li>Draw the stack (variable boxes) on one side and the heap (objects) on the other.</li>
          <li>For each line: is the left side a variable (change what it holds) or a field/element (follow an arrow, then change it)?</li>
          <li>For each <I>=</I>, ask: primitive or reference? Copy the number, or the arrow?</li>
          <li>For each <I>new</I>, draw a new object.</li>
          <li>For a method call, copy argument boxes into fresh parameter boxes. When it returns, erase those boxes.</li>
        </ol>
      </Sec>
    </>
  );
}
