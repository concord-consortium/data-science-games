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


var CrudView = function( iCrudColor ) {
    this.where = steb.model.randomPlace();
    this.whither = CrudView.newWhither();
    var tCrudColor = steb.model.mutateColor( iCrudColor, steb.constants.crudColorMutationArray );
    this.crudColor = steb.colorString(tCrudColor);
    this.paper = new Snap( steb.constants.crudSize, steb.constants.crudSize);
    var tRadius = steb.constants.crudSize / 2;
    var tVBText = -tRadius + " " + (-tRadius) + " " + 2 * tRadius + " " + 2 * tRadius;
    var tColorString = steb.colorString( this.crudColor );

    this.paper.attr({
        viewBox : tVBText,
        class : "CrudView",
        x : this.where.x,
        y : this.where.y
    });

    this.selectionShape = this.paper.rect( -tRadius, -tRadius,
        steb.constants.crudSize, steb.constants.crudSize,
        steb.constants.crudSize * 0.4).attr({
        fill : this.crudColor
    })

    //  set up the click handler

    this.selectionShape.click(function( iEvent ) {
        steb.ui.clickCrud( iEvent )
    }.bind(this) );         //  bind so we get the StebberView and not the Snap.svg element

};

CrudView.prototype.startMoving = function() {
    var tAnimationObject = {
        x : this.whither.x - steb.constants.stebberViewSize/2,
        y : this.whither.y - steb.constants.stebberViewSize/2,
        rotation : this.whither.rotation
    };


    var tHere = {
        x : Number(this.paper.attr("x")) + steb.constants.stebberViewSize/2,
        y : Number(this.paper.attr("y")) + steb.constants.stebberViewSize/2
    };

    var tTime = steb.model.distanceBetween( tHere, this.whither ) / steb.constants.crudSpeed;

    this.paper.animate(
        tAnimationObject,
        tTime * 1000,
        null,       //  mina.easeinout,
        function() {
            this.animationArrival();
            this.startMoving();     //  tail recursion; start moving again.
        }.bind(this)
    );
};

CrudView.prototype.animationArrival = function() {
    this.where = this.whither;
    this.whither = CrudView.newWhither();
};

CrudView.newWhither = function() {
    var oWhit = steb.model.randomPlace();
    oWhit.rotation = Math.random() * 360.0;
    return oWhit;
}


