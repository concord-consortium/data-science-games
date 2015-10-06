/**
 * Created by tim on 9/25/15.
 */
codapHelper.initSim({
    name: 'Random Numbers',
    dimensions: {width: 300, height: 150},
    collections: [  // There are two collections: a parent and a child
        {
            name: 'samples',
            // The parent collection has just one attribute
            attrs: [ {name: "sample", type: 'categorical'}],
            childAttrName: "sample"
        },
        {
            name: 'numbers',
            labels: {
                pluralCase: "numbers",
                setOfCasesWithArticle: "a sample"
            },
            // The child collection also has just one attribute
            attrs: [
                {name: "number1", type: 'numeric', precision: 1},
                {name: "number2", type: 'numeric', precision: 1}
            ]
        }
    ]
});


var RandomNumbers = {
    sampleNumber: 0,

    // Here is the function that is triggered when the user presses the button
    generateNumbers: function () {
        // If we're not embedded in CODAP, we bring up an alert and don't draw the sample
        if( !codapHelper.checkForCODAP())
            return;

        // This function is called once the parent case is opened
        var doSample = function( iResult) {
            var tID = iResult.caseID,
                tHowMany = document.forms.form1.howMany.value.trim(),

                addOneNumber = function() {
                    if( tHowMany > 0) {
                        var tRandom1 = Math.random() * 100 + 1; // Choose a random number between 1 and 100
                        var tRandom2 = Math.random() * 100 + 1; // Choose a random number between 1 and 100
                        // Tell CODAP to create a case in the child collection
                        codapHelper.createCase('numbers', [tRandom1,tRandom2], tID, addOneNumber); // recursion happens in callback
                        tHowMany--;
                    }
                    else codapHelper.closeCase('samples', null, tID); // no callback? recursion ends. Close the PARENT case.
                };

            addOneNumber(); // This starts an asynchronous recursion
        };

        // generateNumbers starts here
        this.sampleNumber++;
        // Tell CODAP to open a parent case and call doSample when done
        codapHelper.openCase( 'samples', this.sampleNumber, doSample);
    }
};

