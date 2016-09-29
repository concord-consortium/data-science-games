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
 * NEW API
 *
 * Three-layer hierarchy
 * GAME
 * BUCKET (for a set of Stebbers, has current score, etc). Every 10 "meals"
 * STEBBERS one case per Stebber, subordinate to the bucket
 *
 * @type {{gameCaseID: number, bucketCaseID: number, gameNumber: number, bucketNumber: number, gameCollectionName: string, bucketCollectionName: string, stebberCollectionName: string, newGameCase: steb.connector.newGameCase, finishGameCase: steb.connector.finishGameCase, newBucketCase: steb.connector.newBucketCase, doStebberRecord: steb.connector.doStebberRecord, getInitSimObject: steb.connector.getInitSimObject}}
 */

/* global steb, codapHelper, alert, console */

steb.connector = {
    gameCaseIDInLiving: 0,
    gameCaseIDInEaten: 0,
    bucketCaseID: 0,
    bucketNumber: 0,
    gameCollectionName: "games",
    bucketCollectionName: "snapshots",
    stebberCollectionName: "survivors",
    eatenCollectionName: "eatenStebbers",


    selectStebberInCODAP : function( iStebber ) {
        codapHelper.selectCasesByIDs( iStebber.caseIDs, steb.constants.dataSetName_Living );
    },

    getSelectedStebberIDs : function( iCallback ) {
        codapHelper.getSelectionList(
            steb.constants.dataSetName_Living,
            iCallback
        );
    },

    /**
     * Called when we create a case for a new game
     * @param iValues      object containing values to be stored
     */
    newGameCase: function ( iValues ) {

        //  first for the living stebber data set

        codapHelper.createCase(
            this.gameCollectionName,
            { values : iValues },       //  format for new API, no parent.
            function (iResult) {
                if (iResult.success) {
                    this.gameCaseIDInLiving = iResult.values[0].id;
                    steb.manager.emitPopulationData();  //      to get data at beginning of game
                    console.log('Created case ' + this.gameCaseIDInLiving + ' for living');
                } else {
                    alert("Error creating new 'Living' game case");
                }

            }.bind(this),
            steb.constants.dataSetName_Living
        );

        //  now for the meals data set
        //  note we are using the same iValues because the attribute (gameNo) has the same name.

        codapHelper.createCase(
            this.gameCollectionName,    //  still "games"
            { values : iValues },       //  format for new API, no parent.
            function (iResult) {
                if (iResult.success) {
                    this.gameCaseIDInEaten = iResult.values[0].id;
                    console.log('Created case ' + this.gameCaseIDInEaten + ' for meals');
                } else {
                    alert("Error creating new 'Meals' game case");
                }

            }.bind(this),
            steb.constants.dataSetName_Eaten
        );
    },

    /**
     * Called to rewrite and close a game-level case
     * @param iResult {string}  result of the game
     */
    finishGameCase: function ( iValues ) {
        codapHelper.updateCase(
            { values : iValues },
            this.gameCaseIDInLiving,
            this.gameCollectionName,
            steb.constants.dataSetName_Living,
            null        //  no callback
        );
        this.gameCaseID = 0;     //  so we know there is no open case
    },

    /**
     * Create a new case in the middle-in-the-hierarchy "bucket" collection in the BART game.
     * @param iValues {*} Object containing values to be stored
     * @param iCallback     the callback function
     */
    newBucketCase : function( iValues, iCallback ) {
        this.bucketNumber += 1;     //  not currently stored

        codapHelper.createCase(
            this.bucketCollectionName,
            {
                parent : this.gameCaseIDInLiving,
                values : iValues
            },
            iCallback,              //  needed to figure out the bucket case ID
            steb.constants.dataSetName_Living
        );
    },

    /**
     * Emit an "event" case, low level in the hierarchy.
     * One case per Stebber.
     * Called from steb.manager.bucketCreated
     * @param {[*]} iValues   the data values to be passed
     * @param iCallback the callback function to get iResult
     */
    doStebberRecord: function (iValues, iCallback) {
        codapHelper.createCase(
            this.stebberCollectionName,
            {
                parent : this.bucketCaseID,
                values : iValues
            },
            iCallback,   //  needed because selection requires case IDs in the new API
            steb.constants.dataSetName_Living
        );
    },

    doMealRecord : function( iValues) {
        codapHelper.createCase(
            this.eatenCollectionName,
            {
                parent : this.gameCaseIDInEaten,
                values : iValues
            },
            null,
            steb.constants.dataSetName_Eaten
        ); // no callback.

    },

    createLivingStebberTable : function() {
        var tArg = {
            action: 'create',
            resource: 'component',
            values: {
                type: 'caseTable',
                name: steb.constants.strings.livingStebberTableName,
                dimensions: {
                    width: 600,
                    height: 240
                },
                position: 'top',
                dataContext : steb.constants.dataSetName_Living
            }
        };

        codapHelper.codapPhone.call(
            tArg,
            function (iResult) {
                if (iResult.success) {
                    console.log("Table made");
                } else {
                    console.log("Table construction failed.");
                }
            }.bind(this));

    },

    /**
     * Initialize the frame structure
     * @returns {{name: string, title: string, version: string, dimensions: {width: number, height: number}}}
     */
    getInitFrameObject: function () {

        return {
            version: steb.constants.version,
            name: 'Stebbins',
            title: 'Stebbins',
            dimensions: {width: 444, height: 666}

            /*, Temporarily, at least, we let CODAP set the default dimensions
            dimensions: {width: 380, height: 500}*/
        };
    },

    /**
     * Initialize the "Living Stebbers" data set
     * @returns {{name: string, title: string, description: string, collections: *[]}}
     */
    getInitLivingStebberDataSetObject: function (  ) {
        return {
            name: steb.constants.dataSetName_Living,
            title: steb.constants.dataSetName_Living,
            description: 'Surviving Stebbers',
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
                        {name: "bgColor", type: 'categorical', description: "[red, green, blue] of the background"},
                        {name: "crudColor", type: 'categorical', description: "[red, green, blue] of the average Crud"},
                        {name: "result", type: 'categorical'}
                    ],
                    childAttrName: "bucket"
                },
                {
                    name: this.bucketCollectionName,
                    parent: this.gameCollectionName,
                    labels: {
                        singleCase: "snapshot",
                        pluralCase: "snapshots",
                        setOfCasesWithArticle: "snapshots of survivors"
                    },
                    // The bucket collection spec:
                    attrs: [
                        {name: "meals", type: 'categorical', description: 'how many stebbers you have eaten'},
                        {name: "score", type: 'numeric', precision: 1, description: 'score at this time'}
                    ],
                    childAttrName: "survivor"
                },
                {
                    name: this.stebberCollectionName,
                    parent: this.bucketCollectionName,
                    labels: {
                        singleCase: "survivor",
                        pluralCase: "survivors",
                        setOfCasesWithArticle: "a group of survivors"
                    },

                    // The child collection specification:

                    attrs: [
                        {name: "wDark", type: 'numeric', precision: 1,
                            description: "width of the dark stripe"},
                        {name: "wLight", type: 'numeric', precision: 1,
                            description: "width of the light stripe"},
                        {name: "cornerR", type: 'numeric', precision: 1,
                            description: "radius of the corner"},

                        {name: "id", type: 'numeric', precision: 0}

                    ]
                }
            ]
        };
    },


    getInitStebberMealsDataSetObject: function (  ) {
        return {
            name: steb.constants.dataSetName_Eaten,
            title: steb.constants.dataSetName_Eaten,
            description: 'the Stebbins data set',
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
                        {name: "gameNo", type: 'categorical'}
                    ],
                    childAttrName: "meal"
                },
                {
                    name: this.eatenCollectionName,
                    parent: this.gameCollectionName,
                    labels: {
                        singleCase: "meal",
                        pluralCase: "meals",
                        setOfCasesWithArticle: "a set of meals"
                    },
                    // The child collection specification:
                    attrs: [
                        {name: "meal", type: 'numeric', precision: 0, description: "which meal was this?"},
                        {name: "score", type: 'numeric', precision: 0, description: "score"},
                        {name: "vDark", type: 'numeric', precision: 1,
                            description: "width of the dark vertical stripe"},
                        {name: "vLight", type: 'numeric', precision: 1,
                            description: "width of the light vertical stripe"},

                        {name: "id", type: 'numeric', precision: 0}
                    ]
                }
            ]
        };
    }

};

/**
 * We call this to initialize the data interactive.
 * Three parameters: an object containing the organization of the data,
 * and a callback function when a doCommand is issued.
 * (We'll use it for save and restore)
 */
codapHelper.initDataInteractive(
    steb.connector.getInitFrameObject(),
    steb.manager.stebDoCommand,         //  the callback needed for saving state
    steb.manager.stebRestoreState       // the callback for restoring state
);

