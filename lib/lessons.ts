export type LessonMeta = {
  slug: string;
  title: string;
  blurb: string;
  mins: number;
  source: string;
  sourceUrl?: string;
};

const base = "https://dsoop.cs.muzoo.io/protected/lessons/";

export const LESSONS: LessonMeta[] = [
  {
    slug: "approach",
    title: "How to Attack an Algorithm Problem",
    blurb: "The 6-step loop and a toolkit of patterns. This is the skill you said you're missing.",
    mins: 25,
    source: "Method (applies to every lesson)",
  },
  {
    slug: "java-basics",
    title: "Java Basics, Loops & Arrays",
    blurb: "Python → Java, for/while, fixed arrays, 2D arrays, overflow and BigInteger.",
    mins: 25,
    source: "S2 · L2",
    sourceUrl: base + "02/further-features/",
  },
  {
    slug: "references",
    title: "Classes, Objects & References",
    blurb: "Box-and-pointer diagrams, the Rule of Equals, and parameter passing.",
    mins: 25,
    source: "S3",
    sourceUrl: base + "03/classes-references/",
  },
  {
    slug: "overloading-static",
    title: "Overloading & Static",
    blurb: "Which method runs? What's shared and what's per-object?",
    mins: 15,
    source: "S4",
    sourceUrl: base + "04/overloading-static/",
  },
  {
    slug: "linked-lists",
    title: "Linked Lists (IntNode)",
    blurb: "Walking a chain, recursion on lists, get/set/copy/incrList.",
    mins: 30,
    source: "L3",
    sourceUrl: base + "03/basic-linked/",
  },
  {
    slug: "sllist",
    title: "SLList & the Sentinel Node",
    blurb: "Rewiring pointers safely: addFirst, addLast, removeFirst, insert.",
    mins: 30,
    source: "L4",
    sourceUrl: base + "04/evolving-rustic-list/",
  },
  {
    slug: "generics-stacks-queues",
    title: "Generics, Stacks & Queues",
    blurb: "Type parameters, autoboxing, LIFO vs FIFO and when to use which.",
    mins: 20,
    source: "S5",
    sourceUrl: base + "05/generics/",
  },
  {
    slug: "arraylist",
    title: "ArrayList: Arrays & Resizing",
    blurb: "Resize by doubling, why it's cheap on average, and why addFirst hurts.",
    mins: 30,
    source: "L5",
    sourceUrl: base + "05/alist/",
  },
  {
    slug: "invariants",
    title: "Loop Invariants",
    blurb: "Prove a loop is right: init, preservation, termination.",
    mins: 20,
    source: "W5",
    sourceUrl: base + "05/loop-invariants/",
  },
];

export const TOPICS = [
  "Java basics",
  "Arrays",
  "References",
  "Overloading & static",
  "Linked lists",
  "Sentinel SLList",
  "Generics",
  "Stacks & queues",
  "ArrayList",
  "Invariants",
  "Running time",
] as const;
export type Topic = (typeof TOPICS)[number];

export const TOPIC_LESSON: Record<Topic, string> = {
  "Java basics": "java-basics",
  Arrays: "java-basics",
  References: "references",
  "Overloading & static": "overloading-static",
  "Linked lists": "linked-lists",
  "Sentinel SLList": "sllist",
  Generics: "generics-stacks-queues",
  "Stacks & queues": "generics-stacks-queues",
  ArrayList: "arraylist",
  Invariants: "invariants",
  "Running time": "arraylist",
};
