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

    options : {},

    constants: {
        kVersion: "001b",
        kName: "clinic",
        kJitter : 0.0002,   //  lat, long jitter in radians
        kDimensions: {width: 333, height: 600},

        kClinicOpenHour : 8,
        kClinicCloseHour : 18,

        kRecordsDataSetName: "records",
        kRecordsGameCollectionName : "games",
        kRecordsPatientsCollectionName : "patientsAtClinic",
        kRecordsCollectionName : "records",

        kPopulationDataSetName : "population",
        kPopulationDataSetTitle : "Population",
        kPopulationCollectionName : "population"
    },

    state: {},

    goToTabNumber : function(iTab) {
        $( "#tabs" ).tabs(  "option", "active", iTab );
    },

    setUp: function () {

        $('#newGameButton').hide();
        $('#commands').hide();

        $('#currentStatus').text("starting up");

        var tPluginConfiguration = {
            name: clinic.constants.kName,
            title: clinic.constants.kName,
            version: clinic.constants.kVersion,
            dimensions: clinic.constants.kDimensions,

            preventDataContextReorg: false
        };

        codapInterface.init(tPluginConfiguration, null).then(function () {

            //  restore the state

            clinic.state = codapInterface.getInteractiveState();
            if (jQuery.isEmptyObject(clinic.state)) {
                codapInterface.updateInteractiveState( clinic.freshState() );
            }

            if (!clinic.state.score) {
                clinic.state.score = 42;
            }

            //  initialize datasets
            // todo: do we have to init data sets if we're coming back from save??

            var tInitDatasetPromises = [
                pluginHelper.initDataSet(clinic.codapConnector.recordsDataContextSetupString),
                pluginHelper.initDataSet(clinic.codapConnector.populationDataContextSetupString)
            ];

            Promise.all(tInitDatasetPromises).then(function () {

                $('#currentStatus').text("reading in population");

                clinic.model.constructDwellingArray();      //  make clinic.dwellings
                clinic.model.constructPopulationArray();      //  make clinic.population and fill the CODAP dataset

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
            health : {},        //  keys are the patient IDs. Values are objects with health-related data
            now: new Date()
        }
    },

    optionsChange : function() {
        clinic.options.virusA1B1 = document.getElementById("virusA1B1").checked;
    }

}