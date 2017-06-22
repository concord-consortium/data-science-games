/**
 * Created by tim on 1/6/16.
 */


var Patient;

/**
 *
 * @param iPerson   the record from the json file made in Python, called clinic.initialPeople,
 *                  read in by clinic.model.constructPopulationArray().
 * @constructor
 */
Patient = function (iPerson) {
    this.dwellingID = iPerson.dwellingID;

    this.first = iPerson.first;
    this.last = iPerson.last;
    this.name = iPerson.first + " " + iPerson.last;

    var tDwellingObject = clinic.model.dwellings[this.dwellingID];
    this.address = tDwellingObject.address;
    this.lat = Number(tDwellingObject.lat) + clinic.constants.kJitter * (Math.random() - 0.5);
    this.long = Number(tDwellingObject.long) + clinic.constants.kJitter * (Math.random() - 0.5);    //  todo: times cosine
    this.zip = tDwellingObject.zip;

    this.caseID = null;
    this.patientID = iPerson.personID;     //      called "id" in CODAP tables

    this.sex = iPerson.sex;
    this.age = iPerson.age;

    clinic.state.health[this.patientID] = {};           //  initialize the health object
    var tHealth = clinic.state.health[this.patientID];
    this.health = clinic.state.health[this.patientID];  //  make a reference within this object

    Object.keys(staticMeds).forEach( function(m) {
        var med = staticMeds[m];
        tHealth[med.name+"Concentration"] = 0;
        tHealth[med.name+"InQueue"] = 0;
    });

    this.baseTemp = iPerson.baseTemp;
    this.height = iPerson.height;
    this.weight = iPerson.weight;

    this.prescriptions = [];

};

/**
 *
 * @param dt    interval in minutes
 */
Patient.prototype.updatePatient = function(dt) {
    health.update(this, dt);

    //  section for taking pills

    var irx = this.prescriptions.length;
    while (irx--) {
        var rx = this.prescriptions[irx];
        var tTakeOne = rx.updatePrescription();
        if (tTakeOne) {
            this.dose(rx.what, rx.dose);    //  actually take the pill
            console.log(this.first + " " + this.last + " took " + rx.what + " at " + clinic.state.now);     //  debug
            if (rx.count <= 0) {
                //  we have finsihed our bottle of pills!
                this.prescriptions.splice(irx, 1);
            }
        }
    }

    //  now all pills are taken

    var tSick = health.wantsToGoToClinic(this);

    if (tSick) {
        clinicManager.arrivesAtClinic( this );      //  this person goes to the clinic!
    }
};

Patient.prototype.toString = function() {
    return this.name + ", " + this.sex + ", age " + this.age;
};

Patient.prototype.measure = function( what ) {
    var oValue;

    var tHealth = clinic.state.health[this.patientID];
    switch( what ) {
        case "temp":
            oValue = health.findTemperature( this ).temp;
            oValue = Math.round(10.0 * oValue) / 10.0;
            break;
        case "weight":
            oValue = this.weight + 1 * (Math.random() - Math.random());
            oValue = Math.round(10.0 * oValue) / 10.0;
            break;
        case "height":
            oValue = this.height + 0.5 * (Math.random() - Math.random());
            oValue = Math.round(10.0 * oValue) / 10.0;
            break;
        default:
            oValue = -1;
            break;
    }

    return oValue
};

Patient.prototype.dose = function( iWhat, iHowMuch) {
    var tHealth = clinic.state.health[this.patientID];

    switch(iWhat) {
        case "ibuprofen":
            tHealth.ibuprofenInQueue += iHowMuch;
            break;

        case "acetaminophen":
            tHealth.acetaminophenInQueue += iHowMuch;
            break;

        default:
            break;
    }
};

/**
 * Object needed to construct CODAP table.
 * Notice that we do not need to put values such as height and weight in this table,
 * because they come from the static file and are kept in the population array.
 * They will be the same for all players and will never need to be plotted
 * directly from the population dataset; they might be MEASURED, but then they will appear -- with
 * variability -- in the clinic records.
 *
 * @returns {{}}
 */
Patient.prototype.populationValueObject = function(  ) {
    var out = {};

    out.id = this.patientID;
    out.last = this.last;
    out.first = this.first;
    out.age = this.age;
    out.sex = this.sex;
    out.address = this.address;
    out.zip = this.zip;
    out.lat = this.lat;
    out.long = this.long;
    out.name = this.name;

    return out;
};