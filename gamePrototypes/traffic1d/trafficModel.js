/*
 ==========================================================================
 trafficModel.js

 Overall model for the Traffic 1D DSG.

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
 * Created by tim on 10/20/15.
 */

var trafficModel;

trafficModel = {
    time: 0,
    cars: [],
    lightSystem: {lights: [], period: 16},
    streetLength: null,

    update: function (dt) {
        this.time += dt;
        var i;

        //  for every car, find its environment (situation) with cars in the current positions
        for (i = 0; i < this.cars.length; i++) {
            this.cars[i].decision = this.cars[i].decide(this.findCarEnvironment(i));
        }

        //  now have each car update its position
        for (i = 0; i < this.cars.length; i++) {
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
    findCarEnvironment: function (thisCar) {

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
            lightColor: this.lightSystem.lights[tMinLightIndex].SVGRect.getAttribute("fill"),
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
        }
        return null;
    },

    getLightFromID: function(iID) {
        var i;
        for (i = 0; i < this.lightSystem.lights.length; i++) {
            var tLight = this.lightSystem.lights[i];
            if (iID == "L" + tLight.lightNumber) return tLight;
        }
        return null;
    }
};
