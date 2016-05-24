/**
 * Created by tim on 3/27/16.


 ==========================================================================
 CrudView.js in data-science-games.

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
 * Note that this file contains both the Crud and CrudView classes.
 */

/**
 * Model class. Its view is CrudView (below).
 * @constructor
 */
var Crud = function(  ) {
    this.where = steb.model.randomPlace();
    this.speed = steb.constants.baseCrudSpeed;

    this.trueColor = steb.model.mutateColor(
        steb.model.meanCrudColor,
        steb.constants.crudColorMutationArray
    );
    this.setNewSpeedAndHeading();
};

/**
 * Give this Crud new speed and heading.
 * Reset this.timeToChange.
 */
Crud.prototype.setNewSpeedAndHeading = function() {
    this.heading = Math.PI*2 * Math.random();
    this.speed = steb.constants.baseCrudSpeed;

    this.timeToChange = 1 + Math.random() * 2;
};

/**
 * Update position and velocity;
 * also decrement the this.timeToChange timer.
 * @param idt
 */
Crud.prototype.update = function( idt ) {

    if (this.speed > steb.constants.baseCrudSpeed) {
        this.speed -= idt * steb.constants.baseCrudAcceleration;
    }

    var tDx = this.speed * Math.cos( this.heading ) * idt;
    var tDy = this.speed * Math.sin( this.heading ) * idt;

    this.where.x += tDx;
    this.where.y += tDy;

    this.where.x = steb.rangeWrap( this.where.x, 0, steb.constants.worldViewBoxSize);
    this.where.y = steb.rangeWrap( this.where.y, 0, steb.constants.worldViewBoxSize);

    this.timeToChange -= idt;

    if (this.timeToChange < 0) this.setNewSpeedAndHeading();    //  after this time, new speed
};

/**
 * Crud flows away from the given point
 * (the location of a meal)
 * @param iPoint
 */
Crud.prototype.runFrom = function( iPoint ) {
    if (steb.options.flee) {
        var dx = this.where.x - iPoint.x;
        var dy = this.where.y - iPoint.y;
        var r = Math.sqrt(dx * dx + dy * dy);

        if (r < steb.constants.worldViewBoxSize / 2) {
            this.heading = Math.atan2(dy, dx);
            this.speed = 5 * steb.constants.baseCrudSpeed;
            this.timeToChange = 1 + Math.random() * 2;
        }
    }
};

/**
 * ----------------------------------------------------------------------------
 * View class for the Crud
 *
 * @param iCrud    the model Crud we're viewing.
 * @constructor
 */
var CrudView = function( iCrud ) {

    this.crud = iCrud;      //  its model
    this.paper = new Snap( steb.constants.crudSize, steb.constants.crudSize);   //  the SVG "paper"
    var tRadius = steb.constants.crudSize / 2;
    var tVBText = -tRadius + " " + (-tRadius) + " " + 2 * tRadius + " " + 2 * tRadius;

    this.paper.attr({       //  the overall data for this view
        viewBox : tVBText,
        class : "CrudView",     //  so we can select it with a DOM selector
        x : this.crud.where.x,
        y : this.crud.where.y
    });

    this.selectionShape = this.paper.rect(          //  the round-cornered visible shape
        -tRadius, -tRadius,
        steb.constants.crudSize, steb.constants.crudSize,
        steb.constants.crudSize * 0.4               //  the radius of the corners.
    );

    this.setMyColor();      //  apply predator vision. See function below.

    //  set up the click handler

    this.selectionShape.click(function( iEvent ) {
        steb.ui.clickCrud( iEvent )
    }.bind(this) );         //  bind so we get the StebberView and not the Snap.svg element

};

/**
 * To update this view, simply move to the location.
 */
CrudView.prototype.update = function() {
    this.moveTo( this.crud.where );
};

/**
 *  Called above.
 */
CrudView.prototype.setMyColor = function() {
    steb.worldView.applyPredatorVisionToObject( this.paper, this.crud.trueColor);
};

/**
 * Actually move the Crud to the new location
 * @param iWhere
 */
CrudView.prototype.moveTo = function( iWhere ) {
    this.paper.attr({
        x : iWhere.x - steb.constants.stebberViewSize/2,
        y : iWhere.y - steb.constants.stebberViewSize/2
    });

};



