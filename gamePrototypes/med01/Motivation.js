/*
 ==========================================================================
 Motivation.js

 Motivation class for the med DSG; every Critter needs one!

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
 * Created by tim on 10/23/15.
 */

var Motivation = function( c ) {
    this.critter = c;

    this.hungry = 1.7 * Math.random();
    this.thirsty = 1.7 * Math.random();
    this.tired = 0.2 * Math.random();

};

Motivation.prototype.update = function (dt) {

    var tLocation = this.critter.currentLocation;

    this.hungry += dt / 10;
    this.thirsty += dt / 10;
    this.tired += dt / 50;

    switch (this.critter.activity) {
        case "eating":
            this.hungry -= tLocation.locType === "food" ? dt : dt / 5;
            if (this.hungry < 0) this.critter.activity = null;
            break;
        case "drinking":
            this.thirsty -= tLocation.locType === "water" ? dt : dt / 5;
            if (this.thirsty < 0) this.critter.activity = null;
            break;
        case "resting":
            this.tired -= tLocation.locType === "dwelling" ? dt : dt / 5;
            if (this.tired < 0) this.critter.activity = null;
            break;
        default:
            break;
    };
};

Motivation.prototype.mostUrgentNeed = function( ) {
    var tNeed = "food";
    var tActivity = "eating";
    var tValue = this.hungry;

    if (this.thirsty > tValue) {
        tNeed = "water";
        tActivity = "drinking";
        tValue = this.thirsty;
    };

    if (this.tired > tValue) {
        tNeed = "dwelling";
        tActivity = "resting";
        tValue = this.tired;
    };

    return {what: tNeed, urgency: tValue, bestActivity: tActivity};
};

Motivation.prototype.toString = function() {
    return "[Mot: Hu-Th-Ti = "
        + Math.round(this.hungry * 1000)/1000 + " " +
        + Math.round(this.thirsty * 1000)/1000 + " " +
        + Math.round(this.tired * 1000)/1000 + "]"
        ;
}

