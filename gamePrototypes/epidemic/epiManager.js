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
    version : "vPre-001",
    gameNumber: 0,
    CODAPConnector: null,

    nLocations: 100,
    locTypes: [ "food", "water", "dwelling"],
    previous: 0,    //  timestamp for animation
    running: Boolean( false ),
    gameInProgress: Boolean (false),

    /**
     * General update method. Asks the model to update, then updates our screen.
     * @param dt
     */
    update : function( dt) {
        epiModel.update( dt );       //
        this.updateScreen();
    },

    /**
     * Manages update of screen. this involves the main view plus any of our UI stuff.
     */
    updateScreen: function() {
        medWorldView.updateScreen();
        this.updateUIStuff();
    },

    /**
     * Animation function for Epidemic.
     * Necessary not for visible animations, but for updating the model *hunger, thirst, etc)
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
    newGame:    function() {
        this.gameNumber += 1;
        this.CODAPConnector.newGameCase( "epidemics", this.gameNumber);
        epiModel.newGame();
        medWorldView.flushAndRedraw();
        this.gameInProgress = true;
        this.restart();
    },

    /**
     * Handles the end of a game in Epidemic
     * @param result    could be "won" "lost" "aborted" etc
     */
    finishGame: function( result ) {
        this.gameInProgress = false;
        this.pause();       //  stop any animation and progress
        this.CODAPConnector.finishGameCase( result );
        this.updateScreen();
    },

    pause: function() {
        this.running = false;
        this.updateScreen();
    },

    restart: function() {
        this.previous = null;
        this.running = true;
        window.requestAnimationFrame(this.animate); //  START UP
        this.updateScreen();
    },

    /**
     * Updates text, button text, etc., that is not in the main "world" display area
     */
    updateUIStuff : function( ) {
        var timeText = document.getElementById("timeText");
        timeText.innerHTML = parseFloat(epiModel.elapsed.toFixed(2));

        var startStopButton = document.getElementById("startStop");
        startStopButton.innerHTML = (this.running) ? "pause" : "go";
        startStopButton.disabled = !(this.gameInProgress);

        var gameButton = document.getElementById("newGameButton");
        gameButton.innerHTML = (this.gameInProgress) ? "abort game" : "new game";
    },

    /**
     * Handles a click on a critter.
     * @param theCritter    the actual Critter clicked.
     */
    doCritterClick : function( theCritter ) {
        console.log("clicked in critter named " + theCritter.name);
        if (epiOptions.dataOnCritterClick) this.emitCritterData(theCritter, "click");
    },

    /**
     * Asks CODAP to write the Critter data out
     * @param theCritter
     * @param eventType
     */
    emitCritterData : function( theCritter, eventType ) {

        var tLocName = (theCritter.currentLocation) ? theCritter.currentLocation.name : "transit";
        this.CODAPConnector.doEventRecord( [
            epiModel.elapsed,
            theCritter.name,
            theCritter.eyeColor,
            theCritter.activity,
            theCritter.temperature,
            eventType,
            theCritter.health == 0 ? "sick" : "healthy",
            tLocName,
            theCritter.currentLocation.row,
            theCritter.currentLocation.col
        ]);
    },

    /**
     * User asks for a new game.
     */
    newGameButtonPressed: function () {

        if (this.gameInProgress) {  //  we're ending a game
            this.finishGame( "abort");
            //  this.endGame("abort");
        } else {    //  we're starting a new game
            // todo: redundant with restart()?
            window.requestAnimationFrame(this.animate);
            this.running = Boolean(true);
            this.newGame();
        }
        this.updateScreen();
    },

    /**
     * Called at the very beginnning to initialize this component.
     * Creates the connector, the name-making object, the model, and teh view.
     */
    initializeComponent : function() {
        this.CODAPConnector = new EpiCODAPConnector( );
        medNames.initialize();
        medWorldView.initialize();
        medWorldView.model = epiModel;
       // this.newGame();
    },

    /**
     * Manages save and restore
     */

    epiDoCommand : function( arg ) {
        // console.log(arg);
    }
};

