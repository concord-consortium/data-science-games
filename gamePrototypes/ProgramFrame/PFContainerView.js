/**
 * Created by tim on 11/11/15.
 */


var PFContainerView = function(frameID ) {
    var tIDstring = "#"+frameID;
    this.theEnclosingSnap = Snap(tIDstring);
    this.theEnclosingSnap.click(
        this.doPFClick
    );

    this.myNode = null;

    var tControlHeight = PFConstants.containerVStart - PFConstants.statementVPadding;
    this.controlBarRect = this.theEnclosingSnap.rect(
        0,0,
        this.theEnclosingSnap.attr("width"),
        tControlHeight
    );
    this.addButtonText = this.theEnclosingSnap.text(20,PFConstants.containerVText,"add");
    this.expandButtonText = this.theEnclosingSnap.text(120,PFConstants.containerVText,"collapse");

    this.controlBarRect.attr({fill : "lightgray"});

    this.addButtonText.click(
        function() {
            console.log("click add in control bar");
            thePFManager.addEmptyStatement();
            this.myNode.collapsed = false;
        }.bind(this)
    );


    this.expandButtonText.click(
        function() {
            thePFManager.expandCollapse(this.myNode);
        }.bind(this)
    );
};

PFContainerView.prototype.redraw = function() {
    this.expandButtonText.attr( "text", this.myNode.collapsed ? "expand" : "collapse");
    this.arrangeContents();
};

PFContainerView.prototype.arrangeContents = function() {
    var tY = PFConstants.containerVStart;
    var tNextChildNode = this.myNode.firstChild;
    while (tNextChildNode) {
        var tChildSnap = tNextChildNode.view.theEnclosingSnap;
        tChildSnap.attr({ y : tY });
        tY += Number(tChildSnap.attr("height"));

        tNextChildNode = tNextChildNode.next;
    };
};


PFContainerView.prototype.doPFClick = function(e) {
    console.log("Click in frame");
};

