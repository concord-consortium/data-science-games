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


Chemistry.chemicals = {
    H20: {
        commonName: "water",
        density: 1,
        molWt: 18,
        charge: 0
    },
    NaCl: {
        chemicalName: "sodium chloride",
        commonName: "table salt",
        density: 2.165,
        molWt: 58.44,
        charge: 0
    },
    "Na+": {
        chemicalName: "sodium ion",
        molWt: 22.9898,
        charge: 1
    },
    "Cl-": {
        chemicalName: "chloride ion",
        molWt: 35.453,
        charge: -1
    },
    "H3O+": {
        chemicalName: "hydronium ion",
        molWt: 19,
        charge: 1
    },
    "OH-": {
        chemicalName: "hydroxyl ion",
        molWt: 17,
        charge: -1
    }
};
