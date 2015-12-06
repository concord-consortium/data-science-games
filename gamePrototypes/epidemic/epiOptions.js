/**
 * Created by tim on 12/6/15.
 */


var epiOptions;

epiOptions = {
    dataOnCritterClick : false,
    dataOnArrival : false,
    dataOnDeparture : false,

    optionChange : function() {
        this.dataOnCritterClick = document.getElementById("dataOnCritterClick").checked;
        this.dataOnArrival = document.getElementById("dataOnArrival").checked;
        this.dataOnDeparture = document.getElementById("dataOnDeparture").checked;
    }

}