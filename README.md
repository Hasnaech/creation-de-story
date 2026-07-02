# ✨ Création de Story

Générez vos **stories Instagram** avec Claude, à partir de votre **plan d'action** — et laissez Claude s'inspirer de **ce qui marche sur votre feed**.

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

## Architecture

| Fichier | Rôle |
|---|---|
| `server.js` | Serveur Express, routes API |
| `lib/claude.js` | Appels à l'API Claude (génération JSON structurée + analyse) |
| `lib/instagram.js` | Appels à l'API Instagram Graph (posts + insights) |
| `public/` | Interface web (aperçu et export PNG des stories via canvas) |

Modèle utilisé : `claude-opus-4-8` avec réflexion adaptative et sorties structurées (JSON garanti conforme au schéma).
