import "server-only";

import { decryptSecret } from "@/lib/crypto";
import type { Product, ProductDraft, Store } from "@/lib/types";
import { htmlToText, textToHtml } from "@/lib/text";

const API_VERSION = "2024-10";

export function normalizeShopDomain(input: string) {
  let value = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!value) return null;
  if (!value.includes(".")) value = `${value}.myshopify.com`;
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(value)) return null;
  return value;
}

type ShopifyImage = { id?: number; src?: string; alt?: string | null };
type ShopifyProduct = {
  id: number;
  title?: string;
  handle?: string;
  body_html?: string | null;
  vendor?: string | null;
  product_type?: string | null;
  tags?: string | null;
  status?: string | null;
  image?: ShopifyImage | null;
  images?: ShopifyImage[];
  variants?: { price?: string }[];
};

async function shopifyFetch(domain: string, token: string, path: string, init?: RequestInit) {
  const response = await fetch(`https://${domain}/admin/api/${API_VERSION}${path}`, {
    ...init,
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(20000),
  });
  return response;
}

export function storeToken(store: Store) {
  if (!store.tokenCiphertext || !store.shopDomain) return null;
  const token = decryptSecret(store.tokenCiphertext);
  if (!token) return null;
  return { domain: store.shopDomain, token };
}

export async function importShopifyProducts(domain: string, token: string): Promise<ProductDraft[]> {
  const response = await shopifyFetch(domain, token, "/products.json?limit=100");
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      response.status === 401
        ? "Shopify refused the access token."
        : `Shopify returned ${response.status}. ${detail.slice(0, 180)}`,
    );
  }
  const body = (await response.json()) as { products?: ShopifyProduct[] };
  return (body.products ?? []).map((product) => {
    const image = product.image ?? product.images?.[0];
    return {
      handle: product.handle || `product-${product.id}`,
      title: product.title || "Untitled",
      description: htmlToText(product.body_html || ""),
      vendor: product.vendor || "",
      productType: product.product_type || "",
      tags: (product.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      price: product.variants?.[0]?.price || "",
      imageSrc: image?.src || "",
      imageAlt: image?.alt || "",
      seoTitle: "",
      metaDescription: "",
      status: product.status === "draft" ? "draft" : "active",
      shopifyProductId: String(product.id),
      shopifyImageId: image?.id ? String(image.id) : null,
    } satisfies ProductDraft;
  });
}

async function upsertMetafield(
  domain: string,
  token: string,
  productId: string,
  key: string,
  value: string,
) {
  if (!value.trim()) return;
  const listed = await shopifyFetch(domain, token, `/products/${productId}/metafields.json`);
  if (!listed.ok) return;
  const body = (await listed.json()) as {
    metafields?: { id: number; namespace: string; key: string }[];
  };
  const existing = body.metafields?.find((field) => field.namespace === "global" && field.key === key);
  if (existing) {
    await shopifyFetch(domain, token, `/metafields/${existing.id}.json`, {
      method: "PUT",
      body: JSON.stringify({ metafield: { id: existing.id, value, type: "single_line_text_field" } }),
    });
    return;
  }
  await shopifyFetch(domain, token, `/products/${productId}/metafields.json`, {
    method: "POST",
    body: JSON.stringify({
      metafield: { namespace: "global", key, value, type: "single_line_text_field" },
    }),
  });
}

export async function pushProduct(domain: string, token: string, product: Product) {
  if (!product.shopifyProductId) {
    return { ok: false, message: "Imported from CSV, so Shopify has no product id to update." };
  }
  const response = await shopifyFetch(domain, token, `/products/${product.shopifyProductId}.json`, {
    method: "PUT",
    body: JSON.stringify({
      product: {
        id: Number(product.shopifyProductId),
        title: product.title,
        body_html: textToHtml(product.description),
        tags: product.tags.join(", "),
      },
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    return { ok: false, message: `Shopify returned ${response.status}. ${detail.slice(0, 160)}` };
  }
  await upsertMetafield(domain, token, product.shopifyProductId, "title_tag", product.seoTitle);
  await upsertMetafield(domain, token, product.shopifyProductId, "description_tag", product.metaDescription);
  if (product.shopifyImageId && product.imageAlt) {
    await shopifyFetch(
      domain,
      token,
      `/products/${product.shopifyProductId}/images/${product.shopifyImageId}.json`,
      {
        method: "PUT",
        body: JSON.stringify({
          image: { id: Number(product.shopifyImageId), alt: product.imageAlt },
        }),
      },
    );
  }
  return { ok: true, message: "Pushed title, description, tags, and SEO fields." };
}
