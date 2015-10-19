/**
 * Created by tim on 2015-10-03.
 */
var svgNS = "http://www.w3.org/2000/svg";

var geigerManager;
var geigerGameModel;
var geigerLabView;
var gameCaseID = 0;
var gameNumber = 0;

/**
 * called from the html when user presses the new game button
 */
function newGame() {
    if (gameCaseID > 0) {   //  may not be necesary
        geigerManager.finishGameCase( null );
    }
    gameNumber += 1;
    /**
     * start a new game case
     */
    codapHelper.openCase(
        'games',
        [this.gameNumber, null, 0, null, null],
        setUpNewGameData
    );

    geigerManager.newGame();
    console.log("New game. Source at (" + (geigerGameModel.sourceX) + ", " + (geigerGameModel.sourceY) + ")");
}

/**
 * Used to set the game's caseID. Callback from codapHelper.openCase().
 * @param iResult
 */
function    setUpNewGameData(iResult) { //  todo: figure out how to get this somewhere else. Couldn't get the callback to work.
    gameCaseID = iResult.caseID;
}

/**
 * Singleton view of the "Lab" -- the region in which the speck might hide
 *
 * @type {{canvas: null, ctx: null, pixelsPerUnit: null, unitsAcross: number, setup: Function, update: Function, drawDetector: Function}}
 */
geigerLabView = {
    /**
     * The SVG associated with the lab itself
     *     @property
     */
    mainSVG: null,
    /**
     * The scale of the coordinate system in the view; determined in this.setup()
     */
    pixelsPerUnit: null,
    /**
     * How many units across is this canvas?
     */
    unitsAcross: 10.0,
    /**
     * The svg thingy associated with the detector
     */
    detector: null,
    /**
     * height of the "lab" in pixels
     */
    labHeight: 0,
    /**
     * array of objects containing coordinates and results of past measurements
     */
    ghosts: [],
    crosshairElement: null,

    /**
     * Sets up the properties
     * Also adds event listeners
     */
    setup: function() {
        this.mainSVG = document.getElementById("lab");
        this.mainSVG.addEventListener("mouseup",clickInLab,false);
        this.crosshairElement = document.getElementById("crosshairs");

        var tWidth = Number(this.mainSVG.getAttribute("width"));
        var tHeight = Number(this.mainSVG.getAttribute("height"));
        this.labHeight = tHeight;

        this.pixelsPerUnit = [
            tWidth / this.unitsAcross,
            tHeight / this.unitsAcross
        ];

        this.detector = this.makeDetectorShape();
        this.detector.setAttribute("stroke", "yellow");
        this.detector.setAttribute("stroke-width", "2");
    },

    /**
     * Make and append a shape for display
     */
    makeDetectorShape: function() {

        var tShape =  document.createElementNS(svgNS, "path");
        tShape.setAttribute("d", "M 6 0 L 0 6 L -6 0 L 0 -6 L 6 0");
        this.mainSVG.appendChild(tShape);         //  here we put the new object into the DOM.

        return tShape;
    },

    /**
     * add data for a new "ghost"
     * AND draw the image. Data is {x, y, count}
     * @param data
     */
    addGhost : function( data ) {
        this.ghosts.push( data );

        var tPower = (Math.log10(data.count));
        var tRed = Math.round(255.0 * (tPower/4.0) * (tPower/4.0)); if (tRed > 255) tRed = 255;
        var tGreen = Math.round(255.0 * (1 - tPower/5.0) * (1 - tPower/5.0)); if (tPower > 5) tGreen = 0;
        var tBlue = Math.round(155.0 - 155.0 * (tPower/4.0)); if (tBlue < 0) tBlue = 0;

        var tRGBString = "rgb("+tRed+","+tGreen+","+tBlue+")";
        var tNewGhostShape = this.makeDetectorShape();
        tNewGhostShape.setAttribute("fill", tRGBString);
        tNewGhostShape.setAttribute("stroke", "#ddeeff");
        tNewGhostShape.setAttribute("class", "ghost");
        this.moveShapeTo( tNewGhostShape, data.x, data.y );
    },

    /**
     * Move the crosshairs (which indicate the position of the source) to game coordinates
     * @param x
     * @param y
     */
    setCrosshairs: function(x, y) {
        var tXpixels = x * this.pixelsPerUnit[0];
        var tYpixels = this.labHeight - y * this.pixelsPerUnit[1];

        var tHHair = document.getElementById("hLine");
        var tVHair = document.getElementById("vLine");

        tHHair.setAttribute("x1","0");
        tHHair.setAttribute("y1",tYpixels.toString());
        tHHair.setAttribute("x2",(this.unitsAcross * this.pixelsPerUnit[0]).toString());
        tHHair.setAttribute("y2",tYpixels.toString());

        tVHair.setAttribute("x1",tXpixels.toString());
        tVHair.setAttribute("y1","0");
        tVHair.setAttribute("x2",tXpixels.toString());
        tVHair.setAttribute("y2",(this.unitsAcross * this.pixelsPerUnit[1]).toString());

    },

    /**
     * Alter attributes of the range circle (showing how big the collector is)
     * @param x
     * @param y
     * @param r
     */
    setRangeCircle: function(x, y, r) {
        var tXpixels = x * this.pixelsPerUnit[0];
        var tYpixels = this.labHeight - y * this.pixelsPerUnit[1];
        var tRpixels = r * this.pixelsPerUnit[0];   //  todo: make into an ellipse?

        var tCircle = document.getElementById("rangeCircle");

        tCircle.setAttribute("cx", tXpixels.toString());
        tCircle.setAttribute("cy", tYpixels.toString());
        tCircle.setAttribute("r", tRpixels.toString());
        tCircle.setAttribute("fill", "rgba(255, 255, 255, 0.2)");
    },

    /**
     * Update this view.
     */
    update: function() {
        this.moveShapeTo( this.detector, geigerGameModel.detectorX, geigerGameModel.detectorY);
    },

    /**
     * Draws a shape (an svg sub-thing) at the specified location. Called by this.update() and by the ghost stuff
     */
    moveShapeTo: function( shape, x, y ) {
        var tXpixels = x * this.pixelsPerUnit[0];
        var tYpixels = this.labHeight - y * this.pixelsPerUnit[1];

        var tTransform = "translate(" + tXpixels + "," + tYpixels + ")";
        shape.setAttribute("transform", tTransform);
    }

};

/**
 * Model for the game.
 * @type {{sourceX: number, sourceY: number, sourceStrength: number, detectorX: number, detectorY: number, dose: number, latestCount: number, setup: Function, signalStrength: Function, doMeasurement: Function}}
 */
geigerGameModel = {
    /**
     * (secret) position of the source of radiation
     */
    sourceX: 0,
    sourceY: 0,
    /**
     * Strength of the radiation
     */
    sourceStrength: 0,
    /**
     * Current position of the detector
     */
    detectorX: 1, // Todo: HTML also sets initial values of the boxes to 10; should only be in one place.
    detectorY: 1,
    /**
     * Total dose so far
     */
    dose: 0,
    /**
     * The radiation count for the last time the detector was used
     */
    latestCount: 0,
    /**
     * radius of the "collector"
     */
    collectorRadius: 0.5,

    /**
     * Exceed this and you lose!
     */
    maxDose: 20000,

    /**
     * Initialize model properties for a new game
     */
    newGame: function () {
        this.sourceX = (geigerLabView.unitsAcross * (0.25 + 0.50 * Math.random())).toFixed(2);
        this.sourceY = (geigerLabView.unitsAcross * (0.25 + 0.50 * Math.random())).toFixed(2); // TODO: fix vertical coordinate of source
        this.sourceStrength = 10000;
        this.latestCount = 0;
        this.dose = 0;
    },

    /**
     * Compute the strength of the radiation at the detector. Use inverse square.
     * @returns {number}
     */
    signalStrength: function () {
        var tCount = (geigerGameModel.sourceStrength / this.dSquared());
        tCount = Math.round(tCount);
        return tCount;
    },


    /**
     * Perform a measurement. Updates internal positions. Updates this.latestcount.
     */
    doMeasurement: function(  ) {

        var tSignal = this.signalStrength();
        this.latestCount = document.forms.geigerForm.useRandom.checked ? randomPoisson(tSignal) : tSignal;

        this.dose += this.latestCount;   // TODO: Update game case with current dose.

    },
    /**
     * Utility: what's the square of the distance from the detector to the source?
     * @returns {number}
     */
    dSquared: function() {
        return (this.detectorX - this.sourceX ) * (this.detectorX - this.sourceX )
        + (this.detectorY - this.sourceY ) * (this.detectorY - this.sourceY );
    }

};

/**
 * Overall controller for the game.
 *
 * @type {{initializeComponent: Function, newGame: Function, updateScreen: Function, moveDetectorTo: Function, moveDetectorByTyping: Function, doMeasurement: Function}}
 */
geigerManager = {

    /**
     * string about whether the game is "playing", "won" (the previous game) or "lost"
     */
    gameState: "playing",
    /**
     * initial coordinates of the detector
     */
    initialX: 1,
    initialY: 1,
    /**
     * Initializes various items.
     */
    initializeComponent: function() {
        geigerLabView.setup();
        gauge.setup('doseGauge','Dose',0,geigerGameModel.maxDose);
        newGame();
    },

    /**
     * Resets Geiger for a new game.
     */
    newGame: function() {
        geigerGameModel.newGame();
        geigerLabView.setCrosshairs( geigerGameModel.sourceX, geigerGameModel.sourceY);


        this.moveDetectorTo(this.initialX, this.initialY);

        displayInfo("New game. Find the source!");
        this.gameState = "playing";

        //  remove old ghosts
        var tGhostList = document.getElementsByClassName('ghost');

        while(tGhostList[0]) {
            tGhostList[0].parentNode.removeChild(tGhostList[0]);
        }


        this.updateScreen();
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
        gauge.update( geigerGameModel.dose);

        // UI text changes

/*
        var geigerCoordinates = "(" + geigerGameModel.detectorX + ", "
            + geigerGameModel.detectorY + ")";
        document.getElementById("takeMeasurement").innerHTML = "measure/collect at " + geigerCoordinates;
*/
        // show and hide images

        var winImage = document.getElementById('winImage');
        var lossImage = document.getElementById('lossImage');
        var playingControls = document.getElementById('playingControls');
        var crosshairElement = document.getElementById('crosshairs');

        crosshairElement.setAttribute(
            "y",
            (geigerGameModel.sourceY < 200) ? "240" : "40"
        );


        switch (this.gameState) {
            case "won":
                winImage.style.visibility = 'visible';
                lossImage.style.visibility = 'hidden';
                playingControls.style.visibility = 'hidden';
                crosshairElement.style.visibility = "visible";
                break;
            case "lost":
                winImage.style.visibility = 'hidden';
                lossImage.style.visibility = 'visible';
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

        displayInfo("Detector moved to (" + x + ", " + y + ")");
        this.updateScreen();
    },

    /**
     * Called when a coordinate text box loses focus (onblur).
     * Updates coordinates of the detector.
     */
    moveDetectorByTyping: function() {
        var x = document.forms.geigerForm.detectorX.value.trim();
        var y = document.forms.geigerForm.detectorY.value.trim();
        if (x < 0) x = 0;
        if (x > geigerLabView.unitsAcross) x = geigerLabView.unitsAcross;
        if (y < 0) y = 0;
        if (y > geigerLabView.unitsAcross) y = geigerLabView.unitsAcross;   // TODO: calculate y distance correctly

        this.moveDetectorTo(x, y);
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
                gameCaseID
            ); // no callback?

            displayGeigerCount(geigerGameModel.latestCount); // note: only on doMeasurement!
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
                gameNumber,
                result,
                geigerGameModel.dose,
                geigerGameModel.sourceX,
                geigerGameModel.sourceY
            ],
            gameCaseID
        );
        gameCaseID = 0;     //  so we know there is no open case
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
            // The parent collection spec:
            attrs: [
                {name: "gameNumber", type: 'categorical'},
                {name: "result", type: 'categorical'},
                {name: "dose", type: 'numeric', precision: 0},
                {name: "sourceX", type: 'numeric', precision: 2},
                {name: "sourceY", type: 'numeric', precision: 2}
            ],
            childAttrName: "measurement"
        },
        {
            name: 'measurements',
            labels: {
                pluralCase: "measurements",
                setOfCasesWithArticle: "a game"
            },
            // The child collection specification:
            attrs: [
                {name: "x", type: 'numeric', precision: 1},
                {name: "y", type: 'numeric', precision: 1},
                {name: "count", type: 'numeric', precision: 0}
            ]
        }
    ]
});

/**
 * Called from HTML when user clicks in the "Lab"
 * @param e
 */
function clickInLab( e ) {
//    Note: this routine gives page coordinates. We want the coordinates in the canvas.
    // 2015-10-15 decided to use e.offsetX, Y (using svg) instead of e.layerX (using canvas)
    if (!e) e = window.event;
    var tX = e.offsetX / geigerLabView.pixelsPerUnit[0];     //  convert to units
    var tY = (geigerLabView.labHeight - e.offsetY) / geigerLabView.pixelsPerUnit[1];

    geigerManager.moveDetectorTo(tX, tY);
}

/**
 * Display function: basic info about the sim.
 * @param message {string} The string message.
 */
function    displayInfo( message ) {
    var geigerInfoText = document.getElementById('geigerInfo');
    geigerInfoText.innerHTML = message;
}

/**
 * Display function: the latest count from the geiger counter
 * @param count The number to display
 */
function    displayGeigerCount(count) {
    var geigerCountText = document.getElementById('geigerCount');
    geigerCountText.innerHTML = "count: " + (count) + " at (" +
        (geigerGameModel.detectorX) + ", " + (geigerGameModel.detectorY) + ")" +
        " Dose: " + geigerGameModel.dose + ".";

}

/**
 * A funky random Poisson function.
 * Use Knuth algorithm up to n = 100; normal approximation beyond that.
 * @param mean
 * @returns {number}
 */
function    randomPoisson( mean ) {

    if (mean > 100) {
        var sd = Math.sqrt(mean);
        return Math.round(randomNormal(mean,sd));
    }
    var L = Math.exp(-mean);
    var p = 1.0;
    var k = 0;
    do {
        k++;
        p *= Math.random();
    } while (p > L);
    return (k - 1);
}

/**
 * Random normal, Box-Muller transform. Use only one value.
 * @param mean
 * @param sd
 * @returns {*}
 */
function    randomNormal(mean,sd) {
    var t1 = Math.random();
    var t2 = Math.random();

    var tZ = Math.sqrt(-2 * Math.log(t1)) * Math.cos(2 * Math.PI*t2);

    return mean + sd * tZ;
}