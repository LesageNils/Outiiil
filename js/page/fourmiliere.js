class PageFourmiliere {
    constructor() {
        this.donneesRessources = null;
        this.donneesReine = null;
        this.donneesConstruction = null;
        this.donneesRecherche = null;
        this.donneesJoueur = null;
    }

    // ========================================
    // MÉTHODES PRINCIPALES D'EXÉCUTION
    // ========================================

    executer() {
        $("center").empty();
        $("center").append("<h1>Synthèse de la fourmiliere</h1>");

        // Créer le système d'onglets
        this.creerOnglets();

        this.afficherIndicateurChargement();

        $.when(
            this.chargerDonneesRessources(),
            this.chargerDonneesReine(),
            this.chargerDonneesConstruction(),
            this.chargerDonneesRecherche(),
            this.chargerDonneesJoueur()
        ).then(() => {
            // Sauvegarde automatique des données récupérées
            this.sauvegarderToutesDonnees();
            this.afficherInfosJoueur();
            console.log("donneesRessources", this.donneesRessources);
            console.log("donneesReine", this.donneesReine);
            console.log("donneesConstruction", this.donneesConstruction);
            console.log("donneesRecherche", this.donneesRecherche);
            console.log("donneesJoueur", this.donneesJoueur);
        }).catch((error) => {
            console.warn("Impossible de charger certaines données:", error);
            // Sauvegarde même en cas d'erreur partielle
            this.sauvegarderToutesDonnees();
            this.afficherInfosJoueur();
        });

        return this;
    }

    // ========================================
    // MÉTHODES D'AFFICHAGE
    // ========================================

    /**
     * Crée le système d'onglets pour la page fourmilière
     */
    creerOnglets() {
        const couleurs = this.getCouleursTheme();
        
        const htmlOnglets = `
            <div style="margin: 10px 0; border-bottom: 2px solid ${couleurs.bordure};">
                <div style="display: flex; gap: 0;">
                    <button id="onglet-synthese" class="onglet-btn active" style="
                        background: ${couleurs.fond};
                        border: 1px solid ${couleurs.bordure};
                        border-bottom: none;
                        padding: 10px 20px;
                        cursor: pointer;
                        font-weight: bold;
                        color: ${couleurs.texte};
                        border-radius: 5px 5px 0 0;
                    ">📊 Synthèse</button>
                    <button id="onglet-historique" class="onglet-btn" style="
                        background: ${couleurs.alternance};
                        border: 1px solid ${couleurs.bordure};
                        border-bottom: none;
                        padding: 10px 20px;
                        cursor: pointer;
                        font-weight: bold;
                        color: ${couleurs.texte};
                        border-radius: 5px 5px 0 0;
                    ">📈 Historique TDC</button>
                </div>
            </div>
            <div id="contenu-onglets" style="
                background: ${couleurs.fond};
                border: 1px solid ${couleurs.bordure};
                border-top: none;
                padding: 15px;
                min-height: 400px;
            ">
                <div id="contenu-synthese"></div>
                <div id="contenu-historique" style="display: none;"></div>
            </div>
        `;
        
        $("center").append(htmlOnglets);
        
        // Gestion des clics sur les onglets
        $("#onglet-synthese").click(() => this.afficherOnglet('synthese'));
        $("#onglet-historique").click(() => this.afficherOnglet('historique'));
    }

    /**
     * Affiche l'onglet sélectionné
     */
    afficherOnglet(onglet) {
        const couleurs = this.getCouleursTheme();
        
        // Masquer tous les contenus
        $("#contenu-synthese, #contenu-historique").hide();
        
        // Désactiver tous les onglets
        $(".onglet-btn").css({
            background: couleurs.alternance,
            borderBottom: "1px solid " + couleurs.bordure
        });
        
        if (onglet === 'synthese') {
            $("#contenu-synthese").show();
            $("#onglet-synthese").css({
                background: couleurs.fond,
                borderBottom: "none"
            });
        } else if (onglet === 'historique') {
            $("#contenu-historique").show();
            $("#onglet-historique").css({
                background: couleurs.fond,
                borderBottom: "none"
            });
            this.afficherHistoriqueTDC();
        }
    }

    /**
     * Affiche l'historique TDC dans l'onglet dédié
     */
    afficherHistoriqueTDC() {
        if (typeof Historique !== 'undefined') {
            // Utiliser l'instance globale d'historique
            const historique = window.historiqueGlobal || new Historique();
            
            // Charger les données existantes dans _tabHistoTdc pour l'affichage
            const donneesExistantes = historique.chargerHistorique();
            historique._tabHistoTdc = { ...historique._tabHistoTdc, ...donneesExistantes };
            
            const htmlHistorique = historique.genererHTML();
            $("#contenu-historique").html(htmlHistorique);
            
            // Récupérer les alliances manquantes
            historique._recupererAlliances();
            
            // Initialiser les filtres après insertion du HTML
            setTimeout(() => {
                historique.initialiserFiltres();
            }, 100);
        } else {
            $("#contenu-historique").html(`
                <div style="text-align: center; padding: 20px; color: #6c757d;">
                    <p>Chargement de l'historique TDC...</p>
                    <button onclick="location.reload()" style="
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Actualiser</button>
                </div>
            `);
        }
    }

    /**
     * Récupère les couleurs du thème fourmizzz
     */
    getCouleursTheme() {
        return {
            texte: monProfil.parametre["couleurTexte"]?.valeur || "#000000",
            fond: monProfil.parametre["couleur1"]?.valeur || "#f8f9fa",
            bordure: monProfil.parametre["couleur3"]?.valeur || "#dee2e6",
            alternance: monProfil.parametre["couleur2"]?.valeur || "#e9ecef",
            titre: "#bd8d46"
        };
    }

    /**
     * Génère un bouton "Ouvrir" standardisé
     */
    genererBoutonOuvrir(url, couleur = "#bd8d46") {
        return `
        <button onclick="window.open('${url}', '_blank')" 
                style="margin-left: auto; background: ${couleur}; color: white; border: none; padding: 4px 8px; border-radius: 3px; font-size: 11px; cursor: pointer; transition: all 0.3s ease;"
                onmouseover="this.style.background='#a67c3a'; this.style.transform='scale(1.05)'"
                onmouseout="this.style.background='${couleur}'; this.style.transform='scale(1)'">
            Ouvrir
        </button>`;
    }

    /**
     * Affiche un indicateur de chargement
     */
    afficherIndicateurChargement() {
        const couleurs = this.getCouleursTheme();

        const html = `
        <div id="indicateur-chargement" style="
            background: ${couleurs.fond};
            border: 2px solid ${couleurs.bordure};
            border-radius: 8px;
            padding: 15px;
            margin: 15px auto;
            max-width: 800px;
            text-align: center;
            font-family: inherit;
            color: ${couleurs.texte};
        ">
            <div style="
                width: 30px;
                height: 30px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #2196F3;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 10px;
            "></div>
            <span style="color: #2196F3; font-weight: bold; font-size: 16px;">
                Chargement des données de ressources...
            </span>
        </div>
        
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>`;

        $("center").append(html);
    }

    /**
     * Affiche le bloc principal avec toutes les informations
     */
    afficherInfosJoueur() {
        $("#indicateur-chargement").remove();
        const couleurs = this.getCouleursTheme();

        const html = `
        <div id="bloc-infos-joueur" style="
            background: ${couleurs.fond};
            border: 2px solid ${couleurs.bordure};
            border-radius: 8px;
            padding: 15px;
            margin: 15px auto;
            max-width: 800px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            font-family: inherit;
            color: ${couleurs.texte};
        ">
            <!-- Première ligne : Informations générales + Reine -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <!-- Informations générales -->
                <div class="section-info" style="
                    background: ${couleurs.alternance};
                    padding: 12px;
                    border-radius: 6px;
                ">
                    <h3 class="o_titre_cadre" style="background:${couleurs.titre};">
                        <div class='mini_icone_info'/> Informations Générales
                        ${this.genererBoutonOuvrir(`http://${Utils.serveur.toLowerCase()}.fourmizzz.fr/fourmiliere.php`)}
                    </h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 4px; font-weight: bold;">Pseudo:</td><td style="padding: 4px;">${monProfil.pseudo}</td></tr>
                        <tr><td style="padding: 4px; font-weight: bold;">ID:</td><td style="padding: 4px;">${monProfil.id}</td></tr>
                        <tr><td style="padding: 4px; font-weight: bold;">Position:</td><td style="padding: 4px;">(${monProfil.x}, ${monProfil.y})</td></tr>
                        <tr><td style="padding: 4px; font-weight: bold;">Alliance:</td><td style="padding: 4px;">${this.donneesJoueur?.alliance || Utils.alliance || 'Aucune'}</td></tr>
                        <tr><td style="padding: 4px; font-weight: bold;">État:</td><td style="padding: 4px;">${this.donneesJoueur?.etat || 'N/A'}</td></tr>
                        <tr><td style="padding: 4px; font-weight: bold;">Colonies:</td><td style="padding: 4px;">${this.donneesJoueur?.colonies || 'N/A'}</td></tr>
                        <tr><td style="padding: 4px; font-weight: bold;">Terrain:</td><td style="padding: 4px;">${this.donneesJoueur?.terrain || 'N/A'}</td></tr>
                        <tr><td style="padding: 4px; font-weight: bold;">Fourmilière:</td><td style="padding: 4px;">${this.donneesJoueur?.fourmilière || 'N/A'}</td></tr>
                        <tr><td style="padding: 4px; font-weight: bold;">Technologie:</td><td style="padding: 4px;">${this.donneesJoueur?.technologie || 'N/A'}</td></tr>
                        <tr><td style="padding: 4px; font-weight: bold;">Combat:</td><td style="padding: 4px;">${this.donneesJoueur?.combat || 'N/A'}</td></tr>
                        <tr><td style="padding: 4px; font-weight: bold;">Serveur:</td><td style="padding: 4px;">${Utils.serveur}</td></tr>
                        <tr><td style="padding: 4px; font-weight: bold;">Compte Plus:</td><td style="padding: 4px;"> ${Utils.comptePlus ? '✅ Actif' : '❌ Inactif'}</td></tr>
                    </table>
                </div>
                
                <!-- Reine -->
                <div class="section-info" style="
                    background: ${couleurs.alternance};
                    padding: 12px;
                    border-radius: 6px;
                ">
                    <h3 class="o_titre_cadre" style="background:${couleurs.titre};">
                        <div class='mini_icone_ponte'/> Reine
                        ${this.genererBoutonOuvrir(`http://${Utils.serveur.toLowerCase()}.fourmizzz.fr/Reine.php`)}
                    </h3>
                    ${this.genererBlocReine()}
                </div>
            </div>
            
            <!-- Deuxième ligne : Ressources -->
            <div style="margin-bottom: 15px;">
                <div class="section-info" style="
                    background: ${couleurs.alternance};
                    padding: 12px;
                    border-radius: 6px;
                ">
                    <h3 class="o_titre_cadre" style="background:${couleurs.titre};">
                        <div class='mini_icone_ressources'/> Ressources
                        ${this.genererBoutonOuvrir(`http://${Utils.serveur.toLowerCase()}.fourmizzz.fr/Ressources.php`)}
                    </h3>
                    <div style="margin-bottom: 20px;">
                        ${this.genererTableauRessourcesComplet()}
                    </div>
                </div>
            </div>
            
            <!-- Troisième ligne : Constructions + Recherches -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <!-- Constructions -->
                <div class="section-info" style="
                    background: ${couleurs.alternance};
                    padding: 12px;
                    border-radius: 6px;
                ">
                    <h3 class="o_titre_cadre" style="background:${couleurs.titre};">
                        <div class='mini_icone_construction'/> Constructions 
                        ${this.genererBoutonOuvrir(`http://${Utils.serveur.toLowerCase()}.fourmizzz.fr/construction.php`)}
                    </h3>
                    <div style="text-align: center; margin: 8px 0; font-size: 12px; font-weight: bold; color: ${couleurs.texte};">
                        Niveau global: ${this.calculerNiveauConstruction()}
                    </div>
                    <div>
                        ${this.genererListeConstructions()}
                    </div>
                </div>
                
                <!-- Recherches -->
                <div class="section-info" style="
                    background: ${couleurs.alternance};
                    padding: 12px;
                    border-radius: 6px;
                ">
                    <h3 class="o_titre_cadre" style="background:${couleurs.titre};">
                        <div class='mini_icone_recherche'/> Laboratoire
                        ${this.genererBoutonOuvrir(`http://${Utils.serveur.toLowerCase()}.fourmizzz.fr/laboratoire.php`)}
                    </h3>
                    <div style="text-align: center; margin: 8px 0; font-size: 12px; font-weight: bold; color: ${couleurs.texte};">
                        Niveau global: ${this.calculerNiveauTechnologique()}
                    </div>
                    <div>
                        ${this.genererListeRecherches()}
                    </div>
                </div>
            </div>
        </div>`;

        $("#contenu-synthese").html(html);
        this.afficherMessageDonnees();
    }

    /**
     * Affiche un message d'information sur les données utilisées
     */
    afficherMessageDonnees() {
        if (!this.donneesRessources || Object.keys(this.donneesRessources).length === 0) {
            this.afficherMessageEstimees();
            return;
        }

        const donneesReelles = this.getDonneesReelles();
        const message = `
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
            ✅ <strong>Données réelles</strong> - ${donneesReelles.join(", ")} récupérées depuis la page
        </div>`;

        $("center").append(message);
    }

    /**
     * Affiche le message pour les données estimées
     */
    afficherMessageEstimees() {
        const message = `
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
        </div>`;

        $("center").append(message);
    }

    /**
     * Récupère la liste des données réelles disponibles
     */
    getDonneesReelles() {
        const donneesReelles = [];

        if (this.donneesRessources?.productionChampignonniere > 0) donneesReelles.push("Champignonnière");
        if (this.donneesRessources?.productionRecolteNourriture > 0 || this.donneesRessources?.productionRecolteMateriaux > 0) donneesReelles.push("Production terrain");
        if (this.donneesRessources?.consommationTroupes > 0) donneesReelles.push("Consommation troupes");
        if (this.donneesRessources?.totalProductionNourriture > 0 || this.donneesRessources?.totalProductionMateriaux > 0) donneesReelles.push("Totaux production");
        if (this.donneesRessources?.ouvrieresNourriture > 0 || this.donneesRessources?.ouvrieresMateriaux > 0) donneesReelles.push("Ouvrières affectées");
        if (this.donneesReine && Object.keys(this.donneesReine).length > 0) donneesReelles.push("Ponte de la reine");
        if (this.donneesConstruction?.liste?.length > 0) donneesReelles.push("Constructions");
        if (this.donneesRecherche?.liste?.length > 0) donneesReelles.push("Recherches");
        if (this.donneesJoueur && Object.keys(this.donneesJoueur).length > 0) donneesReelles.push("Informations détaillées du joueur");

        return donneesReelles;
    }

    // ========================================
    // MÉTHODES DE RÉCUPÉRATION DE DONNÉES
    // ========================================

    /**
     * Charge les données de ressources depuis Ressources.php et analyse la production locale
     */
    chargerDonneesRessources() {
        const defer = $.Deferred();

        this.analyserProductionLocale();

        $.ajax({
            url: `http://${Utils.serveur.toLowerCase()}.fourmizzz.fr/Ressources.php`,
            type: 'GET',
            dataType: 'html',
            success: (page) => {
                try {
                    const recolteNourriture = $(page).find("#RecolteNourriture").val();
                    const recolteMateriaux = $(page).find("#RecolteMateriaux").val();

                    this.donneesRessources = {
                        ...this.donneesRessources,
                        ouvrieresNourriture: parseInt(recolteNourriture) || 0,
                        ouvrieresMateriaux: parseInt(recolteMateriaux) || 0
                    };

                    defer.resolve(this.donneesRessources);
                } catch (error) {
                    defer.reject(error);
                }
            },
            error: () => {
                defer.resolve(this.donneesRessources);
            }
        });

        return defer.promise();
    }

    /**
     * Charge les données de la reine depuis Reine.php
     */
    chargerDonneesReine() {
        const defer = $.Deferred();

        $.ajax({
            url: `http://${Utils.serveur.toLowerCase()}.fourmizzz.fr/Reine.php`,
            type: 'GET',
            dataType: 'html',
            success: (page) => {
                try {
                    this.donneesReine = {};
                    $(page).find('.tableau_leger tr').each((e, i) => {
                        if (e > 0) {
                            const ponte = {
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
            error: () => {
                this.donneesReine = {};
                defer.resolve(this.donneesReine);
            }
        });

        return defer.promise();
    }

    /**
     * Charge les données de construction depuis construction.php
     */
    chargerDonneesConstruction() {
        const defer = $.Deferred();

        $.ajax({
            url: `http://${Utils.serveur.toLowerCase()}.fourmizzz.fr/construction.php`,
            type: 'GET',
            dataType: 'html',
            success: (page) => {
                try {
                    this.donneesConstruction = {};

                    const encoursC = $(page).find("nav#menu").nextAll("strong").text();
                    this.donneesConstruction.encours = this.parserDateFin(encoursC, ' se termine dans : ');

                    const listeC = [];
                    $(page).find(".desciption_amelioration").each((e, i) => {
                        const titreC = $(i).find("H2").text();
                        const niveauC = parseInt($(i).find(".niveau_amelioration").text().split(" ")[1]);
                        const infosC = $(i).find(".pas_sur_telephone").find('br').get(0).nextSibling.nodeValue;

                        listeC[e] = { titre: titreC, niveau: niveauC, infos: infosC };
                    });
                    this.donneesConstruction.liste = listeC;

                    defer.resolve(this.donneesConstruction);
                } catch (error) {
                    defer.reject(error);
                }
            },
            error: () => {
                this.donneesConstruction = { encours: { encours: '', fin_encours: '' }, liste: [] };
                defer.resolve(this.donneesConstruction);
            }
        });

        return defer.promise();
    }

    /**
     * Charge les données de recherche depuis laboratoire.php
     */
    chargerDonneesRecherche() {
        const defer = $.Deferred();

        $.ajax({
            url: `http://${Utils.serveur.toLowerCase()}.fourmizzz.fr/laboratoire.php`,
            type: 'GET',
            dataType: 'html',
            success: (page) => {
                try {
                    this.donneesRecherche = {};

                    const encoursL = $(page).find("nav#menu").nextAll("strong").text();
                    this.donneesRecherche.encours = this.parserDateFin(encoursL, ' terminé dans: ');

                    const listeL = [];
                    $(page).find(".desciption_amelioration").each((e, i) => {
                        const titreL = $(i).find("H2").text();
                        const niveauL = parseInt($(i).find(".niveau_amelioration").text().split(" ")[1]);
                        const infosL = $(i).find(".pas_sur_telephone").find('br').get(0).nextSibling.nodeValue;

                        listeL[e] = { titre: titreL, niveau: niveauL, infos: infosL };
                    });
                    this.donneesRecherche.liste = listeL;

                    defer.resolve(this.donneesRecherche);
                } catch (error) {
                    defer.reject(error);
                }
            },
            error: () => {
                this.donneesRecherche = { encours: { encours: '', fin_encours: '' }, liste: [] };
                defer.resolve(this.donneesRecherche);
            }
        });

        return defer.promise();
    }

    /**
     * Parse la date de fin d'une activité en cours
     */
    parserDateFin(texte, separateur) {
        if (!texte) {
            return { encours: '', fin_encours: '' };
        }

        const titre = texte.split(separateur)[0].replace("- ", "");
        const tab_reste = texte.split(separateur)[1]?.split('reste')[0]?.split(' ') || [];

        let jour = "", heure = "", minute = "", seconde = "";
        tab_reste.forEach((item) => {
            if (item.includes("J")) jour = item.split('J')[0];
            if (item.includes("H")) heure = item.split('H')[0];
            if (item.includes("m")) minute = item.split('m')[0];
            if (item.includes("s")) seconde = item.split('s')[0];
        });

        const date_fin = new Date();
        if (jour) date_fin.setDate(date_fin.getDate() + parseInt(jour));
        if (heure) date_fin.setHours(date_fin.getHours() + parseInt(heure));
        if (minute) date_fin.setMinutes(date_fin.getMinutes() + parseInt(minute));
        if (seconde) date_fin.setSeconds(date_fin.getSeconds() + parseInt(seconde));

        return {
            encours: titre,
            fin_encours: date_fin.toLocaleString('fr-FR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    }

    /**
     * Charge les données détaillées du joueur depuis Membre.php
     */
    chargerDonneesJoueur() {
        const defer = $.Deferred();
        const tab_cles = ['Alliance', 'Etat', 'Nombre de Colonie', 'Localisation', 'Terrain', 'Fourmilière', 'Technologie', 'Combat'];

        $.ajax({
            url: `http://${Utils.serveur.toLowerCase()}.fourmizzz.fr/Membre.php?Pseudo=${monProfil.pseudo}`,
            type: 'GET',
            dataType: 'html',
            success: (response) => {
                try {
                    const tab_joueur = {};
                    $(response).find(".boite_membre table tr").each(function (i, ligne) {
                        const cle = $(ligne).find("td").eq(0).text().replace(":", "").trim();
                        const valeur = $(ligne).find("td").eq(1).text();

                        if (tab_cles.includes(cle)) {
                            switch (cle) {
                                case "Localisation":
                                    const x = valeur.split(" et ")[0].split("=")[1];
                                    const y = valeur.split(" et ")[1].split("=")[1];
                                    tab_joueur['x'] = x;
                                    tab_joueur['y'] = y;
                                    break;
                                case "Nombre de Colonie":
                                    tab_joueur['colonies'] = valeur;
                                    break;

                                default:
                                    tab_joueur[cle.toLowerCase()] = valeur;
                                    break;
                            }

                        }
                    });

                    this.donneesJoueur = tab_joueur;
                    defer.resolve(this.donneesJoueur);
                } catch (error) {
                    console.warn("Erreur lors du parsing des données du joueur:", error);
                    this.donneesJoueur = {};
                    defer.resolve(this.donneesJoueur);
                }
            },
            error: () => {
                console.warn("Impossible de charger les données du joueur");
                this.donneesJoueur = {};
                defer.resolve(this.donneesJoueur);
            }
        });

        return defer.promise();
    }

    /**
     * Analyse la production locale depuis la page fourmiliere.php
     */
    analyserProductionLocale() {
        try {
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
                const tableau = $("#tableau_boite_info");
                if (tableau.length > 0) {
                    this.analyserTableauDirect();
                    return;
                }
            }

            if (!tableauTrouve || !chaine) {
                this.donneesRessources = {};
                return;
            }

            // Chercher le tableau tooltip_conso dans le contenu du tooltip
            const str0 = '<table id=\\"tooltip_conso\\"';
            const str1 = '</table>';
            const i0 = chaine.indexOf(str0);
            const i1 = chaine.indexOf(str1, i0) + str1.length;

            if (i0 === -1 || i1 === -1) {
                this.donneesRessources = {};
                return;
            }

            // Extraire et parser le contenu du tableau
            const tableauHtml = chaine.substring(i0, i1).replace(/\\"/g, '"');
            const $temp = $('<div>').html(tableauHtml);
            const $tableau = $temp.find('table');

            // Récupérer les données
            const stockN = $("#tableau_boite_info").find(".texte_ligne_boite_info").eq(1).text();
            const stockM = $("#tableau_boite_info").find(".texte_ligne_boite_info").eq(2).text();
            const stockNClean = stockN.replace(/[\s,]/g, '');
            const stockMClean = stockM.replace(/[\s,]/g, '');

            const pourcentN = $("#tableau_boite_info").find(".jauge_nourriture").attr("style");
            const pourcentM = $("#tableau_boite_info").find(".jauge_materiaux").attr("style");

            const totalN = $tableau.find("tr").eq(1).find("td").eq(1).text().replace(/[^\d]/g, '');
            const totalM = $tableau.find("tr").eq(1).find("td").eq(2).text().replace(/[^\d]/g, '');
            const recolteN = $tableau.find("tr").eq(2).find("td").eq(1).text().replace(/[^\d]/g, '');
            const recolteM = $tableau.find("tr").eq(2).find("td").eq(2).text().replace(/[^\d]/g, '');
            const prodchampi = $tableau.find("tr").eq(3).find("td").eq(1).text().replace(/[^\d]/g, '');
            const consoarmee = $tableau.find("tr").eq(4).find("td").eq(1).text().replace(/[^\d]/g, '');
            const nbOuvri = $('#nb_ouvrieres').text();

            this.donneesRessources = {
                stockNourriture: parseInt(stockNClean) || 0,
                stockMateriaux: parseInt(stockMClean) || 0,
                pourcentageNourriture: parseFloat(pourcentN?.replace("width:", "").replace(";", "").replace("%", "") || 0) || 0,
                pourcentageMateriaux: parseFloat(pourcentM?.replace("width:", "").replace(";", "").replace("%", "") || 0) || 0,
                totalProductionNourriture: parseInt(totalN) || 0,
                totalProductionMateriaux: parseInt(totalM) || 0,
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
            const stockN = $("#tableau_boite_info").find(".texte_ligne_boite_info").eq(1).text();
            const stockM = $("#tableau_boite_info").find(".texte_ligne_boite_info").eq(2).text();
            const stockNClean = stockN.replace(/[\s,]/g, '');
            const stockMClean = stockM.replace(/[\s,]/g, '');

            const pourcentN = $("#tableau_boite_info").find(".jauge_nourriture").attr("style");
            const pourcentM = $("#tableau_boite_info").find(".jauge_materiaux").attr("style");

            this.donneesRessources = {
                stockNourriture: parseInt(stockNClean) || 0,
                stockMateriaux: parseInt(stockMClean) || 0,
                pourcentageNourriture: parseFloat(pourcentN?.replace("width:", "").replace(";", "").replace("%", "") || 0) || 0,
                pourcentageMateriaux: parseFloat(pourcentM?.replace("width:", "").replace(";", "").replace("%", "") || 0) || 0,
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
        return this.genererListeActivites(this.donneesConstruction, CONSTRUCTION, monProfil.niveauConstruction);
    }

    /**
     * Génère la liste des recherches avec leurs niveaux
     */
    genererListeRecherches() {
        return this.genererListeActivites(this.donneesRecherche, RECHERCHE, monProfil.niveauRecherche);
    }

    /**
     * Génère une liste d'activités (constructions ou recherches)
     */
    genererListeActivites(donnees, tableauFallback, niveauxFallback) {
        let html = `<table style="width: 100%; border-collapse: collapse; font-size: 12px;"><tbody>`;

        if (donnees?.liste?.length > 0) {
            $.each(donnees.liste, (index, ligne) => {
                if (ligne.titre && ligne.titre.trim() !== '') {
                    const enCours = donnees.encours?.encours && ligne.titre.includes(donnees.encours.encours);
                    const jaugeNiveau = this.genererJaugeNiveau(ligne.niveau);
                    const couleurTexte = enCours ? 'red' : (ligne.niveau > 0 ? 'black' : 'grey');
                    const poidsPolice = enCours ? 'bold' : (ligne.niveau > 0 ? 'bold' : 'normal');
                    const infos = enCours ?
                        `---> Niveau ${ligne.niveau + 1} terminé le ${donnees.encours.fin_encours}` :
                        ligne.infos || `Niveau actuel: ${ligne.niveau}`;

                    html += `
                    <tr style="color: ${couleurTexte}; font-weight: ${poidsPolice}; font-size: 12px;">
                        <td colspan="3" style="padding: 8px; border-bottom: 1px solid #dee2e6;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                                <div style="flex: 1; font-weight: bold;">${ligne.titre}</div>
                                <div style="width: 100px;">${jaugeNiveau}</div>
                            </div>
                            <div style="font-size: ${enCours ? '12px' : '10px'}; font-weight: ${enCours ? 'bold' : 'normal'}; color: ${enCours ? 'red' : 'grey'}; padding-left: 4px;">
                                ${infos}
                            </div>
                        </td>
                    </tr>`;
                }
            });
        } else {
            // Fallback: utiliser les données locales
            for (let i = 0; i < tableauFallback.length; i++) {
                const niveau = niveauxFallback[i] || 0;
                const titre = tableauFallback[i];
                const infos = `Niveau actuel: ${niveau}`;
                const jaugeNiveau = this.genererJaugeNiveau(niveau);
                const couleurTexte = niveau > 0 ? 'black' : 'grey';
                const poidsPolice = niveau > 0 ? 'bold' : 'normal';

                html += `
                <tr style="color: ${couleurTexte}; font-weight: ${poidsPolice}; font-size: 12px;">
                    <td colspan="3" style="padding: 8px; border-bottom: 1px solid #dee2e6;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                            <div style="flex: 1; font-weight: bold;">${titre}</div>
                            <div style="width: 100px;">${jaugeNiveau}</div>
                        </div>
                        <div style="font-size: 10px; font-weight: normal; color: grey; padding-left: 4px;">
                            ${infos}
                        </div>
                    </td>
                </tr>`;
            }
        }

        html += `</tbody></table>`;
        return html;
    }

    /**
     * Génère le tableau de ressources complet avec jauges
     */
    genererTableauRessourcesComplet() {
        const prodTerrain = this.calculerProductionTerrainChasse();
        const prodChampignon = this.calculerProductionChampignonniere();
        const capaciteNourriture = this.calculerCapaciteNourriture();
        const capaciteMateriaux = this.calculerCapaciteMateriaux();
        const pourcentageNourriture = this.getPourcentageNourriture();
        const pourcentageMateriaux = this.getPourcentageMateriaux();

        const productionTotaleNourriture = prodTerrain.nourriture + prodChampignon;
        const productionTotaleMateriaux = prodTerrain.materiaux;
        const consommationTroupes = this.calculerConsommationTroupes();
        const soldeNourriture = productionTotaleNourriture - consommationTroupes;

        const resteN = productionTotaleNourriture > 0 ? Math.round((capaciteNourriture - Utils.nourriture) / productionTotaleNourriture) : 0;
        const resteM = productionTotaleMateriaux > 0 ? Math.round((capaciteMateriaux - Utils.materiaux) / productionTotaleMateriaux) : 0;

        const jaugeN = this.genererJaugeStock(Utils.nourriture, capaciteNourriture, pourcentageNourriture, '#ad572f');
        const jaugeM = this.genererJaugeStock(Utils.materiaux, capaciteMateriaux, pourcentageMateriaux, '#ad572f');

        const couleurN = "rgb(15, 126, 41)";
        const couleurM = "rgb(155, 8, 8)";

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

    /**
     * Génère une jauge de niveau au style fourmizzz
     */
    genererJaugeNiveau(niveau) {
        const pourcentage = Math.min((niveau / 100) * 100, 100);

        return `
        <div style="width: 95%; height: 15px; border: solid black 1px; display: block; background: #676b51; text-align: left;">
            <div style="background: #ad572f; position: relative; left: 0px; top: 0px; height: 100%; border-right: solid black 1px; text-align: center; color: white; width: ${pourcentage}%; font-size: 10px; line-height: 15px;">
                ${niveau}
            </div>
        </div>`;
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

        const couleurs = this.getCouleursTheme();
        let html = `
        <div style="font-size: 12px;">       
            <div style="max-height: 200px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <thead>
                        <tr style="background: ${couleurs.fond}; border-bottom: 2px solid #dee2e6;">
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
                    <td style="padding: 4px; text-align: center; font-size: 10px;">
                        ${ligne.temps_restant}
                    </td>
                </tr>`;
            }
        });

        html += `</tbody></table></div></div>`;
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
        if (this.donneesRessources?.productionChampignonniere > 0) {
            return this.donneesRessources.productionChampignonniere;
        }

        const niveau = monProfil.niveauConstruction[0] || 0;
        if (niveau === 0) return 0;
        return Math.floor(COUT_CONSTUCTION[0] * Math.pow(1.85, niveau) * 0.1);
    }

    /**
     * Calcule la production quotidienne du terrain de chasse
     */
    calculerProductionTerrainChasse() {
        if (this.donneesRessources?.productionRecolteNourriture > 0 || this.donneesRessources?.productionRecolteMateriaux > 0) {
            return {
                nourriture: this.donneesRessources.productionRecolteNourriture,
                materiaux: this.donneesRessources.productionRecolteMateriaux,
                ouvrieresNourriture: this.donneesRessources.ouvrieresNourriture || 0,
                ouvrieresMateriaux: this.donneesRessources.ouvrieresMateriaux || 0
            };
        }

        if (this.donneesRessources?.ouvrieresNourriture > 0 || this.donneesRessources?.ouvrieresMateriaux > 0) {
            const prodNourriture = Math.floor(this.donneesRessources.ouvrieresNourriture * 2.5);
            const prodMateriaux = Math.floor(this.donneesRessources.ouvrieresMateriaux * 1.8);

            return {
                nourriture: prodNourriture,
                materiaux: prodMateriaux,
                ouvrieresNourriture: this.donneesRessources.ouvrieresNourriture,
                ouvrieresMateriaux: this.donneesRessources.ouvrieresMateriaux
            };
        }

        const terrain = Utils.terrain;
        if (terrain === 0) return { nourriture: 0, materiaux: 0, ouvrieresNourriture: 0, ouvrieresMateriaux: 0 };

        const prodNourriture = Math.floor(terrain * 2.5);
        const prodMateriaux = Math.floor(terrain * 1.8);

        return {
            nourriture: prodNourriture,
            materiaux: prodMateriaux,
            ouvrieresNourriture: 0,
            ouvrieresMateriaux: 0
        };
    }

    /**
     * Calcule la consommation quotidienne des troupes
     */
    calculerConsommationTroupes() {
        if (this.donneesRessources?.consommationTroupes > 0) {
            return this.donneesRessources.consommationTroupes;
        }

        let niveauTotal = 0;
        for (let i = 0; i < monProfil.niveauConstruction.length; i++) {
            niveauTotal += monProfil.niveauConstruction[i] || 0;
        }

        const troupesEstimees = Math.floor(niveauTotal * 0.01);
        const consoMoyenne = 2.0;

        return Math.floor(troupesEstimees * consoMoyenne);
    }

    // ========================================
    // MÉTHODES DE CALCUL DE CAPACITÉS
    // ========================================

    /**
     * Calcule la capacité de stockage pour la nourriture
     */
    calculerCapaciteNourriture() {
        if (this.donneesRessources?.pourcentageNourriture > 0 && this.donneesRessources?.stockNourriture > 0) {
            return Math.round(this.donneesRessources.stockNourriture / (this.donneesRessources.pourcentageNourriture / 100));
        }

        const niveau = monProfil.niveauConstruction[1] || 0;
        return niveau * 10000;
    }

    /**
     * Calcule la capacité de stockage pour les matériaux
     */
    calculerCapaciteMateriaux() {
        if (this.donneesRessources?.pourcentageMateriaux > 0 && this.donneesRessources?.stockMateriaux > 0) {
            return Math.round(this.donneesRessources.stockMateriaux / (this.donneesRessources.pourcentageMateriaux / 100));
        }

        const niveau = monProfil.niveauConstruction[2] || 0;
        return niveau * 10000;
    }

    /**
     * Récupère le pourcentage de remplissage de la nourriture
     */
    getPourcentageNourriture() {
        if (this.donneesRessources?.pourcentageNourriture > 0) {
            return this.donneesRessources.pourcentageNourriture;
        }

        const capacite = this.calculerCapaciteNourriture();
        return capacite > 0 ? Math.min(100, (Utils.nourriture / capacite) * 100) : 0;
    }

    /**
     * Récupère le pourcentage de remplissage des matériaux
     */
    getPourcentageMateriaux() {
        if (this.donneesRessources?.pourcentageMateriaux > 0) {
            return this.donneesRessources.pourcentageMateriaux;
        }

        const capacite = this.calculerCapaciteMateriaux();
        return capacite > 0 ? Math.min(100, (Utils.materiaux / capacite) * 100) : 0;
    }

    // ========================================
    // MÉTHODES DE CALCUL DE STATISTIQUES
    // ========================================

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

    // ========================================
    // MÉTHODES DE SAUVEGARDE
    // ========================================


    /**
     * Met à jour les données d'évolution avec les nouvelles données de la fourmilière
     * Ajoute les nouvelles données sans modifier les formats d'origine
     */
    mettreAJourDonneesEvolution() {
        try {
            let dataEvo = JSON.parse(localStorage.getItem("outiiil_evolution")) || {};

            // Ajout des nouvelles données (sans modifier l'existant)
            if (this.donneesRessources && Object.keys(this.donneesRessources).length > 0) {
                dataEvo.ressources = this.donneesRessources;
            }
            if (this.donneesReine && Object.keys(this.donneesReine).length > 0) {
                dataEvo.reineDetaillee = this.donneesReine;
            }
            if (this.donneesConstruction && this.donneesConstruction.liste?.length > 0) {
                dataEvo.constructionDetaillee = this.donneesConstruction;
            }
            if (this.donneesRecherche && this.donneesRecherche.liste?.length > 0) {
                dataEvo.rechercheDetaillee = this.donneesRecherche;
            }
            dataEvo.timestampFourmiliere = new Date().toISOString();

            localStorage.setItem("outiiil_evolution", JSON.stringify(dataEvo));
            return this;
        } catch (error) {
            console.warn("Erreur lors de la mise à jour des données d'évolution:", error);
            return this;
        }
    }

    /**
     * Met à jour les données du joueur avec les informations détaillées
     */
    mettreAJourDonneesJoueur() {
        try {
            let dataJoueur = JSON.parse(localStorage.getItem("outiiil_joueur")) || {};

            // Mise à jour et ajout des données si disponibles
            if (this.donneesJoueur && Object.keys(this.donneesJoueur).length > 0) {
                // Mise à jour des données existantes

                // Mettre à jour niveauConstruction avec les données de construction
                dataJoueur.niveauConstruction = this.donneesConstruction?.liste?.map(item => item.niveau) || dataJoueur.niveauConstruction;
                
                // Mettre à jour niveauRecherche avec les données de recherche
                dataJoueur.niveauRecherche = this.donneesRecherche?.liste?.map(item => item.niveau) || dataJoueur.niveauRecherche;

                // Ajouter les nouvelles propriétés
                for (let cle in this.donneesJoueur) {
                    if (cle !== "Fourmilière" && cle !== "Technologie") {  // Éviter les doublons
                        dataJoueur[cle] = this.donneesJoueur[cle];  // AJOUT
                    }
                }
                dataJoueur.timestampDetaillees = new Date().toISOString();  // AJOUT
            }


            localStorage.setItem("outiiil_joueur", JSON.stringify(dataJoueur));
            return this;
        } catch (error) {
            console.warn("Erreur lors de la mise à jour des données du joueur:", error);
            return this;
        }
    }

    /**
     * Sauvegarde toutes les données récupérées par la page fourmilière
     */
    sauvegarderToutesDonnees() {
        this.mettreAJourDonneesEvolution();
        this.mettreAJourDonneesJoueur();
        return this;
    }
}