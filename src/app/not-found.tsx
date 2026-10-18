import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-4xl">That page is not in the catalog</h1>
        <p className="mt-2 text-sm text-muted-foreground">The link may be old, or the product was removed.</p>
        <Link href="/" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">Back to Copycart</Link>
      </div>
    </div>
  );
}
