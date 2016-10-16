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

/**
 * Main sky or telescope view, the one with all the stars.
 * Importantly, maintains an array of StarViews
 *
 * @type {{paper: null, backgroundSkyRect: null, starViews: Array, reticleX: null, reticleY: null, magnification: number, baseStrokeWidth: number, pointAtStar: stella.skyView.pointAtStar, pointAtLocation: stella.skyView.pointAtLocation, magnify: stella.skyView.magnify, down: stella.skyView.down, up: stella.skyView.up, move: stella.skyView.move, starFromViewCoordinates: stella.skyView.starFromViewCoordinates, makeBackground: stella.skyView.makeBackground, makeAndInstallStarViews: stella.skyView.makeAndInstallStarViews, makeAndInstallReticles: stella.skyView.makeAndInstallReticles, initialize: stella.skyView.initialize}}
 */
stella.skyView = {

    paper : null,
    backgroundSkyRect : null,
    starViews : [],
    reticlePath : null,
    positionHeadsUp : null,
    magnification : 1.0,
    baseStrokeWidth : 0.03,

    viewBoxString : "0 0 1 1",

    telescopeWhere : { x : 0, y : 0},

    /**
     * Set up this view.
     * Called from stella.initialize()
     */
    initialize : function( ) {
        this.originalViewWidth = Number($("#stellaSkyView").attr("width"));

        this.paper = Snap(document.getElementById("stellaSkyView"));    //    create the underlying svg "paper"
        this.paper.clear();

        this.paper.node.addEventListener("click",   stella.skyView.click,false);
        this.paper.node.addEventListener("mousedown",   stella.skyView.down,false);
        this.paper.node.addEventListener("mouseup",     stella.skyView.up,false);
        this.paper.node.addEventListener("mousemove",   stella.skyView.move,false);



        this.makeBackground();
        this.makeAndInstallStarViews( );  // now make all the star views
        this.makeAndInstallReticles();       //  make the reticle views and heads-up

        //  now point, and set this paper's "view box"
        //  the middle of the pane
        var tPointAt = { x : stella.constants.universeWidth/2, y : stella.constants.universeWidth/2};
        this.pointAtLocation( tPointAt, null );

        console.log("Done with skyView.initialize()");
    },

    /**
     * Change the view to point at the given star. Called by .manager.pointAtStar()
     *
     * What you do depends on magnification.
     * At 1x, put the crosshairs (reticle) on it.
     * at more than 1x, put the crosshairs in the middle and put the catalog position on the crosshairs
     *
     * @param iStar
     */
    pointAtStar : function( iStar ) {

        if (iStar) {
            stella.model.stellaElapse(stella.constants.timeRequired.changePointing);
            var tWhereNow = iStar.positionAtTime( stella.model.now );
            //  note that iStar.where is its catalog location.
            this.pointAtLocation( iStar.where, true);    //  moves the star field if necessary. True = animate
/*
            if (this.magnification === 1.0) {
                var tNewY = stella.constants.universeWidth - iStar.where.y;
            }
*/
        }
    },

    pointAtLocation : function( iPointAt, iAnimate ) {
        this.telescopeWhere = iPointAt;

        var x = iPointAt.x;
        var y = stella.constants.universeWidth - iPointAt.y;     //  reverse y-coordinate

        var tWidth = stella.constants.universeWidth / this.magnification;
        var tStrokeWidth = this.baseStrokeWidth / this.magnification;
        this.viewBoxString = "0 0 " + tWidth + " " + tWidth;

        if ( this.magnification > 1 ) {
            var tX = x - tWidth/2;
            var tY = y - tWidth/2;
            this.viewBoxString = tX  + " " + tY + " " + tWidth + " " + tWidth;
        }

        if (iAnimate) {
            this.reticlePath.animate({
                path: this.reticlePathString(),
                strokeWidth: tStrokeWidth
            }, 1000);
            this.paper.animate({viewBox: this.viewBoxString}, 1000);
        } else {
            this.reticlePath.attr({
                path: this.reticlePathString(),
                strokeWidth: tStrokeWidth
            });
            this.paper.attr({viewBox: this.viewBoxString});
        }

        var tPosText = "x : " + this.telescopeWhere.x.toFixed(6) + " y: " + this.telescopeWhere.y.toFixed(6);
        var tHeadsUpFontSize = 0.2 / this.magnification;
        if (tHeadsUpFontSize < 0.02) tHeadsUpFontSize = 0.02;
        var tPosHeadsUpAttrs =  {
            "text" : tPosText,
            x : x - 2/this.magnification,
            y : y - 2/this.magnification,
            fontSize : tHeadsUpFontSize
        };
        this.positionHeadsUp.attr(tPosHeadsUpAttrs);

        //  console.log("pointAtLocation(): " + tPosText);
    },

    /**
     * Called ONLY from stella.manager.changeMagnification.
     * So all updating happens here, not in the ui.fix... method
     *
     * @param iMagnification
     */
    magnify : function( iMagnification  ) {
        this.magnification = iMagnification;
        this.starViews.forEach( function (iSV) {
            iSV.setSizeEtc(  );
        });
    },

    /**
     * Event handler for mousedown
     * @param e
     */
    down : function( e ) {
        //  console.log( "DOWN! *** VB : " + JSON.stringify(stella.skyView.paper.attr("viewBox").vb));
    },

    /**
     * Click handler.
     * Note that "this" in this routine is the SVG object itself
     * @param e     the mouse event
     */
    click : function( e ) {
        if (stella.skyView.magnification > 1) return;   //  only works at mag = 1!
        var uupos = this.createSVGPoint();
        uupos.x = e.clientX;
        uupos.y = e.clientY;

        var ctmInverse = e.target.getScreenCTM().inverse();

        if (ctmInverse) {
            uupos = uupos.matrixTransform( ctmInverse );
        }

        uupos.y = stella.constants.universeWidth - uupos.y;
        console.log( "click at " + uupos.x.toFixed(3) + ", " + uupos.y.toFixed(3) );

        var tStar = stella.skyView.starFromViewCoordinates( uupos );
        stella.manager.pointAtStar( tStar );
    },

    /**
     * Mouseup handler.
     * Note that "this" in this routine is the SVG object itself
     * @param e     the mouse event
     */
    up: function (e) {

        var tPointedAt = stella.skyView.starFromViewCoordinates(stella.skyView.telescopeWhere);

        if (stella.manager.focusStar !== tPointedAt) {
            stella.manager.focusOnStar(tPointedAt);
        }

    },

    /**
     * mouseMove event handler.
     * Use eventually when we do drag.
     * @param e
     */
    move: function (e) {
        if (stella.skyView.magnification === 1) return;

        var tHScale = stella.constants.universeWidth / stella.skyView.originalViewWidth / stella.skyView.magnification;    //  degrees per pixel
        var tVScale = tHScale;
        var xCurrent = stella.skyView.telescopeWhere.x;
        var yCurrent = stella.skyView.telescopeWhere.y;

        if (e.button === 0 && e.buttons === 1) {
            xCurrent -= e.movementX * tHScale;    //  now in degrees
            yCurrent += e.movementY * tVScale;

            var tViewCoords = {x : xCurrent, y: yCurrent};
            stella.skyView.pointAtLocation(tViewCoords, false);  //  use false to avoid animation

        }

    },

    /**
     * Get the closest star to the view coordinates.
     * Used to select a star based on a click. (see up(), above)
     * @param iPoint
     * @returns {*}
     */
    starFromViewCoordinates : function( iPoint ) {
        //  iPoint.y = stella.constants.universeWidth - iPoint.y;   //  change y direction
        var oStar = null;
        var tDist = Number.MAX_VALUE;     //  large number

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

    /**
     * Make the (black) background rectangle.
     */
    makeBackground : function( ) {
        this.backgroundSkyRect = this.paper.rect(
            0, 0,
            stella.constants.universeWidth,        //  full size. Cover the world view.
            stella.constants.universeWidth).attr( {fill : "black"});

    },

    /**
     * For every Star in the model, make a view and install it.
     */
    makeAndInstallStarViews : function( ) {
        stella.model.stars.forEach( function(iStar) {
            var tStarView = new StarView( iStar, this.paper );  //  attaches it to the Paper
            this.starViews.push( tStarView );
        }.bind(this));

    },

    reticlePathString : function( ) {
        oPath = "";

        var x = this.telescopeWhere.x;
        var y = stella.constants.universeWidth - this.telescopeWhere.y;
        var L = stella.constants.universeWidth / this.magnification / 10;

        oPath = "M "  + (x + L) + " " + y + " L " + x + " " + (y + L) +
                " L " + (x - L) + " " + y + " L " + x + " " + (y - L) + "Z" +
                " L " + (x + L/3) + " " + y +
            " M " + x + " " + (y + L) + " L " + x + " " + (y + L/3) +
            " M " + (x - L) + " " + (y) + " L " + (x - L/3) + " " + (y) +
            " M " + x + " " + (y - L) + " L " + x + " " + (y - L/3);

        return oPath;
    },

    makeAndInstallReticles : function() {

        this.reticlePath = this.paper.path( "M 0 0").attr({
            stroke : "green",
            strokeWidth : this.baseStrokeWidth,
            strokeOpacity : 0.7,
            fill : "transparent"
        });

        this.reticlePath.addClass( "noPointer ");   //  so we click through

        this.positionHeadsUp = this.paper.text(0, 0, "position").attr({fill : "green"}).addClass("noPointer headsUp");

    }


};