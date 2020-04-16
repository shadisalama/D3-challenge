// Create a scatter plot for visualization of data based
let svgwidth = 960;
let svgheight = 620;

let margin = {
    top: 20,
    right: 40,
    bottom: 200,
    left: 100
};

let width = svgwidth - margin.right - margin.left;
let height = svgheight - margin.top - margin.bottom;

// append a div class to the scatter element
let plotchart = d3.select('#scatter')
    .append('div')
    .classed('plotchart', true);

let svg = plotchart.append('svg')
    .attr('width', svgwidth)
    .attr('height', svgheight);

let chartgroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

//initial parameters; x and y axis
let XAxis = 'poverty';
let YAxis = 'healthcare';

// Updating the X-Scale
function Xscale(censusData, XAxis){
    let xlinearscale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[XAxis]) * 0.8,
                d3.max(censusData, d => d[XAxis]) * 1.2])
        .range([0, width]);

    return xlinearscale;
}

// Updating the Y-Scale
function Yscale(censusData, YAxis) {
    let ylinearscale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[YAxis]) * 0.8,
                d3.max(censusData, d => d[YAxis]) * 1.2])
        .range([height, 0]);
    
    return ylinearscale;
}

// update XAxis upon click
function renderXAxis(newXScale, XAxiss) {
    let bottomAxis = d3.axisBottom(newXScale);

    XAxiss.transition()
        .duration(2000)
        .call(bottomAxis);

    return XAxiss;
}

// updating yAxis upon click
function renderYAxis(newYScale, YAxiss) {
    var leftAxis = d3.axisLeft(newYScale);

    YAxiss.transition()
        .duration(2000)
        .call(leftAxis);

  return YAxiss;
}

// updating the circles with a transition to new circles 
function renderCircles(circlesgroup, newXScale, XAxis, newYScale, YAxis) {

    circlesgroup.transition()
      .duration(2000)
      .attr('cx', data => newXScale(data[XAxis]))
      .attr('cy', data => newYScale(data[YAxis]))

    return circlesgroup;
}

// updating STATE labels
function renderText(textgroup, newXScale, XAxis, newYScale, YAxis) {

    textgroup.transition()
      .duration(2000)
      .attr('x', d => newXScale(d[XAxis]))
      .attr('y', d => newYScale(d[YAxis]));

    return textgroup;
}

// stylize x-axis values for tooltips
function styleX(value, XAxis) {

    //style based on variable
    //poverty
    if (XAxis === 'poverty') {
        return `${value}%`;
    }
    //household income
    else if (XAxis === 'income') {
        return `${value}`;
    }
    else {
      return `${value}`;
    }
}

// updating circles group
function updateToolTip(XAxis, YAxis, circlesgroup) {
    if (XAxis === 'poverty') {
      var xlabel = 'Poverty:';
    } else if (XAxis === 'income'){
      var xlabel = 'Median Income:';
    } else {
      var xlabel = 'Age:';
    }

    if (YAxis ==='healthcare') {
        var ylabel = "No Healthcare:"
    } else if(YAxis === 'obesity') {
        var ylabel = 'Obesity:';
    } else{
        var ylabel = 'Smokers:';
    }

    //create tooltip
    var toolTip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-8, 0])
        .html(function(d) {
            return (`${d.state}<br>${xlabel} ${styleX(d[XAxis], XAxis)}<br>${ylabel} ${d[YAxis]}%`);
        });

    circlesgroup.call(toolTip);

    circlesgroup.on('mouseover', toolTip.show)
                .on('mouseout', toolTip.hide);

    return circlesgroup;
}


// ------------------------------------------------------------------
// read csv file
d3.csv('/assets/data/data.csv').then(function(censusData){
    console.log(censusData);

    // parser Data
    censusData.forEach(function(data){
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    // create linear scales
    var xlinearscale = Xscale(censusData, XAxis);
    var ylinearscale = Yscale(censusData, YAxis);

    // create x axis and y axis
    var bottomAxis = d3.axisBottom(xlinearscale);
    var leftAxis = d3.axisLeft(ylinearscale);

    // append x
    var XAxiss = chartgroup.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);
        
    // append y
    var YAxiss = chartgroup.append('g')
        .classed('y-axis', true)
        .call(leftAxis);

    // append Circles
    var circlesgroup = chartgroup.selectAll('circle')
        .data(censusData)
        .enter()
        .append('circle')
        .classed('stateCircle', true)
        .attr('cx', d => xlinearscale(d[XAxis]))
        .attr('cy', d => ylinearscale(d[YAxis]))
        .attr('r', 14)
        .attr('opacity', '.5');

    // append Initial Text
    var textgroup = chartgroup.selectAll('.stateText')
        .data(censusData)
        .enter()
        .append('text')
        .classed('stateText', true)
        .attr('x', d => xlinearscale(d[XAxis]))
        .attr('y', d => ylinearscale(d[YAxis]))
        .attr('dy', 3)
        .attr('font-size', '10px')
        .text(function(d){return d.abbr});

    // Create a group for the x axis labels
    var xlabelsgroup = chartgroup.append('g')
        .attr('transform', `transform(${width / 2}, ${height + 50 + margin.top})`);

    var povertylabel = xlabelsgroup.append('text')
        .classed('aText', true)
        .classed('active', true)
        .attr('x', 400)
        .attr('y', 20)
        .attr('value', 'poverty')
        .text('In poverty (%)');

    var agelabel = xlabelsgroup.append('text')
        .classed('aText', true)
        .classed('active', true)
        .attr('x', 400)
        .attr('y', 40)
        .attr('value', 'age')
        .text('Age (Median)');
    
    var incomelabel = xlabelsgroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 400)
        .attr('y', 60)
        .attr('value', 'income')
        .text('Household Income (Median)')

    // Create a group for Y labels
    var ylabelsgroup = chartgroup.append('g')
        .attr('transform', `translate(${0 - margin.left/4}, ${height/2})`);
    
    var healthcarelabel = ylabelsgroup.append('text')
        .classed('aText', true)
        .classed('active', true)
        .attr('x', 0)
        .attr('y', 0 - 20)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'healthcare')
        .text('without Healthcare (%)');

    var smokeslabel = ylabelsgroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 0 - 40)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'smokes')
        .text('Smoker (%)');

    var obesitylabel = ylabelsgroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 0 - 60)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'obesity')
        .text('Obese (%)');

    // update the toolTip
    var circlesgroup = updateToolTip(XAxis, YAxis, circlesgroup);

    // x axis envents
    xlabelsgroup.selectAll('text')
        .on('click', function() {
            var value = d3.select(this).attr('value')
            
            if (value != XAxis){
                XAxis = value;
                xlinearscale = Xscale(censusData, XAxis);
                XAxiss = renderXAxis(xlinearscale, XAxiss);

                circlesgroup = renderCircles(circlesgroup, xlinearscale, XAxis, ylinearscale, YAxis);

                textgroup = renderText(textgroup, xlinearscale, XAxis, ylinearscale, YAxis);

                circlesgroup = updateToolTip(XAxis, YAxis, circlesgroup);

                if (XAxis === 'poverty') {
                    povertylabel.classed('active', true).classed('inactive', false);
                    agelabel.classed('active', false).classed('inactive', true);
                    incomelabel.classed('active', false).classed('inactive', true);
                } else if (XAxis === 'age'){
                    povertylabel.classed('active', false).classed('inactive', true);
                    agelabel.classed('active', true).classed('inactive', false);
                    incomelabel.classed('active', false).classed('inactive', true);
                } else {
                    povertylabel.classed('active', false).classed('inactive', true);
                    agelabel.classed('active', false).classed('inactive', true);
                    incomelabel.classed('active', true).classed('inactive', false);
                }
            }
        });

        // Y axis labels event
        ylabelsgroup.selectAll('text')
            .on('click', function() {
                var value = d3.select(this).attr('value');

                if (value != YAxis) {
                    YAxis = value;
                    ylinearscale = Yscale(censusData, YAxis);
                    YAxiss = renderYAxis(ylinearscale, YAxiss);

                    circlesgroup = renderCircles(circlesgroup, xlinearscale, XAxis, ylinearscale, YAxis);
                    textgroup = renderText(textgroup, xlinearscale, XAxis, ylinearscale, YAxis);
                    circlesgroup = updateToolTip(XAxis, YAxis, circlesgroup);                    
                    
                    if (YAxis === "obsity") {
                        obesitylabel.classed('active', true).classed('inactive', false);
                        smokeslabel.classed('active', false).classed('inactive', true);
                        healthcarelabel.classed('active', false).classed('inactive', true);
                    } else if (YAxis === 'smokes') {
                        obesitylabel.classed('active', false).classed('inactive', true);
                        smokeslabel.classed('active', true).classed('inactive', false);
                        healthcarelabel.classed('active', false).classed('inactive', true);
                    } else {
                        obesitylabel.classed('active', false).classed('inactive', true);
                        smokeslabel.classed('active', false).classed('inactive', true);
                        healthcarelabel.classed('active', true).classed('inactive', false);
                    }
                }
            });
});
