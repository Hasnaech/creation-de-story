// Mode démo : permet de tester l'outil sans clé API Anthropic ni connexion
// Instagram. Le feed d'exemple est un instantané réel du compte (juin 2026),
// et la séquence de stories illustre le format de sortie de Claude.

export const FEED_EXEMPLE = [
  {
    legende: "La clarté managériale est le plus beau cadeau que vous pouvez faire à votre équipe. 💼 Être un leader direct, ce n'est pas être dur…",
    type: "REELS", date: "2026-06-12T16:57:29+0000",
    likes: 564, commentaires: 34, enregistrements: 310, partages: 237,
    portee: 36618, tauxEngagement: 5.3, scoreEngagement: 1929,
  },
  {
    legende: "La prochaine fois qu'un collaborateur te manque de respect, ne cherche pas immédiatement la bonne réponse. Fais une pause…",
    type: "REELS", date: "2026-06-03T17:37:54+0000",
    likes: 494, commentaires: 257, enregistrements: 378, partages: 111,
    portee: 21679, tauxEngagement: 8.4, scoreEngagement: 1840,
  },
  {
    legende: "Vous nommez un nouveau manager dans une équipe déjà en place… l'échec d'une mobilité interne est souvent lié à des dynamiques toxiques jamais traitées.",
    type: "REELS", date: "2026-06-05T18:23:24+0000",
    likes: 317, commentaires: 117, enregistrements: 231, partages: 143,
    portee: 22256, tauxEngagement: 6.0, scoreEngagement: 1325,
  },
  {
    legende: "Il pleure en entretien. Il va voir ta hiérarchie. Et tu te retrouves à te justifier : alors que tu faisais ton travail. 🔴 Le profil victimizer…",
    type: "REELS", date: "2026-06-24T20:36:44+0000",
    likes: 218, commentaires: 248, enregistrements: 193, partages: 78,
    portee: 13606, tauxEngagement: 8.9, scoreEngagement: 1086,
  },
  {
    legende: "Un profil dans une équipe. Une seule personne. Et une directrice qui arrive un matin au bureau : personne ne lui dit bonjour. 🕸️ Contamination systémique…",
    type: "REELS", date: "2026-06-26T22:04:23+0000",
    likes: 193, commentaires: 168, enregistrements: 150, partages: 52,
    portee: 7679, tauxEngagement: 10.0, scoreEngagement: 817,
  },
];

export const ANALYSE_EXEMPLE = `## Ce qui marche le mieux

**1. Les conseils de posture directs.** Vos deux meilleurs posts (« La clarté managériale », 36 618 de portée · « Fais une pause », 21 679) donnent un conseil actionnable immédiatement, sans détour.

**2. Les CTA à mot-clé pour du contenu gratuit.** « Tape NEUROSCIENCES / PROFILS / GUIDE en commentaire » déclenche jusqu'à 257 commentaires par reel. C'est votre meilleur levier d'engagement.

**3. Le storytelling avec scénario concret.** « Il pleure en entretien… », « Personne ne lui dit bonjour… » : les ouvertures narratives font vos meilleurs taux d'engagement (8,9 % et 10 %).

## Ce qui marche moins

- **La vente directe** : les CTA « Commente FLASH » (consultation payante) engagent nettement moins que les CTA de contenu gratuit.
- **Les doublons** : chaque reel posté deux fois : une seule version perce, l'autre plafonne sous 3 000 de portée.

## 3 recommandations pour vos stories

1. Ouvrez chaque séquence par une **accroche chiffrée** (« 1 manager sur 2… ») ou un **scénario vécu**.
2. Placez un **sticker question ou sondage** dès la 2ᵉ story pour engager, puis un **mot-clé à envoyer en DM** pour le contenu gratuit.
3. Gardez l'offre payante pour la **dernière story**, après avoir donné de la valeur.

*🧪 Analyse d'exemple (mode démo) : ajoutez votre clé ANTHROPIC_API_KEY dans .env pour une analyse en direct par Claude.*`;

// Séquence de stories publiée la veille (exemple pour le mode démo)
export const STORIES_PERF_EXEMPLE = [
  { position: 1, date: "2026-07-05T18:02:00+0000", legende: "Hook : Ce n'est pas lui le vrai danger.", vues: 1840, portee: 1710, reponses: 4, partages: 12, sorties: 62, sautsAvant: 410, retours: 18 },
  { position: 2, date: "2026-07-05T18:35:00+0000", legende: "Le profil victimizer + sticker question", vues: 1495, portee: 1402, reponses: 57, partages: 9, sorties: 48, sautsAvant: 305, retours: 41 },
  { position: 3, date: "2026-07-05T19:10:00+0000", legende: "Ce n'est pas toi le problème (neurosciences)", vues: 1350, portee: 1281, reponses: 11, partages: 22, sorties: 39, sautsAvant: 290, retours: 12 },
  { position: 4, date: "2026-07-05T19:45:00+0000", legende: "9 profils. 9 protocoles. CTA PROFILS", vues: 1210, portee: 1154, reponses: 84, partages: 15, sorties: 44, sautsAvant: 198, retours: 26 },
  { position: 5, date: "2026-07-05T20:20:00+0000", legende: "Demain, même réunion ? Rappel PROFILS", vues: 980, portee: 942, reponses: 31, partages: 6, sorties: 105, sautsAvant: 240, retours: 8 },
];

export const ANALYSE_STORIES_EXEMPLE = `## Courbe de rétention

Tu gardes **53 % de ton audience** de la story 1 à la story 5 (1 840 vues puis 980). C'est un bon score : la moyenne des comptes business se situe autour de 40 %.

- **Story 1** : 410 sauts en avant. Normal sur un hook, mais le texte doit être lisible en moins de 2 secondes.
- **Story 2 (sticker question)** : 57 réponses et 41 retours en arrière. C'est elle qui accroche : la question sur le victimizer intrigue.
- **Story 5** : 105 sorties, le pic de la séquence. Le rappel du CTA arrive après un premier CTA déjà vu : une partie de l'audience considère la séquence finie.

## Ce qui a fait réagir

1. **Le sticker question en story 2** : 3,8 % de taux de réponse, ton meilleur levier de conversation.
2. **Le CTA PROFILS en story 4** : 84 réponses. Le mot-clé après la valeur fonctionne.
3. **Les partages en story 3** : le contenu neurosciences est le plus partagé, il fait office de preuve d'expertise.

## À reproduire

- La structure hook, question, valeur, CTA : la rétention reste au-dessus de 65 % jusqu'au CTA principal.
- Le sticker question tôt dans la séquence.

## 3 améliorations

1. **Fusionne les stories 4 et 5** ou change l'angle de la 5 (témoignage client plutôt que rappel) pour réduire les sorties finales.
2. **Réduis le texte de la story 1** : 410 sauts en avant suggèrent un hook trop long à lire.
3. **Ajoute un sticker sondage en story 3** pour transformer les partageurs silencieux en votants.

*🧪 Analyse d'exemple (mode démo) : ajoutez votre clé ANTHROPIC_API_KEY dans .env pour une analyse en direct par Claude.*`;

export const STORIES_EXEMPLE = {
  sequence: {
    objectif: "Faire télécharger la grille des 9 profils toxiques via le mot-clé PROFILS en DM",
    fil_conducteur: "Du symptôme vécu (scène concrète) vers la solution (la grille), en montant en tension story après story",
  },
  stories: [
    {
      numero: 1,
      pilier: "collaborateur_toxique",
      titre: "Ce n'est pas lui le vrai danger.",
      texte: "Tout le monde voit le problème. Personne n'agit. C'est là que ça devient dangereux.",
      cta: "Reste là, je t'explique.",
      mot_cle: "aucun",
      sticker: "sondage",
      suggestion_visuelle: "Photo environnement pro : couloir de bureau, lumière naturelle",
    },
    {
      numero: 2,
      pilier: "collaborateur_toxique",
      titre: "Le profil victimizer.",
      texte: "Tu poses des faits. Il répond avec des émotions. Tu documentes. Il accuse.",
      cta: "Tu en as un dans ton équipe ?",
      mot_cle: "aucun",
      sticker: "question",
      suggestion_visuelle: "Photo environnement pro : salle de réunion vide",
    },
    {
      numero: 3,
      pilier: "neurosciences_management",
      titre: "Ce n'est pas toi le problème.",
      texte: "Quand ton système nerveux est en alerte, ta communication perd en impact. C'est de la biologie, pas de la faiblesse.",
      cta: "Souffle. On structure ça.",
      mot_cle: "aucun",
      sticker: "emoji_slider",
      suggestion_visuelle: "Photo nature ou ranch : calme, respiration",
    },
    {
      numero: 4,
      pilier: "collaborateur_toxique",
      titre: "9 profils. 9 protocoles.",
      texte: "Une cliente m'a récemment confié qu'elle répétait le même recadrage depuis 6 mois. Le protocole a tout changé en une semaine.",
      cta: "Commente PROFILS, je t'envoie la grille.",
      mot_cle: "PROFILS",
      sticker: "lien",
      suggestion_visuelle: "Photo coulisses : prise de notes, carnet ouvert",
    },
    {
      numero: 5,
      pilier: "posture_manageriale",
      titre: "Demain, même réunion ?",
      texte: "Soit tu revis la même scène la semaine prochaine. Soit tu arrives avec un protocole.",
      cta: "Commente PROFILS. C'est gratuit.",
      mot_cle: "PROFILS",
      sticker: "compte_a_rebours",
      suggestion_visuelle: "Photo de toi en environnement pro, regard direct",
    },
  ],
  conseil_publication: "Publie la séquence entre 17h30 et 20h30 (créneau de tes posts qui percent), un mardi ou jeudi, en espaçant les stories de 30 à 60 minutes pour laisser vivre le sondage.",
};
