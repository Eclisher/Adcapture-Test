# AdCapture

Service Node.js / TypeScript pour capturer des emplacements publicitaires et générer un rapport PowerPoint.

## Installation

```bash
npm install
```

## Lancement

- En développement :
  ```bash
  npm run dev
  ```
- En production :
  ```bash
  npm run build
  npm start
  ```

Le service écoute sur `http://localhost:3000`.

## API

### POST /capture

Envoie un payload JSON au format suivant :

```json
{
  "campaignName": "Pub Café Lemonde Q2 2026",
  "advertiser": "Café Bonjour",
  "agency": "Heroiks",
  "creative": {
    "width": 300,
    "height": 250,
    "imageUrl": "https://placehold.co/300x250/E67E22/white?text=CAFE"
  },
  "targets": [
    { "url": "https://www.lemonde.fr" },
    { "url": "https://www.lefigaro.fr" }
  ]
}
```

Réponse attendue :

- `campaignId`
- `reportUrl`
- `summary`
- `results`

### GET /reports/:id.pptx

Télécharge le rapport PPTX généré.

## Fonctionnalités implémentées

- Endpoint `POST /capture` qui orchestre la capture de chaque URL.
- Limitation de concurrence intelligente avec `p-limit(2)` pour éviter de lancer trop de navigateurs Playwright en parallèle.
- Capture Playwright headless en viewport `1280x800`.
- Gestion des CMP via détection et clic sur des boutons multilingues, plus injection Didomi quand disponible.
- Scroll progressif pour déclencher le lazy loading.
- Détection d’emplacements publicitaires basée sur :
  - `iframe.src` contenant des réseaux publicitaires connus
  - `id` / `class` contenant des mots-clés publicitaires
  - containers GPT (`div-gpt-ad*`, `google_ads_iframe*`)
- Filtrage des iframes oversize (>60% de la viewport) pour éviter les interstitiels.
- Capture d’écran pleine page et génération d’un PPT avec :
  - slide de garde
  - slide par URL
  - slide de synthèse
- Résistance aux erreurs : une URL en échec n’empêche pas le traitement des autres.

## Choix techniques

- **Express** : simple et adapté pour une API REST légère sans overhead inutile.
- **Playwright** : robuste pour la capture navigateur et la gestion des CMP / scroll.
- **pptxgenjs** : support d’un PPTX généré côté serveur, compatible PowerPoint / Keynote / Google Slides.
- **p-limit** : contrôle clair de la concurrence pour éviter la saturation mémoire.
- **TypeScript strict** : pour garantir une base de code plus fiable et maintenable.

## Points d’attention et limites actuelles

- L’injection de la créative dans l’iframe n’est pas encore pleinement gérée.
- Le fallback cross-origin est actuellement un overlay visuel sur la page, sans injection directe.
- La détection de WAF / Cloudflare n’est pas implémentée de manière explicite.
- Le fichier PPT utilise des captures PNG locales. Le service n’a pas encore de nom de domaine dynamique ou de configuration d’URL de rapport en production.
- Il n’y a pas de test automatisé inclus dans ce dépôt à ce stade.

## Améliorations possibles

1. Ajouter un test unitaire pour `detectAdSlots` afin de valider les règles d’identification d’iframe publicitaire.
2. Ajouter une meilleure gestion WAF / Cloudflare pour détecter les pages bloquées et répondre `blocked`.
3. Implémenter l’injection de la créative dans l’iframe et le fallback cross-origin avec un overlay plus fidèle.
4. Stocker les rapports dans un emplacement configurable et générer un `reportUrl` dynamique.
5. Ajouter un middleware de logs structurés pour remplacer les `console.log` et améliorer le débogage.
6. Supporter un timeout global de campagne et un suivi plus fin des durées par URL.

## Production : montée en charge pour 10 000 captures/jour

Pour industrialiser ce service, je ferais ces trois évolutions dans cet ordre :

1. **Architecture asynchrone + file storage séparé** : utiliser une queue (RabbitMQ, SQS, ou Redis Queue) pour découpler la réception de la capture du traitement navigateur, et stocker les rapports dans un stockage objet durable plutôt que sur disque local.
2. **Scalabilité horizontale** : déployer des workers indépendants dédiés aux captures Playwright, avec un pool de navigateurs séparé et un orchestrateur léger. Cela permettrait de traiter plusieurs campagnes simultanément sans surcharge du serveur HTTP.
3. **Observabilité et résilience** : ajouter des métriques, traces, alertes et un circuit breaker pour éviter d’épuiser les ressources en cas de pages mauvaises ou de mauvaises cibles.
