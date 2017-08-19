First create a World object, passing it the plan and the legend.

The world creates a Grid object, which contains all the world objects (critters) in a grid of squares. World populates the initially empty grid with all the critters shown on the Map. (Null for empty squares).

There are various types of critters:

* Wall
* BouncingCritter
* WallFollower

The latter two have an act method that returns an object, with a type and direction values (currently only type: "move" has been implemented). 

The act method determines what direction to move in.

The world can turn. Each turn it works through the grid and looks for Critters with an act method. If it finds one, it lets it act.

letAct take the critter and its current position. It then gets a View object and passes it to the critter's act method, which then determines the move direction.

The grid is then updated with the information. The old position is set to null and the critter is moved to the new position (dest).

