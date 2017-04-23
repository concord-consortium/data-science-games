/**
 * Created by tim on 1/7/16.
 */

/**
 * A  manager class responsible for communicating with the CODAP environment
 * @constructor
 */
clinic.codapConnector = {
    gameCaseID: 0,
    gameNumber: 0,

    /**
     * Emit a "record" case, low level in the hierarchy.
     * @param iValues   the case values
     */
    createRecordItem: function ( iValues) {
        pluginHelper.createItems(
            iValues,
            clinic.constants.kRecordsDataSetName
        ); // no callback.
    },

    createPopulationItems : function(iValues ) {
        pluginHelper.createItems(
            iValues,
            clinic.constants.kPopulationDataSetName
        )
    }

};


/**
 * Called by CODAP to initialize the simulation.
 * Two parameters: an object containing the organization of the data,
 * and a callback function when a doCommand is issued.
 * (We'll use it for save and restore)
 */

clinic.codapConnector.recordsDataContextSetupString = {
    name: clinic.constants.kRecordsDataSetName,
    title : 'clinic records',
    description : 'Records of your actions',
    collections: [  // There are three collections: games / patientsAtClinic / records
/*
        {
            name: clinic.constants.kRecordsGameCollectionName,
            labels: {
                singleCase: "game",
                pluralCase: "games",
                setOfCasesWithArticle: "some games"
            },
            // The parent collection spec:
            attrs: [
                {name: "gameNumber", type: 'categorical'},
                {name: "outcome", type: 'categorical'}
            ],
            childAttrName: "patient"
        },
*/
        {
            name: clinic.constants.kRecordsPatientsCollectionName,
            //  parent: clinic.constants.kRecordsGameCollectionName,
            labels: {
                singleCase: "patient",
                pluralCase: "patientsAtClinic",
                setOfCasesWithArticle: "a population"
            },
            // The child collection specification:
            attrs: [
                {name: "name", type: 'categorical'},
                {name: "sex", type: 'categorical'},
                {name: "age", type: 'numeric', precision: 1},
                {name: "id", type: 'categorical', hidden : true}
            ],
            childAttrName: "record"
        },
        {
            name: clinic.constants.kRecordsCollectionName,
            parent: clinic.constants.kRecordsPatientsCollectionName,
            labels: {
                singleCase: "record",
                pluralCase: "records",
                setOfCasesWithArticle: "a chart"
            },
            // The child collection specification:
            attrs: [
                {name: "when", type: 'date'},
                {name: "what", type: 'categorical'},
                {name: "value", type: 'numeric', precision: 1},
                {name: "class", type: 'categorical'}
/*
                {name: "time", type: 'numeric', unit: 'ms', precision: 0}
*/
            ]
        }
    ]   //  end of collections
};

 clinic.codapConnector.populationDataContextSetupString = {
     name: clinic.constants.kPopulationDataSetName,
     title: clinic.constants.kPopulationDataSetTitle,
     description: 'a catalog of all the possible patientsAtClinic',
     collections: [
         {
             name: clinic.constants.kPopulationCollectionName,
             labels: {
                 singleCase: "person",
                 pluralCase: "people",
                 setOfCasesWithArticle: "list of people"
             },

             attrs: [
                 {name: "name", type: 'categorical'},
                 {name: "age", type: 'numeric', precision: 0, description: "age"},
                 {name: "sex", type: 'categorical', description: "sex"},
                 {name: "address", type: 'categorical', description: "address"},
                 {name: "zip", type: 'categorical', description: "zip code"},
                 {name: "lat", type: 'numeric', precision: 4, description: "latitude of dwelling", hidden : true},
                 {name: "long", type: 'numeric', precision: 4, description: "longitude of dwelling", hidden : true},
                 {name: "last", type: 'categorical', description: "last name"},
                 {name: "first", type: 'categorical', description: "first name"},
                 {name: "id", type: 'categorical', description: "patient ID", hidden: true}
             ]
         }
     ]
 };
