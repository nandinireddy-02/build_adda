import { ImageResponse } from "next/og";

// The preview picture shown when someone shares a Krew link.
export const alt = "Krew: find your krew, fix something real";

// Same artwork as app/icon.svg.
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="k" x1="0" y1="12" x2="0" y2="52" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#c6f432"/><stop offset="1" stop-color="#0be8f0"/></linearGradient></defs><rect width="64" height="64" rx="18" fill="#2a0e4f"/><g fill="none" stroke="url(#k)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16v32"/><path d="M44 16 31.5 32 44 48"/></g></svg>`;
const mark = `data:image/svg+xml;base64,${Buffer.from(markSvg).toString("base64")}`;

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#eadcff",
          color: "#2a0e4f",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img src={mark} width={72} height={72} alt="" />
          <div style={{ fontSize: 44, fontWeight: 800 }}>Krew</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", fontSize: 92, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>
          <div>Find your krew.</div>
          <div style={{ display: "flex", gap: 24 }}>
            <span>Fix something</span>
            <span style={{ background: "#b6ff3b", padding: "0 18px", borderRadius: 18 }}>real.</span>
          </div>
        </div>

        <div style={{ fontSize: 30, color: "#4a3470" }}>
          Find a real problem, recruit the skills you lack, and ship something people use.
        </div>
      </div>
    ),
    size
  );
}
