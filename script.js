var elementId = 'graphContainer';

var graphContainer = document.getElementById(elementId);
console.log(graphContainer);
var w = graphContainer.offsetWidth,
    h = graphContainer.offsetHeight;

var focus_node = null,
    highlight_node = null,
    text_center = true,
    outline = false;

var min_score = 0,
    max_score = 1;

var color = d3.scale.linear()
    .domain([min_score, (min_score + max_score) / 2, max_score])
    .range(["lime", "yellow", "red"]);

var highlight_color = "#6BCCC3",
    highlight_trans = 0.1;

var size = d3.scale.pow().exponent(1)
    .domain([1, 100])
    .range([8, 24]);

var force = d3.layout.force()
    .linkDistance(200)
    .charge(-900)
    .size([w, h]);

var default_node_color = "#ccc",
    default_link_color = "#998f8f",
    nominal_base_node_size = 8,
    nominal_text_size = 12,
    max_text_size = 24,
    nominal_stroke = 1.5,
    max_stroke = 4.5,
    max_base_node_size = 36,
    min_zoom = 0.1,
    max_zoom = 3.5;

var svg = d3.select("#" + elementId).append("svg");

svg.append("svg:defs").selectAll("marker")
    .data(["end"])      // Different link/path types can be defined here
    .enter().append("svg:marker")    // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 45)
    .attr("refY", 0)
    .attr("markerWidth", 5)
    .attr("markerHeight", 5)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

var zoom = d3.behavior.zoom().scaleExtent([min_zoom, max_zoom]);

var g = svg.append("g");

svg.style("cursor", "move");

var graph = {
    "graph": [],
    "links": [
        { "source": 0, "target": 2 },
        { "source": 0, "target": 3 },
        { "source": 0, "target": 4 },
        { "source": 0, "target": 5 },
        { "source": 0, "target": 6 },
        { "source": 1, "target": 0 },
        { "source": 1, "target": 3 },
        { "source": 1, "target": 4 },
        { "source": 1, "target": 5 },
        { "source": 1, "target": 6 },
        { "source": 2, "target": 4 },
        { "source": 2, "target": 5 },
        { "source": 2, "target": 6 },
        { "source": 3, "target": 5 },
        { "source": 3, "target": 6 },
        { "source": 5, "target": 6 },
        { "source": 0, "target": 7 },
        { "source": 1, "target": 8 },
        { "source": 2, "target": 9 },
        { "source": 3, "target": 10 },
        { "source": 4, "target": 11 },
        { "source": 5, "target": 12 },
        { "source": 6, "target": 13 }],
    "nodes": [
        {"id":0, "version": 1, "description": "Custom information from 0", "size": 120, "score": 0, "name": "3dit-building-pub-tiles-7", "type": "circle" },
        {"id":1, "version": 2, "description": "Custom information from 1", "size": 120, "score": 0.2, "name": "acstestfuelprice-1", "type": "circle" },
        {"id":2, "version": 17, "description": "Custom information from 2", "size": 120, "score": 0.4, "name": "adam0-latest-na-0", "type": "circle" },
        {"id":3, "version": 18, "description": "Custom information from 3", "size": 120, "score": 0.6, "name": "adas-data-latest-weu", "type": "circle" },
        {"id":4, "version": 1, "description": "Custom information from 4", "size": 120, "score": 0.8, "name": "venue-test", "type": "circle" },
        {"id":5, "version": 3, "description": "Custom information from 5", "size": 120, "score": -1, "name": "test-new-attributes-rmobs", "type": "circle" },
        {"id":6, "version": 1, "description": "Custom information from 6", "size": 120, "name": "owc-rmob-bindu1106", "type": "circle" },
        {"id":7, "version": 5, "description": "Custom information from 7", "size": 120, "score": 0, "name": "lympia-acs-sit-sdcard", "type": "square" },
        {"id":8, "version": 1, "description": "Custom information from 8", "size": 120, "score": 0.2, "name": "ns-na-dev-01-stable", "type": "square" },
        {"id":9, "version": 16545, "description": "Custom information from 9", "size": 120, "score": 0.4, "name": "northstar-twn-arc-routing-dal-1", "type": "square" },
        {"id":10, "version": 9, "description": "Custom information from 10", "size": 120, "score": 0.6, "name": "jason-eva-place-violations2-1", "type": "square" },
        {"id":11, "version": 11, "description": "Custom information from 11", "size": 120, "score": 0.8, "name": "jarikarj-admins-test", "type": "square" },
        {"id":12, "version": 15, "description": "Custom information from 12", "size": 120, "score": 1, "name": "jho-test-emr-source", "type": "square" },
        {"id":13, "version": 10, "description": "Custom information from 13", "size": 120, "name": "jpk-arc-mld-converter-1", "type": "diamond" }],
    "directed": true,
    "multigraph": false
};

var n = graph.nodes.length;
graph.nodes.forEach(function (d, i) {
    d.x = d.y = w / n * i;
});

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var linkedByIndex = {};
graph.links.forEach(function (d) {
    linkedByIndex[d.source + "," + d.target] = true;
});

function isConnected(a, b) {
    return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
}

function hasConnections(a) {
    for (var property in linkedByIndex) {
        s = property.split(",");
        if ((s[0] == a.index || s[1] == a.index) && linkedByIndex[property]) return true;
    }
    return false;
}

force
    .nodes(graph.nodes)
    .links(graph.links)
    .start();

var link = g.selectAll(".link")
    .data(graph.links)
    .enter().append("line")
    .attr("class", "link")
    .style("stroke-width", nominal_stroke)
    .style("stroke", function (d) {
        if (isNumber(d.score) && d.score >= 0) return color(d.score);
        else return default_link_color;
    })
    .attr("stroke-dasharray", function (d) {
        return (isNumber(d.target.score) && d.target.score < 0) ? "6,6" : "1,0";
    })
    .attr("marker-end", "url(#end)");


var node = g.selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
    .attr("class", "node");

//.call(force.drag);


node.on("dblclick.zoom", function (d) {
    d3.event.stopPropagation();
    var dcx = (window.innerWidth / 2 - d.x * zoom.scale());
    var dcy = (window.innerHeight / 2 - d.y * zoom.scale());
    zoom.translate([dcx, dcy]);
    g.attr("transform", "translate(" + dcx + "," + dcy + ")scale(" + zoom.scale() + ")");

});

var tocolor = "fill";
var towhite = "stroke";
if (outline) {
    tocolor = "stroke";
    towhite = "fill";
}

var circle = node.append("path")

    .attr("d", d3.svg.symbol()
        .size(function (d) { return Math.PI * Math.pow(size(d.size) || nominal_base_node_size, 2); })
        .type(function (d) { return /*d.type;*/ 'circle'; }))

    .style(tocolor, function (d) {
        if (isNumber(d.score) && d.score >= 0) return color(d.score);
        else return default_node_color;
    })
    //.attr("r", function(d) { return size(d.size)||nominal_base_node_size; })
    .style("stroke-width", nominal_stroke)
    .style(towhite, "white");


var text = g.selectAll(".text")
    .data(graph.nodes)
    .enter().append("text")
    .attr("dy", ".35em")
    .style("font-size", nominal_text_size + "px");

if (text_center)
    text.text(function (d) { return d.name; })
        .style("text-anchor", "middle")
        .attr("dy", 40);
else
    text.attr("dx", function (d) { return (size(d.size) || nominal_base_node_size); })
        .text(function (d) { return '\u2002' + d.name; });

var textVersion = node.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .style("font-size", nominal_text_size - 1 + "px")
    .text(function (d) {
        return d.version;
    });

node.on("mouseover", function (d) {
    setHighlight(d);
    tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
    tooltip.html(d.description)
        .style("left", (d3.event.pageX - 120) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
}).on("mousedown", function (d) {
    d3.event.stopPropagation();
    focus_node = d;
    setFocus(d);
    if (highlight_node === null) setHighlight(d);

}).on("mouseout", function (d) {
    exitHighlight();
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);

});

d3.select(window).on("mouseup",
    function () {
        if (focus_node !== null) {
            focus_node = null;
            if (highlight_trans < 1) {
                circle.style("opacity", 1);
                text.style("opacity", 1);
                textVersion.style("opacity", 1);
                link.style("opacity", 1);
            }
        }

        //if (highlight_node === null) exitHighlight();
    });

function exitHighlight() {
    highlight_node = null;
    if (focus_node === null) {
        svg.style("cursor", "move");
        if (highlight_color != "white") {
            circle.style(towhite, "white");
            text.style("font-weight", "normal");
            textVersion.style("font-weight", "normal");
            link.style("stroke", function (o) {
                return (isNumber(o.score) && o.score >= 0) ? color(o.score) : default_link_color;
            });
        }

    }
}

function setFocus(d) {
    if (highlight_trans < 1) {
        circle.style("opacity", function (o) {
            return isConnected(d, o) ? 1 : highlight_trans;
        });
        text.style("opacity", function (o) {
            return isConnected(d, o) ? 1 : highlight_trans;
        });
        textVersion.style("opacity", function (o) {
            return isConnected(d, o) ? 1 : highlight_trans;
        });
        link.style("opacity", function (o) {
            return o.source.index == d.index || o.target.index == d.index ? 1 : highlight_trans;
        });
    }
}

function setHighlight(d) {
    svg.style("cursor", "pointer");
    if (focus_node !== null) d = focus_node;
    highlight_node = d;

    if (highlight_color != "white") {
        circle.style(towhite, function (o) {
            return isConnected(d, o) ? highlight_color : "white";
        });
        text.style("font-weight", function (o) {
            return isConnected(d, o) ? "bold" : "normal";
        });
        textVersion.style("font-weight", function (o) {
            return isConnected(d, o) ? "bold" : "normal";
        });
        link.style("stroke", function (o) {
            return o.source.index == d.index || o.target.index == d.index ? highlight_color : ((isNumber(o.score) && o.score >= 0) ? color(o.score) : default_link_color);

        });
    }
}


zoom.on("zoom", function () {

    var stroke = nominal_stroke;
    if (nominal_stroke * zoom.scale() > max_stroke) stroke = max_stroke / zoom.scale();
    link.style("stroke-width", stroke);
    circle.style("stroke-width", stroke);

    var base_radius = nominal_base_node_size;
    if (nominal_base_node_size * zoom.scale() > max_base_node_size) base_radius = max_base_node_size / zoom.scale();
    circle.attr("d", d3.svg.symbol()
        .size(function (d) { return Math.PI * Math.pow(size(d.size) * base_radius / nominal_base_node_size || base_radius, 2); })
        .type(function (d) { return /*d.type;*/ 'circle'; }));

    //circle.attr("r", function(d) { return (size(d.size)*base_radius/nominal_base_node_size||base_radius); })
    if (!text_center) text.attr("dx", function (d) { return (size(d.size) * base_radius / nominal_base_node_size || base_radius); });

    var text_size = nominal_text_size;
    if (nominal_text_size * zoom.scale() > max_text_size) text_size = max_text_size / zoom.scale();
    text.style("font-size", text_size + "px");

    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
});

svg.call(zoom);

resize();
//window.focus();

force.on("tick", function () {

    node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
    text.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

    link.attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });

    node.attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; });

});

function resize() {
    var width = document.getElementById(elementId).offsetWidth, height = document.getElementById(elementId).offsetHeight;
    svg.attr("width", width).attr("height", height);

    force.size([force.size()[0] + (width - w) / zoom.scale(), force.size()[1] + (height - h) / zoom.scale()]).resume();
    w = width;
    h = height;
}


function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}


