/**
 * Created by tim on 3/6/17.


 ==========================================================================
 clinic.js in gamePrototypes.

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


var clinic = {
    constants: {
        kVersion: "001b",
        kName: "clinic",
        kDimensions: {width: 256, height: 512},

        kRecordsDataSetName: "records",
        kRecordsGameCollectionName : "games",
        kRecordsPatientsCollectionName : "patients",
        kRecordsCollectionName : "records",

        kPopulationDataSetName : "population",
        kPopulationDataSetTitle : "Population",
        kPopulationCollectionName : "population"
    },

    state: {},
    population: [],

    setUp: function () {
        var tPluginConfiguration = {
            name: clinic.constants.kName,
            title: clinic.constants.kName,
            version: clinic.constants.kVersion,
            dimensions: clinic.constants.kDimensions
        };

        codapInterface.init(tPluginConfiguration, null).then(function () {

            var tInitDatasetPromises = [
                pluginHelper.initDataSet(clinic.codapConnector.recordsDataContextSetupString),
                pluginHelper.initDataSet(clinic.codapConnector.populationDataContextSetupString)
            ];

            Promise.all(tInitDatasetPromises).then(function () {

                clinic.constructPopulationArray();      //  make clinic.population and fill the CODAP dataset

                clinic.state = codapInterface.getInteractiveState();
                if (jQuery.isEmptyObject(clinic.state)) {
                    codapInterface.updateInteractiveState( clinic.freshState() );
                }

                if (!clinic.state.score) {
                    clinic.state.score = 42;
                }

                //  register to receive notifications about selection
                codapInterface.on(
                    'notify',
                    'dataContextChangeNotice[' + clinic.constants.kPopulationDataSetName + ']',
                    'selectCases',
                    clinic.selectionManager.processCodapCaseSelection
                );
                codapInterface.on(
                    'notify',
                    'dataContextChangeNotice[' + clinic.constants.kRecordsDataSetName + ']',
                    'selectCases',
                    clinic.selectionManager.processCodapCaseSelection
                );

                clinicManager.start();
            })
        });
    },

    freshState: function () {
        return {
            score: 0,
            now: new Date()
        }
    },

    constructPopulationArray : function() {
        clinic.initialPeople.forEach( function(p) {
            tPatient = new Patient(p);
            clinic.population.push( tPatient );       //   our internal array of Patients
            clinic.codapConnector.createPopulationItem(tPatient.populationValueObject());   //  CODAP case
        })
    }

}