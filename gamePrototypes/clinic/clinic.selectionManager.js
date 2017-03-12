/**
 * Created by tim on 3/7/17.


 ==========================================================================
 clinic.selectionManager.js in gamePrototypes.

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
 * Cope with selection in various configurations.
 *
 * (1) When user selects a case in the *population* data set,
 *      select relevant cases, if any, in the *records* data set.
 *      Note how this could begin by selection on a map.
 * (2) When the user selects in the *records* data set, select in the *population.*
 *
 * The right strategy is not obvious initially.
 * One possiblity is to get the selected set in a new CODAP request.
 *
 * @type {{processCodapCaseSelection: clinic.selectionManager.processCodapCaseSelection}}
 */
clinic.selectionManager = {

    processCodapCaseSelection: function (iCommand, iCallback) {
        console.log("clinic.selectionManager.processCodapNotification: enter handler.");
        var tResourceString = iCommand.resource;
        tParsedResourceSelector = codapInterface.parseResourceSelector(tResourceString);
        tDataContextName = tParsedResourceSelector.dataContextChangeNotice;

        var tCases = (iCommand.values.result.cases) ? pluginHelper.arrayify(iCommand.values.result.cases) : [];
        console.log("Selection! " + tCases.length + " cases.");

        if (tDataContextName === clinic.constants.kPopulationDataSetName) {
            /*
             The selection is in the population dataset
             Loop through and select all corresponding cases in the records.
             */
            var tRecordsSearches = [];      //  will contain promises
            var tSelectionList = [];        //  will contain CODAP caseIDs.

            tCases.forEach(function (iCase) {
                var tOnePatientID = iCase.values.id;    //  this is the patient ID, e.g., SFP0056

                //  search for that patient ID in the records...

                //  create the message to search for this single patientID in the records data set
                var tSearchMessage = {
                    "action": "get",
                    "resource": "dataContext[" + clinic.constants.kRecordsDataSetName + "].collection["
                    + clinic.constants.kRecordsPatientsCollectionName + "].caseSearch[id==" + tOnePatientID + "]"
                };

                //  execute the search

                var tRecordsSearch = codapInterface.sendRequest(tSearchMessage).then(
                    function (iResponse) {
                        iResponse.values.forEach(function (v) {     //  loop over all cases fro that ID
                                tSelectionList.push(v.id);          //  add their case IDs to the selection list
                            }
                        )
                    }
                );

                tRecordsSearches.push(tRecordsSearch)      //  add to array of Promises, so we can tell when they're all done.

            });

            //  Only when all the records searches are done will we select the cases by caseID.

            Promise.all(tRecordsSearches).then( function(iResult) {
                //  now we have all the CODAP caseIDs associated with all the patient IDs
                //  so make the selection
                clinic.selectionManager.selectTheseCaseIDs( tSelectionList, clinic.constants.kRecordsDataSetName);
            });

        } else {
            /*  the selection is in the records dataset, somewhere. Don't know which collection.
                for now, assume it's in the patients collection because that's where the PatientID is.
             */
            /*
             Loop through and select all corresponding cases in the population.
             */
            var tPopulationSearches = [];      //  will contain promises
            var tSelectionList = [];        //  will contain CODAP caseIDs.

            //  we have a list of cases that are selected in records. Loop thorugh them, look at each one...

            tCases.forEach(function (iCase) {
                var tOnePatientID = iCase.values.id;    //  this is the patient ID, e.g., SFP0056

                //  if the ID exists at this level, search for that patient ID in the population...

                if (true) {
                    //  create the message to search for this single patientID in the population data set
                    //  goal: find all of their case IDs.
                    //  stash them in tSelectionList

                    var tSearchMessage = {
                        "action": "get",
                        "resource": "dataContext[" + clinic.constants.kPopulationDataSetName
                        + "].collection[" + clinic.constants.kPopulationCollectionName
                        + "].caseSearch[id==" + tOnePatientID + "]"
                    };

                    //  execute the search

                    var tPopulationSearch = codapInterface.sendRequest(tSearchMessage).then(
                        function (iResponse) {
                            iResponse.values.forEach(function (v) {     //  loop over all cases from that ID
                                    tSelectionList.push(v.id);          //  add their case IDs to the selection list
                                }
                            )
                        }
                    );

                    tPopulationSearches.push(tPopulationSearch)      //  add to array of Promises, so we can tell when they're all done.
                }

            });

            //  Only when all the records searches are done will we select the cases by caseID.

            Promise.all(tPopulationSearches).then( function(iResult) {
                //  now we have all the CODAP caseIDs associated with all the patient IDs
                //  so make the selection
                clinic.selectionManager.selectTheseCaseIDs( tSelectionList, clinic.constants.kPopulationDataSetName);
            });
        }
    },

    selectTheseCaseIDs : function( iList, iDataContextName ) {
        iList = pluginHelper.arrayify( iList );

        var tSelectionMessage = {
            "action": "create",
            "resource": "dataContext[" + iDataContextName + "].selectionList",
            "values": iList
        };
        codapInterface.sendRequest( tSelectionMessage );    //  do the (multiple) selection

    },

    selectThisPersonInAllDataSets : function(iPerson ) {
        var tOnePatientID = iPerson.patientID;

        var tRecordsSearchMessage = {
            "action": "get",
            "resource": "dataContext[" + clinic.constants.kRecordsDataSetName + "].collection["
            + clinic.constants.kRecordsPatientsCollectionName + "].caseSearch[id==" + tOnePatientID + "]"
        };

        var tPopulationSearchMessage = {
            "action": "get",
            "resource": "dataContext[" + clinic.constants.kPopulationDataSetName + "].collection["
            + clinic.constants.kPopulationCollectionName + "].caseSearch[id==" + tOnePatientID + "]"
        };

        var tCaseID = 0;
        codapInterface.sendRequest( tRecordsSearchMessage ).then(
            function (iResponse) {
                if (iResponse.success && iResponse.values.length > 0) {
                    tCaseID = iResponse.values[0].id;          //  get the first IDs to the selection list
                    clinic.selectionManager.selectTheseCaseIDs(tCaseID, clinic.constants.kRecordsDataSetName);
                }
            }
        );
        codapInterface.sendRequest( tPopulationSearchMessage ).then(
            function (iResponse) {
                if (iResponse.success && iResponse.values.length > 0) {
                    tCaseID = iResponse.values[0].id;          //  get the first IDs to the selection list
                    clinic.selectionManager.selectTheseCaseIDs(tCaseID, clinic.constants.kPopulationDataSetName);
                }
            }
        );
    }

};


/*
{
    "success"
:
    true,
        "values"
:
    [
        {
            "id": 1161,
            "parent": null,
            "collection": {
                "name": "population",
                "id": 19
            },
            "values": {
                "name": "JENIFER WANG",
                "age": 47,
                "sex": "female",
                "address": "5800 3rd Street #1310",
                "lat": 37.725305449737945,
                "long": -122.39425714443917,
                "last": "WANG",
                "first": "JENIFER",
                "id": "SFP1133"
            }
        },
*/
