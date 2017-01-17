/**
 * Created by tim on 9/26/16.


 ==========================================================================
 reTree.js in reTree.

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
 * Where's the data and everything?
 *
 * The ANALYSIS holds the whole set of cases.
 * Each NODE holds its particular set of cases.
 *
 * The baum.attsInBaum array holds one complete list of attributes
 * A ValueAssignment holds one way to recode an attribute to binary
 *      But the AttInBaum holds an array of possible ValueAssignments
 *      You get a default ValueAssignment if possible
 */
/**
 * Where
 * @type {{analysis: null, tree: null, treePanelView: null, attsInBaum: Array, windowWidth: null, originalAttributeList: null, dependentVariableBoolean: [*], dependentVariable: null, focusCategory: null, iFrameDescription: {version: string, name: string, title: string, dimensions: {width: number, height: number}}, initialize: baum.initialize, resizeWindow: baum.resizeWindow, gotCases: baum.gotCases, makeDependentVariable: baum.makeDependentVariable, gotDataContextList: baum.gotDataContextList, gotCollectionList: baum.gotCollectionList, gotAttributeList: baum.gotAttributeList, changeDataContext: baum.changeDataContext, changeCollection: baum.changeCollection, displayStatus: baum.displayStatus, displayResults: baum.displayResults, assembleAttributeAndCategoryNames: baum.assembleAttributeAndCategoryNames}}
 */

var baum = {

    analysis: null,        //      connects to CODAP
    tree: null,
    treePanelView: null,
    attsInBaum: [],
    windowWidth: null,
    originalAttributeList: null,
    dependentVariableBoolean: ["true"],
    dependentVariable: null,
    focusCategory: null,        //  the particular category we're looking for in the dependent variable
    iFrameDescription: {
        version: "001b",
        name: 'Tree Analysis',
        title: "Baum",
        dimensions: {width: 525, height: 544}
    },

    initialize: function () {
        this.analysis = new Analysis(this);         //  the global, baum, is the "host" for the analysis
        this.analysis.initialize(this.iFrameDescription); //  gets data structure and cases
        this.treePanelView = new TreePanelView(this, "treePaper");  //  the main view. Creates the tree.
        this.windowWidth = window.innerWidth;
        window.addEventListener("resize", this.resizeWindow)
    },

    resizeWindow: function (iEvent) {
        this.windowWidth = window.innerWidth;
        //  console.log("Width is now " + this.windowWidth);
        baum.treePanelView.drawTreePanelViewSetup();
        baum.treePanelView.redrawEntireTree();
    },

    gotCases: function () {
        //  now this.analysis.cases has all the cases in its member variable
        //  first, we parse the attribute list...

        this.attsInBaum = [];           //      new attribute list whenever we change collection? Correct? maybe not.
        var tAttNumber = 0;
        this.originalAttributeList.forEach(function (iAtt) {
            var tA = new AttInBaum(iAtt.name);
            tA.attributeColor = baum.constants.attributeColors[tAttNumber];
            this.attsInBaum.push(tA);
            this.treePanelView.addAttributeToCorral(tA);
            tAttNumber += 1;
        }.bind(this));

        this.assembleAttributeAndCategoryNames();
        console.log(" *** GOT " + this.analysis.cases.length + " cases!");
        this.treePanelView.freshTreeView();     //  todo: not sure if this needs to happen
    },

    /**
     * Called from the TreePanelView, because this is from the view.
     * DO NOT CALL DIRECTLY (or the view won't get moved)
     * @param iAttribute
     */
    makeDependentVariable: function (iAttribute) {
        this.dependentVariable = iAttribute;
        this.focusCategory = this.dependentVariable.categories[0];
        this.dependentVariableBoolean =          //  e.g., " (Phlox = 'true') " (NOT an array)
            "(c." + this.dependentVariable.attributeName + " === '" + this.focusCategory + "')";
        this.tree.rootNode.valueInLabel = this.focusCategory;

        console.log("We will test " + this.dependentVariable.attributeName + " = " + this.focusCategory);
        this.displayStatus("<b>" + this.dependentVariable.attributeName + " = " + this.focusCategory + "</b>");
    },

    gotDataContextList: function (iList) {
        console.log("Got list!" + JSON.stringify(iList));

        $("#dataContextSelector").empty().append(this.analysis.makeOptionsList(iList));

        $("#dataContextSelector").val(iList[0].name); //  set the UI to the first item by default
        this.changeDataContext();   //  make sure the analysis knows
    },

    gotCollectionList: function (iList) {

        $("#collectionSelector").empty().append(this.analysis.makeOptionsList(iList));

        $("#collectionSelector").val(iList[0].name);  //  first item by default
        this.changeCollection();  //  make sure analysis knows

    },

    gotAttributeList: function (iList) {

        this.originalAttributeList = iList;
        console.log("gotAttributeList: " + JSON.stringify(iList));

    },

    changeDataContext: function () {
        this.analysis.specifyCurrentDataContext($("#dataContextSelector").find('option:selected').text());
    },

    changeCollection: function () {
        this.analysis.specifyCurrentCollection($("#collectionSelector").find('option:selected').text());
    },

    displayStatus: function (iHTML) {
        $("#statusText").html(iHTML);
    },

    displayResults: function (iHTML) {
        $("#resultsText").html(iHTML);
    },

    assembleAttributeAndCategoryNames: function () {
        this.attsInBaum.forEach(function (a) {
            a.caseCount = 0;
            a.numericCount = 0;
        });

        var theCases = this.analysis.cases;

        //  make sure we have listed all categories

        theCases.forEach(function (c) {
            this.attsInBaum.forEach(function (a) {
                a.considerValue(c[a.attributeName])
            })
        }.bind(this));
    }
}

/**
 * Various constants for the tree tool
 *
 * @type {{diagWidth: number, diagHeight: number, nodeWidth: number, nodeHeightInCorral: number, leafNodeHeight: number, fullNodeHeight: number, stopNodeHeight: number, attrWidth: number, attrHeight: number, corralHeight: number, treeObjectPadding: number, leftArrowCode: string, targetCode: string, heavyMinus: string, heavyPlus: string, diagnosisPlus: string, diagnosisMinus: string, nodeValueLabelColor: string, nodeAttributeLabelColor: string, corralBackgroundColor: string, panelBackgroundColor: string, treeBackgroundColors: [*], attributeColors: [*], attributeColor: string, selectedAttributeColor: string, dropLocationColor: string, closeIconURI: string}}
 */
baum.constants = {
    diagWidth : 24,     //      width of a diagnosis icon (+ or –)
    diagHeight : 24,
    nodeWidth: 100,
    nodeHeightInCorral: 20,
    leafNodeHeight: 30,
    fullNodeHeight : 80,
    stopNodeHeight: 30,

    attrWidth: 80,
    attrHeight: 20,
    corralHeight : 40,
    treeObjectPadding : 8,

    leftArrowCode : "\u21c7",       //      "\u2190",
    targetCode: "\uD83D\uDF8B",     //  \u{1f78b}",     //  target
    heavyMinus : "\u2796",
    heavyPlus : "\u2795",
    diagnosisPlus : "+",
    diagnosisMinus : "-",

    nodeValueLabelColor : "white",
    nodeAttributeLabelColor : "#88f",

    corralBackgroundColor : "#789",
    panelBackgroundColor : "#9ab",
    treeBackgroundColors :  ["#edc", "#dcb", "#cba", "#ba9", "#a98", "#987", "#876", "#765", "#654"],
    attributeColors :       ["#66a", "#6a6", '#a66', "#369", "#396", "#639", "#693", "#936", "#963"],
    attributeColor: "PaleGoldenrod",
    selectedAttributeColor: "goldenrod",
    dropLocationColor: "tan",

    closeIconURI: "art/closeAttributeIcon.png"
};

function showHideAttributeDialog() {
    el = document.getElementById("attributeDialog");
    el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
};
