/**
 * Created by tim on 9/11/16.


 ==========================================================================
 Beaker.js in gamePrototypes.

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



Beaker = function() {
    this.eventDispatcher = new EventDispatcher();

    this.volume = 250;       //  mL
    this.diameter = 7;      //  cm
    this.height = 9.5;        //  cm

    this.contents = new Contents();     //  object describing contents
};

Beaker.prototype.addSolid = function( iGramsOfSolid, iSpecies ) {
    var tContents = new Contents();
    tContents.addGramsOfSolid( iGramsOfSolid, iSpecies);
    this.addContents( tContents );
};

Beaker.prototype.addFluid = function( iWhat, iAmount ) {
    var tContents = new Contents();
    tContents.addWater( iAmount );

    switch( iWhat ) {
        case "H2O":
            break;
        case "1M HCl":
            var tMoles = 1.0 * iAmount / 1000;
            tContents.addMolesOfSolute( tMoles, "Cl-" );
            tContents.addMolesOfSolute( tMoles, "H3O+" );
            break;
    }

    this.addContents( tContents );
};

Beaker.prototype.addDrop = function( ) {    //  todo: change in favor of something with a titrant. Use a Buret.
    var tContents = new Contents();
    tContents.addWater( 1.0 / chem101.constants.dropsPerML );
    this.addContents( tContents );

};

Beaker.prototype.addContents = function( iContents ) {
    this.contents.addAdditionalContents( iContents );

    this.eventDispatcher.dispatchEvent( new Event("contentsChanged"));
};


Beaker.prototype.fluidHeight = function() {
    var tArea = Math.PI * this.diameter/2 * this.diameter/2;
    var tVol = this.contents.fluidVolume();
    var tDepth = tVol / tArea;

    return tDepth;
};

Beaker.prototype.solidHeight = function() {
    var tArea = Math.PI * this.diameter/2 * this.diameter/2;
    var tVol = this.contents.precipitateInfo().volume;
    var tDepth = tVol / tArea;

    return tDepth;

}


/*
        ------------------      BeakerView      -----------------
 */


//  todo: revise so that every beaker shape is just a round-cornered rect, but masked!

BeakerView = function( b ) {
    this.model = b;         //  the beaker itself
    this.model.eventDispatcher.addEventListener(
        "contentsChanged", this.updateEquipmentView, this
    );

    this.myWidth = b.diameter * chem101.constants.pixelsPerCentimeter;
    this.myHeight = b.height * chem101.constants.pixelsPerCentimeter;
    this.myCornerRadius = 10;

    this.paper = new Snap( this.myWidth, this.myHeight );
    this.origin = {
        x: this.myWidth / 2,
        y: this.myHeight
    };

    var tShape;

    this.outside = this.colorBeakerShape(0, chem101.constants.glassColor);
    this.inside = this.colorBeakerShape(chem101.constants.glassThickness, chem101.constants.glassInterior);
    this.solid = this.colorBeakerShape(chem101.constants.glassThickness, this.model.contents.solidColor());
    this.fluid = this.colorBeakerShape(chem101.constants.glassThickness, this.model.contents.fluidColor());
    this.fluidMask = null;
    this.solidMask = null;
};

BeakerView.prototype.updateEquipmentView = function() {
    var tFluidDepth = this.model.fluidHeight() * chem101.constants.pixelsPerCentimeter;
    var tSolidDepth = this.model.solidHeight() * chem101.constants.pixelsPerCentimeter;

    this.fluidMask = this.paper.rect(
        0, this.myHeight - chem101.constants.glassThickness - tSolidDepth - tFluidDepth,
        this.myWidth, tFluidDepth
    ).attr({fill: "#fff"});
    this.fluid.attr({mask : this.fluidMask});

    this.solidMask = this.paper.rect(
        0, this.myHeight - chem101.constants.glassThickness - tSolidDepth,
        this.myWidth, tSolidDepth
    ).attr({fill: "#fff"});
    this.solid.attr({mask : this.solidMask});
};

BeakerView.prototype.colorBeakerShape = function( iInset, iColor ) {

    var tMask = this.paper.rect(
        0, 0,
        this.myWidth, this.myHeight).attr({fill:"#fff"});
    var tShape = this.paper.rect(
        iInset, -this.myCornerRadius,
        this.myWidth - 2 * iInset, this.myHeight - iInset + this.myCornerRadius,
        this.myCornerRadius - iInset, this.myCornerRadius - iInset
    ).attr({
        fill: iColor,
        mask : tMask
    });

    return tShape;
};