
/**
 * Created by tim on 5/7/16.


 ==========================================================================
 stella.model.js in data-science-games.

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

/* global stella, Star, console */

stella.model = {

    stars : [],
    now : null,
    epoch : null,

    newGame : function() {
        this.stars = [];

        this.makeStars();
        this.now = new Date(2525, 0);   //  Jan 1 2525
        this.epoch = new Date(2525, 0);   //  Jan 1 2525
    },

    makeStars : function() {

        var tFrustum = {
            width : stella.constants.universeWidth,
            height : stella.constants.universeDistance
        };

        for (var i = 0; i < stella.constants.nStars; i++) {
            var tS = new Star( tFrustum );
            this.stars.push( tS );
            console.log( tS.toString() );
        };


        this.stars.sort( function(a,b) {
           return a.mApp - b.mApp;
        });

        for (var s = 0; s < this.stars.length; s++) {
            this.stars[s].id = 1000 + s;
        }
    },

    foo : null
};