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

/**
 * Constructor for Location
 * @param index     the index determines its position in the grid
 * @constructor
 */
var Location = function( index ) {
    this.myIndex = index;
    this.setLocationProperties( this.myIndex );

    this.toxic = false;     //  for location-based toxic maladies
};

Location.prototype.setLocationProperties = function( index ) {

    this.critters = new Set();
    var tLocInfo = epiGeography.newLocationInfoByIndex( index );

    this.snapShape = tLocInfo.snap;      //  Containing SVG Snap element
    this.bgShape = tLocInfo.bg;        //      a Snap element: the background square. It has the color.
    this.locType = tLocInfo.locType;
    this.baseFill = Location.colors[ this.locType ];
    this.name = tLocInfo.name;
    this.row = tLocInfo.row;
    this.col = tLocInfo.col;
    this.snapText = this.snapShape.text(10, 90, this.name);
    this.snapText.attr({fill: "white"});

    this.snapShape.click( epiManager.clearSelection );

};

Location.prototype.getSaveObject = function() {
    var tSaveObject = {
        myIndex : this.myIndex,
        locType : this.locType,
        baseFill : this.baseFill,
        toxic : this.toxic,
    };
    return tSaveObject;
};

/**
 * Restore an existing Location from its object representation.
 * It already has the corrrect index; that's done in epiModel's restore.
 * There, it made a new Location( el.myIndex ) so position, row, col, and INDEX are all correct.
 * Here, we just adjust what kind of Location it is, and its base color.
 * @param iObject
 */
Location.prototype.restoreFrom = function( iObject ) {

    this.locType = iObject.locType;
    this.baseFill = iObject.baseFill;
    this.toxic = iObject.toxic;
};

/**
 * Update the location. This is where we would grow grass, etc.
 * Also, view-oriented tasks such as updating the population of the Location.
 * @param dt
 */
Location.prototype.update = function( dt ) {
    //var tNCrit = this.critters.size;
    //this.snapText.attr({text : tNCrit == "0" ? this.name : this.name + ": " + tNCrit});

    if (this.toxic && epiOptions.showCarrier) {
        this.bgShape.attr({ stroke: "black", fill : "lightgray", strokewidth : 20 });
    } else {
        this.bgShape.attr({ stroke: "white", fill : this.baseFill, strokewidth : 4 });
    }
};

/**
 * Calculate coordinates for the indexth Critter in this Location
 * @param index
 * @returns {{x: number, y: number}}    GLOBAL game coordinates for this Critter
 */
Location.prototype.globalParkingCoordinates = function( index ) {
    var tNCritters = this.critters.size;
    var n = Math.ceil(Math.sqrt(tNCritters));    // arrage in a square, this many on a side

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

/**
 * Get center coordinates for this Location
 * @returns {{x: number, y: number}}
 */
Location.prototype.centerCoordinates = function() {
    var tx = Number(this.snapShape.attr("x"));
    var ty = Number(this.snapShape.attr("y"));
    tx += Number(this.snapShape.attr("width"))/2;
    ty += Number(this.snapShape.attr("height"))/2;

    return( {x:tx, y:ty});
};

/**
 * Add a Critter to our list.
 * Called when a new Critter arrives; this causes all other Critters to adjust their formation
 * @param critter
 */
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

/**
 * A Critter leaves this place. No adjustment for the rest of the Critters.
 * @param c
 */
Location.prototype.removeCritter = function( c ) {
    this.critters.delete( c );
    this.update();
};

/**
 * NOTE: Class properties!
 */
Location.colors = {
    "food": "green",
    "water": "blue",
    "dwelling": "darkKhaki"
};

Location.colorMap = {
    "eating" : "green",
    "drinking" : "blue",
    "resting" : "darkKhaki"
};

Location.locTypes = ['food', 'water', 'dwelling'];

Location.mainActivities = {
    "food": "eating",
    "water": "drinking",
    "dwelling": "resting"
};