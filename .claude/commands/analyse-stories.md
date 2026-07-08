---
description: Analyse la rétention des stories publiées et mémorise les apprentissages pour améliorer les prochaines séquences
---

Analyse les performances de mes stories Instagram publiées.

Étapes à suivre :

1. **Récupère les métriques de stories** via le connecteur MCP Windsor.ai (`mcp__Windsor_ai__get_data`) :
   - connector : `instagram`
   - fields : `["story_timestamp", "story_id", "story_views", "story_reach", "story_replies", "story_shares", "story_exits", "story_taps_forward", "story_taps_back"]`
   - date_preset : `last_30dT` (l'API Instagram n'expose les stories que 24 h, mais Windsor conserve l'historique synchronisé ; si le résultat est vide, réessaie avec `last_7dT` puis signale qu'il faut lancer l'analyse dans les 24 h suivant la publication)
   - Si l'appel expire, réduis les champs ou la période.

2. **Reconstitue les séquences** : regroupe les stories par jour de publication et ordonne-les par heure. Pour chaque séquence, calcule :
   - la rétention (vues de la dernière story / vues de la première)
   - le point de décrochage (chute de vues ou pic de sorties `story_exits`)
   - les stories sautées (fort `story_taps_forward` = pas retenu l'attention)
   - les stories qui intriguent (`story_taps_back` élevé sur la suivante)
   - les stories qui font réagir (`story_replies`, `story_shares`)

3. **Présente en français** : la courbe de rétention séquence par séquence, ce qui a fait réagir, ce qu'il faut reproduire, et 3 améliorations concrètes.

4. **Mémorise les apprentissages** : crée ou mets à jour le fichier `apprentissages/stories.md` avec les enseignements durables (une leçon par ligne, datée, avec le chiffre qui la justifie). Ne duplique pas une leçon déjà notée ; corrige-la si les nouvelles données la contredisent. Ce fichier est relu par `/story` à chaque génération : c'est la boucle d'amélioration continue.

Réponds intégralement en français.
