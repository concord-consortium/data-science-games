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
    this.myIndex = index;

    this.critters = new Set();

    var tLocInfo = medGeography.newLocationInfoByIndex( index );

    this.snapShape = tLocInfo.snap;      //  Containing SVG Snap element
    this.bgShape = tLocInfo.bg;        //      a Snap element
    this.locType = tLocInfo.locType;
    this.name = tLocInfo.name;
    
    this.snapText = this.snapShape.text(10, 90, this.name);
    this.snapText.attr({fill: "white"});
};

Location.prototype.update = function( dt ) {
    var tNCrit = this.critters.size;
    this.snapText.attr({text : tNCrit == "0" ? this.name : this.name + ": " + tNCrit});
};

Location.prototype.localParkingCoordinates = function( index ) {
    var n = Math.ceil(Math.sqrt(medModel.numberOfCritters));    // on a side
    var row = Math.floor(index / n);
    var col = index % n;
    var w = this.snapShape.attr("width");
    var h = this.snapShape.attr("height");

    var xx = w/n/2 + col * (w/n);
    var yy = h/n/2 + row * (h/n);

    return {x: xx - CritterView.overallViewSize/2 , y: yy - CritterView.overallViewSize/2};
};

Location.prototype.addCritter = function( c ) {
    this.critters.add( c );
    this.snapText.attr({text: this.critters.size});
};

Location.prototype.removeCritter = function( c ) {
    this.critters.delete( c );
    this.snapText.attr({text: this.critters.size});
};

/**
 * NOTE: Class method!
 * @returns {{food: string, water: string, dwelling: string}}
 */
Location.colors = {
    "food": "green",
    "water": "blue",
    "dwelling": "darkKhaki"
};
