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

/**
 * Connector singleton, to isolate connections with CODAP
 *
 * Three-layer hierarchy
 * GAME
 * BUCKET (for a set of Stebbers, has current score, etc). Every 10 "meals"
 * STEBBERS one case per Stebber, subordinate to the bucket
 *
 * @type {{gameCaseID: number, bucketCaseID: number, gameNumber: number, bucketNumber: number, gameCollectionName: string, bucketCollectionName: string, stebberCollectionName: string, newGameCase: steb.connector.newGameCase, finishGameCase: steb.connector.finishGameCase, newBucketCase: steb.connector.newBucketCase, doStebberRecord: steb.connector.doStebberRecord, getInitSimObject: steb.connector.getInitSimObject}}
 */

/* global steb, codapHelper */

steb.connector = {
    gameCaseID: 0,
    bucketCaseID: 0,
    gameNumber: 0,
    bucketNumber: 0,
    gameCollectionName: "games",
    bucketCollectionName: "buckets",
    stebberCollectionName: "stebbers",

    /**
     * Called when we create a case for a new game
     * @param iBgColor      the background color (text representation of 3-vector)
     * @param iCrudColor    the mean Crud color
     */
    newGameCase: function ( iValueObject ) {

        this.gameNumber += 1;

        codapHelper.openCase(
            this.gameCollectionName,
            [
                iValueObject.gameNo,
                iValueObject.bgColor,
                iValueObject.crudColor,
                null
            ],
            function (iResult) {
                this.gameCaseID = iResult.caseID;
                steb.manager.emitPopulationData();  //      to get data at beginning of game
            }.bind(this)
        );
    },

    /**
     * Called to rewrite and close a game-level case
     * @param iBgColor
     * @param iCrudColor
     * @param iResult
     */
    finishGameCase: function (iBgColor, iCrudColor, iResult) {
        codapHelper.closeCase(
            this.gameCollectionName,
            [
                this.gameNumber,
                iBgColor,
                iCrudColor,
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
     * One case per Stebber.
     * @param values
     */
    doStebberRecord: function (iValues) {
        codapHelper.createCase(
            this.stebberCollectionName,
            iValues,
            this.bucketCaseID
        ); // no callback.
    },

    /**
     * Initializes the data structure.
     * @returns {{name: string, version: string, dimensions: {width: number, height: number}, collections: *[]}}
     */
    getInitSimObject: function () {

        var oInitSimObject = {
            name: 'Stebbins',
            version: steb.constants.version,
            dimensions: {width: 380, height: 500},
            collections: [  // There are three collections: game, bucket, stebber
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
                        {name: "bgColor", type: 'categorical', description : "[red, green, blue] of the background"},
                        {name: "crudColor", type: 'categorical', description : "[red, green, blue] of the average Crud"},
                        {name: "result", type: 'categorical'}
                    ],
                    childAttrName: "bucket"
                },
                {
                    name: this.bucketCollectionName,
                    labels: {
                        singleCase: "bucket",
                        pluralCase: "buckets",
                        setOfCasesWithArticle: "buckets of data"
                    },
                    // The bucket collection spec:
                    attrs: [
                        {name: "meals", type: 'categorical', description : 'how many stebbers you have eaten'},
                        {name: "score", type: 'numeric', precision : 1, description : 'evolution score'}
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
                        {name: "red", type: 'numeric', precision : 1, description : "how much red (0 to 15)"},
                        {name: "green", type: 'numeric', precision : 1, description : "how much green (0 to 15)"},
                        {name: "blue", type: 'numeric', precision : 1, description : "how much blue (0 to 15)"},
                        {name: "hue", type: 'numeric', precision : 3, description : "hue (0 to 1)"},
                        {name: "sat", type: 'numeric', precision : 3},
                        {name: "value", type: 'numeric', precision : 3},
                        {name: "id", type: 'numeric', precision : 0}
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

