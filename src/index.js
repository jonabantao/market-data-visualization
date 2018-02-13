import * as d3 from 'd3';
// https://api.iextrading.com/1.0/stock/market/batch?symbols=aapl,fb&types=quote,news,chart,earnings&range=1y&last=3
// APPL.quote
// APPL.chart = array last to now
// ^^ Request to be used to extract data (initial load)
// https://api.iextrading.com/1.0/stock/aapl/batch?types=quote,news,chart,earnings&range=1y&last=3
// ^^ When user requests data
// d3.json(url, (error, response))


const symbols = 'amzn,hd,hsbc,baba,tsm,nvda,aapl,chl,c,nvs,fb,googl,v,pfe,msft,nflx,orcl,cmg,tsla,vz,wmt,adbe,ma,amat,cost,t,unh,intc,ge,wfc,amd,pg,twtr,panw,box,bud,sq,brk.a,jnj,xom,jpm,bac';
const url = `https://api.iextrading.com/1.0/stock/market/batch?symbols=${symbols}&types=quote,news,chart,earnings&range=1y&last=3`;


const margin = { top: 40, right: 20, bottom: 60, left: 60 };
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

chart.append('text')
  .attr('transform', `translate(${width / 2}, ${margin.top - 54})`)
  .attr('id', 'title')
  .text('Total Return');


d3.json(url, (err, res) => {
  const companies = Object.values(res);

  // Helper functions
  const formatMarketCap = marketCap => (
    parseFloat((marketCap / 1000000000).toFixed(2))
  );

  const findTotalReturn = prices => (
    parseFloat((prices[prices.length - 1].changeOverTime * 100).toFixed(2))
  );
  
  // Extract data
  companies.forEach((d, i) => {
    d.marketCap = formatMarketCap(d.quote.marketCap);
    d.totalReturn = findTotalReturn(d.chart);
    d.peRatio = d.quote.peRatio;
    d.companyName = d.quote.symbol;
    d.color = d3.interpolateRainbow(Math.random());
  });

  // Idea to constrain circle size from 
  // http://chimera.labs.oreilly.com/books/1230000000345/ch07.html#_refining_the_plot
  let minPe = d3.min(companies, data => data.peRatio);
  let maxPe = d3.max(companies, data => data.peRatio);
  let radiusScale = d3.scaleLinear().range([5,25]).domain([minPe, maxPe]);

  companies.forEach(d => {
    d.radius = radiusScale(d.peRatio);
  });

  // Set range of axes
  x.domain([0, d3.max(companies, d => d.marketCap)]);
  y.domain(d3.extent(companies, d => d.totalReturn));

  chart.selectAll('dot')
    .data(companies)
    .enter().append('circle')
    .attr('opacity', '0.7')
    .attr('fill', d => d.color)
    .attr('stroke', 'gray')
    .attr('r', d => d.radius)
    .attr('cx', d => x(d.marketCap))
    .attr('cy', d => y(d.totalReturn));

  

  // x axis information
  // helper function to move x-axis to interect at 0 with y if negative returns
  const translateRange = () => {
    let yRange = d3.extent(companies, d => d.totalReturn);

    if (yRange[0] > 0) {
      return height;
    } else {
      return (yRange[1] / (yRange[1] - yRange[0])) * height;
    }
  };

  chart.append('g')
    .attr('transform', `translate(0, ${translateRange()})`)
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