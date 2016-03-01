/**
 * Created by tim on 2/23/16.
 */


var bartManager;


bartManager = {

    version :  "002a",
    kBaseURL :  "http://localhost:8888/bart/getBARTdata.php",   //  "getBARTdata.php"   //  todo : set to release URL
    kBaseDateString : "Wed Sep 30 2015 00:00:00 GMT-0700 (PDT)",
    baseDate : null,
    dataDateTime : null,
    connector : null,
    playing : false,
    arrivalStation : null,  //  the 6-letter abbreviation
    departureStation : null,  //  the 6-letter abbreviation
    dataChoice : null,      //  byTime, byArrival, ...


    getDataButtonPressed : function(e) {

        this.getDataSearchCriteria();   //  make sure we have current values
        this.doBucketOfData(  );
        this.fixUI();
    },

    getDataSearchCriteria : function() {
        //  what way do we want the data?
        this.dataChoice =   $("input:radio[name=dataChoice]:checked" ).val();   //  jQuery wizardry to find chosen among radio buttons

        //  get time value from control and process into actual DateTime
        var tTimeArray = $("#timeControl").val().split(":");       //  array of hours, minutes
        var tHour = Number(tTimeArray[0]);
        var tMinute = Number(tTimeArray[1]);        //  numerical minute

        var tDate = this.baseDate;      //  we're assembling an actual DateTime

        if (tHour < 3) {    //  BART runs til about 01:40
            tDate.setTime( tDate.getTime() + 86400 * 1000 );
        }
        tDate.setHours(tHour ? tHour : 0, tMinute ? tMinute : 0);

        this.dataDateTime = tDate;

        //Set internal time variables, just in case
        this.dataHour = tDate.getHours();
        this.dataMinute = tDate.getMinutes();

        //  get value of station
        this.arrivalStation = $("#arrivalSelector").val();
        this.departureStation = $("#departureSelector").val();
    },

    newGameButtonPressed : function() {
        if (this.playing) {
            this.endGame("abort")
        } else {
            this.newGame();

        }
        this.fixUI();
    },

    newGame: function ( ) {
        this.connector.newGameCase(
            function( iResult ) {
                this.connector.gameCaseID = iResult.caseID;   //  set gameCaseID on callback
                console.log("Game case ID set to " + iResult.caseID);
                this.playing = true;
                this.fixUI();
            }.bind(this)
        );       //  make a new game case
    },

    endGame: function ( iReason ) {
        this.connector.closeGame( { result: iReason });

        this.playing = false;
    },


    initialize : function() {
        this.dataMinute = 13;
        this.dataHour = 10;
        this.baseDate = new Date(this.kBaseDateString);
        this.connector = new bartCODAPConnector( "games", "buckets" );

        this.makeOptionsFromStationsDB();
        this.fixUI();
    },


    fixUI : function() {
        var timeString = TEEUtils.padIntegerToTwo(this.dataHour) + ":" + TEEUtils.padIntegerToTwo(this.dataMinute);
        $('#timeControl').val(timeString);

        $("#newGameButton").text( this.playing ? "abort game" : "new game");

        if (this.playing) {
            $("#getDataBlock").prop("disabled", false);
            //  $("#getDataBlock").show();
        } else {
            //$("#getDataBlock").hide();
            $("#getDataBlock").prop("disabled", true);
        }

        this.getDataSearchCriteria();
        //  here we could write a longer description of what you will get if you press get data.
    },

    assembleQueryDataString : function() {

        var tStartTime = new Date(this.dataDateTime.getTime());
        var tEndTime = new Date(this.dataDateTime.getTime());

        var dataString = "c=" + this.dataChoice;
        var stationClauseString = "";

        switch (this.dataChoice) {
            case "byTime":
                tEndTime.setTime(tEndTime.getTime() + 60 * 1000);   //   one minute later
                break;

            case "byArrival":
                tEndTime.setTime(tEndTime.getTime() + 20 * 60 * 1000);   //   20 minutes later
                stationClauseString = "&stn1=" + this.arrivalStation;   //  the abbr6 of that station
                break;

            case "byDeparture":
                tEndTime.setTime(tEndTime.getTime() + 20 * 60 * 1000);   //   20 minutes later
                stationClauseString = "&stn0=" + this.departureStation ;   //  the abbr6 of that station
                break;

            default:
                tQuery += " true LIMIT 10"
        }

        dataString += "&start=" + tStartTime.BART_string()
            + "&end=" + tEndTime.BART_string()
            + stationClauseString;

        $("#query").html( "<strong>data string for PHP</strong> : " + dataString );
        return dataString;
    },

    doBucketOfData : function() {
        var tDataString = this.assembleQueryDataString();
        var theData;
        this.connector.newBucketCase( bucketCaseCreated );     //  open the "bucket" case

        function bucketCaseCreated( iResult ) {
            if (iResult.success) {
                bartManager.connector.bucketCaseID = iResult.caseID;   //  set bucketCaseID on callback
                console.log("Bucket case ID set to " + iResult.caseID);
                doQuery( );
            } else {
                console.log("Failed to create bucket case.");
            }
        }

        function doQuery(   ) {
            $("#status").text("getting data from eeps...");
            $.ajax({
                type :  "post",
                url :   bartManager.kBaseURL,
                data :  tDataString,
                success: weGotData
            });
        }

        function weGotData(iData) {
            theData = JSON.parse( iData );
            if (theData.length) $("#result").html("Got data!");
            else $("#result").html("No data");
            $("#status").text("loading data into CODAP...");
            theData.forEach( processExits );
            $("#status").text("Ready.");
        }

        function processExits( ex ) {       //[ id = ex.id, hours (calculated), time = ex.exitTime, ex.origin, ex.destination, ex.ticket ]
            var hours = 0;
            var exitDateTime = new Date( ex.exitTime );
            var tHours = exitDateTime.getHours();
            if (tHours < 3) tHours += 24;

            hours = tHours + exitDateTime.getMinutes() / 60.0 + exitDateTime.getSeconds() / 3600.0;

            bartManager.connector.doExitRecord(
                [
                    ex.id,
                    hours,
                    ex.exitTime,
                    ex.startAt,
                    ex.endAt,
                    ex.startReg,
                    ex.endReg,
                    ex.ticket
                ]
            )
        }

    },

    makeOptionsFromStationsDB : function() {
        $.ajax({
            type :  "post",
            url :   bartManager.kBaseURL,
            data :  "c=getStations",
            success: function( iData ) {
                var result = "";
                var theStations = JSON.parse( iData );
                theStations.forEach(
                    function (sta)  {
                        result += "<option value='"+sta.abbr6+"'>"+sta.name+"</option>";
                    }
                )
                $("#arrivalSelector").empty().append(result);   // put them into the DOM
                $("#arrivalSelector").val("Orinda");   // put them into the DOM

                $("#departureSelector").empty().append(result);   // put them into the DOM
                $("#departureSelector").val("SFO");   // put them into the DOM

            }
        });

    },

    bartDoCommand : function() {

    }
};