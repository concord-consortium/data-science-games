/**
 * Created by tim on 10/28/15.
 */


var MedCODAPConnector = function(  ) {
    this.gameCaseID = 0;
    this.gameNumber = 0;
    this.gameCollectionName = null;
};

MedCODAPConnector.prototype.newGameCase = function( gameCollectionName, gameNumber ) {

    this.gameCollectionName = gameCollectionName;
    this.gameNumber = gameNumber;

    codapHelper.openCase(
        this.gameCollectionName,
        [this.gameNumber, null],
        function( iResult ) {
            this.gameCaseID = iResult.caseID;
        }.bind(this)
    );

};

/**
 * finishes the current game case
 */
MedCODAPConnector.prototype.finishGameCase = function( result ) {
    codapHelper.closeCase(
        this.gameCollectionName,
        [
            this.gameNumber,
            result,
        ],
        this.gameCaseID
    );
    this.gameCaseID = 0;     //  so we know there is no open case
};

MedCODAPConnector.prototype.doEventRecord = function( values ) {
    codapHelper.createCase(
        'events',
        values,
        this.gameCaseID
    ); // no callback?

};

codapHelper.initSim({
    name: 'Med 01',
    dimensions: {width: 404, height: 580},
    collections: [  // There are two collections: a parent and a child
        {
            name: 'epidemics',
            labels: {
                singleCase: "epidemic",
                pluralCase: "epidemics",
                setOfCasesWithArticle: "a history"
            },
            // The parent collection spec:
            attrs: [
                {name: "epiNumber", type: 'categorical'},
                {name: "result", type: 'categorical'}
            ],
            childAttrName: "event"
        },
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
                {name: "activity", type: 'categorical'},
                {name: "recordType", type: 'categorical'},
                {name: "result", type: 'categorical'},
                {name: "location", type: 'categorical'},
                {name: 'row', type: 'categorical'},
                {name: 'col', type: 'categorical'}

            ]
        }
    ]
});
