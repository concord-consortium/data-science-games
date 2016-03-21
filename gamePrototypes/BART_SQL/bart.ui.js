/**
 * Created by tim on 3/20/16.


 ==========================================================================
 bart.ui.js in data-science-games.

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


 */


bart.ui = {
    /**
     * User has pressed the button to get data.
     * @param e     The mouse event
     */
    getDataButtonPressed : function(e) {

        bart.manager.getDataSearchCriteria();   //  make sure we have current values
        bart.manager.doBucketOfData(  );        //  actually get the data
        this.fixUI();                   //  update what we see
    },

    showPricesButtonPressed : function() {
        bart.manager.getDataSearchCriteria();   //  make sure we have current values
        bart.manager.doCaseCounts();

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

    hourControlSlides : function( event, iThis) {
        this.manager.queryData.h0 = iThis.values[0];
        this.manager.queryData.h1 = iThis.values[1];
        this.ui.dataSelectionChanged();
    },

    /**
     * User pressed the new game button, but when we're playing, that button is for aborting a game.
     * So this routine figures out whether to call the newGame() or endGame("abort") methods.
     */
    newGameButtonPressed : function() {
        if (bart.manager.playing) {
            this.endGame("abort")
        } else {
            bart.manager.newGame();

        }
        this.fixDataSelectionText();
        this.fixUI();
    },

    /**
     * Adjust the UI with regard to disabled controls and visibility. Called whenever things could change.
     */
    fixUI : function() {
        //  var timeString = TEEUtils.padIntegerToTwo(this.dataHour) + ":" + TEEUtils.padIntegerToTwo(this.dataMinute);
        //  $('#timeControl').val(timeString);

        this.fixDataSelectionText();

        $("#newGameButton").text( bart.manager.playing ? "abort game" : "new game");

        if (bart.manager.playing) {
            $("#getDataButton").prop("disabled", false);
            $(".options").hide();
        } else {
            $(".options").show();
            $("#getDataButton").prop("disabled", true);
        }


        //  here we could write a longer description of what you will get if you press get data.
    },

    fixDataSelectionText : function() {

        tQD = bart.manager.getDataSearchCriteria(); //  set search crieria from UI, then use.

        //  Whole names of selected stations
        var tArrivalStationName = $("#arrivalSelector").find('option:selected').text();
        var tDepartureStationName = $("#departureSelector").find('option:selected').text();

        //  time description text.
        var tEndHour = tQD.h1 - 1;
        var tWeekdayText = bart.constants.daysOfWeek[ tQD.weekday ];
        var tHoursText = "from " + tQD.h0 + ":00 to " + tEndHour + ":59";
        if (tQD.h0 == tQD.h1) tHoursText = " zero time interval; no data";
        var tTimeDescriptionText = " Any day, all day.";

        //  fix the weekday text
        var tWeekdayBoxLabel = tQD.useWeekday
            ? tWeekdayText + " only. Deselect for any day:"
            : "Select to search " + tWeekdayText + " only:";

        //  fix the hours text
        var tHoursBoxLabel = tQD.useHour
            ? "Using hour range. Deslect for whole day: "
            : "Searching whole day. Select to use hours: ";

        $("#useHoursItemText").text( tHoursBoxLabel );
        $("#useWeekdayItemText").text( tWeekdayBoxLabel );
        $("#timeDescription").text(
            (tQD.useWeekday ? tWeekdayText + " only, " : "Any day, ")
            + (tQD.useHour ? tHoursText + "." : "all day.")
        );

        //  assemble "data interval statement"

        var tSearchTime = (tQD.d0 == tQD.d1)
            ? tQD.d0
            : tQD.d0 + " to " + tQD.d1;
        tSearchTime += ", ";

        if (tQD.useWeekday) tSearchTime += tWeekdayText + " only, "
        tSearchTime += (tQD.useHour ? tHoursText : " all day");

        $("#dataIntervalStatement").text( tSearchTime );

        $("#betweenAnyItemText").html("between any two stations " + bart.manager.possibleCosts["betweenAny"]);
        $("#byRouteItemText").html("from <strong>" + tDepartureStationName
            + "</strong> to <strong>" + tArrivalStationName + "</strong> " + bart.manager.possibleCosts["byRoute"]);
        $("#byDepartureItemText").html("from <strong>"
            + tDepartureStationName + "</strong> to any station " + bart.manager.possibleCosts["byDeparture"]);
        $("#byArrivalItemText").html("from any station to <strong>"
            + tArrivalStationName + "</strong> " + bart.manager.possibleCosts["byArrival"]);
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
        bart.constants.daysOfWeek.forEach(
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
            url :   bart.constants.kBaseURL,
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

    }

}
