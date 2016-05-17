/**
 * Created by tim on 3/23/16.


 ==========================================================================
 steb.js in data-science-games.

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


var steb = {};  //  the "upper level" central global. It holds steb.manager, steb.constants, etc.

/**
 * Set up for a session
 */
steb.initialize = function() {

    this.constants.captureSlope = 1.0 / (this.constants.certaintyDistance - this.constants.invisibilityDistance);
    this.ui.initialize();
    this.worldView.initialize();
};

/**
 * Color utility. Convert our array of 3 numbers in [0, 15] to a hex string.
 * @param iColor
 */
steb.makeColorString = function(iColor ) {
    var r = iColor[0] * 16 + iColor[0];
    var g = iColor[1] * 16 + iColor[1];
    var b = iColor[2] * 16 + iColor[2];

    return Snap.rgb( r, g, b );
};

/**
 * Wrap motion onto a torus
 * @param val   the input value
 * @param lo    minimum
 * @param hi    maximum
 * @returns {*} the wrapped value
 */
steb.rangeWrap = function( val, lo, hi )    {
    if (val < lo) val = hi;
    if (val > hi) val = lo;
    return val;
};

/**
 * Pin value into a range
 * @param val   the input value
 * @param lo    minimum
 * @param hi    maximum
 * @returns {*} the pinned value
 */

steb.rangePin = function( val, lo, hi )    {
    if (val < lo) val = lo;
    if (val > hi) val = hi;
    return val;
};


/**
 * Constants for the Stebbing game
 * @type {{version: string, initialNumberOfStebbers: number, stebberViewSize: number, stebberSpeed: number, stebberColorMutationArray: number[], stebberColorReducedMutationArray: number[], worldViewBoxSize: number, numberOfCruds: number, crudSize: number, crudSpeed: number, crudColorMutationArray: number[], colorAnimationDuration: number, baseStebberSpeed: number, baseStebberAcceleration: number}}
 */
steb.constants = {
    version : "001b",
    initialNumberOfStebbers : 12,   //  12,
    numberOfCruds : 20,          //  20

    stebberColorMutationArray : [-2,-1,-1, 0, 0, 1, 1, 2],
    stebberColorReducedMutationArray : [-1, -.5, -.5, 0,0,.5, .5, 1],
    crudColorMutationArray : [-.8, -.4, -.1, 0,.1,.4,.8],

    worldViewBoxSize : 1000.0,

    stebberViewSize : 100,       //  100,
    crudSize : 100,
    crudSpeed : 90.0,

    colorAnimationDuration : 1000,

    baseCrudSpeed : 120.0,
    baseStebberSpeed : 80.0,
    baseCrudAcceleration : 600.0,
    baseStebberAcceleration : 600.0,

    predatorWaitTime : 0.2, //  0.5,
    predatorLookTime : 0.1, //  0.4,
    predatorStalkTime : 1.0,

    //  for computing probability of capture based on color distance
    invisibilityDistance : 1.1,
    certaintyDistance : 8.0,
};