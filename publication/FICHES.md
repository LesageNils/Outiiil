# Fiches de publication

Textes à copier dans les formulaires du Chrome Web Store et d'addons.mozilla.org (AMO).

Archive à téléverser : `publication/outiiil-renouveau-<version>.zip`, la même pour les deux boutiques.

---

## Informations communes

- **Nom** : Outiiil Renouveau
- **Adresse Firefox** : outiiil-renouveau
- **Catégorie** : Chrome « Divertissement » (ou « Jeux »), Firefox « Jeux et divertissement »
- **Langue** : français
- **Licence** : GNU GPL v3
- **Site** : https://github.com/LesageNils/Outiiil
- **Assistance** : https://github.com/LesageNils/Outiiil/issues
- **Politique de confidentialité** : https://github.com/LesageNils/Outiiil/blob/master/PRIVACY.md

### Résumé (132 caractères maximum)

Outils de confort pour Fourmizzz : lanceur de chasses, simulateurs de combat, synthèse de la fourmilière et historique du TDC.

### Description

Outiiil Renouveau ajoute des outils au jeu de stratégie Fourmizzz, directement dans les pages du jeu.

- Lanceur de chasses : calcule la répartition des unités et lance vos chasses à la suite.
- Simulateurs de chasse et de combat, lanceur de flood.
- Synthèse de la fourmilière : constructions, recherches, ressources et ponte sur une seule page.
- Historique de votre terrain de chasse, tiré de vos rapports de chasse et de combat.
- Comptes à rebours des pontes, constructions, recherches et convois.
- Tableaux enrichis des membres d'alliance, temps de trajet vers les ennemis.
- Outils d'alliance : commandes de ressources et fiches des membres sur le forum d'alliance.

L'extension fonctionne uniquement sur fourmizzz.fr, avec votre session de joueur. Elle n'envoie aucune donnée à un serveur tiers.

Logiciel libre (GPL v3), dérivé d'Outiiil de Hraesvelg. Code source : https://github.com/LesageNils/Outiiil

---

## Chrome Web Store : onglet « Pratiques de confidentialité »

### Objectif unique

Ajouter des outils d'aide au jeu (calculs, simulations, lancement de chasses, synthèses) dans les pages du jeu Fourmizzz.

### Justification de l'autorisation d'accès à l'hôte (`*.fourmizzz.fr`)

L'extension s'exécute uniquement sur les pages du jeu Fourmizzz. Elle lit les pages du jeu (fourmilière, armée, rapports, alliance) pour afficher ses outils, et envoie les actions demandées par le joueur (chasses, convois, messages sur le forum d'alliance) au serveur du jeu.

### Code distant

Non, je n'utilise pas de code distant. Tout le code JavaScript est inclus dans l'extension.

### Utilisation des données

Cases à cocher : « Contenu du site Web » uniquement (l'extension lit les pages du jeu pour fonctionner).

Certifications à cocher :
- Je ne vends ni ne transfère les données des utilisateurs à des tiers, en dehors des cas d'utilisation approuvés.
- Je n'utilise ni ne transfère les données des utilisateurs à des fins sans rapport avec l'objectif unique de mon article.
- Je n'utilise ni ne transfère les données des utilisateurs pour déterminer leur solvabilité ou à des fins de prêt.

### Visibilité conseillée

« Non répertorié » : seules les personnes qui ont le lien peuvent l'installer.

---

## Firefox (AMO)

- **Distribution** : « Sur ce site » (fiche publique, mises à jour automatiques), ou « Par vous-même » pour obtenir seulement un fichier .xpi signé à partager.
- **Code source** : non demandé, le code n'est ni minifié ni généré. Les bibliothèques de `js/lib` (jQuery, jQuery UI, DataTables, Highcharts, Moment, Numeral, Clipboard, Globalize) sont des copies non minifiées des versions indiquées dans leurs noms de fichiers, avec deux retouches héritées de l'Outiiil d'origine (voir la note aux relecteurs).
- **Notes pour les relecteurs** :

> Extension pour le jeu par navigateur Fourmizzz (fourmizzz.fr). Elle ne s'exécute que sur *.fourmizzz.fr et ne contacte aucun autre domaine. Pour tester, il faut un compte Fourmizzz (inscription gratuite sur https://www.fourmizzz.fr). Les bibliothèques de js/lib sont des copies non minifiées des versions indiquées dans leurs noms de fichiers. Deux retouches, héritées de l'Outiiil d'origine : dans jquery-ui_1.12.1.js, `window.Globalize` est remplacé par `Globalize` (2 lignes, pour que le spinner trouve Globalize dans le contexte du content script) ; numeral_2.0.6.js ne contient pas les formats optionnels (bps, bytes, etc.) de la fin du fichier officiel.

---

## Captures d'écran

Les deux boutiques demandent au moins une capture (Chrome : 1280x800 ou 640x400). À faire sur une page du jeu avec l'extension active, par exemple la synthèse de la fourmilière et le lanceur de chasses, en masquant les pseudos si besoin.
