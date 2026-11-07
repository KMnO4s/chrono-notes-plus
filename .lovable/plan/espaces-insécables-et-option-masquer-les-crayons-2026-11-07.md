# Espaces insécables et option « Masquer les crayons »

## 1. Espace insécable avant les deux-points (français)
- Partout en français, l'espace avant « : » devient insécable, pour que les deux-points ne passent jamais seuls à la ligne. Exemples : « Mode autonome : … », « Couleur du chronomètre : … », et les libellés des statistiques « Temps total : », « Sessions : », « Dernière utilisation : » (qui n'ont aujourd'hui aucune espace).
- Les heures (00:00:00, HH:MM:SS) ne changent pas.
- En anglais, rien ne change.

## 2. Nouvelle option « Masquer les boutons de modification »
- Un nouvel interrupteur dans Paramètres, placé juste avant « Lecture seule ».
- Activé, il cache les deux petits crayons de chaque carte (modifier le nom, modifier le temps). Tous les autres boutons restent visibles : démarrer, remettre à zéro, supprimer, ordre, couleur.
- Désactivé par défaut et enregistré avec la note, comme les autres réglages.
- En lecture seule, les crayons restent cachés comme aujourd'hui.

## Détails techniques
- `src/lib/i18n.ts` : dans `createTranslator`, en français, remplacer `/ ([:;?!])/g` par `\u00A0$1`. Ajouter les clés « Hide Edit Buttons » / « Masquer les boutons de modification » et un helper `colon(language)` (`"\u00A0:"` en fr, `":"` en en) pour les libellés suivis d'un deux-points dans `Chronometer.tsx` (l. 617-625).
- `src/pages/Index.tsx` : `hideEditButtons: false` dans `AppSettings`/`defaultSettings`, nouveau Switch, prop passée aux cartes.
- `src/components/Chronometer.tsx` : les crayons sont masqués si `readOnlyMode || hideEditButtons`.
- Test dans `src/lib/i18n.test.ts` : le texte français « Mode autonome » contient `\u00A0:` et « 00:00:00 » reste intact.
