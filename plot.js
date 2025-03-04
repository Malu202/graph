//Damit closure compiler nicht Plot minified
window['Plot'] = Plot;

function Plot(div, config) {
    this.div = div;
    this.config = config;
    this.initialize(div, config);

    window.addEventListener('resize', function (event) {
        this.paintPlot();
    }.bind(this));
}

Plot.prototype.initialize = function (div, config) {
    this.doWhenLoaded(function () {
        this.div = div;

        for (var k in config) {
            this[k] = config[k];
        }
        this.applyDefaultSettings();

        this.bottomMargin = 0;



        this.calculateDataRanges();
        this.paintPlot();
    });
}

Plot.prototype.paintPlot = function () {

    this.generateCanvas(this.div);
    this.calculateDrawingRanges();
    this.calculateDrawingProperties();
    this.scaleData();
    this.draw();
}


Plot.prototype.generateCanvas = function (div) {
    const dpr = window.devicePixelRatio || 1;

    const dimensions = div.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    this.width = Math.round(dimensions.width);
    this.height = Math.round(dimensions.height);
    canvas.width = this.width * dpr;
    canvas.height = this.height * dpr;
    this.ctx = canvas.getContext('2d');
    this.ctx.scale(dpr, dpr);

    div.style.position = "relative";
    div.style.overflow = "hidden";
    div.style.top = "0px";
    div.style.left = "0px";

    canvas.style.position = "absolute";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.height = this.height + "px";
    canvas.style.width = this.width + "px";

    div.innerHTML = "";
    div.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.canvas.style["background-color"] = this.backgroundColor;
}

Plot.prototype.applyDefaultSettings = function () {
    var defaultPlotSettings = {
        backgroundColor: "#4caf50",
        xAxisSize: 0.05,
        yAxisSize: 0.05,
        topMargin: 0.05,
        rightMargin: 0.05,
        xAxisLabelMaxDecimals: 2,
        yAxisLabelMaxDecimals: 2,
        yAxisLabelSuffix: "",
        yAxisLabelPrefix: "",
        xAxisLabelSuffix: "",
        xAxisLabelPrefix: "",
        xAxisMaxLabels: 11,
        yAxisMaxLabels: 15,
        drawGridLineX: true,
        drawGridLineY: true,
        preferredLabelStepsX: [1, 2, 2.5, 5],
        preferredLabelStepsY: [1, 2, 2.5, 5],
        equalLabelSize: true,
    };

    var defaultGraphSettings = {
        type: "line",
        color: "#fff",
        linewidth: 5,
        dataPointRadius: 4,
        dataPointLinewidth: 2,
        xHighlight: [],
        yHighlight: [],
        interpolationSteps: 0,
    }
    var defaultShadowGraphSettings = {
        color: "#fff",
        shadowColor: "#80e27e",
        linewidth: 4,
        dataPointRadius: 1.5,
        xHighlight: [],
        yHighlight: [],
        interpolationSteps: 0,
    }

    for (var j in defaultPlotSettings) {
        if (this[j] == undefined) {
            this[j] = defaultPlotSettings[j];
        }
    }

    var graphCount = this.graphs.length;
    for (var i = 0; i < graphCount; i++) {
        if (this.graphs[i].type == "shadow") {
            for (var l in defaultShadowGraphSettings) {
                if (this.graphs[i][l] == undefined) {
                    this.graphs[i][l] = defaultShadowGraphSettings[l];
                }
            }
        } else {
            for (var l in defaultGraphSettings) {
                if (this.graphs[i][l] == undefined) {
                    this.graphs[i][l] = defaultGraphSettings[l];
                }
            }
        }
    }
}
Plot.prototype.calculateDataRanges = function () {
    for (var i = 0; i < this.graphs.length; i++) {
        const graph = this.graphs[i];

        if (graph.interpolate == "polynomial") {
            this.polinomialInterpolation(graph);
        } else if (graph.interpolate == "spline") {
            this.splineInterpolation(graph);
        }
    }

    this.allXData = [];
    this.allYData = [];
    for (var i = 0; i < this.graphs.length; i++) {
        this.allXData = this.allXData.concat(this.graphs[i].x);
        this.allXData = this.allXData.concat(this.graphs[i].xHighlight);
        this.allYData = this.allYData.concat(this.graphs[i].y);
        this.allYData = this.allYData.concat(this.graphs[i].yHighlight);
    }
    if (this.allXData.length != this.allYData.length) console.warn("Not the same amount of x and y values. Plot is probably wrong!")
    this.minX = Math.min.apply(null, this.allXData);
    this.minY = Math.min.apply(null, this.allYData);
    this.maxX = Math.max.apply(null, this.allXData);
    this.maxY = Math.max.apply(null, this.allYData);
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


}
Plot.prototype.calculateDrawingRanges = function (minPlottingX, minPlottingY, maxPlottingX, maxPlottingY) {
    //rounds max up and min down for plotting with nicer numbers, floorToDecimals rounds down at certain decimal
    if (minPlottingX == null) this.minPlottingX = floorToDecimals(Math.min.apply(null, this.allXData), this.decimalsX);
    else this.minPlottingX = minPlottingX;
    if (minPlottingY == null) this.minPlottingY = floorToDecimals(Math.min.apply(null, this.allYData), this.decimalsY);
    else this.minPlottingY = minPlottingY;
    if (maxPlottingX == null) this.maxPlottingX = ceilToDecimals(Math.max.apply(null, this.allXData), this.decimalsX);
    else this.maxPlottingX = maxPlottingX;
    if (maxPlottingY == null) this.maxPlottingY = ceilToDecimals(Math.max.apply(null, this.allYData), this.decimalsY);
    else this.maxPlottingY = maxPlottingY;

    this.xPlottingRange = this.maxPlottingX - this.minPlottingX;
    this.yPlottingRange = this.maxPlottingY - this.minPlottingY;

    this.xScaling = this.width / this.xPlottingRange;
    this.yScaling = this.height / this.yPlottingRange;
    this.yScaling *= 1 - (this.topMargin + this.bottomMargin + this.xAxisSize);
    this.xScaling *= 1 - this.yAxisSize - this.rightMargin;

    this.bottomOffset = (this.bottomMargin + this.xAxisSize) * this.height;
    this.topOffset = this.topMargin * this.height;
    this.leftOffset = this.yAxisSize * this.width;
    this.rightOffset = this.rightMargin * this.width;
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
Plot.prototype.calculateLabelHeightYaxis = function () {
    var longestValue = round(this.maxPlottingY + this.dataStepSizeY, this.yAxisLabelMaxDecimals);
    if (isNaN(longestValue) && (!isNaN(this.maxPlottingY + this.dataStepSizeY))) console.error("To many decimals, or numbers to long, cannot round, try reducing MaxDecimals");
    var longestValueLength = longestValue.toString().length;
    this.longestLabelY = longestValueLength + this.yAxisLabelPrefix.length + this.yAxisLabelSuffix.length;
    this.labelHeightY = 1.5 * this.yAxisWidth / (this.longestLabelY);//old: 19,5
}
Plot.prototype.calculateDrawingProperties = function () {
    this.calculateDrawingPropertiesX();
    this.calculateDrawingPropertiesY();

    if (this.xLabelNames) {
        this.gridLineCountX = this.xLabelNames.length;
        this.drawingStepSizeX = this.xAxisWidth / (this.gridLineCountX - 1);;
        this.dataStepSizeX = this.xDataRange / (this.gridLineCountX - 1);
        this.calculateDrawingRanges(null, null, null, null);
    } else {
        this.calculateStepSizeX();
    }
    this.calculateStepSizeY();

};

Plot.prototype.calculateDrawingPropertiesX = function () {
    this.xAxisHeight = this.bottomOffset;
    this.xAxisWidth = this.width - this.leftOffset - this.rightOffset;

    //var longestValueX = round(this.maxPlottingX + this.dataStepSizeX, this.xAxisLabelMaxDecimals).toString().length
    var longestValueX = round(this.maxPlottingX, this.xAxisLabelMaxDecimals).toString().length

    this.longestLabelX = longestValueX + this.xAxisLabelPrefix.length + this.xAxisLabelSuffix.length;
    this.labelHeightX = this.xAxisHeight;
    this.longestLabelWidthX = this.longestLabelX * this.labelHeightX;
}

Plot.prototype.calculateDrawingPropertiesY = function () {
    this.yAxisHeight = this.height - this.topOffset - this.bottomOffset;
    this.yAxisWidth = this.leftOffset;

    var longestValueY = round(this.maxPlottingY + this.dataStepSizeY, this.yAxisLabelMaxDecimals).toString().length
    this.longestLabelY = longestValueY + this.yAxisLabelPrefix.length + this.yAxisLabelSuffix.length;
}

Plot.prototype.calculateStepSizeX = function () {

    var labelSteps = this.preferredLabelStepsX;
    var orderX = this.orderX;
    this.preferredLabelStepsX.forEach(function (label, index) {
        labelSteps[index] *= orderX;
    });
    for (var i = 0; i < labelSteps.length; i++) {
        var errorTop = labelSteps[i] - this.maxX % labelSteps[i];
        if (errorTop == labelSteps[i]) errorTop = 0;
        var errorBottom = this.minX % labelSteps[i];

        var minX = this.minX - errorBottom;
        var maxX = this.maxX + errorTop;


        this.gridLineCountX = ((maxX - minX) / labelSteps[i]) + 1;
        this.drawingStepSizeX = this.xAxisWidth / (this.gridLineCountX - 1);
        this.dataStepSizeX = labelSteps[i];


        var labelsOverlappingX = this.drawingStepSizeX < this.longestLabelWidthX;
        var moreLabelsThanUserWantsX = this.gridLineCountX > this.xAxisMaxLabels;

        if (!moreLabelsThanUserWantsX && !labelsOverlappingX) {
            this.calculateDrawingRanges(minX, this.minY, maxX, this.maxY);
            break;
        } else {
            if (i == (labelSteps.length - 1)) {
                this.preferredLabelStepsX.forEach(function (label, index) {
                    labelSteps[index] *= 10;
                });
                i = -1;
            }
        }
    }
}
Plot.prototype.calculateStepSizeY = function () {
    var labelSteps = this.preferredLabelStepsY;
    var orderY = this.orderY;
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
        this.calculateLabelHeightYaxis();


        var labelsOverlappingY = this.drawingStepSizeY < this.labelHeightY;
        var moreLabelsThanUserWantsY = this.gridLineCountY > this.yAxisMaxLabels;

        if (!moreLabelsThanUserWantsY && !labelsOverlappingY) {
            this.calculateDrawingRanges(this.minX, minY, this.maxX, maxY);
            // this.calculateDrawingRanges(null, minY, null, maxY);
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


Plot.prototype.drawAxis = function () {
    //x-Axis
    drawGridLineX("#fff", this.leftOffset, this.height - this.bottomOffset, this.width - this.leftOffset - this.rightOffset, this.ctx)
    //y-Axis
    drawGridLineY("#fff", this.leftOffset, this.height - this.bottomOffset, this.height - this.topOffset - this.bottomOffset, this.ctx)

    //Horizontal Grid
    for (var i = 0; i < this.gridLineCountY; i += 1) {
        var y = this.topOffset + this.yAxisHeight - i * this.drawingStepSizeY;

        var labelValue = this.minPlottingY + this.dataStepSizeY * i;
        labelValue = round(labelValue, this.longestLabelY);
        var fillAbleDigitCount = this.longestLabelY - labelValue.toString().length - this.yAxisLabelPrefix.length - this.yAxisLabelSuffix.length;
        if (fillAbleDigitCount > this.yAxisLabelMaxDecimals) fillAbleDigitCount = this.yAxisLabelMaxDecimals;
        labelValue = fillWithDecimalZeros(labelValue, fillAbleDigitCount);
        labelValue = this.yAxisLabelPrefix + labelValue + this.yAxisLabelSuffix;
        // const xMargins = this.yAxisWidth - (this.longestLabelY * this.labelHeightY) / 2;
        const xMargins = this.yAxisWidth / 2;

        drawTextWithHeight(labelValue, xMargins, y, this.labelHeightY, "#fff", this.ctx);
        if (this.drawGridLineX) drawGridLineX("#fff", this.leftOffset, y, this.width - this.leftOffset - this.rightOffset, this.ctx)
    }

    //Vertical Grid
    for (var i = 0; i < this.gridLineCountX; i += 1) {
        var x = this.leftOffset + i * this.drawingStepSizeX;

        var labelValue;
        if (this.xLabelNames) {
            labelValue = this.xLabelNames[i];
        } else {
            labelValue = this.minPlottingX + this.dataStepSizeX * i;
            labelValue = round(labelValue, this.longestLabelX);
            var fillAbleDigitCount = this.longestLabelX - labelValue.toString().length - this.xAxisLabelPrefix.length - this.xAxisLabelSuffix.length;
            if (fillAbleDigitCount > this.xAxisLabelMaxDecimals) fillAbleDigitCount = this.xAxisLabelMaxDecimals;
            labelValue = fillWithDecimalZeros(labelValue, fillAbleDigitCount);
        }
        labelValue = this.xAxisLabelPrefix + labelValue + this.xAxisLabelSuffix;
        var yMargins = this.xAxisHeight / (2);

        if (this.equalLabelSize && this.labelHeightX > this.labelHeightY) this.labelHeightX = this.labelHeightY;
        drawTextWithHeight(labelValue, x, this.height - this.bottomOffset + yMargins, this.labelHeightX, "#fff", this.ctx);
        if (this.drawGridLineY) drawGridLineY("#fff", x, this.height - this.bottomOffset, this.height - this.topOffset - this.bottomOffset, this.ctx)
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
    // ctx.font = "20px sans serif";
    ctx.font = 20 + "px Arial, Helvetica, sans-serif";
    ctx.fillStyle = color
    ctx.scale(zoomFactor, zoomFactor); // enlarge 5x

    // y += height / (3 * zoomFactor);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
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
    if (noDecimals && amount == 1) {
        return number;
    }
    if (noDecimals && amount > 1) {
        number += ".";
        amount--;
    }
    for (var i = 0; i < amount; i++) {
        number += "0";
    }
    return number;
}



var loaded = false;
window.addEventListener("load", function () {
    loaded = true;
});

Plot.prototype.doWhenLoaded = function (callback) {
    if (loaded) {
        const c = callback.bind(this);
        c();
    } else {
        window.addEventListener("load", function () {
            const c = callback.bind(this);
            c();
        }.bind(this));
    }
}

Plot.prototype.polinomialInterpolation = function (graph) {
    const xValues = graph.x;
    const yValues = graph.y;


    var coefficients = [];
    var coeffMatrix = [];

    for (var i = 0; i < xValues.length; i++) {
        var aitkenRow = [xValues[i], yValues[i]];
        coeffMatrix.push(aitkenRow);

        for (var j = 2; j <= i + 1; j++) {
            coeffMatrix[coeffMatrix.length - 1] = aitkenRow;
            const l = coeffMatrix.length - 1;
            const newEntryZaehler = (coeffMatrix[l][j - 1] - coeffMatrix[l - 1][j - 1])
            const newEntryNenner = (coeffMatrix[l][0] - coeffMatrix[l - j + 1][0]);

            aitkenRow.push(newEntryZaehler / newEntryNenner);
        }
        coefficients.push(aitkenRow[aitkenRow.length - 1]);
    }

    // graph.interpolationCoefficients = coefficients;

    function interpolationPolynomial(x) {
        var xTerm = 1;
        var y = 0;
        for (var i = 0; i < coefficients.length; i++) {
            y += coefficients[i] * xTerm;
            xTerm *= x - xValues[i];
        }
        return y;
    }

    const xLength = xValues[xValues.length - 1] - xValues[0];
    const stepsize = xLength / (this.interpolationSteps - 1);
    var interpolatedDataX = [];
    var interpolatedDataY = [];
    for (var i = 0; i < this.interpolationSteps; i++) {
        const x = i * stepsize + xValues[0];
        const y = interpolationPolynomial(x);
        interpolatedDataX.push(x);
        interpolatedDataY.push(y);
    }
    graph.x = interpolatedDataX;
    graph.y = interpolatedDataY;
}

Plot.prototype.splineInterpolation = function (graph) {
    var B = graph.y;
    var N = B.length;
    var r = Math.sqrt(3) + 2;

    var zeros = [];
    for (var i = 0; i < N; i++) {
        zeros.push(0);
    }
    var alpha = zeros.slice();;
    var X = zeros.slice();;

    alpha[0] = 0;
    alpha[N - 1] = B[N - 1];

    for (var i = 1; i <= N - 1; i++) {
        for (var k = 1; k <= i; k++) {
            alpha[i - 1] = alpha[i - 1] + Math.pow(-1, k - 1) * B[i - k] / (Math.pow(r, k))
        }
    }
    for (var i = 1; i <= N; i++) {
        for (var k = 1; k <= (N - i + 1); k++) {
            X[i - 1] = X[i - 1] + Math.pow(-1 / r, k - 1) * alpha[i + k - 2];
        }
    }

    function spline(x) {
        var index = 0;
        for (var i = 0; i < graph.x.length; i++) {
            if ((i + 1 == graph.x.length - 1) || (x < graph.x[i + 1])) {
                index = i;
                break;
            }
        }
        // console.log(index)
        // X = alpha.slice();
        const splineTerm1 = (X[index] / 6) * (Math.pow(x - graph.x[index + 1], 3) / (graph.x[index] - graph.x[index + 1]) - (x - graph.x[index + 1]) * (graph.x[index] - graph.x[index + 1]));
        const splineTerm2 = (X[index + 1] / 6) * (Math.pow(x - graph.x[index], 3) / (graph.x[index] - graph.x[index + 1]) - (x - graph.x[index]) * (graph.x[index] - graph.x[index + 1]));
        const splineTerm3 = (graph.y[index] * (x - graph.x[index + 1]) - graph.y[index] * (x - graph.x[index])) / (graph.x[index] - graph.x[index + 1]);
        return splineTerm1 - splineTerm2 + splineTerm3;
    }
    console.log("X: ", X)
    console.log("a: ", alpha);


    console.log("real y: ", graph.y)
    var test = [];
    for (var i = 0; i < graph.x.length; i++) {
        // for (var i = 0; i < 1; i++) {
        test.push(spline(graph.x[i]));
    }

    const steps = 90;
    var stepsize = (graph.x[graph.x.length - 1] - graph.x[0]) / (steps-1);
    var newX = [];
    var newY = [];
    for (var j = 0; j < steps; j++) {
        var x = graph.x[0] + j * stepsize;
        // console.log(x)
        newX[j] = x;
        newY[j] = spline(x)
    }

    console.log("interp: ", test);
    console.log("vgl: ", spline(1.5))
    
    graph.x = newX;
    graph.y = newY;
}




