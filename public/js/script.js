'use strict'
function ƒ(str) { return function(obj) { return str ? obj[str] : obj; }}

window.pheno = window.pheno || {}

pheno = function(parent,id){
  var self = {},
      chartId = id,
      parentEl = parent,
      data,
      r,
      svg,
      cross,
      cRadius,
      tooltip,
      arcPaths,
      categories,
      species = {},
      arc = d3.svg.arc(),
      c1 = d3.scale.category20b(),
      c2 = d3.scale.category20c(),
      d1 = new Date('1/1/2014'),
      d2 = new Date('1/1/2015'),
      margin = {r: 25, top: 25, right:25, bottom: 25, left: 25},
      w = Math.min(window.innerWidth,window.innerHeight) - 2*margin.r,
      h = Math.min(window.innerWidth,window.innerHeight) - 2*margin.r,
      outerBound = Math.min(w,h),
      innerBound = .08*outerBound,
      time = d3.scale.linear().domain([d1,d2]).range([0,2*Math.PI])

  self.draw = function() {

    svg = d3.select(parentEl).html('').append("svg")
      .attr("width", window.innerWidth)
      .attr("height", window.innerHeight)

    r = d3.scale.linear().domain([0, data.length-1]).range([innerBound, Math.min(w/2,h/2)])
    
    categories = _.uniq(data.map(function(d) {return d.category}))
    
    _.each(categories, function(c) {
      species[c] = _.filter(data, function(d,i) {
        return c==d.category
      })
    })

    arc.innerRadius(function(d) {return parseInt(r(d.id))})
      .outerRadius(function(d) {return parseInt(r(d.id)+Math.floor((r.range()[1]-r.range()[0])/data.length))})
      .startAngle(function(d) { return time((new Date(d.start)).getTime()) })
      .endAngle(function(d) { return time((new Date(d.end)).getTime()) })

    cRadius = d3.scale.ordinal().domain(d3.range(categories.length)).rangePoints([0, w], 2)

    arcPaths = svg
      .append("g")
        .classed('clock',true)
        .attr("transform", "translate("+ window.innerWidth/2 + "," + window.innerHeight/2 + ")")
      .selectAll("path")
        .data(data)
        .each(function(d,i) {d.id = i})

    arcPaths.enter().append("path")
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
          .attr("d", arc)

    cross = svg.append('g')
        .classed('logo',true)
        .attr("transform", "translate("+ window.innerWidth/2 + "," + window.innerHeight/2 + ")")
      .append('path')
        .attr('d', d3.svg.symbol().type("cross").size(.05*outerBound*innerBound))
        .attr('transform','rotate(45)')
        .style({
          'fill':'rgb(236,47,45)',
          'fill-opacity': 1
        })

    tooltip = d3.select(parentEl).append('div').classed('tooltip',true)
      .style({
        position:'absolute',
        top:window.innerHeight/2-50+'px',
        left:window.innerWidth/2-90+'px',
        'text-align':'center',
        opacity:1,
        width: '200px',
        height: '100px'
      })

  }

  self.update = function(_d) {
    data = _d
    
    if(w>0){ // should be minBound
      self.draw(parentEl, chartId)
    }
  }

  self.resize = function(_w,_h) {
    margin = {r: 50, top: 25, right:25, bottom: 25, left: 25}
    w = Math.min(window.innerWidth,window.innerHeight) - 2*margin.r
    h = Math.min(window.innerWidth,window.innerHeight) - 2*margin.r
    outerBound = Math.min(w,h)
    innerBound = .08*outerBound
    time = d3.scale.linear().domain([d1,d2]).range([0,2*Math.PI])

    r = d3.scale.linear().domain([0, data.length-1]).range([innerBound, Math.min(w/2,h/2)])
    cRadius = d3.scale.ordinal().domain(d3.range(categories.length)).rangePoints([0, w], 2)

    
    if(w>0){ // should be minBound
      console.log('resize')
      self.draw(parentEl, chartId)
    }
  }

  function arcTween(b) {
    var i = d3.interpolate({value: b.previous}, b);
    return function(t) {     
      return arc(i(t))
    }
  }
  
  return self
}

var clock = new pheno('body', 'clock')

d3.json("data.json", function(error, data) {
  clock.update(data)

  window.onresize = _.debounce(function(){
    clock.resize()
  }, 250); 
})