
/*
 ==========================================================================
                          geigerModel.js

  Model for the Geiger DSG.

  Author:   Tim Erickson

  Copyright (c) 2015 by The Concord Consortium, Inc. All rights reserved.

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
 * Created by tim on 10/19/15.
 */

/**
 * Model for the game.
 * @type {{sourceX: number, sourceY: number, sourceStrength: number, detectorX: number, detectorY: number, dose: number, latestCount: number, setup: Function, signalStrength: Function, doMeasurement: Function}}
 */

var geigerGameModel;

geigerGameModel = {
    /**
     * (secret) position of the source of radiation
     */
    sourceX: 0,
    /**
     * Strength of the radiation
     */
    initialSourceStrength: 10000,
    /**
     * Current position of the detector
     */
    detectorX: 1, // Todo: HTML also sets initial values of the boxes to 10; should only be in one place.
    /**
     * Total dose so far
     */
    dose: 0,
    /**
     * The radiation count for the last time the detector was used
     */
    latestCount: 0,
    /**
     * The distance reading the last time the detector was used
     */
    latestDistance : 0,
    /**
    /**
     * radius of the "collector"
     */
    baseCollectorRadius: 0.5,

    /**
     * Exceed this and you lose!
     */
    maxDose: 20000,

    unitsAcross: 10.0,
    distanceFactor : 39.37,

    /**
     * Initialize model properties for a new game
     */
    newGame: function () {
        this.sourceX = (this.unitsAcross * (0.25 + 0.50 * Math.random())).toFixed(2);
        this.sourceStrength = this.initialSourceStrength;
        this.latestCount = 0;
        this.dose = 0;
    },

    /**
     * Compute the strength of the radiation at the detector. Use inverse square.
     * @returns {number}
     */
    signalStrength: function () {
        var tSignalStrength = (this.sourceStrength / this.dSquared());
        tSignalStrength = Math.round(tSignalStrength);
        return tSignalStrength;
    },

    /**
     * Perform a measurement. Updates internal positions. Updates this.latestCount, .latestDistance
     */
    doMeasurement: function(  ) {

        var tSignal = this.signalStrength();
        this.latestCount = document.forms.geigerForm.useRandom.checked ? randomPoisson(tSignal) : tSignal;
        this.latestDistance = this.distanceFactor * Math.round(Math.sqrt( this.dSquared()));
        this.dose += this.latestCount;   // TODO: Update game case with current dose.

        if (!document.forms.geigerForm.showDistance.checked) {
            this.latestDistance = "";
        }

    },

    /**
     * supply the current radius of the collector (depends on game options)
     * @returns {number}
     */
    collectorRadius : function () {
        var tRadius = this.baseCollectorRadius;
        if (document.forms.geigerForm.bigRadius.checked) tRadius *= 3;
        return tRadius;
    },

    /**
     * test whether the detector is close enough to capture the source
     * @returns {boolean}
     */
    captured: function() {
        var tRadius = this.collectorRadius();
        return (this.dSquared() < tRadius * tRadius);
    },


    /**
     * Utility: what's the square of the distance from the detector to the source?
     * @returns {number}
     */
    dSquared: function() {
        return (this.detectorX - this.sourceX ) * (this.detectorX - this.sourceX );
    }

};
