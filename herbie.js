var imagewidth = 500,
    imageheight = 300;
var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 500 - margin.left - margin.right,
    height = imageheight - margin.top - margin.bottom,
    image_graph_margin = 50;

axis = 0;

drag = d3.behavior.drag()
    .origin(function(d) { return 1; })
    .on("drag", handle_drag)
    .on("dragend", render_graph);

image_sources = ["quad-graph-a.png", "quad-graph-b.png", "quad-graph-c.png"]

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
var histogram = svg.append("g")
    .attr("transform", "translate(" + (margin.left + imagewidth + image_graph_margin) + "," + margin.top + ")");

histogram.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(0,0)")
    .call(yAxis);

// Set up an array of zeroes so that we can build the graph before we
// get the data.
var initial_data = []
for(i = 0; i < 64; ++i){
    initial_data.push(0);
}

var startbar = histogram.selectAll(".startbar")
    .data(initial_data)
    .enter().append("g")
    .attr("class", "startbar")
    .attr("transform", function(d, i){ return "translate(3," + (i*(height/64)) + ")";});

var targetbar = histogram.selectAll(".targetbar")
    .data(initial_data)
    .enter().append("g")
    .attr("class", "targetbar")
    .attr("transform", function(d, i){ return "translate(3," + (i*(height/64)) + ")";});

var endbar = histogram.selectAll(".endbar")
    .data(initial_data)
    .enter().append("g")
    .attr("class", "endbar")
    .attr("transform", function(d, i){ return "translate(3," + (i*(height/64)) + ")";});

startbar.append("rect")
    .attr("class", "startline")
    .attr("stroke-width", 1)
    .attr("x", 0)
    .attr("width", 0)
    .attr("y", -2*(height/(64*3)))
    .attr("height", height/(64*3));

endbar.append("rect")
    .attr("class", "endline")
    .attr("stroke-width", 1)
    .attr("x", 0)
    .attr("width", 0)
    .attr("y", -1*(height/(64*3)))
    .attr("height", height/(64*3));

targetbar.append("rect")
    .attr("class", "targetline")
    .attr("stroke-width", 1)
    .attr("x", 0)
    .attr("width", 0)
    .attr("y", 0)
    .attr("height", height/(64*3));

startbar.append("circle")
    .attr("class", "start dot")
    .attr("r", 3.5);
targetbar.append("circle")
    .attr("class", "target dot")
    .attr("r", 3.5);
endbar.append("circle")
    .attr("class", "end dot")
    .attr("r", 3.5);

d3.json("quad-errors.json", function(error, json){
    if (error) return console.warn(error);
    error_data = json;
    init_bounds(20, 500);
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
	update_bounds(x, highbound);
    } else if (x > (lowbound + highbound) / 2){
	update_bounds(lowbound, x);
    }
}

function init_bounds(start_lowbound, start_highbound){
    lowbound = init_lowbound = start_lowbound;
    highbound = init_highbound = start_highbound;

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
	.attr("class", "rangeSelection")
        .attr("x", lowbound + margin.left)
        .attr("y", margin.top)
        .attr("width", highbound - lowbound)
        .attr("height", imageheight - 20 - margin.top)
        .attr("opacity", .2)
        .attr("fill", "blue")
        .attr("pointer-events", "none");

    var n_axis = error_data.points[0].length;
    data = []
    for(i = 0; i < n_axis; i++){
        data.push(i)
    }
    
    var options = d3.select("#selector").selectAll("option")
        .data(data)
        .enter()
        .append("option");
    options.text(function (d) { return d + 1;})
        .attr("value", function (d) {return d;});
    var selection = d3.select("#selector").on("change", update_axis_event);
    axis = selection.node().value;
    d3.select("image")
        .attr("xlink:href", image_sources[axis]);
}

function update_axis_event(){
    update_axis(d3.event.target.value);
}

function update_axis(newaxis){
    axis = newaxis;
    d3.select("image")
        .attr("xlink:href", image_sources[axis]);
    render_graph();
}

function update_bounds(new_lowbound, new_highbound){

    lowbound = new_lowbound;
    highbound = new_highbound;

    d3.selectAll(".left")
	.attr("cx", lowbound + margin.left);
    d3.selectAll(".right")
	.attr("cx", highbound + margin.left);

    d3.select(".rangeSelection")
	.attr("x", lowbound + margin.left)
	.attr("width", highbound - lowbound);
}

function render_graph(){

    var pointscaler = d3.scale.linear()
	.domain([init_lowbound, init_highbound])
	.range([min_x(axis), max_x(axis)]);
    
    function filter_data(data){
        return d3.zip(error_data.points, data)
            .filter(function(d)
                    { return d[0][axis] >= pointscaler(lowbound) &&
                      d[0][axis] <= pointscaler(highbound); })
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
    d3.selectAll(".startbar")
	.data(start_data)
	.attr("transform", function(d, i) { return "translate(" + x(d.y) + "," + (height - (i * height/64)) + ")"; });
    d3.selectAll(".startline")
	.data(start_data)
	.attr("width", function(d) { return x(d.y); })
	.attr("x", function(d) { return -x(d.y); })

    d3.selectAll(".endbar")
	.data(end_data)
	.attr("transform", function(d, i) { return "translate(" + x(d.y) + "," + (height - (i * height/64)) + ")"; });
    d3.selectAll(".endline")
	.data(end_data)
	.attr("width", function(d) { return x(d.y); })
	.attr("x", function(d) { return -x(d.y); })

    d3.selectAll(".targetbar")
	.data(target_data)
	.attr("transform", function(d, i) { return "translate(" + x(d.y) + "," + (height - (i * height/64)) + ")"; });
    d3.selectAll(".targetline")
	.data(target_data)
	.attr("width", function(d) { return x(d.y); })
	.attr("x", function(d) { return -x(d.y); })
}
