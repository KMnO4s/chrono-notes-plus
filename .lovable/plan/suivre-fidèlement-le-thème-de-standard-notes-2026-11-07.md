# Suivre fidèlement le thème de Standard Notes

## Problème
Aujourd'hui l'éditeur devine seulement « clair » ou « sombre » (préférence système), puis applique ses propres couleurs fixes. Avec un thème Standard Notes coloré ou sombre alors que le système est clair (ou l'inverse), le fond et le texte ne correspondent plus et certains textes deviennent illisibles.

## Ce qui change
- L'éditeur reprend directement les couleurs du thème actif de Standard Notes (fond, texte, bordures, couleur d'accent, couleur de danger, menus et fenêtres).
- Le texte est toujours affiché dans la couleur prévue par le thème pour le fond correspondant, donc il reste lisible quel que soit le thème.
- Hors de Standard Notes (aperçu), les couleurs actuelles restent utilisées.
- Les couleurs choisies pour chaque chronomètre ne changent pas.

## Détails techniques
- Standard Notes injecte dans l'iframe les variables `--sn-stylekit-*` (fond, foreground, contrast, secondary, border, info, danger…).
- Dans `src/index.css`, ajouter une couche qui mappe les tokens shadcn (`--background`, `--foreground`, `--card`, `--popover`, `--muted`, `--accent`, `--border`, `--primary`, `--destructive`, `--ring`…) vers ces variables, avec repli sur les valeurs actuelles. Les tokens étant en HSL et les variables SN en couleurs CSS quelconques, remplacer dans `tailwind.config.ts` les `hsl(var(--x))` par `var(--app-x)` où `--app-x` = `var(--sn-stylekit-…, hsl(var(--x)))`.
- Remplacer la détection clair/sombre de `use-sn-theme.ts` : calculer la luminance de `--sn-stylekit-background-color` (observer les changements de styles/`<link>` via MutationObserver + événement de thème de l'API) pour basculer la classe `dark` (utile aux couleurs de chronomètres et aux notifications).
- Vérifier par Playwright en simulant un thème sombre et un thème coloré (variables injectées) que les textes restent contrastés.
