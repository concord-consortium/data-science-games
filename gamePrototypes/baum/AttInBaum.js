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
 * AttInBaum
 * Holds relevant properties for a single attribute,
 * so we can use it in the tree.
 * There is one of these for each attribute, and the array of these
 * lives in the global baum.
 *
 * @param iName     name of the attribute
 * @constructor
 */
AttInBaum = function(iName) {
    this.attributeName = iName;
    this.attributeColor = "gray";       //  you can set the color for its representation

    this.valueAssignments = [];         //  the way(s) this attribute can be recoded as binary

    this.isCategorical = true;

    //  if it's categorical....
    this.categories = [];               //  array of categories

    //  if it's numerical....
    this.minimum = Number.MAX_VALUE;    //  true at the beginning!
    this.maximum = -Number.MAX_VALUE;

    this.oneBoolean = "true";

    this.caseCount = 0;
    this.numericCount = 0;
};


AttInBaum.prototype.setCutPoint = function(iValue, iOperator ) {
    this.oneBoolean = iOperator + " " + iValue;
    console.log("Set Boolean: " + this.attributeName + " " + this.oneBoolean );
};


/**
 * Called by baum.assembleAttributeAndCategoryNames()
 * @param iValue    A value for this particular atttribute (identified by name)
 */
AttInBaum.prototype.considerValue = function( iValue ) {
    this.caseCount += 1;
    if (jQuery.isNumeric(iValue))   {
        this.numericCount += 1;
    }

    if (this.categories.indexOf(iValue) < 0) {
        this.categories.push( iValue );
    }
};


