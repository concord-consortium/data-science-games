/**
 * Created by tim on 3/23/16.


 ==========================================================================
 Stebber.js in data-science-games.

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

/* global steb, Snap, SPS, console */

/**
 * Class for Stebbers (model)
 *
 * @param iSPS      its SPS (Stebbins Pattern Specification)
 * @param iCorner   its corner radius
 * @param iWhere    where is it?
 * @param iID       its internal (serial) ID
 * @constructor
 */
var Stebber = function (iSPS, iCorner, iWhere, iID) {
    this.SPS = iSPS ? iSPS : new SPS();     //  todo: fix this! :)
    this.cornerRadius = iCorner;
    this.where = iWhere;
    this.angle = Math.random() * 360.0;
    this.omega = 0.0;
    this.id = iID;
    this.caseIDs = [];  //  array of case IDs for this Stebber
    this.selected = false;
    this.patternDistanceToBackground = null;
    this.patternDistanceToCrud = null;

    this.setNewSpeedAndHeading();   //  todo: check if we need this here as well as in reproduce
    this.updatePatternDistances();    //  todo: do we need this? The view doesn't exist yet, right?
};

/**
 * Randomly choose a new heading.
 * Set the speed
 * Also set the timer for the next change.
 */
Stebber.prototype.setNewSpeedAndHeading = function () {
    this.heading = Math.PI * 2 * Math.random();
    this.timeToChange = 1 + Math.random() * 2;
    this.speed = steb.constants.baseStebberSpeed + Math.random() * steb.constants.stebberSpeedRange;
    this.omega = steb.constants.maxRotationSpeed * (-1.0 + 2.0 * Math.random());
};

/**
 * Determine this Stebber's color distances based on the predator's vision parameters.
 */
Stebber.prototype.updatePatternDistances = function () {
    this.PatternDistanceToBackground = SPS.patternDistance( steb.model.trueBackgroundSPS, this.SPS);

    if (steb.options.backgroundCrud) {
        this.patternDistanceToCrud = SPS.patternDistance( steb.model.meanCrudSPS, this.SPS);
    } else {
        this.patternDistanceToCrud = null;
    }
};

/**
 * Update the position and speed
 * @param idt   seconds in interval
 */
Stebber.prototype.update = function (idt) {

    //  if we've been running, decelerate
    if (this.speed > steb.constants.baseStebberSpeed) {
        this.speed -= idt * steb.constants.baseStebberAcceleration;
    }

    //  what's our projected change in position?
    var tDx = this.speed * Math.cos(this.heading) * idt;
    var tDy = this.speed * Math.sin(this.heading) * idt;

    this.where.x += tDx;
    this.where.y += tDy;

    this.angle += idt * this.omega;

    //  torus topology
    this.where.x = steb.rangeWrap(this.where.x, 0, steb.constants.worldViewBoxSize);
    this.where.y = steb.rangeWrap(this.where.y, 0, steb.constants.worldViewBoxSize);

    //  decrement the time
    this.timeToChange -= idt;

    // see if we need to change direction
    if (this.timeToChange < 0) {
        this.setNewSpeedAndHeading();
    }   //  this resets this.timeToChange

};

/**
 * Run from the point: Set the velocity to be large and away.
 * @param iPoint
 */
Stebber.prototype.runFrom = function (iPoint) {
    if (steb.options.flee) {
        var dx = this.where.x - iPoint.x;
        var dy = this.where.y - iPoint.y;
        var r = Math.sqrt(dx * dx + dy * dy);   //  todo: use distance routine

        //  but only if you're reasonably close to the place.
        //  todo: make this wrap on the torus so you run if you're just over the edge.
        if (r < steb.constants.worldViewBoxSize / 2) {
            this.heading = Math.atan2(dy, dx);
            this.speed = 5 * steb.constants.baseStebberSpeed;
            this.timeToChange = 1 + Math.random() * 2;
        }
    }
};

/**
 * Prepare an array of values for output to CODAP   //  todo: explain why we can use .color
 * @returns {*[]}
 */
Stebber.prototype.dataValues = function () {

    //  var tSnapColorRecord = Snap.color( steb.makeColorString( this.color ));
    return {
        wDark: this.SPS.vDarkStripeWidth,
        wLight: this.SPS.vLightStripeWidth,
        cornerR : this.cornerRadius,
        id: this.id
    };
};

/*
 was in the Stebber record before...

 h : tSnapColorRecord.h,
 s : tSnapColorRecord.s,
 v : tSnapColorRecord.v,

 */
/**
 * String display of this Stebber
 * @returns {string}
 */
Stebber.prototype.toString = function () {
    var o = "stebber id " + this.id;
    o += " pattern : " + JSON.stringify(this.SPS);
    return o;
};

