# Réparer la mise en ligne GitHub Pages

## Cause
Les 3 dernières mises en ligne ont échoué dès l'étape d'installation. GitHub installe les outils de l'éditeur à partir d'une liste figée (le fichier de verrouillage). Deux outils Lovable ont été ajoutés récemment à la liste principale, mais pas à cette liste figée. GitHub refuse donc d'installer et s'arrête. J'ai reproduit exactement la même erreur ici. Le code de l'éditeur lui-même n'est pas en cause.

## Correctif
1. Régénérer la liste figée pour qu'elle corresponde de nouveau à la liste principale.
2. Par sécurité, faire installer les outils par GitHub de façon plus tolérante, pour qu'un futur décalage de ce genre ne bloque plus la mise en ligne.

Ensuite, la prochaine modification envoyée sur GitHub devrait se publier correctement (coche verte). Les versions 1.1.0 (aperçu des chronomètres) seront alors en ligne.

## Détails techniques
- `npm ci` échoue avec : Missing `@lovable.dev/vite-plugin-dev-server-bridge@1.3.3` et `@lovable.dev/vite-plugin-hmr-gate@1.8.2` dans `package-lock.json`.
- Régénérer `package-lock.json` (`npm install --package-lock-only`).
- Dans `.github/workflows/deploy.yml`, remplacer `npm ci` par `npm install --no-audit --no-fund`.
- Vérifier localement qu'une installation propre et `npm run build` réussissent.
