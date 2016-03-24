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

    stebbers : null,
    elapsed : null,

    reproduce : function()   {
        var tParent = TEEUtils.pickRandomItemFrom( this.stebbers );
        this.addNewStebberBasedOn( tParent );
    },

    update : function ( idt ) {
        this.elapsed += idt;
    },


    newGame : function() {
        this.stebbers = [];
        this.elapsed = 0;

        for (var i = 0; i < steb.constants.initialNumberOfStebbers; i++) {
            this.addNewStebberBasedOn( null );
        }
    },

    addNewStebberBasedOn : function( iStebber ) {

        var tColor, tWhere;

        if (iStebber ) {
            tColor = this.mutateColor( iStebber.color );
            tWhere = iStebber.where;
        } else {
            tColor = this.randomColor( );
            tWhere = this.randomPlace();
        }

        var tSteb = new Stebber( tColor, tWhere );
        steb.manager.makeStebberView( tSteb );  //  the view knows about the model
        this.stebbers.push( tSteb );            //  we keep the model Stebber in our array

    },

    removeStebber : function( iStebber ) {
        var tKilledColor = StebberView.colorString( iStebber.color );
        var tIndex = this.stebbers.indexOf( iStebber );
        this.stebbers.splice( tIndex, 1 );
    },

        //      location utilities

    randomPlace : function() {
        return {
            x : Math.round(1000 * Math.random()),
            y : Math.round(1000 * Math.random())
        }
    },

    distanceBetween : function( p1, p2 ) {
        var dx = p1.x - p2.x;
        var dy = p1.y - p2.y;
        var tDistance = Math.sqrt( dx * dx + dy * dy );

        //  console.log("From " + p1.x + ", " + p1.y + " to " + p2.x + ", " + p2.y + " is " + Math.round(tDistance));
        return tDistance;
    },

    //          COLOR utilities

    randomColor : function() {
        var oArray = [];

        for (var i = 0; i < 3; i++) {
            var tRan = TEEUtils.pickRandomItemFrom([4,5,6,7,8,9,10]);
            oArray.push( tRan );
        }
        return oArray;
    },

    mutateColor : function( iColor )    {
        var oColor = [];

        iColor.forEach( function(c) {
            c += TEEUtils.pickRandomItemFrom([-2,-1, 0, 1, 2]);
            if (c < 0) c = 0;
            if (c > 15) c = 15;
            oColor.push( c );
        });

        var tStart = StebberView.colorString( iColor );
        var tEnd = StebberView.colorString( oColor );

        console.log("Mutate " + tStart + " to " + tEnd);
        return oColor;
    }
}