import { ImageResponse } from "next/og";

export const routeOgImageSize = {
  width: 1200,
  height: 630,
};

export const routeOgImageContentType = "image/png";

type RouteOgImageTheme = {
  background: string;
  accent: string;
  accentSoft: string;
  panel: string;
  text: string;
  muted: string;
  chipText: string;
};

export type RouteOgImageOptions = {
  routeType: string;
  title: string;
  summary: string;
  route: string;
  eyebrow?: string;
  status?: string;
  facts?: string[];
  theme?: Partial<RouteOgImageTheme>;
};

const defaultTheme: RouteOgImageTheme = {
  background: "#121417",
  accent: "#61d394",
  accentSoft: "rgba(97, 211, 148, 0.16)",
  panel: "#f8f4ea",
  text: "#fbfaf5",
  muted: "#d8d1c4",
  chipText: "#111315",
};

function clampText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}...`;
}

function splitTitle(value: string) {
  return clampText(value, 94).split(" ");
}

export function routeOgImageResponse(options: RouteOgImageOptions) {
  const theme = { ...defaultTheme, ...options.theme };
  const facts = (options.facts ?? []).slice(0, 3).map((fact) => clampText(fact, 58));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: theme.background,
          color: theme.text,
          display: "flex",
          flexDirection: "column",
          padding: "54px",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0",
            display: "flex",
          }}
        >
          <div
            style={{
              width: "38%",
              height: "100%",
              background: theme.accentSoft,
              display: "flex",
            }}
          />
          <div
            style={{
              width: "62%",
              height: "100%",
              display: "flex",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            right: "392px",
            top: "54px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: theme.accent,
              color: theme.chipText,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "25px",
              fontWeight: 900,
            }}
          >
            B
          </div>
          <div
            style={{
              fontSize: "30px",
              fontWeight: 850,
              letterSpacing: "0",
            }}
          >
            Bumpgrade
          </div>
        </div>
        <div
          style={{
            position: "relative",
            display: "flex",
            flex: 1,
            gap: "42px",
          }}
        >
          <div
            style={{
              width: "72%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                <div
                  style={{
                    background: theme.accent,
                    color: theme.chipText,
                    borderRadius: "999px",
                    padding: "11px 18px",
                    fontSize: "24px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  {clampText(options.routeType, 30)}
                </div>
                {options.status ? (
                  <div
                    style={{
                      border: `2px solid ${theme.accent}`,
                      color: theme.text,
                      borderRadius: "999px",
                      padding: "9px 16px",
                      fontSize: "21px",
                      fontWeight: 750,
                    }}
                  >
                    {clampText(options.status, 32)}
                  </div>
                ) : null}
              </div>
              {options.eyebrow ? (
                <div
                  style={{
                    color: theme.accent,
                    fontSize: "27px",
                    fontWeight: 820,
                  }}
                >
                  {clampText(options.eyebrow, 58)}
                </div>
              ) : null}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  columnGap: "18px",
                  rowGap: "4px",
                  maxWidth: "780px",
                }}
              >
                {splitTitle(options.title).map((word, index) => (
                  <span
                    key={`${word}-${index}`}
                    style={{
                      fontSize: "66px",
                      lineHeight: 0.94,
                      fontWeight: 900,
                      letterSpacing: "0",
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
              <div
                style={{
                  color: theme.muted,
                  fontSize: "29px",
                  lineHeight: 1.28,
                  maxWidth: "805px",
                }}
              >
                {clampText(options.summary, 180)}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                color: theme.muted,
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              <span>{clampText(options.route, 60)}</span>
            </div>
          </div>
          <div
            style={{
              width: "28%",
              minHeight: "100%",
              background: theme.panel,
              color: "#17191c",
              borderRadius: "28px",
              padding: "30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div
                style={{
                  width: "72px",
                  height: "10px",
                  borderRadius: "999px",
                  background: theme.accent,
                  display: "flex",
                }}
              />
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 900,
                  lineHeight: 1.05,
                }}
              >
                Route context
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {facts.map((fact) => (
                <div
                  key={fact}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    borderTop: "2px solid rgba(23, 25, 28, 0.12)",
                    paddingTop: "15px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "18px",
                      color: "#62605a",
                      fontWeight: 750,
                      textTransform: "uppercase",
                    }}
                  >
                    Signal
                  </span>
                  <strong
                    style={{
                      fontSize: "24px",
                      lineHeight: 1.15,
                    }}
                  >
                    {fact}
                  </strong>
                </div>
              ))}
            </div>
            <div
              style={{
                fontSize: "20px",
                color: "#62605a",
                fontWeight: 750,
              }}
            >
              bumpgrade.com
            </div>
          </div>
        </div>
      </div>
    ),
    routeOgImageSize,
  );
}
