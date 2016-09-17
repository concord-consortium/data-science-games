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


Equipment = function( iManager, iViewDOMString ) {
    this.containers = [];
    this.destinationContainerView = null;
    this.sourceContainerView = null;
    this.theView = new ChemLabSetupView( iViewDOMString, this );

    this.myManager = iManager;
};

Equipment.prototype.addBeaker = function( iLabel, iXPos ) {
    var nBeaker = new Beaker( );
    nBeaker.label = iLabel;
    nBeaker.equipment = this;

    nBeaker.eventDispatcher.addEventListener(
        "contentsChanged", this.myManager.updateUI, this.myManager
    );
    var tBeakerView = new BeakerView( nBeaker );
    this.theView.addEquipmentView( tBeakerView, iXPos, 20 );

    this.containers.push( nBeaker );

};

Equipment.prototype.alterFlow = function( iWhichEnd, iWhat ) {
    switch( iWhichEnd ) {
        case "source":
            this.sourceContainerView = iWhat;
            break;

        case "destination":
            this.destinationContainerView = iWhat;
            this.theView.updateFlowIndicator(this.sourceContainerView || this.destinationContainerView, this.destinationContainerView);

            //  we have to change the (temporary?) button text to reflect transfer versus add
            chem101.manager.sourceChosen( ); //  todo: remove this violation in favor of perhaps events and notifications.
            break;
    }
};

Equipment.prototype.contentsHTML = function( ) {
    var out = "";
    this.containers.forEach( function(iCont) {
        out += "<p><strong>" + iCont.label + "</strong></p>" + iCont.contents.toString();
    });
    return out;
};