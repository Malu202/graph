
function Plot(canvas, config) {
    this.backgroundColor = config.backgroundColor;
    this.topMargin = config.topMargin;
    this.bottomMargin = config.bottomMargin;
    this.axisSize = config.axisSize;
    this.xAxisLabelMaxDecimals = config.xAxisLabelMaxDecimals;
    this.yAxisLabelMaxDecimals = config.yAxisLabelMaxDecimals;
    this.xAxisMaxLabels = config.xAxisMaxLabels;
    this.yAxisMaxLabels = config.yAxisMaxLabels;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.height = canvas.height;
    this.width = canvas.width;

    canvas.style["background-color"] = config.backgroundColor;

    this.graphs = config.graphs;
    this.calculateDataRanges();
    this.calculateDrawingProperties();
    this.scaleData();
}
Plot.prototype.calculateDataRanges = function (minPlottingX, minPlottingY, maxPlottingX, maxPlottingY) {
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
    this.maxX = Math.max.apply(null, allXData);
    this.maxY = Math.max.apply(null, allYData);
    this.xDataRange = this.maxX - this.minX;
    this.yDataRange = this.maxY - this.minY;

    if (!minPlottingX) this.minPlottingX = floorToDecimals(Math.min.apply(null, allXData), this.xAxisLabelMaxDecimals);
    else this.minPlottingX = minPlottingX;
    if (!minPlottingY) this.minPlottingY = floorToDecimals(Math.min.apply(null, allYData), this.yAxisLabelMaxDecimals);
    else this.minPlottingY = minPlottingY;
    if (!maxPlottingX) this.maxPlottingX = ceilToDecimals(Math.max.apply(null, allXData), this.xAxisLabelMaxDecimals);
    else this.maxPlottingX = maxPlottingX;
    if (!maxPlottingY) this.maxPlottingY = ceilToDecimals(Math.max.apply(null, allYData), this.yAxisLabelMaxDecimals);
    else this.maxPlottingY = maxPlottingY;

    this.xPlottingRange = this.maxPlottingX - this.minPlottingX;
    this.yPlottingRange = this.maxPlottingY - this.minPlottingY;
    this.longestLabelX = (round(this.maxX, 0).toString()).length;
    this.longestLabelY = (round(this.maxY, 0).toString()).length;
    if (this.yAxisLabelMaxDecimals > 0) this.longestLabelY += this.yAxisLabelMaxDecimals;

    this.xScaling = this.width / this.xPlottingRange;
    this.yScaling = this.height / this.yPlottingRange;
    this.yScaling *= 1 - (this.topMargin + this.bottomMargin);
    this.xScaling *= 1 - this.axisSize;
    this.bottomOffset = this.bottomMargin * this.height;
    this.topOffset = this.topMargin * this.height;
    this.leftOffset = this.axisSize * this.width;
    this.bottom = this.height;
}
function floorToDecimals(number, decimals) {
    return Math.floor(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
function ceilToDecimals(number, decimals) {
    return Math.ceil(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
function isPrime(num) {
    for (let i = 2, s = Math.sqrt(num); i <= s; i++)
        if (num % i === 0) return false;
    return num > 1;
}
Plot.prototype.scaleData = function () {
    for (var i = 0; i < this.graphs.length; i++) {
        this.graphs[i].xCoordinates = scaleCoordinates(this.graphs[i].x, this.xScaling, this.minPlottingX, this.leftOffset);
        this.graphs[i].yCoordinates = scaleAndInvertCoordinates(this.graphs[i].y, this.yScaling, this.minPlottingY, this.bottomOffset, this.bottom);
        this.graphs[i].xCoordinatesHighlight = scaleCoordinates(this.graphs[i].xHighlight, this.xScaling, this.minPlottingX, this.leftOffset);
        this.graphs[i].yCoordinatesHighlight = scaleAndInvertCoordinates(this.graphs[i].yHighlight, this.yScaling, this.minPlottingY, this.bottomOffset, this.bottom);
    }
}
Plot.prototype.calculateDrawingProperties = function () {
    this.xAxisHeight = this.height - this.topOffset - this.bottomOffset;
    this.xAxisWidth = this.leftOffset;

    this.labelHeight = (this.xAxisWidth / 2) * (2 / (this.longestLabelY + 1));
    this.gridLineCount = this.yPlottingRange * Math.pow(10, this.yAxisLabelMaxDecimals) + 1;
    this.gridLineCount = round(this.gridLineCount, 0)
    this.dataStepSize = this.yPlottingRange / (this.gridLineCount - 1);
    var originalStepSize = this.dataStepSize;
    this.drawingStepSize = this.xAxisHeight / (this.gridLineCount - 1);

    if (this.drawingStepSize < this.labelHeight || this.gridLineCount > this.yAxisMaxLabels) {
        var range = this.yPlottingRange * Math.pow(10, this.yAxisLabelMaxDecimals);

        var groeszenordnung = ceilToDecimals(range, -1);

        var preferredLabelSteps = [2, 5, 10, 20, 25];
        var labelSteps = []
        var closestStepping;
        var lowestError = Infinity;
        var lowestErrorTop = Infinity;
        var lowestErrorBottom = Infinity;
        var foundBestSolution = false;
        for (var j = 0; j < range && !foundBestSolution; j++) {
            preferredLabelSteps.forEach(function (label, index) {
                labelSteps[index] = preferredLabelSteps[index] * Math.pow(10, j);
            });
            console.log("j: " + j)
            console.log(labelSteps)
            for (var i = 0; i < labelSteps.length; i++) {
                console.log("testing: " + labelSteps[i])
                var errorTop = labelSteps[i] - this.maxY % labelSteps[i];
                var errorBottom = this.minY % labelSteps[i];
                var error = errorTop + errorBottom;

                var minY = this.minY - errorBottom;

                var maxY = this.maxY + errorTop;
                var gridLineCount = ((maxY - minY) / labelSteps[i]) + 1;
                var drawingStepSize = this.xAxisHeight / (gridLineCount - 1);
                console.log("drawingStepSize: " + drawingStepSize)
                console.log("labelHeight: " + this.labelHeight)
                console.log("gridLineCount: " + gridLineCount)


                if (gridLineCount <= this.yAxisMaxLabels && drawingStepSize >= this.labelHeight) {
                    foundBestSolution = true;
                    lowestError = error;
                    lowestErrorTop = errorTop;
                    lowestErrorBottom = errorBottom;
                    closestStepping = labelSteps[i];
                    this.minY = minY;
                    this.maxY = maxY;
                    this.gridLineCount = gridLineCount;
                    console.log("ez")
                    break;
                }
            }
        }
    }
    this.calculateDataRanges(null, this.minY, null, this.maxY);

    this.dataStepSize = closestStepping;
    this.drawingStepSize = this.xAxisHeight / (this.gridLineCount - 1);

    console.log("closestStepping " + closestStepping)
    console.log("lowestErrorTop " + lowestErrorTop)
    console.log("lowestErrorBottom " + lowestErrorBottom)
    var a = this.minY;
    console.log("minY " + a)
    console.log("maxY " + this.maxY)

    console.log("gridlinecount " + this.gridLineCount)


};
var WHOLE_NUMBER_DECIMAL_TOLERANCE = 5;
function isWholeNumber(number, decimalOffset) {
    return round(number, decimalOffset + WHOLE_NUMBER_DECIMAL_TOLERANCE) == round(number, decimalOffset);
}
Plot.prototype.draw = function () {
    for (var i = 0; i < this.graphs.length; i++) {
        if (this.graphs[i].type == "line") {
            drawLineInterpolation(this.graphs[i].xCoordinates, this.graphs[i].yCoordinates, this.graphs[i].color, this.graphs[i].linewidth, this.ctx);
            drawDataPoints(this.graphs[i].xCoordinatesHighlight, this.graphs[i].yCoordinatesHighlight, this.graphs[i].color, this.graphs[i].dataPointRadius, this.graphs[i].dataPointLinewidth, false, this.ctx);
        } else if (this.graphs[i].type == "shadow") {
            drawLineInterpolation(this.graphs[i].xCoordinates, this.graphs[i].yCoordinates, this.graphs[i].color, this.graphs[i].linewidth, this.ctx);
            drawDataPoints(this.graphs[i].xCoordinatesHighlight, this.graphs[i].yCoordinatesHighlight, this.graphs[i].color, this.graphs[i].dataPointRadius, this.graphs[i].linewidth, true, this.ctx);
            drawShadowInterpolation(this.graphs[i].xCoordinates, this.graphs[i].yCoordinates, this.graphs[i].shadowColor, this.bottom - this.bottomOffset, this.ctx);
        }
    }
    this.drawAxis();

}


function scaleCoordinates(data, scaling, zeroline, leftOffset) {
    var scaled = [];
    for (var i = 0; i < data.length; i++) {
        scaled[i] = scaling * (data[i] - zeroline) + leftOffset;
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

Plot.prototype.drawAxis = function () {
    for (var i = 0; i < this.gridLineCount; i += 1) {
        var y = this.topOffset + this.xAxisHeight - i * this.drawingStepSize;

        var labelValue = this.minPlottingY + this.dataStepSize * i;
        if (this.yAxisLabelMaxDecimals > 0) var labelValue = round(this.minPlottingY + this.dataStepSize * i, this.yAxisLabelMaxDecimals);




        drawTextWithHeight(labelValue + "°", this.xAxisWidth / 4, y, this.labelHeight, "#fff", this.ctx);
        drawGridLine("#fff", this.leftOffset, y, this.width, this.ctx)
    }

    this.ctx.globalCompositeOperation = "destination-over";
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#fff";
    this.ctx.moveTo(this.leftOffset, this.height - this.bottomOffset);
    this.ctx.lineTo(this.leftOffset, this.topOffset);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.strokeStyle = "#fff";
    this.ctx.moveTo(this.leftOffset, this.height - this.bottomOffset);
    this.ctx.lineTo(this.width, this.height - this.bottomOffset);
    this.ctx.stroke();
    this.ctx.globalCompositeOperation = "source-over";
}

function drawTextWithHeight(text, x, y, height, color, ctx) {
    var zoomFactor = height / 20;
    var x = x / zoomFactor;
    var y = y / zoomFactor;// + height/(zoomFactor);



    ctx.save()
    ctx.font = "20px sans serif";
    ctx.fillStyle = color
    ctx.scale(zoomFactor, zoomFactor); // enlarge 5x

    y += height / (3 * zoomFactor);
    ctx.fillText(text, x, y);
    ctx.restore()
}
function drawGridLine(color, x, y, width, ctx) {

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();
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
        ctx.arc(x, y, radius - linewidth / 2, 0, Math.PI * 2, true);
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


function round(value, decimals) {

    //Removing scientific notation if used:
    var valueString = value.toString();
    var indexOfE = valueString.indexOf("E");
    var indexOfe = valueString.indexOf("e");
    var power = 0;
    if (indexOfe > -1) {
        power = parseFloat(valueString.substring(indexOfe + 1));
        valueString = valueString.substring(0, indexOfe)
    } else if (indexOfE > -1) {
        power = parseFloat(valueString.substring(indexOfE + 1));
        valueString = valueString.substring(0, indexOfE)
    }
    //round
    return Number(Math.round(valueString + 'e' + (power + decimals)) + 'e-' + (decimals));
}