/**
 * Created by tim on 5/17/16.


 ==========================================================================
 colorPlay.manager.js in data-science-games.

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

/* global colorPlay, $ */

colorPlay.manager = {

    inSession: false,

    doSession: function () {
        this.inSession = !this.inSession;

        //  create new session
        if (this.inSession) {
            colorPlay.connect.startSessionCase();
            colorPlay.manager.setNewMatchTarget();
        } else {

            //  close existing session

            colorPlay.connect.finishSessionCase();
        }
        colorPlay.ui.fixUI();
    },

    setNewMatchTarget: function () {
        colorPlay.model.matchTargetColor = {
            red: Math.round(75 * Math.random()) / 5,
            green: Math.round(75 * Math.random()) / 5,
            blue: Math.round(75 * Math.random()) / 5
        };

        $("#matchResults").html("Click <b>check match</b> when you're ready.");
        colorPlay.ui.update();
    },

    checkColorMatch: function () {
        $("#matchResults").text(colorPlay.ui.colorCompareMessage(colorPlay.model.matchTargetColor, colorPlay.model.matchTryColor));

        colorPlay.connect.doGuessRecord(colorPlay.model.dataValues());     //  output guesses
    },


    doCommand: function () {

    }
};

colorPlay.model = {
    playColor: null,
    matchTargetColor: null,
    matchTryColor: null,

    initialize: function () {
        this.playColor = {
            red: 8,
            green: 8,
            blue: 8
        };
        this.matchTargetColor = {
            red: 8,
            green: 8,
            blue: 8
        };
        this.matchTryColor = {
            red: 8,
            green: 8,
            blue: 8
        };
    },

    dataValues: function () {
        return [
            this.matchTargetColor.red,
            this.matchTargetColor.green,
            this.matchTargetColor.blue,
            this.matchTryColor.red,
            this.matchTryColor.green,
            this.matchTryColor.blue,
            null
        ];
    }
};