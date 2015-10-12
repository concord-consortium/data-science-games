/**
 * Created by tim on 2015-10-03.
 */
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
    console.log("got case ID " + (gameCaseID));
}

/**
 * Singleton view of the "Lab" -- the region in which the speck might hide
 *
 * @type {{canvas: null, ctx: null, pixelsPerUnit: null, unitsAcross: number, setup: Function, update: Function, drawDetector: Function}}
 */
geigerLabView = {
    /**
     * The HTML <canvas>
     *     @property
     */
    canvas: null,
    /**
     * The drawing context for this.canvas
     */
    ctx: null,
    /**
     * The scale of the coordinate system in the view; determined in this.setup()
     */
    pixelsPerUnit: null,
    /**
     * How many units across is this canvas?
     */
    unitsAcross: 100.0,

    /**
     * Sets up the properties
     * Also adds event listeners
     */
    setup: function() {
        this.canvas = document.getElementById("lab");
        this.canvas.addEventListener("mouseup",clickInLab,false);
        this.ctx = this.canvas.getContext('2d');
        this.pixelsPerUnit = [
            this.canvas.width / this.unitsAcross,
            this.canvas.height / this.unitsAcross
        ];
    },

    /**
     * Update this view.
     */
    update: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.beginPath();
        this.drawDetector();
        this.ctx.closePath();
        // window.requestAnimationFrame(geigerLabView.update);
    },

    /**
     * Draws the detector at the current location. Called by this.update().
     */
    drawDetector: function( ) {
        var tContext = this.ctx;

        tContext.save();
        tContext.strokeStyle = "#DDEEFF";
        tContext.translate(
            geigerGameModel.detectorX * this.pixelsPerUnit[0],
            this.canvas.height - geigerGameModel.detectorY * this.pixelsPerUnit[1]
        );

        tContext.beginPath();
        tContext.moveTo(0,6);
        tContext.lineTo(-6,0);
        tContext.lineTo(0, -6);
        tContext.lineTo(6,0);
        tContext.closePath();
        tContext.stroke();

        tContext.restore();
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
    detectorX: 10, // Todo: HTML also sets initial values of the boxes to 10; should only be in one place.
    detectorY: 10,
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
    collectorRadius: 2.0,

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
        this.sourceStrength = 1000000;
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
     * @param x     X-position of detector.
     * @param y
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
        var tDsquared = (this.detectorX - this.sourceX ) * (this.detectorX - this.sourceX )
        + (this.detectorY - this.sourceY ) * (this.detectorY - this.sourceY );
        return tDsquared;
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
    initialX: 10,
    initialY: 10,
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

        this.moveDetectorTo(this.initialX, this.initialY);

        displayInfo("New game. Find the source!");
        this.gameState = "playing";
        this.updateScreen();
    },

    /**
     * called when the user exceeds the maximum dose
     */
    doLoss: function() {
        this.gameState = "lost";
        console.log("game lost");
        this.finishGameCase( "lost" );
    },

    /**
     * Called when the game is over because we've collected the sample.
     */
    doWin: function() {
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


        switch (this.gameState) {
            case "won":
                winImage.style.visibility = 'visible';
                lossImage.style.visibility = 'hidden';
                playingControls.style.visibility = 'hidden';
                break;
            case "lost":
                winImage.style.visibility = 'hidden';
                lossImage.style.visibility = 'visible';
                playingControls.style.visibility = 'hidden';
                break;
            case "playing":
                winImage.style.visibility = 'hidden';
                lossImage.style.visibility = 'hidden';
                playingControls.style.visibility = 'visible';
                break;

        }

    },

    /**
     * In charge of moving the detector.
     * Responds to clicks OR to edits in the coordinates from text boxes.
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
        if (geigerGameModel.dSquared() < geigerGameModel.collectorRadius) {
            geigerManager.doWin()
        } else {
            geigerGameModel.doMeasurement();

            codapHelper.createCase(
                'measurements',
                [geigerGameModel.detectorX, geigerGameModel.detectorY, geigerGameModel.latestCount],
                gameCaseID
            ); // no callback?

            displayGeigerCount(geigerGameModel.latestCount); // note: only on doMeasurement!
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
    dimensions: {width: 444, height: 600},
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
    if (!e) e = window.event;
    var tX = e.layerX / geigerLabView.pixelsPerUnit[0];     //  convert to units
    var tY = (geigerLabView.canvas.height - e.layerY) / geigerLabView.pixelsPerUnit[1];

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
        var tCount = Math.round(randomNormal(mean,sd));
        return tCount;
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