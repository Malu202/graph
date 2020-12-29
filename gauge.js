//Damit closure compiler nicht Plot minified
window['Gauge'] = Gauge;

function Gauge(div, prefix, value, suffix, min, max, background, textColor) {

    this.initialize(div, prefix, value, suffix, min, max, background, textColor);

    window.addEventListener('resize', function (event) {
        this.initialize(this.div, this.prefix, this.value, this.suffix, this.min, this.max, this.background, this.textColor);
        this.setValue(value);
    }.bind(this));
}

Gauge.prototype.initialize = function (div, prefix, value, suffix, min, max, background, textColor) {
    this.doWhenLoaded(function () {
        this.div = div;
        this.prefix = prefix;
        this.value = value;
        this.suffix = suffix;
        this.min = min;
        this.max = max;
        this.background = background;
        this.textColor = textColor;

        this.generateCanvas(div);

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

    div.innerHTML = "";
    div.appendChild(canvas);
    this.canvas = canvas;
}

Gauge.prototype.setValue = function (value, displayValue) {
    if (displayValue == undefined) displayValue = value;
    this.ctx.clearRect(0, 0, this.width, this.height);

    const missingDigits = (this.max + "").length - (displayValue + "").length;
    var missingDigitPrefix = "";
    for (var i = 0; i < missingDigits; i++) {
        missingDigitPrefix = " " + missingDigitPrefix;
    }

    const textString = missingDigitPrefix + this.prefix + displayValue + this.suffix + "";
    let fontSize = 200;
    this.ctx.font = "bold " + fontSize + "px monospace, Arial, Helvetica, sans-serif";

    let textSize = this.ctx.measureText(textString).width;
    // fontSize *= this.size / textSize;
    // this.ctx.font = "bold " + fontSize + "px Arial, Helvetica, sans-serif, monospace";

    let radius = 0.9 * this.size / 2;
    let aspectRatio = textSize / fontSize;
    fontSize = Math.sqrt((radius * radius) / (1 / 4 + aspectRatio * aspectRatio / 4))
    fontSize = Math.round(fontSize * 0.85);

    this.ctx.font = "bold " + fontSize + "px monospace, Arial, Helvetica, sans-serif";
    this.ctx.fillStyle = this.textColor;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(textString, this.width / 2, this.height / 2);

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

    // SHOW BOUNDING BOX:
    // let l = this.ctx.measureText(textString).width;
    // this.ctx.strokeStyle = this.textColor;
    // this.ctx.lineWidth = 2;
    // this.ctx.rect(this.width / 2 - l * 0.5, this.height / 2 - fontSize * 0.5, l, fontSize)
    // this.ctx.stroke()
}

Gauge.prototype.animateValue = function (value, animationTime) {
    this.doWhenLoaded(function () {
        this.currentValue = this.min;
        this.value = value;
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
    this.setValue(this.currentValue, this.value);
    if (this.currentValue < this.value) {
        window.requestAnimationFrame(this.animation.bind(this));
    } else {
        this.setValue(this.value, this.value);
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
