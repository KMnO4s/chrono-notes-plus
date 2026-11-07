# Statistiques détaillées : toute la fenêtre défile

La fenêtre entière (résumé + historique) défile d'un seul bloc ; l'historique n'a plus sa propre zone de défilement. Le titre et le bouton de fermeture restent visibles en haut.

## Détails techniques (src/components/StatisticsDialog.tsx)
- Le conteneur de contenu (ligne 48) devient `flex-1 min-h-0 overflow-y-auto` (zone unique de défilement), sans contrainte flex sur les enfants.
- Le bloc historique (ligne 99) perd `flex-1 min-h-0`.
- Le `ScrollArea` de l'historique est remplacé par un simple `div` bordé (`rounded-md border`), sans hauteur imposée.
- Taille de la fenêtre inchangée (plein écran sur mobile, 80vh max ailleurs).
- Vérification visuelle sur mobile et ordinateur avec de nombreuses sessions.
