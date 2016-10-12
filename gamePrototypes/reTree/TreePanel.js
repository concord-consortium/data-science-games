/**
 * Created by tim on 9/26/16.


 ==========================================================================
 TreeView.js in reTree.

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


TreePanel = function (iManager, iDOMName) {
    this.manager = iManager;            //  the manager. The tree is the manager's tree
    this.myPanel = this;            //  we are the top of the hierarchy
    this.lastMouseDownNodeView = null;
    this.corralViews = [];
    this.dependentVariableView = null;      //      this is a CorralAttView, one of the corralViews[]
    this.positiveDiagnosisView = new DiagnosisView(reTree.constants.diagnosisPlus, this);
    this.negativeDiagnosisView = new DiagnosisView(reTree.constants.diagnosisMinus, this);


    this.paper = Snap(document.getElementById(iDOMName));
    this.w = Number(this.paper.attr("width"));
    this.h = Number(this.paper.attr("height"));

    this.background = this.paper.rect(0, 0, this.w, this.h).attr(
        {fill: reTree.constants.panelBackgroundColor}
    );
    this.corral = this.paper.rect(0, 0, this.w, reTree.constants.corralHeight).attr(
        {fill: reTree.constants.corralBackgroundColor}
    );
    this.equalsSignText = this.paper.text(0, 0, reTree.constants.leftArrowCode).attr({fill : "white", fontSize : 20});

    //  this.freshTreeView();
};

TreePanel.prototype.freshTreeView = function() {

    this.manager.tree = new Tree();
    this.manager.tree.rootNode.valueInLabel = this.manager.focusCategory;

    if (!this.dependentVariableView) {
        this.makeDependentVariable( this.corralViews[0]);
    }
    this.manager.tree.eventDispatcher.addEventListener(
        "changeTree",
        this.handleTreeChange,
        this
    );

    this.mainTreeView = new TreeView( this.manager.tree.rootNode, this);
    this.paper.append( this.mainTreeView.paper );           //  attach the "root" TreeView to draw it.
    this.redrawEntireTree();

};

TreePanel.prototype.makeDependentVariable = function( iCorralAttView ) {
    this.manager.makeDependentVariable( iCorralAttView.data.attribute);
    this.dependentVariableView = iCorralAttView;
    this.refreshCorral();
    this.freshTreeView();
};

TreePanel.prototype.addAttributeToCorral = function( iAttribute )  {
    var tCorralAttView = new CorralAttView( iAttribute, this);
    this.paper.append( tCorralAttView.paper );   //  subviews of paper, not corral itself
    this.corralViews.push(tCorralAttView);
};

TreePanel.prototype.refreshCorral = function( ) {
    var tPad = reTree.constants.treeObjectPadding;
    var x = tPad;

    //  display the dependent variable first

    this.dependentVariableView.moveTo(x, tPad);
    x += this.dependentVariableView.label.getBBox().width + 3 * tPad; //  should be able to set and use the paper's width

    this.equalsSignText.animate({x : x, y : tPad + 15}, 500);
    x += this.equalsSignText.getBBox().width + tPad;

    //  then loop over the others

    this.corralViews.forEach(function (corV) {
        if (corV !== this.dependentVariableView) {      //  exvcept for the dependent one
            corV.moveTo(x, tPad);
            x += corV.label.getBBox().width + 3 * tPad; //  should be able to set and use the paper's width
        }
    }.bind(this));

    x = this.w - tPad - reTree.constants.diagWidth;
    this.paper.append(this.negativeDiagnosisView.paper);
    this.negativeDiagnosisView.moveTo(x, tPad);
    x -= (tPad + reTree.constants.diagWidth);
    this.paper.append(this.positiveDiagnosisView.paper);
    this.positiveDiagnosisView.moveTo(x, tPad);
};

/**
 * Event handler: the model has made a change to the tree.
 * @param iEvent
 */
TreePanel.prototype.handleTreeChange = function (iEvent) {
    console.log("handleTreeChange");
    this.redrawEntireTree();
};

TreePanel.prototype.setLastMouseDownNodeView = function( iCorralView ) {
    if (iCorralView !== this.dependentVariableView) {
        this.lastMouseDownNodeView = iCorralView;
    }
};

TreePanel.prototype.redrawEntireTree = function () {
    var tPad = reTree.constants.treeObjectPadding;
    var tViewWidth = this.w - 2 * tPad;
    var tViewHeight = this.h - 2 * tPad - reTree.constants.corralHeight;

    this.mainTreeView.redrawEntireTree({
        x : tPad,
        y : reTree.constants.corralHeight + tPad,
        width: tViewWidth,
        height: tViewHeight
    });

    reTree.displayResults( reTree.tree.resultString());
};