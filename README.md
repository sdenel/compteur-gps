# Compteur GPS — POC

Preuve de concept, pas un produit : une seule page HTML sans dépendance qui affiche en grand la vitesse GPS du téléphone et le détail du fix reçu (`navigator.geolocation.watchPosition`, haute précision).

- Servi par GitHub Pages : https://sdenel.github.io/compteur-gps/
- Exige HTTPS (géolocalisation et wake lock refusés sinon).
- Le navigateur ne reçoit qu'un fix déjà fusionné par l'OS : ni constellation, ni nombre de satellites, ni SNR/HDOP. La « source estimée » affichée est une heuristique basée sur la précision.
