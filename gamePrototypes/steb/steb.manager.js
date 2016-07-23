/**
 * Created by tim on 3/23/16.


 ==========================================================================
 steb.manager.js in data-science-games.

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

/* global steb, Snap, console, TEEUtils */

/**
 * This is the main manager (singleton) controller for Stebbins
 *
 * @type {{
 * running: boolean, playing: boolean,
 * previous: null, onTimeout: boolean,
 * makeStebberView: steb.manager.makeStebberView, animate: steb.manager.animate,
 * update: steb.manager.update, pause: steb.manager.pause, restart: steb.manager.restart,
 * newGame: steb.manager.newGame, endGame: steb.manager.endGame,
 * emitPopulationData: steb.manager.emitPopulationData, stebDoCommand: steb.manager.stebDoCommand
 * }}
 */
steb.manager = {
    //  various flags
    running : false,    //  as opposed to paused
    playing : false,    //  as opposed to bewteen games
    previous : null,    //  the "previous" time for computing dt for animation
    onTimeout : false,  //  are we "on timeout" for clicking Crud?
    gameNumber : 0,     //  the game number
    stebElapsed : 0.0,      //  elapsed time


    /**
     * The animation loop. Calls .update()
     * @param timestamp
     */
    animate: function (timestamp) {
        if (!steb.manager.previous) { steb.manager.previous = timestamp; }
        var tDt = (timestamp - steb.manager.previous) / 1000.0;
        steb.manager.previous = timestamp;
        steb.manager.update(tDt);
        if (steb.manager.running) {
            window.requestAnimationFrame(steb.manager.animate);
        }
    },

    /**
     * Update everything; called in the animation loop.
     * @param idt
     */
    update : function ( idt ) {
        this.stebElapsed += idt;
        steb.model.update( idt );
        steb.worldView.update();
        if (steb.options.automatedPredator) { steb.predator.update( idt ); }
        steb.ui.fixUI();
    },

    /**
     * Use has pressed the pause button.
     */
    pause : function() {
        this.running = false;
    },

    /**
     * User has pressed the 'play' button
     */
    restart : function() {
        this.running = true;
        this.previous = null;       //  so we don't make a "dt" that goes all the way back
        window.requestAnimationFrame(this.animate); //  START UP TIME
    },

    processSelectionFromCODAP: function ( ) {
        steb.connector.getSelectedStebberIDs( gotSelectionResult );

        function gotSelectionResult( iResult ) {

            if (iResult.success) {
                var tValues = iResult.values;
                var IDs = [];
                tValues.forEach( function(tV) { IDs.push( tV.caseID);});

                steb.worldView.stebberViews.forEach( function(sv) {
                    var s = sv.stebber;
                    s.selected = TEEUtils.anyInAny(s.caseIDs, IDs); //  are ANY of the caseIDs in the list of IDs??
                    sv.update();
                });

            } else {
                console.log('StebConnect: could not get the selection list');
            }
        }

    },

    /**
     * User has requested a new game.
     */
    newGame : function() {
        steb.options.setOptionsToMatchUI();        //  make sure they align with the checkboxes
        this.stebElapsed = 0;
        this.gameNumber += 1;

        steb.model.newGame();
        steb.worldView.newGame();
        steb.predator.newGame();
        steb.colorBoxView.newGame();

        this.playing = true;

        //      Make the game case. We pass in an object with name-value pairs...

        steb.connector.newGameCase({
            gameNo: this.gameNumber,
            bgColor: JSON.stringify(steb.model.trueBackgroundColor),
            crudColor: JSON.stringify(steb.model.meanCrudColor)
        });

        //  and start time!

        this.restart();
    },

    /**
     * For some reason, the game has ended
     * @param iReason       the reason (e.g., "won," "aborted")
     */
    endGame: function (iReason) {

        var uri;

        switch (iReason) {
            case "abort" :
                uri = "art/StebAbort.png";
                break;

            case "win" :
                uri = "art/StebWin.png";
                break;

            case "loss":
                uri = "art/StebLoss.png";
                break;

            default:

        }
        if (uri) {
            steb.worldView.paper.image(uri, 200, 200, 600, 600);
        }

        this.playing = false;
        this.running = false;
        this.emitPopulationData();      //  send data on the remaining Stebbers to CODAP
        //  todo: consider emitting meal data. But if you do, you have to condition on iStebber. also, maybe increase "meals" by 1 or 0.5.

        steb.connector.finishGameCase({ //  and finish the game attributes
                bgColor: JSON.stringify(steb.model.trueBackgroundColor),
                crudColor: JSON.stringify(steb.model.meanCrudColor),
                result: iReason
            }
        );
    },

    selectStebberByID : function(id) {
        steb.model.stebbers.forEach( function(s) {
            s.selected = (s.id === id) ;
        });
    },

    /**
     * User has clicked on a Stebber View, and it's OK to eat it.
     * @param iStebberView
     */
    clickOnStebberView : function(iStebberView, iEvent ) {
        steb.model.selectStebber( iStebberView.stebber, true );
        //  iStebberView.update();
        steb.worldView.update();        //  todo: a perfect place to use notifications. If model.selectStebber sets all the selecteds to false, they should each notify the view to refresh.


        var tEat = steb.manager.running && !steb.options.automatedPredator;
        if (tEat) {
            this.eatStebber( iStebberView );
        } else {
            steb.connector.selectStebberInCODAP( iStebberView.stebber );
        }
    },

    autoPredatorCatchesStebberView : function(iStebberView ) {
        this.eatStebber( iStebberView );
    },

    /**
     * This stebber view will be eaten.
     * Then reproduce, account for the score, emit data, and scare things away from the site
     * @param iStebberView
     */
    eatStebber : function( iStebberView )   {
        steb.manager.emitMealData( iStebberView.stebber );
        steb.model.removeStebber(iStebberView.stebber);     //  remove the model Stebber
        steb.worldView.removeStebberView(iStebberView);     //  remove its view
        steb.model.reproduce();     //      reproduce (from the remaining stebbers)
        steb.score.meal();      //  upddate score before emitting data
        if (steb.model.meals % 10 === 0) {
            steb.manager.emitPopulationData();
        }  //  every 10 meals.
        steb.model.frightenStebbersFrom( iStebberView.stebber.where );
    },

    /**
     * Create a "bucket" for a set of data, then fill it with data on each of the Stebbers.
     * We do this by default every 10 "meals."
     */
    emitPopulationData : function() {
        var tScore = steb.options.automatedPredator ? steb.score.predatorPoints : steb.score.evolutionPoints;

        var tBucketValues = [
            steb.model.meals,               //  categorical number of meals
            tScore      //  current score (evolution points or predator energy, depending on settings)
        ];
        steb.connector.newBucketCase( tBucketValues, bucketCreated );   //  ask CODAP to make it

        /**
         * callback for creating a new bucket case
         * @param iResult   passed back by CODAP
         */
        function bucketCreated( iResult ) {
            if (iResult.success) {
                steb.connector.bucketCaseID = iResult.values[0].id;   //  set bucketCaseID on callback

                //  now process each "leaf"

                steb.model.stebbers.forEach( function( iSteb ) {
                    steb.connector.doStebberRecord( iSteb.dataValues(), stebberRecordCreated );   //  emit the Stebber part

                    /**
                     * Callback for creating a  new Stebber record.
                     * @param jResult   passed back by CODAP
                     */
                    function stebberRecordCreated( jResult ) {
                        if (jResult.success) {
                            iSteb.caseIDs.push( jResult.values[0].id );
                            console.log('Stebber ' + iSteb.id + ' has case IDs ' + iSteb.caseIDs.toString());
                        } else {
                            console.log("Failed to create stebber case.");
                        }
                    }
                });
            } else {
                console.log("Failed to create bucket case.");
            }


        }


    },

    emitMealData : function( iStebber ) {
        var tValues = {
            meal : steb.model.meals,
            score : steb.score.predatorPoints,
            red : iStebber.color[0],
            green : iStebber.color[1],
            blue : iStebber.color[2],
            id : iStebber.id
        };

        steb.connector.doMealRecord( tValues );
    },

    /**
     * Called by model.reproduce(). Given the model, make the appropriate view.
     * @param iChildStebber     the model Stebber
     */
    addViewForChildStebber : function( iChildStebber ) {
        steb.worldView.installStebberViewFor( iChildStebber );
    },

    /**
     * Find a Stebber View whose model will act as a parent
     * @returns {*}
     */
    findRandomStebberView : function() {
        return TEEUtils.pickRandomItemFrom( steb.worldView.stebberViews );
    },

    /**
     * Make or remove the "target reticule" visible on a stebber view,
     * indicating that it is targeted by the automated predator
     * @param iStebberView  the view to be targeted
     * @param iSet  true if we want it to be visible; false to hide it
     */
    activateTargetReticuleOn : function( iStebberView, iSet ) {
        iStebberView.targetReticule.attr({
            stroke : iSet ? "red" : "transparent"
        });
    },

    /**
     * For saving. TBD.
     */
    stebDoCommand: function (iCommand, iCallback) {
        console.log("stebDoCommand: ")

        var tCommandObject = "";

        switch (iCommand.action) {
            case "notify":
                var tValues = iCommand.values;
                if (!Array.isArray(tValues)) {
                    tValues = [tValues];
                }
                var tFirstValue = tValues[0];

                if (tFirstValue.operation) {
                    switch (tFirstValue.operation) {

                        case "selectCases":
                            console.log("Selection change in CODAP");
                            console.log(iCommand);
                            steb.manager.processSelectionFromCODAP();
                            break;

                        default:
                            break;
                    }
                }
                break;

            case "get":
                console.log("stebDoCommand: action : get.");
                switch (iCommand.resource) {
                    case "interactiveState":
                        console.log("stebDoCommand save document ");
                        var tSaveObject = {
                            success: true,
                            values: {
                                foo : 3,
                                bar : "baz"
                            }
                        };
                        codapHelper.sendSaveObject(
                            tSaveObject,
                            function () {
                                console.log("Save complete?");
                            }
                        );
                        break;
                    default:
                        console.log("stebDoCommand unknown get command resource: " + iCommand.resource );
                        break;
                }
                break;

            default:
                console.log("stebDoCommand: no action.");
        }

    }
};