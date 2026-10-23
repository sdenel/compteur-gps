# Compteur GPS — POC

Preuve de concept, pas un produit : une page HTML sans dépendance qui affiche en grand la vitesse GPS du téléphone, l'altitude carte et le détail du fix reçu (`navigator.geolocation.watchPosition`, haute précision).

- Servi par GitHub Pages : https://sdenel.github.io/compteur-gps/ (QR code en bas de page).
- Fonctionne hors ligne après une première ouverture connectée (service worker `sw.js`) et s'installe sur l'écran d'accueil (`manifest.webmanifest`).
- `specifications.md` est la source de vérité fonctionnelle ; `AGENTS.md` impose de la mettre à jour à chaque intention exprimée.
- Exige HTTPS (géolocalisation et wake lock refusés sinon).
- Le navigateur ne reçoit qu'un fix déjà fusionné par l'OS : ni constellation, ni nombre de satellites, ni SNR/HDOP. La « source estimée » affichée est une heuristique basée sur la précision.
- Altitude carte : sur Android l'API donne la hauteur au-dessus de l'ellipsoïde WGS84 ; la page soustrait l'ondulation du géoïde EGM96 lue dans `egm96-1deg.bin` (grille 1°, int16 little-endian en décimètres, 181 lignes de +90° à −90°, 360 colonnes de −180° à 179°, interpolation bilinéaire ; écart ≤ 2,5 m en Europe, ≤ 14 m dans le monde par rapport à la grille 15' de la NGA). Sur iOS l'altitude est déjà au niveau de la mer et n'est pas corrigée (case à cocher dans le diagnostic). Grille dérivée des données EGM96 de la NGA via le paquet npm `egm96-universal` (MIT).
