/**
 * Created by tim on 5/17/16.


 ==========================================================================
 colorPlay.js in data-science-games.

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


var colorPlay;

colorPlay = {
    initialize : function() {
        colorPlay.model.initialize();
        colorPlay.ui.initialize();
        colorPlay.ui.update();
    },

    constants : {
        version : "001a"
    }
}