/**
 * Created by tim on 12/23/16.


 ==========================================================================
 Assignment.js in gamePrototypes.

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
 * This is an attribute value assignment.
 * An "AttInBaum" will have an array of these.
 *
 * This contains information you need to assign any case to one of two classes,
 * and label it properly.
 *
 * There is one of these at each "full" Node.
 *
 * @param iAttribute    what attribute we're working with
 * @param iCases    the cases from this Node
 * @constructor
 */

ValueAssignment = function( iAttribute, iCases ) {

    this.posLabel = "yes";
    this.negLabel = "no";
    this.theBoolean = "true";
};

ValueAssignment.prototype.setLabels = function(iNegLabel, iPosLabel)  {
    if (iNegLabel) {
        this.negLabel = iNegLabel;
    }

    if (iPosLabel) {
        this.posLabel = iPosLabel;
    }
};

ValueAssignment.prototype.classify = function( iNodeBoolean ) {
    var tPosP = eval( iNodeBoolean + " && " + this.theBoolean);
    var tLabel = tPosP ? this.posLabel : this.negLabel;
    return {
        isPos : tPosP,
        label : tLabel
    };
};
