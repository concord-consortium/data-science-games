/**
 * Created by bfinzer on 2/7/15.
 * updated for new API by Tim and Jonathan, 2016-05-25
 */

/* global console, iframePhone */

var codapHelper = {
    codapPhone: null,
    initFrameAccomplished: false,
    initDataSetAccomplished: false,

    initDataInteractive: function (iFrameDescription, doCommandFunc) {
        this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(doCommandFunc, "data-interactive", window.parent);

        this.codapPhone.call(
            {
                action: 'update',
                resource: 'interactiveFrame',
                values: iFrameDescription
            }, function (iResult) {
                if (iResult.success) {
                    this.initFrameAccomplished = true;
                }
            }.bind(this));
    },

    initDataSet : function( iDataSetDescription ) {
        this.codapPhone.call(
            {
                action: 'create',
                resource: 'dataContext',
                values: iDataSetDescription
            },
            function (iResult) {
                if (iResult.success) {
                    this.initDataSetAccomplished = true;
                }
            }.bind(this));
    },

    checkForCODAP: function () {

        if (!this.initDataSetAccomplished) {
            window.alert('Please drag my URL to a CODAP document.');
            return false;
        } else {
            return true;
        }

    },

    createCase: function (iCollectionName, iValuesArray, iCallback, iDataContextName) {
        this.createCases(iCollectionName, iValuesArray, iCallback, iDataContextName);
    },

    createCases: function (iCollectionName, iValuesArrays, iCallback, iDataContextName) {
        if (this.checkForCODAP()) {
            if (iValuesArrays && !Array.isArray(iValuesArrays)) {
                iValuesArrays = [iValuesArrays];
            }

            var tCodapPhoneArg = {
                action: 'create',
                resource: this.resourceString( iCollectionName, iDataContextName ) + ".case",
                values: iValuesArrays
            };

            this.codapPhone.call(tCodapPhoneArg, iCallback);
        }
    },

    updateCase: function (iCollectionName, iValues, iCaseID, iCallback) {
        console.log("Update case " + iCaseID + " in " + iCollectionName);
        if (iValues && !Array.isArray(iValues)) {
            iValues = [iValues];
        }
        this.codapPhone.call({
                action: 'update',
                resource: 'collection[' + iCollectionName + "].caseByID[" + iCaseID + "]",
                values: iValues
            },
            iCallback
        );
    },

    selectCasesByIDs: function (IDs, iDataContextName) {

        var tResourceString = "selectionList";

        if (typeof iDataContextName !== 'undefined') {
            tResourceString = 'dataContext\[' + iDataContextName + '].' + tResourceString;
        }

        this.codapPhone.call({
            action: 'create',
            resource: tResourceString,
            values: IDs
        });
    },

    getSelectionList : function( iDataContextName, iCallback ) {
        var tResourceString = "selectionList";

        if (typeof iDataContextName !== 'undefined' && iDataContextName !== null) {
            tResourceString = 'dataContext\[' + iDataContextName + '].' + tResourceString;
        }

        this.codapPhone.call(
            {
                action: 'get',
                resource: tResourceString
            },
            iCallback
        );
    },


    resourceString : function( iCollectionName, iDataContextName) {
        var oResourceString = 'collection[' + iCollectionName + ']';
        if (typeof iDataContextName !== 'undefined') {
            oResourceString = 'dataContext\[' + iDataContextName + "]." + oResourceString;
        }
        return oResourceString;
    }

};

