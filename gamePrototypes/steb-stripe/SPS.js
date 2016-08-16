/**
 * Created by tim on 8/14/16.


 ==========================================================================
 SPS.js in data-science-games.

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
 * SPS is a Stebbins Pattern Specification
 * @constructor
 */

/* global Snap, TEEUtils */

var SPS = function () {
    this.vDarkStripeWidth = 4;
    this.vLightStripeWidth = 4;
    this.paper = null;
};

SPS.prototype.getPattern = function () {

    this.paper = new Snap(this.vDarkStripeWidth + this.vLightStripeWidth, 1);

    var dark = this.paper.rect(0, 0, this.vDarkStripeWidth, 1).attr(
        {fill : "darkgreen"}
    );
    var light = this.paper.rect(this.vDarkStripeWidth, 0, this.vLightStripeWidth, 1).attr(
        {fill : "lightblue"}
    );

    var tPat = this.paper.toPattern(0, 0, this.vDarkStripeWidth + this.vLightStripeWidth, 1);

    return tPat;
};

SPS.prototype.toString = function( ) {
    return "[ " + this.vDarkStripeWidth + " " + this.vLightStripeWidth + " ]";
};

SPS.patternDistance = function( iPattern1, iPattern2 ) {
    return 42;
};

SPS.mutateSPS = function( iOriginal, iMutationArray ) {
    var oSPS = new SPS();

    oSPS.vDarkStripeWidth = iOriginal.vDarkStripeWidth + TEEUtils.pickRandomItemFrom( iMutationArray );
    oSPS.vLightStripeWidth = iOriginal.vLightStripeWidth + TEEUtils.pickRandomItemFrom( iMutationArray );

    return oSPS;
};

SPS.randomSPS = function( iArray ) {
    var oSPS = new SPS();
    oSPS.vDarkStripeWidth = TEEUtils.pickRandomItemFrom( iArray );
    oSPS.vLightStripeWidth = TEEUtils.pickRandomItemFrom( iArray );

    return oSPS;

};

SPS.fromArray = function( iArray ) {
    var oSPS = new SPS();
    oSPS.vDarkStripeWidth = iArray[0];
    oSPS.vLightStripeWidth = iArray[1];

    return oSPS;
};