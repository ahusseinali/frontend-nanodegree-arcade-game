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

// Defines the possible speed range of enemies
var ENEMY_SPEEDS = [100, 250, 500];

var PLAYER_SPRTIES = [
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png'
];

// Base class for all entities in game
var Entity = function(sprite, dim) {
    // The sprite used to display entity.
    this.sprite = sprite;
    this.dim = dim;
    this.loc = {x: 0, y: 0};
}

Entity.prototype.render = function() {
    var imgLoc = transformEntityLocToPic(this.loc);
    ctx.drawImage(Resources.get(this.sprite), imgLoc.x, imgLoc.y);
}

// Enemies our player must avoid
var Enemy = function() {
    Entity.call(this, 'images/enemy-bug.png', {x: 98, y: 77});

    // Initialize Enemy's location and speed
    this.initLocationAndSpeed();
};

Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;

// Initialize Location to be outside Canvas to the left at random row from 1-3
// Initialize speed to be random value between 200 and 450
Enemy.prototype.initLocationAndSpeed = function() {
    this.loc = {
        x: TILE_DIM.x * -1,
        y: TILE_DIM.y * Math.floor(Math.random() * 3 + 1)
    };
    this.speed = ENEMY_SPEEDS[Math.floor(Math.random() * 3)];
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt, player) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.loc.x += this.speed * dt;

    // Check if enemy collides with player. Set Player isHit flag if collision happens.
    var nextPlayerLoc = {
        x: player.loc.x + player.potentialMove.x,
        y: player.loc.y + player.potentialMove.y
    };
    if(isCollision(this.loc, this.dim, nextPlayerLoc, player.dim)) {
        player.isHit = true;
    }

    // Reset enemy location and speed if it gets out of the right side of screen
    if(!isInBoundary(this.loc.x, this.loc.y, 'right')) {
        this.initLocationAndSpeed();
    }
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(sprite) {
    Entity.call(this, sprite, {x: 66, y: 77});

    // Potential Move is used to update player position
    this.potentialMove = {
        x: 0,
        y: 0
    };

    // Flag to indicate if player should be reset.
    this.isHit = false;

    // Initialize Player location
    this.initLocation();
};

Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

// Initialize Player Location.
Player.prototype.initLocation = function() {
    this.loc = {
        x: CANVAS_TILES.cols * (TILE_DIM.x - 20) / 2,
        y: (CANVAS_TILES.rows - 1) * TILE_DIM.y
    };
};

Player.prototype.update = function() {
    if(this.isHit) {
        this.initLocation();
        this.isHit = false;
    } else {
        this.loc.x += this.potentialMove.x;
        this.loc.y += this.potentialMove.y;
    }

    // Check if location is at the sea row (first row)
    if(this.loc.y < TILE_DIM.y) {
        this.initLocation();
    }

    // Reset potentialMove values till the next key stroke
    this.potentialMove.x = 0;
    this.potentialMove.y = 0;
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
            nextX = 1;
            break;
        case 'down':
            nextY = 1;
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
};

// Defines the game map
GameMap = function() {
    // Defines all the tiles used to build the map.
    this.rowImages = [
        'images/water-block.png',   // Top row is water
        'images/stone-block.png',   // Row 1 of 3 of stone
        'images/stone-block.png',   // Row 2 of 3 of stone
        'images/stone-block.png',   // Row 3 of 3 of stone
        'images/grass-block.png',   // Row 1 of 2 of grass
        'images/grass-block.png'    // Row 2 of 2 of grass
    ];
};

GameMap.prototype.render = function() {
    for (var row = 0; row < CANVAS_TILES.rows; row++) {
        for (var col = 0; col < CANVAS_TILES.cols; col++) {
            ctx.drawImage(Resources.get(this.rowImages[row]),
                col * TILE_DIM.x, row * TILE_DIM.y);
        }
    }
};

// Defines static player sprites. This is used to select player when the game starts.
StaticPlayer = function(sprite, loc, dim) {
    this.sprite = sprite;
    this.loc = loc;
    this.dim = dim;

    // specify if player is selected or not.
    this.selected = false;
}

StaticPlayer.prototype.toggleSelect = function() {
    this.selected = !this.selected;
}

StaticPlayer.prototype.render = function() {
    if(this.selected) {
        ctx.strokeStyle = 'red';
        ctx.strokeRect(this.loc.x, this.loc.y, this.dim.x, this.dim.y);
    }

    // Centralize the sprite in the rectangle space.
    var imgLoc = {
        x: this.loc.x - 5,
        y: this.loc.y - 15
    };

    imgLoc = transformEntityLocToPic(imgLoc);
    ctx.drawImage(Resources.get(this.sprite), imgLoc.x, imgLoc.y);
}

// GameController handles update and render requests and pass it to the proper objects
// Modes include: select, game
GameController = function() {
    this.mode = 'select';
    this.map = null;
    this.player = null;
    this.allEnemies = [];
    this.staticPlayers = [];
    this.selectedPlayerIndex = 0;

    // Load static players at the begining
    this.loadPlayerSelect();
}

// Loads static player sprities at the beginning of the game to select player
GameController.prototype.loadPlayerSelect = function() {
    var initX = 25;  // Margin to the right and left of all sprites
    var initY = 243; // (Canvas Height - Static Player Height) / 2
    var step = Math.floor((CANVAS_TILES.cols * TILE_DIM.x - 50) / PLAYER_SPRTIES.length);

    var controller = this;
    PLAYER_SPRTIES.forEach(function(sprite) {
        var loc = {
            x: initX,
            y: initY
        };
        var dim = {
            x: step,
            y: 120
        };
        controller.staticPlayers.push(new StaticPlayer(sprite, loc, dim));
        initX += step;
    });

    // Make first player selected by default
    this.staticPlayers[this.selectedPlayerIndex].toggleSelect();
};

// Updates enemies position and player position in game mode.
GameController.prototype.update = function(dt) {
    if(this.mode == 'game') {
        var player = this.player;
        this.allEnemies.forEach(function(enemy) {
            enemy.update(dt, player);
        });
        this.player.update();
    }
};

GameController.prototype.render = function() {
    ctx.clearRect(0, 0, 505, 606);  // TODO: Make Canvas Width and Height global
    if(this.mode == 'select') {
        // Clear the canvas and draw all static players
        this.staticPlayers.forEach(function(player) {
            player.render();
        });
    } else {
        //Render the map, then render enemies and player
        this.map.render();
        this.allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        this.player.render();
    }
};

// Generates all game entities.
GameController.prototype._generateGameEntities = function() {
    for(var i=0; i < ENEMIES_COUNT; i++) {
        this.allEnemies.push(new Enemy());
    }
    this.player = new Player(this.staticPlayers[this.selectedPlayerIndex].sprite);
};

// Initialize Game Map and generate game entities.
GameController.prototype.loadGame = function() {
    this.mode = 'game';
    this.map = new GameMap();
    this._generateGameEntities();
}

GameController.prototype.quitGame = function() {
    // Change mode, map and clear all game entities
    this.mode = 'select';
    this.map = null;
    this.player = null;
    this.allEnemies = [];
    // Reset selected player to first player
    this._changeSelectedPlayer(0);
}

// Changes the selected static player
GameController.prototype._changeSelectedPlayer = function(newIndex) {
    this.staticPlayers[this.selectedPlayerIndex].toggleSelect();
    this.selectedPlayerIndex = newIndex < 0 ?
        newIndex + this.staticPlayers.length :
        newIndex % this.staticPlayers.length;
    this.staticPlayers[this.selectedPlayerIndex].toggleSelect();
}

GameController.prototype.handleInput = function(key) {
    // Based on game mode. certain keys work
    if(this.mode == 'select') {
        switch(key) {
            case 'enter':
                this.loadGame();
                break;
            case 'right':
                this._changeSelectedPlayer(this.selectedPlayerIndex + 1);
                break;
            case 'left':
                this._changeSelectedPlayer(this.selectedPlayerIndex - 1);
                break;
            default:
                break;
        }
    } else {
        if(key == 'quit') {
            this.quitGame();
        } else {
            this.player.handleInput(key);
        }
    }
};

var controller = new GameController();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        13: 'enter',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        81: 'quit'
    };

    controller.handleInput(allowedKeys[e.keyCode]);
});

// Helper function to check collision between two objects
function isCollision(loc1, dim1, loc2, dim2) {
    // Define corner points for both shapes
    // These are the critical points for comparison.
    var firstP1 = loc1;
    var firstP2 = {
        x: loc1.x + dim1.x,
        y: loc1.y + dim1.y
    };
    var secondP1 = loc2;
    var secondP2 = {
        x: loc2.x + dim2.x,
        y: loc2.y + dim2.y
    };

    return !(firstP2.x < secondP1.x
        || firstP1.x > secondP2.x
        || firstP2.y < secondP1.y
        || firstP1.y > secondP2.y);
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
        case 'top':
            return y >= 0;
        case 'right':
            return x < maxWidth;
        case 'bottom':
            return y < maxHeight;
        case 'left':
            return x >= 0;
        default:
            throw Error('Invalid boundary check.');
    };
}

// Helper function to transform entity location to image location.
function transformEntityLocToPic(location) {
    return {
        x: location.x,
        y: location.y - IMAGE_LOCATION_SHIFT
    };
}
