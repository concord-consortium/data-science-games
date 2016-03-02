/**
 * Created by tim on 2/24/16.


 ==========================================================================
 bartCODAPConnector.js in data-science-games.

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


/*

CASE STRUCTURE:

games
    gameNumber
    result

    buckets (of data)
        bucketNumber

        exits (individual microdata)
            id
            hours
            tim
            origin
            destination
            ticket
 */


/**
 * A  manager class responsible for connecting to the CODAP environment
 * @constructor
 */
var bartCODAPConnector = function(  iGameCollectionName, iBucketCollectionName) {
    this.gameCaseID = 0;
    this.bucketCaseID = 0;
    this.gameNumber = 0;
    this.bucketNumber = 0;
    this.gameCollectionName = iGameCollectionName;
    this.bucketCollectionName = iBucketCollectionName;
};

/**
 * Open a new "parent" case (the "game" level in the hierarchy)
 * Also updates the game number and sets up the various other member variables
 *
 */
bartCODAPConnector.prototype.newGameCase = function( iCallback ) {

    this.gameNumber+= 1;
    this.bucketNumber = 0;
    this.bucketCaseID = 0;

    codapHelper.openCase(
        this.gameCollectionName,
        [
            this.gameNumber, // game number
            null               //   result
        ],
        iCallback
    );
};

/**
 * finishes the current game case
 */
bartCODAPConnector.prototype.closeGame = function( iData ) {
    codapHelper.closeCase(
        this.gameCollectionName,
        [
            this.gameNumber,
            iData.result
        ],
        this.gameCaseID
    );
    this.gameCaseID = 0;     //  so we know there is no open case
};

/**
 * Create a new case in the middle-in-the-hierarchy "bucket" collection in the BART game.
 * @param iCallback
 */
bartCODAPConnector.prototype.newBucketCase = function( iCallback ) {
    console.log("New bucket...");
    this.bucketNumber += 1;

    codapHelper.createCase(
        this.bucketCollectionName,
        [
            this.bucketNumber // bucket number (atm, the only bucket-level attribute)
        ],
        this.gameCaseID,        //  3d argument is the parent case ID
        iCallback
    );

};


/**
 * Emit an "exit" case, low level in the hierarchy.
 * @param values
 */
bartCODAPConnector.prototype.doExitRecord = function(values ) {
    codapHelper.createCase(
        'exits',
        values,
        this.bucketCaseID
    ); // no callback.

};

/**
 * Create the initSimObject that initSim needs.
 * @returns {{name: string, version: string, dimensions: {width: number, height: number}, collections: *[]}}
 */
bartCODAPConnector.getInitSimObject = function() {

    var oInitSimObject = {
        name: 'BART',
        version : bartManager.version,
        dimensions: {width: 500, height: 256},
        collections: [  // There are two collections: a parent and a child
            {
                name: 'games',
                labels: {
                    singleCase: "game",
                    pluralCase: "games",
                    setOfCasesWithArticle: "the games"
                },
                // The parent collection spec:
                attrs: [
                    {name: "gameNumber", type: 'categorical'},
                    {name: "result", type: 'categorical'}
                ],
                childAttrName: "bucket"
            },
            {
                name: 'buckets',
                labels: {
                    singleCase: "bucket",
                    pluralCase: "buckets",
                    setOfCasesWithArticle: "a bucket of data"
                },
                attrs: [
                    {name: "bucketNo", type: 'numeric', precision: 0}
                ],
                childAttrName: "exit"
            },
            {
                name: 'exits',
                labels: {
                    singleCase: "exit",
                    pluralCase: "exits",
                    setOfCasesWithArticle: "an exit"
                },
                // The child collection specification:
                attrs: [
                    {name: "id", type: 'numeric', precision: 0},
                    {name: "hours", type: 'numeric', precision: 4},
                    {name: "time", type: 'categorical'},
                    {name: "startAt", type: 'categorical'},
                    {name: "endAt", type: 'categorical'},
                    {
                        name: "startReg",
                        type: 'categorical',
                        colormap : {
                            "Peninsula" : "purple",
                            "City" : "red",
                            "Downtown" : "orange",
                            "Oakland" : "green",
                            "East Bay" : "dodgerblue"
                        }
                    },
                    {
                        name: "endReg",
                        type: 'categorical',
                        colormap : {
                            "Peninsula" : "purple",
                            "City" : "red",
                            "Downtown" : "orange",
                            "Oakland" : "green",
                            "East Bay" : "dodgerblue"
                        }
                    },
                    {name: "ticket", type: 'categorical'}
                ]
            }

        ]
    };

    return oInitSimObject;
};

bartCODAPConnector.prototype.getSaveObject = function() {
    var tState = {
        gameCaseID : this.gameCaseID,
        gameNumber : this.gameNumber,
        gameCollectionName : this.gameCollectionName
    };

    return tState;
};

/**
 * @param iObject   object containing the property values.
 */
bartCODAPConnector.prototype.restoreFrom = function( iObject ) {
    this.gameCaseID = iObject.gameCaseID;
    this.gameNumber = iObject.gameNumber;
    this.gameCollectionName = iObject.gameCollectionName;
};


/**
 * Called by CODAP to initialize the simulation.
 * Two parameters: an object containing the organization of the data,
 * and a callback function when a doCommand is issued.
 * (We'll use it for save and restore)
 */
codapHelper.initSim(
    bartCODAPConnector.getInitSimObject(),
    bartManager.bartDoCommand
);

