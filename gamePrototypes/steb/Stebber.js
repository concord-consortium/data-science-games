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

/**
 * Class for Stebbers (model)
 *
 * @param iColor    its color
 * @param iWhere    where is it?
 * @param iID       its internal (serial) ID
 * @constructor
 */
var Stebber = function( iColor, iWhere, iID ) {
    this.color = iColor ? iColor : [8, 8, 8];
    this.where = iWhere;
    this.id = iID;

    this.setNewSpeedAndHeading();
    this.updatePredatorVision();
};

/**
 * Randomly choose a new heading.
 * Set the speed
 * Also set the timer for the next change.
 */
Stebber.prototype.setNewSpeedAndHeading = function() {
    this.heading = Math.PI*2 * Math.random();
    this.timeToChange = 1 + Math.random() * 2;
    this.speed = steb.constants.baseStebberSpeed;
};

/**
 * Determine this Stebber's color distances based on teh predator's vision parameters.
 */
Stebber.prototype.updatePredatorVision = function() {
    this.colorDistanceToBackground = steb.model.colorDistance(
        steb.model.getPredatorVisionColor(steb.model.trueBackgroundColor),
        steb.model.getPredatorVisionColor(this.color)
    );

    if (steb.options.backgroundCrud) {
        this.colorDistanceToCrud = steb.model.colorDistance(
            steb.model.getPredatorVisionColor(steb.model.meanCrudColor),
            steb.model.getPredatorVisionColor(this.color)
        );
    } else {
        this.colorDistanceToCrud = null;
    }
};

/**
 * Update the position and speed
 * @param idt
 */
Stebber.prototype.update = function( idt ) {

    //  if we've been running, decelerate
    if (this.speed > steb.constants.baseStebberSpeed) {
        this.speed -= idt * steb.constants.baseStebberAcceleration;
    }

    //  what's our projected change in position?
    var tDx = this.speed * Math.cos( this.heading ) * idt;
    var tDy = this.speed * Math.sin( this.heading ) * idt;

    this.where.x += tDx;
    this.where.y += tDy;

    //  torus topology
    this.where.x = steb.rangeWrap( this.where.x, 0, steb.constants.worldViewBoxSize);
    this.where.y = steb.rangeWrap( this.where.y, 0, steb.constants.worldViewBoxSize);

    //  decrement the time
    this.timeToChange -= idt;

    // see if we need to change direction
    if (this.timeToChange < 0) this.setNewSpeedAndHeading();    //  this resets this.timeToChange

};

/**
 * Run from the point: Set the velocity to be large and away.
 * @param iPoint
 */
Stebber.prototype.runFrom = function( iPoint ) {
    if (steb.options.flee) {
        var dx = this.where.x - iPoint.x;
        var dy = this.where.y - iPoint.y;
        var r = Math.sqrt(dx * dx + dy * dy);

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
 * Prepare an array of values for output to CODAP
 * @returns {*[]}
 */
Stebber.prototype.dataValues = function() {

    var tSnapColorRecord = Snap.color( steb.makeColorString( this.color ));
    var oValues = [
        this.color[0],
        this.color[1],
        this.color[2],
        tSnapColorRecord.h,
        tSnapColorRecord.s,
        tSnapColorRecord.v,
        this.id
    ];

    return oValues;
};

/**
 * String display of this Stebber
 * @returns {string}
 */
Stebber.prototype.toString = function() {
    var o = "stebber id " + this.id;
    o += " color : " + JSON.stringify( this.color );
    return o;
}

