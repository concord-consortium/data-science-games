/**
 * Created by tim on 5/24/16.


 ==========================================================================
 colorPlay.connect.js in data-science-games.

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


/* global colorPlay, $, codapHelper */

/**
 * connector code
 *
 * @type {{
 * sessiomCaseID: number,
  * sessionNumber: number,
 * sessionCollectionName: string,
 * guessCollectionName: string,
 * newSessionCase: colorPlay.connect.newSessionCase,
 * finishGameCase: colorPlay.connect.finishGameCase,
 * doGuessRecord: colorPlay.connect.doGuessRecord,
 * getInitSimObject: colorPlay.connect.getInitSimObject}
 * }
 */
colorPlay.connect = {
    sessiomCaseID: 0,
    sessionNumber: 0,
    sessionCollectionName: "session",
    guessCollectionName: "guesses",

    /**
     * Called when we create a case for a new session
     */
    startSessionCase: function ( ) {

        colorPlay.connect.sessionNumber += 1;

        codapHelper.openCase(
            colorPlay.connect.sessionCollectionName,
            [
                this.sessionNumber
            ],
            function (iResult) {
                this.sessionCaseID = iResult.caseID;
            }.bind(this)
        );
    },

    /**
     * Called to rewrite and close a game-level case
     */
    finishSessionCase: function () {
        codapHelper.closeCase(
            colorPlay.connect.sessionCollectionName,
            [
                this.sessionNumber
            ],
            colorPlay.connect.sessionCaseID
        );
        colorPlay.connect.sessionCaseID = 0;     //  so we know there is no open case
    },


    /**
     * Emit an "event" case, low level in the hierarchy.
     * One case per guess.
     * @param iValues   array of values to be output
     */
    doGuessRecord: function (iValues) {
        codapHelper.createCase(
            colorPlay.connect.guessCollectionName,
            iValues,
            colorPlay.connect.sessionCaseID
        ); // no callback.
    },

    /**
     * Initializes the data structure.
     * @returns {{name: string, version: string, dimensions: {width: number, height: number}, collections: *[]}}
     */
    getInitSimObject: function () {

        return {
            name: 'ColorPlay',
            version: colorPlay.constants.version,
            dimensions: {width: 380, height: 500},
            collections: [

                //  session collection

                {
                    name: this.sessionCollectionName,
                    labels: {
                        singleCase: "session",
                        pluralCase: "sessions",
                        setOfCasesWithArticle: "a set of sessions"
                    },
                    // The session collection spec:
                    attrs: [
                        {name: "session", type: 'categorical'}      //  session number
                    ],
                    childAttrName: "guess"
                },

                //  guess collection

                {
                    name: this.guessCollectionName,
                    labels: {
                        singleCase: "guess",
                        pluralCase: "guesses",
                        setOfCasesWithArticle: "the guesses"
                    },
                    // The guess collection spec:
                    attrs: [
                        {name: "red", type: 'numeric', precision : 0, description : 'true red color'},
                        {name: "green", type: 'numeric', precision : 0, description : 'true green color'},
                        {name: "blue", type: 'numeric', precision : 0, description : 'true blue color'},
                        {name: "red_G", type: 'numeric', precision : 0, description : 'guess red color'},
                        {name: "green_G", type: 'numeric', precision : 0, description : 'guess green color'},
                        {name: "blue_G", type: 'numeric', precision : 0, description : 'guess blue color'},
                        {name: "dRed", type: 'numeric', precision: 0,
                            formula : "red_G - red", editable : true,  description : 'error in red'},
                        {name: "dGreen", type: 'numeric', precision: 0,
                            formula : "green_G - green", editable : true,  description : 'error in green'},
                        {name: "dBlue", type: 'numeric', precision: 0,
                            formula : "blue_G - blue", editable : true,  description : 'error in blue'}
                    ],
                    childAttrName: "guess"
                },
            ]
        };
    }
};

/**
 * Called by CODAP to initialize the simulation.
 * Two parameters: an object containing the organization of the data,
 * and a callback function when a doCommand is issued.
 * (We'll use it for save and restore)
 */
codapHelper.initSim(
    colorPlay.connect.getInitSimObject(),
    colorPlay.manager.doCommand         //  the callback needed
);

