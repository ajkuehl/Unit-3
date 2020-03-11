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
  var objectArray =[
    {
      city:'Madison',
      population: 233209
    },
    {
      city:'Madison',
      population: 2332090
    },
    {
      city:'Green Bay',
      population: 104057
    }
  ];

  var arraysArray = [
    ['Madison', 23209],
    ['Milwaukee',593833],
    ['Green Bay', 104057],
  ];

  var dataArray = [10,20,30,40,50];

  var circles=container.selectAll(".circles")
  // plug in array
  .data(dataArray)
  .enter()




};
