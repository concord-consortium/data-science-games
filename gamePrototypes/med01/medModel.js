/**
 * Created by tim on 10/19/15.
 */
/*
 ==========================================================================
 medModel.js

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

var medModel;

medModel = {

    numberOfCritters: 49,
    critters: [],
    locations: [],
    elapsed : 0,

    averageSecondsToInfection : 3,
    newDataOnEveryArrival : true,
    newDataOnEveryDeparture : true,

    update: function( dt ) {
        this.elapsed += dt;

        var i;
        for (i = 0; i < this.locations.length; i++) {
            this.locations[i].update(dt);
        }
        for (i = 0; i < this.critters.length; i++) {
            this.critters[i].update(dt);
        }
        
        if (Math.random() < dt / this.averageSecondsToInfection) {   //
            medModel.infect();
        }
    },

    newGame: function() {
        var i;
        this.elapsed = 0;
        this.locations = [];
        this.critters = [];

        for (i = 0; i < medGeography.numberOfLocations(); i++ ) {
            var L = new Location( i );
            this.locations.push( L );   // todo: fix so it's not a coincidence that the index is the index :)
        }

        for (i = 0; i < this.numberOfCritters; i++) {
            var C = new Critter( i );

            var locIndex = Math.floor(Math.random() * this.locations.length);
            var tLoc = this.locations[ locIndex ];
            C.initialize( tLoc );

            this.critters.push( C );    //  add critter to our local array

            if (i == 0) C.health = -1;

            //  if (this.newDataOnEveryArrival) medManager.emitCritterData(C, "start");
        }

    },


    doArrival: function( o ) {      //  medModel.doArrival({ critter; c, atLocation: L} );
        var tCritter = o.critter;
        var tLocation = o.atLocation;
        tCritter.activity = null;
        tCritter.moving = false;
        tCritter.x = tCritter.view.snapShape.attr("x");
        tCritter.y = tCritter.view.snapShape.attr("y");
        tCritter.currentLocation = tLocation;
        tCritter.destLoc = null;
        tLocation.addCritter( tCritter );
        if (this.newDataOnEveryArrival) medManager.emitCritterData( tCritter, "arrival");
    },

    doDeparture: function( o ) {
        var tCritter = o.critter;
        var tLocation = o.fromLocation;

        if (this.newDataOnEveryDeparture)
            medManager.emitCritterData( tCritter, "departure"); //  must do before currentLocation changes

        tCritter.activity = "traveling";
        tCritter.moving = true;
        tCritter.currentLocation = null;    //  is this a good idea??
        tLocation.removeCritter( tCritter );

    },

    infect: function() {
        var i;
        for (i = 0; i < this.locations.length; i++) {
            var tLocation = this.locations[i];
            var tInfected = false;
            tLocation.critters.forEach(function(c) {
                if (c.health == -1) tInfected = true;
            });
            if (tInfected) {
                tLocation.critters.forEach(function(c) {
                    if (c.health == 1) c.health = 0;
                });
                
            }
        }
    },
    
    setCoords: function( inObject ) {
        var tCrit = inObject.ofCritter;
    },

};
