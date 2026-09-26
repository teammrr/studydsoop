import { notFound } from "next/navigation";
import { LESSONS } from "@/lib/lessons";
import { LessonBody, LessonFooter } from "@/components/LessonBody";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = LESSONS.find((x) => x.slug === slug);
  return { title: l ? `${l.title} · DSOOP Quiz Prep` : "Lesson" };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = LESSONS.findIndex((l) => l.slug === slug);
  if (i < 0) notFound();
  const l = LESSONS[i];
  return (
    <article>
      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
        <span className="chip">Lesson {i + 1} of {LESSONS.length}</span>
        <span className="chip">~{l.mins} min</span>
        <span className="chip">Course: {l.source}</span>
        {l.sourceUrl && (
          <a className="underline muted" href={l.sourceUrl} target="_blank" rel="noreferrer">open the course page ↗</a>
        )}
      </div>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">{l.title}</h1>
      <div className="mt-4">
        <LessonBody slug={slug} />
      </div>
      <LessonFooter slug={slug} />
    </article>
  );
}
