/**
 * Created by tim on 4/22/17.


 ==========================================================================
 epidemic.js in gamePrototypes.

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

var epidemic = {
    constants: {
        version: "001g",
        letters: [
            'A','B','C','D','E','F','G','H','I','J'
        ],

        kWinState : "win",
        kLossState : "loss"
    },

    colorMapObject : {},
    state : {},

    freshState : {
        gameNumber : 0,
        moves : 0,
        sickSeconds : 0,
        elapsed : 0
    },

    initialize : function() {
        epiManager.initializeComponent();

        var tColorMapObject = { };

        /*
        Set the colors for the eyes
         */
        Critter.eyeColors.forEach( function(iColor) {
            this.colorMapObject[ iColor ] = iColor;
        }.bind(this));

        var tInitSimObject = {
            name: 'Epidemic',
            title : 'Epidemic',
            version : epidemic.constants.version,
            dimensions: {width: 424, height: 600},
            preventDataContextReorg: false
        };

        codapInterface.init(tInitSimObject, null).then( function() {
            epidemic.state = codapInterface.getInteractiveState();
            if (jQuery.isEmptyObject(epidemic.state)) {
                codapInterface.updateInteractiveState( epidemic.freshState );
            }

            epidemicConnector.initializeEpidemicDataSets();
        });

    }

};

