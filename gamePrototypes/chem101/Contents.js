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
Contents = function () {

    this.massH20 = 0;      //   we'll start with emptiness, and only aqueous stuff

    this.solutes = {};      //  each property's key is the species (string) and the value is the number of MOLES,
                            //  as in { "Na+" : .01 , "SO4--" : .005 }
    this.solids = {}; //  same
    this.myContainer = null;
    this.myContainerName = "<temp>";
};

Contents.prototype.setMyContainer = function( iContainer ) {
    this.myContainer = iContainer;
    this.myContainerName = this.myContainer.label;
};

Contents.prototype.molarityOfSolute = function( iWhat ) {
    return this.solutes[iWhat] / (this.fluidVolume());   //  convert from mL to liters for molarity
};

Contents.prototype.pH = function() {
    if (this.solutes["H3O+"]) {
        return -Math.log10( this.molarityOfSolute("H3O+"));
    }
    return null;
};

Contents.prototype.update = function (iMessage) {
    console.log("    Updating contents: " + iMessage);
    Chemistry.updateContents(this);
};


Contents.prototype.addAdditionalContents = function (iAdditionalContents) {
    console.log("    Combine! Add " + iAdditionalContents.shortString() + " to " + this.myContainerName + ": " + this.shortString());

    this.massH20 += iAdditionalContents.massH20;

    //  solutes

    for (var additionalSolute in iAdditionalContents.solutes) {
        if (!iAdditionalContents.solutes.hasOwnProperty(additionalSolute)) continue;
        this.addMolesOfSolute(additionalSolute, iAdditionalContents.solutes[additionalSolute]);
    }

    //  solids

    for (var additionalSolid in iAdditionalContents.solids) {
        if (!iAdditionalContents.solids.hasOwnProperty(additionalSolid)) continue;
        this.addMolesOfSolid(additionalSolid, iAdditionalContents.solids[additionalSolid]);
    }

    //  this.update(this.myContainerName);
};


Contents.prototype.addSubstance = function (iWhat, iAmount) {  //  todo: make this less specific
    var tContents = new Contents();

    if (false || Chemistry.chemicals[iWhat].type === "solid") {
        iAmount *= 1000;        //      for non-solids, we're in liters. For solids, we're in grams.
    }

    switch (iWhat) {
        case "H2O":
            tContents.addWater(iAmount);
            break;
        case "HCl_":
            tContents.addWater(iAmount);
            var tMoles = 1.0 * iAmount;     //  one-molar todo: this is temporary, I hope!
            tContents.addMolesOfSolute("Cl-", tMoles);
            tContents.addMolesOfSolute("H3O+", tMoles);
            break;
        case "NaOH_":
            tContents.addWater(iAmount);
            var tMoles = 1.0 * iAmount;     //  one-molar
            tContents.addMolesOfSolute("Na+", tMoles);
            tContents.addMolesOfSolute("OH-", tMoles);
            break;

        //  salts

        case "NaCl":
            tContents.addGramsOfSolid("NaCl", iAmount);
            break;
        case "KI":
            tContents.addGramsOfSolid("KI", iAmount);
            break;
        case "Pb_NO3_2":
            tContents.addGramsOfSolid("Pb_NO3_2", iAmount);
            break;
        case "PbCl2":
            tContents.addGramsOfSolid("PbCl2", iAmount);
            break;
    }

    console.log("---------------------------------- ");
    console.log("  Add substance to " + this.myContainerName + ": " + iAmount + " of " + iWhat + ", which is " + tContents.shortString());
    this.addAdditionalContents(tContents);
};

//  "primitive" methods to alter this Contents

Contents.prototype.addWater = function (iAmount) {
    this.massH20 += iAmount * 1000;     //  iAmount is in liters. mass is in grams
    this.addMolesOfSolute("H3O+", this.fluidVolume() * Math.sqrt(Chemistry.Kw));
    this.addMolesOfSolute("OH-", this.fluidVolume() * Math.sqrt(Chemistry.Kw) );
};

Contents.prototype.addGramsOfSolid = function (iSpecies, iGrams) {
    var tMoles = iGrams / Chemistry.chemicals[iSpecies].molWt;
    this.addMolesOfSolid(iSpecies, tMoles);
};

Contents.prototype.addMolesOfSolid = function (iSpecies, iMoles) {

    if (this.solids.hasOwnProperty(iSpecies)) {
        this.solids[iSpecies] += iMoles;
    } else {
        this.solids[iSpecies] = iMoles;
    }
};

Contents.prototype.addMolesOfSolute = function (iSpecies, iMoles) {

    if (this.solutes.hasOwnProperty(iSpecies)) {
        this.solutes[iSpecies] += iMoles;
    } else {
        this.solutes[iSpecies] = iMoles;
    }
};

//  end of primitives


Contents.prototype.removeSolutionFromContainer = function (iAmount) {
    var tRemoved = new Contents();
    var species;

    if (this.fluidVolume() < iAmount) {
        iAmount = this.fluidVolume();       //  limited!
    }

    if (iAmount > 0) {

        var tFraction = iAmount / this.fluidVolume();
        tRemoved.massH20 = this.massH20 * tFraction;
        this.massH20 -= tRemoved.massH20;

        for (species in this.solutes) {
            if (!this.solutes.hasOwnProperty(species)) continue;
            var tMoles = this.solutes[species] * tFraction;
            tRemoved.addMolesOfSolute(species, tMoles);
            this.solutes[species] -= tMoles;
        }
    }

    return tRemoved;
};

Contents.prototype.fluidVolume = function () {
    return this.massH20 / 1000;   //   In LITERS. for now, just use the water. No expansion due to solutes.
};

Contents.prototype.precipitateInfo = function () {
    var tVol = 0;
    var tMass = 0;

    for (var species in this.solids) {
        if (!this.solids.hasOwnProperty(species)) continue;
        var pMass = this.solids[species] * Chemistry.chemicals[species].molWt;    //  in grams
        var pVol = pMass / (Chemistry.chemicals[species].density || 2);     //  use density of 2 if there is no density
        tMass += pMass;
        tVol += pVol;
    }

    return {mass: tMass, volume: tVol};
};

Contents.prototype.solidColor = function () {
    return "white";
};

Contents.prototype.fluidColor = function () {
    return "dodgerblue";
};

Contents.smartNumberString = function( iVal ) {
    var tString = "N";

    if (Math.abs(iVal) > 0.001) {
        tString = iVal.toFixed(4);
    } else {
        tString = iVal.toExponential(2);
    }

    return tString;
};

Contents.prototype.toString = function () {
    var o = "Contents: ";
    var tMoles, species;
    o += Contents.smartNumberString(this.massH20) + " g H2O ( " + this.fluidVolume() + " L) ";
    if (this.pH()) {
        o += "pH : " + this.pH().toFixed(2);
    }

    if (Object.keys(this.solutes).length > 0) {
        for (species in this.solutes) {
            if (!this.solutes.hasOwnProperty(species)) continue;
            tMoles = this.solutes[species];
            var tMolarity = this.molarityOfSolute( species );
            o += "<br>&nbsp;&nbsp;" + Contents.smartNumberString(tMoles) + " moles " + species +
                " ( [" + species + "] = " + Contents.smartNumberString(tMolarity) + " )";
        }
    }

    o += "<br>solids: ";

    if (Object.keys(this.solids).length === 0) {
        o += "none.";
    } else {
        for (species in this.solids) {
            if (!this.solids.hasOwnProperty(species)) continue;
            tMoles = this.solids[species];
            var tGrams = tMoles * Chemistry.chemicals[species].molWt;
            o += "<br>&nbsp;&nbsp;" + Contents.smartNumberString(tMoles) + " moles " + species +
                " ( " + Contents.smartNumberString(tGrams) + "g )";
        }
    }
    return o;
};

Contents.prototype.shortString = function () {
    var tMoles, species;
    var oArray = [];
    oArray.push(this.massH20.toFixed(0) + " g H2O");

    if (Object.keys(this.solutes).length > 0) {
        for (species in this.solutes) {
            if (!this.solutes.hasOwnProperty(species)) continue;
            tMoles = this.solutes[species];
            if (tMoles > 0) {
                oArray.push(Contents.smartNumberString(tMoles) + " moles " + species);
            }
        }
    }

    if (Object.keys(this.solids).length === 0) {

    } else {
        for (species in this.solids) {
            if (!this.solids.hasOwnProperty(species)) continue;
            tMoles = this.solids[species];
            if (tMoles > 0) {
                oArray.push(Contents.smartNumberString(tMoles) + " moles " + species);
            }
        }
    }
    return "{ " + oArray.join(" | ") + " }";
};
