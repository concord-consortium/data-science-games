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

/* global stella, alert, codapHelper, console */

stella.connector = {
    starCaseID: 0,
    spectrumCaseID: 0,
    spectrumNumber : 0,
    spectraCollectionName: "spectra",
    starResultsCollectionName: "results",
    channelCollectionName: "channels",
    catalogCollectionName: "starCatalog",
    catalogDataSetName : "starCatalog",
    catalogDataSetTitle : "Star Catalog",
    spectraDataSetName : "spectra",
    spectraDataSetTitle : "Stellar Spectra",
    starResultsDataSetName : "results",
    starResultsDataSetTitle : "Your Results",


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

    /**
     * Emit a "result" record of the user's work
     * @param iValues
     * @param iCallback
     */
    emitStarResult : function( iStarResult, iCallback ) {
        codapHelper.createCase(
            this.starResultsCollectionName,
            {
                values : {
                    date: iStarResult.date,
                    id: iStarResult.id,
                    type: iStarResult.type,
                    value: iStarResult.enteredValue,
                    units: iStarResult.units,
                    points: iStarResult.points
                }
            },
            iCallback,           //  callback
            this.starResultsDataSetName
        );
    },

    /**
     * Emit a whole spectrum
     * @param iChannels the array of channels (each is an object)
     * @param iName     the name of the spectrum (star or lab designation)
     */
    emitSpectrum: function ( iChannels, iName ) {

        this.spectrumNumber += 1;       //      serial

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
                this.spectrumCaseID = iResult.values[0].id;     //  need for the channels sub-collection
                iChannels.forEach(function (ch) {
                    stella.connector.emitSpectrumChannel(ch);   //  send that channel
                });

            }.bind(this),
            this.spectraDataSetName
        );
    },

    /**
     * emit a single channel
     * todo: consider constructing an array and creating this whole collection in a single call with CreateCases
     * @param iChannel
     */
    emitSpectrumChannel: function (iChannel ) {
        codapHelper.createCase(
            this.channelCollectionName,
            {
                parent : this.spectrumCaseID,
                values : {
                    wavelength : iChannel.min.toFixed(5),
                    intensity :   iChannel.intensity.toFixed(2)
                }
            },
            null,       //  no callback
            this.spectraDataSetName
        );
    },

    /**
     * We have case IDs for the stars! Tell CODAP to select this star.
     * @param iCaseID
     */
    selectStarInCODAPByCatalogID : function( iCaseID ) {
        var theIDs = [ iCaseID ];
        codapHelper.selectCasesByIDs( theIDs, this.catalogDataSetName );

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
            dimensions: {width: 444, height: 500}
        };
    },

    /**
     * Initialize the Results data set
     * @returns {{name: string, title: string, description: string, collections: *[]}}
     */
    getStarResultsDataSetObject: function () {
        return {
            name: this.starResultsDataSetName,
            title: this.starResultsDataSetTitle,
            description: 'the Stella results data set',
            collections: [

                {
                    name: this.starResultsCollectionName,
                    parent: null,       //  this.gameCollectionName,    //  this.bucketCollectionName,
                    labels: {
                        singleCase: "result",
                        pluralCase: "results",
                        setOfCasesWithArticle: "the results data set"
                    },

                    attrs: [
                        {name: "date", type: 'numeric', precision: 3, description: "date of result (yr)"},
                        {name: "id", type: 'categorical', description : "stellar ID string"},
                        {name: "type", type: 'categorical', description: "result type"},
                        {name: "value", type: 'numeric', precision: 8, description: "result value"},
                        {name: "units", type: 'categorical', description: "units of the result"},
                        {name: "points", type: 'numeric', description: "points awarded"},
                    ]
                }
            ]
        };
    },

    /**
     * Initialize the Spectrum
     * @returns {{name: string, title: string, description: string, collections: *[]}}
     */
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
                        {name: "date", type: 'numeric', precision: 3, description: "date of observation (yr)"},
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
                        {name: "wavelength", type: 'numeric', precision: 5, description: "wavelength (nm)"},
                        {name: "intensity", type: 'numeric', precision: 1, description: "intensity (out of 100)"}
                    ]
                }
            ]
        };
    },

    /**
     * Initialize the Catalog data set
     * @returns {{name: string, title: string, description: string, collections: *[]}}
     */
    getInitStarCatalogDataSetObject: function () {
        return {
            name: this.catalogDataSetName,
            title: this.catalogDataSetTitle,
            description: 'stella star catalog',
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
                        {name: "date", type: 'numeric', precision: 3, description: "date of observation (yr)"},
                        {name: "id", type: 'categorical',  description : "Stellar ID string"},
                        {name: "bright", type: 'numeric', precision: 2, description: "luminosity"},
                        {name: "logBright", type: 'numeric', precision: 2, description: "log luminosity"},
                        {name: "m", type: 'numeric', precision: 2, description: "apparent magnitude"},
                        {name: "U", type: 'numeric', precision: 2, description: "apparent magnitude in U"},
                        {name: "B", type: 'numeric', precision: 2, description: "apparent magnitude in B"},
                        {name: "V", type: 'numeric', precision: 2, description: "apparent magnitude in V"},
                        {name: "x", type: 'numeric', precision: 6, description: "angle in x (degrees)"},
                        {name: "y", type: 'numeric', precision: 6, description: "angle in y (degrees)"},
                        {name: "name", type: 'categorical'}
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

codapHelper.initDataSet(stella.connector.getInitStarCatalogDataSetObject());
codapHelper.initDataSet(stella.connector.getStarResultsDataSetObject());
codapHelper.initDataSet(stella.connector.getInitSpectraDataSetObject(), function() {
    console.log("last data set done!");
    stella.initialize();
});

