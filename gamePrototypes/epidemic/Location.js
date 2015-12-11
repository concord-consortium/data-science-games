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
    this.row = 0;
    this.col = 0;

    this.critters = new Set();

    var tLocInfo = epiGeography.newLocationInfoByIndex( index );

    this.snapShape = tLocInfo.snap;      //  Containing SVG Snap element
    this.bgShape = tLocInfo.bg;        //      a Snap element: the background square. It has the color.
    this.locType = tLocInfo.locType;
    this.name = tLocInfo.name;
    this.row = tLocInfo.row;
    this.col = tLocInfo.col;
    
    this.snapText = this.snapShape.text(10, 90, this.name);
    this.snapText.attr({fill: "white"});
};

Location.prototype.update = function( dt ) {
    var tNCrit = this.critters.size;
    this.snapText.attr({text : tNCrit == "0" ? this.name : this.name + ": " + tNCrit});
};

Location.prototype.globalParkingCoordinates = function( index ) {
    var tNCritters = this.critters.size;
    var n = Math.ceil(Math.sqrt(tNCritters));    // on a side

    if (index >= tNCritters) console.log("index " + index + " nCritt " + tNCritters);
    //n = 1;
    //index = 0;

    var row = Math.floor(index / n);
    var col = index % n;
    var w = Number(this.snapShape.attr("width"));
    var h = Number(this.snapShape.attr("height"));

    var xx = w/n/2 + col * (w/n) + Number(this.snapShape.attr("x"));
    var yy = h/n/2 + row * (h/n) + Number(this.snapShape.attr("y"));

    return {        //  coordinates of upper LHC of the CRITTER's view.
        x: xx - CritterView.overallViewSize/2 ,
        y: yy - CritterView.overallViewSize/2
    };
};

Location.prototype.centerCoordinates = function() {
    var tx = Number(this.snapShape.attr("x"));
    var ty = Number(this.snapShape.attr("y"));
    tx += Number(this.snapShape.attr("width"))/2;
    ty += Number(this.snapShape.attr("height"))/2;

    return( {x:tx, y:ty});
};

Location.prototype.addCritter = function( critter ) {
    this.critters.add( critter ); //  now the number of critters is correct

   this.indexInSet = 0;

    //  give all my critters a new location within the Location


    this.critters.forEach(
        //  anonymous function called for each critter
        function( cr ) {
            var tDestination = this.globalParkingCoordinates( this.indexInSet );  //  todo: fix this so it uses the index within the set of critters
            cr.startJiggleMove( tDestination );
            this.indexInSet++;
        },
        this
    );



    this.update();
};

Location.prototype.removeCritter = function( c ) {
    this.critters.delete( c );
    this.update();
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

Location.mainActivities = {
    "food": "eating",
    "water": "drinking",
    "dwelling": "resting"
};