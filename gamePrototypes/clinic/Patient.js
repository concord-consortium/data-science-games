/**
 * Created by tim on 1/6/16.
 */


var Patient;

Patient = function (inSex) {
    this.caseID = null;
    this.name = Patient.newName(inSex);
    this.age = 20 + Math.round(35 * Math.random());
    this.sex = ( inSex );
    this.baseTemp = 98 + 1.5 * Math.random();
    this.baseWeight = (this.sex == "Male" ? 160 : 110) + 30 * (Math.random() - Math.random());
    this.baseHeight = (this.sex == "Male" ? 175 : 165) +(Math.random() - Math.random()) * 20;
    this.maladyStates = {};       //      a key-value list of malady parameters
};

Patient.prototype.toString = function() {
    return this.name + ", " + this.sex + ", age " + this.age;
};

Patient.prototype.measure = function( what ) {
    var result;
    switch( what ) {
        case "temp":
            result = this.baseTemp + 0.3 * (Math.random() - Math.random());
            result = Math.round(10.0 * result) / 10.0;
            break;
        case "weight":
            result = this.baseWeight + 1 * (Math.random() - Math.random());
            result = Math.round(10.0 * result) / 10.0;
            break;
        case "height":
            result = this.baseHeight + 0.5 * (Math.random() - Math.random());
            result = Math.round(10.0 * result) / 10.0;
            break;
        default:
            result = -1;
            break;
    }

    return result
};


Patient.newName = function( inSex ) {
    var tName = "";

    switch( inSex ) {
        case "Male":
            tName += namesForGames.getName( "maleFirst");
            break;
        case "Female":
            tName += namesForGames.getName( "femaleFirst");
            break;
        default:
            tName += "Aloysius-Marie";
            break;
    };
    tName += " ";
    tName += namesForGames.getName("last");

    return tName;
};