# Market Data Visualization
### [Live Link](https://jonabantao.github.io/market-data-visualization/)

This JavaScript mini-project was created in less than a week exploring the D3.js library which was new to me at the time. 

Users are able to select the timeframe from the graph and view individual company's performance in the stock market within that timeframe. 

# Features
* Display of the main graph showing selected companies, X-axis for their current market capitalization, Y-axis for the rate of return.
* Axes are changed in each selection to match the data.
* Mousing over each bubble will display a popup of the select company details and their stock performance

# D3.js Functionality
Using the D3 library allowed the project to dynamically move the axes upon selecting a different timeframe. With D3, you are able to select an element within the SVG and call functions within the D3 library to manipulate it.
```
let updateChartAxis = d3.select('#chart').transition();

updateChartAxis.select('.y-axis')
  .duration(500)
  .call(yAxis);

updateChartAxis.select('.x-axis')
  .duration(500)
  .attr('transform', `translate(0, ${alignAxes()})`)
  .attr('class', 'axis-label x-axis')
  .call(xAxis);

simulate();
```

![alt text](https://i.imgur.com/P2bJgRS.gif "Demonstration")

# Technologies Used
* Canvas
* d3.JS
* Webpack
* IEX API for extracting market data

# Possible Additional Features
* Ability to add/remove companies to the graph
* Able to transition the main graph to another, such as a bar chart to display more power of D3.js