// Ashley Kuehl, D3 Lab, Activity 11
// shapefile states and counties data source census.gov
// attribute data source 2019 County Health Rankings and Roadmap Data https://www.countyhealthrankings.org/explore-health-rankings/rankings-data-documentation

// wrapping everythign in a self-executing anonymous function to move to local scope
(function(){

// pseudo-global variables
var attrArray = ["County Population % in Poor Health","Adult Smokers_%","Adult Obese_%","PhysicallyInactive_%","With Access To Exercise Opportunities_%","Excessive Drinking_%","Long Commute - Drives Alone_%"]; //List of atttributes
var expressed = attrArray[0]; // initial attribute on dislplay

// chart frame dimensions
var chartWidth = window.innerWidth * 0.425,
    chartHeight = 470,
    leftPadding = 25,
    rightPadding = 2,
    topBottomPadding = 5,
    chartInnerWidth = chartWidth - leftPadding - rightPadding,
    chartInnerHeight = chartHeight - topBottomPadding *1,
    translate = "translate(" + leftPadding + "," +topBottomPadding + ")";

// create a scale to size bars propotionally to frame for axisLeft
var yScale = d3.scaleLinear()
    .range([463,0])
    .domain([0, 110]);//may need to make this higher?.................................

// begin script when window loads
window.onload = setMap();

// set up choropleth Map
function setMap(){

  // map frame dimensions
  var width= window.innerWidth * 0.5,
      height =460;

  // create new svg container for the map
  var map = d3.select("body")
      .append("svg")
      .attr("class", "map")
      .attr("width",width)
      .attr("height",height);

   // Create projection generator
   // Albers equal area projection centered on WI, https://projectionwizard.org/
   var projection =d3.geoAlbers()
      .center([-.65,26.75])//center coordinates
      .rotate([89, -18, 0])//angle
      .parallels([35,45])//using secant case
      .scale(4250)
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

    // translate WI topojson within callback function and assign to new variable
    // note what the objects are labeled in the topojson file and reference in code below
    var statesProvinces = topojson.feature(states, states.objects.midwest),
        wiCounties = topojson.feature(wi, wi.objects.wi_counties_1).features;//adding features array at the end
    // console.log(statesProvinces);
    // console.log(wiCounties);

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
    // add coordinated visualization  to the map
    setChart(csvData, colorScale);
    // add dropdown menu
    createDropdown(csvData);
  };//end of callback function
};//end of setMap()


function joinData(wiCounties, csvData){
  var attrArray=["County Population % in Poor Health","Adult Smokers_%","Adult Obese_%","PhysicallyInactive_%","With Access To Exercise Opportunities_%","Excessive Drinking_%","Long Commute - Drives Alone_%"];

  // loop through csv to assign each set of csv attribute values to geojson region
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
  // add WI counties to map
  var counties = map.selectAll(".counties")
    .data(wiCounties)
    .enter()
    .append("path")
    .attr("class", function(d){
      return "counties " + d.properties.GEOID;
    })
    .attr("d", path)
    .style("fill", function(d){
      var value = d.properties[expressed];
      if(value){
        return colorScale(d.properties[expressed]);
      } else {
        return "#ccc";
      }
    });
};

// creating an equal interval color scale generator
function makeColorScale(data){
  var colorClasses=[
    "#fee5d9",
    "#fcae91",
    "#fb6a4a",
    "#de2d26",
    "#a50f15"
  ];

  // create color scale generator
  var colorScale= d3.scaleThreshold()
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

  // remove first value from dowmain array to create class breakpoints
  domainArray.shift();

  // assign array of last 4 cluster minimums as domain
  colorScale.domain(domainArray);

  return colorScale;
  // console.log(colorScale.quantiles());
};


// ...............................................................unsure where to put this. set last and there is a cope error. Needs to be set upbove described variables...........................
//function to create a dropdown menu for attribute selection
function createDropdown(csvData){
  // add select element
  var dropdown = d3.select("body")
    .append("select")
    .attr("class", "dropdown")
    .on("change", function(){
      changeAttribute(this.value, csvData)// not sure if this.value is actually selecting the correct data
    });

  // add initial option
  var titleOption = dropdown.append("option")
    .attr("class", "titleOption")
    .attr("disabled", "true")
    .text("Select Attribute");

  // add attribute name option
  var attrOptions = dropdown.selectAll("attrOptions")
    .data(attrArray)
    .enter()
    .append("option")
    .attr("value", function(d){ return d })
    .text(function(d){ return d });
};

// On User Selection steps 1 -6
// dropdown change listener handler. function called in the createDropdown function above.
function changeAttribute(attribute, csvData){
  // Step 1: Change the expressed attribute
  expressed = attribute;

  // Step 2: Recreate the color scale with new class breaks
  var colorScale = makeColorScale(csvData);

  // Step 3: Recolor each enumeration unit on the map
  var counties = d3.selectAll(".counties")
    .style("fill", function(d){
      var value = d.properties[expressed];
      if (value) {
        return colorScale(value);
      } else {
        return "#ccc";
      }
  });

  // Resort, resize and recolor each bar on the bar chart
  var bars = d3.selectAll(".bar")
    // Step 4: re-sort
    .sort(function(a, b){
      return b[expressed] - a[expressed];
    });
  updateChart(bars,csvData.length,colorScale)
};// end of change Attribute()


// function to creted coordinated bar chart
function setChart(csvData, colorScale){
  // chart frame dimensions ............................now part of global variable
  // var chartWidth = window.innerWidth * 0.425,
  //     chartHeight = 470,
  //     leftPadding = 25,
  //     rightPadding = 2,
  //     topBottomPadding = 5,
  //     chartInnerWidth = chartWidth - leftPadding - rightPadding,
  //     chartInnerHeight = chartHeight - topBottomPadding *1,
  //     translate = "translate(" + leftPadding + "," +topBottomPadding + ")";

  // create a second svg element to hold the bar chart
  // getting two svg containers and don't know why
  var chart = d3.select("body")
      .append('svg')
      .attr("width",chartWidth)
      .attr("height",chartHeight)
      .attr("class","chart");

  var chartBackground = chart.append("rect")
      .attr("class", "chartBackground")
      .attr("width", chartInnerWidth)
      .attr("height", chartInnerHeight)
      .attr("transform", translate);

  // // create a scale to size bars proportionally to frame.................now part of global variable
  // var yScale = d3.scaleLinear()
  //     .range([463,0])
  //     .domain([0, 35]);


  // set bars for each county
  var bars = chart.selectAll(".bar")
      .data(csvData)
      .enter()
      .append("rect")
      // reverse order (largest to smallest) by switching a and b
      .sort(function(a, b){
        return b[expressed]-a[expressed]
      })
      .attr("class", function(d){
        return "bar " + d.GEOID;
      })
      .attr("width", chartInnerWidth / csvData.length-1);


      // create chart title with a text element
  var chartTitle = chart.append("text")
      .attr("x", 40)
      .attr("y", 40)
      .attr("class", "chartTitle")

  // create vertical axis generator
  var yAxis = d3.axisLeft()
      .scale(yScale);

  // place axis
  var axis = chart.append("g")
      .attr("class", "axis")
      .attr("transform", translate)
      .call(yAxis);

  // create frame for chart border
  var chartFrame = chart.append("rect")
      .attr("class", "chartFrame")
      .attr("width", chartInnerWidth)
      .attr("height", chartInnerHeight)
      .attr("transform", translate);

  // set bar positions, height and colors
  updateChart(bars, csvData.length, colorScale);
}; // end of setChart()


//function to position, size and color bars in chart
function updateChart(bars,n,colorScale){
  // position bars
  bars.attr("x", function(d, i){
      return i * (chartInnerWidth / n) + leftPadding;
    })
    // size/Resize
    .attr("height", function (d, i){
      return 463 - yScale(parseFloat(d[expressed]));
    })
    .attr("y", function(d,i){
      return yScale(parseFloat(d[expressed])) + topBottomPadding;
    })
    // color/recolor bars
    .style("fill",function(d){
      var value = d[expressed];
      if(value){
        return colorScale(value);
      }else{
        return "#ccc";
      }
    });

  // title text of what variable is expressed at the time
  var chartTitle = d3.select(".chartTitle")
    .text(expressed);
};

// };
})(); //last line
