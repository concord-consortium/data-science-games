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

    this.x = 0;
    this.y = 0;
    this.destX = 0;
    this.destY = 0;
    this.destLoc = null;
    this.speed = 100; // game units per second

    this.motivation = null;
    this.activity = null;
    this.snapShape = null;

    this.moving = Boolean(false);

};

Critter.prototype.update = function (dt) {
    this.motivation.update( dt );

    if (!this.moving && !this.activity) {   //  idle critter!
        var tCritterNeeds = this.motivation.mostUrgentNeed();

        if (tCritterNeeds.urgency > 2.0) {  //  bigger need
            if (tCritterNeeds.what === this.currentLocation.locType) {
                this.activity = tCritterNeeds.bestActivity;
            } else {
                medModel.setNewCritterDest(this, tCritterNeeds.what);      //  sets destLoc, destX, and destY
                this.startMove();
            }
        }
    }
    // console.log(this.toString());
};

Critter.prototype.startMove = function() {
    this.moving = true;
    var tTime = this.distanceToLoc( this.destLoc ) / this.speed;
    this.snapShape.animate(
        {"cx" : this.destX, "cy" : this.destY},
        tTime * 1000, null,
        function() {
            medModel.doArrival({ critter: this, atLocation: this.destLoc} );
        }.bind(this)
    );

};


Critter.prototype.initialize = function( where ) {
    this.currentLocation = where;

    this.motivation = new Motivation( this );
    var tParkAt = where.localParkingCoordinates( this.myIndex );
    this.x = Number(where.snapShape.attr("x")) + tParkAt.x;
    this.y = Number(where.snapShape.attr("y")) + tParkAt.y;

    var tSVGShape = document.createElementNS(svgNS, "circle");
    var tShape = Snap(tSVGShape);
    //  var tShape = Snap.circle( this.x, this.y, 10);
    tShape.attr("cx", this.x.toString());
    tShape.attr("cy", this.y.toString());
    tShape.attr("r", "10");         //  todo: fix this
    tShape.attr("fill", "yellow");
    //tShape.click( Critter.clickCritter );
    this.snapShape = tShape;

};


Critter.prototype.distanceToLoc = function( L ) {
    var tLocW = Number(L.snapShape.attr("width"));
    var tLocX = Number(L.snapShape.attr("x")) + tLocW/2;
    var tLocY = Number(L.snapShape.attr("y")) + tLocW/2;   //  todo: fix for height
    var tdx = tLocX - this.x;
    var tdy = tLocY - this.y;
    return Math.sqrt( tdx * tdx + tdy * tdy);
};


Critter.prototype.clickCritter = function( e ) {
    console.log("Critter clicked. " + e.toString());
};

Critter.prototype.toString = function() {
    return "C " + this.myIndex + " mot "
        + this.motivation
    ;
}
