/**
 * Created by tim on 7/8/16.


 ==========================================================================
 steb.patternBoxView.js in data-science-games.

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

/* global steb, Snap */

steb.patternBoxView = {

    bgSPS : null,
    crudSPS : null,
    paper : null,
    bgBox : null,
    crudBox : null,
    bgText : null,
    crudText : null,


    initialize : function( ) {
        this.paper = new Snap(document.getElementById("patternBoxView"));    //    create the underlying svg "paper"

        var tW = this.paper.node.clientWidth;
        var tH2 = this.paper.node.clientHeight / 2;

        this.crudText = this.paper.text(8, tH2 - 8,"Crud");
        this.crudBox = this.paper.rect( 0, tH2, tW/2, 50).attr({fill : "orange"});
        this.bgText = this.paper.text(tW/2 + 8, tH2 - 8, "Background");
        this.bgBox = this.paper.rect( tW/2, tH2, tW/2, tH2).attr({fill : "red"});

        this.bgText.node.innerHTML = "Yes! BG!";
    },

    newGame : function( ) {
        this.setPatterns( steb.model.trueBackgroundSPS, steb.model.meanCrudSPS);
    },

    setPatterns : function( iBG, iCrud )  {
        if (iCrud) {
            this.crudSPS = iCrud;
            this.crudText.node.innerHTML = "Crud: " + this.crudSPS.toString();
            this.crudBox.attr({fill : this.crudSPS.getPattern() });
        } else {
            this.crudText.node.innerHTML = "no crud this time";
        }

        this.bgSPS = iBG;
        this.bgText.node.innerHTML = "BG: " + this.bgSPS.toString();
        this.bgBox.attr({fill : this.bgSPS.getPattern() });
    }
};