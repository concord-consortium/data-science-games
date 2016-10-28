/**
 * Created by tim on 9/11/16.


 ==========================================================================
 ChemSetupView.js in gamePrototypes.

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


ChemLabSetupView = function (iDOMString, iModel) {

    this.equipmentModel = iModel;       //  this is a "DragConsequenceManager"
    this.myDOMElement = document.getElementById(iDOMString);
    this.paper = Snap(this.myDOMElement);
    this.myWidth = Number(this.paper.attr("width"));
    this.myHeight = Number(this.paper.attr("height"));
    this.equipmentDropZones = {};   //  object keyed by DOM id values

    this.backgroundRectangle = this.paper.rect(
        0, 0, this.myWidth, this.myHeight
    ).attr({fill: "#eed"});

    this.flowIndicator = this.paper.path("M 0 0 ").attr({fill: "orchid"});

    //  get the drop zones from the DOM (the html)
    //  the first two are class equipmentZoneMain

    var tEDZNodeList = document.querySelectorAll(".equipmentZone");
    var tEDZArray = Array.from(tEDZNodeList);   //  convert to actual array t=rather than NodeList

    //  install these drop zones.

    tEDZArray.forEach( function(z) {
        var tEDZ_Snap = new EquipmentDropZone(z, this);
        this.equipmentDropZones[z.id] = tEDZ_Snap;
        this.paper.append( tEDZ_Snap.paper );
    }.bind(this));



    this.paper.mouseup( function(iE) {
        //  this.updateFlowIndicator( );        //      debug commented out. Need to get back in!
    }.bind(this));
};

ChemLabSetupView.prototype.addBeaker = function(iBeaker, iDropZoneID ) {

    var tBeakerView = new BeakerView( iBeaker );
    this.equipmentDropZones[iDropZoneID].addEquipmentView( tBeakerView );

};

//  todo: see if this method is really necessary!

ChemLabSetupView.prototype.updateView = function () {

    for (var z in this.equipmentDropZones) {
        if (this.equipmentDropZones.hasOwnProperty(z)) {
            var tBeaker = this.equipmentDropZones[z].pieceOfEquipment
            if (tBeaker) tBeaker.updateEquipmentView();
        }
    }
};

ChemLabSetupView.prototype.updateFlowIndicator = function ( ) {

    var tFromZone = chem101.manager.theFlowAndDragThing.sourceDropZone;    //  || this.chem101.manager.theFlowAndDragThing.destinationDropZone;
    var tToZone = chem101.manager.theFlowAndDragThing.destinationDropZone;
    var tXFrom, tYFrom, tXTo, tYTo;
    var tPathString = "M 0 0";

    if (tFromZone) {
         tXFrom = Number(tFromZone.paper.attr("x")) + Number(tFromZone.paper.attr("width"))/2;
         tYFrom = Number(tFromZone.paper.attr("y")) + Number(tFromZone.paper.attr("height"))/2;
    }
    if (tToZone) {
        tXTo = Number(tToZone.paper.attr("x")) + Number(tToZone.paper.attr("width"))/2;
        tYTo = Number(tToZone.paper.attr("y")) + Number(tToZone.paper.attr("height"))/2;
    }

    if (tToZone) {
        if (tFromZone) {
            if (tToZone === tFromZone) {
                console.log("Flow is into " + tToZone.pieceOfEquipment.model.label);
                tPathString = ["M", tXTo - 20, tYTo - 70, "L", tXTo + 20, tYTo - 70, "L", tXTo, tYTo, "Z"].join(" ");
                this.flowIndicator.attr({path: tPathString});
            } else {
                console.log("Flow is from " + tFromZone.pieceOfEquipment.model.label + " to " + tToZone.pieceOfEquipment.model.label);
                tPathString = ["M", tXFrom, tYFrom - 20, "L", tXFrom, tYFrom + 20, "L", tXTo, tYTo, "Z"].join(" ");
                this.flowIndicator.attr({path: tPathString});
            }
        } else {    //  no from view, only to
            console.log("Flow is into " + tToZone.pieceOfEquipment.model.label);
            tPathString = ["M", tXTo - 20, tYTo - 70, "L", tXTo + 20, tYTo - 70, "L", tXTo, tYTo, "Z"].join(" ");
            this.flowIndicator.attr({path: tPathString});
        }
    } else {
        if (tFromZone) {    //  drain
            console.log("Draining " + tFromZone.pieceOfEquipment.model.label);
            tPathString = ["M", tXFrom - 20, tYFrom, "L", tXFrom + 20, tYFrom, "L", tXFrom, tYFrom - 70, "Z"].join(" ");
            this.flowIndicator.attr({path: tPathString});

        }
    }
};


EquipmentDropZone = function( iDOMElement, iParentLabView ) {
    this.wholeLabView = iParentLabView;
    this.paper = new Snap( iDOMElement );
    this.pieceOfEquipment = null;
    this.w = this.paper.attr("width");
    this.h = this.paper.attr("height");
    this.paper.rect(0, 0, this.w, this.h).attr({fill : "#bca", opacity : 0.2});
    this.domElement = iDOMElement;

    this.main = iDOMElement.id.indexOf("beaker") !== -1;    //  which are the main ones

    this.paper.mouseup( this.handleMouseUpInDropZone.bind(this) );
    this.paper.mousedown( this.handleMouseDownInDropZone.bind(this) );
    console.log(this.toString());
};

EquipmentDropZone.prototype.labelText = function() {
    var out;

    out = (this.pieceOfEquipment) ? this.pieceOfEquipment.model.label : "(empty)";

    return out;
};

EquipmentDropZone.prototype.addEquipmentView = function (iEquipView) {

    iEquipView.zone = this;     //  parent VIEW is this zone

    this.paper.append(
        iEquipView.paper.attr({
            x: this.w/2 - iEquipView.origin.x,
            y: this.h - 8 - iEquipView.origin.y     //  nb: reverse y-coords, put axis at bottom
        })
    );
    this.pieceOfEquipment = iEquipView;
    this.wholeLabView.updateView();
};

EquipmentDropZone.prototype.handleMouseUpInDropZone = function() {
    console.log("MOUSE UP in " + this.domElement.id);
    chem101.manager.theFlowAndDragThing.handleMouseAction(this, "destination");
};
EquipmentDropZone.prototype.handleMouseDownInDropZone = function() {
    console.log("MOUSE DOWN in " + this.domElement.id);
    chem101.manager.theFlowAndDragThing.handleMouseAction(this, "source");
};

EquipmentDropZone.prototype.describeContents = function() {
    var tContents = this.pieceOfEquipment.model.contents;
    return tContents.toString();
};

EquipmentDropZone.prototype.toString = function() {
    var o = "EDZ: ";
    o += this.main ? "+" : "-";
    o += this.domElement.id;

    return o;
}