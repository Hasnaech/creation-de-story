// Rendu des stories 1080×1920 selon le brief SD Équicoaching :
// sobre, éditorial, pas « template-y ». Photo pleine page, accroche en
// grosse typo serif en haut, léger dégradé violet en bas pour la lisibilité,
// CTA discret avec mot-clé, signature en coin. Zones de sécurité : 250 px
// en haut et en bas (masquées par l'interface Instagram).
// Motion sobre, dans l'esprit de ce qui se fait sur les réseaux :
// fondus décalés, légère translation, zoom lent sur la photo. Rien qui
// rebondit, rien qui clignote.

const DUREE_ANIMATION = 7000; // ms

const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
const seg = (t, debut, fin) => Math.min(Math.max((t - debut) / (fin - debut), 0), 1);

const STICKERS = {
  sondage: "Sondage",
  question: "Question",
  quiz: "Quiz",
  compte_a_rebours: "Compte à rebours",
  lien: "Lien",
  emoji_slider: "Curseur",
  aucun: null,
};

const SAFE_HAUT = 250;
const SAFE_BAS = 250;
const MARGE = 90;

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
    this.photo = photo;
    this.W = 1080;
    this.H = 1920;
    canvas.width = this.W;
    canvas.height = this.H;
    this.ctx = canvas.getContext("2d");
    this._raf = null;
    this._grain = this._creerGrain();
  }

  get palette() {
    return this.branding.palettes[this.branding.paletteActive] || this.branding.palettes.B;
  }

  // Fin grain statique, pré-calculé une fois (rend la photo moins « lisse »)
  _creerGrain() {
    const c = document.createElement("canvas");
    c.width = 270; c.height = 480;
    const cx = c.getContext("2d");
    const donnee = cx.createImageData(270, 480);
    for (let i = 0; i < donnee.data.length; i += 4) {
      const v = 118 + Math.random() * 20;
      donnee.data[i] = donnee.data[i + 1] = donnee.data[i + 2] = v;
      donnee.data[i + 3] = 255;
    }
    cx.putImageData(donnee, 0, 0);
    return c;
  }

  drawFrame(t) {
    const { ctx, W, H } = this;
    const pal = this.palette;

    // --- Fond ---
    if (this.photo) {
      // Photo pleine page, zoom lent (aucun autre mouvement)
      const zoom = 1.0 + 0.05 * t;
      const iw = this.photo.naturalWidth, ih = this.photo.naturalHeight;
      const scale = Math.max(W / iw, H / ih) * zoom;
      const dw = iw * scale, dh = ih * scale;
      ctx.drawImage(this.photo, (W - dw) / 2, (H - dh) / 2, dw, dh);

      // Léger assombrissement haut (lisibilité du hook) et
      // dégradé violet en bas (brief : léger overlay violet)
      const haut = ctx.createLinearGradient(0, 0, 0, H * 0.5);
      haut.addColorStop(0, this._rgba(pal.fonce, 0.55));
      haut.addColorStop(1, this._rgba(pal.fonce, 0));
      ctx.fillStyle = haut;
      ctx.fillRect(0, 0, W, H * 0.5);

      const bas = ctx.createLinearGradient(0, H * 0.45, 0, H);
      bas.addColorStop(0, this._rgba(pal.violet, 0));
      bas.addColorStop(1, this._rgba(pal.violet, 0.9));
      ctx.fillStyle = bas;
      ctx.fillRect(0, H * 0.45, W, H * 0.55);
    } else {
      // Sans photo : violet profond, très sobre
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, pal.fonce);
      grad.addColorStop(1, pal.violet);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // Grain discret
    ctx.globalAlpha = 0.05;
    ctx.globalCompositeOperation = "overlay";
    ctx.drawImage(this._grain, 0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    ctx.textAlign = "left";

    // --- Signature discrète en coin (zone de sécurité respectée) ---
    const aSignature = easeOutQuint(seg(t, 0.04, 0.14));
    ctx.globalAlpha = aSignature * 0.9;
    ctx.fillStyle = pal.or;
    ctx.font = `500 30px ${pal.typoTexte}`;
    this._texteEspace(this.branding.signature, MARGE, SAFE_HAUT + 40, 7);
    ctx.globalAlpha = 1;

    // --- Hook : grosse typo serif, peu de mots, aligné à gauche ---
    ctx.font = `600 108px ${pal.typoTitre}`;
    const lignesHook = retourLigne(ctx, this.story.titre, W - MARGE * 2);
    let y = SAFE_HAUT + 210;
    lignesHook.forEach((ligne, i) => {
      const a = easeOutQuint(seg(t, 0.1 + i * 0.06, 0.28 + i * 0.06));
      ctx.globalAlpha = a;
      ctx.fillStyle = pal.clair;
      ctx.fillText(ligne, MARGE, y + (1 - a) * 26);
      y += 118;
    });
    ctx.globalAlpha = 1;

    // --- Filet or, fin ---
    const aFilet = easeOutQuint(seg(t, 0.3, 0.42));
    if (aFilet > 0) {
      ctx.fillStyle = pal.or;
      ctx.fillRect(MARGE, y + 8, 110 * aFilet, 3);
    }

    // --- Bloc bas : texte, CTA, sticker, handle (dans la zone de sécurité) ---
    ctx.font = `300 47px ${pal.typoTexte}`;
    const lignesTexte = retourLigne(ctx, this.story.texte, W - MARGE * 2 - 60);

    const sticker = STICKERS[this.story.sticker];
    const hTexte = lignesTexte.length * 68;
    const hCta = 64;
    const hSticker = sticker ? 106 : 0;
    const hHandle = 50;
    let yBas = H - SAFE_BAS - hHandle - hSticker - hCta - 46 - hTexte;

    lignesTexte.forEach((ligne, i) => {
      const a = easeOutQuint(seg(t, 0.38 + i * 0.05, 0.52 + i * 0.05));
      ctx.globalAlpha = a * 0.95;
      ctx.fillStyle = pal.clair;
      ctx.fillText(ligne, MARGE, yBas + (1 - a) * 18);
      yBas += 68;
    });
    ctx.globalAlpha = 1;
    yBas += 46;

    // CTA : sobre, mot-clé souligné à l'or (pas de gros bouton)
    const aCta = easeOutQuint(seg(t, 0.56, 0.68));
    if (aCta > 0) {
      ctx.globalAlpha = aCta;
      ctx.font = `500 50px ${pal.typoTexte}`;
      ctx.fillStyle = pal.clair;
      const cta = this.story.cta;
      const motCle = this.story.mot_cle && this.story.mot_cle !== "aucun" ? this.story.mot_cle : null;

      if (motCle && cta.includes(motCle)) {
        // Le mot-clé ressort en or, souligné d'un trait fin
        const avant = cta.slice(0, cta.indexOf(motCle));
        const apres = cta.slice(cta.indexOf(motCle) + motCle.length);
        let x = MARGE;
        ctx.fillText(avant, x, yBas + 50);
        x += ctx.measureText(avant).width;
        ctx.fillStyle = pal.or;
        ctx.font = `600 50px ${pal.typoTexte}`;
        ctx.fillText(motCle, x, yBas + 50);
        const wMot = ctx.measureText(motCle).width;
        const aTrait = easeOutQuint(seg(t, 0.64, 0.74));
        ctx.fillRect(x, yBas + 66, wMot * aTrait, 3);
        x += wMot;
        ctx.fillStyle = pal.clair;
        ctx.font = `500 50px ${pal.typoTexte}`;
        ctx.fillText(apres, x, yBas + 50);
      } else {
        ctx.fillText(cta, MARGE, yBas + 50);
      }
      ctx.globalAlpha = 1;
    }
    yBas += hCta;

    // Sticker recommandé : simple capsule filaire, discrète
    if (sticker) {
      const aSticker = easeOutQuint(seg(t, 0.66, 0.78));
      if (aSticker > 0) {
        ctx.globalAlpha = aSticker * 0.85;
        ctx.font = `400 34px ${pal.typoTexte}`;
        const libelle = `Sticker ${sticker}`;
        const wS = ctx.measureText(libelle).width + 70;
        ctx.strokeStyle = this._rgba(pal.clair, 0.55);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(MARGE, yBas + 14, wS, 66, 33);
        ctx.stroke();
        ctx.fillStyle = pal.clair;
        ctx.fillText(libelle, MARGE + 35, yBas + 59);
        ctx.globalAlpha = 1;
      }
      yBas += hSticker;
    }

    // Handle en bas, petit
    const aHandle = easeOutQuint(seg(t, 0.72, 0.84));
    ctx.globalAlpha = aHandle * 0.75;
    ctx.fillStyle = pal.clair;
    ctx.font = `400 34px ${pal.typoTexte}`;
    ctx.fillText(this.branding.instagram, MARGE, H - SAFE_BAS + 4);
    ctx.globalAlpha = 1;
  }

  // Texte avec interlettrage manuel (canvas ne gère pas letter-spacing partout)
  _texteEspace(texte, x, y, espace) {
    const { ctx } = this;
    let cx = x;
    for (const ch of texte) {
      ctx.fillText(ch, cx, y);
      cx += ctx.measureText(ch).width + espace;
    }
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
    this.drawFrame(1);
    const url = this.canvas.toDataURL("image/png");
    this.startPreview();
    return url;
  }

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
