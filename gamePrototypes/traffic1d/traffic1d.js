/**
 * Created by tim on 10/7/15.
 */

var trafficManager;
var trafficModel;
var roadView;

var Light = function () {
    color = "green";
    phase = 2;
    yellowDwell = 2;

    setColor = function (time, period) {
        theta = time % period;
        if (this.phase > period / 2 && theta < period / 2) {
            theta += period;
        }
        if (theta > this.phase && theta < (this.phase + period / 2 - this.yellowDwell)) {
            this.color = "green";
        } else if (theta > this.phase + period / 2 - this.yellowDwell && theta < this.phase + period / 2) {
            this.color = "yellow";
        } else {
            this.color = "red";
        }
    }
};


roadView = {

    ctx:    null,
    canvas: null,

    initialize: function() {
        this.canvas = document.getElementById("road");
        this.canvas.addEventListener("mouseup",this.clickOnRoad,false);
        this.ctx = roadView.canvas.getContext('2d');

    },

    draw: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawRoad();
        for (var i = 0; i < trafficModel.cars.length; i++) {
            trafficModel.cars[i].draw( this.ctx );
        }
    },

    drawRoad: function() {
        var tContext = this.ctx;

        tContext.save();
        tContext.fillStyle  = "#eeeeee";
        tContext.fillRect(0,16, this.canvas.width, 68);
        tContext.fillStyle = "#888888";
        tContext.fillRect(0,20, this.canvas.width, 60);

        tContext.strokeStyle = "#eeeeee";
        tContext.setLineDash([6]);
        tContext.moveTo(0, 50);
        tContext.lineTo(this.canvas.width, 50);
        tContext.stroke();
        tContext.restore();

    },

    clickOnRoad: function() {

    }
};

trafficModel = {
    time: 0,
    cars: [],
    lightSystem:    {lights: [], period: 10},

    update: function( dt ) {
        this.time += dt;
        for (var i = 0; i < this.lightSystem.lights.length; i++) {
            this.lightSystem.lights[i].setColor();
        }
        for (i = 0; i < this.cars.length; i++) {
            this.cars[i].update(dt);
        }
    },

    newGame: function() {
        this.cars = [];
        this.time = 0;
    }
};

trafficManager = {
    newGame: function() {
        trafficModel.newGame();
        window.requestAnimationFrame(this.animate);
    },

    addCar: function() {
        var c = new Car();
        trafficModel.cars.push(c);
    },

    update: function(dt) {
        trafficModel.update(dt);
        this.updateScreen();
    },

    updateScreen: function() {
        roadView.draw();
    },

    click:  function() {

    },

    startStop: function() {
        this.newGame();

    },

    initializeComponent: function() {
        roadView.initialize();
        this.updateScreen();
    },

    previous: 0,

    animate: function(timestamp) {
        if (!this.previous)  this.previous = timestamp;
        var tDt = (timestamp - this.previous)/ 1000.0;
        this.previous = timestamp;
        trafficManager.update( tDt );
        window.requestAnimationFrame(trafficManager.animate);
    }

};

/**
 * Required call to initialize the sim, connect it to CODAP.
 */
codapHelper.initSim({
    name: 'Traffic1d',
    dimensions: {width: 820, height: 200},
    collections: [  // There are > two collections: a parent and a child
        {
            name: 'games',
            // The parent collection spec:
            attrs: [
                {name: "gameNumber", type: 'categorical'},
                {name: "result", type: 'categorical'}
            ],
            childAttrName: "run"
        },
        {
            name: 'runs',
            labels: {
                pluralCase: "runs",
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


