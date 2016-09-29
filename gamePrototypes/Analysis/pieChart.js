/**
 * Created by tim on 8/19/16.


 ==========================================================================
 pieCgart.js in data-science-games.

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

/* global Analysis, console, $, Snap */

var pieChart = {
    analysis : null,
    values : [],
    iFrameDescription: {
        version: "000a",
        name: 'Analysis',
        title: "Pie Chart",
        dimensions: {width: 300, height: 400}
    },

    initialize : function() {
        this.analysis = new Analysis( this );
        this.analysis.initialize( this.iFrameDescription );
    },

    gotDataContextList : function( iList ) {
        console.log( "Got list!" + JSON.stringify(iList));

        var optionsClauses = "";
        iList.forEach(
            function(dc) {
                optionsClauses += "<option value='" + dc.name + "'>" +
                        dc.title + "</option>";
            }
        );
        $("#dataContextSelector").empty().append( optionsClauses );

        $("#dataContextSelector").val( iList[0].name ); //  set the UI to the first item by default
        this.changeDataContext();   //  make sure the analysis knows
    },

    gotCollectionList : function( iList ) {

        var optionsClauses = "";
        iList.forEach(
            function( coll ) {
                optionsClauses += "<option value='" + coll.name + "'>" +
                    coll.title + "</option>";
            }
        );
        $("#collectionSelector").empty().append( optionsClauses );

        $("#collectionSelector").val( iList[0].name );  //  first item by default
        this.changeCollection( );  //  make sure analysis knows

    },

    gotAttributeList : function( iList ) {

        var optionsClauses = "";
        iList.forEach(
            function( att ) {
                optionsClauses += "<option value='" + att.name + "'>" +
                    att.title + "</option>";
            }
        );
        $("#attributeSelector").empty().append( optionsClauses );

        $("#attributeSelector").val( iList[0].name );  //  first item by default
        this.changeAttribute( );  //  make sure analysis knows
    },

    gotCases : function(  ) {
        //  now this.analysis.cases has all the cases in its member variable
        pieChart.ui.fixUI();
    },

    changeDataContext : function( ) {
        this.analysis.specifyCurrentDataContext( $("#dataContextSelector").find('option:selected').text() );
    },

    changeCollection : function( ) {
        this.analysis.specifyCurrentCollection( $("#collectionSelector").find('option:selected').text() );
    },

    changeAttribute : function( ) {
        this.analysis.specifyCurrentAttribute( $("#attributeSelector").find('option:selected').text() );
    },

    receiveValues : function( iValues ) {
        this.values = iValues;
        this.ui.fixUI();        //  we have new values, finally fix the UI.
    },

    randomLightColor : function( ) {
        var r = Math.floor( 127 * Math.random()) + 128;
        var g = Math.floor( 127 * Math.random()) + 128;
        var b = Math.floor( 127 * Math.random()) + 128;
        return Snap.rgb(r, g, b);
    },


    makePieChart : function( ) {
        if (this.values.length > 0) {
            if (typeof this.values[0] === "number") {
                this.values.sort( function(a, b) { return a - b;  });
            } else {
                this.values.sort( );
            }
            console.log("MAKE PIE CHART for " + JSON.stringify( this.values));
        } else {
            console.log("No cases, no pie.");
        }

        var tSegments = [];
        var tCurrentValue = this.values[0];
        var tCurrentSegment = { value : this.values[0], count : 1 };

        var tN = this.values.length;

        for (var i = 1; i < tN; i++) {
            var newValue = this.values[i];

            if (newValue === tCurrentValue) {
                tCurrentSegment.count++;
            } else {
                tSegments.push( tCurrentSegment );
                tCurrentSegment = {
                    value : this.values[i],
                    count : 1
                };
                tCurrentValue = newValue;
            }
        }
        tSegments.push( tCurrentSegment );

        console.log("PIE CHART SEGMENTS!! " + JSON.stringify(tSegments));

        var tPaper =  Snap(document.getElementById("pieChartChart")).attr(
            { viewBox : "-110 -110 220 220" }   //  extra space for a border
        );
        tPaper.clear();

        //  draw the background

        tPaper.circle( 0, 0, 100).attr({
            fill: "#ddd",
            stroke : "black",
            strokeWidth : 10
        });

        //  draw the filled arcs

        var tStartingDegree = 0;

        tSegments.forEach(
          function( iSeg ) {
              var tDegreesOfArc = 360.0 * iSeg.count / tN;
              var tEndingDegree = tStartingDegree + tDegreesOfArc;
              var xStart = 100 * Math.cos( tStartingDegree * Math.PI / 180.0 );
              var yStart = 100 * Math.sin( tStartingDegree * Math.PI / 180.0 );
              var xEnd = 100 * Math.cos( tEndingDegree * Math.PI / 180.0 );
              var yEnd = 100 * Math.sin( tEndingDegree * Math.PI / 180.0 );

              var tPathString = "M 0 0 l " + xStart + " " + yStart + " A 100 100 0 " +
                  ((tDegreesOfArc > 180) ? "1 " : "0 ") + "1 " + xEnd + " " + yEnd + " z";

              var tRandomColor = pieChart.randomLightColor();

              tPaper.path( tPathString ).attr({
                  fill : tRandomColor,
                  stroke : "black"
              });

              //    make a label

            var tLabelAngle = (tStartingDegree + tEndingDegree) / 2;
              var tLabelRadius = 70;
              var xLabel = tLabelRadius * Math.cos( tLabelAngle * Math.PI / 180.0 );
              var yLabel = tLabelRadius * Math.sin( tLabelAngle * Math.PI / 180.0 );
              var tLabelText = tPaper.text( xLabel, yLabel, iSeg.value).attr(
                  {
                      "font-size" : 16,
                      "font" : "Verdana"
                  }
              );

              var tLength = tLabelText.node.clientWidth;
              var tHeight = tLabelText.node.clientHeight;
              tLabelText.attr({
                  x: xLabel - tLength / 2,
                  y: yLabel + tHeight / 2
              }
              );


              //    get ready for next iteration

              tStartingDegree = tEndingDegree;
          }
        );

    }

};


pieChart.ui = {
    cycles: 0,

    fixUI: function () {
        this.cycles++;
        $("#testParagraph").text("fixUI(), " + this.cycles + " time(s) through");

        var tElement = $("#currentDataPath");

        var tContext = (pieChart.analysis.currentDataContextName === null) ? "<none>" : pieChart.analysis.currentDataContextName;
        var tCollection = (pieChart.analysis.currentCollectionName === null) ? "<none>" : pieChart.analysis.currentCollectionName;
        var tAttribute = (pieChart.analysis.currentAttributeName === null) ? "<none>" : pieChart.analysis.currentAttributeName;
        var theText = "Path: " + tContext + " | " + tCollection + " | " + tAttribute;
        theText += " | cases : " + pieChart.analysis.cases.length;
        tElement.text( theText );
        console.log("UI update done");

        pieChart.makePieChart();
    }
};

