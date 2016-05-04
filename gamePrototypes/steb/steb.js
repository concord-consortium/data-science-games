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


var steb = {};

steb.initialize = function() {

    this.ui.initialize();
    this.worldView.initialize();
};

steb.makeColorString = function(iColor ) {
    var r = iColor[0] * 16 + iColor[0];
    var g = iColor[1] * 16 + iColor[1];
    var b = iColor[2] * 16 + iColor[2];

    return Snap.rgb( r, g, b );
};


steb.rangeWrap = function( val, lo, hi )    {
    if (val < lo) val = hi;
    if (val > hi) val = lo;
    return val;
};

steb.constants = {
    version : "001a",
    initialNumberOfStebbers : 12,   //  10,
    stebberViewSize : 80,       //  100,
    stebberSpeed : 100.0,       //  100.0
    stebberColorMutationArray : [-2,-1,-1, 0,0, 1, 1, 2],
    stebberColorReducedMutationArray : [-1, -.5, -.5, 0,0,.5, .5, 1],
    worldViewBoxSize : 1000.0,
    numberOfCruds : 20,
    crudSize : 80,
    crudSpeed : 90.0,
    crudColorMutationArray : [-.8, -.4, -.1, 0,.1,.4,.8],

    colorAnimationDuration : 1000,

    baseStebberSpeed : 100.0,
    baseStebberAcceleration : 600.0,
};