/**
 * Created by tim on 4/12/17.


 ==========================================================================
 System.js in gamePrototypes.

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

var System = function (iData) {

    this.sysID = iData.sysID;
    this.logAge = Number(iData.logAge);

    this.where = {
        x: Number(iData.where.x),
        y: Number(iData.where.y),
        z: Number(iData.where.r)
    };

    this.whither = {
        vx: Number(iData.whither.vx),
        vy: Number(iData.whither.vy),
        vr: Number(iData.whither.vr)
    };

    this.pm = {
        x: stella.pmFromSpeedAndDistance((this.whither.vx), this.where.z),
        y: stella.pmFromSpeedAndDistance((this.whither.vy), this.where.z),
        r: (this.whither.vr)
    };

    this.parallax = (1 / this.where.z) * stella.constants.microdegreesPerArcSecond;   //  reported in microdegrees

    this.stars = [];

    iData.stars.forEach( function(s) {
        var tStar = new Star(s, this);
        this.stars.push(tStar);
    }.bind(this));

};

/**
 * System's position (as an object) at the current time, based on PM and parallax
 * @param iTime
 * @returns {{x: *, y: *, z: *}}
 */
System.prototype.positionAtTime = function (iTime) {

    var oWhere = {
        x: this.where.x,
        y: this.where.y,
        z: this.where.z
    };

    //  parallax

    var tFracYear = iTime % 1;      //  the fractional part of the year

    var tParallax = this.parallax * Math.cos(tFracYear * 2 * Math.PI);  //  at year.0 and year.5, we're at extremes.

    if (stella.options.parallax) {
        oWhere.x += tParallax * 0.000001;       //  because tParallax is in microdegrees
    }

    //  proper motion

    var iDT = iTime - stella.state.epoch;

    if (stella.options.properMotion) {
        oWhere.x += iDT * this.pm.x;
        oWhere.y += iDT * this.pm.y;
        oWhere.z += iDT * this.pm.r * 1.0e05 / stella.constants.parsec
    }

    return oWhere;
};


/**
 * Make the object we can use to put a row in the Catalog.
 *
 * @returns {{x: string, y: string, m: string, id: *, U: string, B: string, V: string}}
 */
System.prototype.dataValues = function () {

    var out = {
        id: this.sysID,
        x: this.where.x.toFixed(6),
        y: this.where.y.toFixed(6),
        bright : this.bright(null).toFixed(2),
        U: this.bright("U").toFixed(2),
        B: this.bright("B").toFixed(2),
        V: this.bright("V").toFixed(2)
    };

    return out;
};

/**
 * Report true values of various possible Results
 *
 * @param iValueType
 * @returns {{trueValue: *, trueDisplay: *}}
 */
System.prototype.reportTrueValue = function (iValueType) {
    var out;
    var outDisplay;

    switch (iValueType) {
        case "temp":
            out = this.stars[0].logTemperature;     //  todo: fix this problem.
            break;
        case "vel_r":
            out = this.pm.r;
            break;
        case "pm_x":
            out = this.pm.x * 1000000;   //      because it's in microdegrees
            break;
        case "pm_y":
            out = this.pm.y * 1000000;   //      because it's in microdegrees
            break;
        case "pos_x":
            out = this.positionAtTime(stella.state.now).x;
            break;
        case "pos_y":
            out = this.positionAtTime(stella.state.now).y;
            break;
        case "parallax":
            out = this.parallax;
            break;
        default:
            break;
    }

    outDisplay = out;
    if (iValueType === "temp") {
        outDisplay = Math.pow(10, out);
    }
    return {trueValue: out, trueDisplay: outDisplay};
};

System.prototype.logAbsoluteLuminosity = function( iFilter ) {
    var lum = 0;
    this.stars.forEach( function(s) {
        var b = s.logAbsoluteLuminosity( iFilter );
        lum += Math.pow(10, b);
    });
    return Math.log10(lum);
};

/**
 * Returns the current apparent LOG brightness
 * @returns {number}
 */

System.prototype.bright = function( iFilter ) {
    var lum = this.logAbsoluteLuminosity( iFilter ) - 2 * Math.log10( this.where.z );
    return lum + 4;
};


System.prototype.htmlTableRow = function () {

    var o = "<tr>";
    o += "<td>" + this.sysID + "</td>";
    o += "<td>" + this.stars.map(function(s){return s.logMass.toFixed(2)}) + "</td>";
    o += "<td>" + this.stars.map(function(s){return Math.pow(10,s.logTemperature-3.0).toFixed(2)}) + "</td>";
    o += "<td>" + this.logAge.toFixed(2) + "</td>";
    o += "<td>" + this.stars.map(function(s){return s.logAbsoluteLuminosity(null).toFixed(2)}) + "</td>";
    o += "<td>" + this.bright(null).toFixed(2) + "</td>";
    o += "<td>" + this.stars.map(function(s){return s.myGiantIndex.toFixed(2)}) + "</td>";
    o += "<td>" + this.where.z.toFixed(2) + "</td>";
    o += "<td>" + this.stars.map(function(s){return s.varPeriod.toFixed(2)}) + "</td>";
    o += "</tr>";

    return o;
};

