"use client";
import { useState } from "react";
import { Callout, Check, Code, Panel, Reveal, Row, Sec } from "../ui";
import { ListViz, Trace } from "../viz";
import { COUNT_CODE, ISEMPTY_CODE, REMOVE_CODE, countFrames, isEmptyFrames, removeFirstFrames, sbAddFirst, sbCount, sbIsEmpty, sbRemoveFirst } from "@/lib/sentinelSim";

const nodes = (items: string[]) => [{ v: "dummy", sentinel: true }, ...items.map((v) => ({ v }))];

const COUNT_SCEN: Record<string, { label: string; items: string[]; target: string }> = {
  normal: { label: 'a, b, a, c  · target "a"', items: ["a", "b", "a", "c"], target: "a" },
  empty: { label: "empty list", items: [], target: "a" },
  dummy: { label: 'x · target "dummy"', items: ["x"], target: "dummy" },
};
const REMOVE_SCEN: Record<string, { label: string; items: string[] }> = {
  three: { label: "a, b, c", items: ["a", "b", "c"] },
  one: { label: "just a", items: ["a"] },
  empty: { label: "empty list", items: [] },
};

export default function ListStation() {
  const [tab, setTab] = useState<"isEmpty" | "removeFirst" | "count">("isEmpty");
  const [cs, setCs] = useState("normal");
  const [rs, setRs] = useState("three");
  const [items, setItems] = useState<string[]>(["a", "b", "a"]);
  const [val, setVal] = useState("a");
  const [msg, setMsg] = useState("Try the buttons. The dashed box is the sentinel: it is never one of your items.");

  const chip = (id: string, label: string, cur: string, set: (s: string) => void) => (
    <button key={id} className="btn !text-xs" onClick={() => set(id)} style={cur === id ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}>{label}</button>
  );

  return (
    <div>
      <p className="text-lg muted">
        Problem 4 is <strong>10 points</strong> (2 + 2 + 6). The mark scheme rewards three habits: <em>start at the right node</em>, <em>never follow a null</em>, and <em>use .equals for Strings</em>.
      </p>

      <Sec kicker="Step 1 · The sentinel" title="One dummy node that removes the special cases">
        <p>The list is whatever comes <strong>after</strong> the sentinel. So the real first node is <code className="inline">sen.next</code>, and an empty list is a sentinel whose next is null.</p>
        <div className="card card-pad my-3">
          <ListViz spec={{ title: "three items", nodes: nodes(["a", "b", "c"]), ptrs: { sen: 0 } }} />
          <ListViz spec={{ title: "empty list: sen.next == null", nodes: nodes([]), ptrs: { sen: 0 } }} />
        </div>
        <Callout kind="key" title="Why it exists">
          Without it, removing or adding at the front changes where the list itself starts. With it, the front is just another <code className="inline">something.next = ...</code> and the sentinel never moves.
        </Callout>
      </Sec>

      <Sec kicker="Step 2 · The three methods" title="Attempt on paper, then watch the pointers move">
        <div className="flex flex-wrap gap-1.5">
          {(["isEmpty", "removeFirst", "count"] as const).map((k) => (
            <button key={k} className="btn" onClick={() => setTab(k)} style={tab === k ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}>
              {k === "isEmpty" ? "(1) isEmpty · 2 pts" : k === "removeFirst" ? "(2) removeFirst · 2 pts" : "(3) count · 6 pts"}
            </button>
          ))}
        </div>

        {tab === "isEmpty" && (
          <div>
            <Reveal q={<>Write <code className="inline">isEmpty()</code> on paper. It must not break when the list is empty and must not change the list.</>} label="Show the answer">
              <Code code={ISEMPTY_CODE} />
              <p>One comparison. The sentinel itself is never null, so test <code className="inline">sen.next</code>.</p>
            </Reveal>
            <Trace code={ISEMPTY_CODE} frames={isEmptyFrames()} title="isEmpty on two lists" />
          </div>
        )}

        {tab === "removeFirst" && (
          <div>
            <Reveal q={<>Write <code className="inline">removeFirst()</code>. If the list is empty it does nothing.</>} label="Show the answer">
              <Code code={REMOVE_CODE} />
              <p>The guard is the point: on an empty list <code className="inline">sen.next.next</code> would follow a null and crash.</p>
            </Reveal>
            <div className="mt-2 flex flex-wrap gap-1.5">{Object.entries(REMOVE_SCEN).map(([id, s]) => chip(id, s.label, rs, setRs))}</div>
            <Trace key={rs} code={REMOVE_CODE} frames={removeFirstFrames(REMOVE_SCEN[rs].items)} title="removeFirst" />
          </div>
        )}

        {tab === "count" && (
          <div>
            <Reveal q={<>Write <code className="inline">count(String target)</code>: how many nodes hold the target. Walk the list once, do not modify it.</>} label="Show the answer + the 6 marks">
              <Code code={COUNT_CODE} />
              <ol>
                <li>counter starts at 0 and is returned</li>
                <li>walk starts at <code className="inline">sen.next</code>, not the dummy</li>
                <li>loop stops when <code className="inline">p == null</code></li>
                <li>Strings compared with <code className="inline">.equals</code></li>
                <li>counter incremented on a match</li>
                <li><code className="inline">p = p.next</code> runs every iteration</li>
              </ol>
            </Reveal>
            <div className="mt-2 flex flex-wrap gap-1.5">{Object.entries(COUNT_SCEN).map(([id, s]) => chip(id, s.label, cs, setCs))}</div>
            <Trace key={cs} code={COUNT_CODE} frames={countFrames(COUNT_SCEN[cs].items, COUNT_SCEN[cs].target)} title="count" />
          </div>
        )}
      </Sec>

      <Sec kicker="Step 3 · Play" title="Sandbox: operate the list yourself">
        <div className="card card-pad my-3">
          <ListViz spec={{ title: "your list", nodes: nodes(items), ptrs: { sen: 0 } }} />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input className="mono w-24 rounded-md border bg-transparent px-2 py-1 text-sm" style={{ borderColor: "var(--line)" }} value={val} onChange={(e) => setVal(e.target.value)} aria-label="value" />
            <button className="btn" onClick={() => { if (!val.trim()) return; setItems(sbAddFirst(items, val.trim())); setMsg(`addFirst("${val.trim()}"): sen.next = new StrNode("${val.trim()}", sen.next).`); }}>addFirst(x)</button>
            <button className="btn" onClick={() => { setMsg(items.length ? `removeFirst(): sen.next = sen.next.next, so "${items[0]}" is unlinked.` : "removeFirst() on an empty list: the guard is false, nothing happens."); setItems(sbRemoveFirst(items)); }}>removeFirst()</button>
            <button className="btn" onClick={() => setMsg(`isEmpty() returns ${sbIsEmpty(items)}.`)}>isEmpty()</button>
            <button className="btn" onClick={() => setMsg(`count("${val.trim()}") returns ${sbCount(items, val.trim())}.`)}>count(x)</button>
            <button className="btn" onClick={() => { setItems([]); setMsg("Cleared: sen.next = null."); }}>clear</button>
          </div>
          <div className="mt-2 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--accent-soft)" }}>{msg}</div>
        </div>
      </Sec>

      <Sec kicker="Step 4 · Spot the bug" title="What goes wrong?">
        <Check
          q="This count(String target) counts wrongly or crashes. Why?"
          code={`int c = 0;\nStrNode p = sen;\nwhile (p != null) {\n    if (p.head.equals(target)) c++;\n    p = p.next;\n}\nreturn c;`}
          options={["It starts at the sentinel, so a target of \"dummy\" is counted", "It never terminates", "It throws a NullPointerException on every list", "Nothing, it is correct"]}
          answer={0}
          why={"The walk should start at sen.next. Starting at sen also reads the dummy node's \"dummy\" string."}
        />
        <Check
          q="What is wrong with this loop?"
          code={`StrNode p = sen.next;\nwhile (p.next != null) {\n    if (p.head.equals(target)) c++;\n    p = p.next;\n}`}
          options={["It skips the last node, and crashes on an empty list", "It counts every node twice", "It modifies the list", "Nothing"]}
          answer={0}
          why="p.next != null stops one node early (the last node has next == null) and on an empty list p itself is null, so p.next is a NullPointerException. Test p != null instead."
        />
        <Check
          q="What is wrong with this check?"
          code={`if (p.head == target) c++;`}
          options={["== compares references: two equal Strings can be different objects", "head is not accessible", "It should be p.next", "Nothing"]}
          answer={0}
          why="For Strings, == asks 'same object?'. Use p.head.equals(target) to compare the text."
        />
        <Row>
          <Panel title="Before you write any pointer code">Draw the list with the sentinel. Put your pointer(s) on it. Ask: which arrow changes? Is any pointer possibly null at this moment?</Panel>
          <Panel title="Practice the same patterns in Code Lab">
            I added three new problems to the end of <strong>Code Lab</strong>: counting characters, <code className="inline">count</code> for the sentinel list, and <code className="inline">removeAll</code> (the hard one).
          </Panel>
        </Row>
      </Sec>
    </div>
  );
}
