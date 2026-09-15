import express from "express";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static("."));

const PORT = process.env.PORT || 3000;

/*
  IMPORTANT:
  - Never put META_APP_SECRET in the browser.
  - This starter deliberately does NOT implement a fake "profile visitors" endpoint.
  - Production OAuth/API details must follow Meta's current Instagram Platform docs.
*/

app.get("/auth/login", (req, res) => {
  const state = crypto.randomBytes(24).toString("hex");
  // TODO: store state server-side/session-side and build the current Meta OAuth URL.
  // TODO: request only permissions currently approved for your app/account type.
  res.status(501).json({
    ok: false,
    message: "OAuth setup placeholder. Add your Meta App ID and implement the current Instagram Login flow.",
    state
  });
});

app.get("/auth/callback", (req, res) => {
  // TODO: validate state, exchange the authorization code server-side,
  // then store the access token securely.
  res.status(501).send("OAuth callback placeholder.");
});

/*
  Safe analytics contract:
  Returns only data your app is legitimately allowed to obtain.
  Replace demo values with verified API responses after OAuth is configured.
*/
app.get("/api/insights", async (req, res) => {
  res.json({
    mode: "demo",
    profile_views: 12,
    note: "Demo data. Do not interpret profile_views as a list of people.",
    engagement: { likes: 18, comments: 4, story_views: 48 }
  });
});

app.listen(PORT, () => {
  console.log(`Profile Pulse running at http://localhost:${PORT}`);
});