const FINAL = "https://gist.githubusercontent.com/damianpumar/862fe8d75f92a0b114ad4ae2bf128e13/raw/21dc4b07207455034b1e48022ae53f3a84fe5ece/finaltopojson"

const map = d3.select("#map");
const filters = d3.select("#filters");
const width = map.node().getBoundingClientRect().width;
const height = width / .5;
const COLORS = ["#ffffff", "#ffd333", "#ffde66", "#fff4cc", "#ffe999"];
const svg = map
  .append("svg")
  .attr("viewBox", "0 0 " + width + " " + height )
  .attr("preserveAspectRatio", "xMinYMin");
const path = d3.geoPath();
var tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);


function render(indexOfFilter) {
  svg.selectAll("path").remove()
  svg.selectAll("text").remove()

d3.json(FINAL).then(barcelona => {
const features = topojson.feature(barcelona, barcelona.objects.ABS_2018).features;

const tooltipValues = barcelona.objects.ABS_2018.geometries.map(({properties}) => properties.VALORES ? properties.VALORES[indexOfFilter] : 0)
const quantize = d3
  .scaleQuantize()
  .domain(d3.extent(tooltipValues))
  .range(COLORS)

function handleMouseOver(d, i) {
  d3.select(this).attr('fill', "orange");
  tooltip.transition().duration(200).style("opacity", .9);
}

function handleMouseMove(d) {
  tooltip.html(d.properties.NOMABS + "<br />" + d.properties.NOMAGA + "<br />" + d.properties.NOMSS + "<br />" + d.properties.VALORES[indexOfFilter])
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 50) + "px");
}

function handleMouseOut(d, i) {
  const quantizedColor = quantize(Number(d.properties.VALORES ? d.properties.VALORES[indexOfFilter] : 0))
  d3.select(this).attr('fill', quantizedColor);
  tooltip.transition().duration(500).style("opacity", 0);
}

svg
  .selectAll("path")
  .data(features)
  .enter()
  .append("path")
  .attr("d", path)
    .attr('fill', d => {
     return quantize(Number(d.properties.VALORES ? d.properties.VALORES[indexOfFilter] : 0))
    })
  .attr('stroke', 'black')
  .on("mouseover", handleMouseOver)
  .on("mousemove", handleMouseMove)
  .on("mouseout", handleMouseOut)

svg
  .selectAll("text")
  .data(features)
  .enter()
  .append("text")
  .attr("class", "label")
  .attr("font-size", "10")
  .attr("transform", d => `translate(${path.centroid(d)})`)
  .text(({ properties }) => properties.NOMABS.replace('Barcelona - ', ''))

}).catch(err=> console.error(err))

}

filters
  .selectAll("span")
  .data([0,1,2])
  .enter()
  .append("span")
  .attr("class", "button")
    .on("click", (d) =>{
      render(d)
    })
  .append("span")
    .text((d)=> {
      return "filter " + d
    })

render(0)
