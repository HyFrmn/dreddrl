define([],function(){
	var lineIntersect = function(x1,y1,x2,y2, x3,y3,x4,y4) {
        var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
        var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
        if (isNaN(x)||isNaN(y)) {
            return false;
        } else {
            if (x1>=x2) {
                if (!(x2<=x&&x<=x1)) {return false;}
            } else {
                if (!(x1<=x&&x<=x2)) {return false;}
            }
            if (y1>=y2) {
                if (!(y2<=y&&y<=y1)) {return false;}
            } else {
                if (!(y1<=y&&y<=y2)) {return false;}
            }
            if (x3>=x4) {
                if (!(x4<=x&&x<=x3)) {return false;}
            } else {
                if (!(x3<=x&&x<=x4)) {return false;}
            }
            if (y3>=y4) {
                if (!(y4<=y&&y<=y3)) {return false;}
            } else {
                if (!(y3<=y&&y<=y4)) {return false;}
            }
        }
        var s = Math.sqrt((x-x1)*(x-x1)+(y-y1)*(y-y1))
        return [x,y,s];
    }

	var rectIntersect = function(r1, r2) {
	    return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
	}

	var lineRectIntersect = function(x1, y1, x2, y2, rect){
		coords = [[rect.left,rect.top,rect.right,rect.top],[rect.left,rect.bottom,rect.right,rect.bottom],[rect.left,rect.top,rect.left,rect.bottom],[rect.right,rect.top,rect.right,rect.bottom]];
        var result = false;
        var length = 1000000;
        for (var i = coords.length - 1; i >= 0; i--) {
            var coord = coords[i];
            var intersection = lineIntersect(x1,y1,x2,y2,coord[0],coord[1],coord[2],coord[3]);
            if (intersection){
                if (length>intersection[2]){
                    length=intersection[2];
                    result = intersection;
                }
            }
        }
        return result;
	}

    pointRectIntersect = function(x, y, rect){
        return (rect.left<x && rect.right>x && rect.top < y && rect.bottom > y);
    }

	return {
		lineIntersect : lineIntersect,
		rectIntersect : rectIntersect,
		lineRectIntersect : lineRectIntersect,
        pointRectIntersect : pointRectIntersect
	}
})
