// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';

    // Initial position should be on the left outside the canvas.
    // It should be in a random row between 1 and 3 (both inclusive).
    this.loc = {
        'x': global.tileDim.x * -1,
        'y': global.tileDim.y * (Math.random() * 3 + 1);
    };

    this.dim = {
        'x': 98,
        'y': 77
    }

    // Speed is a random value between 1 and 3 (both inclusive).
    this.speed = Math.random() * 3 + 1;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.loc.x += this.speed;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    var imgLoc = transformEntityLocToPic(this.location);
    ctx.drawImage(Resources.get(this.sprite), imgLoc.x, imgLoc.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
// player dimension {x: 66px, y: 77px}


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player



// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

// Helper function to check collision between two objects
function isCollision(first, second) {
    if(!(first && first.location && second && second.location)) {
        // invalid objects.
        var err = 'Invalid objects collision check.';
        console.log(err);
        throw Error(err);
    }
}

function isInBoundary(x, y) {
    var maxWidth = canvasTiles.cols * tileDim.x;
    var maxHeight = canvasTiles.rows * tileDim.y;
    return (x >= 0 && x < maxWidth && y >= 0 && y < maxHeight);
}

// Helper function to transform entity location to image location.
function transformEntityLocToPic(location) {
    return {
        'x': location.x;
        'y': location.y - 77;
    };
}
