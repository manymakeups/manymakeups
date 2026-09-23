import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt =
  "Many Makeups by Ana Zarza. Maquillaje y peinado para novias y eventos en Nules, Castellón.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const logoData = await readFile(join(process.cwd(), "public/brand/logo.jpg"));
const logoSrc = `data:image/jpeg;base64,${logoData.toString("base64")}`;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f4f1ea",
          color: "#1a1613",
          padding: 48,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "1px solid #9c7d52",
            padding: "48px 56px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <img
              src={logoSrc}
              alt=""
              width={196}
              height={196}
            />
            <div
              style={{
                display: "flex",
                fontSize: 22,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#9c7d52",
              }}
            >
              Ana Zarza · Desde 2004
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 68, lineHeight: 1.02, letterSpacing: "-0.03em" }}>
              Belleza que se sostiene
            </div>
            <div
              style={{
                fontSize: 68,
                lineHeight: 1.02,
                fontStyle: "italic",
                letterSpacing: "-0.03em",
              }}
            >
              hasta el último baile.
            </div>
            <div
              style={{
                marginTop: 24,
                fontSize: 24,
                color: "#6d645b",
                maxWidth: 760,
              }}
            >
              Maquillaje y peinado para novias y eventos. Nules, Castellón.
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
