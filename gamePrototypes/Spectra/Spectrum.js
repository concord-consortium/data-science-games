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


var Spectrum = function() {
    this.lines = [];
};

Spectrum.prototype.addLine = function( iLine ) {
    this.lines.push( iLine );
};

Spectrum.prototype.intensityBetween = function( iMin, iMax ) {
    var oIntensity = this.lines.reduce( function(total, iLine) {
        return total + iLine.intensityBetween( iMin, iMax );
    }, 0);

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
        )
        tLambda += tResolution;
    }

    return oChannels;
};