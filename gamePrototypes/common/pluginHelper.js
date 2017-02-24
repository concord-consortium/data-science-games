/**
 * Created by tim on 1/19/17.


 ==========================================================================
 pluginHelper.js in gamePrototypes.

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

var pluginHelper = {
    initDataSet: function (iDataSetDescription) {
        return new Promise( function( resolve, reject ) {
            var tDataContextResourceString = 'dataContext[' + iDataSetDescription.name + ']';
            var tMessage = { action: 'get', resource: tDataContextResourceString };
            var tAlreadyExistsPromise = codapInterface.sendRequest( tMessage );

            tAlreadyExistsPromise.then(
                function( iValue ) {
                    if (iValue.success) {
                        console.log("dataContext[" + iDataSetDescription.name + "] already exists");
                        resolve( iValue );
                    } else {
                        console.log("Creating dataContext[" + iDataSetDescription.name + "]" );
                        tMessage = {
                            action: 'create',
                            resource: 'dataContext',
                            values: iDataSetDescription
                        };
                        codapInterface.sendRequest( tMessage ).then(
                            function( iValue ) {
                                resolve( iValue );
                            }
                        );
                    }
                }
            ).catch (function (msg) {
                console.log('warning in pluginHelper.initDataSet: ' + msg);
                reject( msg );
            });
        });
    },

    /**
     * Create new data items (broader than cases; see the documentation for the API)
     * Notes: (1) this refers only to the data context, not to any collections. Right? Has to.
     * (2) notice how the values array does not have a "values" key inside it as with createCases.
     *
     * @param iValuesArray  the array (or not) of objects, each of which will be an item. The keys are attribute names.
     * @param iDataContextName  the name of the data set (or "data context").
     */
    createItems : function(iValuesArray, iDataContextName, iCallback) {
        iValuesArray = pluginHelper.arrayify( iValuesArray );

        var tResourceString = iDataContextName ? "dataContext[" + iDataContextName + "].item" : "item";

        var tMessage = {
            action : 'create',
            resource : tResourceString,
            values : iValuesArray
        };

        var tCreateItemsPromise = codapInterface.sendRequest( tMessage, iCallback );
        return tCreateItemsPromise;
    },

    createCases : function(iValues, iCollection, iDataContext, iCallback) {
        iValues = pluginHelper.arrayify( iValues );
        console.log("DO NOT CALL pluginHelper.createCases YET!!");
    },

    selectCasesByIDs: function (IDs, iDataContextName) {
        IDs = pluginHelper.arrayify( IDs );

        var tResourceString = "selectionList";

        if (typeof iDataContextName !== 'undefined') {
            tResourceString = 'dataContext[' + iDataContextName + '].' + tResourceString;
        }

        var tMessage = {
            action: 'create',
            resource: tResourceString,
            values: IDs
        };

        var tSelectCasesPromise = codapInterface.sendRequest(tMessage);
        return tSelectCasesPromise;
    },

    arrayify : function( iValuesArray ) {
        if (iValuesArray && !Array.isArray(iValuesArray)) {
            iValuesArray = [iValuesArray];
        }
        return iValuesArray;
    }

}