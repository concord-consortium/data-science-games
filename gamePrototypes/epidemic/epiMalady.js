/**
 * Created by tim on 2/1/16.
 */

/*
    Where maladies get implemented:

    this.pMaladyNumber      key parameter which determines the malady. Set in this.pickMalady()
                            Note: (v002) this gets set via an onchange event in the DOM menu. This is
                            different from program options, which get read every time.
                            So the property here MUST be kept in synch.
                            epiManager.updateUIStuff() makes the menu invisible during game play.
    this.initMalady()       set parameters for the chosen malady. Choice is already made.
    this.possiblyInfectExposedCritter(c, dt)    determines is infection takes place,
                                        sets initial critter values for an infected critter
    Critter.updateHealth()  take care of incubation, getting well, etc

    Critter.load    helps govern incubation. When Critter.load gets to 1, you're sick.
 */
var epiMalady;

epiMalady = {

    pMaladyNumber : null,
    pMaladyName : null,
    pAverageSecondsToInfection : null,
    pDiseaseDurationInSeconds : null,
    pIncubationInSeconds : null,
    pSickSecondsToGameEnd : 500,
    pTotalElapsedSecondsToGameEnd : 600,

    pMaladyNameList : ["Thrisp", "Dog Fever", "Alban's Bloat"], //  todo: populate the DOM menu from this

    /**
     * Set the malady ID parameters
     */
    pickMalady : function(  ) {

        var maladyChoiceMenu = document.getElementById("maladyChoice");
        var tDiseaseChoice = Number(maladyChoiceMenu.value);
        if (maladyChoiceMenu.value == "all") {
            tDiseaseChoice = Math.floor( this.pMaladyNameList.length * Math.random() );;
        }      //  "surprise me"

        this.pMaladyNumber = tDiseaseChoice;
        this.pMaladyName = this.pMaladyNameList[ tDiseaseChoice ];
    },

    initMalady : function() {

        console.log("Initializing malady #" + this.pMaladyNumber);

        switch( this.pMaladyNumber ) {
            case 0:
                this.pDiseaseDurationInSeconds = 60;
                this.pAverageSecondsToInfection = 2;
                this.pIncubationInSeconds = 0;
                epiModel.critters[0].infectious = true;
                epiModel.critters[0].antibodies = 1.0;
                break;

            case 1:
                this.pDiseaseDurationInSeconds = 120;
                this.pAverageSecondsToInfection = 5;
                this.pIncubationInSeconds = 20;
                epiModel.critters[0].infectious = true;
                epiModel.critters[0].antibodies = 1.0;
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

    possiblyInfectExposedCritter : function(iCritter, dt ) {
        var tInfectionProbability = dt / this.pAverageSecondsToInfection;
        if (Math.random() < tInfectionProbability) {
            if (iCritter.health == 1 && iCritter.antibodies == 0.0 && !this.infected) {
                iCritter.infected = true;
                iCritter.incubationTime = 0.0;
            }      //  simple get sick.
            if (iCritter.infectious) iCritter.health = 1;       //  in this disease, the carrier is asymptomatic
        };
    }

}


