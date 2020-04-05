// Ashley Kuehl, D3 Lab, Activity 9
// shapefile states and counties data source census.gov
// attribute data source 2019 County Health Rankings and Roadmap Data https://www.countyhealthrankings.org/explore-health-rankings/rankings-data-documentation




// begin script when window loads
window.onload = setMap();

// set up choropleth Map
function setMap(){
  // promise.all method used to load multiple data sets at once with a single callback function
  // initial shapefiles exported as topojson files using mapshaper to limit file size
  // note, before loading topojson files, shapefiles should have EPSG:4326/WGS 84 coordinate reference sys
  // d3.cvs & d3.json are ajax methods
  var promises = [d3.csv("data/WI_Health_by_County.csv"),
                  d3.json("data/midwest.topojson"),
                  d3.json("data/wi_counties_1.topojson")
                ];
  Promise.all(promises).then(callback);

  // data passed to callback function to load asynchronously with rest of script
  function callback(data){
    csvData=data[0];
    states=data[1];
    wi=data[2];
    console.log(csvData);
    // console.log(states);
    // console.log(wi);

    // translate WI topojson within callback function and assign to new variable
    // note what the objects are labeled in the topojson file and reference in code below
    var statesProvinces = topojson.feature(states, states.objects.midwest),
        wiCounties = topojson.feature(wi, wi.objects.wi_counties).features;//adding features array at the end
    // examine results under new variable name
    // console.log(statesProvinces);
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
        return"counties" + d.properties.name;
        // return"counties" + d.properties.adm1_code;
        // ............. confused by this
      })
      .attr("d", path);
  };


  // map frame dimensions
  var width=960,
      height =650;

  // create new svg container for the map
  var map = d3.select("body")
      .append("svg")
      .attr("class", "map")
      .attr("width",width)
      .attr("height",height);

   // Create projection generator
   // Albers equal area projection centered on WI, https://projectionwizard.org/
   var projection =d3.geoAlbers()
      .center([0,27])//center coordinates
      .rotate([88, -18, 0])//angle
      .parallels([35,45])//using secant case
      .scale(5000)
      .translate([width/2, height/2]);//keeps map centered in svg container

  // create path generator
  var path = d3.geoPath()
      .projection(projection);//passing the projection variable through the projection operator

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
