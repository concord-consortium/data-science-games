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

/* global Snap, Spectrum, stella, ElementalSpectra, TEEUtils */

var Star = function( iFrustum, iMotion, iLogAge ) {
    this.caseID = -1;

    var t1 = Math.random();
    var t2 = (1 - t1) * (1 - t1);
    this.logMass = (stella.constants.maxStarLogMass - stella.constants.minStarLogMass) * t2 - 1;
    this.logMainSequenceRadius = (2/3) * this.logMass;
    this.logRadius = this.logMainSequenceRadius;
    this.logLuminosity = 3.5 * this.logMass;
    this.logMainSequenceTemperature = 3.76 + 13/24 * this.logMass;  //  3.76 = log10(5800), the nominal solar temperature
    this.logTemperature = this.logMainSequenceTemperature;      //  start on main sequence
    this.logLifetime = 10 + this.logMass - this.logLuminosity;
    this.logAge = null;
    this.myGiantIndex = 0;

    var tDistanceCubed = Math.pow(iFrustum.L1,3) +  Math.random() * (Math.pow(iFrustum.L2,3) - Math.pow(iFrustum.L1,3));

    this.where = {
        x : iFrustum.xMin + Math.random() * iFrustum.width,
        y : iFrustum.yMin + Math.random() * iFrustum.width,
        z : Math.pow(tDistanceCubed, 0.333)
    };

    this.pm = {
        x : stella.pmFromSpeedAndDistance( TEEUtils.randomNormal( iMotion.x, iMotion.sx), this.where.z),
        y : stella.pmFromSpeedAndDistance( TEEUtils.randomNormal( iMotion.y, iMotion.sy), this.where.z),
        r : TEEUtils.randomNormal( iMotion.r, iMotion.sr )
    };

    this.id = 42;       //  placeholder. Gets set elsewhere.
    this.logAge = iLogAge;

    this.evolve( );
    //  this.spectrum = this.setUpSpectrum();
    this.doPhotometry();
};

Star.prototype.evolve = function(  ) {
    var tAge = Math.pow(10, this.logAge);           //  current age
    this.myGiantIndex = this.computeGiantIndex( tAge );

    if (this.myGiantIndex <= 0) {
        this.myGiantIndex = 0;                 //      ON MAIN SEQUENCE. No evolution.
    } else if (this.myGiantIndex <= 1) {        //  GIANT phase
        /*
         Our model is, at this point, that as you age, you will maintain your luminosity,
         but your temperature will decline, linearly, to about 3000K
         (stella.constants.giantTemperature)
         */

        var tMSTemp = Math.pow(10, this.logMainSequenceTemperature);
        var tCurrentTemp = tMSTemp - (this.myGiantIndex * (tMSTemp - stella.constants.giantTemperature));
        tCurrentTemp -= 500.0 * Math.random();      //  some variety in giant temperatures.
        this.logTemperature = Math.log10(tCurrentTemp);
        this.logRadius = this.logMainSequenceRadius + 2.0 * (this.logMainSequenceTemperature - this.logTemperature);
        //  R goes like T^2 for constant luminosity (L goes as R^2T^4)
    } else {            //          WHITE DWARF or...
        var tRan = Math.random();
        this.logTemperature = 4 + tRan * 0.5;       //  hot! 10000 to 30000

        var tTempInSols = Math.pow(10, this.logTemperature) / stella.constants.solarTemperature;

        //  todo: THIS is where we would have decided how much mass is left, and if we'll make a neutron star or BH.

        this.logRadius = -2.0 - 0.3 * this.logMass;      //  see http://burro.cwru.edu/academics/Astr221/LifeCycle/WDmassrad.html
        //  now we know temperature and radius, we can compute luminosity:
        this.logLuminosity = 2 * this.logRadius + 4 * Math.log10( tTempInSols );
    }
};

Star.prototype.positionAtTime = function( iTime ) {

    //  todo: put in parallax

    var iDT = iTime - stella.model.epoch;
    var oWhere = {
        x : this.where.x + iDT * this.pm.x,
        y : this.where.y + iDT * this.pm.y,
        z : this.where.z + iDT * this.pm.r * 1.0e05 / stella.constants.parsec
    };

    return oWhere;
};

Star.apparentMagnitude = function( iAbsoluteMagnitude, iDistance ) {
    return iAbsoluteMagnitude + 5 * (Math.log10( iDistance ) - 1);
};

Star.prototype.setUpSpectrum = function() {
    var tSpectrum = new Spectrum();
    tSpectrum.hasAbsorptionLines = true;
    tSpectrum.hasEmissionLines = false;
    tSpectrum.hasBlackbody = true;
    tSpectrum.blackbodyTemperature = Math.pow(10, this.logTemperature);

    tSpectrum.addLinesFrom(ElementalSpectra.H, 50 * Spectrum.linePresenceCoefficient("H", this.logTemperature));
    tSpectrum.addLinesFrom(ElementalSpectra.HeI, 30 * Spectrum.linePresenceCoefficient("HeI", this.logTemperature));
    tSpectrum.addLinesFrom(ElementalSpectra.NaI, 40 * Spectrum.linePresenceCoefficient("NaI", this.logTemperature));
    tSpectrum.addLinesFrom(ElementalSpectra.CaII, 30 * Spectrum.linePresenceCoefficient("CaII", this.logTemperature));
    tSpectrum.addLinesFrom(ElementalSpectra.FeI, 30 * Spectrum.linePresenceCoefficient("FeI", this.logTemperature));

    tSpectrum.speedAway = this.pm.r * 1.0e05;    //      cm/sec, right??
    tSpectrum.source.id = this.id;

    return tSpectrum;
};

Star.prototype.computeGiantIndex = function(iAge ) {
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
        result = 1000;    //  past nova!
    }

    return result;
};

/**
 * UBV photometry using blackbody.
 * Assume A0 = 10000K, and all its absolute magnites are zero.
 */
Star.prototype.doPhotometry = function() {

    this.mAbs = 4.85 - 2.5 * this.logLuminosity;
    this.mApp = Star.apparentMagnitude( this.mAbs, this.where.z );

    var solarU = 5.61;  //  solar mags from http://www.ucolick.org/~cnaw/sun.html
    var solarB = 5.48;
    var solarV = 4.83;
    var solarR = 4.42;
    var solarI = 4.08;

    var tSolar = 5800;

    var tTemp = Math.pow(10, this.logTemperature);
    var tRadius = Math.pow(10, this.logRadius);

    var L_solarU = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaU, tSolar);
    var L_solarB = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaB, tSolar);
    var L_solarV = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaV, tSolar);
    var L_star_U = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaU, tTemp) * tRadius * tRadius;
    var L_star_B = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaB, tTemp) * tRadius * tRadius;
    var L_star_V = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaV, tTemp) * tRadius * tRadius;

    this.uAbs = solarU - 2.5 * Math.log10( L_star_U / L_solarU);
    this.bAbs = solarB - 2.5 * Math.log10( L_star_B / L_solarB);
    this.vAbs = solarV - 2.5 * Math.log10( L_star_V / L_solarV);

};

Star.prototype.dataValues = function() {
    var out = {
        x : this.where.x.toFixed(3),
        y : this.where.y.toFixed(3),
        m : this.mApp.toFixed(2),
        id : this.id,
        U : Star.apparentMagnitude( this.uAbs, this.where.z ).toFixed(2),
        B : Star.apparentMagnitude( this.bAbs, this.where.z ).toFixed(2),
        V : Star.apparentMagnitude( this.vAbs, this.where.z ).toFixed(2)
    };

    return out;
};

Star.prototype.toString = function() {
    var out = Math.pow(10, this.logMass).toFixed(2);
    out += ", " + Math.round(Math.pow(10, this.logMainSequenceTemperature));
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

    var tOpacity = 1.0;
    var tRadius = stella.constants.universeWidth / stella.skyView.magnification / 150;
    var tGray = 17;
    var tMagnitudeElbow, tMagnitudeLimit;

    switch (stella.skyView.magnification) {
        case 1:
            tMagnitudeElbow = 0.0;
            tMagnitudeLimit = 11.0;
            break;
        case 10:
            tMagnitudeElbow = 6.0;
            tMagnitudeLimit = 14.0;
            break;
        case 100:
            tMagnitudeElbow = 12.0;
            tMagnitudeLimit = 17.0;
            break;
        default:
            tMagnitudeElbow = 0.0;
            tMagnitudeLimit = 7.0;
            break;
    }

    if (iStar.mApp < tMagnitudeElbow) {
        tRadius *= tMagnitudeElbow - iStar.mApp;
    } else if (iStar.mApp < tMagnitudeLimit) {
        tOpacity = (tMagnitudeLimit - iStar.mApp) / (tMagnitudeLimit - tMagnitudeElbow);
    } else {
        tOpacity = 0.0;
    }

    var tColor = Snap.rgb( tGray * 15, tGray * 15, tGray * 15 );
    iPaper.circle( iStar.where.x, stella.constants.universeWidth - iStar.where.y, tRadius).attr({
        fill : tColor,
        fillOpacity : tOpacity
    });
};