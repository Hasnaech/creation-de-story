// Parcours « plan média → stories prêtes à poster » :
// 1. La plateforme charge le branding (config/branding.json)
// 2. L'utilisatrice colle son plan média et dépose ses photos (optionnel)
// 3. Claude génère la séquence, le moteur anime chaque story aux couleurs
//    de la marque, avec export PNG et vidéo.

import { StoryRenderer } from "./story-renderer.js";

const $ = (id) => document.getElementById(id);

let branding = null;
let rendus = []; // instances StoryRenderer affichées
let photos = []; // HTMLImageElement déposées par l'utilisatrice

// --- Branding : applique l'identité à l'interface ---

async function chargerBranding() {
  const res = await fetch("/api/branding");
  branding = await res.json();
  const pal = branding.palettes[branding.paletteActive] || branding.palettes.B;
  $("marqueNom").textContent = branding.signature;
  $("marqueSousTitre").textContent = branding.sousTitre;
  $("piedMarque").textContent = `${branding.instagram} · Format story 1080×1920 · Propulsé par Claude`;
  document.documentElement.style.setProperty("--accent", pal.or);
  document.documentElement.style.setProperty("--marque-fond", pal.violet);
  // Charge les typos de la marque avant le rendu canvas
  try {
    await Promise.all([
      document.fonts.load(`600 108px ${pal.typoTitre}`),
      document.fonts.load(`300 47px ${pal.typoTexte}`),
      document.fonts.load(`500 50px ${pal.typoTexte}`),
    ]);
  } catch { /* repli automatique sur Georgia / sans-serif */ }
}

// --- Photos : dépôt local, jamais envoyées à un serveur ---

function brancherZonePhotos() {
  const zone = $("zonePhotos");
  const input = $("inputPhotos");
  zone.addEventListener("click", () => input.click());
  zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("survol"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("survol"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("survol");
    ajouterPhotos(e.dataTransfer.files);
  });
  input.addEventListener("change", () => ajouterPhotos(input.files));
}

function ajouterPhotos(fichiers) {
  for (const fichier of fichiers) {
    if (!fichier.type.startsWith("image/")) continue;
    const lecteur = new FileReader();
    lecteur.onload = () => {
      const img = new Image();
      img.onload = () => {
        photos.push(img);
        const vignette = document.createElement("img");
        vignette.src = img.src;
        vignette.title = "Cliquer pour retirer";
        vignette.addEventListener("click", (e) => {
          e.stopPropagation();
          photos = photos.filter((p) => p !== img);
          vignette.remove();
        });
        $("apercusPhotos").appendChild(vignette);
      };
      img.src = lecteur.result;
    };
    lecteur.readAsDataURL(fichier);
  }
}

// --- Affichage des stories animées ---

function afficherStories(data) {
  rendus.forEach((r) => r.stopPreview());
  rendus = [];

  $("sequenceInfo").innerHTML =
    `<strong>Objectif :</strong> ${data.sequence.objectif}<br><strong>Fil conducteur :</strong> ${data.sequence.fil_conducteur}` +
    (data.feedUtilise ? "<br><em>✔ Générées en s'inspirant des performances de votre feed</em>" : "") +
    (photos.length ? `<br><em>📷 ${photos.length} photo(s) intégrée(s) aux visuels</em>` : "") +
    (data.demo ? "<br><em>🧪 Mode démo : séquence d'exemple — ajoutez ANTHROPIC_API_KEY dans .env pour la génération réelle</em>" : "");
  $("conseilPublication").textContent = data.conseil_publication ? `💡 ${data.conseil_publication}` : "";

  const liste = $("listeStories");
  liste.innerHTML = "";
  const stories = data.stories || [];

  stories.forEach((story, i) => {
    const carte = document.createElement("div");
    carte.className = "story-carte";

    const canvas = document.createElement("canvas");
    const photo = photos.length ? photos[i % photos.length] : null;
    const rendu = new StoryRenderer(canvas, story, i, stories.length, branding, photo);
    rendu.startPreview();
    rendus.push(rendu);

    const details = document.createElement("div");
    details.className = "story-details";
    const motCle = story.mot_cle && story.mot_cle !== "aucun" ? ` · 🔑 ${story.mot_cle}` : "";
    details.innerHTML = `<strong>Story ${story.numero}</strong>${motCle}<br>📷 ${story.suggestion_visuelle}`;

    const lignesBoutons = document.createElement("div");
    lignesBoutons.className = "story-boutons";

    const btnPNG = document.createElement("button");
    btnPNG.className = "secondaire";
    btnPNG.textContent = "PNG";
    btnPNG.addEventListener("click", () => telechargerURL(rendu.exportPNG(), `story-${story.numero}.png`));

    const btnVideo = document.createElement("button");
    btnVideo.className = "secondaire";
    btnVideo.textContent = "🎬 Vidéo";
    btnVideo.addEventListener("click", async () => {
      btnVideo.disabled = true;
      btnVideo.textContent = "Enregistrement… 7 s";
      try {
        const { blob, extension } = await rendu.exportVideo();
        telechargerURL(URL.createObjectURL(blob), `story-${story.numero}.${extension}`);
      } catch (err) {
        setErreur(err.message);
      } finally {
        btnVideo.disabled = false;
        btnVideo.textContent = "🎬 Vidéo";
      }
    });

    // Publier : ouvre la feuille de partage du téléphone vers l'éditeur
    // Instagram (où on ajoute les vrais stickers avant de publier).
    const btnPublier = document.createElement("button");
    btnPublier.className = "principal";
    btnPublier.textContent = "📲 Publier";
    btnPublier.addEventListener("click", () => publierStory(rendu, story, btnPublier, carte));

    lignesBoutons.append(btnPNG, btnVideo, btnPublier);
    carte.append(canvas, details, lignesBoutons);
    liste.appendChild(carte);
  });

  $("sectionStories").hidden = false;
  $("sectionStories").scrollIntoView({ behavior: "smooth" });
}

function telechargerURL(url, nom) {
  const a = document.createElement("a");
  a.download = nom;
  a.href = url;
  a.click();
}

// Publier : exporte la vidéo puis ouvre la feuille de partage du téléphone,
// d'où l'on choisit Instagram → Story. L'éditeur Instagram s'ouvre avec la
// story chargée : on y ajoute le sticker recommandé (sondage, question…) et on
// publie. Sur ordinateur (pas de partage de fichiers) : téléchargement + étapes.
async function publierStory(rendu, story, bouton, carte) {
  bouton.disabled = true;
  bouton.textContent = "Préparation… 7 s";
  try {
    const { blob, extension } = await rendu.exportVideo();
    const fichier = new File([blob], `story-${story.numero}.${extension}`, { type: blob.type });

    if (navigator.canShare && navigator.canShare({ files: [fichier] })) {
      // Rappel du sticker AVANT d'ouvrir l'éditeur (c'est là qu'on l'ajoute)
      afficherEtapesPublication(carte, story, true);
      await navigator.share({
        files: [fichier],
        title: `Story ${story.numero} - ${branding.signature}`,
      });
    } else {
      telechargerURL(URL.createObjectURL(blob), fichier.name);
      afficherEtapesPublication(carte, story, false);
    }
  } catch (err) {
    if (err.name !== "AbortError") setErreur(err.message);
  } finally {
    bouton.disabled = false;
    bouton.textContent = "📲 Publier";
  }
}

function afficherEtapesPublication(carte, story, mobile) {
  let etapes = carte.querySelector(".etapes-publication");
  if (!etapes) {
    etapes = document.createElement("div");
    etapes.className = "etapes-publication";
    carte.appendChild(etapes);
  }
  const sticker = story.sticker && story.sticker !== "aucun" ? story.sticker.replace(/_/g, " ") : null;
  const rappelSticker = sticker
    ? `Dans l'éditeur Instagram, ajoutez le sticker <em>${sticker}</em> 🎯 avant de publier.`
    : `Publiez depuis l'éditeur Instagram.`;

  if (mobile) {
    // La feuille de partage vient de s'ouvrir : on choisit Instagram → Story
    etapes.innerHTML =
      `<strong>Choisissez Instagram → Story.</strong><br>${rappelSticker}`;
  } else {
    etapes.innerHTML =
      `<strong>Vidéo téléchargée. Pour publier via l'éditeur Instagram :</strong><br>` +
      `1. Transférez-la sur votre téléphone (AirDrop, WhatsApp…)<br>` +
      `2. Instagram → ⊕ → <em>Story</em> → sélectionnez la vidéo<br>` +
      `3. ${rappelSticker}` +
      `<br><small>💡 Depuis votre téléphone, le bouton Publier ouvre directement l'éditeur Instagram, sans transfert.</small>`;
  }
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
  setChargement("Claude compose vos stories aux couleurs de votre marque… (10 à 30 secondes)");
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

$("btnAnalyserStories").addEventListener("click", async () => {
  setErreur("");
  setChargement("Récupération de vos stories publiées et analyse de la rétention…");
  try {
    const data = await appelApi("/api/analyse-stories");
    $("analyseStoriesTexte").innerHTML = markdownSimple(data.analyse);
    const tableau = $("tableauStories");
    tableau.innerHTML = data.stories.length ? "<h3>Séquence publiée</h3>" : "";
    data.stories.forEach((s) => {
      const div = document.createElement("div");
      div.className = "top-post";
      div.innerHTML = `<span><strong>${s.position}.</strong> ${echapper((s.legende || "(sans légende)").slice(0, 70))}</span>
        <span class="metriques">👁 ${s.vues ?? "?"} · 💬 ${s.reponses} · ↪️ ${s.sautsAvant ?? "?"} · 🚪 ${s.sorties ?? "?"}</span>`;
      tableau.appendChild(div);
    });
    $("sectionAnalyseStories").hidden = false;
    $("sectionAnalyseStories").scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    setErreur(err.message);
  } finally {
    setChargement("");
  }
});

$("btnToutPNG").addEventListener("click", () => {
  rendus.forEach((rendu, i) => {
    setTimeout(() => telechargerURL(rendu.exportPNG(), `story-${i + 1}.png`), i * 300);
  });
});

$("btnToutVideo").addEventListener("click", async () => {
  const btn = $("btnToutVideo");
  btn.disabled = true;
  try {
    for (let i = 0; i < rendus.length; i++) {
      btn.textContent = `🎬 Story ${i + 1}/${rendus.length}…`;
      const { blob, extension } = await rendus[i].exportVideo();
      telechargerURL(URL.createObjectURL(blob), `story-${i + 1}.${extension}`);
    }
  } catch (err) {
    setErreur(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "🎬 Tout en vidéo";
  }
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
    .replace(/^[-*] (.*)$/gm, "• $1")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

// --- Initialisation ---

(async () => {
  brancherZonePhotos();
  try {
    await chargerBranding();
    const res = await fetch("/api/statut");
    const s = await res.json();
    $("statut").innerHTML =
      `Claude : <span class="${s.claude ? "ok" : "ko"}">${s.claude ? "✔ connecté" : "✘ clé API manquante"}</span> · ` +
      `Instagram : <span class="${s.instagram ? "ok" : "ko"}">${s.instagram ? "✔ connecté" : "✘ non connecté (voir README)"}</span>` +
      (s.demo ? ` · <span class="ko">🧪 mode démo actif</span>` : "");
  } catch { /* le serveur répondra bien assez tôt */ }
})();
