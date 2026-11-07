# Chiffres du chronomètre plus marqués

- À l'arrêt, les chiffres du chronomètre passent du gris clair actuel à la couleur principale du texte (noir en thème clair, blanc en thème sombre, ou la couleur de texte du thème Standard Notes).
- En marche, ils restent bleus comme aujourd'hui.
- Rien d'autre ne change.

## Détails techniques
- `src/components/Chronometer.tsx` (l. 473) : remplacer `text-muted-foreground` par `text-foreground` sur l'affichage du temps uniquement.
