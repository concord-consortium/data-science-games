/**
 * Created by tim on 1/6/16.
 */

var clinicManager = {

    /**
     * Manages calls to CODAP for init and for making new cases
     */
    CODAPConnector: null,

    currentPatient: null,
    currentCall : null,

    latestResult : "",

    recordMeasurement: function (iClass, iWhat, iVal, iPatient) {
        var tResultString = iPatient.name + " " + iWhat + ": " + iVal;

        var tValues = {
            gameNumber: clinic.codapConnector.gameNumber,
            outcome: "",

            name: iPatient.name,
            sex: iPatient.sex,
            age: iPatient.age,

            when: this.formatDateTime(clinic.state.now),
            what: iWhat,  //type
            value: iVal,    //result
            class: iClass, //class
            time: clinic.state.now.getTime(),

            id: iPatient.patientID
        };

        clinic.codapConnector.createRecordItem(tValues, clinic.constants.kRecordCollectionName);
        console.log(tResultString);
        return tResultString;
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
            case "howzit":
                clinicManager.latestResult = health.howAreYouFeeling( this.currentPatient );
                tDuration = 1;
                break;
            case "temp":
                clinicManager.latestResult = this.recordMeasurement("diag", tID, this.currentPatient.measure("temp"), this.currentPatient);
                tDuration = 1;
                break;
            case "weight":
                clinicManager.latestResult = this.recordMeasurement("weight", tID, this.currentPatient.measure("weight"), this.currentPatient);
                tDuration = 0.5;
                break;
            case "height":
                clinicManager.latestResult = this.recordMeasurement("height", tID, this.currentPatient.measure("height"), this.currentPatient);
                tDuration = 0.5;
                break;
            case "ibu200":
                this.currentPatient.dose("ibuprofen", 200);
                clinicManager.latestResult = this.recordMeasurement("Tx", "ibuprofen", 200, this.currentPatient);
                tDuration = 1;
                break;
            case "rx":
                clinic.goToTabNumber(1);    //  the second tab, Rx.
                tDuration = 0;
                break;
            case "bloodCount":
                clinic.model.bloodCountAll(  );
                tDuration = 0;
                break;
            case "issueRx":
                tDuration = 5;
                var tChoice = clinic.dom.rxWhat.val();    //  med code, e.g., "ibu200", which is also the key in staticMeds.
                var tPrescription = new Prescription(
                    tChoice, clinic.dom.rxCount.val(), Prescription.constants.kRateTypePerDay, clinic.dom.rxRate.val()
                );
                this.currentPatient.prescriptions.push(tPrescription);
                break;
            case "sendhome":
                this.sendCurrentPatientHome();
                tDuration = 2;
                break;
            default:
                clinicManager.latestResult = this.recordMeasurement("demog", "null", -1, this.currentPatient);
                break;
        }

        clinic.model.passTime(tDuration);
    },

    sendCurrentPatientHome : function() {
        var curPatient = this.currentPatient;
        var ax = clinic.model.patientsAtClinic.indexOf( curPatient );
        clinic.model.patientsAtClinic.splice(ax,1);
        this.recordMeasurement('logistic','departs', null, curPatient);

        this.currentPatient = null;
    },


    arrivesAtClinic: function (iPerson) {
        if (clinic.model.patientsAtClinic.indexOf(iPerson) === -1) {
            clinic.model.patientsAtClinic.push(iPerson);
            this.recordMeasurement('logistic','arrives', null, iPerson);
        }
    },

    updateDisplay: function () {
        this.constructPatientList();
        $("#gameTime ").text(this.formatDateTime(clinic.state.now));
        $("#rxGameTime ").text(this.formatDateTime(clinic.state.now));

        var tStatusHTML = "Waiting";
        if (this.currentPatient) {
            tStatusHTML = "<strong>" + this.currentPatient + "</strong>.";
            if (this.latestResult.length > 0) {
                tStatusHTML += "<br>" + this.latestResult;
            }
        }

        $("#currentStatus").html(tStatusHTML);
        $("#rxPatient").html(tStatusHTML);
    },

    focusOnPatient : function( iPatient ) {
        this.currentPatient = iPatient;
        clinicManager.latestResult = "";    //  new person, blank the latest result.
        clinic.selectionManager.selectThisPersonInAllDataSets( iPatient );
    },

    formatDateTime: function (iDateTime) {
        var result = "";
        var monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        result += this.padIntegerToTwo(iDateTime.getDate())
            + "-" + monthArray[iDateTime.getMonth()] + "-" + iDateTime.getFullYear();
        result += " " + this.padIntegerToTwo(iDateTime.getHours()) + ":" + this.padIntegerToTwo(iDateTime.getMinutes());
        return result;
    },

    focusOnPatientByName: function (iName) {
        var tPatients = this.patientsFromNameString(iName);
        if (tPatients.length === 1) {
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
                if (p.name.includes(inString)) tPatients.push(p);
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
        );
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

        clinic.model.initializeClinicModelData();  //  Gives sickness.

        this.newDay();
    },

    wait : function() {
        var tMinutesLeft = 60 * 24;
        var tTimeIncrement = 10;

        while (tMinutesLeft > 0 && clinic.model.patientsAtClinic.length <= 0) {
            clinic.model.passTime(tTimeIncrement);
            tMinutesLeft -= tTimeIncrement;
        }
    },

    /**
     * Invoked by button or called from newGame()
     */
    newDay : function() {
        this.currentPatient = null;
        clinic.model.newDay();                  //  also sends sick patients to clinic
        $('#commands').show();

    },

    phoneLookupChanged: function () {
        var tTypedSoFar = $('#phoneLookupTextBox').val().toUpperCase();
        var tPatientList = clinic.model.patientsFromNameParts(tTypedSoFar);

        var tButtons = "";

        if (tPatientList.length === 0) {
            tButtons = "No matches.";
        } else if (tPatientList.length <= 10) {
            tPatientList.forEach(function (p) {
                tButtons += "<button onclick='clinicManager.makePhoneCall(event)'>call " + p.name + "</button>";
            })
        } else {
            tButtons = tPatientList.length + " matches. Type more to narrow your search!";
        }
        $('#phoneMatches').html(tButtons);
    },

    makePhoneCall : function(event) {
        var tText = event.target.textContent.slice(5);  //  strips "call " off the front
        var tPatients = clinic.model.patientsFromNameParts(tText);
        if (tPatients.length === 1) {
            this.currentCall = tPatients[0];
        } else {
            alert("Somehow we matched " + tPatients.length + " patients for a phone call, and it should be 1.");
        }

        var tPhoneMessage = "Calling " + this.currentCall.address;
        console.log(tPhoneMessage);

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