/**
 * Created by tim on 5/26/16.


 ==========================================================================
 spec.connect.js in data-science-games.

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


/* global spec, codapHelper */

spec.connect = {
    spectrumCaseID: 0,
    spectrumNumber: 0,
    spectrumCollectionName: "spectra",
    channelCollectionName: "channels",
    currentSpectrumName : "a spectrum",

    /**
     * Called when we create a case for a new game
     * @param iName      the name of the spectrum
     */
    emitSpectrum: function ( iChannels, iName ) {

        this.currentSpectrumName = iName;
        this.spectrumNumber += 1;

        codapHelper.openCase(
            this.spectrumCollectionName,
            [
                this.spectrumNumber,
                iName
            ],
            function (iResult) {
                this.spectrumCaseID = iResult.caseID;
                iChannels.forEach(function (ch) {
                    spec.connect.emitSpectrumChannel(ch);
                });

            }.bind(this)
        );
    },


    /**
     * Emit an "event" case, low level in the hierarchy.
     * One case per channel.
     * @param iChannel     one channel object
     */
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
     * Initializes the data structure.
     * @returns {{name: string, version: string, dimensions: {width: number, height: number}, collections: *[]}}
     */
    getInitSimObject: function () {

        var oInitSimObject = {
            name: this.spectrumCollectionName,
            version: spec.constants.version,
            dimensions: {width: 580, height: 400},
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
                        {name: "name", type: 'categorical', description : "the name of the spectrum"}
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
                        {name: "lambda", type: 'numeric', precision : 5, description : "wavelength (nm)"},
                        {name: "int", type: 'numeric', precision : 1, description : "intensity"}
                    ]
                }
            ]
        };

        return oInitSimObject;
    }

};

/**
 * We call this to initialize the simulation.
 * Two parameters: an object containing the organization of the data,
 * and a callback function when a doCommand is issued.
 * (We'll use it for save and restore)
 */
codapHelper.initSim(
    spec.connect.getInitSimObject(),
    spec.manager.specDoCommand         //  the callback needed
);

