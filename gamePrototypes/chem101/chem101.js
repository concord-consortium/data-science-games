/**
 * Created by tim on 9/11/16.


 ==========================================================================
 chem101.js in gamePrototypes.

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


var chem101 = {

    theChemLabSetupView : null,

    constants: {
        version : "001b",

        glassColor: "#445577",
        glassInterior: "#ace",
        glassThickness: 3,

        pixelsPerCentimeter : 10,

        dropsPerML : 20,        //      Tim's experience at Lick

        emptyIconURI : "../art/emptyIcon.png"
    },


    initialize : function( ) {

        Chemistry.initialize();
        chem101.manager.initialize();

    }


};

chem101.glasswareSpec = {
    beaker250 : {
        name : "250 mL beaker",
        volume : 0.250,     //  L
        diameter : 7,       //  cm
        height : 9.5,       //  cm
        graduations : {
            range: 250,
            majorTickSpacing: 50,
            minorTickSpacing: 10,
            firstTick: 50,
            maxTick: 250
        }
    },

    grad50 : {
        name : "50 mL graduated ctlinder",
        volume : 0.050,     //  L
        diameter : 2.3,       //  cm (27 mm on site. I bet that's OD, not ID.
        height : 16,       //  cm (200 mm on site. Silly.)
        graduations : {
            range: 50,
            majorTickSpacing: 10,
            minorTickSpacing: 2,
            firstTick: 10,
            maxTick: 50
        }
    },

    grad10 : {
        name : "10 mL graduated ctlinder",
        volume : 0.010,     //  L
        diameter : 1.8,       //  .
        height : 16,       //
        graduations : {
            range: 10,
            majorTickSpacing: 1,
            minorTickSpacing: 0.2,
            firstTick: 1,
            maxTick: 10
        }
    }

};