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


barty.manager = {

    playing : false,
    gameNumber : 0,
    requestNumber : 0,

    queryData : {},
    possibleCosts : {},
    caseCounts : {},


    /**
     * Called when a new game is starting,
     * created the top-level "game' case, and records the ID for the case.
     */
    newGame: function ( ) {
        meeting.setMeetingValues();     //   initialize the meeting location
        this.gameNumber++;
        barty.manager.playing = true;
        barty.ui.fixUI();
    },

    /**
     * Called whenever a game ends.
     * @param iReason   why the game ended, a string, e.g., "aborted" "won" "lost"
     */
    endGame: function ( iReason ) {
        barty.connector.closeGame( { result: iReason });

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
            case barty.constants.kGetData:
                dataString += "&w=data";
                break;

            case barty.constants.kGetCounts:
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

        barty.constants.queryTypes.forEach( function( iQT ) {
            barty.manager.caseCounts[ iQT ] = null;   //  set dirty

            var tDataString = barty.manager.assembleQueryDataString( iQT, barty.constants.kGetCounts );

            var tCountEstimate = barty.manager.estimateCount( iQT, barty.manager.queryData );

            // barty.manager.possibleCosts[ iQT ] = "$ " + tCountEstimate + ".00 est";   //  temporary
            barty.manager.possibleCosts[ iQT ] = tCountEstimate + " cases est";   //  temporary
            barty.ui.fixUI();        //  temporary

            console.log("Data query string: " + tDataString);

            if (tCountEstimate <= 1500) {
                $.ajax({
                    type: "post",
                    url: barty.constants.kBaseURL,
                    data: tDataString,
                    success: weGotPrice
                });

                function weGotPrice(iData) {
                    var jData = JSON.parse(iData)[0];     //  first object in the array
                    var tKeys = Object.keys(jData);

                    var tCount = Number(jData[tKeys[0]]);
                    barty.manager.caseCounts[iQT] = tCount;
                    // barty.manager.possibleCosts[iQT] = "$ " + tCount + ".00";
                    barty.manager.possibleCosts[iQT] = tCount + " cases";

                    barty.ui.fixUI();

                    //  todo: fix the following loop, not working as of 2016-03-14

                    if (barty.constants.queryTypes.every(function (iQT) {
                            barty.manager.caseCounts[iQT] >= 0;
                        })) {
                        console.log("All case counts retrieved");
                    }
                }
            } else {
                barty.manager.possibleCosts[iQT] = "too much data to download";
                barty.ui.fixUI();

                //  todo: fix the following loop, not working as of 2016-03-14

                if (barty.constants.queryTypes.every(function (iQT) {
                        barty.manager.caseCounts[iQT] >= 0;
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
     *  (2) doQuery: if successful, actually POST the information to the .php feed (barty.constants.kBaseURL)
     *  (3) weGotData( iData ): if successful, process the array, each element using...
     *  (4) processHours : extract the individual data values from the record and create a new "leaf" case
     */
    doBucketOfData : function() {
        barty.manager.requestNumber++;

        var tDataString = this.assembleQueryDataString( this.queryData.c, this.kGetData );
        var theData;
        var tRememberedDateHour = null;
        // barty.connector.newBucketCase( bucketCaseCreated );     //  open the "bucket" case. bucketCaseCreated is the callback.
        //
        // function bucketCaseCreated( iResult ) {
        //     if (iResult.success) {
        //         barty.connector.bucketCaseID = iResult.caseID;   //  set bucketCaseID on callback
        //         console.log("Bucket case ID set to " + iResult.caseID);
        //         doQuery( );
        //     } else {
        //         console.log("Failed to create bucket case.");
        //     }
        // }

        //function doQuery(   ) {
            $("#status").text("getting data from eeps...");
            $.ajax({
                type :  "post",
                url :   barty.constants.kBaseURL,
                data :  tDataString,
                success: weGotData
            });
        //}

        function weGotData(iData) {
            $("#status").text("parsing data from eeps...");
            theData = JSON.parse( iData );
            $("#result").text( (theData.length) ? " Got " + theData.length + " records! " : "No data. ");
            $("#status").text("loading data into CODAP...");
            tRememberedDateHour = null;

            var     reorganizedData = {};

            //  output an item for each record
            var tValuesArray = [];

            theData.forEach(function(d) {
                var tAdjustedCount = meeting.adjustCount(
                    d.startAt,
                    d.endAt,
                    d.dow - 1,           //      the index of the weekday
                    d.hour,
                    d.passengers
                );

                if (tAdjustedCount != d.passengers) {
                    console.log("Adjust count from " + d.passengers + " to " + tAdjustedCount);
                }

                var ymd = d.Bdate.split("-");
                var tDate = new Date( Number(ymd[0]), Number(ymd[1]) - 1, Number(ymd[2]), Number(d.hour));
                var tFormattedDate = $.datepicker.formatDate("mm/dd/yy", tDate);
                var tFormattedDateTime = tFormattedDate + " " + d.hour + ":00:00";

                var tValues = {
                    gameNumber : barty.manager.gameNumber,
                    request : barty.manager.requestNumber,
                    when : tFormattedDateTime,
                    day : barty.constants.daysOfWeek[ d.dow - 1 ],
                    hour : d.hour,
                    date : tDate.toDateString(),

                    count : tAdjustedCount,
                    startAt : d.startAt,
                    endAt : d.endAt,
                    startReg : d.startReg,
                    endReg : d.endReg,
                    id : d.id
                };
                tValuesArray.push( tValues );
            });

            barty.connector.outputDataItems( tValuesArray);

            //  theData.forEach( reorganizeByHour );

            //  now data are reorganized by hour

/*
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
                    var tHourValuesArray = [ tDOY, barty.constants.daysOfWeek[ tDay ], iRec.hour, iRec.Bdate ];

                    reorganizedData[tThisDateHour] = { hourValues : tHourValuesArray, dataValues : [] }; //  create new elemnt in the object
                }

                var tDataValuesArray = getDataArrayFromThisRecord( iRec );
                reorganizedData[tThisDateHour].dataValues.push(tDataValuesArray);
            };

            function storeOneHour( iHourObject ) {
                var tHourDataValues = iHourObject.hourValues;      //      get the data array that needs to be stored
                barty.connector.newHourCase(tHourDataValues, hourCaseCreated );  //  store it

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
                        barty.connector.doDataRecord( iOneDataValuesArray, iHourObject.hourCaseID);
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
*/

        }

    },
};

