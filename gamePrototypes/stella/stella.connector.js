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
 * //   BUCKET (for a set of Stebbers, has current score, etc). Every 10 "meals"
 * STARS one case per Star, //  subordinate to the bucket
 *
 * @type {{gameCaseID: number, bucketCaseID: number, gameNumber: number, bucketNumber: number, gameCollectionName: string, bucketCollectionName: string, stebberCollectionName: string, newGameCase: steb.connector.newGameCase, finishGameCase: steb.connector.finishGameCase, newBucketCase: steb.connector.newBucketCase, doStebberRecord: steb.connector.doStebberRecord, getInitSimObject: steb.connector.getInitSimObject}}
 */

/* global stella, alert, codapHelper */

stella.connector = {
    starCaseID: 0,
    spectrumCaseID: 0,
    spectrumNumber : 0,
    spectraCollectionName: "spectra",
    catalogCollectionName: "starCatalog",

    /**
     * Called when we create a case for a new game
     * @param iValues      object containing values to be stored
     */
    newGameCase: function (iValues) {

        codapHelper.createCase(
            this.gameCollectionName,
            {values: iValues},       //  format for new API, no parent.
            function (iResult) {
                if (iResult.success) {
                    this.gameCaseID = iResult.values[0].id;
                    stella.manager.emitStarsData();  //      to get data at beginning of game
                } else {
                    alert("Error creating new game case");
                }

            }.bind(this)
        );
    },

    /**
     * Called to rewrite and close a game-level case
     * @param iResult {string}  result of the game
     */
    finishGameCase: function (iResult) {
        codapHelper.updateCase(
            this.gameCollectionName,
            {values: {result: iResult}},
            this.gameCaseID,
            null        //  no callback
        );
        this.gameCaseID = 0;     //  so we know there is no open case
    },

    /**
     * Create a new case in the middle-in-the-hierarchy "bucket" collection in the BART game.
     * @param iValues {*} Object containing values to be stored
     * @param iCallback     the callback function
     */
    newBucketCase: function (iValues, iCallback) {
        this.bucketNumber += 1;     //  not currently stored

        codapHelper.createCase(
            this.bucketCollectionName,
            {
                parent: this.gameCaseID,
                values: iValues
            },
            iCallback               //  needed to figure out the bucket case ID
        );
    },

    /**
     * Emit a "star" case, low level in the hierarchy.
     * One case per Star.
     * @param {[*]} iValues   the data values to be passed
     */
    doStarCatalogRecord: function (iValues) {
        codapHelper.createCase(
            this.catalogCollectionName,
            {
                parent: this.gameCaseID,      //  this.bucketCaseID,
                values: iValues
            }
        ); // no callback.
    },

    emitSpectrum: function ( iChannels, iName ) {

        this.currentSpectrumName = iName;
        this.spectrumNumber += 1;

        codapHelper.createCase(
            this.spectraCollectionName,
            [
                this.spectrumNumber,
                iName
            ],
            function (iResult) {
                this.spectrumCaseID = iResult.caseID;
                iChannels.forEach(function (ch) {
                    stella.connector.emitChannel(ch);
                });

            }.bind(this)
        );
    },

    emitChannel: function ( iChannel ) {
        codapHelper.createCase(
            this.channelCollectionName,
            [
                iChannel.min.toFixed(5),
                iChannel.intensity.toFixed(2)
            ],
            this.spectrumCaseID
        ); // no callback.
    },


    /**
     * Initialize the frame structure
     * @returns {{name: string, title: string, version: string, dimensions: {width: number, height: number}}}
     */
    getInitFrameObject: function () {

        return {
            name: 'Stella',
            title: 'Stella',
            version: stella.constants.version,
            dimensions: {width: 380, height: 500}
        };
    },

    /**
     * Initialize the data set
     * @returns {{name: string, title: string, description: string, collections: *[]}}
     */
    getInitStarCatalogObject: function () {
        return {
            name: this.catalogCollectionName,
            title: 'Star Catalog',
            description: 'the Stella star catalog',
            collections: [

                {
                    name: this.catalogCollectionName,
                    parent: null,       //  this.gameCollectionName,    //  this.bucketCollectionName,
                    labels: {
                        singleCase: "star",
                        pluralCase: "stars",
                        setOfCasesWithArticle: "star catalog"
                    },

                    attrs: [
                        {name: "date", type: 'numeric', precision: 1, description: "date of observation(mjd)"},
                        {name: "m", type: 'numeric', precision: 2, description: "apparent magnitude"},
                        {name: "x", type: 'numeric', precision: 3, description: "angle in x (degrees)"},
                        {name: "y", type: 'numeric', precision: 3, description: "angle in y (degrees)"},
                        {name: "id", type: 'numeric', precision: 3, description : "Stellar ID string"},
                        {name: "name", type: 'categorical'}
                    ]
                }
            ]
        };
    },

    getInitSpectraDataSetObject: function () {
        return {
            name: this.spectrumCollectionName,
            title: 'Spectra',
            description: 'stellar spectra',

            collections: [  // There are two collections: spectra, channels
                {
                    name: this.spectrumCollectionName,
                    labels: {
                        singleCase: "spectrum",
                        pluralCase: "spectra",
                        setOfCasesWithArticle: "a bunch of spectra"
                    },
                    // The parent collection spec:
                    attrs: [
                        {name: "specNum", type: 'categorical'},
                        {name: "name", type: 'categorical', description: "the name of the spectrum"}
                    ],
                    childAttrName: "channel"
                },
                {
                    name: this.channelCollectionName,
                    labels: {
                        singleCase: "channel",
                        pluralCase: "channels",
                        setOfCasesWithArticle: "a spectrum"
                    },
                    // The child collection specification:
                    attrs: [
                        {name: "lambda", type: 'numeric', precision: 5, description: "wavelength (nm)"},
                        {name: "int", type: 'numeric', precision: 1, description: "intensity (out of 100)"}
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
    stella.connector.getInitFrameObject(),
    stella.manager.stellaDoCommand         //  the callback needed
);

codapHelper.initDataSet(stella.connector.getInitSpectraDataSetObject());
codapHelper.initDataSet(stella.connector.getInitStarCatalogObject());

