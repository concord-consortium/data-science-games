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

/* global Snap, Spectrum, stella, ElementalSpectra */

var Star = function( iFrustum ) {
    /*
    this.where = { x : 0, y : 0, z : 0 };               //  initially at the origin
    this.absoluteMagnitude = {U : 5, B : 5, V : 5};     //  in three color bands
    this.mass = 0.97 * stella.constants.solarMass;        //   mass of eta cas
    */


    var x = Math.random();
    var y = (1 - x) * (1 - x);
    this.logMass = (stella.constants.maxStarLogMass - stella.constants.minStarLogMass) * y - 1;
    this.logLuminosity = 3.5 * this.logMass;
    this.logTemperature = 3.76 + 13/24 * this.logMass;  //  3.76 = log10(5800), the nominal solar temperature
    this.logLifetime = 10 + this.logMass - this.logLuminosity;

    this.where = {
        x : Math.random() * iFrustum.width,
        y : Math.random() * iFrustum.width,
        z : Math.pow(Math.random(), 0.333) * iFrustum.height
    };

    this.mAbs = 4.85 - 2.5 * this.logLuminosity;
    this.mApp = this.mAbs + 5 * (Math.log10( this.where.z ) - 1);
    this.id = 42;

    this.setUpSpectrum();
};

Star.prototype.setUpSpectrum = function() {
    this.spectrum = new Spectrum();
    this.spectrum.hasAbsorptionLines = true;
    this.spectrum.hasEmissionLines = false;
    this.spectrum.hasBlackbody = true;
    this.spectrum.blackbodyTemperature = Math.pow(10, this.logTemperature);

    this.spectrum.addLinesFrom(ElementalSpectra.H, 50);
    this.spectrum.addLinesFrom(ElementalSpectra.He, 30);
    this.spectrum.addLinesFrom(ElementalSpectra.NaI, 40);
    this.spectrum.addLinesFrom(ElementalSpectra.CaII, 30);
    this.spectrum.addLinesFrom(ElementalSpectra.FeI, 30);
};

Star.prototype.giantIndex = function(iAge ) {
    var result = 0;
    var tTimeOnMS = Math.pow(10, this.logLifetime);
    var tTimeAcross = tTimeOnMS;  //  for now, the same time across as on MS
    var tTimeAsGiant = tTimeOnMS;  //  for now, the same time as giant as on MS

    if (iAge < tTimeOnMS)  {
        result = 0;
    } else if (iAge < tTimeOnMS + tTimeAcross) {
        result = (iAge - tTimeOnMS) / tTimeAcross;
    } else if (iAge < tTimeOnMS + tTimeAcross + tTimeAsGiant) {
        result = 1.0;
    } else {
        result = Math.MAX_VALUE;    //  past nova!
    }

    return result;
};

Star.prototype.dataValues = function() {
    var out = {
        x : this.where.x.toFixed(3),
        y : this.where.y.toFixed(3),
        m : this.mApp.toFixed(2),
        id : this.id
    };

    return out;
};

Star.prototype.toString = function() {
    var out = Math.pow(10, this.logMass).toFixed(2);
    out += ", " + Math.round(Math.pow(10, this.logTemperature));
    out += ", " + this.mAbs.toFixed(2);
    out += ", " + this.mApp.toFixed(2);
    out += ", " + Math.round(Math.pow(10, this.logLifetime - 6));
    out += ", " + this.where.x.toFixed(2) + ", " + this.where.y.toFixed(2) + ", " + this.where.z.toFixed(2);

    return out;
};

Star.prototype.infoText = function() {
    var out = this.id + " m = " +  this.mApp.toFixed(2);

    return out;
};

//      VIEW class

var StarView = function( iStar, iPaper ) {
    this.star = iStar;          //  view knows about the model

    var tRadius = stella.constants.universeWidth / 200;
    var tGray = 17;

    if (iStar.mApp < -1) {
        tRadius *= -iStar.mApp;
    } else {
        tGray -= iStar.mApp - (-1);
    }

    var tColor = Snap.rgb( tGray * 15, tGray * 15, tGray * 15 );
    iPaper.circle( iStar.where.x, iStar.where.y, tRadius).attr({ fill : tColor});
};