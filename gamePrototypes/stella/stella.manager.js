/**
 * Created by tim on 5/7/16.


 ==========================================================================
 etaCas.manager.js in data-science-games.

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

/* global $, stella, Planet, Star, console */

stella.manager = {

    playing : false,
    gameNumber : 0,

    newGame : function() {

        this.gameNumber += 1;
        stella.model.newGame();     //  make all the stars etc
        this.playing = true;

        stella.connector.newGameCase({
            gameNo: this.gameNumber,
            result : "in progress"
        });


        this.runTests();
    },

    endGame : function( iReason ) {
        this.playing = false;

        stella.connector.finishGameCase( iReason );
    },

    runTests : function() {
        var tT = "testing\n";
        var d = $("#debugText");

/*
        var tSun = new Star();

        var tPlanet = new Planet( 1.0, tSun );
        tPlanet.e = 0.5;

        tT += tPlanet + "\n";

        tT += "i\tx\ty\tz\n";


        for (var i = 0; i < 100; i++) {
            var tPosition = stella.xyz( tPlanet, stella.model.now );
            tT += i + "\t" + tPosition.x + "\t" + tPosition.y + "\t" + tPosition.z + "\n";

            stella.elapse( 7 * stella.constants.msPerDay );

        }
*/

        tT = "Stars\nmass, temp, M, mapp, ageMY, x, y, z\n";

        stella.model.stars.forEach( function(iStar ) {
            tT += iStar.toString() + "\n";
        });

        d.text( tT );       //  sends that data to debug

    },

    emitStarsData : function() {

        stella.model.stars.forEach( function( iStar ) {
            var tValues = iStar.dataValues();
            tValues.date = 1221;
            stella.connector.doStarRecord( tValues );   //  emit the Stebber part
        });

    },

    /**
     * For saving. TBD.
     */
    stellaDoCommand : function() {

    }
};