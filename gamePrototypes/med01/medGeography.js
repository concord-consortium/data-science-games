/*
 ==========================================================================
 medGeography.js

 Geography singleton for the med DSG.

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
 * Created by tim on 10/21/15.
 */

var medGeography;

medGeography = {

    kRowsInGrid: 10,
    kColumnsInGrid: 10,

    kPixelsWide: 100,
    kPixelsTall: 100,

    newLocationInfoByIndex: function( index ) {
        var tShape = this.theShape( index );
        var tRole = pickRandomItemFrom( medManager.locTypes );
        var tColor = Location.colors[tRole];
        tShape.attr("fill", tColor);
        tShape.attr("stroke", "white");

        return { shape: tShape, locType: tRole };
    },

    theShape: function( index ) {
        var tRow = Math.floor( index / this.kColumnsInGrid );
        var tColumn = index % this.kColumnsInGrid;

        var tLeft = tColumn * this.kPixelsWide;
        var tTop = tRow * this.kPixelsTall;

        var tSVGShape = document.createElementNS(svgNS, "rect");
        var tShape = Snap(tSVGShape);       //      this is a snap element
        tShape.attr("x", tLeft.toString());
        tShape.attr("y", tTop.toString());
        tShape.attr("width", this.kPixelsWide.toString());
        tShape.attr("height", this.kPixelsTall.toString());

        return tShape;
    },

    numberOfLocations: function() {
        return this.kRowsInGrid * this.kColumnsInGrid;
    },

    totalSize : function() {
        return {
            width : this.kColumnsInGrid * this.kPixelsWide,
            height : this.kRowsInGrid * this.kPixelsTall
        }
    }

};