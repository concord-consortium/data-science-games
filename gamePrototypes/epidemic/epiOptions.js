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


}