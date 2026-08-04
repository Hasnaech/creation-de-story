# ✨ Création de Story

Générez vos **stories Instagram** avec Claude, à partir de votre **plan d'action** — et laissez Claude s'inspirer de **ce qui marche sur votre feed**.

## 🚀 Le plus simple : directement dans Claude Code

Si votre Instagram est connecté à Claude Code via le connecteur **Windsor.ai** (c'est le cas sur ce compte), deux commandes suffisent — aucune clé API ni serveur à configurer :

| Commande | Ce qu'elle fait |
|---|---|
| `/analyse-feed` | Récupère les 30 derniers jours du feed, classe les posts par engagement et explique ce qui marche (et ce qui marche moins) |
| `/story <votre plan d'action>` | Génère une séquence de 5 stories inspirée des posts qui performent, avec les visuels 1080×1920 en SVG prêts à poster |

Exemple :

```
/story Lancement de mon atelier "Manager face aux profils toxiques" le 15 juillet,
cible DRH et managers, objectif : inscriptions via le lien en bio
```

Les visuels sont créés dans le dossier `stories/` et envoyés directement dans la conversation.

## L'application web (alternative autonome)

**Le parcours est volontairement minimal : collez votre plan média, la plateforme gère le reste.**

- **Branding automatique** : les couleurs, la signature (« Sarah Dabancens · Neuroscience & Équicoach »), le @ et le ton de la marque sont appliqués à chaque story. Tout se règle dans `config/branding.json` (couleurs, ambiances, positionnement, ton transmis à Claude).
- **Vos photos** : glissez-déposez vos photos — elles sont intégrées en fond des stories avec un voile aux couleurs de la marque (effet Ken Burns en vidéo). Les photos restent dans votre navigateur, rien n'est envoyé sur un serveur.
- **Motion design** : chaque story est animée (titre qui monte, trait qui se dessine, CTA qui rebondit, barres de progression). Export **PNG** (image fixe) et **vidéo MP4/WebM de 7 secondes** en 1080×1920, prêts à poster.

## Ce que fait l'outil

1. **Vous collez votre plan d'action** (lancement, offre, cible, objectif…).
2. **Claude analyse votre feed Instagram** (likes, commentaires, enregistrements, partages, portée) pour identifier les posts qui performent.
3. **Claude génère une séquence de stories** (3 à 10) : accroche, texte, appel à l'action, sticker interactif recommandé, suggestion de visuel.
4. **Vous téléchargez chaque story en PNG** au format 1080×1920, prête à poster (ou à finaliser dans Canva).

## Installation

```bash
npm install
cp .env.example .env
# Éditez .env avec vos clés (voir ci-dessous)
npm start
```

Puis ouvrez **http://localhost:3000**.

## Configuration

### 1. Clé API Claude (obligatoire)

1. Créez une clé sur [platform.claude.com](https://platform.claude.com/settings/keys).
2. Collez-la dans `.env` : `ANTHROPIC_API_KEY=sk-ant-...`

### 2. Connexion Instagram (optionnelle mais recommandée)

C'est ce qui permet à Claude de « voir » ce qui marche sur votre feed. Prérequis : un **compte Instagram Professionnel** (Business ou Créateur) **lié à une Page Facebook**.

1. **Créez une app Meta** sur [developers.facebook.com](https://developers.facebook.com) → *Mes apps* → *Créer une app* → type **Business**.
2. Ajoutez le produit **Instagram Graph API** à l'app.
3. Ouvrez l'[**Explorateur de l'API Graph**](https://developers.facebook.com/tools/explorer/) :
   - sélectionnez votre app ;
   - demandez les autorisations `instagram_basic`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement` ;
   - cliquez sur *Générer un token d'accès* et connectez votre Page.
4. **Récupérez l'ID de votre compte Instagram** : dans l'explorateur, appelez
   `GET /me/accounts` (notez l'`id` de votre Page), puis
   `GET /{page-id}?fields=instagram_business_account` → l'`id` retourné est votre `INSTAGRAM_USER_ID`.
5. **Prolongez le token** (60 jours) avec l'[outil de debug de token](https://developers.facebook.com/tools/debug/accesstoken/) → *Prolonger le token d'accès*.
6. Renseignez `.env` :
   ```
   INSTAGRAM_ACCESS_TOKEN=EAAG...
   INSTAGRAM_USER_ID=17841400000000000
   ```

> 💡 Sans connexion Instagram, l'outil fonctionne quand même : Claude génère les stories uniquement à partir du plan d'action.

## Utilisation

- **📊 Analyser mon feed** : récupère vos 20 derniers posts, les classe par engagement, et Claude en tire ce qui marche (sujets, formats, tons) + 3 recommandations pour vos stories.
- **🚀 Générer mes stories** : Claude crée la séquence à partir du plan d'action (et du feed si la case est cochée). Chaque story est affichée en aperçu 1080×1920 et téléchargeable en PNG.

## Déployer sur Vercel

Le projet est prêt pour Vercel (`api/index.js` + `vercel.json`). Après avoir importé le dépôt GitHub dans Vercel :

1. Dans le projet Vercel : **Settings → Environment Variables**, ajoutez :
   - `ANTHROPIC_API_KEY` = votre clé (obligatoire — sans elle, l'app reste en mode démo)
   - `CODE_ACCES` = un code de votre choix (fortement recommandé : l'URL étant publique, ce code empêche des inconnus de consommer vos crédits)
   - `INSTAGRAM_ACCESS_TOKEN` et `INSTAGRAM_USER_ID` (optionnels, pour le feed en direct)
2. **Deployments → ⋯ → Redeploy** (les variables ne s'appliquent qu'aux nouveaux déploiements).
3. Ouvrez l'URL : le bandeau doit afficher « Claude : ✔ connecté » sans mention de mode démo. À la première génération, l'interface demande le code d'accès (mémorisé ensuite).

> ⚠️ La clé API ne doit **jamais** être commitée sur GitHub : en local elle vit dans `.env` (ignoré par git), sur Vercel dans les variables d'environnement.

## Architecture

| Fichier | Rôle |
|---|---|
| `server.js` | Serveur Express, routes API |
| `lib/claude.js` | Appels à l'API Claude (génération JSON structurée + analyse) |
| `lib/instagram.js` | Appels à l'API Instagram Graph (posts + insights) |
| `public/` | Interface web (aperçu et export PNG des stories via canvas) |

Modèle utilisé : `claude-opus-4-8` avec réflexion adaptative et sorties structurées (JSON garanti conforme au schéma).
