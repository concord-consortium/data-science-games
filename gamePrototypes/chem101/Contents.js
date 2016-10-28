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

    this.massH2O = 0;      //   we'll start with emptiness, and only aqueous stuff

    this.solutes = {};      //  each property's key is the species (string) and the value is the number of MOLES,
                            //  as in { "Na+" : .01 , "SO4--" : .005 }
    this.swirlies = {};
    this.solids = {}; //  same
    this.opaqueFluids = false;
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
    if (this.solutes["H3O+"] > 0) {
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

    this.massH2O += iAdditionalContents.massH2O;

    //  solutes

    for (var additionalSolute in iAdditionalContents.solutes) {
        if (!iAdditionalContents.solutes.hasOwnProperty(additionalSolute)) continue;
        this.addMolesOfSolute(additionalSolute, iAdditionalContents.solutes[additionalSolute]);
    }

    //  swirlies

    for (var additionalSwirly in iAdditionalContents.swirlies) {
        if (!iAdditionalContents.swirlies.hasOwnProperty(additionalSwirly)) continue;
        this.addMolesOfSwirly(additionalSwirly, iAdditionalContents.swirlies[additionalSwirly]);
    }

    //  solids

    for (var additionalSolid in iAdditionalContents.solids) {
        if (iAdditionalContents.solids.hasOwnProperty(additionalSolid)) {
            this.addMolesOfSolid(additionalSolid, iAdditionalContents.solids[additionalSolid]);
        } else {    //  we are adding wholly new solid

        }
    }

    //  this.update(this.myContainerName);
};

/**
 *
 * @param iWhat     the string representing the sqecies being added (see chemicals.js)
 * @param iAmount    in liters for liquids (e.g., 0.025) but in grams for solids, so we will convert
 */
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

        //  indicators
        case "Hin":
            tContents.addWater( iAmount);   //  todo: note that Hin is typicallty in ethanol, not water.
            var tMoles = 0.0314 * iAmount;  //  molarity for 1% in water.
            tContents.addMolesOfSolute("Hin", tMoles);
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
    this.massH2O += iAmount * 1000;     //  iAmount is in liters. mass is in grams
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
Contents.prototype.addMolesOfSwirly = function (iSpecies, iMoles) {

    if (this.swirlies.hasOwnProperty(iSpecies)) {
        this.swirlies[iSpecies] += iMoles;
    } else {
        this.swirlies[iSpecies] = iMoles;
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
        tRemoved.massH2O = this.massH2O * tFraction;
        this.massH2O -= tRemoved.massH2O;

        for (species in this.solutes) {
            if (!this.solutes.hasOwnProperty(species)) continue;
            var tMoles = this.solutes[species] * tFraction;
            tRemoved.addMolesOfSolute(species, tMoles);
            this.solutes[species] -= tMoles;
        }

        for (species in this.swirlies) {
            if (!this.swirlies.hasOwnProperty(species)) continue;
            var tMoles = this.swirlies[species] * tFraction;
            tRemoved.addMolesOfSwirly(species, tMoles);
            this.swirlies[species] -= tMoles;
        }
    }

    return tRemoved;
};

Contents.prototype.fluidVolume = function () {
    return this.massH2O / 1000;   //   In LITERS. for now, just use the water. No volume change due to solutes.
};

Contents.prototype.solidMass = function() {
    var oMass = 0;

    for (species in this.solids) {
        var tMoles = this.solids[ species];
        var tMolWt = Chemistry.chemicals[species].molWt;
        oMass += tMoles * tMolWt;
    }

    return oMass;
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
    var tColor = "#fff";

    for (var species in this.solids) {
        if (this.solids.hasOwnProperty(species) && this.solids[species] > 0) {
            if (Chemistry.chemicals[species].color() !== "white") {
                tColor = Chemistry.chemicals[species].color();
            }
        }
    }
    return tColor;
};

Contents.prototype.fluidColor = function () {
    var oColor = Chemistry.clearColor;
    var totalAswirl = 0;

    for (aSwirl in this.swirlies) {
        if (this.swirlies[aSwirl] > 0) {    //  there is stuff swirling around
            totalAswirl += this.swirlies[aSwirl];
            oColor = Chemistry.chemicals[aSwirl].color();
        }
    }
    this.opaqueFluids = (totalAswirl > 0);  //  can't see through a precipitate cloud

    //  check for indicator
    if (!this.opaqueFluids) {
        if (this.solutes["Hin"]) {
            oColor = Chemistry.chemicals["Hin"].color(this.pH());
        }
    }
    return oColor;
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
    var o = "";
    var tMoles, species;
    o += Contents.smartNumberString(this.massH2O) + " g H2O ( " + this.fluidVolume().toFixed(4) + " L) ";
    if (this.pH()) {
        o += "pH : " + this.pH().toFixed(2);
    }

    o += "<br><b>aqueous: </b>";

    if (Object.keys(this.solutes).length === 0) {
        o += "none.";
    } else {
        for (species in this.solutes) {     //  species is a string rep of the name of the solute
            if (!this.solutes.hasOwnProperty(species)) continue;
            tMoles = this.solutes[species];
            var tMolarity = this.molarityOfSolute( species );
            o += "<br>&nbsp;&nbsp;" + Contents.smartNumberString(tMoles) +
                " moles " + Chemistry.chemicals[species].html +
                " ( [" + Chemistry.chemicals[species].html + "] = " +
                Contents.smartNumberString(tMolarity) + " )";
        }
    }
    o += "<br><b>aswirl: </b>";

    if (Object.keys(this.swirlies).length === 0) {
        o += "none.";
    } else {
        for (species in this.swirlies) {
            if (!this.swirlies.hasOwnProperty(species)) continue;
            tMoles = this.swirlies[species];
            var tGrams = tMoles * Chemistry.chemicals[species].molWt;
            o += "<br>&nbsp;&nbsp;" + Contents.smartNumberString(tMoles) +
                " moles " + Chemistry.chemicals[species].html +
                " ( " + Contents.smartNumberString(tGrams) + "g )";
        }
    }

    o += "<br><b>solids: </b>";

    if (Object.keys(this.solids).length === 0) {
        o += "none.";
    } else {
        for (species in this.solids) {
            if (!this.solids.hasOwnProperty(species)) continue;
            tMoles = this.solids[species];
            var tGrams = tMoles * Chemistry.chemicals[species].molWt;
            o += "<br>&nbsp;&nbsp;" + Contents.smartNumberString(tMoles) +
                " moles " + Chemistry.chemicals[species].html +
                " ( " + Contents.smartNumberString(tGrams) + "g )";
        }
    }

    return o;
};

Contents.prototype.shortString = function () {
    var tMoles, species;
    var oArray = [];
    oArray.push(this.massH2O.toFixed(0) + " g H2O");

    if (Object.keys(this.solutes).length > 0) {
        oArray.push("AQ");
        for (species in this.solutes) {
            if (!this.solutes.hasOwnProperty(species)) continue;
            tMoles = this.solutes[species];
            if (tMoles > 0) {
                oArray.push(Contents.smartNumberString(tMoles) + " moles " + species);
            }
        }
    }

    if (Object.keys(this.swirlies).length > 0) {
        oArray.push("PP");
        for (species in this.solswirliesids) {
            if (!this.swirlies.hasOwnProperty(species)) continue;
            tMoles = this.swirlies[species];
            if (tMoles > 0) {
                oArray.push(Contents.smartNumberString(tMoles) + " moles " + species);
            }
        }
    }

    if (Object.keys(this.solids).length > 0) {
        oArray.push("SD");
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
