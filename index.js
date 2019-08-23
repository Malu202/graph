


function Plot(canvas, config) {
    this.backgroundColor = config.backgroundColor;
    this.topMargin = config.topMargin;
    this.bottomMargin = config.bottomMargin;
    this.axisSize = config.axisSize;
    this.xAxisLabelMaxDecimals = config.xAxisLabelMaxDecimals;
    this.yAxisLabelMaxDecimals = config.yAxisLabelMaxDecimals;
    this.xAxisMaxLabels = config.xAxisMaxLabels;
    this.yAxisMaxLabels = config.yAxisMaxLabels;
    this.yAxisLabelSuffix = config.yAxisLabelSuffix;
    this.yAxisLabelPrefix = config.yAxisLabelPrefix;
    this.xAxisLabelSuffix = config.xAxisLabelSuffix;
    this.xAxisLabelPrefix = config.xAxisLabelPrefix;

    // this.preferredLabelStepsX = [1, 2, 5, 10, 20, 25];
    // this.preferredLabelStepsY = [1, 2, 5, 10, 20, 25];

    this.preferredLabelStepsX = [1, 2, 2.5, 5];
    this.preferredLabelStepsY = [1, 2, 2.5, 5];


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

    //orderY is the order of Magnitude in which stepping should occour (initial guess), eg: 0 to 1 => range = 1 => orderY = 0.1
    this.orderX = orderOfMagnitude(this.xDataRange) * 0.1;
    var minimumOrderX = Math.pow(10, -this.xAxisLabelMaxDecimals);
    if (minimumOrderX > this.orderX) this.orderX = minimumOrderX;
    this.decimalsX = -orderToDecimalCount(this.orderX);

    this.orderY = orderOfMagnitude(this.yDataRange) * 0.1;
    var minimumOrderY = Math.pow(10, -this.yAxisLabelMaxDecimals);
    if (minimumOrderY > this.orderY) this.orderY = minimumOrderY;
    this.decimalsY = -orderToDecimalCount(this.orderY);

    //rounds max up and min down for plotting with nicer numbers, floorToDecimals rounds down at certain decimal
    if (minPlottingX == null) this.minPlottingX = floorToDecimals(Math.min.apply(null, allXData), this.decimalsX);
    else this.minPlottingX = minPlottingX;
    if (minPlottingY == null) this.minPlottingY = floorToDecimals(Math.min.apply(null, allYData), this.decimalsY);
    else this.minPlottingY = minPlottingY;
    if (maxPlottingX == null) this.maxPlottingX = ceilToDecimals(Math.max.apply(null, allXData), this.decimalsX);
    else this.maxPlottingX = maxPlottingX;
    if (maxPlottingY == null) this.maxPlottingY = ceilToDecimals(Math.max.apply(null, allYData), this.decimalsY);
    else this.maxPlottingY = maxPlottingY;

    this.xPlottingRange = this.maxPlottingX - this.minPlottingX;
    this.yPlottingRange = this.maxPlottingY - this.minPlottingY;

    this.xScaling = this.width / this.xPlottingRange;
    this.yScaling = this.height / this.yPlottingRange;
    this.yScaling *= 1 - (this.topMargin + this.bottomMargin + this.axisSize);
    this.xScaling *= 1 - this.axisSize;

    this.bottomOffset = (this.bottomMargin + this.axisSize) * this.height;
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
Plot.prototype.scaleData = function () {
    for (var i = 0; i < this.graphs.length; i++) {
        this.graphs[i].xCoordinates = scaleCoordinates(this.graphs[i].x, this.xScaling, this.minPlottingX, this.leftOffset);
        this.graphs[i].yCoordinates = scaleAndInvertCoordinates(this.graphs[i].y, this.yScaling, this.minPlottingY, this.bottomOffset, this.bottom);
        this.graphs[i].xCoordinatesHighlight = scaleCoordinates(this.graphs[i].xHighlight, this.xScaling, this.minPlottingX, this.leftOffset);
        this.graphs[i].yCoordinatesHighlight = scaleAndInvertCoordinates(this.graphs[i].yHighlight, this.yScaling, this.minPlottingY, this.bottomOffset, this.bottom);
    }
}
Plot.prototype.calculateLabelHeight = function () {
    var longestValue = round(this.maxPlottingY + this.dataStepSizeY, this.yAxisLabelMaxDecimals);
    if (isNaN(longestValue)) console.error("To many decimals, or numbers to long, cannot round, try reducing MaxDecimals");
    var longestValueLength = longestValue.toString().length;
    this.longestLabelY = longestValueLength + this.yAxisLabelPrefix.length + this.yAxisLabelSuffix.length;
    this.labelHeight = 1.80 * this.yAxisWidth / (this.longestLabelY);//old: 19,5
}
Plot.prototype.calculateDrawingProperties = function () {
    // this.calculateDrawingPropertiesX();
    this.calculateDrawingPropertiesY();
};
Plot.prototype.calculateDrawingPropertiesY = function () {
    this.yAxisHeight = this.height - this.topOffset - this.bottomOffset;
    this.yAxisWidth = this.leftOffset;

    var orderY = this.orderY;
    var longestValueY = round(this.minPlottingY + this.dataStepSizeY, this.yAxisLabelMaxDecimals).toString().length
    this.longestLabelY = longestValueY + this.yAxisLabelPrefix.length + this.yAxisLabelSuffix.length;

    var labelSteps = this.preferredLabelStepsY;
    this.preferredLabelStepsY.forEach(function (label, index) {
        labelSteps[index] *= orderY;
    });
    for (var i = 0; i < labelSteps.length; i++) {
        var errorTop = labelSteps[i] - this.maxY % labelSteps[i];
        if (errorTop == labelSteps[i]) errorTop = 0;
        var errorBottom = this.minY % labelSteps[i];
        
        var minY = this.minY - errorBottom;
        var maxY = this.maxY + errorTop;
        
        this.gridLineCountY = ((maxY - minY) / labelSteps[i]) + 1;
        this.drawingStepSizeY = this.yAxisHeight / (this.gridLineCountY - 1);
        this.dataStepSizeY = labelSteps[i];
        this.calculateLabelHeight();
        

        var labelsOverlappingY = this.drawingStepSizeY < this.labelHeight;
        var moreLabelsThanUserWantsY = this.gridLineCountY > this.yAxisMaxLabels;
        
        if (!moreLabelsThanUserWantsY && !labelsOverlappingY) {
            this.calculateDataRanges(null, minY, null, maxY);
            break;
        } else {
            if (i == (labelSteps.length - 1)) {
                this.preferredLabelStepsY.forEach(function (label, index) {
                    labelSteps[index] *= 10;
                });
                i = -1;
            }
        }
    }
}
Plot.prototype.calculateDrawingPropertiesX = function () {
    this.xAxisHeight = this.bottomOffset;
    this.xAxisWidth = this.width - this.leftOffset;

    var orderX = this.orderX;
    this.gridLineCountX = this.xPlottingRange / orderX + 1;
    this.gridLineCountX = round(this.gridLineCountX, 0)
    this.dataStepSizeX = this.xPlottingRange / (this.gridLineCountX - 1);
    this.drawingStepSizeX = this.xAxisWidth / (this.gridLineCountX - 1);
    var longestValueX = round(this.minPlottingX + this.dataStepSizeX, this.xAxisLabelMaxDecimals).toString().length;
    this.longestLabelX = longestValueX + this.xAxisLabelPrefix.length + this.xAxisLabelSuffix.length;


    this.calculateLabelHeight();
    var labelsOverlappingX = this.drawingStepSizeX < this.labelHeight;
    var moreLabelsThanUserWantsX = this.gridLineCountX > this.xAxisMaxLabels;
    if (labelsOverlappingX || moreLabelsThanUserWantsX) {

        var labelSteps = this.preferredLabelStepsX;

        this.preferredLabelStepsX.forEach(function (label, index) {
            labelSteps[index] *= orderX;
        });
        for (var i = 0; i < labelSteps.length; i++) {
            var errorTop = labelSteps[i] - this.maxX % labelSteps[i];
            var errorBottom = this.minX % labelSteps[i];
            var error = errorTop + errorBottom;

            var minX = this.minX - errorBottom;

            var maxX = this.maxX + errorTop;
            this.gridLineCountX = ((maxX - minX) / labelSteps[i]) + 1;
            this.drawingStepSizeX = this.xAxisHeight / (this.gridLineCountX - 1);
            this.dataStepSizeX = labelSteps[i];
            this.calculateLabelHeight();


            labelsOverlappingX = this.drawingStepSizeX < this.labelHeight;
            moreLabelsThanUserWantsX = this.gridLineCountX > this.xAxisMaxLabels;

            if (!moreLabelsThanUserWantsX && !labelsOverlappingX) {
                foundBestSolution = true;
                lowestError = error;
                lowestErrorTop = errorTop;
                lowestErrorBottom = errorBottom;
                closestStepping = labelSteps[i];
                this.minX = minX;
                this.maxX = maxX;
                this.calculateDataRanges(null, this.minX, null, this.maxX);
                break;
            }
        }
    }
}

Plot.prototype.drawAxis = function () {
    for (var i = 0; i < this.gridLineCountY; i += 1) {
        var y = this.topOffset + this.yAxisHeight - i * this.drawingStepSizeY;

        var labelValue = this.minPlottingY + this.dataStepSizeY * i;
        labelValue = round(labelValue, this.longestLabelY);
        labelValue = fillWithDecimalZeros(labelValue, this.longestLabelY - labelValue.toString().length - this.yAxisLabelPrefix.length - this.yAxisLabelSuffix.length);
        labelValue = this.yAxisLabelPrefix + labelValue + this.yAxisLabelSuffix;
        var xMargins = this.yAxisWidth / (this.longestLabelY + 10)

        drawTextWithHeight(labelValue, xMargins, y, this.labelHeight, "#fff", this.ctx);
        drawGridLineX("#fff", this.leftOffset, y, this.width, this.ctx)
    }

    for (var i = 0; i < this.gridLineCountX; i += 1) {
        var x = this.leftOffset + i * this.drawingStepSizeX;

        var labelValue = this.minPlottingX + this.dataStepSizeX * i;
        labelValue = round(labelValue, this.longestLabelX);
        labelValue = fillWithDecimalZeros(labelValue, this.longestLabelX - labelValue.toString().length - this.xAxisLabelPrefix.length - this.xAxisLabelSuffix.length);
        labelValue = this.xAxisLabelPrefix + labelValue + this.xAxisLabelSuffix;
        var yMargins = this.xAxisHeight / (4);

        drawTextWithHeight(labelValue, x - (labelValue.length * this.labelHeight) / 2, this.height - this.bottomOffset + yMargins, this.labelHeight, "#fff", this.ctx);
        // drawGridLineX("#fff", x, this.height - this.bottomOffset, this.height - this.topOffset - this.bottomOffset, this.ctx)
    }
    drawGridLineY("#fff", this.leftOffset, this.height - this.bottomOffset, this.height - this.topOffset - this.bottomOffset, this.ctx)
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
function drawGridLineX(color, x, y, width, ctx) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();
}
function drawGridLineY(color, x, y, height, ctx) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - height);
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
    ctx.fillStyle = color;
    ctx.linewidth = 1;
    var radius = Math.ceil(linewidth / 2) - 1;

    for (var i = 0; i < xCoordinates.length; i++) {
        ctx.beginPath();
        ctx.arc(xCoordinates[i], yCoordinates[i], radius, 0, Math.PI * 2, true);
        ctx.fill();
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
    // console.log(valueString)
    // console.log(valueString + 'e' + (power + decimals))
    return Number(Math.round(valueString + 'e' + (power + decimals)) + 'e-' + (decimals));
}
function orderOfMagnitude(n) {
    var order = Math.floor(Math.log(Math.abs(n)) / Math.LN10
        + 0.000000001); // because float math sucks like that
    return Math.pow(10, order);
}
function orderToDecimalCount(order) {
    return Math.round(Math.log(order) / Math.log(10))
}
function toFixedDecimals(wert, decimals) {
    var Betrag = wert + "";
    var Kommaindex = Betrag.toString().indexOf(".");

    var noDecimals = (Kommaindex == -1);
    if (noDecimals) {
        if (decimals > 0) Betrag += ".";
        for (var i = 0; i < decimals; i++) {
            Betrag += "0";
        }
    } else {
        var currentDecimals = Betrag.toString().length - (Kommaindex + 1);
        for (var i = 0; i < decimals - currentDecimals; i++) {
            Betrag += "0";
        }
    }
    return Betrag;

}
function fillWithDecimalZeros(number, amount) {
    // console.log("appending " + amount + " zeros")
    number = number.toString();
    var Kommaindex = number.indexOf(".");

    var noDecimals = (Kommaindex == -1);
    if (noDecimals && amount > 1) {
        number += ".";
        amount--;
    }
    if (noDecimals && amount == 1) {
        return number;
    }
    for (var i = 0; i < amount; i++) {
        number += "0";
    }
    return number;
}