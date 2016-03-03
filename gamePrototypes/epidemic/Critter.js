/*
 ==========================================================================
 Critter.js

 Critter class for the med DSG.

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
 * Created by tim on 10/19/15.
 */

/**
 * Model class for Critters. See also CritterView.js.
 *
 * @param index
 * @constructor
 */
var Critter = function( index ) {
    this.myIndex = index;
    this.currentLocation = null;

    this.x = 0;
    this.y = 0;
    this.destX = 0;
    this.destY = 0;
    this.destLoc = null;
    this.speed = 100; // game units per second
    this.kBaseSpeed = 100; // game units per second

    this.motivation = null;
    this.activity = null;

    this.moving = Boolean(false);
    this.selected = false;

    this.health = 1.0;      //  0 = sick, 1 = healthy
    this.elapsedSick = 0.0; //  how long have we been sick.
    this.infectious = false;
    this.infected = false;        //  do we have the malady? (may still need to incubate)
    this.incubationTime = null;      //  how long since infection
    this.antibodies = 0.0;

    this.name = null;
    this.eyeColor = TEEUtils.pickRandomItemFrom(Critter.eyeColors);
    this.borderColor = Critter.borderColors[0];
    this.baseTemperature = (this.eyeColor == Critter.eyeColors[0]) ? 36.0 : 34.5 ;
    this.baseTemperature += Math.random() * 0.6;
    this.baseTemperature -= Math.random() * 0.6;

    this.view = new CritterView( this );    //  todo: decouple view from model
};



/**
 * Update the internal values
 * @param dt    amount of time that has passed since the last update
 */
Critter.prototype.update = function (dt) {

    var tWeird = !this.moving && !this.currentLocation;

    if (tWeird) {
        console.log("WEIRD: " + this.name )
    }
    this.motivation.update( dt );
    this.updateHealth( dt );
    this.speed = this.kBaseSpeed * (0.5 + 0.5 * this.health);

    this.view.update(  );
    this.temperature = this.findTemperature();

    if (epiOptions.crittersMoveOnTheirOwn) {
        if (!this.moving && !this.activity) {   //  idle critter!
            var tCritterNeeds = this.motivation.mostUrgentNeed();

            if (tCritterNeeds.urgency > 2.0) {  //  bigger need
                if (tCritterNeeds.what === this.currentLocation.locType) {
                    this.activity = tCritterNeeds.bestActivity;
                } else {
                    this.setNewDest();      //  sets destLoc, destX, and destY
                    this.startMove();
                }
            }
        }
    }
};


/**
 * Update a critter's health variables, do disease progress.
 * @param dt
 */
Critter.prototype.updateHealth = function( dt ) {

    if (this.health == 0) {
        this.elapsedSick += dt;
    }

    if (this.infected && this.health > 0 && this.antibodies == 0) {
        //  console.log("Incubation: " + this.incubationTime);
        this.incubationTime += dt;
    }

    if (this.incubationTime > epiMalady.pIncubationInSeconds) {
        console.log(this.name + " incubation ended. Now sick. ");
        this.health = 0.0;      //  simple get sick
        if (epiOptions.dataOnGetSick) epiManager.emitCritterData( this, "got sick");
        this.incubationTime = null;

        if (epiMalady.pMaladyNumber == 3) {     //  todo: consider making constants for maladies
            this.infectious = false;
        }
    }

    if (this.health < 1.0 && this.elapsedSick > epiMalady.pDiseaseDurationInSeconds) {
        console.log(this.name + " is now well. ");
        this.antibodies = 1.0;
        this.health = 1.0;
    }
};

/**
 * Get a temperature reading for this Critter.
 */
Critter.prototype.findTemperature = function() {
    var kTemperatureElevation = 1.5;
    var tTemp;
    var tHowSick = 1 - this.health;
    tTemp = this.baseTemperature + tHowSick * kTemperatureElevation;  //  1.5 = how much for this disease.
    tTemp += TEEUtils.randomNormal(0,0.2);
    return tTemp;
};

/**
 * Set a new destination for this Critter.
 * This is based on its needs (see Motivation)
 * and the distances to Locations that can meet the needs.
 * We are playing around with picking locations that may not be the absolute closest.
 */
Critter.prototype.setNewDest = function( ) {
    var tCritterNeeds = this.motivation.mostUrgentNeed().what;
    var tClosestDistance = Number.MAX_VALUE;
    var i;
    var tBestLocations = [];

    // todo: figure out whether this system biases towards 0,0 (because the test is strictly less than, or the origin adjustment)
    // //   Also may be the non-centeredness of the CritterView.

    for (i = 0; i < epiGeography.numberOfLocations(); i++) {
        var tTestLocation = epiModel.locations[i];
        if (tTestLocation != this.currentLocation && tTestLocation.locType == tCritterNeeds) {
            var tTestDistance = this.distanceToLoc( tTestLocation);
            if (tTestDistance < tClosestDistance - epiGeography.kPixelsWide) {  //  with some slop
                tClosestDistance = tTestDistance;
                tBestLocations = [tTestLocation];
            } else if (tTestDistance < tClosestDistance + epiGeography.kPixelsWide) {
                tBestLocations.push( tTestLocation );
            }
        }
    }
    var tDestLoc = TEEUtils.pickRandomItemFrom(tBestLocations);

    this.destLoc = tDestLoc;
};

/**
 * Begin a move to a new location. Note that this calls Snap.svg's animate function, and
 * then uses epiModel.doArrival as a callback.
 */
Critter.prototype.startMove = function( ) {
    this.doDeparture( this.currentLocation ,"migration");   //  todo: use string constants for case-creation reasons
    this.headForCenterOfLocation( this.destLoc );
};

/**
 * Set the Critter's destination to be the center of the given Location.
 * When it arrives, adjust the positions of Critters in the Location.
 * @param iL        destination Location
 */
Critter.prototype.headForCenterOfLocation = function(iL )  {
    var tCenter = iL.centerCoordinates();     //  for now, head for center of the loc
    this.destX = tCenter.x;
    this.destY = tCenter.y;
    var tTime = this.distanceToLoc( iL ) / this.speed;

    this.view.snapShape.animate(
        {"x" : this.destX, "y" : this.destY},
        tTime * 1000, null,
        function() {
            epiModel.doArrival({ critter: this, atLocation: this.destLoc} );
        }.bind(this)
    );
};

/**
 * A critter actually departs
 * @param iToLoc    for what location
 * @param iReason   why?
 */
Critter.prototype.doDeparture = function( iToLoc, iReason ) {

    this.activity = "traveling";
    this.moving = true;

    if (epiOptions.dataOnDeparture)
        epiManager.emitCritterData( this, iReason); //  must do before currentLocation changes

    this.currentLocation = null;    //  is this a good idea??
    if (iToLoc) iToLoc.removeCritter( this );   //  todo: why do we do this with iToLoc? shouldn't it be from?

};

/**
 * Starts a "jiggle" move, that is, re-line-up in response to
 * a new Critter joining this Location.
 * "Destination" is within the Location.
 * @param iDest
 */
Critter.prototype.startJiggleMove = function( iDest ) {
    this.view.snapShape.stop();
    this.view.snapShape.animate(
        { "x": iDest.x, "y": iDest.y },
        1000, null,
        null
    );
};

/**
 * Set up initial values for this Critter
 * @param iLocation     the Location
 */
Critter.prototype.initialize = function( iLocation ) {
    this.name = medNames.newName( );
    this.currentLocation = iLocation;
    tLocCenter = iLocation.centerCoordinates();
    this.x = tLocCenter.x;
    this.y = tLocCenter.y;
    this.view.moveTo( this.x, this.y );
    this.motivation = new Motivation( this );

    iLocation.addCritter(this);

};

/**
 * How far is the given location from this Critter?
 * @param iLoc     the Location in question
 * @returns {number}
 */
Critter.prototype.distanceToLoc = function( iLoc ) {
    var tLocW = Number(iLoc.snapShape.attr("width"));
    var tLocH = Number(iLoc.snapShape.attr("height"));
    var tLocX = Number(iLoc.snapShape.attr("x")) + tLocW/2;
    var tLocY = Number(iLoc.snapShape.attr("y")) + tLocH/2;
    var tdx = tLocX - this.x;
    var tdy = tLocY - this.y;
    return Math.sqrt( tdx * tdx + tdy * tdy);
};

/**
 * Construct an Object to be saved; we can use this to completely restore the Critter in restoreFrom()
 * @returns {{myIndex: *, currentLocationIndex: number, destLocIndex: number, x: *, y: *, speed: *, moving: *, motivation: (*|{name: string, version: string, dimensions: {width: number, height: number}, collections: *[]}), activity: *, health: *, elapsedSick: *, infectious: *, infected: *, incubationTime: *, antibodies: *, name: *, eyeColor: *, borderColor: *, baseTemperature: *}}
 */
Critter.prototype.getSaveObject =  function() {
    var tSaveObject = {
        myIndex : this.myIndex,
        currentLocationIndex : this.currentLocation ? this.currentLocation.myIndex : -1,
        destLocIndex : this.destLoc ? this.destLoc.myIndex : -1,
        x : this.x,
        y : this.y,
        speed : this.speed,
        moving : this.moving,       //  is this OK?
        motivation : this.motivation.getSaveObject(),       //  this Class needs its own thing
        activity : this.activity,
        health : this.health,
        elapsedSick : this.elapsedSick,
        infectious : this.infectious,
        infected : this.infected,
        incubationTime : this.incubationTime,
        antibodies : this.antibodies,
        name : this.name,
        eyeColor : this.eyeColor,
        borderColor : this.borderColor,
        baseTemperature : this.baseTemperature,

    };
    return tSaveObject;
};

/**
 * Completely restore a Critter using the argument
 * @param iObject       the stored object previously constructed using getSaveObject()
 */
Critter.prototype.restoreFrom = function( iObject ) {

    this.myIndex = iObject.myIndex;
    this.x = iObject.x;
    this.y = iObject.y;
    this.speed = iObject.speed;

    //  treat motivation specially

    this.motivation = new Motivation( this );
    this.motivation.restoreFrom( iObject.motivation );

    //  onward...

    this.moving = iObject.moving;
    this.activity = iObject.activity;
    this.health = iObject.health;
    this.elapsedSick = iObject.elapsedSick;
    this.infectious = iObject.infectious;
    this.infected = iObject.infected;
    this.incubationTime = iObject.incubationTime;
    this.antibodies = iObject.antibodies;
    this.name = iObject.name;
    this.eyeColor = iObject.eyeColor;
    this.borderColor = iObject.borderColor;
    this.baseTemperature = iObject.baseTemperature;

    this.view = new CritterView( this ); // todo: eliminate all old views on restore
    //  todo: make it so that the Critter does not own its model. At least don't restore it here.

    var tCurrentLocationIndex = iObject.currentLocationIndex;
    if (tCurrentLocationIndex >= 0) {
        this.currentLocation = epiModel.locations[ tCurrentLocationIndex ];
        this.currentLocation.addCritter( this );
    } else {
        this.currentLocation = null;    //  traveling
    }

    var tdestLocIndex = iObject.destLocIndex;
    this.destLoc = tdestLocIndex > 0 ? epiModel.locations[ tdestLocIndex ] : null;

};

/**
 * Very simple toString()
 * @returns {string}
 */
Critter.prototype.toString = function() {
    return "C " + this.myIndex + " mot "
        + this.motivation
    ;
};

/**
 * Possible eye colors
 * @type {string[]}
 */
Critter.eyeColors = ["violet", "dodgerblue"];

/**
 * possible border colors
 * @type {string[]}
 */
Critter.borderColors = ["orange"];