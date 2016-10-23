/**
 * Created by tim on 10/19/15.
 */
/*
 ==========================================================================
 epiWorldView.js

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
var epiWorldView;

epiWorldView = {

    /**
     *  snap.svg element that contains all the locations and critters. The whole world.
     */
    epiWorldPaper: null,
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

    },

    /**
     * Clear the epiWorldPaper, then use information from the model to add all of the world's
     * locations and critters (in the form of their snapShapes).
     *
     * Called when we start a new game.
     */
    flushAndRedraw : function () {

        this.setGridSize();
        this.epiWorldPaper.clear();

        var i;
        for (i = 0; i < this.model.locations.length; i++) {
            var tL = this.model.locations[i];
            this.epiWorldPaper.append(tL.snapShape);
        };

        /**
         * This is where the Critter's image actually
         * gets attached to the parent SVG.
         */
        for (i = 0; i < this.model.critters.length; i++) {
            var tC = this.model.critters[i];
            this.epiWorldPaper.append(tC.view.snapShape);
        }
    },


    /**
     * Initialize the view. This creates this.epiWorldPaper.
     */
    initialize: function() {
        this.epiWorldPaper = Snap(document.getElementById( "epiWorldView" ));

        //  these listeners are for zoom and pan

        this.epiWorldPaper.node.addEventListener("mousedown", epiWorldView.down,false);
        this.epiWorldPaper.node.addEventListener("mouseup", epiWorldView.up,false);
        this.epiWorldPaper.node.addEventListener("mousemove", epiWorldView.move,false);

        this.actualHeight = this.epiWorldPaper.attr("height");
        this.actualWidth = this.epiWorldPaper.attr("width");

        this.updateViewBox();

    },

    /**
     * Member properties that determine the viewBox (for zoom and pan) have already been set.
     * Here, we pin them to the world and set the viewBox itself (it's a DOM attribute)
     * so they get manifested on the screen.
     */
    updateViewBox : function() {
        //  check parameters and pin
        this.VBLeft = Math.max(0, this.VBLeft);
        this.VBTop = Math.max(0, this.VBTop);
        this.VBWidth = Math.min( this.VBWidth, this.VBMaxWidth);
        this.VBHeight = Math.min( this.VBHeight, this.VBMaxHeight);

        if (this.VBLeft + this.VBWidth > this.VBMaxWidth) this.VBLeft = this.VBMaxWidth - this.VBWidth;
        if (this.VBTop + this.VBHeight > this.VBMaxHeight) this.VBTop = this.VBMaxHeight - this.VBHeight;

        var tString = this.VBLeft.toString() + " " + this.VBTop + " " + this.VBWidth + " " + this.VBHeight;
        this.epiWorldPaper.attr({"viewBox" : tString});
    },

    /**
     * Set the size of the grid based on the values in epiGeography.
     * We need this for whne we change to larger or smaller games.
     */
    setGridSize : function() {
        this.VBHeight = this.VBMaxHeight =  epiGeography.kPixelsTall * epiGeography.pRowsInGrid;
        this.VBWidth = this.VBMaxWidth = epiGeography.kPixelsWide * epiGeography.pColumnsInGrid;
        this.updateViewBox();
    },

    //  event section. Handles drag.

    /**
     * Zoom in or out by "factor."
     * @param factor    How much zoom. < 1.00 == zoom out.
     * @param event     (may not be present)
     */
    zoom : function( factor, event ) {
        epiWorldView.VBLeft -= (factor - 1) * (epiWorldView.VBWidth/2);
        epiWorldView.VBTop -= (factor - 1) * ( epiWorldView.VBHeight/2);
        epiWorldView.VBWidth *= factor;
        epiWorldView.VBHeight *= factor;
        epiWorldView.updateViewBox();       //  also pins the view
    },

    down : function( e ) {

    },

    // todo: make it so the zoom centers on the mouse coordinates
    up : function( e ) {
        if (e.altKey) {
            epiWorldView.zoom(e.shiftKey ? 1.5 : 2 / 3, e)
        }
    },

    move : function ( e ) {
        if (!epiManager.draggingCritter) {      //      we are panning the main view
            var tHScale = epiWorldView.VBWidth / epiWorldView.actualWidth;
            var tVScale = epiWorldView.VBHeight / epiWorldView.actualHeight;

            if (e.button === 0 && e.buttons === 1) {
                var tDx = e.movementX * tHScale;
                var tDy = e.movementY * tVScale;

                epiWorldView.VBLeft -= tDx;
                epiWorldView.VBTop -= tDy;
                epiWorldView.updateViewBox();
            }
        }
    }
};
