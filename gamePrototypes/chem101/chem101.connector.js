/**
 * Created by tim on 10/26/16.


 ==========================================================================
 chem101.connector.js in gamePrototypes.

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



chem101.connector = {

    transferDataSetName : "transfers",
    transferDataSetTitle : "Transfers",
    transferCollectionName : "transfers",

    chemTransfer : null,

    /**
     * Emit a "result" record of the user's work
     * @param iValues
     * @param iCallback
     */
    emitTransfer : function( iTransfer ) {
        this.chemTransfer = iTransfer;

        codapHelper.createCase(
            this.transferCollectionName,
            {   values : this.chemTransfer.getValues()    },
            function( iResult) {
                this.chemTransfer.setCaseID(iResult.values[0].id);     //  need this to update this case

            }.bind(this),           //  callback
            this.transferDataSetName
        );
    },

    updateTransfer : function ( ) {
        codapHelper.updateCase(
            {values: this.chemTransfer.getValues()},
            this.chemTransfer.caseID,
            this.transferCollectionName,    // iCollectionName,
            this.transferDataSetName,   // iDataContextName,
            null        //  no callback?
        );
    },

    /**
     * Initialize the frame structure
     * @returns {{name: string, title: string, version: string, dimensions: {width: number, height: number}}}
     */
    getInitFrameObject: function () {

        return {
            name: 'Chem101',
            title: 'Chem 101 ',
            version: chem101.constants.version,
            dimensions: {width: 444, height: 500}
        };
    },

    /**
     * Initialize the Transfer data set
     * @returns {{name: string, title: string, description: string, collections: *[]}}
     */
    getTransferDataSetObject: function () {
        return {
            name: this.transferDataSetName,
            title: this.starResultsDataSetTitle,
            description: 'the Chem 101 transfer data set',
            collections: [

                {
                    name: this.transferCollectionName,
                    parent: null,       //  this.gameCollectionName,    //  this.bucketCollectionName,
                    labels: {
                        singleCase: "transfer",
                        pluralCase: "transfers",
                        setOfCasesWithArticle: "the transfer data set"
                    },

                    attrs: [
                        {name: "when", type: 'date', description: "transfer time"},
                        {name: "amount", type: 'numeric', precision: 3, description: "how much"},
                        {name: "units", type: 'categorical', description: "units of the amount"},
                        {name: "what", type: 'categorical', description: "what"},
                        {name: "from", type: 'categorical', description: "from where"},
                        {name: "to", type: 'categorical', description: "to where"}
                    ]
                }
            ]
        };
    },
};


/**
 * We call this to initialize the data interactive.
 * Two parameters: an object containing the organization of the data,
 * and a callback function when a doCommand is issued.
 * (We'll use it for save and restore)
 */

function startCodapConnection() {

    codapHelper.initDataInteractive(
        chem101.connector.getInitFrameObject(),
        chem101.manager.chem101DoCommand         //  the callback needed
    );

    codapHelper.initDataSet(chem101.connector.getTransferDataSetObject(),
        function () {
            console.log("last data set done!");
            chem101.initialize();
        }
    );
}

