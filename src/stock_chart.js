import * as d3 from 'd3';

const displayStockChart = (chartData, chartId) => {
  const subSvg = d3.select(chartId);
  const chartWidth = 600;
  const chartHeight = 130;
  const stockChart = subSvg.append('g')
    .attr('transform', `translate(0, 0)`);

  const chartXAxis = d3.scaleTime()
    .rangeRound([0, chartWidth]);

  const chartYAxis = d3.scaleLinear()
    .rangeRound([chartHeight, 0]);

  const parseTime = d3.timeParse('%Y-%m-%d');

  const chartInfo = chartData.map(data => ({
    date: parseTime(data.date),
    close: parseFloat(data.close),
  }));

  const stockChartLine = d3.line()
    .x(data => chartXAxis(data.date))
    .y(data => chartYAxis(data.close));

  chartXAxis.domain(d3.extent(chartInfo, data => data.date));
  chartYAxis.domain(d3.extent(chartInfo, data => data.close));

  stockChart.append("g")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(d3.axisBottom(chartXAxis))
    // Used to remove axis line
    .select(".domain")
    .remove();


  stockChart.append('path')
    .datum(chartInfo)
    .attr('class', 'stock-chart-line')
    .attr("d", stockChartLine);
};


export default displayStockChart;