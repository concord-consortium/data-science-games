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

    this.parallax = (1 / this.where.z) * stella.constants.microdegreesPerArcSecond;   //  max in microdegrees

    this.stars = [];

    iData.stars.forEach( function(s) {
        var tStar = new Star(s);
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

    //  var tParallaxMax = (1 / this.where.z) * stella.constants.microdegreesPerArcSecond;
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
        x: this.where.x.toFixed(6),
        y: this.where.y.toFixed(6),
        bright : this.bright(null).toFixed(2),
        id: this.sysID,
        U: Star.apparentMagnitude(this.bright("U")).toFixed(2),
        B: Star.apparentMagnitude(this.bright("B")).toFixed(2),
        V: Star.apparentMagnitude(this.bright("V")).toFixed(2)
    };

    return out;
};

/**
 * Make THIS star's spectrum.
 * Only need it when we have to put it up, so we don't store it.
 * @returns {Spectrum}
 */
System.prototype.setUpSpectrum = function () {
    var tSpectrum = new Spectrum();
    tSpectrum.hasAbsorptionLines = true;
    tSpectrum.hasEmissionLines = false;
    tSpectrum.hasBlackbody = true;
    tSpectrum.blackbodyTemperature = Math.pow(10, this.logTemperature);

    //  NB: no Lithium
    tSpectrum.addLinesFrom(elementalSpectra.H, 50 * Spectrum.linePresenceCoefficient("H", this.logTemperature));
    tSpectrum.addLinesFrom(elementalSpectra.HeI, 30 * Spectrum.linePresenceCoefficient("HeI", this.logTemperature));
    tSpectrum.addLinesFrom(elementalSpectra.NaI, 40 * Spectrum.linePresenceCoefficient("NaI", this.logTemperature));
    tSpectrum.addLinesFrom(elementalSpectra.CaII, 30 * Spectrum.linePresenceCoefficient("CaII", this.logTemperature));
    tSpectrum.addLinesFrom(elementalSpectra.FeI, 30 * Spectrum.linePresenceCoefficient("FeI", this.logTemperature));

    tSpectrum.speedAway = this.pm.r * 1.0e05;    //      cm/sec, right??
    tSpectrum.source.id = this.id;

    return tSpectrum;
};


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

/**
 * Returns the current apparent LOG brightness
 * @returns {number}
 */

System.prototype.bright = function( iFilter ) {
    var lum = 0;
    this.stars.forEach( function(s) {
        var b = s.bright( iFilter );
        lum += Math.pow(10, b);
    });

    return Math.log10(lum);
};

