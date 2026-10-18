import { badRequest, workspace } from "@/lib/api";
import { tickJob } from "@/lib/optimize";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await workspace();
  if ("response" in ctx) return ctx.response;
  const { id } = await context.params;
  const result = await tickJob(ctx.repo, ctx.store, id, ctx.session.userId);
  if (!result) return badRequest("That queue was not found.", 404);
  if (result.rateLimited) {
    const message = "error" in result ? result.error : "Rate limit reached.";
    const status = "status" in result ? result.status : 429;
    return badRequest(message, status);
  }
  return Response.json({ job: result.job, items: result.items });
}
