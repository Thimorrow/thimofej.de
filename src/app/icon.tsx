import { ImageResponse } from "next/og";

// Browser-tab favicon: a cyan brand chip with a dark "T". High contrast so it
// stays legible at 16px on both light and dark tab bars. Serifs mush at that
// size, so the monogram is deliberately geometric, not the site's Fraunces.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#21e6ff",
          color: "#070a12",
          fontSize: 24,
          fontWeight: 700,
          borderRadius: 7,
        }}
      >
        T
      </div>
    ),
    { ...size },
  );
}
