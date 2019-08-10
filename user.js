var PRIMARY = "#4caf50";
var DARK_PRIMARY = "#087f23";
var LIGHT_PRIMARY = "#80e27e";
var WHITE = "#FFFFFF";
var TRANSPARENT = "rgba(1, 1, 1, 0)";
var RED = "#FF0000"

var generateMockupData = function (offsetX, offsetY, scale, steps) {
    var dataX = [];
    var dataY = [];
    var highlightDataX = [];
    var highlightDataY = [];
    var stepSize = 4 / (steps - 1);
    for (var i = -2; i <= 2; i += stepSize) {
        j = i + (Math.random() - Math.random()) * 0.5 * stepSize;
        y = scale * Math.exp(-(j + offsetX) * (j + offsetX)) + offsetY;
        dataX.push(j);
        dataY.push(y);

        if (Math.random() < 0.5) {
            highlightDataX.push(j);
            highlightDataY.push(y);
        }
    }
    return {
        x: dataX,
        y: dataY,
        xHighlight: highlightDataX,
        yHighlight: highlightDataY
    }
}

var mockupGraph1 = generateMockupData(0, -0.5, 1, 48);
var mockupGraph2 = generateMockupData(1, 0, 0.8, 48);


var can = document.getElementById("canvas");
var plot;
window.onload = function () {

    plot = new Plot(can, {
        backgroundColor: PRIMARY,
        topMargin: 0.1,
        bottomMargin: 0.1,
        graphs: [
            {
                type: "line",
                color: WHITE,
                linewidth: 5,
                dataPointRadius: 4,
                dataPointLinewidth: 2,
                x: mockupGraph1.x,
                y: mockupGraph1.y,
                xHighlight: mockupGraph1.xHighlight,
                yHighlight: mockupGraph1.yHighlight
            },
            {
                type: "shadow",
                color: WHITE,
                shadowColor: LIGHT_PRIMARY,
                linewidth: 4,
                dataPointRadius: 1.5,
                x: mockupGraph2.x,
                y: mockupGraph2.y,
                xHighlight: mockupGraph2.xHighlight,
                yHighlight: mockupGraph2.yHighlight
            }
        ]
    })

    plot.draw();
};