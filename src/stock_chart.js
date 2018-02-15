import * as d3 from 'd3';

const displayStockChart = (chartData, chartId) => {
  const subSvg = d3.select(chartId);
  const CHART_MARGIN = { top: 25, left: 50 };
  const chartWidth = 650 - CHART_MARGIN.left;
  const chartHeight = 120 - CHART_MARGIN.top;
  const stockChart = subSvg.append('g')
    .attr('transform', `translate(${CHART_MARGIN.left}, ${CHART_MARGIN.top})`);

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

  const fillArea = d3.area()
    .x(data => chartXAxis(data.date))
    .y0(chartHeight)
    .y1(data => chartYAxis(data.close));

  chartXAxis.domain(d3.extent(chartInfo, data => data.date));
  chartYAxis.domain(d3.extent(chartInfo, data => data.close));

  stockChart.append('g')
    .attr('transform', 'translate(0,' + chartHeight + ')')
    .call(d3.axisBottom(chartXAxis).ticks(6));

  stockChart.append('g')
    .call(d3.axisLeft(chartYAxis).ticks(3));

  stockChart.append('path')
    .datum(chartInfo)
    .attr('class', 'stock-chart-line')
    .attr('d', stockChartLine);

  stockChart.append('path')
    .datum(chartInfo)
    .attr('class', 'fill-area')
    .attr('d', fillArea);
};


export default displayStockChart;