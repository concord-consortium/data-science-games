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
    channelCollectionName: "channels",
    catalogCollectionName: "starCatalog",
    catalogDataSetName : "starCatalog",
    catalogDataSetTitle : "Star Catalog",
    spectraDataSetName : "spectra",
    spectraDataSetTitle : "Stellar Spectra",


    /**
     * Emit a "star" case, into the star catalog.
     * One case per Star.
     * @param {[*]} iValues   the data values to be passed
     */
    emitStarCatalogRecord: function (iValues, iCallback) {
        codapHelper.createCase(
            this.catalogCollectionName,
            {
                values: iValues
            },
            iCallback,   //  callback is in .manager. To record the case ID (for selection work)
            this.catalogDataSetName
        );
    },

    emitSpectrum: function ( iChannels, iName ) {

        this.currentSpectrumName = iName;
        this.spectrumNumber += 1;

        codapHelper.createCase(
            this.spectraCollectionName,
            {
                values: {
                    specNum: this.spectrumNumber,
                    name: iName,
                    date: stella.model.now
                }
            },
            function (iResult) {
                this.spectrumCaseID = iResult.values[0].id;
                iChannels.forEach(function (ch) {
                    stella.connector.emitSpectrumChannel(ch);
                });

            }.bind(this),
            this.spectraDataSetName
        );
    },

    emitSpectrumChannel: function (iChannel ) {
        codapHelper.createCase(
            this.channelCollectionName,
            {
                parent : this.spectrumCaseID,
                values : {
                    lambda : iChannel.min.toFixed(5),
                    int :   iChannel.intensity.toFixed(2)
                }
            },
            null,       //  no callback
            this.spectraDataSetName
        );
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
            dimensions: {width: 400, height: 500}
        };
    },

    /**
     * Initialize the data set
     * @returns {{name: string, title: string, description: string, collections: *[]}}
     */
    getInitStarCatalogObject: function () {
        return {
            name: this.catalogDataSetName,
            title: this.catalogDataSetTitle,
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
                        {name: "date", type: 'numeric', precision: 3, description: "date of observation(yr)"},
                        {name: "id", type: 'numeric', precision: 3, description : "Stellar ID string"},
                        {name: "m", type: 'numeric', precision: 2, description: "apparent magnitude"},
                        {name: "U", type: 'numeric', precision: 2, description: "apparent magnitude"},
                        {name: "B", type: 'numeric', precision: 2, description: "apparent magnitude"},
                        {name: "V", type: 'numeric', precision: 2, description: "apparent magnitude"},
                        {name: "x", type: 'numeric', precision: 3, description: "angle in x (degrees)"},
                        {name: "y", type: 'numeric', precision: 3, description: "angle in y (degrees)"},
                        {name: "name", type: 'categorical'}
                    ]
                }
            ]
        };
    },

    getInitSpectraDataSetObject: function () {
        return {
            name: this.spectraDataSetName,
            title: this.spectraDataSetTitle,
            description: 'stellar spectra',

            collections: [  // There are two collections: spectra, channels
                {
                    name: this.spectraCollectionName,
                    labels: {
                        singleCase: "spectrum",
                        pluralCase: "spectra",
                        setOfCasesWithArticle: "a bunch of spectra"
                    },

                    attrs: [
                        {name: "specNum", type: 'categorical'},
                        {name: "date", type: 'numeric', precision: 3, description: "date of observation"},
                        {name: "name", type: 'categorical', description: "the name of the spectrum"}

                    ],
                    childAttrName: "channel"
                },
                {
                    name: this.channelCollectionName,
                    parent: this.spectraCollectionName,
                    labels: {
                        singleCase: "channel",
                        pluralCase: "channels",
                        setOfCasesWithArticle: "a spectrum"
                    },

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

codapHelper.initDataSet(stella.connector.getInitStarCatalogObject());
codapHelper.initDataSet(stella.connector.getInitSpectraDataSetObject());

