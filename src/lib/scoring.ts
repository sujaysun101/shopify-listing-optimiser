import type { Check, CheckStatus, Product, ScoreResult } from "@/lib/types";

const BENEFIT_PATTERNS = [
  /\bso you\b/i,
  /\byou(?:'ll| will| can)\b/i,
  /\bperfect for\b/i,
  /\bmade for\b/i,
  /\bhelps\b/i,
  /\blasts\b/i,
  /\bhours?\b/i,
  /\bgift\b/i,
  /\bcalm\b/i,
  /\bwarm\b/i,
  /\bscent\b/i,
  /\bthrow\b/i,
  /\bsoft\b/i,
  /\bclean burn/i,
  /\bhand[- ](?:poured|thrown|loomed|cut)\b/i,
  /\bevening\b/i,
  /\britual\b/i,
  /\bwithout\b/i,
  /\benjoy\b/i,
  /\bfeels?\b/i,
  /\bguests?\b/i,
  /\bquiet\b/i,
  /\bslow\b/i,
];

function statusFor(points: number, max: number): CheckStatus {
  if (points >= max) return "pass";
  if (points <= 0) return "fail";
  return "warn";
}

function words(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2);
}

function listingTitle(product: Pick<Product, "title" | "seoTitle">) {
  return (product.seoTitle || product.title).trim();
}

function keywordHits(product: Pick<Product, "title" | "description" | "tags" | "productType" | "seoTitle">) {
  const haystack = `${product.title} ${product.seoTitle} ${product.description}`.toLowerCase();
  const seeds = new Set<string>();
  for (const tag of product.tags) {
    for (const word of words(tag)) seeds.add(word);
    if (tag.trim()) seeds.add(tag.trim().toLowerCase());
  }
  for (const word of words(product.productType)) seeds.add(word);
  const ignore = new Set(["and", "the", "for", "with", "set", "oz"]);
  let hits = 0;
  const found: string[] = [];
  for (const seed of seeds) {
    if (ignore.has(seed) || seed.length < 3) continue;
    if (haystack.includes(seed)) {
      hits += 1;
      found.push(seed);
    }
  }
  return { hits, found: found.slice(0, 4) };
}

function titleCheck(product: Pick<Product, "title" | "seoTitle">): Check {
  const title = listingTitle(product);
  const length = title.length;
  let points = 0;
  let detail = "Add a title before this listing can rank or convert.";
  if (length === 0) points = 0;
  else if (length >= 45 && length <= 65) {
    points = 20;
    detail = `Title is ${length} characters, inside the 45–65 range that stays intact in search snippets and on a product card.`;
  } else if ((length >= 30 && length < 45) || (length > 65 && length <= 80)) {
    points = 12;
    detail = `Title is ${length} characters. Aim for 45–65 so the product and a distinguishing detail both fit.`;
  } else if (length < 30) {
    points = 4;
    detail = `Title is only ${length} characters. Shoppers cannot tell the material, size, or scent from it.`;
  } else {
    points = 6;
    detail = `Title is ${length} characters and will truncate in Google and on collection grids. Cut it toward 60.`;
  }
  return { id: "title", label: "Title length", status: statusFor(points, 20), points, max: 20, detail };
}

function keywordCheck(product: Pick<Product, "title" | "description" | "tags" | "productType" | "seoTitle">): Check {
  const { hits, found } = keywordHits(product);
  let points = 0;
  let detail = "No product type or tag language shows up in the title or description.";
  if (product.tags.length === 0 && !product.productType.trim()) {
    points = 4;
    detail = "This product has no type or tags, so there is nothing to match against the copy.";
  } else if (hits >= 3) {
    points = 20;
    detail = `Search language shows up naturally: ${found.join(", ")}.`;
  } else if (hits === 2) {
    points = 14;
    detail = `Two keyword cues appear (${found.join(", ")}). Work one more tag into the title or opening line.`;
  } else if (hits === 1) {
    points = 8;
    detail = `Only “${found[0] ?? "one term"}” from the tags or type appears in the copy.`;
  }
  return { id: "keywords", label: "Keywords", status: statusFor(points, 20), points, max: 20, detail };
}

function benefitCheck(product: Pick<Product, "description">): Check {
  const text = product.description.trim();
  const wordCount = text ? text.split(/\s+/).length : 0;
  const signals = BENEFIT_PATTERNS.filter((pattern) => pattern.test(text)).length;
  let points = 0;
  let detail = "The description does not say what changes for the person who buys this.";
  if (wordCount >= 70 && signals >= 2) {
    points = 25;
    detail = `${wordCount} words, with concrete use and benefit language a shopper can picture.`;
  } else if (wordCount >= 40 && signals >= 1) {
    points = 16;
    detail = `The description has a benefit, and it is still short at ${wordCount} words. Add how it is used or how long it lasts.`;
  } else if (wordCount >= 20) {
    points = 8;
    detail = `${wordCount} words of feature copy, with little about the person using it.`;
  } else if (wordCount > 0) {
    points = 3;
    detail = "The description is a fragment. It needs a use, a material, and a reason to choose it.";
  }
  return { id: "benefits", label: "Benefits", status: statusFor(points, 25), points, max: 25, detail };
}

function altCheck(product: Pick<Product, "imageAlt" | "title">): Check {
  const alt = product.imageAlt.trim();
  const generic = /^(image|photo|picture|img|alt|product image|placeholder)$/i.test(alt);
  let points = 0;
  let detail = "Image alt text is empty, so screen readers and Google Images get nothing.";
  if (!alt || generic) {
    points = 0;
    detail = generic
      ? `Alt text is “${alt}”, which does not describe the product.`
      : detail;
  } else if (alt.toLowerCase() === product.title.trim().toLowerCase() && alt.length < 40) {
    points = 6;
    detail = "Alt text repeats the title. Describe color, material, or setting so the image can be found on its own.";
  } else if (alt.length > 140) {
    points = 10;
    detail = `Alt text is ${alt.length} characters. Keep it under 140 and lead with what is in the frame.`;
  } else if (alt.length >= 20) {
    points = 15;
    detail = "Alt text describes the object specifically enough for a shopper who cannot see the photo.";
  } else {
    points = 8;
    detail = `Alt text is only ${alt.length} characters. Add one visual detail: color, material, or setting.`;
  }
  return { id: "alt", label: "Alt text", status: statusFor(points, 15), points, max: 15, detail };
}

function metaCheck(product: Pick<Product, "metaDescription" | "tags" | "productType" | "title">): Check {
  const meta = product.metaDescription.trim();
  const length = meta.length;
  const { hits } = keywordHits({
    title: meta,
    seoTitle: "",
    description: "",
    tags: product.tags,
    productType: product.productType,
  });
  let points = 0;
  let detail = "Meta description is empty, so search results will improvise a snippet from the page.";
  if (!meta) points = 0;
  else if (length >= 120 && length <= 160) {
    points = hits > 0 ? 20 : 16;
    detail =
      hits > 0
        ? `Meta description is ${length} characters and includes search language from this product.`
        : `Length is right at ${length} characters. Name the product type or a tag so the snippet matches the search.`;
  } else if ((length >= 90 && length < 120) || (length > 160 && length <= 180)) {
    points = 12;
    detail = `Meta description is ${length} characters. 120–160 keeps the full sentence visible.`;
  } else if (length >= 40) {
    points = 6;
    detail = `Meta description is ${length} characters, too short to explain who it is for.`;
  } else {
    points = 2;
    detail = "Meta description is too short to use as a search snippet.";
  }
  return { id: "meta", label: "Meta description", status: statusFor(points, 20), points, max: 20, detail };
}

export function scoreProduct(
  product: Pick<
    Product,
    "title" | "seoTitle" | "description" | "tags" | "productType" | "imageAlt" | "metaDescription"
  >,
): ScoreResult {
  const checks = [
    titleCheck(product),
    keywordCheck(product),
    benefitCheck(product),
    altCheck(product),
    metaCheck(product),
  ];
  const score = checks.reduce((sum, check) => sum + check.points, 0);
  return { score, checks };
}

export function scoreBand(score: number) {
  if (score >= 85) return { label: "Ready", key: "ready" as const };
  if (score >= 70) return { label: "Strong", key: "strong" as const };
  if (score >= 50) return { label: "Fair", key: "fair" as const };
  return { label: "Needs work", key: "work" as const };
}

export function distribution(scores: number[]) {
  const buckets = [
    { label: "Needs work", range: "0–49", min: 0, max: 49, count: 0 },
    { label: "Fair", range: "50–69", min: 50, max: 69, count: 0 },
    { label: "Strong", range: "70–84", min: 70, max: 84, count: 0 },
    { label: "Ready", range: "85–100", min: 85, max: 100, count: 0 },
  ];
  for (const score of scores) {
    const bucket = buckets.find((item) => score >= item.min && score <= item.max);
    if (bucket) bucket.count += 1;
  }
  return buckets;
}
