/**
 * Created by tim on 12/10/15.
 */

/**
 * Singleton object that keeps track of options (eventually, level params)
 */
var geigerOptions;

geigerOptions = {
    showDistance : false,
    scooperRadius : false,
    deathPossible : false,
    useRandom : false,

    /**
     * Make sure the internal variables match the checkboxes.
     * Also called by geigerManager.newGame().
     */
    reconcile : function() {
        this.showDistance = document.getElementById("showDistance").checked;
        var tRadiusValue = document.getElementById("radius").value;
        this.scooperRadius = Number(tRadiusValue);
        this.deathPossible = document.getElementById("deathPossible").checked;
        this.useRandom = document.getElementById("useRandom").checked;
        geigerManager.updateScreen();
    }

}