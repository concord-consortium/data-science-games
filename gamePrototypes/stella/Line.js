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

var Line = function(iLambda, iWidth, iStrength) {
    this.lambda = iLambda;
    this.width = iWidth;
    this.strength = iStrength;
};

Line.prototype.intensityBetween = function( iMin, iMax, iSpeedAway ) {
    var oIntensity = 0;

    var tEffectiveLambda = this.lambda * Spectrum.constants.light / ( Spectrum.constants.light - iSpeedAway);

    if ( iMax > tEffectiveLambda - 3 * this.width && iMin < tEffectiveLambda + 3 * this.width) {
        /*
        At this point, we really need the integral from iMin to iMax of the intensity function, where the
         */
        //if (tEffectiveLambda > iMin && tEffectiveLambda <= iMax) {        //  simplest possible
            oIntensity = this.strength;
        //}
    }

    return oIntensity;
};