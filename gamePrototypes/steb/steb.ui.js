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
        this.mealDisplay.text( Math.round(steb.model.meals) );

        var tDebugText = steb.model.stebbers.length + " stebbers, "
            + steb.worldView.stebberViews.length + " views.";

        $("#debugText").text( tDebugText );
    },

    clickStebber : function( iStebberView, iEvent )    {


        var tPoint = steb.worldView.viewBoxCoordsFrom( iEvent );

        if (steb.manager.running) {
            steb.worldView.stopEverybody();
            steb.model.removeStebber(iStebberView.stebber);
            steb.worldView.removeStebberView(iStebberView);
            steb.model.reproduce();
            steb.worldView.startEverybody();
            if (steb.model.meals % 10 == 0) steb.manager.emitPopulationData();
        }


        steb.ui.fixUI();        //  note: callback, so "this" is the snap.svg element
    },

    clickCrud : function() {
        steb.manager.onTimeout = true;
        this.timeOutPaper.attr({
            visibility : "visible"
        })
        steb.worldView.paper.append( this.timeOutPaper );

        window.setTimeout( function() {
            this.timeOutPaper.remove();
            steb.manager.onTimeout = false;
        }.bind(this), 2000);


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

    makeTimeOutPaper : function() {
        var oPaper = Snap( steb.constants.worldViewBoxSize, steb.constants.worldViewBoxSize);
        oPaper.rect( 0, 0, steb.constants.worldViewBoxSize, steb.constants.worldViewBoxSize).attr({
            fill: "yellow"
        });
        oPaper.text(100,100,"Time out!").attr({
            fontSize : 100
        });
        oPaper.text(100,222,"Eat only circles!").attr({
            fontSize : 100
        });
        oPaper.attr({
            visibility : "hidden"
        })
        return oPaper;
    },

    initialize : function() {
        this.startStopButton = document.getElementById("startStop");
        this.newGameButton = $("#newGameButton");
        this.timeDisplay = $("#timeDisplay");
        this.mealDisplay = $("#mealDisplay");
        this.stebWorldViewElement = document.getElementById("stebSnapWorld");
        this.timeOutPaper = this.makeTimeOutPaper();
    }
}