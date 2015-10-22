/**
 * Created by tim on 10/19/15.
 */

/*
==========================================================================
medManager.js

Main controller for the med DSG.

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


var svgNS = "http://www.w3.org/2000/svg";   //  needed to draw svg's
var medManager;

medManager = {
    nLocations: 100,
    locTypes: [ "food", "water", "dwelling"],
    previous: 0,    //  timestamp for animation
    running: Boolean( true ),

    update : function( dt) {
        medModel.update( dt );       //

        this.updateScreen();
    },

    updateScreen: function() {
        medWorldView.updateScreen();

    },

    animate: function (timestamp) {
        if (!medManager.previous)  medManager.previous = timestamp;
        var tDt = (timestamp - medManager.previous) / 1000.0;
        medManager.previous = timestamp;
        medManager.update(tDt);
        if (medManager.running) window.requestAnimationFrame(medManager.animate);
    },

    newGame:    function() {
        medModel.newGame();
        medWorldView.flushAndRedraw();
        window.requestAnimationFrame(this.animate);
    },

    initializeComponent : function() {
        medWorldView.initialize();
        medWorldView.model = medModel;
        this.newGame();
    }
};

/**
 * Required call to initialize the sim, connect it to CODAP.
 */
codapHelper.initSim({
    name: 'Med 01',
    dimensions: {width: 404, height: 580},
    collections: [  // There are two collections: a parent and a child
        {
            name: 'games',
            labels: {
                singleCase: "game",
                pluralCase: "games",
                setOfCasesWithArticle: "a tournament"
            },
            // The parent collection spec:
            attrs: [
                {name: "gameNumber", type: 'categorical'},
                {name: "result", type: 'categorical'},
                {name: "dose", type: 'numeric', precision: 0},
                {name: "sourceX", type: 'numeric', unit: 'meters', precision: 2},
                {name: "sourceY", type: 'numeric', unit: 'meters', precision: 2}
            ],
            childAttrName: "measurement"
        },
        {
            name: 'measurements',
            labels: {
                singleCase: "measurement",
                pluralCase: "measurements",
                setOfCasesWithArticle: "a game"
            },
            // The child collection specification:
            attrs: [
                {name: "x", type: 'numeric', unit: 'meters', precision: 2},
                {name: "y", type: 'numeric', unit: 'meters', precision: 2},
                {name: "count", type: 'numeric', precision: 0}
            ]
        }
    ]
});

