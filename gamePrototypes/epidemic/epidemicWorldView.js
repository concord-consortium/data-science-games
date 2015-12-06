/**
 * Created by tim on 10/19/15.
 */
/*
 ==========================================================================
 epidemicWorldView.js

 Main view for the med DSG.

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

/**
 * Singleton object that manages the main view in which the critters move around.
 */
var medWorldView;

medWorldView = {

    /**
     *  snap.svg element that contains all the locations and critters. The whole world.
     */
    snapWorld: null,
    model: null,

    /**
     * VB stands for viewBox...
     */
    VBLeft : 0,
    VBTop : 0,
    VBMaxWidth : 1000,
    VBMaxHeight : 1000,
    VBWidth : 1000,
    VBHeight : 1000,

    actualWidth : 0,
    actualHeight : 0,

    updateScreen: function() {
/*
        var i;
        for (i = 0; i < this.model.critters.length; i++) {
            var tC = this.model.critters[i];
            var tCritterImage = tC.snapShape;
            tCritterImage.attr("cx",tC.x.toString());
            tCritterImage.attr("cy",tC.y.toString());
        }
*/

    },

    /**
     * Clear the snapWorld, then use information from the model to add all of the world's
     * locations and critters (in the form of their snapShapes).
     */
    flushAndRedraw : function () {

        this.snapWorld.clear();

        var i;
        for (i = 0; i < this.model.locations.length; i++) {
            var tL = this.model.locations[i];
            this.snapWorld.append(tL.snapShape);
        };

        /**
         * This is where the Critter's image actually
         * gets attached to the parent SVG.
         */
        for (i = 0; i < this.model.critters.length; i++) {
            var tC = this.model.critters[i];
            this.snapWorld.append(tC.view.snapShape);
        }

    },

    /**
     * Initialize the view. This creates this.snapWorld.
     */
    initialize: function() {
        this.snapWorld = Snap(document.getElementById( "epiWorldView" ));
        this.snapWorld.node.addEventListener("mousedown", medWorldView.down,false);
        this.snapWorld.node.addEventListener("mouseup", medWorldView.up,false);
        this.snapWorld.node.addEventListener("mousemove", medWorldView.move,false);

        this.actualHeight = this.snapWorld.attr("height");
        this.actualWidth = this.snapWorld.attr("width");

        this.updateViewBox();

    },

    /**
     * Member properties that determine the viewBox (for zoom and pan) have already been set.
     * Here, we pin them to the world and set the viewBox itself (it's a DOM attribute)
     * so they get manifested on the screen.
     */
    updateViewBox : function() {
        //  todo: check parameters and pin
        this.VBLeft = Math.max(0, this.VBLeft);
        this.VBTop = Math.max(0, this.VBTop);
        this.VBWidth = Math.min( this.VBWidth, this.VBMaxWidth);
        this.VBHeight = Math.min( this.VBHeight, this.VBMaxHeight);

        if (this.VBLeft + this.VBWidth > this.VBMaxWidth) this.VBLeft = this.VBMaxWidth - this.VBWidth;
        if (this.VBTop + this.VBHeight > this.VBMaxHeight) this.VBTop = this.VBMaxHeight - this.VBHeight;

        var tString = this.VBLeft.toString() + " " + this.VBTop + " " + this.VBWidth + " " + this.VBHeight;
        this.snapWorld.attr({"viewBox" : tString});
    },


    //  event section. Handles drag.

    zoom : function( factor ) {
        medWorldView.VBLeft -= (factor - 1) * (medWorldView.VBWidth/2);
        medWorldView.VBTop -= (factor - 1) * ( medWorldView.VBHeight/2);
        medWorldView.VBWidth *= factor;
        medWorldView.VBHeight *= factor;
        medWorldView.updateViewBox();
    },

    down : function( e ) {

    },

    // todo: make it so the zoom centers on the mouse coordinates
    up : function( e ) {
        if (e.altKey) {
            medWorldView.zoom(e.shiftKey ? 1.5 : 2 / 3)
        }
    },

    move : function ( e ) {
        var tHScale = medWorldView.VBWidth / medWorldView.actualWidth;
        var tVScale = medWorldView.VBHeight / medWorldView.actualHeight;

        if (e.button === 0 && e.buttons === 1) {
            var tDx = e.movementX * tHScale;
            var tDy = e.movementY * tVScale;

            medWorldView.VBLeft -= tDx;
            medWorldView.VBTop  -= tDy;
            medWorldView.updateViewBox();
        }
    }
};
