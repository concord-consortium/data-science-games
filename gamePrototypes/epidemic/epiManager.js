/**
 * Created by tim on 10/19/15.
 */

/*
 ==========================================================================
 epiManager.js

 Main controller for the med DSG.

 Author:   Tim Erickson

 Copyright (c) 2015 by The Concord Consortium, Inc. All rights reserved.

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


var svgNS = "http://www.w3.org/2000/svg";   //  needed to draw svg's
var epiManager;

/**
 * Singleton controller object (main) for the "Epidemic" DSG
 *
 * @type {{gameNumber: number, CODAPConnector: null, nLocations: number, locTypes: string[], previous: number, running: boolean, gameInProgress: boolean, update: medManager.update, updateScreen: medManager.updateScreen, animate: medManager.animate, newGame: medManager.newGame, finishGame: epiManager.finishGame, pause: medManager.pause, restart: medManager.restart, updateUIStuff: medManager.updateUIStuff, doCritterClick: medManager.doCritterClick, emitCritterData: medManager.emitCritterData, newGameButtonPressed: medManager.newGameButtonPressed, initializeComponent: medManager.initializeComponent}}
 */
epiManager = {

    /**
     * string about whether the game is "playing", "won" (the previous game) or "lost"
     */
    wonLossState: null,   //  affects only what widgets are visible

    kCrittersInBigWorld : 49,
    kCrittersInSmallWorld : 20,

    UI : {},
    gameNumber: 0,
    CODAPConnector: null,
    prognosis : 0,

    previous: 0,    //  timestamp for animation
    running: false,
    gameInProgress: false,
    draggingCritter: false,        //      so we will NOT drag the world if zoomed!

    /**
     * General update method. Asks the model to update, then updates our screen.
     * @param dt
     */
    update: function (dt) {
        epiModel.update(dt);       //

        var tEnd = epiModel.endCheck();

        if (tEnd) this.finishGame( tEnd );
        this.updateScreen();
    },

    /**
     * Manages update of screen. this involves the main view plus any of our UI stuff.
     */
    updateScreen: function ( ) {
        epiWorldView.updateScreen();
        this.updateUIStuff();
    },

    /**
     * Animation function for Epidemic.
     * Necessary not for visible animations, but for updating the model -- hunger, thirst, etc)
     * @param timestamp
     */
    animate: function (timestamp) {
        if (!epiManager.previous)  epiManager.previous = timestamp;
        var tDt = (timestamp - epiManager.previous) / 1000.0;
        epiManager.previous = timestamp;
        epiManager.update(tDt);
        if (epiManager.running) window.requestAnimationFrame(epiManager.animate);
    },

    /**
     * Handles a new game in Epidemic
     */
    newGame: function () {
        if (epiOptions.smallGame) {
            epiGeography.setGridSize( 5 );
            epiModel.numberOfCritters = epiManager.kCrittersInSmallWorld;
        }
        else {
            epiGeography.setGridSize( 10 );
            epiModel.numberOfCritters = epiManager.kCrittersInBigWorld;
        }

        epidemic.state.gameNumber += 1;
        //this.CODAPConnector.newGameCase("epidemics", this.gameNumber);

        epiModel.newGame( );            //  create all model Critters and Locations
        epiWorldView.flushAndRedraw();  //  draw all Locations and Critters anew
        this.gameInProgress = true;
        epiOptions.optionChange();      //  make sure all the option checks are saved
        this.restart();                 //  time starts up
        this.captureDataForAllCritters();   //  todo:  this doesn't work! Fix it!
    },

    /**
     * Handles the end of a game in Epidemic
     * @param result    could be "won" "lost" "aborted" etc
     */
    finishGame: function (iState) {
        this.wonLossState = iState;
        var tResult = "aborted";

        switch(this.wonLossState) {
            case epidemic.constants.kWinState:
                tResult = "won";
                break;
            case epidemic.constants.kLossState:
                tResult = "lost";
                break;
        }

        this.gameInProgress = false;
        this.pause();       //  stop any animation and progress
        var theData = {
            nMoves : epiModel.nMoves,
            sickSeconds : epiModel.sicknessReport().totalElapsed,
            elapsed : epiModel.elapsed,
            result : tResult
        };
        //  this.CODAPConnector.finishGameCase(theData);

        this.updateScreen();
    },

    pause: function () {
        this.running = false;
        this.updateScreen();
        epiModel.critters.forEach( function(c) {
            if (c.moving) c.view.snapShape.stop();
        })
    },

    restart: function () {
        this.previous = null;
        this.running = true;
        this.wonLossState = null;
        window.requestAnimationFrame(this.animate); //  START UP TIME

        epiModel.critters.forEach( function(c) {       //   start up critter movements
            if (c.moving) {
                c.animateToCenterOfDestination();
                //  c.headForCenterOfLocation(c.destLoc);
            }
        });
        this.updateScreen();
    },

    /**
     * Updates text, button text, etc., that is not in the main "world" display area
     */
    updateUIStuff: function () {

        switch (this.wonLossState) {
            case epidemic.constants.kWinState:
                var tWorldPaper = Snap(document.getElementById("epiWorldView"));
                tWorldPaper.image("art/epidemicWin.png", 50, 50, 300, 300);
                break;

            case epidemic.constants.kLossState:
                var tWorldPaper = Snap(document.getElementById("epiWorldView"));
                tWorldPaper.image("art/epidemicLoss.png", 50, 50, 300, 300);
                break;

            default:
/*
                var tWorldPaper = Snap(document.getElementById("epiWorldView"));
                tWorldPaper.image("art/epidemicLoss.png", 50, 50, 300, 300);
*/
                break;

        }

        this.UI.timeText.innerHTML = parseFloat(epiModel.elapsed.toFixed(2));
        this.UI.startStopButton.style.backgroundImage = (this.running) ? "url('../art/pause.png')" : "url('../art/play.png')";
        this.UI.smallGameDiv.style.visibility = (this.gameInProgress) ? "hidden" : "visible";
        this.UI.maladyChoiceDiv.style.visibility = (this.gameInProgress) ? "hidden" : "visible";
        this.UI.startStopButton.style.visibility = (this.gameInProgress) ? "visible" : "hidden";

        this.UI.gameButton.innerHTML = (this.gameInProgress) ? "abort game" : "new game";

        tSickReport = epiModel.sicknessReport();

        var tLossProgress = tSickReport.totalElapsed / epiMalady.pSickSecondsToGameEnd;
        var tWinProgress = epiModel.elapsed / epiMalady.pTotalElapsedSecondsToGameEnd;
        tProjectedLoss = tLossProgress / tWinProgress + 0.001;
        this.prognosis = tProjectedLoss > 1 ? 1 : tProjectedLoss;

        $( "#healthReport").html("Moves: " + epiModel.nMoves
            + " Sick: " + tSickReport.numberSick
            + ", Total sick seconds: " + tSickReport.totalElapsed
            + ", Projection: " + this.prognosis.toFixed(2)
        );

    },

    /**
     * Captures data for all critters at once
     */
    captureDataForAllCritters : function() {
        epiModel.critters.forEach( function( iCritter ) {
            epiManager.emitCritterData(iCritter, "all");
        });
    },


    handleDropOfCritter: function (iCritter, iX, iY) {
        var tFromRowCol = iCritter.where;
        var tToRowCol = epiGeography.rowColFromCoordinates(iX, iY);

        if (tFromRowCol === null ||
            tFromRowCol.row != tToRowCol.row || tFromRowCol.col != tToRowCol.col) { //  kludge because click gave us a move
            epiModel.doCritterDrop(iCritter, tToRowCol)
        }
        this.draggingCritter = false;
    },

    /**
     * Handles a click on a critter.
     * Registered in the constructor of the CritterView (find this.healthCircle.click(... )
     *
     * @param theCritter    the actual Critter clicked.
     */
    doCritterClick: function (iCritter) {
        if (epiOptions.dataOnCritterClick) this.emitCritterData(iCritter, "click");
        epiModel.selectCritter(iCritter, true);    //  select the critter, and clear any previous selection
        //  todo: extend the selection on shift
        iCritter.view.update();    //  update our view
        this.updateScreen();

        epidemicConnector.selectCritterInCODAP(iCritter);
    },

    clearSelection : function() {
        epiModel.critters.forEach( function(c) {
            c.selected = false;
            c.view.update();        //  remove the selection ring
        })
    },

    /**
     * Asks CODAP to write the Critter data out
     * @param theCritter
     * @param eventType
     */
    emitCritterData: function (theCritter, eventType) {

        var tLocName = (theCritter.where) ? epiGeography.locationFromRowCol(theCritter.where).name : "transit";
        var tValObject = {
            time: epiModel.elapsed,
            name: theCritter.name,
            health: theCritter.health == 0 ? "sick" : "healthy",
            activity: theCritter.activity,
            temp: theCritter.temperature,
            eyeColor: theCritter.eyeColor,
            recordType: eventType,
            location: tLocName,
            col: (theCritter.where) ? epidemic.constants.letters[theCritter.where.col] : "",
            row: (theCritter.where) ? theCritter.where.row + 1 : ""
        };
        epidemicConnector.outputCritterEvent(tValObject, epidemicConnector.kHierarchicalDataSetName, eventRecordCreated);

        function eventRecordCreated(iResult) {
            if (iResult.success) {
                theCritter.caseIDs.push( iResult.values[0]);    //  maintain list of case IDs.

                var dString = eventType + " rec created for " + theCritter.name + ": " + iResult.values[0];
                console.log(dString);
                //if (iEventType === "click")
                  //  epidemicConnector.selectCritterInCODAP(theCritter); //  todo note redundancy with this call in doCritterClick
            }
        }
    },

    /**
     * User asks for a new game. (Or, if a game is in progress, to abort a game)
     */
    newGameButtonPressed: function () {

        if (this.gameInProgress) {  //  we're ending a game
            this.finishGame(epidemic.constants.kIdleState);
        } else {    //  we're starting a new game
            this.newGame();
        }
        this.updateScreen();
    },

    /**
     * Called at the very beginning to initialize this component.
     * Creates the connector, the name-making object, the model, and the view.
     */
    initializeComponent: function () {

        //  save UI element names

        this.UI.gameButton = document.getElementById("newGameButton");
        this.UI.timeText = document.getElementById("timeText");
        this.UI.startStopButton = document.getElementById("startStop");
        this.UI.maladyChoiceDiv = document.getElementById("maladyChoiceDiv");
        this.UI.smallGameDiv = document.getElementById("smallGameDiv");
        this.UI.winImage = document.getElementById('winImage');
        this.UI.lossImage = document.getElementById('lossImage');

        medNames.initialize();
        epiMalady.initialize();
        epiOptions.optionChange();
        /*
        var tMaladyOptionsString = epiMalady.optionsString().bind(epiMalady);
        $("#maladyChoice").empty().append( tMaladyOptionsString );
*/
        epiWorldView.initialize();
        epiWorldView.model = epiModel;

        codapInterface.on('notify', epidemicConnector.resourceString, epiManager.codapSelects);

        this.updateScreen();
    },

    /**
     * User has selected a case in CODAP. We want to highlight it in the plugin.
     * Called when a dataContextChangeNotice is issued. We will check to make sure it's a selection.
     */
    codapSelects : function(iMessage) {
        var tMessageValue = iMessage.values;
        if (Array.isArray(tMessageValue)) {
            tMessageValue = tMessageValue[0]; //      the first of the values in the message
        }
        if (tMessageValue.operation === "selectCases") {    //  OK, it's a selection
            var tResult = tMessageValue.result;
            if (tResult.success) {      //  OK, its successful
                if (tResult.cases) {    //  there are cases
                    var tFirstCase = tResult.cases[0].values;
                    var tCritterName = tFirstCase.name;
                    console.log("Selected " + tCritterName);
                    var tCritter = epiModel.critterByName(tCritterName);
                    epiModel.selectCritter(tCritter, true);     //      clear selection first
                } else {    //  no cases; maybe this is a deselection
                    console.log("deselect??");
                }

            }

        }
    },

    /**
     * Manages save and restore
     */

    epiDoCommand: function (arg, iCallback) {
        var tCommand = arg.operation;
        switch (tCommand) {
            case "saveState":
                //  here we construct the "state" to be restored
                console.log("eeps saving...");
                var tState = {      //  get "saveObject"s for each area of the program. Critters and Locations are part of the model.
                    epiManager : epiManager.getSaveObject(),
                    epiGeography : epiGeography.getSaveObject(),
                    epiMalady : epiMalady.getSaveObject(),
                    epiModel : epiModel.getSaveObject(),
                    epiOptions : epiOptions.getSaveObject()
                };

                iCallback({success: true, state: tState});
                break;

            case "restoreState":
                console.log("eeps restoring...");
                var tOutcomeSuccessful = true;
                var tState = arg.args.state;

                //  here we restore whatever we saved in the "saveState" case
                epiManager.restoreFrom( tState.epiManager );
                epiGeography.restoreFrom( tState.epiGeography );
                epiMalady.restoreFrom( tState.epiMalady );
                epiModel.restoreFrom( tState.epiModel );
                epiOptions.restoreFrom( tState.epiOptions );

                epiWorldView.flushAndRedraw();      //  called after the model is restored?

                iCallback({success: tOutcomeSuccessful});

                epiManager.pause();     //   make sure we're stopped.
                epiManager.updateScreen();
                break;
            default:
                //console.log("A command we don't care about: " + tCommand);
                break;
        }
    },

    /**
     * Make the object we need to restore THIS object (the epiManager)
     * @returns {{version: *, gameNumber: *, gameInProgress: *, CODAPConnector: (*|{myIndex: *, currentLocationIndex: number, destLocIndex: number, x: *, y: *, speed: *, moving: *, motivation: (*|{name: string, version: string, dimensions: {width: number, height: number}, collections: *[]}), activity: *, health: *, elapsedSick: *, infectious: *, infected: *, incubationTime: *, antibodies: *, name: *, eyeColor: *, borderColor: *, baseTemperature: *}|{pRowsInGrid: *, pColumnsInGrid: *, kPixelsWide: *, kPixelsTall: *}|{name: string, version: string, dimensions: {width: number, height: number}, collections: *[]}|{pMaladyNumber: *, pMaladyName: *, pAverageSecondsToInfection: *, pDiseaseDurationInSeconds: *, pIncubationInSeconds: *, pSickSecondsToGameEnd: *, pTotalElapsedSecondsToGameEnd: *, pMaladyNameList: *}|{gameCaseID: *, gameNumber: *, gameCollectionName: *})}}
     */
    getSaveObject: function() {
        var tSaveObject = {
            version : this.version,
            gameNumber : this.gameNumber,
            //  previous
            //  running
            gameInProgress : this.gameInProgress,
            //draggingCritter
            CODAPConnector : this.CODAPConnector.getSaveObject()
        };
        return tSaveObject;
    },

    /**
     * restore the epiManager from the saved object
     * @param iObject       the saved object
     */
    restoreFrom: function( iObject ) {
        this.initializeComponent( );

        this.version = iObject.version;
        this.gameNumber = iObject.gameNumber;
        this.previous = 0;          //      always start anew
        this.running = false;
        this.gameInProgress = iObject.gameInProgress;
        this.draggingCritter = false;   //  never be dragging on restore
        this.CODAPConnector.restoreFrom( iObject.CODAPConnector );

    }
};

