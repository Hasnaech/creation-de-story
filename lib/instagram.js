// Connexion à l'API Instagram Graph (compte professionnel requis).
// Récupère les derniers posts du feed avec leurs métriques d'engagement
// pour identifier ce qui fonctionne le mieux.

const GRAPH_BASE = "https://graph.facebook.com/v21.0";

function configOk() {
  return Boolean(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_USER_ID);
}

async function graphGet(path, params = {}) {
  const url = new URL(`${GRAPH_BASE}/${path}`);
  url.searchParams.set("access_token", process.env.INSTAGRAM_ACCESS_TOKEN);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || data.error) {
    const msg = data.error?.message || `Erreur HTTP ${res.status}`;
    const err = new Error(msg);
    err.code = data.error?.code;
    throw err;
  }
  return data;
}

// Métriques par post (l'API refuse certaines métriques selon le type de média,
// donc on tolère les échecs et on garde ce qu'on obtient).
async function fetchInsights(mediaId, mediaType) {
  const metrics =
    mediaType === "VIDEO" || mediaType === "REELS"
      ? "reach,saved,shares,total_interactions,ig_reels_avg_watch_time"
      : "reach,saved,shares,total_interactions";
  try {
    const data = await graphGet(`${mediaId}/insights`, { metric: metrics });
    const out = {};
    for (const item of data.data || []) {
      out[item.name] = item.values?.[0]?.value ?? null;
    }
    return out;
  } catch {
    return {};
  }
}

export async function fetchFeedPerformance({ limit = 20 } = {}) {
  if (!configOk()) {
    const err = new Error(
      "Connexion Instagram non configurée : renseignez INSTAGRAM_ACCESS_TOKEN et INSTAGRAM_USER_ID dans le fichier .env (voir README)."
    );
    err.status = 412;
    throw err;
  }

  const media = await graphGet(`${process.env.INSTAGRAM_USER_ID}/media`, {
    fields: "id,caption,media_type,media_product_type,permalink,timestamp,like_count,comments_count",
    limit: String(limit),
  });

  const posts = await Promise.all(
    (media.data || []).map(async (post) => {
      const insights = await fetchInsights(post.id, post.media_type);
      const likes = post.like_count ?? 0;
      const comments = post.comments_count ?? 0;
      const saved = insights.saved ?? 0;
      const shares = insights.shares ?? 0;
      const reach = insights.reach ?? null;
      const engagement = likes + comments + saved * 2 + shares * 3;
      return {
        id: post.id,
        legende: post.caption ? post.caption.slice(0, 300) : "",
        type: post.media_product_type || post.media_type,
        lien: post.permalink,
        date: post.timestamp,
        likes,
        commentaires: comments,
        enregistrements: saved,
        partages: shares,
        portee: reach,
        tauxEngagement: reach ? Math.round((engagement / reach) * 1000) / 10 : null,
        scoreEngagement: engagement,
      };
    })
  );

  posts.sort((a, b) => b.scoreEngagement - a.scoreEngagement);
  return posts;
}

export function instagramConfigured() {
  return configOk();
}
