Number.prototype.modulo = function modulo(n) {
    return ((this % n) + n) % n;
};

function Direction(name, index, from) {
    this.name = name;
    this.index = index;
    this.from = from;
}

Direction.prototype.rotate = function rotate(n) {
    return DIRECTIONS[(this.index + n).modulo(4)];
};

Direction.prototype.children = function() {
    return this._children ||
           (this._children = TEMPLATE.map(this.rotate.bind(this)));
};

Direction.prototype.toString = function() {
    return this.name;
};

var N = new Direction('N', 0, function(x, y, length) {
    return new Point(x, y - length);
});

var E = new Direction('E', 1, function(x, y, length) {
    return new Point(x + length, y);
});

var S = new Direction('S', 2, function(x, y, length) {
    return new Point(x, y + length);
});

var W = new Direction('W', 3, function(x, y, length) {
    return new Point(x - length, y);
});

var DIRECTIONS = [N, E, S, W];
var TEMPLATE = [0, -1, 0, 1, 0, 1, 0, -1, 0];

function subdivide(length) {
    var sub = Math.floor(length / 5);
    var subs = TEMPLATE.map(function() { return sub });
    switch (length - (5 * sub)) {
      case 1:
        subs[4]++;
        break;
      case 2:
        subs[0]++;
        subs[8]++;
        break;
      case 3:
        subs[0]++;
        subs[4]++;
        subs[8]++;
        break;
      case 4:
        subs[0]++;
        subs[4] += 2;
        subs[8]++;
        break;
    }
    return subs;
}

function drawSegment(cx, start, end) {
    cx.moveTo(start.x - 0.5, start.y - 0.5);
    cx.lineTo(end.x - 0.5, end.y - 0.5);
    cx.stroke();
}

function drawFractal(cx, dir, start, length, iterations) {
    if (!iterations) {
        drawSegment(cx, start, start.neighbor(dir, length));
        return;
    }

    var children = dir.children();
    var childLengths = subdivide(length);

    var cursor = start;
    for (var i = 0, n = children.length; i < n; i++) {
        var child = children[i], childLength = childLengths[i];
        drawFractal(cx, child, cursor, childLength, iterations - 1);
        cursor = cursor.neighbor(child, childLength);
    }
}

function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.neighbor = function neighbor(dir, length) {
    return dir.from(this.x, this.y, length);
};

var currentIteration = 0;

function calibrate(canvas) {
    canvas.style.display = 'none';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = 'block';
}

function drawScene(canvas, counter) {
    calibrate(canvas);
    var cx = canvas.getContext('2d');
    var length = Math.floor(canvas.clientWidth * 0.9);

    var maxIteration = 0, segmentLength = length;
    for (;;) {
        segmentLength = Math.floor(segmentLength / 5);
        if (segmentLength < 2)
            break;
        maxIteration++;
    }

    currentIteration = Math.max(0, Math.min(currentIteration, maxIteration));
    counter.innerHTML = String(currentIteration);

    var start = new Point(Math.floor(canvas.clientWidth * 0.05), Math.floor(canvas.clientHeight / 2));
    drawFractal(cx, E, start, length, currentIteration);
}
