/**
 * Created by tim on 3/23/16.


 ==========================================================================
 connector.js in data-science-games.

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


steb.connector = {
    gameCaseID: 0,
    gameNumber: 0,
    gameCollectionName: "games",

    newGameCase: function ( ) {

        this.gameNumber += 1;

        codapHelper.openCase(
            this.gameCollectionName,
            [
                this.gameNumber,
                null
            ],
            function (iResult) {
                this.gameCaseID = iResult.caseID;
            }.bind(this)
        );
    },

    finishGameCase : function( iResult ) {
        codapHelper.closeCase(
            this.gameCollectionName,
            [
                this.gameNumber,
                iResult
            ],
            this.gameCaseID
        );
        this.gameCaseID = 0;     //  so we know there is no open case
    },

getInitSimObject: function () {

        var oInitSimObject = {
            name: 'Epidemic',
            version: steb.constants.version,
            dimensions: {width: 380, height: 500},
            collections: [  // There are two collections: a parent and a child
                {
                    name: 'games',
                    labels: {
                        singleCase: "game",
                        pluralCase: "games",
                        setOfCasesWithArticle: "a set of games"
                    },
                    // The parent collection spec:
                    attrs: [
                        {name: "gameNo", type: 'categorical'},
                        {name: "result", type: 'categorical'}
                    ],
                    childAttrName: "event"
                },
                {
                    name: 'events',
                    labels: {
                        singleCase: "event",
                        pluralCase: "events",
                        setOfCasesWithArticle: "a set of events"
                    },
                    // The child collection specification:
                    attrs: [
                        {name: "time", type: 'numeric', unit: 'seconds', precision: 1},
                        {name: "name", type: 'categorical'},
                        {name: 'col', type: 'categorical'}
                    ]
                }
            ]
        };

        return oInitSimObject;
    }

};

/**
 * Called by CODAP to initialize the simulation.
 * Two parameters: an object containing the organization of the data,
 * and a callback function when a doCommand is issued.
 * (We'll use it for save and restore)
 */
codapHelper.initSim(
    steb.connector.getInitSimObject(),
    steb.manager.stebDoCommand         //  the callback needed
);

