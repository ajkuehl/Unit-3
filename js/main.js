// Ashley Kuehl, D3 Lab, Activity 9
// shapefile data source census.gov
// attribute data source 2019 County Health Rankings and Roadmap Data https://www.countyhealthrankings.org/explore-health-rankings/rankings-data-documentation

// begin script when window loads
window.onload = setMap();

// set up choropleth Map
function setMap(){
  // use Promise.all to parallelize asynchronous data loading
  var promises = [d3.csv("data/WI_Health_by_County.csv"),
                  d3.json("data/midwest.topojson"),
                  d3.json("data/wi_counties_1.topojson")
                ];
  Promise.all(promises).then(callback);

  function callback(data){
    csvData=data[0];
    states=data[1];
    wi=data[2];
    console.log(csvData);
    console.log(states);
    console.log(wi);

    // translate WI topojson within callback function
    var statesProvinces = topojson.feature(states, states.objects.midwest),
        wiCounties = topojson.feature(wi, wi.objects.wi_counties).features;
    // examine results
    console.log(statesProvinces);
    console.log(wiCounties);

    // add states and provinces to map
    var states_provinces = map.append("path")
      .datum(statesProvinces)
      .attr("class", "states_provinces")
      .attr("d", path);

    // add WI counties to map
    var counties = map.selectAll(".counties")
      .data(wiCounties)
      .enter()
      .append("path")
      .attr("class", function(d){
        return"counties" + d.properties.adm1_code;
      })
      .attr("d", path);
  };


  // map frame dimensions
  var width=960,
      height =650;

  // create new sbg container for the map
  var map = d3.select("body")
      .append("svg")
      .attr("class", "map")
      .attr("width",width)
      .attr("height",height);

   // create Albers equal area projection centered on WI
   var projection =d3.geoAlbers()
      .center([-2.50,27])
      .rotate([88, -18, 0])
      .parallels([35,43.53])
      .scale(5000)
      .translate([width/2, height/2]);

  // create path
  var path = d3.geoPath()
      .projection(projection);

  // use Promise.all to parallelize asynchronous data loading
  var promises = [];
  // load atttributes from CSV file
  promises.push(d3.csv("data/WI_Health_by_County.csv"));
  // load background spatial Data
  promises.push(d3.json("data/midwest.topojson"));
  // load choropleth spatial Data
  promises.push(d3.json("data/wi_counties_1.topojson"));
  Promise.all(promises).then(callback);

};
