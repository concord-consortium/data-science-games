/**
 * Created by tim on 12/6/15.
 */


var epiOptions;

epiOptions = {
    crittersMoveOnTheirOwn : false,
    dataOnCritterClick : false,
    dataOnArrival : false,
    dataOnDeparture : false,
    dataOnGetSick : false,
    showCarrier : false,
    endlessGame : false,
    smallGame : false,

    pMaladyNumber : null,
    pMaladyName : null,
    pMaladyNameList : [],

    optionChange : function() {
        this.crittersMoveOnTheirOwn = document.getElementById("crittersMoveOnTheirOwn").checked;
        this.dataOnCritterClick = document.getElementById("dataOnCritterClick").checked;
        this.dataOnArrival = document.getElementById("dataOnArrival").checked;
        this.dataOnDeparture = document.getElementById("dataOnDeparture").checked;
        this.dataOnGetSick = document.getElementById("dataOnGetSick").checked;
        this.showCarrier = document.getElementById("showCarrier").checked
        this.endlessGame = document.getElementById("endlessGame").checked
        this.smallGame = document.getElementById("smallGame").checked
    },

    getSaveObject: function() {
        var tSaveObject = {
            crittersMoveOnTheirOwn : this.crittersMoveOnTheirOwn,
            dataOnCritterClick : this.dataOnCritterClick,
            dataOnArrival : this.dataOnArrival,
            dataOnDeparture : this.dataOnDeparture,
            dataOnGetSick : this.dataOnGetSick,
            showCarrier : this.showCarrier,
            endlessGame : this.endlessGame,
            smallGame : this.smallGame,
            pMaladyNumber : this.pMaladyNumber,
            pMaladyName : this.pMaladyName,
            pMaladyNameList : this.pMaladyNameList,
        };
        return tSaveObject;
    },

    restoreFrom: function( iObject ) {
        this.pMaladyNumber = iObject.pMaladyNumber;
        this.pMaladyName = iObject.pMaladyName;
        this.pMaladyNameList = iObject.pMaladyNameList;

        document.getElementById("crittersMoveOnTheirOwn").checked = iObject.crittersMoveOnTheirOwn;
        document.getElementById("dataOnCritterClick").checked = iObject.dataOnCritterClick;
        document.getElementById("dataOnArrival").checked = iObject.dataOnArrival;
        document.getElementById("dataOnDeparture").checked = iObject.dataOnDeparture;
        document.getElementById("dataOnGetSick").checked = iObject.dataOnGetSick;
        document.getElementById("showCarrier").checked = iObject.showCarrier;
        document.getElementById("endlessGame").checked = iObject.endlessGame;
        document.getElementById("smallGame").checked = iObject.smallGame;

        this.optionChange();
    },

}