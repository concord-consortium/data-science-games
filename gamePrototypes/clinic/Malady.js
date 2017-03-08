/**
 * Created by tim on 1/25/16.
 */


var Malady;

Malady = function ( inType ) {
    this.name = namesForGames.getName("last")+"'S " + TEEUtils.pickRandomItemFrom(["Fever", "Syndrome", "Condition"])
};

