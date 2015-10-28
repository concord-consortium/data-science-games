/**
 * Created by tim on 10/19/15.
 */

/*
==========================================================================
medManager.js

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
var medManager;

medManager = {
    gameNumber: 0,
    CODAPConnector: null,

    nLocations: 100,
    locTypes: [ "food", "water", "dwelling"],
    previous: 0,    //  timestamp for animation
    running: Boolean( false ),
    gameInProgress: Boolean (false),

    update : function( dt) {
        medModel.update( dt );       //

        this.updateScreen();
    },

    updateScreen: function() {
        medWorldView.updateScreen();
        this.updateUIStuff();
    },

    animate: function (timestamp) {
        if (!medManager.previous)  medManager.previous = timestamp;
        var tDt = (timestamp - medManager.previous) / 1000.0;
        medManager.previous = timestamp;
        medManager.update(tDt);
        if (medManager.running) window.requestAnimationFrame(medManager.animate);
    },

    newGame:    function() {
        this.gameNumber += 1;
        this.CODAPConnector.newGameCase( "epidemics", this.gameNumber);
        medModel.newGame();
        medWorldView.flushAndRedraw();
        this.gameInProgress = true;
        this.restart();
    },

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

    updateUIStuff : function( ) {
        var timeText = document.getElementById("timeText");
        timeText.innerHTML = parseFloat(medModel.elapsed.toFixed(2));

        var startStopButton = document.getElementById("startStop");
        startStopButton.innerHTML = (this.running) ? "pause" : "go";
        startStopButton.disabled = !(this.gameInProgress);

        var gameButton = document.getElementById("newGameButton");
        gameButton.innerHTML = (this.gameInProgress) ? "abort game" : "new game";
        
        
    },

    doCritterClick : function( theCritter ) {
        console.log("clicked in critter named " + theCritter.name);
        this.CODAPConnector.doEventRecord( [
            medModel.elapsed,
            theCritter.name,
            theCritter.currentLocation.name,
            "click",
            theCritter.health == 0 ? "sick" : "healthy"
        ]);
    },

    newGameButtonPressed: function () {

        if (this.gameInProgress) {  //  we're ending a game
            this.finishGame( "abort");
            //  this.endGame("abort");
        } else {    //  we're starting a new game
            window.requestAnimationFrame(this.animate);
            this.running = Boolean(true);
            this.newGame();
        }
        this.updateScreen();
    },
    
    initializeComponent : function() {
        this.CODAPConnector = new MedCODAPConnector( );
        medNames.initialize();
        medWorldView.initialize();
        medWorldView.model = medModel;
       // this.newGame();
    }
};

