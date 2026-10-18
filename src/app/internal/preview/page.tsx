import { notFound, redirect } from "next/navigation";

import { screenshotMode } from "@/lib/session";

export const dynamic = "force-dynamic";

export default function PreviewBypass() {
  if (!screenshotMode()) notFound();
  redirect("/app/products/prod_linen_spray");
}
