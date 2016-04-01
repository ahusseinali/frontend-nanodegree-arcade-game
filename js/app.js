// Constants
// Defines the game time in seconds.
var GAME_TIME = 90;
// Defines the shift required in entity location (in pixels) to place it correctly.
var IMAGE_LOCATION_SHIFT = 28;

// Number of enemies to generate in game.
var ENEMIES_COUNT = 3;

// Dimensions of a single tile that composes the game map.
var TILE_DIM = {
    x: 101,
    y: 83
};

// Number of rows and cols composed of tiles in game map.
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
};

// Display entity in canvas
Entity.prototype.render = function() {
    var imgLoc = transformEntityLocToPic(this.loc);
    ctx.drawImage(Resources.get(this.sprite), imgLoc.x, imgLoc.y);
};

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

// Defines the player of the game.
var Player = function(sprite) {
    Entity.call(this, sprite, {x: 66, y: 77});

    // Potential Move is used to update player position
    this.potentialMove = {
        x: 0,
        y: 0
    };

    // Flags to indicate if player should be reset.
    this.isHit = false;

    // Keeps track of the player score.
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

// Handles updating player position if they get hit, win or reach boundary.
Player.prototype.update = function() {
    if(this.isHit) {
        // Got hit, decrease score
        this.score--;
        this.score = this.score < 0 ? 0 : this.score;   // Set score to 0 if it falls below 0.
        this.initLocation();    // Reset player position.
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

// Handles player related input (Arrow keys).
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

// Draw the game map. The map consists of adjacent tiles.
GameMap.prototype.render = function() {
    for (var row = 0; row < CANVAS_TILES.rows; row++) {
        for (var col = 0; col < CANVAS_TILES.cols; col++) {
            ctx.drawImage(Resources.get(this.rowImages[row]),
                col * TILE_DIM.x, row * TILE_DIM.y);
        }
    }
};

// Defines text to be displayed in canvas.
GameText = function(font, loc, color) {
    this.font = font;
    this.loc = loc;
    this.color = color;
};

// Setter for the content to display.
GameText.prototype.setText = function(text) {
    this.text = text;
};

// Setter for text alignment relative to location.
// Default alignment (left) is used if this value is not set.
GameText.prototype.setAlign = function(align) {
    this.align = align;
};

// Setter for text baseline relative to location.
// Default baseline (bottom) is used if this value is not set.
GameText.prototype.setBaseline = function(baseline) {
    this.baseline = baseline;
};

// Display text in canvas.
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

// Controller to handle all game text.
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

    this.gameOverText = new GameText('bold 40px Lekton', {x: width / 2, y: height / 2 - 20}, '#000');
    this.gameOverText.setText('Game Over');
    this.gameOverText.setAlign('center');

    this.finalScoreText = new GameText('bold 60px Lekton', {x: width / 2, y: height / 2}, '#00f');
    this.finalScoreText.setAlign('center');
    this.finalScoreText.setBaseline('top');

    this.gameRestartText = new GameText('bold 20px Lekton', {x: width / 2, y: height - 30}, '#ff0');
    this.gameRestartText.setText('Press R to Restart, Q to Quit');
    this.gameRestartText.setAlign('center');

};

// Update time and score text during the game.
TextController.prototype.update = function(time, score) {
    this.timeText.setText(time < 0 ? 0 : time.toFixed(3));
    this.scoreText.setText("Score: " + score);
    this.finalScoreText.setText("Score: " + score);
};

// Render the text based on the game mode.
TextController.prototype.render = function(gameMode) {
    switch(gameMode) {
        case 'select':
            this.start.forEach(function(startText) {
                startText.render();
            });
            break;
        case 'game':
            this.scoreText.render();
            this.timeText.render();
            break;
        case 'over':
            this.gameOverText.render();
            this.finalScoreText.render();
            this.gameRestartText.render();
            break;
        default:
            break;
    }
};

// Define static player sprites. This is used to select player when the game starts.
StaticPlayer = function(sprite, loc, dim) {
    this.sprite = sprite;
    this.loc = loc;
    this.dim = dim;

    // specify if player is selected or not.
    this.selected = false;
};

// Toggle the selection of a player.
StaticPlayer.prototype.toggleSelect = function() {
    this.selected = !this.selected;
};

// Draw the static player sprite in canvas.
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

// Manage player selection and related sprite loading and input handling
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

// Manage rendering of all static players.
PlayerSelectController.prototype.render = function() {
    this.staticPlayers.forEach(function(player) {
        player.render();
    });
};

// Handle player selection related input (Left and right arrows).
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

// Return the selected sprite to be used in the game.
PlayerSelectController.prototype.getSelected = function() {
    return this.playerSprites[this.selectedPlayerIndex];
};

// Reset the selected sprite to the first one.
PlayerSelectController.prototype.resetSelection = function() {
    this._changeSelectedPlayer(0);
};

// Initialize static players location, sprites and selection.
PlayerSelectController.prototype._loadPlayers = function() {
    var initX = 25;  // Margin to the right and left of all sprites
    var initY = 243; // (Canvas Height - Static Player Height) / 2
    // Width of each player area is calculated dividing Canvas width equally among players
    // Need to account for margin to the left and right (25 * 2)
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

// Change the selected player to be pointing to the new index.
// Make sure new index is within range by using modulus of the index.
PlayerSelectController.prototype._changeSelectedPlayer = function(newIndex) {
    this.staticPlayers[this.selectedPlayerIndex].toggleSelect();
    this.selectedPlayerIndex = newIndex < 0 ?
        newIndex + this.staticPlayers.length :
        newIndex % this.staticPlayers.length;
    this.staticPlayers[this.selectedPlayerIndex].toggleSelect();
};

// GameController handles update and render requests and pass it to the proper objects
// Modes include:
// - 'select' to select a player
// - 'game' to play the game
// - 'over' when game is over
GameController = function() {
    this.mode = 'select';
    this.map = null;
    this.player = null;
    this.allEnemies = [];
    this.playerSelectController = new PlayerSelectController();
    this.textController = new TextController();
    this.time = GAME_TIME;  // Remaining time from game start in milliseconds
};

// Update enemies position and player position in game mode.
// Keep track of time and finish game when time is up.
GameController.prototype.update = function(dt) {
    if(this.mode == 'game') {
        this.time -= dt;
        var player = this.player;
        this.allEnemies.forEach(function(enemy) {
            enemy.update(dt, player);
        });
        this.player.update();
        this.textController.update(this.time, this.player.score);

        if(this.time <= 0) {
            this.mode = 'over';
        }
    }
};

// Manage what entities to display at a certain mode.
GameController.prototype.render = function() {
    ctx.clearRect(0, 0, 505, 606);  // TODO: Make Canvas Width and Height global
    if(this.mode == 'select') {
        this.playerSelectController.render();
    } else {
        this.map.render();
        this.allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        this.player.render();
    }

    this.textController.render(this.mode);
};

// Initialize Game Map and generate game entities.
GameController.prototype.loadGame = function() {
    this.mode = 'game';
    this.map = new GameMap();
    this.time = GAME_TIME;
    this._generateGameEntities();
};

// Clear all entities arrays and return to selection mode.
GameController.prototype.quitGame = function() {
    // Change mode, map and clear all game entities
    this.mode = 'select';
    this.map = null;
    this.player = null;
    this.allEnemies = [];
    // Reset selected player to first player
    this.playerSelectController.resetSelection();
};

// Main entry point for input handling.
GameController.prototype.handleInput = function(key) {
    // Based on game mode. certain keys work
    if(this.mode == 'select') {
        if(key == 'enter') {
            this.loadGame();
        } else {
            this.playerSelectController.handleInput(key);
        }
    } else if(this.mode == 'over') {
        if(key == 'restart') {
            this.loadGame();
        } else if(key == 'quit') {
            this.quitGame();
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
    // Clear all enemies before generating enemies.
    this.allEnemies = [];
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
        81: 'quit',
        82: 'restart'
    };

    controller.handleInput(allowedKeys[e.keyCode]);
});

// Check collision between two objects
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

// Transform entity location to image location.
function transformEntityLocToPic(location) {
    return {
        x: location.x,
        y: location.y - IMAGE_LOCATION_SHIFT
    };
}

// Convert seconds to remainign time ss.MMM
function convertTime(seconds) {
    var s = seconds;
    var m = Math.floor(s / 60);
    s %= 60;
    var h = Math.floor(m / 60);
    m %= 60;

    return h + ':' + m + ':' + s.toFixed(3);
}
