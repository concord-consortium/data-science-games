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
 * @param   iContainerView  the BEakerView (or whatever) this will be installed in
 * @constructor
 */
Graduation = function (iContainerView) {
    this.container = iContainerView;
    this.graphicWidth = this.container.myWidth;
    this.graphicHeight = this.container.myHeight;
    this.paper = new Snap(this.graphicWidth, this.graphicHeight);
    //  this.theRect = this.paper.rect(0, 0, this.graphicWidth, this.graphicHeight);
    this.scaleParameters = this.container.model.glasswareSpec.graduations;

    this.drawGraduation();

    return this.paper;
};


Graduation.prototype.drawGraduation = function () {
    var ixCurrentML = this.scaleParameters.firstTick;

    while (ixCurrentML <= this.scaleParameters.range) {
        var tY = this.container.mLToYCoordinate(ixCurrentML);
        if (ixCurrentML % this.scaleParameters.majorTickSpacing === 0) {
            tXend = this.graphicWidth;
            var tLabel = this.paper.text(2, tY - 2, ixCurrentML.toFixed(0)).attr({fontSize: 8, fontFamily: "Verdana"});
            var tLabelWidth = tLabel.node.getBBox().width;
            tLabel.attr({x: this.graphicWidth - 4 - tLabelWidth});
            tLabel.addClass("noSelect");
            //  tLabel.node.setAttribute("class", "noSelect");  //  this is that css thing
        } else {
            tXend = this.graphicWidth / 2;
        }
        var theLine = this.paper.line(0, tY, tXend, tY);
        theLine.attr({stroke: "black", strokeWidth: 0.5});

        ixCurrentML += this.scaleParameters.minorTickSpacing;
    }
};


