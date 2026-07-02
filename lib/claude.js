import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const MODEL = "claude-opus-4-8";

const SYSTEM_STORIES = `Tu es un expert en stratégie de contenu Instagram, spécialisé dans les stories.
Tu crées des stories qui captent l'attention dans les 2 premières secondes, avec des textes courts et percutants pensés pour un format vertical 1080x1920.
Tu écris en français, dans un ton adapté à la marque. Chaque story doit être autonome mais s'enchaîner naturellement avec les autres pour former une séquence.
Tu t'appuies sur le plan d'action fourni et, quand elles sont disponibles, sur les données de performance du feed pour reprendre les angles, sujets et formats qui fonctionnent déjà.`;

const STORIES_SCHEMA = {
  type: "json_schema",
  schema: {
    type: "object",
    properties: {
      sequence: {
        type: "object",
        properties: {
          objectif: { type: "string", description: "Objectif global de la séquence de stories" },
          fil_conducteur: { type: "string", description: "Le fil narratif qui relie les stories entre elles" },
        },
        required: ["objectif", "fil_conducteur"],
        additionalProperties: false,
      },
      stories: {
        type: "array",
        items: {
          type: "object",
          properties: {
            numero: { type: "integer", description: "Position dans la séquence, à partir de 1" },
            titre: { type: "string", description: "Accroche principale, très courte (max 8 mots)" },
            texte: { type: "string", description: "Texte principal de la story, 1 à 3 phrases courtes" },
            cta: { type: "string", description: "Appel à l'action (ex : 'Réponds en DM', 'Swipe up', 'Vote dans le sondage')" },
            sticker: {
              type: "string",
              enum: ["sondage", "question", "quiz", "compte_a_rebours", "lien", "emoji_slider", "aucun"],
              description: "Sticker interactif Instagram recommandé",
            },
            suggestion_visuelle: { type: "string", description: "Description du visuel ou de la vidéo à mettre en fond" },
            couleur_ambiance: {
              type: "string",
              enum: ["energie", "confiance", "douceur", "urgence", "premium", "nature"],
              description: "Ambiance visuelle de la story",
            },
          },
          required: ["numero", "titre", "texte", "cta", "sticker", "suggestion_visuelle", "couleur_ambiance"],
          additionalProperties: false,
        },
      },
      conseil_publication: { type: "string", description: "Conseil sur le meilleur moment et rythme de publication" },
    },
    required: ["sequence", "stories", "conseil_publication"],
    additionalProperties: false,
  },
};

export async function genererStories({ planAction, feedPosts, nombreStories = 5, tonalite = "" }) {
  let contexteFeed = "";
  if (feedPosts && feedPosts.length > 0) {
    const top = feedPosts.slice(0, 8);
    contexteFeed = `\n\nDonnées de performance du feed Instagram (posts classés du plus au moins performant) :\n${JSON.stringify(top, null, 2)}\n\nRéutilise les angles, sujets et tons des posts qui performent le mieux.`;
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM_STORIES,
    output_config: { format: STORIES_SCHEMA },
    messages: [
      {
        role: "user",
        content: `Voici mon plan d'action / brief :\n\n${planAction}\n${
          tonalite ? `\nTonalité souhaitée : ${tonalite}\n` : ""
        }${contexteFeed}\n\nCrée une séquence de ${nombreStories} stories Instagram.`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("La génération a été refusée. Reformulez votre plan d'action.");
  }

  const text = response.content.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("Réponse vide du modèle.");
  return JSON.parse(text);
}

export async function analyserFeed(feedPosts) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system:
      "Tu es un analyste de contenu Instagram. Tu identifies ce qui fonctionne dans un feed à partir des métriques d'engagement, et tu en tires des recommandations concrètes pour les stories. Tu réponds en français, de façon structurée et actionnable, en markdown.",
    messages: [
      {
        role: "user",
        content: `Voici les ${feedPosts.length} derniers posts de mon feed Instagram avec leurs métriques, classés du plus au moins performant :\n\n${JSON.stringify(
          feedPosts,
          null,
          2
        )}\n\nAnalyse : 1) ce qui marche le mieux (sujets, formats, tons), 2) ce qui marche le moins, 3) trois recommandations concrètes pour mes prochaines stories.`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("L'analyse a été refusée par le modèle.");
  }
  return response.content.find((b) => b.type === "text")?.text ?? "";
}
