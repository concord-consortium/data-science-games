/**
 * Created by tim on 12/10/15.
 */


var geigerOptions;

geigerOptions = {
    showDistance : false,
    bigRadius : false,
    deathPossible : false,
    useRandom : false,

    reconcile : function() {
        this.showDistance = document.getElementById("showDistance").checked;
        this.bigRadius = document.getElementById("bigRadius").checked;
        this.deathPossible = document.getElementById("deathPossible").checked;
        this.useRandom = document.getElementById("useRandom").checked;
    }

}