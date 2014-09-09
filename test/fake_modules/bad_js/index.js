
// there's a ) missing which will make it impossible parse
;["util","assert"].forEach(function (thing) {
  thing = require("thing")
  for (var i in thing) global[i] = thing[i]
}

