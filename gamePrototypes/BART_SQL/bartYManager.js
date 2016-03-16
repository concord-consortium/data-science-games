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
    queryTypes : ["byArrival", "byDeparture", "byRoute", "betweenAny"],
    kBaseURL :  "http://localhost:8888/bart/getBARTYdata.php",   //  "getBARTYdata.php",   //  todo : set to release URL
    kBaseDateString : "2015-04-15",
    kBaseH0 : 8,
    kBaseH1 : 14,

    kGetData : "data",
    kGetCounts : "counts",

    connector : null,
    playing : false,

    queryData : {},
    possibleCosts : {},
    caseCounts : {},


    /**
     * USer has pressed the button to get data.
     * @param e     The mouse event
     */
    getDataButtonPressed : function(e) {

        this.getDataSearchCriteria();   //  make sure we have current values
        this.doBucketOfData(  );        //  actually get the data
        this.fixUI();                   //  update what we see
    },

    showPricesButtonPressed : function() {
        this.getDataSearchCriteria();   //  make sure we have current values
        this.doCaseCounts();

        this.fixUI();
    },

    dataSelectionChanged : function()   {
        this.possibleCosts = {
            "betweenAny" : "$ ?.??",
            "byRoute" : "$ ?.??",
            "byDeparture" : "$ ?.??",
            "byArrival" : "$ ?.??"
        };

        this.fixUI();
    },

    hourControlSlides : function( event, ui) {
        this.possibleCosts = {
            "betweenAny" : "$ ?.??",
            "byRoute" : "$ ?.??",
            "byDeparture" : "$ ?.??",
            "byArrival" : "$ ?.??"
        };

        this.queryData.h0 = ui.values[0];
        this.queryData.h1 = ui.values[1];
        this.fixUI();
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

        this.fixDataSelectionText();

        $("#newGameButton").text( this.playing ? "abort game" : "new game");

        if (this.playing) {
            $("#getDataButton").prop("disabled", false);
            $(".options").hide();
        } else {
            $(".options").show();
            $("#getDataButton").prop("disabled", true);
        }


        //  here we could write a longer description of what you will get if you press get data.
    },

    /**
     * Read the UI controls and set up properties so that the data search will be correct.
     *  Also gets the names (abbr6's) of the stations.
     */
    getDataSearchCriteria : function() {

        this.queryData.c = $("input:radio[name=dataChoice]:checked" ).val();     //  jQuery wizardry to find chosen among radio buttons
        this.queryData.stn0 = $("#departureSelector").val();
        this.queryData.stn1 = $("#arrivalSelector").val();
        this.queryData.d0 = $("#dateControl").val();              //  String of the date
        this.queryData.nd = Number($("#numberOfDaysControl").val());

        this.queryData.weekday = TEEUtils.dateStringToDayOfWeek( this.queryData.d0, "GMT-0800" );
        this.queryData.useWeekday = $("#useWeekday").is(":checked");
        this.queryData.useHour = $("#useHour").is(":checked");

        var tD0 = new Date( this.queryData.d0 + "GMT-0800");
        var tDt = (this.queryData.nd - 1) * 86400 * 1000 * (this.queryData.useWeekday ? 7 : 1);
        var tD1 = new Date( tD0.getTime() + tDt);
        this.queryData.d1 = tD1.ISO_8601_string();


    },

    fixDataSelectionText : function() {

        this.getDataSearchCriteria();

        //  Whole names of selected stations
        var tArrivalStationName = $("#arrivalSelector").find('option:selected').text();
        var tDepartureStationName = $("#departureSelector").find('option:selected').text();

        //  time description text.
        var tEndHour = this.queryData.h1 - 1;
        var tWeekdayText = bartManager.daysOfWeek[ this.queryData.weekday ];
        var tHoursText = "from " + this.queryData.h0 + ":00 to " + tEndHour + ":59";
        if (this.queryData.h0 == this.queryData.h1) tHoursText = " zero time interval; no data";
        var tTimeDescriptionText = " Any day, all day.";

        //  fix the weekday text
        var tWeekdayBoxLabel = this.queryData.useWeekday
            ? tWeekdayText + " only. Deselect for any day:"
            : "Select to search " + tWeekdayText + " only:";

        //  fix the hours text
        var tHoursBoxLabel = this.queryData.useHour
            ? "Using hour range. Deslect for whole day: "
            : "Searching whole day. Select to use hours: ";

        $("#useHoursItemText").text( tHoursBoxLabel );
        $("#useWeekdayItemText").text( tWeekdayBoxLabel );
        $("#timeDescription").text(
            (this.queryData.useWeekday ? tWeekdayText + " only, " : "Any day, ")
            + (this.queryData.useHour ? tHoursText + "." : "all day.")
        );

        //  assemble "data interval statement"

        var tSearchTime = (this.queryData.d0 == this.queryData.d1)
            ? this.queryData.d0
            : this.queryData.d0 + " to " + this.queryData.d1;
        tSearchTime += ", ";

        if (this.queryData.useWeekday) tSearchTime += tWeekdayText + " only, "
        tSearchTime += (this.queryData.useHour ? tHoursText : " all day");

        $("#dataIntervalStatement").text( tSearchTime );

        $("#betweenAnyItemText").html("between any two stations " + this.possibleCosts["betweenAny"]);
        $("#byRouteItemText").html("from <strong>" + tDepartureStationName
            + "</strong> to <strong>" + tArrivalStationName + "</strong> " + this.possibleCosts["byRoute"]);
        $("#byDepartureItemText").html("from <strong>"
            + tDepartureStationName + "</strong> to any station " + this.possibleCosts["byDeparture"]);
        $("#byArrivalItemText").html("from any station to <strong>"
            + tArrivalStationName + "</strong> " + this.possibleCosts["byArrival"]);
    },



    /**
     * assembles the "POST" string that $.ajax() needs to communicate the variables php needs to assemble
     * the MySQL query that will get us our data.
     *
     * A finished string might be something like
     *      ?c=byArrival&stn1=Orinda&startTime=2015-09-30 10:00:00&stopTime=2015-09-30 11:00:00
     * @returns {string}
     */
    assembleQueryDataString : function( iCommand, iWhat ) {

        var dataString = "c=" + iCommand;
        var tStationClauseString = "";

        switch (iWhat) {
            case this.kGetData:
                dataString += "&w=data";
                break;

            case this.kGetCounts:
                dataString += "&w=counts";
                break;
        }

        switch ( iCommand ) {
            case "betweenAny":
                //  no station clauses

                break;

            case "byRoute":
                tStationClauseString = "&stn1=" + this.queryData.stn1;   //  the abbr6 of that station
                tStationClauseString += "&stn0=" + this.queryData.stn0 ;   //  the abbr6 of that station
                break;

            case "byArrival":
                //  tEndTime.setTime(tEndTime.getTime() + 20 * 60 * 1000);   //   20 minutes later
                tStationClauseString = "&stn1=" + this.queryData.stn1;   //  the abbr6 of that station
                break;

            case "byDeparture":
                //  tEndTime.setTime(tEndTime.getTime() + 20 * 60 * 1000);   //   20 minutes later
                tStationClauseString = "&stn0=" + this.queryData.stn0 ;   //  the abbr6 of that station
                break;

            default:
                tQuery += " true LIMIT 10"
        }

        dataString += "&d0=" + this.queryData.d0 + "&d1=" + this.queryData.d1;
        if (this.queryData.useHour) dataString += "&h0=" + this.queryData.h0 + "&h1=" + this.queryData.h1;
        if (this.queryData.useWeekday) dataString += "&dow=" + this.queryData.weekday;
        dataString += tStationClauseString;


        $("#query").html( "<strong>data string for PHP</strong> : " + dataString );
        return dataString;
    },

    estimateCount : function( iCommand, iQueryData ) {
        var days = iQueryData.nd;
        //  if ( iQueryData.useWeekday ) days = 1 + Math.floor(days / 7);

        var hoursPerDay = 20;
        if ( iQueryData.useHour ) hoursPerDay = iQueryData.h1 - iQueryData.h0;

        var totalHours = days * hoursPerDay;

        var estimate;

        switch ( iCommand ) {
            case "betweenAny":
                estimate = totalHours * 1500;
                break;

            case "byDeparture":
                estimate = totalHours * 35;
                break;
            case "byArrival":
                estimate = totalHours * 35;
                break;

            case "byRoute":
                estimate = totalHours;
                break;
            default:
                estimate = 42;
        }

        return estimate;
    },

    doCaseCounts : function() {
        var theData;

        this.queryTypes.forEach( function( iQT ) {
            bartManager.caseCounts[ iQT ] = null;   //  set dirty

            var tDataString = bartManager.assembleQueryDataString( iQT, bartManager.kGetCounts );

            var tCountEstimate = bartManager.estimateCount( iQT, bartManager.queryData );

            bartManager.possibleCosts[ iQT ] = "$ " + tCountEstimate + ".00 est";   //  temporary
            bartManager.fixUI();        //  temporary

            if (tCountEstimate <= 1500) {
                $.ajax({
                    type: "post",
                    url: bartManager.kBaseURL,
                    data: tDataString,
                    success: weGotPrice
                });

                function weGotPrice(iData) {
                    var jData = JSON.parse(iData)[0];     //  first object in the array
                    var tKeys = Object.keys(jData);

                    var tCount = Number(jData[tKeys[0]]);
                    bartManager.caseCounts[iQT] = tCount;
                    bartManager.possibleCosts[iQT] = "$ " + tCount + ".00";

                    bartManager.fixUI();

                    //  todo: fix the following loop, not working as of 2016-03-14

                    if (bartManager.queryTypes.every(function (iQT) {
                            bartManager.caseCounts[iQT] >= 0;
                        })) {
                        console.log("All case counts retrieved");
                    }
                }
            } else {
                bartManager.possibleCosts[iQT] = "too expensive";
                bartManager.fixUI();

                //  todo: fix the following loop, not working as of 2016-03-14

                if (bartManager.queryTypes.every(function (iQT) {
                        bartManager.caseCounts[iQT] >= 0;
                    })) {
                    console.log("All case counts retrieved");
                }

            }
        });
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
     *  (4) processHours : extract the individual data values from the record and create a new "leaf" case
     */
    doBucketOfData : function() {
        var tDataString = this.assembleQueryDataString( this.queryData.c, this.kGetData );
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
            *****   Called once for each record returned from the DB.  *******

             Here, in BARTY, we need to (temporarily) set it up so a time period, an hour,
             is superordinate to the rest of the data.
             We could arrange this by making a MySQL query that would restrict to that time period,
             and then issue a new query if we have a new hour,
             but I don't want to do that because really we should get it all and make the user reorganize the data.
             But that's not working yet, so HERE, where we get ALL the data,
             we will organize the incoming data by hour and make both levels of the hierarchy.

             So we will detect a change by looking for a change in (ex.date + ex.hour).

             */

            var tThisDate = ex.Bdate;
            var tThisHour = ex.hour;
            var tThisDateHour = tThisDate + tThisHour;

            if (tThisDateHour != tRememberedDateHour) { //  new dateHour, gotta make a new "hours" record
                tRememberedDateHour = tThisDateHour;

                var tDay = ex.dow - 1;
                var tDOY = TEEUtils.dateStringToDOY(ex.Bdate) + ex.hour/24;
                var tValues = [tDOY, bartManager.daysOfWeek[ tDay ], ex.hour, ex.Bdate];

                bartManager.connector.newHourCase(tValues, hourCaseCreated);
            }

            function hourCaseCreated( iResult ) {
                if (iResult.success) {
                    bartManager.connector.hourCaseID = iResult.caseID;   //  set hourCaseID on callback
                    processDataFromThisHour( tThisDateHour, iResult.caseID );
                } else {
                    console.log("Failed to create hour case for " + tThisDateHour + ".");
                }
            }

            /**
             * At the moment, we're going through the entire iData array again for every hour,
             * looking for all the children that belong.
             * @param iParentDateHour
             * @param iCaseID
             */
            function processDataFromThisHour( iParentDateHour, iCaseID ) {

                theData.forEach( function( oneHour ) {
                    var tThisDateHour = oneHour.Bdate + oneHour.hour;
                    if (tThisDateHour == iParentDateHour) {

                        var tAdjustedCount = meeting.adjustCount(
                            oneHour.startAt,
                            oneHour.endAt,
                            oneHour.dow - 1,           //      the index of the weekday
                            oneHour.hour,
                            oneHour.passengers
                        );

                        if (tAdjustedCount != oneHour.passengers) {
                            console.log("Adjust count from " + oneHour.passengers + " to " + tAdjustedCount);
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

        //  set up hours control

        this.queryData.h0 = this.kBaseH0;
        this.queryData.h1 = this.kBaseH1;

        $("#hourControl").slider({
            range : true,
            min : 4,
            max : 24,
            values : [ this.queryData.h0, this.queryData.h1 ],
            slide : bartManager.hourControlSlides.bind(bartManager),
            step : 1
        });


        //  get menu items for a list of stations
        this.makeOptionsFromStationsDB();

        //  set up game options -- possible meeting parameters and menus
        this.makeMeetingLocationOptions($('#meetingLocationSelector'));
        this.makeWeekdaysOptions($('#meetingDaySelector'));
        this.makeMeetingTimeOptions($('#meetingTimeSelector'));
        this.makeMeetingSizeOptions($('#meetingSizeSelector'));

        this.possibleCosts = {
            "betweenAny" : "$ ?.??",
            "byRoute" : "$ ?.??",
            "byDeparture" : "$ ?.??",
            "byArrival" : "$ ?.??"
        };

        this.fixUI();
    },

    makeMeetingTimeOptions : function( iSelector ) {
        var result = "";
        meeting.possibleTimes.forEach(
            function( t ) {
                result += "<option value='"+t+"'>" + t +":00 </option>";
            }
        );
        iSelector.empty().append( result );
        iSelector.append( "<option value='-1' disabled>————</option>" );
        iSelector.append( "<option value='0'>Surprise me</option>" );
        iSelector.val(14);
    },

    makeMeetingSizeOptions : function( iSelector ) {
        var result = "";
        meeting.possibleSizes.forEach(
            function( s ) {
                result += "<option value='"+s+"'>" + s +" people </option>";
            }
        );
        iSelector.empty().append( result );
        iSelector.append( "<option value='-1' disabled>————</option>" );
        iSelector.append( "<option value='0'>Surprise me</option>" );
        iSelector.val(160);
    },

    makeMeetingLocationOptions : function( iSelector ) {

        var result = "";
        Object.keys(meeting.possibleStations).forEach(
            function( iAbbr6 ) {
                result += "<option value='"+iAbbr6+"'>" + meeting.possibleStations[iAbbr6] +"</option>";
            }
        );
        iSelector.empty().append( result );
        iSelector.append( "<option value='-1' disabled>————</option>" );
        iSelector.append( "<option value='0'>Surprise me</option>" );
    },

    makeWeekdaysOptions : function( iSelector ) {
        var result = "";
        this.daysOfWeek.forEach(
            function( iDay, index ) {
                result += "<option value='"+ index +"'>" + iDay +"</option>";
            }
        )
        iSelector.empty().append( result );
        iSelector.append( "<option value='-1' disabled>————</option>" );
        iSelector.append( "<option value='0'>Surprise me</option>" );
        iSelector.val( 2 );      //  default to Tuesday
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