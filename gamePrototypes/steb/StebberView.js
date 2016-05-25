/**
 * Created by tim on 3/23/16.


 ==========================================================================
 StebberView.js in data-science-games.

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

/* global steb, Snap */

/**
 * Class for Stebber Views
 * @param iStebber      its model object
 * @constructor
 */

//  todo: decide if we really need the paper or if we should just draw the circles on the worldView

var StebberView = function( iStebber ) {
    this.stebber = iStebber;    //  its model

    //  the SVG object on which we'll draw
    this.paper = new Snap( steb.constants.stebberViewSize, steb.constants.stebberViewSize);
    var tRadius = steb.constants.stebberViewSize / 2;   //  circle
    var tVBText = -tRadius + " " + (-tRadius) + " " + 2 * tRadius + " " + 2 * tRadius;

    this.paper.attr({
        viewBox : tVBText,
        class : "StebberView"
    });

    //  set up the target reticule. This is on the bottom

    this.targetReticule = this.paper.rect( -tRadius, -tRadius, 2 * tRadius, 2 * tRadius).attr({
        fill : "transparent",
        strokeWidth : 10,
        stroke : "transparent"
    });

    //  draw the stebber on top.

    this.selectionCircle = this.paper.circle(0, 0, tRadius).attr({
        strokeWidth : 10,
        stroke : "transparent"
    });

    //  the fill color depends on how the predator sees. Set in this method:
    steb.worldView.applyPredatorVisionToObject( this.selectionCircle, this.stebber.color, 0);   //  NB extra arg, it's the timing

    //  set up the click handler

    this.selectionCircle.click(function( iEvent ) {
        steb.ui.clickStebber( this, iEvent );
    }.bind(this) );         //  bind so we get the StebberView and not the Snap.svg element

};

/**
 *  Set the apparent color of this thing.
 *  This is different from in the constructor because we don't pass the time argument
 */
StebberView.prototype.setMyColor = function() {
    steb.worldView.applyPredatorVisionToObject( this.selectionCircle, this.stebber.color);
};

/**
 * This simply moves the view to the correct location (as set in the Stebber's update() method)
 */
StebberView.prototype.update = function() {
    this.moveTo( this.stebber.where );

    //  set the circle's stroke according to the selected property

    var tStroke = this.stebber.selected ? steb.worldView.selectedStrokeColor : "transparent";
    this.selectionCircle.attr({
       stroke : tStroke
    });
};

/**
 * Actually move this view.
 * @param iWhere    To what point?
 */
StebberView.prototype.moveTo = function( iWhere ) {
    this.paper.attr({
        x : iWhere.x - steb.constants.stebberViewSize/2,
        y : iWhere.y - steb.constants.stebberViewSize/2
    });
};
