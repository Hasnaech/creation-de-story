import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { fetchFeedPerformance, instagramConfigured } from "./lib/instagram.js";
import { genererStories, analyserFeed } from "./lib/claude.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

// État de la configuration, pour guider l'utilisateur dans l'interface
app.get("/api/statut", (_req, res) => {
  res.json({
    claude: Boolean(process.env.ANTHROPIC_API_KEY),
    instagram: instagramConfigured(),
  });
});

// Analyse du feed : métriques Instagram + lecture par Claude
app.post("/api/analyse-feed", async (_req, res) => {
  try {
    const posts = await fetchFeedPerformance({ limit: 20 });
    const analyse = posts.length > 0 ? await analyserFeed(posts) : "";
    res.json({ posts, analyse });
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
    let feedPosts = null;
    if (utiliserFeed && instagramConfigured()) {
      try {
        feedPosts = await fetchFeedPerformance({ limit: 15 });
      } catch {
        feedPosts = null; // le feed est un bonus : on génère quand même sans lui
      }
    }
    const resultat = await genererStories({
      planAction: planAction.trim(),
      feedPosts,
      nombreStories: Math.min(Math.max(parseInt(nombreStories, 10) || 5, 1), 10),
      tonalite: (tonalite || "").trim(),
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
