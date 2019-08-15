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
var zeroToFour = Math.random() * 0.04;
var mockupGraph1 = generateMockupData(0, 0, zeroToFour, 48);
var mockupGraph2 = generateMockupData(1, 0, zeroToFour, 48);

var mockupData = [25.9, 27, 27, 28, 29, 30, 38, 35, 30, 30];
var buggyMockupData = [0.00017094748045652888, 0.0002406692375423506, 0.00029930605391475666, 0.00044559388424584277, 0.0005668682010598125, 0.0008381252344964803, 0.0009519918634124083,
    0.001226519993767387, 0.0015778168403227971, 0.002095818579230104, 0.0025214712442207907, 0.002967875488764029, 0.003454149369477609, 0.004167987934936454, 0.0048293124037483304, 0.005399415523252183,
    0.006410584260191669, 0.007048544448525713, 0.007566367057533391, 0.008045700155732798, 0.008616860338402789, 0.009085583118554647, 0.009302945953344929, 0.009396008056418062, 0.009406621167307077,
    0.009314092016725836, 0.00895479110490638, 0.008499958637009785, 0.008281340379754925, 0.0075366019196993015, 0.006755934510529722, 0.006078847008406818, 0.005340469307880818, 0.004772730772205673,
    0.004295436132038222, 0.0035200642772930672, 0.003069909546297619, 0.002473744989202226, 0.002135552435982348, 0.0016875623239802659, 0.001382997213031605, 0.0009125849390430578,
    0.0008325224829941784, 0.0005443822567094822, 0.00048591233470477894, 0.00029645775738406966, 0.00026067908468683815, 0.00018643938694591386];
// mockupData.forEach(function(value, index){
//     mockupData[index]*=1;
// })
var can = document.getElementById("canvas");
var plot;
window.onload = function () {

    plot = new Plot(can, {
        backgroundColor: PRIMARY,
        topMargin: 0.1,
        bottomMargin: 0.1,
        axisSize: 0.05,
        xAxisLabelMaxDecimals: 10,
        yAxisLabelMaxDecimals: 20,
        yAxisLabelSuffix: "°",
        yAxisLabelPrefix: "",
        xAxisLabelSuffix: "",
        xAxisLabelPrefix: "",
        xAxisMaxLabels: 11,
        yAxisMaxLabels: 10,
        graphs: [
            {
                type: "line",
                color: WHITE,
                linewidth: 5,
                dataPointRadius: 4,
                dataPointLinewidth: 2,
                // x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                // y: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],

                // x: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900],
                // y: mockupData,
                // xHighlight: [],
                // yHighlight: []
                x: mockupGraph1.x,
                y: mockupGraph1.y,
                xHighlight: mockupGraph1.xHighlight,
                yHighlight: mockupGraph1.yHighlight
            }
            // ,
            // {
            //     type: "shadow",
            //     color: WHITE,
            //     shadowColor: LIGHT_PRIMARY,
            //     linewidth: 4,
            //     dataPointRadius: 1.5,
            //     x: [],
            //     y: [],
            //     xHighlight: [],
            //     yHighlight: []
            //     x: mockupGraph2.x,
            //     y: mockupGraph2.y,
            //     xHighlight: mockupGraph2.xHighlight,
            //     yHighlight: mockupGraph2.yHighlight
            // }
        ]
    })

    plot.draw();
};