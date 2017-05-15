/*
 ==========================================================================
 epiCODAPConnector.js

 Critter view class for the med DSG.

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
 * Created by tim on 10/28/15.
 */

/**
 * A  manager class responsible for connecting to the CODAP environment
 * @constructor
 */
var epidemicConnector = {
    kDataSetName : "Critters",
    kDataSetTitle : "Critters",
    kDataSetDescription : "records about the critters in the epidemic simulation",

    kGameCollectionName : "epidemics",
    kEventCollectionName : "events",

    resourceString : "dataContextChangeNotice[Critters]",

    initializeEpidemicDataSets : function() {
        var tDataSetupObject = {
            name: this.kDataSetName,
            title: this.kDataSetTitle,
            description: this.kDataSetDescription,
            collections: [
                {
                    name: this.kGameCollectionName,
                    labels: {
                        singleCase: "epidemic",
                        pluralCase: "epidemics",
                        setOfCasesWithArticle: "a history"
                    },
                    // The parent collection spec:
                    attrs: [
                        {name: "epiNumber", type: 'categorical', description: "epidemic number"},
                        {
                            name: "moves",
                            type: 'numeric',
                            precision: 0,
                            description: "how many times you moved a critter"
                        },
                        {
                            name: "sickSecs", type: 'numeric', unit: 'seconds', precision: 2,
                            description: "total number of seconds critters were sick"
                        },
                        {
                            name: "elapsed",
                            type: 'numeric',
                            unit: 'seconds',
                            precision: 2,
                            description: "elapsed seconds"
                        },
                        {name: "result", type: 'categorical', description: "game result"}
                    ],
                    childAttrName: this.kEventCollectionName
                },
                {
                    name: 'events',
                    parent: this.kGameCollectionName,
                    labels: {
                        singleCase: "event",
                        pluralCase: "events",
                        setOfCasesWithArticle: "an epidemic"
                    },
                    // The child collection specification:
                    attrs: [
                        {name: "time", type: 'numeric', unit: 'seconds', precision: 2, description: "elapsed seconds"},
                        {name: "name", type: 'categorical', description: "critter's name"},
                        {
                            name: "health",
                            type: 'categorical',
                            colormap: {"healthy": Critter.borderColors[0], "sick": CritterView.kSickBorderColor},
                            description: "health status"
                        },
                        {
                            name: "activity",
                            type: 'categorical',
                            colormap: Location.colorMap,
                            description: "what the critter was doing"
                        },
                        {name: "temp", type: 'numeric', precision: 1, description: "critter's temperature"},
                        {
                            name: "eyeColor",
                            type: 'categorical',
                            colormap: epidemic.colorMapObject,
                            description: "critter's eye color"
                        },
                        {name: "recordType", type: 'categorical', description: "why this record exists"},
                        {name: "location", type: 'categorical', description: "location ID"},
                        {name: 'col', type: 'categorical', description: "location's column"},
                        {name: 'row', type: 'categorical', description: "location's row"}
                    ]
                }
            ]
        };
        pluginHelper.initDataSet( tDataSetupObject );
    },

    outputCritterEvent : function( iValArray, iDataset, iCallback ) {
        var tGameValArray = {
            epiNumber : epidemic.state.gameNumber,
            moves : epidemic.state.moves,
            sickSecs : epidemic.state.sickSeconds,
            elapsed : epidemic.state.elapsed
        };

        $.extend(iValArray, tGameValArray);
        pluginHelper.createItems(iValArray, iDataset, iCallback);
    },

    selectCritterInCODAP : function( c ) {
        pluginHelper.selectCasesByIDs( c.caseIDs, epidemic.constants.kHierarchicalDataSetName );
    }

};

