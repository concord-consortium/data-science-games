/**
 * Created by tim on 5/9/16.


 ==========================================================================
 etaCas.score.js in data-science-games.

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


steb.score = {

    evolutionPoints : null,
    pointsPerCrud : -5,
    pointsPerMeal : 1,
    pointsPerMiss : -1,
    pointsPerSecond : -0.016,
    startingPoints : 10,

    newGame : function() {
        this.evolutionPoints = this.startingPoints;
    },

    meal : function() {
        this.evolutionPoints += this.pointsPerMeal - this.pointsPerMiss;
    },

    crud : function() {
        this.evolutionPoints += this.pointsPerCrud - this.pointsPerMiss;
    },

    clickInWorld : function() {
        this.evolutionPoints += this.pointsPerMiss;
    }
}