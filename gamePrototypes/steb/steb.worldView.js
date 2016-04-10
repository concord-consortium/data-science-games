/**
 * Created by tim on 3/23/16.


 ==========================================================================
 worldView.js in data-science-games.

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


steb.worldView = {
    paper : null,
    stebberViews : [],
    crudViews : [],
    backgroundColor : null,
    backgroundColorString : null,
    backgroundRect : null,

    update : function() {
        this.stebberViews.forEach( function(iSV) {
            iSV.update();
        })
    },

    flush : function() {
        this.paper.clear();
        this.makeBackground();
    },

    installStebberView : function( iStebberView ) {
        var tWhere = iStebberView.stebber.where;
        iStebberView.paper.insertAfter( this.backgroundRect);   //  put any new stebbers below any crud, just after bgRect

        //  place the view where it actually is on the main paper

        iStebberView.moveTo( tWhere );

        this.stebberViews.push( iStebberView );
    },

    removeStebberView : function( iStebberView )    {
        iStebberView.paper.remove(  );
        var tIndex = this.stebberViews.indexOf( iStebberView );
        this.stebberViews.splice( tIndex, 1 );
    },

    stopEverybody : function () {
        this.stebberViews.forEach( function(iView) {
            iView.paper.stop();
            iView.stebber.where = {
                x : Number(iView.paper.attr("x")) + steb.constants.stebberViewSize/2,
                y : Number(iView.paper.attr("y")) + steb.constants.stebberViewSize/2
            }

        } );
    },

    startEverybody : function() {
        this.stebberViews.forEach( function(iView) {
            iView.startMoving();
        });
    },

    viewBoxCoordsFrom : function( iEvent ) {
        var tPoint = steb.ui.stebWorldViewElement.createSVGPoint();
        tPoint.x = iEvent.clientX;
        tPoint.y = iEvent.clientY;
        var CTM = steb.ui.stebWorldViewElement.getScreenCTM();  //iEvent.target.getScreenCTM();
        if ( CTM = CTM.inverse() ) tPoint = tPoint.matrixTransform( CTM );

        return tPoint;
    },

    initialize : function() {
        this.paper = Snap(document.getElementById("stebSnapWorld"));
        this.paper.attr({
            viewBox : "0 0 " + steb.constants.worldViewBoxSize + " " + steb.constants.worldViewBoxSize
        });

        this.makeBackground();
    },



    //          BACKGROUND

    backgroundObjects : [],

    makeBackground : function() {

        this.backgroundRect = this.paper.rect(
            0, 0,
            steb.constants.worldViewBoxSize,
            steb.constants.worldViewBoxSize);
        this.newBackgroundColor();
    },

    newBackgroundColor : function() {
        this.backgroundColor = steb.model.randomColor( [3,4,5,6,7,8,9,10,11,12] );
        this.backgroundColorString = steb.colorString( this.backgroundColor );
        console.log("New bg: " + this.backgroundColorString);
        this.backgroundRect.attr({fill : this.backgroundColorString});
    },

    mutateBackgroundColor : function() {
        this.backgroundColor = steb.model.mutateColor( this.backgroundColor, [-2, -1, 0, 1, 2]);
        this.backgroundColorString = steb.colorString( this.backgroundColor );
        console.log("New bg: " + this.backgroundColorString);
        this.backgroundRect.attr({fill : this.backgroundColorString});
    },

    addCrud : function() {
        this.meanCrudColor = steb.model.mutateColor( this.backgroundColor, [-3, -3, -2, 2, 3, 3]  );

        for (var i = 0; i < steb.constants.numberOfCruds; i++) {
            tCrud = new CrudView( this.meanCrudColor );
            this.paper.append( tCrud.paper);
            tCrud.startMoving();
            this.crudViews.push( tCrud );
        }

    },

    makeCrud : function( iColorString) {
        var tPlace = steb.model.randomPlace();

        var tCrud = this.paper.rect( 0, 0, steb.constants.crudSize, steb.constants.crudSize).attr({
            fill : iColorString,
            x : tPlace.x,
            y : tPlace.y
        });
        this.backgroundObjects.push( tCrud );
    }




}