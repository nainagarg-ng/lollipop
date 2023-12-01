// // SVG Size for bar chart
// let marginBar = { top: 20, right: 30, bottom: 100, left: 50 },
//     widthBar = 960 - marginBar.left - marginBar.right,
//     heightBar = 500 - marginBar.top - marginBar.bottom;
//
// // SVG Size for lollipop chart
// let marginLollipop = { top: 20, right: 30, bottom: 0, left: 50 },
//     widthLollipop = 660 - marginLollipop.left - marginLollipop.right,
//     heightLollipop = 400 - marginLollipop.top - marginLollipop.bottom;
//
// // Create SVG container for bar chart
// const svgBar = d3.select("#bar-area").append("svg")
//     .attr("width", widthBar + marginBar.left + marginBar.right)
//     .attr("height", heightBar + marginBar.top + marginBar.bottom)
//     .append("g")
//     .attr("transform", `translate(${marginBar.left}, ${marginBar.top})`);
//
// // Create SVG container for lollipop chart
// const svgLollipop = d3.select("#lollipop-area").append("svg")
//     .attr("width", widthLollipop + marginLollipop.left + marginLollipop.right)
//     .attr("height", heightLollipop + marginLollipop.top + marginLollipop.bottom)
//     .append("g")
//     .attr("transform", `translate(${marginLollipop.left}, ${marginLollipop.top})`);
//
// // Dropdown for lollipop chart selection
// let selectedMetric = "total"; // Initial selected metric
// d3.select("#lollipop-area").append("select")
//     .attr("id", "metric-select")
//     .selectAll("option")
//     .data(["total", "income", "growth"])
//     .enter()
//     .append("option")
//     .text(d => d)
//     .attr("value", d => d);
//
// d3.select("#metric-select").on("change", function() {
//     selectedMetric = d3.select(this).property("value");
//     updateLollipopChart(lollipopDataFiltered);
// });
//
// // Function to convert month-year to quarter-year format
// function monthToQuarter(monthYear) {
//     const [month, year] = monthYear.split("-");
//     const quarterMap = { Mar: "Q1", Jun: "Q2", Sep: "Q3", Dec: "Q4" };
//     const fullYear = year.length === 2 ? '20' + year : year;
//     return fullYear + " " + quarterMap[month];
// }
//
// // Global data variables
// let lollipopData = [];
// let lollipopDataFiltered = [];
//
// // Load both datasets
// Promise.all([
//     d3.csv("data/returns.csv"),
//     d3.csv("data/sector-market-returns-index.csv")
// ]).then(function(datasets) {
//     const barData = datasets[0];
//     lollipopData = datasets[1];
//
//     // Process bar chart data
//     barData.forEach(d => {
//         // Assuming fields like 'income', 'growth', etc. exist in your barData.csv
//         d.year = monthToQuarter(d.year); // Convert to quarter-year format
//         // ... other processing for bar chart data
//     });
//
//     // Process lollipop chart data
//     lollipopData.forEach(d => {
//         d.yearQuarter = d.year; // Assuming it's already in quarter-year format
//         d.total = +d.total;
//         d.income = +d.income;
//         d.growth = +d.growth;
//         // ... other processing for lollipop chart data
//     });
//
//     lollipopDataFiltered = lollipopData; // Initially, filtered data is same as original
//
//     // Initialize the charts
//     initBarChart(barData);
//     updateLollipopChart(lollipopDataFiltered);
// });
//
// // Function to initialize the bar chart
// function initBarChart(data) {
//     // Define the scales for the bar chart
//     const xScale = d3.scaleBand()
//         .range([0, widthBar])
//         .domain(data.map(d => d.year))
//         .padding(0.1);
//
//     const yScale = d3.scaleLinear()
//         .domain([0, d3.max(data, d => Math.max(d.total, d.income, d.growth))])
//         .range([heightBar, 0]);
//
//     // Append X and Y axes to the SVG
//     svgBar.append("g")
//         .attr("transform", `translate(0, ${heightBar})`)
//         .call(d3.axisBottom(xScale));
//
//     svgBar.append("g")
//         .call(d3.axisLeft(yScale));
//
//     // Draw bars for the bar chart
//     svgBar.selectAll(".bar")
//         .data(data)
//         .enter()
//         .append("rect")
//         .attr("class", "bar")
//         .attr("x", d => xScale(d.year))
//         .attr("width", xScale.bandwidth())
//         .attr("y", d => yScale(d.total)) // Assuming 'total' is a field in your data
//         .attr("height", d => heightBar - yScale(d.total))
//         .attr("fill", "#69b3a2");
//
//     // Brush functionality
//     const brush = d3.brushX()
//         .extent([[0, 0], [widthBar, heightBar]])
//         .on("end", brushended);
//
//     svgBar.append("g")
//         .attr("class", "brush")
//         .call(brush);
//
//     // Brush event handler
//     function brushended(event) {
//         if (!event.selection) {
//             lollipopDataFiltered = lollipopData; // Reset to original data if no selection
//             updateLollipopChart(lollipopDataFiltered);
//             return;
//         }
//
//         // Get the selected range
//         var selectedRange = event.selection.map(xScale.invert);
//         updateLollipopChartBasedOnBarChart(selectedRange);
//     }
// }
//
//
// // Function to update the lollipop chart based on the selected range from the bar chart
// function updateLollipopChartBasedOnBarChart(selectedRange) {
//     const [start, end] = selectedRange.map(monthToQuarter);
//     lollipopDataFiltered = lollipopData.filter(d =>
//         d.yearQuarter >= start && d.yearQuarter <= end
//     );
//     updateLollipopChart(lollipopDataFiltered);
// }
//
// // Function to update the lollipop chart
// function updateLollipopChart(data) {
//     // Clear existing elements from the SVG
//     svgLollipop.selectAll("*").remove();
//
//     // Define scales for the lollipop chart
//     const xScaleLollipop = d3.scaleLinear()
//         .domain([0, d3.max(data, d => d[selectedMetric])]) // Use the selectedMetric to determine the scale
//         .range([0, widthLollipop]);
//
//     const yScaleLollipop = d3.scaleBand()
//         .domain(data.map(d => d.segment)) // Assuming 'segment' is a field in your data
//         .range([heightLollipop, 0])
//         .padding(0.1);
//
//     // Append X and Y axes to the SVG
//     svgLollipop.append("g")
//         .attr("transform", `translate(0, ${heightLollipop})`)
//         .call(d3.axisBottom(xScaleLollipop));
//
//     svgLollipop.append("g")
//         .call(d3.axisLeft(yScaleLollipop))
//         .style("font-size", "12px")
//         .style("color", "white");
//
//     // Draw the lines (sticks) of the lollipop chart
//     svgLollipop.selectAll(".line")
//         .data(data)
//         .enter()
//         .append("line")
//         .attr("x1", d => xScaleLollipop(d[selectedMetric]))
//         .attr("x2", xScaleLollipop(0))
//         .attr("y1", d => yScaleLollipop(d.segment))
//         .attr("y2", d => yScaleLollipop(d.segment))
//         .attr("stroke", "grey");
//
//     // Draw the circles (heads) of the lollipop chart
//     svgLollipop.selectAll(".circle")
//         .data(data)
//         .enter()
//         .append("circle")
//         .attr("cx", d => xScaleLollipop(d[selectedMetric]))
//         .attr("cy", d => yScaleLollipop(d.segment))
//         .attr("r", 4)
//         .style("fill", "#69b3a2")
//         .attr("stroke", "black");
//
//     // Optionally, add code for tooltips, interactions, or other visual enhancements
// }
// // Additional helper functions (e.g., for creating bar chart, lollipop chart, etc.) go here
//

// Make sure to include the D3.js library in your HTML

// SVG Size for bar chart
let marginBar = { top: 20, right: 30, bottom: 100, left: 50 },
    widthBar = 960 - marginBar.left - marginBar.right,
    heightBar = 500 - marginBar.top - marginBar.bottom;

// SVG Size for lollipop chart
let marginLollipop = { top: 20, right: 30, bottom: 0, left: 50 },
    widthLollipop = 660 - marginLollipop.left - marginLollipop.right,
    heightLollipop = 400 - marginLollipop.top - marginLollipop.bottom;

// Create SVG container for bar chart
const svgBar = d3.select("#bar-area").append("svg")
    .attr("width", widthBar + marginBar.left + marginBar.right)
    .attr("height", heightBar + marginBar.top + marginBar.bottom)
    .append("g")
    .attr("transform", `translate(${marginBar.left}, ${marginBar.top})`);

// Create SVG container for lollipop chart
const svgLollipop = d3.select("#lollipop-area").append("svg")
    .attr("width", widthLollipop + marginLollipop.left + marginLollipop.right)
    .attr("height", heightLollipop + marginLollipop.top + marginLollipop.bottom)
    .append("g")
    .attr("transform", `translate(${marginLollipop.left}, ${marginLollipop.top})`);

// Dropdown for lollipop chart selection
let selectedMetric = "total"; // Initial selected metric
d3.select("#lollipop-area")
    .append("select")
    .attr("id", "metric-select")
    .selectAll("option")
    .data(["total", "income", "growth"])
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

d3.select("#metric-select").on("change", function() {
    selectedMetric = d3.select(this).property("value");
    updateLollipopChart(lollipopDataFiltered);
});

// Global data variables
let lollipopData = [];
let lollipopDataFiltered = [];
let xScaleBar, yScaleBar;

// Load both datasets
Promise.all([
    d3.csv("data/returns.csv"),
    d3.csv("data/sector-market-returns-index.csv")
]).then(function(datasets) {
    const barData = datasets[0];
    lollipopData = datasets[1];

    // Process bar chart data
    barData.forEach(d => {
        d.total = +d.total; // Convert string to number
        d.year = monthToQuarter(d.year); // Convert to quarter-year format
    });

    // Process lollipop chart data
    lollipopData.forEach(d => {
        d.total = +d.total;
        d.income = +d.income;
        d.growth = +d.growth;
        d.yearQuarter = d.year; // Assuming it's already in quarter-year format
    });

    lollipopDataFiltered = lollipopData; // Initially, filtered data is same as original

    // Initialize the charts
    initBarChart(barData);
    updateLollipopChart(lollipopDataFiltered);
});

// Function to initialize the bar chart
function initBarChart(data) {
    // Define the scales for the bar chart
    xScaleBar = d3.scaleBand()
        .range([0, widthBar])
        .domain(data.map(d => d.year))
        .padding(0.1);

    yScaleBar = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.total)])
        .range([heightBar, 0]);

    // Append X and Y axes to the SVG
    svgBar.append("g")
        .attr("transform", `translate(0, ${heightBar})`)
        .call(d3.axisBottom(xScaleBar));

    svgBar.append("g")
        .call(d3.axisLeft(yScaleBar));

    // Draw bars for the bar chart
    svgBar.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScaleBar(d.year))
        .attr("width", xScaleBar.bandwidth())
        .attr("y", d => yScaleBar(d.total))
        .attr("height", d => heightBar - yScaleBar(d.total))
        .attr("fill", "#69b3a2");

    // Brush functionality
    const brush = d3.brushX()
        .extent([[0, 0], [widthBar, heightBar]])
        .on("end", brushended);

    svgBar.append("g")
        .attr("class", "brush")
        .call(brush);

    // Brush event handler
    function brushended(event) {
        if (!event.selection) {
            lollipopDataFiltered = lollipopData; // Reset to original data if no selection
            updateLollipopChart(lollipopDataFiltered);
            return;
        }

        // Get the selected range
        var selectedRange = event.selection.map(d => xScaleBar.invert(d));
        updateLollipopChartBasedOnBarChart(selectedRange);
    }
}

// Function to update the lollipop chart based on the selected range from the bar chart
function updateLollipopChartBasedOnBarChart(selectedRange) {
    const [start, end] = selectedRange;
    lollipopDataFiltered = lollipopData.filter(d =>
        d.yearQuarter >= start && d.yearQuarter <= end
    );
    updateLollipopChart(lollipopDataFiltered);
}

// Function to update the lollipop chart
function updateLollipopChart(data) {
    // Clear existing elements from the SVG
    svgLollipop.selectAll("*").remove();

    // Define scales for the lollipop chart
    const xScaleLollipop = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[selectedMetric])]) // Use the selectedMetric to determine the scale
        .range([0, widthLollipop]);

    const yScaleLollipop = d3.scaleBand()
        .domain(data.map(d => d.segment)) // Assuming 'segment' is a field in your data
        .range([heightLollipop, 0])
        .padding(0.1);

    // Append X and Y axes to the SVG
    svgLollipop.append("g")
        .attr("transform", `translate(0, ${heightLollipop})`)
        .call(d3.axisBottom(xScaleLollipop));

    svgLollipop.append("g")
        .call(d3.axisLeft(yScaleLollipop));

    // Draw the lines (sticks) of the lollipop chart
    svgLollipop.selectAll(".line")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", d => xScaleLollipop(d[selectedMetric]))
        .attr("x2", xScaleLollipop(0))
        .attr("y1", d => yScaleLollipop(d.segment))
        .attr("y2", d => yScaleLollipop(d.segment))
        .attr("stroke", "grey");

    // Draw the circles (heads) of the lollipop chart
    svgLollipop.selectAll(".circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScaleLollipop(d[selectedMetric]))
        .attr("cy", d => yScaleLollipop(d.segment))
        .attr("r", 4)
        .style("fill", "#69b3a2")
        .attr("stroke", "black");
}

// Function to convert month-year to quarter-year format
function monthToQuarter(monthYear) {
    const [month, year] = monthYear.split("-");
    const quarterMap = { Mar: "Q1", Jun: "Q2", Sep: "Q3", Dec: "Q4" };
    const fullYear = year.length === 2 ? '20' + year : year;
    return fullYear + " " + quarterMap[month];
}

// // SVG Size
// let margin = { top: 20, right: 30, bottom: 40, left: 50 };
// let width = 400 - margin.left - margin.right;
// let height = 300 - margin.top - margin.bottom;
//
// // Create SVG container
// const svg = d3.select("#lollipop-area").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", `translate(${margin.left}, ${margin.top})`);
//
// // Sample data for Mar-20
// let sampleData = [
//     { segment: 'Retail', value: 100 },
//     { segment: 'Office', value: 200 },
//     { segment: 'Industrial', value: 150 },
//     // Add other segments as needed
// ];
//
// // Define scales
// const xScale = d3.scaleLinear()
//     .domain([0, d3.max(sampleData, d => d.value)])
//     .range([0, width]);
//
// const yScale = d3.scaleBand()
//     .domain(sampleData.map(d => d.segment))
//     .range([0, height])
//     .padding(0.1);
//
// // Draw the lines (sticks) of the lollipop chart
// svg.selectAll(".line")
//     .data(sampleData)
//     .enter()
//     .append("line")
//     .attr("x1", d => xScale(d.value))
//     .attr("x2", xScale(0))
//     .attr("y1", d => yScale(d.segment))
//     .attr("y2", d => yScale(d.segment))
//     .attr("stroke", "grey");
//
// // Draw the circles (heads) of the lollipop chart
// svg.selectAll(".circle")
//     .data(sampleData)
//     .enter()
//     .append("circle")
//     .attr("cx", d => xScale(d.value))
//     .attr("cy", d => yScale(d.segment))
//     .attr("r", 5)
//     .style("fill", "#69b3a2")
//     .attr("stroke", "black");
//
// // Draw the Y axis
// svg.append("g")
//     .call(d3.axisLeft(yScale));
//
// // Draw the X axis
// svg.append("g")
//     .attr("transform", `translate(0, ${height})`)
//     .call(d3.axisBottom(xScale));
