import { AppShell } from "@/components/app-shell";
import { getRepo } from "@/lib/repo";
import { clerkKeysPresent, demoDataMode, requireUser, screenshotMode } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();
  const repo = getRepo();
  const store = await repo.ensureStore(session.userId);
  const clerkEnabled = session.mode === "clerk" && (clerkKeysPresent() || process.env.NODE_ENV === "development") && !screenshotMode();
  return (
    <AppShell storeName={store.name} demoData={demoDataMode()} clerkEnabled={clerkEnabled}>
      {children}
    </AppShell>
  );
}
