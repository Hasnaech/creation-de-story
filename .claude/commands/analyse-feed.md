---
description: Analyse ce qui marche sur le feed Instagram (via Windsor.ai)
---

Analyse les performances de mon feed Instagram et dis-moi ce qui marche.

Étapes à suivre :

1. Récupère les données via le connecteur MCP Windsor.ai (`mcp__Windsor_ai__get_data`) :
   - connector : `instagram`
   - fields : `["timestamp", "media_type", "media_caption", "media_like_count", "media_comments_count", "media_reach", "media_saved", "media_shares"]`
   - date_preset : `last_30dT` (élargis à `last_90dT` si moins de 10 posts)
   - Si l'appel expire, réessaie avec moins de champs ou une période plus courte.

2. Calcule pour chaque post un score d'engagement : `likes + commentaires + 2×enregistrements + 3×partages`, et le taux d'engagement (score / portée). Attention aux doublons : si un même contenu est posté deux fois à quelques minutes d'intervalle, regroupe-les et note laquelle des deux versions a percé.

3. Présente en français :
   - **Top 5 des posts** (accroche, portée, métriques clés, pourquoi ça a marché)
   - **Ce qui marche** : sujets, angles, types d'accroches, appels à l'action, formats
   - **Ce qui marche moins** : avec hypothèses
   - **3 recommandations concrètes pour les prochaines stories**, appuyées sur les chiffres

Sois concret et actionnable, cite les vrais chiffres du feed.
