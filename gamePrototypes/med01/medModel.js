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

    numberOfCritters: 1,
    critters: [],
    locations: [],
    elapsed : 0,


    update: function( dt ) {
        this.elapsed += dt;

        var i;
        for (i = 0; i < this.critters.length; i++) {
            this.critters[i].update(dt);
        }
    },

    newGame: function() {
        var i;
        this.elapsed = 0;

        for (i = 0; i < medGeography.numberOfLocations(); i++ ) {
            var L = new Location( i );
            this.locations.push( L );   // todo: fix so it's not a coincidence that the index is the index :)
        }

        for (i = 0; i < this.numberOfCritters; i++) {
            var C = new Critter( i );
            this.critters.push( C );
        }
    },

    setNewCritterDest: function( critter ) {
        var tCritterNeeds = critter.mostUrgentNeed();

        var tClosestDistance = Number.MAX_VALUE;
        var i;
        var tBestLocation = null;

        for (i = 0; i < medGeography.numberOfLocations(); i++) {
            tTestLocation = this.locations[i];
            if (tTestLocation != critter.currentLocation && tTestLocation.locType == tCritterNeeds.what) {
                tTestDistance = critter.distanceToLoc( tTestLocation);
                if (tTestDistance < tClosestDistance) {
                    tClosestDistance = tTestDistance;
                    tBestLocation = tTestLocation;
                }
            }
        }
        var tDestLoc = tBestLocation;
        var tParking = tDestLoc.localParkingCoordinates( critter.myIndex );
        var txDest = Number(tDestLoc.snapShape.attr("x")) + tParking.x;
        var tyDest = Number(tDestLoc.snapShape.attr("y")) + tParking.y;

        critter.destLoc = tDestLoc;
        critter.destX = txDest;
        critter.destY = tyDest;
    },


};
