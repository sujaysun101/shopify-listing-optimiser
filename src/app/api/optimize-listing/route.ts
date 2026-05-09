import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { productName, currentDescription, targetAudience, price, category } = await req.json();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `You are an expert Shopify ecommerce copywriter and SEO specialist. Create an optimized product listing.

Product Name: ${productName}
Category: ${category}
Price: ${price}
Target Audience: ${targetAudience}
Current Description: ${currentDescription}

Return ONLY this JSON:
{
  "optimizedTitle": "SEO-optimized product title (max 80 chars)",
  "bulletPoints": ["5 compelling bullet points highlighting key features/benefits"],
  "fullDescription": "Full product description (3-4 paragraphs, includes keywords naturally, plain text not HTML)",
  "seoKeywords": ["10-15 relevant search keywords"],
  "pricingNotes": "Brief pricing strategy notes",
  "metaDescription": "155-char meta description for SEO"
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") return NextResponse.json({ error: "Unexpected response" }, { status: 500 });

  try {
    return NextResponse.json(JSON.parse(content.text));
  } catch {
    return NextResponse.json({ error: "Failed to parse" }, { status: 500 });
  }
}
