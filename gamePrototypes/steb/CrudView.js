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
 * Model class. Its view is CrudView (below)
 * @param iCrudColor
 * @constructor
 */
var Crud = function(  ) {
    this.where = steb.model.randomPlace();
    this.speed = steb.constants.crudSpeed;

    this.trueColor = steb.model.mutateColor(
        steb.model.meanCrudColor,
        steb.constants.crudColorMutationArray
    );
    this.setNewSpeedAndHeading();
};

Crud.prototype.setNewSpeedAndHeading = function() {
    this.heading = Math.PI*2 * Math.random();
    this.speed = steb.constants.baseCrudSpeed;

    this.timeToChange = 1 + Math.random() * 2;
};

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

    if (this.timeToChange < 0) this.setNewSpeedAndHeading();
};

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
 * @param iCrudColor
 * @constructor
 */
var CrudView = function( iCrud ) {

    this.crud = iCrud;
    this.paper = new Snap( steb.constants.crudSize, steb.constants.crudSize);
    var tRadius = steb.constants.crudSize / 2;
    var tVBText = -tRadius + " " + (-tRadius) + " " + 2 * tRadius + " " + 2 * tRadius;

    this.paper.attr({
        viewBox : tVBText,
        class : "CrudView",
        x : this.crud.where.x,
        y : this.crud.where.y
    });

    this.selectionShape = this.paper.rect( -tRadius, -tRadius,
        steb.constants.crudSize, steb.constants.crudSize,
        steb.constants.crudSize * 0.4);

    this.setMyColor();      //  apply predator vision

    //  set up the click handler

    this.selectionShape.click(function( iEvent ) {
        steb.ui.clickCrud( iEvent )
    }.bind(this) );         //  bind so we get the StebberView and not the Snap.svg element

};

CrudView.prototype.update = function() {
    this.moveTo( this.crud.where );
};

CrudView.prototype.setMyColor = function() {
    steb.worldView.applyPredatorVisionToObject( this.paper, this.crud.trueColor);
};

CrudView.prototype.moveTo = function( iWhere ) {
    this.paper.attr({
        x : iWhere.x - steb.constants.stebberViewSize/2,
        y : iWhere.y - steb.constants.stebberViewSize/2
    });

}



