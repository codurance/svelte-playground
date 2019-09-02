const URL = "https://gist.githubusercontent.com/glippi/dbb2589e95870c2a7d2b563078a5baf8/raw/e91a687ec064cf13ec4e3ea9ec02194899facd75/ABS_2018.json"

const svg = d3.select("svg");
const width = svg.attr("width");
const height = svg.attr("height");
const path = d3.geoPath();


d3.json(URL).then(barcelona => {
  svg
    .selectAll("path")
    .data(barcelona.objects.ABS_2018.geometries)
    .enter()
    .append("path")
    .attr("d", d => path(topojson.mesh(barcelona)))
    .attr('fill', 'none')
    .attr('stroke', 'black')
}).catch(err=> console.error(err))
