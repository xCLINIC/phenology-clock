'use strict'
function ƒ(str) { return function(obj) { return str ? obj[str] : obj; }}

var margin = {top: 40, right:40, bottom: 40, left: 50},
    w = window.innerWidth - margin.left - margin.right,
    h = window.innerWidth - margin.top - margin.bottom,
    d1 = new Date('1/1/2014'),
    d2 = new Date('1/1/2015'),
    t = d3.scale.linear().domain([d1,d2]).range([0,2*Math.PI])


var svg = d3.select("body").append("svg")
    .attr("width", w)
    .attr("height", h)
  .append("g")
    .attr("transform", "translate("+ w/2 + "," + h/2 + ")");

d3.json("data.json", function(error, data) {

  var r = d3.scale.linear().domain([0, data.length-1]).range([200, Math.min(w/2,h/2)])
  var categories = _.uniq(data.map(function(d) {return d.category}))

  var species = {}
  _.each(categories, function(c) {
    species[c] = _.filter(data, function(d,i) {
      return c==d.category
    })
  })

  var arc = d3.svg.arc()
    .innerRadius(function(d) {return parseInt(r(d.id))})
    .outerRadius(function(d) {return parseInt(r(d.id)+Math.floor((r.range()[1]-r.range()[0])/data.length))})
    .startAngle(function(d) { return t((new Date(d.start)).getTime()) })
    .endAngle(function(d) { return t((new Date(d.end)).getTime()) });

  var cRadius = d3.scale.ordinal().domain(d3.range(categories.length)).rangePoints([0, w], 2);

  var path = svg.selectAll("path")
      .data(data)
      .each(function(d,i) {d.id = i})

  path.enter().append("path")
    .transition()
      .ease("elastic")
      .duration(750)
      .attrTween("d", arcTween);

  path.transition()
      .ease("elastic")
      .duration(750)
      .attrTween("d", arcTween);

  path.exit().transition()
      .ease("bounce")
      .duration(750)
      .attrTween("d", arcTween)
      .remove();

  var cross = svg.append('g').classed('logo',true)
      .append('path')
      .attr('d', d3.svg.symbol().type("cross").size(w*10))
      .attr('transform','rotate(45)')

  function arcTween(b) {
    var i = d3.interpolate({value: b.previous}, b);
    return function(t) {     
      return arc(i(t))
    }
  }
  // debugger
  window.onresize = _.debounce(function(){
    console.log(window.innerWidth)
  }, 250); 
})