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
    this.currentLocation = null;
    this.speed = 100; // game units per second

    this.hungry = 0;
    this.thirsty = 0;
    this.tired = 0;

    this.dwellTime = 5.0;
    this.dwellRemaining = this.dwellTime;

    this.snapShape = null;

    this.moving = Boolean(false);

    this.initialize();
};

Critter.prototype.update = function (dt) {
    if (!this.moving) {
        var tGottaMove = true;
        this.dwellRemaining -= dt;
        if (this.currentLocation) {
            switch (this.currentLocation.locType) {
                case "food":
                    this.hungry -= dt;
                    this.thirsty += dt /10;
                    this.tired += dt / 20;
                    tGottaMove = this.hungry <= 0.0;
                    break;
                case "water":
                    this.thirsty -= dt;
                    this.hungry += dt/10;
                    this.tired += dt / 20;
                    tGottaMove = this.thirsty <= 0.0;
                    break;
                case "dwelling":
                    this.tired -= dt;
                    this.hungry += dt / 20;
                    this.thirsty += dt / 20;
                    tGottaMove = this.tired <= 0.0;
                    break;
                default:
                    tGottaMove = true;
                    break;
            }
        }
        if (tGottaMove) {  //  done munching
            this.moving = true;
            this.newDest();     //  sets destLoc, destX, and destY
            var tTime = this.distanceToLoc( this.destLoc ) / this.speed;
            this.snapShape.animate(
                {"cx" : this.destX, "cy" : this.destY},
                tTime * 1000, null,
                function() {
                    this.moving = false;
                    this.x = this.snapShape.attr("cx");
                    this.y = this.snapShape.attr("cy");
                    this.currentLocation = this.destLoc;
                    this.destLoc = null;
                }.bind(this)
            );
        }
    }
    console.log(this.toString());
};

Critter.prototype.initialize = function() {
    var tTS = medGeography.totalSize();
    this.x = Math.random() * Number(tTS.width);
    this.y = Math.random() * Number(tTS.height);
    var tSVGShape = document.createElementNS(svgNS, "circle");
    var tShape = Snap(tSVGShape);
    tShape.attr("cx", this.x.toString());
    tShape.attr("cy", this.y.toString());
    tShape.attr("r", "10");         //  todo: fix this
    tShape.attr("fill", "yellow");
    this.snapShape = tShape;
    this.newDest();     //
};

Critter.prototype.newDest = function() {
    //temp!
    medModel.setNewCritterDest( this );
};

Critter.prototype.distanceToLoc = function( L ) {
    var tLocW = Number(L.snapShape.attr("width"));
    var tLocX = Number(L.snapShape.attr("x")) + tLocW/2;
    var tLocY = Number(L.snapShape.attr("y")) + tLocW/2;   //  todo: fix for height
    var tdx = tLocX - this.x;
    var tdy = tLocY - this.y;
    return Math.sqrt( tdx * tdx + tdy * tdy);
};

Critter.prototype.mostUrgentNeed = function( ) {
    var tNeed = "food";
    var tValue = this.hungry;

    if (this.thirsty > tValue) {
        tNeed = "water";
        tValue = this.thirsty;
    };

    if (this.tired > tValue) {
        tNeed = "dwelling";
        tValue = this.tired;
    };

    return {what: tNeed, urgency: tValue};
};

Critter.prototype.toString = function() {
    return "C " + this.myIndex + " H Th Ti "
        + Math.round(this.hungry * 1000)/1000 + " " +
        + Math.round(this.thirsty * 1000)/1000 + " " +
        + Math.round(this.tired * 1000)/1000 + " "
    ;
}
