/**
 * Created by tim on 10/7/15.
 */
var svgNS = "http://www.w3.org/2000/svg";

var trafficManager;
var trafficModel;
var roadView;

var Light = function () {
    this.color = "green";
    this.phase = 2;
    this.yellowDwell = 3;
    this.location = 400;
    this.size = 30;
    this.SVGRect = null;

    this.SVGRect = document.createElementNS(svgNS, "rect");
    this.SVGRect.setAttribute("fill", this.color);
    this.SVGRect.setAttribute("width", this.size);
    this.SVGRect.setAttribute("height", roadView.roadSVG.getAttribute("height"));

    roadView.roadSVG.appendChild(this.SVGRect);         //  here we put the new object into the DOM.

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

Light.prototype.draw = function ( ) {
    this.SVGRect.setAttribute("fill", this.color);
    this.SVGRect.setAttribute("x", this.location - this.size/2);
    this.SVGRect.setAttribute("y", 0);

};

roadView = {

    roadSVG: null,

    initialize: function () {
        this.roadSVG = document.getElementById("road");

    },

    draw: function () {
        this.drawRoad();
        var i;
        for (i = 0; i < trafficModel.lightSystem.lights.length; i++) {
            trafficModel.lightSystem.lights[i].draw( );
        }
        for (i = 0; i < trafficModel.cars.length; i++) {
            trafficModel.cars[i].draw( );
        }

    },

    drawRoad: function () {

    },

    clickOnRoad: function () {

    }
};

trafficModel = {
    time: 0,
    cars: [],
    lightSystem: {lights: [], period: 16},
    streetLength: null,

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
            this.lightSystem.lights[i].setColor(this.time, this.lightSystem.period);
        }
    },

    newGame: function () {
        this.cars = [];
        this.time = 0;
        this.streetLength = Number(roadView.roadSVG.getAttribute("width"));
        console.log("The street is this length: " + this.streetLength);
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
            lightColor: this.lightSystem.lights[tMinLightIndex].SVGRect.getAttribute("fill") ,
            nextCarDistance: tMinCarDistance,
            nextCarSpeed: tNextCarSpeed,
            nextCarLength: tNextCarLength
        };
    }
};

trafficManager = {
    gameNumber: 0,
    gameCaseID: 0,
    gameInProgress: Boolean(false),
    running: Boolean(false),
    previous: 0,
    carID: 0,

    gameButtonPressed: function () {
        if (this.gameInProgress) {  //  we're ending a game
            this.running = Boolean(false);
            this.endGame("abort");
        } else {    //  we're starting a new game
            trafficModel.newGame();
            window.requestAnimationFrame(this.animate);
            this.running = Boolean(true);
            this.startGame();
        }
        this.gameInProgress = !(this.gameInProgress);
        this.updateScreen();
    },

    addCar: function () {
        var c = new Car();
        if (Math.random() > 0.4) c.lane = 2;

        var newCarSVG = document.createElementNS(svgNS, "svg");
        newCarSVG.setAttribute("x","0");  //  note: attribute names are strings!!
        newCarSVG.setAttribute("y","50");
        newCarSVG.setAttribute("width", c.carLength);
        newCarSVG.setAttribute("height", c.width);

        var carRect = document.createElementNS(svgNS, "rect");
        carRect.setAttribute("x","0");  //  note: attribute names are strings!!
        carRect.setAttribute("y","0");
        carRect.setAttribute("fill","black");
        carRect.setAttribute("width", c.carLength);
        carRect.setAttribute("height", c.width);

        var brakeRect = document.createElementNS(svgNS, "rect");
        brakeRect.setAttribute("x","0");  //  note: attribute names are strings!!
        brakeRect.setAttribute("y","0");
        brakeRect.setAttribute("fill","black");
        brakeRect.setAttribute("width", 4);
        brakeRect.setAttribute("height", c.width);
        brakeRect.setAttribute("id", "brake");

        var carText = document.createElementNS(svgNS, "text");
        carText.setAttribute("fill", "white");
        carText.setAttribute("y", -2);
        carText.setAttribute("textContent", "foo");

        newCarSVG.appendChild(carRect);
        newCarSVG.appendChild(brakeRect);
        newCarSVG.appendChild(carText);

        roadView.roadSVG.appendChild(newCarSVG);         //  here we put the new object into the DOM.

        /*
                codapHelper.openCase(
                    'cars',
                    [null, null],
                    trafficManager.setUpNewCarData
                );
        */
        codapHelper.createCase(
            'cars',
            [null, null],
            trafficManager.gameCaseID,
            trafficManager.setUpNewCarData
        );
        c.ID = this.carID;
        c.SVG = newCarSVG;
        trafficModel.cars.push(c);
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
        timeText.innerHTML = parseFloat(trafficModel.time.toFixed(2));

        var startStopButton = document.getElementById("startStop");
        startStopButton.innerHTML = (this.running) ? "pause" : "go";

        var gameButton = document.getElementById("game");
        gameButton.innerHTML = (this.gameInProgress) ? "abort game" : "new game";
    },

    click: function () {

    },

    startStop: function () {
        this.running = !(this.running);

        if (this.running) {
            console.log("Now runnning. Prev = " + this.previous);

            window.requestAnimationFrame(this.animate);
            console.log("Now runnning (animate called). Prev = " + this.previous);
        } else {
            console.log("Now stopped. Prev = " + this.previous);
            this.previous = 0;  //  so next animate will have a short (zero) dt
            console.log("Still stopped. Prev = " + this.previous);
        };
        this.updateScreen();
    },

    initializeComponent: function () {
        roadView.initialize();
        trafficModel.streetLength = roadView.roadSVG.getAttribute("width");
        trafficModel.lightSystem.lights.push( new Light() ); // default location
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
        console.log("got case ID " + (trafficManager.gameCaseID));
    },

    setUpNewCarData: function(iResult) {
        trafficManager.carID = iResult.caseID;
        console.log("got CAR ID " + (trafficManager.carID));
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

    }
};

/**
 * Required call to initialize the sim, connect it to CODAP.
 */
codapHelper.initSim({
    name: 'Traffic1d',
    dimensions: {width: 820, height: 200},
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


