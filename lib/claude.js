import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const MODEL = "claude-opus-4-8";

// Traduit les erreurs de l'API Anthropic en messages actionnables
function erreurLisible(err) {
  if (err instanceof Anthropic.AuthenticationError) {
    return new Error("Clé API Anthropic invalide ou révoquée. Vérifiez ANTHROPIC_API_KEY dans le fichier .env.");
  }
  if (err instanceof Anthropic.BadRequestError && /credit balance/i.test(err.message)) {
    return new Error(
      "Le compte Anthropic n'a plus de crédit. Ajoutez des crédits sur platform.claude.com (Plans & Billing), puis réessayez. En attendant, l'outil reste utilisable en mode démo (retirez la clé du .env)."
    );
  }
  if (err instanceof Anthropic.RateLimitError) {
    return new Error("Limite de débit de l'API atteinte. Patientez une minute puis réessayez.");
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return new Error("Impossible de joindre l'API Anthropic. Vérifiez la connexion internet.");
  }
  return err;
}

const SYSTEM_STORIES = `Tu écris des stories Instagram pour une praticienne experte. Format vertical 1080x1920, textes courts pensés pour arrêter le scroll en 2 secondes.

Règles d'écriture non négociables :
- Phrases courtes. Une idée par ligne.
- Registre affirmatif avec la structure de reframe quand c'est pertinent : « Ce n'est pas X. C'est Y. »
- Hooks contre-intuitifs : question qui inverse l'intuition, angle mort ou sujet tabou, citation choc réinterprétée.
- Jamais de tirets cadratins.
- Aucun jargon corporate creux, aucun ton robotique ou lisse. Ça doit sonner écrit par une praticienne, pas par une IA.
- Un seul mot-clé CTA par story, choisi dans la liste fournie, cohérent avec l'offre du jour. Le mot-clé apparaît tel quel dans le CTA (ex : « Commente FLASH », « Envoie GUIDE en DM »).
- Structure de séquence : hook fort, montée en tension, valeur concrète, puis CTA. La vente directe arrive en fin de séquence, jamais au début.
- Chaque story est autonome mais s'enchaîne avec les autres.

Tu t'appuies sur le plan média fourni et, quand elles sont disponibles, sur les performances réelles du feed pour reprendre les angles qui fonctionnent déjà.`;

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
            pilier: {
              type: "string",
              enum: [
                "collaborateur_toxique",
                "neurosciences_management",
                "posture_manageriale",
                "burnout_managerial",
                "storytelling_client",
                "recrutement_red_flags",
              ],
              description: "Pilier de contenu de la story",
            },
            titre: { type: "string", description: "Le hook : très court (max 9 mots), grosse typo, contre-intuitif" },
            texte: { type: "string", description: "1 à 3 phrases courtes. Une idée par phrase." },
            cta: { type: "string", description: "Appel à l'action court contenant le mot-clé tel quel (ex : « Commente FLASH »)" },
            mot_cle: {
              type: "string",
              enum: ["FLASH", "GUIDE", "PROFILS", "WEBINAIRE", "FORMATION", "EBOOK", "NEUROSCIENCES", "DIAGNOSTIC", "aucun"],
              description: "Mot-clé ManyChat de la story (un seul par story)",
            },
            sticker: {
              type: "string",
              enum: ["sondage", "question", "quiz", "compte_a_rebours", "lien", "emoji_slider", "aucun"],
              description: "Sticker interactif Instagram recommandé",
            },
            suggestion_visuelle: {
              type: "string",
              description: "Type de photo à utiliser selon le pilier : chevaux/ranch, environnement pro, coulisses/notes, nature/calme",
            },
          },
          required: ["numero", "pilier", "titre", "texte", "cta", "mot_cle", "sticker", "suggestion_visuelle"],
          additionalProperties: false,
        },
      },
      conseil_publication: { type: "string", description: "Conseil sur le meilleur moment et rythme de publication" },
    },
    required: ["sequence", "stories", "conseil_publication"],
    additionalProperties: false,
  },
};

export async function genererStories({ planAction, feedPosts, nombreStories = 5, tonalite = "", branding = null }) {
  let contexteMarque = "";
  if (branding) {
    contexteMarque = `\n\nIdentité de la marque :\n- ${branding.nom} (${branding.sousTitre}, ${branding.instagram})\n- Positionnement : ${branding.positionnement}\n- Ton : ${branding.ton}\n- Registre pour les stories : ${branding.registre}\n- Mots-clés CTA disponibles (ManyChat) : ${branding.motsCles.join(", ")}. FLASH renvoie vers la consultation 1h30, l'offre la plus poussée : à réserver à la fin de la séquence.\n- Types de photos par pilier : ${JSON.stringify(branding.photosParPilier)}`;
  }

  let contexteFeed = "";
  if (feedPosts && feedPosts.length > 0) {
    const top = feedPosts.slice(0, 8);
    contexteFeed = `\n\nPerformances récentes du feed (posts classés du plus au moins performant) :\n${JSON.stringify(top, null, 2)}\n\nRéutilise les angles, hooks et tons des posts qui performent.`;
  }

  let response;
  try {
    response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM_STORIES + contexteMarque,
    output_config: { format: STORIES_SCHEMA },
    messages: [
      {
        role: "user",
        content: `Voici mon plan média :\n\n${planAction}\n${
          tonalite ? `\nAjustement de tonalité demandé : ${tonalite}\n` : ""
        }${contexteFeed}\n\nCrée une séquence de ${nombreStories} stories Instagram.`,
      },
    ],
    });
  } catch (err) {
    throw erreurLisible(err);
  }

  if (response.stop_reason === "refusal") {
    throw new Error("La génération a été refusée. Reformulez votre plan média.");
  }

  const text = response.content.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("Réponse vide du modèle.");
  return JSON.parse(text);
}

// Analyse de la rétention des stories publiées : où les gens décrochent,
// ce qui fait répondre, ce qu'il faut reproduire ou corriger.
export async function analyserStories(stories) {
  let response;
  try {
    response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system:
      "Tu es un analyste de stories Instagram. À partir des métriques (vues, portée, réponses, partages, sorties, sauts en avant, retours en arrière), tu diagnostiques la rétention d'une séquence : où les spectateurs décrochent, quelles stories font réagir, lesquelles sont sautées. Tu réponds en français, en markdown, de façon actionnable. Jamais de tirets cadratins. Un « saut en avant » signifie que la story n'a pas retenu l'attention ; une « sortie » que le spectateur a quitté les stories ; un « retour en arrière » que la story précédente a intrigué.",
    messages: [
      {
        role: "user",
        content: `Voici les métriques de mes stories, dans l'ordre de la séquence :\n\n${JSON.stringify(
          stories,
          null,
          2
        )}\n\nAnalyse : 1) la courbe de rétention (où ça décroche et pourquoi), 2) ce qui a fait réagir (réponses, partages, retours), 3) ce qu'il faut reproduire dans les prochaines séquences, 4) trois améliorations concrètes.`,
      },
    ],
    });
  } catch (err) {
    throw erreurLisible(err);
  }

  if (response.stop_reason === "refusal") {
    throw new Error("L'analyse a été refusée par le modèle.");
  }
  return response.content.find((b) => b.type === "text")?.text ?? "";
}

export async function analyserFeed(feedPosts) {
  let response;
  try {
    response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system:
      "Tu es un analyste de contenu Instagram. Tu identifies ce qui fonctionne dans un feed à partir des métriques d'engagement, et tu en tires des recommandations concrètes pour les stories. Tu réponds en français, de façon structurée et actionnable, en markdown. Jamais de tirets cadratins.",
    messages: [
      {
        role: "user",
        content: `Voici les ${feedPosts.length} derniers posts de mon feed Instagram avec leurs métriques, classés du plus au moins performant :\n\n${JSON.stringify(
          feedPosts,
          null,
          2
        )}\n\nAnalyse : 1) ce qui marche le mieux (sujets, hooks, formats, CTA), 2) ce qui marche le moins, 3) trois recommandations concrètes pour mes prochaines stories.`,
      },
    ],
    });
  } catch (err) {
    throw erreurLisible(err);
  }

  if (response.stop_reason === "refusal") {
    throw new Error("L'analyse a été refusée par le modèle.");
  }
  return response.content.find((b) => b.type === "text")?.text ?? "";
}
