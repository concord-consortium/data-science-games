/**
 * Created by tim on 5/7/16.


 ==========================================================================
 Star.js in data-science-games.

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

/**
 * Model class for stars
 */

/*
 Notes on eta Cas itself:
 Double. We'll talk about the primary:
 V = 3.44
 U-B = 0.02
 B-V = 0.58
 distance = 5.95 (pc)

 Now the copmpanion, Eta Cassiopeiae B
 Period (P)	480 yr
 Semi-major axis (a)	11.9939"
 Eccentricity (e)	0.497
 Inclination (i)	34.76°
 Longitude of the node (Ω)	98.42°
 Periastron epoch (T)	1889.6
 Argument of periastron (ω) 88.59°
 (secondary)
 */

/**
 * Constructor
 * @constructor
 */

/* global Snap, Spectrum, stella, elementalSpectra, TEEUtils */

/**
 * Notes on position
 * {x, y, r}
 * where x and y are IN DEGREES and r is in pc.
 */


/**
 * Construct a model Star. Called from stella.model.initGame()
 * @param iStarData
 * @constructor
 */
var Star = function (iStarData) {

    this.logMass = Number(iStarData.logMass);
    this.logAge = Number(iStarData.logAge);
    this.id = iStarData.id;

    this.where = {
        x: Number(iStarData.where.x),
        y: Number(iStarData.where.y),
        z: Number(iStarData.where.r)
    };

    this.pm = {
        x: stella.pmFromSpeedAndDistance(Number(iStarData.whither.vx), this.where.z),
        y: stella.pmFromSpeedAndDistance(Number(iStarData.whither.vy), this.where.z),
        r: Number(iStarData.whither.vr)
    };

    this.parallax = (1 / this.where.z) * stella.constants.microdegreesPerArcSecond;   //  max in microdegrees

    //  what depends on mass and age...

    this.logRadius = iStarData.logRadius;
    this.logLuminosity = iStarData.logLum;
    this.logTemperature = iStarData.logTemp;      //  start on main sequence
    this.logLifetime = iStarData.logLifetime;
    this.myGiantIndex = iStarData.giant;


    //  this.evolve();     //  old enough to move off the MS?
    this.doPhotometry();    //  calculate UBV (etc) magnitudes
};

Star.prototype.reportTrueValue = function (iValueType) {
    var out;
    var outDisplay;

    switch (iValueType) {
        case "temp":
            out = this.logTemperature;
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

Star.prototype.csvLine = function () {
    return this.id + "," + this.logMass + "," + this.logAge + "," +
        this.where.x + "," + this.where.y + "," + this.where.z + "," +
        this.vx + "," + this.vy + "," + this.vr;
};

Star.prototype.htmlTableRow = function () {
    var o = "<tr>";
    o += "<td>" + this.id + "</td>";
    o += "<td>" + this.logMass.toFixed(2) + "</td>";
    o += "<td>" + Math.pow(10,this.logTemperature).toFixed(0) + "</td>";
    o += "<td>" + this.logAge.toFixed(2) + "</td>";
    o += "<td>" + this.mApp.toFixed(2) + "</td>";
    o += "<td>" + this.myGiantIndex.toFixed(2) + "</td>";
    o += "<td>" + this.where.z.toFixed(2) + "</td>";
    o += "</tr>";

    return o;
};

/**
 * Has this Star moved off the MS? If so, how much?
 * Answer is stored in this.myGiantIndex, which is 0 on the MS, (0,1) transitioning, 1 for giant, and 1000 for WD, NS, etc
 */
/*
Star.prototype.evolve = function () {
    var tAge = Math.pow(10, this.logAge);           //  current age
    this.myGiantIndex = this.computeGiantIndex(tAge);

    if (this.myGiantIndex <= 0) {
        this.myGiantIndex = 0;                 //      ON MAIN SEQUENCE. No evolution.
    } else if (this.myGiantIndex <= 1) {        //  GIANT phase
        /!*
         Our model is, at this point, that as you age, you will maintain your luminosity,
         but your temperature will decline, linearly, to about 3300K
         (stella.constants.giantTemperature)
         *!/

        var tMSTemp = Math.pow(10, this.logMainSequenceTemperature);
        var tCurrentTemp = tMSTemp - (this.myGiantIndex * (tMSTemp - stella.constants.giantTemperature));   //  linear

        /!*
         todo: this routine has two random() references. This is a problem as initial (evolved) stars are therefore not the same.
         *!/

        tCurrentTemp -= 500.0 * Math.random();      //  some variety in giant temperatures.
        this.logTemperature = Math.log10(tCurrentTemp); //  here is where we set the star's evolved temperature
        this.logRadius = this.logMainSequenceRadius + 2.0 * (this.logMainSequenceTemperature - this.logTemperature);
        //  R goes like T^2 for constant luminosity (L goes as R^2T^4)
    } else {            //          WHITE DWARF or...
        var tRan = Math.random();
        this.logTemperature = 4 + tRan * 0.5;       //  hot! 10000 to 30000

        var tTempInSols = Math.pow(10, this.logTemperature) / stella.constants.solarTemperature;

        //  todo: THIS is where we would have decided how much mass is left, and if we'll make a neutron star or BH.

        this.logRadius = -2.0 - 0.3 * this.logMass;      //  see http://burro.cwru.edu/academics/Astr221/LifeCycle/WDmassrad.html
        //  now we know temperature and radius, we can compute luminosity:
        this.logLuminosity = 2 * this.logRadius + 4 * Math.log10(tTempInSols);
    }
};
*/

/**
 * Star's position (as an object) at the current time, based on PM and parallax
 * @param iTime
 * @returns {{x: *, y: *, z: *}}
 */
Star.prototype.positionAtTime = function (iTime) {

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
 * Calculate apparent magnitude from absolute and distance
 * @param iAbsoluteMagnitude
 * @param iDistance
 * @returns {*}
 */
Star.apparentMagnitude = function (iAbsoluteMagnitude, iDistance) {
    return iAbsoluteMagnitude + 5 * (Math.log10(iDistance) - 1);
};

/**
 * Make THIS star's spectrum.
 * Only need it when we have to put it up, so we don't store it.
 * @returns {Spectrum}
 */
Star.prototype.setUpSpectrum = function () {
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

/**
 * Stellar Evolution. Where it is, and how it depends on age and (ms) lifetime.
 * @param iAge
 * @returns {number}
 */
/*
Star.prototype.computeGiantIndex = function (iAge) {
    var result = 0;
    var tTimeOnMS = Math.pow(10, this.logLifetime);
    var tTimeAcross = tTimeOnMS;  //  for now, the same time across as on MS
    var tTimeAsGiant = tTimeOnMS;  //  for now, the same time as giant as on MS

    if (iAge < tTimeOnMS) {
        result = 0;
    } else if (iAge < tTimeOnMS + tTimeAcross) {
        result = (iAge - tTimeOnMS) / tTimeAcross;
    } else if (iAge < tTimeOnMS + tTimeAcross + tTimeAsGiant) {
        result = 1.0;
    } else {
        result = 1000;    //  past nova!
    }

    return result;
};
*/

/**
 * UBV photometry using blackbody.
 * Assume Sun = 5800K, and all its absolute magnites are as listed.
 */
Star.prototype.doPhotometry = function () {

    this.mAbs = 4.85 - 2.5 * this.logLuminosity;
    this.mApp = Star.apparentMagnitude(this.mAbs, this.where.z);

    var solarU = 5.61;  //  solar mags from http://www.ucolick.org/~cnaw/sun.html
    var solarB = 5.48;
    var solarV = 4.83;
    //  var solarR = 4.42;
    //  var solarI = 4.08;

    var tSolar = 5800;

    var tTemp = Math.pow(10, this.logTemperature);
    var tRadius = Math.pow(10, this.logRadius);

    var L_solarU = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaU, tSolar);
    var L_solarB = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaB, tSolar);
    var L_solarV = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaV, tSolar);
    var L_star_U = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaU, tTemp) * tRadius * tRadius;
    var L_star_B = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaB, tTemp) * tRadius * tRadius;
    var L_star_V = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaV, tTemp) * tRadius * tRadius;

    this.uAbs = solarU - 2.5 * Math.log10(L_star_U / L_solarU);
    this.bAbs = solarB - 2.5 * Math.log10(L_star_B / L_solarB);
    this.vAbs = solarV - 2.5 * Math.log10(L_star_V / L_solarV);

};

/**
 * Make the object we can use to put a row in the Catalog.
 *
 * @returns {{x: string, y: string, m: string, id: *, U: string, B: string, V: string}}
 */
Star.prototype.dataValues = function () {


    var out = {
        x: this.where.x.toFixed(6),
        y: this.where.y.toFixed(6),
        bright : this.bright().toFixed(1),
        m: this.mApp,
        id: this.id,
        U: Star.apparentMagnitude(this.uAbs, this.where.z).toFixed(2),
        B: Star.apparentMagnitude(this.bAbs, this.where.z).toFixed(2),
        V: Star.apparentMagnitude(this.vAbs, this.where.z).toFixed(2)
    };

    return out;
};

Star.prototype.bright = function() {
    return 4 + this.logLuminosity - 2 * Math.log10(this.where.z);
};

/**
 * String version of me
 * @returns {string}
 */
Star.prototype.toString = function () {
    var out = Math.pow(10, this.logMass).toFixed(2);
    out += ", " + Math.round(Math.pow(10, this.logMainSequenceTemperature));
    out += ", " + this.mAbs.toFixed(2);
    out += ", " + this.mApp.toFixed(2);
    out += ", " + Math.round(Math.pow(10, this.logLifetime - 6));
    out += ", " + this.where.x.toFixed(2) + ", " + this.where.y.toFixed(2) + ", " + this.where.z.toFixed(2);

    return out;
};

/**
 * Very short ID string useful for the status bar
 * @returns {string}
 */
Star.prototype.infoText = function () {

    return this.id + " m = " + this.mApp.toFixed(2);
};

//------------------------------------------
//      VIEW class

/**
 * Make a new StarView.
 * @param iStar     which Star
 * @param iPaper    the paper of the SKY, to which we attach this view
 * @constructor
 */
var StarView = function (iStar, iPaper) {
    this.star = iStar;          //  view knows about the model
    this.myCircle = iPaper.circle(2.5, 2.5, 0.01);
    this.setSizeEtc(  );

    //  this.myCircle.dblclick(stella.manager.doubleClickOnAStar);
    this.myCircle.click(this.clickOnAStar.bind(this));
};

StarView.prototype.setSizeEtc = function (  ) {
    var tOpacity = 1.0;
    var tRadius = 1;
    var tDegreesPerPixel = stella.constants.universeWidth / stella.skyView.magnification / stella.skyView.originalViewWidth;
    var tGray = 17;
    var tMagnitudeElbow, tMagnitudeLimit;

    //  The scale and brightness of stars depends on magnification

    tMagnitudeElbow = 6.0 * Math.log10(stella.skyView.magnification);
    tMagnitudeLimit = 11.0 + 3 * Math.log10(stella.skyView.magnification);

    if (this.star.mApp < tMagnitudeElbow) {
        tRadius *= tMagnitudeElbow - this.star.mApp + 1;
    } else if (this.star.mApp < tMagnitudeLimit) {
        tOpacity = (tMagnitudeLimit - this.star.mApp) / (tMagnitudeLimit - tMagnitudeElbow);
    } else {
        tOpacity = 0.0;
    }

    var tColor = Snap.rgb(tGray * 15, tGray * 15, tGray * 15);    //  put color in here if we want

    //  convert to current positions!

    var tCurrentWhere = this.star.positionAtTime(stella.state.now);

    //  actually make the circle! Be sure to reverse the y coordinate.

    if (tOpacity <= 0) {
        tRadius = 0;
        tOpacity = 0;
    }

    this.myCircle.animate({
        cx: tCurrentWhere.x,
        cy: stella.constants.universeWidth - tCurrentWhere.y,
        r: tRadius * tDegreesPerPixel,
        fill: tColor,
        fillOpacity: tOpacity
    }, 1000);
};


StarView.prototype.clickOnAStar = function ( iEvent ) {
    if (stella.skyView.magnification === 1) {
        stella.manager.pointAtStar( this.star );
    }
};


