/**
 * Created by tim on 10/7/15.
 */
var svgNS = "http://www.w3.org/2000/svg";

var trafficManager;
var trafficModel;
var roadView;

var Light = function (number, startPhase, place) {
    this.color = "green";
    this.phase = startPhase;
    this.yellowDwell = 3;
    this.location = place;
    this.size = 30;     //  the width of the thing
    this.wholeSVG = null;
    this.SVGRect = null;
    this.lightNumber = number;

    //  make the svg, put the rect inside
    //  attach an event handler to the larger svg
    //  somehow give it an ID so we know which light gets clicked.

    this.wholeSVG = document.createElementNS(svgNS, "svg");
    this.wholeSVG.setAttribute("width", this.size.toString());
    this.wholeSVG.setAttribute("height", roadView.roadSVG.getAttribute("height"));
    this.wholeSVG.setAttribute("id", "L"+ this.lightNumber);
    this.wholeSVG.addEventListener("click", trafficManager.clickLight);

    this.SVGRect = document.createElementNS(svgNS, "rect");
    this.SVGRect.setAttribute("fill", this.color);
    this.SVGRect.setAttribute("width", "100%");
    this.SVGRect.setAttribute("height", "100%");

    this.wholeSVG.appendChild(this.SVGRect);
    roadView.roadSVG.appendChild(this.wholeSVG);         //  here we put the new object into the DOM.

    console.log("Made light with ID " + this.wholeSVG.getAttribute("id"));
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
    this.wholeSVG.setAttribute("x", (this.location - this.size/2).toString());
    this.wholeSVG.setAttribute("y", "0");
};

roadView = {

    roadSVG: null,
    carSVGSize: 40,

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

    },

    addCarSVG: function (c ) {
        var newCarSVG = document.createElementNS(svgNS, "svg");
        newCarSVG.setAttribute("width", this.carSVGSize.toString());
        newCarSVG.setAttribute("height", this.carSVGSize.toString());

        newCarSVG.setAttribute("x","0");  //  note: attribute names are strings!!
        newCarSVG.setAttribute("y","0");
        newCarSVG.setAttribute("id", "C"+ c.carCaseID);

        var tTop, tLeft;
        tTop = this.carSVGSize/2 - c.width/2;
        tLeft = this.carSVGSize/2 - c.carLength/2;

        var carRect = document.createElementNS(svgNS, "rect");
        carRect.setAttribute("x",tLeft.toString());  //  note: attribute names are strings!!
        carRect.setAttribute("y",tTop.toString());
        carRect.setAttribute("fill","black");
        carRect.setAttribute("width", c.carLength.toString());
        carRect.setAttribute("height", c.width.toString());

        var brakeRect = document.createElementNS(svgNS, "rect");
        brakeRect.setAttribute("x",tLeft.toString());  //  note: attribute names are strings!!
        brakeRect.setAttribute("y",tTop.toString());
        brakeRect.setAttribute("fill","black");
        brakeRect.setAttribute("width", "4");
        brakeRect.setAttribute("height", c.width.toString());
        brakeRect.setAttribute("id", "brake");

        var carText = document.createElementNS(svgNS, "text");
        carText.setAttribute("x",tLeft.toString());  //  note: attribute names are strings!!
        carText.setAttribute("y",tTop.toString());
        carText.setAttribute("fill", "white");
        carText.setAttribute("textContent", "foo");

        newCarSVG.appendChild(carRect);
        newCarSVG.appendChild(brakeRect);
        newCarSVG.appendChild(carText);

        newCarSVG.addEventListener("click",trafficManager.clickCar);
        this.roadSVG.appendChild(newCarSVG);         //  here we put the new object into the DOM.
        c.SVG = newCarSVG;
        c.brakeSVG = brakeRect;

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
    },

    getCarFromID: function(iID) {
        var i;
        for (i = 0; i < this.cars.length; i++ ) {
            var c = this.cars[i];
            if (iID == "C" + c.carCaseID) return c;
        };
        return null;
    },

    getLightFromID: function(iID) {
        var i;
        for (i = 0; i < this.lightSystem.lights.length; i++) {
            var tLight = this.lightSystem.lights[i];
            if (iID == "L" + tLight.lightNumber) return tLight;
        };
        return null;
    }
};

/**
 * The main controller singleton
 * @type {{gameNumber: number, gameCaseID: number, gameInProgress: boolean, running: boolean, previous: number, selectedCar: null, selectedLight: null, numberOfLights: number, gameButtonPressed: Function, addCar: Function, setUpNewCarData: Function, clickCar: Function, clickLight: Function, update: Function, updateScreen: Function, updateUIStuff: Function, click: Function, startStop: Function, initializeComponent: Function, animate: Function, startGame: Function, setUpNewGameData: Function, endGame: Function}}
 */
trafficManager = {
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
            trafficModel.newGame();
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
        timeText.innerHTML = parseFloat(trafficModel.time.toFixed(2));

        var startStopButton = document.getElementById("startStop");
        startStopButton.innerHTML = (this.running) ? "pause" : "go";

        var gameButton = document.getElementById("game");
        gameButton.innerHTML = (this.gameInProgress) ? "abort game" : "new game";

        var carInfoDisplay = document.getElementById("singleCarDisplay");
        if (this.selectedCar) {
            carInfoDisplay.innerHTML = this.selectedCar.toString();
            carInfoDisplay.style.display = "inline";
        } else {
            carInfoDisplay.style.display = "none";
        };

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
        };



    },

    click: function () {

    },

    startStop: function () {
        this.running = !(this.running);

        if (this.running) { //  START UP
            this.previous = 0;
            window.requestAnimationFrame(this.animate);
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


