---
description: Génère une séquence de stories Instagram à partir du plan média, selon le brief SD Équicoaching
---

Crée mes stories Instagram à partir de ce plan média : $ARGUMENTS

Étapes à suivre :

1. **Brief de marque.** Lis `config/branding.json` : palette active, typos, registre, ton, piliers, mots-clés ManyChat. Applique ces règles à tout ce que tu produis. Règles d'écriture non négociables : phrases courtes, une idée par ligne, reframe « Ce n'est pas X. C'est Y. », hooks contre-intuitifs, jamais de tirets cadratins, aucun ton corporate ou IA, un seul mot-clé ManyChat par story (FLASH réservé à la fin de séquence).

2. **Plan média.** Si aucun plan n'est fourni ci-dessus, demande-le (ou cherche `plan*.md` / `brief*.md` dans le projet). Ne génère jamais sans brief.

3. **Ce qui marche sur le feed.** Récupère les performances récentes via le connecteur MCP Windsor.ai (`mcp__Windsor_ai__get_data`) :
   - connector : `instagram`
   - fields : `["timestamp", "media_type", "media_caption", "media_like_count", "media_comments_count", "media_reach", "media_saved", "media_shares"]`
   - date_preset : `last_30dT`
   - Identifie les 5 posts les plus engageants (likes + commentaires + 2×enregistrements + 3×partages) et note leurs hooks, angles et CTA. Si l'appel échoue, continue sans le feed et signale-le.

4. **Photos.** Si un dossier `photos/` existe dans le projet, liste son contenu et associe une photo à chaque story selon le pilier (voir `photosParPilier` dans le branding : pro → DRH/posture, ranch/nature → neurosciences/burn-out, coulisses → storytelling client). Sinon, indique simplement le type de photo à utiliser.

5. **Génère la séquence** (5 stories par défaut). Pour chaque story : pilier, hook (max 9 mots, grosse typo), texte (1 à 3 phrases courtes), CTA avec le mot-clé tel quel (« Commente PROFILS »), sticker recommandé, type de photo. Montée en tension : valeur d'abord, vente à la fin.

6. **Crée les visuels** en SVG 1080×1920 dans `stories/` (structure du brief, sobre, pas « template ») :
   - photo en fond si disponible (balise `<image>` intégrée en base64), sinon dégradé violet profond
   - léger dégradé violet en bas pour la lisibilité (`fonce` → `violet` de la palette)
   - zones de sécurité : aucun texte à moins de 250 px du haut et du bas
   - signature `SD ÉQUICOACHING` petite, en capitales or espacées, en haut à gauche
   - hook en grosse typo serif (Cormorant Garamond, repli Georgia), aligné à gauche, crème
   - texte en typo sans-serif légère (Jost, repli Helvetica)
   - CTA sobre : le mot-clé en or, souligné d'un trait fin ; pas de gros bouton
   - capsule filaire discrète pour le sticker, handle `@sarahdabancens` en bas
   - découpe les lignes manuellement (pas de retour automatique en SVG) : ~18 caractères par ligne pour le hook, ~38 pour le texte
   Envoie ensuite les fichiers avec SendUserFile.

7. **Termine par** : le fil conducteur, le créneau de publication (déduis-le des heures des posts qui performent), et le rappel des mots-clés utilisés.

Note : pour les versions **animées** (vidéo MP4) et l'intégration photo avec effet de zoom, utilise l'application web du projet (`npm start`), qui gère le motion design. Depuis Claude, les visuels sont des images fixes.

Réponds intégralement en français.
