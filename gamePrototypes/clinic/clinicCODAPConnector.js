/**
 * Created by tim on 1/7/16.
 */

/**
 * A  manager class responsible for connecting to the CODAP environment
 * @constructor
 */
var ClinicCODAPConnector = function(  ) {
    this.gameCaseID = 0;
    this.gameNumber = 0;
    this.gameCollectionName = "games";
};

/**
 * Open a new "parent" case (the "game" level in the hierarchy)
 */
ClinicCODAPConnector.prototype.newGameCase = function( ) {

    this.gameNumber += 1;

    codapHelper.openCase(
        this.gameCollectionName,
        [this.gameNumber, null],
        function( iResult ) {
            this.gameCaseID = iResult.caseID;
        }.bind(this)
    );

};

/**
 * Finishes the current game case
 * @param result    the status of the game (won, lost, aborted)
 */
ClinicCODAPConnector.prototype.finishGameCase = function(result ) {
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

/**
 * Create (and close) a new "patient" case (middle level in the hierarchy)
 */

ClinicCODAPConnector.prototype.createPatientCase = function(patient ) {
    var values = [ patient.name,  patient.sex, patient.age ];
    codapHelper.createCase(
        'patients',
        values,
        this.gameCaseID,
        function( iResult ) {
            this.caseID = iResult.caseID;
        }.bind(patient)
    );
};


/**
 * Emit a "record" case, low level in the hierarchy.
 * @param patient       the patient this belons to (so we can attach it to the right case)
 * @param values
 */
ClinicCODAPConnector.prototype.createRecordCase = function( patient, values ) {
    codapHelper.createCase(
        'records',
        values,
        patient.caseID
    ); // no callback.

};

/**
 * Called by CODAP to initialize the simulation.
 * Two parameters: an object containing the organization of the data,
 * and a callback function when a doCommand is issued.
 * (We'll use it for save and restore)
 */

codapHelper.initSim({
        name: 'Clinic',
        version : clinicManager.version,
        dimensions: {width: 256, height: 512},
        collections: [  // There are two collections: a parent and a child
            {
                name: 'games',
                labels: {
                    singleCase: "game",
                    pluralCase: "games",
                    setOfCasesWithArticle: "some games"
                },
                // The parent collection spec:
                attrs: [
                    {name: "gameNumber", type: 'categorical'},
                    {name: "result", type: 'categorical'}
                ],
                childAttrName: "patient"
            },
            {
                name: 'patients',
                labels: {
                    singleCase: "patient",
                    pluralCase: "patients",
                    setOfCasesWithArticle: "a population"
                },
                // The child collection specification:
                attrs: [
                    {name: "name", type: 'categorical'},
                    {name: "sex", type: 'categorical'},
                    {name: "age", type: 'numeric', precision: 1}
                ],
                childAttrName: "record"
            },
            {
                name: 'records',
                labels: {
                    singleCase: "record",
                    pluralCase: "records",
                    setOfCasesWithArticle: "a chart"
                },
                // The child collection specification:
                attrs: [
                    {name: "timeString", type: 'categorical'},
                    {name: "what", type: 'categorical'},
                    {name: "result", type: 'categorical'},
                    {name: "class", type: 'categorical'},
                    {name: "time", type: 'numeric', unit: 'milliseconds', precision: 0}
                ]
            }
        ]
    },
    clinicManager.clinicDoCommand
);

