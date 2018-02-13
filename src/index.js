import * as d3 from 'd3';
// https://api.iextrading.com/1.0/stock/market/batch?symbols=aapl,fb&types=quote,news,chart,earnings&range=1y&last=3
// APPL.quote
// APPL.chart = array last to now
// ^^ Request to be used to extract data (initial load)
// https://api.iextrading.com/1.0/stock/aapl/batch?types=quote,news,chart,earnings&range=1y&last=3
// ^^ When user requests data
// d3.json(url, (error, response))


const symbols = 'amzn,nvda,aapl,fb,googl,msft,nflx,tsla,wmt,adbe,amat,cost,intc';
const url = `https://api.iextrading.com/1.0/stock/market/batch?symbols=${symbols}&types=quote,news,chart,earnings&range=1m&last=3`;
// data.quote.peRatio
// data.chart

const margin = { top: 40, right: 20, bottom: 60, left: 60 };
const width = 1600 - margin.left - margin.right;
const height = 900 - margin.top - margin.bottom;

const x = d3.scaleLinear()
  .range([0, width]);

const y = d3.scaleLinear()
  .range([height, 0]);

const chart = d3.select('#chart')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

chart.append('text')
  .attr('transform', `translate(${width / 2}, ${margin.top - 54})`)
  .attr('id', 'title')
  .text('Market Data');


d3.json(url, (err, data) => {
  const companies = Object.values(data);

  // Helper functions
  const formatMarketCap = marketCap => (
    parseFloat((marketCap / 1000000000).toFixed(2))
  );

  const findTotalReturn = prices => (
    parseFloat((prices[prices.length - 1].changeOverTime * 100).toFixed(2))
  );

  // Extract data
  companies.forEach(d => {
    d.marketCap = formatMarketCap(d.quote.marketCap);
    d.totalReturn = findTotalReturn(d.chart);
    d.peRatio = d.quote.peRatio;
    d.companyName = d.quote.symbol;
  });

  // Set range of axes
  x.domain([
    d3.min(companies, d => d.marketCap - 100),
    d3.max(companies, d => d.marketCap + 100)
  ]);

  y.domain([
    d3.min(companies, d => d.totalReturn - 25),
    d3.max(companies, d => d.totalReturn + 25)
  ]);

  chart.selectAll('dot')
    .data(companies)
    .enter().append('circle')
    .attr('opacity', '0.5')
    .attr('fill', 'red')
    .attr('r', d => d.peRatio * 0.5)
    .attr('cx', d => x(d.marketCap))
    .attr('cy', d => y(d.totalReturn));

  // x axis information
  chart.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  chart.append('text')
    .attr('transform', `translate(${width / 2}, ${height + margin.top + 10})`)
    .style('text-anchor', 'middle')
    .text('Market Cap (in billions)');

  // y axis information
  chart.append('g')
    .call(d3.axisLeft(y));

  chart.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - (height / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Total Return (%)');
});