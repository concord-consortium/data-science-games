CorralAttView = function (iAtt, iPanel) {
    this.data = {};
    this.data.attribute = iAtt;
    this.labelText = this.data.attribute.attributeName;
    this.panel = iPanel;
    this.w = maTree.constants.attrWidth;
    this.h = maTree.constants.attrHeight;

    this.where = {x: 0, y: 0};

    this.paper = new Snap(this.w, this.h);

    //  create background rectangle

    this.backShape = this.paper.rect(
        0, 0, this.w, this.h
    ).attr({fill: this.data.attribute.attributeColor});
    //  create label
    this.label = this.paper.text(maTree.constants.treeObjectPadding, 12, this.labelText).attr({fill : "#eee"})

    this.label.node.setAttribute("class", "noselect");  //  this is that css thing

    //  create selection rect in front

    this.selectShape = this.paper.rect(0, 0, this.w, this.h).attr({
        fill: "transparent"
    }).mousedown(function () {
        this.panel.setLastMouseDownNodeView( this );
        console.log("down in " + this.labelText);
    }.bind(this));

    this.paper.dblclick( function(e) {
        console.log("Double click in " + this.labelText);
        this.panel.makeDependentVariable( this );
    }.bind(this));

};

CorralAttView.prototype.showSelection = function (iSelected) {
    this.coloredShape.attr({fill: iSelected ? maTree.constants.selectedAttributeColor : maTree.constants.attributeColor});
};

CorralAttView.prototype.moveTo = function (iX, iY) {
    var tLabel = this.labelText;
    if (this.data.attribute === maTree.dependentVariable) {
        tLabel += " = " + maTree.focusCategory;
    }
    this.label.attr("text", tLabel);
    this.where = {x: iX, y: iY};
    var tNewWidth = this.label.getBBox().width;
    tNewWidth += 2 * maTree.constants.treeObjectPadding;
    this.paper.attr({width: tNewWidth});
    this.backShape.attr({width: tNewWidth});

    this.paper.animate(this.where, 1000);
};
