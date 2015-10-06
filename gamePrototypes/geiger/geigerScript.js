/**
 * Created by tim on 2015-10-03.
 */
var geigerManager;
var geigerGameModel;
var geigerLabView;
var gameCaseID = 0;
var gameNumber = 0;
var max_dose = 20000;


function newGame() {
    if (gameCaseID > 0) {
        codapHelper.closeCase(
            'games',
            [this.gameNumber, geigerGameModel.dose, geigerGameModel.sourceX, geigerGameModel.sourceY],
            gameCaseID
        );
    }
    gameNumber += 1;

    codapHelper.openCase(
        'games',
        [this.gameNumber, 0, null, null],
        setUpNewGameData
    );

    geigerManager.newGame();
    console.log("New game. Source at (" + (geigerGameModel.sourceX) + ", " + (geigerGameModel.sourceY) + ")");
}

function    setUpNewGameData(iResult) {
    gameCaseID = iResult.caseID;
    console.log("got case ID " + (gameCaseID));
}

geigerLabView = {
    canvas: null,
    ctx: null,
    pixelsPerUnit: null,
    unitsAcross: 100.0,


    setup: function() {
        this.canvas = document.getElementById("lab");
        this.canvas.addEventListener("mouseup",clickInLab,false);
        this.ctx = this.canvas.getContext('2d');
        this.pixelsPerUnit = [
            this.canvas.width / this.unitsAcross,
            this.canvas.height / this.unitsAcross
        ];
    },

    update: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.beginPath();
        this.drawDetector();
        this.ctx.closePath();

        // UI text changes

        var geigerCoordinates = "(" + geigerGameModel.detectorX + ", "
            + geigerGameModel.detectorY + ")";
        document.getElementById("takeMeasurement").innerHTML = "measure at " + geigerCoordinates;

        // window.requestAnimationFrame(geigerLabView.update);
    },

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

geigerGameModel = {
    sourceX: 0,
    sourceY: 0,
    sourceStrength: 0,
    detectorX: 0,
    detectorY: 0,
    dose: 0,
    latestCount: 0,

    setup: function () {
        this.sourceX = (geigerLabView.unitsAcross * (0.25 + 0.50 * Math.random())).toFixed(2);
        this.sourceY = (geigerLabView.unitsAcross * (0.25 + 0.50 * Math.random())).toFixed(2); // TODO: fix vertical coordinate of source
        this.sourceStrength = 1000000;
        this.dose = 0;
    },

    signalStrength: function () {
        var tDsquared = (this.detectorX - this.sourceX ) * (this.detectorX - this.sourceX )
            + (this.detectorY - this.sourceY ) * (this.detectorY - this.sourceY );
        var tCount = (geigerGameModel.sourceStrength / tDsquared);
        tCount = Math.round(tCount);
        return tCount;
    },


    doMeasurement: function( x, y ) {
        this.detectorX = x;
        this.detectorY = y;
        var tSignal = this.signalStrength();
        this.latestCount = document.forms.geigerForm.useRandom.checked ? randomPoisson(tSignal) : tSignal;

        this.dose += this.latestCount;   // TODO: Update game case with current dose.

    }

};

geigerManager = {

    initializeComponent: function() {
        geigerLabView.setup();
        gauge.setup('doseGauge','Dose',0,max_dose);
        newGame();
    },

    newGame: function() {
        displayInfo("New game. Find the source!");
        geigerGameModel.setup();
        this.latestCount = 0;
        this.updateScreen();
    },

    updateScreen: function() {
        geigerLabView.update();
        gauge.update( geigerGameModel.dose);
    },

    moveDetectorTo: function (x, y) {
        geigerGameModel.detectorX = x;
        geigerGameModel.detectorY = y;

        // make sure the coordinate boxes read the right values
        document.getElementById('detectorX').value = x.toString();
        document.getElementById('detectorY').value = y.toString();

        displayInfo("Detector moved to (" + x + ", " + y + ")");
        this.updateScreen();
    },

    moveDetectorByTyping: function() {
        var x = document.forms.geigerForm.detectorX.value.trim();
        var y = document.forms.geigerForm.detectorY.value.trim();
        if (x < 0) x = 0;
        if (x > geigerLabView.unitsAcross) x = geigerLabView.unitsAcross;
        if (y < 0) y = 0;
        if (y > geigerLabView.unitsAcross) y = geigerLabView.unitsAcross;   // TODO: calculate y distance correctly

        this.moveDetectorTo(x, y);
    },

    doMeasurement: function() {
        var tX = document.forms.geigerForm.detectorX.value.trim();
        var tY = document.forms.geigerForm.detectorY.value.trim();

        geigerGameModel.doMeasurement( tX, tY );

        codapHelper.createCase(
            'measurements',
            [geigerGameModel.detectorX, geigerGameModel.detectorY, geigerGameModel.latestCount],
            gameCaseID
        ); // no callback?

        displayGeigerCount( geigerGameModel.latestCount ); // note: only on doMeasurement!

        this.updateScreen();
    }
};

codapHelper.initSim({
    name: 'Geiger',
    dimensions: {width: 444, height: 600},
    collections: [  // There are two collections: a parent and a child
        {
            name: 'games',
            // The parent collection spec:
            attrs: [
                {name: "gameNumber", type: 'categorical'},
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

function clickInLab( e ) {
//    Note: this routine gives page coordinates. We want the coordinates in the canvas.
    if (!e) e = window.event;
    var tX = e.layerX / geigerLabView.pixelsPerUnit[0];     //  convert to units
    var tY = (geigerLabView.canvas.height - e.layerY) / geigerLabView.pixelsPerUnit[1];

    geigerManager.moveDetectorTo(tX, tY);
}


function    displayInfo( message ) {
    var geigerInfoText = document.getElementById('geigerInfo');
    geigerInfoText.innerHTML = message;
}

function    displayGeigerCount(count) {
    var geigerCountText = document.getElementById('geigerCount');
    geigerCountText.innerHTML = "count: " + (count) + " at (" +
        (geigerGameModel.detectorX) + ", " + (geigerGameModel.detectorY) + ")" +
        " Dose: " + geigerGameModel.dose + ".";

}

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

function    randomNormal(mean,sd) {
    var t1 = Math.random();
    var t2 = Math.random();

    var tZ = Math.sqrt(-2 * Math.log(t1)) * Math.cos(2 * Math.PI*t2);

    return mean + sd * tZ;
}