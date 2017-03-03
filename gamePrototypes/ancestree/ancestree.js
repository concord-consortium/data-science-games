/**
 * Created by tim on 2/28/17.


 ==========================================================================
 ancestree.js in gamePrototypes.

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


var ancestree = {

        theText: "debuggin'",

        parentage: [],
        model: {},


        processNewCase: function (iResult) {
            var tValues = iResult.values;
            if (Array.isArray(tValues)) {
                tValues = tValues[0];
            }

            var tOperation = tValues.operation;
            if (tOperation === "createCases") {

                var tCaseIDs = tValues.result.caseIDs;
                var tResource = codapInterface.parseResourceSelector(iResult.resource);
                var tDataContextName = tResource.dataContextChangeNotice;
                //  ancestree.addDebugText(tDataContextName + "-->" + JSON.stringify(tCaseIDs));

                tCaseIDs.forEach(function (id) {
                    //  ancestree.addDebugText("case id: " + JSON.stringify(id));

                    pluginHelper.getCaseValuesByCaseID(id, tDataContextName).then(
                        function (iCaseValues) {
                            var me = iCaseValues.id;
                            var mom = iCaseValues.mom;
                            var now = iCaseValues.meals;

                            if (tDataContextName === "BornStebbers") {
                                if (typeof(me) != "undefined") {  //  makes sure we have the data (correct collection)

                                    ancestree.parentage[me] = mom;
                                    var tNode = new StebberBirthNode(id, iCaseValues);
                                    ancestree.model[me] = tNode;
                                    ancestree.addDebugText("new stebber: " + me + ", mom: " + mom
                                        + " model" + JSON.stringify(ancestree.model[me]));

                                    ancestree.treeView.redraw(ancestree.model);
                                }
                            } else if (tDataContextName === "EatenStebbers") {
                                ancestree.addDebugText("eaten stebber: " + me + ", mom: " + mom
                                    + " model" + JSON.stringify(ancestree.model[me]));

                            }

                        }
                    );
                    /*
                     var tGetCaseResourceString = "dataContext["
                     + tDataContextName + "].caseByID["
                     + id + "]";

                     var tMessage = {
                     action: 'get',
                     resource: tGetCaseResourceString
                     };

                     codapInterface.sendRequest(tMessage).then(function (iResult) {
                     if (iResult.success) {
                     var tCaseValues = iResult.values.case.values;
                     var me = tCaseValues.id;
                     var mom = tCaseValues.mom;
                     var now = tCaseValues.meals;

                     if (tDataContextName === "BornStebbers") {
                     if (typeof(me) != "undefined") {  //  makes sure we have the data (correct collection)

                     ancestree.parentage[me] = mom;
                     tNode = new StebberBirthNode(id, tCaseValues);
                     ancestree.model[me] = tNode;
                     ancestree.addDebugText("new stebber: " + me + ", mom: " + mom
                     + " model" + JSON.stringify(ancestree.model[me]));

                     ancestree.treeView.redraw(ancestree.model);
                     }
                     } else if (tDataContextName === "EatenStebbers") {
                     ancestree.addDebugText("eaten stebber: " + me + ", mom: " + mom
                     + " model" + JSON.stringify(ancestree.model[me]));

                     }
                     } else {
                     alert("oops");
                     }
                     */

                    // ancestree.addDebugText("Parentage: " + JSON.stringify( ancestree.parentage));
                });
            }
        },


        recordBirth: function (now, node) {

        },

        recordDeath: function (now, me) {

        },

        setUp: function () {

            ancestree.treeView.initialize("netView");

            var tPluginConfiguration = {
                name: ancestree.constants.kName,
                title: ancestree.constants.kName,
                version: ancestree.constants.kVersion,
                dimensions: ancestree.constants.kDimensions
            };

            codapInterface.init(tPluginConfiguration, null).then(
                function () {
                    var tResource = 'dataContextChangeNotice\[BornStebbers\]';
                    codapInterface.on("notify", tResource, ancestree.processNewCase);
                    tResource = 'dataContextChangeNotice\[EatenStebbers\]';
                    codapInterface.on("notify", tResource, ancestree.processNewCase);
                });
        }
        ,

        addDebugText: function (iText) {
            ancestree.theText = iText + "<br>" + ancestree.theText;
            $("#debug").html(ancestree.theText);
        }
        ,

        replaceDebugText: function (iText) {
            ancestree.theText = iText;
            $("#debug").html(ancestree.theText);
        }
        ,

        constants: {
            kVersion: "000",
            kName: "ancestree",
            kDimensions: {
                width: 364, height: 366
            }
        }

    }
    ;

StebberHistory = function (iSBN) {
    this.birthNode = iSBN;
    /*
     Each element in the history array has:
     rank: where you are vertically
     date: how many meals at this point
     */
    this.history = [];
};

StebberBirthNode = function (iCaseID, iCaseValues) {
    this.caseID = iCaseID;
    this.me = iCaseValues.id;
    this.mom = iCaseValues.mom;
    this.now = iCaseValues.meals;
    this.hue = iCaseValues.hue;

    var tRGBString = Snap.rgb(iCaseValues.red * 17, iCaseValues.green * 17, iCaseValues.blue * 17);
    this.color = tRGBString;

    this.center = {x: 0, y: 0};
};