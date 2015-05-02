var imagewidth = 500,
    imageheight = 300;
var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 500 - margin.left - margin.right,
    height = imageheight - margin.top - margin.bottom,
    image_graph_margin = 50;

drag = d3.behavior.drag()
    .origin(function(d) { return 1; })
    .on("drag", handle_drag)
    .on("dragend", render_graph);

var image = d3.select("image")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("width", imagewidth)
    .attr("height", imageheight)
    .call(drag)
    .on("click", handle_drag);

var y = d3.scale.linear()
    .domain([-.5,64.5])
    .range([height,0])

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
var svg = d3.select("svg")
    .attr("width", width + (margin.left + margin.right) * 2 + imagewidth)
    .attr("height", height + margin.top + margin.bottom);
var g = svg.append("g")
    .attr("transform", "translate(" + (margin.left + imagewidth + image_graph_margin) + "," + margin.top + ")");

g.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(0,0)")
    .call(yAxis);

g.append("path")
    .attr("class", "line startline");
g.append("path")
    .attr("class", "line endline");
g.append("path")
    .attr("class", "line targetline");

d3.json("diff-rt-errors.json", function(error, json){
    if (error) return console.warn(error);
    error_data = json;
    init_bounds(0, 500, 0);
    render_graph();
});

function min_x(axis){
    return d3.min(error_data.points, function(d) { return d[axis]; });
}
function max_x(axis){
    return d3.max(error_data.points, function(d) { return d[axis]; });
}

function handle_drag(){
    var mouseposition = d3.mouse(this);
    var x = mouseposition[0] - margin.left;
    if (x < (lowbound + highbound) / 2){
	update_bounds(x, highbound, axis);
    } else if (x > (lowbound + highbound) / 2){
	update_bounds(lowbound, x, axis);
    }
}

function init_bounds(start_lowbound, start_highbound, start_axis){
    lowbound = start_lowbound;
    highbound = start_highbound;
    axis = start_axis;

    var svg = d3.select("svg");
    
    svg.append("circle")
	.attr("class", "top left")
        .attr("r", 5)
        .attr("cx", lowbound + margin.left)
        .attr("cy", margin.top);
    svg.append("circle")
	.attr("class", "bottom left")
        .attr("r", 5)
        .attr("cx", lowbound + margin.left)
        .attr("cy", imageheight - 20);
    svg.append("circle")
	.attr("class", "top right")
        .attr("r", 5)
        .attr("cx", highbound + margin.left)
        .attr("cy", margin.top);
    svg.append("circle")
	.attr("class", "bottom right")
        .attr("r", 5)
        .attr("cx", highbound + margin.left)
        .attr("cy", imageheight - 20);
    svg.append("rect")
        .attr("x", lowbound + margin.left)
        .attr("y", margin.top)
        .attr("width", highbound - lowbound)
        .attr("height", imageheight - 20 - margin.top)
        .attr("opacity", .2)
        .attr("fill", "blue")
        .attr("pointer-events", "none");
}

function update_bounds(new_lowbound, new_highbound, new_axis){

    lowbound = new_lowbound;
    highbound = new_highbound;
    axis = new_axis;

    d3.selectAll(".left")
	.attr("cx", lowbound + margin.left);
    d3.selectAll(".right")
	.attr("cx", highbound + margin.left);

    d3.select("rect")
	.attr("x", lowbound + margin.left)
	.attr("width", highbound - lowbound);
}

function render_graph(){

    var pointscaler = d3.scale.log()
	.domain([min_x(0), max_x(0)])
	.range([0, imagewidth]);
    
    function filter_data(data){
        return d3.zip(error_data.points, data)
            .filter(function(d)
                    { return d[0][axis] > pointscaler.invert(lowbound-10) &&
                      d[0][axis] < pointscaler.invert(highbound-10); })
            .map(function(d) { return d[1]; });
    }
    
    var start_data = d3.layout.histogram()
        .bins(y.ticks(64))(filter_data(error_data.startErrors));
    var end_data = d3.layout.histogram()
        .bins(y.ticks(64))(filter_data(error_data.endErrors));
    var target_data = d3.layout.histogram()
        .bins(y.ticks(64))(filter_data(error_data.targetErrors));
    
    var x = d3.scale.linear()
        .domain([0, filter_data(error_data.startErrors).length])
        .range([0, width]);
    var line = d3.svg.line()
        .interpolate("basic")
        .x(function(d) { return x(d.y) - x(.5); })
        .y(function(d) { return y(d.x) ; });

    d3.select(".startline")
	.datum(start_data)
	.attr("d", line);
    d3.select(".endline")
	.datum(end_data)
	.attr("d", line);
    d3.select(".targetline")
	.datum(target_data)
	.attr("d", line);
}
