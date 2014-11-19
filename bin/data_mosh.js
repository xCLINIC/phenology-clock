var dsv = require("dsv"),
  csv = dsv(","),
  tsv = dsv("\t"),
  _ = require("lodash"),
  fs = require("fs"),
  d3 = require("d3")

//http://phrogz.net/fewer-lambdas-in-d3-js
function ƒ(str) { return function(obj) { return str ? obj[str] : obj; }}

var lg = console.log
var raw = []
var corruption = csv.parse(fs.readFileSync("../raw/BerlinWall_corruption.csv", "utf-8"))

var data = {}
data.countries = {}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
function numericKeys (set) {
  return _.filter(Object.keys(set), function(d) {
    return !isNaN(parseFloat(d)) && isFinite(d);
  })
}
function nonNumericKeys (set) {
  return _.filter(d3.keys(set), function(k) {
    return numericKeys(set).indexOf(k) == -1
  })
}

var globalExtent = []
_.each(raw, function(r) {
  globalExtent = globalExtent.concat(d3.extent(numericKeys(r[0])))
})

globalExtent = d3.extent(globalExtent)
empty = {}
for (var i = globalExtent[0]; i < globalExtent[1]; i++) {
  empty[i] = ''
};
lg(globalExtent)

var omit = []
function fillData (obj) {
  _.each(empty, function(o, i) {
    if(!obj.hasOwnProperty(i)) obj[i] = ''
  })
  return obj
}

_.each(mortality, function(d,i) {
  // lg(d.country)
  var c = {}
  c.name = d.country;
  if(_.filter(map, {name:c.name}).length>0)
    c.id = _.filter(map, {name:c.name})[0].id

  // d = fillData(d)
  c.mortality = d
  data.countries[d.country] = c

  // var mortality = _.omit(data.countries[d.country].mortality, nonNumericKeys(d))

  var mortality = _.omit(c.mortality, nonNumericKeys(c.mortality))
  mortality = d3.keys(mortality).map(function(year) {return {'year': year, 'value': c.mortality[year]}})
  data.countries[d.country].mortality = mortality

  // lg(data.countries[d.country])
})

_.each(gdp, function(d,i) {
  // d = fillData(d)
  var gdp = _.omit(d, nonNumericKeys(d))
  gdp = d3.keys(gdp).map(function(year) {return {'year': year, 'value': d[year]}})
  data.countries[d.country].gdp = gdp
})

data.countries = _.omit(data.countries, ['Average', 'Median'])
data.categories = categories

// lg(data.countries)
lg(Object.keys(data.countries))
// lg(map)


var outputFilename = '../public/data/data.json';

fs.writeFile(outputFilename, JSON.stringify(data, null, 4), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved to " + outputFilename);
    }
});