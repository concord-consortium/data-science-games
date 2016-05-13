/**
 * Created by tim on 3/23/16.


 ==========================================================================
 Stebber.js in data-science-games.

 Author:   Tim Erickson

 Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.

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


var Stebber = function( iColor, iWhere, iID ) {
    this.color = iColor ? iColor : [8, 8, 8];
    this.where = iWhere;
    this.id = iID;

    this.setNewSpeedAndHeading();
    this.updatePredatorVision();
};

Stebber.prototype.setNewSpeedAndHeading = function() {
    this.heading = Math.PI*2 * Math.random();
    this.timeToChange = 1 + Math.random() * 2;
    this.speed = steb.constants.baseStebberSpeed;
    //var tDegrees = Math.round(this.heading * 180.0 / Math.PI);
    //console.log("New heading " + tDegrees);
};

Stebber.prototype.updatePredatorVision = function() {
    this.colorDistanceToBackground = steb.model.colorDistance(
        steb.model.getPredatorVisionColor(steb.model.trueBackgroundColor),
        steb.model.getPredatorVisionColor(this.color)
    );

    if (steb.options.backgroundCrud) {
        this.colorDistanceToCrud = steb.model.colorDistance(
            steb.model.getPredatorVisionColor(steb.model.meanCrudColor),
            steb.model.getPredatorVisionColor(this.color)
        );
    } else {
        this.colorDistanceToCrud = null;
    }
};


Stebber.prototype.update = function( idt ) {

    if (this.speed > steb.constants.baseStebberSpeed) {
        this.speed -= idt * steb.constants.baseStebberAcceleration;
    }

    var tDx = this.speed * Math.cos( this.heading ) * idt;
    var tDy = this.speed * Math.sin( this.heading ) * idt;

    this.where.x += tDx;
    this.where.y += tDy;

    this.where.x = steb.rangeWrap( this.where.x, 0, steb.constants.worldViewBoxSize);
    this.where.y = steb.rangeWrap( this.where.y, 0, steb.constants.worldViewBoxSize);

    this.timeToChange -= idt;

    if (this.timeToChange < 0) this.setNewSpeedAndHeading();

    //  debugging

    var tDegrees = Math.round(this.heading * 180.0 / Math.PI);
    var result = "ID: " + this.id;
    result += " x, y: " + Math.round(this.where.x) + ", " + Math.round(this.where.y);
    result += " dx, dy: " + Math.round(1000 * tDx) + ", " + Math.round(1000 * tDy);
    result += " hdg: " + tDegrees;
    //  console.log(result);

};

Stebber.prototype.runFrom = function( iPoint ) {
    if (steb.options.flee) {
        var dx = this.where.x - iPoint.x;
        var dy = this.where.y - iPoint.y;
        var r = Math.sqrt(dx * dx + dy * dy);

        if (r < steb.constants.worldViewBoxSize / 2) {
            this.heading = Math.atan2(dy, dx);
            this.speed = 5 * steb.constants.baseStebberSpeed;
            this.timeToChange = 1 + Math.random() * 2;
        }
    }
};


Stebber.prototype.dataValues = function() {

    var tSnapColorRecord = Snap.color( steb.makeColorString( this.color ));
    var oValues = [
        this.color[0],
        this.color[1],
        this.color[2],
        tSnapColorRecord.h,
        tSnapColorRecord.s,
        tSnapColorRecord.v,
        this.id
    ];

    return oValues;
};

Stebber.prototype.toString = function() {
    var o = "stebber id " + this.id;
    o += " color : " + JSON.stringify( this.color );
    return o;
}

