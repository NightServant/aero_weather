import { ImageResponse } from "next/og";

export const alt =
  "AeroWeather - current conditions and a 14-day outlook for any city";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const BLUE = "#3b82f6";
const INDIGO = "#6366f1";
const BACKGROUND = "#16222e";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BACKGROUND,
          backgroundImage: `radial-gradient(circle at 22% 20%, rgba(59,130,246,0.28), transparent 45%), radial-gradient(circle at 82% 78%, rgba(99,102,241,0.24), transparent 50%)`,
          fontFamily: "sans-serif",
        }}
      >
        {/* Mark: rounded gradient square with a simple cloud + rain glyph */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 128,
            height: 128,
            borderRadius: 32,
            backgroundImage: `linear-gradient(135deg, ${BLUE}, ${INDIGO})`,
            marginBottom: 40,
          }}
        >
          <div style={{ position: "relative", width: 84, height: 60, display: "flex" }}>
            {/* cloud body */}
            <div
              style={{
                position: "absolute",
                left: 6,
                top: 20,
                width: 72,
                height: 24,
                borderRadius: 12,
                background: "white",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 4,
                top: 8,
                width: 30,
                height: 30,
                borderRadius: 15,
                background: "white",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 24,
                top: 0,
                width: 38,
                height: 38,
                borderRadius: 19,
                background: "white",
                display: "flex",
              }}
            />
            {/* rain strokes */}
            <div
              style={{
                position: "absolute",
                left: 20,
                top: 50,
                width: 6,
                height: 16,
                borderRadius: 3,
                background: "white",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 39,
                top: 50,
                width: 6,
                height: 16,
                borderRadius: 3,
                background: "white",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 58,
                top: 50,
                width: 6,
                height: 16,
                borderRadius: 3,
                background: "white",
                display: "flex",
              }}
            />
          </div>
        </div>

        {/* Wordmark */}
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700, letterSpacing: "-0.02em" }}>
          <span style={{ color: BLUE }}>Aero</span>
          <span style={{ color: "white" }}>Weather</span>
        </div>

        {/* Descriptor */}
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 32,
            fontWeight: 400,
            color: "rgba(255,255,255,0.68)",
          }}
        >
          Current conditions and a 14-day outlook for any city
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
