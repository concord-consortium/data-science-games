/**
 * Created by tim on 2/12/16.
 */


var fars;

fars = {
    version : "000",
    connector : null,
    fields : ['age', 'injury', 'ptype', 'sex', 'restraint', 'state', 'lat', 'long'],
    totalSampleSize : 0,

    doSample : function( iN ) {
        this.getPeople( iN );
        this.totalSampleSize += iN;
        $( "#statusText").text( this.totalSampleSize + " in sample.")
    },

    getPeople : function( iN ) {
        var $result;

        $.ajax({
                url : "http://localhost:8888/fars/source/jsonFARS.php?theID=17&sampleSize=" + iN,
                type : "GET",
                dataType : "json",
                success : function( iResult ) {
                    fars.processResult( iResult );
                }
            }
        );
    },

    processResult : function(iData) {

        iData.forEach( function(d) {
            var dataArray = [];
            fars.fields.forEach( function(key) {
                dataArray.push( d[key] )
            });
            fars.connector.newGameCase( dataArray );
            fars.connector.finishGameCase( dataArray );
        });
    },

    initialize : function() {
        this.connector = new farsCODAPConnector( "people" );
        this.totalSampleSize = 0;
    },

    farsDoCommand : function( arg, iCallback ) {

    }

}





