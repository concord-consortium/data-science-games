/*
 ==========================================================================
 nameGenerator.js

 A class that generates names for DSG.

 Author:   Tim Erickson

 Copyright (c) 2015 by The Concord Consortium, Inc. All rights reserved.

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
var medNames;

/**
 * This is a singleton object.
 * Call medNames.initialize() to set up its arrays
 * the medNames.newName() returns a new (kinda unique) name
 * @type {{vowels: Array, consonants: Array, vlen: number, clen: number, base: number, key: number, maxval: number, digraph: medNames.digraph, textify: medNames.textify, newName: medNames.newName, initialize: medNames.initialize}}
 */
medNames = {
    vowels: [],
    consonants : [],
    vlen: 0,
    clen : 0,
    base : 0,
    key : 0,

    maxval : 7127,      //  960119,    //  primes

    /**
     * Provides digraphs, basically two-digit numbers in the base medNames.base.
     * Each digit is a phoneme: the first is a consonant, the second a vowel.
     * @param i
     * @returns {*}
     */
    digraph : function( i ) {
        var lod = i % this.base; //  the low-order digit
        var consIndex = Math.floor(lod/this.vlen);
        var vowIndex = lod % this.vlen;
        return this.consonants[consIndex] + this.vowels[vowIndex]
    },

    /**
     * Converts the input number to a string by generating a sequence of digraphs
     * @param number
     * @returns {string}
     */
    textify : function ( number ) {
        var tText = ""

        do {
            var tail = number % this.base;
            number -= tail;
            number /= this.base;
            tText += this.digraph(tail);
        } while (number != 0);

        return tText;
    },

    /**
     * Call to generate a new name.
     * Really we generate a not-very-pseudo-random integer
     * and ask textify() to convert it to text
     */
    newName : function( ) {
        this.key += 428629;
        this.key = this.key % this.maxval;
        
        var tName = this.textify( this.key );
        return tName.capitalize();
    },

    /**
     * call this to initialize the name generator
     */
    initialize : function() {
        this.vowels = ['a','e','i','o','u',"an",'es','ay','um','ai','au'];
        this.consonants = ['b','p','t','d','g', 'z', 's', 'th', 'ch', 'r','l', 'v', 'f','n','m'];
        this.vlen = this.vowels.length;
        this.clen = this.consonants.length;
        this.base = this.vlen * this.clen;
        this.key = Math.floor( this.maxval * Math.random());
    }
};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
