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

        if (steb.model) {
            this.timeDisplay.text(Math.round(steb.model.elapsed));
            this.mealDisplay.text(Math.round(steb.model.meals));

            var tDebugText = steb.model.stebbers.length + " stebbers, "
                + steb.worldView.stebberViews.length + " views, "
                + steb.worldView.crudViews.length + " crud.";

            tDebugText = steb.model.stebberColorReport();

            $("#debugText").html(tDebugText);
            $("#evolutionPoints").text(steb.score.evolutionPoints);
            $("#predatorEnergy").text(steb.score.predatorEnergy);
        }
    },

    clickStebber : function( iStebberView, iEvent )    {

        if(!steb.options.automatedPredator) {
            var tPoint = steb.worldView.viewBoxCoordsFrom(iEvent);
            steb.manager.eatStebberUsingView(iStebberView);
            steb.ui.fixUI();
        }
    },

    clickCrud : function() {
        if(!steb.options.automatedPredator) {

            steb.manager.onTimeout = true;
            this.timeOutPaper.attr({
                visibility: "visible"
            });

            steb.score.crud();

            steb.worldView.paper.append(this.timeOutPaper);

            window.setTimeout(function () {
                this.timeOutPaper.remove();
                steb.manager.onTimeout = false;
            }.bind(this), 2000);

        }
    },

    clickInWorld : function() {
        if(!steb.options.automatedPredator) {
            if (steb.manager.running) {
                steb.score.clickInWorld();
            }
        }
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



        $("#redCoefficient").slider({
            range : false,
            min : -10,
            max : 10,
            values : [ steb.model.predatorVisionBWCoefficientVector[0] ],
            slide : function(e, ui) {
                steb.model.predatorVisionBWCoefficientVector[0] = Number( ui.values[0] );
                steb.options.predatorVisionChange();
            },
            step : 1
        });
        $("#greenCoefficient").slider({
            range : false,
            min : -10,
            max : 10,
            values : [ steb.model.predatorVisionBWCoefficientVector[1] ],
            slide : function(e, ui) {
                steb.model.predatorVisionBWCoefficientVector[1] = Number( ui.values[0] );
                steb.options.predatorVisionChange();
            },
            step : 1
        });
        $("#blueCoefficient").slider({
            range : false,
            min : -10,
            max : 10,
            values : [ steb.model.predatorVisionBWCoefficientVector[2] ],
            slide : function(e, ui) {
                steb.model.predatorVisionBWCoefficientVector[2] = Number( ui.values[0] );
                steb.options.predatorVisionChange();
            },
            step : 1
        });

        steb.options.setPredatorVisionParameters();


    }
}