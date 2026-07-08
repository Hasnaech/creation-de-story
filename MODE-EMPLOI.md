# 📖 Mode d'emploi — Créer ses stories depuis Claude

Guide pour Sarah : comment utiliser l'outil directement dans **Claude Code**, sans rien installer ni configurer.

## Ce qu'il faut (déjà en place)

- **Claude Code** ouvert sur le projet `creation-de-story`
- **Instagram connecté** via le connecteur Windsor.ai (c'est déjà le cas : Claude voit les métriques du compte @sarahdabancens)
- C'est tout. Pas de clé API, pas de serveur, pas de token Meta.

## Les deux commandes

### 1. `/analyse-feed` — savoir ce qui marche

Tapez simplement :

```
/analyse-feed
```

Claude récupère les 30 derniers jours du feed (portée, likes, commentaires, enregistrements, partages), classe les posts par engagement et vous dit :
- le top 5 des posts et **pourquoi** ils ont marché,
- les sujets, hooks et CTA qui performent,
- ce qui marche moins,
- 3 recommandations concrètes pour les prochaines stories.

À faire une fois par semaine ou avant de préparer une séquence.

### 2. `/story` — générer une séquence de stories

Tapez la commande suivie de votre plan média :

```
/story Semaine du 15 juillet : promotion du guide gratuit des 9 profils
toxiques. Cible : managers et DRH. Objectif : mot-clé PROFILS en DM.
Offre en fin de séquence : consultation FLASH.
```

Claude fait alors tout le reste :
1. lit le **brief de marque** (`config/branding.json`) : palette violet/or, ton, piliers, mots-clés ManyChat ;
2. regarde **ce qui a marché sur le feed** ces 30 derniers jours ;
3. écrit une séquence de **5 stories** dans le ton de Sarah (hooks contre-intuitifs, reframe « Ce n'est pas X. C'est Y. », un seul mot-clé par story, vente à la fin) ;
4. crée les **visuels 1080×1920** dans le dossier `stories/` et les envoie dans la conversation ;
5. conseille le **créneau de publication** d'après les heures des posts qui percent.

## Bien écrire son plan média

Plus le plan est précis, meilleures sont les stories. Les 4 informations utiles :

| Quoi | Exemple |
|---|---|
| **L'offre du moment** | « guide gratuit des 9 profils toxiques », « webinaire du 20 juillet » |
| **La cible** | « managers », « DRH et dirigeants de PME » |
| **L'objectif** | « mot-clé PROFILS en DM », « inscriptions au webinaire » |
| **L'offre payante** (optionnel) | « consultation FLASH en fin de séquence » |

Vous pouvez aussi préciser : le nombre de stories (« fais-en 7 »), le registre (« en vouvoiement »), un angle (« pars de l'anecdote de la directrice à qui personne ne dit bonjour »).

## Utiliser vos photos

Déposez vos photos dans un dossier `photos/` du projet (ou glissez-les dans la conversation en demandant à Claude de les utiliser). Claude associe chaque photo au bon pilier :
- **chevaux / ranch / nature** → neurosciences, régulation, burn-out
- **vous en environnement pro** → contenu DRH, posture, autorité
- **coulisses / prise de notes** → storytelling client

## Ajuster après coup

Tout se corrige en discutant, par exemple :
- « La story 3 est trop douce, rends-la plus incisive »
- « Remplace le mot-clé GUIDE par EBOOK »
- « Refais le visuel de la story 1 avec la photo du ranch »
- « Passe toute la séquence en vouvoiement »

## Changer le branding

Le fichier `config/branding.json` contient toute l'identité : palettes A (DRH) et B (premium), typos, registre, ton, piliers, mots-clés. Demandez simplement à Claude : « passe sur la palette A » ou « change le registre en vouvoiement » — il modifiera le fichier.

## Publier sur Instagram (avec les vrais stickers)

Instagram n'autorise pas les applications à publier des stories avec des stickers interactifs : le sondage, la question ou le compte à rebours s'ajoutent **dans l'éditeur Instagram**, juste avant de publier. Le circuit le plus rapide :

1. **Depuis l'application web sur votre téléphone** : bouton **📲 Publier** sous la story → la feuille de partage s'ouvre → choisissez **Instagram** → **Story** → l'éditeur s'ouvre avec votre story ;
2. **ajoutez le sticker recommandé** (indiqué sur le visuel et sous la carte : sondage, question…) et l'autocollant lien si besoin ;
3. **publiez**. Répétez pour chaque story de la séquence (espacées de 30 à 60 minutes idéalement).

Depuis un ordinateur, le bouton télécharge la vidéo et affiche la marche à suivre (transfert vers le téléphone, puis mêmes étapes).

## Analyser les stories publiées (la boucle d'amélioration)

Une fois la séquence publiée, mesurez ce qui a fonctionné pour améliorer la suivante :

```
/analyse-stories
```

Claude récupère les métriques de vos stories (vues, réponses, partages, **sorties** et **sauts en avant** : les deux signaux de décrochage), reconstitue la courbe de rétention de chaque séquence et vous dit : où les spectateurs décrochent, quelles stories font réagir, quoi reproduire, quoi corriger.

Surtout, il **mémorise les leçons** dans `apprentissages/stories.md` : la prochaine fois que vous lancez `/story`, ces apprentissages sont automatiquement appliqués. Produire → publier → mesurer → améliorer, la boucle est bouclée.

⏱ À lancer **dans les 24 h** après la publication (au-delà, Instagram n'expose plus les stories ; Windsor conserve toutefois l'historique qu'il a synchronisé).

L'application web a le même bouton : **📈 Analyser mes stories**.

## Et pour les stories animées ?

Les visuels générés depuis Claude sont des **images fixes**. Pour les versions **animées** (vidéo MP4 de 7 secondes : zoom lent sur la photo, textes en fondu, mot-clé qui se souligne), utilisez l'application web du projet :

```
npm install   (la première fois)
npm start     puis ouvrir http://localhost:3000
```

Même branding, mêmes règles, avec en plus le dépôt de photos en glisser-déposer et l'export vidéo. Elle nécessite une clé API Anthropic dans `.env` pour la génération réelle (mode démo sinon).
