/**
 * Created by tim on 11/11/15.
 */


var PSView = function( parent ) {
    this.myNode = null;
    this.theEnclosingSnap = null;
    this.statementBackgroundSnap = null;
    this.dragPadSnap = null;
    this.deleteRectangleSnap = null;
    this.dragPadBackground = null;
};

PSView.prototype.initialize = function ( node ) {

    this.myNode = node;

    var tFullWidth = this.myNode.parent.view.theEnclosingSnap.attr("width");
    var tFullHeight = PFConstants.statementFullHeight;

    this.theEnclosingSnap = Snap( tFullWidth, tFullHeight );

    this.statementBackgroundSnap = this.theEnclosingSnap.rect(
        PFConstants.statementLRMargin,
        PFConstants.statementVPadding,
        tFullWidth - 2 * PFConstants.statementLRMargin,
        tFullHeight - 2 * PFConstants.statementVPadding
    );

    this.dragPadSnap = Snap(
        PFConstants.statementLRMargin + PFConstants.statementDragPadWidth,
        tFullHeight - 2 * PFConstants.statementVPadding
    );
    this.dragPadBackground = this.dragPadSnap.rect(
        PFConstants.statementLRMargin,
        PFConstants.statementVPadding,
        PFConstants.statementLRMargin + PFConstants.statementDragPadWidth,
        tFullHeight - 2 * PFConstants.statementVPadding
    );
    this.theEnclosingSnap.append(this.dragPadSnap);

    this.deleteRectangleSnap = this.theEnclosingSnap.rect(
        tFullWidth - PFConstants.deleteRectSize - PFConstants.statementLRMargin,
        PFConstants.statementVPadding,
        PFConstants.deleteRectSize,
        PFConstants.deleteRectSize
    );

    this.selectionSnap = this.theEnclosingSnap.rect(
        PFConstants.statementLRMargin,
        PFConstants.statementVPadding,
        tFullWidth - 2 * PFConstants.statementLRMargin,
        tFullHeight - 2 * PFConstants.statementVPadding
    );

    //  adjust attributes of parts of the (empty) statement

    this.statementBackgroundSnap.attr({
        fill: PFConstants.statementColor
    });

    this.dragPadBackground.attr({
        fill : PFConstants.statementDragPadColor
    });

    this.deleteRectangleSnap.attr({
        fill : "red"
    });

    this.selectionSnap.attr({
        fill : "transparent",
        strokeWidth : 2,
        stroke: "transparent"
    });

    //  Events

    this.theEnclosingSnap.click(
        function() {
            console.log("Click in statement's enclosing Snap");
            thePFManager.selectNode( this.myNode );
        }.bind(this)
    );

    this.deleteRectangleSnap.click(
        function() {
            console.log("Click in delete box");
        }.bind(this)
    );

    this.dragPadSnap.click(
        function(){
            this.doDrag;
            this.attr({fill: "red"});
        }.bind(this)
    );

    //  finaly, append this thing we built to its parent.

    this.myNode.parent.view.theEnclosingSnap.append( this.theEnclosingSnap );


};

PSView.prototype.doDrag = function() {
    console.log("Drag the PSView");
};

PSView.prototype.showSelected = function() {
    this.selectionSnap.attr(
        {
            stroke : this.myNode.selected ? PFConstants.selectedStrokeColor : "transparent"
        }
    )
};