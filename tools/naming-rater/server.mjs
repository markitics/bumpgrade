import http from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8789);
const statePath = join(__dirname, "naming-ratings.json");
const markdownPath = join(__dirname, "naming-ratings.md");

const groups = [
  {
    group: "Hidden Value / Reveal",
    image: "vault",
    why: "The product reveals money already sitting inside the seller's offer.",
    words: ["unlock", "reveal", "uncover", "stash", "trove", "reserve", "vault", "hidden", "bonus", "behind"],
  },
  {
    group: "Bump / Upgrade",
    image: "arrow",
    why: "The most direct link to order bumps, upsells, and higher basket size.",
    words: [
      "bump",
      "upgrade",
      "bumpgrade",
      "bumplift",
      "plus",
      "lift",
      "boost",
      "add-on",
      "stack",
      "bundle",
      "extra",
      "premium",
    ],
  },
  {
    group: "Midas / Gold Mine",
    image: "coin",
    why: "Strong visual world: touch, gold, vaults, veins, nuggets, fountains.",
    words: [
      "Midas",
      "gold",
      "mine",
      "goldmine",
      "vein",
      "strike",
      "nugget",
      "fortune",
      "vault",
      "treasure",
      "treasure chest",
      "treasure map",
      "alchemy",
      "bounty",
      "abundant",
    ],
  },
  {
    group: "Score / Goal / Win",
    image: "scoreboard",
    why: "Clear, spellable sports language that can fit conversion goals and publisher wins.",
    words: ["goal", "score", "win", "clutch", "finish", "podium", "trophy", "playbook", "gameplan", "rally"],
  },
  {
    group: "Capture / Connect",
    image: "net",
    why: "Broad enough for leads, buyers, audiences, publishers, and no-code selling links.",
    words: ["capture", "connect", "collect", "claim", "link", "hook", "catch", "net", "magnet", "channel"],
  },
  {
    group: "Flow / Firehose",
    image: "wave",
    why: "Evokes automatic customers, steady demand, and money moving through the system.",
    words: [
      "flow",
      "stream",
      "surge",
      "geyser",
      "fountain",
      "pipeline",
      "current",
      "cascade",
      "rush",
      "tide",
      "firehose",
    ],
  },
  {
    group: "Effortless / Automatic",
    image: "spark",
    why: "The promise is fewer steps, more results, and a system that keeps working.",
    words: [
      "easy",
      "instant",
      "automatic",
      "autopilot",
      "done",
      "two-click",
      "hands-free",
      "turnkey",
      "smooth",
      "always-on",
      "passive",
      "relax",
      "chill",
    ],
  },
  {
    group: "Commerce / Trade",
    image: "market",
    why: "Grounded in selling without being locked to funnels or checkout UI.",
    words: [
      "market",
      "merchant",
      "trade",
      "bazaar",
      "shop",
      "stall",
      "ledger",
      "exchange",
      "deal",
      "storefront",
      "commerce",
      "sell",
      "profit",
      "earn",
      "monetize",
    ],
  },
  {
    group: "Friends / Audience Selling",
    image: "people",
    why: "Keeps the later no-code sell-to-your-friends direction open.",
    words: ["friends", "fans", "audience", "network", "circle", "crowd", "club", "crew", "room", "community"],
  },
  {
    group: "Magic / Charm",
    image: "wand",
    why: "Useful if we want the brand to feel playful and transformative rather than SaaS-literal.",
    words: ["spell", "charm", "wand", "elixir", "oracle", "lucky", "touch", "enchanted", "rainbow", "wishing well"],
  },
  {
    group: "Combo / Wordplay",
    image: "spark",
    why: "Candidate fused words where two ideas share a sound or seam.",
    words: [
      "catapult",
      "catapultimate",
      "catapultearn",
      "winfall",
      "winvest",
      "earnflow",
      "harvestrike",
      "harvestack",
      "boostack",
      "bountiful",
      "bountyflow",
      "converturn",
      "prizeflow",
      "treasuretap",
      "goldmind",
      "mineflow",
    ],
  },
];

const words = buildWords(groups);

function buildWords(wordGroups) {
  const seen = new Map();

  for (const group of wordGroups) {
    for (const word of group.words) {
      const id = slugify(word);
      if (seen.has(id)) {
        continue;
      }

      seen.set(id, {
        id,
        title: word,
        group: group.group,
        image: group.image,
        why: group.why,
        words: group.words.filter((candidate) => candidate !== word).slice(0, 8),
      });
    }
  }

  return [...seen.values()].sort((a, b) => a.group.localeCompare(b.group) || a.title.localeCompare(b.title));
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function readState() {
  if (!existsSync(statePath)) {
    return {};
  }

  try {
    return JSON.parse(await readFile(statePath, "utf8"));
  } catch {
    return {};
  }
}

async function writeState(state) {
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
  await writeMarkdown(state);
}

async function writeMarkdown(state) {
  const lines = [
    "# Naming Word Ratings",
    "",
    `Updated: ${new Date().toISOString()}`,
    "",
    "| Word | Rating | Notes | Group | Related words |",
    "|---|---|---|---|---|",
  ];

  for (const word of words) {
    const entry = state[word.id] || {};
    lines.push(
      `| ${escapeMarkdown(word.title)} | ${escapeMarkdown(entry.rating || "unrated")} | ${escapeMarkdown(
        entry.notes || "",
      )} | ${escapeMarkdown(word.group)} | ${escapeMarkdown(word.words.join(", "))} |`,
    );
  }

  lines.push("");
  await writeFile(markdownPath, `${lines.join("\n")}\n`);
}

function escapeMarkdown(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function sendJson(res, payload, status = 200) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/") {
      const html = await readFile(join(__dirname, "index.html"), "utf8");
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    if (req.method === "GET" && (req.url === "/api/themes" || req.url === "/api/words")) {
      const state = await readState();
      await sendJson(res, { themes: words, words, state });
      return;
    }

    if (req.method === "POST" && req.url === "/api/rate") {
      const body = await readJsonBody(req);
      const word = words.find((item) => item.id === body.id);
      const allowedRatings = new Set(["no", "maybe", "yes", "unrated"]);
      if (!word || !allowedRatings.has(body.rating)) {
        await sendJson(res, { error: "Invalid rating request" }, 400);
        return;
      }

      const state = await readState();
      state[word.id] = {
        ...(state[word.id] || {}),
        rating: body.rating === "unrated" ? undefined : body.rating,
        updatedAt: new Date().toISOString(),
      };
      await writeState(state);
      await sendJson(res, { state });
      return;
    }

    if (req.method === "POST" && req.url === "/api/notes") {
      const body = await readJsonBody(req);
      const word = words.find((item) => item.id === body.id);
      if (!word) {
        await sendJson(res, { error: "Invalid notes request" }, 400);
        return;
      }

      const state = await readState();
      state[word.id] = {
        ...(state[word.id] || {}),
        notes: String(body.notes || "").slice(0, 1000),
        updatedAt: new Date().toISOString(),
      };
      await writeState(state);
      await sendJson(res, { state });
      return;
    }

    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  } catch (error) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end(error instanceof Error ? error.message : "Unknown error");
  }
});

server.listen(port, async () => {
  const state = await readState();
  await writeState(state);
  console.log(`Naming rater: http://localhost:${port}`);
  console.log(`Markdown output: ${markdownPath}`);
});
