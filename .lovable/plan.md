# Indicateur de connexion compact et en-tête simplifié

## Changements visibles
- La bannière verte « Connecté à Standard Notes » en haut disparaît : l'interface ne sera plus décalée vers le bas au lancement.
- Un petit bouton icône est ajouté à droite des boutons du haut (Ajouter, Exporter, Paramètres) :
  - coche verte quand l'éditeur est connecté à Standard Notes ;
  - triangle d'avertissement jaune en mode autonome ;
  - icône de chargement pendant la connexion.
- En cliquant dessus, un menu déroulant affiche le message correspondant (« Connecté à Standard Notes », « Mode autonome – les modifications ne seront pas synchronisées » ou « Connexion à Standard Notes… »), traduit en français et en anglais.
- Le titre « Multi-Chronomètre », son icône et la description sous le titre sont supprimés.

## Détails techniques
- `src/pages/Index.tsx` : retirer le bloc `Alert` + l'état `showBanner`, retirer le `<header>` ; ajouter un `DropdownMenu` avec un `Button variant="outline" size="lg"` icône seule (`CheckCircle2` / `AlertTriangle` / `Loader2`), à la même hauteur que les autres boutons, avec `aria-label` traduit.
- Couleurs via les jetons existants (`--chrono-green`, `--chrono-yellow`) plutôt que des classes de couleur codées en dur.
- Réutiliser les clés de traduction existantes ; nettoyer les imports inutilisés (`Alert`, `X`, `Timer` si plus utilisés).
