/**
 * Created by tim on 3/23/16.


 ==========================================================================
 steb.manager.js in data-science-games.

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

steb.manager = {
    running : false,
    playing : false,
    previous : null,


    makeStebberView : function( iSteb ) {
        var tStebView = new StebberView( iSteb );
        steb.worldView.installStebberView( tStebView );
    },

    animate: function (timestamp) {
        if (!steb.manager.previous)  steb.manager.previous = timestamp;
        var tDt = (timestamp - steb.manager.previous) / 1000.0;
        steb.manager.previous = timestamp;
        steb.manager.update(tDt);
        if (steb.manager.running) window.requestAnimationFrame(steb.manager.animate);
    },

    update : function ( idt ) {
        steb.model.update( idt );
        steb.ui.fixUI();
    },

    pause : function() {
        this.running = false;
        steb.worldView.stopEverybody();
    },

    restart : function() {
        this.running = true;
        this.previous = null;
        steb.worldView.startEverybody();
        window.requestAnimationFrame(this.animate); //  START UP TIME
    },


    newGame : function() {
        this.time = 0;
        steb.worldView.flush();
        steb.model.newGame();

        this.playing = true;
        steb.connector.newGameCase( );
        this.restart();
    },

    endGame : function( iReason ) {
        steb.worldView.stopEverybody();
        this.playing = false;
        this.running = false;
        steb.connector.finishGameCase( iReason );
    },

    stebDoCommand : function() {

    }
}