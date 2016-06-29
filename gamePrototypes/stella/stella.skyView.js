/**
 * Created by tim on 6/25/16.


 ==========================================================================
 SkyView.js in data-science-games.

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

/* global stella, $, Snap, StarView */

stella.skyView = {

    paper : null,
    backgroundSkyRect : null,
    starViews : [],
    reticleX : null,
    reticleY : null,

    pointAtStar : function(iStar ) {

        if (iStar) {
            var x = iStar.where.x;
            var y = iStar.where.y;
            this.reticleX.attr({ visibility : "visible", y1 : stella.constants.universeWidth - y, y2 : stella.constants.universeWidth - y});
            this.reticleY.attr({ visibility : "visible", x1 : x, x2 : x});
        } else {
            this.reticleX.attr({ visibility : "hidden"});
            this.reticleY.attr({ visibility : "hidden"});
        }

    },

    initialize : function( iModel ) {
        this.paper = Snap(document.getElementById("stellaSkyView"));    //    create the underlying svg "paper"
        this.paper.clear();

        //  now set this paper's "view box"
        this.paper.attr({
            viewBox : "0 0 " + stella.constants.universeWidth + " " + stella.constants.universeWidth
        });

        this.backgroundSkyRect = this.paper.rect(
            0, 0,
            stella.constants.universeWidth,        //  full size. Cover the world view.
            stella.constants.universeWidth).attr( {fill : "black"});

        // now make all the star views

        iModel.stars.forEach( function(iStar) {
            var tStarView = new StarView( iStar, this.paper );  //  attaches it to the Paper
            this.starViews.push( tStarView );
        }.bind(this));

        //  make the reticle views

        this.reticleX = this.paper.line(0, 0, stella.constants.universeWidth, 0).attr({
            stroke : "green",
            strokeWidth : 0.05,
            strokeOpacity : 0.7,
            visibility : "hidden"
        });
        this.reticleY = this.paper.line(0, 0, 0, stella.constants.universeWidth ).attr({
            stroke : "green",
            strokeWidth : 0.05,
            strokeOpacity : 0.7,
            visibility : "hidden"
        });
    }

};