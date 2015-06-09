var Player = function (startX, startY) {
    var x = startX,
        y = startY,
        size = 10,
        id,
        moveAmount = 4;

    var getX = function () {
        return x;
    };

    var getY = function () {
        return y;
    };

    var setX = function (newX) {
        x = newX;
    };

    var setY = function (newY) {
        y = newY;
    };

    var setSize = function (newSize) {
        size = newSize;
    };

    // Update player position
    var update = function (keys) {
        var prevX = x,
            prevY = y;

        // Up key takes priority over down
        if (keys.up) {
            y -= moveAmount;
        } else if (keys.down) {
            y += moveAmount;
        }
        ;

        // Left key takes priority over right
        if (keys.left) {
            x -= moveAmount;
        } else if (keys.right) {
            x += moveAmount;
        }
        ;

        return (prevX != x || prevY != y) ? true : false;
    };

    var draw = function (ctx) {
        ctx.fillRect(x - 5, y - 5, size, size);
    };

    // Define which variables and methods can be accessed
    return {
        getX: getX,
        getY: getY,
        setX: setX,
        setY: setY,
        setSize: setSize,
        update: update,
        draw: draw
    }
};