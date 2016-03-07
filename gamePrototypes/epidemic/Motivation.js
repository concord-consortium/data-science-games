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

/**
 * Constructor for a Motivation.
 * This is a model class for Critters, helps them decide what to do.
 * @param c
 * @constructor
 */
var Motivation = function(  ) {
    this.hungry = 1.7 * Math.random();
    this.thirsty = 1.7 * Math.random();
    this.tired = 0.2 * Math.random();
};


/**
 * Update this Critter's motivation.
 * For example, make it hungrier if it is not eating.
 * @param dt
 */
Motivation.prototype.update = function (dt, iActivity, iLocType) {

    this.hungry += dt / 10;
    this.thirsty += dt / 10;
    this.tired += dt / 50;

    /**
     * Alter the internal values depending on the activity
     */
    switch (iActivity) {
        case "eating":
            this.hungry -= iLocType === "food" ? dt : dt / 5;
            if (this.hungry < 0) iActivity = null;
            break;
        case "drinking":
            this.thirsty -= iLocType === "water" ? dt : dt / 5;
            if (this.thirsty < 0) iActivity = null;
            break;
        case "resting":
            this.tired -= iLocType === "dwelling" ? dt : dt / 5;
            if (this.tired < 0) iActivity = null;
            break;
        default:
            break;
    };

    return iActivity;
};


/**
 * Determine this critter's most urgent need, and supplies an object that
 * tells you what you need, how urgently, and what you have to do to slake it.
 * @returns {{what: string, urgency: (number|*), bestActivity: string}}
 */
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

/**
 * A string of the current motivation, for debugging purposes.
 * @returns {string}
 */
Motivation.prototype.toString = function() {
    return "[Mot: Hu-Th-Ti = "
        + Math.round(this.hungry * 1000)/1000 + " " +
        + Math.round(this.thirsty * 1000)/1000 + " " +
        + Math.round(this.tired * 1000)/1000 + "]"
        ;
};

/**
 * Construct an object that we can use to restore Motivations.
 * @returns {{hungry: *, thirsty: *, tired: *}}
 */
Motivation.prototype.getSaveObject = function() {
    var tState = {
        hungry : this.hungry,
        thirsty : this.thirsty,
        tired : this.tired
    };

    return tState;
}

/**
 * Restore a Critter's motivation.
 * this motivation has already been created by the Critter, with itself as the .critter object
 * @param iObject   object containing the property values.
 */
Motivation.prototype.restoreFrom = function( iObject ) {
    this.hungry = iObject.hungry;
    this.thirsty = iObject.thirsty;
    this.tired = iObject.tired;
};



