/**
 * Created by tim on 9/26/16.


 ==========================================================================
 NodeView.js in make-a-tree.

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


NodeView = function (iNode, iMyTreeView) {
    var tPad = baum.constants.treeObjectPadding;
    this.kNodeHeight = 60;

    this.myNode = iNode;
    this.myTreeView = iMyTreeView;
    this.paper = new Snap(100, this.kNodeHeight); //  .attr({viewBox : "-50, 0, 100, 60"});        //  todo: fix this size!
    this.bg1 = this.paper.rect(0, 0, 10, 10);
    this.bg2 = this.paper.rect(0, 0, 10, 10);
    this.bg3 = this.paper.rect(0, 0, 10, 10);
    this.valueInLabel = this.paper.text(tPad, 15, "");
    this.countLabel = this.paper.text(tPad, 34, "");
    this.attOutLabel = this.paper.text(tPad, 53, "");

    //  handlers

    this.paper.mousedown(function (iEvent) {
        this.myTreeView.myPanel.lastMouseDownNodeView = this;
    }.bind(this));

    this.paper.mouseup(function (iEvent) {
        var tMouseDownPlace = this.myTreeView.myPanel.lastMouseDownNodeView;

        if (tMouseDownPlace instanceof CorralAttView) {
            console.log("Up in (any) nodeView");
            this.myNode.installData( tMouseDownPlace.data );
        }

        if (tMouseDownPlace instanceof NodeView && this.myNode.nodeType === Tree.constants.yLeafNode) {
            console.log("Up in leafy nodeView");
            this.myNode.installData( tMouseDownPlace.myNode.data );
        }

        if ((tMouseDownPlace instanceof NodeView) && this.myNode.nodeType === Tree.constants.yFullNode) {
            console.log("Up in full nodeView");
            this.myNode.installData( tMouseDownPlace.myNode.data );
        }


        if (tMouseDownPlace instanceof  DiagnosisView) { //} && this.myNode.nodeType === Tree.constants.yLeafNode) {
            this.myNode.makeStopNode( tMouseDownPlace.data );
        }

    }.bind(this));

};

NodeView.prototype.calculateNodeWidth = function( ) {
    return this.calculateNodeViewSize().width;
};

NodeView.prototype.calculateNodeViewSize = function () {
    var tPad = baum.constants.treeObjectPadding;
    var valueInLabelW =  this.valueInLabel.getBBox().width + 2 * tPad;
    var countLabelW =  this.countLabel.getBBox().width + 2 * tPad;
    var attOutLabelW =  this.attOutLabel.getBBox().width + 2 * tPad;

    var tWidth = (valueInLabelW > countLabelW) ?
        (valueInLabelW > attOutLabelW) ? valueInLabelW : attOutLabelW :
        (countLabelW > attOutLabelW) ? countLabelW : attOutLabelW;
    var tOneLabelHeight = this.valueInLabel.getBBox().height;

    return {width : tWidth, height : this.kNodeHeight};
};

NodeView.prototype.redrawMe = function ( ) {

    var tPad = baum.constants.treeObjectPadding;
    var tBackColor1 = "gray", tBackColor3 = "lightgray";
    var tValueInText, tAttOutText, tCountText;
    var tArgs = {};
    var tValueInColor = "white"; tCountTextColor = "#633"; tAttOutColor = "white";

    tCountText =  this.myNode.numerator + "/" + this.myNode.denominator;
    tValueInText = this.myNode.valueInLabel;

    if (this.myNode.parent.data) {
        tBackColor1 = this.myNode.parent.data.attribute.attributeColor;
    } else {
        tBackColor1 = baum.dependentVariable.attributeColor;
    }

    switch (this.myNode.nodeType) {
        case Tree.constants.yLeafNode:
            tAttOutText = "drop " + baum.constants.targetCode ;
            break;
        case Tree.constants.yFullNode:
            tBackColor3 = this.myNode.data.attribute.attributeColor;
            tAttOutText = this.myNode.data.attribute.attributeName;
            break;
        case Tree.constants.yStopNode:
            tBackColor3 = this.myNode.data.sign === baum.constants.diagnosisPlus ? "green" : "red";
            tAttOutText = "stop! (" + this.myNode.data.sign + ")";
            break;
    }
    var tXPos = 0;  //  -this.calculateNodeViewSize().width/2 - tPad;

    this.valueInLabel.attr({text : tValueInText, x : tXPos + tPad, fill : tValueInColor});    //  must do this before calculating width
    this.countLabel.attr({text : tCountText,  x : tXPos + tPad, fill : tCountTextColor});    //  must do this before calculating width
    this.attOutLabel.attr({text : tAttOutText,  x : tXPos + tPad, fill : tAttOutColor});

    tArgs.height = this.kNodeHeight / 3;
    tArgs.width = this.calculateNodeViewSize().width;
    tArgs.x = tXPos;
    tArgs.y = 0;

    this.bg1.attr(tArgs).attr({fill : tBackColor1 });
    tArgs.y += tArgs.height;
    this.bg2.attr(tArgs).attr({fill : "white" });
    tArgs.y += tArgs.height;
    this.bg3.attr(tArgs).attr({fill : tBackColor3 });

};

NodeView.prototype.moveTo = function( iWhere ) {    //  {x : jkjklj, y : uyet }
  this.paper.attr( iWhere );
};

