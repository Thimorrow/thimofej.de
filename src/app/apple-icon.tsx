import { ImageResponse } from "next/og";

// Home-screen icon (iOS applies its own rounded mask, so fill the full square).
// Void background with a cyan "T" and a soft accent glow — the brand at rest.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(120% 120% at 50% 30%, #0e1320 0%, #070a12 70%)",
          color: "#21e6ff",
          fontSize: 116,
          fontWeight: 700,
        }}
      >
        T
      </div>
    ),
    { ...size },
  );
}
