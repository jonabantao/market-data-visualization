import * as d3 from 'd3';

const symbols = 'amzn,hd,hsbc,baba,tsm,nvda,aapl,amd,chl,c,nvs,fb,googl,v,pfe,msft,nflx,orcl,cmg,tsla,vz,wmt,adbe,ma,amat,cost,t,unh,intc,ge,wfc,amd,pg,twtr,panw,box,bud,sq,brk.a,jnj,xom,jpm,bac';
const url = `https://api.iextrading.com/1.0/stock/market/batch?symbols=${symbols}&types=quote,news,chart,earnings&range=1m&last=3`;


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
  .append('svg')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

let tooltip = d3.select('#chart').append('div')
  .attr('class', 'tooltip')
  // .style('opacity', 0)
  .style('visibility', 'hidden');

// chart.append('text')
//   .attr('transform', `translate(${width / 2}, ${margin.top - 54})`)
//   .attr('id', 'title')
//   .text('Total Return');

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
  let radiusScale = d3.scaleSqrt().range([10,30]).domain([minPe, maxPe]);

  companies.forEach(d => {
    d.radius = radiusScale(d.peRatio);
  });

  // Set range of axes
  x.domain([-10, d3.max(companies, d => d.marketCap + 25)]);
  y.domain(d3.extent(companies, d => d.totalReturn * 1.25));

  const mouseOver = function(d) {
    d3.select(this).raise().transition()
      .attr('opacity', '1')
      .duration('300')
      .attr('r', 35)
      .attr('cursor', 'pointer');
  };

  const mouseOut = function(d) {
    d3.select(this).transition()
      // .attr('opacity', 0.7)
      .attr('fill', d.color)
      .attr('r', d.radius);
  };

  const mouseClick = function(d) {
    tooltip.transition()
      .duration(200)
      .style('visibility', 'visible');
    tooltip.html(d.companyName)
      .style('top', `${d3.event.pageY}px`)
      .style('left', `${d3.event.pageX}px`);
  };

  let circles = chart.selectAll('.stock')
    .data(companies)
    .enter().append('circle')
    .attr('class', 'stock')
    // .attr('opacity', '0.7')
    .attr('fill', d => d.color)
    .attr('stroke', 'gray')
    .attr('r', d => d.radius)
    .on('mouseover', mouseOver)
    .on('mouseout', mouseOut)
    .on('click', mouseClick);

  // Simulate entry and prevent collision
  const simulation = d3.forceSimulation()
    .force('x', d3.forceX(d => x(d.marketCap)).strength(0.1))
    .force('y', d3.forceY(d => y(d.totalReturn)).strength(0.1))
    .force('collide', d3.forceCollide(d => d.radius * 0.75));
    
  const ticked = () => {
    circles
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  };

  simulation.nodes(companies)
    .on('tick', ticked);

  // x axis information
  // helper function to move x-axis to interect at 0 with y if negative returns
  // const translateRange = () => {
  //   let yRange = d3.extent(companies, d => d.totalReturn);

  //   if (yRange[0] > 0) {
  //     return height;
  //   } else {
  //     return (yRange[1] / (yRange[1] - yRange[0])) * height;
  //   }
  // };

  chart.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  chart.append('text')
    .attr('transform', `translate(${width / 2}, ${height + margin.top + 30})`)
    .style('text-anchor', 'middle')
    .text('Market Cap (in billions)');

  chart.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - (height / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Total Return (%)');
});