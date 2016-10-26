/**
 * Created by tim on 10/5/16.


 ==========================================================================
 PourControl.js in gamePrototypes.

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


PourControl = function (iDOMID, iCallback) {
    this.paper = Snap(document.getElementById(iDOMID)).attr({viewBox: "0 0 120 24"});
    this.callback = iCallback;

    this.w = this.paper.attr("width");

    this.minRate = 0;
    this.maxRate = 1;

    this.pourSpeed = 0;

    this.previous = null;
    this.pouring = false;

    this.paper.text(16, 13, "POUR control").addClass("noPointer noSelect").attr({
        fontFamily : "Verdana"
    });
    this.paper.text(97, 20, "fast").addClass("noPointer noSelect");
    this.paper.text(2, 20, "slow").addClass("noPointer noSelect");

    this.paper.mousedown(this.doMouseDown.bind(this));
    this.paper.mouseup(this.doMouseUp.bind(this));
    this.paper.mouseout(this.doMouseOut.bind(this));
    this.paper.mouseover(this.doMouseOver.bind(this));
    this.paper.mousemove(this.doMouseMove.bind(this));

    this.bgRect = this.paper.rect(0, 0, 120, 24).attr({fill: "goldenrod"}).attr({opacity:0.5});

};

PourControl.prototype.setPourSpeed = function (iEvent) {
    var uupos = this.paper.node.createSVGPoint();
    uupos.x = iEvent.clientX;
    uupos.y = iEvent.clientY;
    var ctm = iEvent.target.getScreenCTM().inverse();
    if (ctm) {
        uupos = uupos.matrixTransform(ctm);
    }
    var tX = uupos.x;

    this.pourSpeed = (tX / this.w) * (tX / this.w);
};

PourControl.prototype.doMouseDown = function (iEvent) {
    this.pouring = true;
    this.setPourSpeed(iEvent);
    this.trackPouring();
};

PourControl.prototype.doMouseUp = function (iEvent) {
    this.pouring = false;
    this.previous = null;
};

PourControl.prototype.doMouseOut = function (iEvent) {
    this.pouring = false;
    this.previous = null;
};

PourControl.prototype.doMouseOver = function (iEvent) {
    console.log("over");
};

PourControl.prototype.doMouseMove = function (iEvent) {
    this.setPourSpeed(iEvent);
};

PourControl.prototype.updatePour = function (iDt) {
    var tFlow = this.pourSpeed * this.maxRate * iDt;
    this.callback(tFlow);
};

/**
 * Animation function for PourControl.
 * @param timestamp
 */
PourControl.prototype.trackPouring = function (timestamp) {
    if (!this.previous)  this.previous = timestamp;
    var tDt = (timestamp - this.previous) / 1000.0;
    if (isNaN(tDt)) {
        tDt = 0;
    }
    this.previous = timestamp;
    this.updatePour(tDt);
    if (this.pouring) window.requestAnimationFrame(this.trackPouring.bind(this));
};

