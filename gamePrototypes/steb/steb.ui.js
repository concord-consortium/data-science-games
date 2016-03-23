/**
 * Created by tim on 3/23/16.


 ==========================================================================
 steb.ui.js in data-science-games.

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


steb.ui = {

    fixUI : function() {
        $("#shortStatus").html(steb.manager.playing ? "game in progress" : "no game");
        this.startStopButton.style.backgroundImage = (steb.manager.running) ? "url('../art/pause.png')" : "url('../art/play.png')";

        this.newGameButton.html( steb.manager.playing ? "abort game" : "new game");
        this.timeDisplay.text( Math.round(steb.model.elapsed) );
    },


    newGameButtonPressed : function() {
        if (steb.manager.playing) {
            steb.manager.endGame("abort");
        } else {
            steb.manager.newGame();
        }
        this.fixUI();
    },

    pauseButtonPressed : function() {
        if (steb.manager.playing) {
            steb.manager.running ? steb.manager.pause() : steb.manager.restart();
        }
        this.fixUI();
    },

    initialize : function() {
        this.startStopButton = document.getElementById("startStop");
        this.newGameButton = $("#newGameButton");
        this.timeDisplay = $("#timeDisplay");
    }
}