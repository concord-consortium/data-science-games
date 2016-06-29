
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

/* global stella, Star, Spectrum, console, ElementalSpectra */

stella.model = {

    stars : [],
    now : null,
    epoch : null,
    skySpectrum : null,
    labSpectrum : null,

    newGame : function() {
        this.stars = [];

        this.makeAllStars();
        this.now = new Date(2525, 0);   //  Jan 1 2525
        this.epoch = new Date(2500, 0);   //  Jan 1 2525
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

        var tFrustum = {
            width : stella.constants.universeWidth,
            height : stella.constants.universeDistance
        };

        for (var i = 0; i < stella.constants.nStars; i++) {
            var tS = new Star( tFrustum );
            this.stars.push( tS );
            //  console.log( tS.toString() );
        }


        this.stars.sort( function(a,b) {
           return a.mApp - b.mApp;
        });

        for (var s = 0; s < this.stars.length; s++) {
            var tNumber = 1000 + s;
            this.stars[s].id = "S" + tNumber;
            this.stars[s].spectrum.source.id = this.stars[s].id;
        }
    },

    installBlackbody: function () {
        this.labSpectrum = new Spectrum();
        this.labSpectrum.hasBlackbody = true;
        this.labSpectrum.hasEmissionLines = false;
        this.labSpectrum.blackbodyTemperature = this.labBlackbodyTemperature;
        this.labSpectrum.source.id = "blackbody at " + this.labSpectrum.blackbodyTemperature + " K";
        this.labSpectrum.source.shortid = "BB " + this.labSpectrum.blackbodyTemperature + " K";
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
                this.labSpectrum.addLinesFrom(ElementalSpectra.He, 100);
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


    foo : null
};

