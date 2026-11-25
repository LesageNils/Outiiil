# Outiiil - Extension pour Fourmizzz

<br/>

**OUTIIIL RENOUVEAU 2.0.5 : COMPATIBLE AVEC LE NOUVEAU MOTEUR DE FOURMIZZZ (S4, S5), SUR CHROME ET FIREFOX**

Fourmizzz a changé de moteur. Cette version corrige l'extension pour qu'elle fonctionne de nouveau :

- **HTTPS** : le jeu est servi en `https://`. L'extension s'active désormais sur les pages en https et toutes ses requêtes vers le jeu suivent le protocole de la page.
- **Jeton de sécurité à usage unique** : le paramètre `t` des formulaires n'est plus réutilisable. Le lanceur de chasses et le lanceur de flood récupèrent un jeton neuf avant chaque envoi.
- **Une action à la fois par compte** : le serveur refuse les requêtes simultanées (« Une autre action est en cours sur votre compte »). Les requêtes de l'extension vers le jeu sont mises en file et passent l'une après l'autre, avec nouvel essai si le serveur est occupé.
- **Détection de la connexion** : l'extension ne s'exécute plus sur la page d'accueil quand le joueur est déconnecté.
- **Unités d'élite** : le jeu écrit désormais « d’Élite » ; les noms d'unités sont comparés sans tenir compte des majuscules, des accents ni du pluriel, et les unités d'élite sont de nouveau comptées.
- **Joueur sans alliance** : l'historique TDC ne tente plus de créer de section sur un forum d'alliance inexistant.

Les services de l'ancien site outiiil.fr (carte, graphiques d'historique, traceur, smileys du chat) ne sont plus en ligne : l'extension ne le contacte plus et ces fonctions sont inactives.

L'extension fonctionne aussi sous Firefox (version 140 ou plus récente).

Politique de confidentialité : [PRIVACY.md](PRIVACY.md)

Installation : télécharger le dépôt, puis dans `chrome://extensions`, activer le mode développeur et « Charger l'extension non empaquetée » sur le dossier.

_________________________________________________________________________

**MISE A JOUR COMPATIBLE AVEC LES DERNIERES VERSIONS DE CHROME**

L'objectif premier de ce fork est de rendre de nouveau compatible cette extension avec la dernière version de chrome.
Ce fork a également pour but d'améliorer l'extension en ajoutant des fonctionnalités supplémentaires.

- stockage de nombreuses infos dans le navigateur (stockage local)
- Une page de synthèse regroupant toutes les infos de la fourmilière. <br />
Cette page de synthèse est accessible en remplacement de l'actuel menu "Aide".

- Ajout d'une liste des membres de l'alliance disponible dans la boite compte plus (toujours visible)

<br/>

_________________________________________________________________________
Notes de l'auteur( Hraesvelg)

## Outiiil ##

Outiiil est un projet destiné à ameliorer la qualité du jeu [Fourmizzz](http://fourmizzz.fr). Fourmizzz
est un jeu par navigateur dont le but est de developper sa fourmilière. Dans la lignée des jeux par navigateur 
comme Ogame, Fourmizzz s'est aproprié un monde à part et perdure depuis plusieurs années.

Le projet est né d'une volonté de proposer une solution **libre** et de proposer des outils directement sur le jeu.
De plus Outiiil a l'ambition d'être complétement **transparent** : tout les joueurs qui utilisent cette extension peuvent
lire le code et savent exactement ce que fait l'extension !

Le projet attache également une grande importance quant à l'utilisation de vos données lié au jeu. 
Outiiil fonctionne localement, il récupére des données de fàçon securisée seulement pour l'historique des joueurs et 
pour gérer un eventuel utilitaire. **Aucunes** Données personnelles n'est stockées ailleurs que chez vous !

## Contribuer ##

Si Outiiil est à présent sur Github c'est pour la communauté : beaucoup participe de prés et de loin à ce projet et je me devais 
de proposer une solution digne de ce nom pour faire evoluer ce projet, celui qui veut faire sa propre version parce qu'il voit les choses 
autrement ou celui qui veut vraiment participer peut desormais le faire plus facilement !

### Comment ? ###

Le projet disponible ci dessus présente les sources en javascript pouvant être intégré à une extension ou un userscript.

