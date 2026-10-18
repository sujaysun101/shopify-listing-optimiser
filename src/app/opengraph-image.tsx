import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f6f0e6",
          color: "#2a2118",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "#b85a2a",
                color: "#fffaf3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontFamily: "Georgia, serif",
              }}
            >
              C
            </div>
            <div style={{ fontSize: 28, fontFamily: "Georgia, serif" }}>Copycart</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 860 }}>
            <div style={{ fontSize: 68, lineHeight: 1.05, fontFamily: "Georgia, serif" }}>
              Better product pages for small Shopify stores.
            </div>
            <div style={{ fontSize: 28, color: "#6d5c4d" }}>
              Score every listing. Rewrite the weak fields. Export the catalog.
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
