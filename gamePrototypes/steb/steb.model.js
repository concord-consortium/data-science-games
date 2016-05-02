/**
 * Created by tim on 3/23/16.


 ==========================================================================
 steb.model.js in data-science-games.

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


steb.model = {

    stebbers : [],
    elapsed : null,
    meals : null,
    lastStebberNumber : null,
    predatorVision : { red : 1.0, green : 0, blue : 0},

    reproduce : function()   {
        if (steb.options.delayReproduction) {
            if (this.meals % 5 == 0) {
                for (var i = 0; i < 5; i++) {
                    var tParent  = this.findParent();
                    this.addNewStebberBasedOn( tParent );
                }
            }
        } else {
            var tParent = this.findParent();
            this.addNewStebberBasedOn( tParent );
        }
    },

    findParent : function() {
        var oParent = TEEUtils.pickRandomItemFrom( this.stebbers );
        if (steb.options.eldest) {
            var ix = TEEUtils.pickRandomItemFrom([0,0,0,1,1,2,3,4]);
            oParent = this.stebbers[ ix ];
        }
        return oParent;
    },

    update : function ( idt ) {
        this.elapsed += idt;
        this.stebbers.forEach( function(iStebber) {
            iStebber.update(idt);
        })
    },


    newGame : function() {
        this.stebbers = [];
        this.elapsed = 0;
        this.meals = 0;
        this.lastStebberNumber = 0;

        for (var i = 0; i < steb.constants.initialNumberOfStebbers; i++) {
            this.addNewStebberBasedOn( null );
        }
    },

    addNewStebberBasedOn : function( iParentStebber ) {

        var tColor, tWhere = {};
        this.lastStebberNumber += 1;

        if (iParentStebber ) {
            var tMute = steb.options.reducedMutation
                ? steb.constants.stebberColorReducedMutationArray
                : steb.constants.stebberColorMutationArray;
            tColor = this.mutateColor( iParentStebber.color, tMute );
            tWhere.x = iParentStebber.where.x;
            tWhere.y = iParentStebber.where.y;
        } else {
            tColor = this.randomColor( [1, 2, 3,4,5,6,7,8,9,10,11,12, 13, 14] );
            tWhere = this.randomPlace();
        }

        var tChildStebber = new Stebber( tColor, tWhere, this.lastStebberNumber );
        tChildStebber.speed = 500.;
        steb.manager.makeStebberView( tChildStebber );  //  the view knows about the model
        this.stebbers.push( tChildStebber );            //  we keep the model Stebber in our array

    },

    removeStebber : function( iStebber ) {
        this.meals += 1;
        var tKilledColor = steb.makeColorString( iStebber.color );
        var tIndex = this.stebbers.indexOf( iStebber );
        this.stebbers.splice( tIndex, 1 );
    },

    frightenStebbersFrom : function( iPoint ) {
        this.stebbers.forEach( function(iStebber) {
            iStebber.runFrom( iPoint );
        })

    },


    //      location utilities

    randomPlace : function() {
        return {
            x : Math.round(steb.constants.worldViewBoxSize * Math.random()),
            y : Math.round(steb.constants.worldViewBoxSize * Math.random())
        }
    },

    distanceBetween : function( p1, p2 ) {
        var dx = p1.x - p2.x;
        var dy = p1.y - p2.y;
        var tDistance = Math.sqrt( dx * dx + dy * dy );

        return tDistance;
    },

    //          COLOR utilities

    randomColor : function( iColors ) {
        var oArray = [];

        for (var i = 0; i < 3; i++) {
            var tRan = TEEUtils.pickRandomItemFrom( [3,4,5,6,7,8,9,10,11,12] );
            oArray.push( tRan );
        }
        return oArray;
    },

    mutateColor : function( iColor, iMutes )    {
        var oColor = [];

        iColor.forEach( function(c) {
            c += TEEUtils.pickRandomItemFrom( iMutes );
            if (c < 0) c = 0;
            if (c > 15) c = 15;
            oColor.push( c );
        });

        var tStart = steb.makeColorString( iColor );
        var tEnd = steb.makeColorString( oColor );

        console.log("Mutate " + tStart + " to " + tEnd + " using " + iMutes);
        return oColor;
    }
}