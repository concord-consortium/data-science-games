/**
 * Created by tim on 12/6/15.
 */


var epiOptions;

epiOptions = {
    dataOnCritterClick : false,
    dataOnArrival : false,
    dataOnDeparture : false,
    showCarrier : false,
    endlessGame : false,

    pMaladyNumber : null,
    pMaladyName : null,
    pMaladyNameList : ['Thritch', 'Argle Fever', "Hudson's Bloat"],

    optionChange : function() {
        this.dataOnCritterClick = document.getElementById("dataOnCritterClick").checked;
        this.dataOnArrival = document.getElementById("dataOnArrival").checked;
        this.dataOnDeparture = document.getElementById("dataOnDeparture").checked;
        this.showCarrier = document.getElementById("showCarrier").checked
        this.endlessGame = document.getElementById("endlessGame").checked
    },

    getSaveObject: function() {
        var tSaveObject = {
            dataOnCritterClick : this.dataOnCritterClick,
            dataOnArrival : this.dataOnArrival,
            dataOnDeparture : this.dataOnDeparture,
            showCarrier : this.showCarrier,
            endlessGame : this.endlessGame,
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

        document.getElementById("dataOnCritterClick").checked = iObject.dataOnCritterClick;
        document.getElementById("dataOnArrival").checked = iObject.dataOnArrival;
        document.getElementById("dataOnDeparture").checked = iObject.dataOnDeparture;
        document.getElementById("showCarrier").checked = iObject.showCarrier;
        document.getElementById("endlessGame").checked = iObject.endlessGame;

        this.optionChange();
    },

}