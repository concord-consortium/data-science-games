/**
 * Created by tim on 6/24/16.


 ==========================================================================
 stella.ui.js in data-science-games.

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

/* global $, stella, SpectrumView, Snap  */

stella.ui = {


    fixUI : function() {

        this.shortStatusField.html(stella.manager.playing ? "game in progress" : "no game");

        //  correct title for new/abort game button
        this.newGameButton.html( stella.manager.playing ? "abort game" : "new game");

        //  focusStar label
        var focusStarText = stella.strings.notPointingText;
        if (stella.manager.focusStar) {
            focusStarText = stella.manager.focusStar.infoText();
        }
        this.starInfoTextField.text( focusStarText );

        //  spectra labels

        if (this.skySpectrumView.spectrum) {
            this.skySpectrumLabel.text(this.skySpectrumView.toString());
        } else {
            this.skySpectrumLabel.text(stella.strings.noSkySpectrum);
        }
        if (this.labSpectrumView.spectrum) {
            this.labSpectrumLabel.text(this.labSpectrumView.toString());
        } else {
            this.labSpectrumLabel.text(stella.strings.noLabSpectrum);
        }

    },


    pointingChanged : function() {
        var tText = this.pointAtStarInputField.val();
        var tStar = stella.model.starFromTextID( tText );
        stella.manager.pointAtStar( tStar );
        this.fixUI();
    },


    initialize : function() {

        this.newGameButton = $("#newGameButton");
        this.starInfoTextField = $("#starInfo");
        this.shortStatusField = $("#shortStatus");
        this.pointAtStarInputField = $("#pointAtStar");

        this.labSpectrumView = new SpectrumView(Snap(document.getElementById("labSpectrumDisplay")));
        this.skySpectrumView = new SpectrumView(Snap(document.getElementById("skySpectrumDisplay")));
        this.labSpectrumLabel = $("#labSpectrumLabel");
        this.skySpectrumLabel = $("#skySpectrumLabel");


        this.gainSlider = $('#labSpectrographGainSlider');
        this.labTempSlider = $('#labTempSlider');

        this.gainSlider.slider( {
                min : 1,
                max : 10,
                values : 1,
                step : 1,
                slide : function(e, ui) {
                    stella.ui.labSpectrumView.gain = Number( ui.value );
                    $('#gainDisplay').text(stella.ui.labSpectrumView.gain);
                    stella.manager.spectrumParametersChanged();
                }
            }
        );

        this.labTempSlider.slider( {
                min : 1000,
                max : 10000,
                values : [5500],
                step : 100,
                slide : function(e, ui) {
                    stella.model.labBlackbodyTemperature = Number( ui.value );
                    $('#labTempDisplay').text(stella.model.labBlackbodyTemperature);
                    stella.manager.spectrumParametersChanged();
                }
            }
        );

    }
};

