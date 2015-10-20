/*
 ==========================================================================
 trafficManager.js

 Model/draw class for Cars for the Traffic 1D DSG.

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

var tReason = "foo";
/**
 * A mostly model prototype that handles cars and their actions. Also covers drawing them.
 * @constructor
 */
var Car = function() {
    this.SVG = null;
    this.brakeSVG = null;
    this.lastRecordedTime = 0;
    this.carCaseID = 0;

    this.direction = "east";    //
    this.speed = 50;     //  pixels per second
    this.location = 100;  //  x-coordinate of front bumper
    this.acceleration = 0;
    this.carLength = 10;
    this.width = 5;
    this.lane = 1;          //   count from the center. #1 is the fast lane.
    this.totalDistance = 0;
    this.color = "#0000aa";

    this.happySpeedMin = 33;   //  pixels per second
    this.happySpeedMax = 37;   //  pixels per second
    this.maxSpeed = 100;
    this.happyAccel = 10;   // pixels per second per second
    this.happyBrake = -10;
    this.maxBrake = -50;
    this.happyFollowingDistanceCarlengthsPer10 = 1;
    this.decision = {policy: "maintain", value: 0}; //   or "accelerate" or "brake"

    this.sitch = null;  //  calculated out in the model

};

/**
 * Really this belongs in a separate class, about AIs.
 * @param situation
 * @returns {{policy: string, value: number}|*}
 */
Car.prototype.decide = function(situation) {
    this.sitch = situation;

    var tAccel = 0;

    //  first, see if we're going the speed we want
    if (this.speed < this.happySpeedMin) {
        tAccel = this.happyAccel;
    } else if (this.speed > this.happySpeedMax) {
        tAccel = this.happyBrake;
    }

    //  then deal with slowing down for a light
    var tHappyBrakeDistance = -(0.5) * this.speed * this.speed / this.happyBrake + 20; // minus because happyBrake is negative
    var tSameSpeedDistanceDuringYellow = trafficModel.lightSystem.lights[0].yellowDwell * this.speed;

    switch (situation.lightColor) {
        case "red":
            if (situation.lightDistance > 0 && situation.lightDistance <= tHappyBrakeDistance) {
                if (tAccel > this.happyBrake) tAccel = this.happyBrake;
            }
            break;
        case "yellow":
            if (situation.lightDistance > 0 && situation.lightDistance <= tHappyBrakeDistance) {
                if ((situation.lightDistance + 30) > tSameSpeedDistanceDuringYellow)
                    if (tAccel > this.happyBrake) tAccel = this.happyBrake;
            }
    }

    //  then worry about cars in front of us
    var tClosingSpeed = this.speed - this.sitch.nextCarSpeed;
    var tEffectiveNextCarDistance = this.sitch.nextCarDistance
        - this.sitch.nextCarLength
        - this.carLength * this.happyFollowingDistanceCarlengthsPer10 * this.speed/10
        - 5; // 5 = extra padding
    var tDistanceClosedAtHappyBrake
        = tClosingSpeed > 0
        ? tClosingSpeed * tClosingSpeed * 0.5 / (-this.happyBrake)
        : 0;

    if (tDistanceClosedAtHappyBrake > tEffectiveNextCarDistance) {
        if (tAccel > this.happyBrake) tAccel = this.happyBrake;
    }

    var tLogThing = "car @ " + Math.round(this.location)
        + " v " + Math.round(this.speed)
        + " a " + Math.round(this.acceleration);
    tLogThing += " dist="
        + Math.round(this.sitch.nextCarDistance)
        + " distClHB=" + Math.round(tDistanceClosedAtHappyBrake)
        + " eff=" + Math.round(tEffectiveNextCarDistance)
            + " clos=" + Math.round(tClosingSpeed)
    + " tAcc=" + Math.round(tAccel * 100)/100;

    var tPolicy = "maintain";
    if (tAccel < 0) tPolicy = "brake";
    if (tAccel > 0) tPolicy = "accelerate";
    var tDecision = {policy: tPolicy, value: tAccel};

   // console.log(tLogThing);     //  debug
    return tDecision;
};


/**
 * Update the location, etc  of the Car
 * @param dt    how much time has elapsed
 */
Car.prototype.update = function(dt) {
    var tDirectionSign = (this.direction == "east") ? 1 : -1;

    this.acceleration = this.decision.value;    //  here is where acceleration gets set

    var tDx = tDirectionSign * this.speed * dt + tDirectionSign * 0.5 * this.acceleration * dt * dt;
    this.location += tDx;
    this.totalDistance += tDx;
    this.speed += this.acceleration * dt;
    if (this.speed < 0) {
        this.speed = 0;
        this.acceleration = 0;
    }

    if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;

    // quick turn-around
    var tExtra;
    if (this.location > trafficModel.streetLength) {
        tExtra = this.location - trafficModel.streetLength;
        this.location = trafficModel.streetLength - tExtra;
        this.direction = "west";
    } else if (this.location < 0) {
        tExtra = -this.location;
        this.location = tExtra;
        this.direction = "east";
    };

    //  now record data, if needed!
    if (trafficModel.time - this.lastRecordedTime > 1.0) {
        this.lastRecordedTime = trafficModel.time;
        codapHelper.createCase(
            'moments',
            [
                trafficModel.time,
                this.location,
                this.speed,
                this.decision.policy
            ],
            this.carCaseID
        );
    }
};

/**
 * Draw this car
 * @param ctx   The drawing context
 */
Car.prototype.draw = function( ) {
    var tLeft, tTop, tRear;
    var midStreet = roadView.roadSVG.getAttribute("height") / 2.0;
    var theCar = this.SVG.children[0];
    var theBrake = this.SVG.children[1];
    var tHOff = roadView.carSVGSize/2 - this.carLength/2;
    var tVOff = roadView.carSVGSize/2 - this.width/2;
    var tCarLeft = theCar.getAttribute("x");

    if (this.direction == "west") {
        tLeft = this.location;
        tRear = tLeft + this.carLength;
        tTop = midStreet - 10 * this.lane - this.width / 2;
        theBrake.setAttribute("x", (Number(tCarLeft) + this.carLength - 4).toString());
    } else {
        tLeft = this.location - this.carLength;
        tRear = tLeft;
        tTop = midStreet + 10 * this.lane - this.width / 2;
        theBrake.setAttribute("x", tCarLeft);
    }

    this.SVG.setAttribute("x", (tLeft - tHOff).toString());
    this.SVG.setAttribute("y", (tTop - tVOff).toString());

    // brake lights
    var tBrakeColor;
    switch (this.decision.policy) {
        case "brake":
            tBrakeColor = "red";
            break;
        case "accelerate":
            tBrakeColor = "green";
            break;
        case "maintain":
            tBrakeColor = "white";
            break;
        default:
            tBrakeColor = "yellow";
    }
    theBrake.setAttribute("fill", tBrakeColor);

    //var tAdornmentText =  Math.round(this.sitch.nextCarDistance).toString(); // tReason;   //
    var tAdornmentText =  Math.round(this.speed).toString(); // tReason;   //

    var theText = this.SVG.children[2];
    theText.setAttribute("textContent", tAdornmentText);

};


Car.prototype.toString = function() {
    t = "Car ID: " + this.carCaseID
        + " loc: " + Math.round(this.location)
        + " speed: " + Math.round(this.speed)
        + " " + this.direction;
    return t;
};

