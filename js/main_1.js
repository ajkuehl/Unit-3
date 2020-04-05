// Ashley Kuehl, D3 Lab, Activity 10
// shapefile states and counties data source census.gov
// attribute data source 2019 County Health Rankings and Roadmap Data https://www.countyhealthrankings.org/explore-health-rankings/rankings-data-documentation

// wrapping everythign in a self-executing anonymous function to move to local scope
(function(){

// pseudo-global variables
var attrArray = ["Fair/Poor Health_%","Adult Smokers_%","Adult Obese_%","PhysicallyInactive_%","With Access To Exercise Opportunities_%","Excessive Drinking_%","Long Commute - Drives Alone_%"]; //List of atttributes
var expressed = attrArray[0]; // initial attribute

// begin script when window loads
window.onload = setMap();

// set up choropleth Map
function setMap(){

  // ...Map, projection, path, and que blocks
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
  promises.push(d3.json("data/wi_counties_2.topojson"));


  Promise.all(promises).then(callback);

  // promise.all method used to load multiple data sets at once with a single callback function
  // initial shapefiles exported as topojson files using mapshaper to limit file size
  // note, before loading topojson files, shapefiles should have EPSG:4326/WGS 84 coordinate reference sys
  // d3.cvs & d3.json are ajax methods
  var promises = [d3.csv("data/WI_Health_by_County.csv"),
                  d3.json("data/midwest.topojson"),
                  d3.json("data/wi_counties_2.topojson")
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

    // graticule if I had any go here....................

    // translate WI topojson within callback function and assign to new variable
    // note what the objects are labeled in the topojson file and reference in code below
    var statesProvinces = topojson.feature(states, states.objects.midwest),
        wiCounties = topojson.feature(wi, wi.objects.wi_counties_1).features;//adding features array at the end
    // examine results under new variable name
    // console.log(statesProvinces);
    console.log(wiCounties);

    // add states and provinces to map
    var states_provinces = map.append("path")
      .datum(statesProvinces)
      .attr("class", "states_provinces")
      .attr("d", path);

    // join csv data to GeoJSON enumeration Opportunities
    wiCounties = joinData(wiCounties, csvData);

    var colorScale = makeColorScale(csvData);

    // add enumeration units to the map
    setEnumerationUnits(wiCounties,map,path,colorScale);

  };//end of callback function
};//end of setMap()

// Graticule function here....................... Don't have one currently

function joinData(wiCounties, csvData){
  //...Data Join Loops from example 1.1
  var attrArray=["Fair/Poor Health_%","Adult Smokers_%","Adult Obese_%","PhysicallyInactive_%","With Access To Exercise Opportunities_%","Excessive Drinking_%","Long Commute - Drives Alone_%"];

  // loop through csv to assign eac set of csv attribute values to geojson region
  for (var i=0; i<csvData.length; i++){
    var csvCounty = csvData[i]; //current county
    var csvKey = csvCounty.GEOID; //the CSV primary key

    // loop through geojson counties to find correct county
    for (var a=0; a<wiCounties.length; a++){
      var geojsonProps = wiCounties[a].properties;//current county geojson properties
      var geojsonKey = geojsonProps.GEOID;//the geojson primary keys

      // where primary keys match, transfer csv data to geojson properites object
      if(geojsonKey==csvKey){
        // assign all attributes and values
        attrArray.forEach(function(attr){
          var val = parseFloat(csvCounty[attr]); //get csv attribute value
          geojsonProps[attr] = val; //assign attribute and value to geojson properties
        });
      };
    };
  };
  return wiCounties;
};

function setEnumerationUnits(wiCounties, map, path, colorScale){
  // ...Counties block here
  // add WI counties to map
  var counties = map.selectAll(".counties")
    .data(wiCounties)
    .enter()
    .append("path")
    .attr("class", function(d){
      return"counties" + d.properties.GEOID;
      // return"counties" + d.properties.adm1_code;
    })
    .attr("d", path)
    .style("fill", function(d){
      return colorScale(d.properties[expressed]);
    });
};

// creating an equal interval color scale generator..................may want to adjust this look into data breaks
// look into adjusting colors
function makeColorScale(data){
  var colorClasses=[
    "#D4B9DA",
    "#C994C7",
    "#DF65B0",
    "#DD1C77",
    "#980043"
  ];

  // create color scale generator
  var colorScale= d3.scaleThreshold()//spelling?
    .range(colorClasses);
  // build two-value array of minimum and maximum expressed attribute values
  var domainArray = [];
  for (var i=0; i<data.length; i++){
    var val = parseFloat(data[i][expressed]);
    domainArray.push(val);
  };

  // cluster data using ckmeans clustering algorithm to crate natuarl breaks
  var clusters = ss.ckmeans(domainArray, 5);
  // reset domain array to cluster minimums
  domainArray = clusters.map(function(d){
    return d3.min(d);
  });

  // assign array of last 4 cluster minimums as domain
  colorScale.domain(domainArray);

  return colorScale;
  // console.log(colorScale.quantiles());
};

})(); //last line
