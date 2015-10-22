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

    this.hungry = 0;
    this.thirsty = 0;
    this.tired = 0;

    this.dwellTime = 5.0;
    this.dwellRemaining = this.dwellTime;

    this.location = null;

    this.shapeSVG = null;

    this.munching = Boolean(false);

    this.initialize();
};

Critter.prototype.update = function (dt) {
    if (this.munching) {
        this.dwellRemaining -= dt;
        if (this.dwellRemaining <= 0) {  //  done munching
            this.newDest();
            this.munching = false;
        }

    } else {
        //  move towards dest
        var txToDest = this.destX - this.x;
        var tyToDest = this.destY - this.y;

        var tDestDist = Math.sqrt( txToDest * txToDest + tyToDest * tyToDest);

        var tThisDistance = dt * this.speed;

        var tDx = txToDest * tThisDistance / tDestDist;
        var tDy = tyToDest * tThisDistance / tDestDist;

        if (tDestDist < 5) {
            this.munching = true;
            this.dwellRemaining = this.dwellTime
        } else {
            this.x += tDx;
            this.y += tDy;
        }

    };

};

Critter.prototype.initialize = function() {
    var tTS = medGeography.totalSize();
    this.x = Math.random() * Number(tTS.width);
    this.y = Math.random() * Number(tTS.height);
    var tShape = document.createElementNS(svgNS, "circle");
    tShape.setAttribute("cx", this.x.toString());
    tShape.setAttribute("cy", this.y.toString());
    tShape.setAttribute("r", "10");         //  todo: fix this
    tShape.setAttribute("fill", "yellow");
    this.shapeSVG = tShape;
    this.newDest();
};

Critter.prototype.newDest = function() {
    //temp!
    medModel.setNewCritterDest( this );
}

