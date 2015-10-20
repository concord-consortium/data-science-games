/*
 ==========================================================================
 Light.js

 Model/drawing class for traffic lights for the Traffic 1D DSG.

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

/**
 * Created by tim on 10/20/15.
 */


var Light = function (number, startPhase, place) {
    this.color = "green";
    this.phase = startPhase;
    this.yellowDwell = 3;
    this.location = place;
    this.size = 30;     //  the width of the thing
    this.wholeSVG = null;
    this.SVGRect = null;
    this.lightNumber = number;

    //  make the svg, put the rect inside
    //  attach an event handler to the larger svg
    //  somehow give it an ID so we know which light gets clicked.

    this.wholeSVG = document.createElementNS(svgNS, "svg");
    this.wholeSVG.setAttribute("width", this.size.toString());
    this.wholeSVG.setAttribute("height", roadView.roadSVG.getAttribute("height"));
    this.wholeSVG.setAttribute("id", "L"+ this.lightNumber);
    this.wholeSVG.addEventListener("click", trafficManager.clickLight);

    this.SVGRect = document.createElementNS(svgNS, "rect");
    this.SVGRect.setAttribute("fill", this.color);
    this.SVGRect.setAttribute("width", "100%");
    this.SVGRect.setAttribute("height", "100%");

    this.wholeSVG.appendChild(this.SVGRect);
    roadView.roadSVG.appendChild(this.wholeSVG);         //  here we put the new object into the DOM.

    console.log("Made light with ID " + this.wholeSVG.getAttribute("id"));
};

Light.prototype.setColor = function (time, period) {
    var theta = time % period;
    if (this.phase > period / 2 && theta < period / 2) {
        theta += period;
    }
    if (theta > this.phase && theta < (this.phase + period / 2 - this.yellowDwell)) {
        this.color = "green";
    } else if (theta > this.phase + period / 2 - this.yellowDwell && theta < this.phase + period / 2) {
        this.color = "yellow";
    } else {
        this.color = "red";
    }
};

Light.prototype.draw = function ( ) {
    this.SVGRect.setAttribute("fill", this.color);
    this.wholeSVG.setAttribute("x", (this.location - this.size/2).toString());
    this.wholeSVG.setAttribute("y", "0");
};

