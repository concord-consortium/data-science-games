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


var reTree = {

    analysis : null,
    tree: null,
    treePanel: null,
    attributes : [],
    originalAttributeList : null,
    dependentVariableBoolean : ["true"],
    dependentVariable : null,
    focusCategory : null,
    iFrameDescription: {
        version: "000a",
        name: 'Tree Analysis',
        title: "Tree",
        dimensions: {width: 525, height: 544}
    },

    initialize: function () {
        this.analysis = new Analysis( this );
        this.analysis.initialize( this.iFrameDescription ); //  gets data structure and cases
        this.treePanel = new TreePanel(this, "treePaper");  //  the main view. Creates the tree.
    },

    gotCases : function(  ) {
        //  now this.analysis.cases has all the cases in its member variable

        //  first, we partse the attribute list...

        this.attributes = [];           //      new attribute list whenever we change collection? Correct? maybe not.
        var tAttNumber = 0;
        this.originalAttributeList.forEach( function( iAtt ){
            var tA = new Attribute( iAtt.name, [] );
            tA.attributeColor = reTree.constants.attributeColors[tAttNumber];
            this.attributes.push( tA );
            this.treePanel.addAttributeToCorral( tA );
            tAttNumber += 1;
        }.bind(this));

        this.assembleAttributeAndCategoryNames();
        console.log(" *** GOT " + this.analysis.cases.length + " cases!");
        this.treePanel.freshTreeView();
        //  pieChart.ui.fixUI();
    },

    /**
     * Called from the TreePanel, because this is from the view.
     * DO NOT CALL DIRECTLY (or the view won't get moved)
     * @param iAttribute
     */
    makeDependentVariable : function( iAttribute ) {
        this.dependentVariable = iAttribute;
        this.focusCategory = this.dependentVariable.categories[0];
        this.dependentVariableBoolean =          //  e.g., " (Phlox = 'true') " (NOT an array)
            "(c." + this.dependentVariable.attributeName + " === '" + this.focusCategory + "')";
        this.tree.rootNode.valueInLabel = this.focusCategory;

        console.log("We will test " + this.dependentVariable.attributeName + " = " + this.focusCategory);
        this.displayStatus("<b>" + this.dependentVariable.attributeName + " = " + this.focusCategory + "</b>");
    },

    gotDataContextList : function( iList ) {
        console.log( "Got list!" + JSON.stringify(iList));

        $("#dataContextSelector").empty().append( this.analysis.makeOptionsList( iList ) );

        $("#dataContextSelector").val( iList[0].name ); //  set the UI to the first item by default
        this.changeDataContext();   //  make sure the analysis knows
    },

    gotCollectionList : function( iList ) {

        $("#collectionSelector").empty().append( this.analysis.makeOptionsList( iList ) );

        $("#collectionSelector").val( iList[0].name );  //  first item by default
        this.changeCollection( );  //  make sure analysis knows

    },

    gotAttributeList : function( iList ) {

        this.originalAttributeList = iList;
        console.log("gotAttributeList: " + JSON.stringify( iList ));

    },

    changeDataContext : function( ) {
        this.analysis.specifyCurrentDataContext( $("#dataContextSelector").find('option:selected').text() );
    },

    changeCollection : function( ) {
        this.analysis.specifyCurrentCollection( $("#collectionSelector").find('option:selected').text() );
    },

    displayStatus : function( iHTML ) {
        $("#statusText").html(iHTML);
    },
    displayResults : function( iHTML ) {
        $("#resultsText").html(iHTML);
    },

    assembleAttributeAndCategoryNames : function( ) {
        //  loop through all cases, get all the category names.
        var theCases = this.analysis.cases;

        //  make sure we have listed all categories

        theCases.forEach( function( c ) {
            this.attributes.forEach( function( a ) {
                var tVal = c[a.attributeName ];
                if (a.categories.indexOf(tVal) < 0) {
                    a.categories.push( tVal );
                }
            })

        }.bind(this));

    }


};

Attribute = function( iName, iCategories ) {
    this.attributeName = iName;
    this.categories = iCategories;
    this.attributeColor = "gray";
};

reTree.constants = {
    diagWidth : 24,
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
}