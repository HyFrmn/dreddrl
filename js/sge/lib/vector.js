define(['sge/lib/class'],
function  (Class) {
    Vector2D = Class.extend({
    	init: function(x, y){
    		this.x = x;
    		this.y = y;
    	}
    });


    Vector2D.NORTH = new Vector2D(0,-1);
    Vector2D.SOUTH = new Vector2D(0,1);
    Vector2D.EAST = new Vector2D(1,0);
    Vector2D.WEST = new Vector2D(-1,0);

    Vector2D.DIRECTION = {
        'north' : Vector2D.NORTH,
        'south' : Vector2D.SOUTH,
        'west'  : Vector2D.WEST,
        'east'  : Vector2D.EAST
    }
    return Vector2D
})
