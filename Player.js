var Player = function (startX, startY) {
    var x = startX,
        y = startY,
        size = 10,
        id;

    var getX = function () {
        return x;
    };

    var getY = function () {
        return y;
    };

    var getSize = function () {
        return size;
    };

    var setSize = function (value) {
        size = value;
    };

    var setX = function (newX) {
        x = newX;
    };

    var setY = function (newY) {
        y = newY;
    };

    // Define which variables and methods can be accessed
    return {
        getX: getX,
        getY: getY,
        getSize: getSize,
        setSize: setSize,
        setX: setX,
        setY: setY,
        id: id
    }
};

exports.Player = Player;