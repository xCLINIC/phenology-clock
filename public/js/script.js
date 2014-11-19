function ƒ(str) { return function(obj) { return str ? obj[str] : obj; }}
(function(){

  d3.json("data.json", function(error, data) {
    console.log(data)
    
    var categories = _.uniq(data.map(function(d) {return d.category}))
    
    // _.filter(, function(d) {return })
    console.log(categories)
    window.onresize = _.debounce(function(){
      //TODO Make responsive
      console.log(window.innerWidth)

    }, 250);

  });
})()