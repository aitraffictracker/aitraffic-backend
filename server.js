require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ---------- Feature flags ----------
const REQUIRE_SITE_REGISTRATION =
  process.env.REQUIRE_SITE_REGISTRATION === "true";
const ENFORCE_ORIGIN = process.env.ENFORCE_ORIGIN === "true";
// -----------------------------------

app.use(cors());
app.use(express.json());

function normalizeSource(raw) {
  const map = {
    chatgpt: "ChatGPT",
    "chat.openai.com": "ChatGPT",
    "chatgpt.com": "ChatGPT",
    perplexity: "Perplexity",
    "perplexity.ai": "Perplexity",
    claude: "Claude",
    "claude.ai": "Claude",
    gemini: "Google Gemini",
    "gemini.google.com": "Google Gemini",
    copilot: "Microsoft Copilot",
    "copilot.microsoft.com": "Microsoft Copilot",
  };
  const key = raw.trim().toLowerCase();
  return map[key] || raw.trim();
}

app.post("/track", async (req, res) => {
  const { siteId, source: rawSource, page, referrer } = req.body;

  if (!siteId || !rawSource || !page) {
    return res
      .status(400)
      .json({ error: "Missing required fields: siteId, source, page" });
  }

  const source = normalizeSource(rawSource);

  try {
    if (REQUIRE_SITE_REGISTRATION) {
      // Hosted mode: validate site exists and is active
      const siteCheck = await pool.query(
        "SELECT domain, subscription_status FROM sites WHERE site_id = $1",
        [siteId],
      );

      if (siteCheck.rows.length === 0) {
        return res.status(403).json({ error: "Invalid site ID" });
      }

      if (siteCheck.rows[0].subscription_status !== "active") {
        return res.status(402).json({ error: "Subscription required" });
      }

      // Optional origin domain enforcement
      if (ENFORCE_ORIGIN) {
        const origin = req.headers.origin;
        if (origin) {
          try {
            const originHost = new URL(origin).hostname;
            const { domain } = siteCheck.rows[0];
            if (!originHost.endsWith(domain) && originHost !== domain) {
              return res.status(403).json({ error: "Domain mismatch" });
            }
          } catch (e) {
            // Invalid origin header – ignore
          }
        }
      }
    }

    // All checks passed (or not required) – insert event
    await pool.query(
      "INSERT INTO events (site_id, source, page, referrer) VALUES ($1, $2, $3, $4)",
      [siteId, source, page, referrer || null],
    );
    res.status(202).json({ status: "ok" });
  } catch (err) {
    console.error("DB insert error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/health", (_, res) => res.send("OK"));

app.listen(port, () =>
  console.log(`AI Traffic backend listening on port ${port}`),
);
