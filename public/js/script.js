'use strict'
function ƒ(str) { return function(obj) { return str ? obj[str] : obj; }}

window.pheno = window.pheno || {}

pheno = function(parent,id){
  var self,
      margin = {top: 40, ight:40, bottom: 40, left: 50},
      w = window.innerWidth - margin.left - margin.right,
      h = window.innerWidth - margin.top - margin.bottom,
      d1 = new Date('1/1/2014'),
      d2 = new Date('1/1/2015'),
      t = d3.scale.linear().domain([d1,d2]).range([0,2*Math.PI])


  var svg = d3.select("body").append("svg")
      .attr("width", window.innerWidth)
      .attr("height", window.innerHeight)

  var c1 = d3.scale.category20b()
  var c2 = d3.scale.category20c()

  self.draw = function(parent,id) {

  }

  self.resize = function(_w,_h) {

  }

  if(w>0){
    self.draw(parentEl, chartId)
  }

  return self
}


var margin = {top: 80, right:80, bottom: 80, left: 80},
    w = Math.min(window.innerWidth, window.innerHeight) - margin.left - margin.right,
    h = Math.min(window.innerWidth, window.innerHeight) - margin.top - margin.bottom,
    d1 = new Date('1/1/2014'),
    d2 = new Date('1/1/2015'),
    time = d3.scale.linear().domain([d1,d2]).range([0,2*Math.PI])

var svg = d3.select("body").append("svg")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight)

var c1 = d3.scale.category20b()
var c2 = d3.scale.category20c()

d3.json("data.json", function(error, data) {

  var r = d3.scale.linear().domain([0, data.length-1]).range([100, Math.min(w/2,h/2)])
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
    .startAngle(function(d) { return time((new Date(d.start)).getTime()) })
    .endAngle(function(d) { return time((new Date(d.end)).getTime()) })

  var cRadius = d3.scale.ordinal().domain(d3.range(categories.length)).rangePoints([0, w], 2);

  var path = svg
      .append("g")
        .classed('clock',true)
        .attr("transform", "translate("+ window.innerWidth/2 + "," + window.innerHeight/2 + ")")
      .selectAll("path")
        .data(data)
        .each(function(d,i) {d.id = i})

  path.enter().append("path")
    .style({
      'fill-opacity': .9,
      'stroke-width': '0px'
    })
    .attr('fill',function(d,i) {return (i<20) ? c1(i) : c2(i) })
    .attr('stroke',function(d,i) {return (i<20) ? c1(i) : c2(i) })
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

  var cross = svg.append('g')
        .classed('logo',true)
        .attr("transform", "translate("+ window.innerWidth/2 + "," + window.innerHeight/2 + ")")
      .append('path')
        .attr('d', d3.svg.symbol().type("cross").size(w*5))
        .attr('transform','rotate(45)')
        .style({
          'fill':'rgb(236,47,45)',
          'fill-opacity': 1
        })

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