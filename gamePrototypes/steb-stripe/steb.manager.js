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

/* global steb, Snap, console, TEEUtils, codapHelper, Stebber, Crud */

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

    livingStebberTableShowing : false,
    eatenStebberTableShowing : false,


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
            // 20 frames per second should be enough
            window.setTimeout( function() {
                window.requestAnimationFrame(steb.manager.animate);
            }, 50 /* ms */);
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
        steb.options.setStebOptionsToMatchUI();        //  make sure they align with the checkboxes
        this.stebElapsed = 0;
        this.gameNumber += 1;

        steb.model.newGame();
        steb.worldView.newGame();
        steb.predator.newGame();
        steb.patternBoxView.newGame();

        this.playing = true;

        //      Make the game case. We pass in an object with name-value pairs...

        steb.connector.newGameCase({
            gameNo: this.gameNumber,
            bgColor: JSON.stringify(steb.model.trueBackgroundColor),
            crudColor: JSON.stringify(steb.model.meanCrudColor)
        });

        //  and start time!

        this.restart();
        if (steb.options.beginGamePaused) {
            this.pause();
        }
    },

    /**
     * Called at end of restore process
     */
    reinstateGame : function() {
        steb.options.setUIToMatchStebOptions();

        if( this.playing)
        {
            steb.worldView.newGame();
            steb.colorBoxView.newGame();
            this.restart();
        }
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
                            //  console.log('Stebber ' + iSteb.id + ' has case IDs ' + iSteb.caseIDs.toString());
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
        var tValues = iStebber.dataValues();

        //  add the additional attributes we use for meals

        tValues.meal = steb.model.meals;
        tValues.score = steb.score.predatorPoints;

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
        console.log("stebDoCommand: ");

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
                                manager: {
                                    playing: steb.manager.playing,
                                    gameNumber: steb.manager.gameNumber,
                                },
                                model: {
                                    stebbers: steb.model.stebbers.map(function (iStebber) {
                                        return {
                                            id: iStebber.id,
                                            where: iStebber.where,
                                            color: iStebber.color,
                                            caseIDs: iStebber.caseIDs
                                        };
                                    }),
                                    crud: steb.model.crud.map(function (iCrud) {
                                        return {
                                            where: iCrud.where,
                                            speed: iCrud.speed,
                                            trueColor: iCrud.trueColor
                                        };
                                    }),
                                    elapsed: steb.model.elapsed,
                                    meals: steb.model.meals,
                                    meanCrudColor: steb.model.meanCrudColor,
                                    trueBackgroundColor: steb.model.trueBackgroundColor
                                },
                                options: {
                                    backgroundCrud : steb.options.backgroundCrud,
                                    delayReproduction : steb.options.delayReproduction,
                                    reducedMutation : steb.options.reducedMutation,
                                    flee : steb.options.flee,
                                    crudFlee : steb.options.crudFlee,
                                    crudScurry : steb.options.crudScurry,
                                    eldest : steb.options.eldest,
                                    automatedPredator : steb.options.automatedPredator,
                                    fixedInitialStebbers : steb.options.fixedInitialStebbers,
                                    fixedInitialBG : steb.options.fixedInitialBG,

                                    useVisionParameters : steb.options.useVisionParameters,
                                    predatorVisionMethod : steb.options.predatorVisionMethod,

                                    automatedPredatorChoiceVisible : steb.options.automatedPredatorChoiceVisible,
                                    colorVisionChoiceVisible : steb.options.colorVisionChoiceVisible,

                                    currentPreset : steb.options.currentPreset
                                },
                                predator: {
                                    where: steb.predator.where,
                                    state: steb.predator.state,
                                    memory: steb.predator.memory
                                },
                                score: {
                                    predatorPoints: steb.score.predatorPoints
                                },
                                connect: {
                                    gameCaseIDInLiving: steb.connector.gameCaseIDInLiving,
                                    gameCaseIDInEaten: steb.connector.gameCaseIDInEaten,
                                    bucketCaseID: steb.connector.bucketCaseID,
                                    bucketNumber: steb.connector.bucketNumber
                                }
                            }
                        };
                        codapHelper.sendSaveObject(
                            tSaveObject,
                            iCallback
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

    },

  /**
   * This function is passed to
   * @param iSavedState
   */
  stebRestoreState: function( iValues) {
      if( iValues.savedState) {
          var tManager = iValues.savedState.manager,
              tModel = iValues.savedState.model,
              tOptions = iValues.savedState.options,
              tPredator = iValues.savedState.predator,
              tScore = iValues.savedState.score,
              tConnect = iValues.savedState.connect;
          steb.manager.playing = tManager.playing;
          steb.manager.gameNumber = tManager.gameNumber;

          steb.model.elapsed = tModel.elapsed;
          steb.model.meals = tModel.meals;
          steb.model.meanCrudColor = tModel.meanCrudColor;
          steb.model.trueBackgroundColor = tModel.trueBackgroundColor;
          steb.model.stebbers = tModel.stebbers.map(function (iStebState) {
              var tStebber = new Stebber(iStebState.color, iStebState.where, iStebState.id);
              tStebber.caseIDs = iStebState.caseIDs;
              return tStebber;
          });
          steb.model.crud = tModel.crud.map(function (iCrudState) {
              var tCrud = new Crud();
              tCrud.where = iCrudState.where;
              tCrud.speed = iCrudState.speed;
              tCrud.trueColor = iCrudState.trueColor;
              return tCrud;
          });

          steb.options.backgroundCrud = tOptions.backgroundCrud;
          steb.options.delayReproduction = tOptions.delayReproduction;
          steb.options.reducedMutation = tOptions.reducedMutation;
          steb.options.flee = tOptions.flee;
          steb.options.crudFlee = tOptions.crudFlee;
          steb.options.crudScurry = tOptions.crudScurry;
          steb.options.eldest = tOptions.eldest;
          steb.options.automatedPredator = tOptions.automatedPredator;
          steb.options.fixedInitialStebbers = tOptions.fixedInitialStebbers;
          steb.options.fixedInitialBG = tOptions.fixedInitialBG;
          steb.options.useVisionParameters = tOptions.useVisionParameters;
          steb.options.predatorVisionMethod = tOptions.predatorVisionMethod;
          steb.options.automatedPredatorChoiceVisible = tOptions.automatedPredatorChoiceVisible;
          steb.options.colorVisionChoiceVisible = tOptions.colorVisionChoiceVisible;
          steb.options.currentPreset = tOptions.currentPreset;

          steb.predator.where = tPredator.where;
          steb.predator.state = tPredator.state;
          steb.predator.memory = tPredator.memory;

          steb.score.predatorPoints = tScore.predatorPoints;

          steb.connector.gameCaseIDInLiving = tConnect.gameCaseIDInLiving;
          steb.connector.gameCaseIDInEaten = tConnect.gameCaseIDInEaten;
          steb.connector.bucketCaseID = tConnect.bucketCaseID;
          steb.connector.bucketNumber = tConnect.bucketNumber;

          // Get things started where they left off
          steb.manager.reinstateGame();
      }

      codapHelper.initDataSet(steb.connector.getInitStebberMealsDataSetObject());

      codapHelper.initDataSet(steb.connector.getInitLivingStebberDataSetObject());   //  second one is the default??
    }

};