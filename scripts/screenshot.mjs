import { chromium } from "playwright";

const base = process.env.SCREENSHOT_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

await page.goto(base, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: /Product pages that sound like the shop/ }).waitFor();
await page.screenshot({ path: "public/portfolio-screenshot-landing.png" });

await page.goto(`${base}/internal/preview`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Rewrite listing" }).click();
await page.getByText("Sunday Linen Spray — Crisp Cotton, 4 oz").first().waitFor();
await page.screenshot({ path: "public/portfolio-screenshot.png" });

await browser.close();
console.log("Wrote public/portfolio-screenshot.png and public/portfolio-screenshot-landing.png");
