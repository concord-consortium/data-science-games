/*
 ==========================================================================
 PFManager.js

 Main controller for the Program Frame class.

 Author:   Tim Erickson

 Copyright (c) 2015 by The Concord Consortium, Inc. All rights reserved.

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
 * Created by tim on 11/11/15.
 */

//  var svgNS = "http://www.w3.org/2000/svg";

/**
 * Construct the manager class for Program Frames.
 * Use the frame ID to create the main enclosing view.
 * @param frameID
 * @constructor
 */
var PFManager = function( frameID ) {
    var tModel = new PFModel();
    var tView = new PFContainerView( frameID );
    this.headNode = new PNode( tModel, tView );
    tView.myNode = this.headNode;       //      todo: make more robust
    this.selectedNode = null;
};

PFManager.prototype.addEmptyStatement = function( order ) {
    var tNewStatementModel = new PSModel();
    var tNewStatementView = new PSView( );
    var tNode = new PNode( tNewStatementModel, tNewStatementView );
    this.headNode.addChildAtEnd( tNode );
    tNewStatementView.initialize( tNode );

    this.headNode.view.arrangeContents();
};

PFManager.prototype.addNewContainer = function( ) {

};

PFManager.prototype.selectNode = function( node ) {
    if (this.selectedNode) this.selectedNode.select( false );
    this.selectedNode = node;
    if (this.selectedNode) this.selectedNode.select( true );
    this.refreshScreen();
};

PFManager.prototype.deleteNode = function( node ) {
    node.deleteMe();
    this.refreshScreen();
};

PFManager.prototype.expandCollapse = function( node ) {
    node.collapsed = !node.collapsed;
    this.refreshScreen();
};

PFManager.prototype.refreshScreen = function() {
    this.headNode.view.redraw();
};

PFManager.prototype.programAsString = function() {
    var tProgram = null;

    tProgram = this.headNode.model.toString();
    return tProgram;
};

/**
 * Various constants, including layout parameters
 * @type {{statementGap: number}}
 */
var PFConstants = {
    statementVPadding   : 2,
    statementLRMargin   : 4,
    statementColor      : "gray",
    statementFullHeight : 40,
    statementDragPadWidth   : 16,
    statementDragPadColor   : "purple",
    deleteRectSize      : 12,

    selectedStrokeColor : "yellow",

    containerVStart     : 30,
    containerVText      : 25
};


var PNode = function( model, view ) {
    this.model = model;
    this.view = view;
    this.parent = null;
    this.firstChild = null;
    this.lastChild = null;
    this.next = null;
    this.prev = null;

    model.myNode = this;
    view.myNode = this;

    this.selected = Boolean( false );
    this.collapsed = Boolean( false );
};

PNode.prototype.addChildAtEnd = function( node ) {

    if (this.lastChild) {
        var oldLast = this.lastChild;
        node.prev = oldLast;
        oldLast.next = node;
    } else {
        this.firstChild = node;
    };

    node.parent = this;
    this.lastChild = node;
};

PNode.prototype.select = function( selected ) {
    this.selected = selected;
    this.view.showSelected( this.selected );
};

PNode.prototype.deleteMe = function() {
    if (this === this.parent.firstChild) {
        this.parent.firstChild = this.next;
    } else {
        this.prev.next = this.next;
        if (this.next) {
            this.next.prev = this.prev;
        }
    }
};