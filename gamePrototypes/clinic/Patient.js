/**
 * Created by tim on 1/6/16.
 */


var Patient;

Patient = function (iPerson) {
    this.caseID = null;
    this.patientID = iPerson.patientID;
    this.sex = iPerson.sex;
    this.first = iPerson.first;
    this.last = iPerson.last;
    this.name = iPerson.first + " " + iPerson.last;

    this.age = iPerson.age;
    this.address = iPerson.address;

    this.lat = iPerson.lat;
    this.long = iPerson.long;

    this.baseTemp = 98 + 1.5 * Math.random();
    this.baseWeight = (this.sex == "male" ? 160 : 110) + 30 * (Math.random() - Math.random());
    this.baseHeight = (this.sex == "male" ? 175 : 165) +(Math.random() - Math.random()) * 20;
    this.maladyStates = {};       //      a key-value list of malady parameters
};

Patient.prototype.toString = function() {
    return this.name + ", " + this.sex + ", age " + this.age;
};

Patient.prototype.measure = function( what ) {
    var oValue;
    switch( what ) {
        case "temp":
            oValue = this.baseTemp + 0.3 * (Math.random() - Math.random());
            oValue = Math.round(10.0 * oValue) / 10.0;
            break;
        case "weight":
            oValue = this.baseWeight + 1 * (Math.random() - Math.random());
            oValue = Math.round(10.0 * oValue) / 10.0;
            break;
        case "height":
            oValue = this.baseHeight + 0.5 * (Math.random() - Math.random());
            oValue = Math.round(10.0 * oValue) / 10.0;
            break;
        default:
            oValue = -1;
            break;
    }

    return oValue
};


Patient.prototype.populationValueObject = function(  ) {
    var out = {};

    out.id = this.patientID;
    out.last = this.last;
    out.first = this.first;
    out.age = this.age;
    out.sex = this.sex;
    out.address = this.address;
    out.lat = this.lat;
    out.long = this.long;
    out.name = this.name;

    return out;
};