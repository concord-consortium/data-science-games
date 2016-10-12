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

TreeView = function ( iNode, iParent) {

    this.myParentView = iParent;    //
    this.myNode = iNode;
    this.myPanel = iParent.myPanel; //  is the panel for the root view, everybody gets this from me.
    this.paper = Snap(5, 5);
    this.w = 10;
    this.h = 10;

    this.background = this.paper.rect();    //  we will resize this of course

    this.myNodeView = new NodeView(iNode, this );
    this.paper.append(this.myNodeView.paper);
};


TreeView.prototype.redrawEntireTree = function (inThisSpace) {  //  has x, y, width, height

    //  this.paper.clear();
    this.paper.attr(inThisSpace);

    this.w = inThisSpace.width;
    this.h = inThisSpace.height;

    //  draw the background
    this.background.attr({
        width: this.w,
        height: this.h,
        fill: reTree.constants.treeBackgroundColors[ this.myNode.depth() ]
    });

    var tCurrentY = reTree.constants.treeObjectPadding;   //  where do we put these?

    //  draw the node

    this.myNodeView.redrawMe();
    var tNodeWidth = Number(this.myNodeView.paper.attr("width"));
    var tNodeHeight = Number(this.myNodeView.paper.attr("height"));

    this.myNodeView.moveTo({
        x: this.w / 2 - tNodeWidth / 2,
        y: tCurrentY
    });

    //  in addition to the node itself, you need subTreeViews

    switch (this.myNode.nodeType) {
        case Tree.constants.yLeafNode:
            break;
        case Tree.constants.yFullNode:
            var nBranches = this.myNode.branchCount();
            var tPad = reTree.constants.treeObjectPadding;
            tCurrentY += tNodeHeight + tPad;    //  Number(this.myNodeView.paper.attr("height")) + tPad;

            var tCurrentX;
            var tSubViewWidth = (this.w - tPad) / nBranches - tPad;

            for (var ib = 0; ib < nBranches; ib++) {
                tCurrentX = tPad + ib * (tSubViewWidth + tPad);

                var tNode = this.myNode.branches[ib];
                var tSpace = {
                    x : tCurrentX,
                    y : tCurrentY,
                    width : tSubViewWidth,
                    height : this.h - (tCurrentY) - tPad
                };
                var tTreeView = new TreeView( tNode, this); //  makes a node view
                this.paper.append( tTreeView.paper );
                tTreeView.redrawEntireTree( tSpace );       //  includes the node view
            }
            break;

        case Tree.constants.yStopNode:
            break;

    }

};