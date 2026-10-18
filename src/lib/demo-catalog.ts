import { scoreProduct } from "@/lib/scoring";
import { daysAgo, todayKey } from "@/lib/text";
import type { Product, ProductDraft, Snapshot, Store, Variant } from "@/lib/types";

export const DEMO_STORE_ID = "store_hearth";

export const DEFAULT_BRAND_VOICE =
  "Hearth & Wick is a small Portland shop for candles and home goods. Voice is calm, specific, and sensory. Talk about materials and how a room feels. Do not invent reviews, awards, or certifications.";

type Seed = ProductDraft & { id: string };

const seeds: Seed[] = [
  {
    id: "prod_cedar_smoke",
    handle: "cedar-smoke-soy-candle",
    title: "Cedar & Smoke Soy Candle",
    vendor: "Hearth & Wick",
    productType: "Candle",
    tags: ["soy candle", "cedar", "smoke", "evening"],
    price: "36.00",
    imageSrc: "",
    imageAlt: "Amber jar candle with a cedar-colored label beside a walnut tray",
    seoTitle: "Cedar & Smoke Soy Candle, 8 oz",
    metaDescription:
      "A cedar and smoke soy candle poured in Portland. Cotton wick, clean burn, about 45 hours in an amber jar.",
    status: "active",
    description:
      "Cedar & Smoke is a soy candle poured in small batches in Portland. The wax is a clean-burning blend and the wick is cotton, trimmed so the flame stays even. Cedar leaf, a thread of smoke, and a dry amber base fill a room without turning sharp. Light it when you get home and the evening slows down. One jar burns for about 45 hours, enough for a month of nights if you keep the lid on between uses. A useful gift for someone who likes a house that smells like the woods after rain.",
  },
  {
    id: "prod_linen_spray",
    handle: "sunday-linen-spray",
    title: "Spray",
    vendor: "Hearth & Wick",
    productType: "Room spray",
    tags: ["linen spray", "cotton", "room mist"],
    price: "22.00",
    imageSrc: "",
    imageAlt: "",
    seoTitle: "",
    metaDescription: "",
    status: "active",
    description: "Room spray.",
  },
  {
    id: "prod_mug",
    handle: "speckled-stoneware-mug",
    title: "Speckled stoneware mug",
    vendor: "Hearth & Wick",
    productType: "Mug",
    tags: ["stoneware", "mug", "speckle"],
    price: "32.00",
    imageSrc: "",
    imageAlt: "Speckled oatmeal stoneware mug",
    seoTitle: "Speckled stoneware mug",
    metaDescription: "A speckled stoneware mug for coffee.",
    status: "active",
    description:
      "Thrown stoneware mug with an oatmeal speckled glaze. Holds about 10 ounces. The handle is comfortable and the foot is unglazed so it does not slide on a wood table. Dishwasher safe, though the glaze stays richer if you hand wash it.",
  },
  {
    id: "prod_tapers",
    handle: "beeswax-tapers",
    title: "Beeswax Taper Candles, Set of Two",
    vendor: "Hearth & Wick",
    productType: "Candle",
    tags: ["beeswax", "taper", "dinner candle"],
    price: "18.00",
    imageSrc: "",
    imageAlt: "Two honey-colored beeswax tapers standing in a brass holder",
    seoTitle: "Beeswax Taper Candles, Pair",
    metaDescription:
      "A pair of hand-dipped beeswax tapers with a honey scent and a slow, even flame for the dinner table.",
    status: "active",
    description:
      "Two hand-dipped beeswax tapers in natural honey gold. They stand 10 inches, fit a standard holder, and burn with a quiet honey scent that does not compete with food. The flame stays straight if you keep them out of a draft. Use them for a weeknight supper or wrap the pair when you need a gift that is not another jar candle. Each taper burns for about 8 hours.",
  },
  {
    id: "prod_matches",
    handle: "hearth-matches",
    title: "Matches",
    vendor: "Hearth & Wick",
    productType: "Matches",
    tags: ["matches", "hearth"],
    price: "12.00",
    imageSrc: "",
    imageAlt: "",
    seoTitle: "",
    metaDescription: "Matches.",
    status: "active",
    description: "Long matches in a box.",
  },
  {
    id: "prod_throw",
    handle: "oat-wool-throw",
    title: "Oat Wool Throw",
    vendor: "Hearth & Wick",
    productType: "Throw",
    tags: ["wool throw", "oat", "blanket"],
    price: "128.00",
    imageSrc: "",
    imageAlt: "Folded oat-colored wool throw on a linen sofa",
    seoTitle: "Oat Wool Throw Blanket",
    metaDescription: "A lightweight oat wool throw, 50 by 60 inches, for the end of a sofa.",
    status: "active",
    description:
      "A lightweight wool throw in undyed oat. It is 50 by 60 inches, loose enough to fold over a sofa arm and warm enough for a cool room. The weave is open so it does not pill into a heavy blanket. Air it outside rather than washing it often. The color sits quietly next to linen and worn leather.",
  },
  {
    id: "prod_diffuser",
    handle: "amber-reed-diffuser",
    title: "Amber Glass Reed Diffuser",
    vendor: "Hearth & Wick",
    productType: "Diffuser",
    tags: ["reed diffuser", "amber", "bergamot"],
    price: "38.00",
    imageSrc: "",
    imageAlt: "",
    seoTitle: "Amber Reed Diffuser",
    metaDescription:
      "Bergamot and cedar reed diffuser in amber glass. Eight reeds, a steady scent for about eight weeks.",
    status: "active",
    description:
      "A reed diffuser in amber glass with bergamot peel, cedar, and a soft musk. Eight reeds are included. Flip them once a week and the scent stays even for about eight weeks in a bedroom or entry, not a drafty hall. The bottle is glass, so you can reuse it with a refill when we have them in stock. No flame, which makes it the one we suggest for a guest room.",
  },
  {
    id: "prod_incense",
    handle: "night-market-incense",
    title: "Incense",
    vendor: "Hearth & Wick",
    productType: "Incense",
    tags: ["incense", "sandalwood"],
    price: "16.00",
    imageSrc: "",
    imageAlt: "Bundle of incense sticks",
    seoTitle: "",
    metaDescription: "",
    status: "active",
    description: "Sandalwood incense sticks. 20 sticks.",
  },
  {
    id: "prod_burner",
    handle: "ceramic-oil-burner",
    title: "Ceramic oil burner",
    vendor: "Hearth & Wick",
    productType: "Oil burner",
    tags: ["oil burner", "ceramic"],
    price: "28.00",
    imageSrc: "",
    imageAlt: "Small cream ceramic oil burner",
    seoTitle: "Ceramic oil burner",
    metaDescription: "",
    status: "active",
    description:
      "A small ceramic oil burner with a dish for water and oil and a cup for a tealight underneath. The glaze is cream with a brown rim. Use a few drops of oil, not a full pour, so the scent stays light.",
  },
  {
    id: "prod_soap",
    handle: "fig-leaf-hand-soap",
    title: "Fig Leaf Hand Soap",
    vendor: "Hearth & Wick",
    productType: "Soap",
    tags: ["hand soap", "fig leaf", "refill"],
    price: "18.00",
    imageSrc: "",
    imageAlt: "Frosted glass bottle of fig leaf hand soap with a pump",
    seoTitle: "Fig Leaf Hand Soap, 8 oz",
    metaDescription:
      "Fig leaf hand soap in a glass pump bottle. A green, clean scent for the kitchen sink, with a refill pouch.",
    status: "active",
    description:
      "Fig leaf hand soap with a green, slightly bitter scent, closer to crushed leaves than to dessert. The 8 ounce bottle is frosted glass with a pump you can take off. A refill pouch uses less plastic and costs less the second time. It is gentle enough for the kitchen sink, where you wash your hands between chopping and setting the table. The scent does not linger on dishes.",
  },
  {
    id: "prod_snuffer",
    handle: "brass-candle-snuffer",
    title: "Brass Candle Snuffer",
    vendor: "Hearth & Wick",
    productType: "Candle care",
    tags: ["snuffer", "brass", "candle care"],
    price: "24.00",
    imageSrc: "",
    imageAlt: "Brass candle snuffer with a long handle",
    seoTitle: "Brass Candle Snuffer",
    metaDescription: "A brass snuffer for putting out candles without smoke.",
    status: "active",
    description: "Brass snuffer with a long handle. Puts out tapers and jar candles.",
  },
  {
    id: "prod_guest",
    handle: "guest-room-candle",
    title: "Candle",
    vendor: "Hearth & Wick",
    productType: "Candle",
    tags: ["guest room", "lavender"],
    price: "30.00",
    imageSrc: "",
    imageAlt: "Small white candle",
    seoTitle: "",
    metaDescription: "A candle.",
    status: "active",
    description: "Small candle. Lavender. Good for guests maybe.",
  },
  {
    id: "prod_napkins",
    handle: "flax-linen-napkins",
    title: "Flax Linen Napkins, Set of Four",
    vendor: "Hearth & Wick",
    productType: "Table linen",
    tags: ["linen napkins", "flax", "table"],
    price: "48.00",
    imageSrc: "",
    imageAlt: "Four stone-flax linen napkins folded on a ceramic plate",
    seoTitle: "Flax Linen Napkins, Set of Four",
    metaDescription:
      "Four stone-washed flax linen napkins. They soften in the wash and work for weeknights, not only guests.",
    status: "active",
    description:
      "Four flax linen napkins in a stone-washed natural color. Each is 18 inches, hemmed, and meant to be used on a Tuesday, not saved for a holiday. The first wash softens the hand and the wrinkles are part of the cloth. They stand up to soup and citrus better than cotton, and they dry quickly on a rack. A calm set to give with the beeswax tapers when you are invited to dinner.",
  },
  {
    id: "prod_palo",
    handle: "palo-santo-bundle",
    title: "Palo Santo Sticks",
    vendor: "Hearth & Wick",
    productType: "Incense",
    tags: ["palo santo", "wood"],
    price: "14.00",
    imageSrc: "",
    imageAlt: "",
    seoTitle: "Palo Santo Sticks",
    metaDescription: "Four palo santo sticks with a soft wood scent. Light, let it catch, then blow it out.",
    status: "active",
    description:
      "Four sticks of palo santo from fallen wood. Light the tip, let it catch for a few seconds, then blow it out and rest it on a ceramic dish. The scent is soft wood and citrus peel, gone in a few minutes, which is why we like it before opening the shop rather than as an all-day incense. Keep the sticks dry.",
  },
  {
    id: "prod_dish",
    handle: "clay-trinket-dish",
    title: "Small dish",
    vendor: "Hearth & Wick",
    productType: "Dish",
    tags: ["trinket dish", "clay"],
    price: "18.00",
    imageSrc: "",
    imageAlt: "dish",
    seoTitle: "",
    metaDescription: "",
    status: "active",
    description: "Small clay dish.",
  },
  {
    id: "prod_vetiver",
    handle: "vetiver-room-mist",
    title: "Vetiver Room Mist",
    vendor: "Hearth & Wick",
    productType: "Room spray",
    tags: ["vetiver", "room mist", "grass"],
    price: "24.00",
    imageSrc: "",
    imageAlt: "Green glass bottle of vetiver room mist with a black cap",
    seoTitle: "Vetiver Room Mist, 4 oz",
    metaDescription: "Vetiver mist.",
    status: "active",
    description:
      "A room mist of vetiver root, a little lime, and clean musk. Four ounces in green glass. Two sprays is enough for a bedroom; more than that and the root note sits heavy. We use it on curtains rather than on bedding. The scent reads as dry grass after rain, not as cologne. Shake it once before you spray.",
  },
  {
    id: "prod_holder",
    handle: "iron-tealight-holder",
    title: "Holder",
    vendor: "Hearth & Wick",
    productType: "Candle holder",
    tags: ["tealight", "iron"],
    price: "20.00",
    imageSrc: "",
    imageAlt: "",
    seoTitle: "",
    metaDescription: "",
    status: "active",
    description: "Metal holder for tealights.",
  },
  {
    id: "prod_soak",
    handle: "honey-oat-bath-soak",
    title: "Honey Oat Bath Soak",
    vendor: "Hearth & Wick",
    productType: "Bath",
    tags: ["bath soak", "oat", "honey"],
    price: "26.00",
    imageSrc: "",
    imageAlt: "Kraft pouch of honey oat bath soak with a cotton scoop",
    seoTitle: "Honey Oat Bath Soak",
    metaDescription:
      "A honey and oat bath soak in a resealable pouch. One scoop softens a warm bath without a heavy perfume.",
    status: "active",
    description:
      "A bath soak of colloidal oat, honey powder, and a small amount of sweet orange. One scoop in a warm bath is enough. It softens the water and does not leave a heavy perfume on your skin afterward. The pouch is resealable and holds eight baths. It is a straightforward gift for someone who actually takes baths, and it does not pretend to be a treatment. Keep it dry between uses.",
  },
  {
    id: "prod_trimmer",
    handle: "steel-wick-trimmer",
    title: "Blackened steel wick trimmer",
    vendor: "Hearth & Wick",
    productType: "Candle care",
    tags: ["wick trimmer", "candle care", "steel"],
    price: "22.00",
    imageSrc: "",
    imageAlt: "Blackened steel wick trimmer",
    seoTitle: "Steel Wick Trimmer",
    metaDescription: "A wick trimmer for keeping candle flames even.",
    status: "active",
    description:
      "A blackened steel wick trimmer with a catch tray so the trimmed bit does not fall into the wax. Trim to about a quarter inch before each light and the flame stays lower, which keeps jar candles from tunneling. It is the tool we use on the Cedar & Smoke and Coastal Drift jars. Wipe the blades; do not soak the steel.",
  },
  {
    id: "prod_coastal",
    handle: "coastal-drift-candle",
    title: "Coastal Drift Soy Candle",
    vendor: "Hearth & Wick",
    productType: "Candle",
    tags: ["soy candle", "driftwood", "sea salt", "coastal"],
    price: "36.00",
    imageSrc: "",
    imageAlt: "Pale blue jar candle labeled Coastal Drift on a windowsill",
    seoTitle: "Coastal Drift Soy Candle, 8 oz",
    metaDescription:
      "Driftwood, sea salt, and a cool floral soy candle. An 8 ounce jar with a cotton wick and about 45 hours of burn time.",
    status: "active",
    description:
      "Coastal Drift is the cooler counterpart to Cedar & Smoke. Driftwood, sea salt, and a pale floral sit on a clean musk, more open window than perfume counter. The soy wax and cotton wick are the same as our other jars, and a full burn is about 45 hours if you let the first pool reach the glass. It is the candle we put in the shop on warm afternoons. A clear choice when a house already has enough smoke and cedar.",
  },
  {
    id: "prod_garland",
    handle: "dried-orange-garland",
    title: "Dried Orange Slice Garland with Bay and Cinnamon, 6 feet",
    vendor: "Hearth & Wick",
    productType: "Garland",
    tags: ["dried orange", "garland", "bay"],
    price: "34.00",
    imageSrc: "",
    imageAlt: "Garland of dried orange slices and bay leaves",
    seoTitle: "Dried Orange Slice Garland, 6 ft",
    metaDescription:
      "A six-foot garland of dried orange, bay, and cinnamon. Hang it where the heat of a room can wake the scent.",
    status: "active",
    description:
      "Six feet of cotton cord strung with dried orange slices, bay leaves, and short cinnamon sticks. Hang it across a mantel or a doorway. The scent is quiet until the room is warm, then the orange and spice wake up without a flame. The fruit is dried hard so it keeps its shape for a season. It is not a candle, which is the point when you want the same feeling and cannot light anything. Store it flat and dry when the season is over.",
  },
  {
    id: "prod_coasters",
    handle: "marble-coasters",
    title: "Coasters",
    vendor: "Hearth & Wick",
    productType: "Coaster",
    tags: ["marble", "coaster"],
    price: "28.00",
    imageSrc: "",
    imageAlt: "",
    seoTitle: "",
    metaDescription: "",
    status: "draft",
    description: "Set of 4.",
  },
  {
    id: "prod_oil",
    handle: "bergamot-body-oil",
    title: "Bergamot Body Oil",
    vendor: "Hearth & Wick",
    productType: "Body oil",
    tags: ["body oil", "bergamot", "jojoba"],
    price: "32.00",
    imageSrc: "",
    imageAlt: "Small amber bottle of bergamot body oil with a dropper cap",
    seoTitle: "Bergamot Body Oil, 1 oz",
    metaDescription:
      "A one-ounce bergamot body oil in jojoba. A few drops after a shower, citrus peel rather than sweet perfume.",
    status: "active",
    description:
      "One ounce of jojoba with bergamot peel and a little cedar. A few drops on damp skin after a shower is plenty; it is an oil, not a lotion, so it sinks in without a film if you do not overdo it. The scent is bitter citrus, not a candy orange. The bottle is amber glass with a dropper you can travel with. We do not add glitter, claims, or a ten-step routine. Patch test if your skin is reactive to citrus oils.",
  },
  {
    id: "prod_basket",
    handle: "seagrass-basket",
    title: "Basket",
    vendor: "Hearth & Wick",
    productType: "Basket",
    tags: ["seagrass", "basket", "storage"],
    price: "42.00",
    imageSrc: "",
    imageAlt: "basket",
    seoTitle: "",
    metaDescription: "A basket.",
    status: "active",
    description: "Woven basket for storage.",
  },
  {
    id: "prod_kindling",
    handle: "fatwood-kindling",
    title: "Fatwood Kindling Bundle",
    vendor: "Hearth & Wick",
    productType: "Kindling",
    tags: ["kindling", "fatwood", "fireplace"],
    price: "16.00",
    imageSrc: "",
    imageAlt: "Bundle of fatwood kindling tied with cotton twine",
    seoTitle: "Fatwood Kindling Bundle",
    metaDescription: "A small bundle of fatwood kindling for starting a fire without newspaper.",
    status: "active",
    description:
      "A kitchen-sized bundle of fatwood sticks, tied with cotton twine. Fatwood lights from a match and catches split logs without newspaper. We pack it for apartments with a fireplace and for people who are tired of smoky starters. One bundle is about a dozen starts. Store it away from the stove so it stays a tool and not a hazard. The resin scent is pine, and it stays in the wood rather than in the room.",
  },
];

function iso(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

export function buildDemoProducts(storeId: string): Product[] {
  return seeds.map((seed, index) => {
    const draft: Product = {
      id: seed.id,
      storeId,
      handle: seed.handle,
      title: seed.title,
      description: seed.description,
      vendor: seed.vendor,
      productType: seed.productType,
      tags: seed.tags,
      price: seed.price,
      imageSrc: seed.imageSrc,
      imageAlt: seed.imageAlt,
      seoTitle: seed.seoTitle,
      metaDescription: seed.metaDescription,
      status: seed.status,
      shopifyProductId: null,
      shopifyImageId: null,
      score: 0,
      createdAt: iso(90 - index),
      updatedAt: iso(Math.max(1, 20 - index)),
    };
    draft.score = scoreProduct(draft).score;
    return draft;
  });
}

export function buildDemoSnapshots(storeId: string, products: Product[]): Snapshot[] {
  const current = products.length
    ? Math.round(products.reduce((sum, product) => sum + product.score, 0) / products.length)
    : 0;
  const offsets = [16, 14, 13, 11, 10, 8, 7, 6, 4, 3, 1];
  const snapshots: Snapshot[] = offsets.map((offset, index) => ({
    id: `snap_${index}`,
    storeId,
    recordedOn: daysAgo((offsets.length - index) * 7),
    averageScore: Math.max(28, current - offset),
    productCount: products.length,
  }));
  snapshots.push({
    id: "snap_today",
    storeId,
    recordedOn: todayKey(),
    averageScore: current,
    productCount: products.length,
  });
  return snapshots;
}

export function buildDemoVariants(storeId: string): Variant[] {
  const createdAt = iso(6);
  return [
    {
      id: "var_spray_a",
      productId: "prod_linen_spray",
      storeId,
      label: "A",
      title: "Sunday Linen Spray — Crisp Cotton, 4 oz",
      hypothesis: "Leads with the ritual name and the scent so the card is not just “spray”.",
      status: "live",
      createdAt,
    },
    {
      id: "var_spray_b",
      productId: "prod_linen_spray",
      storeId,
      label: "B",
      title: "Crisp Cotton Linen Spray for Sheets and Rooms",
      hypothesis: "Puts the use (sheets and rooms) ahead of the brand nickname.",
      status: "draft",
      createdAt,
    },
    {
      id: "var_matches_a",
      productId: "prod_matches",
      storeId,
      label: "A",
      title: "Hearth Matches, 60 Long Stems",
      hypothesis: "Count and length answer the two questions shoppers ask before they add matches.",
      status: "draft",
      createdAt,
    },
    {
      id: "var_dish_a",
      productId: "prod_dish",
      storeId,
      label: "A",
      title: "Clay Trinket Dish for Rings and Matches",
      hypothesis: "Names the object and a job, instead of “small dish”.",
      status: "draft",
      createdAt,
    },
  ];
}

export function buildDemoStore(userId: string): Store {
  return {
    id: DEMO_STORE_ID,
    userId,
    name: "Hearth & Wick",
    brandVoice: DEFAULT_BRAND_VOICE,
    shopDomain: null,
    tokenCiphertext: null,
    tokenHint: null,
    createdAt: iso(120),
  };
}

export function sampleDrafts(): ProductDraft[] {
  return seeds.map((seed) => ({
    handle: seed.handle,
    title: seed.title,
    description: seed.description,
    vendor: seed.vendor,
    productType: seed.productType,
    tags: seed.tags,
    price: seed.price,
    imageSrc: seed.imageSrc,
    imageAlt: seed.imageAlt,
    seoTitle: seed.seoTitle,
    metaDescription: seed.metaDescription,
    status: seed.status,
  }));
}

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}
