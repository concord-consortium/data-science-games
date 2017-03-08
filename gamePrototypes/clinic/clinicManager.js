/**
 * Created by tim on 1/6/16.
 */

var clinicManager = {
    version : "001b",      //  that's alpha, \u03b1

    /**
     * Manages calls to CODAP for init and for making new cases
     */
    CODAPConnector: null,

    gameTime : null,
    patients : [],
    currentPatient: null,

    recordMeasurement : function( iClass, iWhat, iVal ) {
        var tResultString = this.currentPatient.name + " " + iWhat + ": " + iVal;

        var tValues = {
            gameNumber: clinic.codapConnector.gameNumber,
            outcome: "",

            name: clinicManager.currentPatient.name,
            sex: clinicManager.currentPatient.sex,
            age: clinicManager.currentPatient.age,

            when: this.formatDateTime(this.gameTime),
            what: iWhat,  //type
            value: iVal,    //result
            class: iClass, //class
            time: this.gameTime.getTime(),

            id: clinicManager.currentPatient.patientID
        };

        clinic.codapConnector.createRecordItem( tValues, clinic.constants.kRecordCollectionName );
        console.log( tResultString );
    },

    doButton : function(e) {
        if (!this.currentPatient) {
            alert("You need a patient to do this.");
            return;
        }

        var tDuration = 30;     //  how long it takes, in minutes.
        var tID = e.currentTarget.id;
        console.log("command: " + tID);

        switch( tID ) {
            case "temp":
                this.recordMeasurement( "diag", tID, this.currentPatient.measure("temp"));
                tDuration = 1;
                break;
            case "weight":
                this.recordMeasurement( "weight", tID, this.currentPatient.measure("weight"));
                tDuration = 0.5;
                break;
            case "height":
                this.recordMeasurement( "height", tID, this.currentPatient.measure("height"));
                tDuration = 0.5;
                break;
            default:
                this.recordMeasurement( "demog", "null", -1 );
                break;
        }

        this.passTime( tDuration );
    },

    newPatientButton : function() {
        var tCopyInSet = true;
        var tP = null;
        while (tCopyInSet) {
            tCopyInSet = false;
            tP = TEEUtils.pickRandomItemFrom(clinic.population);
            this.patients.forEach( function(iP ) {
                if (iP.patientID === tP.patientID) {
                    tCopyInSet = true;
                    //break;
                }
            })
        }
        this.patients.push(tP);
        this.currentPatient = tP;
        console.log("New patient: " + this.currentPatient.name);

        //  Create the case in CODAP (NO! We do not need the patient item!
        //  this.clinic.codapConnector.emitPatient( tP );
        this.passTime( 1 );
    },

    updateDisplay : function() {
        this.constructPatientList();
        $( "#gameTime ").text(this.formatDateTime(this.gameTime) );
        if (this.currentPatient) $( "#currentStatus").html( "<strong>" + this.currentPatient + "</strong>.");
        else $("#currentStatus").html("Waiting");
    },

    passTime :  function( minutes ) {
        this.gameTime = new Date(this.gameTime.getTime() + minutes*60000);
        this.updateDisplay();
    },

    formatDateTime : function(iDateTime) {
        var result = "";
        var monthArray = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

        result += iDateTime.getFullYear() + "-" + monthArray[iDateTime.getMonth()] + "-" + this.padIntegerToTwo(iDateTime.getDate());

        result += " " + this.padIntegerToTwo(iDateTime.getHours()) + ":" + this.padIntegerToTwo(iDateTime.getMinutes());
        return result;
    },

    focusOnPatientByName : function( iName ) {
    var tPatients = this.patientsFromNameString(iName);
        if (tPatients.length == 1) {
            this.currentPatient = tPatients[0];
        } else {
            alert("Somehow we matched " + tPatients.length + "patients, and it should be 1.");
        }
        this.passTime( 2 );
    },

    patientsFromNameString : function( inString ) {
        var tPatients = [];
        var ix;
        for (ix = 0; ix < this.patients.length; ix++) {
            var p = this.patients[ix];
            var tName = p.name;
            var find = tName.search(inString);
            if (find != -1) tPatients.push( p );
        }
        return tPatients;
    },

    constructPatientList : function() {
        var tResult = "";
        var tPatientList = this.patients;
        var i;
        for (i = 0; i < tPatientList.length; i++) {
            var tP = tPatientList[i];
            tResult += "<span class='patientListElement'>" + tP.name + "</span> ";
        }
        $('#files').html(tResult);
    },

    padIntegerToTwo : function(input) {
        var result = input.toString();
        if (input < 10) result = "0" + result;
        return result;
    },

    /**
     * Resets Clinic for a new game.
     */
    newGame: function() {

        if (clinic.codapConnector.gameCaseID > 0) {
            clinicManager.finishGameCase( "aborted" );
        }

        this.gameTime = new Date();
        this.patients = [];
        this.currentPatient = null;

        this.passTime( 0. );
    },


    start : function() {
        $('#files').on("click",".patientListElement",
            function(event) {
                var tText = event.target.textContent;
                this.focusOnPatientByName( tText );
            }.bind(this)
        );
        this.newGame();
    },

    clinicDoCommand : function() {

    }
}