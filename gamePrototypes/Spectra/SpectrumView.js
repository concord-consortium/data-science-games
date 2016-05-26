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
/* global spec, Snap, alert */

var SpectrumView = function( iPaper ) {
    this.paper = iPaper;        //      snap.svg paper
    this.lambdaMin = spec.constants.visibleMin;
    this.lambdaMax = spec.constants.visibleMax;
    this.nBins = 100;
    this.spectrum = null;
    this.channels = [];
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
    if (tNChannels > 0) {
        this.paper.clear();
        var tChannelWidthOnDisplay = this.paper.node.clientWidth / (tNChannels);
        var tGraphHeight = this.paper.node.clientHeight;
        var tLeft;

        switch (this.displayType) {

            case "photo":
                tLeft = 0;
                this.channels.forEach( function(ch){
                    var tBaseIntensity = spec.model.spectrographGain  * ch.intensity / 100;     //  now in [0, 1]
                    if (tBaseIntensity > 1.0) { tBaseIntensity = 1.0; }

                    var tColor = SpectrumView.intensityAndWavelengthToRGB( tBaseIntensity , ch.min );
                    //  var tColor = Snap.rgb( tBaseIntensity * 255, tBaseIntensity * 255, tBaseIntensity * 255);
                    this.paper.rect( tLeft, 0, tChannelWidthOnDisplay, tGraphHeight).attr({
                            fill : tColor
                    });
                    tLeft += tChannelWidthOnDisplay;
                }.bind(this));
                break;

            case "rail":
                tLeft = 0;
                this.channels.forEach( function(ch){
                    var tBaseIntensity = spec.model.spectrographGain * ch.intensity / 100;  //  now it's [0,1]
                    if (tBaseIntensity > 1.0) { tBaseIntensity = 1.0; }

                    var tChannelHeight = tGraphHeight * tBaseIntensity;

                    var tColor = SpectrumView.intensityAndWavelengthToRGB( 1.00 , ch.min );
                    //  var tColor = Snap.rgb( tBaseIntensity, tBaseIntensity, tBaseIntensity);
                    this.paper.rect( tLeft, tGraphHeight - tChannelHeight, tChannelWidthOnDisplay, tChannelHeight).attr({
                        fill : tColor
                    });
                    tLeft += tChannelWidthOnDisplay;
                }.bind(this));
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

SpectrumView.intensityAndWavelengthToRGB = function(iGain, iLambdaNM ) {

    var Red, Green, Blue;

    if((iLambdaNM >= 380) && (iLambdaNM<440)){
        Red = -(iLambdaNM - 440) / (440 - 380);
        Green = 0.0;
        Blue = 1.0;
    } else if ((iLambdaNM >= 440) && (iLambdaNM<490)){
        Red = 0.0;
        Green = (iLambdaNM - 440) / (490 - 440);
        Blue = 1.0;
    } else if ((iLambdaNM >= 490) && (iLambdaNM<510)){
        Red = 0.0;
        Green = 1.0;
        Blue = -(iLambdaNM - 510) / (510 - 490);
    } else if ((iLambdaNM >= 510) && (iLambdaNM<580)){
        Red = (iLambdaNM - 510) / (580 - 510);
        Green = 1.0;
        Blue = 0.0;
    } else if ((iLambdaNM >= 580) && (iLambdaNM<645)){
        Red = 1.0;
        Green = -(iLambdaNM - 645) / (645 - 580);
        Blue = 0.0;
    } else if ((iLambdaNM >= 645) && (iLambdaNM<781)){
        Red = 1.0;
        Green = 0.0;
        Blue = 0.0;
    } else {
        Red = 0.0;
        Green = 0.0;
        Blue = 0.0;
    }

/*
    // Let the intensity fall off near the vision limits

    if((Wavelength >= 380) && (Wavelength<420)){
        factor = 0.3 + 0.7*(Wavelength - 380) / (420 - 380);
    }else if((Wavelength >= 420) && (Wavelength<701)){
        factor = 1.0;
    }else if((Wavelength >= 701) && (Wavelength<781)){
        factor = 0.3 + 0.7*(780 - Wavelength) / (780 - 700);
    }else{
        factor = 0.0;
    };
*/
    Red *= iGain;
    Green *= iGain;
    Blue *= iGain;

    return Snap.rgb( 255 * Red, 255 * Green, 255* Blue );
};