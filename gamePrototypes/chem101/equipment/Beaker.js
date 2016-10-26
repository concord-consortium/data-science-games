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


/*  global Event */

Beaker = function ( iGlasswareSpec, iLabel ) {
    this.eventDispatcher = new EventDispatcher();
    this.label = iLabel;
    this.glasswareSpec = iGlasswareSpec;

    this.volume = this.glasswareSpec.volume;       //  L
    this.diameter = this.glasswareSpec.diameter;      //  cm
    this.height = this.glasswareSpec.height;        //  cm

    this.contents = new Contents();     //  object describing contents

    this.eventDispatcher.addEventListener(
        "contentsChanged", chem101.manager.updateUI, chem101.manager
    );

};

Beaker.prototype.doChemistryInContainer = function () {
    console.log("  ");
    console.log("Pre-Chem: " + this.label + " contains " + this.contents.shortString());
    this.contents.update(this.label);
    this.eventDispatcher.dispatchEvent(new Event("contentsChanged"));

    console.log("Post-Chem: " + this.label + " contains " + this.contents.shortString());
};

Beaker.prototype.setContainerName = function (iName) {
    this.label = iName;
    this.contents.setMyContainer(this); //  todo: move this. Bad side effect possiblities/
};

Beaker.prototype.emptyThisContainer = function () {
    this.contents = new Contents();
    this.contents.setMyContainer(this);
    this.eventDispatcher.dispatchEvent(new Event("contentsChanged"));
};

Beaker.prototype.addDropToContainer = function () {    //  todo: change in favor of something with a titrant. Use a Buret.
    var tContents = new Contents();
    tContents.addWater(1.0 / chem101.constants.dropsPerML);
    this.addContentsToContainer(tContents);

};

Beaker.prototype.removeSolutionFromContainer = function (iAmount) {
    var tRemoved = this.contents.removeSolutionFromContainer(iAmount);
    this.doChemistryInContainer();
    return tRemoved;        //  the "Contents" that have been removed
};

Beaker.prototype.addContentsToContainer = function (iContents) {
    this.contents.addAdditionalContents(iContents);
    this.doChemistryInContainer();
};


/**
 * height of the fluid in this thing's contents
 * @returns {number}    in CENTIMETERS
 */
Beaker.prototype.fluidHeight = function () {
    var tArea = Math.PI * this.diameter / 2 * this.diameter / 2;
    var tVol = this.contents.fluidVolume() * 1000;  //  fluidVolume is in liters. We need ccs here.
    var tDepth = tVol / tArea;

    return tDepth;
};

Beaker.prototype.solidHeight = function () {
    var tArea = Math.PI * this.diameter / 2 * this.diameter / 2;
    var tVol = this.contents.precipitateInfo().volume;  //  this volume is in cc already.
    var tDepth = tVol / tArea;

    return tDepth;

};


/*
 ------------------      BeakerView      -----------------
 */


BeakerView = function (b) {
    this.zone = null;     //  the superview
    this.model = b;         //  the beaker itself
    this.model.eventDispatcher.addEventListener(
        "contentsChanged", this.updateEquipmentView, this
    );

    this.myWidth = b.diameter * chem101.constants.pixelsPerCentimeter;
    this.myHeight = b.height * chem101.constants.pixelsPerCentimeter;
    this.myCornerRadius = 10;       //  todo: fix this. Should be in the glassware spec

    this.paper = new Snap(this.myWidth, this.myHeight);
    this.origin = {
        x: this.myWidth / 2,
        y: this.myHeight
    };

    var tInsideGradient = this.paper.gradient("l(0, 0, 1, 0)#cde-#fff-#cde-#9bd");
    this.outside = this.colorBeakerShape(0, chem101.constants.glassColor);
    this.inside = this.colorBeakerShape(chem101.constants.glassThickness, tInsideGradient); //  chem101.constants.glassInterior);
    this.solid = this.colorBeakerShape(chem101.constants.glassThickness, this.model.contents.solidColor());
    this.fluid = this.colorBeakerShape(chem101.constants.glassThickness, this.model.contents.fluidColor());
    this.fluidMask = this.paper.rect(0, 0, 0, 0);
    this.solidMask = null;

    this.label = this.paper.text(
        chem101.constants.glassThickness + 2,
        10, this.model.label).attr({fill: "#246", fontFamily: "Monaco", fontSize: 9});
    this.label.node.setAttribute("class", "noSelect");  //  this is that css thing


    //  the click shape is ALMOST on top
    //  todo: if working with the zones works, remove these handlers.

    this.paper.mouseup(function (iEvent) {
        //chem101.manager.theFlowAndDragThing.alterFlow("destination", this);
        console.log("    >>>>    mouse UP in the beaker view itself");
    }.bind(this));

    this.paper.mousedown(function (iEvent) {
        //chem101.manager.theFlowAndDragThing.alterFlow("source", this);
    }.bind(this));

    //  next is the graduation

    this.theGraduation = new Graduation( this );

    this.paper.append(this.theGraduation);

    //  the "empty" icon is on top

    this.empty = this.paper.image(chem101.constants.emptyIconURI, this.myWidth - 16, 2);

    this.empty.click(function (iEvent) {
        this.emptyThisContainer();
    }.bind(this.model));
};


BeakerView.prototype.mLToYCoordinate = function (iML) {
    var tArea = Math.PI * this.model.diameter / 2 * this.model.diameter / 2;
    var tVol = iML;
    var tDepth = tVol / tArea;
    return this.myHeight - (tDepth * chem101.constants.pixelsPerCentimeter) - chem101.constants.glassThickness;
};


BeakerView.prototype.updateEquipmentView = function () {
    var tFluidDepth = this.model.fluidHeight() * chem101.constants.pixelsPerCentimeter;
    var tSolidDepth = this.model.solidHeight() * chem101.constants.pixelsPerCentimeter;

    this.solid.attr({fill: this.model.contents.solidColor()});
    this.fluid.animate({
        fill: this.model.contents.fluidColor(),
        opacity: (this.model.contents.opaqueFluids ? 1 : 0.4)
    }, 2000);

    this.fluidMask.animate({
        x: 0,
        y: this.mLToYCoordinate(this.model.contents.fluidVolume() * 1000) - tSolidDepth,
        width: this.myWidth, height: tFluidDepth,
        fill: "#fff"
    }, 250);
    this.fluid.attr({mask: this.fluidMask});

    this.solidMask = this.paper.rect(
        0, this.myHeight - chem101.constants.glassThickness - tSolidDepth,
        this.myWidth, tSolidDepth
    ).attr({fill: "#fff"});         //  need #fff for the mask to work for everything
    this.solid.attr({mask: this.solidMask});
};

BeakerView.prototype.colorBeakerShape = function (iInset, iColor) {

    var tMask = this.paper.rect(
        0, 0,
        this.myWidth, this.myHeight).attr({fill: "#fff"});
    var tShape =
        this.paper.rect(
            iInset, -this.myCornerRadius,
            this.myWidth - 2 * iInset, this.myHeight - iInset + this.myCornerRadius,
            this.myCornerRadius - iInset, this.myCornerRadius - iInset
        ).attr({
            fill: iColor,
            mask: tMask
        });

    return tShape;
};

