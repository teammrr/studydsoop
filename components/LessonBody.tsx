"use client";
import Link from "next/link";
import { ComponentType } from "react";
import { LESSONS } from "@/lib/lessons";
import { useProgress } from "@/lib/progress";
import Approach from "./lessons/Approach";
import JavaBasics from "./lessons/JavaBasics";
import References from "./lessons/References";
import Overloading from "./lessons/Overloading";
import LinkedLists from "./lessons/LinkedLists";
import SLListLesson from "./lessons/SLList";
import StacksQueues from "./lessons/StacksQueues";
import ArrayListLesson from "./lessons/ArrayListLesson";
import Invariants from "./lessons/Invariants";

const MAP: Record<string, ComponentType> = {
  approach: Approach,
  "java-basics": JavaBasics,
  references: References,
  "overloading-static": Overloading,
  "linked-lists": LinkedLists,
  sllist: SLListLesson,
  "generics-stacks-queues": StacksQueues,
  arraylist: ArrayListLesson,
  invariants: Invariants,
};

export function LessonBody({ slug }: { slug: string }) {
  const C = MAP[slug];
  return C ? <C /> : null;
}

export function LessonFooter({ slug }: { slug: string }) {
  const { p, setDone } = useProgress();
  const i = LESSONS.findIndex((l) => l.slug === slug);
  const next = LESSONS[i + 1];
  const done = !!p.done[slug];
  return (
    <div className="card card-pad mt-16 flex flex-wrap items-center justify-between gap-3">
      <button className={"btn " + (done ? "" : "btn-primary")} onClick={() => setDone(slug, !done)}>
        {done ? "✓ Completed (click to undo)" : "Mark lesson complete"}
      </button>
      {next ? (
        <Link href={`/learn/${next.slug}`} className="btn">Next: {next.title} →</Link>
      ) : (
        <Link href="/quiz" className="btn btn-primary">Take a practice quiz →</Link>
      )}
    </div>
  );
}
