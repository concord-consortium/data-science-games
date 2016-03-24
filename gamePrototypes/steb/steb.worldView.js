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

    flush : function() {
        this.paper.clear();
        this.makeBackground();
    },

    installStebberView : function( iStebberView ) {
        var tWhere = iStebberView.stebber.where;
        this.paper.append( iStebberView.paper);

        //  place the view where it actually is on the main paper

        iStebberView.paper.attr({
            x : tWhere.x - steb.constants.stebberViewSize/2,
            y : tWhere.y - steb.constants.stebberViewSize/2
        });

        iStebberView.startMoving();
        this.stebberViews.push( iStebberView );
    },

    removeStebberView : function( iStebberView )    {
        iStebberView.paper.remove(  );
        var tIndex = this.stebberViews.indexOf( iStebberView );
        this.stebberViews.splice( tIndex, 1 );
    },

    makeBackground : function() {
        var tColorString = StebberView.colorString(steb.model.randomColor());
        console.log("New bg: " + tColorString);

        this.paper.rect(0, 0, 1000, 1000).attr({
            fill: tColorString
        })

    },

    stopEverybody : function () {
        //var tElements = Snap.selectAll(".StebberView");
        //tElements.forEach( function( element ) {
        //    element.stop();
        //});
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
            viewBox : "0 0 1000 1000"
        });

        this.makeBackground();
    }
}