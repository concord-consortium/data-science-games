/*
 ==========================================================================
 Location.js

 Location class for the med DSG.

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
 * Created by tim on 10/21/15.
 */


var Location = function( index ) {
    this.locType = null;
    this.shapeSVG = null;
    this.critters = [];

    var tLocInfo = medGeography.newLocationInfoByIndex( index );

    this.shapeSVG = tLocInfo.shape;
    this.locType = tLocInfo.locType;
};


Location.prototype.localParkingCoordinates = function( index ) {
    var n = Math.ceil(Math.sqrt(medModel.numberOfCritters));    // on a side
    var row = Math.floor(index / n);
    var col = index % n;
    var w = this.shapeSVG.getAttribute("width");
    var h = this.shapeSVG.getAttribute("height");

    var xx = w/n/2 + col * (w/n);
    var yy = h/n/2 + row * (h/n);

    return {x: xx, y: yy};
};

/**
 * NOTE: Class method!
 * @returns {{food: string, water: string, dwelling: string}}
 */
Location.colors = {
    "food": "green",
    "water": "blue",
    "dwelling": "brown"
};
