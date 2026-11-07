# Historique des sessions qui dépasse de la fenêtre

## Problème
Dans la fenêtre « Statistiques », la liste « Historique des sessions » a une hauteur fixe. Quand la fenêtre est moins haute, la liste déborde sous le bas de la fenêtre et se fait couper.

## Correction
- La fenêtre garde sa taille actuelle (plein écran sur mobile, 80 % de la hauteur ailleurs).
- La liste de l'historique prend uniquement la place restante et défile à l'intérieur, sans jamais dépasser le bas de la fenêtre.
- Rien d'autre ne change.

## Détails techniques
- `src/components/StatisticsDialog.tsx` : `DialogContent` en `flex flex-col` + `overflow-hidden`; le conteneur `space-y` en `flex flex-col flex-1 min-h-0`; le bloc historique en `flex flex-col flex-1 min-h-0`; `ScrollArea` en `flex-1 min-h-[150px]` au lieu de `h-[250px] sm:h-[300px]`.
- Vérifier par Playwright à 732x720 et en mobile que le bas de la liste reste dans la fenêtre.
