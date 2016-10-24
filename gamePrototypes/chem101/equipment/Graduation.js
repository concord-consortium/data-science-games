/**
 * Created by tim on 10/24/16.


 ==========================================================================
 Graduation.js in gamePrototypes.

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

/**
 * This class produces the image of a "graduation"
 * (for a cylinder or buret) and can supply both a Snap.svg "rect"
 * and associated coordinates.
 * @param   iParams  an object containing the info we need for the scale
 * @constructor
 */
Graduation = function( iParams ) {
    this.graphicWidth = 100;
    this.graphicHeight = 100;
    this.paper = new Snap( this.graphicWidth, this.graphicHeight );
    //  this.theRect = this.paper.rect(0, 0, this.graphicWidth, this.graphicHeight);
    this.scaleParameters = iParams;

    this.drawGraduation();

    return this.paper;
};

Graduation.prototype.mLToPixels = function( imL ) {
    var tPixelsPerML = this.graphicHeight / this.scaleParameters.maxTick;
    return imL * tPixelsPerML;
};

Graduation.prototype.drawGraduation = function( ) {
    var ixCurrentML = this.scaleParameters.firstTick;

    while ( ixCurrentML <= this.scaleParameters.range) {
        var tY = this.mLToPixels( ixCurrentML );
        var tXend = ( ixCurrentML % this.scaleParameters.majorTickSpacing === 0) ? this.graphicWidth : this.graphicWidth / 2;
        this.paper.line(0, tY, tXend, tY);
        ixCurrentML += this.scaleParameters.minorTickSpacing;
    }
};


