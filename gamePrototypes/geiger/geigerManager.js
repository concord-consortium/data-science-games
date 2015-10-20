/*
 ==========================================================================
 geigerManager.js

 Main controller for the Geiger DSG.

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
 * Created by tim on 2015-10-03.
 */
var svgNS = "http://www.w3.org/2000/svg";

var geigerManager;

/**
 * Overall controller for the game.
 *
 * @type {{initializeComponent: Function, newGame: Function, updateScreen: Function, moveDetectorTo: Function, moveDetectorByTyping: Function, doMeasurement: Function}}
 */
geigerManager = {

    gameNumber: 0,
    gameCaseID: 0,

    /**
     * string about whether the game is "playing", "won" (the previous game) or "lost"
     */
    gameState: "playing",
    /**
     * initial coordinates of the detector
     */
    initialX: 1,
    initialY: 1,

    gauge: null,

    /**
     * Initializes various items.
     */
    initializeComponent: function() {
        this.gauge = new Gauge();
        this.gauge.setup('doseGauge','Dose',0,geigerGameModel.maxDose);
        geigerLabView.setup( geigerGameModel.unitsAcross );
        this.newGame();
    },

    /**
     * Resets Geiger for a new game.
     */
    newGame: function() {
        if (this.gameCaseID > 0) {   //  may not be necesary
            geigerManager.finishGameCase( null );
        };

        this.gameNumber += 1;
        geigerGameModel.newGame();  //  set up the MODEL for a new game

        /**
         * start a new game case
         */
        codapHelper.openCase(
            'games',
            [this.gameNumber, null, 0, null, null],
            geigerManager.setUpNewGameData
        );

        geigerLabView.setCrosshairs( geigerGameModel.sourceX, geigerGameModel.sourceY);
        geigerLabView.removeOldGhosts();

        this.moveDetectorTo(this.initialX, this.initialY);

        geigerControlPanel.displayInfo("New game. Find the source!");
        this.gameState = "playing";

        this.updateScreen();
    },

    /**
     * Used to set the game's caseID. Callback from codapHelper.openCase().
     * @param iResult
     */
    setUpNewGameData: function (iResult) {
        geigerManager.gameCaseID = iResult.caseID;
    },

    /**
     * called when the user exceeds the maximum dose
     */
    doLoss: function() {
        geigerLabView.crosshairElement.style.visibility = "visible";

        this.gameState = "lost";
        console.log("game lost");
        this.finishGameCase( "lost" );
    },

    /**
     * Called when the game is over because we've collected the sample.
     */
    doWin: function() {
        geigerLabView.crosshairElement.style.visibility = "visible";
        this.gameState = "won";
        console.log("game won");
        this.finishGameCase( "won" );
    },

    /**
     * Calls what's necessary to refresh the screen.
     * This includes the Lab, the gauge, and any other stuff such as text.
     */
    updateScreen: function() {
        geigerLabView.update();
        this.gauge.update( geigerGameModel.dose);

        // show and hide images

        var winImage = document.getElementById('winImage');
        var lossImage = document.getElementById('lossImage');
        var playingControls = document.getElementById('playingControls');
        var crosshairElement = document.getElementById('crosshairs');

        //  todo: hey, this is where the box-location bug is!
        tBoxY = (geigerGameModel.sourceY > geigerGameModel.unitsAcross/2.0) ? "240" : "40";
        console.log("Source at y= "+ geigerGameModel.sourceY +", so we'll put the box at " + tBoxY);

        switch (this.gameState) {
            case "won":
                winImage.style.visibility = 'visible';
                winImage.setAttribute("y", tBoxY);
                lossImage.style.visibility = 'hidden';
                playingControls.style.visibility = 'hidden';
                crosshairElement.style.visibility = "visible";
                break;
            case "lost":
                winImage.style.visibility = 'hidden';
                lossImage.style.visibility = 'visible';
                lossImage.setAttribute("y", tBoxY);
                playingControls.style.visibility = 'hidden';
                crosshairElement.style.visibility = "visible";
                break;
            case "playing":
                winImage.style.visibility = 'hidden';
                lossImage.style.visibility = 'hidden';
                playingControls.style.visibility = 'visible';
                crosshairElement.style.visibility = "hidden";
                break;
        }
    },

    /**
     * In charge of moving the detector.
     * Responds to clicks OR to edits in the coordinates from text boxes.
     * Coordinates are in "game" space.
     * @param x
     * @param y
     */
    moveDetectorTo: function (x, y) {
        geigerGameModel.detectorX = x;
        geigerGameModel.detectorY = y;

        // Make sure the coordinate boxes read the right values.
        // Redundant if user has changed position by typing.
        document.getElementById('detectorX').value = x.toString();
        document.getElementById('detectorY').value = y.toString();

        geigerLabView.setRangeCircle(
            geigerGameModel.detectorX,
            geigerGameModel.detectorY,
            geigerGameModel.collectorRadius
        );

        geigerControlPanel.displayInfo("Detector moved to (" + x + ", " + y + ")");
        this.updateScreen();
    },

    /**
     * Called when a coordinate text box loses focus (onblur).
     * Updates coordinates of the detector.
     */
    moveDetectorByTyping: function() {
        var x = document.forms.geigerForm.detectorX.value.trim();
        var y = document.forms.geigerForm.detectorY.value.trim();
        x = Math.max(0, x);
        x = Math.min(x, geigerLabView.unitsAcross);
        y = Math.max(0, y);
        y = Math.min(y, geigerLabView.unitsAcross);

        this.moveDetectorTo(x, y);
    },

    /**
     * Called from HTML when user clicks in the "Lab"
     * @param e
     */
    clickInLab: function (e) {
        //    Note: this routine gives page coordinates. We want the coordinates in the canvas.
        // 2015-10-15 decided to use e.offsetX, Y (using svg) instead of e.layerX (using canvas)
        if (!e) e = window.event;
        var tX = e.offsetX / geigerLabView.pixelsPerUnit.x;     //  convert to units
        var tY = (geigerLabView.labHeight - e.offsetY) / geigerLabView.pixelsPerUnit.y;

        geigerManager.moveDetectorTo(tX, tY);
    },


    /**
     * User has called for a measurement.
     * Creates a "measurement" case in CODAP.
     */
    doMeasurement: function() {
        //first, figure out if we're close enough to collect it!
        if (geigerGameModel.dSquared()
            < geigerGameModel.collectorRadius * geigerGameModel.collectorRadius) {
            geigerManager.doWin()
        } else {
            geigerGameModel.doMeasurement();

            codapHelper.createCase(
                'measurements',
                [geigerGameModel.detectorX, geigerGameModel.detectorY, geigerGameModel.latestCount],
                this.gameCaseID
            ); // no callback?

            geigerControlPanel.displayGeigerCount(geigerGameModel.latestCount); // note: only on doMeasurement!
            geigerLabView.addGhost(
                {
                    x : geigerGameModel.detectorX,
                    y : geigerGameModel.detectorY,
                    count: geigerGameModel.latestCount
                }
            );
        }
        if (geigerGameModel.dose > geigerGameModel.maxDose) {
            this.doLoss();
        }
        this.updateScreen();
    },

    /**
     * finishes the current game case
     */
    finishGameCase: function( result ) {
        codapHelper.closeCase(
            'games',
            [
                this.gameNumber,
                result,
                geigerGameModel.dose,
                geigerGameModel.sourceX,
                geigerGameModel.sourceY
            ],
            this.gameCaseID
        );
        this.gameCaseID = 0;     //  so we know there is no open case
    }
};

/**
 * Required call to initialize the sim, connect it to CODAP.
 */
codapHelper.initSim({
    name: 'Geiger',
    dimensions: {width: 404, height: 580},
    collections: [  // There are two collections: a parent and a child
        {
            name: 'games',
            labels: {
                singleCase: "game",
                pluralCase: "games",
                setOfCasesWithArticle: "a tournament"
            },
            // The parent collection spec:
            attrs: [
                {name: "gameNumber", type: 'categorical'},
                {name: "result", type: 'categorical'},
                {name: "dose", type: 'numeric', precision: 0},
                {name: "sourceX", type: 'numeric', unit: 'meters', precision: 2},
                {name: "sourceY", type: 'numeric', unit: 'meters', precision: 2}
            ],
            childAttrName: "measurement"
        },
        {
            name: 'measurements',
            labels: {
                singleCase: "measurement",
                pluralCase: "measurements",
                setOfCasesWithArticle: "a game"
            },
            // The child collection specification:
            attrs: [
                {name: "x", type: 'numeric', unit: 'meters', precision: 2},
                {name: "y", type: 'numeric', unit: 'meters', precision: 2},
                {name: "count", type: 'numeric', precision: 0}
            ]
        }
    ]
});

