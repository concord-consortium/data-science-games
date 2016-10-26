/**
 * Created by tim on 9/16/16.


 ==========================================================================
 Equipment.js in gamePrototypes.

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


DragConsequenceManager = function(  ) {
    this.containers = [];
    this.destinationDropZone = null;
    this.sourceDropZone = null;
};

DragConsequenceManager.prototype.handleMouseAction = function( iZone, iWhat )   {
    console.log("Processing mouse " + iWhat + " for zone " + iZone.domElement.id);

    //  iWhat is source or destination
    switch( iWhat ) {
        case "source":
            this.sourceDropZone = iZone;
            this.destinationDropZone = null;   //  new for draining
            break;

        case "destination":
            this.destinationDropZone = iZone;
            if (iZone === this.sourceDropZone) {
                this.sourceDropZone = null;         //  click in zone means fill from store
            }
            break;
    }

    chem101.manager.sourceChosen( ); //  todo: remove this violation in favor of perhaps events and notifications.
    chem101.manager.chemLabView.updateFlowIndicator();
};


DragConsequenceManager.prototype.contentsHTML = function( ) {
    var out = "";
    this.containers.forEach( function(ixCont) {
        out += "<p><strong>" + ixCont.label + "</strong></p>" + ixCont.contents.toString();
    });
    return out;
};

