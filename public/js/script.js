'use strict'
function ƒ(str) { return function(obj) { return str ? obj[str] : obj; }}

window.pheno = window.pheno || {}

pheno = function(parent,id){
  var self = {},
      chartId = id,
      parentEl = parent,
      r,
      svg,
      data,
      cross,
      cRadius,
      arcDiff,
      tooltip,
      arcPaths,
      categories,
      species = {},
      margin = {r: 30},
      arc = d3.svg.arc(),
      d1 = new Date('1/1/2014'),
      d2 = new Date('1/1/2015'),
      doy = getDaysBetween(d1,d2),
      c1 = d3.scale.category20b(),
      c2 = d3.scale.category20c(),
      w = Math.min(window.innerWidth,window.innerHeight) - 3*margin.r,
      h = Math.min(window.innerWidth,window.innerHeight) - 3*margin.r,
      outerBound = Math.min(w,h),
      innerBound = .10*outerBound,
      axisRadus = outerBound/2+10,
      time = d3.scale.linear().domain([d1,d2]).range([0,2*Math.PI])

  var line = d3.svg.line.radial()
      .radius(function(d) { return r(d[1]); })
      .angle(function(d) { return -d[0] + Math.PI / 2; });

  self.draw = function() {
    svg = d3.select(parentEl).html('').append("svg")
      .attr("width", window.innerWidth)
      .attr("height", window.innerHeight)

    var dayTicks = svg
      .append("g")
        .classed('a-tick axis',true)
        .attr("transform", "translate("+ window.innerWidth/2 + "," + window.innerHeight/2 + ")")
      .selectAll("g")
        .data(d3.range(0, 365))
      .enter().append("g")
        .attr("transform", function(d) { return "rotate(" + -time(doy[d])*180/Math.PI + ")"; })
    
    dayTicks.append("line")
        .attr("x1", axisRadus)
        .attr("x2", function(d) {
          return (doy[364-d].getDate() == 1 || doy[364-d].getDate()%7 ==0) ? axisRadus:axisRadus+10
        })

    dayTicks.append("text")
        .attr("x", axisRadus)
        .attr("dy", ".35em")
        .text(function(d) { return (doy[364-d].getDate() == 1 || doy[364-d].getDate()%7 ==0)? doy[364-d].getDate():''; })
        // .style("text-anchor", function(d) { return d < 270 && d > 90 ? "end" : null; })
        // .attr("transform", function(d) { return d < 270 && d > 90 ? "rotate(180 " + (axisRadus) + ",0)" : null; })
        // .text(function(d) { return (doy[364-d].getDate() == 1 || doy[364-d].getDate()%7 ==0)? 364-d : "" })

    var gr = svg.append("g")
        .classed('r-tick axis',true)
        .attr("transform", "translate("+ window.innerWidth/2 + "," + window.innerHeight/2 + ")")
      .selectAll("g")
        .data(categories)
      .enter().append("g");

    gr.append("circle")
        .attr("r", function(d,i) {return cRadius(i)});

    gr.append("text")
        .attr("y", function(d,i) { return -cRadius(i) - 4; })
        .attr("transform", "rotate(0)")
        .style("text-anchor", "middle")
        .text(function(d) { return d; });

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
              .text(d.data['common-name'])
            .append('p')
              .text(d.data.category)
          d3.select(this).style('fill-opacity', 1).attr('stroke-width', '3px')
        })
        .on('mouseout',function(d) {
          tooltip
            .attr('opacity',1)
          d3.select(this).style('fill-opacity', .7).attr('stroke-width', '0px')
        })
        .on('click', orientSpeciesTop)
        .attr("d", arc)
        .transition()
        .duration(1000)
        .attrTween("d", tweenArc(function(d, i) {
          return {
            startAngle: d.next.startAngle,
            endAngle: d.next.endAngle
          }
        }))

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

  self.init = function(_d) {
    data = _d

    r = d3.scale.linear().domain([0, data.length-1]).range([innerBound, Math.min(w/2,h/2)])
    arcDiff = Math.floor((r.range()[1]-r.range()[0])/data.length)
    
    var temp = []
    _.each(_d,function(d,i) {
      var o = {}
      o.innerRadius = parseInt(r(i)-arcDiff)
      o.outerRadius = parseInt(r(i))
      o.startAngle = time((new Date(d.start)).getTime())
      o.endAngle = time((new Date(d.end)).getTime())
      o.next = _.clone(o)
      o.endAngle = time((new Date(d.start)).getTime())+.001 
      o.data = d 
      temp.push(o)
    })
    data = temp

    categories = _.uniq(data.map(function(d) {return d.data.category}))
    
    _.each(categories, function(c) {
      species[c] = _.filter(data, function(d,i) {
        return c==d.data.category
      })
    })
    console.log(species)

    cRadius = d3.scale.ordinal().domain(d3.range(categories.length)).rangePoints([innerBound, outerBound/2+arcDiff], 2)

    if(w>0){ // should be minBound
      self.draw(parentEl, chartId)
    }
  }

  self.resize = function(_w,_h) {
    w = Math.min(window.innerWidth,window.innerHeight) - 3*margin.r
    h = Math.min(window.innerWidth,window.innerHeight) - 3*margin.r
    outerBound = Math.min(w,h)
    innerBound = .08*outerBound
    axisRadus = outerBound/2+10
    time = d3.scale.linear().domain([d1,d2]).range([0,2*Math.PI])

    r = d3.scale.linear().domain([0, data.length-1]).range([innerBound, Math.min(w/2,h/2)])
    arcDiff = Math.floor((r.range()[1]-r.range()[0])/data.length)
    cRadius = d3.scale.ordinal().domain(d3.range(categories.length)).rangePoints([0, outerBound/2], 2)

    var species = []
    _.each(data,function(d,i) {

      d.innerRadius = parseInt(r(i)-arcDiff)
      d.outerRadius = parseInt(r(i))
      d.next.innerRadius = parseInt(r(i))
      d.next.outerRadius = parseInt(r(i)+Math.floor((r.range()[1]-r.range()[0])/data.length))

    })


    arcPaths.data(data)
    if(w>0){ // should be minBound
      console.log('resize')
      self.draw(parentEl, chartId)
    }
  }

  var rotateClock = function(angle) {
    svg.attr('transform','rotate('+angle+')')
  }

  // TODO rotate Axis along with Arcs
  var orientSpeciesTop = function(p) {
    var rotate = 2*Math.PI - p.startAngle
    var _d = arcPaths.data()
    var species = []
    _.each(_d,function(d,i) {
      var o = {}
      d = d.data
      o.innerRadius = parseInt(r(i)-arcDiff)
      o.outerRadius = parseInt(r(i))
      o.startAngle = time((new Date(d.start)).getTime())+ rotate
      o.endAngle = time((new Date(d.end)).getTime())+ rotate
      o.next = _.clone(o)
      o.startAngle = time((new Date(d.start)).getTime())
      o.endAngle = time((new Date(d.end)).getTime())
      o.data = d 
      species.push(o)
    })
    data = species

    arcPaths.data(data)
    .transition()
    .duration(1000)
    .attrTween("d", tweenArc(function(d, i) {
      return {
        startAngle: d.next.startAngle,
        endAngle: d.next.endAngle
      }
    }))   
  }

  var tweenArc = function (b) {
    return function(a, i) {
      var d = b.call(this, a, i)
      var inter = d3.interpolate(a, d)
      for (var k in d) a[k] = d[k]; // update data
      return function(t) { return arc(inter(t)); };
    };
  }
  
  // where t2>=t1 => |[t1,t2)| == 365
  function getDaysBetween (t1,t2) {
    var start = new Date(t1);
    var future = new Date(t2);
    var range = []
    var mil = 86400000 //24h
    for (var i=start.getTime(); i<future.getTime();i=i+mil) {
      range.push(new Date(i))
    }
    return range
  }
  return self
}

var clock = new pheno('body', 'clock')

d3.json("data.json", function(error, data) {
  clock.init(data)

  window.onresize = _.debounce(function(){
    clock.resize()
  }, 250); 
})