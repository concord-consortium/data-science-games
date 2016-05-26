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


spec.ui = {

    gainSlider : null,

    initialize : function() {

        this.gainSlider = $('#spectrographGainSlider');
        this.tempSlider = $('#blackbodyTempSlider');

        this.gainSlider.slider( {
                min : 1,
                max : 10,
                values : 1,
                step : 1,
                slide : function(e, ui) {
                    spec.model.spectrographGain = Number( ui.value );
                    $('#gainDisplay').text(spec.model.spectrographGain);
                    spec.manager.spectrumParametersChanged();
                }
            }
        );

        this.tempSlider.slider( {
                min : 1000,
                max : 10000,
                values : 5500,
                step : 500,
                slide : function(e, ui) {
                    spec.model.blackbodyTemperature = Number( ui.value );
                    $('#tempDisplay').text(spec.model.blackbodyTemperature);
                    spec.manager.spectrumParametersChanged();
                }
            }
        );

    }
};



/*

 */