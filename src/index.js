import * as d3 from 'd3';
// https://api.iextrading.com/1.0/stock/market/batch?symbols=aapl,fb&types=quote,news,chart,earnings&range=1y&last=3
// APPL.quote
// APPL.chart = array last to now
// ^^ Request to be used to extract data (initial load)
// https://api.iextrading.com/1.0/stock/aapl/batch?types=quote,news,chart,earnings&range=1y&last=3
// ^^ When user requests data
// d3.json(url, (error, response))


window.d3 = d3;

const url = "https://api.iextrading.com/1.0/stock/market/batch?symbols=amzn,nvda,aapl,fb,googl,msft,nflx,tsla&types=quote,news,chart,earnings&range=1y&last=3";
// data.quote.peRatio
// data.chart

const margin = { top: 40, right: 20, bottom: 60, left: 60 };
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

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

  const formatMarketCap = marketCap => (
    parseFloat((marketCap / 1000000000).toFixed(2))
  );

  const findTotalReturn = prices => (
    parseFloat((prices[prices.length - 1].changeOverTime * 100).toFixed(2))
  );

  companies.forEach(d => {
    d.marketCap = formatMarketCap(d.quote.marketCap);
    d.totalReturn = findTotalReturn(d.chart);
    d.peRatio = d.quote.peRatio;
    d.companyName = d.quote.symbol;
  });

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
    .attr('r', 5)
    .attr('cx', d => x(d.marketCap))
    .attr('cy', d => y(d.totalReturn));


  chart.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  chart.append('g')
    .call(d3.axisLeft(y));
});