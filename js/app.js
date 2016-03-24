// Constants
// Defines the shift required in entity location to place it correctly.
var IMAGE_LOCATION_SHIFT = 28;
var ENEMIES_COUNT = 3;

var TILE_DIM = {
    x: 101,
    y: 83
};
var CANVAS_TILES = {
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

    this.dim = {
        'x': 98,
        'y': 77
    }

    // Initialize Enemy's location and speed
    this.initLocationAndSpeed();
};

// Initialize Location to be outside Canvas to the left at random row from 1-3
// Initialize speed to be random value between 200 and 450
Enemy.prototype.initLocationAndSpeed = function() {
    this.loc = {
        x: TILE_DIM.x * -1,
        y: TILE_DIM.y * Math.floor(Math.random() * 3 + 1)
    };
    this.speed = Math.floor(Math.random() * 250 + 200);
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.loc.x += this.speed * dt;

    // Reset enemy location and speed if it gets out of screen
    if(!isInBoundary(this.loc.x, this.loc.y)) {
        this.initLocationAndSpeed();
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    var imgLoc = transformEntityLocToPic(this.loc);
    ctx.drawImage(Resources.get(this.sprite), imgLoc.x, imgLoc.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
// player dimension {x: 66px, y: 77px}
var Player = function() {
    this.sprite = 'images/char-boy.png';

    // Potential Move is used to update player position
    this.potentialMove = {
        x: 0,
        y: 0
    };

    // Initialize Player location
    this.initLocation();
}

// Initialize Player Location.
Player.prototype.initLocation = function() {
    this.loc = {
        x: CANVAS_TILES.cols * (TILE_DIM.x - 20) / 2,
        y: (CANVAS_TILES.rows - 1) * TILE_DIM.y
    };
};

Player.prototype.update = function() {
    this.loc.x += this.potentialMove.x;
    this.loc.y += this.potentialMove.y;

    // Reset potentialMove values till the next key stroke
    this.potentialMove.x = 0;
    this.potentialMove.y = 0;
}

Player.prototype.render = function() {
    var imgLoc = transformEntityLocToPic(this.loc);
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

    nextX = nextX * TILE_DIM.x;
    nextY = nextY * TILE_DIM.y;
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

// Check if location is out of a certain boundary of the canvas
// If no boundary is defined, check is made for all boundaries
function isInBoundary(x, y, boundary) {
    var maxWidth = CANVAS_TILES.cols * TILE_DIM.x;
    var maxHeight = CANVAS_TILES.rows * TILE_DIM.y;
    if(!boundary) {
        return (x >= 0 && x < maxWidth && y >= 0 && y < maxHeight);
    }

    switch(boundary) {
        case "top":
            return y >= 0;
        case "right":
            return x < maxWidth;
        case "bottom":
            return y < maxHeight;
        case "left":
            return x >= 0;
        default:
            throw Error("Invalid boundary check.");
    };
}

// Helper function to transform entity location to image location.
function transformEntityLocToPic(location) {
    return {
        'x': location.x,
        'y': location.y - IMAGE_LOCATION_SHIFT
    };
}

function generateEnemies() {
    for(var i=0; i < ENEMIES_COUNT; i++) {
        allEnemies.push(new Enemy());
    }
}
