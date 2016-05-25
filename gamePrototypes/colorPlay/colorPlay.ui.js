/**
 * Created by tim on 5/17/16.


 ==========================================================================
 colorPlay.ui.js in data-science-games.

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

/* global colorPlay, $, Snap */


colorPlay.ui = {

    fixUI : function() {
        $("#sessionButton").text( colorPlay.manager.inSession ? "end session" : "new session");
        $("#matchControls").css("visibility" , colorPlay.manager.inSession ? "visible" : "hidden");
    },

    update : function() {
        var tMatchColor = Snap.rgb(
            colorPlay.model.playColor.red,
            colorPlay.model.playColor.green,
            colorPlay.model.playColor.blue
        );

        $("#redValue").text("  red = " + colorPlay.model.playColor.red);
        $("#greenValue").text("green = " + colorPlay.model.playColor.green);
        $("#blueValue").text(" blue = " + colorPlay.model.playColor.blue);
        $("#hexValue").text("hex value is " + tMatchColor);
        $("#colorPlayRect").attr({
            fill : tMatchColor
        });

        var tMatchTryColor = Snap.rgb(
            colorPlay.model.matchTryColor.red,
            colorPlay.model.matchTryColor.green,
            colorPlay.model.matchTryColor.blue
        );
        var tMatchTargetColor = Snap.rgb(
            colorPlay.model.matchTargetColor.red,
            colorPlay.model.matchTargetColor.green,
            colorPlay.model.matchTargetColor.blue
        );


        $("#redTryValue").text("  red = " + colorPlay.model.matchTryColor.red);
        $("#greenTryValue").text("green = " + colorPlay.model.matchTryColor.green);
        $("#blueTryValue").text(" blue = " + colorPlay.model.matchTryColor.blue);
        $("#colorMatchTry").attr({
            fill : tMatchTryColor
        });
        $("#colorMatchTarget").attr({
            fill : tMatchTargetColor
        });

        this.fixUI();
    },

    initialize : function() {
        $("#redPlaySlider").slider({
            range : false,
            min : 0,
            max : 255,
            values : [ 128 ],
            slide : function(e, ui) {
                colorPlay.model.playColor.red = Number( ui.values[0] );
                colorPlay.ui.update();
            },
            step : 1
        });
        $("#greenPlaySlider").slider({
            range : false,
            min : 0,
            max : 255,
            values : [ 128 ],
            slide : function(e, ui) {
                colorPlay.model.playColor.green = Number( ui.values[0] );
                colorPlay.ui.update();
            },
            step : 1
        });
        $("#bluePlaySlider").slider({
            range : false,
            min : 0,
            max : 255,
            values : [ 128 ],
            slide : function(e, ui) {
                colorPlay.model.playColor.blue = Number( ui.values[0] );
                colorPlay.ui.update();
            },
            step : 1
        });

        //  Match sliders

        $("#redMatchSlider").slider({
            range : false,
            min : 0,
            max : 255,
            values : [ 128 ],
            slide : function(e, ui) {
                colorPlay.model.matchTryColor.red = Number( ui.values[0] );
                colorPlay.ui.update();
            },
            step : 1
        });
        $("#greenMatchSlider").slider({
            range : false,
            min : 0,
            max : 255,
            values : [ 128 ],
            slide : function(e, ui) {
                colorPlay.model.matchTryColor.green = Number( ui.values[0] );
                colorPlay.ui.update();
            },
            step : 1
        });
        $("#blueMatchSlider").slider({
            range : false,
            min : 0,
            max : 255,
            values : [ 128 ],
            slide : function(e, ui) {
                colorPlay.model.matchTryColor.blue = Number( ui.values[0] );
                colorPlay.ui.update();
            },
            step : 1
        });
    },

    colorCompareMessage : function( c1, c2) {
        var o = "Target r, g, b is " + c1.red + ", " + c1.green + ", " + c1.blue +
            ". Your try: " + c2.red + ", " + c2.green + ", " + c2.blue + ".";
        return o;
    },

    foo : function() {
        alert("Click!:");
    }
}