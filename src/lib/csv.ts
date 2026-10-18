import type { Product, ProductDraft } from "@/lib/types";
import { htmlToText, textToHtml } from "@/lib/text";

export const SHOPIFY_COLUMNS = [
  "Handle",
  "Title",
  "Body (HTML)",
  "Vendor",
  "Type",
  "Tags",
  "Variant Price",
  "Image Src",
  "Image Alt Text",
  "SEO Title",
  "SEO Description",
  "Status",
] as const;

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i += 1) {
    const char = src[i];
    if (inQuotes) {
      if (char === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && src[i + 1] === "\n") i += 1;
      row.push(cell);
      cell = "";
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    cell += char ?? "";
  }
  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
}

function indexOfHeader(header: string[], name: string) {
  return header.findIndex((value) => value.trim().toLowerCase() === name.toLowerCase());
}

function cell(row: string[], index: number) {
  if (index < 0) return "";
  return (row[index] ?? "").trim();
}

export function csvToDrafts(text: string): { drafts: ProductDraft[]; errors: string[] } {
  const table = parseCsv(text);
  if (table.length < 2) {
    return { drafts: [], errors: ["The file needs a header row and at least one product."] };
  }
  const header = table[0] ?? [];
  const handleIndex = indexOfHeader(header, "Handle");
  const titleIndex = indexOfHeader(header, "Title");
  if (handleIndex < 0 || titleIndex < 0) {
    return { drafts: [], errors: ["Shopify exports need Handle and Title columns."] };
  }
  const columns = {
    body: indexOfHeader(header, "Body (HTML)"),
    vendor: indexOfHeader(header, "Vendor"),
    type: indexOfHeader(header, "Type"),
    tags: indexOfHeader(header, "Tags"),
    price: indexOfHeader(header, "Variant Price"),
    image: indexOfHeader(header, "Image Src"),
    alt: indexOfHeader(header, "Image Alt Text"),
    seoTitle: indexOfHeader(header, "SEO Title"),
    seo: indexOfHeader(header, "SEO Description"),
    status: indexOfHeader(header, "Status"),
  };
  const byHandle = new Map<string, ProductDraft>();
  const errors: string[] = [];
  for (const row of table.slice(1)) {
    const handle = cell(row, handleIndex);
    if (!handle) continue;
    const existing = byHandle.get(handle);
    const title = cell(row, titleIndex);
    if (!existing) {
      if (!title) {
        errors.push(`Skipped “${handle}” because the first row has no title.`);
        continue;
      }
      const statusValue = cell(row, columns.status).toLowerCase();
      byHandle.set(handle, {
        handle,
        title,
        description: htmlToText(cell(row, columns.body)),
        vendor: cell(row, columns.vendor),
        productType: cell(row, columns.type),
        tags: cell(row, columns.tags)
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        price: cell(row, columns.price),
        imageSrc: cell(row, columns.image),
        imageAlt: cell(row, columns.alt),
        seoTitle: cell(row, columns.seoTitle),
        metaDescription: cell(row, columns.seo),
        status: statusValue === "draft" ? "draft" : "active",
      });
      continue;
    }
    if (!existing.imageAlt && cell(row, columns.alt)) existing.imageAlt = cell(row, columns.alt);
    if (!existing.imageSrc && cell(row, columns.image)) existing.imageSrc = cell(row, columns.image);
    if (!existing.price && cell(row, columns.price)) existing.price = cell(row, columns.price);
  }
  return { drafts: [...byHandle.values()], errors };
}

function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function productsToCsv(products: Product[]) {
  const lines = [SHOPIFY_COLUMNS.join(",")];
  for (const product of products) {
    const row = [
      product.handle,
      product.title,
      textToHtml(product.description),
      product.vendor,
      product.productType,
      product.tags.join(", "),
      product.price,
      product.imageSrc,
      product.imageAlt,
      product.seoTitle,
      product.metaDescription,
      product.status,
    ];
    lines.push(row.map(csvEscape).join(","));
  }
  return `${lines.join("\n")}\n`;
}
