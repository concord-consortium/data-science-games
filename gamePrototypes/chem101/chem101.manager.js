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
    theFlowAndDragThing: null,      //      array of beakers, etc.
    chemLabView: null,
    theSourceName: "H2O",
    theSampleBeaker: null,
    theSampleNumber: 0,
    thePourControl: null,
    theCurrentTransfer: null,

    previous: null,
    pouring: false,

    getNewSample: function () {
        this.theSampleNumber += 1;
        this.theSampleBeaker = this.createEmptyBeaker(
            chem101.glasswareSpec.beaker250,
            "Sample " + this.theSampleNumber,
            "beakerRR"
        );

        //  make an acidic solution HCl, 100 mL, between molMin and molMax molarity.

        var molMin = .114;
        var molMax = 0.132;
        var tMolarity = molMin + Math.random() * (molMax - molMin);
        var tVolume = 0.1;      //  liters
        var tMoles = tMolarity * tVolume;
        var tContents = new Contents();
        tContents.addWater(tVolume);
        tContents.addMolesOfSolute("Cl-", tMoles);
        tContents.addMolesOfSolute("H3O+", tMoles);

        this.theSampleBeaker.addContentsToContainer(tContents);
    },

    createEmptyBeaker: function (iGlasswareSpec, iLabel, iDropZoneID) {
        var tSampleBeaker = new Beaker(iGlasswareSpec, iLabel);
        this.chemLabView.addBeaker(tSampleBeaker, iDropZoneID);
        //  this.theEquipment.containers.push( tSampleBeaker );
        return tSampleBeaker;
    },

    updateUI: function () {
        $("#beakerContents").html(this.theFlowAndDragThing.contentsHTML());    //  debugging info
    },

    /**
     * User has chosen something in the source menu, OR has changed the flow. This changes the button texts!
     */
    sourceChosen: function () {
        this.theSourceName = $("#chemSourceSelector").find('option:selected').val();

        this.adjustButtonTextAndDisability(25, this.theSourceName);
        this.adjustButtonTextAndDisability(5, this.theSourceName);
        this.adjustButtonTextAndDisability(1, this.theSourceName);
        this.adjustButtonTextAndDisability("drop", this.theSourceName);

    },

    adjustButtonTextAndDisability: function (iAmount, iWhat) {

        //  What container (view)s are we using?
        var tFromZone = this.theFlowAndDragThing.sourceDropZone || this.theFlowAndDragThing.destinationDropZone
        var tToZone = this.theFlowAndDragThing.destinationDropZone;

        //  fix the alteration text label

        var tAlterationText = "";

        var tElementName = "#addSubstance_" + iAmount;

        if (iAmount > 0 && iWhat == "Hin") {
            $(tElementName).hide();
        } else {
            $(tElementName).show();
        }

        var listedInChemicals = !(Chemistry.chemicals[iWhat] === undefined);

        var tUnits = (listedInChemicals && Chemistry.chemicals[iWhat].type === "solid") ? "g" : "mL";

        var tButtonText = "";

        if (tToZone) {
            if (tFromZone) {
                if (tToZone === tFromZone) {    //  same. fill from bank.
                    tAlterationText += "Add " + iWhat + " to " + tToZone.labelText();
                } else {     //  move from place to place
                    tAlterationText = "Move solution from " + tFromZone.labelText() + " to " + tToZone.labelText();
                    tUnits = "mL";  //  all beaker-to-beaker flows are in mL
                }
            } else {    //  no source. Fill from bank
                tAlterationText += "Add " + iWhat + " to " + tToZone.labelText();
            }
        } else if (tFromZone) {    //  no destination? DRAIN.
            tAlterationText += "Drain from " + tFromZone.labelText();
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

        if (iAmount === 'drop') iAmount = .001 / chem101.constants.dropsPerML;

        //  What container (view)s are we using?
        var tFromZone = this.theFlowAndDragThing.sourceDropZone;    //      null if from bank
        var tToZone = this.theFlowAndDragThing.destinationDropZone;

        var tContentsToBeAdded = new Contents();

        if (tToZone) {
            if (tFromZone) {
                if (tToZone === tFromZone) {
                    //  mouse down AND up in the same area means "add"
                    //  just add substance from the bank
                    tContentsToBeAdded.addSubstance(this.theSourceName, iAmount);
                } else {
                    //  both exist but are not the same. Move from "from" to "to"
                    tContentsToBeAdded = tFromZone.pieceOfEquipment.model.removeSolutionFromContainer(iAmount);
                }
            } else {
                //  there is no source. So just fill from the bank.
                tContentsToBeAdded.addSubstance(this.theSourceName, iAmount);
            }
            //  since there is a destination, add the new contents
            tToZone.pieceOfEquipment.model.addContentsToContainer(tContentsToBeAdded);  //  the beaker (etc) to add to
        } else {
            if (tFromZone) {    //  drain
                tContentsToBeAdded = tFromZone.pieceOfEquipment.model.removeSolutionFromContainer(iAmount);
                //  but we discard them.
            }
        }

        //      process data for emission to CODAP

        var tActualAmount = iAmount;
        if (tFromZone && tToZone !== tFromZone) {
            var tActualAmount = tContentsToBeAdded.fluidVolume();
        }

        var tNeedNewTransfer = (
            tFromZone !== this.theCurrentTransfer.fromZone ||
            tToZone !== this.theCurrentTransfer.toZone ||
            chem101.manager.theSourceName !== this.theCurrentTransfer.what
        );

        if (tNeedNewTransfer) {
            this.theCurrentTransfer = new ChemTransfer(tFromZone, tToZone, tActualAmount);
            chem101.connector.emitTransfer(this.theCurrentTransfer);    //  emit the empty transfer
        } else {
            this.theCurrentTransfer.updateAmountBy(tActualAmount);    //  no need to update a new transfer
        }

        $("#debugText").html(this.describeContainerContents());

    },

    receivePour: function (iFlow) {
        var tAmount = iFlow * 0.1;
        chem101.manager.moveOrAddSubstanceToAContainer(tAmount);
    },

    /**
     * responds to CODAP notifications.
     */
    chem101DoCommand: function (iCommand, iCallback) {

        console.log("chem101DoCommand: ");
        console.log(iCommand);
    },

    describeContainerContents: function () {
        var o = "";

        for (var z in this.chemLabView.equipmentDropZones) {
            if (this.chemLabView.equipmentDropZones.hasOwnProperty(z)) {
                var tZone = this.chemLabView.equipmentDropZones[z];
                o += "<fieldset><legend>" + tZone.labelText() + "</legend>";
                o += tZone.describeContents();
                o += "</fieldset>";
            }
        }

        return o;
    },

    initialize: function () {
        this.thePourControl = new PourControl("pour", this.receivePour);
        this.theFlowAndDragThing = new DragConsequenceManager();
        this.chemLabView = new ChemLabSetupView("theChemLabSetupView");

        this.theCurrentTransfer = new ChemTransfer(null, null, 0);

        var tInitialBeaker = this.createEmptyBeaker(chem101.glasswareSpec.grad50, "G1", "beakerL");
        var tNextBeaker = this.createEmptyBeaker(chem101.glasswareSpec.beaker250, "Beaker 2", "beakerR");
        //  var tGrad10 = this.createEmptyBeaker( chem101.glasswareSpec.grad10, "G2", "beakerLL");

        this.getNewSample();
        this.sourceChosen();
    }
};