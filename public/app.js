// Interface du générateur de stories.
// Les stories sont dessinées sur un canvas 1080x1920 (format story Instagram)
// et téléchargeables en PNG, prêtes à poster.

const $ = (id) => document.getElementById(id);

const PALETTES = {
  energie:   { haut: "#ff6b35", bas: "#f7c548", texte: "#ffffff", pastille: "rgba(255,255,255,0.22)" },
  confiance: { haut: "#1d3557", bas: "#457b9d", texte: "#ffffff", pastille: "rgba(255,255,255,0.18)" },
  douceur:   { haut: "#f4e3d7", bas: "#e8b4b8", texte: "#4a3b36", pastille: "rgba(74,59,54,0.10)" },
  urgence:   { haut: "#7b1e1e", bas: "#d64545", texte: "#ffffff", pastille: "rgba(255,255,255,0.20)" },
  premium:   { haut: "#14110f", bas: "#3a322c", texte: "#e9dcc5", pastille: "rgba(233,220,197,0.14)" },
  nature:    { haut: "#2d5a3d", bas: "#8ab88a", texte: "#ffffff", pastille: "rgba(255,255,255,0.18)" },
};

const STICKERS = {
  sondage: "📊 Sondage",
  question: "❓ Question",
  quiz: "🧠 Quiz",
  compte_a_rebours: "⏳ Compte à rebours",
  lien: "🔗 Lien",
  emoji_slider: "🎚️ Curseur emoji",
  aucun: null,
};

let storiesCourantes = [];

// --- Rendu d'une story sur canvas 1080x1920 ---

function retourLigne(ctx, texte, largeurMax) {
  const mots = texte.split(/\s+/);
  const lignes = [];
  let ligne = "";
  for (const mot of mots) {
    const essai = ligne ? `${ligne} ${mot}` : mot;
    if (ctx.measureText(essai).width > largeurMax && ligne) {
      lignes.push(ligne);
      ligne = mot;
    } else {
      ligne = essai;
    }
  }
  if (ligne) lignes.push(ligne);
  return lignes;
}

function dessinerStory(canvas, story, index, total) {
  const W = 1080, H = 1920;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const pal = PALETTES[story.couleur_ambiance] || PALETTES.confiance;

  // Fond dégradé
  const grad = ctx.createLinearGradient(0, 0, W * 0.3, H);
  grad.addColorStop(0, pal.haut);
  grad.addColorStop(1, pal.bas);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Cercles décoratifs
  ctx.fillStyle = pal.pastille;
  ctx.beginPath(); ctx.arc(W * 0.9, H * 0.12, 260, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(W * 0.08, H * 0.85, 200, 0, Math.PI * 2); ctx.fill();

  // Indicateur de progression (comme les stories Instagram)
  const marge = 60, ecart = 12;
  const segW = (W - marge * 2 - ecart * (total - 1)) / total;
  for (let i = 0; i < total; i++) {
    ctx.fillStyle = i === index ? pal.texte : pal.pastille;
    ctx.beginPath();
    ctx.roundRect(marge + i * (segW + ecart), 70, segW, 10, 5);
    ctx.fill();
  }

  ctx.fillStyle = pal.texte;
  ctx.textAlign = "center";

  // Titre
  ctx.font = "bold 92px Georgia, serif";
  const lignesTitre = retourLigne(ctx, story.titre, W - 180);
  let y = H * 0.32;
  for (const l of lignesTitre) { ctx.fillText(l, W / 2, y); y += 108; }

  // Trait séparateur
  ctx.fillRect(W / 2 - 70, y + 10, 140, 6);
  y += 110;

  // Texte principal
  ctx.font = "52px Georgia, serif";
  for (const l of retourLigne(ctx, story.texte, W - 220)) { ctx.fillText(l, W / 2, y); y += 76; }

  // Sticker suggéré
  const sticker = STICKERS[story.sticker];
  if (sticker) {
    y += 70;
    ctx.font = "44px Georgia, serif";
    const wS = ctx.measureText(sticker).width + 90;
    ctx.fillStyle = pal.pastille;
    ctx.beginPath(); ctx.roundRect(W / 2 - wS / 2, y - 52, wS, 84, 42); ctx.fill();
    ctx.fillStyle = pal.texte;
    ctx.fillText(sticker, W / 2, y + 6);
  }

  // CTA en bas
  ctx.font = "bold 54px Georgia, serif";
  const ctaLignes = retourLigne(ctx, story.cta, W - 300);
  const ctaH = ctaLignes.length * 70 + 60;
  const ctaY = H - 240 - ctaH;
  const ctaW = Math.min(W - 160, Math.max(...ctaLignes.map((l) => ctx.measureText(l).width)) + 140);
  ctx.fillStyle = pal.texte;
  ctx.beginPath(); ctx.roundRect(W / 2 - ctaW / 2, ctaY, ctaW, ctaH, ctaH / 2); ctx.fill();
  ctx.fillStyle = pal.haut;
  let cy = ctaY + 82;
  for (const l of ctaLignes) { ctx.fillText(l, W / 2, cy); cy += 70; }

  // Flèche "suite" sauf pour la dernière
  if (index < total - 1) {
    ctx.fillStyle = pal.texte;
    ctx.font = "48px Georgia, serif";
    ctx.fillText("suivant ›", W / 2, H - 110);
  }
}

// --- Affichage ---

function afficherStories(data) {
  storiesCourantes = data.stories || [];
  $("sequenceInfo").innerHTML =
    `<strong>Objectif :</strong> ${data.sequence.objectif}<br><strong>Fil conducteur :</strong> ${data.sequence.fil_conducteur}` +
    (data.feedUtilise ? "<br><em>✔ Générées en s'inspirant des performances de votre feed</em>" : "") +
    (data.demo ? "<br><em>🧪 Mode démo : séquence d'exemple — ajoutez ANTHROPIC_API_KEY dans .env pour la génération réelle</em>" : "");
  $("conseilPublication").textContent = data.conseil_publication ? `💡 ${data.conseil_publication}` : "";

  const liste = $("listeStories");
  liste.innerHTML = "";
  storiesCourantes.forEach((story, i) => {
    const carte = document.createElement("div");
    carte.className = "story-carte";

    const canvas = document.createElement("canvas");
    dessinerStory(canvas, story, i, storiesCourantes.length);

    const details = document.createElement("div");
    details.className = "story-details";
    details.innerHTML = `<strong>Story ${story.numero}</strong> — 🎬 ${story.suggestion_visuelle}`;

    const btn = document.createElement("button");
    btn.className = "secondaire";
    btn.textContent = "⬇️ Télécharger PNG";
    btn.addEventListener("click", () => telechargerCanvas(canvas, `story-${story.numero}.png`));

    carte.append(canvas, details, btn);
    liste.appendChild(carte);
  });

  $("sectionStories").hidden = false;
  $("sectionStories").scrollIntoView({ behavior: "smooth" });
}

function telechargerCanvas(canvas, nom) {
  const a = document.createElement("a");
  a.download = nom;
  a.href = canvas.toDataURL("image/png");
  a.click();
}

// --- Appels API ---

async function appelApi(url, corps) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corps || {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erreur || `Erreur ${res.status}`);
  return data;
}

function setChargement(message) {
  const el = $("chargement");
  el.hidden = !message;
  el.textContent = message || "";
  $("btnGenerer").disabled = Boolean(message);
  $("btnAnalyser").disabled = Boolean(message);
}

function setErreur(message) {
  const el = $("erreur");
  el.hidden = !message;
  el.textContent = message || "";
}

$("btnGenerer").addEventListener("click", async () => {
  setErreur("");
  setChargement("Claude rédige vos stories… (10 à 30 secondes)");
  try {
    const data = await appelApi("/api/generer-stories", {
      planAction: $("planAction").value,
      nombreStories: $("nombreStories").value,
      tonalite: $("tonalite").value,
      utiliserFeed: $("utiliserFeed").checked,
    });
    afficherStories(data);
  } catch (err) {
    setErreur(err.message);
  } finally {
    setChargement("");
  }
});

$("btnAnalyser").addEventListener("click", async () => {
  setErreur("");
  setChargement("Récupération de votre feed et analyse par Claude…");
  try {
    const data = await appelApi("/api/analyse-feed");
    $("analyseTexte").innerHTML = markdownSimple(data.analyse);
    const top = $("topPosts");
    top.innerHTML = "<h3>Top posts</h3>";
    data.posts.slice(0, 5).forEach((p) => {
      const div = document.createElement("div");
      div.className = "top-post";
      div.innerHTML = `<span>${p.legende ? echapper(p.legende.slice(0, 90)) : "(sans légende)"}…</span>
        <span class="metriques">❤️ ${p.likes} · 💬 ${p.commentaires} · 🔖 ${p.enregistrements}</span>`;
      top.appendChild(div);
    });
    $("sectionAnalyse").hidden = false;
    $("sectionAnalyse").scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    setErreur(err.message);
  } finally {
    setChargement("");
  }
});

$("btnToutTelecharger").addEventListener("click", () => {
  document.querySelectorAll("#listeStories canvas").forEach((canvas, i) => {
    setTimeout(() => telechargerCanvas(canvas, `story-${i + 1}.png`), i * 300);
  });
});

// Mini-rendu markdown (titres, gras, listes) pour l'analyse
function echapper(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function markdownSimple(md) {
  return echapper(md)
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^[-*] (.*)$/gm, "• $1");
}

// Statut de configuration au chargement
(async () => {
  try {
    const res = await fetch("/api/statut");
    const s = await res.json();
    $("statut").innerHTML =
      `Claude : <span class="${s.claude ? "ok" : "ko"}">${s.claude ? "✔ connecté" : "✘ clé API manquante"}</span> · ` +
      `Instagram : <span class="${s.instagram ? "ok" : "ko"}">${s.instagram ? "✔ connecté" : "✘ non connecté (voir README)"}</span>` +
      (s.demo ? ` · <span class="ko">🧪 mode démo actif</span>` : "");
  } catch { /* le serveur répondra bien assez tôt */ }
})();
