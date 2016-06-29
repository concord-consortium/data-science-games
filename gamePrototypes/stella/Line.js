/**
 * Created by tim on 5/23/16.


 ==========================================================================
 Line.js in data-science-games.

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

/* global spec, Spectrum */

var Line = function (iLambda, iWidth, iStrength) {
    this.lambda = iLambda;
    this.width = iWidth;
    this.strength = iStrength;
};

Line.prototype.intensityBetween = function (iMin, iMax, iSpeedAway) {
    var oIntensity = 0;

    var tEffectiveLambda = this.lambda * Spectrum.constants.light / ( Spectrum.constants.light - iSpeedAway);

    if (iMin <= tEffectiveLambda && iMax >= tEffectiveLambda) {
        oIntensity = 1.0;
    } else {
        var fMin = Line.normalProfile( iMin, tEffectiveLambda, this.width);
        var fMax = Line.normalProfile( iMax, tEffectiveLambda, this.width);

        oIntensity = (fMin + fMax) / 2.0;
        //  oIntensity = (Line.intensity(iMax - tEffectiveLambda, this.width) + Line.intensity(iMin - tEffectiveLambda, this.width))/2.0;   //  triangular
        //  oIntensity = Line.cdf(iMax - tEffectiveLambda, this.width) - Line.cdf(iMin - tEffectiveLambda, this.width);
    }
    oIntensity *= this.strength;

    return oIntensity;
};

Line.intensity = function( iRelativeLambda, iWidth ) {
    if ( iRelativeLambda < -iWidth ) {
        return 0;
    } else if ( iRelativeLambda < 0 ) {
        return 1 + iRelativeLambda / iWidth;
    } else if ( iRelativeLambda < iWidth ) {
        return 1 - iRelativeLambda / iWidth;
    } else {
        return 0;
    }
};

Line.cdf = function (iArg, iWidth) {

    if (iArg < -iWidth) {
        return 0;
    } else if (iArg < 0) {
        return ((iArg + iWidth) * (iArg + iWidth)) / iWidth / iWidth / 2.0;
    } else if (iArg < iWidth) {
        return 1 - ((iArg - iWidth) * (iArg - iWidth)) / iWidth / iWidth / 2.0;
    } else {
        return 1;
    }
};

/**
 * returns a value for the Normal distribution at a particular point,
 * but scaled so that the value at the mean is 1 (so the area is NOT 1)
 *
 * @param x         the x-value
 * @param mean      mean of the N
 * @param sd        standard deviation parameter
 */
Line.normalProfile = function(x, mean, sd) {
    var tDenom = 1;     //   = Math.sqrt( 2 * sd * sd * Math.PI );
    var tExponent = -( x - mean) * (x - mean) / 2 / sd / sd;

    return Math.exp( tExponent ) / tDenom;
};

