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
    var tColorString = steb.colorString( iStebber.color );

    this.paper.attr({
        viewBox : tVBText,
        class : "StebberView"
    });

    this.selectionCircle = this.paper.circle(0, 0, tRadius);
    this.selectionCircle.attr({
        stroke : null,
        fill : tColorString
    });

    //  set up the click handler

    this.selectionCircle.click(function( iEvent ) {
        steb.ui.clickStebber( this, iEvent )
    }.bind(this) );         //  bind so we get the StebberView and not the Snap.svg element
};

StebberView.prototype.startMoving = function() {
    var tAnimationObject = {
        x : this.stebber.whither.x - steb.constants.stebberViewSize/2,
        y : this.stebber.whither.y - steb.constants.stebberViewSize/2
    };


    var tHere = {
        x : Number(this.paper.attr("x")) + steb.constants.stebberViewSize/2,
        y : Number(this.paper.attr("y")) + steb.constants.stebberViewSize/2
    };

    var tTime = steb.model.distanceBetween( tHere, this.stebber.whither ) / steb.constants.stebberSpeed;

    this.paper.animate(
        tAnimationObject,
        tTime * 1000,
        null,       //  mina.easeinout,
        function() {
            this.stebber.animationArrival();
            this.startMoving();
        }.bind(this)
    );
};


