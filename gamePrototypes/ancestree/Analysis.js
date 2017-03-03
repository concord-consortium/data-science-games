/**
 * Created by tim on 8/19/16.


 ==========================================================================
 analysis.js in data-science-games.

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

/* global $, codapHelper, console, iframePhone, alert */

var Analysis = function (iHost ) {

    this.host = iHost;            //  the object that has invoked this analysis

    this.dataContexts = [];
    this.currentDataContextName = "";

    this.collections = [];
    this.currentCollectionName = "";

    this.attributes = [];
    this.currentAttributeName = "";

    this.cases = [];

    this.codapPhoneExists = false;

};

Analysis.prototype.initialize = function ( iFrameDescription ) {
    console.log("Analysis.initialize()");
    this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(this.doCommand, "data-interactive", window.parent);
    this.codapPhone.call(
        {
            action: 'update',
            resource: 'interactiveFrame',
            values: iFrameDescription
        },
        function (iResult) {
            console.log("update interactiveFrame complete, iResult is " + JSON.stringify(iResult));
            if (iResult !== 'undefined') {
                this.codapPhoneExists = true;
                this.getListOfDataContexts();
            }

        }.bind(this)
    );
};

Analysis.prototype.getListOfDataContexts = function () {
    var tArg = {action: "get", resource: "dataContextList"};

    if (this.codapPhoneExists) {
        this.codapPhone.call(
            tArg,
            function (iResult) {
                console.log("Analysis.getListOfDataContexts, result: " + JSON.stringify(iResult));
                this.dataContexts = iResult.values;
                this.host.gotDataContextList(this.dataContexts);
            }.bind(this)
        );
    }
};

Analysis.prototype.specifyCurrentDataContext = function(iDCName ) {
    this.currentDataContextName = iDCName;

    //  Now that we have a new data context, we need to find the collections within it:

    var tArg = { action : "get", resource : "dataContext[" + this.currentDataContextName + "].collectionList" };
    this.codapPhone.call(
        tArg,
        function( iResult ) {
            this.collections = iResult.values;
            this.host.gotCollectionList( this.collections );
        }.bind(this)
    );

    console.log("Analysis.specifyCurrentDataContext: " + this.currentDataContextName);
};

Analysis.prototype.specifyCurrentCollection = function(iCollName ) {
    this.currentCollectionName = iCollName;

    // Now that we have the collection, we need to find the attributes within it!
    var tResource = "dataContext[" +
        this.currentDataContextName + "].collection[" +
        this.currentCollectionName + "].attributeList";
    console.log(tResource);
    var tArg =
        { action : "get", resource : tResource };
    this.codapPhone.call(
        tArg,
        function( iResult ) {
            this.attributes = iResult.values;
            this.host.gotAttributeList( this.attributes );
        }.bind(this)
    );

    this.retrieveCases( this.currentDataContextName, this.currentCollectionName);

    console.log("Analysis.specifyCurrentCollection: " + this.currentCollectionName);
};

Analysis.prototype.specifyCurrentAttribute = function(iAttName ) {
    this.currentAttributeName = iAttName;

    console.log("Analysis.specifyCurrentAttribute: " + this.currentAttributeName);

    //  now tell the values to the host
    var o = [];

    this.cases.forEach(
        function( c ) {
            o.push( c[this.currentAttributeName]);
        }.bind(this)
    );

    console.log("Analysis.reportValuesFor " + this.cases.length + " case(s): " + JSON.stringify(o));
    this.host.receiveValues( o );
};

Analysis.prototype.doCommand = function () {

};



Analysis.prototype.retrieveCases = function( iDC, iColl ) {
    // first get a list of cases

    var tResource = "dataContext[" + iDC + "].collection[" + iColl + "].caseCount";
    this.codapPhone.call(
        {action: "get", resource: tResource},
        function ( iResult ) {
            if (iResult.success) {
                var tCaseCount = (iResult.values);
                console.log("case count : " + JSON.stringify(iResult) + " t:" + typeof tCaseCount);
                this.cases = [];

                for (var i = 0; i < tCaseCount; i++) {
                    var tCaseResource = "dataContext[" + iDC + "].collection[" +
                        iColl + "].caseByIndex[" + i + "]";
                    //console.log("retrieveCases Case loop " + i + " cases: " + tCaseResource);
                    this.codapPhone.call(
                        {action : "get", resource : tCaseResource },
                        this.gotOneCase.bind(this)
                    );
                }
                this.host.gotCases( );
            } else {
                alert("Analysis.retrieveCases: failed to get the case count");
            }
        }.bind(this)
    );
};

Analysis.prototype.gotOneCase = function( iResult ) {
    if (iResult.success) {
        var tCase = iResult.values.case.values;
        this.cases.push( tCase );
        //  console.log("Analysis.gotOneCase: " + JSON.stringify( iResult ));
    } else {
        alert("Analysis.gotOneCase: failed to get the case data");
    }
};

