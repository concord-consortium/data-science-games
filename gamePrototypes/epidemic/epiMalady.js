/**
 * Created by tim on 2/1/16.
 */


var epiMalady;

epiMalady = {

    pMaladyNumber : null,
    pMaladyName : null,
    pAverageSecondsToInfection : null,
    pDiseaseDurationInSeconds : null,

    pMaladyNameList : ["Thrisp", "Dog Fever", "Alban's Bloat"],

    pickMalady : function( iChoice ) {

        if (arguments.length == 0) {
            iChoice = Math.floor( this.pMaladyNameList.length * Math.random() );
        }
        this.pMaladyNumber = iChoice;
        this.pMaladyName = this.pMaladyNameList[ iChoice ];
    },

    initMalady : function() {

        switch( this.pMaladyNumber ) {
            case 0:
                this.pDiseaseDurationInSeconds = 60;
                this.pAverageSecondsToInfection = 3;
                epiModel.critters[0].infectious = true;
                break;

            default:
                this.pDiseaseDurationInSeconds = 60;
                this.pAverageSecondsToInfection = 3;
                break;
        }
    },

    exposureInLocation : function( iLocation ) {
        var oInfection = false;

        iLocation.critters.forEach(function(c) {
            if (c.infectious) oInfection = true;
        });

        return oInfection;
    },

    infectExposedCritter : function(iCritter, dt ) {
        var tInfectionProbability = dt / this.pAverageSecondsToInfection;
        if (Math.random() < tInfectionProbability) {
            if (iCritter.health == 1 && iCritter.antibodies == 0.0) {
                iCritter.health = 0;
            }      //  simple get sick.
            if (iCritter.infectious) iCritter.health = 1;       //  in this disease, the carrier is asymptomatic
        };
    }
}


