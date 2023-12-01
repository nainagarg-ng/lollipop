var svgbar;

function monthToQuarter(monthYear) {
    const [month, year] = monthYear.split("-");
    const quarterMap = {Mar: "Q1", Jun: "Q2", Sep: "Q3", Dec: "Q4"};
    const fullYear = year.length === 2 ? '20' + year : year;
    return fullYear + " " + quarterMap[month];
}

d3.csv("data/returns.csv").then(function (data) {
    data.forEach(function (d) {
        d.income = +d['income'];
        d.growth = +d['growth'];
        d.total = +d['total'];
        d.year = monthToQuarter(d.year);
        console.log("year", d.year);
    });

    d3.select('body').on('click', function (event) {
        // Check if the click occurred outside the svgbar element
        if (!svgbar.node().contains(event.target)) {
            resetGraph();
        }
    });

    // Set the dimensions and margins of the graph
    var margin = {top: 20, right: 80, bottom: 100, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Append the svgbar object to the div called 'chart'
    svgbar = d3.select("#bar-area")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X-axis scale
    var xDomain = Array.from(new Set(data.map(function (d) {
        return d.year;}))).sort();

    console.log("domain", xDomain);

    var x = d3.scaleBand()
        .range([0, width])
        .domain(xDomain)
        .padding(0.2);

    svgbar.append("g")
        .attr("transform", `translate(0, ${height + 30})`)
        .call(d3.axisBottom(x)
            .tickFormat(function (d) {
                // Display only the year at the first quarter
                return d.endsWith("Q1") ? d : d.split(" ")[1];
            }))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.75em")
        .attr("transform", "rotate(-90)")
        .style("fill", "white")
        .style("font-size", "8px");

    // Y-axis scale
    var yMax = d3.max(data, function (d) {
        return Math.max(d.income + d.growth, d.total);
    });
    var yMin = d3.min(data, function (d) {
        return Math.min(d.income + d.growth, d.total);
    });

    var y = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([height, 0]);

    // Append Y axis to SVG
    svgbar.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format(".0%")))
        .selectAll("text")
        .style("fill", "white");

    // Append tooltip div to the body
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Bars for income returns
    svgbar.selectAll(".bar-income")
        .data(data)
        .join("rect")
        .attr("class", "bar-income")
        .attr("x", d => x(d.year))
        .attr("y", d => y(Math.max(0, d.income)))
        .attr("width", x.bandwidth())
        .attr("height", d => Math.abs(y(d.income) - y(0)))
        .attr("fill", "#21A3A1")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<strong>Income Returns:</strong> " + d3.format(".1%")(d.income) + "<br/>" + d.year)
                .style("left", (event.pageX + 20) + "px")
                .style("top", (event.pageY) + "px")
                .style("background", "#21A3A1")
                .style("color", "white");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html('');
        });

    // Bars for capital growth
    svgbar.selectAll(".bar-growth")
        .data(data)
        .join("rect")
        .attr("class", "bar-growth")
        .attr("x", d => x(d.year))
        .attr("y", d => y(Math.max(0, d.income + d.growth)))
        .attr("width", x.bandwidth())
        .attr("height", d => Math.abs(y(d.growth) - y(0)))
        .attr("fill", "#9F21A3")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<strong>Capital Growth:</strong> " + d3.format(".1%")(d.growth) + "<br/>" + d.year)
                .style("left", (event.pageX + 20) + "px")
                .style("top", (event.pageY) + "px")
                .style("background", "#9F21A3")
                .style("color", "white");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html('');
        });

    // Line-generator for total returns
    var line = d3.line()
        .x(d => x(d.year) + x.bandwidth() / 2)
        .y(d => y(d.total));

    // Append the path for line chart
    var path = svgbar.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "#8FF53C")
        .attr("stroke-width", 1.5)
        .attr("d", line);

// Calculate the total length of the path
    var totalLength = path.node().getTotalLength();

// Set up the starting position of the line (fully hidden)
    path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    // Append markers at each data point on the line
    svgbar.selectAll(".dot")
        .data(data)
        .enter().append("circle") // Creates a circle for each data point
        .attr("class", "dot")
        .attr("cx", function (d) {
            return x(d.year) + x.bandwidth() / 2;
        })
        .attr("cy", d => y(d.total))
        .attr("r", 2.5)
        .attr("fill", "red")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<strong>Total Returns:</strong> " + d3.format(".1%")(d.total) + "<br/>" + d.year)
                .style("left", (event.pageX + 20) + "px")
                .style("top", (event.pageY) + "px")
                .style("background", "#8FF53C")
                .style("color", "black");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html('');
        });

    // Legend
    var legend = svgbar.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .attr("transform", `translate(0,${height + 50})`)
        .selectAll("g")
        .data(["Income Returns", "Capital Growth", "Total Returns"])
        .enter().append("g")
        .attr("transform", (d, i) => `translate(${width - 100 + i * 100}, 0)`)
        .style("cursor", "pointer")
        .on("click", function (event, d) {
            // Use the clicked legend item data 'd' to highlight the chart element
            highlightChartElement(d);
        });

    legend.filter(d => d!=="Total Returns")
        .append("rect")
        .attr("x", margin.left*11.2-width)
        .attr("y", margin.bottom*4.2-height)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", (d, i) => ["#21A3A1", "#9F21A3"][["Income Returns", "Capital Growth"].indexOf(d)]);

    // For Capital Growth (Line with Marker)
    legend.filter(d => d === "Total Returns")
        .each(function() {
            d3.select(this).append("line")
                .attr("x1", margin.left*11.1-width)
                .attr("x2", margin.left*11.8-width)
                .attr("y1", margin.bottom*4.25-height)
                .attr("y2", margin.bottom*4.25-height)
                .attr("stroke", "#8FF53C")
                .attr("stroke-width", 4);

            d3.select(this).append("circle")
                .attr("cx", margin.left*11.45-width)
                .attr("cy", margin.bottom*4.25-height)
                .attr("r", 2.5)
                .attr("fill", "red")
                .attr("stroke", "white");
        });

    legend.append("text")
        .attr("x", margin.left*11-width)
        .attr("y", margin.bottom*4.25-height)
        .attr("dy", "0.32em")
        .text(d => d)
        .style("fill", "white");

// Brush setup
    var brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("end", brushended);

    svgbar.append("g")
        .attr("class", "brush")
        .call(brush);

// Brush event handler
    function brushended(event) {
        if (!event.selection) {
            return; // Ignore empty selections
        }

        // Get the selected range
        var selectedRange = event.selection.map(x.invert);

        // Process the selected range (e.g., update another chart)
        updateOtherChart(selectedRange);
    }
});

// Click event handler for legend
function highlightChartElement(elementType) {
    console.log("Clicked element type:", elementType);
    svgbar.selectAll('.bar-income, .bar-growth, .line, .dot')
        .style('opacity', 1);

    // Dim the elements that are not selected
    if (elementType !== 'Income Returns') {
        svgbar.selectAll('.bar-income').style('opacity', 0.2);
    }
    if (elementType !== 'Capital Growth') {
        svgbar.selectAll('.bar-growth').style('opacity', 0.2);
    }
    if (elementType !== 'Total Returns') {
        svgbar.selectAll('.line').style('opacity', 0.2);
        svgbar.selectAll('.dot').style('opacity', 0.2);
    }
}

// Function to update another chart based on brush selection
function updateOtherChart(selectedRange) {
    // Your logic to update another chart based on the selected range
    console.log("Selected range:", selectedRange);
}

// Function to reset the graph
function resetGraph() {
    svgbar.selectAll('.bar-income, .bar-growth, .line, .dot')
        .style('opacity', 1);

    // Clear any brush selection
    svgbar.select(".brush").call(brush.move, null);
}

// Function to clear the brush after the selection
function brushended(event) {
    if (!event.selection) {
        resetGraph(); // If the brush is empty, reset the graph
        return;
    }

    // Get the selected range
    var selectedRange = event.selection.map(x.invert);

    // Process the selected range (e.g., update another chart)
    updateOtherChart(selectedRange);
}
