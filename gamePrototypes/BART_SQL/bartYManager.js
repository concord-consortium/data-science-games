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

    version :  "002-",
    daysOfWeek : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    kBaseURL :  "http://localhost:8888/bart/getBARTYdata.php",   //  "getBARTYdata.php",   //  todo : set to release URL
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
        this.fixDataSelectionText();
        this.fixUI();
    },

    /**
     * Called when a new game is starting,
     * created the top-level "game' case, and records the ID for the case.
     */
    newGame: function ( ) {
        meeting.setMeetingValues();     //   initialize the meeting location
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
     * Adjust the UI with regard to disabled controls and visibility. Called whenever things could change.
     */
    fixUI : function() {
        //  var timeString = TEEUtils.padIntegerToTwo(this.dataHour) + ":" + TEEUtils.padIntegerToTwo(this.dataMinute);
        //  $('#timeControl').val(timeString);

        $("#newGameButton").text( this.playing ? "abort game" : "new game");

        if (this.playing) {
            $("#getDataBlock").prop("disabled", false);
            $(".options").hide();
        } else {
            $(".options").show();
            $("#getDataBlock").prop("disabled", true);
        }

        this.getDataSearchCriteria();
        //  here we could write a longer description of what you will get if you press get data.
    },

    fixDataSelectionText : function() {
        var tArrivalStationName = $("#arrivalSelector").find('option:selected').text();
        var tDepartureStationName = $("#departureSelector").find('option:selected').text();
        $("#byRouteItemText").html("from <strong>" + tDepartureStationName
            + "</strong> to <strong>" + tArrivalStationName + "</strong> (one week)");
        $("#byDepartureItemText").html("from <strong>"
            + tDepartureStationName + "</strong> to any station (six hours)");
        $("#byArrivalItemText").html("from any station to <strong>" + tArrivalStationName + "</strong> (six hours)");
    },


    /**
     * assembles the "POST" string that $.ajax() needs to communicate the variables php needs to assemble
     * the MySQL query that will get us our data.
     *
     * A finished string might be something like
     *      ?c=byArrival&stn1=Orinda&startTime=2015-09-30 10:00:00&stopTime=2015-09-30 11:00:00
     * @returns {string}
     */
    assembleQueryDataString : function(  ) {

        var dataString = "c=" + this.dataChoice;
        var stationClauseString = "";

        switch (this.dataChoice) {
            case "byTime":
                //  tEndTime.setTime(tEndTime.getTime() + 10 * 60 * 1000);   //   one minute later
                break;

            case "byRoute":
                stationClauseString = "&stn1=" + this.arrivalStation;   //  the abbr6 of that station
                stationClauseString += "&stn0=" + this.departureStation ;   //  the abbr6 of that station
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
        var tDataString = this.assembleQueryDataString(  );
        var theData;
        var tRememberedDateHour = null;
        this.connector.newBucketCase( bucketCaseCreated );     //  open the "bucket" case. bucketCaseCreated is the callback.

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
            $("#status").text("parsing data from eeps...");
            theData = JSON.parse( iData );
            if (theData.length) $("#result").html("Got data! ");
            else $("#result").html("No data. ");
            $("#status").text("loading data into CODAP...");
            tRememberedDateHour = null;
            theData.forEach( processHours );
            $("#status").text("Ready.");
        }


        function processHours( ex ) {       //[ id = ex.id, hours (calculated), time = ex.exitTime, ex.origin, ex.destination, ex.ticket ]

            /*
             Here, in BARTY, we need to (temporarily) set it up so a time period, an hour, is superordinate to the rest of the data.
             We could arrange this by making a MySQL query that would restrict to that time period, and then issue a new query if we have a new hour,
             but I don't want to do that because really we should get it all and make the user reorganize the data.
             But that's not working yet, so HERE, where we get ALL the data, we will organize the incoming data by hour and make both levels of the hierarchy.

             So we will detect a change by looking for a change in (ex.date + ex.hour).

             */

            var tThisDate = ex.date;
            var tThisHour = ex.hour
            var tThisDateHour = tThisDate + tThisHour;

            if (tThisDateHour != tRememberedDateHour) { //  new dateHour, gotta make a new "hours" record
                tRememberedDateHour = tThisDateHour;

                var tDay = TEEUtils.dateStringToDayOfWeek( ex.date, " GMT-0800");
                var tDOY = TEEUtils.dateStringToDOY(ex.date) + ex.hour/24;
                var tValues = [tDOY, bartManager.daysOfWeek[ tDay ], ex.hour, ex.date];

                bartManager.connector.newHourCase(tValues, hourCaseCreated);
            }

            function hourCaseCreated( iResult ) {
                if (iResult.success) {
                    bartManager.connector.hourCaseID = iResult.caseID;   //  set bucketCaseID on callback
                    processDataFromThisHour( tThisDateHour, iResult.caseID );
                } else {
                    console.log("Failed to create hour case for " + tThisDateHour + ".");
                }
            }

            function processDataFromThisHour( iParentDateHour, iCaseID ) {

                theData.forEach( function( oneHour ) {
                    var tThisDateHour = oneHour.date + oneHour.hour;
                    if (tThisDateHour == iParentDateHour) {

                        var tDay = TEEUtils.dateStringToDayOfWeek( oneHour.date, " GMT-0800");

                        var tAdjustedCount = meeting.adjustCount(
                            oneHour.startAt,
                            oneHour.endAt,
                            tDay,           //      the index of the weekday
                            oneHour.hour,
                            oneHour.count
                        );

                        if (tAdjustedCount != oneHour.count) {
                            console.log("Adjust count from " + oneHour.count + " to " + tAdjustedCount);
                        }
                        bartManager.connector.doDataRecord(
                            [
                                tAdjustedCount,
                                oneHour.startAt,
                                oneHour.endAt,
                                oneHour.startReg,
                                oneHour.endReg,
                                oneHour.id
                            ],
                            iCaseID         //      case ID for the "hours" parent case
                        )
                    }

                })
            }
        }

    },

    /**
     * Start up the simulation. Called once on reload.
     */
    initialize : function() {

        this.connector = new bartCODAPConnector( "games", "buckets", "hours" );
        $("#dateControl").val( this.kBaseDateString );
        $("#hourControl").val( this.kBaseHour );

        this.makeOptionsFromStationsDB();

        //  set up game options
        this.makeMeetingLocationOptions();
        this.makeWeekdaysOptions();
        this.makeMeetingTimeOptions();
        this.makeMeetingSizeOptions();

        this.fixUI();
    },

    makeMeetingTimeOptions : function() {
        var result = "";
        meeting.possibleTimes.forEach(
            function( t ) {
                result += "<option value='"+t+"'>" + t +":00 </option>";
            }
        )
        $('#meetingTimeSelector').empty().append( result );
        $('#meetingTimeSelector').append( "<option value='-1' disabled>————</option>" );
        $('#meetingTimeSelector').append( "<option value='0'>Surprise me</option>" );
        $('#meetingTimeSelector').val(14);
    },

    makeMeetingSizeOptions : function() {
        var result = "";
        meeting.possibleSizes.forEach(
            function( s ) {
                result += "<option value='"+s+"'>" + s +" people </option>";
            }
        )
        $('#meetingSizeSelector').empty().append( result );
        $('#meetingSizeSelector').append( "<option value='-1' disabled>————</option>" );
        $('#meetingSizeSelector').append( "<option value='0'>Surprise me</option>" );
        $('#meetingSizeSelector').val(160);
    },

    makeMeetingLocationOptions : function() {

        var result = "";
        Object.keys(meeting.possibleStations).forEach(
            function( iAbbr6 ) {
                result += "<option value='"+iAbbr6+"'>" + meeting.possibleStations[iAbbr6] +"</option>";
            }
        )
        $('#meetingLocationSelector').empty().append( result );
        $('#meetingLocationSelector').append( "<option value='-1' disabled>————</option>" );
        $('#meetingLocationSelector').append( "<option value='0'>Surprise me</option>" );
    },

    makeWeekdaysOptions : function() {
        var result = "";
        this.daysOfWeek.forEach(
            function( iDay, index ) {
                result += "<option value='"+ index +"'>" + iDay +"</option>";
            }
        )
        $('#meetingDaySelector').empty().append( result );
        $('#meetingDaySelector').append( "<option value='-1' disabled>————</option>" );
        $('#meetingDaySelector').append( "<option value='0'>Surprise me</option>" );
        $('#meetingDaySelector').val( 2 );      //  default to Tuesday
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
                $("#arrivalSelector").val("Orinda");   // choose default value

                $("#departureSelector").empty().append(result);   // put them into the DOM
                $("#departureSelector").val("Embarc");   // choose default value

            }
        });

    },


    bartDoCommand : function() {

    }
};