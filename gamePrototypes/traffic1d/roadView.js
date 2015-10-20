/*
 ==========================================================================
 roadView.js

 View of the road for the Traffic 1D DSG.

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

var roadView;

roadView = {

    roadSVG: null,
    carSVGSize: 40,

    initialize: function () {
        this.roadSVG = document.getElementById("road");
    },

    draw: function () {
        var i;
        for (i = 0; i < trafficModel.lightSystem.lights.length; i++) {
            trafficModel.lightSystem.lights[i].draw( );
        }
        for (i = 0; i < trafficModel.cars.length; i++) {
            trafficModel.cars[i].draw( );
        }
    },

    addCarSVG: function (c ) {
        var newCarSVG = document.createElementNS(svgNS, "svg");
        newCarSVG.setAttribute("width", this.carSVGSize.toString());
        newCarSVG.setAttribute("height", this.carSVGSize.toString());

        newCarSVG.setAttribute("x","0");  //  note: attribute names are strings!!
        newCarSVG.setAttribute("y","0");
        newCarSVG.setAttribute("id", "C"+ c.carCaseID);

        var tTop, tLeft;
        tTop = this.carSVGSize/2 - c.width/2;
        tLeft = this.carSVGSize/2 - c.carLength/2;

        var carRect = document.createElementNS(svgNS, "rect");
        carRect.setAttribute("x",tLeft.toString());  //  note: attribute names are strings!!
        carRect.setAttribute("y",tTop.toString());
        carRect.setAttribute("fill","black");
        carRect.setAttribute("width", c.carLength.toString());
        carRect.setAttribute("height", c.width.toString());

        var brakeRect = document.createElementNS(svgNS, "rect");
        brakeRect.setAttribute("x",tLeft.toString());  //  note: attribute names are strings!!
        brakeRect.setAttribute("y",tTop.toString());
        brakeRect.setAttribute("fill","black");
        brakeRect.setAttribute("width", "4");
        brakeRect.setAttribute("height", c.width.toString());
        brakeRect.setAttribute("id", "brake");

        var carText = document.createElementNS(svgNS, "text");
        carText.setAttribute("x",tLeft.toString());  //  note: attribute names are strings!!
        carText.setAttribute("y",tTop.toString());
        carText.setAttribute("fill", "white");
        carText.setAttribute("textContent", "foo");

        newCarSVG.appendChild(carRect);
        newCarSVG.appendChild(brakeRect);
        newCarSVG.appendChild(carText);

        newCarSVG.addEventListener("click",trafficManager.clickCar);
        this.roadSVG.appendChild(newCarSVG);         //  here we put the new object into the DOM.
        c.SVG = newCarSVG;
        c.brakeSVG = brakeRect;

    }

};
