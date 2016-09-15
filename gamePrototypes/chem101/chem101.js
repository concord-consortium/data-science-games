/**
 * Created by tim on 9/11/16.


 ==========================================================================
 chem101.js in gamePrototypes.

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


var chem101 = {

    theSetupView : null,
    theBeaker : null,
    theBeakerView : null,

    constants: {
        glassColor: "#445577",
        glassInterior: "#99aacc",
        glassThickness: 3,

        pixelsPerCentimeter : 10,

        dropsPerML : 12
    },

    updateUI : function( ) {
        var tBeakerContents = this.theBeaker.contents.toString();
        $("#beakerContents").html( tBeakerContents );
    },

    addSalt : function( iGrams ) {
        this.theBeaker.addSolid( 10, "NaCl" );
    },

    initialize : function( ) {

        Chemistry.initialize();

        this.theSetupView = new ChemSetupView( "theSetupView" );
        this.theBeaker  = new Beaker();
        this.theBeakerView = new BeakerView( this.theBeaker );
        this.theBeaker.eventDispatcher.addEventListener(
            "contentsChanged", this.updateUI, this
        );

        this.theSetupView.addEquipmentView( this.theBeakerView, 100, 20 );

        this.theBeaker.addFluid("H20", 0 );

    }


};