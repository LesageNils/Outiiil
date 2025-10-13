/*
 * Forum.js
 * Gestion du forum d'alliance pour Outiiil
 * Auteur: Hraesvelg
 **********************************************************************/

/**
 * Classe pour gérer les interactions avec le forum d'alliance
 * Permet de créer, modifier et consulter les sections et sujets du forum
*
* @class PageForum
* @constructor
*/
class PageForum
{
    /**
     * Constructeur de la classe PageForum
     */
    constructor()
    {
        /**
         * Liste des commandes du forum
         * @type {Object}
         * @private
        */
        this._commande = {};
        
        /**
         * Informations sur l'alliance
         * @type {Alliance|null}
         * @private
        */
        this._monAlliance = null;
    }

    // ========================================
    // GETTERS ET SETTERS
    // ========================================

    /**
     * Getter pour la liste des commandes
     * @return {Object} Liste des commandes
    */
    get commande()
    {
        return this._commande;
    }

    /**
     * Setter pour la liste des commandes
     * @param {Object} newCommande - Nouvelle liste de commandes
    */
    set commande(newCommande)
    {
        this._commande = newCommande;
    }

    /**
     * Getter pour l'alliance
     * @return {Alliance|null} Informations sur l'alliance
    */
    get alliance()
    {
        return this._monAlliance;
    }

    /**
     * Setter pour l'alliance
     * @param {Alliance} newAlliance - Nouvelles informations d'alliance
    */
    set alliance(newAlliance)
    {
        this._monAlliance = newAlliance;
    }

    // ========================================
    // GESTION DES SECTIONS
    // ========================================

    /**
     * Crée une nouvelle section dans le forum
    *
     * @method creerSection
     * @param {String} nomSection - Nom de la section à créer
     * @return {Promise} Promise de la requête AJAX
    */
    creerSection(nomSection)
    {
        return $.ajax({
            type: "post",
            url: `http://${Utils.serveur}.fourmizzz.fr/alliance.php?forum_menu`,
            data: {
                "xajax": "ajoutCategorie",
                "xajaxargs[]": `<xjxquery><q>nom=${nomSection}</q></xjxquery>`,
                "xajaxr": moment().valueOf()
            }
        });
    }

    /**
     * Cherche une section dans le forum par son nom
    *
     * @method chercherSection
     * @param {String} nomSection - Nom de la section à chercher
     * @return {Promise<String>} Promise retournant l'ID de la section ou "0" si non trouvée
    */
   chercherSection(nomSection)
   {
        return $.ajax({
            type: "get",
            url: `http://${Utils.serveur}.fourmizzz.fr/alliance.php`,
            data: { forum_menu: "" },
            dataType: "html"
        }).then((page) => {
            try {
                // Parser la réponse XML
                const $response = $(page);
                
                // Extraire le contenu CDATA de la commande "alliance"
                const cmdAlliance = $response.find('cmd[n="as"][t="alliance"]');
                if (cmdAlliance.length === 0) {
                    return "0";
                }
                
                const contenuCDATA = cmdAlliance.attr('p') === 'innerHTML' ? 
                    cmdAlliance.text() : cmdAlliance.html();
                
                // Parser le contenu HTML des sections
                const $contenu = $(contenuCDATA);
                
                // Chercher toutes les sections (spans avec classe forum + ID)
                const sections = $contenu.find('span[class^="forum"]');
                
                let idSection = "0";
                
                sections.each((index, element) => {
                    const $section = $(element);
                    const nomSectionActuelle = $section.text().trim();
                    
                    // Vérifier si le nom correspond (insensible à la casse)
                    if (nomSectionActuelle.toLowerCase() === nomSection.toLowerCase()) {
                        // Extraire l'ID de la section depuis la classe (forumXXXX)
                        const classe = $section.attr('class');
                        const matchId = classe.match(/forum(\d+)/);
                        
                        if (matchId) {
                            idSection = matchId[1];
                            console.log(`Section "${nomSection}" trouvée avec l'ID:`, idSection);
                            return false; // Sortir de la boucle each
                        }
                    }
                });
                
                if (idSection === "0") {
                    console.log(`Section "${nomSection}" non trouvée`);
                }
                
                return idSection;
                
            } catch (error) {
                console.warn("Erreur lors de l'analyse de la réponse du forum:", error);
                return "0";
            }
        });
    }

    /**
     * Modifie une section existante
     * 
     * @method modifierSection
     * @param {String} nomSection - Nouveau nom de la section
     * @param {String} id - ID de la section à modifier
     * @param {String} categorie - Type de catégorie
     * @return {Promise} Promise de la requête AJAX
    */
    modifierSection(nomSection, id, categorie)
    {
        return $.ajax({
            type: "post",
            url: `http://${Utils.serveur}.fourmizzz.fr/alliance.php?forum_menu`,
            data: {
                "xajax": "renommerCategorie",
                "xajaxargs[]": `<xjxquery><q>nom=${nomSection}&type=${categorie}&ID_cat=${id}&del=Supprimer</q></xjxquery>`,
                "xajaxr": moment().valueOf()
            }
        });
    }

    /**
     * Consulte une section du forum
    *
     * @method consulterSection
     * @param {String} id - ID de la section à consulter
     * @return {Promise} Promise de la requête AJAX
    */
    consulterSection(id)
    {
        return $.ajax({
            type: "post",
            url: `http://${Utils.serveur}.fourmizzz.fr/alliance.php?forum_menu`,
            data: {
                "xajax": "callGetForum",
                "xajaxargs[]": id,
                "xajaxr": moment().valueOf()
            }
        });
    }

    // ========================================
    // GESTION DES SUJETS
    // ========================================

    /**
     * Crée un nouveau sujet dans une section
     * 
     * @method creerSujet
     * @param {String} nomSujet - Nom du sujet
     * @param {String} contenu - Contenu du sujet
     * @param {String} id - ID de la section
     * @param {String} type - Type de sujet (défaut: "normal")
     * @return {Promise} Promise de la requête AJAX
    */
    creerSujet(nomSujet, contenu, id, type = "normal")
    {
        return $.ajax({
            type: "post",
            url: `http://${Utils.serveur}.fourmizzz.fr/alliance.php?forum_menu`,
            data: {
                "xajax": "envoiNouveauSujet",
                "xajaxargs[]": `<xjxquery><q>cat=${id}&sujet=${nomSujet}&message=${encodeURIComponent(contenu)}&type=${type}&modifiable=envoyer&send=Envoyer&question=&reponse[]=&reponse[]=&reponse[]=</q></xjxquery>`,
                "xajaxr": moment().valueOf()
            }
        });
    }

    /**
     * Modifie un sujet existant
    *
     * @method modifierSujet
     * @param {String} nomSujet - Nouveau nom du sujet
     * @param {String} contenu - Nouveau contenu
     * @param {String} id - ID du sujet à modifier
     * @return {Promise} Promise de la requête AJAX
    */
    modifierSujet(nomSujet, contenu, id)
    {
        return $.ajax({
            type: "post",
            url: `http://${Utils.serveur}.fourmizzz.fr/alliance.php?forum_menu`,
            data: {
                "xajax": "envoiEditTopic",
                "xajaxargs[]": `<xjxquery><q>IDTopic=${id}&sujet=${nomSujet}&message=${encodeURIComponent(contenu)}&modifiable=envoyer&send=Envoyer</q></xjxquery>`,
                "xajaxr": moment().valueOf()
            }
        });
    }

    /**
     * Consulte un sujet du forum
    *
     * @method consulterSujet
     * @param {String} id - ID du sujet à consulter
     * @return {Promise} Promise de la requête AJAX
    */
    consulterSujet(id)
    {
        return $.ajax({
            type: "post",
            url: `http://${Utils.serveur}.fourmizzz.fr/alliance.php?forum_menu`,
            data: {
                "xajax": "callGetTopic",
                "xajaxargs[]": id,
                "xajaxr": moment().valueOf()
            }
        });
    }

    /**
     * Envoie un message dans un sujet
    *
     * @method envoyerMessage
     * @param {String} id - ID du sujet
     * @param {String} message - Contenu du message
     * @return {Promise} Promise de la requête AJAX
    */
    envoyerMessage(id, message)
    {
        return $.ajax({
            type: "post",
            url: `http://${Utils.serveur}.fourmizzz.fr/alliance.php?forum_menu`,
            data: {
                "xajax": "envoiNouveauMessage",
                "xajaxargs[]": `<xjxquery><q>topic=${id}&message=${message}&send=Envoyer</q></xjxquery>`,
                "xajaxr": moment().valueOf()
            }
        });
    }

    // ========================================
    // INITIALISATION ET OBSERVATION
    // ========================================

    /**
     * Initialise l'observateur du forum et lance le traitement
    *
     * @method executer
     * @return {PageForum} Instance de la classe pour le chaînage
    */
    executer()
    {
        // Si le forum est déjà chargé, lance le traitement
        console.log("Initialisation du forum");
        if ($("#cat_forum").length) {
            this.traitementSection("#alliance");
        }
        
        // Récupération des données du forum pour communiquer
        const observer = new MutationObserver((mutationsList) => {
            mutationsList.forEach((mutation) => {
                this.traitementSection(mutation.target);
            });
        });
        
        observer.observe($("#alliance")[0], { childList: true });
        return this;
    }

    /**
     * Traite les sections du forum et ajoute les fonctionnalités Outiiil
    *
     * @method traitementSection
     * @param {jQuery|String} element - Élément à traiter
     * @return {PageForum} Instance de la classe pour le chaînage
    */
    traitementSection(element)
    {
        // Ajouter les options pour Outiiil
        if ($(element).find("div.simulateur").length) {
            this.optionAdmin();
        }
        
        // Enregistrer les IDs des topics si on utilise l'utilitaire
        if (!monProfil.parametre["forumCommande"].valeur && 
            $(element).find("span[class^='forum']:contains('Outiiil_Commande')").length) {
            monProfil.parametre["forumCommande"].valeur = 
                $(element).find("span[class^='forum']:contains('Outiiil_Commande')")
                    .attr("class").match(/\d+/)[0];
            monProfil.parametre["forumCommande"].sauvegarde();
        }
        
        if (!monProfil.parametre["forumMembre"].valeur && 
            $(element).find("span[class^='forum']:contains('Outiiil_Membre')").length) {
            monProfil.parametre["forumMembre"].valeur = 
                $(element).find("span[class^='forum']:contains('Outiiil_Membre')")
                    .attr("class").match(/\d+/)[0];
            monProfil.parametre["forumMembre"].sauvegarde();
        }
        
        // Enregistrer l'ID de la section historique TDC si elle existe
        if (!monProfil.parametre["forumHistoTDC"].valeur && 
            $(element).find("span[class^='forum']:contains('Outiiil_HistoTDC')").length) {
            monProfil.parametre["forumHistoTDC"].valeur = 
                $(element).find("span[class^='forum']:contains('Outiiil_HistoTDC')")
                    .attr("class").match(/\d+/)[0];
            monProfil.parametre["forumHistoTDC"].sauvegarde();
        }
        
        // Selon la section ACTIVE, ajouter les outils nécessaires
        const sectionActive = $(element).find("span[class^='forum'][class$='ligne_paire']").html();
        switch (sectionActive) {
            case "Outiiil_Commande":
                // Vérifier si on est dans un sujet mais bien sur la liste des topics
                if ($("#form_cat").length && !$("#o_afficherEtat").length) {
                    this.optionAdminCommande();
                }
                break;
            default:
                break;
        }
        
        return this;
    }

    // ========================================
    // CHARGEMENT DES DONNÉES
    // ========================================

    /**
     * Charge les commandes depuis les données du forum
    *
     * @method chargerCommande
     * @param {String} data - Données HTML du forum
     * @return {Boolean} True si le chargement a réussi
    */
    chargerCommande(data)
    {
        const response = $(data).find("cmd:eq(1)").text();
        
        if (response.includes("Vous n'avez pas accès à ce forum.")) {
            $.toast({
                ...TOAST_ERROR, 
                text: "L'identifiant du sujet pour les commandes est erroné."
            });
            return false;
        }
        
            let commande = null;
            $("<div/>").append(response).find("#form_cat tr:gt(0)").each((i, elt) => {
            const titreSujet = $(elt).find("td:eq(1)").text().trim();
            let id = -1;
            
            // Les lignes des commandes ont 3 td et du contenu
            if (titreSujet) {
                    id = $(elt).find("a.topic_forum").attr("onclick").match(/\d+/)[0];
                    commande = new Commande();
                this._commande[id] = commande.parseUtilitaire(
                    id, 
                    $(elt).next().find("a").text(), 
                    titreSujet.split("] ")[0].split("[")[1], 
                    titreSujet.split("] ")[1].split(" / "), 
                    $(elt).find("td:last :not(a)").contents().filter(function() {
                        return (this.nodeType === 3);
                    }).text()
                );
            }
        });
        
            return true;
    }

    /**
     * Charge les joueurs depuis les données du forum
    *
     * @method chargerJoueur
     * @param {String} data - Données HTML du forum
     * @return {Boolean} True si le chargement a réussi
    */
    chargerJoueur(data)
    {
        const response = $(data).find("cmd:eq(1)").text();
        
        if (response.includes("Vous n'avez pas accès à ce forum.")) {
            $.toast({
                ...TOAST_ERROR, 
                text: "L'identifiant du sujet pour les membres est erroné."
            });
            return false;
        }
        
        const joueurs = {};
            $("<div/>").append(response).find("#form_cat tr:gt(0)").each((i, elt) => {
            const titreSujet = $(elt).find("td:eq(1)").text().trim();
            const id = $(elt).find("input[name='topic[]']").val();
            
            // Les lignes des commandes ont 3 td et du contenu
            if (titreSujet) {
                const infos = titreSujet.split(" / ");
                joueurs[infos[0]] = {
                    id: infos[1], 
                    pseudo: infos[0], 
                    x: infos[2], 
                    y: infos[3], 
                    sujetForum: id
                };
                
                if (infos.length > 4) {
                        joueurs[infos[0]].rang = infos[4];
                        joueurs[infos[0]].ordreRang = infos[5];
                    }
                }
            });
        
        this._monAlliance = new Alliance({
            tag: Utils.alliance, 
            joueurs: joueurs
        });
        
            return true;
    }

    // ========================================
    // INTERFACE UTILISATEUR
    // ========================================

    /**
     * Ajoute les options d'administration du forum
    *
     * @method optionAdmin
     * @return {PageForum} Instance de la classe pour le chaînage
    */
    optionAdmin()
    {
        // Il faut être chef pour préparer le forum
        if ($("img[src='images/icone/outil.gif']").length && !$("#o_afficheMenuUtilitaire").length) {
            console.log("Affichage du menu utilitaire");
            
            $("#cat_forum").prepend(`
                <span id="o_afficheMenuUtilitaire" class="o_forumOption categorie_forum">
                    <img src="${IMG_OUTIIIL}" alt="outiiil"/>
                </span>
                <span id="o_menuUtilitaire" class="ligne_paire o_prepareUtilitaire">
                    <a href="#" id="o_creerUtilitaire">» Préparer le forum pour un SDC</a><br/>
                    <a href="#" id="o_preparerGuerre">» Préparer une section pour une guerre</a>
                </span>
            `);
            
            $("#o_afficheMenuUtilitaire").click((e) => {
                $("#o_menuUtilitaire").toggle();
                return false;
            });
            
            // Ajout de l'input pour la sélection du tag alliance
            $("#alliance .simulateur").append(`
                <div id="o_formGuerre" style="display:none;">
                    <input id="o_tagGuerre" type="text"/> 
                    <button id="o_creerSectionGuerre">Créer section</button>
                </div>
            `);
            
            // Création de l'utilitaire
            $("#o_creerUtilitaire").click((e) => {
                this._creerSectionsUtilitaire();
                return false;
            });
            
            // Préparation d'une guerre
            $("#o_preparerGuerre").click((e) => {
                $("#o_formGuerre").toggle();
            });
            
            this._configurerAutocompleteGuerre();
            this._configurerBoutonGuerre();
        }
        
        return this;
    }

    /**
     * Ajoute les options d'administration des commandes
    *
     * @method optionAdminCommande
     * @return {PageForum} Instance de la classe pour le chaînage
    */
    optionAdminCommande()
    {
        if ($("img[src='images/icone/outil.gif']").length) {
            let options = "";
            for (let etat in ETAT_COMMANDE) {
                options += `<option value="${ETAT_COMMANDE[etat]}">${etat}</option>`;
            }
            
            $("#form_cat td:last")
                .prepend(`<img class="cursor" id="o_afficherEtat" src="${IMG_CHANGE}" height="16" alt="changer" title="Changer l'état des commandes sélectionnées"/>`)
                .append(`<select id="o_selectEtatCommande" style="display:none;">${options}</select> <button id="o_changerEtat" style="display:none;">Modifier l'état</button>`);
            
            $("#o_afficherEtat").click((e) => {
                $("#o_changerEtat, #o_selectEtatCommande").toggle();
            });
            
            $("#o_changerEtat").click((e) => {
                this._modifierEtatCommandes();
                return false;
            });
        }
        
        return this;
    }

    // ========================================
    // GESTION AUTOMATIQUE DES SECTIONS OUTIIIL
    // ========================================

    /**
     * Crée automatiquement la section Outiiil_HistoTDC si elle n'existe pas
     * Utilise la même logique que _creerSectionsUtilitaire()
     * 
     * @method creerSectionHistoriqueTDC
     * @return {Promise<String>} Promise retournant l'ID de la section
     */
    creerSectionHistoriqueTDC()
    {
        return new Promise((resolve) => {
            // Vérifier d'abord si l'ID est déjà stocké dans les paramètres
            if (monProfil.parametre["forumHistoTDC"] && monProfil.parametre["forumHistoTDC"].valeur) {
                console.log("Section Outiiil_HistoTDC déjà connue avec l'ID:", monProfil.parametre["forumHistoTDC"].valeur);
                resolve(monProfil.parametre["forumHistoTDC"].valeur);
                return;
            }
            
            this.chercherSection("Outiiil_HistoTDC").then((idSection) => {
                if (idSection === "0") {
                    // Créer la section si elle n'existe pas (même logique que _creerSectionsUtilitaire)
                    this.creerSection("Outiiil_HistoTDC").then((data) => {
                        const response = $("<div/>").append($(data).find("cmd:eq(1)").html());
                        const newIdSection = $(response).find(`input[value='Outiiil_HistoTDC']`)
                            .parent().attr("id").match(/\d+/)[0];
                        
                        console.log("Section Outiiil_HistoTDC créée automatiquement avec l'ID:", newIdSection);
                        
                        // Enregistrer l'ID dans les paramètres
                        if (!monProfil.parametre["forumHistoTDC"]) {
                            monProfil.parametre["forumHistoTDC"] = new Parametre("forumHistoTDC", "ID Section Historique TDC", "input", newIdSection);
                        } else {
                            monProfil.parametre["forumHistoTDC"].valeur = newIdSection;
                        }
                        monProfil.parametre["forumHistoTDC"].sauvegarde();
                        
                        resolve(newIdSection);
                    }, (error) => {
                        console.warn("Erreur lors de la création automatique de la section Outiiil_HistoTDC:", error);
                        resolve("0");
                    });
                } else {
                    // Section existe déjà, l'enregistrer dans les paramètres
                    console.log("Section Outiiil_HistoTDC existe déjà avec l'ID:", idSection);
                    
                    if (!monProfil.parametre["forumHistoTDC"]) {
                        monProfil.parametre["forumHistoTDC"] = new Parametre("forumHistoTDC", "ID Section Historique TDC", "input", idSection);
                    } else {
                        monProfil.parametre["forumHistoTDC"].valeur = idSection;
                    }
                    monProfil.parametre["forumHistoTDC"].sauvegarde();
                    
                    resolve(idSection);
                }
            });
        });
    }

    /**
     * Crée ou met à jour le sujet d'historique TDC pour le joueur
     * 
     * @method gererSujetHistoriqueTDC
     * @param {Object} donneesHistorique - Données d'historique à sauvegarder
     * @return {Promise} Promise résolue quand le sujet est géré
     */
    gererSujetHistoriqueTDC(donneesHistorique)
    {
        return new Promise((resolve) => {
            // Vérifier que les données ne sont pas vides
            if (!donneesHistorique || Object.keys(donneesHistorique).length === 0) {
                console.log("Aucune donnée d'historique à synchroniser");
                resolve();
                return;
            }
            
            // Éviter les appels multiples simultanés
            if (this._synchronisationEnCours) {
                console.log("Synchronisation déjà en cours, ignorée");
                resolve();
                return;
            }
            
            this._synchronisationEnCours = true;
            
            this.creerSectionHistoriqueTDC().then((idSection) => {
                if (idSection !== "0") {
                    const pseudoJoueur = monProfil.pseudo;
                    
                    if (!pseudoJoueur) {
                        console.warn("Pseudo du joueur non disponible pour la synchronisation");
                        resolve();
                        return;
                    }
                    
                    const contenuHistorique = JSON.stringify(donneesHistorique, null, 2);
                    
                    // Vérifier si le sujet existe déjà
                    this.consulterSection(idSection).then((data) => {
                        const response = $(data).find("cmd:eq(1)").text();
                        
                        // Vérifier plus précisément si le sujet du joueur existe
                        const $response = $("<div/>").append(response);
                        let sujetExiste = false;
                        $response.find("#form_cat tr:gt(0)").each((i, elt) => {
                            const titreSujet = $(elt).find("td:eq(1)").text().trim();
                            if (titreSujet === pseudoJoueur) {
                                sujetExiste = true;
                                return false; // Sortir de la boucle
                            }
                        });
                        
                        if (!sujetExiste) {
                            // Créer le sujet
                            this.creerSujet(pseudoJoueur, contenuHistorique, idSection).then(() => {
                                console.log(`Sujet d'historique TDC créé pour ${pseudoJoueur}`);
                                this._synchronisationEnCours = false;
                                resolve();
                            }, (error) => {
                                console.warn("Erreur lors de la création du sujet d'historique TDC:", error);
                                this._synchronisationEnCours = false;
                                resolve();
                            });
                        } else {
                            // Mettre à jour le sujet existant
                            this._mettreAJourSujetHistoriqueTDC(idSection, pseudoJoueur, contenuHistorique, response).then(() => {
                                this._synchronisationEnCours = false;
                                resolve();
                            });
                        }
                    }, (error) => {
                        console.warn("Erreur lors de la consultation de la section historique TDC:", error);
                        this._synchronisationEnCours = false;
                        resolve();
                    });
                } else {
                    console.warn("Impossible de créer ou accéder à la section Outiiil_HistoTDC");
                    this._synchronisationEnCours = false;
                    resolve();
                }
            });
        });
    }

    // ========================================
    // MÉTHODES PRIVÉES
    // ========================================

    /**
     * Crée les sections utilitaire (Commande et Membre)
     * 
     * @method _creerSectionsUtilitaire
     * @private
     */
    _creerSectionsUtilitaire()
    {
        // Création du sujet "Outiiil_Commande"
        if (!$(`#cat_forum span:contains(Outiiil_Commande)`).length) {
            this.creerSection("Outiiil_Commande").then((data) => {
                const response = $("<div/>").append($(data).find("cmd:eq(1)").html());
                const idCat = $(response).find(`input[value='Outiiil_Commande']`)
                    .parent().attr("id").match(/\d+/)[0];
                
                // On ne peut pas créer directement une section cachée donc on cache après
                this.modifierSection("Outiiil_Commande", idCat, "cache").then(() => {
                    $.toast({
                        ...TOAST_SUCCESS, 
                        text: "La section commande a été correctement créée."
                    });
                }, () => {
                    $.toast({
                        ...TOAST_ERROR, 
                        text: "Une erreur réseau a été rencontrée lors de la protection de la section commande."
                    });
                });
            }, () => {
                $.toast({
                    ...TOAST_ERROR, 
                    text: "Une erreur réseau a été rencontrée lors de la création de la section commande."
                });
            });
        } else {
            $.toast({
                ...TOAST_WARNING, 
                text: "Section commande est déjà créée !"
            });
        }
        
        // Création de la section membre pour les membres de l'alliance
        if (!$(`#cat_forum span:contains(Outiiil_Membre)`).length) {
                    this.creerSection("Outiiil_Membre").then((data) => {
                const response = $("<div/>").append($(data).find("cmd:eq(1)").html());
                const idCat = $(response).find(`input[value='Outiiil_Membre']`)
                    .parent().attr("id").match(/\d+/)[0];
                
                // On ne peut pas créer directement une section cachée donc on cache après
                this.modifierSection("Outiiil_Membre", idCat, "cache").then(() => {
                    $.toast({
                        ...TOAST_SUCCESS, 
                        text: "La section membre a été correctement créée."
                    });
                }, () => {
                    $.toast({
                        ...TOAST_ERROR, 
                        text: "Une erreur réseau a été rencontrée lors de la protection de la section membre."
                    });
                });
            }, () => {
                $.toast({
                    ...TOAST_ERROR, 
                    text: "Une erreur réseau a été rencontrée lors de la création de la section membre."
                });
            });
        } else {
            $.toast({
                ...TOAST_WARNING, 
                text: "Section membre est déjà créée !"
            });
        }
    }

    /**
     * Configure l'autocomplétion pour la sélection d'alliance en guerre
     * 
     * @method _configurerAutocompleteGuerre
     * @private
     */
    _configurerAutocompleteGuerre()
    {
            $("#o_tagGuerre").autocomplete({
            source: (request, response) => {
                Alliance.rechercher(request.term).then((data) => {
                    response(Utils.extraitRecherche(data, false, true));
                });
            },
            position: { my: "left top-6", at: "left bottom" },
            delay: 0,
            minLength: 1,
            select: (e, ui) => {
                $("#o_tagGuerre").val(ui.item.tag);
                return false;
            }
            }).data("ui-autocomplete")._renderItem = (ul, item) => {
            const style = '';
                return $("<li>").append(`<a style="${style}">${item.value_avec_html}</a>`).appendTo(ul);
            };
    }

    /**
     * Configure le bouton de création de section de guerre
     * 
     * @method _configurerBoutonGuerre
     * @private
     */
    _configurerBoutonGuerre()
    {
            $("#o_creerSectionGuerre").click((e) => {
            const alliance = new Alliance({ tag: $("#o_tagGuerre").val() });
            const titreSection = "Guerre " + alliance.tag;
            
            if (!$("#cat_forum span[class^='forum']").text().toUpperCase().includes(titreSection.toUpperCase())) {
                // On crée la section "Guerre " + tag
                    this.creerSection(titreSection).then((data) => {
                    // On récupère la section pour ajouter les sujets des joueurs
                    const response = $("<div/>").append($(data).find("cmd:eq(1)").html());
                    const idCat = $(response).find(`input[value='${titreSection}']`)
                        .parent().attr("id").match(/\d+/)[0];
                    
                        alliance.getDescription().then((data) => {
                        // On construit les appels de création des sujets
                        const promiseJoueur = [];
                            $(data).find("#tabMembresAlliance tr:gt(0)").each((i, elt) => {
                            const pseudo = $(elt).find("td:eq(2)").text();
                                promiseJoueur.push(this.creerSujet(pseudo, `[player]${pseudo}[/player]`, idCat));
                            });
                        
                        // On crée les sujets
                        Promise.all(promiseJoueur).then(() => {
                            location.reload();
                        });
                    }, () => {
                        $.toast({
                            ...TOAST_ERROR, 
                            text: "Une erreur réseau a été rencontrée lors de la récupération de la description."
                        });
                    });
                }, () => {
                    $.toast({
                        ...TOAST_ERROR, 
                        text: "Une erreur réseau a été rencontrée lors de la création de la section guerre."
                    });
                });
            } else {
                $.toast({
                    ...TOAST_WARNING, 
                    text: `La section "Guerre ${alliance.tag}" existe déjà !`
                });
            }
        });
    }

    /**
     * Met à jour le contenu du sujet d'historique TDC existant
     * 
     * @private
     * @method _mettreAJourSujetHistoriqueTDC
     * @param {String} idSection - ID de la section
     * @param {String} pseudoJoueur - Pseudo du joueur
     * @param {String} contenuHistorique - Contenu JSON de l'historique
     * @param {String} response - Réponse HTML de la section
     * @return {Promise} Promise résolue quand la mise à jour est terminée
     */
    _mettreAJourSujetHistoriqueTDC(idSection, pseudoJoueur, contenuHistorique, response)
    {
        return new Promise((resolve) => {
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
                this.modifierSujet(pseudoJoueur, contenuHistorique, idSujet).then(() => {
                    console.log(`Sujet d'historique TDC mis à jour pour ${pseudoJoueur}`);
                    resolve();
                }, (error) => {
                    console.warn("Erreur lors de la mise à jour du sujet d'historique TDC:", error);
                    resolve();
                });
            } else {
                console.warn("Impossible de trouver l'ID du sujet d'historique TDC pour", pseudoJoueur);
                resolve();
            }
        });
    }

    /**
     * Modifie l'état des commandes sélectionnées
     * 
     * @method _modifierEtatCommandes
     * @private
     */
    _modifierEtatCommandes()
    {
        const promiseCmdModif = [];
        
                $("#form_cat tr:gt(0)").each((i, elt) => {
            // Si la commande est sélectionnée
            if ($(elt).find("input[name='topic[]']:checked").length) {
                const titreSujet = $(elt).find("td:eq(1)").text().trim();
                const id = $(elt).find("input[name='topic[]']").val();
                
                if (titreSujet) {
                    const commande = new Commande();
                    commande.parseUtilitaire(
                        id, 
                        $(elt).next().find("a").text(), 
                        titreSujet.split("] ")[0].split("[")[1], 
                        titreSujet.split("] ")[1].split(" / ")
                    );
                            commande.etat = $("#o_selectEtatCommande").val();
                            promiseCmdModif.push(this.modifierSujet(commande.toUtilitaire(), " ", id));
                        }
                    }
                });
        
        Promise.all(promiseCmdModif).then(() => {
            $.toast({
                ...TOAST_SUCCESS, 
                text: promiseCmdModif.length > 1 ? 
                    "Commandes mises à jour avec succès." : 
                    "Commande mise à jour avec succès."
            });
            location.reload();
        });
    }
}