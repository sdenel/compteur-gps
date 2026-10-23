# Spécifications — Compteur GPS

Statut : **POC** (proof of concept), explicitement demandé comme tel. Ce fichier est la source de vérité fonctionnelle : chaque intention exprimée par Simon y est reportée (voir `AGENTS.md`), avec la date, puis les choix d'implémentation qui en découlent.

## 1. Objet

Une page web ouverte sur le téléphone qui affiche la vitesse GPS en temps réel, assez grande pour qu'un enfant de 5 ans la lise, avec en dessous le détail de ce que le navigateur a réussi à capter du GPS. Hébergée sur GitHub Pages, partageable par QR code, utilisable hors ligne.

## 2. Intentions exprimées

Toutes du 23 octobre 2026, dans l'ordre.

| # | Intention | Comportement attendu |
|---|-----------|----------------------|
| 1 | Application consultable depuis le téléphone, vitesse GPS en temps réel « en grand » pour que son fils puisse la lire, détail du GPS capté en dessous | Grand chiffre de vitesse en km/h ; panneau « Position captée » avec tout ce que l'API Geolocation expose |
| 2 | Hébergement sur GitHub | Dépôt public `sdenel/compteur-gps`, GitHub Pages depuis `main`, URL https://sdenel.github.io/compteur-gps/ |
| 3 | « Note bien que c'est un POC » | Statut POC affiché dans le README et ici ; pas de sur-ingénierie |
| 4 | Un chiffre après la virgule pour la vitesse | Vitesse affichée à une décimale |
| 5 | Altitude juste en dessous de la vitesse, une décimale aussi | Ligne altitude sous le km/h, une décimale |
| 6 | « Mets en blanc » | Bloc vitesse + altitude (chiffres et unités) en blanc pur `#ffffff` |
| 7 | Démarrer l'application dès l'ouverture | `watchPosition` lancé au chargement ; le bouton sert à mettre en pause / reprendre |
| 8 | Min et max à côté de la vitesse, idem pour l'altitude | Colonne à droite de chaque grand chiffre : max, min |
| 9 | « Pourquoi je suis à 60 m alors que je suis au bord de l'océan ? » → oui à « altitude carte » | Altitude affichée au niveau de la mer : altitude brute − ondulation du géoïde EGM96 (grille embarquée) ; brute et géoïde restent visibles dans le détail |
| 10 | Delta (icône Δ) pour l'altitude | Troisième ligne de la colonne altitude : Δ = max − min |
| 11 | Moyenne pour la vitesse | Ligne « moy » dans la colonne vitesse = distance / temps écoulé depuis le premier fix, arrêts compris |
| 12 | Emojis sur les trois boutons principaux, puis **corrigé** en : icônes UTF-8 monochromes, boutons sur la même ligne | ▶︎ Démarrer / ⏸︎ Pause / ▶︎ Reprendre, ↻ Réinitialiser, ⇲ Plein écran / ⇱ Quitter ; glyphes avec sélecteur de variante texte U+FE0E ; trois boutons sur une seule ligne, icône au-dessus du libellé |
| 13 | Police « plus scientifique » pour les nombres | B612 Mono (police conçue pour les écrans de cockpit) sur toutes les valeurs numériques ; Barlow pour le texte |
| 14 | Remplacer la virgule par un point | Point décimal partout (`toFixed`, aucune locale), coordonnées comprises |
| 15 | Date complète en haut à gauche (ex. « jeudi 30 octobre 2026 »), heure avec secondes en haut à droite | Ligne d'en-tête : `toLocaleDateString('fr-FR')` jour en toutes lettres ; horloge `HH:MM:SS` du téléphone, rafraîchie toutes les 500 ms |
| 16 | Cette première ligne deux fois plus grosse | Date 28 px, heure 32 px ; la date passe sur deux lignes en portrait |
| 17 | « Pourquoi le chiffre après la virgule n'est pas plus petit aussi pour l'altitude ? » | Décimale réduite (0.45 em) pour l'altitude comme pour la vitesse |
| 18 | Troisième ligne : distance parcourue, en mètres | Ligne distance sous l'altitude, en mètres entiers, même taille que l'altitude |
| 19 | QR code en bas de page vers la page statique, pour partager | Panneau « Partager l'application » : QR (SVG inline, niveau de correction M) + URL en texte sélectionnable |
| 20 | Fonctionner hors ligne grâce au cache | Service worker `sw.js` + manifeste PWA ; après une première ouverture connectée, page, grille géoïde, polices et icônes sont en cache |
| 21 | Fichier `AGENTS.md` : toute intention doit donner lieu à une modification de `specifications.md` ; initialiser ce fichier depuis la conversation | Ce fichier et `AGENTS.md` |

## 3. Choix d'implémentation (non demandés, modifiables sur simple demande)

- **Décimale réduite** : la partie décimale des grands chiffres est affichée à 0.45 em pour garder les chiffres entiers lisibles de loin ; `123.4` plus la colonne latérale tiennent sur 400 px de large.
- **Colonne distance** : « durée » (depuis le premier fix) et « en mvt » (temps en mouvement) au format `m:ss` / `h:mm:ss`, par symétrie avec les deux autres colonnes.
- **Distance en entier** : pas de décimale, le bruit GPS entre deux fixes dépasse le décimètre.
- **Vitesse** : `coords.speed` du récepteur quand elle existe ; sinon calculée par haversine entre deux fixes successifs (lissage 50 %), signalée comme telle et comme peu fiable si précision > 30 m.
- **Filtres anti-bruit** : min/max/moy de vitesse sur les fixes à précision ≤ 30 m ; min/max/Δ d'altitude sur précision ≤ 30 m et précision verticale ≤ 50 m ; distance cumulée seulement si précision ≤ 50 m et mouvement détecté (`speed ≥ 0.8 m/s`, ou déplacement > précision si la vitesse n'est pas fournie).
- **Géoïde** : grille EGM96 à 1° (`egm96-1deg.bin`, 130 Ko, int16 little-endian en décimètres, 181 lignes de +90° à −90°, 360 colonnes de −180° à 179°), interpolation bilinéaire, longitude bouclée. Écart mesuré par rapport à la grille 15' de la NGA : ≤ 2.5 m en Europe, ≤ 14 m dans le monde, RMS 0.45 m. Grille dérivée du paquet npm `egm96-universal` (MIT, données NGA). Si la grille ne charge pas, l'altitude ellipsoïdale est affichée non corrigée et le libellé le dit.
- **iOS** : CoreLocation fournit déjà une altitude au niveau de la mer ; case « altitude brute déjà au niveau de la mer » pré-cochée sur iOS, décochée sur Android, mémorisée dans `localStorage` (`cgps.rawMsl`). Changer la case remet min/max/Δ à zéro.
- **Source estimée** : heuristique d'après la précision et la présence de vitesse/cap/altitude dans le fix (≤ 20 m : GNSS très probable ; ≤ 50 m : GNSS probable ou Wi-Fi précis ; ≤ 300 m : Wi-Fi/réseau ; au-delà : cellulaire).
- **Écran** : wake lock demandé au démarrage et au retour au premier plan ; plein écran via l'API Fullscreen, bouton masqué quand elle n'existe pas (Safari iPhone).
- **Hors ligne** : `index.html` en réseau d'abord avec 3 s de délai puis cache (à jour quand connecté, instantané sinon) ; le reste en cache d'abord, rafraîchi en arrière-plan. Précache : `./`, `index.html`, `egm96-1deg.bin`, `manifest.webmanifest`, icônes, CSS Google Fonts ; les fichiers de polices sont mis en cache à leur premier chargement.
- **QR code** : généré une fois (segno, Python) et inliné en SVG, modules noirs sur fond blanc, zone de silence de 2 modules ; il encode l'URL de production et ne suit pas un éventuel déplacement de la page.
- **Thème** : sombre uniquement (usage en voiture), `color-scheme: dark`.

## 4. Contraintes et limites connues

- La géolocalisation et le wake lock exigent un contexte sécurisé (HTTPS) : un artefact claude.ai ne peut pas servir, la page est servie par GitHub Pages.
- Le navigateur reçoit un fix déjà fusionné par l'OS : constellation, nombre de satellites, SNR et HDOP ne sont pas accessibles.
- Altitude brute : Android → hauteur au-dessus de l'ellipsoïde WGS84 ; iOS → niveau de la mer.
- L'heure affichée est celle du téléphone ; l'heure GPS n'est connue qu'à travers le timestamp du fix (« Heure du fix »).
- Hors ligne, le premier fix est plus lent (pas d'assistance réseau), mais le GNSS fonctionne.

## 5. Panneaux de détail (contenu actuel)

- **Position captée** : latitude, longitude (6 décimales), précision (rayon), vitesse brute API (m/s), altitude brute API, précision altitude, géoïde EGM96 au point courant, altitude carte, cap (° + point cardinal), heure du fix, cadence médiane entre fixes, nombre de fixes, source estimée.
- **Trajet** : moyenne en mouvement, distance (approx.), durée.
- **Diagnostic** : contexte sécurisé, permission position, écran (wake lock), grille géoïde, hors ligne (connectivité + état du cache), case iOS, notes.
- **Partager l'application** : QR code et URL.
