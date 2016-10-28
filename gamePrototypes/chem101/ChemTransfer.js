/**
 * Created by tim on 10/26/16.


 ==========================================================================
 ChemTransfer.js in gamePrototypes.

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


ChemTransfer = function( iFromZone, iToZone, iAmount ) {
    this.fromZone = (iToZone !== iFromZone) ? iFromZone : null;
    this.toZone = iToZone;
    this.transferAmount = iAmount;
    this.units = "mL";
    this.when = null;
    this.caseID = null;
    this.hasCaseID = false;

    this.what = null;

    if (this.fromZone) {
        this.what = "fluid";
    } else {
        this.what = chem101.manager.theSourceName;      //      pour from the store
        var tChemical = Chemistry.chemicals[this.what];
        if (tChemical.type === "solid") {
            this.units = "g";
        }
    }

};

ChemTransfer.prototype.setCaseID = function( iCaseID ) {
    this.caseID = iCaseID;
    this.hasCaseID = true;
    this.updateAmountBy( 0 );
};

ChemTransfer.prototype.updateAmountBy = function(iAmount) {
    this.transferAmount += iAmount;

    if (this.hasCaseID) {
        chem101.connector.updateTransfer( );    //  update the emitted transfer
    }
};

ChemTransfer.prototype.getValues = function(  ) {
    var ov = {};

    ov.when = new Date();
    ov.units = this.units;
    ov.amount = this.transferAmount * 1000;     //  make it in milliliters
    ov.from = this.fromZone ? this.fromZone.pieceOfEquipment.model.label : "";
    ov.what = this.what;
    if (this.toZone) {
        ov.to = this.toZone.pieceOfEquipment.model.label;
    }

    return ov;
};

