/**
 * Created by tim on 12/19/16.


 ==========================================================================
 AttributeProperties.js in gamePrototypes.

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


/**     ------------------------------------------------------
 * AttributeProperties
 * Holds relevant properties for a single attribute,
 * so we can use it in the tree.
 *
 * @param iName     name of the attribute
 * @constructor
 */
AttributeProperties = function(iName) {
    this.attributeName = iName;
    this.categories = [];               //  array of categories
    this.minimum = Number.MAX_VALUE;    //  true at the beginning!
    this.maximum = Number.MIN_VALUE;

    this.attributeColor = "gray";       //  you can set the color for its representation
    this.oneLabel = "yes";
    this.zeroLabel = "no";
    this.oneBoolean = "true";
    this.isCategorical = true;
    this.caseCount = 0;
    this.numericCount = 0;
};

AttributeProperties.prototype.setLabels = function( iZero, iOne )  {
    if (iZero) {
        this.zeroLabel = iZero;
    }

    if (iOne) {
        this.oneLabel = iOne;
    }
};

AttributeProperties.prototype.setCutPoint = function( iValue, iOperator ) {
    this.oneBoolean = iOperator + " " + iValue;
    console.log("Set Boolean: " + this.attributeName + " " + this.oneBoolean );
};

AttributeProperties.prototype.classify = function( iValue ) {
    var tOne = eval( iValue + this.oneBoolean);
    var tLabel = tOne ? this.oneLabel : this.zeroLabel;
    return {
        isOne : tOne,
        label : tLabel
    };
};

AttributeProperties.prototype.considerValue = function( iValue ) {
    this.caseCount += 1;
    if (jQuery.isNumeric(iValue))   {
        this.numericCount += 1;
    }

    if (this.categories.indexOf(iValue) < 0) {
        this.categories.push( iValue );
    }
};


