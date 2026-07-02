---
description: Génère une séquence de stories Instagram à partir du plan d'action, inspirée de ce qui marche sur le feed
---

Crée mes stories Instagram à partir de ce plan d'action : $ARGUMENTS

Étapes à suivre :

1. **Plan d'action.** Si aucun plan d'action n'est fourni ci-dessus, demande-le-moi (ou cherche un fichier de plan d'action dans le projet : `plan*.md`, `brief*.md`). Ne génère jamais sans brief.

2. **Ce qui marche sur le feed.** Récupère les performances récentes via le connecteur MCP Windsor.ai (`mcp__Windsor_ai__get_data`) :
   - connector : `instagram`
   - fields : `["timestamp", "media_type", "media_caption", "media_like_count", "media_comments_count", "media_reach", "media_saved", "media_shares"]`
   - date_preset : `last_30dT`
   - Identifie les 5 posts les plus engageants (likes + commentaires + 2×enregistrements + 3×partages) et note leurs angles, accroches et appels à l'action. Si l'appel échoue, continue sans le feed et signale-le.

3. **Génère une séquence de 5 stories** (ou le nombre demandé), pensée pour le format vertical 1080×1920. Pour chaque story :
   - **Titre** : accroche très courte (max 8 mots), qui arrête le scroll
   - **Texte** : 1 à 3 phrases courtes
   - **CTA** : appel à l'action (réponds en DM, tape un mot-clé, sondage…)
   - **Sticker Instagram recommandé** : sondage, question, quiz, compte à rebours, lien, curseur emoji, ou aucun
   - **Suggestion de visuel** : quoi filmer ou montrer en fond
   Les stories doivent s'enchaîner (fil narratif) et réutiliser les angles qui performent sur le feed. Reste dans le ton habituel du compte (visible dans les légendes récupérées).

4. **Crée les visuels.** Pour chaque story, génère un fichier SVG 1080×1920 dans `stories/` (crée le dossier si besoin) :
   - fond en dégradé vertical assorti à l'ambiance de la story
   - barres de progression en haut (comme les stories Instagram)
   - titre en grand (Georgia ou serif, gras), texte en dessous, pastille CTA en bas
   - texte découpé manuellement en lignes courtes (pas de retour à la ligne automatique en SVG : maximum ~20 caractères par ligne pour le titre, ~35 pour le texte)
   - dernière ligne « suivant › » sauf sur la dernière story
   Envoie ensuite les fichiers à l'utilisateur avec SendUserFile.

5. **Termine par** : le fil conducteur de la séquence, le meilleur moment de publication (déduis-le des heures des posts qui performent), et un rappel des mots-clés CTA utilisés.

Réponds intégralement en français.
