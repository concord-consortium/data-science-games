/**
 * Created by tim on 10/7/15.
 */

var trafficManager;
var trafficModel;
var roadView;

var Light = function () {
    this.color = "green";
    this.phase = 2;
    this.yellowDwell = 3;
    this.location = 400;
    this.size = 30;

};

Light.prototype.setColor = function (time, period) {
    var theta = time % period;
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
};

Light.prototype.draw = function (ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.location - this.size/2, 50 - this.size/2, this.size, this.size);    //  TODO: get rid of the 50!
    ctx.restore();

};

roadView = {

    ctx: null,
    canvas: null,

    initialize: function () {
        this.canvas = document.getElementById("road");
        this.canvas.addEventListener("mouseup", this.clickOnRoad, false);
        this.ctx = roadView.canvas.getContext('2d');

    },

    draw: function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawRoad();
        var i;
        for (i = 0; i < trafficModel.lightSystem.lights.length; i++) {
            trafficModel.lightSystem.lights[i].draw(this.ctx);
        }
        for (i = 0; i < trafficModel.cars.length; i++) {
            trafficModel.cars[i].draw(this.ctx);
        }

    },

    drawRoad: function () {
        var tContext = this.ctx;

        tContext.save();
        tContext.fillStyle = "#eeeeee";
        tContext.fillRect(0, 16, this.canvas.width, 68);
        tContext.fillStyle = "#888888";
        tContext.fillRect(0, 20, this.canvas.width, 60);

        tContext.strokeStyle = "#eeeeee";
        tContext.setLineDash([6]);
        tContext.moveTo(0, 50);
        tContext.lineTo(this.canvas.width, 50);
        tContext.stroke();
        tContext.restore();

    },

    clickOnRoad: function () {

    }
};

trafficModel = {
    time: 0,
    cars: [],
    streetLength: 0,
    lightSystem: {lights: [], period: 16},

    update: function (dt) {
        this.time += dt;
        var i;

        //  for every car, find its environment (situation) with cars in the current positions
        for ( i = 0; i < this.cars.length; i++) {
            this.cars[i].decision = this.cars[i].decide(this.findCarEnvironment(i));
        }

        //  now have each car update its position
        for ( i = 0; i < this.cars.length; i++) {
            this.cars[i].update(dt);
        }

        // now update the lights
        for (i = 0; i < trafficModel.lightSystem.lights.length; i++) {
            trafficModel.lightSystem.lights[i].setColor(this.time, this.lightSystem.period);
        }
    },

    newGame: function () {
        this.cars = [];
        this.time = 0;
    },

    /**
     * Make an object that describes the car's environment
     * @param thisCar   the INDEX of the car in the this.cars array
     * @returns {{lightDistance: number, lightColor: (string)}}
     */
    findCarEnvironment: function(thisCar) {

        // find the distance to the next light
        var tMinLightDistance = Number.MAX_VALUE;
        var tMinLightIndex = 0;
        var thisLight;
        var tMe = this.cars[thisCar];
        var tDistance;

        for (thisLight = 0; thisLight < this.lightSystem.lights.length; thisLight++) {
            tDistance = (tMe.direction == "east")
                ? this.lightSystem.lights[thisLight].location - tMe.location
                : tMe.location - this.lightSystem.lights[thisLight].location;
            // todo: account for "wrapping" here
            if (tDistance > 0 && tDistance < tMinLightDistance) {
                tMinLightDistance = tDistance;
                tMinLightIndex = thisLight;
            }
        }

        //  find the distance and speed of the next car

        var tMinCarDistance = Number.MAX_VALUE;
        var tMinCarIndex = -1;
        var tNextCarSpeed = Number.MAX_VALUE;
        var tNextCarLength = 0;
        var thatCar;

        for (thatCar = 0; thatCar < this.cars.length; thatCar++) {
            if (thatCar != thisCar) {
                var tYou = this.cars[thatCar];

                if (tMe.direction == "east") {
                    tDistance = (tYou.direction == "east")
                        ? (tYou.location - tMe.location)
                        : (2 * this.streetLength - tYou.location - tMe.location);
                } else {    //   I am headed west
                    tDistance = (tYou.direction == "west")
                        ? (tMe.location - tYou.location)
                        : (tYou.location + tMe.location);
                }
                if (tDistance < 0) tDistance += 2 * this.streetLength;
                if (tDistance >= 0 && tDistance < tMinCarDistance && tMe.lane == tYou.lane) {
                    tMinCarDistance = tDistance;
                    tMinCarIndex = thatCar;
                    tNextCarSpeed = tYou.speed;
                    tNextCarLength = tYou.carLength;
                }
            }
        }

        return {
            lightDistance: tMinLightDistance,
            lightColor: this.lightSystem.lights[tMinLightIndex].color ,
            nextCarDistance: tMinCarDistance,
            nextCarSpeed: tNextCarSpeed,
            nextCarLength: tNextCarLength
        };
    }
};

trafficManager = {
    newGame: function () {
        trafficModel.newGame();
        window.requestAnimationFrame(this.animate);
    },

    addCar: function () {
        var c = new Car();
        if (Math.random() > 0.4) c.lane = 2;
        trafficModel.cars.push(c);
    },

    update: function (dt) {
        trafficModel.update(dt);
        this.updateScreen();
    },

    updateScreen: function () {
        roadView.draw();
        var timeText = document.getElementById("time");
        timeText.innerHTML = parseFloat(trafficModel.time.toFixed(2));
    },

    click: function () {

    },

    startStop: function () {
        this.newGame();

    },

    initializeComponent: function () {
        roadView.initialize();
        trafficModel.streetLength = roadView.canvas.width;
        trafficModel.lightSystem.lights.push( new Light()); // default location
        this.updateScreen();
    },

    previous: 0,

    animate: function (timestamp) {
        if (!this.previous)  this.previous = timestamp;
        var tDt = (timestamp - this.previous) / 1000.0;
        this.previous = timestamp;
        trafficManager.update(tDt);
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


