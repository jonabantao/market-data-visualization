# Background
This project is a data visualization of selected companies' stock market performance starting at the beginning of the American recovery from the Great Recession. 

# MVPs
- [ ] Display of the main graph showing selected companies, X-axis for their current market capitalization, Y-axis for the rate of return.
- [ ] Bubbles for each company scale with their current P/E ratio.
- [ ] Bubbles are clickable and will show a modal of the companies information.
- [ ] Will extract the information for the company via the IEXtrading API.


## Bonus
- [ ] Have the graph show the growth (or loss) of a company's market cap and rate of return. Similiar to how the [Wealth and Health of Nations](https://bost.ocks.org/mike/nations/) graph works.


# Wireframes
![alt text](https://i.imgur.com/BDULgV2.png "Main graph")

![alt text](https://i.imgur.com/Fxhemg4.png "Company information")

# Technologies Used
* Canvas
* d3.JS
* Webpack for script bundling
* IEXTrading for extracting market data (unfortunately limited to five years)

# Implementation Timeline
## Weekend
- [ ] Begin studying d3.JS and IEX API documentation

## Day 1
- [ ] Continue learning d3.JS
- [ ] Build a Canvas for the main graph

## Day 2
- [ ] Set up the API calls needed to grab data for the project

## Day 3
- [ ] Styling
- [ ] Modal views for each company

## Day 4
- [ ] Proofread
- [ ] Ensure everything is working
- [ ] Try not to panic
- [ ] ~~Panic~~