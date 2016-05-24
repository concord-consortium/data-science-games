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


    /**
     * The animation loop. Calls .update()
     * @param timestamp
     */
    animate: function (timestamp) {
        if (!steb.manager.previous)  steb.manager.previous = timestamp;
        var tDt = (timestamp - steb.manager.previous) / 1000.0;
        steb.manager.previous = timestamp;
        steb.manager.update(tDt);
        if (steb.manager.running) window.requestAnimationFrame(steb.manager.animate);
    },

    /**
     * Update everything; called in the animation loop.
     * @param idt
     */
    update : function ( idt ) {
        steb.model.update( idt );
        steb.worldView.update();
        if (steb.options.automatedPredator) steb.predator.update( idt );
        steb.ui.fixUI();
    },

    /**
     * Use has pressed the pause button.
     */
    pause : function() {
        this.running = false;
    },

    /**
     * Use has pressed the 'play' button
     */
    restart : function() {
        this.running = true;
        this.previous = null;       //  so we don't make a "dt" that goes all the way back
        window.requestAnimationFrame(this.animate); //  START UP TIME
    },

    /**
     * User has requested a new game.
     */
    newGame : function() {
        steb.options.optionChange();        //  make sure they align with the checkboxes
        this.time = 0;

        steb.model.newGame();
        steb.worldView.newGame();
        steb.predator.newGame();

        this.playing = true;
        steb.connector.newGameCase(
            JSON.stringify(steb.model.trueBackgroundColor),
            JSON.stringify(steb.model.meanCrudColor)
        );
        this.restart();
    },

    /**
     * For some reason, the game has ended
     * @param iReason       the reason (e.g., "won," "aborted")
     */
    endGame : function( iReason ) {

        switch( iReason ) {
            case "abort" :
                var uri = "art/StebAbort.png";
                break;

            case "win" :
                var uri = "art/StebWin.png";
                break;

            case "loss":
                var uri = "art/StebLoss.png";
                break;

            default:

        }
        if ( uri ) steb.worldView.paper.image( uri, 200, 200, 600, 600 );

        this.playing = false;
        this.running = false;
        this.emitPopulationData();      //  send data on the remianing Stebbers to CODAP

        steb.connector.finishGameCase(  //  and finish the game attributes
            JSON.stringify(steb.model.trueBackgroundColor),
            JSON.stringify(steb.model.meanCrudColor),
            iReason
        );
    },

    /**
     * User or the sutomated predator has clicked on a Stebber View, and it's OK to eat it.
     * Then reproduce, account for the score, emit data, and scare things away from the site
     * @param iStebberView
     */
    eatStebberUsingView : function( iStebberView ) {
        if (steb.manager.running) {
            steb.model.removeStebber(iStebberView.stebber);     //  remove the model Stebber
            steb.worldView.removeStebberView(iStebberView);     //  remove its view
            steb.model.reproduce();     //      reproduce (from the remaining stebbers)
            steb.score.meal();      //  before emitting data
            if (steb.model.meals % 10 == 0) steb.manager.emitPopulationData();  //  every 10 meals.
            steb.model.frightenStebbersFrom( iStebberView.stebber.where );
        }
    },

    /**
     * Create a "bucket" for a set of data, then fill it with data on each of the Stebbers.
     * We do this by default every 10 "meals."
     */
    emitPopulationData : function() {
        var tScore = steb.options.automatedPredator ? steb.score.predatorEnergy : steb.score.evolutionPoints;

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
                steb.connector.bucketCaseID = iResult.caseID;   //  set bucketCaseID on callback

                //  now process each "leaf"

                steb.model.stebbers.forEach( function( iSteb ) {
                    steb.connector.doStebberRecord( iSteb.dataValues() );   //  emit the Stebber part
                });
            } else {
                console.log("Failed to create bucket case.");
            }
        }

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
        return TEEUtils.pickRandomItemFrom( steb.worldView.stebberViews )
    },

    /**
     * Make or remove the "target reticule" visible on a stebber view,
     * indicating that it is targeted by the automated predator
     * @param iStebberView  the view to be targeted
     * @param iSet  true if we want it to be visible; false to hide it
     */
    activateTargetReticuleOn : function( iStebberView, iSet ) {
        iStebberView.targetReticule.attr({
            stroke : iSet ? "Red" : "transparent"
        })
    },

    /**
     * For saving. TBD.
     */
    stebDoCommand : function() {

    }
}