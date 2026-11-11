# Nombre de chronomètres dans l'aperçu de la note

Aujourd'hui, la liste des notes de Standard Notes affiche le début des données brutes (texte JSON illisible). Elle affichera à la place un résumé lisible, dans la langue choisie :

- Français : « 3 chronomètres » (« 1 chronomètre », « Aucun chronomètre »)
- Anglais : « 3 chronometers » (« 1 chronometer », « No chronometers »)

Si au moins un chronomètre tourne, on ajoute « · 1 en cours » / « · 1 running ».

L'aperçu se met à jour à chaque sauvegarde de la note. Rien d'autre ne change.

## Détails techniques
- Dans `src/pages/Index.tsx`, juste avant `snApiRef.current.text = jsonData`, définir `snApiRef.current.preview = ...` (sn-extension-api désactive alors l'aperçu automatique tronqué et envoie `preview_plain`).
- Texte construit via un petit helper dans `src/lib/i18n.ts` (singulier/pluriel, fr/en), avec un test dans `i18n.test.js`.
