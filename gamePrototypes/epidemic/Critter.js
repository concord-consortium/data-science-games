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


var Critter = function( index ) {
    this.myIndex = index;
    this.currentLocation;

    this.x = 0;
    this.y = 0;
    this.destX = 0;
    this.destY = 0;
    this.destLoc = null;
    this.speed = 100; // game units per second

    this.motivation = null;
    this.activity = null;
    this.view = new CritterView( this );

    this.moving = Boolean(false);

    this.health = 1.0;
    
    this.name = null;

};

Critter.prototype.update = function (dt) {
    this.motivation.update( dt );
    this.view.update( this, dt );

    if (!this.moving && !this.activity) {   //  idle critter!
        var tCritterNeeds = this.motivation.mostUrgentNeed();

        if (tCritterNeeds.urgency > 2.0) {  //  bigger need
            if (tCritterNeeds.what === this.currentLocation.locType) {
                this.activity = tCritterNeeds.bestActivity;
            } else {
                this.setNewDest( );      //  sets destLoc, destX, and destY
                this.startMove();
            }
        }
    }
};

Critter.prototype.setNewDest = function( ) {
    var tCritterNeeds = this.motivation.mostUrgentNeed().what;
    var tClosestDistance = Number.MAX_VALUE;
    var i;
    var tBestLocations = [];

    // todo: figure out whether this system biases towards 0,0 (because the test is strictly less than, or the origin adjustment)
    for (i = 0; i < medGeography.numberOfLocations(); i++) {
        var tTestLocation = medModel.locations[i];
        if (tTestLocation != this.currentLocation && tTestLocation.locType == tCritterNeeds) {
            var tTestDistance = this.distanceToLoc( tTestLocation);
            if (tTestDistance < tClosestDistance - medGeography.kPixelsWide) {  //  with some slop
                tClosestDistance = tTestDistance;
                tBestLocations = [tTestLocation];
            } else if (tTestDistance < tClosestDistance + medGeography.kPixelsWide) {
                tBestLocations.push( tTestLocation );
            }
        }
    }
    var tDestLoc = pickRandomItemFrom(tBestLocations);

    this.destLoc = tDestLoc;
    var tCenter = tDestLoc.centerCoordinates();     //  for now, head for center of the loc

    this.destX = tCenter.x;
    this.destY = tCenter.y;
};



Critter.prototype.startMove = function() {
    medModel.doDeparture( {critter: this, fromLocation: this.currentLocation });
    var tTime = this.distanceToLoc( this.destLoc ) / this.speed;
    this.view.snapShape.animate(
        {"x" : this.destX, "y" : this.destY},
        tTime * 1000, null,
        function() {
            medModel.doArrival({ critter: this, atLocation: this.destLoc} );
        }.bind(this)
    );
};

Critter.prototype.startJiggleMove = function( destination ) {
    this.view.snapShape.stop();
    this.view.snapShape.animate(
        { "x": destination.x, "y": destination.y },
        1000, null,
        null
    );
};

Critter.prototype.initialize = function( where ) {
    this.name = medNames.newName( );
    this.currentLocation = where;
    this.x = where.snapShape.attr("x");
    this.y = where.snapShape.attr("y");
    this.view.moveTo( this.x, this.y );
    this.motivation = new Motivation( this );

    where.addCritter(this);

};


Critter.prototype.distanceToLoc = function( L ) {
    var tLocW = Number(L.snapShape.attr("width"));
    var tLocX = Number(L.snapShape.attr("x")) + tLocW/2;
    var tLocY = Number(L.snapShape.attr("y")) + tLocW/2;   //  todo: fix for height
    var tdx = tLocX - this.x;
    var tdy = tLocY - this.y;
    return Math.sqrt( tdx * tdx + tdy * tdy);
};


Critter.prototype.toString = function() {
    return "C " + this.myIndex + " mot "
        + this.motivation
    ;
}
