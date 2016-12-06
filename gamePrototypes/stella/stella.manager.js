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

/* global $, stella, Math, Planet, Star, SpectrumView, Snap, console, codapHelper, alert, elementalSpectra  */

/**
 * Main controller for Stella
 *
 * @type {{playing: boolean, focusStar: null, starResultType: null, starResultValue: null, stellaScore: number, labSpectrumView: null, skySpectrumView: null, newGame: stella.manager.newGame, updateStella: stella.manager.updateStella, pointAtStar: stella.manager.pointAtStar, changeMagnificationTo: stella.manager.changeMagnificationTo, runTests: stella.manager.runTests, emitInitialStarsData: stella.manager.emitInitialStarsData, extractFromWithinBrackets: stella.manager.extractFromWithinBrackets, processSelectionFromCODAP: stella.manager.processSelectionFromCODAP, spectrumParametersChanged: stella.manager.spectrumParametersChanged, displayAllSpectra: stella.manager.displayAllSpectra, saveSpectrumToCODAP: stella.manager.saveSpectrumToCODAP, updateLabSpectrum: stella.manager.updateLabSpectrum, setSpectrogramWavelengthsToTypedValues: stella.manager.setSpectrogramWavelengthsToTypedValues, clickInSpectrum: stella.manager.clickInSpectrum, starResultTypeChanged: stella.manager.starResultTypeChanged, starResultValueChanged: stella.manager.starResultValueChanged, saveStarResult: stella.manager.saveMyOwnStarResult, stellaDoCommand: stella.manager.stellaDoCommand}}
 */
stella.manager = {

    playing: false,
    focusStar: null,       //  what star are we pointing at?
    starResultType: null,  //  kind of result. set in newGame()
    starResultValue: null,  //  the result text box.

    starResultIsAuto : false,   //  did we get this latest result via the Auto button?


    /**
     * Called on new game, in this case, on startup
     */
    newGame: function () {

        elementalSpectra.initialize();  //  read the line data into objects

        stella.manager.starResultType = $("#starResultTypeMenu").val(); //  what kind of result is selected on that tab
        stella.model.newGame();     //  make all the stars etc.
        stella.spectrumManager.newGame( );
        this.playing = true;

        stella.skyView.initialize();   //  make the sky

        stella.manager.emitInitialStarsData();  //      to get data at beginning of game. Remove if saving game data
        stella.spectrumManager.spectrumParametersChanged();     //  reads the UI and sets various variables.
        stella.manager.updateStella();              //  update the screen and text
    },


    /**
     * Housekeeping. Synchronize things.
     * Often called when the user has changed something.
     */
    updateStella: function () {
        //  stella.skyView.pointAtStar(this.focusStar);
        stella.model.skySpectrum = (this.focusStar === null) ? null : this.focusStar.setUpSpectrum();  //  make the spectrum
        stella.spectrumManager.displayAllSpectra();
        stella.ui.fixStellaUITextAndControls();      //  fix the text
    },

    /**
     * Called to make the given star the one we're working on.
     * We get here by pointing, called from `pointAtStar( iStar )`.
     * We get here by selection,
     * We can also focus by panning. See up().
     * @param iStar
     */
    focusOnStar : function(iStar) {
        this.focusStar = iStar;
        stella.connector.selectStarInCODAPByCatalogID(iStar.caseID);
        this.updateStella();
    },

    /**
     * Point at the given star.
     * @param iStar     The star. Pass `null` to be not pointing at anything.
     */
    pointAtStar: function (iStar) {
        if (iStar) {
            stella.skyView.pointAtStar(iStar);     //      added in...
            this.focusOnStar( iStar );
            console.log("Point at " + this.focusStar.id +
                " at " + this.focusStar.where.x.toFixed(3) + ", " +
                this.focusStar.where.y.toFixed(3));
        } else {
            this.focusStar = null;
            this.updateStella();
        }
    },

    /**
     * Change the magnification on the telescope
     * @param iNewMag
     */
    changeMagnificationTo: function (iNewMag) {

        stella.skyView.magnify(iNewMag);    //  currently makes a whole new sky

     //   if (this.focusStar) {
     //       this.pointAtStar( this.focusStar );
     //   } else {
            stella.skyView.pointAtLocation( stella.skyView.telescopeWhere, true );
    //    }
        this.updateStella();

    },

    /**
     * For testing
     */
    runTests: function () {
        var tT = "testing\n";
        var d = $("#debugText");

        tT = "Stars\nmass, temp, M, mapp, ageMY, x, y, z\n";

        stella.model.stars.forEach(function (iStar) {
            tT += iStar.toString() + "\n";
        });

        d.text(tT);       //  sends that data to debug
    },

    /**
     * Send out the catalog at the beginning of the game.
     */
    emitInitialStarsData: function () {

        stella.model.stars.forEach(function (iStar) {
            var tValues = iStar.dataValues();
            tValues.date = stella.model.epoch;

            stella.connector.emitStarCatalogRecord(tValues, starRecordCreated);   //  emit the Stebber part

            function starRecordCreated(iResult) {
                if (iResult.success) {
                    iStar.caseID = iResult.values[0].id;
                } else {
                    console.log("Failed to create case for star " + iStar.id);
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
    extractFromWithinBrackets: function (iString) {
        if (iString) {
            return iString.substring(iString.lastIndexOf("[") + 1, iString.lastIndexOf("]"));
        } else {
            return null;
        }
    },

    /**
     * When CODAP tells us there's one selection in the Catalog, point the telescope there.
     * @param iResult
     */
    processSelectionFromCODAP: function (iResult) {
        if (iResult && iResult.success) {
            if (iResult.values.length === 1) {
                var tStar = stella.model.starFromCaseID(iResult.values[0].caseID);
                stella.manager.pointAtStar(tStar);
                stella.manager.updateStella();
            }
        } else {
            console.log('Failed to retrieve selected case IDs.');
        }
    },




    /*      "STAR RESULT" SECTION     */

    /**
     * User has chosen a different kind of measurement in the menu there
     */
    starResultTypeChanged: function () {
        stella.manager.starResultType = $("#starResultTypeMenu").val();
        stella.manager.updateStella();
        stella.model.stellaElapse(stella.constants.timeRequired.changeResultType);
        $("#starResultValue").val("");      //  blank the value in the box on type change
        this.starResultValueChanged( true );  //  blank the internal value
    },

    /**
     * User has entered a value
     * @param   iAuto   was this value entered using the "Auto"matic button?
     */
    starResultValueChanged: function ( iAuto ) {
        stella.manager.starResultIsAuto = iAuto;
        stella.manager.starResultValue = Number($("#starResultValue").val());
        stella.manager.updateStella();
    },

    /**
     * User has clicked Save for a result.
     * This is the button handler.
     * The html calls this without a parameter, which invokes the call to new StarResult()
     * @param iStarResult   the values for the result, being passed in
     */
    saveMyOwnStarResult: function (iStarResult) {
        if (stella.manager.focusStar) {
            var tStarResult = iStarResult;

            if (!iStarResult) {
                tStarResult = new StarResult(true, stella.manager.starResultIsAuto);     //      here we create the StarResult and try to save it
            }
        } else {
            alert(stella.strings.notPointingAtStarForResults);
        }

        stella.model.stellaElapse(stella.constants.timeRequired.saveResult);
        stella.manager.updateStella();
    },

    /*
        More control actions
     */

/*
    doubleClickOnAStar: function () {
        if (stella.skyView.magnification < 100) {
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
            units: stella.starResults.pos_x.units
        };
        var tyValues = {
            id: tStar.id,
            type: "pos_y",
            value: tPos.y,
            date: tNow,
            units: stella.starResults.pos_y.units
        };
        stella.connector.emitStarResult(txValues, null);
        stella.connector.emitStarResult(tyValues, null);

        var tScore = stella.model.evaluateResult(tyValues);  //  we don't necessarily save all results!

        stella.model.stellaElapse(stella.constants.timeRequired.savePositionFromDoubleclick);
        stella.manager.updateStella();
    },
*/

    /**
     * user is entitled to an automatic result because of badges, and has requested one.
     * This puts a propsed value in the text box.
     * User still has to press save.
     * (Which is normal, BUT the "auto" flag has been set)
     */
    getStarDataUsingBadge: function () {
        var tValue = null, tForRecord = null;

        if (stella.manager.focusStar) {
            var tResultType = stella.manager.starResultType;

            switch (tResultType) {
                case 'pos_x':
                    tForRecord = stella.skyView.telescopeWhere.x.toFixed(6);
                    break;
                case 'pos_y':
                    tForRecord = stella.skyView.telescopeWhere.y.toFixed(6);
                    break;
                default:
                    var truth = stella.manager.focusStar.reportTrueValue(tResultType);
                    tValue = Number(truth.trueDisplay);
                    var tBadgeLevel = stella.badges.badgeLevelForResult(tResultType);
                    var tProportionalErrors = [0.18, 0.06, 0.02];               //  todo: change this to absolute and use the L1 value
                    var tError = tProportionalErrors[tBadgeLevel] * tValue;

                    tValue += ((Math.random() - Math.random()) * tError);
                    tForRecord = tValue.toFixed(1);
                    break;
            }
            //  todo: fix this so that we don't get points, and so that the number isn't in the box afterwards.
            $("#starResultValue").val(tForRecord);          //  put the value in the box
            stella.manager.starResultValueChanged( true );    //  do what we do when someone puts a number in the box
        }
    },

    /**
     * responds to CODAP notifications.
     */
    stellaDoCommand: function (iCommand, iCallback) {

        console.log("stellaDoCommand: ");
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
                                foo: 3,
                                bar: "baz"
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
                        console.log("stellaDoCommand unknown get command resource: " + iCommand.resource);
                        break;
                }
                break;

            default:
                console.log("stellaDoCommand: no action.");
        }

    }
};