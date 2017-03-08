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

        var tCases = pluginHelper.arrayify(iCommand.values.result.cases);
        console.log("Selection! " + JSON.stringify(tCases));

        if (tDataContextName === clinic.constants.kPopulationDataSetName) {
            /*
             The selection is in the population dataset
             Loop through and select all corresponding cases in the records.
             */
            var tRecordsSearches = [];      //  will contain promises
            var tSelectionList = [];        //  will contain CODAP caseIDs.

            tCases.forEach(function (iCase) {
                var tOnePatientID = iCase.values.id;    //  this is the patient ID, e.g., SFP0056
                //  create the message to search for this single case in the records data set
                var tSearchMessage = {
                    "action": "get",
                    "resource": "dataContext[" + clinic.constants.kRecordsDataSetName + "].collection["
                    + clinic.constants.kRecordsCollectionName + "].caseSearch[id==" + tOnePatientID + "]"
                };

                //  search for that patient ID in the records...

                var tRecordsSearch = codapInterface.sendRequest(tSearchMessage).then(
                    function (iResponse) {
                        iResponse.values.forEach(function (v) {     //  loop over all cases fro that ID
                                tSelectionList.push(v.id);          //  add their case IDs to the selection list
                            }
                        )
                    }
                )

                tRecordsSearches.push(tRecordsSearch)      //  add to array of Promises, so we can tell when they're all done.

            });
            Promise.all(tRecordsSearches).then( function(iResult) {
                //  now we have all the CODAP caseIDs associated with all the patient IDs
                //  so make the selection
                var tSelectionMessage = {
                    "action": "create",
                    "resource": "dataContext[records].selectionList",
                    "values": tSelectionList
                };
                codapInterface.sendRequest( tSelectionMessage );    //  do the (multiple) selection
            });

        } else {
            /*  the selection is in the records dataset, somewhere. Don't know which collection.

             */

        }


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
