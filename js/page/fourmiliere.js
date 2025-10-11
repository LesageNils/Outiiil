class PageFourmiliere {
    constructor() {
        this.donneesRessources = null;
        this.donneesReine = null;
    }

    // ========================================
    // MÉTHODES PRINCIPALES D'EXÉCUTION
    // ========================================

    executer() {
        $("center").empty();
        $("center").append("<h1>Synthèse de la fourmiliere</h1>");

        // Afficher un indicateur de chargement
        this.afficherIndicateurChargement();

        // Charger les données de ressources et de la reine en parallèle
        $.when(
            this.chargerDonneesRessources(),
            this.chargerDonneesReine()
        ).then(() => {
            // Création du bloc d'informations du joueur avec les données réelles
            this.afficherInfosJoueur();
        }).catch((error) => {
            console.warn("Impossible de charger certaines données:", error);
            // Afficher quand même les infos avec les données par défaut
            this.afficherInfosJoueur();
        });

        return this;
    }

    // ========================================
    // MÉTHODES D'AFFICHAGE
    // ========================================

    /**
     * Affiche un indicateur de chargement pendant la récupération des données
     */
    afficherIndicateurChargement() {
        // Récupérer les couleurs du thème fourmizzz
        let couleurTexte = monProfil.parametre["couleurTexte"] ? monProfil.parametre["couleurTexte"].valeur : "#000000";
        let couleurFond = monProfil.parametre["couleur1"] ? monProfil.parametre["couleur1"].valeur : "#f8f9fa";
        let couleurBordure = monProfil.parametre["couleur3"] ? monProfil.parametre["couleur3"].valeur : "#dee2e6";
        let couleurTitre = monProfil.parametre["couleurTitre"] ? monProfil.parametre["couleurTitre"].valeur : "#495057";

        let html = `
        <div id="indicateur-chargement" style="
            background: ${couleurFond};
            border: 2px solid ${couleurBordure};
            border-radius: 8px;
            padding: 15px;
            margin: 15px auto;
            max-width: 800px;
            text-align: center;
            font-family: inherit;
            color: ${couleurTexte};
        ">
                <div style="
                    width: 30px;
                    height: 30px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #2196F3;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                "></div>
                <span style="color: #2196F3; font-weight: bold; font-size: 16px;">
                    Chargement des données de ressources...
                </span>
            </div>
        </div>
        
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
        `;

        $("center").append(html);
    }

    /**
     * Affiche un bloc complet avec toutes les informations du joueur
     */
    afficherInfosJoueur() {
        // Supprimer l'indicateur de chargement s'il existe
        $("#indicateur-chargement").remove();
        // Récupérer les couleurs du thème fourmizzz
        let couleurTexte = monProfil.parametre["couleurTexte"] ? monProfil.parametre["couleurTexte"].valeur : "#000000";
        let couleurFond = monProfil.parametre["couleur1"] ? monProfil.parametre["couleur1"].valeur : "#f8f9fa";
        let couleurBordure = monProfil.parametre["couleur3"] ? monProfil.parametre["couleur3"].valeur : "#dee2e6";
        let couleurAlternance = monProfil.parametre["couleur2"] ? monProfil.parametre["couleur2"].valeur : "#e9ecef";
        let couleurTitre = monProfil.parametre["couleurTitre"] ? monProfil.parametre["couleurTitre"].valeur : "#495057";

        let html = `
        <div id="bloc-infos-joueur" style="
            background: ${couleurFond};
            border: 2px solid ${couleurBordure};
            border-radius: 8px;
            padding: 15px;
            margin: 15px auto;
            max-width: 800px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            font-family: inherit;
            color: ${couleurTexte};
        ">
            
             <!-- Première ligne : Informations générales + Armée -->
             <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                 <!-- Informations générales -->
                 <div class="section-info" style="
                     background: ${couleurAlternance};
                     padding: 12px;
                     border-radius: 6px;
                     border-left: 4px solid #4CAF50;
                 ">
                     <h3 style="margin-top: 0; font-size: 14px;">👤 Informations Générales</h3>
                     <table style="width: 100%; border-collapse: collapse;">
                         <tr><td style="padding: 4px; font-weight: bold;">Pseudo:</td><td style="padding: 4px;">${monProfil.pseudo}</td></tr>
                         <tr><td style="padding: 4px; font-weight: bold;">ID:</td><td style="padding: 4px;">${monProfil.id}</td></tr>
                         <tr><td style="padding: 4px; font-weight: bold;">Position:</td><td style="padding: 4px;">(${monProfil.x}, ${monProfil.y})</td></tr>
                         <tr><td style="padding: 4px; font-weight: bold;">Alliance:</td><td style="padding: 4px;">${Utils.alliance || 'Aucune'}</td></tr>
                         <tr><td style="padding: 4px; font-weight: bold;">Serveur:</td><td style="padding: 4px;">${Utils.serveur}</td></tr>
                         <tr><td style="padding: 4px; font-weight: bold;">Compte Plus:</td><td style="padding: 4px;"> ${Utils.comptePlus ? '✅ Actif' : '❌ Inactif'}</td></tr>
                         <tr><td style="padding: 4px; font-weight: bold;">Niveau de construction:</td><td style="padding: 4px;"> ${this.calculerNiveauConstruction()}</td></tr>
                         <tr><td style="padding: 4px; font-weight: bold;">Niveau technologique:</td><td style="padding: 4px;"> ${this.calculerNiveauTechnologique()}</td></tr>
                     </table>
                 </div>
                 
                 <!-- Reine -->
                 <div class="section-info" style="
                     background: ${couleurAlternance};
                     padding: 12px;
                     border-radius: 6px;
                     border-left: 4px solid #9C27B0;
                 ">
                     <h3 style="margin-top: 0; font-size: 14px;">👑 Reine</h3>
                     ${this.genererBlocReine()}
                 </div>
             </div>
             
             <!-- Deuxième ligne : Ressources (sur deux colonnes) -->
             <div style="margin-bottom: 15px;">
                 <div class="section-info" style="
                     background: ${couleurAlternance};
                     padding: 12px;
                     border-radius: 6px;
                     border-left: 4px solid #FF9800;
                 ">
                     <h3 style="margin-top: 0; font-size: 14px;">💰 Ressources</h3>
                        <!-- Tableau de ressources complet avec jauges -->
                        <div style="margin-bottom: 20px;">
                            ${this.genererTableauRessourcesComplet()}
                        </div>
                        
                        <!-- Production et consommation détaillée -->
                 </div>
             </div>
             
             <!-- Troisième ligne : Constructions + Recherches -->
             <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                 <!-- Constructions -->
                 <div class="section-info" style="
                     background: ${couleurAlternance};
                     padding: 12px;
                     border-radius: 6px;
                     border-left: 4px solid #2196F3;
                 ">
                     <h3 style="margin-top: 0; font-size: 14px;">🏗️ Constructions</h3>
                     <div style="max-height: 300px; overflow-y: auto;">
                         ${this.genererListeConstructions()}
                     </div>
                 </div>
                 
                 <!-- Recherches -->
                 <div class="section-info" style="
                     background: ${couleurAlternance};
                     padding: 12px;
                     border-radius: 6px;
                     border-left: 4px solid #9C27B0;
                 ">
                     <h3 style="margin-top: 0; font-size: 14px;">🔬 Recherches</h3>
                     <div style="max-height: 200px; overflow-y: auto;">
                         ${this.genererListeRecherches()}
                     </div>
                 </div>
             </div>
        </div>
        `;

        $("center").append(html);

        // Ajouter un message d'information sur les données
        this.afficherMessageDonnees();
    }

    /**
     * Affiche un message d'information sur les données utilisées
     */
    afficherMessageDonnees() {
        let message = "";
        if (this.donneesRessources && Object.keys(this.donneesRessources).length > 0) {
            let donneesReelles = [];
            let donneesEstimees = [];

            // Vérifier quelles données sont réelles
            if (this.donneesRessources.productionChampignonniere > 0) donneesReelles.push("Champignonnière");
            if (this.donneesRessources.productionRecolteNourriture > 0 || this.donneesRessources.productionRecolteMateriaux > 0) donneesReelles.push("Production terrain");
            if (this.donneesRessources.consommationTroupes > 0) donneesReelles.push("Consommation troupes");
            if (this.donneesRessources.totalProductionNourriture > 0 || this.donneesRessources.totalProductionMateriaux > 0) donneesReelles.push("Totaux production");
            if (this.donneesRessources.ouvrieresNourriture > 0 || this.donneesRessources.ouvrieresMateriaux > 0) donneesReelles.push("Ouvrières affectées");
            if (this.donneesReine && Object.keys(this.donneesReine).length > 0) donneesReelles.push("Ponte de la reine");

            if (donneesReelles.length === 0) donneesEstimees.push("Toutes les données");

            message = `
            <div style="
                background: #d4edda;
                border: 1px solid #c3e6cb;
                border-radius: 5px;
                padding: 10px;
                margin: 10px auto;
                max-width: 800px;
                font-size: 12px;
                color: #155724;
                text-align: center;
            ">
                ✅ <strong>Données réelles</strong> - ${donneesReelles.join(", ")} récupérées depuis la page<br/>
                ${donneesEstimees.length > 0 ? `⚠️ <strong>Données estimées</strong> - ${donneesEstimees.join(", ")}` : ""}
            </div>
            `;
        } else {
            message = `
            <div style="
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 5px;
                padding: 10px;
                margin: 10px auto;
                max-width: 800px;
                font-size: 12px;
                color: #856404;
                text-align: center;
            ">
                ⚠️ <strong>Données estimées</strong> - Utilisation des calculs par défaut (données réelles non disponibles)
            </div>
            `;
        }

        $("center").append(message);
    }

    // ========================================
    // MÉTHODES DE RÉCUPÉRATION DE DONNÉES
    // ========================================

    /**
     * Charge les données de ressources depuis Ressources.php et analyse la production locale
     */
    chargerDonneesRessources() {
        let defer = $.Deferred();

        // D'abord analyser la production locale depuis la page actuelle
        this.analyserProductionLocale();

        // Ensuite charger les données depuis Ressources.php
        $.ajax({
            url: `http://${Utils.serveur.toLowerCase()}.fourmizzz.fr/Ressources.php`,
            type: 'GET',
            dataType: 'html',
            success: (page) => {
                try {
                    // Récupérer uniquement les données disponibles dans Ressources.php
                    let recolteNourriture = $(page).find("#RecolteNourriture").val();
                    let recolteMateriaux = $(page).find("#RecolteMateriaux").val();

                    // Fusionner avec les données locales
                    this.donneesRessources = {
                        ...this.donneesRessources, // Données locales déjà analysées
                        ouvrieresNourriture: parseInt(recolteNourriture) || 0,  // Nombre d'ouvrières sur la nourriture
                        ouvrieresMateriaux: parseInt(recolteMateriaux) || 0     // Nombre d'ouvrières sur les matériaux
                    };

                    defer.resolve(this.donneesRessources);

                } catch (error) {
                    defer.reject(error);
                }
            },
            error: (xhr, status, error) => {
                // Même en cas d'erreur, on a les données locales
                defer.resolve(this.donneesRessources);
            }
        });

        return defer.promise();
    }

    /**
     * Charge les données de la reine depuis Reine.php
     */
    chargerDonneesReine() {
        let defer = $.Deferred();

        $.ajax({
            url: `http://${Utils.serveur.toLowerCase()}.fourmizzz.fr/Reine.php`,
            type: 'GET',
            dataType: 'html',
            success: (page) => {
                try {
                    this.donneesReine = {};
                    $(page).find('.tableau_leger tr').each((e, i) => {
                        if (e > 0) {
                            let ponte = {
                                unites: $(i).find('td').eq(0).text().trim(),
                                garnison: $(i).find('td').eq(1).text().trim(),
                                temps_requis: $(i).find('td').eq(2).text().trim(),
                                temps_restant: $(i).find('td').eq(3).text().trim()
                            };
                            this.donneesReine[e] = ponte;
                        }
                    });
                    defer.resolve(this.donneesReine);
                } catch (error) {
                    defer.reject(error);
                }
            },
            error: (xhr, status, error) => {
                // En cas d'erreur, on initialise avec un objet vide
                this.donneesReine = {};
                defer.resolve(this.donneesReine);
            }
        });

        return defer.promise();
    }

    /**
     * Analyse la production locale depuis la page fourmiliere.php
     */
    analyserProductionLocale() {
        try {
            // Essayer plusieurs méthodes pour trouver le tableau tooltip_conso
            let chaine = "";
            let tableauTrouve = false;

            // Méthode 1: Script dans .contenu_boite_info
            chaine = $(".contenu_boite_info script").text();
            if (chaine && chaine.includes('tooltip_conso')) {
                tableauTrouve = true;
            }

            // Méthode 2: Script dans le body
            if (!tableauTrouve) {
                chaine = $("body script").text();
                if (chaine && chaine.includes('tooltip_conso')) {
                    tableauTrouve = true;
                }
            }

            // Méthode 3: Recherche directe du tableau dans le DOM
            if (!tableauTrouve) {
                let tableau = $("#tableau_boite_info");
                if (tableau.length > 0) {
                    this.analyserTableauDirect();
                    return;
                }
            }

            if (!tableauTrouve || !chaine) {
                this.donneesRessources = {};
                return;
            }

            // Chercher le tableau tooltip_conso dans le contenu du tooltip (avec guillemets échappés)
            let str0 = '<table id=\\"tooltip_conso\\"';
            let str1 = '</table>';
            let i0 = chaine.indexOf(str0);
            let i1 = chaine.indexOf(str1, i0) + str1.length;

            if (i0 === -1 || i1 === -1) {
                this.donneesRessources = {};
                return;
            }

            // Extraire le contenu du tableau
            let tableauHtml = chaine.substring(i0, i1);

            // Nettoyer les guillemets échappés
            let tableauHtmlClean = tableauHtml.replace(/\\"/g, '"');

            // Créer un élément temporaire pour parser le HTML
            let $temp = $('<div>').html(tableauHtmlClean);
            let $tableau = $temp.find('table');

            // Récupérer les stocks actuels
            let stockN = $("#tableau_boite_info").find(".texte_ligne_boite_info").eq(1).text();
            let stockM = $("#tableau_boite_info").find(".texte_ligne_boite_info").eq(2).text();

            // Nettoyer les stocks (enlever espaces et virgules)
            let stockNClean = stockN.replace(/[\s,]/g, '');
            let stockMClean = stockM.replace(/[\s,]/g, '');

            // Récupérer les pourcentages de remplissage
            let pourcentN = $("#tableau_boite_info").find(".jauge_nourriture").attr("style");
            let pourcentM = $("#tableau_boite_info").find(".jauge_materiaux").attr("style");

            // Récupérer les totaux par jour (ligne 1: Total par Jour) - ATTENTION: ce sont des totaux, pas des capacités !
            let totalN = $tableau.find("tr").eq(1).find("td").eq(1).text().replace(/[^\d]/g, '');
            let totalM = $tableau.find("tr").eq(1).find("td").eq(2).text().replace(/[^\d]/g, '');

            // Récupérer la production de récolte terrain (ligne 2: Terrain)
            let recolteN = $tableau.find("tr").eq(2).find("td").eq(1).text().replace(/[^\d]/g, '');
            let recolteM = $tableau.find("tr").eq(2).find("td").eq(2).text().replace(/[^\d]/g, '');

            // Récupérer la production de champignonnière (ligne 3: Champignon)
            let prodchampi = $tableau.find("tr").eq(3).find("td").eq(1).text().replace(/[^\d]/g, '');

            // Récupérer la consommation d'armée (ligne 4: Armée) - ATTENTION: c'est négatif !
            let consoarmee = $tableau.find("tr").eq(4).find("td").eq(1).text().replace(/[^\d]/g, '');

            // Récupérer le nombre d'ouvrières
            let nbOuvri = $('#nb_ouvrieres').text();

            // Stocker toutes les données avec les bonnes interprétations
            this.donneesRessources = {
                stockNourriture: parseInt(stockNClean) || 0,
                stockMateriaux: parseInt(stockMClean) || 0,
                pourcentageNourriture: parseFloat(pourcentN ? pourcentN.replace("width:", "").replace(";", "").replace("%", "") : 0) || 0,
                pourcentageMateriaux: parseFloat(pourcentM ? pourcentM.replace("width:", "").replace(";", "").replace("%", "") : 0) || 0,
                // Les totaux par jour ne sont PAS les capacités de stockage !
                totalProductionNourriture: parseInt(totalN) || 0,  // Total production/jour nourriture
                totalProductionMateriaux: parseInt(totalM) || 0,   // Total production/jour matériaux
                productionRecolteNourriture: parseInt(recolteN) || 0,
                productionRecolteMateriaux: parseInt(recolteM) || 0,
                productionChampignonniere: parseInt(prodchampi) || 0,
                consommationTroupes: parseInt(consoarmee) || 0,
                nombreOuvrieres: parseInt(nbOuvri) || 0
            };

        } catch (error) {
            this.donneesRessources = {};
        }
    }

    /**
     * Analyse le tableau directement depuis le DOM
     */
    analyserTableauDirect() {
        try {
            // Récupérer les stocks actuels
            let stockN = $("#tableau_boite_info").find(".texte_ligne_boite_info").eq(1).text();
            let stockM = $("#tableau_boite_info").find(".texte_ligne_boite_info").eq(2).text();

            // Nettoyer les stocks (enlever espaces et virgules)
            let stockNClean = stockN.replace(/[\s,]/g, '');
            let stockMClean = stockM.replace(/[\s,]/g, '');

            // Récupérer les pourcentages de remplissage
            let pourcentN = $("#tableau_boite_info").find(".jauge_nourriture").attr("style");
            let pourcentM = $("#tableau_boite_info").find(".jauge_materiaux").attr("style");

            // Stocker les données récupérées
            this.donneesRessources = {
                stockNourriture: parseInt(stockNClean) || 0,
                stockMateriaux: parseInt(stockMClean) || 0,
                pourcentageNourriture: parseFloat(pourcentN ? pourcentN.replace("width:", "").replace(";", "").replace("%", "") : 0) || 0,
                pourcentageMateriaux: parseFloat(pourcentM ? pourcentM.replace("width:", "").replace(";", "").replace("%", "") : 0) || 0,
                // Les autres données ne sont pas disponibles directement
                totalProductionNourriture: 0,
                totalProductionMateriaux: 0,
                productionRecolteNourriture: 0,
                productionRecolteMateriaux: 0,
                productionChampignonniere: 0,
                consommationTroupes: 0,
                nombreOuvrieres: parseInt($('#nb_ouvrieres').text()) || 0
            };

        } catch (error) {
            this.donneesRessources = {};
        }
    }

    // ========================================
    // MÉTHODES DE GÉNÉRATION D'INTERFACE
    // ========================================

    /**
     * Génère la liste des constructions avec leurs niveaux
     */
    genererListeConstructions() {
        let html = '<table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
        for (let i = 0; i < CONSTRUCTION.length; i++) {
            let niveau = monProfil.niveauConstruction[i] || 0;
            let couleur = niveau > 0 ? '#111' : '#ccc';
            html += `<tr>
                <td style="padding: 2px; color: ${couleur};">${CONSTRUCTION[i]}:</td>
                <td style="padding: 2px; text-align: right; font-weight: bold; color: ${couleur};">Niveau ${niveau}</td>
            </tr>`;
        }
        html += '</table>';
        return html;
    }

    /**
     * Génère la liste des recherches avec leurs niveaux
     */
    genererListeRecherches() {
        let html = '<table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
        for (let i = 0; i < RECHERCHE.length; i++) {
            let niveau = monProfil.niveauRecherche[i] || 0;
            let couleur = niveau > 0 ? '#111' : '#ccc';
            html += `<tr>
                <td style="padding: 2px; color: ${couleur};">${RECHERCHE[i]}:</td>
                <td style="padding: 2px; text-align: right; font-weight: bold; color: ${couleur};">Niveau ${niveau}</td>
            </tr>`;
        }
        html += '</table>';
        return html;
    }

    /**
     * Génère le tableau de ressources complet avec jauges
     */
    genererTableauRessourcesComplet() {
        let prodTerrain = this.calculerProductionTerrainChasse();
        let prodChampignon = this.calculerProductionChampignonniere();
        let capaciteNourriture = this.calculerCapaciteNourriture();
        let capaciteMateriaux = this.calculerCapaciteMateriaux();
        let pourcentageNourriture = this.getPourcentageNourriture();
        let pourcentageMateriaux = this.getPourcentageMateriaux();

        // Calculer la production totale (terrain + champignonnière)
        let productionTotaleNourriture = prodTerrain.nourriture + prodChampignon;
        let productionTotaleMateriaux = prodTerrain.materiaux;

        // Calculer la consommation et le solde net
        let consommationTroupes = this.calculerConsommationTroupes();
        let soldeNourriture = productionTotaleNourriture - consommationTroupes;

        // Calculer les jours restants avant que l'entrepôt soit plein
        let resteN = productionTotaleNourriture > 0 ? Math.round((capaciteNourriture - Utils.nourriture) / productionTotaleNourriture) : 0;
        let resteM = productionTotaleMateriaux > 0 ? Math.round((capaciteMateriaux - Utils.materiaux) / productionTotaleMateriaux) : 0;

        // Générer les jauges de stock
        let jaugeN = this.genererJaugeStock(Utils.nourriture, capaciteNourriture, pourcentageNourriture, '#ad572f');
        let jaugeM = this.genererJaugeStock(Utils.materiaux, capaciteMateriaux, pourcentageMateriaux, '#ad572f');

        // Récupérer les couleurs du thème fourmizzz
        let couleurN = "rgb(15, 126, 41)"
        let couleurM = "rgb(155, 8, 8)"
        return `
        <table style="width: 100%; background: #d7c384; border-radius: 10px 10px 0px 0px; border-collapse: collapse; margin-bottom: 15px;">
            <thead>
                <tr style="font-weight: bold; font-size: 12px; border-bottom: solid #c9ad63 2px;">
                    <td style="width: 200px; padding: 8px;">Stock</td>
                    <td style="text-align: center; padding: 8px;"><img src="http://s4.fourmizzz.fr/images/icone/icone_pomme.png" height="18">${jaugeN}</td>
                    <td style="text-align: center; padding: 8px;"><img src="http://s4.fourmizzz.fr/images/icone/icone_bois.gif" height="18">${jaugeM}</td>
                </tr>
            </thead>
            <tbody>
                <tr style="font-weight: bold; font-size: 11px;">
                    <td style="text-align: right; padding: 4px;">Production quotidienne</td>
                    <td style="text-align: right; padding: 4px; color:${couleurN};">+${numeral(productionTotaleNourriture).format('0,0')}</td>
                    <td style="text-align: right; padding: 4px; color:${couleurM};">+${numeral(productionTotaleMateriaux).format('0,0')}</td>
                </tr>
                <tr style="font-weight: bold; font-size: 11px;">
                    <td style="text-align: right; padding: 4px;">Entrepôt plein dans...</td>
                    <td style="text-align: right; padding: 4px; color: ${resteN > 0 ? couleurN : '#dc3545'};">${resteN} jours</td>
                    <td style="text-align: right; padding: 4px; color: ${resteM > 0 ? couleurM : '#dc3545'};">${resteM} jours</td>
                </tr>
                <tr style="font-weight: bold; font-size: 11px;">
                    <td style="text-align: right; padding: 4px;">Ouvrières affectées</td>
                    <td style="text-align: right; padding: 4px;">
                        <span style="color: ${couleurN}; font-weight: bold;">${numeral(prodTerrain.ouvrieresNourriture).format('0,0')}</span>
                    </td>
                    <td style="text-align: right; padding: 4px;">
                        <span style="color: ${couleurM}; font-weight: bold;">${numeral(prodTerrain.ouvrieresMateriaux).format('0,0')}</span>
                    </td>
                </tr>
                <tr style="font-weight: bold; font-size: 11px;">
                    <td style="text-align: right; padding: 4px;">Production terrain</td>
                    <td style="text-align: right; padding: 4px; color: ${couleurN}">+${numeral(prodTerrain.nourriture).format('0,0')}</td>
                    <td style="text-align: right; padding: 4px; color: ${couleurM}">+${numeral(prodTerrain.materiaux).format('0,0')}</td>
                </tr>
                <tr style="font-weight: bold; font-size: 11px;">
                    <td style="text-align: right; padding: 4px;">Champignonnière</td>
                    <td style="text-align: right; padding: 4px; color: ${couleurN}">+${numeral(prodChampignon).format('0,0')}</td>
                    <td style="text-align: right; padding: 4px;">-</td>
                </tr>
                <tr style="font-weight: bold; font-size: 11px;">
                    <td style="text-align: right; padding: 4px;">Consommation armée</td>
                    <td style="text-align: right; padding: 4px; color:#dc3545;">-${numeral(consommationTroupes).format('0,0')}</td>
                    <td style="text-align: right; padding: 4px;">-</td>
                </tr>
                <tr style="font-weight: bold; font-size: 12px; border-top: 2px solid #c9ad63;">
                    <td style="text-align: right; padding: 4px; font-weight: bold;">Solde net</td>
                    <td style="text-align: right; padding: 4px; font-weight: bold; color: ${soldeNourriture >= 0 ? couleurN : '#dc3545'};">
                        ${soldeNourriture >= 0 ? '+' : ''}${numeral(soldeNourriture).format('0,0')}
                    </td>
                    <td style="text-align: right; padding: 4px; font-weight: bold; color: ${couleurM}">
                        +${numeral(productionTotaleMateriaux).format('0,0')}
                    </td>
                </tr>
            </tbody>
        </table>`;
    }

    /**
     * Génère une jauge de stock au style fourmizzz
     */
    genererJaugeStock(stock, capacite, pourcentage, couleur) {
        return `
        <a href="http://${Utils.serveur.toLowerCase()}.fourmizzz.fr/Ressources.php" target="_blank" style="text-decoration: none; color: inherit;">
            <span style="color: ${couleur}; font-weight: bold;">${numeral(stock).format('0,0')}</span>
            <div style="width: 95%; height: 15px; border: solid black 1px; display: block; background: #676b51; text-align: left; margin: 2px 0;">
                <div style="background: ${couleur}; position: relative; left: 0px; top: 0px; height: 100%; border-right: solid black 1px; text-align: center; color: white; width: ${Math.min(pourcentage, 100)}%; font-size: 10px; line-height: 15px;">
                    ${Math.round(pourcentage)}%
                </div>
            </div>
            <span style="font-size: 10px; color: #666;">Capacité : ${numeral(capacite).format('0,0')}</span>
        </a>`;
    }

    // ========================================
    // MÉTHODES DE GÉNÉRATION DE REINE
    // ========================================

    /**
     * Génère le bloc d'informations sur la reine
     */
    genererBlocReine() {
        if (!this.donneesReine || Object.keys(this.donneesReine).length === 0) {
            return this.genererBlocReineVide();
        }

        // Récupérer les couleurs du thème fourmizzz
        let couleurTexte = monProfil.parametre["couleurTexte"] ? monProfil.parametre["couleurTexte"].valeur : "#000000";
        let couleurFond = monProfil.parametre["couleur1"] ? monProfil.parametre["couleur1"].valeur : "#f8f9fa";
        let couleurBordure = monProfil.parametre["couleur3"] ? monProfil.parametre["couleur3"].valeur : "#dee2e6";
        let couleurAlternance = monProfil.parametre["couleur2"] ? monProfil.parametre["couleur2"].valeur : "#e9ecef";

        let html = `
        <div style="font-size: 12px;">       
            <div style="max-height: 200px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <thead>
                        <tr style="background: ${couleurFond}; border-bottom: 2px solid #dee2e6;">
                            <th style="padding: 4px; text-align: left;">Unité</th>
                            <th style="padding: 4px; text-align: center;">Garnison</th>
                            <th style="padding: 4px; text-align: center;">Temps restant</th>
                        </tr>
                    </thead>
                    <tbody>`;

        $.each(this.donneesReine, (index, ligne) => {
            if (ligne.unites && ligne.unites.trim() !== '') {
                html += `
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 4px; font-weight: bold;">${ligne.unites}</td>
                    <td style="padding: 4px; text-align: center;">${ligne.garnison}</td>
                    <td style="padding: 4px; text-align: center; color: #dc3545; font-size: 10px;">
                        ${ligne.temps_restant}
                    </td>
                </tr>`;
            }
        });

        html += `
                    </tbody>
                </table>
            </div>
        </div>`;

        return html;
    }

    /**
     * Génère le bloc reine vide quand aucune donnée n'est disponible
     */
    genererBlocReineVide() {
        return `
        <div style="font-size: 12px;">
            <div style="margin-bottom: 10px;">
                <button onclick="window.open('http://${Utils.serveur.toLowerCase()}.fourmizzz.fr/Reine.php', '_blank')" 
                        style="width: 100%; padding: 8px; background: #9C27B0; color: white; border: none; border-radius: 4px; font-size: 14px; font-weight: bold; cursor: pointer;">
                    👑 Aller à la Reine
                </button>
            </div>
            
            <div style="background: #fff3cd; padding: 8px; border-radius: 4px; border-left: 3px solid #ffc107;">
                <small style="color: #856404;">
                    <strong>⚠️ Aucune donnée :</strong> Aucune ponte en cours détectée.<br/>
                    Rendez-vous sur la page <a href="http://${Utils.serveur.toLowerCase()}.fourmizzz.fr/Reine.php" target="_blank">Reine</a> 
                    pour lancer une ponte, puis revenez sur cette page.
                </small>
            </div>
        </div>`;
    }

    // ========================================
    // MÉTHODES DE CALCUL DE PRODUCTION
    // ========================================

    /**
     * Calcule la production quotidienne de la champignonnière
     */
    calculerProductionChampignonniere() {
        // Utiliser les données réelles si disponibles
        if (this.donneesRessources && this.donneesRessources.productionChampignonniere > 0) {
            return this.donneesRessources.productionChampignonniere;
        }

        // Fallback: calcul basé sur le niveau de construction
        let niveau = monProfil.niveauConstruction[0] || 0;
        if (niveau === 0) return 0;
        // Formule basée sur les coûts de construction avec facteur 1.85
        return Math.floor(COUT_CONSTUCTION[0] * Math.pow(1.85, niveau) * 0.1); // 10% du coût de construction par jour
    }

    /**
     * Calcule la production quotidienne du terrain de chasse
     */
    calculerProductionTerrainChasse() {
        // Utiliser les données réelles si disponibles (priorité aux données locales)
        if (this.donneesRessources && (this.donneesRessources.productionRecolteNourriture > 0 || this.donneesRessources.productionRecolteMateriaux > 0)) {
            return {
                nourriture: this.donneesRessources.productionRecolteNourriture,
                materiaux: this.donneesRessources.productionRecolteMateriaux,
                ouvrieresNourriture: this.donneesRessources.ouvrieresNourriture || 0,
                ouvrieresMateriaux: this.donneesRessources.ouvrieresMateriaux || 0
            };
        }

        // Fallback: calcul basé sur le nombre d'ouvrières depuis Ressources.php
        if (this.donneesRessources && (this.donneesRessources.ouvrieresNourriture > 0 || this.donneesRessources.ouvrieresMateriaux > 0)) {
            // Calculer la production basée sur le nombre d'ouvrières affectées
            // Formule approximative : ~2.5 nourriture et ~1.8 matériaux par ouvrière par jour
            let prodNourriture = Math.floor(this.donneesRessources.ouvrieresNourriture * 2.5);
            let prodMateriaux = Math.floor(this.donneesRessources.ouvrieresMateriaux * 1.8);

            return {
                nourriture: prodNourriture,
                materiaux: prodMateriaux,
                ouvrieresNourriture: this.donneesRessources.ouvrieresNourriture,
                ouvrieresMateriaux: this.donneesRessources.ouvrieresMateriaux
            };
        }

        // Fallback final: calcul basé sur le terrain disponible
        let terrain = Utils.terrain;
        if (terrain === 0) return { nourriture: 0, materiaux: 0, ouvrieresNourriture: 0, ouvrieresMateriaux: 0 };

        // Production basée sur le terrain disponible
        // Formule approximative basée sur les mécaniques du jeu
        let prodNourriture = Math.floor(terrain * 2.5); // ~2.5 nourriture par cm² par jour
        let prodMateriaux = Math.floor(terrain * 1.8);  // ~1.8 matériaux par cm² par jour

        return {
            nourriture: prodNourriture,
            materiaux: prodMateriaux,
            ouvrieresNourriture: 0, // Inconnu sans données réelles
            ouvrieresMateriaux: 0   // Inconnu sans données réelles
        };
    }

    /**
     * Calcule la consommation quotidienne des troupes
     */
    calculerConsommationTroupes() {
        // Utiliser les données réelles si disponibles
        if (this.donneesRessources && this.donneesRessources.consommationTroupes > 0) {
            return this.donneesRessources.consommationTroupes;
        }

        // Fallback: estimation basée sur une armée moyenne
        let estimation = 0;

        // Consommation approximative par type d'unité (5% du coût par jour)
        // Cette estimation peut être améliorée en accédant à l'armée réelle
        let consommationParUnite = [0, 0.8, 1.0, 1.3, 1.5, 1.8, 3.5, 5.0, 1.5, 1.7, 2.2, 5.0, 7.5, 4.0, 4.5];

        // Estimation basée sur le niveau de construction (plus de constructions = plus de troupes)
        let niveauTotal = 0;
        for (let i = 0; i < monProfil.niveauConstruction.length; i++) {
            niveauTotal += monProfil.niveauConstruction[i] || 0;
        }

        // Estimation: 1% du niveau total de construction en troupes
        let troupesEstimees = Math.floor(niveauTotal * 0.01);

        // Consommation moyenne par troupe
        let consoMoyenne = 2.0; // Nourriture par jour par troupe

        return Math.floor(troupesEstimees * consoMoyenne);
    }

    // ========================================
    // MÉTHODES DE CALCUL DE CAPACITÉS
    // ========================================

    /**
     * Calcule la capacité totale de stockage
     */
    calculerCapaciteStockage() {
        let capNourriture = this.calculerCapaciteNourriture();
        let capMateriaux = this.calculerCapaciteMateriaux();
        return `🍎 ${numeral(capNourriture).format('0,0')} / 🌳 ${numeral(capMateriaux).format('0,0')}`;
    }

    /**
     * Calcule la capacité de stockage pour la nourriture
     */
    calculerCapaciteNourriture() {
        // Calculer la capacité basée sur le stock actuel et le pourcentage
        if (this.donneesRessources && this.donneesRessources.pourcentageNourriture > 0 && this.donneesRessources.stockNourriture > 0) {
            // Si le pourcentage est 75%, alors capacité = stock / 0.75
            return Math.round(this.donneesRessources.stockNourriture / (this.donneesRessources.pourcentageNourriture / 100));
        }

        // Fallback: calcul basé sur le niveau de construction
        let niveau = monProfil.niveauConstruction[1] || 0;
        return niveau * 10000;
    }

    /**
     * Calcule la capacité de stockage pour les matériaux
     */
    calculerCapaciteMateriaux() {
        // Calculer la capacité basée sur le stock actuel et le pourcentage
        if (this.donneesRessources && this.donneesRessources.pourcentageMateriaux > 0 && this.donneesRessources.stockMateriaux > 0) {
            // Si le pourcentage est 40%, alors capacité = stock / 0.40
            return Math.round(this.donneesRessources.stockMateriaux / (this.donneesRessources.pourcentageMateriaux / 100));
        }

        // Fallback: calcul basé sur le niveau de construction
        let niveau = monProfil.niveauConstruction[2] || 0;
        return niveau * 10000;
    }

    /**
     * Récupère le pourcentage de remplissage de la nourriture
     */
    getPourcentageNourriture() {
        // Utiliser les données réelles si disponibles
        if (this.donneesRessources && this.donneesRessources.pourcentageNourriture > 0) {
            return this.donneesRessources.pourcentageNourriture;
        }

        // Fallback: calcul basé sur les valeurs actuelles
        let capacite = this.calculerCapaciteNourriture();
        return capacite > 0 ? Math.min(100, (Utils.nourriture / capacite) * 100) : 0;
    }

    /**
     * Récupère le pourcentage de remplissage des matériaux
     */
    getPourcentageMateriaux() {
        // Utiliser les données réelles si disponibles
        if (this.donneesRessources && this.donneesRessources.pourcentageMateriaux > 0) {
            return this.donneesRessources.pourcentageMateriaux;
        }

        // Fallback: calcul basé sur les valeurs actuelles
        let capacite = this.calculerCapaciteMateriaux();
        return capacite > 0 ? Math.min(100, (Utils.materiaux / capacite) * 100) : 0;
    }

    // ========================================
    // MÉTHODES DE CALCUL DE STATISTIQUES
    // ========================================

    /**
     * Calcule l'efficacité des ouvrières
     */
    calculerEfficaciteOuvrieres() {
        if (Utils.terrain === 0) return 'N/A';
        let efficacite = (Utils.ouvrieres / Utils.terrain).toFixed(2);
        return `${efficacite} ouvrières/cm²`;
    }

    /**
     * Calcule le niveau technologique global
     */
    calculerNiveauTechnologique() {
        let total = 0;
        for (let i = 0; i < monProfil.niveauRecherche.length; i++) {
            total += monProfil.niveauRecherche[i] || 0;
        }
        return total;
    }

    /**
     * Calcule le niveau de construction global
     */
    calculerNiveauConstruction() {
        let total = 0;
        for (let i = 0; i < monProfil.niveauConstruction.length; i++) {
            total += monProfil.niveauConstruction[i] || 0;
        }
        return total;
    }
}