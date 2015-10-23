/**
 * Created by tim on 10/19/15.
 */
/*
 ==========================================================================
 medWorldView.js

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


var medWorldView;

medWorldView = {

    snapWorld: null,
    model: null,

    VBLeft : 0,
    VBTop : 0,
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

    flushAndRedraw : function () {

        this.snapWorld.clear();
        /*
        while(this.mainSVG.lastChild) {
            this.mainSVG.removeChild(this.mainSVG.lastChild);
        }
        */

        var i;
        for (i = 0; i < this.model.locations.length; i++) {
            var tL = this.model.locations[i];
            this.snapWorld.append(tL.snapShape);
        };
        for (i = 0; i < this.model.critters.length; i++) {
            var tC = this.model.critters[i];
            this.snapWorld.append(tC.snapShape);
        }

    },

    initialize: function() {
        this.snapWorld = Snap(document.getElementById( "worldView" ));
        this.snapWorld.node.addEventListener("mousedown", medWorldView.down,false);
        this.snapWorld.node.addEventListener("mouseup", medWorldView.up,false);
        this.snapWorld.node.addEventListener("mousemove", medWorldView.move,false);

        this.actualHeight = this.snapWorld.attr("height");
        this.actualWidth = this.snapWorld.attr("width");

        this.updateViewBox();

    },

    updateViewBox : function() {
        //  todo: check parameters and pin
        var tString = this.VBLeft.toString() + " " + this.VBTop + " " + this.VBWidth + " " + this.VBHeight;
        this.snapWorld.attr({"viewBox" : tString});
    },

    attachShape : function(shape) {
        this.snapWorld.appendChild( shape );
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
