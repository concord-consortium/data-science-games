/**
 * Created by tim on 5/23/16.


 ==========================================================================
 SpectrumView.js in data-science-games.

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

SpectrumView = function( iPaper ) {
    this.paper = iPaper;        //      snap.svg paper
    this.lambdaMin = spec.constants.visibleMin;
    this.lambdaMax = spec.constants.visibleMax;
    this.nBins = 100;
    this.spectrum = null;
    this.channels = null;
    this.displayType = SpectrumView.displayTypes[0];
    this.background = this.paper.rect(0, 0, this.paper.node.clientWidth, this.paper.node.clientHeight).attr({
        fill : "yellow"
    });
};

SpectrumView.prototype.setSpectrum = function( iSpectrum ) {
    this.spectrum = iSpectrum;
    this.channels = this.spectrum.channelize(this.lambdaMin, this.lambdaMax, this.nBins);    //  array of objects { intensity, min, max}
    this.display();
};

SpectrumView.prototype.display = function( ) {

    var tNChannels = this.channels.length;
    if (tNChannels > 1) {
        this.paper.clear();
        var tChannelWidthOnDisplay = this.paper.node.clientWidth / (tNChannels);
        switch (this.displayType) {

            case "photo":
                var tLeft = 0;
                this.channels.forEach( function(ch){
                    var tBaseColor = 255 * ch.intensity / 100;
                    if (tBaseColor > 255) tBaseColor = 255;
                    var tColor = Snap.rgb( tBaseColor, tBaseColor, tBaseColor);
                    this.paper.rect( tLeft, 0, tChannelWidthOnDisplay, this.paper.node.clientHeight).attr({
                            fill : tColor
                    });
                    tLeft += tChannelWidthOnDisplay;
                }.bind(this));
                break;

            case "rail":
                break;

            default:
                break;
        }
    } else {
        alert("Error finding channels in SpectrumView");
    }
};

SpectrumView.prototype.invalidate = function() {
    this.paper.clear();
    this.paper.text(20,15,"press the button to get the spectrum");
};

SpectrumView.displayTypes = ["photo", "rail"];