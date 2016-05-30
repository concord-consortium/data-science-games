/**
 * Created by tim on 5/23/16.


 ==========================================================================
 spec.manager.js in data-science-games.

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

/* global spec, console, $, Snap, SpectrumView */

spec.manager = {

    labSpectrumView : null,
    skySpectrumView : null,

    initialize : function() {
        spec.model.initialize();
        this.labSpectrumView = new SpectrumView(Snap(document.getElementById("spectrumDisplay")));
        this.skySpectrumView = new SpectrumView(Snap(document.getElementById("skySpectrumDisplay")));
        this.newStellarSpectrum();
        this.spectrumParametersChanged();
    },

    spectrumParametersChanged : function() {
        this.setSpectrogramWavelengths();       //  read min and max from boxes in the UI
        this.updateLabSpectrum();
        this.skySpectrumView.displaySpectrum( spec.model.skySpectrum );
        this.labSpectrumView.displaySpectrum( spec.model.labSpectrum );
        spec.ui.fixUI();
    },

    recordSpectrum : function( iWhich ) {
        if (iWhich === "lab") {
            var tSpecName = spec.model.labSpectrum.hasEmissionLines ?
                spec.model.dischargeTube :
            "BB " + spec.model.labBlackbodyTemperature + "K";

            if (this.labSpectrumView.channels.length > 0) {
                spec.connect.emitSpectrum(this.labSpectrumView.channels, tSpecName);
            }
        } else {
            if (this.skySpectrumView.channels.length > 0) {
                spec.connect.emitSpectrum(this.skySpectrumView.channels, "sky");
            }
        }
    },


    updateLabSpectrum : function() {
        //  first, figure out the Lab spectrum
        var tSpectrumType = $('input[name=sourceType]:checked').val();
        spec.model.dischargeTube = $("#dischargeTubeMenu").val();

        if (tSpectrumType === "discharge") {
            spec.model.installDischargeTube(  );
        } else {
            spec.model.installBlackbody(  );
        }
    },


    setSpectrogramWavelengths : function() {
        var tLMin = Number($("#lambdaMin").val());
        var tLMax = Number($("#lambdaMax").val());

        this.labSpectrumView.lambdaMin = tLMin;
        this.labSpectrumView.lambdaMax = tLMax;
        this.skySpectrumView.lambdaMin = tLMin;
        this.skySpectrumView.lambdaMax = tLMax;
    },

    newStellarSpectrum : function() {
        var tMysterySpeed = Math.random() * 5.0e6;
        var tSpec = spec.model.createStellarSpectrum( spec.model.skyObjectBlackbodyTemperature, tMysterySpeed );
        spec.model.skySpectrum = tSpec;
        this.skySpectrumView.displaySpectrum( spec.model.skySpectrum );     //  set and display
    },

    specDoCommand : function() {

    }
};