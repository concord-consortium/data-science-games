/**
 * Created by tim on 2/27/17.


 ==========================================================================
 koala.js in gamePrototypes.

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
 * The root vegetable for the koala_clinic app
 *
 * @type {{}}
 */
var koala = {

    state : {},

    constants : {
        kVersion : "000",
        kName : "koala",
        kDimensions : {width: 444, height: 200}
    },

    setUp : function() {
        var tPluginConfiguration = {
            name: koala.constants.kName,
            title: koala.constants.kName,
            version: koala.constants.kVersion,
            dimensions: koala.constants.kDimensions
        };
        codapInterface.init(tPluginConfiguration, null).then( function() {
            koala.state = codapInterface.getInteractiveState();

            if (!koala.state.score) {
                koala.state.score = 42;
            }
        });
    }
};