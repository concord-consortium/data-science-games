/**
 * Created by tim on 9/16/16.


 ==========================================================================
 chem101.manager.js in gamePrototypes.

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


chem101.manager = {
    theEquipment: null,      //      array of beakers, etc.
    theSourceName: "H2O",

    updateUI: function () {
        $("#beakerContents").html(this.theEquipment.contentsHTML());
    },

    /**
     * User has chosen something in the source menu, OR has changed the flow. This changes the button texts!
     */
    sourceChosen: function () {
        this.theSourceName = $("#chemSourceSelector").find('option:selected').val();

        this.adjustButtonText( 25, this.theSourceName );
        this.adjustButtonText( 5, this.theSourceName );
        this.adjustButtonText( 1, this.theSourceName );
        this.adjustButtonText( "drop", this.theSourceName );

    },

    adjustButtonText : function( iAmount, iWhat ) {

        //  What container (view)s are we using?
        var tFromView = this.theEquipment.sourceContainerView || this.theEquipment.destinationContainerView
        var tToView = this.theEquipment.destinationContainerView;

        //  fix the alteration text label

        var tAlterationText = "";

        var tElementName = "#addSubstance_" + iAmount;

        var listedInChemicals = !(Chemistry.chemicals[iWhat] === undefined);

        var tUnits = (listedInChemicals && Chemistry.chemicals[iWhat].type === "solid") ? "g" : "mL";

        var tButtonText =  "";

        if (tToView !== tFromView) {        //  flow form one to another
            tAlterationText = "Move solution from " + tFromView.model.label + " to " + tToView.model.label;
            tUnits = "mL";  //  all beaker-to-beaker flows are in mL
        } else if (tToView) {
            tAlterationText += "Add " + iWhat + " to " + tToView.model.label;
        }
        if (iAmount === "drop") {
            tButtonText = (tUnits === "g" ? "pinch" : "drop");
        } else {
            tButtonText = iAmount + tUnits;
        }
        $(tElementName).html(tButtonText);
        $("#alterationLabel").html(tAlterationText);

    },

    moveOrAddSubstanceToAContainer: function (iAmount) {

        if (iAmount === 'drop') iAmount = .001 / 12;

        //  What container (view)s are we using?
        var tFromView = this.theEquipment.sourceContainerView || this.theEquipment.destinationContainerView
        var tToView = this.theEquipment.destinationContainerView;

        if (!tToView) return;

        var tContentsToBeAdded = new Contents();

        if (tToView !== tFromView) {    //  move from one to another
            tContentsToBeAdded = tFromView.model.removeSolutionFromContainer( iAmount );

        } else if (tToView) {   //  just move in to the destination
            tContentsToBeAdded.addSubstance(this.theSourceName, iAmount);
        }

        tToView.model.addContentsToContainer( tContentsToBeAdded );  //  the beaker (etc) to add to
    },

    initialize: function () {
        this.theEquipment = new Equipment(this, "theChemLabSetupView");

        this.theEquipment.addBeaker("Beaker 1", 50);
        this.theEquipment.addBeaker("Beaker 2", 150);
        this.sourceChosen();
    }
};