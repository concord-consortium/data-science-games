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
    backgroundRect : null,

    update : function() {
        this.stebberViews.forEach( function(iSV) {
            iSV.update();
        })
        this.crudViews.forEach( function(iCV) {
            iCV.update();
        })
    },

    newGame : function() {
        this.paper.clear();
        this.makeBackground();
        this.stebberViews = [];
        this.crudViews = [];

        //  make StebberViews and install them

        steb.model.stebbers.forEach( function( iStebber ) {
            steb.worldView.installStebberViewFor( iStebber );
        });

        //  make CrudViews and install

        steb.model.crud.forEach( function(iCrud) {
            steb.worldView.installCrudViewFor( iCrud );
        });
    },

    installStebberViewFor : function( iStebber ) {
        var tSV = new StebberView( iStebber );
        tSV.paper.insertAfter( this.backgroundRect);   //  put any new stebbers below any crud, just after bgRect

        //  place the view where it actually is on the main paper
        tSV.moveTo( iStebber.where );

        this.stebberViews.push( tSV );
    },

    removeStebberView : function( iStebberView )    {
        iStebberView.paper.remove(  );
        var tIndex = this.stebberViews.indexOf( iStebberView );
        this.stebberViews.splice( tIndex, 1 );
    },

    installCrudViewFor : function( iCrud ) {
        tCrudView = new CrudView( iCrud );
        this.paper.append( tCrudView.paper );     //  actually install the view
        this.crudViews.push( tCrudView );       //  store it in our extra array
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

        //  this.makeBackground();
    },

    updateDisplayWithCurrentVisionParameters : function( )  {
        this.stebberViews.forEach( function(sv) { sv.setMyColor(); } );
        this.crudViews.forEach( function(sv) { sv.setMyColor(); } );
        this.setBackgroundColor();

    },

    //  changing color

    applyPredatorVisionToObject : function(iThing, iTrueColor, iTime) {

        if (typeof iTime === 'undefined') { iTime = steb.constants.colorAnimationDuration; }
        var tApparentColor = steb.model.getPredatorVisionColor(iTrueColor);
        var tColorString = steb.makeColorString( tApparentColor );
        iThing.animate({ fill : tColorString }, iTime); //  animate the color change

    },

    //          BACKGROUND

    makeBackground : function() {
        this.backgroundRect = this.paper.rect(
            0, 0,
            steb.constants.worldViewBoxSize,
            steb.constants.worldViewBoxSize);
        this.setBackgroundColor();

    },


    mutateBackgroundColor : function() {
        steb.model.trueBackgroundColor = steb.model.mutateColor( steb.model.trueBackgroundColor, [-2, -1, 0, 1, 2]);
        this.setBackgroundColor();
    },

    /**
     * Make and apply the background color string,
     * taking the predator's visual filter into effect
     *
     */
    setBackgroundColor : function() {
        steb.worldView.applyPredatorVisionToObject( this.backgroundRect, steb.model.trueBackgroundColor);
    }

}