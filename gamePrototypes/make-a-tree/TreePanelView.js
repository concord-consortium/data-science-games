/**
 * Created by tim on 9/26/16.


 ==========================================================================
 TreeView.js in make-a-tree.

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

/**
 * This is a view that contains ALL of the views of the maTree display.
 * The corral view, for example, is up at the top.
 *
 * @param iManager
 * @param iDOMName
 * @constructor
 */
TreePanelView = function (iManager, iDOMName) {
    this.manager = iManager;            //  the manager. The tree is the manager's tree
    this.myPanel = this;            //  we are the top of the hierarchy
    this.w = 200;
    this.h = 200;
    this.lastMouseDownNodeView = null;
    this.corralViews = [];
    this.dependentVariableView = null;      //      this is a CorralAttView, one of the corralViews[]
    this.positiveDiagnosisView = new DiagnosisView(maTree.constants.diagnosisPlus, this);
    this.negativeDiagnosisView = new DiagnosisView(maTree.constants.diagnosisMinus, this);

    this.paper = Snap(document.getElementById(iDOMName));
    this.corral = this.paper.rect(0, 0, 100, maTree.constants.corralHeight).attr(
        {fill: maTree.constants.corralBackgroundColor}
    );
    this.rootPaper = Snap( 100, 100 );
    this.paper.append(this.rootPaper);
    this.treeBackground = this.rootPaper.rect(
        0, 0, 100, 100).attr({fill: maTree.constants.panelBackgroundColor});

    this.equalsSignText = this.paper.text(0, 0, maTree.constants.leftArrowCode).attr({fill: "white", fontSize: 20});

    this.drawTreePanelViewSetup();
};

TreePanelView.prototype.drawTreePanelViewSetup = function() {
    this.paper.attr({
        width: window.innerWidth,
        height: window.innerHeight
    });

    this.w = Number(this.paper.attr("width"));
    this.h = Number(this.paper.attr("height"));

    //  the corral contains the attribute names (CorralViews)
    //  this is just drawn, not created as a paper

    this.corral.attr({ width : this.w });
    this.rootPaper.attr({
        width : this.w,
        height: this.h - maTree.constants.corralHeight,
        x : 0,
        y : maTree.constants.corralHeight
    });
    this.treeBackground.attr({width : this.w, height: this.h - maTree.constants.corralHeight })

    /*
     the rootPaper holds the lower, "tree" part of the TreePanelView.
     This DOES have its own paper (rootPaper) so that we can clear() it separately when the model changes
     */
};

TreePanelView.prototype.freshTreeView = function () {

    console.log('TreePanelView.prototype.freshTreeView');

    this.manager.tree = new Tree();
    this.manager.tree.rootNode.valueInLabel = this.manager.focusCategory;

    if (!this.dependentVariableView) {
        this.makeDependentVariable(this.corralViews[0]);
    }
    this.manager.tree.eventDispatcher.addEventListener(
        "changeTree",
        this.handleTreeChange,
        this
    );

    this.redrawEntireTree();
};

TreePanelView.prototype.makeDependentVariable = function (iCorralAttView) {
    this.manager.makeDependentVariable(iCorralAttView.data.attribute);
    this.dependentVariableView = iCorralAttView;
    this.refreshCorral();
    this.freshTreeView();
};

TreePanelView.prototype.addAttributeToCorral = function (iAttribute) {
    var tCorralAttView = new CorralAttView(iAttribute, this);
    this.paper.append(tCorralAttView.paper);   //  subviews of paper, not corral itself
    this.corralViews.push(tCorralAttView);
};

TreePanelView.prototype.refreshCorral = function () {
    console.log('TreePanelView.prototype.refreshCorral');

    var tPad = maTree.constants.treeObjectPadding;
    var x = tPad;

    //  display the dependent variable first

    this.dependentVariableView.moveTo(x, tPad);
    x += this.dependentVariableView.label.getBBox().width + 3 * tPad; //  should be able to set and use the paper's width

    this.equalsSignText.animate({x: x, y: tPad + 15}, 500);
    x += this.equalsSignText.getBBox().width + tPad;

    //  then loop over the others

    this.corralViews.forEach(function (corV) {
        if (corV !== this.dependentVariableView) {      //  except for the dependent one
            corV.moveTo(x, tPad);
            x += corV.label.getBBox().width + 3 * tPad; //  should be able to set and use the paper's width
        }
    }.bind(this));

    x = this.w - tPad - maTree.constants.diagWidth;
    this.paper.append(this.negativeDiagnosisView.paper);
    this.negativeDiagnosisView.moveTo(x, tPad);
    x -= (tPad + maTree.constants.diagWidth);
    this.paper.append(this.positiveDiagnosisView.paper);
    this.positiveDiagnosisView.moveTo(x, tPad);
};

/**
 * Event handler: the model has made a change to the tree.
 * @param iEvent
 */
TreePanelView.prototype.handleTreeChange = function (iEvent) {
    console.log("handleTreeChange with " + iEvent.toString());
    this.redrawEntireTree();
};

TreePanelView.prototype.setLastMouseDownNodeView = function (iCorralView) {
    if (iCorralView !== this.dependentVariableView) {
        this.lastMouseDownNodeView = iCorralView;
    }
};

TreePanelView.prototype.redrawEntireTree = function () {
    this.rootPaper.clear();
    this.treeBackground = this.rootPaper.rect(0, 0, this.rootPaper.attr("width"), this.rootPaper.attr("height")).attr(
        {fill: maTree.constants.panelBackgroundColor}
    );

    if (this.manager.tree) {    //  if not, there is no root node, and we display only the background

        this.mainTreeView = new TreeView(this.manager.tree.rootNode, this);
        this.rootPaper.append(this.mainTreeView.paper);           //  attach the "root" TreeView to draw it.

        console.log('TreePanelView.prototype.redrawEntireTree');

        //  inset the treeView tPad in from all sides

        var tPad = maTree.constants.treeObjectPadding;
        var tViewWidth = this.w - 2 * tPad;
        var tViewHeight = this.h - 2 * tPad - maTree.constants.corralHeight;

        this.mainTreeView.redrawEntireTree({
            x: tPad,
            y: tPad,
            width: tViewWidth,
            height: tViewHeight
        });

        maTree.displayResults(maTree.tree.resultString());
    }

};