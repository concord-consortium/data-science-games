/**
 * Created by tim on 5/7/16.


 ==========================================================================
 etaCas.manager.js in data-science-games.

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

/* global $, stella, Planet, Star, SpectrumView, Snap, console, codapHelper  */

stella.manager = {

    playing : false,
    focusStar : null,

    newGame : function() {

        stella.model.newGame();     //  make all the stars etc
        this.playing = true;
        stella.manager.emitInitialStarsData();  //      to get data at beginning of game. Remove if saving game data

        this.runTests();
        stella.skyView.initialize( stella.model );
        stella.ui.fixUI();
    },

    pointAtStar : function( iStar ) {
        if (iStar) {
            this.focusStar = iStar;
            stella.model.skySpectrum = iStar.spectrum;
            stella.skyView.pointAtStar( this.focusStar );
            stella.ui.skySpectrumView.displaySpectrum(stella.model.skySpectrum);
        } else {
            this.focusStar = null;
            stella.model.skySpectrum = null;
            stella.skyView.pointAtStar( null );
            stella.ui.skySpectrumView.displaySpectrum( null );
        }
    },


    runTests : function() {
        var tT = "testing\n";
        var d = $("#debugText");

/*
        var tSun = new Star();

        var tPlanet = new Planet( 1.0, tSun );
        tPlanet.e = 0.5;

        tT += tPlanet + "\n";

        tT += "i\tx\ty\tz\n";


        for (var i = 0; i < 100; i++) {
            var tPosition = stella.xyz( tPlanet, stella.model.now );
            tT += i + "\t" + tPosition.x + "\t" + tPosition.y + "\t" + tPosition.z + "\n";

            stella.elapse( 7 * stella.constants.msPerDay );

        }
*/

        tT = "Stars\nmass, temp, M, mapp, ageMY, x, y, z\n";

        stella.model.stars.forEach( function(iStar ) {
            tT += iStar.toString() + "\n";
        });

        d.text( tT );       //  sends that data to debug
    },

    emitInitialStarsData : function() {

        stella.model.stars.forEach( function( iStar ) {
            var tValues = iStar.dataValues();
            tValues.date = stella.model.epoch;
            stella.connector.emitStarCatalogRecord( tValues, starRecordCreated );   //  emit the Stebber part

            function starRecordCreated(iResult ) {
                if (iResult.success) {
                    iStar.caseID = iResult.values[0].id;
                } else {
                    console.log("Failed to create case for star " + iStar.id );
                }
            }
        });


    },

    extractFromWithinBrackets : function( iString ) {
        if (iString ) {
            return iString.substring(iString.lastIndexOf("[") + 1, iString.lastIndexOf("]"));
        } else {
            return null;
        }
    },

    processSelectionFromCODAP : function( iResult ) {
        if (iResult.success) {
            iResult.values.forEach( function( iVal ) {
                var tStar =  stella.model.starFromCaseID( iVal.caseID );
                stella.manager.pointAtStar( tStar );
            });
        stella.ui.fixUI();
        } else {
            console.log('Failed to retrive selected case IDs.');
        }
    },

    /*
            SPECTRA SECTION

     */

    spectrumParametersChanged : function() {
        this.setSpectrogramWavelengths();       //  read min and max from boxes in the UI
        this.updateLabSpectrum();
        stella.ui.skySpectrumView.displaySpectrum( stella.model.skySpectrum );
        stella.ui.labSpectrumView.displaySpectrum( stella.model.labSpectrum );
        stella.ui.fixUI();
    },

    saveSpectrum : function( iWhich ) {

        var tSpectrum, tTitle, tSpectrumView, tChannels;

        switch (iWhich) {
            case "sky":
                tSpectrum = stella.model.skySpectrum;
                tSpectrumView = stella.ui.skySpectrumView;
                tChannels = tSpectrumView.zoomChannels;
                tTitle = stella.manager.focusStar.id;
                break;

            case "lab":
                tSpectrum = stella.model.labSpectrum;
                tSpectrumView = stella.ui.labSpectrumView;
                tChannels = tSpectrumView.zoomChannels;
                tTitle = stella.model.labSpectrum.source.shortid;
                break;

            default:
        }

        if (tSpectrumView.channels.length > 0) {
            stella.connector.emitSpectrum(tChannels, tTitle);
        }

    },


    updateLabSpectrum : function() {
        //  first, figure out the Lab spectrum
        var tSpectrumType = $('input[name=sourceType]:checked').val();
        stella.model.dischargeTube = $("#dischargeTubeMenu").val();

        if (tSpectrumType === "discharge") {
            stella.model.installDischargeTube(  );
        } else {
            stella.model.installBlackbody(  );
        }
    },


    setSpectrogramWavelengths : function() {
        var tLMin = Number($("#lambdaMin").val());
        var tLMax = Number($("#lambdaMax").val());

        stella.ui.labSpectrumView.adjustLimits( tLMin, tLMax);
        stella.ui.skySpectrumView.adjustLimits( tLMin, tLMax);
    },

    /**
     * For saving. TBD.
     */
    stellaDoCommand : function( iCommand, iCallback) {

      console.log( "stellaDoCommand: " + iCommand.action + " " + iCommand.resource );
        var tCommandObject = "";
        var tDataSet = stella.manager.extractFromWithinBrackets( iCommand.resource );

        if (iCommand.values) {
            if (Array.isArray(iCommand.values)) {
                switch (iCommand.values[0].operation) {

                    // todo: Note that this is set up to work only with the star catalog data set.
                    case "selectCases":
                        codapHelper.getSelectionList(tDataSet, stella.manager.processSelectionFromCODAP);
                        break;

                    default:
                        break;
                }
            }
        }
    }
};