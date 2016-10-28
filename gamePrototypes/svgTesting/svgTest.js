/**
 * Created by tim on 10/24/16.


 ==========================================================================
 svgTest.js in gamePrototypes.

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


var svgTest = {

    paper: null,

    adornment: null,
    grads : null,

    initialize: function () {
        this.paper = new Snap("#testPaper");

        this.paper.rect(20, 20, 20, 40).attr({fill: "dodgerblue"});
        this.paper.line(0, 0, 400, 400).attr({stroke: "goldenrod", strokeWidth: 10});

        this.adornment = this.makeAdornment();

        this.paper.append( this.adornment);
        this.adornment.attr({
            x : 100,
            y : 100
        });

        this.grads = new Graduation({
            range : 250,
            majorTickSpacing : 50,
            minorTickSpacing : 10,
            firstTick : 50,
            maxTick : 250
        });

        this.paper.append( this.grads );

    },

    makeAdornment: function () {
        var tAdornment = new Snap(200, 100);    //  a paper
        tAdornment.line(0, 100, 200, 0).attr({stroke: "purple", strokeWidth: 10});

        return tAdornment;
    }
};


Graduation = function( iParams ) {
    this.graphicWidth = 100;
    this.graphicHeight = 100;
    this.paper = new Snap( this.graphicWidth, this.graphicHeight );
    //  this.theRect = this.paper.rect(0, 0, this.graphicWidth, this.graphicHeight);
    this.scaleParameters = iParams;

    this.paper.rect( 0, 0, 100, 100).attr({fill : "yellow"});
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
        this.paper.line(0, tY, tXend, tY).attr({stroke: "black", strokeWidth: 1});
        ixCurrentML += this.scaleParameters.minorTickSpacing;
    }
};
