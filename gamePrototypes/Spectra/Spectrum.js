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
 */

/* global $ */

var Spectrum = function() {
    this.lines = [];
    this.hasEmissionLines = true;
    this.hasAbsorptionLines = false;
    this.hasBlackbody = false;
    this.blackbodyTemperature = 0;

};

Spectrum.prototype.addLine = function( iLine ) {
    this.lines.push( iLine );
};

Spectrum.prototype.intensityBetween = function( iMin, iMax ) {
    var oIntensity = 0;

    //  add the intensity for all emission lines
    if (this.hasEmissionLines) {
        oIntensity = this.lines.reduce(function (total, iLine) {
            return total + iLine.intensityBetween(iMin, iMax);
        }, 0);
    }

    if (this.hasBlackbody) {
        oIntensity += this.normalizedBlackbodyAtWavelength( (iMin + iMax) / 2.0 );
    }

    return oIntensity;
};

Spectrum.prototype.channelize = function( iMin, iMax, iNBins )    {
    var oChannels= [];
    var tLambda = iMin;        //  bottom of the interval
    var tResolution = (iMax - iMin) / iNBins;

    while (tLambda < iMax ) {
        var tI = this.intensityBetween( tLambda, tLambda + tResolution);
        oChannels.push(
            {
                intensity : tI,
                min : tLambda,
                max : tLambda + tResolution
            }
        );
        tLambda += tResolution;
    }

    var dText = "";
    dText = oChannels.reduce(function(dText, c) {
        dText += c.intensity.toFixed(2) + " ";
        return dText;
    });
    $("#debugText").text( dText );
    return oChannels;
};

Spectrum.prototype.normalizedBlackbodyAtWavelength = function (iLambda) {
    var tLambda =  (iLambda * 1.0e-7);      //  convert nm to cm

    var tMaxLambda = Spectrum.constants.wien / this.blackbodyTemperature;       //   in cm. Wien's displacement law.
    var tMaxIntensity = Spectrum.blackbodyIntensityAt(tMaxLambda, this.blackbodyTemperature);  //  this will be our denominator

    var tIntense = Spectrum.blackbodyIntensityAt(tLambda, this.blackbodyTemperature);
    return 100.0 *  tIntense / tMaxIntensity;
};


Spectrum.blackbodyIntensityAt = function( iLambda, iTemp ) {
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
    wien        : 0.2898        //  b in cgs

};