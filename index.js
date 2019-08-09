var PRIMARY = "#4caf50";
var DARK_PRIMARY = "#087f23";
var LIGHT_PRIMARY = "#80e27e";
var WHITE = "#FFFFFF";
var TRANSPARENT = "rgba(1, 1, 1, 0)";
var RED = "#FF0000"

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

        if (Math.random() < 0.5) {
            highlightDataX.push(j);
            highlightDataY.push(y);
        }
    }
}
generateMockupData();
generateMockupData2();
function generateMockupData2() {
    highlightDataX = [];
    highlightDataY = [];

    var steps = 100;
    var stepSize = 4 / (steps - 1);
    for (var i = -2; i <= 2; i += stepSize) {
        if (Math.random() < 0.5) {
            j = i + (Math.random() - Math.random()) * 0.5 * stepSize;
            y = 8 * Math.exp(-(j + 1) * (j + 1)) + 25;
            highlightDataX.push(j);
            highlightDataY.push(y);
        }
    }
}

// var a;
var can = document.getElementById("canvas");
window.onload = function(){
    draw(can);
};
function draw(canvas) {
    if (canvas.getContext) {

        var ctx = canvas.getContext("2d");
        var height = canvas.height;
        var width = canvas.width;

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

        var xCoordinates = scaleCoordinates(dataX, x_scaling, zerolineX);
        var yCoordinates = scaleAndInvertCoordinates(dataY, y_scaling, zerolineY, bottomOffset, height);

        var xCoordinatesHighlight = scaleCoordinates(highlightDataX, x_scaling, zerolineX);
        var yCoordinatesHighlight = scaleAndInvertCoordinates(highlightDataY, y_scaling, zerolineY, bottomOffset, height);

        drawLineInterpolation(xCoordinates, yCoordinates, ctx);
        drawDataPoints(xCoordinatesHighlight, yCoordinatesHighlight, WHITE, DATA_POINT_RADIUS, 2, ctx);
        drawShadowInterpolation(xCoordinates, yCoordinates, bottom, ctx);
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

var drawDataPoint = function (x, y, color, radius, linewidth, ctx) {
    ctx.lineWidth = linewidth;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.fillStyle = TRANSPARENT;
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgb(255, 255, 255)";
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(255,255,255,255)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, radius - linewidth, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
}

var drawLineInterpolation = function (xCoordinates, yCoordinates, ctx) {

    ctx.lineWidth = LINE_THICKNESS;
    ctx.strokeStyle = WHITE;
    for (var i = 0; i < xCoordinates.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(xCoordinates[i], yCoordinates[i]);
        ctx.lineTo(xCoordinates[i + 1], yCoordinates[i + 1]);
        ctx.stroke();
    }
}
var drawShadowInterpolation = function (xCoordinates, yCoordinates, bottom, ctx) {

    ctx.globalCompositeOperation = "destination-over";
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
    ctx.globalCompositeOperation = "source-over";

}
function drawDataPoints(xCoordinates, yCoordinates, color, radius, linewidth, ctx) {

    for (var i = 0; i < xCoordinates.length; i++) {
        drawDataPoint(xCoordinates[i], yCoordinates[i], color, radius, linewidth, ctx);
    }
}