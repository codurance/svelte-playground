var margin = {top: 20, right: 30, bottom: 40, left: 90},
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var svg = d3.select("#horizontal-barchart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

//amount of sold weapon per country
var data =
  [
    {
      "Country": "United States",
      "Value": "12394"
    },
    {
      "Country": "Russia",
      "Value": "6148"
    },
    {
      "Country": "Germany (FRG)",
      "Value": "1653"
    },
    {
      "Country": "France",
      "Value": "2162"
    },
    {
      "Country": "United Kingdom",
      "Value": "1214"
    },
    {
      "Country": "China",
      "Value": "1131"
    },
    {
      "Country": "Spain",
      "Value": "814"
    },
    {
      "Country": "Netherlands",
      "Value": "1167"
    },
    {
      "Country": "Italy",
      "Value": "660"
    },
    {
      "Country": "Israel",
      "Value": "1263"
    }
  ]

var x = d3.scaleLinear()
  .domain([0, 13000])
  .range([ 0, width]);

svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .selectAll("text")
  .attr("transform", "translate(-10,0)rotate(-45)")
  .style("text-anchor", "end");

var y = d3.scaleBand()
  .range([ 0, height ])
  .domain(data.map(function(d) { return d.Country; }))
  .padding(.1);

svg.append("g")
  .call(d3.axisLeft(y))

svg.selectAll("myRect")
  .data(data)
  .enter()
  .append("rect")
  .attr("x", x(0) )
  .attr("y", function(d) { return y(d.Country); })
  .attr("width", function(d) { return x(d.Value); })
  .attr("height", y.bandwidth() )
  .attr("fill", "#69b3a2")
