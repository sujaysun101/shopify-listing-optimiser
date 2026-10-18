import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

import { consumeRateLimit } from "@/lib/rate-limit";
import { proposalFromProduct, sampleProposal, sampleVariantSet } from "@/lib/sample-copy";
import type { Product, RewriteProposal, Tone, Variant } from "@/lib/types";
import { TONES } from "@/lib/types";

const MAX_TOKENS = 1400;

const proposalSchema = z.object({
  title: z.string().min(1).max(120),
  seoTitle: z.string().min(1).max(80),
  description: z.string().min(1).max(2500),
  metaDescription: z.string().min(1).max(180),
  imageAlt: z.string().min(1).max(180),
  keywords: z.array(z.string().min(1).max(40)).min(1).max(8),
});

const variantSchema = z.object({
  variants: z
    .array(
      z.object({
        label: z.string().min(1).max(8),
        title: z.string().min(1).max(120),
        hypothesis: z.string().min(1).max(240),
      }),
    )
    .length(3),
});

export type GeneratedRewrite = {
  proposal: RewriteProposal;
  source: "ai" | "sample";
  notice: string | null;
};

function model() {
  return process.env.AI_MODEL || "claude-sonnet-4-6";
}

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced?.[1] ?? text).trim();
  return JSON.parse(raw) as unknown;
}

async function complete(prompt: string) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: model(),
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: prompt }],
  });
  const block = message.content.find((part) => part.type === "text");
  if (!block || block.type !== "text") throw new Error("empty");
  return block.text;
}

function productFacts(product: Product, brandVoice: string, tone: Tone) {
  const toneLabel = TONES.find((item) => item.id === tone);
  return `Brand voice: ${brandVoice || "Calm, specific, independent shop."}
Tone: ${toneLabel?.label ?? tone}. ${toneLabel?.hint ?? ""}
Handle: ${product.handle}
Title: ${product.title}
Type: ${product.productType}
Vendor: ${product.vendor}
Tags: ${product.tags.join(", ")}
Price: ${product.price}
Description: ${product.description}
SEO title: ${product.seoTitle}
Meta description: ${product.metaDescription}
Alt text: ${product.imageAlt}

Do not invent reviews, awards, certifications, or materials that are not implied by these facts. You may clarify benefits that the facts already support.`;
}

export async function generateRewrite(input: {
  userId: string;
  product: Product;
  tone: Tone;
  brandVoice: string;
}): Promise<GeneratedRewrite | { error: string; status: number }> {
  const limit = await consumeRateLimit(input.userId);
  if (!limit.ok) {
    return { error: "Rate limit reached for AI rewrites. Try again in a little while.", status: 429 };
  }
  const sample = sampleProposal(input.product, input.tone);
  if (!process.env.ANTHROPIC_API_KEY) {
    return { proposal: sample.proposal, source: "sample", notice: sample.notice };
  }
  const prompt = `You rewrite Shopify product copy for a small shop. Return only JSON with keys title, seoTitle, description, metaDescription, imageAlt, keywords.
title: under 70 characters when you can.
seoTitle: 45-65 characters.
metaDescription: 120-160 characters.
description: plain text, two or three short paragraphs, no HTML.
imageAlt: concrete visual description under 140 characters.
keywords: 4-8 short phrases already supported by the product.

${productFacts(input.product, input.brandVoice, input.tone)}`;
  try {
    const parsed = proposalSchema.safeParse(extractJson(await complete(prompt)));
    if (!parsed.success) {
      return {
        proposal: sample.proposal,
        source: "sample",
        notice: "The model reply did not match the expected shape, so this is a labeled sample rewrite.",
      };
    }
    return { proposal: parsed.data, source: "ai", notice: null };
  } catch {
    return {
      proposal: sample.proposal,
      source: "sample",
      notice: "Claude was unavailable, so this is a labeled sample rewrite.",
    };
  }
}

export async function generateVariants(input: {
  userId: string;
  product: Product;
  tone: Tone;
  brandVoice: string;
  storeId: string;
}): Promise<{ variants: Omit<Variant, "createdAt">[]; source: "ai" | "sample"; notice: string | null } | { error: string; status: number }> {
  const limit = await consumeRateLimit(input.userId);
  if (!limit.ok) {
    return { error: "Rate limit reached for AI rewrites. Try again in a little while.", status: 429 };
  }
  const fallback = sampleVariantSet(input.product, input.storeId);
  if (!process.env.ANTHROPIC_API_KEY) {
    return { variants: fallback, source: "sample", notice: "Sample titles. Set ANTHROPIC_API_KEY to draft these with Claude." };
  }
  const prompt = `Write three A/B title variants for this Shopify product. Return only JSON: {"variants":[{"label":"A","title":"...","hypothesis":"..."}]}.
Each title under 70 characters. Hypotheses are one sentence about what the title tests. Do not invent claims.

${productFacts(input.product, input.brandVoice, input.tone)}
Current title for reference: ${proposalFromProduct(input.product).title}`;
  try {
    const parsed = variantSchema.safeParse(extractJson(await complete(prompt)));
    if (!parsed.success) {
      return {
        variants: fallback,
        source: "sample",
        notice: "The model reply did not match the expected shape, so these are labeled sample titles.",
      };
    }
    return {
      source: "ai",
      notice: null,
      variants: parsed.data.variants.map((variant) => ({
        id: `var_${crypto.randomUUID().slice(0, 8)}`,
        productId: input.product.id,
        storeId: input.storeId,
        label: variant.label,
        title: variant.title,
        hypothesis: variant.hypothesis,
        status: "draft" as const,
      })),
    };
  } catch {
    return {
      variants: fallback,
      source: "sample",
      notice: "Claude was unavailable, so these are labeled sample titles.",
    };
  }
}
