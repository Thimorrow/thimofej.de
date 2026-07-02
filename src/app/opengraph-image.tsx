import { ImageResponse } from "next/og";

// Social/search preview card. Twitter falls back to og:image, so this one file
// covers both. Brand palette: void ground, cyan accent, one hairline rule.
export const alt = "Thimofej Zapko. I build things, and this is the human behind them.";
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
          background:
            "radial-gradient(120% 90% at 50% -10%, rgba(33,230,255,0.10), transparent 60%), #070a12",
          color: "#e8ecf4",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#7c879c",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#21e6ff",
              color: "#070a12",
              fontSize: 30,
              fontWeight: 700,
              borderRadius: 9,
            }}
          >
            T
          </div>
          thimofej.de
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 600, lineHeight: 1.05 }}>
            Thimofej Zapko
          </div>
          <div style={{ marginTop: 20, fontSize: 38, color: "#5a6478" }}>
            15, self-taught. I build things, and this is the human behind them.
          </div>
        </div>

        <div
          style={{
            height: 2,
            width: "100%",
            background:
              "linear-gradient(to right, #21e6ff, rgba(33,230,255,0))",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
