import { diffWords } from "@/lib/diff";

export function WordDiff({ from, to }: { from: string; to: string }) {
  const diff = diffWords(from, to);
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Current</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {diff.before.map((part, index) => (
            <span key={index} className={part.type === "del" ? "rounded bg-destructive/15 line-through decoration-destructive/70" : undefined}>
              {part.text}
            </span>
          ))}
        </p>
      </div>
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Proposed</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {diff.after.map((part, index) => (
            <span key={index} className={part.type === "add" ? "rounded bg-primary/15" : undefined}>
              {part.text}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
