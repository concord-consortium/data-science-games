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
    this.rowCol = epiGeography.rowColFromIndex( index );
    this.setLocationProperties( this.rowCol );

    this.toxic = false;     //  for location-based toxic maladies
};

/**
 * Set basic properties of the Location; depends on index.
 * @param index
 */
Location.prototype.setLocationProperties = function( iRowCol ) {

    this.critterIndices = new Set();          //  each Location has a Set of Critters
    var tLocInfo = epiGeography.newLocationInfoByRowCol( iRowCol );

    this.snapShape = tLocInfo.snap;      //  Containing SVG Snap element
    this.bgShape = tLocInfo.bg;        //      a Snap element: the background square. It has the color.
    this.locType = tLocInfo.locType;
    this.baseFill = Location.colors[ this.locType ];
    this.name = tLocInfo.name;
    this.snapText = this.snapShape.text(10, 90, this.name);
    this.snapText.attr({fill: "white"});

    this.snapShape.click( epiManager.clearSelection );

};


/**
 * Update the location. This is where we would grow grass, etc.
 * Also, view-oriented tasks such as updating the population of the Location.
 * @param dt
 */
Location.prototype.update = function( dt ) {
    //var tNCrit = this.critterIndices.size;
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
    var tNCritters = this.critterIndices.size;
    var tTopLeft = epiGeography.topLeftFromRowCol( this.rowCol );
    var n = Math.ceil(Math.sqrt(tNCritters));    // arrange in a square, this many on a side

    if (index >= tNCritters) console.log("ALERT! index " + index + " nCritt " + tNCritters);

    var rowInside = Math.floor(index / n);      //  zero based
    var colInside = index % n;
    var w = epiGeography.kPixelsWide;
    var h = epiGeography.kPixelsTall;

    var xx = w/n/2 + colInside * (w/n) + tTopLeft.left;
    var yy = h/n/2 + rowInside * (h/n) + tTopLeft.top;

    return {        //  coordinates of upper LHC of the CRITTER's view.
        x: xx - CritterView.overallViewSize/2 ,
        y: yy - CritterView.overallViewSize/2
    };
};


/**
 * Add a Critter to our list.
 * Called when a new Critter arrives; this causes all other Critters to adjust their formation
 * @param critter
 */
Location.prototype.addCritter = function( iCrIndex ) {
    this.critterIndices.add( iCrIndex ); //  now the number of critters is correct

    var tDebugCritter = epiModel.critters[ iCrIndex ];

    //  console.log("Adding " + tDebugCritter.name + " to " + epiGeography.rowColString( this.rowCol ));

    //  give all my critters a new location within the Location

    var iSetIndex = 0;  //  need to do this because this.critterIndices is a snap.svg SET.

    this.critterIndices.forEach(
        /**
         * Called for each critter index in this Location's list
         * @param icr   the index of the critter in the epiModel's list
         */
        function( icr ) {
            var tCritter = epiModel.critters[icr];
            var tDestination = this.globalParkingCoordinates( iSetIndex );
            //  console.log("Prepping jiggle for " + tCritter.name + " to " + JSON.stringify(tDestination));
            tCritter.startJiggleMove( tDestination );
            iSetIndex++;
        },
        this       //    second argument is the "this" object for the loop
    );
    this.update();
};

/**
 * A Critter leaves this place. No adjustment for the rest of the Critters.
 * @param c
 */
Location.prototype.removeCritter = function( c ) {
    this.critterIndices.delete( c );
    this.update();
};

/**
 * Construct an object we can use to restore this Location
 * @returns {{myIndex: *, locType: *, baseFill: *, toxic: *}}
 */
Location.prototype.getSaveObject = function() {
    var tSaveObject = {
        myIndex : this.myIndex,
        critterIndices : this.critterIndices,
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
    this.critterIndices = iObject.critterIndices;
    this.baseFill = iObject.baseFill;
    this.toxic = iObject.toxic;
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