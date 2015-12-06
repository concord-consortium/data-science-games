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
    
    row: 0,
    col: 0,
    
    colLetters : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],

    newLocationInfoByIndex: function( index ) {
        var tSnapSVGShape = this.theShape( index );
        var tRole = pickRandomItemFrom( epiManager.locTypes );
        var tColor = Location.colors[tRole];

        var tBackgroundSnap = tSnapSVGShape.rect();
        tBackgroundSnap.attr(
            {
                fill:tColor,
                stroke: "white",
                x:0, y:0,
                width: tSnapSVGShape.attr("width"),
                height: tSnapSVGShape.attr("height")
            }
        );
        var tName = this.colLetters[ this.col ] + this.row;
        
        return { snap: tSnapSVGShape, bg: tBackgroundSnap, locType: tRole, name: tName, row: this.row, col: this.col+1 };
    },

    theShape: function( index ) {
        this.row = this.kRowsInGrid - Math.floor( index / this.kColumnsInGrid );
        this.col = index % this.kColumnsInGrid;

        var tLeft = this.col * this.kPixelsWide;
        var tTop = (this.row - 1) * this.kPixelsTall;

        var tOuterSVG = Snap( this.kPixelsWide, this.kPixelsTall);      //  Make new snap SVG Elemenrt
        tOuterSVG.attr("x", tLeft.toString());
        tOuterSVG.attr("y", tTop.toString());
        return tOuterSVG;
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