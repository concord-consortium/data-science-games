/**
 * Created by tim on 2/12/16.
 */

/**
 * A  manager class responsible for connecting to the CODAP environment
 * @constructor
 */
var farsCODAPConnector = function(  iGameCollectionName ) {
    this.gameCaseID = 0;
    this.gameNumber = 0;
    this.gameCollectionName = iGameCollectionName;
};

/**
 * Open a new "parent" case (the "game" level in the hierarchy)
 *
 * @param gameCollectionName
 * @param gameNumber
 */
farsCODAPConnector.prototype.newGameCase = function(iData ) {

    codapHelper.openCase(
        this.gameCollectionName,
        iData,
        function( iResult ) {
            //  this.gameCaseID = iResult.caseID;
        }.bind(this)
    );

};

/**
 * finishes the current game case
 */
farsCODAPConnector.prototype.finishGameCase = function(iData ) {
    codapHelper.closeCase(
        this.gameCollectionName,
        iData,
        this.gameCaseID
    );
    this.gameCaseID = 0;     //  so we know there is no open case
};

/**
 * Emit an "event" case, low level in the hierarchy.
 * @param values
 */
farsCODAPConnector.prototype.doEventRecord = function(values ) {
    codapHelper.createCase(
        'events',
        values,
        this.gameCaseID
    ); // no callback.

};

farsCODAPConnector.getInitSimObject = function() {

    var oInitSimObject = {
        name: 'FARS',
        version : fars.version,
        dimensions: {width: 160, height: 160},
        collections: [
            {
                name: 'people',
                labels: {
                    singleCase: "person",
                    pluralCase: "people",
                    setOfCasesWithArticle: "a sample"
                },
                // The parent collection spec:
                attrs: [
                    {name: "age", type: 'numeric'},
                    {
                        name: "injury",
                        type: 'categorical',
                        colormap : {
                            'death' : 'darkgray',
                            'serious' : 'red',
                            'minor' : 'orange',
                            'possible' : 'dodgerblue',
                            'none' : 'green'
                        }
                    },
                    {name: "ptype", type: 'categorical'},
                    {name: "sex", type: 'categorical'},
                    {
                        name: "restraint",
                        type: 'categorical',
                        colormap : {
                            'belt' : "green",
                            "child seat" : "blue",
                            "helmet" : "orange",
                            "none" : "red"
                        }
                    },
                    {name: "state", type: 'categorical'},
                    {name: "lat", type: 'numeric', precision: 8},
                    {name: "long", type: 'numeric', precision : 8}
                ]       //,
                        //childAttrName: "event"
            }           //,
            /*
            {
                name: 'events',
                labels: {
                    singleCase: "event",
                    pluralCase: "events",
                    setOfCasesWithArticle: "an epidemic"
                },
                // The child collection specification:
                attrs: [
                    {name: "time", type: 'numeric', unit: 'seconds', precision: 2},
                    {name: "name", type: 'categorical'},
                    {name: "result", type: 'categorical'},
                    {name: "activity", type: 'categorical', colormap : Location.colorMap},
                    {name: "temp", type: 'numeric', precision: 1},
                    {
                        name: "eyeColor",
                        type: 'categorical',
                        colormap: null
                    },
                    {name: "recordType", type: 'categorical'},
                    {name: "location", type: 'categorical'},
                    {name: 'row', type: 'categorical'},
                    {name: 'col', type: 'categorical'}

                ]
            }
            */
        ]
    };

    return oInitSimObject;
};

farsCODAPConnector.prototype.getSaveObject = function() {
    var tState = {
        gameCaseID : this.gameCaseID,
        gameNumber : this.gameNumber,
        gameCollectionName : this.gameCollectionName
    };

    return tState;
}

/**
 * @param iObject   object containing the property values.
 */
farsCODAPConnector.prototype.restoreFrom = function(iObject ) {
    this.gameCaseID = iObject.gameCaseID;
    this.gameNumber = iObject.gameNumber;
    this.gameCollectionName = iObject.gameCollectionName;
};


/**
 * Called by CODAP to initialize the simulation.
 * Two parameters: an object containing the organization of the data,
 * and a callback function when a doCommand is issued.
 * (We'll use it for save and restore)
 */
codapHelper.initSim(
    farsCODAPConnector.getInitSimObject(),
    fars.farsDoCommand
);

