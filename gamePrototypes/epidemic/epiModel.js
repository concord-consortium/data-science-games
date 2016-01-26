/**
 * Created by tim on 10/19/15.
 */
/*
 ==========================================================================
 epiModel.js

 Model for the med DSG.

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

var epiModel;

epiModel = {

    numberOfCritters: 49,
    critters: [],
    locations: [],
    elapsed : 0,

    kAverageSecondsToInfection : 3,

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
        var i;
        this.elapsed = 0;
        this.locations = [];
        this.critters = [];

        /**
         * Create all the Locations. Use the index to determine where it is, etc.
         */
        for (i = 0; i < epiGeography.numberOfLocations(); i++ ) {   //  todo: figure out if we have to eliminate these when the game ends!
            var L = new Location( i );
            this.locations.push( L );   // todo: fix so it's not a coincidence that the index is the index :)
        }

        /**
         * Create all the Critters.
         */
        for (i = 0; i < this.numberOfCritters; i++) {       //  todo: do we have to eliminate these on game end??
            var tC = new Critter( i );

            var locIndex = Math.floor(Math.random() * this.locations.length);
            var tLoc = this.locations[ locIndex ];
            tC.initialize( tLoc );

            this.critters.push( tC );    //  add critter to our local array

            if (i == 0) tC.infectious = true;

            //  if (this.newDataOnEveryArrival) epiManager.emitCritterData(C, "start");
        }
    },

    /**
     * A Critter arrives at a new Location.
     * @param o { critter; c, atLocation: L}
     */
    doArrival: function( o ) {      //  epiModel.doArrival({ critter; c, atLocation: L} );
        var tCritter = o.critter;
        var tLocation = o.atLocation;
        tCritter.moving = false;
        tCritter.x = tCritter.view.snapShape.attr("x");
        tCritter.y = tCritter.view.snapShape.attr("y");
        tCritter.currentLocation = tLocation;
        tCritter.destLoc = null;
        tLocation.addCritter( tCritter );
        tCritter.activity = Location.mainActivities[ tLocation.locType ];
        if (epiOptions.dataOnArrival) epiManager.emitCritterData( tCritter, "arrival");
    },

    /**
     * A Critter departs from a location
     * @param o { critter; c, fromLocation: L}
     */
    doDeparture: function( o ) {
        var tCritter = o.critter;
        var tLocation = o.fromLocation;

        if (epiOptions.dataOnDeparture)
            epiManager.emitCritterData( tCritter, "departure"); //  must do before currentLocation changes

        tCritter.activity = "traveling";
        tCritter.moving = true;
        tCritter.currentLocation = null;    //  is this a good idea??
        if (tLocation) tLocation.removeCritter( tCritter );

    },

    /**
     * Create any new infections
     * @param dt    in this amount of time
     */
    infect: function( dt ) {
        var i;
        var tInfectionProbability = dt / this.kAverageSecondsToInfection;
        for (i = 0; i < this.locations.length; i++) {
            var tLocation = this.locations[i];
            var tInfectionInLocation = false;
            tLocation.critters.forEach(function(c) {
                if (c.infectious) tInfectionInLocation = true;
            });
            if (tInfectionInLocation) {
                tLocation.critters.forEach(function(c) {
                    if (c.health == 1 && Math.random() < tInfectionProbability) c.health = 0;
                    if (c.infectious) c.health = 1;
                });

            }
        }
    },

    coordsToLocation: function( iX, iY) {
        return this.locations[ epiGeography.coordToLocationIndex( iX, iY)];
    },

    /**
     * Apparently unused
     * TODO: find out for sure and delete if it is
     * @param inObject
     */
    setCoords: function( inObject ) {
        var tCrit = inObject.ofCritter;
    },

};
