"use client";

import { Button } from "@/components/ui/button";

export default function WorkspaceError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-xl border px-6 py-12">
      <h1 className="font-serif text-3xl">The workspace hit a problem</h1>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">{error.message}</p>
      <Button className="mt-4" onClick={reset}>Try again</Button>
    </div>
  );
}
