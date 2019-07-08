var PRIMARY = "#4caf50";
var DARK_PRIMARY = "#087f23";
var LIGHT_PRIMARY = "#80e27e";
var WHITE = "#FFFFFF";
var TRANSPARENT = "rgba(1, 1, 1, 0)";

var BACKGROUND_COLOR = PRIMARY;

var topMargin = 0.1;
var bottomMargin = 0.1;

var LINE_THICKNESS = 4;
var DATA_POINT_RADIUS = 5;

//var data = [16, 18, 20, 22.5, 25, 29, 33, 31.5, 30, 30, 25, 20];
var dataX = [];
var dataY = [];

var highlightDataX = [];
var highlightDataY = [];

var generateMockupData = function () {
    dataX = [];
    dataY = [];
    var steps = 100;
    var stepSize = 4 / (steps - 1);
    for (var i = -2; i <= 2; i += stepSize) {
        j = i + (Math.random() - Math.random()) * 0.5 * stepSize;
        y = 8 * Math.exp(-j * j) + 25;
        dataX.push(j);
        dataY.push(y);

        if (Math.random() < 0.1) {
            highlightDataX.push(j);
            highlightDataY.push(y);
        }
    }
}
generateMockupData();

function generateMockupData2() {
    
}

var ctx;
var height;
var width;
var a;
function draw() {
    var canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
        height = canvas.height;
        width = canvas.width;

        canvas.style["background-color"] = BACKGROUND_COLOR;

        var dataXRange = Math.max.apply(null, dataX) - Math.min.apply(null, dataX);
        var x_scaling = width / dataXRange;

        var dataYRange = Math.max.apply(null, dataY) - Math.min.apply(null, dataY);
        var y_scaling = height / dataYRange;
        y_scaling *= 1 - (topMargin + bottomMargin);
        var bottomOffset = bottomMargin * height;

        zerolineX = Math.min.apply(null, dataX);
        zerolineY = Math.min.apply(null, dataY);

        var bottom = height;


        drawShadowInterpolation(dataX, dataY, x_scaling, y_scaling, zerolineX, zerolineY, bottomOffset, height, bottom);
        drawLineInterpolation(dataX, dataY, x_scaling, y_scaling, zerolineX, zerolineY, bottomOffset, height);
        drawDataPoints(highlightDataX, highlightDataY, x_scaling, y_scaling, zerolineX, zerolineY, bottomOffset, height);
    }
}

function scaleCoordinates(data, scaling, zeroline) {
    var scaled = [];
    for (var i = 0; i < data.length; i++) {
        scaled[i] = scaling * (data[i] - zeroline);
    }
    return scaled;
}
function scaleAndInvertCoordinates(data, scaling, zeroline, bottomOffset, height) {
    var scaled = [];
    for (var i = 0; i < data.length; i++) {
        scaled[i] = height - scaling * (data[i] - zeroline) - bottomOffset;
    }
    return scaled;
}

var drawDataPoint = function (x, y) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = WHITE;
    ctx.beginPath();
    ctx.arc(x, y, DATA_POINT_RADIUS, 0, Math.PI * 2, true);
    ctx.fillStyle = WHITE;
    ctx.fill();
    ctx.stroke();
}

var drawLineInterpolation = function (dataX, dataY, x_scaling, y_scaling, zerolineX, zerolineY, bottomOffset, height) {
    var xCoordinates = scaleCoordinates(dataX, x_scaling, zerolineX);
    var yCoordinates = scaleAndInvertCoordinates(dataY, y_scaling, zerolineY, bottomOffset, height);

    ctx.lineWidth = LINE_THICKNESS;
    ctx.strokeStyle = WHITE;
    for (var i = 0; i < xCoordinates.length; i++) {
        ctx.beginPath();
        ctx.moveTo(xCoordinates[i], yCoordinates[i]);
        ctx.lineTo(xCoordinates[i + 1], yCoordinates[i + 1]);
        ctx.stroke();
    }
}
var drawShadowInterpolation = function (dataX, dataY, x_scaling, y_scaling, zerolineX, zerolineY, bottomOffset, height, bottom) {
    var xCoordinates = scaleCoordinates(dataX, x_scaling, zerolineX);
    var yCoordinates = scaleAndInvertCoordinates(dataY, y_scaling, zerolineY, bottomOffset, height);

    ctx.lineWidth = 1;
    ctx.strokeStyle = LIGHT_PRIMARY;
    ctx.fillStyle = LIGHT_PRIMARY;

    for (var i = 0; i < xCoordinates.length; i++) {
        ctx.beginPath();
        ctx.moveTo(xCoordinates[i], yCoordinates[i]);
        ctx.lineTo(xCoordinates[i], bottom);
        ctx.lineTo(xCoordinates[i + 1], bottom);
        ctx.lineTo(xCoordinates[i + 1], yCoordinates[i + 1]);
        ctx.fill();
        ctx.stroke();
    }
}
function drawDataPoints(dataX, dataY, x_scaling, y_scaling, zerolineX, zerolineY, bottomOffset, height){
    var xCoordinates = scaleCoordinates(dataX, x_scaling, zerolineX);
    var yCoordinates = scaleAndInvertCoordinates(dataY, y_scaling, zerolineY, bottomOffset, height);
    for (var i = 0; i < xCoordinates.length; i++) {
        drawDataPoint(xCoordinates[i],yCoordinates[i]);
    }
}