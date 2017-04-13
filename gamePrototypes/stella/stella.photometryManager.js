/**
 * Created by tim on 4/12/17.


 ==========================================================================
 photometryManager.js in gamePrototypes.

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


stella.photometryManager = {

    photometryView: null,

    instrumentNoisePerSecond : 10,

    starCount: 0,
    skyCount: 0,

    expose: function (iTime) {

        //  todo: base this on telescope pointing, not on focusSystem. Or use focusSystem, tbd

        var tTargetName = "sky";

        if (stella.manager.focusSystem) {
            this.starCount = this.getTargetCount(stella.manager.focusSystem, iTime);
            tTargetName = stella.manager.focusSystem.id;
        } else {
            this.starCount = this.getSkyCount( iTime );
        }
        this.skyCount = this.getSkyCount( iTime );

        tChannels = [];
        tChannels.push(
            {
                target: tTargetName,
                exposure: iTime,
                obs: 'target',
                count: this.starCount
            }
        );
        tChannels.push(
            {
                target: tTargetName,
                exposure: iTime,
                obs: 'sky',
                count: this.skyCount
            }
        );
        this.savePhotometryToCODAP(tChannels);

    },

    getSkyCount: function ( iDwell ) {
        return  Math.round(Math.random() * this.instrumentNoisePerSecond * iDwell);
    },

    getTargetCount: function (iObject, iDwell) {
        var tLum = Math.pow(10, iObject.bright());  //  remember star.bright() is log apparent brightness

        return Math.round(tLum * iDwell + this.getSkyCount( iDwell ));
    },

    savePhotometryToCODAP: function (iChannels) {
        stella.connector.emitPhotometry(iChannels);
        stella.model.stellaElapse(stella.constants.timeRequired.savePhotometry);
    }
};