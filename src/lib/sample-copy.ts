import type { Product, RewriteProposal, Tone, Variant } from "@/lib/types";
import { newId } from "@/lib/demo-catalog";

const SAMPLE_NOTICE = "Sample rewrite. Set ANTHROPIC_API_KEY to draft this with Claude.";

type CopyFields = Omit<RewriteProposal, "keywords">;

const warmCopy: Record<string, CopyFields> = {
  "sunday-linen-spray": {
    title: "Sunday Linen Spray — Crisp Cotton, 4 oz",
    seoTitle: "Sunday Linen Spray, Crisp Cotton",
    description:
      "Sunday Linen Spray is a light cotton mist for sheets, a guest bed, or a room that has gone a little stale. The scent is clean cotton and a thread of white tea, not a heavy floral. Two sprays on a pillow or a curtain is enough; the 4 ounce bottle is meant to last through a season of Sundays rather than a single afternoon. Shake it once, then let it dry before anyone lies down. It is the easiest way to make a made bed feel finished when you do not want to light a candle.",
    metaDescription:
      "Crisp cotton linen spray for sheets and guest rooms. A light 4 oz mist of cotton and white tea, two sprays is enough.",
    imageAlt: "Frosted bottle of Sunday linen spray with a cotton cap on folded oat linen",
  },
  "hearth-matches": {
    title: "Hearth Matches — 60 Long Stems",
    seoTitle: "Hearth Matches, 60 Long Stems",
    description:
      "Sixty long matches in a kraft box, long enough to reach a jar candle without burning your fingers. The strike is on the side, and the stems are wood rather than paper so they stay rigid. Keep the box by the snuffer. They are refill-simple: when the box is empty, you know exactly what to reorder, and they make a small gift beside a new candle.",
    metaDescription:
      "Sixty long hearth matches for jar candles and the fireplace. Wood stems, side strike, long enough to keep your fingers clear.",
    imageAlt: "Kraft box of long wooden hearth matches with a black strike strip",
  },
  "clay-trinket-dish": {
    title: "Clay Trinket Dish for Rings and Matches",
    seoTitle: "Clay Trinket Dish, Speckled",
    description:
      "A small speckled clay dish for the things that otherwise live on the nightstand: rings, a match, a single earring. It is about four inches across, with a low rim so nothing rolls out and a foot that sits flat on wood. The glaze is the same oatmeal speckle as the mug. It is useful beside a candle, where you need a place that is not the wax.",
    metaDescription:
      "A four-inch speckled clay dish for rings, matches, and the nightstand. Low rim, flat foot, same glaze as our mug.",
    imageAlt: "Speckled oatmeal clay trinket dish holding two gold rings",
  },
  "iron-tealight-holder": {
    title: "Cast Iron Tealight Holder",
    seoTitle: "Cast Iron Tealight Holder",
    description:
      "A low cast-iron holder for one tealight. The cup is deep enough that wax stays in the metal, and the weight keeps it steady on a wood table. Use it under the ceramic oil burner or on its own when a jar candle is too much. Wipe it when it is cool. The iron darkens a little with use, which is the finish rather than a flaw.",
    metaDescription:
      "A heavy cast-iron tealight holder that keeps wax off the table. Low cup, steady weight, for the oil burner or on its own.",
    imageAlt: "Low black cast-iron tealight holder with a lit tea light",
  },
  "marble-coasters": {
    title: "Honed Marble Coasters, Set of Four",
    seoTitle: "Honed Marble Coasters, Set of 4",
    description:
      "Four honed marble coasters, each about four inches, with a soft matte face that does not shout. They protect a wood table from a cold glass and from the base of a warm mug. The edges are eased so they do not chip the first week. Cork feet keep them from sliding. A plain, useful set — the marble varies, so no two sets match exactly.",
    metaDescription:
      "Four honed marble coasters with cork feet. About four inches each, matte rather than polished, to protect a wood table.",
    imageAlt: "Four honed cream marble coasters stacked on a walnut table",
  },
  "seagrass-basket": {
    title: "Seagrass Basket with Cotton Handles",
    seoTitle: "Seagrass Storage Basket",
    description:
      "A seagrass basket with cotton-wrapped handles, sized for throws, kindling, or the extra linen. It is about 14 inches across and 12 tall, firm enough to hold its shape when it is half empty. The weave is natural tan. Use it beside the hearth or in a bedroom; it is not waterproof, so keep the bath soak in the cupboard instead. A straightforward piece of storage that still looks like it belongs in the room.",
    metaDescription:
      "A seagrass basket with cotton handles, 14 inches across, for throws, kindling, or spare linen. Firm weave, natural tan.",
    imageAlt: "Round tan seagrass basket with cotton handles holding a folded wool throw",
  },
  "night-market-incense": {
    title: "Sandalwood Incense — 20 Sticks",
    seoTitle: "Sandalwood Incense, 20 Sticks",
    description:
      "Twenty sandalwood incense sticks with a dry wood scent and very little sweetness. One stick is about 25 minutes, which is long enough to mark the end of a workday and short enough that the room recovers. Burn it in a holder that catches ash, and crack a window if the room is small. We keep a bundle by the shop door for the half hour before open.",
    metaDescription:
      "Twenty sandalwood incense sticks, about 25 minutes each. A dry wood scent for the end of the day, not a sweet cloud.",
    imageAlt: "Twenty sandalwood incense sticks laid across a ceramic dish",
  },
  "guest-room-candle": {
    title: "Guest Room Lavender Candle, 6 oz",
    seoTitle: "Guest Room Lavender Soy Candle",
    description:
      "A 6 ounce soy candle blended for a guest room: lavender, a little clean musk, and no sharp camphor. It is quieter than a jar you would burn in the living room, and the smaller size means it is finished before the scent becomes the whole house. Cotton wick, about 30 hours. Light it an hour before someone arrives so the room feels expected, then put the lid on. A practical gift when you are staying with friends and want to leave something they will actually burn.",
    metaDescription:
      "A 6 oz lavender soy candle for the guest room. Quiet musk, cotton wick, about 30 hours, sized to finish before it overwhelms.",
    imageAlt: "Small white lavender candle in a clear glass jar on a nightstand",
  },
  "brass-candle-snuffer": {
    title: "Brass Candle Snuffer",
    seoTitle: "Brass Candle Snuffer",
    description:
      "A brass candle snuffer with a bell that covers the flame and a handle long enough for a jar. Snuffing keeps the wick from smoking the way a hard blow does, so the next light catches cleanly. It lives next to the hearth matches. The brass will dull unless you polish it; we leave ours soft. It fits tapers and the mouth of our 8 ounce jars.",
    metaDescription:
      "A brass snuffer that puts out jar candles and tapers without a plume of smoke. Long handle, bell cover, soft brass finish.",
    imageAlt: "Brass candle snuffer resting beside an amber jar candle",
  },
};

function keywordsFor(product: Product, title: string) {
  const pool = [...product.tags];
  const type = product.productType.trim().toLowerCase();
  if (type && !pool.some((tag) => tag.toLowerCase() === type)) pool.unshift(product.productType);
  const fromTitle = title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 3)
    .slice(0, 3);
  return [...new Set([...pool, ...fromTitle])].slice(0, 8);
}

function clampTitle(value: string, max = 70) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function applyTone(copy: CopyFields, tone: Tone): CopyFields {
  if (tone === "warm") return copy;
  if (tone === "concise") {
    const first = copy.description.split(/(?<=\.)\s+/).slice(0, 2).join(" ");
    return {
      ...copy,
      title: clampTitle(copy.title.replace(/ — /g, ", "), 60),
      description: first,
      metaDescription: copy.metaDescription.slice(0, 155),
    };
  }
  if (tone === "luxury") {
    return {
      ...copy,
      title: copy.title.replace(" — ", " · "),
      description: copy.description
        .replace(/useful gift/gi, "considered gift")
        .replace(/straightforward/gi, "unfussy"),
    };
  }
  if (tone === "playful") {
    return {
      ...copy,
      description: copy.description.replace(/\.$/, ". That is the whole pitch."),
    };
  }
  const giftLine =
    " If you are buying it for someone else, it is specific enough to feel chosen and ordinary enough that they will use it.";
  return {
    ...copy,
    title: copy.title.includes("Gift") ? copy.title : clampTitle(`${copy.title}`),
    description: `${copy.description}${giftLine}`,
    metaDescription: clampTitle(
      copy.metaDescription.replace(/\.$/, "") + ". An easy gift from a small home shop.",
      160,
    ),
  };
}

function genericCopy(product: Product): CopyFields {
  const name = product.title.trim().length < 18 ? `${product.productType || "Home good"}` : product.title.trim();
  const material = product.tags[0] || product.productType || "home good";
  const title = clampTitle(
    product.title.trim().length >= 30 ? product.title.trim() : `${name} — ${material}`,
  );
  const description = [
    `${title.replace(/ — .*/, "")} is a ${material} from ${product.vendor || "the shop"}.`,
    product.description.trim().length > 40
      ? product.description.trim()
      : `It is made to be used, not saved. The details that matter are the material and the size, both named here so a shopper does not have to guess.`,
    product.price
      ? `At ${product.price.startsWith("$") ? product.price : `$${product.price}`}, it is a single, finishable object rather than a set you have to commit to.`
      : "It is a single, finishable object rather than a set you have to commit to.",
  ].join(" ");
  const meta = `${title}. ${product.productType || material} from ${product.vendor || "an independent shop"}, with the use named in the description.`.slice(0, 155);
  return {
    title,
    seoTitle: clampTitle(title, 60),
    description,
    metaDescription: meta,
    imageAlt: `${title}, ${product.productType || material} photographed on a light wood surface`,
  };
}

export function sampleProposal(product: Product, tone: Tone): { proposal: RewriteProposal; notice: string } {
  const base = warmCopy[product.handle] ?? genericCopy(product);
  const toned = applyTone(base, tone);
  return {
    notice: SAMPLE_NOTICE,
    proposal: {
      ...toned,
      keywords: keywordsFor(product, toned.title),
    },
  };
}

export function sampleVariantSet(product: Product, storeId: string): Omit<Variant, "createdAt">[] {
  const base = sampleProposal(product, "warm").proposal.title;
  const concise = sampleProposal(product, "concise").proposal.title;
  const gift = sampleProposal(product, "gift").proposal.title.replace(/\. An easy gift.*/, "");
  const rows = [
    {
      label: "A",
      title: base,
      hypothesis: "Names the scent or material and the format so the collection grid can stand alone.",
    },
    {
      label: "B",
      title: concise === base ? `${product.productType}: ${base}`.slice(0, 70) : concise,
      hypothesis: "Shorter, for shoppers scanning a collection page on a phone.",
    },
    {
      label: "C",
      title: gift.toLowerCase().includes("gift") ? gift : `${base}`.slice(0, 70),
      hypothesis: "Keeps the practical promise a gift buyer needs before they leave the card.",
    },
  ];
  return rows.map((row) => ({
    id: newId("var"),
    productId: product.id,
    storeId,
    label: row.label,
    title: row.title,
    hypothesis: row.hypothesis,
    status: "draft" as const,
  }));
}

export function proposalFromProduct(product: Product): RewriteProposal {
  return {
    title: product.title,
    seoTitle: product.seoTitle,
    description: product.description,
    metaDescription: product.metaDescription,
    imageAlt: product.imageAlt,
    keywords: product.tags,
  };
}
