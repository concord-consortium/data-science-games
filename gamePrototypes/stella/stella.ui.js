/**
 * Created by tim on 6/24/16.


 ==========================================================================
 stella.ui.js in data-science-games.

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

/* global $, stella, SpectrumView, Snap, console  */

stella.ui = {

    fixStellaUITextAndControls : function() {

        var tTimeAndScoreText = "Date " + stella.model.now.toFixed(2) + " • score = " + stella.player.stellaScore;

        this.shortStatusField.html(stella.manager.playing ? "game in progress" : "no game");

        //  correct title for new/abort game button
        this.newGameButton.html( stella.manager.playing ? "abort game" : "new game");

        //  focusStar label and make sure it's got the right spectrum
        var focusStarText = stella.strings.notPointingText;
        if (stella.manager.focusStar) {
            focusStarText = "Pointing at " + stella.manager.focusStar.infoText();
            this.pointAtStarInputField.val( stella.manager.focusStar.id );

            stella.model.skySpectrum = stella.manager.focusStar.setUpSpectrum();
        }

        this.starInfoTextField.text( focusStarText + " • " + tTimeAndScoreText );

        //  spectra labels

        if (stella.spectrumManager.skySpectrumView.spectrum) {
            this.skySpectrumLabel.text(stella.spectrumManager.skySpectrumView.toString());
        } else {
            this.skySpectrumLabel.text(stella.strings.noSkySpectrum);
        }
        if (stella.spectrumManager.labSpectrumView.spectrum) {
            this.labSpectrumLabel.text(stella.spectrumManager.labSpectrumView.toString());
        } else {
            this.labSpectrumLabel.text(stella.strings.noLabSpectrum);
        }

        //  spectra min and max text

        $("#lambdaMin").val( stella.spectrumManager.skySpectrumView.lambdaMin.toFixed(1));
        $("#lambdaMax").val( stella.spectrumManager.skySpectrumView.lambdaMax.toFixed(1));

        //  starResult text

        var tStarResultHeadText = " ";
        var tStarResultUnitsText = " ";
        var tBadgePrivilegeText = "";

        if (stella.manager.focusStar === null) {
            tStarResultHeadText = "Point at a star to record results";
        } else {
            tStarResultUnitsText = stella.starResultTypes[stella.manager.starResultType].units;

            tStarResultHeadText = "Results for " + stella.manager.focusStar.id + ": ";
            tStarResultHeadText += stella.manager.starResultType + " = ";
            tStarResultHeadText += stella.manager.starResultValue !== null ? stella.manager.starResultValue : "(enter a value)";
            tStarResultHeadText += " (" + tStarResultUnitsText + ")";
        }
        this.starResultHeadline.text( tStarResultHeadText );
        this.starResultUnits.text(tStarResultUnitsText );

        var tResultType = stella.manager.starResultType;
        var tLevel = stella.badges.badgeLevelFor( tResultType );
        if (tLevel > 0)    {   //      we have a badge!
            tBadgePrivilegeText = "You're level " + tLevel +
                " for " + tResultType + ", so you can get an automatic value!";
            this.findAutoResultButton.show();
        } else {    //  hide the button
            tBadgePrivilegeText = "You do not have a badge for " + tResultType + ", so you cannot get an automatic value.";
            this.findAutoResultButton.hide();
        }

        //  badges stuff

        this.badgePrivilegeText.html( tBadgePrivilegeText );
        this.badgesreport.html( stella.badges.toHTML());
    },


    pointingChangedByTyping : function() {
        var tText = this.pointAtStarInputField.val();
        var tStar = stella.model.starFromTextID( tText );
        stella.manager.pointAtStar( tStar );
    },


    assembleStarResultMenu: function () {
        var oMenu = '<select  id="starResultTypeMenu" onchange="stella.manager.starResultTypeChanged()">\n';

        for (var m in stella.starResultTypes) {
            if (stella.starResultTypes.hasOwnProperty(m)) {
                oMenu += '<option value="' + stella.starResultTypes[m].id + '">' + stella.starResultTypes[m].name + '</option>\n';
            }
        }

        oMenu += "</select>";
        return oMenu;
    },

    initializeUINames : function() {

        this.newGameButton = $("#newGameButton");
        this.starInfoTextField = $("#starInfo");
        this.shortStatusField = $("#shortStatus");
        this.pointAtStarInputField = $("#pointAtStar");


        //  results tab items

        $("#starResultMenu").html( this.assembleStarResultMenu() );
        this.badgePrivilegeText = $("#badgePrivilegeText");
        this.findAutoResultButton = $("#findAutoResult");
        this.starResultHeadline = $("#starResultHeadline");
        this.starResultUnits = $("#starResultUnits");

        //  badges tab

        this.badgesreport = $("#badgesHTML");

        //  spectra tab

        this.labSpectrumLabel = $("#labSpectrumLabel");
        this.skySpectrumLabel = $("#skySpectrumLabel");
        this.gainSlider = $('#labSpectrographGainSlider');
        this.labTempSlider = $('#labTempSlider');

        this.gainSlider.slider( {
                min : 1,
                max : 10,
                values : 1,
                step : 1,
                slide : function(e, ui) {
                    stella.manager.labSpectrumView.gain = Number( ui.value );
                    $('#gainDisplay').text(stella.manager.labSpectrumView.gain);
                    stella.manager.spectrumParametersChanged();
                }
            }
        );

        this.labTempSlider.slider( {
                min : 1000,
                max : 30000,
                values : [ stella.constants.solarTemperature ],
                step : 100,
                slide : function(e, ui) {
                    stella.model.labBlackbodyTemperature = Number( ui.value );
                    $('#labTempDisplay').text(stella.model.labBlackbodyTemperature);
                    stella.manager.spectrumParametersChanged();
                }
            }
        );

    }
};

