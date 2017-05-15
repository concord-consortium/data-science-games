/*
 ==========================================================================
 CritterView.js

 Critter view class for the med DSG.

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
 * Created by tim on 10/25/15.
 */

/**
 * View class for Critters
 * @param c     the model Critter
 * @constructor
 */
var CritterView = function( c ) {
    this.critter = c;

    //  "paper"

    var critRad = CritterView.overallViewSize / 2;
    var tVBText = -critRad + " " + (-critRad) + " " + 2 * critRad + " " + 2 * critRad;

    this.snapShape = new Snap( 2 * critRad, 2 * critRad );  //  width and height.
    this.snapShape.attr({ viewBox : tVBText});

    //  selectionCircle

    this.selectionCircle = this.snapShape.circle(0, 0, critRad - 3);
    this.selectionCircle.attr({
        stroke : CritterView.kSelectionColor,
        fill :"transparent",
        strokeWidth : 5
    });

    //  background

    this.bgCircle = this.snapShape.circle(0, 0, 10); //  add Snap circle with cx, cy, and r
    this.bgCircle.attr({
        fill : CritterView.kUsualBackgroundColor
    });

    //  "eye" line

    this.eyeLine = this.snapShape.line(-8.5, -1.5, 8.5, -1.5);
    this.eyeLine.attr(
        {
            stroke: c.eyeColor,
            strokeWidth : 3
        }
    )

    //  "nose" piece

    this.nosePiece = this.snapShape.line(0, -8.5, 0, 0).attr({
        stroke: c.borderColor, strokeWidth: 3
    });

    //  outside circle

    this.healthCircle = this.snapShape.circle(0, 0, 8.5);
    this.healthCircle.attr({
        stroke : c.borderColor,
        strokeWidth : 3,
        fill : "transparent"
    });

    this.healthCircle.click( function() {       //      todo: find the best way to click on ANY visible part of the critter
            epiManager.doCritterClick( this.critter );
        }.bind(this)
    );

    var tStartX, tStartY,
        onDragStart = function( iX, iY, iEvent) {
            tStartX = Number(this.snapShape.attr('x'));
            tStartY = Number(this.snapShape.attr('y'));
            epiManager.draggingCritter = true;
            console.log("CritterView:onDragStart " + iX + " " + iY + " <-- " + tStartX + " " + tStartY);
        },
        onDragMove = function( iDX, iDY, iX, iY, iEvent) {
            //  todo: use CTM. See onDragEnd, below. That way we could highlight droppable Locations
            var tVPDX = iDX * epiWorldView.VBWidth / Number(epiWorldView.actualWidth),
                tVPDY = iDY * epiWorldView.VBHeight / Number(epiWorldView.actualHeight);
            var tX = tStartX + tVPDX;
            var tY = tStartY + tVPDY;
            this.moveTo( {x : tX, y : tY} );

            // todo: epiManager.handleMoveOfCritter();
        },
        onDragEnd = function( iEvent) {
            var CTM = epiWorldView.epiWorldPaper.node.getScreenCTM();   //  CTM = coordinate transformation matrix
            var CTMI = CTM.inverse();
            var screenCoordinates = this.snapShape.node.createSVGPoint();
            screenCoordinates.x = iEvent.offsetX;
            screenCoordinates.y = iEvent.offsetY;

            var gameCoordinates = screenCoordinates.matrixTransform( CTMI );
            epiManager.handleDropOfCritter( this.critter, gameCoordinates.x, gameCoordinates.y);
        };

    this.healthCircle.drag(onDragMove, onDragStart, onDragEnd, this, this, this);
};

/**
 * Update the view, e.g., in response to changes in health or selection
 */
CritterView.prototype.update = function ( ) {
    var tHealth = this.critter.health;
    this.healthCircle.attr( {stroke : (tHealth == 0) ? CritterView.kSickBorderColor : this.critter.borderColor});

    if (epiOptions.showCarrier) {
        this.bgCircle.attr({fill: (this.critter.infectious) ? CritterView.kCarrierBackgroundColor : CritterView.kUsualBackgroundColor});
    } else {
        this.bgCircle.attr({fill: CritterView.kUsualBackgroundColor});
    }

    this.selectionCircle.attr({stroke : (this.critter.selected) ? CritterView.kSelectionColor : "transparent"});
};

/**
 * Just move me to x, y. No animation
 * @param xy
 */
CritterView.prototype.moveTo = function( xy ) {
    this.snapShape.attr({
        x : xy.x, y: xy.y
    })
};

/**
 * Class variable: the overall (full) size of the view
 * @type {number}
 */
CritterView.overallViewSize = 30;

/**
 * Other class variables for the view
 * @type {string}
 */
CritterView.kUsualBackgroundColor = "yellow";
CritterView.kCarrierBackgroundColor = "black";
CritterView.kSickBorderColor = "gray";
CritterView.kSelectionColor = "white";

