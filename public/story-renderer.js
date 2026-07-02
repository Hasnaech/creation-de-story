// Rendu animé des stories (1080×1920) aux couleurs de la marque.
// Chaque story est une petite timeline de motion design : le fond (photo ou
// dégradé) respire, le titre monte, le trait se dessine, le CTA rebondit.
// Export PNG (dernière frame) et vidéo (MediaRecorder sur le canvas).

const DUREE_ANIMATION = 7000; // ms

// Easings
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);
// Progression d'une sous-animation entre deux instants de la timeline (0..1)
const seg = (t, debut, fin) => Math.min(Math.max((t - debut) / (fin - debut), 0), 1);

const STICKERS = {
  sondage: "📊 Sondage",
  question: "❓ Question",
  quiz: "🧠 Quiz",
  compte_a_rebours: "⏳ Compte à rebours",
  lien: "🔗 Lien",
  emoji_slider: "🎚️ Curseur emoji",
  aucun: null,
};

function retourLigne(ctx, texte, largeurMax) {
  const mots = String(texte).split(/\s+/);
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

export class StoryRenderer {
  constructor(canvas, story, index, total, branding, photo = null) {
    this.canvas = canvas;
    this.story = story;
    this.index = index;
    this.total = total;
    this.branding = branding;
    this.photo = photo; // HTMLImageElement ou null
    this.W = 1080;
    this.H = 1920;
    canvas.width = this.W;
    canvas.height = this.H;
    this.ctx = canvas.getContext("2d");
    this._raf = null;
  }

  get palette() {
    return (
      this.branding.ambiances[this.story.couleur_ambiance] ||
      this.branding.ambiances.confiance
    );
  }

  // t entre 0 (début) et 1 (fin de l'animation)
  drawFrame(t) {
    const { ctx, W, H } = this;
    const pal = this.palette;
    const accent = this.branding.couleurs.accent;

    ctx.clearRect(0, 0, W, H);

    // --- Fond : photo avec effet Ken Burns, ou dégradé de marque ---
    if (this.photo) {
      const zoom = 1.04 + 0.08 * t; // zoom lent continu
      const iw = this.photo.naturalWidth, ih = this.photo.naturalHeight;
      const scale = Math.max(W / iw, H / ih) * zoom;
      const dw = iw * scale, dh = ih * scale;
      const dx = (W - dw) / 2 - 30 * t; // léger travelling
      const dy = (H - dh) / 2;
      ctx.drawImage(this.photo, dx, dy, dw, dh);
      // Voile de marque pour la lisibilité
      const voile = ctx.createLinearGradient(0, 0, 0, H);
      voile.addColorStop(0, this._rgba(pal.haut, 0.55));
      voile.addColorStop(0.45, this._rgba(pal.haut, 0.35));
      voile.addColorStop(1, this._rgba(pal.haut, 0.88));
      ctx.fillStyle = voile;
      ctx.fillRect(0, 0, W, H);
    } else {
      const grad = ctx.createLinearGradient(0, 0, W * 0.25, H);
      grad.addColorStop(0, pal.haut);
      grad.addColorStop(1, pal.bas);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      // Halo cuivré qui respire doucement
      const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
      const halo = ctx.createRadialGradient(W * 0.85, H * 0.15, 0, W * 0.85, H * 0.15, 500 + 60 * pulse);
      halo.addColorStop(0, this._rgba(accent, 0.28));
      halo.addColorStop(1, this._rgba(accent, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, W, H);
      const halo2 = ctx.createRadialGradient(W * 0.1, H * 0.9, 0, W * 0.1, H * 0.9, 420);
      halo2.addColorStop(0, this._rgba(accent, 0.14));
      halo2.addColorStop(1, this._rgba(accent, 0));
      ctx.fillStyle = halo2;
      ctx.fillRect(0, 0, W, H);
    }

    const texteCouleur = pal.texte;

    // --- Barres de progression (celle en cours se remplit) ---
    const marge = 60, ecart = 12;
    const segW = (W - marge * 2 - ecart * (this.total - 1)) / this.total;
    for (let i = 0; i < this.total; i++) {
      const x = marge + i * (segW + ecart);
      ctx.fillStyle = this._rgba(texteCouleur, 0.28);
      ctx.beginPath(); ctx.roundRect(x, 70, segW, 10, 5); ctx.fill();
      const remplissage = i < this.index ? 1 : i === this.index ? t : 0;
      if (remplissage > 0) {
        ctx.fillStyle = texteCouleur;
        ctx.beginPath(); ctx.roundRect(x, 70, segW * remplissage, 10, 5); ctx.fill();
      }
    }

    // --- Signature de marque en haut ---
    const aMarque = seg(t, 0.03, 0.12);
    ctx.globalAlpha = aMarque;
    ctx.textAlign = "center";
    ctx.fillStyle = texteCouleur;
    ctx.font = "600 40px Georgia, serif";
    ctx.fillText(this.branding.nom.toUpperCase(), W / 2, 175);
    ctx.font = "italic 33px Georgia, serif";
    ctx.fillStyle = this._rgba(texteCouleur, 0.85);
    ctx.fillText(this.branding.sousTitre, W / 2, 224);
    ctx.globalAlpha = 1;

    // --- Titre : lignes qui montent en cascade ---
    ctx.font = "bold 96px Georgia, serif";
    const lignesTitre = retourLigne(ctx, this.story.titre, W - 180);
    let y = H * 0.33;
    lignesTitre.forEach((ligne, i) => {
      const a = easeOut(seg(t, 0.08 + i * 0.05, 0.2 + i * 0.05));
      ctx.globalAlpha = a;
      ctx.fillStyle = texteCouleur;
      ctx.fillText(ligne, W / 2, y + (1 - a) * 60);
      y += 112;
    });
    ctx.globalAlpha = 1;

    // --- Trait cuivré qui se dessine ---
    const aTrait = easeOut(seg(t, 0.2, 0.3));
    if (aTrait > 0) {
      ctx.fillStyle = accent;
      const wTrait = 150 * aTrait;
      ctx.fillRect(W / 2 - wTrait / 2, y + 8, wTrait, 7);
    }
    y += 108;

    // --- Texte principal ---
    ctx.font = "54px Georgia, serif";
    const aTexte = easeOut(seg(t, 0.26, 0.4));
    ctx.globalAlpha = aTexte;
    ctx.fillStyle = texteCouleur;
    for (const ligne of retourLigne(ctx, this.story.texte, W - 220)) {
      ctx.fillText(ligne, W / 2, y + (1 - aTexte) * 30);
      y += 80;
    }
    ctx.globalAlpha = 1;

    // --- Sticker recommandé ---
    const sticker = STICKERS[this.story.sticker];
    if (sticker) {
      const aSticker = easeOutBack(seg(t, 0.4, 0.52));
      if (aSticker > 0) {
        y += 66;
        ctx.save();
        ctx.translate(W / 2, y - 16);
        ctx.scale(aSticker, aSticker);
        ctx.font = "44px Georgia, serif";
        const wS = ctx.measureText(sticker).width + 90;
        ctx.fillStyle = this._rgba(texteCouleur, 0.18);
        ctx.beginPath(); ctx.roundRect(-wS / 2, -42, wS, 84, 42); ctx.fill();
        ctx.strokeStyle = this._rgba(texteCouleur, 0.4);
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(-wS / 2, -42, wS, 84, 42); ctx.stroke();
        ctx.fillStyle = texteCouleur;
        ctx.fillText(sticker, 0, 16);
        ctx.restore();
      }
    }

    // --- CTA : pastille cuivrée qui rebondit puis pulse ---
    const aCta = easeOutBack(seg(t, 0.5, 0.62));
    if (aCta > 0) {
      ctx.font = "bold 56px Georgia, serif";
      const ctaLignes = retourLigne(ctx, this.story.cta, W - 320);
      const ctaH = ctaLignes.length * 72 + 62;
      const ctaW = Math.min(W - 160, Math.max(...ctaLignes.map((l) => ctx.measureText(l).width)) + 150);
      const pulse = t > 0.7 ? 1 + 0.015 * Math.sin((t - 0.7) * Math.PI * 8) : 1;
      ctx.save();
      ctx.translate(W / 2, H - 300 - ctaH / 2);
      ctx.scale(aCta * pulse, aCta * pulse);
      ctx.fillStyle = accent;
      ctx.shadowColor = this._rgba("#000000", 0.35);
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 12;
      ctx.beginPath(); ctx.roundRect(-ctaW / 2, -ctaH / 2, ctaW, ctaH, ctaH / 2); ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#FFF9F0";
      let cy = -ctaH / 2 + 84;
      for (const l of ctaLignes) { ctx.fillText(l, 0, cy); cy += 72; }
      ctx.restore();
    }

    // --- Pied : @instagram + « suivant » ---
    const aPied = seg(t, 0.6, 0.72);
    ctx.globalAlpha = aPied;
    ctx.fillStyle = this._rgba(texteCouleur, 0.85);
    ctx.font = "40px Georgia, serif";
    ctx.fillText(this.branding.instagram, W / 2, H - 160);
    if (this.index < this.total - 1) {
      const deriveX = 8 * Math.sin(t * Math.PI * 6);
      ctx.font = "44px Georgia, serif";
      ctx.fillStyle = this._rgba(texteCouleur, 0.7);
      ctx.fillText("suivant ›", W / 2 + deriveX, H - 90);
    }
    ctx.globalAlpha = 1;
  }

  startPreview() {
    this.stopPreview();
    const debut = performance.now();
    const boucle = (maintenant) => {
      const t = ((maintenant - debut) % DUREE_ANIMATION) / DUREE_ANIMATION;
      this.drawFrame(t);
      this._raf = requestAnimationFrame(boucle);
    };
    this._raf = requestAnimationFrame(boucle);
  }

  stopPreview() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }

  exportPNG() {
    this.stopPreview();
    this.drawFrame(0.85); // état final posé (avant la pulsation extrême)
    const url = this.canvas.toDataURL("image/png");
    this.startPreview();
    return url;
  }

  // Exporte l'animation en vidéo (MP4 si le navigateur le permet, sinon WebM)
  async exportVideo() {
    this.stopPreview();
    const types = [
      "video/mp4;codecs=avc1",
      "video/mp4",
      "video/webm;codecs=vp9",
      "video/webm",
    ];
    const mimeType = types.find((t) => MediaRecorder.isTypeSupported(t));
    if (!mimeType) throw new Error("Export vidéo non supporté par ce navigateur.");

    const flux = this.canvas.captureStream(30);
    const enregistreur = new MediaRecorder(flux, { mimeType, videoBitsPerSecond: 8_000_000 });
    const morceaux = [];
    enregistreur.ondataavailable = (e) => e.data.size && morceaux.push(e.data);

    const fini = new Promise((resoudre) => (enregistreur.onstop = resoudre));
    enregistreur.start();

    const debut = performance.now();
    await new Promise((resoudre) => {
      const boucle = (maintenant) => {
        const avancement = (maintenant - debut) / DUREE_ANIMATION;
        if (avancement >= 1) {
          this.drawFrame(1);
          resoudre();
          return;
        }
        this.drawFrame(avancement);
        requestAnimationFrame(boucle);
      };
      requestAnimationFrame(boucle);
    });

    enregistreur.stop();
    await fini;
    this.startPreview();
    const extension = mimeType.startsWith("video/mp4") ? "mp4" : "webm";
    return { blob: new Blob(morceaux, { type: mimeType }), extension };
  }

  _rgba(hex, alpha) {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
