/**
 * Created by tim on 2/1/16.
 */

/*
    Where maladies get implemented:

    this.maladyNameList     contains the names
    epidemic.html           put in the menu item in the <select>. Match the name.
    this.pMaladyNumber      key parameter which determines the malady. Set in this.pickMalady()
                            Note: (v002) this gets set via an onchange event in the DOM menu. This is
                            different from program options, which get read every time.
                            So the property here MUST be kept in synch.
                            epiManager.updateUIStuff() makes the menu invisible during game play.
    this.initMalady()       set parameters for the chosen malady. Choice is already made.

    epiModel.infect()       handles infection every update.
    this.exposureinLocation(loc)
                            Boolean. infect() uses this to see if the given Location has exposure.

    this.possiblyInfectExposedCritter(c, dt)
                            determines is infection takes place,
                            sets initial critter values for an infected critter
    Critter.updateHealth()  take care of incubation, getting well, etc

 */
var epiMalady;

epiMalady = {

    pMaladyNumber : null,
    pMaladyName : null,
    pAverageSecondsToInfection : null,
    pDiseaseDurationInSeconds : null,
    pIncubationInSeconds : null,
    pSickSecondsToGameEnd : 200,
    pTotalElapsedSecondsToGameEnd : 180,

    pMaladyNameList : ["Thrisp", "Dog Fever", "Alban's Bloat", "Arthemia"], //  todo: populate the DOM menu from this

    /**
     * Set the malady ID parameters
     */
    pickMalady : function(  ) {

        var maladyChoiceMenu = document.getElementById("maladyChoice");
        var tDiseaseChoice = Number(maladyChoiceMenu.value);
        if (maladyChoiceMenu.value == "all") {
            tDiseaseChoice = Math.floor( this.pMaladyNameList.length * Math.random() );
        }      //  "surprise me"

        this.pMaladyNumber = tDiseaseChoice;
        this.pMaladyName = this.pMaladyNameList[ tDiseaseChoice ];
    },

    initMalady : function() {

        console.log("Initializing malady #" + this.pMaladyNumber);
        var tCritterCarrier = TEEUtils.pickRandomItemFrom( epiModel.critters ); //  pick possible carrier

        switch( this.pMaladyNumber ) {
            case 0:
                this.pDiseaseDurationInSeconds = 50;
                this.pAverageSecondsToInfection = 2;
                this.pIncubationInSeconds = 0;
                tCritterCarrier.infectious = true;
                tCritterCarrier.antibodies = 1.0;
                break;

            case 1:
                this.pDiseaseDurationInSeconds = 40;
                this.pAverageSecondsToInfection = 5;
                this.pIncubationInSeconds = 20;         //  ah! Incubation period!
                tCritterCarrier.infectious = true;
                tCritterCarrier.antibodies = 1.0;
                break;

            case 2: //  toxic location
                this.pDiseaseDurationInSeconds = 40;
                this.pAverageSecondsToInfection = 1;
                this.pIncubationInSeconds = 10;
                var tLoc = TEEUtils.pickRandomItemFrom(epiModel.locations);
                while (tLoc.locType != "water" ||
                    tLoc.row < epiGeography.pRowsInGrid/5 || tLoc.row >= epiGeography.pRowsInGrid * 4 / 5 ||
                    tLoc.col < epiGeography.pColumnsInGrid/5 || tLoc.col >= epiGeography.pColumnsInGrid * 4 / 5)
                    tLoc = TEEUtils.pickRandomItemFrom(epiModel.locations);
                tLoc.toxic = true;
                break;

            case 3:     //      victims are infectious while they are incubating
                this.pDiseaseDurationInSeconds = 40;
                this.pAverageSecondsToInfection = 10;
                this.pIncubationInSeconds = 20;
                tCritterCarrier.infectious = true; //  carrier to get things started?
                tCritterCarrier.antibodies = 1.0;
                break;

            default:
                this.pDiseaseDurationInSeconds = 60;
                this.pAverageSecondsToInfection = 3;
                break;
        }
    },

    exposureInLocation : function( iLocation ) {
        var oInfection = false;

        iLocation.critters.forEach(function(c) {    //  note: not .some() because critters is a Set
            if (c.infectious) oInfection = true;
        });

        return oInfection;
    },

    possiblyInfectExposedCritter : function(iCritter, dt ) {
        //  console.log( iCritter.name + " exposed in " + iCritter.currentLocation.name);
        var tInfectionProbability = dt / this.pAverageSecondsToInfection;
        if (Math.random() < tInfectionProbability) {
            if (iCritter.health == 1 && iCritter.antibodies == 0.0 && !iCritter.infected) {
                iCritter.infected = true;
                iCritter.incubationTime = 0.0;
                console.log( iCritter.name + " infected in " + iCritter.currentLocation.name);
            }
            switch (this.pMaladyNumber) {
                case 0:
                    if (iCritter.infectious) iCritter.health = 1;       //  in this disease, the carrier is asymptomatic
                    break;
                case 1:
                    if (iCritter.infectious) iCritter.health = 1;       //  in this disease, the carrier is asymptomatic
                    break;
                case 2:
                    break;
                case 3:
                    if (iCritter.health == 1 && iCritter.infected) {
                        iCritter.infectious = true;
                    }
                    break;
            }
        }
    },

    getSaveObject: function() {
        var tSaveObject = {
            pMaladyNumber : this.pMaladyNumber,
            pMaladyName : this.pMaladyName,
            pAverageSecondsToInfection : this.pAverageSecondsToInfection,
            pDiseaseDurationInSeconds : this.pDiseaseDurationInSeconds,
            pIncubationInSeconds : this.pIncubationInSeconds,
            pSickSecondsToGameEnd : this.pSickSecondsToGameEnd,
            pTotalElapsedSecondsToGameEnd : this.pTotalElapsedSecondsToGameEnd,
            pMaladyNameList : this.pMaladyNameList,

        };
        return tSaveObject;
    },

    restoreFrom: function( iObject ) {
        this.pMaladyNumber = iObject.pMaladyNumber;
        this.pMaladyName = iObject.pMaladyName;
        this.pAverageSecondsToInfection = iObject.pAverageSecondsToInfection;
        this.pDiseaseDurationInSeconds = iObject.pDiseaseDurationInSeconds;
        this.pIncubationInSeconds = iObject.pIncubationInSeconds;
        this.pSickSecondsToGameEnd = iObject.pSickSecondsToGameEnd;
        this.pTotalElapsedSecondsToGameEnd = iObject.pTotalElapsedSecondsToGameEnd;
        this.pMaladyNameList = iObject.pMaladyNameList;
    }
};


