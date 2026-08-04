// Point d'entrée Vercel : l'app Express est servie comme fonction serverless.
// Les fichiers statiques (public/) sont servis par le CDN de Vercel.
import app from "../app.js";

export default app;
