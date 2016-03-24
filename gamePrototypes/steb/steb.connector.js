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
    bucketCaseID: 0,
    gameNumber: 0,
    bucketNumber: 0,
    gameCollectionName: "games",
    bucketCollectionName: "buckets",
    stebberCollectionName: "stebbers",

    newGameCase: function () {

        this.gameNumber += 1;

        codapHelper.openCase(
            this.gameCollectionName,
            [
                this.gameNumber,
                null
            ],
            function (iResult) {
                this.gameCaseID = iResult.caseID;
                steb.manager.emitPopulationData();  //      to get data at beginning of game
            }.bind(this)
        );
    },

    finishGameCase: function (iResult) {
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

    /**
     * Create a new case in the middle-in-the-hierarchy "bucket" collection in the BART game.
     * @param iCallback
     */
    newBucketCase : function( iValues, iCallback ) {
        this.bucketNumber += 1;     //  not currently stored

        codapHelper.createCase(
            this.bucketCollectionName,
            iValues,
            this.gameCaseID,        //  3d argument is the parent case ID
            iCallback               //  needed to figure out the bucket case ID
        );
    },

/**
     * Emit an "event" case, low level in the hierarchy.
     * @param values
     */
    doStebberRecord : function( iValues ) {
        codapHelper.createCase(
            this.stebberCollectionName,
            iValues,
            this.bucketCaseID
        ); // no callback.
    },

getInitSimObject: function () {

        var oInitSimObject = {
            name: 'Epidemic',
            version: steb.constants.version,
            dimensions: {width: 380, height: 500},
            collections: [  // There are two collections: a parent and a child
                {
                    name: this.gameCollectionName,
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
                    childAttrName: "bucket"
                },
                {
                    name: this.bucketCollectionName,
                    labels: {
                        singleCase: "bucket",
                        pluralCase: "buckets",
                        setOfCasesWithArticle: "a bucket of data"
                    },
                    // The bucket collection spec:
                    attrs: [
                        {name: "meals", type: 'categorical'}
                    ],
                    childAttrName: "stebber"
                },
                {
                    name: this.stebberCollectionName,
                    labels: {
                        singleCase: "stebber",
                        pluralCase: "stebbers",
                        setOfCasesWithArticle: "a set of stebbers"
                    },
                    // The child collection specification:
                    attrs: [
                        {name: "red", type: 'numeric', precision : 0},
                        {name: "green", type: 'numeric', precision : 0},
                        {name: "blue", type: 'numeric', precision : 0}
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

