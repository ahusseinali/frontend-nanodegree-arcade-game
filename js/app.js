// Global objects
tileDim = {
    x: 101,
    y: 83
};
var canvasTiles = {
    rows: 6,
    cols: 5
};

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
        'x': tileDim.x * -1,
        'y': tileDim.y * (Math.random() * 3 + 1)
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
    this.loc.x += this.speed * dt;
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
var Player = function() {
    this.sprite = 'images/char-boy.png';

    // Player initial location
    this.loc = this.getInitLocation();

    // Potential Move is used to update player position
    this.potentialMove = {
        x: 0,
        y: 0
    };
}

// Initial location for the player will be in the middle bottom tile.
Player.prototype.getInitLocation = function() {
    return {
        x: canvasTiles.cols * tileDim.x / 2,
        y: (canvasTiles.rows - 1) * tileDim.y
    }
};

Player.prototype.update = function() {
    this.loc.x += this.potentialMove.x;
    this.loc.y += this.potentialMove.y;

    // Reset potentialMove values till the next key stroke
    this.potentialMove.x = 0;
    this.potentialMove.y = 0;
}

Player.prototype.render = function() {
    var imgLoc = transformEntityLocToPic(this.location);
    ctx.drawImage(Resources.get(this.sprite), imgLoc.x, imgLoc.y);
};

Player.prototype.handleInput = function(key) {
    var nextX = 0;
    var nextY = 0;
    switch(key) {
        case 'left':
            nextX = -1;
            break;
        case 'up':
            nextY = -1;
            break;
        case 'right':
            nextY = 1;
            break;
        case 'down':
            nextY = -1;
        default:
            break;
    }

    nextX = nextX * titeDim.x;
    nextY = nextY * titleDim.y;
    if(!isInBoundary(this.loc.x + nextX, this.loc.y + nextY)) {
        // Reset nextX and nextY as player cannot move
        nextX = 0;
        nextY = 0;
    }

    // Set potentialMove to nextX and nextY
    this.potentialMove.x = nextX;
    this.potentialMove.y = nextY;
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
var player = new Player();
generateEnemies();



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
        'x': location.x,
        'y': location.y - 77
    };
}

function generateEnemies() {
    for(var i=0; i < 5; i++) {
        allEnemies.push(new Enemy());
    }
}
