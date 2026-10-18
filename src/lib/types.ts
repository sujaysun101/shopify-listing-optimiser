export const TONES = [
  { id: "warm", label: "Warm & artisan", hint: "Sensory, unhurried, specific" },
  { id: "concise", label: "Clear & concise", hint: "Short sentences, facts first" },
  { id: "luxury", label: "Quiet luxury", hint: "Restrained, material-led" },
  { id: "playful", label: "Playful", hint: "Light voice, still concrete" },
  { id: "gift", label: "Gift-minded", hint: "Written for the person buying" },
] as const;

export type Tone = (typeof TONES)[number]["id"];

export const FIELD_KEYS = ["title", "seoTitle", "description", "metaDescription", "imageAlt"] as const;
export type FieldKey = (typeof FIELD_KEYS)[number];
export type FieldDecision = "pending" | "accepted" | "rejected";

export type Store = {
  id: string;
  userId: string;
  name: string;
  brandVoice: string;
  shopDomain: string | null;
  tokenCiphertext: string | null;
  tokenHint: string | null;
  createdAt: string;
};

export type Product = {
  id: string;
  storeId: string;
  handle: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  price: string;
  imageSrc: string;
  imageAlt: string;
  seoTitle: string;
  metaDescription: string;
  status: "active" | "draft";
  shopifyProductId: string | null;
  shopifyImageId: string | null;
  score: number;
  updatedAt: string;
  createdAt: string;
};

export type ProductDraft = {
  handle: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  price: string;
  imageSrc: string;
  imageAlt: string;
  seoTitle: string;
  metaDescription: string;
  status: "active" | "draft";
  shopifyProductId?: string | null;
  shopifyImageId?: string | null;
};

export type ProductPatch = Partial<Omit<Product, "id" | "storeId" | "score" | "createdAt" | "updatedAt">>;

export type Snapshot = {
  id: string;
  storeId: string;
  recordedOn: string;
  averageScore: number;
  productCount: number;
};

export type CheckStatus = "pass" | "warn" | "fail";

export type Check = {
  id: "title" | "keywords" | "benefits" | "alt" | "meta";
  label: string;
  status: CheckStatus;
  points: number;
  max: number;
  detail: string;
};

export type ScoreResult = {
  score: number;
  checks: Check[];
};

export type RewriteProposal = {
  title: string;
  seoTitle: string;
  description: string;
  metaDescription: string;
  imageAlt: string;
  keywords: string[];
};

export type RewriteRecord = {
  id: string;
  productId: string;
  tone: Tone;
  source: "ai" | "sample";
  notice: string | null;
  original: RewriteProposal;
  proposal: RewriteProposal;
  decisions: Record<FieldKey, FieldDecision>;
  createdAt: string;
};

export type VariantStatus = "draft" | "live" | "winner" | "archived";

export type Variant = {
  id: string;
  productId: string;
  storeId: string;
  label: string;
  title: string;
  hypothesis: string;
  status: VariantStatus;
  createdAt: string;
};

export type JobStatus = "queued" | "running" | "done";

export type Job = {
  id: string;
  storeId: string;
  tone: Tone;
  status: JobStatus;
  total: number;
  completed: number;
  createdAt: string;
};

export type JobItem = {
  id: string;
  jobId: string;
  productId: string;
  productTitle: string;
  status: "queued" | "done" | "failed";
  detail: string;
};

export type Repo = {
  mode: "memory" | "postgres";
  ensureStore(userId: string): Promise<Store>;
  updateStore(
    storeId: string,
    patch: Partial<Pick<Store, "name" | "brandVoice" | "shopDomain" | "tokenCiphertext" | "tokenHint">>,
  ): Promise<Store>;
  listProducts(storeId: string): Promise<Product[]>;
  getProduct(storeId: string, productId: string): Promise<Product | null>;
  updateProduct(storeId: string, productId: string, patch: ProductPatch): Promise<Product | null>;
  importProducts(storeId: string, rows: ProductDraft[]): Promise<{ created: number; updated: number }>;
  loadSample(storeId: string): Promise<number>;
  listSnapshots(storeId: string): Promise<Snapshot[]>;
  recordSnapshot(storeId: string): Promise<Snapshot>;
  saveRewrite(record: RewriteRecord): Promise<RewriteRecord>;
  latestRewrite(productId: string): Promise<RewriteRecord | null>;
  getRewrite(id: string): Promise<RewriteRecord | null>;
  updateRewrite(record: RewriteRecord): Promise<void>;
  listVariants(storeId: string): Promise<Variant[]>;
  addVariants(records: Variant[]): Promise<void>;
  getVariant(storeId: string, id: string): Promise<Variant | null>;
  setVariantStatus(storeId: string, id: string, status: VariantStatus): Promise<Variant | null>;
  createJob(job: Job, items: JobItem[]): Promise<void>;
  getJob(storeId: string, id: string): Promise<{ job: Job; items: JobItem[] } | null>;
  latestJob(storeId: string): Promise<{ job: Job; items: JobItem[] } | null>;
  saveJob(job: Job, items: JobItem[]): Promise<void>;
};
