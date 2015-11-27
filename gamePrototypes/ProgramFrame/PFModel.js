
/**
 * Created by tim on 11/11/15.
 */


var PFModel = function() {
    this.myNode = null;
};

PFModel.prototype.addStatement = function( newModelForStatement, where ) {
    //  todo: implement where

    this.statements.push( newModelForStatement );
};

PFModel.prototype.toString = function() {
    var tText = "Frame program: ";

    if (this.myNode.firstChild) {
        tText += this.myNode.firstChild.model.toString();
    };

    if (this.myNode.next) {
        tText += this.myNode.text.model.toString();
    };

    return tText;
};

