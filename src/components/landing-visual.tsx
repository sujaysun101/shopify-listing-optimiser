"use client";

import { motion, useReducedMotion } from "framer-motion";

import { DEMO_STORE_ID, buildDemoProducts } from "@/lib/demo-catalog";
import { scoreProduct } from "@/lib/scoring";

export function LandingVisual() {
  const reduce = useReducedMotion();
  const product = buildDemoProducts(DEMO_STORE_ID).find((item) => item.id === "prod_cedar_smoke");
  const scored = product ? scoreProduct(product) : null;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-3xl border bg-card p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Hearth & Wick</p>
          <h2 className="font-serif text-2xl">{product?.title}</h2>
        </div>
        <p className="font-serif text-4xl tabular-nums text-primary">{scored?.score}</p>
      </div>
      <ul className="mt-5 space-y-3">
        {scored?.checks.map((check) => (
          <li key={check.id} className="border-t pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{check.label}</span>
              <span className="text-muted-foreground">
                {check.status === "pass" ? "Pass" : check.status === "warn" ? "Watch" : "Fix"} · {check.points}/{check.max}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{check.detail}</p>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
