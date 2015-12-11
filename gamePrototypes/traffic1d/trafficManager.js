/*
 ==========================================================================
 trafficManager.js

 Overall controller for the Traffic 1D DSG.

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

/**
 * Created by tim on 10/7/15.
 */
var svgNS = "http://www.w3.org/2000/svg";

var trafficManager;

/**
 * The main controller singleton
 * @type {{gameNumber: number, gameCaseID: number, gameInProgress: boolean, running: boolean, previous: number, selectedCar: null, selectedLight: null, numberOfLights: number, gameButtonPressed: Function, addCar: Function, setUpNewCarData: Function, clickCar: Function, clickLight: Function, update: Function, updateScreen: Function, updateUIStuff: Function, click: Function, startStop: Function, initializeComponent: Function, animate: Function, startGame: Function, setUpNewGameData: Function, endGame: Function}}
 */
trafficManager = {
    version : "vPre-001",
    gameNumber: 0,
    gameCaseID: 0,
    gameInProgress: Boolean(false),
    running: Boolean(false),
    previous: 0,
    selectedCar: null,
    selectedLight: null,
    numberOfLights: 0,

    gameButtonPressed: function () {
        if (this.gameInProgress) {  //  we're ending a game
            this.running = Boolean(false);
            this.endGame("abort");
        } else {    //  we're starting a new game
            trafficModel.newGame();     //  todo: decide if we need this AND the call to newGame. May have become redundant :)
            window.requestAnimationFrame(this.animate);
            this.running = Boolean(true);
            this.startGame();
        }
        this.gameInProgress = !(this.gameInProgress);
        this.updateScreen();
    },

    /**
     * Add a car to the world.
     */
    addCar: function () {

        codapHelper.createCase(
            'cars',
            [null, null],
            trafficManager.gameCaseID,
            trafficManager.setUpNewCarData
        );
    },

    setUpNewCarData: function(iResult) {
        var c = new Car();
        c.carCaseID = iResult.caseID;
        if (Math.random() > 0.4) c.lane = 2;
        roadView.addCarSVG( c );
        trafficModel.cars.push(c);
        codapHelper.updateCase("cars",[c.carCaseID, null], c.carCaseID);
    },

    clickCar: function(e) {
        console.log("Clicked on car ID#" + this.id + ".");
        trafficManager.selectedCar = trafficModel.getCarFromID(this.id);
        trafficManager.selectedLight = null;
        trafficManager.updateScreen();
    },

    /**
     * Note: "this" is the light itself.
     * @param e
     */
    clickLight: function(e) {
        console.log("Clicked on light #" + this.id + ".");
        trafficManager.selectedLight = trafficModel.getLightFromID(this.id);
        trafficManager.selectedCar = null;

        // trafficManager.selectedLight.phase = 13;
        trafficManager.updateScreen();
    },

    changeLightProperties: function( ) {
        var tPhaseText = document.getElementById("phaseText");
        var tPeriodText = document.getElementById("periodText");
        var tNewPhase = Number(tPhaseText.value);
        var tNewPeriod = Number(tPeriodText.value);

        trafficManager.selectedLight.phase = tNewPhase;
        trafficModel.lightSystem.period = tNewPeriod; // todo: validate!

    },

    update: function (dt) {
        trafficModel.update(dt);    //  also updates trafficModel.time
        this.updateScreen();
    },

    updateScreen: function () {
        roadView.draw();
        this.updateUIStuff();
    },

    updateUIStuff: function() {
        var timeText = document.getElementById("time");
        //timeText.innerHTML = parseFloat(trafficModel.time.toFixed(2));
        timeText.innerHTML = parseFloat(trafficModel.time.toFixed(2));

        var startStopButton = document.getElementById("startStop");
        startStopButton.innerHTML = (this.running) ? "pause" : "go";

        var gameButton = document.getElementById("game");
        gameButton.innerHTML = (this.gameInProgress) ? "abort game" : "new game";

        // Info about the selected car, if any.
        var carInfoDisplay = document.getElementById("singleCarDisplay");
        if (this.selectedCar) {
            carInfoDisplay.innerHTML = this.selectedCar.toString();
            carInfoDisplay.style.display = "inline";
        } else {
            carInfoDisplay.style.display = "none";
        }

        //  Display of info about the selected light
        var lightInfoDisplay = document.getElementById("singleLightDisplay");
        if (this.selectedLight) {
            var tPhaseText = document.getElementById("phaseText");
            var tPeriodText = document.getElementById("periodText");
            var tLightIntroText = document.getElementById("lightIntroText");

            tPhaseText.value = this.selectedLight.phase;
            tPeriodText.value = trafficModel.lightSystem.period;
            tLightIntroText.innerHTML = "Light @ " + this.selectedLight.location;

            lightInfoDisplay.style.display = "inline";
        } else {
            lightInfoDisplay.style.display = "none";
        }
    },

    click: function () {

    },

    start: function() {
        this.previous = 0;
        window.requestAnimationFrame(this.animate);
    },
    
    startStop: function () {
        this.running = !(this.running);

        if (this.running) { this.start()//  START UP
        } else {    // PAUSE
            this.previous = 0;  //  so next animate will have a short (zero) dt
        }
        this.updateScreen();
    },



    initializeComponent: function () {
        this.numberOfLights++;
        roadView.initialize();
        trafficModel.streetLength = roadView.roadSVG.getAttribute("width");
        trafficModel.lightSystem.lights.push( new Light(1, 2, 300) ); // default location
        trafficModel.lightSystem.lights.push( new Light(2, 8, 700) ); // default location
        this.updateScreen();
    },


    animate: function (timestamp) {
        if (!trafficManager.previous)  trafficManager.previous = timestamp;
        var tDt = (timestamp - trafficManager.previous) / 1000.0;
        trafficManager.previous = timestamp;
        trafficManager.update(tDt);
        if (trafficManager.running) window.requestAnimationFrame(trafficManager.animate);
    },

    startGame: function() {
        this.gameNumber++;
        codapHelper.openCase(
            'games',
            [this.gameNumber, null],
            trafficManager.setUpNewGameData
        );
    },

    setUpNewGameData: function(iResult) {
        trafficManager.gameCaseID = iResult.caseID;
        console.log("got game case ID " + (trafficManager.gameCaseID));
    },


    endGame: function(reason) {
        codapHelper.closeCase(
            'games',
            [
                this.gameNumber,
                reason
            ],
            this.gameCaseID
        );
        this.gameCaseID = 0;     //  so we know there is no open case
        console.log("Game ended: " + reason);

    }
};

/**
 * Required call to initialize the sim, connect it to CODAP.
 */
codapHelper.initSim({
    name: 'Traffic1d',
    version : trafficManager.version,
    dimensions: {width: 820, height: 120},
    collections: [  // There are > two collections: games, cars, moments
        {
            name: 'games',
            // The parent collection spec:
            attrs: [
                {name: "gameNumber", type: 'categorical'},
                {name: "result", type: 'categorical'}
            ],
            childAttrName: "car"
        },
        {
            name: 'cars',
            labels: {
                pluralCase: "cars",
                setOfCasesWithArticle: "a game"
            },
            // The child collection specification:
            attrs: [
                {name: "ID", type: 'categorical'},
                {name: "flips", type: 'numeric', precision: 0}
            ],
            childAttrName: "moment"
        },
        {
            name: 'moments',
            labels: {
                pluralCase: "moments",
                setOfCasesWithArticle: "a car"
            },
            // The child collection specification:
            attrs: [
                {name: "time", type: 'numeric', precision: 2},
                {name: "location", type: 'numeric', precision: 0},
                {name: "speed", type: 'numeric', precision: 1},
                {name: "action", type: 'categorical'}
            ]
        }
    ]
});


