/**
 * Created by tim on 3/27/16.


 ==========================================================================
 steb.options.js in data-science-games.

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



steb.options = {
    backgroundCrud : true,
    delayReproduction : false,
    reducedMutation : false,
    flee : true,
    eldest : false,
    automatedPredator : false,

    useVisionParameters : false,
    predatorVisionType : null,

    redCoefficient : 1,
    greenCoefficient : 1,
    blueCoefficient : 1,

    /**
     * User changed the vision params on the panel.
     * Therefore find out what those chnages were,
     * and make the world reflect them!
     */
    predatorVisionChange : function() {
        this.setPredatorVisionParameters();
        steb.worldView.updateDisplayWithCurrentVisionParameters( );
    },

    /**
     * Set the underlying predator vision params based on the settings in the vision panel.
     */
    setPredatorVisionParameters : function() {
        this.useVisionParameters = document.getElementById("visionUseParameters").checked;
        if (!this.useVisionParameters ) steb.model.predatorVisionDenominator = 1;   //  avoids nasty zero divide :)

        this.predatorVisionType = $('input[name=predatorVisionType]:checked').val();

        var tRed = Number($("#visionRed").val());
        var tGreen = Number($("#visionGreen").val());
        var tBlue = Number($("#visionBlue").val());

        $("#redCoeffDisplay").text("red = " + steb.model.predatorVisionBWCoefficientVector[0]);
        $("#greenCoeffDisplay").text("green = " + steb.model.predatorVisionBWCoefficientVector[1]);
        $("#blueCoeffDisplay").text("blue = " + steb.model.predatorVisionBWCoefficientVector[2]);

        steb.model.predatorVisionColorVector = [ tRed, tGreen, tBlue ];
        //  steb.model.predatorVisionBWCoefficientVector is set directly by sliders. See steb.ui.js.initialize().

        console.log(
            "Options. Vision vector = " + JSON.stringify( steb.model.predatorVisionColorVector )
            + " BW vector = " + JSON.stringify(steb.model.predatorVisionBWCoefficientVector)
        );

        steb.model.stebbers.forEach(function(s) { s.updatePredatorVision(); });     //  update all stebbers to reflect new vision

    },

    /**
     *  Called whenever user clicks on an option. Sets the internal flags to match the UI.
     */
    optionChange : function() {
        this.backgroundCrud = document.getElementById("backgroundCrud").checked;
        this.delayReproduction = document.getElementById("delayReproduction").checked;
        this.reducedMutation = document.getElementById("reducedMutation").checked;
        this.flee = document.getElementById("flee").checked;
        this.eldest = document.getElementById("eldest").checked;
        this.automatedPredator = document.getElementById("automatedPredator").checked;

        steb.ui.fixUI();
    },
}