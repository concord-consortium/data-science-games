
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

stella.model = {

    stars : [],
    now : null,
    epoch : null,
    skySpectrum : null,
    labSpectrum : null,

    newGame : function() {
        this.stars = [];

        this.makeAllStars();
        this.now = 2525.0;       //  new Date(2525, 0);   //  Jan 1 2525
        this.epoch = 2500.0;     //  new Date(2500, 0);   //  Jan 1 2525
    },

    starFromTextID : function(iText) {
        for (var i = 0; i < this.stars.length; i++) {
            var s = this.stars[i];
            if (s.id.includes(iText)) {
                return s;
            }
        }
        return null;
    },

    starFromCaseID : function( id ) {
        for (var i = 0; i < this.stars.length; i++) {
            var s = this.stars[i];
            if (s.caseID === id) {
                return s;
            }
        }
        return null;
    },

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


        this.stars.sort( function(a,b) {
           return a.mApp - b.mApp;
        });

        for (var s = 0; s < this.stars.length; s++) {
            var tNumber = 1000 + s;
            this.stars[s].id = "S" + tNumber;
            //  this.stars[s].spectrum.source.id = this.stars[s].id;
        }
    },

    installBlackbody: function () {
        this.labSpectrum = new Spectrum();
        this.labSpectrum.hasBlackbody = true;
        this.labSpectrum.hasEmissionLines = false;
        this.labSpectrum.blackbodyTemperature = this.labBlackbodyTemperature;
        this.labSpectrum.source.id = "blackbody at " + this.labSpectrum.blackbodyTemperature + " K";
        this.labSpectrum.source.shortid = "BB_" + this.labSpectrum.blackbodyTemperature + "K";
    },

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

            case "Sodium":
                this.labSpectrum.addLinesFrom(ElementalSpectra.NaI, 100);
                break;

            case "Calcium":
                this.labSpectrum.addLinesFrom(ElementalSpectra.CaII, 100);
                break;

            case "Iron (neutral)":
                this.labSpectrum.addLinesFrom(ElementalSpectra.FeI, 100);
                break;
        }
        this.labSpectrum.source.id = this.dischargeTube + " " + " tube";
        this.labSpectrum.source.shortid = this.dischargeTube;
    },

    evaluateResult : function( iValues ) {
        var tStar = stella.model.starFromTextID( iValues.id );
        var tMaxPoints = 100;
        var oPoints = 0;

        var trueValue = null;
        var debugString = "debug";

        switch( iValues.type ) {
            case "temp" :
                var tLogResultValue = Math.log10( iValues.value );
                trueValue = Math.pow(10, tStar.logMainSequenceTemperature);
                var dLogResultValue = Math.abs(tLogResultValue - tStar.logMainSequenceTemperature);
                oPoints = tMaxPoints * ( 1 - 10 * dLogResultValue );     //  difference in log of 0.1 = about 20%
                break;

            case "vel_r":
                trueValue = tStar.pm.r;
                var guessValue = iValues.value;
                var dValue = Math.abs(trueValue - guessValue);
                oPoints = tMaxPoints * (1 - 0.1 * dValue);    //  ± 10 km/sec tolerance
                break;

            default:
                var tMess = "Sorry, I don't know how to score " + stella.starResults[ iValues.type].name + " yet.";
                alert(tMess);
                oPoints = 0;    //      so it will not record the data
                break;
        }

        if (oPoints < 0 ) {
            oPoints = 0;
        }

        debugString = "Evaluate " +
            stella.starResults[ iValues.type].name + ": user said " +
                iValues.value + ", true value " + trueValue +
                ". Awarding " + Math.round(oPoints) + " points.";

        console.log( debugString );
        return Math.round(oPoints);
    },

    foo : null
};

