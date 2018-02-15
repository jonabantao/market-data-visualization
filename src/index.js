import * as d3 from 'd3';
import displayStockChart from './stock_chart';

//Initialization of the chart
const symbols = 'amzn,hd,hsbc,baba,tsm,nvda,aapl,amd,chl,c,nvs,fb,googl,v,pfe,msft,nflx,orcl,cmg,tsla,vz,wmt,adbe,ma,amat,cost,t,unh,intc,ge,wfc,amd,pg,twtr,panw,box,bud,sq,brk.a,jnj,xom,jpm,bac';
const time = {
  oneMonth: '1m',
  oneYear: '1y',
  twoYears: '2y',
  fiveYears: '5y',
};
let timeFrame = time.oneYear;
let url = `https://api.iextrading.com/1.0/stock/market/batch?symbols=${symbols}&types=quote,news,chart,earnings&range=${timeFrame}&last=3`;


const margin = { top: 40, right: 20, bottom: 60, left: 20 };
const width = 1400 - margin.left - margin.right;
const height = 700 - margin.top - margin.bottom;

const x = d3.scaleLinear()
  .range([0, width]);

const y = d3.scaleLinear()
  .range([height, 0]);

const chart = d3.select('#chart')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

let tooltip = d3.select('.data-chart').append('div')
  .attr('class', 'tooltip')
  .style('visibility', 'hidden');

d3.json(url, (err, res) => {
  let companies = Object.values(res);

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
    d.peRatio = d.quote.peRatio > 0 ? d.quote.peRatio : 0;
    d.companyName = d.quote.companyName;
    d.symbol = d.quote.symbol;
    d.color = d3.interpolateRainbow(Math.random());
  });

  // Idea to constrain circle size from 
  // http://chimera.labs.oreilly.com/books/1230000000345/ch07.html#_refining_the_plot
  let minPe = d3.min(companies, data => data.peRatio);
  let maxPe = d3.max(companies, data => data.peRatio);
  let radiusScale = d3.scaleSqrt().range([5,30]).domain([minPe, maxPe]);

  companies.forEach(d => {
    d.radius = radiusScale(d.peRatio);
  });

  // Set range of axes
  x.domain([-10, d3.max(companies, d => d.marketCap)]);
  y.domain(d3.extent(companies, d => d.totalReturn * 1.25));

  const mouseOver = function(d) {
    d3.select(this).raise().transition()
      .attr('opacity', '1')
      .duration('300')
      .attr('r', 35);

    activateToolTip(d);

    displayStockChart(d.chart, '#sub-chart');
  };

  const mouseOut = function(d) {
    d3.select(this).transition()
      .duration('300')
      .attr('opacity', 0.7)
      .attr('r', d.radius);
    
    hideToolTip();
  };

  const activateToolTip = d => {
    tooltip
      .style('visibility', 'visible')
      .html(
        `
        <h2 class="stock-title">${d.companyName} (${d.symbol})</h2>
        <div class="stock-info">
          Market Cap: ${d.marketCap}B<br />
          ${timeFrame} Total Return: ${d.totalReturn}%<br />
          P/E Ratio: ${d.peRatio === 0 ? 'Not Applicable' : d.peRatio}
        </div>
        <svg id="sub-chart"></svg>
      `
      );
  };

  const hideToolTip = () => {
    tooltip.style('visibility', 'hidden');
  };

  let circles = chart.selectAll('.stock')
    .data(companies)
    .enter().append('circle')
    .attr('class', 'stock')
    .attr('opacity', '0.7')
    .attr('fill', d => d.color)
    .attr('stroke', 'gray')
    .attr('r', d => d.radius)
    .on('mouseenter', mouseOver)
    .on('mouseleave', mouseOut);

  // Simulate entry and prevent collision
  const simulate = () => {
    const simulation = d3.forceSimulation()
      .force('x', d3.forceX(d => x(d.marketCap)).strength(0.1))
      .force('y', d3.forceY(d => y(d.totalReturn)).strength(0.1))
      .force('collide', d3.forceCollide(d => d.radius * 0.9).iterations(5));

    const ticked = () => {
      circles
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    };

    simulation.nodes(companies)
      .on('tick', ticked);
  };

  simulate();

  const updateTimeFrame = newTime => {
    timeFrame = newTime;
    url = `https://api.iextrading.com/1.0/stock/market/batch?symbols=${symbols}&types=quote,news,chart,earnings&range=${newTime}&last=3`;

    // Change totalReturn to find new y on chart update then call simulate
    d3.json(url, (_, updatedCompanies) => {
      const updated = Object.values(updatedCompanies);

      companies.forEach((oldData, i) => {
        oldData.totalReturn = findTotalReturn(updated[i].chart);
        oldData.chart = updated[i].chart;
      });

      y.domain(d3.extent(companies, d => d.totalReturn));

      simulate();
    });
  };

  d3.select('#one-month').on('click', () => updateTimeFrame(time.oneMonth));
  d3.select('#one-year').on('click', () => updateTimeFrame(time.oneYear));
  d3.select('#two-years').on('click', () => updateTimeFrame(time.twoYears));
  d3.select('#five-years').on('click', () => updateTimeFrame(time.fiveYears));


  chart.append('g')
    .attr('transform', `translate(0, ${height})`)
    .attr('class', 'axis-label')
    .call(d3.axisBottom(x));


  chart.append('text')
    .attr('transform', `translate(${width / 2}, ${height + margin.top + 10})`)
    .style('text-anchor', 'middle')
    .attr('class', 'chart-label')
    .text('Market Cap (in billions)');


  chart.append('text')
    .attr("transform", `translate(${0 - margin.left}, ${height / 2}) rotate(-90)`)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .attr('class', 'chart-label')
    .text('Total Return (%)');
});