# Survol des boutons en gris foncé

## Changement visible
- Au passage de la souris, les boutons à contour et les boutons discrets (Ajouter, Exporter, Paramètres, boutons des cartes, éléments de menu) deviennent gris un peu plus foncé au lieu de vert, avec un texte toujours lisible, en mode clair comme en mode sombre.

## Détails techniques
- La couleur verte vient du jeton `--accent` (142 76% 36%), utilisé par `hover:bg-accent` dans les variantes `outline` et `ghost` de `src/components/ui/button.tsx` et par les menus.
- Dans `src/index.css`, remplacer `--accent` par un gris : clair `220 15% 88%` / `--accent-foreground: 220 15% 15%` ; sombre `220 15% 24%` / `--accent-foreground: 220 15% 95%`.
- Vérifier qu'aucun élément n'utilise `accent` pour signifier « vert » ; sinon le basculer vers `--chrono-green`.
