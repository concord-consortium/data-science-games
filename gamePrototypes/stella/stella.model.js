
/**
 * Created by tim on 5/7/16.


 ==========================================================================
 stella.model.js in data-science-games.

 Author:   Tim Erickson

 Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 ==========================================================================


 */

/* global $, stella, Star, Spectrum, console, elementalSpectra, alert, TEEUtils */

/**
 * Overarching model class
 * Most importantly, maintains the array of Stars.
 *
 * @type {{stars: Array, now: null, epoch: null, skySpectrum: null, labSpectrum: null, newGame: stella.model.newGame, starFromTextID: stella.model.starFromTextID, starFromCaseID: stella.model.starFromCaseID, makeAllStars: stella.model.makeAllStars, installBlackbody: stella.model.installBlackbody, installDischargeTube: stella.model.installDischargeTube, evaluateResult: stella.model.evaluateResult, foo: null}}
 */
stella.model = {

    stars : [],
    skySpectrum : null,
    labSpectrum : null,

    /**
     * Called by manager.newGame().
     * Asks for all stars to be made.
     */
    newGame : function() {
        this.stars = [];

        this.makeAllStars();

        stella.model.labBlackbodyTemperature = stella.constants.solarTemperature;

    },

    /**
     * Determine which star you mean if you give it partial text
     * todo: expand to include names, when we get star names.
     * @param iText
     * @returns {*}
     */
    starFromTextID : function(iText) {
        for (var i = 0; i < this.stars.length; i++) {
            var s = this.stars[i];
            if (s.id.includes(iText)) {
                return s;
            }
        }
        return null;
    },

    /**
     * Let time pass.
     * @param iTime     currently in YEARS.
     */
    stellaElapse : function( iTime ) {
      stella.state.now += iTime;
    },

    /**
     * Gives you the Star corresponding to a caseID. Need for doing selection.
     * @param id
     * @returns {*} the Star
     */
    starFromCaseID : function( id ) {
        for (var i = 0; i < this.stars.length; i++) {
            var s = this.stars[i];
            if (s.caseID === id) {
                return s;
            }
        }
        return null;
    },

    /**
     * Create all Stars from the initial star data (its own file, raw JSON, thanks, Bill!
     */
    makeAllStars : function() {
        //  stella.share.retrieveStars();
        var dText = "<table><tr><th>id</th><th>logMass</th><th>temp</th><th>age</th><th>m</th><th>GI</th><th>dist</th></tr>";

        stella.initialStarData.forEach(
            function( isd ) {
                var s = new Star( isd );
                stella.model.stars.push( s );
                dText += s.htmlTableRow();
            }
        );
        dText += "</table>";

        $("#debugText").html(dText);
        console.log("All " + stella.initialStarData.length + " = " + stella.model.stars.length + " stars read in, " +
            "in stella.model.makeAllStars( )");
    },



    /**
     * Install the blackbody device in the lab.
     * Remember that a Spectrum is an array of lines (this has none) plus parameters.
     * No actual values until it gets channelized.
     */
    installBlackbody: function () {
        this.labSpectrum = new Spectrum();
        this.labSpectrum.hasBlackbody = true;
        this.labSpectrum.hasEmissionLines = false;
        this.labSpectrum.blackbodyTemperature = this.labBlackbodyTemperature;   //  sets this flag
        this.labSpectrum.source.id = "blackbody at " + this.labSpectrum.blackbodyTemperature + " K";
        this.labSpectrum.source.shortid = "BB_" + this.labSpectrum.blackbodyTemperature + "K";
    },

    /**
     * Install a discharge tube in the lab.
     * Get the lines form the elementalSpectra.
     */
    installDischargeTube: function () {
        this.labSpectrum = new Spectrum();

        this.labSpectrum.hasBlackbody = false;
        this.labSpectrum.hasEmissionLines = true;

        switch (this.dischargeTube) {
            case "H":
                this.labSpectrum.addLinesFrom(elementalSpectra.H, 100);
                break;

            case "HeI":
                this.labSpectrum.addLinesFrom(elementalSpectra.HeI, 100);
                break;

            case "LiI":
                this.labSpectrum.addLinesFrom(elementalSpectra.LiI, 100);
                break;

            case "NaI":
                this.labSpectrum.addLinesFrom(elementalSpectra.NaI, 100);
                break;

            case "CaII":
                this.labSpectrum.addLinesFrom(elementalSpectra.CaII, 100);
                break;

            case "FeI":
                this.labSpectrum.addLinesFrom(elementalSpectra.FeI, 100);
                break;
        }
        this.labSpectrum.source.id = this.dischargeTube + " " + " tube";
        this.labSpectrum.source.shortid = this.dischargeTube;
    },


    foo : null
};

