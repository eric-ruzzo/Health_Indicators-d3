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
    var svg = d3
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
        var xScale = d3.scaleLinear()
          .domain([d3.min(stateData, d => d[chosenX]) * 0.8,
            d3.max(stateData, d => d[chosenX]) * 1.2
          ])
          .range([0, width]);
      
        return xScale;
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

        // Set linear scale for csv data using function above
        
    });
}