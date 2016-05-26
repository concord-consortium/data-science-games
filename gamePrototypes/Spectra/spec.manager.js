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

    mainSpectrumView : null,

    initialize : function() {
        spec.model.initialize();
        this.mainSpectrumView = new SpectrumView(Snap(document.getElementById("spectrumDisplay")));
    },

    spectrumParametersChanged : function() {
        this.updateSpectrum();
    },

    recordSpectrum : function() {
        var tSpecName = spec.model.testSpectrum.hasEmissionLines ?
            spec.model.dischargeTube :
            "BB " + spec.model.blackbodyTemperature + "K";

        if (this.mainSpectrumView.channels.length > 0) {
            spec.connect.emitSpectrum( tSpecName );
        }
    },


    updateSpectrum : function() {
        var tSpectrumType = $('input[name=sourceType]:checked').val();
        spec.model.dischargeTube = $("#dischargeTubeMenu").val();

        this.setSpectrumParams();

        if (tSpectrumType === "discharge") {
            spec.model.installDischargeTube(  );
        } else {
            spec.model.installBlackbody(  );
        }

        //  now install it in the view. The view will display it.

        this.mainSpectrumView.setSpectrum( spec.model.testSpectrum );
    },


    setSpectrumParams : function() {
        var tLMin = Number($("#lambdaMin").val());
        var tLMax = Number($("#lambdaMax").val());

        this.mainSpectrumView.lambdaMin = tLMin;
        this.mainSpectrumView.lambdaMax = tLMax;
    },

    specDoCommand : function() {

    }
};