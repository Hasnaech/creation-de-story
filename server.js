// Serveur local (npm start). Sur Vercel, c'est api/index.js qui sert l'app.
import app, { claudeConfigured } from "./app.js";
import { instagramConfigured } from "./lib/instagram.js";

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✨ Création de Story — http://localhost:${PORT}`);
  if (!claudeConfigured()) {
    console.warn("⚠️  ANTHROPIC_API_KEY manquante : la génération ne fonctionnera pas (voir .env.example).");
  }
  if (!instagramConfigured()) {
    console.warn("⚠️  Instagram non connecté : la génération marchera sans les données du feed (voir README).");
  }
});
