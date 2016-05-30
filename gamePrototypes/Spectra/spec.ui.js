/**
 * Created by tim on 5/24/16.


 ==========================================================================
 spec.ui.js in data-science-games.

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

/* global $, spec */

spec.ui = {

    gainSlider : null,

    fixUI : function() {
        var tRangeLabelText = "<b>Spectrum</b> wavelength range " +
            spec.manager.skySpectrumView.lambdaMin +
            "-" + spec.manager.skySpectrumView.lambdaMax + " nm."
        $("#skySpectrumWavelengthRangeLabel").html(tRangeLabelText);
    },

    initialize : function() {

        this.gainSlider = $('#labSpectrographGainSlider');
        this.labTempSlider = $('#labTempSlider');
        this.skyTempSlider = $('#skyObjectBlackbodyTempSlider');

        this.gainSlider.slider( {
                min : 1,
                max : 10,
                values : 1,
                step : 1,
                slide : function(e, ui) {
                    spec.manager.labSpectrumView.gain = Number( ui.value );
                    $('#gainDisplay').text(spec.manager.labSpectrumView.gain);
                    spec.manager.spectrumParametersChanged();
                }
            }
        );

        this.labTempSlider.slider( {
                min : 1000,
                max : 10000,
                values : [5500],
                step : 100,
                slide : function(e, ui) {
                    spec.model.labBlackbodyTemperature = Number( ui.value );
                    $('#labTempDisplay').text(spec.model.labBlackbodyTemperature);
                    spec.manager.spectrumParametersChanged();
                }
            }
        );

        this.skyTempSlider.slider( {
                min : 1000,
                max : 10000,
                values : [5500],
                step : 100,
                slide : function(e, ui) {
                    spec.model.skyObjectBlackbodyTemperature = Number( ui.value );
                    $('#skyObjectBlackbodyTempDisplay').text(spec.model.skyObjectBlackbodyTemperature);
                    spec.manager.spectrumParametersChanged();
                }
            }
        );

    }
};



/*

 */