window.onload = function(){
  var container = d3.select("body")
    .append("svg");
  // console.log(container);

  // SVG dimension variables
  var w = 900, h = 500;

  // container block use d3s attribute operator to assgin any attributes to markup
  //  get the body element from the DOM
  var container = d3.select("body")
    // put a new svg in the body
    .append("svg")
    // assign the width and height
    .attr("width",w)
    .attr("height",h)
    // Assign a class (as the block name) for styling and future seletion
    .attr("class", "contianer")
    .style("background-color", "rgba(0,0,0,0.2)");
    // append a rectangle element
    // .append("rect")
    // .attr("width", 800)
    // .attr("height", 400);
    // rect is now an operand of the container block

  // Inner Rect block
  // put a new rect in the svg
  var innerRect = container.append("rect")
    .datum(400)
    // appling an anonymous function to use methods on data
    // d refers to datum
    .attr("width", function(d){
      // in other words 400 * 2
      return d * 2;
    })
    .attr("height", function(d){
      return d;
    })
    // class name
    .attr("class", "innerRect")
    // position from left on the x axis, position from top on the y axis
    .attr("x", 50)
    .attr("y", 50)
    // Fill color
    .style("fill", "#FFFFFF");
  // console.log(innerRect);

  var numbersArray =[1,2,3];
  var stringsArray =["one","two","three"];
  var colorsArray =["#F00", "#0F0", "#00F"];


  var cityPop =[
    {
      city:'Madison',
      population: 233209
    },
    {
      city:'Milwaukee',
      population: 594833
    },
    {
      city:'Green Bay',
      population: 104057
    },
    {
      city:'Superior',
      population: 27244
    }
  ]

  // var dataArray = [10,20,30,40,50];


  // find the minimum value of the array
  var minPop = d3.min(cityPop, function(d){
    return d.population;
  });

  // find the maximum value of the array
  var maxPop = d3.max(cityPop, function(d){
    return d.population;
  });


  // scale for circles center y coordiante
  var y = d3.scaleLinear()
    .range([450, 50])
    .domain([0, 700000]);


  // create the scale
  // x operands is a generator (custom function designed to determine where in the range each output value lies based on each input datum)
  var x = d3.scaleLinear()
  // output min and max (pixel values)
  .range([95, 750])
  // input min and max (corresponds to my data)
  .domain([0,3]);


  // color scale generator
  var color = d3.scaleLinear()
    .range([
      // min pop
      "#FDBE85",
      // max pop
      "#D94701"
    ])
    .domain([
      minPop,
      maxPop
    ]);


  // circle block
  var circles=container.selectAll(".circles")
  // plug in array
  .data(cityPop)
  .enter()
  // add a circle for each datum
  .append("circle")
  // apply a class name to all circles
  .attr("class", "circles")
  .attr("id", function(d){
    return d.city;
  })
  // circle radius
  .attr("r",function(d){
    // calculate radius based on pop value as circle area
    var area = d.population*0.01;
    return Math.sqrt(area/Math.PI);

  })
  // x coordinate
  .attr("cx", function (d,i){
    // use the scale generator with the index to place each circle horizontally
    return x(i);
  })
  // y coordinate
  .attr("cy", function (d){
    // subtract value from 450 to "grow" circles up from the bottom instead of down from the top of teh SVG
    return y(d.population);
  })
  .style("fill", function(d,i){
    // add a fill based on the color scale generator
    return color(d.population);
  })
  .style("stroke", "#000");


  // creating the axis
  // argument y references the scale generator function used for circles
  var yAxis = d3.axisLeft(y);

  // create axis g (group) element and add axis
  var axis = container.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(50,0)")
    // shorthand
    .call(yAxis);

  // Create title container, add placement, and append text
  var title = container.append("text")
    .attr("class", "title")
    .attr("text-anchor", "middle")
    .attr("x", 450)
    .attr("y", 30)
    .text("City Populations");


  // create circle lables
  var labels = container.selectAll(".labels")
    .data(cityPop)
    .enter()
    .append("text")
    .attr("class", "labels")
    .attr("text-anchor", "left")
    .attr("y", function(d){
      // vertical position centered on each circle
      return y(d.population);
    });


  // First line of Labels
  var nameLine = labels.append("tspan")
    .attr("class", "nameLine")
    .attr("x", function (d,i){
      // horrizontal position to the right of each circle
      return x(i)+Math.sqrt(d.population * 0.01/Math.PI) + 5;
    })
    .text(function(d){
      return d.city;
    });

  // Create format generator
  var format = d3.format(",");

  // second line of labels
  var popLine = labels.append("tspan")
    .attr("class", "popLine")
    .attr("x", function (d,i){
      // horrizontal position to the right of each circle
      return x(i)+Math.sqrt(d.population * 0.01/Math.PI) + 5;
    })
    // vertical offset
    .attr("dy", "15")
    .text(function(d){
      return "Pop. " + format(d.population);
    });

    // Need to clean up text still .................................



};
