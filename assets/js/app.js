// Wrap entire plot in a function to make it responsive
function makeResponsive() {

    //Select existing svg
    var svgArea = d3.select("body").select("svg");

    // Clear svg if it is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // Set dimensions based on size of browser window
    var svgHeight = window.innerHeight;
    var svgWidth = window.innerWidth;

    var margin = {
        top: 100,
        bottom: 100,
        left: 100,
        right: 100
    };

    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;

    // Append new svg element
    var svg = d3.select("div")
        .select("#scatter")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    // Append chart group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Set initial x-axis
    var chosenX = "poverty";

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
    function renderX(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
    
        xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
        return xAxis;
    }

    // Function to update y-axis var upon click on axis label
    function renderY(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
    
        yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
        return yAxis;
    }

    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, textLabels, newXScale, chosenX, newYScale, chosenY) {
        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenX]))
            .attr("cy", d => newYScale(d[chosenY]));

        textLabels.transition()
            .duration(1000)
            .attr("x", d => newXScale(d[chosenX]))
            .attr("y", d => newYScale(d[chosenY]) + 2);
    
        return circlesGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenX, chosenY, circlesGroup) {

        if (chosenX === "poverty") {
            var xLabel = "In Poverty:";
        }
        else if (chosenX === "age") {
            var xLabel = "Median Age:";
        }
        else {
            var xLabel = "Median Income:";
        }

        if (chosenY === "healthcare") {
            var yLabel = "Lacks Healthcare:";
        }
        else if (chosenY === "obesity") {
            var yLabel = "Obesity:";
        }
        else {
            var yLabel = "Smokes:"
        }
      
        var toolTip = d3.tip()
          .attr("class", "d3-tip")
          .offset([80, -60])
          .html(function(d) {
            return (`${d.state}<br>${xLabel} ${d[chosenX]}<br>${yLabel} ${d[chosenY]}`);
          });
      
        circlesGroup.call(toolTip);
      
        circlesGroup.on("mouseover", function(data) {
          toolTip.show(data, this);
        })
          // onmouseout event
          .on("mouseout", function(data, index) {
            toolTip.hide(data);
          });

        return circlesGroup;
    }      

    // Read CSV
    d3.csv("/data/data.csv")
        .then(function(stateData) {

        console.log(stateData);

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
        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(stateData)
            .enter()
            .append("circle")
            .attr("class", "stateCircle")
            .attr("cx", d => xLinear(d[chosenX]))
            .attr("cy", d => yLinear(d[chosenY]))
            .attr("r", 10);

        // Add text to circles
        var circlesText = chartGroup.selectAll(".stateText")
            .data(stateData)
            .enter()
            .append("text");
            
        // Set text value for each circle
        var textLabels = circlesText
            .attr("class", "stateText")
            .attr("x", d => xLinear(d[chosenX]))
            .attr("y", d => yLinear(d[chosenY]) + 2)
            .text((d, i) => d.abbr)
            .attr("font-size", "10px");

        // Create group for 3 x- axis labels
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
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");
        
        var healthcareLabel = yLabelsGroup.append("text")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .classed("active", true)
            .text("Lacks Healthcare (%)");

        var smokeLabel = yLabelsGroup.append("text")
            .attr("y", 20 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "smokes")
            .classed("inactive", true)
            .text("Smokes (%)");

        var obeseLabel = yLabelsGroup.append("text")
            .attr("y", 40 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "obesity")
            .classed("inactive", true)
            .text("Obese (%)");

        // Add tooltips
        circlesGroup = updateToolTip(chosenX, chosenY, circlesGroup);

        // Event listener for x labels    
        xLabelsGroup.selectAll("text")
            .on("click", function() {

                // Get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenX) {

                    // Replace chosen x with value
                    chosenX = value;

                    // Update x scale for new value
                    xLinear = xScale(stateData, chosenX);

                    // Update x axis values
                    xAxis = renderX(xLinear, xAxis);

                    // Update circles with new x axis
                    circlesGroup = renderCircles(circlesGroup, textLabels, xLinear, chosenX, yLinear, chosenY);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenX, chosenY, circlesGroup);

                    //Change classes to highlight selection in bold
                    if (chosenX === "age") {
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (chosenX === "income") {
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                }
            });

        //Event listener for y labels
        yLabelsGroup.selectAll("text")
            .on("click", function() {

                // Get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenY) {

                    // Replace chosen y with value
                    chosenY = value;

                    // Update y scale for new value
                    yLinear = yScale(stateData, chosenY);

                    // Update x axis values
                    yAxis = renderY(yLinear, yAxis);

                    // Update circles with new x axis
                    circlesGroup = renderCircles(circlesGroup, textLabels, xLinear, chosenX, yLinear, chosenY);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenX, chosenY, circlesGroup);

                    //Change classes to highlight selection in bold
                    if (chosenY === "smokes") {
                        smokeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        obeseLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (chosenY === "obesity") {
                        obeseLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obeseLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                }
            })
    });
}

makeResponsive();

d3.select(window).on("resize", makeResponsive);