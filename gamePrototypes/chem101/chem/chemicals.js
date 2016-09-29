/**
 * Created by tim on 9/13/16.


 ==========================================================================
 chemicals.js in gamePrototypes.

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

/*
To add a new chemical:
put aqueous solutions, solids, and ions here.
put reactions into reactionList.js.
Add any things you want to the main menu is chem101.html

IMPORTANT: add whatever can in fact be added into Contents.js, the sneaky model file
 */

Chemistry.chemicals = {
    H2O: {
        commonName: "water",
        type: "liquid",
        density: 1,
        molWt: 18,
        charge: 0
    },
    HCl_: {
        commonName: "1M hydrochloric acid",
        type: "prepared",        //      at room temperature
    },
    NaOH_: {
        commonName: "1M sodium hydroxide",
        type: "prepared",
    },
    NaCl: {
        chemicalName: "sodium chloride",
        commonName: "table salt",
        color : "white",
        type : "solid",
        density: 2.165,
        molWt: 58.44,
        charge: 0
    },
    KI : {
        chemicalName: "potassium iodide",
        color : "white",
        type : "solid",
        density: 3.123,
        molWt: 166.0028,
        charge: 0
    },
    Pb_NO3_2: {
        chemicalName: "lead nitrate",
        type : "solid",
        color : "white",
        density: 4.53,
        molWt: 331.2,
        charge: 0
    },
    PbCl2: {
        chemicalName: "lead chloride",
        type : "solid",
        color : "white",
        density: 5.85,
        molWt: 278.1,
        charge: 0
    },
    PbI2: {
        chemicalName: "lead iodide",
        type : "solid",
        color : "yellow",
        density: 6.16,
        molWt: 461.01,
        charge: 0
    },
    "Na+": {
        chemicalName: "sodium ion",
        type : "aqueous",
        molWt: 22.9898,
        charge: 1
    },
    "K+": {
        chemicalName: "potassium ion",
        type : "aqueous",
        molWt: 39.0983,
        charge: 1
    },
    "Cl-": {
        chemicalName: "chloride ion",
        type : "aqueous",
        molWt: 35.453,
        charge: -1
    },
    "I-": {
        chemicalName: "iodide ion",
        type : "aqueous",
        molWt: 126.90447,
        charge: -1
    },
    "Pb++": {
        chemicalName: "lead ion",
        type : "aqueous",
        molWt: 207,
        charge: 1
    },
    "NO3-": {
        chemicalName: "nitrate ion",
        type : "aqueous",
        molWt: 62,
        charge: -1
    },
    "H3O+": {
        chemicalName: "hydronium ion",
        type : "aqueous",
        molWt: 19,
        charge: 1
    },
    "OH-": {
        chemicalName: "hydroxyl ion",
        type : "aqueous",
        molWt: 17,
        charge: -1
    }
};
