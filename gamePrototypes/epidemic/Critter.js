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
    this.caseIDs = [];

    this.where = null;      //  where we are { row , col }
    this.whither = null;    //  where we're going { row , col }
    this.xy = null;
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

    var tWeird = !this.moving && !this.where;

    if (tWeird) {
        console.log("WEIRD: " + this.name )
    }

    //  update the motivation
    if (this.where) {
        var tLocType = epiGeography.locationFromRowCol( this.where).locType;
        this.activity = this.motivation.update( dt, this.activity, tLocType );
    }

    this.updateHealth( dt );
    this.speed = this.kBaseSpeed * (0.5 + 0.5 * this.health);

    this.view.update(  );
    this.temperature = this.findTemperature();

    if (epiOptions.crittersMoveOnTheirOwn) {
        if (!this.moving && !this.activity) {   //  idle critter!
            var tCritterNeeds = this.motivation.mostUrgentNeed();

            if (tCritterNeeds.urgency > 2.0) {  //  bigger need
                if (tCritterNeeds.what === epiGeography.locationFromRowCol(this.where).locType) {
                    this.activity = tCritterNeeds.bestActivity;
                } else {
                    var tNewRC = this.setNewDest();      //  sets this.whither
                    console.log( this.name + " whither is " + epiGeography.rowColString(tNewRC));
                    this.doDeparture( tNewRC, "migration" );
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

        if (epiMalady.pMaladyNumber == epiMalady.kToxicMaladyWater) {
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
Critter.prototype.setNewDest = function( ) {        //  todo: put up in the Manager, or down in Geography
    var tCritterNeeds = this.motivation.mostUrgentNeed().what;
    var tOKRowCols = [];

    var tClosestSuitableDistance = epiGeography.distanceToClosestSuitableLocationType(
        this.where,
        tCritterNeeds);

    tOKRowCols = epiGeography.allSuitableRowColsWithin(
        this.where,
        tCritterNeeds,
        tClosestSuitableDistance + epiGeography.kPixelsWide);   //  padding

    var tDest = TEEUtils.pickRandomItemFrom( tOKRowCols );

    return tDest;     //      our destination in rowCol form
};


/**
 * Set the Critter's destination to be the center of the given Location.
 * When it arrives, adjust the positions of Critters in the Location.
 * @param iCritter     who is moving
 * @param iDest        rowCol of destination
 * @param iTime        how long it should take
 */
Critter.prototype.animateToCenterOfDestination = function(  )  {
    var tCurrentXY = this.xy;
    var tDestinationXY = epiGeography.centerFromRowCol( this.whither );     //  for now, head for center of the loc;
    var tDistance = epiGeography.distanceByXY( tCurrentXY, tDestinationXY);
    var tTime = tDistance / this.speed;
    var tAnimationObject = {
        x : tDestinationXY.x,
        y : tDestinationXY.y
    };

    var tCurrentLocationString = this.where
        ? epiGeography.rowColString(this.where)
        : "(" + tCurrentXY.x + ", " + tCurrentXY.y + ")" ;

    this.view.snapShape.animate(
        tAnimationObject,
        tTime * 1000, null,
        function() {
            this.doArrival(this.whither, "arrival");       //  callback on arrival
        }.bind(this)
    );
};

/**
 * A critter actually departs
 * @param iToRC   whither?
 * @param iReason   why?
 */
Critter.prototype.doDeparture = function( iToRC, iReason ) {

    this.activity = "traveling";
    this.moving = true;
    this.whither = iToRC;
    this.animateToCenterOfDestination(  );

    if (this.where) {       //  there is a current location (we're not dragging an already-moving critter
        if (epiOptions.dataOnDeparture)
            epiManager.emitCritterData( this, iReason); //  must do before this.where changes
        epiGeography.locationFromRowCol(this.where).removeCritter( this.myIndex );
        this.where = null;
    }
};


/**
 * A Critter arrives at a new Location.
 * @param iToRC
 * @param iReason
 */
Critter.prototype.doArrival = function( iToRC, iReason ) {      //  epiModel.doArrival({ critter: c, toRowCol: iRC} );
    this.moving = false;
    this.xy = {
        x: this.view.snapShape.attr("x"),
        y: this.view.snapShape.attr("y")
    };
    this.where = iToRC;
    this.whither = null;

    var tNewLocation = epiGeography.locationFromRowCol(iToRC);
    tNewLocation.addCritter( this.myIndex );
    this.activity = Location.mainActivities[ tNewLocation.locType ];       //      do whatever they do here :)
    if (epiOptions.dataOnArrival) epiManager.emitCritterData( this, iReason);
    //  todo: fix it so that on game end, critters don't still arrive, making invalid cases.
    //  (Why are they invalid?)
};



/**
 * Starts a "jiggle" move, that is, re-line-up in response to
 * a new Critter joining this Location.
 * "Destination" is within the Location.
 * @param iDest
 */
Critter.prototype.startJiggleMove = function( iDestXY ) {
    this.view.snapShape.stop();
    var tAnimationObject = {
        x : iDestXY.x,
        y : iDestXY.y
    };

/*
    console.log( this.name + " jiggles in "
        + epiGeography.rowColString(this.where) + " to "
        + JSON.stringify(tAnimationObject));
*/


    this.view.snapShape.animate(
        tAnimationObject,
        1000, null,
        null
    );
};

/**
 * Set up initial values for this Critter
 * @param iLocation     the Location
 */
Critter.prototype.initialize = function( iRowCol ) {
    this.name = medNames.newName( );
    this.where = iRowCol;
    this.whither = null;
    tLocCenter = epiGeography.centerFromRowCol( iRowCol );
    this.xy = { x : tLocCenter.x, y : tLocCenter.y};
    this.view.moveTo( this.xy );
    this.motivation = new Motivation(  );

};


/**
 * Construct an Object to be saved; we can use this to completely restore the Critter in restoreFrom()
 * @returns {{myIndex: *, where: *, whither: *, x: *, y: *, speed: *, moving: *, motivation: (*|{numberOfCritters: *, elapsed: *, nMoves: *, malady: *, critters: *, locations: *}|{pRowsInGrid: *, pColumnsInGrid: *, kPixelsWide: *, kPixelsTall: *}|{name: string, version: string, dimensions: {width: number, height: number}, collections: *[]}|{crittersMoveOnTheirOwn: *, dataOnCritterClick: *, dataOnArrival: *, dataOnDeparture: *, dataOnGetSick: *, showCarrier: *, endlessGame: *, smallGame: *}|{version: *, gameNumber: *, gameInProgress: *, CODAPConnector: (*|{myIndex: *, currentLocationIndex: number, destLocIndex: number, x: *, y: *, speed: *, moving: *, motivation: (*|{name: string, version: string, dimensions: {width: number, height: number}, collections: *[]}), activity: *, health: *, elapsedSick: *, infectious: *, infected: *, incubationTime: *, antibodies: *, name: *, eyeColor: *, borderColor: *, baseTemperature: *}|{pRowsInGrid: *, pColumnsInGrid: *, kPixelsWide: *, kPixelsTall: *}|{name: string, version: string, dimensions: {width: number, height: number}, collections: *[]}|{pMaladyNumber: *, pMaladyName: *, pAverageSecondsToInfection: *, pDiseaseDurationInSeconds: *, pIncubationInSeconds: *, pSickSecondsToGameEnd: *, pTotalElapsedSecondsToGameEnd: *, pMaladyNameList: *}|{gameCaseID: *, gameNumber: *, gameCollectionName: *})}), activity: *, health: *, elapsedSick: *, infectious: *, infected: *, incubationTime: *, antibodies: *, name: *, eyeColor: *, borderColor: *, baseTemperature: *}}
 */
Critter.prototype.getSaveObject =  function() {
    var tSaveObject = {
        myIndex : this.myIndex,
        where : this.where,
        whither : this.whither,
        xy : this.xy,
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
    this.xy = iObject.xy;
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
    //  todo: make it so that the Critter does not own its view. At least don't restore it here.

    this.where = iObject.where;
    this.whither = iObject.whither;
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