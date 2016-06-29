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

/* global ElementalSpectra */

var     stella = {};    //  top level global

stella.initialize = function() {
    ElementalSpectra.initialize();
    stella.ui.initialize();
};

stella.strings = {
    notPointingText : "not pointing at a particular star",
    noSkySpectrum : "point at a star to see its spectrum",
    noLabSpectrum : "set up equipment to see a lab spectrum",
};

stella.constants = {
    version : "000",
    bigG : 6.674e-08,           //      big G in cgs
    solarLuminosity : 3.9e33,   //      ergs per second
    solarMass : 1.989e33,       //  grams
    astronomicalUnit : 1.5e13,  //  centimeters
    parsec : 206265 * stella.astronomicalUnit,    //      centimeters
    msPerDay : 86400000,        //  milliseconds per (Earth) day

    nStars : 200,
    maxStarLogMass : 1.5,
    minStarLogMass : -1.0,

    //  for now, the universe is a spherical sector, width x width x distance, subtending an angle width degrees on a side.
    universeWidth : 5,              //  degrees
    universeDistance : 100,          //  parsecs

    lambdaU : 364 * 1.0e-07,      //  for photometry. cm
    lambdaB : 442 * 1.0e-07,
    lambdaV : 540 * 1.0e-07,

    foo : null
};

//      utilities


stella.elapse = function(iMS ) {
    var tMS = stella.model.now.getTime();
    tMS += iMS;
    stella.model.now.setTime( tMS );
};

/**
 * Compute the distance between two locations
 * @param iL1
 * @param iL2
 * @returns {number}
 */
stella.distance = function(iL1, iL2 ) {
    return Math.sqrt( (iL1.x-iL2.x) * (iL1.x-iL2.x) + (iL1.y-iL2.y) * (iL1.y-iL2.y) + (iL1.z - iL2.z) * (iL1.z - iL2.z));
};

/**
 * Compute apparent maginitude
 * @param iAbs      Absolute magnitude
 * @param iDistance Distance in parsecs
 * @returns {number}
 */
stella.apparentMagnitude = function(iAbs, iDistance ) {
    return iAbs + 5 - 5 * Math.log10( iDistance );
};

stella.xyz = function(iObject, iDate ) {

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

    return {x : X, y : Y, z : Z};
};