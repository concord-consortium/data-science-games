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


etaCas.manager = {


    newGame : function() {

        etaCas.model.newGame();
    },

    runTests : function() {
        var d = $("#debugText");

        var tT = "testing\n";
        var tSun = new Star();

        var tPlanet = new Planet( 1.0, tSun );
        tPlanet.e = 0.5;

        tT += tPlanet + "\n";

        tT += "i\tx\ty\tz\n";


        for (var i = 0; i < 100; i++) {
            var tPosition = etaCas.xyz( tPlanet, etaCas.model.now );
            tT += i + "\t" + tPosition.x + "\t" + tPosition.y + "\t" + tPosition.z + "\n";

            etaCas.elapse( 7 * etaCas.constants.msPerDay );

        };

        d.text( tT );
    }
}