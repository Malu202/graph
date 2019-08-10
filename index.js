
function Plot(canvas, config) {
    this.backgroundColor = config.backgroundColor;
    this.topMargin = config.topMargin;
    this.bottomMargin = config.bottomMargin;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.height = canvas.height;
    this.width = canvas.width;

    canvas.style["background-color"] = config.backgroundColor;

    this.graphs = config.graphs;
    this.scaleData();
}
Plot.prototype.calculateDataRanges = function () {
    var allXData = [];
    var allYData = [];
    for (var i = 0; i < this.graphs.length; i++) {
        allXData = allXData.concat(this.graphs[i].x);
        allXData = allXData.concat(this.graphs[i].xHighlight);
        allYData = allYData.concat(this.graphs[i].y);
        allYData = allYData.concat(this.graphs[i].yHighlight);
    }
    this.minX = Math.min.apply(null, allXData);
    this.minY = Math.min.apply(null, allYData);
    this.xDataRange = Math.max.apply(null, allXData) - this.minX;
    this.yDataRange = Math.max.apply(null, allYData) - this.minY;
}
Plot.prototype.scaleData = function () {
    this.calculateDataRanges();
    this.xScaling = this.width / this.xDataRange;
    this.yScaling = this.height / this.yDataRange;
    this.yScaling *= 1 - (this.topMargin + this.bottomMargin);
    this.bottomOffset = this.bottomMargin * this.height;
    this.bottom = this.height;
    for (var i = 0; i < this.graphs.length; i++) {
        this.graphs[i].xCoordinates = scaleCoordinates(this.graphs[i].x, this.xScaling, this.minX);
        this.graphs[i].yCoordinates = scaleAndInvertCoordinates(this.graphs[i].y, this.yScaling, this.minY, this.bottomOffset, this.bottom);
        this.graphs[i].xCoordinatesHighlight = scaleCoordinates(this.graphs[i].xHighlight, this.xScaling, this.minX);
        this.graphs[i].yCoordinatesHighlight = scaleAndInvertCoordinates(this.graphs[i].yHighlight, this.yScaling, this.minY, this.bottomOffset, this.bottom);
    }
}
Plot.prototype.draw = function () {
    for (var i = 0; i < this.graphs.length; i++) {
        if (this.graphs[i].type == "line") {
            drawLineInterpolation(this.graphs[i].xCoordinates, this.graphs[i].yCoordinates, this.graphs[i].color, this.graphs[i].linewidth, this.ctx);
            drawDataPoints(this.graphs[i].xCoordinatesHighlight, this.graphs[i].yCoordinatesHighlight, this.graphs[i].color, this.graphs[i].dataPointRadius, this.graphs[i].dataPointLinewidth, false, this.ctx);
        } else if (this.graphs[i].type == "shadow") {
            drawLineInterpolation(this.graphs[i].xCoordinates, this.graphs[i].yCoordinates, this.graphs[i].color, this.graphs[i].linewidth, this.ctx);
            drawDataPoints(this.graphs[i].xCoordinatesHighlight, this.graphs[i].yCoordinatesHighlight, this.graphs[i].color, this.graphs[i].dataPointRadius, this.graphs[i].linewidth, true, this.ctx);
            drawShadowInterpolation(this.graphs[i].xCoordinates, this.graphs[i].yCoordinates, this.graphs[i].shadowColor, this.bottom, this.ctx);
        }
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


function drawDataPoints(xCoordinates, yCoordinates, color, radius, linewidth, fill, ctx) {

    for (var i = 0; i < xCoordinates.length; i++) {
        drawDataPoint(xCoordinates[i], yCoordinates[i], color, radius, linewidth, fill, ctx);
    }
}
var drawDataPoint = function (x, y, color, radius, linewidth, fill, ctx) {
    ctx.lineWidth = linewidth;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    if (fill) {
        ctx.fillStyle = color;
    } else {
        ctx.fillStyle = null;
    }
    ctx.fill();
    ctx.stroke();

    if (!fill) {
        ctx.strokeStyle = "rgb(255, 255, 255)";
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(255,255,255,255)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, radius - linewidth/2, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
    }
}

var drawLineInterpolation = function (xCoordinates, yCoordinates, color, linewidth, ctx) {

    ctx.lineWidth = linewidth;
    ctx.strokeStyle = color;
    for (var i = 0; i < xCoordinates.length; i++) {
        ctx.beginPath();
        ctx.moveTo(xCoordinates[i], yCoordinates[i]);
        ctx.lineTo(xCoordinates[i + 1], yCoordinates[i + 1]);
        ctx.stroke();
    }
}
var drawShadowInterpolation = function (xCoordinates, yCoordinates, color, bottom, ctx) {

    ctx.globalCompositeOperation = "destination-over";
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

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