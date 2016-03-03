/**
 ==========================================================================
bartManager.js

overall controller for BART microdata.

    Author:   Tim Erickson

Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
limitations under the License.
==========================================================================
 * Created by tim on 2/23/16.
 */


var bartManager;


bartManager = {

    version :  "001",
    kBaseURL :  "http://localhost:8888/bart/getBARTYdata.php",   //  "getBARTYdata.php"   //  todo : set to release URL
    kBaseDateString : "2015-04-15",
    kBaseHour : 15,
    dataDate : null,        //  date time format we are using
    dataHour : 15,
    connector : null,
    playing : false,
    arrivalStation : null,  //  the 6-letter abbreviation
    departureStation : null,  //  the 6-letter abbreviation
    dataChoice : null,      //  byTime, byArrival, ...


    /**
     * USer has pressed the button to get data.
     * @param e     The mouse event
     */
    getDataButtonPressed : function(e) {

        this.getDataSearchCriteria();   //  make sure we have current values
        this.doBucketOfData(  );        //  actually get the data
        this.fixUI();                   //  update what we see
    },


    /**
     * Read the UI controls and set up properties so that the data search will be correct.
     * Especially, read the time and deal with all the screwiness:
     *      convert to an actual DateTime
     *      calculate decimal hours, taking after-midnight times into account
     *  Also gets the names (abbr6's) of the stations.
     */
    getDataSearchCriteria : function() {
        //  what way do we want the data?
        this.dataChoice =   $("input:radio[name=dataChoice]:checked" ).val();   //  jQuery wizardry to find chosen among radio buttons

        this.dataDate = $("#dateControl").val();            //  String of the date
        this.dataHour = Number($("#hourControl").val());    //  the time is an actual integer hour

        //  this.dataDate.setHours( this.dataHour, 0 );

        //  get value of station
        this.arrivalStation = $("#arrivalSelector").val();
        this.departureStation = $("#departureSelector").val();
    },

    /**
     * User pressed the new game button, but when we're playing, that button is for aborting a game.
     * So this routine figures out whether to call the newGame() or endGame("abort") methods.
     */
    newGameButtonPressed : function() {
        if (this.playing) {
            this.endGame("abort")
        } else {
            this.newGame();

        }
        this.fixUI();
    },

    /**
     * Called when a new game is starting,
     * created the top-level "game' case, and records the ID for the case.
     */
    newGame: function ( ) {
        this.connector.newGameCase(
            function( iResult ) {
                this.connector.gameCaseID = iResult.caseID;   //  set gameCaseID on callback
                console.log("Game case ID set to " + iResult.caseID);
                this.playing = true;
                this.fixUI();
            }.bind(this)
        );
    },

    /**
     * Called whenever a game ends.
     * @param iReason   why the game ended, a string, e.g., "aborted" "won" "lost"
     */
    endGame: function ( iReason ) {
        this.connector.closeGame( { result: iReason });

        this.playing = false;
    },


    /**
     * Start up the simulation. Called once on reload.
     */
    initialize : function() {
        this.connector = new bartCODAPConnector( "games", "buckets" );
        $("#dateControl").val( this.kBaseDateString );
        $("#hourControl").val( this.kBaseHour );

        this.makeOptionsFromStationsDB();
        this.fixUI();
    },


    /**
     * Adjust the UI with regard to disabled controls and visibility. Called whenever things could change.
     */
    fixUI : function() {
        //  var timeString = TEEUtils.padIntegerToTwo(this.dataHour) + ":" + TEEUtils.padIntegerToTwo(this.dataMinute);
        //  $('#timeControl').val(timeString);

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

    /**
     * assembles the "POST" string that $.ajax() needs to communicate the variables php needs to assemble
     * the MySQL query that will get us our data.
     *
     * A finished string might be something like
     *      ?c=byArrival&stn1=Orinda&startTime=2015-09-30 10:00:00&stopTime=2015-09-30 11:00:00
     *
     *
     *
     * @returns {string}
     */
    assembleQueryDataString : function() {

        var dataString = "c=" + this.dataChoice;
        var stationClauseString = "";

        switch (this.dataChoice) {
            case "byTime":
                //  tEndTime.setTime(tEndTime.getTime() + 10 * 60 * 1000);   //   one minute later
                break;

            case "byArrival":
                //  tEndTime.setTime(tEndTime.getTime() + 20 * 60 * 1000);   //   20 minutes later
                stationClauseString = "&stn1=" + this.arrivalStation;   //  the abbr6 of that station
                break;

            case "byDeparture":
                //  tEndTime.setTime(tEndTime.getTime() + 20 * 60 * 1000);   //   20 minutes later
                stationClauseString = "&stn0=" + this.departureStation ;   //  the abbr6 of that station
                break;

            default:
                tQuery += " true LIMIT 10"
        }

        dataString += "&d=" + this.dataDate
            + "&h=" + this.dataHour
            + stationClauseString;

        $("#query").html( "<strong>data string for PHP</strong> : " + dataString );
        return dataString;
    },

    /**
     * Called from getDataButtonPressed()
     * Called when we need more data from the database.
     * Variables about what data we want have already been set.
     *
     *  This is a cascade of functions, some of which are asynchronous.
     *  (1) Create the "bucket" case, the parent of all the individual observations
     *  (2) doQuery: if successful, actually POST the information to the .php feed (bartManager.kBaseURL)
     *  (3) weGotData( iData ): if successful, process the array, each element using...
     *  (4) processExits : extract the individual data values from the record and create a new "leaf" case
     */
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
            theData.forEach( processHours );
            $("#status").text("Ready.");
        }

        function processHours( ex ) {       //[ id = ex.id, hours (calculated), time = ex.exitTime, ex.origin, ex.destination, ex.ticket ]

            bartManager.connector.doHourRecord(
                [
                    ex.id,
                    ex.date,
                    ex.hour,
                    ex.count,
                    ex.startAt,
                    ex.endAt,
                    ex.startReg,
                    ex.endReg
                ]
            )
        }

    },

    /**
     *  Use $.ajax() to get the list of stations from the database,
     *  then use those names to populate the menus that need stations
     */
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