/*
 ==========================================================================
 medGeography.js

 Geography singleton for the med DSG.

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

    colLetters : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],

    newLocationInfoByRowCol: function( iRowCol ) {
        var tSnapSVGShape = this.theShape( iRowCol );
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
        var tName = this.colLetters[ iRowCol.col ] + ( iRowCol.row + 1);

        //   todo: figure out how to set the order of a categorical so that we don't have to use a numeric column.
        return {
            snap: tSnapSVGShape,
            bg: tBackgroundSnap,
            locType: tRole,
            name: tName
        };
    },

    rowColFromIndex : function( i ) {
        var tRow = Math.floor( i / this.pColumnsInGrid );    //  row from 0 to 9 (or 4)
        var tCol = i % this.pColumnsInGrid;                  //  col from 0 to 9
        return { row : tRow, col : tCol };
    },

    indexFromRowCol : function(iRowCol) {
        var result =  iRowCol.row * this.pColumnsInGrid + iRowCol.col;
        if (result >= this.numberOfLocations() ) return null;    //  error
        return result;
    },

    coordToLocationIndex : function(iX, iY) {
        tRowCol = this.rowColFromCoordinates( iX, iY );
        return this.indexFromRowCol( tRowCol );
    },


    topLeftFromRowCol : function( iRowCol ) {
        var tTop = iRowCol.row * this.kPixelsTall;
        var tLeft = iRowCol.col * this.kPixelsWide;
        return { top : tTop, left : tLeft };
    },


    centerFromRowCol: function ( iRowCol ) {
        var tY = (iRowCol.row + 0.5) * this.kPixelsTall;
        var tX = (iRowCol.col + 0.5) * this.kPixelsWide;
        return { x : tX, y : tY };
    },

    locationFromRowCol : function( iRowCol ) {
        var index = this.indexFromRowCol( iRowCol );
        return epiModel.locations[ index ];
    },

    /**
     * Given (game) coordinates, like from a mouse click, find the Location they're in.
     *
     * @param iX
     * @param iY
     * @returns {*}     theLocation
     */
    locationFromCoords: function( iX, iY) {
        return epiModel.locations[ this.coordToLocationIndex( iX, iY)];
    },


    rowColString : function( rowCol ) {
        return "[" + rowCol.row + " | " + rowCol.col + "]";

    },

/**
     * Create the (Snap.svg) shape of the cell (Location). this is the "paper."
     * The contents of the location get filled in later (in Location, for exmaple)
     * @param index
     */
    theShape: function( iRowCol ) {
        var tTopLeft = this.topLeftFromRowCol( iRowCol );

        var tOuterSVG = Snap( this.kPixelsWide, this.kPixelsTall);      //  Make new snap SVG Elemenrt
        tOuterSVG.attr("x", tTopLeft.left.toString());
        tOuterSVG.attr("y", tTopLeft.top.toString());
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
     *
     * @param iX
     * @param iY
     * @returns {number}
     */
    rowColFromCoordinates: function( iX, iY) {

        // first, pin to the active rectangle

        var tTS = this.totalSize();
        if (iX < 0) iX = 0;
        if (iY < 0) iY = 0;
        if (iX >= tTS.width) iX = tTS.width - 1;
        if (iY >= tTS.height) iY = tTS.height - 1;

        //  Now figure out which row or column we're in

        var tCol = Math.floor( iX / this.kPixelsWide),
            tRow = Math.floor( iY / this.kPixelsTall );

        return {row : tRow, col : tCol };
    },

    /**
     * How far is the given location from this Critter?
     * @param iLoc     the Location in question
     * @returns {number}
     */
    distanceByRowCol: function ( iFrom, iTo ) {
        var tToXY = epiGeography.centerFromRowCol( iTo );
        var tFromXY = epiGeography.centerFromRowCol( iFrom );
        return this.distanceByXY(tFromXY, tToXY);
    },

    distanceByXY : function( iFrom, iTo ) {
        var tdx = iTo.x - iFrom.x;
        var tdy = iTo.y - iFrom.y;
        return Math.sqrt(tdx * tdx + tdy * tdy);
    },


    distanceToClosestSuitableLocationType : function( iWhere, iLocType ) {
        var tClosestDistance = Number.MAX_VALUE;

        epiModel.locations.forEach( function(loc) {
            if (loc.locType == iLocType) {
                var tDist = epiGeography.distanceByRowCol( iWhere, loc.rowCol);
                if (tDist < tClosestDistance) tClosestDistance = tDist;
            }
        })

        return tClosestDistance;
    },

    allSuitableRowColsWithin: function (iWhere, iLocType, iDistanceLimit) {
        var result = [];

        epiModel.locations.forEach(
            function (loc) {
                if (loc.locType == iLocType) {
                    var tDist = epiGeography.distanceByRowCol(iWhere, loc.rowCol);
                    if (tDist <= iDistanceLimit) result.push(loc.rowCol);
                }
            });

        return result;
    },

    /**
     * changes the number of rows or columns on behalf of epiManager.
     * @param iRows
     */
    setGridSize : function(iRows) {
        this.pRowsInGrid = iRows;
        this.pColumnsInGrid = iRows;
    },

    /**
     * Make the object that can be used to restore this
     * @returns {{pRowsInGrid: *, pColumnsInGrid: *, kPixelsWide: *, kPixelsTall: *}}
     */
    getSaveObject: function() {
        var tSaveObject = {
            pRowsInGrid : this.pRowsInGrid,
            pColumnsInGrid : this.pColumnsInGrid,
            kPixelsWide : this.kPixelsWide,
            kPixelsTall : this.kPixelsTall,
        };
        return tSaveObject;
    },

    /**
     * restore from the saved object
     * @param iObject
     */
    restoreFrom: function( iObject ) {
        this.pRowsInGrid = iObject.pRowsInGrid;
        this.pColumnsInGrid = iObject.pColumnsInGrid;
        this.kPixelsWide = iObject.kPixelsWide;
        this.kPixelsTall = iObject.kPixelsTall;

    }

};