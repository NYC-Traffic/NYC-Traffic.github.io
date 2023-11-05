// Choropleth Map SVG Dimensions
var svg_width = 700
var svg_height = 1000

//
// Creating SVG
var svg = d3.select("#container")
    .append("svg")
    .attr("width", svg_width)
    .attr("height", svg_height)
    .attr("id", "choropleth")

//
// Creating Color Scale
var colorScale = d3.scaleQuantile()
    .range(["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"])

//
// enter code to define tooltip
const tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .attr("id", "tooltip")
    .html(function(d){
        return `Precinct: ${d.properties["Precinct"]}<br> Correlation Coefficient: ${d.properties["Rsq"]}`;
    });

//
// Projection and Path required for Choropleth
var projection = d3.geoAlbers();
var path = d3.geoPath().projection(projection);

//
// Global Variables

// Taking in Data and Calling ready()
Promise.all([
    d3.json("NYC_Police_Precincts.geojson"),
    d3.csv("data.csv")
]).then(([precinctData, correlationData]) => {
    ready(precinctData, correlationData);
});

function ready(nycJson, corrData) {
    // Extract all Unique Features into featureSet
    var featureSet = new Set();
    for (var i = 0; i < Object.keys(corrData).length-1; i++){
        featureSet.add(corrData[i].Feature) 
    }

    // featureSet to sorted featureList
    var featureList = Array.from(featureSet);
    featureList.sort();

    // Append Unique Features to Dropdown Menu
    d3.select("select")
        .selectAll("option")
        .data(featureList)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);
    
    projection.fitSize([700,800], nycJson);

    // --- EVENT LISTENERS --- 
    var sliderForMonth = document.getElementById("MonthRange");
    var sliderForYear = document.getElementById("YearRange");
    var selectedFeature = document.getElementById("gameDropdown");

    // Event Listener for the Dropdown to Update Choropleth
    selectedFeature.onchange = function(){
        createMapAndLegend(nycJson, corrData, selectedFeature.value, sliderForMonth.value, sliderForYear.value);
    };

    sliderForMonth.onchange = function(){
        createMapAndLegend(nycJson, corrData, selectedFeature.value, this.value, sliderForYear.value);
    }

    sliderForYear.onchange = function(){
        createMapAndLegend(nycJson, corrData, selectedFeature.value, sliderForMonth.value, this.value);
    }

    // Default Choropleth
    createMapAndLegend(nycJson, corrData, selectedFeature.value, sliderForMonth.value, sliderForYear.value);
}

// this function should create a Choropleth and legend using the world and gameData arguments for a selectedGame
// also use this function to update Choropleth and legend when a different game is selected from the dropdown
function createMapAndLegend(nycJson, corrData, valFeature, valMonth, valYear){ 
    d3.selectAll("svg > *").remove();

    // console.log(nycJson.features[0].properties["Precinct"])

    svg.call(tooltip);

    // Filtering Data based on Selections (dater is ju)
    var filteredData = createFilteredData(corrData, valFeature, valMonth, valYear);

    // Append Data into JSON
    for (var j = 0; j < Object.keys(nycJson.features).length-1; j++){
        for(var k = 0; k < filteredData.length; k++ ){
            if(nycJson.features[j].properties["Precinct"] == filteredData[k][0]){
                nycJson.features[j].properties["Rsq"] = filteredData[k][1];
            }
        };
    };

    // Building ColorScale
    const listOfAllRSQ = []
    for(var i = 0; i < filteredData.length; i++){
        listOfAllRSQ[i] = filteredData[i][1]
    };
    colorScale.domain(listOfAllRSQ);


    // Building the Map Using Paths
    var countries = svg.append("g")
        .attr("id", "countries");

    var paths = countries.selectAll("#countries")
        .data(nycJson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", function(d){
            return d.properties['Precinct'];
        })
        .style("fill", function(d){
            return colorScale(d.properties["Rsq"])
        })
        .on("mouseover", tooltip.show)
        .on("mouseout", tooltip.hide);

};

function createFilteredData(corrData, valFeature, valMonth, valYear){
    // Filter data only for the specified time and specified feature
    const dater = createDater(valMonth, valYear);
    var data = [];
    for (var i = 0; i < Object.keys(corrData).length-1; i++){
        if((corrData[i]['Time'] == dater) && (corrData[i]['Feature']==valFeature)){
            data.push([corrData[i]['Precinct'], corrData[i]['Rsq']]);
        }
    };
    return data
};

function createDater(valMonth, valYear){
    var valMonth2Dig = valMonth;
    // Make month = 1,2 etc to 01,02 etc.
    if(parseInt(valMonth)<10){
        valMonth2Dig = 0+valMonth
    }
    return (valMonth2Dig+"-"+valYear)
};