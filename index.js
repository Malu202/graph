
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
    console.log(("longestLabelY: " + this.longestLabelY));

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
    console.log("labelheight: " + this.labelHeight)
    this.gridLineCount = this.yPlottingRange * Math.pow(10, this.yAxisLabelMaxDecimals) + 1;
    this.gridLineCount = round(this.gridLineCount, 0)
    // console.log("old gridLineCount: " + this.gridLineCount)
    this.dataStepSize = this.yPlottingRange / (this.gridLineCount - 1);
    var originalStepSize = this.dataStepSize;
    this.drawingStepSize = this.xAxisHeight / (this.gridLineCount - 1);
    console.log("old data STep size: " + this.dataStepSize)

    if (this.drawingStepSize < this.labelHeight || this.gridLineCount > this.yAxisMaxLabels) {
        console.log(this.drawingStepSize);
        console.log(this.labelHeight);
        console.log(this.gridLineCount);
        console.log(this.yAxisMaxLabels)
        var idealNewGridLineCount;
        if (this.gridLineCount < this.yAxisMaxLabels) {
            var overSizeFactor = (this.labelHeight / this.drawingStepSize);
            this.numberOfLabelsToRemove = (this.gridLineCount - this.gridLineCount / overSizeFactor);
            idealNewGridLineCount = this.gridLineCount - this.numberOfLabelsToRemove;
        } else idealNewGridLineCount = this.yAxisMaxLabels;

        //n...number of decimals that need to be removed to fit all labels
        //var n = Math.ceil(this.gridLineCount / (10 * idealNewGridLineCount));
        var n = Math.ceil(Math.log(idealNewGridLineCount / this.gridLineCount) / Math.log(0.1));
        console.log("n=" + n)

        this.yAxisLabelDecimals = this.yAxisLabelMaxDecimals - n;
        console.log("rescaled decimals from " + this.yAxisLabelMaxDecimals + " to " + this.yAxisLabelDecimals);

        // if (this.yAxisLabelDecimals < 0) this.yAxisLabelDecimals = 0;
        this.calculateDataRanges();
        this.gridLineCount = this.yPlottingRange * Math.pow(10, this.yAxisLabelDecimals) + 1;
        // console.log("new gridLineCount: " + this.gridLineCount)
        this.gridLineCount = round(this.gridLineCount, 0)
        this.dataStepSize = this.yPlottingRange / (this.gridLineCount - 1);
        this.drawingStepSize = this.xAxisHeight / (this.gridLineCount - 1);
        console.log("new data Step size: " + this.dataStepSize)
        if (isPrime(this.dataStepSize) && this.gridLineCount < this.yAxisMaxLabels) {
            console.log("prime recalc " + this.dataStepSize)
            console.log("fucker: " + (this.maxPlottingY + (this.yPlottingRange / (this.gridLineCount - 1))));
            this.calculateDataRanges(null, null, null, this.maxPlottingY + originalStepSize);
            this.dataStepSize = this.yPlottingRange / (this.gridLineCount - 1);
            this.drawingStepSize = this.xAxisHeight / (this.gridLineCount - 1);
            this.gridLineCount = round(this.yPlottingRange * Math.pow(10, this.yAxisLabelDecimals) + 1, 0)
        }
        console.log("prime recalc " + this.dataStepSize)

        // if (this.yAxisLabelDecimals < 0) this.yAxisLabelDecimals = 0;
        for (var i = 10; i > 1; i--) {
            console.log("trying " + this.dataStepSize / i);
            //überprpfen ob eine "runde" zahl im rahmen der darstellungsnachkommastellen            
            if (isWholeNumber(this.dataStepSize / i, this.yAxisLabelMaxDecimals) && (this.gridLineCount + (this.gridLineCount - 1) * (i - 1) <= this.yAxisMaxLabels)) {
                if (this.drawingStepSize / i > this.labelHeight) {
                    this.dataStepSize /= i;
                    this.drawingStepSize /= i;
                    this.gridLineCount += (this.gridLineCount - 1) * (i - 1);
                    console.log("inserted additional lines (" + i + ")");
                    break;
                }
            }
        }
    }
    // console.log(this.yAxisMaxLabels)
    // console.log("gridLinecount= " + this.gridLineCount)

    // if (this.yAxisMaxLabels < this.gridLineCount) {
    //     this.labelsToRemoveByUserChoice = this.gridLineCount - this.yAxisMaxLabels;
    //     console.log("too many labels for user: " + this.labelsToRemoveByUserChoice);
    //     var minimumReductionFactor = Math.ceil((this.gridLineCount / (this.gridLineCount - this.labelsToRemoveByUserChoice)));
    //     console.log("minimum Reduction factor= " + minimumReductionFactor);

    //     for (var i = minimumReductionFactor; i < this.gridLineCount; i++) {
    //         var dataStepSize = this.dataStepSize * i;
    //         var gridLineCount = (this.gridLineCount-1)/i;
    //         console.log("gridLinecount= " + gridLineCount)
    //         console.log("new gridLineCount = " + (gridLineCount-1)/i)
    //         if (isWholeNumber(gridLineCount / i, 0)) {
    //             this.dataStepSize *= i;
    //             this.drawingStepSize *= i;
    //             this.gridLineCount = (this.gridLineCount-1)/i +1;
    //             break;
    //         }
    //         // if (i == ) {
    //         //     this.dataStepSize *= 10 * i;
    //         //     this.drawingStepSize *= this.labelsToRemoveByUserChoice * i;
    //         //     this.gridLineCount -= (this.gridLineCount - 1) * (this.labelsToRemoveByUserChoice * i - 1);
    //         // }

    //     }

    // }
};
var WHOLE_NUMBER_DECIMAL_TOLERANCE = 5;
function isWholeNumber(number, decimalOffset) {
    // console.log("überprüfe ob " + round(number, decimalOffset + WHOLE_NUMBER_DECIMAL_TOLERANCE) + " == " + round(number, decimalOffset))
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


    // if (drawingStepSize < labelHeight) {
    //     var overSizeFactor = (labelHeight / drawingStepSize);
    //     var numberOfLabelsToRemove = (gridLineCount - gridLineCount/overSizeFactor);
    //     var idealNewGridLineCount = gridLineCount - numberOfLabelsToRemove;

    //     //n...number of times every 2nd element needs to be removed
    //     var n = Math.ceil(gridLineCount / (2 * idealNewGridLineCount));

    //     gridLineCount /= 2*n;
    //     dataStepSize *= 2*n;
    //     drawingStepSize *= 2*n;

    //     // gridLineCount /= overSizeFactor;
    //     // dataStepSize *= overSizeFactor;
    //     // drawingStepSize *= overSizeFactor;
    //     console.log("ideal new gridLineCount: " + idealNewGridLineCount)
    //     console.log("overSizeFactor: " + overSizeFactor)
    //     console.log("number of Labels to Remove: " + numberOfLabelsToRemove)
    //     console.log("n: " + n)
    //     console.log("oversize Factor: " + overSizeFactor)
    //     console.log("to many labels, removing stuff and rescaling")
    //     console.log("new gridLineCount: " + gridLineCount)
    // }
    // console.log("dataStepSize: " + dataStepSize)
    // console.log("yPlottingRange: " + this.yPlottingRange)
    // console.log(this.minY)
    // console.log(this.maxY)

    // console.log("label Values: ")
    console.log(this)
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