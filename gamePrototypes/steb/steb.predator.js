/**
 * Created by tim on 5/10/16.


 ==========================================================================
 Predator.js in data-science-games.

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


steb.predator = {
    where : null,
    state : "waiting",      //  looking, stalking, eating

    targetView : null,
    waitTime : null,
    memory : [],

    newGame : function() {
        this.waitTime = steb.constants.predatorWaitTime;
        this.targetView = null;
    },

    update: function (dt) {
        this.waitTime -= dt;
        if (this.waitTime <= 0) {
            switch (this.state) {
                case "waiting":
                    this.state = "looking";
                    this.waitTime = steb.constants.predatorLookTime;
                    break;

                case "looking":
                    this.findTarget();
                    var tMealRating = this.evaluateTarget(this.targetView.stebber);

                    if (tMealRating < (1 / steb.model.predatorVisionDenominator))    {//  the critter was invisible
                        console.log("(pred) Can't see " + tMealRating + ". Invisible.")
                        this.releaseTarget();
                        this.waitTime = steb.constants.predatorLookTime;
                    } else {        //  it's visible. Are we interested?
                        if( this.interestedInMeal(Number(tMealRating.toFixed(2))) ) {
                            steb.manager.activateTargetReticuleOn(this.targetView, true);
                            this.state = "stalking";
                            this.waitTime = steb.constants.predatorStalkTime;
                        } else {    //  pass on this meal
                            this.releaseTarget();
                            this.waitTime = steb.constants.predatorLookTime;
                        }
                    }
                    break;

                case "stalking":    //  done stalking, now we eat!
                    steb.manager.eatStebberUsingView(this.targetView);
                    steb.manager.activateTargetReticuleOn( this.targetView, false );
                    this.state = "waiting";
                    this.waitTime = steb.constants.predatorWaitTime;

                    this.releaseTarget();
                    break;

            }       //      end switch on state
        }
    },

    interestedInMeal : function( iRate ) {
        var tMean = 0;
        var oInterested = true;

        if (this.memory.length == 0) {  //  first one, and we're interested.
            this.memory.push( iRate );
        } else {
            var tSum = this.memory.reduce(function(a,b) {return a + b});
            tMean = tSum /  this.memory.length;
            this.memory.push( iRate );
            if (this.memory.length > 6) this.memory.shift();    //  push old ones out
            if (iRate < (tMean - 0.5)) oInterested = false;
        }

        var tMessage = "(pred) Look at " + iRate + " v " + tMean.toFixed(2) + " from [" + this.memory.toString() + "]";
        tMessage += oInterested ? " Yum!" : "I'll wait."
        console.log( tMessage );
        return oInterested;
    },

    findTarget : function() {
        this.targetView = steb.manager.findRandomStebberView( );
    },

    releaseTarget : function() {
        this.targetView = null;
    },

    evaluateTarget : function( iTarget ) {

        var tDBG = iTarget.colorDistanceToBackground;
        var tDCrud = iTarget.colorDistanceToCrud;

        var oResult = tDBG;
        if (typeof tDCrud !== 'undefined') {
            if (tDCrud < oResult) oResult = tDCrud;
        }

        return oResult;
    }

}