
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

/* global stella, Star, Spectrum, console, ElementalSpectra, alert */

/**
 * Overarching model class
 * Most importantly, maintains the array of Stars.
 *
 * @type {{stars: Array, now: null, epoch: null, skySpectrum: null, labSpectrum: null, newGame: stella.model.newGame, starFromTextID: stella.model.starFromTextID, starFromCaseID: stella.model.starFromCaseID, makeAllStars: stella.model.makeAllStars, installBlackbody: stella.model.installBlackbody, installDischargeTube: stella.model.installDischargeTube, evaluateResult: stella.model.evaluateResult, foo: null}}
 */
stella.model = {

    stars : [],
    now : null,
    epoch : null,
    skySpectrum : null,
    labSpectrum : null,

    /**
     * Called by manager.newGame().
     * Asks for all stars to be made.
     */
    newGame : function() {
        this.stars = [];

        this.makeAllStars();
        this.now = 2525.0;       //  new Date(2525, 0);   //  Jan 1 2525
        this.epoch = 2500.0;     //  new Date(2500, 0);   //  Jan 1 2525
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
      this.now += iTime;
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
     * Actually constructs all the stars.
     * Both field stars and the cluster.
     */
    makeAllStars : function() {

    var i, tFrustum, tMotion, tS;

        //  first, miscellaneous stars of middling age

        tFrustum = {
            xMin : 0,
            yMin : 0,
            width : stella.constants.universeWidth,
            L1 : 0,
            L2 : stella.constants.universeDistance
        };

        //  motion parameter for pm and V_rad. Means and SDs.
        tMotion = {
            x : 0,  sx : 25,
            y : 0,  sy : 25,
            r : 5,  sr : 25
        };

        for (i = 0; i < stella.constants.nStars; i++) {
            tS = new Star( tFrustum, tMotion, 9.0 + 0.5 * Math.random() );
            this.stars.push( tS );
            //  console.log( tS.toString() );
        }

        //  then, stars in a cluster


        tMotion = {             //  motion of the cluster
            x : 20,  sx : 5,
            y : 40,  sy : 5,
            r : 25,  sr : 5
        };

        var tClusterStarXCBaseFrac = 0.3 + 0.4 * Math.random(); //  center of the cluster
        var tClusterStarYCBaseFrac = 0.3 + 0.4 * Math.random();
        var tClusterHalfWidthFrac = 0.1;        //  width of the star position frustum, sort of

        for ( i = 0; i < stella.constants.nStars/2; i++) {
            var tClusterStarXMIN = TEEUtils.randomNormal(tClusterStarXCBaseFrac, tClusterHalfWidthFrac);
            var tClusterStarYMIN = TEEUtils.randomNormal(tClusterStarYCBaseFrac, tClusterHalfWidthFrac);
            tFrustum = {
                xMin : tClusterStarXMIN * stella.constants.universeWidth,   //  0.2 * stella.constants.universeWidth,
                yMin : tClusterStarYMIN * stella.constants.universeWidth,   //  0.4 * stella.constants.universeWidth,
                width : tClusterHalfWidthFrac * stella.constants.universeWidth,
                L1 : stella.constants.universeDistance,
                L2 : stella.constants.universeDistance + 5
            };

            tS = new Star( tFrustum, tMotion, 7.0 + 0.1 * Math.random() );
            this.stars.push( tS );
        }

        //  Sort the stars by apparent magnitude

        this.stars.sort( function(a,b) {
           return a.mApp - b.mApp;
        });

        //  Now give them ids (text, NOT caseIDs) for the catalog.

        for (var s = 0; s < this.stars.length; s++) {
            var tNumber = 1000 + s;
            this.stars[s].id = "S" + tNumber;
            //  this.stars[s].spectrum.source.id = this.stars[s].id;
        }
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
     * Get the lines form the ElementalSpectra.
     */
    installDischargeTube: function () {
        this.labSpectrum = new Spectrum();

        this.labSpectrum.hasBlackbody = false;
        this.labSpectrum.hasEmissionLines = true;

        switch (this.dischargeTube) {
            case "Hydrogen":
                this.labSpectrum.addLinesFrom(ElementalSpectra.H, 100);
                break;

            case "Helium":
                this.labSpectrum.addLinesFrom(ElementalSpectra.HeI, 100);
                break;

            case "Lithium (neutral)":
                this.labSpectrum.addLinesFrom(ElementalSpectra.LiI, 100);
                break;

            case "Sodium":
                this.labSpectrum.addLinesFrom(ElementalSpectra.NaI, 100);
                break;

            case "Calcium (+)":
                this.labSpectrum.addLinesFrom(ElementalSpectra.CaII, 100);
                break;

            case "Iron (neutral)":
                this.labSpectrum.addLinesFrom(ElementalSpectra.FeI, 100);
                break;
        }
        this.labSpectrum.source.id = this.dischargeTube + " " + " tube";
        this.labSpectrum.source.shortid = this.dischargeTube;
    },

    /**
     * When the user submits a Result, we check to see how close it is.
     *
     * @param iValues
     * @returns {number}
     */
    evaluateResult : function( iValues ) {
        var tStar = stella.model.starFromTextID( iValues.id );
        var tMaxPoints = 100;
        var oPoints = 0;

        var trueValue = null;
        var debugString = "debug";

        var guessValue;
        var trueValue;
        var trueDisplayValue;
        var tMaxDiff;
        var dValue;

        var displayDebugStringInConsole = true;

        /**
         * How far off you can be depends on what kind of measurement it is
         */
        switch( iValues.type ) {
            case "temp" :
                trueValue = tStar.logTemperature;
                trueDisplayValue = Math.pow(10, trueValue);
                guessValue = Math.log10( iValues.value );       //  we'll look at difference in the log
                tMaxDiff = 0.1;
                break;

            case "vel_r":
                trueValue = tStar.pm.r;
                trueDisplayValue = trueValue;
                guessValue = iValues.value;
                tMaxDiff = 10;
                break;

            case "pm_x":
                tMaxPoints = 100;
                trueValue = tStar.pm.x * 1000000;   //      because it's in microdegrees
                trueDisplayValue = trueValue;
                guessValue = iValues.value;
                tMaxDiff = 10;
                break;

            case "pm_y":
                tMaxPoints = 100;
                trueValue = tStar.pm.y * 1000000;   //      because it's in microdegrees
                trueDisplayValue = trueValue;
                guessValue = iValues.value;
                tMaxDiff = 10;
                break;

            case "pos_x":
                tMaxPoints = 10;        //  could be more; this is temp
                trueValue = tStar.positionAtTime( stella.model.now).x;
                trueDisplayValue = trueValue;
                guessValue = iValues.value;
                tMaxDiff = 0.001;
                break;

            case "pos_y":
                tMaxPoints = 10;        //  could be more; this is temp
                trueValue = tStar.positionAtTime( stella.model.now).y;
                trueDisplayValue = trueValue;
                guessValue = iValues.value;
                tMaxDiff = 0.001;
                break;

            default:
                var tMess = "Sorry, I don't know how to score " + stella.starResults[ iValues.type].name + " yet.";
                displayDebugStringInConsole = false;
                alert(tMess);
                trueValue = 1;    //      so it will not record the data
                guessValue = 1;
                tMaxPoints = 0;
                break;
        }

        dValue = Math.abs(trueValue - guessValue);
        oPoints = tMaxPoints * (1 - dValue / tMaxDiff);

        if (oPoints < 0 ) {
            oPoints = 0;
        }

        debugString = "Evaluate " +
            stella.starResults[ iValues.type].name + ": user said " +
                iValues.value + ", true value " + trueDisplayValue +
                ". Awarding " + Math.round(oPoints) + " points.";

        if (displayDebugStringInConsole) {
            console.log( debugString );
        }
        return Math.round(oPoints);
    },

    foo : null
};

