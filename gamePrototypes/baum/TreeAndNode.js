/**
 * Created by tim on 9/26/16.


 ==========================================================================
 tree.js in reTree.

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

//          Tree class

/**
 * The Tree is a model that represents the whole tree.
 * It has a rootNode, which will in turn connect to the other Nodes.
 *
 * @constructor
 */
Tree = function () {
    var tInitialBoolean = ["true"];

    this.rootNode = new Node(this, this, "root", tInitialBoolean);
    this.eventDispatcher = new EventDispatcher();
};


Tree.prototype.dispatchTreeEvent = function (iEvent) {
    this.eventDispatcher.dispatchEvent(iEvent);
};

Tree.prototype.totalNumberOfCases = function () {
    return baum.analysis.cases.length;
};

Tree.prototype.casesByFilter = function (iFilterArray) {
    var tFilter = iFilterArray.join(" && ");
    var out = [];
    baum.analysis.cases.forEach(function (c) {
        if (eval(tFilter)) {
            out.push(c);
        }
    });

    return out;
};

Tree.prototype.resultString = function() {
    var tRes = this.rootNode.getResultCounts();
    var tPlusOut = "no data", tMinusOut = "no data";
    if (tRes.plusDenominator) {
        var tPlusRate = (100 * tRes.plusNumerator / tRes.plusDenominator).toFixed(1);
        tPlusOut = tRes.plusNumerator + "/" + tRes.plusDenominator + " (" + tPlusRate + "%)";
    }
    if (tRes.minusDenominator) {
        var tMinusRate = (100 * tRes.minusNumerator / tRes.minusDenominator).toFixed(1);
        tMinusOut = tRes.minusNumerator + "/" + tRes.minusDenominator + " (" + tMinusRate + "%)";
    }

    return "PLUS group: " + tPlusOut + " MINUS group: " + tMinusOut;
};

Tree.constants = {
    yLeafNode: 1,       //  this node has NO attribute.
    yFullNode: 2,       //  this node has an attribute assigned to it, therefore branches
    yStopNode: 99       //  this node has no attribute, but DOES have a stop assigned
};


//      Node class

Node = function (iTree, iParent, iLabel, iBoolean) {
    this.tree = iTree;      //      what tree (large, MODEL) are we in?
    this.parent = iParent;  //  parent NODE (model)
    this.valueInLabel = iLabel; //  the text of the "top", i.e., incoming label from the previous (parent) node
    this.data = {};     //      the "categories" is here (data.categories.attributeName, etc)
    this.nodeType = Tree.constants.yLeafNode;
    this.branches = [];     //  an array of sub-Nodes
    this.filterArray = iBoolean;
    this.cases = this.parent.casesByFilter(this.filterArray);

    this.valueAssignment = null;    //  how cases get assigned based on values when this node gets leafed out

    this.numerator = this.numberOfCasesWhere(baum.dependentVariableBoolean);
    this.denominator = this.totalNumberOfCases();
    this.rate = Math.round(100000 * this.numerator / this.denominator);

    //  console.log("New node with " + this.cases.length + " using " + this.filterArray);
};

/**
 * Called by the constructor OF A CHILD to fill in its this.cases array
 * @param iFilterArray
 * @returns {Array}
 */
Node.prototype.casesByFilter = function (iFilterArray) {
    var tFilter = iFilterArray.join(" && ");
    var out = [];
    this.cases.forEach(function (c) {
        if (eval(tFilter)) {
            out.push(c);
        }
    });

    return out;
};

Node.prototype.totalNumberOfCases = function () {
    return this.cases.length;
};

Node.prototype.numberOfCasesWhere = function (iBoolean) {
    var out = 0;
    this.cases.forEach(function (c) {
        if (eval(iBoolean)) {
            out += 1;
        }
    });
    return out;
};

/**
 * Called when the user drops an attribute in a node.
 * The NodeView sends the data from the "mouse down place" to this (mouse up) node.
 * @param iData
 */
Node.prototype.installData = function (iData) {
    this.data = iData;
    this.nodeType = Tree.constants.yFullNode;

    this.branches = [];     //  reset

    //  here is where we make the new nodes and constrict their Booleans.

    this.data.attribute.categories.forEach(function (ixBranch) {
        var tNewBoolean = this.filterArray.slice(0);     //  clone the array
        tNewBoolean.push("(c." + this.data.attribute.attributeName + " === '" + ixBranch + "')");

        var tNewNode = new Node(this.tree, this, ixBranch, tNewBoolean); //  ixBranch is text here
        this.branches.push(tNewNode);     //  array of Nodes
    }.bind(this));

    console.log("Node.prototype.installData, set to change tree.");
    this.tree.dispatchTreeEvent(new Event("changeTree"));
};

Node.prototype.makeStopNode = function (iData) {
    this.nodeType = Tree.constants.yStopNode;
    this.branches = [];     //  reset
    this.data = iData;
    this.label = this.data.sign;
    console.log("Node.prototype.makeStopNode (will change tree)");
    this.tree.dispatchTreeEvent(new Event("changeTree"));
};

Node.prototype.depth = function () {
    return (this.tree === this.parent) ? 0 : 1 + this.parent.depth();
};

Node.prototype.branchCount = function () {
    return this.branches.length;
};

Node.prototype.leafCount = function() {
    var oLeafCount = 0;
    if (this.nodeType === Tree.constants.yFullNode) {
        this.branches.forEach( function( iBranch ) {
            oLeafCount += iBranch.leafCount();
        }.bind(this));
    } else {
        oLeafCount = 1;
    }

    return oLeafCount;
};

/**
 * Result counts in the form {plusNumerator: , minusNumerator: , etc. }
 */
Node.prototype.getResultCounts = function () {
    var tOut = {
        plusNumerator: null,
        plusDenominator: null,
        minusNumerator: null,
        minusDenominator: null
    };

    if (this.nodeType === Tree.constants.yStopNode) {
        if (this.data.sign === baum.constants.diagnosisPlus) {
            tOut.plusNumerator = this.numerator;
            tOut.plusDenominator = this.denominator;
        } else if (this.data.sign === baum.constants.diagnosisMinus) {
            tOut.minusNumerator = this.numerator;
            tOut.minusDenominator = this.denominator;
        } else {
            alert("Mode.getResultCounts() unexpected data, neither + nor -");
        }
    } else {
        this.branches.forEach(function (ixBranchNode) {
            var tRC = ixBranchNode.getResultCounts();

            if (tRC.plusDenominator) {
                tOut.plusDenominator += tRC.plusDenominator;
                tOut.plusNumerator += tRC.plusNumerator;
            }
            if (tRC.minusDenominator) {
                tOut.minusDenominator += tRC.minusDenominator;
                tOut.minusNumerator += tRC.minusNumerator;
            }
        })
    }

    return tOut;
};