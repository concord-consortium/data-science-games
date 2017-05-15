/**
 * Created by tim on 10/19/15.
 */
/*
 ==========================================================================
 epiModel.js

 Model for the med DSG.

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

var epiModel;

epiModel = {

    numberOfCritters: 49,

    critters: [],
    locations: [],
    elapsed : 0,
    nMoves : 0,
    malady : null,

    /**
     * Update the entire model
     * @param dt this many seconds
     */
    update: function( dt ) {
        this.elapsed += dt;

        var i;
        for (i = 0; i < this.locations.length; i++) {
            this.locations[i].update(dt);
        }
        for (i = 0; i < this.critters.length; i++) {
            this.critters[i].update(dt);
        }

        epiModel.infect( dt );
    },

    /**
     * Adjust the model to reflect a new game
     */
    newGame: function() {

        this.initialize();

        /**
         * Create all the Locations. Use the index to determine where it is, etc.
         */
        for (var i = 0; i < epiGeography.numberOfLocations(); i++ ) {   //  todo: figure out if we have to eliminate these when the game ends!
            var tL = new Location( i );
            this.locations.push( tL );
        }

        /**
         * Create all the Critters.
         */
        for (var i = 0; i < this.numberOfCritters; i++) {       //  todo: do we have to eliminate these on game end??
            var tC = new Critter( i );      //  i becomes Critter.myIndex

            var tLoc = TEEUtils.pickRandomItemFrom(this.locations);
            var tRowCol = tLoc.rowCol;
            tC.initialize( tRowCol );
            this.critters.push( tC );    //  add critter to our local array

            tLoc.addCritter( i );      //  add critter index to the location

        }

        //  pick a malady

        epiMalady.pickMalady( );
        epiMalady.initMalady( );
    },

    /**
     * Check if the end conditions are met: enough "sick seconds" or total elapsed seconds.
     * @returns {*}
     */
    endCheck : function() {
        var tEnd = null;

        if (!epiOptions.endlessGame) {
            var tSickSeconds = this.sicknessReport().totalElapsed;

            if (tSickSeconds > epiMalady.pSickSecondsToGameEnd) tEnd = epidemic.constants.kLossState;
            if (this.elapsed > epiMalady.pTotalElapsedSecondsToGameEnd) tEnd = epidemic.constants.kWinState;
        }
        return tEnd;
    },

    /**
     * Update to mark iCritter as selected
     *
     * @param iCritter      which Critter to select
     * @param iReplace      if true, iCritter is now the only thing selected
     *                      if false, add iCritter to the set of selected Critters
     */
    selectCritter :  function(iCritter, iReplace) {
        if (iCritter) {
            if (iReplace) epiManager.clearSelection();
            iCritter.selected = true;
            iCritter.view.update();
        }
    },


    /**
     * Given a name, find the Critter
     * @param iName     the name
     * @returns {}  the Critter, null if not found
     */
    critterByName : function( iName ) {
        var out = null;
        this.critters.forEach( function(c) {
            if (c.name === iName) out = c;
        }.bind(this));
        return out;
    },

    /**
     * Manage a critter being dragged from one location to another,
     * called from epiManager -- which guarantees that iFrom is not iTo.
     * @param iCritter  the creature itself
     * @param iToRC     therowCol to
     */
    doCritterDrop : function( iCritter, iToRC) {
        iCritter.doDeparture(iToRC, "drag");
        iCritter.doArrival(iToRC, "drag");
        epiModel.nMoves += 1;
    },

    /**
     * Create any new infections
     * @param dt    in this amount of time
     */
    infect: function( dt ) {
        switch( epiMalady.pMaladyNumber ) {
            case epiMalady.kIntroMaladyAsymptomaticCarrier:
                this.infect0( dt );
                break;
            default:
                this.infect0( dt );
                break;
        }
    },

    /**
     * Does infection for disease #0. todo: move to epiMalady
     * @param dt
     */
    infect0: function (dt) {

        epiModel.locations.forEach(function (loc) {
            tInfectionHere = (epiMalady.exposureInLocation(loc) || loc.toxic);
            if (tInfectionHere) {
                loc.critterIndices.forEach(function (iCrIndex) {
                    var tCritter = epiModel.critters[iCrIndex];
                    epiMalady.possiblyInfectExposedCritter(tCritter, dt)
                })
            }
        })
    },

    /**
     * Get an object containg the information you need to see how many are sick, etc.
     * @returns {{totalElapsed: string, numberSick: number}}
     */
    sicknessReport : function() {
        var totElapsed = 0;
        var nSick = 0;

        this.critters.forEach( function(c) {
            totElapsed += c.elapsedSick;    //  add the total elapsed sickness of every critter
            if (c.health != 1) nSick++;
        } );

        return {totalElapsed : totElapsed.toFixed(2), numberSick : nSick};
    },

    /**
     * Make a fresh, new, clean model.
     * Suitable for new game or a restore from a file.
     */
    initialize : function() {
        this.elapsed = 0;
        this.nMoves = 0;
        this.locations = [];
        this.critters = [];
    },

    /**
     * Make an object we can use to restore the model. Note that Critters and Locations are covered in this.arraySaveObject()
     * @returns {{numberOfCritters: *, elapsed: *, nMoves: *, malady: *, critters: *, locations: *}}
     */
    getSaveObject: function() {
        var tSaveObject = {
            numberOfCritters : this.numberOfCritters,
            elapsed : this.elapsed,
            nMoves : this.nMoves,
            malady : this.malady,
            critters : this.arraySaveObject( this.critters ),
            locations : this.arraySaveObject( this.locations )

        };
        return tSaveObject;
    },

    coordsToLocation: function( iX, iY) {
        return this.locations[ epiGeography.coordToLocationIndex( iX, iY)];
    },

    /**
     * Restore the model from the "saveObject". Note how we handle Locations ad Critters
     * @param iObject
     */
    restoreFrom: function( iObject ) {
        this.initialize( );     //  clean up all vars, esp critters and locations, now empty

        this.numberOfCritters = iObject.numberOfCritters;
        this.elapsed = iObject.elapsed;
        this.nMoves = iObject.nMoves;
        this.malady = iObject.malady;

        //  restore all locations

        iObject.locations.forEach( function( el ) {
                var tLoc = new Location( el.myIndex );  //  put it in the right place
                tLoc.restoreFrom( el );                 //   give it the right properties
                this.locations.push( tLoc );      //   add it to the array
            }.bind( this )
        );    //  so that "this" is the model inside the anonymous function

        //  restore all critters. Assumes locations all exist.
        iObject.critters.forEach( function( el ) {
                var tCrit = new Critter( -1 );
                tCrit.restoreFrom( el );
                this.critters.push( tCrit );
            }.bind( this )
        );
    },

    /**
     * Critters and Locations are arrays. Each class has save and restore, so we simply loop.
     * This creates an array of those "save objects"
     * @param array
     * @returns {Array}
     */
    arraySaveObject : function( array ) {
        var aResult = [];

        array.forEach( function (item) {
            tSaveObject = item.getSaveObject();
            aResult.push( tSaveObject );
        });

        return aResult;
    },

    /**
     * Restore each of the objects in the array. Called from epiModel.restoreFrom()
     * @param obj
     */
    arrayRestoreFromObject : function ( obj ) {
        var aResult = [];

        obj.forEach( function ( o ) {   //  o is the storage object for a critetr or location
            var tThing = o.restoreFrom()    // todo: messed up here . How do I know which thing to restore from? Do I have to pass in the restore function?
        });
    }
};
