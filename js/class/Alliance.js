/*
 * Alliance.js
 * Hraesvelg
 **********************************************************************/

/**
* Classe pour creer et gérer une alliance
*
* @class Alliance
*/
class Alliance
{
    constructor(parametres)
    {
        /**
        * tag de l'alliance
        */
        this._tag = parametres["tag"];
        /**
        * nom de l'alliance
        */
        this._nom = parametres["nom"] || "";
        /**
        * terrain globale de l'alliance
        */
        this._terrain = parametres["terrain"] || -1;
        /**
        *
        */
        this._fourmiliere = parametres["fourmiliere"] || -1;
        /**
        *
        */
        this._technologie = parametres["technologie"] || -1;
        /**
        * liste des joueurs
        */
        this._joueurs = {};
        if(parametres.hasOwnProperty("joueurs"))
            for(let pseudo in parametres["joueurs"])
                this._joueurs[pseudo] = new Joueur(parametres["joueurs"][pseudo]);
        /**
        *
        */
        this._ordreRadar = parametres["ordreRadar"] || 0;
        /**
        *
        */
        this._sujetForum = parametres["sujetForum"] || -1;
    }
    /**
    *
    */
    get tag()
    {
        return this._tag;
    }
    /**
    *
    */
    set tag(newTag)
    {
        this._tag = newTag;
    }
    /**
    *
    */
    get nom()
    {
        return this._nom;
    }
    /**
    *
    */
    set nom(newNom)
    {
        this._nom = newNom;
    }
    /**
    *
    */
    get terrain()
    {
        return this._terrain;
    }
    /**
    *
    */
    set terrain(newTerrain)
    {
        this._terrain = newTerrain;
    }
    /**
    *
    */
    get joueurs()
    {
        return this._joueurs;
    }
    /**
    *
    */
    set joueurs(newJoueurs)
    {
        this._joueurs = newJoueurs;
    }
    /**
    *
    */
    get ordreRadar()
    {
        return this._ordreRadar;
    }
    /**
    *
    */
    set ordreRadar(newOrdre)
    {
        this._ordreRadar = newOrdre;
    }
    /**
    *
    */
    get sujetForum()
    {
        return this._sujetForum;
    }
    /**
    *
    */
    set sujetForum(newSujet)
    {
        this._sujetForum = newSujet;
    }
    /**
    *
    */
    calculTerrain()
    {
        this._terrain = Object.keys(this._joueurs).reduce((acc, key) => {return acc + this._joueurs[key].terrain;}, 0);
        return this._terrain;
    }
    /**
    *
    */
    calculTechnologie()
    {
        this._technologie = Object.keys(this._joueurs).reduce((acc, key) => {return acc + this._joueurs[key].technologie;}, 0);
        return this._technologie;
    }
    /**
    *
    */
    calculFourmiliere()
    {
        this._fourmiliere = Object.keys(this._joueurs).reduce((acc, key) => {return acc + this._joueurs[key].fourmiliere;}, 0);
        return this._fourmiliere;
    }
    /**
    *
    */
    toJSON()
    {
        return {tag : this._tag, joueurs : this._joueurs, terrain : this._terrain, technologie : this._technologie, fourmiliere : this._fourmiliere, ordreRadar : this._ordreRadar, sujetForum : this._sujetForum};
    }
    /**
	* Récupére la description d'une alliance.
    *
	* @private
	* @method getDescription
	*/
    getDescription()
    {
        return $.ajax({url : "http://" + Utils.serveur + ".fourmizzz.fr/classementAlliance.php?alliance=" + this._tag});
    }
    /**
    *
    */
    getHistorique(id)
    {
        // Récuperation des données
		$.get("http://outiiil.fr/fzzz/" + Utils.serveur + "/team/" + this._tag, (data) => {
			// Creation du graphique
            let donnees = JSON.parse(data);
			let chart = new Highcharts.Chart({
				chart : {
					renderTo : id,
					type : "spline",
					backgroundColor : null,
					height : 320
				},
                data : {
                    csv : donnees.message,
                    itemDelimiter: ';',
                    firstRowAsNames : false
                },
				title : {text: ''},
				credits : {enabled : false},
				tooltip : {
					crosshairs : [true],
					formatter : function(){
						let s = Highcharts.dateFormat("%A %e %b", this.x);
						$.each(this.points, function(){s += "<br/><span style='color:" + this.series.color + "'>\u25CF</span> " + this.series.name + ": <b>" + numeral(this.y).format() + "</b>";});
						return s;
					},
					shared : true,
					useHTML : true
				},
                plotOptions : {
                    series : {
                        marker : {
                            radius : 3
                        }
                    }
                },
				xAxis : {
					lineColor : "#333333",
					labels : {style : {color : "#222222"}},
                    min : moment().subtract(30, "days").valueOf()
				},
				yAxis : {
					lineColor : "#333333",
					gridLineColor : "#333333",
					labels : {align : "left", x : 0, y : -2, style : {color : "#222222"}},
                    title : {text : null}
				},
				series : [
                    {name : "Membre", color : "#013ADF", visible : false},
					{name : "Terrain", color : "#21610B", type : "areaspline"},
					{name : "Fourmilière", color : "#DF7401", type : "areaspline", visible : false},
					{name : "Technologie", color : "#FF0000", type : "areaspline", visible : false}
				]
			});

			$("span[id^=o_selectHisto]").click((e) => {
				let chart = $("#o_chartAlliance").highcharts(), histo = $(e.currentTarget).attr("data");
				$("span[id^=o_selectHisto]").removeClass("active");
				$(e.currentTarget).addClass("active");
				if(histo == "all")
					chart.xAxis[0].update({min : moment("2016-01-01").valueOf()});
				else
					chart.xAxis[0].update({min : moment().subtract(histo, "days").valueOf()});
                $("#o_bouton_range span.active").addClass("ligne_paire");
                $("#o_bouton_range span:not(.active)").removeClass("ligne_paire");
			});
		});
        return this;
    }
    /**
    *
    */
    getLigneRadar(radar, id, indice)
    {
        $(id).append(`<tr id="o_item_${indice}" class="lien"><td><a id="o_maj_${this._tag}" class='o_actualiser' href=""><img src="${IMG_ACTUALISER}" alt="rang" height="20"/></a></td><td class="left"><a class="gras" href="classementAlliance.php?alliance=${this._tag}">${this._tag}</a></td><td id="o_terrain_${this._tag}" class="right reduce" title="">${numeral(this._terrain).format()}</td></tr>`);
        // event
        $("#o_maj_" + this._tag).click((e) => {
            let oldTerrain = numeral($("#o_terrain_" + this._tag).text()).value();
            $({deg : 0}).animate({deg : 360}, {duration : 600, step : (now) => {$(e.currentTarget).find("img").css({transform: "rotate(" + now + "deg)"});}});
            this.getDescription().then((data) => {
                this._terrain = 0;
				$(data).find("#tabMembresAlliance tr:gt(0)").each((i, elt) => {this._terrain += numeral($(elt).find("td:eq(4)").text()).value();});
                let diff = this._terrain - oldTerrain;
                if(diff){
                    $("#o_terrain_" + this._tag).text(numeral(this._terrain).format())
                        .effect("highlight", {color : (diff > 0 ? "#458D58" : "#8D4545")}, 1000)
                        .attr("title", numeral(diff).format())
                        .tooltip({
                            position : {my : "left+10 center", at : "right center"},
                            content : `<span class='${diff > 0 ? "green_light" : "red_xlight"}'>${diff > 0 ? "+ " + $("#o_terrain_" + this._tag).attr("title") : $("#o_terrain_" + this._tag).attr("title")} cm²</span>`,
                            hide : {effect: "fade", duration: 10},
                            tooltipClass : "warning-tooltip ui-tooltip-right"
                        }).tooltip("open");
                    radar.sauvegarder();
                }
            });
            return false;
        });
        return this;
    }
    /**
    *
    */
    static rechercher(elt)
    {
        return $.ajax({
            type : "post",
            url : "http://" + Utils.serveur + ".fourmizzz.fr/classementAlliance.php",
            data : {
                "requete" : elt,
                "recherche" : 1,
                "prioriteRecherche" : "alliance"
            }
        });
    }

    /**
     * Récupère les membres de l'alliance depuis alliance.php
     */
    static recupererMembres()
    {
        const defer = $.Deferred();
        
        $.post(`http://${Utils.serveur}.fourmizzz.fr/alliance.php?Membres`, {
            xajax: "membre",
            xajaxr: new Date().getTime()
        }, function(data) {
            try {
                const page = $(data).find('cmd[t="alliance"]').html();
                
                if (!page) {
                    defer.reject("Aucune page trouvée");
                    return;
                }
                
                const membres = Alliance.analyserMembres(page);
                
                // Sauvegarder dans localStorage
                localStorage.setItem("outiiil_alliance", JSON.stringify({
                    membres: membres,
                    timestamp: new Date().toISOString()
                }));
                
                defer.resolve(membres);
            } catch (error) {
                console.warn("Erreur lors de la récupération des membres d'alliance:", error);
                defer.reject(error);
            }
        }).fail(function(xhr, status, error) {
            console.warn("Erreur AJAX:", status, error);
            defer.reject(error);
        });
        
        return defer.promise();
    }

    /**
     * Analyse le HTML des membres d'alliance
     */
    static analyserMembres(pageHtml)
    {
        const array = [];
        const headers = [];

        // Récupérer les en-têtes
        $(pageHtml).find('#tabMembresAlliance th').each(function(index, item) {
            if ($(item).html() !== "") {
                headers[index] = $(item).text();
            } else {
                headers[index] = index;
            }
        });

        headers.splice(6, 0, 'new');

        // Analyser chaque ligne de membre
        const trElements = $(pageHtml).find('#tabMembresAlliance tr').has('td');
        
        trElements.each(function(rowIndex, row) {
            const arrayItem = {};
            arrayItem.colo = "";
            
            $('td', $(row)).each(function(index, item) {
                const cont = $(item).html();
                const text = $(item).text();
                
                if (cont.match(/Colonisé/)) {
                    arrayItem.colo = cont;
                } else if (cont.match(/Actif/)) {
                    arrayItem.etat = "Actif";
                } else if (cont.match(/Inactif depuis 3 jours/)) {
                    arrayItem.etat = "Inactif depuis 3 jours";
                } else if (cont.match(/Inactif depuis 10 jours/)) {
                    arrayItem.etat = "Inactif depuis 10 jours";
                } else if (cont.match(/Vacances/)) {
                    arrayItem.etat = "Vacances";
                } else if (cont.match(/Bannie/)) {
                    arrayItem.etat = "Bannie";
                } else {
                    arrayItem[headers[index]] = cont;
                }
            });
            array.push(arrayItem);
        });

        // Transformer en format standardisé
        const membres = {};
        $.each(array, function(index, ligne) {
            const membre = {
                pseudo: $(ligne.Pseudo).filter('a').text(),
                rang: ligne.Rang,
                terrain: ligne.Terrain,
                etat: ligne.etat,
                colo: ligne.colo,
                technologie: ligne.Technologie,
                fourmiliere: ligne.Fourmiliere,
                defense: false,
                attaque: false
            };

            // Calculer les possibilités d'attaque/défense
            if (ligne.Terrain && monProfil.terrain) {
                const terrainMembre = parseInt(ligne.Terrain);
                const terrainJoueur = parseInt(monProfil.terrain);
                membre.defense = 0.5 * terrainMembre + 1 <= terrainJoueur && 3 * terrainMembre - 1 >= terrainJoueur;
                membre.attaque = terrainMembre >= 0.5 * terrainJoueur + 1 && terrainMembre <= 3 * terrainJoueur - 1;
            }

            membres[membre.pseudo] = membre;
        });

        return membres;
    }

    /**
     * Charge les membres depuis localStorage
     */
    static chargerMembres()
    {
        try {
            const data = JSON.parse(localStorage.getItem("outiiil_alliance")) || {};
            return data.membres || {};
        } catch (error) {
            console.warn("Erreur lors du chargement des membres d'alliance:", error);
            return {};
        }
    }

    /**
     * Force la mise à jour des membres depuis la page actuelle
     */
    static mettreAJourDepuisPage()
    {
        try {
            // Vérifier si la session est expirée
            if ($('body').text().includes('Session expirée') || $('body').text().includes('Merci de vous reconnecter')) {
                return {};
            }
            
            // Chercher le tableau des membres directement
            const tableMembres = $('#tabMembresAlliance');
            
            if (tableMembres.length === 0) {
                return {};
            }
            
            const membres = Alliance.analyserMembres(tableMembres[0].outerHTML);
            
            // Sauvegarder dans localStorage
            localStorage.setItem("outiiil_alliance", JSON.stringify({
                membres: membres,
                timestamp: new Date().toISOString()
            }));
            
            // Rafraîchir l'affichage si ComptePlus est disponible
            if (window.boiteComptePlus && typeof window.boiteComptePlus.afficherMembresAlliance === 'function') {
                setTimeout(() => {
                    window.boiteComptePlus.afficherMembresAlliance();
                }, 100);
            }
            
            return membres;
        } catch (error) {
            console.warn("Erreur lors de la mise à jour depuis la page:", error);
            return {};
        }
    }
}
