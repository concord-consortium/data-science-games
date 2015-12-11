/*
 ==========================================================================
 CritterView.js

 Critter view class for the med DSG.

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
 * Created by tim on 10/25/15.
 */

/**
 * View class for Critters
 * @param c     the model Critter
 * @constructor
 */
var CritterView = function( c ) {
    this.critter = c;

    //  "paper"

    this.snapShape = new Snap( CritterView.overallViewSize, CritterView.overallViewSize );  //  width and height.
    this.snapShape.attr({ viewBox : "-10 -10 20 20"});

    //  background

    this.bgCircle = this.snapShape.circle(0, 0, 10); //  add Snap circle with cx, cy, and r
    this.bgCircle.attr({
        fill : "yellow"
    });

    //  "eye" line

    this.eyeLine = this.snapShape.line(-8.5, -1.5, 8.5, -1.5);
    this.eyeLine.attr(
        {
            stroke: c.eyeColor,
            strokeWidth : 3
        }
    )

    //  "nose" piece

    this.nosePiece = this.snapShape.line(0, -8.5, 0, 0).attr({
        stroke: c.borderColor, strokeWidth: 3
    });

    //  outside circle

    this.healthCircle = this.snapShape.circle(0, 0, 8.5);
    this.healthCircle.attr({
        stroke : c.borderColor,
        strokeWidth : 3,
        fill : "transparent"
    });

    this.healthCircle.click( function() {       //      todo: find the best way to click on ANY visible part of the critter
            epiManager.doCritterClick( this.critter );
        }.bind(this)
    );
};

/**
 * Update the view, e.g., in response to changes in health
 * @param critter
 * @param dt
 */
CritterView.prototype.update = function (critter, dt) {
    var tHealth = critter.health;
    this.healthCircle.attr( {stroke : (tHealth == 0) ? "gray" : critter.borderColor});
};

/**
 * Just move me to x, y.
 * @param xx
 * @param yy
 */
CritterView.prototype.moveTo = function( xx, yy ) {
    this.snapShape.attr({
        x : xx, y: yy
    })
};

/**
 * Class variable: the overall (full) size of the view
 * @type {number}
 */
CritterView.overallViewSize = 20;

