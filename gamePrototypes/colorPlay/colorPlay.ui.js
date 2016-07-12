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

/* global colorPlay, $, Snap, alert */


colorPlay.ui = {

    fixUI : function() {
        $("#sessionButton").text( colorPlay.manager.inSession ? "end session" : "new session");
        $("#matchControls").css("visibility" , colorPlay.manager.inSession ? "visible" : "hidden");
    },

    update : function() {
        var tMatchColor = Snap.rgb(
            colorPlay.model.playColor.red * 17,
            colorPlay.model.playColor.green * 17,
            colorPlay.model.playColor.blue * 17
        );

        $("#redValue").text("  red = " + colorPlay.model.playColor.red);
        $("#greenValue").text("green = " + colorPlay.model.playColor.green);
        $("#blueValue").text(" blue = " + colorPlay.model.playColor.blue);
        $("#hexValue").text("hex value is " + tMatchColor);

        //  actually update the color of the box! ("play")

        $("#colorPlayRect").attr({
            fill : tMatchColor
        });

        var tMatchTryColor = Snap.rgb(
            colorPlay.model.matchTryColor.red * 17,
            colorPlay.model.matchTryColor.green * 17,
            colorPlay.model.matchTryColor.blue * 17
        );
        var tMatchTargetColor = Snap.rgb(
            colorPlay.model.matchTargetColor.red * 17,
            colorPlay.model.matchTargetColor.green * 17,
            colorPlay.model.matchTargetColor.blue * 17
        );


        $("#redTryValue").text("  red = " + colorPlay.model.matchTryColor.red);
        $("#greenTryValue").text("green = " + colorPlay.model.matchTryColor.green);
        $("#blueTryValue").text(" blue = " + colorPlay.model.matchTryColor.blue);


        //  actually update the colors of the boxes! ("match")
        $("#colorMatchTry").attr({
            fill : tMatchTryColor
        });
        $("#colorMatchTarget").attr({
            fill : tMatchTargetColor
        });

        this.fixUI();
    },

    gimme: function (iColor) {
        switch (iColor) {
            case "red":
                colorPlay.model.matchTryColor.red = colorPlay.model.matchTargetColor.red;
                $("#redMatchSlider").slider('values', [colorPlay.model.matchTryColor.red]);
                break;

            case "green":
                colorPlay.model.matchTryColor.green = colorPlay.model.matchTargetColor.green;
                $("#greenMatchSlider").slider('values', [colorPlay.model.matchTryColor.green]);
                break;

            case "blue":
                colorPlay.model.matchTryColor.blue = colorPlay.model.matchTargetColor.blue;
                $("#blueMatchSlider").slider('values', [colorPlay.model.matchTryColor.blue]);
                break;
        }
        colorPlay.ui.update();
    },

    initialize : function() {
        $("#redPlaySlider").slider({
            class : "redSlider",
            range : false,
            min : 0,
            max : 15,
            values : [ 8 ],
            slide : function(e, ui) {
                colorPlay.model.playColor.red = Number( ui.values[0] );
                colorPlay.ui.update();
            },
            step : 0.2
        });
        $("#greenPlaySlider").slider({
            range : false,
            min : 0,
            max : 15,
            values : [ 8 ],
            slide : function(e, ui) {
                colorPlay.model.playColor.green = Number( ui.values[0] );
                colorPlay.ui.update();
            },
            step : 0.2
        });
        $("#bluePlaySlider").slider({
            range : false,
            min : 0,
            max : 15,
            values : [ 8 ],
            slide : function(e, ui) {
                colorPlay.model.playColor.blue = Number( ui.values[0] );
                colorPlay.ui.update();
            },
            step : 0.2
        });

        //  Match sliders

        $("#redMatchSlider").slider({
            range : false,
            animation : "slow",
            min : 0,
            max : 15,
            values : [ 8 ],
            slide : function(e, ui) {
                colorPlay.model.matchTryColor.red = Number( ui.values[0] );
                colorPlay.ui.update();
            },
            step : 0.2
        });
        $("#greenMatchSlider").slider({
            range : false,
            min : 0,
            max : 15,
            values : [ 8 ],
            slide : function(e, ui) {
                colorPlay.model.matchTryColor.green = Number( ui.values[0] );
                colorPlay.ui.update();
            },
            step : 0.2
        });
        $("#blueMatchSlider").slider({
            range : false,
            min : 0,
            max : 15,
            values : [ 8 ],
            slide : function(e, ui) {
                colorPlay.model.matchTryColor.blue = Number( ui.values[0] );
                colorPlay.ui.update();
            },
            step : 0.2
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
};