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

/**
 * A Spectrum is basically an array of Lines with additional flags and parameters.
 * @constructor
 */
var Spectrum = function() {
    this.lines = [];
    this.hasEmissionLines = true;
    this.hasAbsorptionLines = false;
    this.hasBlackbody = false;
    this.blackbodyTemperature = 0;
    this.speedAway = 0;      //  cm/sec. c is Spectrum.constants.light.
    this.source = { brightness : 100 };
};

/**
 * Ass a single Line to this Spectrum
 * @param iLine the Line to add
 */
Spectrum.prototype.addLine = function( iLine ) {
    this.lines.push( iLine );
};

/**
 * Add all the lines from a Spectrum to this one
 * @param iSpectrum     source
 * @param iAmp          at what amplitude? These amplitudes are percentages, and multiply the Line's inherent strength.
 */
Spectrum.prototype.addLinesFrom = function( iSpectrum, iAmp ) {
    iSpectrum.lines.forEach( function(iLine) {
        var tLine = new Line(iLine.lambda, iLine.width, iLine.strength * iAmp / 100, iLine.what);
        this.lines.push( tLine );
    }.bind(this));
};

/**
 * What is the total intensity between these two wavelengths
 * @param iMin
 * @param iMax
 * @returns {number}
 */
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

/**
 * Divide the wavelength interval to be displayed into bins,
 * and make an array that gives the intensity in each bin.
 * @param iMin      min wavelength to be displayed
 * @param iMax      max
 * @param iNBins    how many bins?
 * @returns {Array} Array of channel objects: { intensity (0-100), min (wavelength), max }
 */
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
    //  $("#debugText").text( dText );

    return oChannels;
};

/**
 * Calculate the blackbody intensity at a wavelength,
 * set so that the maximum value in the visible interval is 100.
 * @param iLambda
 * @param iSpeedAway
 * @returns {number}
 */
Spectrum.prototype.normalizedBlackbodyAtWavelength = function (iLambda, iSpeedAway) {   //  todo: doppler shift BB
    var tLambda =  (iLambda * 1.0e-7);      //  convert nm to cm

    //  compute the wavelength where the function is a maximum
    var tMaxLambda = Spectrum.constants.wien / this.blackbodyTemperature;       //   in cm. Wien's displacement law.
    if (tMaxLambda < Spectrum.constants.visibleMin * 1.0e-07) {
        tMaxLambda = Spectrum.constants.visibleMin * 1.0e-07;   //  ah, the peak is in UV, so we pick 350 nm.
    }
    if (tMaxLambda > Spectrum.constants.visibleMax * 1.0e-07) {
        tMaxLambda = Spectrum.constants.visibleMax * 1.0e-07;   //  peak is in IR, so we usee 700 nm.
    }
    var tMaxIntensity = Spectrum.relativeBlackbodyIntensityAt(tMaxLambda, this.blackbodyTemperature);  //  this will be our denominator

    var tIntense = Spectrum.relativeBlackbodyIntensityAt(tLambda, this.blackbodyTemperature);
    return 100.0 *  tIntense / tMaxIntensity;
};

/**
 * Raw blackbody intensity calcuation.
 * @param iLambda       wavelength (cm)
 * @param iTemp         temperature (K)
 * @returns {number}
 */
Spectrum.relativeBlackbodyIntensityAt = function (iLambda, iTemp) {
    var kT = Spectrum.constants.boltzmann * iTemp;
    var hNu = Spectrum.constants.planck * Spectrum.constants.light / iLambda;
    var csq = Spectrum.constants.light * Spectrum.constants.light;

    var tDenom =  (Math.exp( hNu / kT)) - 1.0;

    return (2 * csq * Spectrum.constants.planck / (Math.pow(iLambda, 5))) * (1.0 / tDenom);
};

/**
 * Miscellaneous spectral constants
 * @type {{planck: number, light: number, boltzmann: number, wien: number, visibleMin: number, visibleMax: number}}
 */
Spectrum.constants = {
    planck      : 6.626e-27,  //  h in cgs
    light       : 2.997e10,   //  c in cgs
    boltzmann   : 1.38e-16,      //  k in cgs
    wien        : 0.2898,        //  b in cgs

    visibleMin : 350,       //  nm
    visibleMax : 700        //  nm

};

/**
 * This routine calculates how much of the spectrum of a given "species" will appear.
 * For example, cool stars show sodium lines easily, but in hot lines, Sodium is ionized.
 *
 * @param iSpecies
 * @param iLogTemp
 * @returns {number}
 */
Spectrum.linePresenceCoefficient = function( iSpecies, iLogTemp ) {

    //      adapted from http://skyserver.sdss.org/dr1/en/proj/advanced/spectraltypes/lines.asp

    if (!stella.options.tempAffectsWhichLinesArePresent) {
        return 1.0;
    }

    var tTemp = Math.pow(10, iLogTemp);     //  actual temperature, not its log
    var oCoeff = 1.0;           //  this will go from 0 to 1

    switch( iSpecies ) {
        case "H":
            /*
            The basic idea is that we make a trapezoid: for Hydrogen, the coefficent is...
            0 under 5000K,
            linearly increasing to 1, from 5000 to 7000
            1 between 7500 and 10000,
            linearly decreasing (to zero) between 10000 and 25000
            0 above 25000
             */
            oCoeff = lineStrengthInterpolator(tTemp, 5000, 7500, 10000, 25000);
            break;

        case "HeI":     //  HeI means "neutal Helium." HeII is singly ionized; it's like H with more nucleus.
            oCoeff = lineStrengthInterpolator(tTemp, 9000, 10000, 28000, 40000);
            break;

        case "CaII":    //  CaII means "singly ionized," that is, it has one electron left in its outer shell.
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

    /**
     * Utility to compute the trapezoidal function described in Spectrum.linePresenceCoefficient().
     * @param iTemp     the temperature
     * @param iMin0     min temp for any response (zero below this value)
     * @param iMinTop   min temp for +1.0 response
     * @param iMaxTop   max temp for +1.0
     * @param iMax0     max temp for any response (zero above this value)
     * @returns {number}
     */
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