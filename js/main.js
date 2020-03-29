// Ashley Kuehl, D3 Lab, Activity 9

// begin script when window loads
window.onload = setMap();

// set up choropleth Map
function setMap(){
  // use Promise.all to parallelize asynchronous data loading
  var promises = [d3.csv("data/WI_Health_by_County.csv"),
                  d3.json("data/County_Boundaries_2.topojson")
                  // may want to add other states for reference?
                ];
  Promise.all(promises).then(callback);

  function callback(data){
    csvData=data[0];
    wi=data[1];
    console.log(csvData);
    console.log(wi);

    // translate WI topojson within callback function
    var wiCounties = topojson.feature(wi, wi.objects.County_Boundaries_2);
    // examine results
    console.log(wiCounties);
  };
};
