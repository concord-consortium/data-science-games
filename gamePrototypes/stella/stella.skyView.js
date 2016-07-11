/**
 * Created by tim on 6/25/16.


 ==========================================================================
 SkyView.js in data-science-games.

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

/* global stella, $, Snap, StarView, console */

stella.skyView = {

    paper : null,
    backgroundSkyRect : null,
    starViews : [],
    reticleX : null,
    reticleY : null,
    magnification : 1.0,
    baseStrokeWidth : 0.05,

    pointAtStar : function(iStar ) {

        if (iStar) {
            this.pointAtLocation( iStar.where.x, iStar.where.y);
            if (this.magnification === 1.0) {
                var tNewY = stella.constants.universeWidth - iStar.where.y;
                this.reticleX.attr({ visibility : "visible", y1 : tNewY, y2 : tNewY});
                this.reticleY.attr({ visibility : "visible", x1 : iStar.where.x, x2 : iStar.where.x});
            }
        } else {
            this.pointAtLocation( null, null);
            this.reticleX.attr({ visibility : "hidden"});
            this.reticleY.attr({ visibility : "hidden"});
        }

    },

    pointAtLocation : function( x, y ) {
        y = stella.constants.universeWidth - y;     //  reverse coordinates

        var tWidth = stella.constants.universeWidth / this.magnification;
        var tViewBoxString = "0 0 " + tWidth + " " + tWidth;

        if ( this.magnification > 1 ) {
            var tX = x - tWidth/2;
            var tY = y - tWidth/2;
            tViewBoxString = tX  + " " + tY + " " + tWidth + " " + tWidth;

            //  reticles

            this.reticleX.attr({ visibility : "visible", y1 : y, y2 : y,
                strokeWidth : this.baseStrokeWidth / this.magnification});
            this.reticleY.attr({ visibility : "visible", x1 : x, x2 : x,
                strokeWidth : this.baseStrokeWidth / this.magnification});
        } else {
            this.reticleX.attr({strokeWidth : this.baseStrokeWidth});
            this.reticleY.attr({strokeWidth : this.baseStrokeWidth});
        }

        //  nb: if magnification === 1, we are set to point correctly

        this.paper.attr({ viewBox : tViewBoxString });
    },

    /**
     * Called ONLY from stella.manager.changeMagnification.
     *
     * @param iMagnification
     */
    magnify : function( iMagnification  ) {
        this.magnification = iMagnification;
        this.paper.clear();
        this.makeBackground();
        this.makeAndInstallStarViews( );  // now make all the star views
        this.makeAndInstallReticles();       //  make the reticle views
    },

    down : function( e ) {

    },

    /**
     * Mouseup handler.
     * Note that "this" in this routine is the SVG object itself
     * @param e     the mouse event
     */
    up : function( e ) {
        var uupos = this.createSVGPoint();
        uupos.x = e.clientX;
        uupos.y = e.clientY;

        var ctm = e.target.getScreenCTM().inverse();

        if (ctm) {
            uupos = uupos.matrixTransform( ctm );
        }
        console.log( uupos );

        var tStar = stella.skyView.starFromViewCoordinates( uupos );
        stella.manager.pointAtStar( tStar );
    },

    move : function ( e ) {
/*
        if (!epiManager.draggingCritter) {
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
*/
    },

    starFromViewCoordinates : function( iPoint ) {
        iPoint.y = stella.constants.universeWidth - iPoint.y;   //  change y direction
        var oStar = null;
        var tDist = 1.0e30;     //  large number; Math.MAX_VALUE not working for some reason

        stella.skyView.starViews.forEach( function(sv) {
            var tStar = sv.star;
            var tCurrDSq = (tStar.where.x - iPoint.x) *  (tStar.where.x - iPoint.x) +
                (tStar.where.y - iPoint.y) *  (tStar.where.y - iPoint.y);
            if (tCurrDSq < tDist) {
                tDist = tCurrDSq;
                oStar = tStar;
            }
        });

        return oStar;

    },

    makeBackground : function( ) {
        this.backgroundSkyRect = this.paper.rect(
            0, 0,
            stella.constants.universeWidth,        //  full size. Cover the world view.
            stella.constants.universeWidth).attr( {fill : "black"});

    },

    makeAndInstallStarViews : function( ) {
        stella.model.stars.forEach( function(iStar) {
            var tStarView = new StarView( iStar, this.paper );  //  attaches it to the Paper
            this.starViews.push( tStarView );
        }.bind(this));

    },

    makeAndInstallReticles : function() {
        this.reticleX = this.paper.line(0, 0, stella.constants.universeWidth, 0).attr({
            stroke : "green",
            strokeWidth : this.baseStrokeWidth,
            strokeOpacity : 0.7,
            visibility : "hidden"
        });
        this.reticleY = this.paper.line(0, 0, 0, stella.constants.universeWidth ).attr({
            stroke : "green",
            strokeWidth : this.baseStrokeWidth,
            strokeOpacity : 0.7,
            visibility : "hidden"
        });

    },

    initialize : function( ) {
        this.paper = Snap(document.getElementById("stellaSkyView"));    //    create the underlying svg "paper"
        this.paper.clear();

        this.paper.node.addEventListener("mousedown",   stella.skyView.down,false);
        this.paper.node.addEventListener("mouseup",     stella.skyView.up,false);
        this.paper.node.addEventListener("mousemove",   stella.skyView.move,false);

        //  now set this paper's "view box"
        this.paper.attr({
            viewBox : "0 0 " + stella.constants.universeWidth + " " + stella.constants.universeWidth
        });

        this.makeBackground();
        this.makeAndInstallStarViews( );  // now make all the star views
        this.makeAndInstallReticles();       //  make the reticle views
    }

};