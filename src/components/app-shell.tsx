"use client";

import { UserButton } from "@clerk/nextjs";
import {
  Download,
  FlaskConical,
  LayoutDashboard,
  ListChecks,
  Menu,
  Package,
  Search,
  Settings,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { clerkAppearance } from "@/components/brand";
import { CommandPalette } from "@/components/command-palette";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/products", label: "Products", icon: Package },
  { href: "/app/import", label: "Import", icon: Upload },
  { href: "/app/queue", label: "Queue", icon: ListChecks },
  { href: "/app/variants", label: "Title tests", icon: FlaskConical },
  { href: "/app/export", label: "Export", icon: Download },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

function active(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  children,
  storeName,
  demoData,
  clerkEnabled,
}: {
  children: React.ReactNode;
  storeName: string;
  demoData: boolean;
  clerkEnabled: boolean;
}) {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [palette, setPalette] = useState(false);
  const open = openPath === pathname;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <Link href="/app" className="flex items-center gap-2.5 px-4 py-4">
        <Logo className="size-8" />
        <span className="font-serif text-xl tracking-tight text-white">Copycart</span>
      </Link>
      <nav aria-label="Store" className="flex flex-1 flex-col gap-1 px-3">
        {nav.map((item) => {
          const Icon = item.icon;
          const current = active(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white",
                current && "bg-sidebar-accent text-white",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="px-4 py-4 text-xs leading-relaxed text-sidebar-foreground/55">
        Product pages for a shop small enough that you still know the inventory.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="md:grid md:grid-cols-[240px_1fr]">
        <aside className="sticky top-0 hidden h-screen md:block">{sidebar}</aside>
        <div className="min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur md:px-6">
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation" onClick={() => setOpenPath(pathname)}>
              <Menu className="size-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{storeName}</p>
            </div>
            {demoData ? (
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Demo data
              </span>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => setPalette(true)} className="hidden sm:inline-flex">
              <Search className="size-3.5" />
              Search
              <kbd className="rounded border bg-muted px-1 text-[10px] text-muted-foreground">⌘K</kbd>
            </Button>
            <ThemeToggle />
            {clerkEnabled ? (
              <UserButton appearance={clerkAppearance} />
            ) : (
              <div className="flex items-center gap-2 pl-1" title="Demo session">
                <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  ME
                </span>
                <span className="hidden text-sm sm:inline">Mara Ellison</span>
              </div>
            )}
          </header>
          <main id="main" className="px-4 py-6 md:px-8 md:py-8">
            {children}
          </main>
        </div>
      </div>
      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button className="absolute inset-0 bg-black/40" aria-label="Close navigation" onClick={() => setOpenPath(null)} />
          <div className="absolute inset-y-0 left-0 w-72 shadow-xl">
            <button
              className="absolute right-3 top-3 z-10 rounded-md p-1 text-sidebar-foreground"
              aria-label="Close navigation"
              onClick={() => setOpenPath(null)}
            >
              <X className="size-4" />
            </button>
            {sidebar}
          </div>
        </div>
      ) : null}
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </div>
  );
}
