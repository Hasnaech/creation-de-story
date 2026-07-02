import "dotenv/config";
import express from "express";
import path from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { fetchFeedPerformance, instagramConfigured } from "./lib/instagram.js";
import { genererStories, analyserFeed } from "./lib/claude.js";
import { FEED_EXEMPLE, ANALYSE_EXEMPLE, STORIES_EXEMPLE } from "./lib/demo.js";

const claudeConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

const __dirnameConfig = path.dirname(fileURLToPath(import.meta.url));
const branding = JSON.parse(
  readFileSync(path.join(__dirnameConfig, "config", "branding.json"), "utf8")
);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

// État de la configuration, pour guider l'utilisateur dans l'interface
// Identité de marque (config/branding.json) : couleurs, ton, signature
app.get("/api/branding", (_req, res) => res.json(branding));

app.get("/api/statut", (_req, res) => {
  res.json({
    claude: claudeConfigured(),
    instagram: instagramConfigured(),
    demo: !claudeConfigured(),
  });
});

// Analyse du feed : métriques Instagram + lecture par Claude.
// Sans configuration, bascule en mode démo (instantané réel du feed).
app.post("/api/analyse-feed", async (_req, res) => {
  try {
    const posts = instagramConfigured() ? await fetchFeedPerformance({ limit: 20 }) : FEED_EXEMPLE;
    const analyse =
      posts.length === 0 ? "" : claudeConfigured() ? await analyserFeed(posts) : ANALYSE_EXEMPLE;
    res.json({ posts, analyse, demo: !instagramConfigured() || !claudeConfigured() });
  } catch (err) {
    res.status(err.status || 500).json({ erreur: err.message });
  }
});

// Génération des stories à partir du plan d'action (+ feed si connecté)
app.post("/api/generer-stories", async (req, res) => {
  const { planAction, nombreStories, tonalite, utiliserFeed } = req.body || {};
  if (!planAction || !planAction.trim()) {
    return res.status(400).json({ erreur: "Le plan d'action est vide." });
  }
  try {
    if (!claudeConfigured()) {
      // Mode démo : séquence d'exemple pour tester l'interface et l'export PNG
      return res.json({ ...STORIES_EXEMPLE, feedUtilise: Boolean(utiliserFeed), demo: true });
    }
    let feedPosts = null;
    if (utiliserFeed) {
      try {
        feedPosts = instagramConfigured() ? await fetchFeedPerformance({ limit: 15 }) : FEED_EXEMPLE;
      } catch {
        feedPosts = null; // le feed est un bonus : on génère quand même sans lui
      }
    }
    const resultat = await genererStories({
      planAction: planAction.trim(),
      feedPosts,
      nombreStories: Math.min(Math.max(parseInt(nombreStories, 10) || 5, 1), 10),
      tonalite: (tonalite || "").trim(),
      branding,
    });
    res.json({ ...resultat, feedUtilise: Boolean(feedPosts && feedPosts.length) });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✨ Création de Story — http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠️  ANTHROPIC_API_KEY manquante : la génération ne fonctionnera pas (voir .env.example).");
  }
  if (!instagramConfigured()) {
    console.warn("⚠️  Instagram non connecté : la génération marchera sans les données du feed (voir README).");
  }
});
