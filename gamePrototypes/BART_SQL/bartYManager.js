/**
 ==========================================================================
bartYManager.js

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

/* global $, TEEUtils, console */

var bart = {};

bart.constants = {
    version :  "002a",
    daysOfWeek : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    queryTypes : ["byArrival", "byDeparture", "byRoute", "betweenAny"],
    kBaseURL :  "http://localhost:8888/bart/getBARTYdata.php",   //  "getBARTYdata.php",   //  todo : set to release URL
    kBaseDateString : "2015-04-15",
    kBaseH0 : 8,
    kBaseH1 : 14,

    kGetData : "data",
    kGetCounts : "counts",
    kRegionColorMap : {
        "Peninsula" : "purple",
        "City" : "red",
        "Downtown" : "orange",
        "Oakland" : "green",
        "East Bay" : "dodgerblue"
    },
    kWeekdayColorMap : {
        "Sun" : "green",
        "Mon" : "orange",
        "Tue" : "coral",
        "Wed" : "gold",
        "Thu" : "goldenrod",
        "Fri" : "lightsalmon",
        "Sat" : "limegreen"
    }
}


bart.manager = {

    playing : false,

    queryData : {},
    possibleCosts : {},
    caseCounts : {},


    /**
     * Called when a new game is starting,
     * created the top-level "game' case, and records the ID for the case.
     */
    newGame: function ( ) {
        meeting.setMeetingValues();     //   initialize the meeting location
        bart.connector.newGameCase(
            function( iResult ) {
                bart.connector.gameCaseID = iResult.caseID;   //  set gameCaseID on callback
                console.log("Game case ID set to " + iResult.caseID);
                bart.manager.playing = true;
                bart.ui.fixUI();
            }.bind(this)    //  todo: maybe remove bind
        );
    },

    /**
     * Called whenever a game ends.
     * @param iReason   why the game ended, a string, e.g., "aborted" "won" "lost"
     */
    endGame: function ( iReason ) {
        bart.connector.closeGame( { result: iReason });

        this.playing = false;
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

        return this.queryData;
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
            case bart.constants.kGetData:
                dataString += "&w=data";
                break;

            case bart.constants.kGetCounts:
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
                tQuery += " true LIMIT 10";
        }

        dataString += "&d0=" + this.queryData.d0 + "&d1=" + this.queryData.d1;
        if (this.queryData.useHour) {dataString += "&h0=" + this.queryData.h0 + "&h1=" + this.queryData.h1;}
        if (this.queryData.useWeekday) {dataString += "&dow=" + this.queryData.weekday;}
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

        bart.constants.queryTypes.forEach( function( iQT ) {
            bart.manager.caseCounts[ iQT ] = null;   //  set dirty

            var tDataString = bart.manager.assembleQueryDataString( iQT, bart.constants.kGetCounts );

            var tCountEstimate = bart.manager.estimateCount( iQT, bart.manager.queryData );

            bart.manager.possibleCosts[ iQT ] = "$ " + tCountEstimate + ".00 est";   //  temporary
            bart.ui.fixUI();        //  temporary

            if (tCountEstimate <= 1500) {
                $.ajax({
                    type: "post",
                    url: bart.constants.kBaseURL,
                    data: tDataString,
                    success: weGotPrice
                });

                function weGotPrice(iData) {
                    var jData = JSON.parse(iData)[0];     //  first object in the array
                    var tKeys = Object.keys(jData);

                    var tCount = Number(jData[tKeys[0]]);
                    bart.manager.caseCounts[iQT] = tCount;
                    bart.manager.possibleCosts[iQT] = "$ " + tCount + ".00";

                    bart.ui.fixUI();

                    //  todo: fix the following loop, not working as of 2016-03-14

                    if (bart.constants.queryTypes.every(function (iQT) {
                            bart.manager.caseCounts[iQT] >= 0;
                        })) {
                        console.log("All case counts retrieved");
                    }
                }
            } else {
                bart.manager.possibleCosts[iQT] = "too expensive";
                bart.ui.fixUI();

                //  todo: fix the following loop, not working as of 2016-03-14

                if (bart.constants.queryTypes.every(function (iQT) {
                        bart.manager.caseCounts[iQT] >= 0;
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
     *  (2) doQuery: if successful, actually POST the information to the .php feed (bart.constants.kBaseURL)
     *  (3) weGotData( iData ): if successful, process the array, each element using...
     *  (4) processHours : extract the individual data values from the record and create a new "leaf" case
     */
    doBucketOfData : function() {
        var tDataString = this.assembleQueryDataString( this.queryData.c, this.kGetData );
        var theData;
        var tRememberedDateHour = null;
        bart.connector.newBucketCase( bucketCaseCreated );     //  open the "bucket" case. bucketCaseCreated is the callback.

        function bucketCaseCreated( iResult ) {
            if (iResult.success) {
                bart.connector.bucketCaseID = iResult.caseID;   //  set bucketCaseID on callback
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
                url :   bart.constants.kBaseURL,
                data :  tDataString,
                success: weGotData
            });
        }

        function weGotData(iData) {
            $("#status").text("parsing data from eeps...");
            theData = JSON.parse( iData );
            $("#result").text( (theData.length) ? " Got " + theData.length + " records! " : "No data. ");
            $("#status").text("loading data into CODAP...");
            tRememberedDateHour = null;

            var     reorganizedData = {};
            theData.forEach( reorganizeByHour );

            //  now data are reorganized by hour

            $("#status").text("Data reorganized.");

            Object.keys( reorganizedData ).forEach( function( iKey ) {
                var tHourObject = reorganizedData[iKey];
                storeOneHour( tHourObject );
            } );

            function reorganizeByHour( iRec ) {
                var tThisDate = iRec.Bdate;
                var tThisHour = iRec.hour;
                var tThisDateHour = tThisDate + tThisHour;  //  must be a string or number

                if ( !(tThisDateHour in reorganizedData) ) {    //  make a new key
                    var tDay = iRec.dow - 1;
                    var tDOY = TEEUtils.dateStringToDOY(iRec.Bdate) + iRec.hour/24;
                    var tHourValuesArray = [ tDOY, bart.constants.daysOfWeek[ tDay ], iRec.hour, iRec.Bdate ];

                    reorganizedData[tThisDateHour] = { hourValues : tHourValuesArray, dataValues : [] }; //  create new elemnt in the object
                }

                var tDataValuesArray = getDataArrayFromThisRecord( iRec );
                reorganizedData[tThisDateHour].dataValues.push(tDataValuesArray);
            };

            function storeOneHour( iHourObject ) {
                var tHourDataValues = iHourObject.hourValues;      //      get the data array that needs to be stored
                bart.connector.newHourCase(tHourDataValues, hourCaseCreated );  //  store it

                function hourCaseCreated( iResult ) {
                    if (iResult.success) {
                        iHourObject.hourCaseID = iResult.caseID;   //  set hourCaseID on callback
                        processDataFromThisHour(  );
                    } else {
                        console.log("Failed to create hour case for " + tThisDateHour + ".");
                    }
                }

                function processDataFromThisHour(  ) {
                    var tDataArray = iHourObject.dataValues;

                    tDataArray.forEach( function( iOneDataValuesArray ) {
                        bart.connector.doDataRecord( iOneDataValuesArray, iHourObject.hourCaseID);
                    });
                };

            }




            function getDataArrayFromThisRecord( iRec ) {

                var tAdjustedCount = meeting.adjustCount(
                    iRec.startAt,
                    iRec.endAt,
                    iRec.dow - 1,           //      the index of the weekday
                    iRec.hour,
                    iRec.passengers
                );

                if (tAdjustedCount != iRec.passengers) {
                    console.log("Adjust count from " + iRec.passengers + " to " + tAdjustedCount);
                }
                return [
                    tAdjustedCount,
                    iRec.startAt,
                    iRec.endAt,
                    iRec.startReg,
                    iRec.endReg,
                    iRec.id
                ]
            }

        }

    },


    bartDoCommand : function() {

    }
};

/**
 * Start up the simulation. Called once on reload.
 */
bart.initialize = function() {

    this.connector = new bartCODAPConnector( "games", "buckets", "hours" );
    $("#dateControl").val( bart.constants.kBaseDateString );
    /*
     $("#dateControl").datepicker({
     minDate : "2015-04-01",             //  todo: pass in a date, when we figur out how to cope with the time zone!
     maxDate : "2015-09-30"
     });
     */

    //  set up hours control

    this.manager.queryData.h0 = this.constants.kBaseH0;
    this.manager.queryData.h1 = this.constants.kBaseH1;

    $("#hourControl").slider({
        range : true,
        min : 0,
        max : 24,
        values : [ this.manager.queryData.h0, this.manager.queryData.h1 ],
        slide : bart.ui.hourControlSlides.bind(this),
        step : 1
    });


    //  get menu items for a list of stations
    this.ui.makeOptionsFromStationsDB();

    //  set up game options -- possible meeting parameters and menus
    this.ui.makeMeetingLocationOptions($('#meetingLocationSelector'));
    this.ui.makeWeekdaysOptions($('#meetingDaySelector'));
    this.ui.makeMeetingTimeOptions($('#meetingTimeSelector'));
    this.ui.makeMeetingSizeOptions($('#meetingSizeSelector'));

    this.manager.possibleCosts = {
        "betweenAny" : "$ ?.??",
        "byRoute" : "$ ?.??",
        "byDeparture" : "$ ?.??",
        "byArrival" : "$ ?.??"
    };

    this.ui.fixUI();
}

