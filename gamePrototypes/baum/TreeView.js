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
 * A TreeView is the rectangular area the nodes appear in.
 * a NodeView is the image for the node itself.
 *
 * @param iNode
 * @param iParent
 * @constructor
 */
TreeView = function (iNode, iParent) {

    this.myPanel = iParent.myPanel; //  is the panel for the root view, everybody gets this from me.
    // this.myParentView = iParent;    //

    this.myNode = iNode;
    this.paper = Snap(5, 5);        //  tiny, but it exists
    this.widthInPixels = 0;

    this.w = 10;
    this.h = 10;

    this.background = this.paper.rect();    //  we will resize this of course

    this.myNodeView = new NodeView(iNode, this);
    this.myNodeView.redrawMe();
    this.paper.append(this.myNodeView.paper);

    //  make the subTreeViews.

    this.subTreeViews = [];     //  begin empty.

    if (this.myNode.nodeType === Tree.constants.yFullNode) {
        this.myNode.branches.forEach(function (iChildNode) {
            var tTreeView = new TreeView(iChildNode, this); //  makes a view of a subtree, as a TreeView
            this.subTreeViews.push(tTreeView);        //  we're maintaining the view tree
            this.paper.append(tTreeView.paper);
        }.bind(this))
    }
};

TreeView.prototype.debugLabel = function () {
    return (this.myNode.numerator + "/" + this.myNode.denominator);
};

TreeView.prototype.calculateTreeWidth = function () {

    if (this.widthInPixels !== 0) {
        return this.widthInPixels;
    }

    var tPad = baum.constants.treeObjectPadding;
    var out;

    if (this.subTreeViews.length === 0) {
        var tNodeSize = this.myNodeView.calculateNodeViewSize();    //  has {width: www; size: sss}
        out = 2 * tPad + tNodeSize.width;
    } else {
        out = tPad;
        this.subTreeViews.forEach(function (iSubTree) {
            out += tPad;
            out += iSubTree.calculateTreeWidth();
        });
    }

    this.widthInPixels = out;

    //  console.log("TreeWidth! for node " + this.debugLabel() + " = " + out);
    return out;
};

/**
 * Redraw this entire tree, recursively creating subTreeViews and asking them to redraw.
 * @param inThisSpace
 */
TreeView.prototype.redrawEntireTree = function (inThisSpace) {  //  object with x, y, width, height

    //  calculate various dimensions we need for drawing

    var tPad = baum.constants.treeObjectPadding;
    var tTreeWidth = this.calculateTreeWidth();         //  can do this since the subTreeViews exist now
    var tTotalLeafCount = this.myNode.leafCount();     //  how many "columns" will this have altogether?
    var tCurrentY = tPad;   //  where do we put objects?

    //  set up important members

    this.paper.attr(inThisSpace);

    this.w = tTreeWidth;        //      inThisSpace.width;
    this.h = inThisSpace.height;

    //  draw the background
    this.background.attr({
        width: this.w,
        height: this.h,
        stroke: "black",
        fill: baum.constants.treeBackgroundColors[this.myNode.depth()]
    });

    //  draw the node

    var tNodeViewSize = this.myNodeView.calculateNodeViewSize();

    //  move the node to where it belongs

    this.myNodeView.moveTo({x: this.w / 2 - tNodeViewSize.width / 2, y: tCurrentY});

    //  in addition to the node itself, you need subTreeViews

    switch (this.myNode.nodeType) {
        case Tree.constants.yLeafNode:
            break;

        case Tree.constants.yFullNode:
            var nBranches = this.myNode.branchCount();
            tCurrentY += tNodeViewSize.height + tPad;

            var tCurrentX = tPad;  //  start on the left edge
            var tWidthAvailableForSubViews = this.w - (nBranches + 1) * tPad;
            var tWidthPerSubView = tWidthAvailableForSubViews / tTotalLeafCount;

            this.subTreeViews.forEach(function (iSubTreeView) {
                var tWidthOfThisSubTree = iSubTreeView.calculateTreeWidth();
                var tSpace = {
                    x: tCurrentX,
                    y: tCurrentY,
                    width: tWidthOfThisSubTree,
                    height: this.h - (tCurrentY) - tPad
                };
                iSubTreeView.redrawEntireTree(tSpace);       //  includes the node view

                tCurrentX += tPad + tWidthOfThisSubTree;

            }.bind(this));

            break;

        case Tree.constants.yStopNode:
            break;

    }

};