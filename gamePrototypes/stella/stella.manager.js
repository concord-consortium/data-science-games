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

/* global $, stella, Math, Planet, Star, SpectrumView, Snap, console, codapHelper, alert  */

/**
 * Main controller for Stella
 *
 * @type {{playing: boolean, focusStar: null, starResultType: null, starResultValue: null, stellaScore: number, labSpectrumView: null, skySpectrumView: null, newGame: stella.manager.newGame, updateStella: stella.manager.updateStella, pointAtStar: stella.manager.pointAtStar, changeMagnificationTo: stella.manager.changeMagnificationTo, runTests: stella.manager.runTests, emitInitialStarsData: stella.manager.emitInitialStarsData, extractFromWithinBrackets: stella.manager.extractFromWithinBrackets, processSelectionFromCODAP: stella.manager.processSelectionFromCODAP, spectrumParametersChanged: stella.manager.spectrumParametersChanged, displayAllSpectra: stella.manager.displayAllSpectra, saveSpectrumToCODAP: stella.manager.saveSpectrumToCODAP, updateLabSpectrum: stella.manager.updateLabSpectrum, setSpectrogramWavelengthsToTypedValues: stella.manager.setSpectrogramWavelengthsToTypedValues, clickInSpectrum: stella.manager.clickInSpectrum, starResultTypeChanged: stella.manager.starResultTypeChanged, starResultValueChanged: stella.manager.starResultValueChanged, saveStarResult: stella.manager.saveStarResult, stellaDoCommand: stella.manager.stellaDoCommand}}
 */
stella.manager = {

    playing : false,
    focusStar : null,       //  what star are we pointing at?
    starResultType : null,  //  kind of result. set in newGame()
    starResultValue : null,
    stellaScore : 0,        //  current "score"

    labSpectrumView : null, //  SpectrumView object
    skySpectrumView : null,


    /**
     * Called on new game, in this case, on startup
     */
    newGame: function () {

        stella.model.newGame();     //  make all the stars etc
        this.playing = true;
        stella.skyView.initialize( );   //  make the sky

        this.skySpectrumView = new SpectrumView("skySpectrumDisplay");  //  ids of the two SVGs
        this.labSpectrumView = new SpectrumView("labSpectrumDisplay");

        stella.manager.emitInitialStarsData();  //      to get data at beginning of game. Remove if saving game data
        stella.manager.starResultType = $("#starResultTypeMenu").val(); //  what kind of result is selected on that tab
        stella.manager.spectrumParametersChanged();     //  reads the UI and sets various variables.
        stella.manager.updateStella();              //  update the screen and text
    },

    /**
     * Housekeeping. Synchronize things.
     * Often called when the user has changed something.
     */
    updateStella : function() {
        stella.skyView.pointAtStar( this.focusStar );
        stella.model.skySpectrum = (this.focusStar === null) ? null :  this.focusStar.setUpSpectrum();  //  make the spectrum
        this.displayAllSpectra();
        stella.ui.fixStellaUITextAndControls();      //  fix the text
    },

    /**
     * Point at the given star.
     * @param iStar     The star. Pass `null` to be not pointing at anything.
     */
    pointAtStar : function( iStar ) {
        if (iStar) {
            this.focusStar = iStar;
            stella.connector.selectStarInCODAPByCatalogID( iStar.caseID );

            console.log(this.focusStar);
        } else {
            this.focusStar = null;
        }
        stella.model.stellaElapse( stella.constants.time.changePointing );
        this.updateStella();
    },

    /**
     * Change the magnification on the telescope
     * @param iNewMag
     */
    changeMagnificationTo : function( iNewMag ) {

        stella.skyView.magnify( iNewMag  );
        this.updateStella();    //  this will also point at the focusStar, if any

    },

    /**
     * For testing
     */
    runTests : function() {
        var tT = "testing\n";
        var d = $("#debugText");

        tT = "Stars\nmass, temp, M, mapp, ageMY, x, y, z\n";

        stella.model.stars.forEach( function(iStar ) {
            tT += iStar.toString() + "\n";
        });

        d.text( tT );       //  sends that data to debug
    },

    /**
     * Send out the catalog at the beginning of the game.
     */
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

    /**
     * Get the contents of the brackets in a string.
     * New API may make this unnecessary.
     * @param iString
     * @returns {*}
     */
    extractFromWithinBrackets : function( iString ) {
        if (iString ) {
            return iString.substring(iString.lastIndexOf("[") + 1, iString.lastIndexOf("]"));
        } else {
            return null;
        }
    },

    /**
     * When CODAP tells us there's one selection in the Catalog, point the telescope there.
     * @param iResult
     */
    processSelectionFromCODAP : function( iResult ) {
        if (iResult && iResult.success) {
            if (iResult.values.length === 1) {
                var tStar =  stella.model.starFromCaseID( iResult.values[0].caseID );
                stella.manager.pointAtStar( tStar );
                stella.manager.updateStella();
            }
        } else {
            console.log('Failed to retrieve selected case IDs.');
        }
    },


    /*
            SPECTRA SECTION

     */

    /**
     * Use has changed something in the spectrum tab.
     * Make appropriate changes.
     */
    spectrumParametersChanged : function() {
        this.setSpectrogramWavelengthsToTypedValues();       //  read min and max from boxes in the UI
        this.updateLabSpectrum();
        stella.manager.updateStella();
    },

    /**
     * Actually display both spectra
     */
    displayAllSpectra : function() {
        stella.manager.skySpectrumView.displaySpectrum( stella.model.skySpectrum );
        stella.manager.labSpectrumView.displaySpectrum( stella.model.labSpectrum );
    },

    /**
     * Emit one spectrum's worth of data to CODAP
     * @param iWhich    "sky" or "lab"
     */
    saveSpectrumToCODAP : function( iWhich ) {

        var tSpectrum, tTitle, tSpectrumView, tChannels;

        switch (iWhich) {
            case "sky":
                tSpectrum = stella.model.skySpectrum;
                tSpectrumView = stella.manager.skySpectrumView;
                tChannels = tSpectrumView.zoomChannels;
                tTitle = stella.manager.focusStar.id;
                break;

            case "lab":
                tSpectrum = stella.model.labSpectrum;
                tSpectrumView = stella.manager.labSpectrumView;
                tChannels = tSpectrumView.zoomChannels;
                tTitle = stella.model.labSpectrum.source.shortid;
                break;

            default:
        }

        if (tSpectrumView.channels.length > 0) {
            stella.connector.emitSpectrum(tChannels, tTitle);
            stella.model.stellaElapse( stella.constants.time.saveSpectrum );
        }

        stella.manager.updateStella();

    },

    /**
     * Decide what kind of lab spectrum we're making, then have it made
     */
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

    /**
     * Take the numbers in the boxes and use them to set the limits of the spectra
     */
    setSpectrogramWavelengthsToTypedValues : function() {
        var tLMin = Number($("#lambdaMin").val());
        var tLMax = Number($("#lambdaMax").val());

        this.labSpectrumView.adjustLimits( tLMin, tLMax);
        this.skySpectrumView.adjustLimits( tLMin, tLMax);
    },

    /**
     * Handle a click in the SpectrumView
     * Change the limits appropriately.
     * @param e
     */
    clickInSpectrum: function (e) {
        var tSpecView = stella.manager.labSpectrumView; //  todo: maybe make this work on the target, in case the skySpectrumView is of a different dimension

        //  todo: consider whether this can all be avoided with viewBox and making TWO spectrumViews.
        var uupos = tSpecView.paper.node.createSVGPoint();
        uupos.x = e.clientX;
        uupos.y = e.clientY;

        var ctm = e.target.getScreenCTM().inverse();

        if (ctm) {
            uupos = uupos.matrixTransform(ctm);
        }

        //  now calculate the wavelength that got clicked.

        var tLambda = 0;
        var tRange = tSpecView.lambdaMax - tSpecView.lambdaMin; //  range in the zoomed spectrum

        var tFrac = uupos.x / tSpecView.spectrumViewWidth;
        var tZoomFactor = 0.7;

        if (uupos.y <= tSpecView.mainSpectrumHeight) {
            var tTotalRange = tSpecView.lambdaMaxPossible - tSpecView.lambdaMinPossible;
            tLambda = tSpecView.lambdaMinPossible + tFrac * tTotalRange;
        } else if (uupos.y >= tSpecView.mainSpectrumHeight + tSpecView.interspectrumGap) {
            tLambda = tSpecView.lambdaMin + tFrac * tRange;
            if (tLambda < tSpecView.lambdaMin || tLambda > tSpecView.lambdaMax) {
                tZoomFactor = 1.0;      //      just translate if outside the zoom area
            }
        } else {
            tZoomFactor = 2.0;    //      zoom back out
            tLambda = (tSpecView.lambdaMax + tSpecView.lambdaMin) / 2;
        }

        tRange *= tZoomFactor;
        var tMin = tLambda - tRange / 2;
        var tMax = tLambda + tRange / 2;
        tMin = tMin < tSpecView.lambdaMinPossible ? tSpecView.lambdaMinPossible : tMin;
        tMax = tMax > tSpecView.lambdaMaxPossible ? tSpecView.lambdaMaxPossible : tMax;

        tMin = Math.round(tMin*10)/10.0;
        tMax = Math.round(tMax*10)/10.0;
        if (tMax - tMin < 1.0) {
            var tMid = (tMax + tMin)/2;
            tMax = tMid + 0.5;
            tMin = tMid - 0.5;
        }

        stella.manager.labSpectrumView.adjustLimits( tMin, tMax );  //  sets lambdaMin, lambdaMax
        stella.manager.skySpectrumView.adjustLimits( tMin, tMax );
        stella.manager.displayAllSpectra();

        stella.manager.updateStella();
    },

/*      "STAR RESULT" SECTION     */

    /**
     * USer has chosen a different kind of measurement in the menu there
     */
    starResultTypeChanged : function() {
        stella.manager.starResultType = $("#starResultTypeMenu").val();
        stella.manager.updateStella();
        stella.model.stellaElapse( stella.constants.time.changeResultType );
    },

    /**
     * User has entered a value
     */
    starResultValueChanged : function() {
        stella.manager.starResultValue = Number($("#starResultValue").val());
        stella.manager.updateStella();
    },

    /**
     * User has clicked Save for a result.
     */
    saveStarResult: function (iValues) {
        var tValues;
        if (stella.manager.focusStar) {
            if (iValues) {
                tValues = iValues;
            } else {
                tValues = {
                    id: stella.manager.focusStar.id,
                    type: stella.manager.starResultType,
                    value: stella.manager.starResultValue,
                    date: stella.model.now,
                    units: stella.starResults[stella.manager.starResultType].units
                };
            }

            var tScore = stella.model.evaluateResult(tValues);  //  we don't necessarily save all results!
            if (tScore > 0) {
                stella.connector.emitStarResult(tValues, null);
                stella.manager.stellaScore += tScore;
                alert("Good job! " + stella.manager.starResultValue + " is close enough to get you " + tScore + " points!");
            } else {
                alert(stella.strings.resultIsWayOff);
            }
        } else {
            alert(stella.strings.notPointingAtStarForResults);
        }

        stella.model.stellaElapse(stella.constants.time.saveResult);
        stella.manager.updateStella();
    },

    doubleClickOnAStar: function () {
        if (stella.skyview.magnification < 100) {
            return;
        }
        console.log("double click on a star!");
        var tStar = stella.manager.focusStar;
        var tNow = stella.model.now;
        var tPos = tStar.positionAtTime(tNow);

        var txValues = {
            id: tStar.id,
            type: "pos_x",
            value: tPos.x,
            date: tNow,
            units: stella.starResults["pos_x"].units
        };
        var tyValues = {
            id: tStar.id,
            type: "pos_y",
            value: tPos.y,
            date: tNow,
            units: stella.starResults["pos_y"].units
        };
        stella.connector.emitStarResult(txValues, null);
        stella.connector.emitStarResult(tyValues, null);

        var tScore = stella.model.evaluateResult(tyValues);  //  we don't necessarily save all results!
        stella.manager.stellaScore += tScore;

        stella.model.stellaElapse(stella.constants.time.savePositionFromDoubleclick);
        stella.manager.updateStella();
    },



/**
     * responds to CODAP notifications.
     */
    stellaDoCommand: function (iCommand, iCallback) {

        console.log("stellaDoCommand: ")
        console.log(iCommand);

        var tCommandObject = "";

        switch (iCommand.action) {
            case "notify":
                var tValues = iCommand.values;
                if (!Array.isArray(tValues)) {
                    tValues = [tValues];
                }
                switch (tValues[0].operation) {

                    case "selectCases":

                        /**
                         * CODAP is telling us that user has selected cases. We have CODAP
                         * send the selection list to our function, stella.manager.processSelectionFromCODAP
                         */

                        // todo: Note that this is set up to work only with the star catalog data set. Expand!

                        var tDataSet = stella.manager.extractFromWithinBrackets(iCommand.resource);
                        if (tDataSet === stella.connector.catalogDataSetName) {
                            codapHelper.getSelectionList(tDataSet, stella.manager.processSelectionFromCODAP);
                        }
                        break;

                    default:
                        break;
                }
                break;

        /**
         * For saving
         */
            case "get":
                console.log("stellaDoCommand: action : get.");
                switch (iCommand.resource) {
                    case "interactiveState":
                        console.log("stellaDoCommand save document ");
                        var tSaveObject = {
                            success: true,
                            values: {
                                foo : 3,
                                bar : "baz"
                            }
                        };
                        codapHelper.sendSaveObject(
                            tSaveObject,
                            function () {
                                console.log("Save complete?");
                            }
                        );
                        break;
                    default:
                        console.log("stellaDoCommand unknown get command resource: " + iCommand.resource );
                        break;
                }
                break;

            default:
                console.log("stellaDoCommand: no action.");
        }

    }
};