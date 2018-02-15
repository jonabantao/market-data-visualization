import * as d3 from 'd3';
import displayStockChart from './stock_chart';

//Initialization of the chart
const SYMBOLS = 'amzn,hd,hsbc,baba,tsm,nvda,aapl,amd,chl,c,nvs,fb,googl,v,pfe,msft,nflx,orcl,cmg,tsla,vz,wmt,adbe,ma,amat,cost,t,unh,intc,ge,wfc,amd,pg,twtr,panw,box,bud,sq,brk.a,jnj,xom,jpm,bac';
const TIME = {
  oneMonth: '1m',
  oneYear: '1y',
  twoYears: '2y',
  fiveYears: '5y',
};
let timeFrame = TIME.oneYear;
let url = `https://api.iextrading.com/1.0/stock/market/batch?symbols=${SYMBOLS}&types=quote,news,chart,earnings&range=${timeFrame}&last=3`;

const MARGIN = { top: 40, right: 20, bottom: 60, left: 80 };
const width = 1400 - MARGIN.left - MARGIN.right;
const height = 700 - MARGIN.top - MARGIN.bottom;

const x = d3.scaleLinear()
  .range([0, width]);

const y = d3.scaleLinear()
  .range([height, 0]);

const chart = d3.select('#chart')
  .attr('width', width + MARGIN.left + MARGIN.right)
  .attr('height', height + MARGIN.top + MARGIN.bottom)
  .append('g')
  .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

let tooltip = d3.select('.data-chart').append('div')
  .attr('class', 'tooltip')
  .style('visibility', 'hidden');

d3.json(url, (error, res) => {
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
  x.domain(d3.extent(companies, d => d.marketCap));
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

  const formatTotalReturnText = totalReturn => {
    let returnText = document.getElementById('total-return');
    returnText.innerHTML = `${totalReturn}%`;

    if (totalReturn >= 0) {
      returnText.style.color = "green";
    } else {
      returnText.style.color = "red";
    }
  };

  const activateToolTip = d => {
    tooltip
      .style('visibility', 'visible')
      .html(
        `
        <h2 class="stock-title">${d.companyName} (${d.symbol})</h2>
        <div class="stock-info">
          Market Cap: ${d.marketCap}B<br />
          ${timeFrame} Total Return: <span id="total-return"></span><br />
          P/E Ratio: ${d.peRatio === 0 ? 'Not Applicable' : d.peRatio}
        </div>
        <svg id="sub-chart"></svg>
      `
      );

    formatTotalReturnText(d.totalReturn);
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
      .force('collide', d3.forceCollide(d => d.radius * 0.95));

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
    url = `https://api.iextrading.com/1.0/stock/market/batch?symbols=${SYMBOLS}&types=quote,news,chart,earnings&range=${newTime}&last=3`;

    // Change totalReturn to find new y on chart update then call simulate
    d3.json(url, (_, updatedCompanies) => {
      const updated = Object.values(updatedCompanies);

      companies.forEach((oldData, i) => {
        oldData.totalReturn = findTotalReturn(updated[i].chart);
        oldData.chart = updated[i].chart;
      });
      
      // Update y-axis and transition out/in
      y.domain(d3.extent(companies, d => d.totalReturn));

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
    });
  };

  // Updating based on radio buttons
  d3.select('#one-month').on('click', () => updateTimeFrame(TIME.oneMonth));
  d3.select('#one-year').on('click', () => updateTimeFrame(TIME.oneYear));
  d3.select('#two-years').on('click', () => updateTimeFrame(TIME.twoYears));
  d3.select('#five-years').on('click', () => updateTimeFrame(TIME.fiveYears));

  const yAxis = d3.axisLeft(y).ticks(5);
  const xAxis = d3.axisBottom(x);

  const alignAxes = () => {
    const yRange = d3.extent(companies, d => d.totalReturn);

    if (yRange[0] < 0 && yRange[1] > 0) {
      return (yRange[1] / (yRange[1] - yRange[0])) * height;
    } else {
      return height;
    }
  };

  chart.append('g')
    .attr('transform', `translate(0, ${alignAxes()})`)
    .attr('class', 'axis-label x-axis')
    .call(xAxis);

  chart.append('text')
    .attr('transform', `translate(${width / 2}, ${height + MARGIN.top + 10})`)
    .attr('class', 'chart-label')
    .text('Market Cap (in billions)');

  chart.append('g')
    .attr('class', 'axis-label y-axis')
    .call(yAxis);

  chart.append('text')
    .attr("transform", `translate(${0 - MARGIN.left}, ${height / 2}) rotate(-90)`)
    .attr('dy', '1em')
    .attr('class', 'chart-label')
    .text('Total Return (%)');
});