'use strict'
function ƒ(str) { return function(obj) { return str ? obj[str] : obj; }}

var margin = {top: 80, right:80, bottom: 80, left: 80},
    w = Math.min(window.innerWidth, window.innerHeight) - margin.left - margin.right,
    h = Math.min(window.innerWidth, window.innerHeight) - margin.top - margin.bottom,
    d1 = new Date('1/1/2014'),
    d2 = new Date('1/1/2015'),
    time = d3.scale.linear().domain([d1,d2]).range([0,2*Math.PI])

var tooltip = d3.select("body").append('div').classed('tooltip',true)
  .style({
    position:'absolute',
    top:window.innerHeight/2-50+'px',
    left:window.innerWidth/2-90+'px',
    'text-align':'center',
    opacity:1,
    width: '200px',
    height: '100px'
  })

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
      'fill-opacity': .7,
      'stroke-width': '0px'
    })
    .attr('fill',function(d,i) {return (i<20) ? c1(i) : c2(i) })
    .attr('stroke',function(d,i) {return (i<20) ? c1(i) : c2(i) })
    .on('mouseover', function(d) {
      tooltip
        .attr('opacity',1)
        .html('')
        .append('h2')
          .text(d['common-name'])
        .append('p')
          .text(d.category)
      d3.select(this).style('fill-opacity', 1).attr('stroke-width', '3px')
    })
    .on('mouseout',function(d) {
      tooltip
        .attr('opacity',1)
      d3.select(this).style('fill-opacity', .7).attr('stroke-width', '0px')
    })
    .transition()
      .ease("elastic")
      .duration(750)
      .attr("d", arc);

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
  window.onresize = _.debounce(function(){
    // console.log(window.innerWidth)
  }, 250); 
})