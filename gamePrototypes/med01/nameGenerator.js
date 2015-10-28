var medNames;

medNames = {
    vowels: [],
    consonants : [],
    vlen: 0,
    clen : 0,
    base : 0,
    key : 0,

    maxval : 7127,      //  960119,    //  primes

    digraph : function( i ) {
        var lod = i % this.base; //  the low-order digit
        var consIndex = Math.floor(lod/this.vlen);
        var vowIndex = lod % this.vlen;
        return this.consonants[consIndex] + this.vowels[vowIndex]
    },

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

    newName : function( ) {
        this.key += 428629;
        this.key = this.key % this.maxval;
        
        var tName = this.textify( this.key );
        return tName.capitalize();
    },
    
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
