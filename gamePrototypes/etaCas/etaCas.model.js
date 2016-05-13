
/**
 * Created by tim on 5/7/16.


 ==========================================================================
 etaCas.model.js in data-science-games.

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


etaCas.model = {

    stars : [],
    now : null,
    epoch : null,

    newGame : function() {
        this.makeStars();
        this.now = new Date(2100, 0);   //  Jan 1 2100
        this.epoch = new Date(2100, 0);   //  Jan 1 2100
    },

    makeStars : function() {
        for (var i = 0; i < etaCas.constants.nStars; i++) {
            var tS = new Star();
            this.stars.push( tS );
        }
    },

    foo : null
}