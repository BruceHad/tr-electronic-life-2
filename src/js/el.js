/* To do: Review the positions/vector thing */

var directions = {
    "n": new Vector(0, -1),
    "ne": new Vector(1, -1),
    "e": new Vector(1, 0),
    "se": new Vector(1, 1),
    "s": new Vector(0, 1),
    "sw": new Vector(-1, 1),
    "w": new Vector(-1, 0),
    "nw": new Vector(-1, -1)
};

var directionNames = "n ne e se s sw w nw".split(" ");

function randomElement(array) {
    // Select a random element from array
    return array[Math.floor(Math.random() * array.length)];
}

function elementFromChar(legend, ch) {
    if (ch === " ") return null;
    var element = new legend[ch]();
    element.originChar = ch;
    return element;
}

function charFromElement(element) {
    if (element == null) return " ";
    else return element.originChar;
}

function dirPlus(dir, n) {
    // 'rotate' through the 8 directions.
    var index = directionNames.indexOf(dir);
    return directionNames[(index + n + 8) % 8];
}


/* The Vectory type represents a single co-ordinate square on the grid
 */
function Vector(x, y) {
    this.x = parseInt(x);
    this.y = parseInt(y);
}
Vector.prototype.plus = function(other) {
    return new Vector(this.x + other.x, this.y + other.y);
};


/* The world contains critters. Each critter has an act method, that returns
    an action. The action is an object with a 'type' property that defines
    the action. The action is given a 'view' object that allows the critter
    to inspect its surroundings.
*/


// function Critter () {
//     this.position = position; // current position of the object
//     console.log(this.position);
// }

function Wall() {} // Wall is an empty object, with no act method
// Wall.prototype = Object.create(Critter.prototype);
Wall.prototype.draw = function(ctx, position) {
    // Draw critter on ctx at vector position
    // Wall is a filled rectangle that almost fills the square
    let squareSize = 8, 
        width = squareSize - 1.5;
    ctx.fillRect(position.x + 1, position.y + 1, width, width);
};

function BouncingCritter() {
    // this critter moves in a random direction until it hits a wall
    // then finds a new direction to move in.
    this.direction = randomElement(directionNames);
}

// BouncingCritter.prototype = Object.create(Critter.prototype);

BouncingCritter.prototype.act = function(view) {
    if (view.look(this.direction) != " ")
        this.direction = view.find(" ") || "s"; // s if no spaces found
    return { type: "move", direction: this.direction };
};
BouncingCritter.prototype.draw = function(ctx, position) {
    // Draw critter on ctx at vector v
    // This is a small circle.
    let squareSize = 8;
    var x = position.x + squareSize / 2 + 0.5,
        y = position.y + squareSize / 2 + 0.5,
        width = squareSize / 2 - 1;
    // ctx.strokeRect(v.x * squareSize + 0.5, v.y * squareSize + 0.5, squareSize, squareSize);
    ctx.beginPath();
    ctx.arc(x, y, width, 0, Math.PI * 2, true);
    ctx.stroke();
};

function WallFollower() {
    this.direction = 's';
}
WallFollower.prototype.draw = function(ctx, position) {
    // Draw critter on ctx at vector v
    // This is a small cross
    let squareSize = 8;
    var x = position.x,
        y = position.y;
    // ctx.strokeRect(x + 0.5, y + 0.5, squareSize, squareSize);
    ctx.beginPath();
    // Vertical Line
    ctx.moveTo(x + .5 + squareSize / 2, y + 1);
    ctx.lineTo(x + .5 + squareSize / 2, y + squareSize);

    // Horizontal line
    ctx.moveTo(x + 1, y + 1.5 + squareSize / 2. - 1);
    ctx.lineTo(x + squareSize, y + 1.5 + squareSize / 2. - 1);
    ctx.stroke();
};

WallFollower.prototype.act = function(view) {
    var start = this.direction;
    if (view.look(dirPlus(this.direction, -3)) != " ")
        start = this.direction = dirPlus(this.direction, -2);
    while (view.look(this.direction) != " ") {
        this.direction = dirPlus(this.direction, 1);
        if (this.direction == start) break;
    }
    return { type: "move", direction: this.direction };
};

/* The Grid object represents the grid itself. It will be a property of the 
    world object. Here the grid is represented by a single array of length
    width x height. */
function Grid(width, height) {
    this.space = new Array(width * height);
    this.width = width;
    this.height = height;
}
Grid.prototype.isInside = function(vector) {
    return vector.x >= 0 && vector.x < this.width &&
        vector.y >= 0 && vector.y < this.height;
};
Grid.prototype.get = function(vector) {
    return this.space[vector.x + this.width * vector.y];
};
Grid.prototype.set = function(vector, value) {
    this.space[vector.x + this.width * vector.y] = value;
};
Grid.prototype.forEach = function(f, context) {
    // This calls a given function for each element in the Grid. The context 
    // can take the this value from the calling context.
    for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
            let critter = this.space[x + y * this.width];
            let position = new Vector(x, y);
            if (critter != null)
                f.call(context, critter, position);
        }
    }
};

/* Canvas will hold all the functions for drawing 
 */
function Canvas(id, height, width) {
    let canvas = document.getElementById(id);
    this.squareSize = 8;
    this.ctx = canvas.getContext('2d');

    canvas.height = height * this.squareSize;
    canvas.width = width * this.squareSize;
}

Canvas.prototype.draw = function(element, position) {
    //draw element to canvas at vector
    element.draw(this.ctx, position);
};

Canvas.prototype.clear = function() {
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
};

/* The World object take the plan and a legend and constructs all the World
    objects.
*/

function World(map, legend) {
    this.legend = legend;
    this.grid = new Grid(map[0].length, map.length); // create x by y grid
    this.cnvs = new Canvas('canvas', this.grid.height, this.grid.width);
    //populate the grid
    for (var y in map){
        for (var x in map[y]){
            let critter = elementFromChar(legend, map[y][x]);
            let position = new Vector(x, y);
            if(critter) critter.position = position;
            this.grid.set(position, critter);
        }
    }
}
World.prototype.toString = function() {
    var output = '';
    for (var y = 0; y < this.grid.height; y++) {
        for (var x = 0; x < this.grid.width; x++) {
            var element = this.grid.get(new Vector(x, y));
            output += charFromElement(element);
        }
        output += '\n';
    }
    return output;
};

World.prototype.toCanvas = function(ticks) {
    this.cnvs.clear();
    for (var y = 0; y < this.grid.height; y++) {
        for (var x = 0; x < this.grid.width; x++) {
            let vector = new Vector(x, y);
            let critter = this.grid.get(vector);
            if (critter) {
                if (critter.direction) {
                    let dir = directions[critter.direction];
                    let vector = critter.position;
                    let position = new Vector(vector.x * 8 + dir.x * ticks,
                        vector.y * 8 + dir.y * ticks);
                    this.cnvs.draw(critter, position);
                }
                else {
                    this.cnvs.draw(critter, new Vector(vector.x * 8, vector.y * 8));
                }
            }
        }
    }
};
/* The turn method gives the critter the chance to act.*/
World.prototype.turn = function() {
    var acted = [];
    this.grid.forEach(function(critter, vector) {
        // uses the custom forEach method of the grid.
        if (critter.act && acted.indexOf(critter) == -1) {
            acted.push(critter); // prevent a critter from acting twice.
            this.letAct(critter, vector);
        }
    }, this);
};
/* The letAct method carries out the action 
 */
World.prototype.letAct = function(critter, position) {
    var action = critter.act(new View(this, position));
    if (action && action.type == "move") {
        var dest = this.checkDestination(action, position);
        if (dest && this.grid.get(dest) == null) {
            this.grid.set(position, null);
            this.grid.set(dest, critter);
            // update critter position and destination
            if (critter.dest) critter.position = critter.dest;
            critter.dest = dest;
        }
    }
};

World.prototype.checkDestination = function(action, vector) {
    // Double check the destination, calculated from the action
    // direction.
    if (directions.hasOwnProperty(action.direction)) {
        var dest = vector.plus(directions[action.direction]);
        if (this.grid.isInside(dest))
            return dest;
    }
};

/* The View object provides a way for critters to look around them.
 */
function View(world, vector) {
    this.world = world;
    this.vector = vector;
}

View.prototype.look = function(dir) {
    var target = this.vector.plus(directions[dir]);
    if (this.world.grid.isInside(target))
        return charFromElement(this.world.grid.get(target));
    else
        return '#';
};
View.prototype.findAll = function(ch) {
    var found = [];
    for (var dir in directions)
        if (this.look(dir) == ch)
            found.push(dir);
    return found;
};
View.prototype.find = function(ch) {
    var found = this.findAll(ch);
    if (found.length == 0) return null;
    return randomElement(found);
};



// The plan represents the world's grid
var plan = [
    "###########################",
    "#                         #",
    "# ####                    #",
    "#    #         o          #",
    "#    #            o       #",
    "#    #####                #",
    "#              ~          #",
    "#    #################    #",
    "#                    #    #",
    "#                    #    #",
    "#              #######    #",
    "#      ~                  #",
    "#      o                  #",
    "#                         #",
    "#                         #",
    "#                         #",
    "#                         #",
    "#                         #",
    "#          #              #",
    "#          #           #  #",
    "#          ######      #  #",
    "#          #~o       ###  #",
    "#          #########      #",
    "#                  #      #",
    "#                  #      #",
    "#                  #      #",
    "#                  #      #",
    "###########################",
];

let legend = {
    "#": Wall,
    "~": WallFollower,
    "o": BouncingCritter,
};

// let plan = [
//     "#####",
//     "#  o#",
//     "#  ~#",
//     "#####"
// ];

window.onload = function() {
    /* Animate the world 
     * The canvas object are animated to move one pixel at a time, so it takes
     * x frames to move a full cell.
     */
    var world = new World(plan, legend);

    let largeTick = 250; // Time for one full move
    let cellWidth = 8;
    let ticksPerMovement = cellWidth; // No of small ticks to carry out one move
    let smallTick = largeTick / ticksPerMovement;
    let intID = window.setInterval(tick, smallTick, world);
    let tickCount = 0;
    // console.log(world.toString());
    // world.toCanvas(tickCount);
    function tick(world) {
        // Output to console
        if (tickCount === 0) world.turn();
        // console.clear();
        // console.log(world.toString());
        world.toCanvas(tickCount);
        tickCount += 1;
        if (tickCount === ticksPerMovement) {
            tickCount = 0; // reset
        }
    }
};
