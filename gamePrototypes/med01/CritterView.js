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

var CritterView = function( c ) {
    this.critter = c;
    var tHalfSize = CritterView.overallViewSize / 2;
    this.snapShape = new Snap( tHalfSize * 2, tHalfSize * 2 );
    
    this.bgCircle = this.snapShape.circle(tHalfSize, tHalfSize, tHalfSize);
    this.bgCircle.attr({
        fill : "yellow"
    });
    
    this.healthCircle = this.snapShape.circle(tHalfSize, tHalfSize, tHalfSize  - 1.5);
    this.healthCircle.attr({
        stroke : "orange",
        strokeWidth : 3,
        fill : "transparent"
    });

    this.healthCircle.click( function() {       //      todo: find the best way to click on ANY visible part of the critter
            medManager.doCritterClick( this.critter );
        }.bind(this)
    );
};

CritterView.prototype.update = function (critter, dt) {
    var tHealth = critter.health;
    this.healthCircle.attr( {stroke : (tHealth == 0) ? "black" : "orange"});
};

CritterView.prototype.moveTo = function( xx, yy ) {
    this.snapShape.attr({
        x : xx, y: yy
    })
};

CritterView.overallViewSize = 20;