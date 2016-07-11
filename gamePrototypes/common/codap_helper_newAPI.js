/**
 * Created by bfinzer on 2/7/15.
 * updated for new API by Tim and Jonathan, 2016-05-25
 */

/* global console, iframePhone */

var codapHelper = {
    codapPhone: null,
    initFrameAccomplished: false,
    initDataSetAccomplished: false,
    alerted : false,

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

    initDataSet : function( iDataSetDescription, iCallback ) {
        this.codapPhone.call(
            {
                action: 'create',
                resource: 'dataContext',
                values: iDataSetDescription
            },
            function (iResult) {
                if (iResult.success) {
                    this.initDataSetAccomplished = true;
                    if (iCallback) {
                        iCallback();
                    }
                }

            }.bind(this));
    },

    checkForCODAP: function () {

        if (!this.initDataSetAccomplished) {
            if (!this.alerted) {
                window.alert('Please drag my URL to a CODAP document.');
                this.alerted = true;
            }
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

    updateCase: function (iValues, iCaseID, iCollectionName, iDataContextName, iCallback) {
        console.log("Update case " + iCaseID + " in " + iCollectionName);

        this.codapPhone.call({
                action: 'update',
                resource: this.resourceString( iCollectionName, iDataContextName ) + ".caseByID[" + iCaseID + "]",
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

    sendSaveObject : function( iSaveObject, iCallback) {
        this.codapPhone.call( iSaveObject, iCallback );
    },

    resourceString : function( iCollectionName, iDataContextName) {
        var oResourceString = 'collection[' + iCollectionName + ']';
        if (typeof iDataContextName !== 'undefined') {
            oResourceString = 'dataContext\[' + iDataContextName + "]." + oResourceString;
        }
        return oResourceString;
    }

};

