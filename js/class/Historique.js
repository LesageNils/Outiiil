/*
 * Historique.js
 * Adaptation du système d'historique TDC pour stockage local
 **********************************************************************/

/**
 * Classe pour gérer l'historique des TDC (Terrain de Chasse)
 * Stocke les données dans localStorage au lieu du forum
 *
 * @class Historique
 */
class Historique
{
    constructor()
    {
        /**
         * Tableau des données d'historique TDC
         */
        this._tabHistoTdc = {};
    }

    /**
     * Analyse la messagerie pour récupérer les données TDC
     * 
     * @method analyserMessagerie
     * @return {Promise} Promise résolue avec les données récupérées
     */
    analyserMessagerie()
    {
        const defer = $.Deferred();
        
        // Initialiser le tableau des nouvelles données
        this._tabHistoTdc = {};
        
        $.ajax({
            url: `//${Utils.serveur.toLowerCase()}.fourmizzz.fr/messagerie.php`,
            type: 'GET',
            dataType: 'html',
            success: (page) => {
                const chaine = [];

                $(page).find('#table_liste_conversations tr[data-type="Combats"], #table_liste_conversations tr[data-type="Chasses"]').find('.td_objet').each((idx, ligne) => {
                    // ID MESSAGE
                    const msg_id = 'id_' + $(ligne).parent().attr('id').replace("conversation_", "");
                    
                    // Extraire les informations depuis le message principal pour la rébellion
                    const messageObjet = $(ligne).find("a").text();
                    let cibleRebellion = null;
                    
                    if (messageObjet.includes("Rebellion réussie contre")) {
                        const matchCible = messageObjet.match(/Rebellion réussie contre\s+([^.]+)/);
                        if (matchCible) {
                            cibleRebellion = matchCible[1].trim();
                        }
                    }
                    
                    // Déclencher la récupération des détails pour tous les messages
                    chaine.push(this.recupererDetailMessage(msg_id, cibleRebellion));
                });

                   // Traiter tous les messages, puis sauvegarder une seule fois
                   $.when.apply($, chaine).then(() => {
                       console.log("📊 DONNÉES ANALYSÉES DE LA MESSAGERIE:", Object.keys(this._tabHistoTdc).length, "entrées");
                       console.log("📋 Détail des messages analysés:", this._tabHistoTdc);
                       
                       if (Object.keys(this._tabHistoTdc).length > 0) {
                           // Récupérer les alliances et combiner les données en une seule opération
                           this._finaliserHistorique().then(() => {
                               defer.resolve(this._tabHistoTdc);
                           });
                       } else {
                           defer.resolve(this._tabHistoTdc);
                       }
                   });
            },
            error: (xhr, status, error) => {
                console.warn("Erreur lors de l'analyse de la messagerie:", error);
                defer.reject(error);
            }
        });
        
        return defer.promise();
    }

    /**
     * Finalise l'historique : récupère les alliances, combine les données et sauvegarde
     * 
     * @private
     * @method _finaliserHistorique
     * @return {Promise} Promise résolue quand tout est terminé
     */
    _finaliserHistorique()
    {
        return new Promise((resolve) => {
            // D'abord, s'assurer que la section forum existe
            const forum = window.forumGlobal || new PageForum();
            forum.creerSectionHistoriqueTDC().then((idSection) => {
                
                // Ensuite, récupérer les alliances et charger les données existantes en parallèle
                const promises = [this._recupererAlliances()];
                
                // Charger les données existantes (localStorage + forum) en parallèle
                const historiqueLocalStorage = this.chargerHistorique();
                promises.push(this._chargerDonneesForum());
                
                $.when.apply($, promises).then((_, historiqueForum) => {
                    console.log("💾 DONNÉES RÉCUPÉRÉES DU STOCKAGE LOCAL:", Object.keys(historiqueLocalStorage).length, "entrées");
                    console.log("📦 Détail du stockage local:", historiqueLocalStorage);
                    
                    console.log("🌐 DONNÉES RÉCUPÉRÉES DU FORUM:", Object.keys(historiqueForum).length, "entrées");
                    console.log("📋 Détail des données forum:", historiqueForum);
                    
                    // Combiner toutes les données
                    this._tabHistoTdc = {
                        ...historiqueLocalStorage,
                        ...historiqueForum,
                        ...this._tabHistoTdc // Les nouvelles données écrasent les anciennes
                    };
                    
                    console.log("✅ DONNÉES FINALES COMBINÉES:", Object.keys(this._tabHistoTdc).length, "entrées");
                    
                    // Sauvegarde finale unique
                    this._sauvegarderFinale();
                    resolve();
                });
            });
        });
    }

    /**
     * Récupère les informations d'un joueur
     * 
     * @private
     * @method _getInfosJoueur
     * @param {String} pseudo - Pseudo du joueur
     * @return {Promise} Promise avec les infos du joueur
     */
    _getInfosJoueur(pseudo)
    {
        const defer = $.Deferred();
        
        $.ajax({
            url: `//${Utils.serveur.toLowerCase()}.fourmizzz.fr/Membre.php`,
            type: 'GET',
            data: { Pseudo: pseudo },
            dataType: 'html',
            success: (page) => {
                const alliance = $(page).find('td:contains("Alliance")').next().text().trim();
                defer.resolve({ Alliance: alliance });
            },
            error: (xhr, status, error) => {
                console.warn("Erreur lors de la récupération de l'alliance pour", pseudo, ":", error);
                defer.resolve({ Alliance: "" });
            }
        });
        
        return defer.promise();
    }





    /**
     * Charge les données d'historique depuis le forum
     * 
     * @private
     * @method _chargerDonneesForum
     * @return {Promise<Object>} Promise avec les données du forum
     */
    _chargerDonneesForum()
    {
        return new Promise((resolve) => {
            // Utiliser l'instance globale de PageForum
            const forum = window.forumGlobal || new PageForum();
            
            // Chercher la section par nom (plus fiable pour vérifier l'existence)
            forum.chercherSection("Outiiil_HistoTDC").then((idSection) => {
                if (idSection !== "0") {
                    // Consulter la section pour récupérer le sujet du joueur
                    this._consulterSectionForum(forum, idSection).then((contenuForum) => {
                        resolve(contenuForum);
                    });
                } else {
                    resolve({});
                }
            });
        });
    }

    /**
     * Consulte une section du forum et récupère le contenu du sujet du joueur
     * 
     * @private
     * @method _consulterSectionForum
     * @param {PageForum} forum - Instance du forum
     * @param {String} idSection - ID de la section
     * @return {Promise<Object>} Promise avec le contenu du sujet
     */
    _consulterSectionForum(forum, idSection)
    {
        return new Promise((resolve) => {
            forum.consulterSection(idSection).then((data) => {
                const response = $(data).find("cmd:eq(1)").text();
                const pseudoJoueur = monProfil.pseudo;
                
                if (response.includes(pseudoJoueur)) {
                    // Récupérer le contenu du sujet du joueur
                    this._recupererContenuSujetForum(forum, idSection, pseudoJoueur).then((contenuForum) => {
                        resolve(contenuForum);
                    });
                } else {
                    resolve({});
                }
            }, (error) => {
                console.warn("Erreur lors de la consultation de la section forum:", error);
                resolve({});
            });
        });
    }

    /**
     * Récupère le contenu du sujet d'historique depuis le forum
     * 
     * @private
     * @method _recupererContenuSujetForum
     * @param {PageForum} forum - Instance du forum
     * @param {String} idSection - ID de la section
     * @param {String} pseudoJoueur - Pseudo du joueur
     * @return {Promise<Object>} Promise avec le contenu du sujet
     */
    _recupererContenuSujetForum(forum, idSection, pseudoJoueur)
    {
        return new Promise((resolve) => {
            forum.consulterSection(idSection).then((data) => {
                const response = $(data).find("cmd:eq(1)").text();
                const $response = $("<div/>").append(response);
                
                // Trouver l'ID du sujet du joueur
                let idSujet = null;
                $response.find("#form_cat tr:gt(0)").each((i, elt) => {
                    const titreSujet = $(elt).find("td:eq(1)").text().trim();
                    if (titreSujet === pseudoJoueur) {
                        const onclickAttr = $(elt).find("a.topic_forum").attr("onclick");
                        if (onclickAttr) {
                            const match = onclickAttr.match(/\d+/);
                            if (match) {
                                idSujet = match[0];
                            }
                        }
                        return false; // Sortir de la boucle
                    }
                });
                
                if (idSujet) {
                    // Récupérer le contenu du sujet
                    forum.consulterSujet(idSujet).then((dataSujet) => {
                        try {
                            // Extraire le JSON du contenu du sujet
                            const contenuSujet = $(dataSujet).find("cmd:eq(1)").text();
                            const matchJson = contenuSujet.match(/\{[\s\S]*\}/);
                            
                            if (matchJson) {
                                // Décoder les entités HTML avant de parser le JSON
                                const jsonDecode = $('<div/>').html(matchJson[0]).text();
                                const donneesForum = JSON.parse(jsonDecode);
                                resolve(donneesForum);
                            } else {
                                resolve({});
                            }
                        } catch (error) {
                            console.warn("Erreur lors du parsing des données du forum:", error);
                            resolve({});
                        }
                    }, (error) => {
                        console.warn("Erreur lors de la consultation du sujet forum:", error);
                        resolve({});
                    });
                } else {
                    resolve({});
                }
            });
        });
    }


    /**
     * Synchronise l'historique avec le forum
     * Utilise la méthode optimisée de Forum.js
     * 
     * @method synchroniserAvecForum
     * @return {Promise} Promise résolue quand la synchronisation est terminée
     */
    synchroniserAvecForum()
    {
        return new Promise((resolve) => {
            const forum = window.forumGlobal || new PageForum();
            
            // Utiliser la méthode optimisée de Forum.js
            forum.gererSujetHistoriqueTDC(this._tabHistoTdc).then(() => {
                resolve();
            }).catch((error) => {
                console.warn("Erreur lors de la synchronisation avec le forum:", error);
                resolve(); // Résoudre quand même pour ne pas bloquer
            });
        });
    }


    /**
     * Récupère les alliances pour toutes les entrées qui ont une cible
     * 
     * @private
     * @method _recupererAlliances
     */
    _recupererAlliances()
    {
        return new Promise((resolve) => {
            const promises = [];
            const entreesSansAlliance = [];
            
            for (const [msgId, entree] of Object.entries(this._tabHistoTdc)) {
                if (entree.cible && !entree.alliance) {
                    entreesSansAlliance.push({ msgId, cible: entree.cible });
                    promises.push(
                        this._getInfosJoueur(entree.cible).then(infos => {
                            if (infos && infos.Alliance) {
                                this._tabHistoTdc[msgId].alliance = infos.Alliance;
                            }
                        }).catch(error => {
                            console.warn("Erreur lors de la récupération de l'alliance pour", entree.cible, ":", error);
                        })
                    );
                }
            }
            
               if (promises.length > 0) {
                   $.when.apply($, promises).then(() => {
                       resolve();
                   });
               } else {
                   resolve();
               }
        });
    }

    /**
     * Sauvegarde finale unique dans localStorage et forum
     * 
     * @private
     * @method _sauvegarderFinale
     */
    _sauvegarderFinale()
    {
        try {
            // Préparer les données finales avec métadonnées
            const dataFinale = {
                ...this._tabHistoTdc,
                timestamp: new Date().toISOString(),
                serveur: Utils.serveur
            };
            
            // Sauvegarder dans localStorage
            localStorage.setItem("outiiil_historique", JSON.stringify(dataFinale));
            
            // Synchroniser avec le forum
            this.synchroniserAvecForum().catch(error => {
                console.warn("Erreur lors de la synchronisation finale avec le forum:", error);
            });
            
            // Rafraîchir l'affichage si nécessaire
            this._rafraichirAffichage();
        } catch (error) {
            console.warn("Erreur lors de la sauvegarde finale:", error);
        }
    }

    /**
     * Rafraîchit l'affichage de l'historique TDC
     * 
     * @private
     * @method _rafraichirAffichage
     */
    _rafraichirAffichage()
    {
        if ($("#contenu-historique").is(":visible")) {
            const historique = window.historiqueGlobal || this;
            $("#contenu-historique").html(historique.genererHTML());
            setTimeout(() => historique.initialiserFiltres(), 100);
        }
    }

    /**
     * Charge l'historique depuis localStorage
     * 
     * @method chargerHistorique
     * @return {Object} Données d'historique
     */
    chargerHistorique()
    {
        try {
            const data = JSON.parse(localStorage.getItem("outiiil_historique")) || {};
            // Retirer les métadonnées pour ne garder que les données TDC
            const { timestamp, serveur, ...historique } = data;
            return historique;
        } catch (error) {
            console.warn("Erreur lors du chargement de l'historique:", error);
            return {};
        }
    }

    /**
     * Récupère les couleurs du thème
     */
    getCouleursTheme()
    {
        return {
            texte: monProfil.parametre["couleurTexte"]?.valeur || "#000000",
            fond: monProfil.parametre["couleur1"]?.valeur || "#f8f9fa",
            bordure: monProfil.parametre["couleur3"]?.valeur || "#dee2e6",
            alternance: monProfil.parametre["couleur2"]?.valeur || "#e9ecef",
            titre: "#bd8d46"
        };
    }

    /**
     * Génère un bouton d'ouverture de page
     */
    genererBoutonOuvrir(url)
    {
        return `<button onclick="window.open('${url}', '_blank')" style="margin-left: auto; background: #bd8d46; color: white; border: none; padding: 4px 8px; border-radius: 3px; font-size: 11px; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.background='#a67c3a'; this.style.transform='scale(1.05)'" onmouseout="this.style.background='#bd8d46'; this.style.transform='scale(1)'">Ouvrir</button>`;
    }

    /**
     * Génère le HTML pour l'affichage de l'historique TDC
     * 
     * @method genererHTML
     * @return {String} HTML de l'historique
     */
    genererHTML()
    {
        // Combiner les données de localStorage avec celles en cours de traitement
        const historiqueLocalStorage = this.chargerHistorique();
        const historiqueComplet = { ...historiqueLocalStorage, ...this._tabHistoTdc };
        
        // Utiliser le même système de couleurs que la synthèse
        const couleurs = this.getCouleursTheme();
        
        let html = `<div class="section-info" style="
            background: ${couleurs.alternance};
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
        ">`;
        
        // Titre avec icône
        html += `<h3 class="o_titre_cadre" style="background:${couleurs.titre};">
            📈 Historique TDC
            ${this.genererBoutonOuvrir(`//${Utils.serveur.toLowerCase()}.fourmizzz.fr/messagerie.php`)}
        </h3>`;
        
        // Trier par date (plus récent en premier)
        const entreesTriees = Object.values(historiqueComplet).sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Graphique d'évolution du TDC
        html += this.creerGraphiqueEvolution(entreesTriees, couleurs);
        
        // Créer les filtres par type
        html += this.creerFiltres(entreesTriees, couleurs);
        
        // Tableau avec colonnes alignées
        html += `<table id="tableau-historique" style="
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            background: ${couleurs.fond};
            border-radius: 4px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            color: ${couleurs.texte};
        ">`;
        
        // En-tête du tableau
        html += `<thead>
            <tr style="background: ${couleurs.alternance}; border-bottom: 2px solid ${couleurs.bordure};">
                <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: bold; color: ${couleurs.texte}; width: 120px;">Type</th>
                <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: bold; color: ${couleurs.texte}; width: 100px;">Cible</th>
                <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: bold; color: ${couleurs.texte}; width: 100px;">Lieu</th>
                <th style="padding: 10px; text-align: left; font-size: 11px; font-weight: bold; color: ${couleurs.texte};">Détails</th>
                <th style="padding: 10px; text-align: right; font-size: 11px; font-weight: bold; color: ${couleurs.texte}; width: 150px;">Quantité</th>
            </tr>
        </thead>
        <tbody>`;
        
        entreesTriees.forEach((entree, index) => {
            let couleurTexte = "";
            let affichageQte = "";
            let affichageLieu = "";
            
            // Couleurs minimales - seulement pour les cas pertinents
            switch(entree.type) {
                case "Butin":
                    couleurTexte = "#28a745"; // Vert pour gain
                    affichageQte = entree.qte.toLocaleString() + " cm²";
                    break;
                case "Vol":
                    couleurTexte = "#dc3545"; // Rouge pour perte
                    affichageQte = entree.qte.toLocaleString() + " cm²";
                    break;
                case "Attaque réussie":
                    couleurTexte = "#007bff"; // Bleu pour succès
                    affichageQte = "✓";
                    affichageLieu = entree.lieu || "";
                    break;
                case "Attaque échouée":
                    couleurTexte = "#dc3545"; // Rouge pour échec
                    affichageQte = "✗";
                    affichageLieu = entree.lieu || "";
                    break;
                case "Rébellion réussie":
                    couleurTexte = "#6f42c1"; // Violet pour rébellion
                    affichageQte = "✓";
                    break;
                case "Chasse réussie":
                    couleurTexte = "#20c997"; // Vert turquoise pour chasse
                    affichageQte = entree.qte.toLocaleString() + " cm²";
                    if (entree.expeditions) {
                        affichageQte += ` (${entree.expeditions} exp.)`;
                    }
                    affichageLieu = entree.lieu || "";
                    break;
                default:
                    couleurTexte = "#6c757d";
                    affichageQte = entree.qte || "";
            }
            
            // Ligne du tableau
            html += `<tr class="ligne-historique" data-type="${entree.type}" style="
                border-bottom: 1px solid ${couleurs.bordure};
                transition: background-color 0.2s;
                background: ${couleurs.fond};
            " onmouseover="this.style.backgroundColor='${couleurs.alternance}'" onmouseout="this.style.backgroundColor='${couleurs.fond}'">`;
            
            // Type (avec date au-dessus)
            html += `<td style="padding: 8px; font-size: 11px;">
                <div style="font-size: 9px; color: #6c757d; margin-bottom: 2px;">${Utils.formaterDateFrancaise(entree.date)}</div>
                <strong style="color: ${couleurTexte};">${entree.type}</strong>
            </td>`;
            
            // Cible (avec alliance en dessous)
            html += `<td style="padding: 8px; font-size: 11px; font-weight: bold; color: ${couleurs.texte};">
                ${entree.cible ? `<a href="//${Utils.serveur.toLowerCase()}.fourmizzz.fr/Membre.php?Pseudo=${encodeURIComponent(entree.cible)}" target="_blank" style="color: ${couleurs.texte}; text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${entree.cible}</a>` : '-'}
                ${entree.alliance ? `<br/><span style="font-size: 9px; color: #6c757d; font-weight: normal;">[${entree.alliance}]</span>` : ''}
            </td>`;
            
            // Lieu
            html += `<td style="padding: 8px; font-size: 10px; color: ${couleurs.texte};">
                ${affichageLieu || '-'}
            </td>`;
            
            // Détails
            html += `<td style="padding: 8px; font-size: 9px; color: ${couleurs.texte};">
                ${this.genererDetailsAffichage(entree)}
            </td>`;
            
            // Quantité
            html += `<td style="padding: 8px; font-size: 11px; text-align: right; font-weight: bold; color: ${couleurTexte};">
                ${affichageQte || '-'}
            </td>`;
            
            
            html += `</tr>`;
        });
        
        html += `</tbody></table>`;
        
        // Résumé compact en une seule ligne
        const stats = this.getStatistiques();
        html += `<div style="font-size: 10px; color: ${couleurs.texte}; text-align: center; padding: 5px; border-top: 1px solid ${couleurs.bordure}; margin-top: 8px;">
            <strong>${stats.totalEntrees} événements</strong> | 
            Butin: <span style="color: #28a745;">${stats.totalButin.toLocaleString()} cm²</span> | 
            Vol: <span style="color: #dc3545;">${stats.totalVol.toLocaleString()} cm²</span> | 
            Chasse: <span style="color: #20c997;">${stats.totalChasse.toLocaleString()} cm²</span> | 
            Solde: <span style="color: ${stats.soldeTotal >= 0 ? '#28a745' : '#dc3545'};">${stats.soldeTotal.toLocaleString()} cm²</span> | 
            Attaques: <span style="color: #007bff;">${stats.attaquesReussies}/${stats.attaquesEchouees}</span> | 
            Rébellions: <span style="color: #6f42c1;">${stats.rebellionsReussies}</span> | 
            Chasses: <span style="color: #20c997;">${stats.chassesReussies}</span>
        </div>`;
        
        html += `</div>`;
        return html;
    }

    /**
     * Crée le graphique d'évolution du TDC
     * 
     * @method creerGraphiqueEvolution
     * @param {Array} entrees - Liste des entrées d'historique
     * @param {Object} couleurs - Couleurs du thème
     * @return {String} HTML du graphique
     */
    creerGraphiqueEvolution(entrees, couleurs)
    {
        if (entrees.length === 0) {
            return `<div style="text-align: center; padding: 20px; color: ${couleurs.texte}; font-style: italic;">
                Aucune donnée disponible pour le graphique
            </div>`;
        }

        // Préparer les données pour le graphique
        const donneesGraphique = this.preparerDonneesGraphique(entrees);
        
        // Stocker les données pour le graphique
        this._donneesGraphique = donneesGraphique;
        this._couleursGraphique = couleurs;
        
        const tdcActuel = donneesGraphique.tdcActuel;
        const tdcOrigine = donneesGraphique.tdcOrigine;
        const difference = tdcActuel - tdcOrigine;
        
        // Calculer les dates de début et fin
        let dateDebut = '';
        let dateFin = '';
        if (entrees.length > 0) {
            const dates = entrees.map(e => new Date(e.date)).sort((a, b) => a - b);
            dateDebut = Utils.formaterDateFrancaise(dates[0].toISOString());
            dateFin = Utils.formaterDateFrancaise(dates[dates.length - 1].toISOString());
        }
        
        return `
        <div style="margin-bottom: 20px; background: ${couleurs.fond}; border: 1px solid ${couleurs.bordure}; border-radius: 6px; padding: 15px;">
            <h4 style="margin: 0 0 10px 0; color: ${couleurs.texte}; font-size: 14px; text-align: center;">
                📈 Évolution du TDC dans le temps
                ${dateDebut && dateFin ? `<br/><span style="font-size: 11px; font-weight: normal; color: #6c757d;">Du ${dateDebut} au ${dateFin}</span>` : ''}
            </h4>
            <div style="text-align: center; margin-bottom: 10px; font-size: 11px; color: ${couleurs.texte};">
                <span style="color: #28a745;">TDC actuel: ${numeral(tdcActuel).format('0,0')} cm²</span> | 
                <span style="color: #6c757d;">TDC d'origine: ${numeral(tdcOrigine).format('0,0')} cm²</span> | 
                <span style="color: ${difference >= 0 ? '#28a745' : '#dc3545'};">Évolution: ${difference >= 0 ? '+' : ''}${numeral(difference).format('0,0')} cm²</span>
            </div>
            <div id="graphique-evolution-tdc" style="height: 300px; width: 100%;"></div>
        </div>`;
    }

    /**
     * Prépare les données pour le graphique d'évolution
     * 
     * @method preparerDonneesGraphique
     * @param {Array} entrees - Liste des entrées d'historique
     * @return {Object} Données formatées pour Highcharts
     */
    preparerDonneesGraphique(entrees)
    {
        // Récupérer le TDC actuel depuis les données du joueur
        const tdcActuel = this.getTdcActuel();
        
        // Trier par date (plus récent en premier pour calculer le TDC d'origine)
        const entreesTriees = [...entrees].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Calculer le TDC d'origine en retranchant tous les événements
        let tdcOrigine = tdcActuel;
        entreesTriees.forEach(entree => {
            switch(entree.type) {
                case "Butin":
                case "Chasse réussie":
                    tdcOrigine -= entree.qte; // Retrancher les gains
                    break;
                case "Vol":
                    tdcOrigine += entree.qte; // Ajouter les pertes
                    break;
            }
        });
        
        // Maintenant trier par date (plus ancien en premier pour le graphique)
        const entreesPourGraphique = [...entrees].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        let soldeActuel = tdcOrigine;
        const solde = [];
        const butin = [];
        const vol = [];
        const chasse = [];
        
        // Ajouter le point de départ (TDC d'origine)
        if (entreesPourGraphique.length > 0) {
            const premiereDate = new Date(entreesPourGraphique[0].date).getTime();
            solde.push([premiereDate, tdcOrigine]);
        }
        
        entreesPourGraphique.forEach(entree => {
            const timestamp = new Date(entree.date).getTime();
            
            switch(entree.type) {
                case "Butin":
                    soldeActuel += entree.qte;
                    butin.push({
                        x: timestamp,
                        y: soldeActuel,
                        entree: entree,
                        type: 'butin'
                    });
                    solde.push([timestamp, soldeActuel]);
                    break;
                case "Vol":
                    soldeActuel -= entree.qte;
                    vol.push({
                        x: timestamp,
                        y: soldeActuel,
                        entree: entree,
                        type: 'vol'
                    });
                    solde.push([timestamp, soldeActuel]);
                    break;
                case "Chasse réussie":
                    soldeActuel += entree.qte;
                    chasse.push({
                        x: timestamp,
                        y: soldeActuel,
                        entree: entree,
                        type: 'chasse'
                    });
                    solde.push([timestamp, soldeActuel]);
                    break;
            }
        });
        
        return { 
            solde, 
            butin, 
            vol, 
            chasse, 
            tdcActuel, 
            tdcOrigine,
            totalEntrees: entrees.length
        };
    }

    /**
     * Récupère le TDC actuel depuis les données du joueur
     * 
     * @method getTdcActuel
     * @return {Number} TDC actuel en cm²
     */
    getTdcActuel()
    {
        try {
            const donneesJoueur = JSON.parse(localStorage.getItem("outiiil_joueur")) || {};
            const terrain = donneesJoueur.terrain || donneesJoueur.Terrain || 0;
            
            // Convertir en nombre si c'est une chaîne
            if (typeof terrain === 'string') {
                return parseInt(terrain.replace(/[^\d]/g, '')) || 0;
            }
            
            return terrain || 0;
        } catch (error) {
            console.warn("Erreur lors de la récupération du TDC actuel:", error);
            return 0;
        }
    }

    /**
     * Crée les filtres par type d'événement
     * 
     * @method creerFiltres
     * @param {Array} entrees - Liste des entrées d'historique
     * @param {Object} couleurs - Couleurs du thème
     * @return {String} HTML des filtres
     */
    creerFiltres(entrees, couleurs)
    {
        // Compter les événements par type
        const compteurs = {};
        entrees.forEach(entree => {
            compteurs[entree.type] = (compteurs[entree.type] || 0) + 1;
        });
        
        const types = ["Tous", "Butin", "Vol", "Attaque réussie", "Attaque échouée", "Rébellion réussie", "Chasse réussie"];
        const couleursTypes = {
            "Tous": "#6c757d",
            "Butin": "#28a745",
            "Vol": "#dc3545", 
            "Attaque réussie": "#007bff",
            "Attaque échouée": "#dc3545",
            "Rébellion réussie": "#6f42c1",
            "Chasse réussie": "#20c997"
        };
        
        let html = `<div style="margin-bottom: 10px; padding: 8px; background: ${couleurs.fond}; border: 1px solid ${couleurs.bordure}; border-radius: 4px;">
            <div style="display: flex; flex-wrap: wrap; gap: 5px; align-items: center;">
                <span style="font-size: 11px; font-weight: bold; margin-right: 10px; color: ${couleurs.texte};">Filtrer par type:</span>`;
        
        types.forEach(type => {
            const count = type === "Tous" ? entrees.length : (compteurs[type] || 0);
            const couleur = couleursTypes[type];
            
            html += `<button class="filtre-btn" data-type="${type}" style="
                background: ${couleur};
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 3px;
                font-size: 10px;
                cursor: pointer;
                opacity: 1;
                transition: opacity 0.2s;
            ">${type} (${count})</button>`;
        });
        
        html += `</div></div>`;
        
        // Ajouter le CSS pour les filtres
        html += `<style>
            .filtre-btn:hover { opacity: 0.8 !important; }
            .filtre-btn.inactive { opacity: 0.4 !important; }
        </style>`;
        
        
        return html;
    }



    /**
     * Récupère le détail d'un message spécifique
     * 
     * @method recupererDetailMessage
     * @param {String} msgId - ID du message
     * @param {String} cibleRebellion - Cible de la rébellion (si applicable)
     * @return {Promise} Promise de récupération du détail
     */
    recupererDetailMessage(msgId, cibleRebellion = null)
    {
        const defer = $.Deferred();
        const conversationId = msgId.replace('id_', '');
        
        $.ajax({
            url: `//${Utils.serveur.toLowerCase()}.fourmizzz.fr/messagerie.php`,
            type: 'POST',
            data: {
                traitement: 'afficher',
                conversation: conversationId
            },
            dataType: 'html',
            success: (page) => {
                try {
                    const details = this.analyserDetailMessage(page, cibleRebellion);
                    if (details && details.length > 0) {
                        // Ajouter les détails multiples avec leur ID unique
                        details.forEach((detail) => {
                            const newMsgId = detail.messageId || `${msgId}_detail_${Date.now()}`;
                            this._tabHistoTdc[newMsgId] = {
                                ...detail,
                                detailsRecuperes: true
                            };
                        });
                    }
                    defer.resolve();
                } catch (error) {
                    console.warn("Erreur lors de l'analyse du détail:", error);
                    defer.resolve();
                }
            },
            error: (xhr, status, error) => {
                console.warn("Erreur AJAX pour le message", msgId, ":", error);
                defer.resolve();
            }
        });
        
        return defer.promise();
    }

    /**
     * Analyse le contenu détaillé d'un message
     * 
     * @method analyserDetailMessage
     * @param {String} pageHtml - HTML de la page de détail
     * @param {String} cibleRebellion - Cible de la rébellion (si applicable)
     * @return {Promise<Array>} Promise avec le tableau des détails extraits
     */
    analyserDetailMessage(pageHtml, cibleRebellion = null)
    {
        const details = [];
        const $page = $(pageHtml);
        
        // Chercher les sous-messages avec leur ID unique (format: message_XXXXX)
        const elements = $page.find('tr[id^="message_"]');
        
        elements.each((i, element) => {
            const $tr = $(element);
            const messageId = $tr.attr('id'); // message_93254662, message_93254666, etc.
            
            // Extraire la date depuis le span
            const dateSpan = $tr.find('td.expe span span').text().trim();
            const matchDate = dateSpan.match(/(\d{1,2})\/(\d{1,2})\/(\d{2})\s+à\s+(\d{1,2})h(\d{2})/);
            
            // Extraire le contenu du message
            const messageContent = $tr.find('td.message').text().trim();
            
            if (messageContent && this.estMessageTDC(messageContent)) {
                const detail = this.extraireDetailMessage($tr, cibleRebellion);
                if (detail) {
                    // Utiliser l'ID du sous-message comme clé unique
                    detail.messageId = messageId;
                    
                    // Utiliser la date extraite du sous-message si disponible
                    if (matchDate) {
                        const jour = matchDate[1].padStart(2, '0');
                        const mois = matchDate[2].padStart(2, '0');
                        const annee = '20' + matchDate[3];
                        const heure = matchDate[4].padStart(2, '0');
                        const minute = matchDate[5];
                        
                        detail.date = `${annee}-${mois}-${jour}T${heure}:${minute}+01:00`;
                    }
                    
                    details.push(detail);
                }
            }
        });
        
        return details;
    }


    /**
     * Vérifie si un texte correspond à un message TDC
     * 
     * @method estMessageTDC
     * @param {String} texte - Texte à analyser
     * @return {Boolean} True si c'est un message TDC
     */
    estMessageTDC(texte)
    {
        const patternsTDC = [
            /Vous attaquez/,
            /Troupes en attaque/,
            /Troupes en défense/,
            /Vous infligez.*dégâts/,
            /Vous avez gagné cette bataille/,
            /Vos troupes ont échoué/,
            /Vos fourmis ont conquis.*cm²/,
            /vous a pris.*cm²/,
            /Vos chasseuses ont conquis/,
            /À présent, votre fourmilière est libre/,
            /Les unités survivantes ont appris/,
            /Butin chez/,
            /Vol par/,
            /Chasse réussie/,
            /Attaque échouée/,
            /Attaque réussie/,
            /Rébellion réussie/,
            /pillé.*nourriture/,
            /rapportent.*nourriture/
        ];
        
        const isTDC = patternsTDC.some(pattern => pattern.test(texte));
        
        // Log pour déboguer
        if (!isTDC && texte.length > 10) {
        }
        
        return isTDC;
    }

    /**
     * Extrait les détails d'un message TDC
     * 
     * @method extraireDetailMessage
     * @param {jQuery} $tr - Élément TR du sous-message
     * @param {String} cibleRebellion - Cible de la rébellion (si applicable)
     * @return {Object} Détail extrait
     */
    extraireDetailMessage($tr, cibleRebellion = null)
    {
        const detail = {
            type: "",
            cible: "",
            alliance: "",
            date: new Date().toISOString(), // Date par défaut, sera remplacée par la date extraite
            qte: 0,
            lieu: "",
            expeditions: 0
        };

        // Récupérer le contenu HTML et texte du message
        const messageHTML = $tr.find('td.message').html();
        const messageText = $tr.find('td.message').text().trim();
        
        // Détecter le type de sous-message et extraire les informations spécifiques
        
        // 1. ATTAQUE ÉCHOUÉE
        if (messageText.includes("Vous attaquez") && messageText.includes("Vos troupes ont échoué")) {
            detail.type = "Attaque échouée";
            detail.resultat = "échec";
            
            // Extraire les troupes en attaque
            const matchAttaque = messageText.match(/Troupes en attaque\s*:\s*([^.]+)/);
            if (matchAttaque) {
                detail.troupesAttaque = matchAttaque[1].trim();
            }
            
            // Extraire les troupes en défense
            const matchDefense = messageText.match(/Troupes en défense\s*:\s*([^.]+)/);
            if (matchDefense) {
                detail.troupesDefense = matchDefense[1].trim();
            }
            
            // Extraire cible et lieu depuis le HTML
            const $lienCible = $tr.find('td.message a[href*="Membre.php?Pseudo="]');
            if ($lienCible.length > 0) {
                detail.cible = $lienCible.text().trim();
                
            }
            
            // Extraire le lieu depuis le HTML
            if (messageHTML && messageHTML.includes("Vous attaquez")) {
                const matchLieu = messageHTML.match(/Vous attaquez\s+(?:la\s+|le\s+)?([^<]+?)\s+de\s+<a[^>]*>([^<]+)<\/a>/);
                if (matchLieu) {
                    detail.lieu = matchLieu[1].trim();
                }
            }
        }
        
        // 2. ATTAQUE RÉUSSIE
        else if (messageText.includes("Vous attaquez") && messageText.includes("Vous avez gagné cette bataille")) {
            detail.type = "Attaque réussie";
            detail.resultat = "réussite";
            
            // Extraire les troupes
            const matchAttaque = messageText.match(/Troupes en attaque\s*:\s*([^.]+)/);
            if (matchAttaque) {
                detail.troupesAttaque = matchAttaque[1].trim();
            }
            
            const matchDefense = messageText.match(/Troupes en défense\s*:\s*([^.]+)/);
            if (matchDefense) {
                detail.troupesDefense = matchDefense[1].trim();
            }
            
            // Extraire les trophées
            const matchTrophees = messageText.match(/(\d+)\s+trophées?\s+volés?/);
            if (matchTrophees) {
                detail.trophees = parseInt(matchTrophees[1]);
            }
            
            // Extraire les évolutions
            const matchEvolutions = messageText.match(/(\d+)\s+([^sont]+)\s+sont devenues?\s+([^.]+)/g);
            if (matchEvolutions) {
                detail.evolutions = matchEvolutions.map(evo => evo.trim());
            }
            
            // Extraire cible et lieu depuis le HTML
            const $lienCible = $tr.find('td.message a[href*="Membre.php?Pseudo="]');
            if ($lienCible.length > 0) {
                detail.cible = $lienCible.text().trim();
                
            }
            
            // Extraire le lieu depuis le HTML
            if (messageHTML && messageHTML.includes("Vous attaquez")) {
                const matchLieu = messageHTML.match(/Vous attaquez\s+(?:la\s+|le\s+)?([^<]+?)\s+de\s+<a[^>]*>([^<]+)<\/a>/);
                if (matchLieu) {
                    detail.lieu = matchLieu[1].trim();
                }
            }
        }
        
        // 3. BUTIN
        else if (messageText.includes("Vos fourmis ont conquis") && messageText.includes("lors de leur dernière bataille")) {
            detail.type = "Butin";
            
            // Extraire la quantité de terrain
            const matchTerrain = messageText.match(/Vos fourmis ont conquis\s+([\d\s]+)\s+cm²/);
            if (matchTerrain) {
                detail.qte = parseInt(matchTerrain[1].replace(/\s/g, ''));
            }
            
            // Extraire la cible
            const matchCible = messageText.match(/Ces terres appartenaient à\s+([^.]+)/);
            if (matchCible) {
                detail.cible = matchCible[1].trim();
            }
        }
        
        // 4. VOL
        else if (messageText.includes("vous a pris") && messageText.includes("lors de sa dernière attaque")) {
            detail.type = "Vol";
            
            // Extraire la cible depuis le HTML (plus fiable)
            const $lienCible = $tr.find('td.message a[href*="Membre.php?Pseudo="]');
            if ($lienCible.length > 0) {
                detail.cible = $lienCible.text().trim();
            }
            
            // Extraire la quantité de terrain
            const matchTerrain = messageText.match(/vous a pris\s+([\d\s]+)\s+cm²/);
            if (matchTerrain) {
                detail.qte = parseInt(matchTerrain[1].replace(/\s/g, ''));
            }
        }
        
        // 5. CHASSE
        else if (messageText.includes("Vos chasseuses ont conquis") && messageText.includes("rapportent")) {
            detail.type = "Chasse réussie";
            detail.lieu = "Terrain de Chasse";
            detail.cible = "";
            
            // Extraire la quantité de terrain depuis le sous-message uniquement
            const matchTerrain = messageText.match(/Vos chasseuses ont conquis\s+([\d\s]+)\s+cm²/);
            if (matchTerrain) {
                detail.qte = parseInt(matchTerrain[1].replace(/\s/g, ''));
            }
            
            // Extraire les ressources de chasse depuis le sous-message
            const matchRessources = messageText.match(/rapportent\s+([\d\s]+)/);
            if (matchRessources) {
                detail.ressourcesChasse = parseInt(matchRessources[1].replace(/\s/g, ''));
            }
            
            // Extraire les troupes
            const matchAttaque = messageText.match(/Troupes en attaque\s*:\s*([^.]+)/);
            if (matchAttaque) {
                detail.troupesAttaque = matchAttaque[1].trim();
            }
            
            const matchDefense = messageText.match(/Troupes en défense\s*:\s*([^.]+)/);
            if (matchDefense) {
                detail.troupesDefense = matchDefense[1].trim();
            }
            
            // Extraire les évolutions
            const matchEvolutions = messageText.match(/(\d+)\s+([^sont]+)\s+sont devenues?\s+([^.]+)/g);
            if (matchEvolutions) {
                detail.evolutions = matchEvolutions.map(evo => evo.trim());
            }
        }
        
        // 6. RÉBELLION
        else if (messageText.includes("À présent, votre fourmilière est libre") && messageText.includes("pillé")) {
            detail.type = "Rébellion réussie";
            
            // Extraire la durée de tyrannie
            const matchDuree = messageText.match(/depuis\s+(\d+J\s+\d+H\s+\d+m\s+\d+s)/);
            if (matchDuree) {
                detail.dureeTyrannie = matchDuree[1];
            }
            
            // Extraire les ressources pillées
            const matchNourriture = messageText.match(/pillé\s+([\d\s]+)\s+nourriture/);
            if (matchNourriture) {
                detail.nourriturePillee = parseInt(matchNourriture[1].replace(/\s/g, ''));
            }
            
            const matchMateriaux = messageText.match(/pillé\s+[\d\s]+\s+nourriture\s+et\s+([\d\s]+)\s+matériaux/);
            if (matchMateriaux) {
                detail.materiauxPilles = parseInt(matchMateriaux[1].replace(/\s/g, ''));
            }
            
            // Extraire les troupes
            const matchAttaque = messageText.match(/Troupes en attaque\s*:\s*([^.]+)/);
            if (matchAttaque) {
                detail.troupesAttaque = matchAttaque[1].trim();
            }
            
            const matchDefense = messageText.match(/Troupes en défense\s*:\s*([^.]+)/);
            if (matchDefense) {
                detail.troupesDefense = matchDefense[1].trim();
            }
            
            // Utiliser la cible de rébellion passée en paramètre (extraite du message principal)
            if (cibleRebellion) {
                detail.cible = cibleRebellion;
            }

            detail.lieu = "Loge Impériale";
        }
        
        // Si aucun type reconnu, ne pas créer d'entrée
        if (!detail.type) {
            return null;
        }
        
        
        return detail;
    }


    /**
     * Génère l'affichage des détails pour une entrée
     * 
     * @method genererDetailsAffichage
     * @param {Object} entree - Entrée d'historique
     * @return {String} HTML des détails
     */
    genererDetailsAffichage(entree)
    {
        const details = [];
        
        // Résultat
        if (entree.resultat) {
            const emoji = entree.resultat === "réussite" ? "✅" : "❌";
            details.push(`${emoji} ${entree.resultat}`);
        }
        
        // Troupes en attaque
        if (entree.troupesAttaque) {
            details.push(`⚔️ Att: ${entree.troupesAttaque}`);
        }
        
        // Troupes en défense
        if (entree.troupesDefense) {
            details.push(`🛡️ Déf: ${entree.troupesDefense}`);
        }
        
        // Trophées
        if (entree.trophees) {
            details.push(`🏆 ${entree.trophees} trophées`);
        }
        
        // Évolutions
        if (entree.evolutions && entree.evolutions.length > 0) {
            details.push(`📈 ${entree.evolutions.length} évolution(s)`);
        }
        
        // Ressources pillées
        if (entree.nourriturePillee) {
            details.push(`🍯 ${entree.nourriturePillee.toLocaleString()} nourriture`);
        }
        
        if (entree.materiauxPilles) {
            details.push(`🔨 ${entree.materiauxPilles.toLocaleString()} matériaux`);
        }
        
        // Durée de tyrannie
        if (entree.dureeTyrannie) {
            details.push(`⏰ ${entree.dureeTyrannie}`);
        }
        
        // Ressources de chasse
        if (entree.ressourcesChasse) {
            details.push(`🦌 ${entree.ressourcesChasse.toLocaleString()} nourriture`);
        }
        
        return details.length > 0 ? details.join('<br>') : '-';
    }

    /**
     * Initialise les filtres après insertion du HTML dans le DOM
     * 
     * @method initialiserFiltres
     */
    initialiserFiltres()
    {
        const filtres = document.querySelectorAll('.filtre-btn');
        const lignes = document.querySelectorAll('.ligne-historique');
        
        filtres.forEach(filtre => {
            filtre.addEventListener('click', function() {
                const type = this.dataset.type;
                
                // Mettre à jour l'état des filtres
                filtres.forEach(f => f.classList.remove('inactive'));
                this.classList.add('inactive');
                
                // Filtrer les lignes du tableau
                lignes.forEach(ligne => {
                    if (type === 'Tous' || ligne.dataset.type === type) {
                        ligne.style.display = '';
                    } else {
                        ligne.style.display = 'none';
                    }
                });
            });
        });
        
        // Créer le graphique si les données sont disponibles
        this.creerGraphique();
    }

    /**
     * Crée le graphique d'évolution du TDC
     * 
     * @method creerGraphique
     */
    creerGraphique()
    {
        if (!this._donneesGraphique || !this._couleursGraphique) {
            return;
        }

        const donneesGraphique = this._donneesGraphique;
        const couleurs = this._couleursGraphique;

        if (typeof Highcharts === 'undefined') {
            console.warn("Highcharts n'est pas disponible pour créer le graphique");
            return;
        }

        try {
            new Highcharts.Chart({
                chart: {
                    renderTo: 'graphique-evolution-tdc',
                    type: 'spline',
                    backgroundColor: 'transparent',
                    height: 300
                },
                title: { text: '' },
                credits: { enabled: false },
                xAxis: {
                    type: 'datetime',
                    title: { 
                        text: 'Date et heure',
                        style: { color: couleurs.texte }
                    },
                    labels: {
                        style: { color: couleurs.texte },
                        formatter: function() {
                            const date = Highcharts.dateFormat('%d/%m', this.value);
                            const heure = Highcharts.dateFormat('%H:%M', this.value);
                            return `${heure}<br/>${date}`;
                        }
                    }
                },
                yAxis: {
                    title: { 
                        text: 'Terrain (cm²)',
                        style: { color: couleurs.texte }
                    },
                    labels: {
                        style: { color: couleurs.texte },
                        formatter: function() {
                            return numeral(this.value).format('0.0a');
                        }
                    }
                },
                tooltip: {
                    crosshairs: [true],
                    formatter: function() {
                        let s = '<b>' + Highcharts.dateFormat('%A %e %b %Y à %H:%M', this.x) + '</b>';
                        
                        if (this.point && this.point.entree) {
                            // Point avec détails d'événement
                            const entree = this.point.entree;
                            s += '<br/><br/><b>Événement:</b> ' + entree.type;
                            s += '<br/><b>Cible:</b> ' + (entree.cible || 'N/A');
                            if (entree.alliance) {
                                s += '<br/><b>Alliance:</b> ' + entree.alliance;
                            }
                            if (entree.lieu) {
                                s += '<br/><b>Lieu:</b> ' + entree.lieu;
                            }
                            s += '<br/><b>Terrain:</b> ' + numeral(entree.qte).format('0,0') + ' cm²';
                            s += '<br/><b>TDC après:</b> ' + numeral(this.y).format('0,0') + ' cm²';
                            
                            // Détails spécifiques selon le type
                            if (entree.details) {
                                s += '<br/><b>Détails:</b><br/>' + entree.details.replace(/<br>/g, ' | ');
                            }
                        } else {
                            // Point de la courbe principale (solde)
                            s += '<br/><span style="color:' + this.series.color + '">●</span> ' + this.series.name + ': <b>' + numeral(this.y).format('0,0') + ' cm²</b>';
                        }
                        
                        return s;
                    },
                    shared: false,
                    useHTML: true,
                    style: {
                        fontSize: '11px'
                    }
                },
                plotOptions: {
                    spline: {
                        marker: { 
                            enabled: true, 
                            radius: 3,
                            lineWidth: 1
                        },
                        lineWidth: 2,
                        states: {
                            hover: {
                                lineWidth: 3
                            }
                        }
                    },
                    scatter: {
                        marker: {
                            radius: 5,
                            lineWidth: 2
                        }
                    }
                },
                series: [{
                    name: 'Évolution TDC',
                    data: donneesGraphique.solde,
                    color: '#007bff',
                    zIndex: 1
                }, {
                    name: 'Butin',
                    type: 'scatter',
                    data: donneesGraphique.butin,
                    color: '#28a745',
                    marker: {
                        symbol: 'triangle',
                        radius: 6
                    },
                    zIndex: 2
                }, {
                    name: 'Vol',
                    type: 'scatter',
                    data: donneesGraphique.vol,
                    color: '#dc3545',
                    marker: {
                        symbol: 'triangle-down',
                        radius: 6
                    },
                    zIndex: 2
                }, {
                    name: 'Chasse',
                    type: 'scatter',
                    data: donneesGraphique.chasse,
                    color: '#20c997',
                    marker: {
                        symbol: 'diamond',
                        radius: 6
                    },
                    zIndex: 2
                }],
                legend: {
                    itemStyle: { color: couleurs.texte },
                    itemHoverStyle: { color: couleurs.texte }
                }
            });
        } catch (error) {
            console.warn("Erreur lors de la création du graphique:", error);
        }
    }

    /**
     * Obtient les statistiques de l'historique
     * 
     * @method getStatistiques
     * @return {Object} Statistiques de l'historique
     */
    getStatistiques()
    {
        const historique = this.chargerHistorique();
        const stats = {
            totalEntrees: Object.keys(historique).length,
            totalButin: 0,
            totalVol: 0,
            totalChasse: 0,
            soldeTotal: 0,
            attaquesReussies: 0,
            attaquesEchouees: 0,
            rebellionsReussies: 0,
            chassesReussies: 0,
            derniereActivite: null
        };
        
        Object.values(historique).forEach(entree => {
            switch(entree.type) {
                case "Butin":
                    stats.totalButin += entree.qte;
                    stats.soldeTotal += entree.qte;
                    break;
                case "Vol":
                    stats.totalVol += entree.qte;
                    stats.soldeTotal -= entree.qte;
                    break;
                case "Chasse réussie":
                    stats.totalChasse += entree.qte;
                    stats.soldeTotal += entree.qte;
                    stats.chassesReussies++;
                    break;
                case "Attaque réussie":
                    stats.attaquesReussies++;
                    break;
                case "Attaque échouée":
                    stats.attaquesEchouees++;
                    break;
                case "Rébellion réussie":
                    stats.rebellionsReussies++;
                    break;
            }
            
            if (!stats.derniereActivite || new Date(entree.date) > new Date(stats.derniereActivite)) {
                stats.derniereActivite = entree.date;
            }
        });
        
        return stats;
    }

}
