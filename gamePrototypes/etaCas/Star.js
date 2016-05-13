/**
 * Created by tim on 5/7/16.


 ==========================================================================
 Star.js in data-science-games.

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
 * Model class for stars
 */

/*
Notes on eta Cas itself:
Double. We'll talk about the primary:
V = 3.44
U-B = 0.02
B-V = 0.58
distance = 5.95 (pc)

Now the copmpanion, Eta Cassiopeiae B
 Period (P)	480 yr
 Semi-major axis (a)	11.9939"
 Eccentricity (e)	0.497
 Inclination (i)	34.76°
 Longitude of the node (Ω)	98.42°
 Periastron epoch (T)	1889.6
 Argument of periastron (ω) 88.59°
 (secondary)
 */

/**
 * Constructor
 * @constructor
 */
var Star = function() {
    this.where = { x : 0, y : 0, z : 0 };               //  initially at the origin
    this.absoluteMagnitude = {U : 5, B : 5, V : 5};     //  in three color bands
    this.mass = 0.97 * etaCas.constants.solarMass;        //   mass of eta cas
}