/**
 * Created by tim on 10/9/16.


 ==========================================================================
 StarResult.js in gamePrototypes.

 Author:   Tim Erickson

 Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.

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


StarResult = function ( iMine, iAuto ) {
    this.id = stella.manager.focusStar.id;
    this.myOwnResult = iMine;           //  Boolean
    this.type = stella.manager.starResultType;
    this.enteredValue = stella.manager.starResultValue;
    this.date = stella.model.now;
    this.units = stella.starResultTypes[this.type].units;
    this.trueResultValue = -1;

    this.points = iAuto ? 0 : this.evaluateResult();    //  sets true, trueDisplay

    if (this.points > 0 || iAuto) {
        stella.connector.emitStarResult(this, null);
        stella.player.recordResultLocally( this );
        if (!iAuto) {
            alert("Good job! " + this.enteredValue + " is close enough to get you " + this.points + " points!");
        }

    } else {
        alert(stella.strings.resultIsWayOff);
    }
};

StarResult.prototype.eligibleForBadge = function() {

    if (!this.myOwnResult) {
        return false;
    }
    stella.player.knownResults.forEach( function(iRes) {
        if (iRes.id === this.id && iRes.type === this.type && this.points <= iRes.points) {
            return false;
        }
    });

    return true;
};

/**
 * When the user submits a Result, we check to see how close it is.
 *
 * @param iValues
 * @returns {number}
 */
StarResult.prototype.evaluateResult = function(  ) {
    var tStar = stella.model.starFromTextID( this.id );
    var tMaxPoints = 100;
    var oPoints = 0;

    var debugString = "debug";

    var tMaxDiff;
    var tDiffValue;

    var displayDebugStringInConsole = true;

    /**
     * How far off you can be depends on what kind of measurement it is
     */

    var truth = tStar.reportTrueValue( this.type );
    this.trueResultValue = truth.trueDisplay;  //  the way a user would enter it

    tMaxDiff = stella.starResultTypes[this.type].errorL1;

    switch( this.type ) {
        case "temp" :
            tMaxDiff = 0.1 * this.trueResultValue;    //  10% error
            break;

        case "vel_r":
            break;

        case "pm_x":
            break;

        case "pm_y":
            break;

        case "pos_x":
            break;

        case "pos_y":
            break;

        case "parallax":
            break;

        default:
            var tMess = "Sorry, I don't know how to score " + stella.starResultTypes[ iValues.type].name + " yet.";
            displayDebugStringInConsole = false;
            alert(tMess);
            this.trueResultValue = -1;
            tMaxPoints = 0;
            break;
    }

    tDiffValue = Math.abs(this.trueResultValue - this.enteredValue);
    oPoints = tMaxPoints * (1 - tDiffValue / tMaxDiff);

    if (oPoints < 0 ) {
        oPoints = 0;
    }

    debugString = "Evaluate " +
        stella.starResultTypes[ this.type].name + ": user said " +
        this.enteredValue + ", true value " + this.trueResultValue +
        ". Awarding " + Math.round(oPoints) + " points.";

    if (displayDebugStringInConsole) {
        console.log( debugString );
    }
    return Math.round(oPoints);
},

/**
 * Object containing information about possible results users can submit
 *
 * Saved results -- objects with keys -- get assembled in .manager.
 * The manager sends them to the connector so they got to CODAP, and to .player so they get stored locally.
 * Results get evaluated for quality in model.evaluateResult();
 *
 * @type {{temp: {name: string, units: string, id: string}, pm_x: {id: string, name: string, units: string}, pm_y: {id: string, name: string, units: string}, parallax: {id: string, name: string, units: string}, vel_r: {id: string, name: string, units: string}}}
 */
stella.starResultTypes = {
    pos_x: {
        id : "pos_x",
        name: "position (x)",
        units: "degrees",
        errorL1 : 0.001
    },
    pos_y: {
        id : "pos_y",
        name: "position (y)",
        units: "degrees",
        errorL1 : 0.001
    },
    "temp": {
        id: "temp",
        name: "temperature",
        units: "K",
        errorL1 : 500
    },
    vel_r: {
        id : "vel_r",
        name: "radial velocity",
        units: "km/sec",
        errorL1 : 8
    },
    pm_x: {
        id : "pm_x",
        name: "proper motion (x)",
        units: "microdegrees per year",
        errorL1 : 10
    },
    pm_y: {
        id : "pm_y",
        name: "proper motion (y)",
        units: "microdegrees per year",
        errorL1 : 10
    },
    parallax: {
        id : "parallax",
        name: "parallax",
        units: "microdegrees",
        errorL1 : 5
    }
};

