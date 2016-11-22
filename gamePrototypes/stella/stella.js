/**
 * Created by tim on 5/7/16.


 ==========================================================================
 etaCas.js in data-science-games.

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

/*
 stella.js

 The root of the stella object hierarchy.

 Here you find the basic initialization routine, constants of various sorts, and utilities.

 Program Overview
 ----------------

 Controllers: .manager, .ui, .options, .connector

 Model:  .model, Star, Spectrum, Line, ElementalSpectra, [Planet] (not currently in use)

 Views:  .skyView, SpectrumView, StarView (in Star.js)

 This game is not a series of games, but rather a single game that continues.
 As of 2016-07-11, the idea is that you will accrue points (money?) doing various tasks,
 and spend them (or just be rewarded) to get new capabilities such as better equipmentViews and automated services.

 It would be great, but is beyond the current scope, to share data withing the classroom,
 and possibly to publish.

 Anyhow: the .model singleton has an array of Stars. Stars have a variety of attributes, beginning with stellar mass,
 from which all other stellar properties derive. Mass determines radius and brightness,
 which determine temperature and lifespan.

 A Spectrum is essentially a collection of Lines at particular intensities. You get the Lines from
 ElementalSpectra, which get made at startup from NIST data. See that class for the actual lines data.

 A stellar Spectrum gets created on the fly when needed (foreseeing variable stars).
 When the user can see a Spectrum, you update a SpectrumView with the new Spectrum.
 */


/* global ElementalSpectra, Math */

var stella = {           //  top level global

};

/**
 * Initialze the whole thing.
 */
stella.initialize = function () {

    stella.ui.initializeUINames();  //  so we can refer to DOM objects by name.
    stella.constants.parsec = 206265 * stella.constants.astronomicalUnit; //  must be computed

    stella.player.initialize();
    //  stella.share.initialize(stella.constants.baseURL);

    stella.manager.newGame();   //  will create new stars, etc.
};


/**
 * UI strings that can later be swapped out for localization
 * @type {{notPointingText: string, noSkySpectrum: string, noLabSpectrum: string, notPointingAtStarForResults: string, resultIsWayOff: string}}
 */
stella.strings = {
    notPointingText: "not pointing at a particular star",
    noSkySpectrum: "point at a star to see its spectrum",
    noLabSpectrum: "set up equipmentViews to see a lab spectrum",
    notPointingAtStarForResults: "You have to point at a star so we know which star you're reporting on!",
    resultIsWayOff: "Your result is pretty far off. No points. Be sure to check units!"
};

/**
 * Many constants including physical constants.
 * @type {{version: string, bigG: number, solarLuminosity: number, solarMass: number, solarTemperature: number, astronomicalUnit: number, msPerDay: number, secPerYear: number, nStars: number, maxStarLogMass: number, minStarLogMass: number, giantTemperature: number, universeWidth: number, universeDistance: number, lambdaU: number, lambdaB: number, lambdaV: number, foo: null}}
 */
stella.constants = {
    version: "001k",
    baseURL: "http://localhost:8888/dsg/stella.php",
    //  baseURL : "http://www.eeps.com/dsg/php/stella.php",

    bigG: 6.674e-08,           //      big G in cgs
    solarLuminosity: 3.9e33,   //      ergs per second
    solarMass: 1.989e33,       //  grams
    solarTemperature: 5800,    //  Kelvin
    astronomicalUnit: 1.5e13,  //  centimeters
    msPerDay: 86400000,        //  milliseconds per (Earth) day
    secPerYear: 86400 * 365.24,    //  seconds

    microdegreesPerArcSecond: 1000000 / 3600,    //  like it says
    nStars: 200,
    maxStarLogMass: 1.5,           //  30 solar masses
    minStarLogMass: -1.0,          //  0.1 solar masses
    giantTemperature: 3333,        //  Kelvin

    //  for now, the universe is a spherical sector,
    //   a frustum! width x width x distance, subtending an angle width degrees on a side.
    universeWidth: 5,              //  degrees, about 0.1 radians
    universeDistance: 100,          //  parsecs

    lambdaU: 364 * 1.0e-07,      //  for photometry. cm
    lambdaB: 442 * 1.0e-07,
    lambdaV: 540 * 1.0e-07,

    //  Constants for how long things take in game time. Currently in years.

    timeRequired: {
        changePointing: 0.03,
        saveSpectrum: 0.04,
        //   makeLabSpectrum : 0.03,
        changeResultType: 0.01,
        saveResult: 0.03,
        savePositionFromDoubleclick: 0.01
    },

    cReticleColor : "green"
};

//      utilities

/**
 * Time passes
 * @param iMS
 */
stella.elapse = function (iMS) {
    //var tMS = stella.model.now.getTime();     //  uncomment if we go back to dateTimes
    tMS += iMS;
    //stella.model.now.setTime( tMS );
};

/**
 * Compute the distance between two locations
 * @param iL1
 * @param iL2
 * @returns {number}
 */
stella.distance = function (iL1, iL2) {
    return Math.sqrt((iL1.x - iL2.x) * (iL1.x - iL2.x) + (iL1.y - iL2.y) * (iL1.y - iL2.y) + (iL1.z - iL2.z) * (iL1.z - iL2.z));
};

/**
 * Compute apparent maginitude
 * @param iAbs      Absolute magnitude
 * @param iDistance Distance in parsecs
 * @returns {number}
 */
stella.apparentMagnitude = function (iAbs, iDistance) {
    return iAbs + 5 - 5 * Math.log10(iDistance);
};

/**
 * Get the coordinates of a planet at a date
 * @param iObject
 * @param iDate
 * @returns {{x: number, y: number, z: number}}
 */
stella.orbitXYZ = function (iObject, iDate) {

    var dt = iDate - stella.model.epoch;    //  time since epoch in ms.
    var motionPerSecond = 360.0 / iObject.period;       //  degrees per second
    var meanLongitude = 0;      //  todo: fix this

    //  convert orbital elements from degrees to radians...

    var o = iObject.bigOmega * Math.PI / 180.0;     //
    var p = iObject.w * Math.PI / 180.0;    //  anomaly of the periastron (start of the orbit)
    var i = iObject.i * Math.PI / 180.0;    //  inclination to the plane


    var meanAnomaly = motionPerSecond * dt / 1000 + meanLongitude - p;

    var v = meanAnomaly;        //  true anomaly (number of degrees around the orbit from the periastron todo: fix this

    v *= Math.PI / 180.0;   //  convert true anomaly to radians

    var r = iObject.a * (1 - iObject.e * iObject.e) / (1 + iObject.e * Math.cos(v));    //  distance in AU

    var relevantAngle = v + p - o;
    var X = r * ( Math.cos(o) * Math.cos(relevantAngle) - Math.sin(o) * Math.sin(relevantAngle) * Math.cos(i) );
    var Y = r * ( Math.sin(o) * Math.cos(relevantAngle) + Math.cos(o) * Math.sin(relevantAngle) * Math.cos(i) );
    var Z = r * Math.sin(relevantAngle) * Math.sin(i);

    return {x: X, y: Y, z: Z};
};

/**
 * Proper motion in degrees per year
 *
 * @param iSpeed        transverse speed in km/sec
 * @param iDistance     distance in parsecs
 * @returns {number}    degrees per year
 */
stella.pmFromSpeedAndDistance = function (iSpeed, iDistance) {
    var oPM = 0;

    var tRadialDistanceInCM = iDistance * stella.constants.parsec;
    var tTransverseSpeedInCMperSEC = iSpeed * 1.0e05;
    var tTransverseDistancePerYear = tTransverseSpeedInCMperSEC * stella.constants.secPerYear;  //  in CM

    oPM = (180 / Math.PI) * (tTransverseDistancePerYear / tRadialDistanceInCM );

    return oPM;
};
