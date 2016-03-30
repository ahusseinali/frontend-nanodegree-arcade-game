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

    // List of all possible speeds an enemy can take.
    this.availableEnemySpeeds = [100, 250, 500];
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
    this.speed =
        this.availableEnemySpeeds[Math.floor(Math.random() * this.availableEnemySpeeds.length)];
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

    // Flags to indicate if player should be reset.
    this.isHit = false;
    this.score = 0;

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
        // Got hit, decrease score
        this.score--;
        this.initLocation();
        this.isHit = false;
    } else {
        this.loc.x += this.potentialMove.x;
        this.loc.y += this.potentialMove.y;
    }

    // Check if location is at the sea row (first row)
    if(this.loc.y < TILE_DIM.y) {
        // Reached the end, increase score.
        this.score++;
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

// Defines the game map. Saves the tiles that constructs the map.
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

GameText = function(font, loc, color) {
    this.font = font;
    this.loc = loc;
    this.color = color;
};

GameText.prototype.setText = function(text) {
    this.text = text;
};

GameText.prototype.setAlign = function(align) {
    this.align = align;
};

GameText.prototype.setBaseline = function(baseline) {
    this.baseline = baseline;
};

GameText.prototype.render = function() {
    if(!this.text) {
        return;
    }

    ctx.save();
    ctx.font = this.font;
    ctx.fillStyle = this.color;
    if(this.align) {
        ctx.textAlign = this.align;
    }
    if(this.baseline) {
        ctx.textBaseline = this.baseline;
    }
    ctx.fillText(this.text, this.loc.x, this.loc.y);
    ctx.restore();
};

TextController = function() {
    var width = CANVAS_TILES.cols * TILE_DIM.x;
    var height = CANVAS_TILES.rows * TILE_DIM.y;

    // Define the game text used in game start
    this.start = [];
    var startHead = new GameText('40px Lekton', {x: Math.floor(width/2), y: 100}, '#f00');
    startHead.setText('Select Player');
    startHead.setAlign('center');
    this.start.push(startHead);

    var startDir = new GameText('15px Lekton', {x: Math.floor(width/2), y: 150}, '#fc0');
    startDir.setText('Use LEFT and RIGHT arrows to select player');
    startDir.setAlign('center');
    this.start.push(startDir);

    var startGame = new GameText('15px Lekton', {x: Math.floor(width/2), y: height - 30}, '#fc0');
    startGame.setText('Press ENTER to Start Game');
    startGame.setAlign('center');
    this.start.push(startGame);

    this.scoreText = new GameText('20px Lekton', {x: 10, y: 5}, '#00f');
    this.scoreText.setAlign('left');
    this.scoreText.setBaseline('top');

    this.timeText = new GameText('20px Lekton', {x: width - 10, y: 5}, '#000');
    this.timeText.setAlign('right');
    this.timeText.setBaseline('top');
};

TextController.prototype.update = function(time, score) {
    this.timeText.setText(convertTime(time));
    this.scoreText.setText("Score: " + score);
};

TextController.prototype.renderStart = function() {
    this.start.forEach(function(startText) {
        startText.render();
    });
};

TextController.prototype.renderGame = function() {
    this.scoreText.render();
    this.timeText.render();
};

// Defines static player sprites. This is used to select player when the game starts.
StaticPlayer = function(sprite, loc, dim) {
    this.sprite = sprite;
    this.loc = loc;
    this.dim = dim;

    // specify if player is selected or not.
    this.selected = false;
};

StaticPlayer.prototype.toggleSelect = function() {
    this.selected = !this.selected;
};

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
};

// Manages player selection and related sprite loading and input handling
PlayerSelectController = function() {
    this.playerSprites = [
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png'
    ];
    this.staticPlayers = [];
    this.selectedPlayerIndex = 0;
    this._loadPlayers();
};

PlayerSelectController.prototype.render = function() {
    // Clear the canvas and draw all static players
    this.staticPlayers.forEach(function(player) {
        player.render();
    });
};

PlayerSelectController.prototype.handleInput = function(key) {
    switch(key) {
        case 'right':
            this._changeSelectedPlayer(this.selectedPlayerIndex + 1);
            break;
        case 'left':
            this._changeSelectedPlayer(this.selectedPlayerIndex - 1);
            break;
        default:
            break;
    }
};

// Returns the selected sprite to be used in the game.
PlayerSelectController.prototype.getSelected = function() {
    return this.playerSprites[this.selectedPlayerIndex];
}

// Resets the selected sprite to the first one.
PlayerSelectController.prototype.resetSelection = function() {
    this._changeSelectedPlayer(0);
}

PlayerSelectController.prototype._loadPlayers = function() {
    var initX = 25;  // Margin to the right and left of all sprites
    var initY = 243; // (Canvas Height - Static Player Height) / 2
    var step = Math.floor((CANVAS_TILES.cols * TILE_DIM.x - 50) / this.playerSprites.length);

    var controller = this;
    this.playerSprites.forEach(function(sprite) {
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

// Changes the selected static player
PlayerSelectController.prototype._changeSelectedPlayer = function(newIndex) {
    this.staticPlayers[this.selectedPlayerIndex].toggleSelect();
    this.selectedPlayerIndex = newIndex < 0 ?
        newIndex + this.staticPlayers.length :
        newIndex % this.staticPlayers.length;
    this.staticPlayers[this.selectedPlayerIndex].toggleSelect();
};

// GameController handles update and render requests and pass it to the proper objects
// Modes include: select, game
GameController = function() {
    this.mode = 'select';
    this.map = null;
    this.player = null;
    this.allEnemies = [];
    this.playerSelectController = new PlayerSelectController();
    this.textController = new TextController();
    this.time = 0;  // Elpased time from game start in milliseconds
};

// Updates enemies position and player position in game mode.
GameController.prototype.update = function(dt) {
    if(this.mode == 'game') {
        this.time += dt;
        var player = this.player;
        this.allEnemies.forEach(function(enemy) {
            enemy.update(dt, player);
        });
        this.player.update();
        this.textController.update(this.time, this.player.score);
    }
};

GameController.prototype.render = function() {
    ctx.clearRect(0, 0, 505, 606);  // TODO: Make Canvas Width and Height global
    if(this.mode == 'select') {
        this.playerSelectController.render();
        this.textController.renderStart();
    } else {
        //Render the map, then render enemies and player
        this.map.render();
        this.allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        this.player.render();
        this.textController.renderGame();
    }
};

// Initialize Game Map and generate game entities.
GameController.prototype.loadGame = function() {
    this.mode = 'game';
    this.map = new GameMap();
    this.time = 0;
    this._generateGameEntities();
};

GameController.prototype.quitGame = function() {
    // Change mode, map and clear all game entities
    this.mode = 'select';
    this.map = null;
    this.player = null;
    this.allEnemies = [];
    // Reset selected player to first player
    this.playerSelectController.resetSelection();
};

GameController.prototype.handleInput = function(key) {
    // Based on game mode. certain keys work
    if(this.mode == 'select') {
        if(key == 'enter') {
            this.loadGame();
        } else {
            this.playerSelectController.handleInput(key);
        }
    } else {
        if(key == 'quit') {
            this.quitGame();
        } else {
            this.player.handleInput(key);
        }
    }
};

// Generates all game entities.
GameController.prototype._generateGameEntities = function() {
    for(var i=0; i < ENEMIES_COUNT; i++) {
        this.allEnemies.push(new Enemy());
    }
    this.player = new Player(this.playerSelectController.getSelected());
};

// Create a controller instance. This is used to call game update and rendering.
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

// Converts seconds to hh:mm:ss.MMM
function convertTime(seconds) {
    var s = seconds;
    var m = Math.floor(s / 60);
    s %= 60;
    var h = Math.floor(m / 60);
    m %= 60;

    return h + ':' + m + ':' + s.toFixed(3);
}
