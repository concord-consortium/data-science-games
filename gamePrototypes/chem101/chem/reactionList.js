/**
 * Created by tim on 9/19/16.


 ==========================================================================
 reactionList.js in gamePrototypes.

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


Chemistry.reactionList = [
    {
        reactants: [
            {species: "NaCl", coefficient: 1}
        ],
        products: [
            {species: "Na+", coefficient: 1},
            {species: "Cl-", coefficient: 1}
        ],

        Ksp: 36
    },

    {
        reactants: [
            {species: "KI", coefficient: 1}
        ],
        products: [
            {species: "K+", coefficient: 1},
            {species: "I-", coefficient: 1}
        ],

        Ksp: 76.3
    },

    {
        reactants: [
            {species: "Pb_NO3_2", coefficient: 1}
        ],
        products: [
            {species: "Pb++", coefficient: 1},
            {species: "NO3-", coefficient: 2}
        ],

        Ksp: 23.78
    },

    {
        reactants: [
            {species: "PbCl2", coefficient: 1}
        ],
        products: [
            {species: "Pb++", coefficient: 1},
            {species: "Cl-", coefficient: 2}
        ],

        Ksp: 1.6e-5
    },

    {
        reactants: [
            {species: "PbI2", coefficient: 1}
        ],
        products: [
            {species: "Pb++", coefficient: 1},
            {species: "I-", coefficient: 2}
        ],

        Ksp: 4.41e-9
    }




]