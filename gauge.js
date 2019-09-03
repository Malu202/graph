//Damit closure compiler nicht Plot minified
window['Gauge'] = Gauge;

function Gauge(div, value, displayValue, min, max, background, textColor) {
    this.doWhenLoaded(function () {
        // const canvas = this.generateCanvas(div);
        this.generateCanvas(div);


        if ((displayValue == null) || (displayValue == "")) displayValue = value;

        // this.height = this.canvas.height;
        // this.width = this.canvas.width;
        if (this.height < this.width) {
            this.size = this.height;
        } else {
            this.size = this.width;
        }
        this.min = min;
        this.max = max;
        // this.ctx = canvas.getContext("2d");
        this.canvas.style["background-color"] = background;
        this.textColor = textColor;

        // this.changeValue(value, displayValue)
    });
}

Gauge.prototype.generateCanvas = function (div) {
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
    // div.style.right = "0px";
    div.style.top = "0px";
    div.style.left = "0px";
    // div.style.bottom = "0px";

    canvas.style.position = "absolute";
    // canvas.style.right = "0px";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    // canvas.style.bottom = "0px";
    canvas.style.height = this.height + "px";
    canvas.style.width = this.width + "px";

    div.appendChild(canvas);
    this.canvas = canvas;
}

Gauge.prototype.changeValue = function (value, displayValue) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const textString = displayValue + "";
    const textSize = this.size / textString.length;
    this.ctx.font = "bold " + textSize + "px Arial, Helvetica, sans-serif";
    this.ctx.fillStyle = this.textColor;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(displayValue, this.width / 2, this.height / 2);

    const interPolationValue = (value - this.min) / (this.max - this.min);

    this.ctx.beginPath();
    this.ctx.lineWidth = this.size * 0.08;
    var color1 = new Color(0, 0, 255);
    var color2 = new Color(255, 0, 0);
    this.ctx.strokeStyle = (color1.mix(color2, interPolationValue)).rgb();

    const startAngle = Math.PI - Math.PI / 4;
    const endAngle = Math.PI / 4 - (1 - interPolationValue) * (Math.PI + Math.PI / 2);
    this.ctx.arc(this.width / 2, this.height / 2, 0.9 * this.size / 2, startAngle, endAngle, false);
    this.ctx.stroke();
}

Gauge.prototype.animateValue = function (value, displayValue, animationTime) {
    this.doWhenLoaded(function () {
        this.currentValue = this.min;
        this.value = value;
        this.displayValue = displayValue;
        this.animationTime = animationTime;
        window.requestAnimationFrame(this.animation.bind(this));
    });
}
var a = true;
Gauge.prototype.animation = function (time) {
    if (!this.lastTime) {
        this.lastTime = time;
        this.firstTime = time;
    }
    else {
        const gameTime = time - this.lastTime;
        this.lastTime = time;
        this.currentValue += (this.value - this.min) * gameTime / this.animationTime;
    }
    this.changeValue(this.currentValue, this.displayValue);
    if (this.currentValue < this.value) {
        window.requestAnimationFrame(this.animation.bind(this));
    } else {
        this.changeValue(this.value, this.displayValue);
    }
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


var loaded = false;
window.addEventListener("load", function () {
    loaded = true;
});

Gauge.prototype.doWhenLoaded = function (callback) {
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
