# AGENTS.md

Consignes pour tout agent (Claude Code, Codex, autre) qui travaille dans ce dépôt.

## Règle n° 1 : la spécification suit chaque intention

- `specifications.md` est la source de vérité fonctionnelle du projet.
- **Toute intention exprimée par l'utilisateur** (demande de fonctionnalité, correction, remarque visuelle, question qui débouche sur un changement de comportement) **doit donner lieu à une modification de `specifications.md`**, dans le même commit que le code.
- Ordre de travail : 1) reporter l'intention dans la spec (section « Intentions exprimées », avec la date), 2) coder, 3) si un choix non demandé a été fait pour y arriver, le noter dans « Choix d'implémentation ».
- Une intention refusée ou impossible est aussi tracée dans la spec, avec la raison.
- Aucun changement de comportement sans trace dans la spec, y compris les retouches de style.

## Contexte

- POC, pas un produit. Une page HTML unique (`index.html`), sans étape de build, sans dépendance à l'exécution, UI en français.
- Hébergée sur GitHub Pages depuis la branche `main` : https://sdenel.github.io/compteur-gps/ (dossier racine, `.nojekyll` présent). Un push sur `main` déclenche le run « pages build and deployment ».
- Fichiers : `index.html` (page + script), `sw.js` (cache hors ligne), `manifest.webmanifest` et `icon-*.png` (installation sur l'écran d'accueil), `egm96-1deg.bin` (grille géoïde, int16 little-endian en décimètres, 181 × 360), `README.md`, `specifications.md`, `AGENTS.md`.

## Vérifications avant de pousser

- Syntaxe : extraire le `<script>` d'`index.html` et passer `node --check` dessus, idem `node --check sw.js` ; `manifest.webmanifest` doit rester du JSON valide.
- Chaque `id` référencé par `$('…')` dans le script existe exactement une fois dans le HTML.
- Si la liste des fichiers servis change, mettre à jour `PRECACHE` dans `sw.js` et incrémenter `VERSION`.
- Après le push, vérifier que le run Pages du commit se termine en `success`.

## Conventions

- Messages de commit en français, une ligne de résumé.
- Ne pas réintroduire de locale dans les nombres (point décimal partout), ne pas remplacer les icônes UTF-8 monochromes par des emojis, garder B612 Mono pour les valeurs numériques. Le détail de ces conventions vit dans `specifications.md` ; ne pas le dupliquer ici.
