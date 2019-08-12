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
var zeroToFour = Math.random() * 4;
var mockupGraph1 = generateMockupData(0, 25, 4 + zeroToFour, 48);
var mockupGraph2 = generateMockupData(1, 25, 4 + zeroToFour, 48);

var mockupData = [25.9, 27, 27, 28, 29, 30, 37.5, 35, 30, 30];
mockupData.forEach(function(value, index){
    mockupData[index]*=1;
})
var can = document.getElementById("canvas");
var plot;
window.onload = function () {

    plot = new Plot(can, {
        backgroundColor: PRIMARY,
        topMargin: 0.1,
        bottomMargin: 0.1,
        axisSize: 0.1,
        xAxisLabelMaxDecimals: 3,
        yAxisLabelMaxDecimals: 0,
        xAxisMaxLabels: 11,
        yAxisMaxLabels: 6,
        graphs: [
            {
                type: "line",
                color: WHITE,
                linewidth: 5,
                dataPointRadius: 4,
                dataPointLinewidth: 2,
                // x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                // y: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                
                x: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900],
                y: mockupData,
                xHighlight: [],
                yHighlight: []
                // x: mockupGraph1.x,
                // y: mockupGraph1.y,
                // xHighlight: mockupGraph1.xHighlight,
                // yHighlight: mockupGraph1.yHighlight
            },
            {
                type: "shadow",
                color: WHITE,
                shadowColor: LIGHT_PRIMARY,
                linewidth: 4,
                dataPointRadius: 1.5,
                x: [],
                y: [],
                xHighlight: [],
                yHighlight: []
                // x: mockupGraph2.x,
                // y: mockupGraph2.y,
                // xHighlight: mockupGraph2.xHighlight,
                // yHighlight: mockupGraph2.yHighlight
            }
        ]
    })

    plot.draw();
};