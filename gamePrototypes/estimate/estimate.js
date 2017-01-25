/**
 * Created by tim on 1/18/17.


 ==========================================================================
 estimate.js in gamePrototypes.

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


function startCodapConnection() {
    var config = {
        title: "Estimation",
        version: "001",
        dimensions: {width: 444, height: 300}
    };

    console.log("Starting codap conection");

    codapInterface.init(config).then(
        function () { //  interactive state is populated!
            estimate.state = codapInterface.getInteractiveState();
            console.log("codapInterface.init.then() Restored is " + estimate.state.restored);
            estimate.initialize();
        }
    ).catch(function (msg) {
        console.log('warn: ' + msg);
    });
}

var estimate = {

    initialize: function () {
        this.stripView.initialize();
        if (this.state.restored) { //  we are restoring this from a file
            if (this.state.playing) {
                this.state.lastClickPosition = this.state.currentTruth;
                this.stripView.movePointerTo(this.state.currentTruth);
                this.stripView.setPointerVisibility(true);
            }
        } else {
            this.state.restored = true;
            console.log("interactive state does not exist");
            pluginHelper.initDataSet(estimateDataSetDescription);
        }

    },

    newGame: function () {
        this.state.playing = true;
        this.state.turnNumber = 0;
        this.state.currentScore = 0;
        this.state.gameNumber += 1;
        this.newTurn();
    },

    endGame: function () {
        this.state.playing = false;
        var tMessage = "Game over! Your score is " + this.state.currentScore.toFixed(2);
        alert(tMessage);
    },

    newTurn: function () {
        this.state.turnNumber += 1;
        this.state.currentTruth = Math.random();
        this.state.lastClickPosition = this.state.currentTruth;
        this.stripView.movePointerTo(this.state.currentTruth);
        this.stripView.setPointerVisibility(true);
    },

    endTurn: function () {
        var valueFieldString = document.getElementById("valueField").value;
        estimate.state.lastInputNumber = Number(valueFieldString);

        var tDelta = this.state.lastClickPosition - this.state.lastInputNumber;

        var tCaseValues = {
            truth: this.state.currentTruth,
            estimate: this.state.lastInputNumber,
            estimator: this.state.playerName,
            turnNum: this.state.turnNumber,
            gameNum: this.state.gameNumber
        };
        pluginHelper.createItems(tCaseValues);

        this.state.currentScore += Math.abs(tDelta);
        console.log("Turn " + this.state.turnNumber + " score " + this.state.currentScore);
        if (this.state.turnNumber >= this.constants.turnsPerGame) {
            this.endGame();
        }
        this.fixUI();
        this.newTurn();
    }
};

estimate.fixUI = function () {

};

estimate.state = {
    playerName: "Eleanor",
    lastClickPosition: -1,
    lastInputNumber: -1,
    gameNumber: 0,
    turnNumber: 0,
    currentScore: 0,
    currentTruth: -1,
    playing: false,
    restored: false         //  is this restored from a saved file?
};

estimate.constants = {
    version: "001",
    stripWidth: 300,
    turnsPerGame: 10
};


estimate.stripView = {
    initialize: function () {
        this.paper = Snap(document.getElementById("estimationStrip"));    //    create the underlying svg "paper"
        this.paper.node.addEventListener("click", estimate.stripView.click, false);

        this.pointer = this.paper.circle(100, 30, 10);
        this.setPointerVisibility(false);
    },

    setPointerVisibility: function (iVisible) {
        this.pointer.attr({visibility: iVisible ? "visible" : "hidden"});
    },

    movePointerTo: function (iWhere) {
        var tX = iWhere * estimate.constants.stripWidth;
        this.pointer.attr({"cx": tX});
    },

    click: function (iEvent) {
        var tWhere = findLocalPoint(iEvent);
        estimate.state.lastClickPosition = tWhere.x / estimate.constants.stripWidth;
        estimate.endTurn();
    }

};

function findLocalPoint(iEvent) {
    var uupos = iEvent.currentTarget.createSVGPoint();
    uupos.x = iEvent.clientX;
    uupos.y = iEvent.clientY;   //  we will not use this!

    var ctmInverse = iEvent.target.getScreenCTM().inverse();

    if (ctmInverse) {
        uupos = uupos.matrixTransform(ctmInverse);
    }
    return uupos
}


var estimateDataSetDescription = {
    name: "estimates",
    title: "Estimates",
    description: "a set of estimates",
    collections: [
        {
            name: "estimates",
            parent: null,       //  this.gameCollectionName,    //  this.bucketCollectionName,
            labels: {
                singleCase: "estimate",
                pluralCase: "estimates",
                setOfCasesWithArticle: "set of estimates"
            },

            attrs: [
                {name: "truth", type: 'numeric', precision: 3, description: "true value"},
                {name: "estimate", type: 'numeric', precision: 3, description: "estimated value"},
                {name: "estimator", type: 'categorical', description: "your name"},
                {name: "turnNum", type: 'numeric', precision: 0, description: "turn number"},
                {name: "gameNum", type: 'categorical', description: "game number"}
            ]
        }

    ]

};