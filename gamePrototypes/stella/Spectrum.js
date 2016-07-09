/**
 * Created by tim on 5/23/16.


 ==========================================================================
 Spectrum.js in data-science-games.

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
 The filters are selected so that the mean wavelengths
 of response functions are 364 nm for U, 442 nm for B, 540 nm for V.
 The zero point of the B−V and U−B color indices were defined such as
 to be about zero for A0 main sequence stars not affected by interstellar reddening.

 https://en.wikipedia.org/wiki/UBV_photometric_system

 We will set type A0 to be 10,000 K, and use that for our zero point for each of the photometric bands.
 For simplicity, we'll compute it using the blackbody ONLY,
 */

/* global $, console, Line */

var Spectrum = function() {
    this.lines = [];
    this.hasEmissionLines = true;
    this.hasAbsorptionLines = false;
    this.hasBlackbody = false;
    this.blackbodyTemperature = 0;
    this.speedAway = 0;      //  cm/sec. c is Spectrum.constants.light.
    this.source = { brightness : 100 };
};

Spectrum.prototype.addLine = function( iLine ) {
    this.lines.push( iLine );
};


Spectrum.prototype.addLinesFrom = function( iSpectrum, iAmp ) {
    iSpectrum.lines.forEach( function(iLine) {
        var tLine = new Line(iLine.lambda, iLine.width, iLine.strength * iAmp / 100, iLine.what);
        this.lines.push( tLine );
    }.bind(this));
};

Spectrum.prototype.intensityBetween = function( iMin, iMax ) {
    var oIntensity = 0;

    //  add the intensity for all emission lines
    if (this.hasEmissionLines) {
        oIntensity = this.lines.reduce(function (total, iLine) {
            return total + iLine.intensityBetween(iMin, iMax, this.speedAway);
        }.bind(this), 0);
    }

    //  add any blackbody
    if (this.hasBlackbody) {
        oIntensity += this.normalizedBlackbodyAtWavelength( (iMin + iMax) / 2.0, this.speedAway );
    }

    //  todo: change this so that stars can have emission and absorption. Later.

    //  reduce using the intensity for all absorption lines
    if (this.hasAbsorptionLines) {
        var tReduction = this.lines.reduce(function (total, iLine) {
            return total + iLine.intensityBetween(iMin, iMax, this.speedAway);
        }.bind(this), 0);
        oIntensity *= (100.0 - tReduction) / 100.0;
        if (oIntensity < 0) { oIntensity = 0; }
    }

    return oIntensity;
};

Spectrum.prototype.channelize = function( iMin, iMax, iNBins )    {
    var oChannels= [];
    var tLambda = iMin;        //  bottom of the interval
    var tResolution = (iMax - iMin) / iNBins;

    for ( var i = 0; i < iNBins; i++ ) {
        tLambda = iMin + i * tResolution;
        var tI = this.intensityBetween( tLambda, tLambda + tResolution) * this.source.brightness / 100;
        oChannels.push(
            {
                intensity : tI,
                min : tLambda,
                max : tLambda + tResolution
            }
        );
    }

    var dText = "";
    dText = oChannels.reduce(function(dText, c) {
        dText += c.intensity.toFixed(2) + " ";
        return dText;
    });
    $("#debugText").text( dText );

    return oChannels;
};

Spectrum.prototype.normalizedBlackbodyAtWavelength = function (iLambda, iSpeedAway) {   //  todo: doppler shift BB
    var tLambda =  (iLambda * 1.0e-7);      //  convert nm to cm

    var tMaxLambda = Spectrum.constants.wien / this.blackbodyTemperature;       //   in cm. Wien's displacement law.
    if (tMaxLambda < Spectrum.constants.visibleMin * 1.0e-07) {
        tMaxLambda = Spectrum.constants.visibleMin * 1.0e-07;
    }
    if (tMaxLambda > Spectrum.constants.visibleMax * 1.0e-07) {
        tMaxLambda = Spectrum.constants.visibleMax * 1.0e-07;
    }
    var tMaxIntensity = Spectrum.relativeBlackbodyIntensityAt(tMaxLambda, this.blackbodyTemperature);  //  this will be our denominator

    var tIntense = Spectrum.relativeBlackbodyIntensityAt(tLambda, this.blackbodyTemperature);
    return 100.0 *  tIntense / tMaxIntensity;
};


Spectrum.relativeBlackbodyIntensityAt = function (iLambda, iTemp) {
    var kT = Spectrum.constants.boltzmann * iTemp;
    var hNu = Spectrum.constants.planck * Spectrum.constants.light / iLambda;
    var csq = Spectrum.constants.light * Spectrum.constants.light;

    var tDenom =  (Math.exp( hNu / kT)) - 1.0;

    return (2 * csq * Spectrum.constants.planck / (Math.pow(iLambda, 5))) * (1.0 / tDenom);
};

Spectrum.constants = {
    planck      : 6.626e-27,  //  h in cgs
    light       : 2.997e10,   //  c in cgs
    boltzmann   : 1.38e-16,      //  k in cgs
    wien        : 0.2898,        //  b in cgs

    visibleMin : 350,       //  nm
    visibleMax : 700        //  nm

};

Spectrum.linePresenceCoefficient = function( iSpecies, iLogTemp ) {

    //      adapted from http://skyserver.sdss.org/dr1/en/proj/advanced/spectraltypes/lines.asp

    if (!stella.options.tempAffectsWhichLinesArePresent) {
        return 1.0;
    }

    var tTemp = Math.pow(10, iLogTemp);
    var oCoeff = 1.0;           //  this will go from 0 to 1

    switch( iSpecies ) {
        case "H":
            oCoeff = lineStrengthInterpolator(tTemp, 5000, 7500, 10000, 25000);
            break;

        case "HeI":
            oCoeff = lineStrengthInterpolator(tTemp, 9000, 10000, 28000, 40000);
            console.log("Helium check: T = " + tTemp + " coeff = " + oCoeff);
            break;

        case "CaII":
            oCoeff = lineStrengthInterpolator(tTemp, 4000, 5000, 7500, 10000);
            break;

        case "FeI":
            oCoeff = lineStrengthInterpolator(tTemp, 2500, 3500, 5000, 7500);
            break;

        case "NaI":
            oCoeff = lineStrengthInterpolator(tTemp, 0, 0, 4000, 6000);
            break;
    }

    return oCoeff;

    function lineStrengthInterpolator(iTemp, iMin0, iMinTop, iMaxTop, iMax0) {
        var out = 0;


        if (iTemp > iMax0) {
            out = 0;
        } else if (iTemp > iMaxTop) {
            out = 0.5;
        } else if (iTemp > iMinTop) {
            out = 1.0;
        } else if (iTemp > iMin0) {
            out = 0.5;
        } else {
            out = 0.0;
        }

        return out;
    }
};