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
    .range(["#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"])

//
// enter code to define tooltip
const tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .attr("id", "tooltip")
    .html(function(d){
        
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

    var dater = createDater(valMonth, valYear);

    var filteredData = createFilteredData(corrData, valFeature, dater);

    // Append Data into JSON
    for (var j = 0; j < Object.keys(nycJson.features).length-1; j++){
        for(var k = 0; k < filteredData.length; k++ ){
            if(nycJson.features[j].properties["Precinct"] == filteredData[k][0]){
                nycJson.features[j].properties["Rsq"] = filteredData[k][1];
            }
        };
    };

    var countries = svg.append("g")
        .attr("id", "countries");
    
    // const ascender = [];
    // if(filtered_data != null){
    //     for (var l = 0; l < filtered_data.length; l++ ){
    //         ascender[l] = parseFloat(filtered_data[l][2]);
    //     };
    // };

    // ascender.sort(function(a,b){
    //     return a-b
    // });

    // var quantile2 = medianer(ascender);

    // temp1 = ascender.slice(0, Math.floor(ascender.length/2))
    // var quantile1 = medianer(temp1);

    // temp2 = ascender.slice(Math.ceil(ascender.length/2), ascender.length)
    // var quantile3 = medianer(temp2);

    // colorScale.domain(ascender);

    // Building ColorScale
    const listOfAllRSQ = []
    for(var i = 0; i < filteredData.length; i++){
        listOfAllRSQ[i] = filteredData[i][1]
    };
    colorScale.domain(listOfAllRSQ);

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
    
    // var legend = svg.append("g")
    //     .attr("id", "legend");

    //     legend.append("rect")
    //         .attr("x", 1000)
    //         .attr("y", 120)
    //         .attr("width", 15)
    //         .attr("height", 15)
    //         .style("fill", "#fee5d9");
    //     legend.append("text")
    //         .attr("x", 1020)
    //         .attr("y", 130)
    //         .text(`${Math.round(ascender[0] * 100) / 100} to ${Math.round(quantile1 * 100) / 100}`)
    //         .style("font-size", "15px")
    //         .attr("alignment-baseline","middle");
        
    //     legend.append("rect")
    //         .attr("x", 1000)
    //         .attr("y", 135)
    //         .attr("width", 15)
    //         .attr("height", 15)
    //         .style("fill", "#fcae91");
    //     legend.append("text")
    //         .attr("x", 1020)
    //         .attr("y", 145)
    //         .text(`${Math.round(quantile1 * 100) / 100} to ${Math.round(quantile2 * 100) / 100}`)
    //         .style("font-size", "15px")
    //         .attr("alignment-baseline","middle");

    //     legend.append("rect")
    //         .attr("x", 1000)
    //         .attr("y", 150)
    //         .attr("width", 15)
    //         .attr("height", 15)
    //         .style("fill", "#fb6a4a");
    //     legend.append("text")
    //         .attr("x", 1020)
    //         .attr("y", 160)
    //         .text(`${Math.round(quantile2 * 100) / 100} to ${Math.round(quantile3 * 100) / 100}`)
    //         .style("font-size", "15px")
    //         .attr("alignment-baseline","middle");

    //     legend.append("rect")
    //         .attr("x", 1000)
    //         .attr("y", 165)
    //         .attr("width", 15)
    //         .attr("height", 15)
    //         .style("fill", "#cb181d");
    //     legend.append("text")
    //         .attr("x", 1020)
    //         .attr("y", 175)
    //         .text(`${Math.round(quantile3 * 100) / 100} to ${Math.round(ascender[ascender.length-1] * 100) / 100}`)
    //         .style("font-size", "15px")
    //         .attr("alignment-baseline","middle");
};

function medianer(array){
    val = (array.length/2);
    if(val.isInteger){
        return array[val];
    }
    else{
        return (array[Math.floor(val)]+array[Math.ceil(val)])/2
    }
};

function createFilteredData(corrData, valFeature, dater){
    var data = [];
    for (var i = 0; i < Object.keys(corrData).length-1; i++){
        if((corrData[i]['Time'] == dater) && (corrData[i]['Feature']==valFeature)){
            data.push([corrData[i]['Precinct'], corrData[i]['Rsq']]);
        }
        // if(((corrData[i]['Time'])==dater) && (corrData[i]['Feature']==valFeature)){
        //     console.log(corrData[i]['Time'])
        //     // data.push([corrData[i]['Precinct'], corrData[i]['Rsq']]);
        // };
    };

    return data
};

function createDater(valMonth, valYear){
    var valMonth2Dig = valMonth;

    if(parseInt(valMonth)<10){
        valMonth2Dig = 0+valMonth
    }
    return (valMonth2Dig+"-"+valYear)
};