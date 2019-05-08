// Wrap entire plot in a function to make it responsive
function makeResponsive() {

    // Select existing svg
    var svgArea = d3.select("body").select("svg");

    // Clear svg if it is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // Set dimensions based on size of browser window
    var svgHeight = window.innerHeight;
    var svgWidth = window.innerWidth;

    var margin = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    };

    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;

    // Append new svg element
    var svg = d3.select(".col-xs-12")
        .select("#scatter")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    // Append chart group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Set initial x-axis
    var chosenX = "poverty";
    console.log(chosenX);

    function xScale(stateData, chosenX) {
        // create scales
        var xLinear = d3.scaleLinear()
          .domain([d3.min(stateData, d => d[chosenX]) * 0.8,
            d3.max(stateData, d => d[chosenX]) * 1.2
          ])
          .range([0, width]);
      
        return xLinear;
      }

    // Set initial y-axis
    var chosenY = "healthcare";

    function yScale(stateData, chosenY) {
        // create scales
        var yLinear = d3.scaleLinear()
            .domain([d3.min(stateData, d => d[chosenY]) * 0.8,
                d3.max(stateData, d => d[chosenY]) * 1.2
            ])
            .range([height, 0]);

        return yLinear;
    }

    // Function to update x-axis var upon click on axis label
    function renderAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
    
        xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
        return xAxis;
    }

    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenX) {
        circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenX]));
    
        return circlesGroup;
    }

    // function used for updating circles group with new tooltip
    //ADD LATER

    // Read CSV
    d3.csv("data.csv")
        .then(function(stateData) {

        // Parse data
        stateData.forEach(function(data) {
            data.age = +data.age;
            data.poverty = +data.poverty;
            data.income = +data.income;
            data.healthcare = +data.healthcare;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });

        // Set linear scale for csv data using x/yScale functions
        var xLinear = xScale(stateData, chosenX);

        var yLinear = yScale(stateData, chosenY);

        // Create initial axes
        var bottomAxis = d3.axisBottom(xLinear);
        var leftAxis = d3.axisLeft(yLinear);

        // append x axis
        var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

        // append y axis
        chartGroup.append("g")
        .call(leftAxis);

        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenX]))
        .attr("cy", d => yLinearScale(d[chosenY]))
        .attr("r", 100)
        .attr("fill", "lightblue")
        .attr("opacity", ".5")
        .text(data.abbr);

        // Create group for  2 x- axis labels
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var povertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("In Poverty (%)");

        var ageLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Household Income (Median)");

        // append y axis
        var yLabelsGroup = chartGroup.append("text")
            .attr("transform", "rotate(-90)")
        
        var healthcareLabel = yLabelsGroup.append("text")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .classed("active", true)
            .text("Lacks Healthcare (%)");

        var smokeLabel = yLabelsGroup.append("text")
            .attr("y", 0 - margin.left)
            .attr("x", -20 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "smokers")
            .classed("inactive", true)
            .text("Smokes (%)");

        var obeseLabel = yLabelsGroup.append("text")
            .attr("y", 0 - margin.left)
            .attr("x", -40 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "obese")
            .classed("inactive", true)
            .text("Obese (%)");

        
    });
}