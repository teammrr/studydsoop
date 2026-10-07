import type { Frame, Mem, MObj, MVar } from "@/components/viz";

/* A tiny hand-rolled "interpreter" for the Quiz 1 Puppy program.
   The frames AND the answers both come from the same simulation, so the diagram can never disagree with the answer key. */

export const PUPPY_CODE = `class Puppy {
    String name;
    static String breed;
    int weight;
    Puppy(String name, int weight) { this.name = name; this.weight = weight; }
}
static void magicTrick(Puppy a, Puppy b) {
    Puppy t = a;
    a = b;
    b = t;
}
static void spellPotion(Puppy x) {
    x.weight = x.weight / 2;
}
static void reboot(Puppy x) {
    x = new Puppy(x.name, 0);
    x.breed = "mixed";
}
// ---- main (println = System.out.println) ----
Puppy kone = new Puppy("Fluffy", 25);
Puppy ktwo = new Puppy("Mittens", 30);
Puppy kthree = new Puppy("Fl" + "u" + "ffy", 30-5);
Puppy[] puppies = {kone, ktwo, kthree};
Puppy[] woofies = {kone, ktwo, kthree};
kone.breed = "Goldie";
ktwo.breed = "Poodle";
println(kone.breed);                       // 1
println(puppies == woofies);               // 2
println(kone.breed.equals(kthree.breed));  // 3
spellPotion(puppies[1]);
println(ktwo.weight);                      // 4
magicTrick(kone, ktwo);
println(kone.name);                        // 5
println(ktwo.name);                        // 6
println(kone.weight == kthree.weight);     // 7
woofies[0] = puppies[1];
println(kone.weight);                      // 8
reboot(kone);
println(kone.weight);                      // 9
println(ktwo.breed);                       // 10`;

type P = { name: string; weight: number };
type St = {
  objs: Record<string, P>;
  main: Record<string, string>;
  arrays: Record<string, string[]>;
  arrVars: Record<string, string>;
  breed: string | null;
  locals: [string, string][];
  out: string[];
};

const LINES = PUPPY_CODE.split("\n");
const lineNo = (prefix: string, nth = 0) => {
  let seen = 0;
  for (let i = 0; i < LINES.length; i++) {
    if (LINES[i].trim().startsWith(prefix)) {
      if (seen === nth) return i + 1;
      seen++;
    }
  }
  throw new Error("line not found: " + prefix);
};

function memOf(st: St, hi?: string): Mem {
  const vars: MVar[] = [];
  for (const k of ["kone", "ktwo", "kthree"]) if (st.main[k]) vars.push({ name: k, type: "Puppy", ref: st.main[k] });
  for (const k of ["puppies", "woofies"]) if (st.arrVars[k]) vars.push({ name: k, type: "Puppy[]", ref: st.arrVars[k] });
  for (const [k, id] of st.locals) vars.push({ name: k, type: "Puppy", ref: id });

  const objs: MObj[] = [{ id: "S", cls: "Puppy (static)", x: 215, y: 0, fields: [{ name: "breed", value: st.breed ?? "null" }], hi: hi === "S" }];
  Object.keys(st.arrays).forEach((id, i) =>
    objs.push({
      id,
      cls: id === "A1" ? "puppies" : "woofies",
      x: 215,
      y: 84 + i * 130,
      fields: st.arrays[id].map((t, k) => ({ name: String(k), ref: t })),
      hi: hi === id,
    }),
  );
  Object.keys(st.objs)
    .sort()
    .forEach((id, i) =>
      objs.push({
        id,
        cls: "Puppy",
        x: 430,
        y: i * 104,
        fields: [
          { name: "name", value: st.objs[id].name },
          { name: "weight", value: st.objs[id].weight },
        ],
        hi: hi === id,
      }),
    );
  return { vars, objs };
}

export type PuppyRow = { n: number; expr: string; answer: string; trap: string; why: string };

function run() {
  const st: St = { objs: {}, main: {}, arrays: {}, arrVars: {}, breed: null, locals: [], out: [] };
  const frames: Frame[] = [];
  const push = (prefix: string, note: string, o: { nth?: number; hi?: string } = {}) =>
    frames.push({
      line: lineNo(prefix, o.nth ?? 0),
      mem: memOf(st, o.hi),
      note,
      out: st.out.map((v, i) => `#${i + 1}  ${v}`).join("\n"),
    });
  const print = (prefix: string, nth: number, value: string | number | boolean, note: string) => {
    st.out.push(String(value));
    push(prefix, note, { nth });
  };

  st.objs.P1 = { name: "Fluffy", weight: 25 };
  st.main.kone = "P1";
  push('Puppy kone =', "new builds ONE object on the heap. The variable kone stores an arrow to it.", { hi: "P1" });

  st.objs.P2 = { name: "Mittens", weight: 30 };
  st.main.ktwo = "P2";
  push("Puppy ktwo =", "A second, separate object. Mittens, weight 30.", { hi: "P2" });

  st.objs.P3 = { name: "Fluffy", weight: 25 };
  st.main.kthree = "P3";
  push("Puppy kthree =", 'A THIRD object. "Fl" + "u" + "ffy" is just "Fluffy" and 30-5 is 25, so it has the same contents as kone, but it is a different object.', { hi: "P3" });

  st.arrays.A1 = ["P1", "P2", "P3"];
  st.arrVars.puppies = "A1";
  push("Puppy[] puppies", "An array of Puppy is a row of ARROWS (not puppies). puppies[0] points at the same object kone does.", { hi: "A1" });

  st.arrays.A2 = ["P1", "P2", "P3"];
  st.arrVars.woofies = "A2";
  push("Puppy[] woofies", "A second array object. Same three arrows inside, but it is a different array from puppies. Remember this for line #2.", { hi: "A2" });

  st.breed = "Goldie";
  push("kone.breed =", "breed is static: there is ONE box for the whole class (top of the heap). It is not inside any puppy, even though we wrote kone.breed.", { hi: "S" });

  st.breed = "Poodle";
  push("ktwo.breed =", "Same single box again. ktwo.breed is just another way to write Puppy.breed, so Goldie is overwritten by Poodle.", { hi: "S" });

  print("println(kone.breed)", 0, st.breed, "#1: kone.breed reads the one shared box, which now holds Poodle.");
  print("println(puppies == woofies)", 0, st.arrays.A1 === st.arrays.A2, "#2: == on references asks 'same object?'. puppies and woofies are two different array objects, so false.");
  print("println(kone.breed.equals", 0, true, "#3: kone.breed and kthree.breed both read the same static box, so they are the same String: true.");

  st.locals = [["x", "P2"]];
  push("spellPotion(puppies[1]);", "The call COPIES the arrow puppies[1] into the parameter x. Now x and ktwo both point at Mittens.", { hi: "P2" });
  st.objs.P2.weight = Math.trunc(st.objs.P2.weight / 2);
  push("x.weight = x.weight / 2;", "Writing through the copied arrow changes the real object: 30 / 2 = 15.", { hi: "P2" });
  st.locals = [];
  print("println(ktwo.weight)", 0, st.objs.P2.weight, "#4: x vanished when the method returned, but the object it changed is still there: 15.");

  st.locals = [
    ["a", "P1"],
    ["b", "P2"],
  ];
  push("magicTrick(kone, ktwo);", "Copies of the arrows go into a and b. a points at Fluffy, b points at Mittens.");
  st.locals = [...st.locals, ["t", "P1"]];
  push("Puppy t = a;", "t is a third local arrow, copied from a.");
  st.locals = [
    ["a", "P2"],
    ["b", "P2"],
    ["t", "P1"],
  ];
  push("a = b;", "The LOCAL a now points at Mittens. kone, back in main, did not move.");
  st.locals = [
    ["a", "P2"],
    ["b", "P1"],
    ["t", "P1"],
  ];
  push("b = t;", "The local arrows are swapped. Only copies were swapped, never kone or ktwo.");
  st.locals = [];
  print("println(kone.name)", 0, st.objs[st.main.kone].name, "#5: magicTrick returned and its locals vanished. kone still points at Fluffy.");
  print("println(ktwo.name)", 0, st.objs[st.main.ktwo].name, "#6: ktwo still points at Mittens.");
  print("println(kone.weight == kthree.weight)", 0, st.objs[st.main.kone].weight === st.objs[st.main.kthree].weight, "#7: == on ints compares VALUES: 25 == 25, so true, even though they are different objects.");

  st.arrays.A2 = ["P2", "P2", "P3"];
  push("woofies[0] = puppies[1];", "This re-points ONE SLOT inside the woofies array (slot 0 now holds the Mittens arrow). The variable kone is not touched.", { hi: "A2" });
  print("println(kone.weight)", 0, st.objs[st.main.kone].weight, "#8: kone still points at Fluffy, whose weight is 25.");

  st.locals = [["x", "P1"]];
  push("reboot(kone);", "x gets a copy of kone's arrow: both point at Fluffy.", { hi: "P1" });
  st.objs.P4 = { name: st.objs.P1.name, weight: 0 };
  st.locals = [["x", "P4"]];
  push("x = new Puppy(x.name, 0);", "A brand-new object, and ONLY the local x is re-pointed to it. kone still points at Fluffy (weight 25).", { hi: "P4" });
  st.breed = "mixed";
  push('x.breed = "mixed";', "breed is static, so this writes the single shared box. It does not matter which puppy x points to.", { hi: "S" });
  st.locals = [];
  print("println(kone.weight)", 1, st.objs[st.main.kone].weight, "#9: the reboot only touched its own copy x. Fluffy's weight is still 25.");
  print("println(ktwo.breed)", 0, st.breed, "#10: the shared static box now says mixed, for every puppy.");

  return { frames, out: st.out };
}

const sim = run();
export const PUPPY_FRAMES: Frame[] = sim.frames;
export const PUPPY_ANSWERS: string[] = sim.out;

const META: { expr: string; trap: string; why: string }[] = [
  { expr: "kone.breed", trap: "static field", why: "breed is static: ONE box for the whole class. Poodle was written last, so every puppy (kone too) reads Poodle." },
  { expr: "puppies == woofies", trap: "== compares arrows", why: "They are two different array objects, even though they hold the same arrows. == only asks 'same object?'." },
  { expr: "kone.breed.equals(kthree.breed)", trap: "static field", why: "Both read the same static box, so both are the same String." },
  { expr: "ktwo.weight", trap: "arrow copy writes through", why: "spellPotion got a copy of the arrow to Mittens. Writing through it changed the real object: 30 / 2 = 15." },
  { expr: "kone.name", trap: "reassigning a parameter", why: "magicTrick swapped its own copies a and b. kone itself still points at Fluffy." },
  { expr: "ktwo.name", trap: "reassigning a parameter", why: "Same reason: ktwo still points at Mittens." },
  { expr: "kone.weight == kthree.weight", trap: "== on numbers compares values", why: "== on ints compares the numbers themselves: 25 == 25, so true." },
  { expr: "kone.weight", trap: "slot vs variable", why: "woofies[0] = puppies[1] changed one slot in an array. The variable kone was never touched, so its weight is still 25." },
  { expr: "kone.weight", trap: "reassigning a parameter", why: "reboot's x = new Puppy(...) re-pointed only the local x. kone's object keeps weight 25." },
  { expr: "ktwo.breed", trap: "static field", why: 'x.breed = "mixed" wrote the single shared static box, so every puppy now reads mixed.' },
];

export const PUPPY_ROWS: PuppyRow[] = META.map((m, i) => ({ n: i + 1, expr: m.expr, answer: PUPPY_ANSWERS[i], trap: m.trap, why: m.why }));
