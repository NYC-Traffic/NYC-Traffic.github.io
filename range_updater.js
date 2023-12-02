window.onload = function() {
    // Define the desired default zoom level
    var desiredZoomLevel = 1;
  
    // Calculate the screen width in CSS pixels
    var screenWidth = window.innerWidth * window.devicePixelRatio;
  
    // Set the zoom level based on the screen width
    var currentZoomLevel = screenWidth / 1920; // Assuming a standard 15-inch laptop width of 1920 pixels
    var zoomFactor = desiredZoomLevel / currentZoomLevel;
  
    // Apply the zoom level to the body element
    document.body.style.zoom = zoomFactor;
  };

var sliderForMonth = document.getElementById("MonthRange")
var sliderForYear = document.getElementById("YearRange")

var yearOutput = document.getElementById("yearOutput");
var monthOutput = document.getElementById("monthOutput");

var monthString = "March";

monthOutput.innerHTML = monthString;
yearOutput.innerHTML = sliderForYear.value;

sliderForMonth.oninput = function() {
    if(this.value == 1){
        monthString = "January";
    } else if(this.value == 2) {
        monthString = "February";
    } else if(this.value == 3) {
        monthString = "March";
    } else if(this.value == 4) {
        monthString = "April";
    } else if(this.value == 5) {
        monthString = "May";
    } else if(this.value == 6) {
        monthString = "June";
    } else if(this.value == 7) {
        monthString = "July";
    } else if(this.value == 8) {
        monthString = "August";
    } else if(this.value == 9) {
        monthString = "September";
    } else if(this.value == 10) {
        monthString = "October";
    } else if(this.value == 11) {
        monthString = "November";
    } else {
        monthString = "December";
    }
    monthOutput.innerHTML = monthString;
}

sliderForYear.oninput = function() {
    yearOutput.innerHTML = this.value;
}