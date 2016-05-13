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


var StebberView = function( iStebber ) {
    this.stebber = iStebber;
    this.paper = new Snap( steb.constants.stebberViewSize, steb.constants.stebberViewSize);
    var tRadius = steb.constants.stebberViewSize / 2;
    var tVBText = -tRadius + " " + (-tRadius) + " " + 2 * tRadius + " " + 2 * tRadius;

    this.paper.attr({
        viewBox : tVBText,
        class : "StebberView"
    });

    //  set up the target reticule

    this.targetReticule = this.paper.rect( -tRadius, -tRadius, 2 * tRadius, 2 * tRadius).attr({
        fill : "transparent",
        strokeWidth : 10,
        stroke : "transparent"
    });

    //  draw the stebber

    this.selectionCircle = this.paper.circle(0, 0, tRadius).attr({
        stroke : null,
    });

    steb.worldView.applyPredatorVisionToObject( this.selectionCircle, this.stebber.color, 0);   //  NB extra arg, it's the timing

    //  set up the click handler

    this.selectionCircle.click(function( iEvent ) {
        steb.ui.clickStebber( this, iEvent )
    }.bind(this) );         //  bind so we get the StebberView and not the Snap.svg element

};

StebberView.prototype.setMyColor = function() {
    steb.worldView.applyPredatorVisionToObject( this.selectionCircle, this.stebber.color);
};

StebberView.prototype.update = function() {
    this.moveTo( this.stebber.where );
};

StebberView.prototype.moveTo = function( iWhere ) {
    this.paper.attr({
        x : iWhere.x - steb.constants.stebberViewSize/2,
        y : iWhere.y - steb.constants.stebberViewSize/2
    });

}
