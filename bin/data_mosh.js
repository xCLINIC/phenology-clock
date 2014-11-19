var dsv = require("dsv"),
  csv = dsv(","),
  tsv = dsv("\t"),
  _ = require("lodash"),
  fs = require("fs"),
  d3 = require("d3")

//http://phrogz.net/fewer-lambdas-in-d3-js
function ƒ(str) { return function(obj) { return str ? obj[str] : obj; }}

var lg = console.log

var raw = csv.parse(fs.readFileSync("./rawdata/phenological-clock-dummy-data.csv", "utf-8"))

var species = []

_.each(raw, function(d,i) {
  d.start = new Date(d.start)
  d.end = new Date(d.end)
  species.push(d)
})

lg(species)

/* Output */
var outputFilename = './public/data.json';

fs.writeFile(outputFilename, JSON.stringify(species, null, 4), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved to " + outputFilename);
    }
})

/* Utils */
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