/**
 * Created by tim on 1/6/16.
 */

var clinicManager = {
    version: "001b",      //  that's alpha, \u03b1

    /**
     * Manages calls to CODAP for init and for making new cases
     */
    CODAPConnector: null,

    currentPatient: null,

    recordMeasurement: function (iClass, iWhat, iVal) {
        var tResultString = this.currentPatient.name + " " + iWhat + ": " + iVal;

        var tValues = {
            gameNumber: clinic.codapConnector.gameNumber,
            outcome: "",

            name: clinicManager.currentPatient.name,
            sex: clinicManager.currentPatient.sex,
            age: clinicManager.currentPatient.age,

            when: this.formatDateTime(clinic.state.now),
            what: iWhat,  //type
            value: iVal,    //result
            class: iClass, //class
            time: clinic.state.now.getTime(),

            id: clinicManager.currentPatient.patientID
        };

        clinic.codapConnector.createRecordItem(tValues, clinic.constants.kRecordCollectionName);
        console.log(tResultString);
    },

    doButton: function (e) {
        if (!this.currentPatient) {
            alert("You need a patient to do this.");
            return;
        }

        var tDuration = 30;     //  how long it takes, in minutes.
        var tID = e.currentTarget.id;
        console.log("command: " + tID);

        switch (tID) {
            case "temp":
                this.recordMeasurement("diag", tID, this.currentPatient.measure("temp"));
                tDuration = 1;
                break;
            case "weight":
                this.recordMeasurement("weight", tID, this.currentPatient.measure("weight"));
                tDuration = 0.5;
                break;
            case "height":
                this.recordMeasurement("height", tID, this.currentPatient.measure("height"));
                tDuration = 0.5;
                break;
            case "ibu200":
                this.currentPatient.dose("ibuprofen", 200);
                this.recordMeasurement("Tx", "ibuprofen", 200);
                tDuration = 1;
                break;
            default:
                this.recordMeasurement("demog", "null", -1);
                break;
        }

        clinic.model.passTime(tDuration);
    },

    arrivesAtClinic: function (iPerson) {
        if (clinic.model.patientsAtClinic.indexOf(iPerson) === -1) {
            clinic.model.patientsAtClinic.push(iPerson);
        }
    },

    updateDisplay: function () {
        this.constructPatientList();
        $("#gameTime ").text(this.formatDateTime(clinic.state.now));
        if (this.currentPatient) $("#currentStatus").html("<strong>" + this.currentPatient + "</strong>.");
        else $("#currentStatus").html("Waiting");
    },

    focusOnPatient : function( iPatient ) {
        this.currentPatient = iPatient;
        clinic.selectionManager.selectThisPersonInAllDataSets( iPatient );
    },

    formatDateTime: function (iDateTime) {
        var result = "";
        var monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        result += this.padIntegerToTwo(iDateTime.getDate())
            + "-" + monthArray[iDateTime.getMonth()] + "-" + iDateTime.getFullYear()
        result += " " + this.padIntegerToTwo(iDateTime.getHours()) + ":" + this.padIntegerToTwo(iDateTime.getMinutes());
        return result;
    },

    focusOnPatientByName: function (iName) {
        var tPatients = this.patientsFromNameString(iName);
        if (tPatients.length == 1) {
            this.focusOnPatient( tPatients[0] );
        } else {
            alert("Somehow we matched " + tPatients.length + "patientsAtClinic, and it should be 1.");
        }
        clinic.model.passTime(2);
    },

    patientsFromNameString: function (inString) {
        var tPatients = [];
        clinic.model.patientsAtClinic.forEach(
            function (p) {
                var tName = p.name;
                var find = tName.search(inString);
                if (find != -1) tPatients.push(p);
            }
        );
        return tPatients;
    },

    constructPatientList: function () {
        var tResult = "";
        clinic.model.patientsAtClinic.forEach(
            function (p) {
                tResult += "<span class='patientListElement'>" + p.name + "</span> ";
            }
        )
        $('#files').html(tResult);
    },

    padIntegerToTwo: function (input) {
        var result = input.toString();
        if (input < 10) result = "0" + result;
        return result;
    },

    /**
     * Resets Clinic for a new game.
     */
    newGame: function () {
        $('#currentStatus').text("starting new game");

        $('#newGameButton').hide();
        $('#newDayButton').show();

        if (clinic.codapConnector.gameCaseID > 0) {
            clinicManager.finishGameCase("aborted");
        }

        clinic.state.now = null;      //  now;

        clinic.model.initializeGameData();  //  Gives sickness.

        this.newDay();
    },

    /**
     * Invoked by button or called from newGame()
     */
    newDay : function() {
        this.currentPatient = null;
        clinic.model.newDay();                  //  also sends sick patients to clinic
        $('#commands').show();

    },

    start: function () {
        $('#files').on("click", ".patientListElement",
            function (event) {
                var tText = event.target.textContent;
                this.focusOnPatientByName(tText);
            }.bind(this)
        );
        $('#currentStatus').text("ready for new game");

        $('#newGameButton').show();
    },

}