function Gauge(canvas, value, displayValue, min, max, background, textColor) {
    if ((displayValue == null) || (displayValue == "")) displayValue = value;

    this.height = canvas.height;
    this.width = canvas.width;
    this.min = min;
    this.max = max;
    this.ctx = canvas.getContext("2d");
    canvas.style["background-color"] = background;
    this.textColor = textColor;

    this.changeValue(value, displayValue)
}

Gauge.prototype.changeValue = function (value, displayValue) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const textString = displayValue + "";
    const textSize = this.width / textString.length;
    this.ctx.font = "bold " + textSize + "px Arial, Helvetica, sans-serif";
    this.ctx.fillStyle = this.textColor;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(displayValue, this.width / 2, this.height / 2);

    const interPolationValue = (value - this.min) / (this.max - this.min);

    this.ctx.beginPath();
    this.ctx.lineWidth = 8;
    var color1 = new Color(0, 0, 255);
    var color2 = new Color(255, 0, 0);
    this.ctx.strokeStyle = (color1.mix(color2, interPolationValue)).rgb();

    const startAngle = Math.PI - Math.PI / 4;
    const endAngle = Math.PI / 4 - (1 - interPolationValue) * (Math.PI + Math.PI / 2);
    this.ctx.arc(this.width / 2, this.height / 2, 0.9 * this.height / 2, startAngle, endAngle, false);
    this.ctx.stroke();
}

function animateVaue(){

}

function Color(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.rgb = function () {
        return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
    }
    this.mix = function (color, percentage) {
        const r = this.r - percentage * (this.r - color.r);
        const g = this.g - percentage * (this.g - color.g);
        const b = this.b - percentage * (this.b - color.b);

        const max = Math.max(r, g, b);
        const scaling = 255 / max;

        return new Color(r * scaling, g * scaling, b * scaling);
    }
}

