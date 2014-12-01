'use strict'
window.pheno = window.pheno || {}

pheno = function(parent,id){
  var self = {},
      chartId = id,
      parentEl = parent,
      r,
      svg,
      clock,
      data,
      cross,
      cRadius,
      arcDiff,
      tooltip,
      arcGroups,
      arcPaths,
      categories,
      species = {},
      margin = {r: 90},
      arc = d3.svg.arc(),
      d1 = new Date('1/1/2014'),
      d2 = new Date('1/1/2015'),
      doy = getDaysBetween(d1,d2),
      c1 = d3.scale.category20c(),
      c2 = d3.scale.category20b(),
      w = Math.min(window.innerWidth,window.innerHeight) - 3*margin.r,
      h = Math.min(window.innerWidth,window.innerHeight) - 3*margin.r,
      outerBound = Math.min(w,h),
      innerBound = .15*outerBound,
      axisRadus = outerBound/2+10,
      months = [ "January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December" ],
      time = d3.scale.linear().domain([d1,d2]).range([0,2*Math.PI]),
      colors = ["Oranges", "Purples", "Blues", "Greens", "Reds"]
      // colors = ["YlOrRd", "PuBuGn", "Purples", "Reds", "YlGnBu", "Blues", "YlGn", "BuPu", "YlOrBr", "PuRd", "RdPu", "GnBu"]
      // colors = ["PuBuGn", "RdPu", "PuRd", "YlGnBu", "YlOrBr", "Blues", "YlGn", "YlOrRd", "GnBu", "BuPu", "Reds", "Purples"]
      // colors = ["YlOrRd", "YlGn", "Purples", "YlGnBu", "PuRd", "BuPu", "RdPu", "Blues", "PuBuGn", "YlOrBr", "Reds", "GnBu"]
      // colors = ["YlGn", "YlGnBu", "GnBu", "PuBuGn", "BuPu", "RdPu", "PuRd", "YlOrRd", "YlOrBr", "Purples", "Blues", "Reds"]

  var colorBrewer = d3.entries(colorbrewer).filter(function(d){return colors.indexOf(d.key) >= 0 })

  var line = d3.svg.line.radial()
      .radius(function(d) { return r(d[1]); })
      .angle(function(d) { return -d[0] + Math.PI / 2; });

  self.draw = function() {
    svg = d3.select(parentEl).html('').append("svg")
      .attr("width", window.innerWidth)
      .attr("height", window.innerHeight)

    var clock = svg.append("g").classed('clock',true)
        .attr("transform", "translate("+ window.innerWidth/2 + "," + window.innerHeight/2 + ")")

    var dayTicks = clock
      .append("g")
        .classed('a-tick axis',true)
      .selectAll("g")
        .data(d3.range(0, 365))
      .enter().append("g")
        .attr("transform", function(d) { return "rotate(" + (-time(doy[d])*180/Math.PI - 90) + ")"; })
    
    dayTicks.append("line")
        .attr("x1", function(d) {
          return (doy[364-d].getDate() == 1) ? 0:axisRadus
        })
        .attr("x2", function(d) {
          return (doy[364-d].getDate() == 1 || doy[364-d].getDate()%7 ==0) ? axisRadus:axisRadus+10
        })

    dayTicks.append("text")
        .attr("x", axisRadus)
        .attr("dy", ".5em")
        .text(function(d) { return (doy[364-d].getDate() == 1 || doy[364-d].getDate()%7 ==0)? doy[364-d].getDate():''})
        // TODO fix this rotation
        // .attr("transform", function(d) { 
        //     if((doy[364-d].getDate() == 1 || doy[364-d].getDate()%7 ==0)) console.log(time(doy[364-d]))
        //     return "rotate("+parseInt(time(doy[364-d])+Math.PI/2)+"," + (axisRadus) + ",0)"})
        // .attr("transform", function(d) { 
        //   var cos =  Math.cos(time(doy[364-d].getDate()))
        //   var sin =  Math.sin(time(doy[364-d].getDate()))
        //   var x =  Math.cos(time(doy[364-d].getDate()))
        //   var y =  Math.sin(time(doy[364-d].getDate()))

        //   var matrix = "matrix(" +cos+ "," +sin+ "," +(-sin)+ "," +cos+ "," +x*(axisRadus)+ "," +y*(axisRadus)+ ")"
        //   return (doy[364-d].getDate() == 1 || doy[364-d].getDate()%7 ==0)? matrix : null
        // })

    clock.append('g').classed('months', true)
      
    var monthTicks = d3.select('.months')
      .selectAll('text')
        .data(doy.filter(function(d){return d.getDate() == 1}))
      .enter().append('text')

    svg.append('defs')
      .append("path")
        .attr('d', function() {   
          return "M 0 0 m -"+(axisRadus+15)+", 0 a "+(axisRadus+15)+","+(axisRadus+15)+" 0 1,1 "+(2*(axisRadus+15))+",0 a "+(axisRadus+15)+","+(axisRadus+15)+" 0 1,1 -"+(2*(axisRadus+15))+",0"
        })
        .attr('fill','none')
        .attr('id', 'monthPath')
        .attr('r', axisRadus+15)

    monthTicks.append('textPath')
      .attr('xlink:href','#monthPath')
      .attr('startOffset',function(d,i) {return ((i+3)*100/12)%100+'%'})
      .text(function(d,i) {return months[d.getMonth()]})
      .on('click', function(d,i){
        d3.select('svg').style('transition-duration', '.8s')
        orientSpeciesTop({startAngle:time(d)})
      })

    var categoryTicks = clock.append("g")
        .classed('r-tick axis',true)
      .selectAll("g")
        .data(categories)
      .enter().append("g");

    categoryTicks.append("circle")
        .attr("r", function(d,i) {return cRadius[i]})
        .attr('fill',function(d,i) {return brew(d,i)})

    categoryTicks.append("text")
        .attr("y", function(d,i) { return -cRadius[i] - 4; })
        .attr("transform", "rotate(0)")
        .style("text-anchor", "middle")
        .text(function(d) { return d; });

    arcGroups = clock
      .selectAll(".category")
      .data(categories)
        .enter().append("g")
        .attr('class', function(d) {
          return 'category '+ d
        })

    arcPaths = arcGroups
      .selectAll("path")
      .data(function(d,i) { return species[d] })
      .enter().append("path")
        .style({
          'opacity': .7,
          'stroke-width': '0px'
        })
        .attr('fill',function(d,i) {return brew(d.data.category, i)})
        .attr('stroke',function(d,i) {return (i<20) ? c1(i) : c2(i) })
        .on('mouseover', function(d) {
          tooltip
            .attr('opacity',1)
            .html('')
            .append('h2')
              .text(d.data['common-name'])
            .append('p')
              .text(d.data.category)
          d3.select(this).style('opacity', 1)
        })
        .on('mouseout',function(d) {
          tooltip
            .attr('opacity',1)
          d3.select(this).style('opacity', .7)
        })
        .on('click', function(d) {
          d3.select('svg').style('transition-duration', '.8s')
          orientSpeciesTop(d)
        })
        .attr("d", arc)
        .transition()
        .duration(1000)
        .attrTween("d", tweenArc(function(d, i) {
          return {
            startAngle: d.next.startAngle,
            endAngle: d.next.endAngle
          }
        }))

    cross = clock.append('g')
        .classed('logo',true)
      .append('path')
        .attr('d', d3.svg.symbol().type("cross").size(.02*outerBound*innerBound))
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
    arcDiff = (r.range()[1]-r.range()[0])/data.length
    categories = _.uniq(data.map(function(d) {return d.category}))
     
    var temp = []
    _.each(_d,function(d,i) {
      var o = {}
      o.innerRadius = parseInt(r(i)-arcDiff)
      o.outerRadius = parseInt(r(i))
      o.startAngle = time((new Date(d.start)).getTime())+.01  //todo fix bad hack to add .01 offset 
      o.endAngle = time((new Date(d.end)).getTime())
      o.next = _.clone(o)
      o.endAngle = time((new Date(d.start)).getTime())
      d.id = i
      o.data = d 
      temp.push(o)
    })
    data = temp
    
    var temp = []
    _.each(categories, function(c,i) {
      species[c] = _.filter(data, function(d,i) {
        return c==d.data.category
      })
      temp = temp.concat(species[c])
    })
    data = temp

    console.log(data,categories,species)
    // cRadius = d3.scale.ordinal().domain(d3.range(categories.length)).rangePoints([innerBound, outerBound/2+arcDiff], 2)
    
    cRadius = [] 
    _.each(categories, function(c,i) {
      if(i>0){
        cRadius[i]= cRadius[i-1]+species[categories[i-1]].length*arcDiff
      }else{
        cRadius[i]= innerBound-arcDiff
      }
    })

    if(w>0){ // should be minBound
      self.draw(parentEl, chartId)
    }
  }

  self.resize = function(_w,_h) {
    w = Math.min(window.innerWidth,window.innerHeight) - 3*margin.r
    h = Math.min(window.innerWidth,window.innerHeight) - 3*margin.r
    outerBound = Math.min(w,h)
    innerBound = .15*outerBound
    axisRadus = outerBound/2+10
    time = d3.scale.linear().domain([d1,d2]).range([0,2*Math.PI])
    r = d3.scale.linear().domain([0, data.length-1]).range([innerBound, Math.min(w/2,h/2)])
    arcDiff = (r.range()[1]-r.range()[0])/data.length
    // cRadius = d3.scale.ordinal().domain(d3.range(categories.length)).rangePoints([0, outerBound/2], 2)

    _.each(data,function(d,i) {
      d.innerRadius = parseInt(r(i)-arcDiff)
      d.outerRadius = parseInt(r(i))
      d.next.innerRadius = parseInt(r(i))
      d.next.outerRadius = parseInt(r(i)+Math.floor((r.range()[1]-r.range()[0])/data.length))
    })

    cRadius = [] 
    _.each(categories, function(c,i) {
      if(i>0){
        cRadius[i]= cRadius[i-1]+species[categories[i-1]].length*arcDiff
      }else{
        cRadius[i]= innerBound-arcDiff
      }
    })

    // arcPaths.data(data)
    arcPaths = arcGroups
      .selectAll("path")
      .data(function(d,i) {return species[d] })


    if(w>0){ // should be minBound
      self.draw(parentEl, chartId)
    }
  }

  self.rotateClock = function(angle) {
    d3.select('svg').style('transform','rotate('+angle+'deg)')
  }

  self.scheduleFn = function(fn){
    function runFn(){
      var t = new Date()
      fn(d3.time.format("%b-%e-%H:%M")(t))
      var s = t.getSeconds()
      setTimeout(runFn, (80 - s)*1000)
    }
    runFn()
  }

  var orientSpeciesTop = function(p) {
    var rotate = (p.startAngle<Math.PI) ? -(p.startAngle) : 2*Math.PI - p.startAngle
    self.rotateClock(rotate*180/Math.PI)
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

  function brew (category, i) {
    var ci = categories.indexOf(category)
    var scheme = colors[ci%colors.length]

    var cb = colorBrewer.filter(function(d) {
      return d.key == scheme
    })[0]

    var dataClasses = 9 // total number of colors within a scheme
    var slice = 2 // remove the first n colors usually too light

    return cb.value[dataClasses].slice(slice, dataClasses)[(i)%(dataClasses-slice)]
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

var t = d3.scale.linear().domain([0,60000]).range([0,360])
var deg =0
var start = function (time) {
  d3.select('svg').style('transition-duration', '61s')
  deg +=180
  clock.rotateClock(deg)
}


