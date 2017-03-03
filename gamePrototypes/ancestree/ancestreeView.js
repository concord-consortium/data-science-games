/**
 * Created by tim on 3/1/17.


 ==========================================================================
 ancestreeView.js in gamePrototypes.

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


ancestree.treeView = {
    paper: null,
    bgRect: null,

    initialize: function (iDOMName) {
        this.paper = Snap(document.getElementById(iDOMName));
        this.bg = this.paper.rect(0, 0, this.paper.attr("width"), this.paper.attr("height")).attr({"fill": "#ddd"});
        this.ccc = this.paper.circle(20, 20, 15).attr({"fill": "#789"});

    },

    redraw: function (iModel) {

        var minT = Number.MAX_VALUE;
        var maxT = Number.MIN_VALUE;
        var timeRange = 10;
        var k, item;

        var circles = [];
        var lines = [];

        //  determine the range of times we're lookimg at
        for (k in iModel) {
            if (iModel.hasOwnProperty(k)) {
                item = iModel[k];
                if (typeof(item.now) != "undefined") {
                    if (item.now < minT) {
                        minT = item.now;
                    }
                    if (item.now > maxT) {
                        maxT = item.now;
                    }
                    timeRange = maxT - minT;
                }
            }
        }

        var viewWidth = this.paper.attr("width") - 20;
        var viewHeight = this.paper.attr("height") - 20;
        if (timeRange < 5) {
            timeRange = 5
        }

        //  now draw the nodes

        for (k in iModel) {
            if (iModel.hasOwnProperty(k)) {
                item = iModel[k];

                if (typeof(item.now) != "undefined") {

                    var tX, tY, tX2, tY2;
                    tX = 10 + (viewWidth) * ((item.now - minT) / timeRange);
                    tY = 10 + viewHeight * item.hue;

                    iModel[k].center = {
                        x: tX,
                        y: tY
                    };

                    var tCircle = ancestree.treeView.paper.circle(item.center.x, item.center.y, 10)
                        .attr({
                            "fill": item.color,
                            "stroke" : "#333"
                        });
                    circles.push( tCircle );

                    if (item.mom > 0) {
                        var momItem = iModel[item.mom];
                        tY2 = 10 + viewHeight * momItem.hue;
                        tX2 = momItem.center.x;
                        var tLine = ancestree.treeView.paper.line(tX, tY, tX2, tY2).attr({
                            "stroke" : "#333"
                        });
                        lines.push( tLine );
                    }
                }
            }
        }

        this.paper.clear();
        this.bg = this.paper.rect(0, 0, this.paper.attr("width"), this.paper.attr("height")).attr({"fill": "#ddd"});

        lines.forEach( function(l) {
            ancestree.treeView.paper.append(l);
        })

        circles.forEach( function (c) {
            ancestree.treeView.paper.append(c);
        })
    }
};

