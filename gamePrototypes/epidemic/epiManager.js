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
    version: "vPre-003c",
    UI : {},
    gameNumber: 0,
    CODAPConnector: null,

    pNumLocations: 100,
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
            this.pNumLocations = 25;
            epiGeography.setGridSize( 5 );
            epiWorldView.setGridSize();
            epiModel.numberOfCritters = 20;
        }
        else {
            this.pNumLocations = 100;
            epiGeography.setGridSize( 10 );
            epiWorldView.setGridSize();
            epiModel.numberOfCritters = 49;
        }

        this.gameNumber += 1;
        this.CODAPConnector.newGameCase("epidemics", this.gameNumber);

        epiModel.newGame( );            //  create all model Critters and Locations
        epiWorldView.flushAndRedraw();  //  draw all Locations and Critters anew
        this.gameInProgress = true;
        epiOptions.optionChange();      //  make sure all the option checks are saved
        this.restart();                 //  time starts up
      //  this.captureDataForAllCritters();   //  todo:  this doesn't work! Fix it!
    },

    /**
     * Handles the end of a game in Epidemic
     * @param result    could be "won" "lost" "aborted" etc
     */
    finishGame: function (result) {
        this.gameInProgress = false;
        this.pause();       //  stop any animation and progress
        var theData = {
            nMoves : epiModel.nMoves,
            sickSeconds : epiModel.sicknessReport().totalElapsed,
            elapsed : epiModel.elapsed,
            result : result
        };
        this.CODAPConnector.finishGameCase(theData);
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
        window.requestAnimationFrame(this.animate); //  START UP TIME

        epiModel.critters.forEach( function(c) {       //   start up critter movements
            if (c.moving) {
                c.headForCenterOfLocation(c.destLoc);
            }
        });
        this.updateScreen();
    },

    /**
     * Updates text, button text, etc., that is not in the main "world" display area
     */
    updateUIStuff: function () {

        this.UI.timeText.innerHTML = parseFloat(epiModel.elapsed.toFixed(2));
        this.UI.startStopButton.style.backgroundImage = (this.running) ? "url('../art/pause.png')" : "url('../art/play.png')";
        this.UI.smallGameDiv.style.visibility = (this.gameInProgress) ? "hidden" : "visible";
        this.UI.maladyChoiceDiv.style.visibility = (this.gameInProgress) ? "hidden" : "visible";
        this.UI.startStopButton.style.visibility = (this.gameInProgress) ? "visible" : "hidden";

        this.UI.gameButton.innerHTML = (this.gameInProgress) ? "abort game" : "new game";

        tSickReport = epiModel.sicknessReport();
        $( "#healthReport").html("Moves: " + epiModel.nMoves
            + " Sick: " + tSickReport.numberSick
            + ", Total sick seconds: " + tSickReport.totalElapsed);
    },

    handleDropOfCritter: function (iCritter, iX, iY) {
        this.draggingCritter = false;

        // todo: consider moving the rest to epiModel
        var tDepartureLoc = iCritter.currentLocation;
        var tArrivalLoc = epiModel.coordsToLocation(iX, iY);
        if (tDepartureLoc != tArrivalLoc) { //  kludge because click gave us a move
            if (tArrivalLoc) {
                iCritter.doDeparture(tDepartureLoc, "dragged");
                epiModel.doArrival({
                    critter: iCritter,
                    atLocation: tArrivalLoc
                });
                epiModel.nMoves += 1;
            }
        }
    },

    /**
     * Captures data for all critters at once
     */
    captureDataForAllCritters : function() {
        epiModel.critters.forEach( function( iCritter ) {
            epiManager.emitCritterData(iCritter, "all");
        });
    },

    /**
     * Handles a click on a critter.
     * @param theCritter    the actual Critter clicked.
     */
    doCritterClick: function (iCritter) {
        if (epiOptions.dataOnCritterClick) this.emitCritterData(iCritter, "click");
        epiModel.selectCritter(iCritter, true);    //  select the critter, and clear any previous selection
        //  todo: extend the selection on shift
        iCritter.view.update();    //  update our view
        this.updateScreen();
    },

    clearSelection : function() {
        epiModel.critters.forEach( function(c) {
            c.selected = false;
            c.view.update();
        })
    },


    /**
     * Asks CODAP to write the Critter data out
     * @param theCritter
     * @param eventType
     */
    emitCritterData: function (theCritter, eventType) {

        var tLocName = (theCritter.currentLocation) ? theCritter.currentLocation.name : "transit";
        this.CODAPConnector.doEventRecord([
            epiModel.elapsed,
            theCritter.name,
            theCritter.health == 0 ? "sick" : "healthy",
            theCritter.activity,
            theCritter.temperature,
            theCritter.eyeColor,
            eventType,
            tLocName,
            (theCritter.currentLocation) ? theCritter.currentLocation.row + 1 : "",
            (theCritter.currentLocation) ? theCritter.currentLocation.col + 1 : ""
        ]);
    },

    /**
     * User asks for a new game. (Or, if a game is in progress, to abort a game)
     */
    newGameButtonPressed: function () {

        if (this.gameInProgress) {  //  we're ending a game
            this.finishGame("abort");
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

        this.CODAPConnector = new farsCODAPConnector();
        medNames.initialize();
        epiWorldView.initialize();
        epiWorldView.model = epiModel;
        this.updateScreen();
    },

    /**
     * Manages save and restore
     */

    epiDoCommand: function (arg, iCallback) {
        var tCommand = arg.operation;
        switch (tCommand) {
            case "saveState":
                //  here we construct the "state" to be restored
                console.log("saving...");
                var tState = {
                    epiManager : epiManager.getSaveObject(),
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

    getSaveObject: function() {
        var tSaveObject = {
            version : this.version,
            gameNumber : this.gameNumber,
            pNumLocations : this.pNumLocations,
            //  previous
            //  running
            gameInProgress : this.gameInProgress,
            //draggingCritter
            CODAPConnector : this.CODAPConnector.getSaveObject()
        };
        return tSaveObject;
    },

    restoreFrom: function( iObject ) {
        this.initializeComponent( );

        this.version = iObject.version;
        this.gameNumber = iObject.gameNumber;
        this.pNumLocations = iObject.pNumLocations;
        this.previous = 0;          //      always start anew
        this.running = false;
        this.gameInProgress = iObject.gameInProgress;
        this.draggingCritter = false;   //  never be dragging on restore
        this.CODAPConnector.restoreFrom( iObject.CODAPConnector );

    }


};

