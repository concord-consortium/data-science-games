/**
 * Created by tim on 9/11/16.


 ==========================================================================
 Contents.js in gamePrototypes.

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
 * The contents of some equipmentViews
 * @constructor
 */
Contents = function() {

    this.massH20 = 0;      //   we'll start with emptiness, and only aqueous stuff

    this.solutes = {};      //  each property's key is the species (string) and the value is the number of MOLES,
                            //  as in { "Na+" : .01 , "SO4--" : .005 }
    this.precipitates = {}; //  same
};

Contents.prototype.update = function( iMessage ) {
    console.log("Updating contents: " + iMessage);
    Chemistry.updateContents( this );
};


Contents.prototype.addAdditionalContents = function( iAdditionalContents ) {
    this.massH20 += iAdditionalContents.massH20;

    //  solutes

    for (var additionalSolute in iAdditionalContents.solutes) {
        this.addMolesOfSolute( iAdditionalContents.solutes[additionalSolute], additionalSolute);
    }

    //  solids

    for (var additionalSolid in iAdditionalContents.precipitates) {
        this.addMolesOfSolid( iAdditionalContents.precipitates[additionalSolid], additionalSolid);
    }

    this.update("addAdditionalContents " + iAdditionalContents.toString());
};

Contents.prototype.addWater = function( iAmount ) {
    this.massH20 += iAmount;
};

Contents.prototype.addGramsOfSolid = function( iGrams, iSpecies) {

    var tMoles = iGrams / Chemistry.chemicals[ iSpecies].molWt;
    this.addMolesOfSolid( tMoles, iSpecies );
};

Contents.prototype.addMolesOfSolid = function(iMoles, iSpecies ) {

    if (this.precipitates.hasOwnProperty(iSpecies)) {
        this.precipitates[iSpecies] += iMoles;
    } else {
        this.precipitates[iSpecies] = iMoles;
    }
};

Contents.prototype.addMolesOfSolute = function(iMoles, iSpecies ) {

    if (this.solutes.hasOwnProperty(iSpecies)) {
        this.solutes[iSpecies] += iMoles;
    } else {
        this.solutes[iSpecies] = iMoles;
    }
};

Contents.prototype.fluidVolume = function() {
    return this.massH20;   //   for now, just use the water. No expansion due to solutes.
};

Contents.prototype.precipitateInfo = function() {
    var tVol = 0;
    var tMass = 0;

    for (var species in this.precipitates) {
        var pMass = this.precipitates[species] * Chemistry.chemicals[species].molWt;    //  in grams
        var pVol = pMass / (Chemistry.chemicals[species].density || 2);     //  use density of 2 if there is no density
        tMass += pMass;
        tVol += pVol;
    }

    return {mass : tMass, volume : tVol};
};

Contents.prototype.solidColor = function() {
    return "white";
};

Contents.prototype.fluidColor = function() {
    return "dodgerblue";
};

Contents.prototype.toString = function() {
    var o = "Contents: ";
    o += this.massH20.toFixed(4) + " g H2O";
    if (Object.keys(this.solutes).length > 0) {
        for (var species in this.solutes) {
            var tMoles = this.solutes[species];
            var tMolarity = tMoles / (this.massH20 / 1000);
            o += "<br>" + tMoles.toFixed(4) + " moles " + species +
                " ( " + tMolarity.toFixed(4) + "M )";
        }
    }

    o += "<br>solids: ";

    if (Object.keys(this.precipitates).length === 0) {
        o += "none.";
    } else {
        for (var species in this.precipitates) {
            var tMoles = this.precipitates[species];
            var tGrams = tMoles * Chemistry.chemicals[species].molWt;
            o += "<br>" + tMoles.toFixed(4) + " moles " + species +
                " ( " + tGrams.toFixed(4) + "g )";
        }
    }
    return o;
};
