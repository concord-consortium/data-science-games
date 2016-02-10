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

var epiGeography;

/**
 * Singleton that manages the geography of this grid world.
 *
 * The 1-D index starts at zero in the BOTTOM LEFT. Then goes left to right, then bottom to top.
 *
 * @type {{kRowsInGrid: number, kColumnsInGrid: number, kPixelsWide: number, kPixelsTall: number, row: number, col: number, colLetters: string[], newLocationInfoByIndex: epiGeography.newLocationInfoByIndex, theShape: epiGeography.theShape, numberOfLocations: epiGeography.numberOfLocations, totalSize: epiGeography.totalSize}}
 */
epiGeography = {

    pRowsInGrid: 10,
    pColumnsInGrid: 10,

    kPixelsWide: 100,       //  width in game pixels of one CELL
    kPixelsTall: 100,

    row: 0,
    col: 0,

    colLetters : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],

    newLocationInfoByIndex: function( index ) {
        var tSnapSVGShape = this.theShape( index );
        var tRole = TEEUtils.pickRandomItemFrom( Location.locTypes );
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
        var tName = this.colLetters[ this.col ] + (this.row + 1);

        //   todo: figure out how to set the order of a categorical so that we don't have to use a numeric column.
        return {
            snap: tSnapSVGShape,
            bg: tBackgroundSnap,
            locType: tRole,
            name: tName,
            row: this.row,
            col: this.col
        };
    },

    /**
     * Create the (Snap.svg) shape of the cell (Location). this is the "paper."
     * The contents of the location get filled in later (in Location, for exmaple)
     * @param index
     */
    theShape: function( index ) {
        this.row = this.pRowsInGrid - Math.floor( index / this.pColumnsInGrid ) - 1;    //  row from 0 to 9
        this.col = index % this.pColumnsInGrid;                                         //  col from 0 to 9

        var tLeft = this.col * this.kPixelsWide;
        var tTop = (this.row) * this.kPixelsTall;

        var tOuterSVG = Snap( this.kPixelsWide, this.kPixelsTall);      //  Make new snap SVG Elemenrt
        tOuterSVG.attr("x", tLeft.toString());
        tOuterSVG.attr("y", tTop.toString());
        return tOuterSVG;
    },

    /**
     * How many locations altogether?
     * @returns {number}
     */
    numberOfLocations: function() {
        return this.pRowsInGrid * this.pColumnsInGrid;
    },

    /**
     * a total size, in pixels, width: and height:
     * @returns {{width: number, height: number}}
     */
    totalSize : function() {
        return {
            width : this.pColumnsInGrid * this.kPixelsWide,
            height : this.pRowsInGrid * this.kPixelsTall
        }
    },

    /**
     * Convert game coordinates to the Location index
     * @param iX    x in GAME coordinates (0,1000-ish)
     * @param iY
     * @returns {number}    index of Location. Starts lower left, left to right then bottom to top
     */
    coordToLocationIndex: function( iX, iY) {

        // first, pin to the active rectangle

        var tTS = this.totalSize();
        if (iX < 0) iX = 0;
        if (iY < 0) iY = 0;
        if (iX >= tTS.width) iX = tTS.width - 1;
        if (iY >= tTS.height) iY = tTS.height - 1;

        //  Now figure out which row or column we're in

        var tCol = Math.floor( iX / this.kPixelsWide),
            tRow = this.pRowsInGrid - Math.floor( iY / this.kPixelsTall ) - 1;
        var result =  tRow * this.pColumnsInGrid + tCol;

        if (result < 0 || result >= this.numberOfLocations()) result = null;

        return result;
    },

    /**
     * changes the number of rows or columns on behalf of epiManager.
     * @param iRows
     */
    setGridSize : function(iRows) {
        this.pRowsInGrid = iRows;
        this.pColumnsInGrid = iRows;
    }

};